import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/services/verifyUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(50, parseInt(searchParams.get("limit") || "10")),
    );

    const orderBy = searchParams.get("orderBy") || "latest";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const user_id = user.uid;

    const check_user_exist = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!check_user_exist) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
    }

    const getAllResumes = await prisma.resume.findMany({
      where: {
        userId: user_id,
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        createdAt: orderBy === "latest" ? "desc" : "asc",
      },
      skip: skip,
      take: limit,
    });

    if (getAllResumes.length === 0) {
      return NextResponse.json(
        {
          message: "No resume at the current moment",
          getAllResumes: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
        { status: 200 },
      );
    }

    const totalResume = await prisma.resume.count({
      where: check_user_exist.role === "ADMIN" ? {} : { userId: user_id },
    });

    const responseData = {
      message: "Fetched All Resume Successfully",
      getAllResumes,
      pagination: {
        total: totalResume,
        page,
        limit,
        totalPages: Math.ceil(totalResume / limit),
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

import client from "@/lib/client";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/services/verifyUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    const user_id = user.uid;

    const check_user_exist = await prisma.user.findFirst({
      where: {
        id: user_id,
      },
    });

    if (!check_user_exist) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
    }

    const cacheKey =
      check_user_exist.role === "ADMIN"
        ? `user:${check_user_exist.role}:resumes`
        : `user:${user_id}:resumes`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    let getAllResumes;

    if (check_user_exist.role === "ADMIN") {
      getAllResumes = await prisma.resume.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (getAllResumes.length === 0) {
        return NextResponse.json(
          { message: "No resume at the current moment" },
          { status: 200 },
        );
      }
    } else {
      getAllResumes = await prisma.resume.findMany({
        where: {
          userId: user_id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (getAllResumes.length === 0) {
        return NextResponse.json(
          { message: "No resume at the current moment" },
          { status: 200 },
        );
      }
    }

    await client.setex(
      cacheKey,
      60 * 60 * 24 * 7,
      JSON.stringify(getAllResumes),
    );

    return NextResponse.json(
      { message: "Fetched All Resume Successfully", getAllResumes },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/services/verifyUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "Session cookie not found" },
        { status: 401 },
      );
    }

    const decode = await verifySession(sessionCookie);

    const user_id = decode.uid;

    const check_admin_exist = await prisma.user.findFirst({
      where: {
        id: user_id,
        role: "ADMIN",
      },
    });

    if (!check_admin_exist) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
    }

    const getAllResumes = await prisma.resume.findMany({
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

    if (!getAllResumes) {
      return NextResponse.json(
        { message: "No resume at the current moment" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Fetched All Resume Successfully", getAllResumes },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

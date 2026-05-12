import { prisma } from "@/lib/prisma";
import { verifySession } from "@/services/verifyUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "Session cookie not found" },
        { status: 401 },
      );
    }

    const decode = await verifySession(sessionCookie);

    if (!decode) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user_id: string = decode.uid;

    const fetchResumes = await prisma.resume.findMany({
      where: {
        userId: user_id,
      },
    });

    return NextResponse.json(
      { message: "Fetched Resume", fetchResumes },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

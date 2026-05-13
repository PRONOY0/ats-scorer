import client from "@/lib/client";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/services/verifyUser";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    const user_id: string = user.uid;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    const cacheKey = `user:${user_id}:resume:${id}`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const fetchResumes = await prisma.resume.findFirst({
      where: {
        userId: user_id,
        id: id,
      },
    });

    if (!fetchResumes) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 },
      );
    }

    await client.setex(
      cacheKey,
      60 * 60 * 24 * 7,
      JSON.stringify(fetchResumes),
    );

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

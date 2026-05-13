import client from "@/lib/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/services/verifyUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "No session cookie provided" },
        { status: 401 },
      );
    }

    const decode = await verifySession(sessionCookie);

    const cacheKey = `user:userDetails:${decode.uid}`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const response = await prisma.user.findUnique({
      where: {
        id: decode.uid,
      },
    });

    if (!response) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await client.setex(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(response));

    return NextResponse.json(
      { message: "Fetched User Data", response },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

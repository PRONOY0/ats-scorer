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

    return NextResponse.json(
      { message: "Fetched User Data", decode },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

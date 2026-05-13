import { firebaseAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function verifySession(sessionCookie: string) {
  const decoded = await firebaseAdmin
    .auth()
    .verifySessionCookie(sessionCookie, true);

  return decoded;
}

export async function getAuthUser(): Promise<
  { user: DecodedIdToken; error: null } | { user: null; error: NextResponse }
> {
  const sessionCookie = (await cookies()).get("session")?.value;

  if (!sessionCookie) {
    return {
      user: null,
      error: NextResponse.json(
        { message: "Session cookie not found" },
        { status: 401 },
      ),
    };
  }

  try {
    const decode = await verifySession(sessionCookie);
    return { user: decode, error: null };
  } catch {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
}

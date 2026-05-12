import { firebaseAdmin } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    if (!decoded.email_verified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 401 },
      );
    }

    const retrievedUid = decoded.uid;

    const role = process.env.ADMIN_EMAIL === decoded.email ? "ADMIN" : "USER";

    const newUser = await prisma.user.upsert({
      where: {
        id: retrievedUid,
      },
      update: {
        name: decoded.name,
        avatar: decoded.picture,
        role: role,
      },
      create: {
        id: retrievedUid,
        email: decoded.email!,
        name: decoded.name,
        avatar: decoded.picture!,
        role: role,
      },
    });

    const response = NextResponse.json(
      { message: "Success", newUser },
      { status: 200 },
    );

    const expiresIn = 60 * 60 * 24 * 7 * 1000;

    const sessionCookie = await firebaseAdmin
      .auth()
      .createSessionCookie(token, { expiresIn });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
  }
}

import { firebaseAdmin } from "@/lib/firebase-admin";

export async function verifySession(sessionCookie: string) {
  const decoded = await firebaseAdmin
    .auth()
    .verifySessionCookie(sessionCookie, true);

  return decoded;
}
import { getAuthUser } from "@/services/verifyUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {user,error} = await getAuthUser();

    if (error) {
        return error;
    }

    const user_id = user.uid;

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}

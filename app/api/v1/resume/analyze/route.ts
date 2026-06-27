import { prisma } from "@/lib/prisma";
import { pdfToRawText } from "@/services/extractPdfText";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";
import { getAuthUser } from "@/services/verifyUser";
import { analyzeSchema } from "@/services/validation";
import { atsQueue } from "@/lib/queues/ats.queue";
import { TargetRole } from "@/lib/generated/prisma";
import { generateHash } from "@/services/generateHash";
import client from "@/lib/client";
import { updateLastSeenAt } from "@/lib/lastSeenAtHelper";

export async function POST(req: Request) {
  let user_id: string | undefined;
  let parsedTargetRole: TargetRole | undefined;
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    user_id = user.uid;

    updateLastSeenAt(user_id);

    const formData = await req.formData();
    const resume = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;

    const maxSize = 2 * 1024 * 1024;

    if (!resume) {
      return NextResponse.json(
        { message: "Resume file is required" },
        { status: 400 },
      );
    }

    if (resume.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (resume.size > maxSize) {
      return NextResponse.json(
        { message: "resume must be under 2MB" },
        { status: 400 },
      );
    }

    const validation = analyzeSchema.safeParse({ targetRole });

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            validation.error.flatten().fieldErrors.targetRole?.[0] ??
            "Invalid target Role",
        },
        {
          status: 400,
        },
      );
    }

    parsedTargetRole = validation.data.targetRole;

    const rawText = await pdfToRawText(resume);

    const hash = generateHash(rawText, targetRole);

    const cacheKey = `user:${user_id}:${parsedTargetRole}:${hash}`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    const { success, remaining, resetIn } = await rateLimit(user_id);

    if (!success) {
      return NextResponse.json(
        {
          message: `Limit exceeded. You can analyze 5 resumes per hour. Try again in ${Math.ceil(resetIn / 60)} minutes`,
          remaining,
          resetIn,
        },
        { status: 429 },
      );
    }

    const existingResume = await prisma.resume.findFirst({
      where: {
        userId: user_id,
        targetRole: parsedTargetRole,
      },
    });

    let save_raw_text;

    if (existingResume) {
      save_raw_text = await prisma.resume.update({
        where: {
          id: existingResume.id,
        },
        data: {
          rawText,
          status: "PENDING",
          isEmailSent: false,
        },
      });
    } else {
      save_raw_text = await prisma.resume.create({
        data: {
          userId: user_id,
          rawText,
          atsScore: 0,
          scoreBreakdown: {
            proofOfImpact: 0,
            projectQuality: 0,
            keywordMatch: 0,
            workExperience: 0,
            education: 0,
            structure: 0,
          },
          extractedText: {
            projects: [],
            experience: [],
            links: {},
          },
          strengths: [],
          weaknesses: [],
          suggestions: [
            {
              priority: "",
              area: "",
              suggestion: "",
            },
          ],
          improvementMessage: {
            overall: "",
            roleAlignment: "",
            topAction: "",
          },
          status: "PENDING",
          targetRole: parsedTargetRole,
          title: targetRole,
          isEmailSent: false,
        },
      });
    }

    await atsQueue.add(
      "analyze-resume",
      {
        resumeId: save_raw_text.id,
      },
      {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    );

    return NextResponse.json(
      {
        message: "Resume queued for analysis",
        resumeId: save_raw_text.id,
        status: save_raw_text.status,
      },
      { status: 202 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

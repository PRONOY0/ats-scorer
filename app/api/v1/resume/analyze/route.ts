import client from "@/lib/client";
import { ResumeStatus, TargetRole } from "@/lib/generated/prisma";
import { analyzeResume } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { pdfToRawText } from "@/services/extractPdfText";
import { NextResponse } from "next/server";
import { generateHash } from "@/services/generateHash";
import { rateLimit } from "@/lib/rateLimiter";
import { getAuthUser } from "@/services/verifyUser";

export async function POST(req: Request) {
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    const user_id = user.uid;

    const formData = await req.formData();
    const resume = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;
    const parsedTargetRole = targetRole as TargetRole;

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

    if (!targetRole) {
      return NextResponse.json(
        { message: "Target role is required" },
        { status: 400 },
      );
    }

    const rawText = await pdfToRawText(resume);

    const hash_gen_text = generateHash(rawText, targetRole);

    const cacheKey = `user:${user_id}:${parsedTargetRole}:${hash_gen_text}`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
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

    const result = await analyzeResume(rawText, targetRole);

    const resumeData = {
      rawText,
      atsScore: result.atsScore,
      extractedText: result.extractedText,
      scoreBreakdown: result.scoreBreakdown,
      improvementMessage: result.improvementMessage,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      status: ResumeStatus.COMPLETED,
      title: targetRole,
      targetRole: parsedTargetRole,
    };

    const existingResume = await prisma.resume.findFirst({
      where: {
        userId: user_id,
        targetRole: parsedTargetRole,
      },
    });

    let updateResume;

    if (existingResume) {
      updateResume = await prisma.resume.update({
        where: {
          id: existingResume.id,
        },
        data: resumeData,
      });

      await client.setex(
        cacheKey,
        60 * 60 * 24 * 7,
        JSON.stringify(updateResume),
      );
    } else {
      updateResume = await prisma.resume.create({
        data: {
          ...resumeData,
          userId: user_id,
        },
      });

      await client.setex(
        cacheKey,
        60 * 60 * 24 * 7,
        JSON.stringify(updateResume),
      );
    }

    return NextResponse.json(
      { message: "Extracted", updateResume },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

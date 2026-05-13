import client from "@/lib/client";
import { ResumeStatus, TargetRole } from "@/lib/generated/prisma";
import { analyzeResume } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { pdfToRawText } from "@/services/extractPdfText";
import { verifySession } from "@/services/verifyUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateHash } from "@/services/generateHash";

export async function POST(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

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

    const formData = await req.formData();

    const resume = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;
    const parsedTargetRole = targetRole as TargetRole;

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

    const maxSize = 2 * 1024 * 1024;

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

    return NextResponse.json({ message: "Extracted",  updateResume}, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

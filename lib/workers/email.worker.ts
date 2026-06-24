import "dotenv/config";

import { Worker } from "bullmq";
import client from "../client";
import ResumeAnalysisEmail from "../Resumeanalysisemail";
import { prisma } from "../prisma";
import type {
  Strength,
  Weakness,
  Suggestion,
  ImprovementMessage,
} from "@/types/resume";
import { resend } from "../resend";
import { getScoreLabel } from "@/services/getScore";

const emailWorker = new Worker(
  "email-notification",
  async (job) => {
    const resume = await prisma.resume.findUnique({
      where: {
        id: job.data.resumeId,
      },
      include: {
        user: true,
      },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (!resume.user.email) {
      throw new Error("User email not found");
    }

    const strengths = (resume.strengths as Strength[]) ?? [];
    const weaknesses = (resume.weaknesses as Weakness[]) ?? [];
    const suggestions = (resume.suggestions as Suggestion[]) ?? [];

    const emailProps = {
      userName: resume.user.name || "User",
      resumeTitle: resume.title || "Fullstack developer",
      targetRole: resume.targetRole,
      atsScore: resume.atsScore,
      strengthsCount: strengths.length,
      weaknessesCount: weaknesses.length,
      suggestionsCount: suggestions.length,
      topImprovementMessage: (resume.improvementMessage as ImprovementMessage)
        .topAction,
      scanCount: resume.scanCount,
      resultUrl: `https://ats-scorer-pearl.vercel.app/results/${resume.id}`,
      analyzedDate: resume.createdAt.toLocaleDateString(),
      scoreLabel: getScoreLabel(resume.atsScore),
    };

    const { error } = await resend.emails.send({
      from: "ATS Scorer <atss@devpronoy.com>",
      to: resume.user.email,
      subject: "Your ATS Analysis is Ready",
      react: ResumeAnalysisEmail(emailProps),
    });

    if (error) {
      throw new Error(error.message);
    }

    await prisma.resume.update({
      where: {
        id: resume.id,
      },
      data: {
        isEmailSent: true,
      },
    });
  },
  {
    connection: client,
  },
);

emailWorker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  console.error("Email job failed:", error.message);
  console.error(error);

  const isFinalFailure = job.attemptsMade >= (job.opts.attempts ?? 1);

  if (isFinalFailure) {
    await prisma.resume.update({
      where: {
        id: job.data.resumeId,
      },
      data: {
        isEmailSent: false,
      },
    });
  }
});
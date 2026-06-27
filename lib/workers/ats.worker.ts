import "dotenv/config";

import { Worker } from "bullmq";
import client from "../client";
import { prisma } from "../prisma";
import { analyzeResume } from "../groq";
import { emailQueue } from "../queues/email.queue";
import { generateHash } from "@/services/generateHash";

const worker = new Worker(
  "ats-analysis",
  async (job) => {
    try {
      const resume = await prisma.resume.findUnique({
        where: {
          id: job.data.resumeId,
        },
      });

      if (!resume) {
        throw new Error("Resume not found");
      }

      await prisma.resume.update({
        where: {
          id: resume.id,
        },
        data: {
          status: "PROCESSING",
        },
      });

      const result = await analyzeResume(resume.rawText, resume.targetRole);

      const updatedResume = await prisma.resume.update({
        where: {
          id: job.data.resumeId,
        },
        data: {
          atsScore: result.atsScore,
          extractedText: result.extractedText,
          scoreBreakdown: result.scoreBreakdown,
          improvementMessage: result.improvementMessage,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          status: "COMPLETED",
        },
      });

      const hash_gen_text = generateHash(resume.rawText, resume.targetRole);

      const cachKey = `user:${resume.userId}:${resume.targetRole}:${hash_gen_text}`;

      await client.setex(
        cachKey,
        60 * 60 * 24 * 7,
        JSON.stringify(updatedResume),
      );

      const resumeCacheKey = `user:${resume.userId}:resume:${updatedResume.id}`;

      await client.setex(
        resumeCacheKey,
        60 * 60 * 24 * 7,
        JSON.stringify(updatedResume),
      );

      try {
        await emailQueue.add(
          "send-analysis-email",
          {
            resumeId: updatedResume.id,
          },
          {
            attempts: 4,
            backoff: {
              type: "fixed",
              delay: 3000,
            },
          },
        );
      } catch (error) {
        console.error("Failed to enqueue email job", error);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  {
    connection: client,
    concurrency: 2,
  },
);

worker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  const isFinalFailure = job.attemptsMade >= (job.opts.attempts ?? 1);

  if (isFinalFailure) {
    await prisma.resume.update({
      where: {
        id: job?.data.resumeId,
      },
      data: {
        status: "FAILED",
      },
    });
  }

  console.error(error);
});
import client from "@/lib/client";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/services/verifyUser";
import { ScoreBreakdown } from "@/types/resume";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { user, error } = await getAuthUser();

    if (error) {
      return error;
    }

    const user_id = user.uid;

    const cacheKey = `user:${user_id}:analytics`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const totalScans = await prisma.resume.count({
      where: {
        userId: user_id,
      },
    });

    const avgScore = await prisma.resume.aggregate({
      where: {
        userId: user_id,
      },
      _avg: {
        atsScore: true,
      },
    });

    const highestScore = await prisma.resume.aggregate({
      where: {
        userId: user_id,
      },
      _max: {
        atsScore: true,
      },
    });

    const bestRole = await prisma.resume.findFirst({
      where: {
        userId: user_id,
      },
      orderBy: {
        atsScore: "desc",
      },
    });

    const mostScannedRole = await prisma.resume.findFirst({
      where: {
        userId: user_id,
      },
      select: {
        targetRole: true,
      },
      orderBy: {
        scanCount: "desc",
      },
    });

    const weakestArea = await prisma.resume.findMany({
      where: {
        userId: user_id,
      },
      select: {
        scoreBreakdown: true,
      },
    });

    const breakdowns = weakestArea.map(
      (item) => item.scoreBreakdown as ScoreBreakdown,
    );

    const educations_score = breakdowns.reduce(
      (sum, item) => sum + item.education,
      0,
    );

    const structure_score = breakdowns.reduce(
      (sum, item) => sum + item.structure,
      0,
    );

    const keywordMatch_score = breakdowns.reduce(
      (sum, item) => sum + item.keywordMatch,
      0,
    );

    const proofOfImpact_score = breakdowns.reduce(
      (sum, item) => sum + item.proofOfImpact,
      0,
    );

    const projectQuality_score = breakdowns.reduce(
      (sum, item) => sum + item.projectQuality,
      0,
    );

    const workExperience_score = breakdowns.reduce(
      (sum, item) => sum + item.workExperience,
      0,
    );

    const scoreOverTime = await prisma.resume.findMany({
      where: {
        userId: user_id,
      },
      orderBy: {
        updatedAt: "asc",
      },
      select: {
        atsScore: true,
        targetRole: true,
        updatedAt: true,
      },
    });

    const percentage = (score: number, maxScore: number) =>
      Math.floor((score / (maxScore * totalScans)) * 100);

    const scoreAnalysis = [
      {
        label: "Education",
        score: percentage(educations_score, 5),
      },
      {
        label: "Structure",
        score: percentage(structure_score, 5),
      },
      {
        label: "Keyword Match",
        score: percentage(keywordMatch_score, 20),
      },
      {
        label: "Proof Of Impact",
        score: percentage(proofOfImpact_score, 30),
      },
      {
        label: "Project Quality",
        score: percentage(projectQuality_score, 25),
      },
      {
        label: "Work Experience",
        score: percentage(workExperience_score, 15),
      },
    ];

    const sortedScores = scoreAnalysis.sort((a, b) => a.score - b.score);

    const weakest = sortedScores[0];
    const strongest = sortedScores[sortedScores.length - 1];

    const latest = await prisma.resume.findFirst({
      where: {
        userId: user_id,
      },
      select: {
        createdAt: true,
        title: true,
        atsScore: true,
        id: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const oldest = await prisma.resume.findFirst({
      where: {
        userId: user_id,
      },
      select: {
        createdAt: true,
        title: true,
        atsScore: true,
        id: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    const response = {
      totalScans: totalScans,
      avgScore: avgScore,
      highestScore: highestScore,
      bestRole: bestRole?.targetRole,
      mostScannedRole: mostScannedRole,
      scoreOverTime,
      weakestArea: weakest,
      strongest: strongest,
      latest: latest,
      oldest: oldest,
    };

    await client.setex(cacheKey, 60 * 60, JSON.stringify(response));

    return NextResponse.json(response);
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

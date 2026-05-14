import { prompt } from "@/services/prompt";
import { ResumeAnalysisResult } from "@/types/resume";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function analyzeResume(rawText: string, targetRole: string) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: prompt(rawText, targetRole),
          },
          {
            role: "user",
            content: "Analyze the resume and return only the JSON object.",
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq error: ${response.statusText}`);
  }

  const data = await response.json();

  const raw = data.choices?.[0]?.message?.content ?? "";

  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, "").trim();

  try {
    const result: ResumeAnalysisResult = JSON.parse(cleaned);

    if (result.scoreBreakdown && result.extractedText) {
      const breakdown = result.scoreBreakdown;
      const links = result.extractedText?.links;

      const missingAllLinks =
        !links?.github && !links?.linkedin && !links?.portfolio;

      const rawHasLinks =
        /(github\.com|linkedin\.com|https?:\/\/)/i.test(rawText);

      if (!rawHasLinks && missingAllLinks) {
        breakdown.structure = Math.min(breakdown.structure, 2);
      }

      const projects = result.extractedText.projects ?? [];

      // ---------- PROJECT ANALYSIS ----------

      const allTier0 =
        projects.length > 0 &&
        projects.every((project) => project.tier === "TIER_0");

      // ---------- HARD SAFETY CAPS ----------

      if (allTier0) {
        breakdown.projectQuality = Math.min(breakdown.projectQuality, 3);

        result.atsScore = Math.min(result.atsScore, 40);
      }

      // ---------- IMPACT VALIDATION ----------

      const experiences = result.extractedText.experience ?? [];

      const impactText = JSON.stringify({
        projects,
        experiences,
      });

      const hasQuantifiedImpact =
        /\d+%|\d+\+|#\d+|\$\d+|\d+\s(users|downloads|clients|customers|stars|forks|visitors|clicks|countries)/i.test(
          impactText,
        );

      if (!hasQuantifiedImpact) {
        breakdown.proofOfImpact = Math.min(breakdown.proofOfImpact, 14);
      }

      // ---------- SCORE CLAMPING ----------

      breakdown.proofOfImpact = Math.max(
        0,
        Math.min(breakdown.proofOfImpact, 30),
      );

      breakdown.projectQuality = Math.max(
        0,
        Math.min(breakdown.projectQuality, 25),
      );

      breakdown.keywordMatch = Math.max(
        0,
        Math.min(breakdown.keywordMatch, 20),
      );

      breakdown.workExperience = Math.max(
        0,
        Math.min(breakdown.workExperience, 15),
      );

      breakdown.education = Math.max(0, Math.min(breakdown.education, 5));

      breakdown.structure = Math.max(0, Math.min(breakdown.structure, 5));

      // ---------- RECALCULATE ATS SCORE ----------

      result.atsScore = Object.values(breakdown).reduce(
        (total, value) => total + value,
        0,
      );

      result.atsScore = Math.max(0, Math.min(result.atsScore, 100));
    }

    return result;
  } catch {
    throw new Error(`Invalid JSON from Groq: ${cleaned.slice(0, 200)}`);
  }
}

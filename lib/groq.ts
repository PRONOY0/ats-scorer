import { prompt } from "@/services/prompt";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function analyzeResume(rawText: string, targetRole: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt(rawText, targetRole) },
        { role: "user", content: "Analyze the resume and return only the JSON object." },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.statusText}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, "").trim();

  try {
    const result = JSON.parse(cleaned);

    if (result.scoreBreakdown) {
      result.scoreBreakdown.keywordMatch = Math.min(result.scoreBreakdown.keywordMatch, 30);
      result.scoreBreakdown.workExperience = Math.min(result.scoreBreakdown.workExperience, 25);
      result.scoreBreakdown.projects = Math.min(result.scoreBreakdown.projects, 20);
      result.scoreBreakdown.education = Math.min(result.scoreBreakdown.education, 10);
      result.scoreBreakdown.structure = Math.min(result.scoreBreakdown.structure, 10);
      result.scoreBreakdown.quantifiedAchievements = Math.min(result.scoreBreakdown.quantifiedAchievements, 5);

      result.atsScore = Object.values(result.scoreBreakdown).reduce(
        (a: number, b: unknown) => a + (b as number), 0
      );
    }

    return result;
  } catch {
    throw new Error(`Invalid JSON from Groq: ${cleaned.slice(0, 200)}`);
  }
}
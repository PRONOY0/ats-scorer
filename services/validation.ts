import { z } from "zod";

export const analyzeSchema = z.object({
  targetRole: z.enum([
    "FRONTEND_DEVELOPER",
    "BACKEND_DEVELOPER",
    "ANDROID_DEVELOPER",
    "IOS_DEVELOPER",
    "FULLSTACK_DEVELOPER",
    "AI_ML_DEVELOPER",
    "DATA_SCIENCE",
    "UI_UX",
    "DEVOPS",
  ]),
});
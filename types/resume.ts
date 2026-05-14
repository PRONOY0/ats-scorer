export type Strength = {
  title: string;
  description: string;
};

export type Weakness = {
  title: string;
  description: string;
};

export type Suggestion = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  area: string;
  suggestion: string;
};

export type ImprovementMessage = {
  overall: string;
  roleAlignment: string;
  topAction: string;
};

type ResumeProject = {
  tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
  name: string;
  description: string;
  techStack: string[];
};

type ResumeExperience = {
  company: string | null;
  role: string;
  duration: string | null;
  highlights: string[];
};

type ScoreBreakdown = {
  proofOfImpact: number;
  projectQuality: number;
  keywordMatch: number;
  workExperience: number;
  education: number;
  structure: number;
};

type ParsedLinks = {
  github?: string | null;
  portfolio?: string | null;
  linkedin?: string | null;
};

export type ResumeAnalysisResult = {
  atsScore: number;

  scoreBreakdown: ScoreBreakdown;

  extractedText: {
    projects?: ResumeProject[];
    experience?: ResumeExperience[];
    links?: ParsedLinks;
  };

  strengths: Strength[];

  weaknesses: Weakness[];

  suggestions: Suggestion[];

  improvementMessage: ImprovementMessage;
};
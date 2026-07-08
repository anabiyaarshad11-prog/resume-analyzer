import { z } from "zod";

export const scoreLabels = [
  "structure",
  "formatting",
  "design",
  "summary",
  "experience",
  "projects",
  "skills",
  "achievements",
  "grammar",
  "atsCompatibility",
  "readability",
  "keywordOptimization",
  "professionalism",
] as const;

const sectionScore = z.object({
  name: z.string(),
  score: z.number(),
  comment: z.string(),
});

const grammarError = z.object({
  issue: z.string(),
  original: z.string(),
  suggestion: z.string(),
  type: z.string(),
});

const experienceRewrite = z.object({
  company: z.string(),
  title: z.string(),
  duration: z.string(),
  bullets: z.array(z.string()),
});

const projectRewrite = z.object({
  name: z.string(),
  technologies: z.array(z.string()),
  description: z.string(),
  impact: z.string(),
});

const careerPath = z.object({
  role: z.string(),
  match: z.number(),
  salaryRange: z.string(),
  reason: z.string(),
});

const priorityItem = z.object({
  priority: z.enum(["High", "Medium", "Low"]),
  action: z.string(),
});

export const analysisSchema = z.object({
  candidateName: z.string(),
  headlineRole: z.string().describe("Best-fit professional title for this candidate"),
  contactInformation: z.object({
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    github: z.string(),
    portfolio: z.string(),
  }),
  scores: z.object({
    overall: z.number().describe("0-100"),
    ats: z.number().describe("0-100"),
    technical: z.number().describe("0-100"),
    communication: z.number().describe("0-100"),
    experience: z.number().describe("0-100"),
    projects: z.number().describe("0-100"),
    skills: z.number().describe("0-100"),
    design: z.number().describe("0-100"),
    grammar: z.number().describe("0-100"),
    professionalism: z.number().describe("0-100"),
  }),
  radar: z
    .array(z.object({ axis: z.string(), value: z.number() }))
    .describe("6 axes, values 0-100 for a strength radar chart"),
  sectionScores: z.array(sectionScore).describe("Per-section scores out of 10"),
  skills: z.object({
    programmingLanguages: z.array(z.string()),
    frameworks: z.array(z.string()),
    databases: z.array(z.string()),
    cloud: z.array(z.string()),
    tools: z.array(z.string()),
    aiMl: z.array(z.string()),
    soft: z.array(z.string()),
  }),
  missingSections: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  criticalIssues: z.array(z.string()),
  quickFixes: z.array(z.string()),
  grammarErrors: z.array(grammarError),
  atsAnalysis: z.object({
    score: z.number(),
    missingKeywords: z.array(z.string()),
    formattingIssues: z.array(z.string()),
    matchedKeywords: z.array(z.string()),
  }),
  recommendedSkills: z.array(z.string()),
  recommendedCertifications: z.array(z.object({ name: z.string(), provider: z.string() })),
  careerPaths: z.array(careerPath),
  careerRoadmap: z.array(z.object({ stage: z.string(), focus: z.string() })),
  interviewQuestions: z.array(z.object({ category: z.string(), question: z.string() })),
  improvementPriorities: z.array(priorityItem),
  probabilities: z.object({
    hiring: z.number().describe("0-100"),
    interview: z.number().describe("0-100"),
    atsPass: z.number().describe("0-100"),
    careerReadiness: z.number().describe("0-100"),
  }),
  rewrite: z.object({
    summary: z.string(),
    experience: z.array(experienceRewrite),
    projects: z.array(projectRewrite),
    skillsSection: z.string(),
    achievements: z.array(z.string()),
  }),
  executiveSummary: z.string(),
  finalFeedback: z.string(),
});

export type ResumeAnalysis = z.infer<typeof analysisSchema>;

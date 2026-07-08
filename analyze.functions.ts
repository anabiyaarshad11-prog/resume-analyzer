import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { analysisSchema } from "./resume-schema";

const AnalyzeInput = z.object({
  resumeText: z.string().min(30, "Resume text is too short to analyze."),
  jobDescription: z.string().optional(),
});

const systemPrompt = `You are an expert AI Resume Reviewer, ATS specialist, senior technical recruiter, and career coach.
Analyze the resume with recruiter-level accuracy. Be professional, encouraging, specific and actionable.

CRITICAL RULES:
- Never fabricate information that is not present in the resume. If a field is missing, return an empty string "" or an empty array, and note it in missingSections.
- All feedback must be personalized to the actual resume content.
- Rewrites must use strong action verbs, quantifiable results and measurable business impact (STAR method).
- Scores in "scores" and "probabilities" are 0-100. Scores in "sectionScores" are 0-10.
- If a job description is provided, weigh ATS keywords and matching against it.
- Return complete, valid data for every field in the schema.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(apiKey);

    const userPrompt = [
      "Analyze the following resume.",
      data.jobDescription
        ? `\n\n=== TARGET JOB DESCRIPTION ===\n${data.jobDescription}`
        : "",
      `\n\n=== RESUME CONTENT ===\n${data.resumeText}`,
    ].join("");

    const { output } = await generateText({
      model: gateway("openai/gpt-5.5"),
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({ schema: analysisSchema }),
    });

    return output;
  });

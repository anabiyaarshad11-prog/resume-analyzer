import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { FileScan, Loader2, ScanLine, Sparkles, Target, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FileDrop } from "@/components/analyzer/FileDrop";
import { ResultsDashboard } from "@/components/analyzer/ResultsDashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/lib/analyze.functions";
import { extractResumeText } from "@/lib/resume-parse";
import type { ResumeAnalysis } from "@/lib/resume-schema";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  "Reading your document…",
  "Extracting sections & keywords…",
  "Scoring ATS compatibility…",
  "Coaching your career path…",
  "Writing an improved resume…",
];

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [step, setStep] = useState(0);

  const runAnalyze = useServerFn(analyzeResume);

  const mutation = useMutation({
    mutationFn: async (input: File) => {
      let stepTimer: ReturnType<typeof setInterval> | null = null;
      try {
        setStep(0);
        const resumeText = await extractResumeText(input);
        if (resumeText.length < 30) {
          throw new Error(
            "Couldn't read enough text from this file. Try a text-based PDF or DOCX.",
          );
        }
        stepTimer = setInterval(() => {
          setStep((s) => (s < steps.length - 1 ? s + 1 : s));
        }, 3500);
        const result = await runAnalyze({
          data: { resumeText, jobDescription: jobDescription.trim() || undefined },
        });
        return result as ResumeAnalysis;
      } finally {
        if (stepTimer) clearInterval(stepTimer);
      }
    },
    onSuccess: (result) => {
      setAnalysis(result);
      toast.success("Analysis complete");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    },
  });

  if (analysis) {
    return (
      <ResultsDashboard
        analysis={analysis}
        onReset={() => {
          setAnalysis(null);
          setFile(null);
          setJobDescription("");
          mutation.reset();
        }}
      />
    );
  }

  const loading = mutation.isPending;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-14">
      <div className="mb-10 text-center animate-fade-up">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered · ATS · Career Coach
        </span>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Your resume, <span className="text-gradient">reviewed like a recruiter</span> would.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Upload a resume to get an instant ATS score, section-by-section feedback,
          grammar fixes, an AI rewrite, and a personalized career roadmap.
        </p>
      </div>

      <div className="w-full space-y-4 animate-fade-up">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 py-16 glass-card">
            <div className="relative mb-6">
              <ScanLine className="h-14 w-14 animate-pulse text-primary" />
            </div>
            <p className="text-lg font-medium">{steps[step]}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> This usually takes ~30 seconds
            </p>
          </div>
        ) : (
          <>
            <FileDrop onFile={setFile} fileName={file?.name} />
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                <Target className="mr-1 inline h-4 w-4" /> Target job description (optional —
                improves keyword matching)
              </label>
              <Textarea
                placeholder="Paste a job description to tailor the ATS analysis…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              size="lg"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              disabled={!file}
              onClick={() => file && mutation.mutate(file)}
            >
              <Zap className="h-5 w-5" /> Analyze Resume
            </Button>
          </>
        )}
      </div>

      {!loading && (
        <div className="mt-14 grid w-full gap-4 sm:grid-cols-3 animate-fade-up">
          {[
            { icon: Target, title: "ATS Score", desc: "See how bots read your resume." },
            { icon: FileScan, title: "Deep Review", desc: "Scores across 10+ dimensions." },
            { icon: Sparkles, title: "AI Rewrite", desc: "Recruiter-ready bullet points." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card/50 p-5">
              <f.icon className="mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

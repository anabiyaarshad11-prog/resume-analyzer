import { FileText, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FileDropProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  fileName?: string | null;
}

export function FileDrop({ onFile, disabled, fileName }: FileDropProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all",
        dragging
          ? "border-primary bg-primary/10 glow"
          : "border-border bg-card/50 hover:border-primary/60 hover:bg-card",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-transform group-hover:scale-110",
        )}
      >
        {fileName ? <FileText className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
      </div>
      {fileName ? (
        <>
          <p className="font-semibold text-foreground">{fileName}</p>
          <p className="mt-1 text-sm text-muted-foreground">Click to choose a different file</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-foreground">Drag &amp; drop your resume</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse — PDF, DOCX or TXT
          </p>
        </>
      )}
      import {
  Award,
  Briefcase,
  Check,
  Copy,
  Download,
  FileJson,
  GraduationCap,
  Lightbulb,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResumeAnalysis } from "@/lib/resume-schema";
import { cn } from "@/lib/utils";

import { ScoreRing } from "./ScoreRing";

function toneClass(pct: number) {
  if (pct >= 75) return "text-success";
  if (pct >= 50) return "text-primary";
  if (pct >= 30) return "text-warning";
  return "text-destructive";
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {label}
    </Button>
  );
}

function SkillGroup({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <Badge key={s} variant="secondary" className="font-normal">
            {s}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function buildMarkdown(a: ResumeAnalysis): string {
  const lines: string[] = [];
  lines.push(`# Resume Analysis — ${a.candidateName || "Candidate"}`);
  lines.push(`\n_${a.headlineRole}_\n`);
  lines.push(`**Overall:** ${a.scores.overall}/100 · **ATS:** ${a.scores.ats}/100\n`);
  lines.push(`## Executive Summary\n${a.executiveSummary}\n`);
  lines.push(`## Strengths\n${a.strengths.map((s) => `- ${s}`).join("\n")}\n`);
  lines.push(`## Weaknesses\n${a.weaknesses.map((s) => `- ${s}`).join("\n")}\n`);
  lines.push(`## Professional Summary (rewrite)\n${a.rewrite.summary}\n`);
  lines.push(
    `## Experience (rewrite)\n${a.rewrite.experience
      .map(
        (e) =>
          `### ${e.title} — ${e.company} (${e.duration})\n${e.bullets
            .map((b) => `- ${b}`)
            .join("\n")}`,
      )
      .join("\n\n")}\n`,
  );
  lines.push(`## Final Feedback\n${a.finalFeedback}\n`);
  return lines.join("\n");
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface Props {
  analysis: ResumeAnalysis;
  onReset: () => void;
}

export function ResultsDashboard({ analysis: a, onReset }: Props) {
  const bigScores: { key: string; label: string; value: number }[] = [
    { key: "technical", label: "Technical", value: a.scores.technical },
    { key: "experience", label: "Experience", value: a.scores.experience },
    { key: "projects", label: "Projects", value: a.scores.projects },
    { key: "skills", label: "Skills", value: a.scores.skills },
    { key: "communication", label: "Communication", value: a.scores.communication },
    { key: "design", label: "Design", value: a.scores.design },
    { key: "grammar", label: "Grammar", value: a.scores.grammar },
    { key: "professionalism", label: "Professionalism", value: a.scores.professionalism },
  ];

  const probs = [
    { label: "Hiring Probability", value: a.probabilities.hiring },
    { label: "Interview Probability", value: a.probabilities.interview },
    { label: "ATS Pass Probability", value: a.probabilities.atsPass },
    { label: "Career Readiness", value: a.probabilities.careerReadiness },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{a.candidateName || "Your Resume"}</h1>
          <p className="text-muted-foreground">{a.headlineRole}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              download(
                "resume-analysis.json",
                JSON.stringify(a, null, 2),
                "application/json",
              )
            }
          >
            <FileJson className="h-4 w-4" /> JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              download("resume-analysis.md", buildMarkdown(a), "text/markdown")
            }
          >
            <Download className="h-4 w-4" /> Markdown
          </Button>
          <Button onClick={onReset}>
            <RefreshCw className="h-4 w-4" /> New Resume
          </Button>
        </div>
      </div>

      {/* Score hero */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card flex flex-col items-center justify-center py-6">
          <ScoreRing value={a.scores.overall} label="Overall" size={160} />
        </Card>
        <Card className="glass-card flex flex-col items-center justify-center py-6">
          <ScoreRing value={a.scores.ats} label="ATS Score" size={160} />
        </Card>
        <Card className="glass-card py-6">
          <CardContent className="h-[180px] p-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={a.radar} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {probs.map((p) => (
          <Card key={p.label} className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{p.label}</p>
              <p className={cn("text-2xl font-bold", toneClass(p.value))}>{p.value}%</p>
              <Progress value={p.value} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ats">ATS</TabsTrigger>
          <TabsTrigger value="content">Content &amp; Grammar</TabsTrigger>
          <TabsTrigger value="rewrite">AI Rewrite</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="info">Extracted Info</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {a.executiveSummary}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {bigScores.map((s) => (
                <div key={s.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className={cn("font-semibold", toneClass(s.value))}>
                      {s.value}/100
                    </span>
                  </div>
                  <Progress value={s.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Check className="h-5 w-5" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {a.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <TriangleAlert className="h-5 w-5" /> Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {a.weaknesses.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {a.improvementPriorities.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" /> Improvement Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {a.improvementPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <Badge
                      variant={
                        p.priority === "High"
                          ? "destructive"
                          : p.priority === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {p.priority}
                    </Badge>
                    <span>{p.action}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ATS */}
        <TabsContent value="ats" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> ATS Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-success">Matched Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {a.atsAnalysis.matchedKeywords.length === 0 && (
                    <span className="text-sm text-muted-foreground">None detected.</span>
                  )}
                  {a.atsAnalysis.matchedKeywords.map((k) => (
                    <Badge
                      key={k}
                      className="border-success/40 bg-success/15 text-success"
                      variant="outline"
                    >
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-destructive">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {a.atsAnalysis.missingKeywords.map((k) => (
                    <Badge
                      key={k}
                      className="border-destructive/40 bg-destructive/15 text-destructive"
                      variant="outline"
                    >
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-warning">Formatting Issues</p>
                <ul className="space-y-2 text-sm">
                  {a.atsAnalysis.formattingIssues.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {a.missingSections.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Missing Sections</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {a.missingSections.map((s) => (
                  <Badge key={s} variant="outline" className="text-muted-foreground">
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CONTENT & GRAMMAR */}
        <TabsContent value="content" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Section Scores</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {a.sectionScores.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className={cn("font-semibold", toneClass(s.score * 10))}>
                      {s.score}/10
                    </span>
                  </div>
                  <Progress value={s.score * 10} className="h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">{s.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Grammar &amp; Writing Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.grammarErrors.length === 0 && (
                <p className="text-sm text-muted-foreground">No notable issues found.</p>
              )}
              {a.grammarErrors.map((g, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {g.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{g.issue}</span>
                  </div>
                  <p className="text-sm text-destructive line-through">{g.original}</p>
                  <p className="text-sm text-success">{g.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REWRITE */}
        <TabsContent value="rewrite" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Professional Summary</CardTitle>
              <CopyButton text={a.rewrite.summary} />
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{a.rewrite.summary}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Experience — Rewritten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {a.rewrite.experience.map((e, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="font-semibold">
                    {e.title} <span className="text-muted-foreground">· {e.company}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{e.duration}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {e.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Projects — Rewritten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {a.rewrite.projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
                  <p className="font-semibold">{p.name}</p>
                  <div className="my-2 flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm">{p.description}</p>
                  <p className="mt-1 text-sm text-primary">{p.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Skills Section</CardTitle>
                <CopyButton text={a.rewrite.skillsSection} />
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{a.rewrite.skillsSection}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {a.rewrite.achievements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CAREER */}
        <TabsContent value="career" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Suitable Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {a.careerPaths.map((c, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{c.role}</p>
                    <span className={cn("text-sm font-bold", toneClass(c.match))}>
                      {c.match}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.salaryRange}</p>
                  <p className="mt-1 text-sm">{c.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Career Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-6">
                {a.careerRoadmap.map((r, i) => (
                  <li key={i}>
                    <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-gradient-primary" />
                    <p className="font-medium">{r.stage}</p>
                    <p className="text-sm text-muted-foreground">{r.focus}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recommended Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {a.recommendedSkills.map((s) => (
                  <Badge key={s} className="bg-primary/15 text-primary" variant="outline">
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recommended Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {a.recommendedCertifications.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">· {c.provider}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Interview Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {a.interviewQuestions.map((q, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                  <Badge variant="outline" className="mb-1 text-xs">
                    {q.category}
                  </Badge>
                  <p className="text-sm">{q.question}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFO */}
        <TabsContent value="info" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Info icon={<Mail className="h-4 w-4" />} value={a.contactInformation.email} />
              <Info icon={<span>📞</span>} value={a.contactInformation.phone} />
              <Info
                icon={<MapPin className="h-4 w-4" />}
                value={a.contactInformation.location}
              />
              <Info icon={<span>in</span>} value={a.contactInformation.linkedin} />
              <Info icon={<span>gh</span>} value={a.contactInformation.github} />
              <Info icon={<span>🌐</span>} value={a.contactInformation.portfolio} />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Extracted Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillGroup title="Programming Languages" items={a.skills.programmingLanguages} />
              <SkillGroup title="Frameworks" items={a.skills.frameworks} />
              <SkillGroup title="Databases" items={a.skills.databases} />
              <SkillGroup title="Cloud" items={a.skills.cloud} />
              <SkillGroup title="Tools" items={a.skills.tools} />
              <SkillGroup title="AI / ML" items={a.skills.aiMl} />
              <SkillGroup title="Soft Skills" items={a.skills.soft} />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Final Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {a.finalFeedback}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
        {icon}
      </span>
      <span className={value ? "" : "text-muted-foreground italic"}>
        {value || "Not found"}
      </span>
    </div>
  );
}

      import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

function toneFor(pct: number) {
  if (pct >= 75) return "var(--success)";
  if (pct >= 50) return "var(--primary)";
  if (pct >= 30) return "var(--warning)";
  return "var(--destructive)";
}

export function ScoreRing({
  value,
  max = 100,
  size = 140,
  stroke = 12,
  label,
  sublabel,
  className,
}: ScoreRingProps) {
  const [display, setDisplay] = useState(0);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;
  const tone = toneFor(pct);

  useEffect(() => {
    const t = setTimeout(() => setDisplay(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px ${tone})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color: tone }}>
          {Math.round((display / 100) * max)}
        </span>
        {label && (
          <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        )}
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
    </div>
  );
}

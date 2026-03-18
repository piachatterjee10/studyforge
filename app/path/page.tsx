"use client";

import Link from "next/link";
import { useState } from "react";

type PathResult = {
  projects: string[];
  activities: string[];
  classes: string[];
};

export default function PathPlannerPage() {
  const [fields, setFields] = useState("");
  const [colleges, setColleges] = useState("");
  const [gpa, setGpa] = useState("");
  const [scores, setScores] = useState("");
  const [awards, setAwards] = useState("");
  const [activities, setActivities] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);

  const canGenerate =
    !isLoading &&
    (fields.trim() ||
      colleges.trim() ||
      gpa.trim() ||
      scores.trim() ||
      awards.trim() ||
      activities.trim());

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          colleges,
          gpa,
          scores,
          awards,
          activities,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const base =
          (json && typeof json.error === "string" && json.error) ||
          `Request failed with status ${res.status}`;
        const details =
          json && typeof json.details === "string" ? json.details : null;
        const message = details ? `${base}\n\n${details}` : base;
        throw new Error(message);
      }

      setResult(json as PathResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700/60 transition hover:text-emerald-300 hover:ring-emerald-400/70"
            >
              <span className="inline-block h-4 w-4 rounded-full border border-slate-500/70 bg-slate-900/80 text-[10px] leading-4 text-center">
                ←
              </span>
              Back to home
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/60 backdrop-blur">
              Path planner
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              College & passion project ideas
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Tell StudyForge what you&apos;re interested in and where you want
              to go. Get suggestions for passion projects, extracurriculars, and
              classes that actually fit you.
            </p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 lg:flex-row">
          <section className="flex-1 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-md">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Fields of interest
                </label>
                <textarea
                  className="min-h-[72px] w-full resize-none rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  placeholder="e.g. biology, computer science, design, public policy…"
                  value={fields}
                  onChange={(e) => setFields(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Colleges you&apos;re considering
                </label>
                <textarea
                  className="min-h-[72px] w-full resize-none rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  placeholder="e.g. UCLA, MIT, community college then transfer…"
                  value={colleges}
                  onChange={(e) => setColleges(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  GPA
                </label>
                <input
                  className="h-10 w-full rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  placeholder="e.g. 3.8 unweighted"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300">
                  Test scores (SAT/ACT or others)
                </label>
                <input
                  className="h-10 w-full rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  placeholder="e.g. SAT 1450, ACT 32, or test-optional"
                  value={scores}
                  onChange={(e) => setScores(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Current awards / achievements
              </label>
              <textarea
                className="min-h-[72px] w-full resize-none rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                placeholder="e.g. honor roll, science fair finalist, debate awards, certifications…"
                value={awards}
                onChange={(e) => setAwards(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Current extracurriculars
              </label>
              <textarea
                className="min-h-[72px] w-full resize-none rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                placeholder="e.g. robotics club, soccer, volunteering, part-time job…"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                You don&apos;t have to fill everything—just give enough context
                to get useful ideas.
              </p>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!canGenerate}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.75)] transition hover:bg-emerald-300 hover:shadow-[0_0_35px_rgba(52,211,153,0.95)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {isLoading ? "Thinking…" : "Get ideas"}
              </button>
            </div>
          </section>

          <section className="mt-4 flex-1 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md lg:mt-0">
            <h2 className="text-sm font-semibold text-slate-50">
              Recommendations
            </h2>

            {error && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-rose-300">
                {error}
              </p>
            )}

            {!error && !result && !isLoading && (
              <p className="mt-3 text-sm text-slate-400">
                Fill in a bit about yourself and click{" "}
                <span className="font-medium text-slate-200">
                  Get ideas
                </span>{" "}
                to see suggestions.
              </p>
            )}

            {isLoading && (
              <div className="mt-4 space-y-3">
                <div className="h-4 w-10/12 animate-pulse rounded bg-slate-800/70" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-slate-800/70" />
                <div className="h-4 w-8/12 animate-pulse rounded bg-slate-800/70" />
                <div className="h-4 w-7/12 animate-pulse rounded bg-slate-800/70" />
              </div>
            )}

            {result && !isLoading && !error && (
              <div className="mt-4 space-y-5 text-sm text-slate-200">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Passion project ideas
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {result.projects.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Related extracurriculars
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {result.activities.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Classes to consider
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {result.classes.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}


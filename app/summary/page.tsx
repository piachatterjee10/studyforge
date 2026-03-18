"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

export default function SummaryPage() {
  const [text, setText] = useState("");
  const [outline, setOutline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canGenerate = useMemo(() => text.trim().length > 0 && !isLoading, [
    text,
    isLoading,
  ]);

  const generate = useCallback(async () => {
    const payload = text.trim();
    if (!payload || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutline(null);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload }),
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

      setOutline(typeof json?.outline === "string" ? json.outline : "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [text, isLoading]);

  const clearAll = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setText("");
    setOutline(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const speak = useCallback((content: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

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
              Summary generator
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Outline my notes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Paste content and get a clean outline with headings, bullet
              points, and bolded key terms.
            </p>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-6">
          <section className="flex flex-1 flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-md sm:p-5 lg:p-6">
            <div className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800/70 bg-slate-950/60 ring-offset-2 ring-offset-slate-900 focus-within:ring-2 focus-within:ring-emerald-400/70">
              <textarea
                className="min-h-0 flex-1 w-full resize-none border-0 bg-transparent px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:px-4 sm:py-4 sm:text-[0.95rem]"
                placeholder="Paste your notes here…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  const isMac = navigator.platform
                    .toLowerCase()
                    .includes("mac");
                  const modifier = isMac ? e.metaKey : e.ctrlKey;
                  if (modifier && e.key === "Enter") {
                    e.preventDefault();
                    void generate();
                  }
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-3 pb-2 text-[10px] text-slate-500 sm:px-4 sm:pb-3 sm:text-xs">
                Press ⌘/Ctrl + Enter to generate
              </div>
            </div>
          </section>

          {(isLoading || error || outline) && (
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-100">Outline</p>
                <div className="flex items-center gap-2">
                  {outline && !error && (
                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking ? stopSpeaking() : speak(outline)
                      }
                      className="inline-flex items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      aria-label={
                        isSpeaking ? "Stop reading outline" : "Read outline aloud"
                      }
                    >
                      {isSpeaking ? "Stop" : "Speak"}
                    </button>
                  )}
                  {isLoading && (
                    <span className="text-xs text-slate-400">Generating…</span>
                  )}
                </div>
              </div>

              {error ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-rose-300">
                  {error}
                </p>
              ) : outline ? (
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-200 prose-strong:text-slate-50">
                  {outline}
                </div>
              ) : isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-11/12 animate-pulse rounded bg-slate-800/70" />
                  <div className="h-4 w-10/12 animate-pulse rounded bg-slate-800/70" />
                  <div className="h-4 w-9/12 animate-pulse rounded bg-slate-800/70" />
                </div>
              ) : null}
            </section>
          )}

          <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="space-y-1 text-xs text-slate-300 sm:text-sm">
              <p className="font-medium text-slate-100">Want an outline?</p>
              <p className="max-w-xl text-slate-400">
                Generates headings + many bullet points. Great for turning
                messy notes into a study-ready structure.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void generate()}
                disabled={!canGenerate}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.75)] transition hover:bg-emerald-300 hover:shadow-[0_0_35px_rgba(52,211,153,0.95)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {isLoading ? "Generating…" : "Generate"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/40 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500/80 hover:bg-slate-900/70"
              >
                Clear
              </button>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Tip: ⌘/Ctrl + Enter also works.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


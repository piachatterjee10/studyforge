"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type QuizQuestion = {
  question: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export default function NotesPage() {
  const [text, setText] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, number | null>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canQuiz = useMemo(() => text.trim().length > 0 && !quizLoading, [
    text,
    quizLoading,
  ]);

  const generateQuiz = useCallback(async () => {
    const payload = text.trim();
    if (!payload || quizLoading) return;

    setQuizLoading(true);
    setQuizError(null);
    setQuiz(null);
    setSelected({});

    try {
      const res = await fetch("/api/quiz", {
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

      const questions = (json?.questions ?? []) as QuizQuestion[];
      setQuiz(questions.length ? questions : []);
    } catch (e) {
      setQuizError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setQuizLoading(false);
    }
  }, [text, quizLoading]);

  const clearAll = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setText("");
    setQuiz(null);
    setQuizError(null);
    setQuizLoading(false);
    setSelected({});
  }, []);

  const speak = useCallback((content: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setQuizError("Text-to-speech is not supported in this browser.");
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
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Notes to study guide
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              StudyForge Workspace
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Paste your notes and generate an interactive quiz (with instant
              feedback) to test your understanding.
            </p>
          </div>
          <div className="hidden shrink-0 text-right text-xs text-slate-400 sm:block">
            <p className="font-medium text-slate-300">Deep work mode</p>
            <p>Quiz yourself fast.</p>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-6">
          <section className="flex flex-1 flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-md sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200">
                  SF
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-200">Notes canvas</p>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    Paste notes, then build a quiz from them.
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
                <span className="rounded-full bg-slate-800/80 px-2 py-1">
                  Markdown supported
                </span>
                <span className="rounded-full bg-slate-800/80 px-2 py-1">
                  Autosave-ready
                </span>
              </div>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800/70 bg-slate-950/60 ring-offset-2 ring-offset-slate-900 focus-within:ring-2 focus-within:ring-emerald-400/70">
              <textarea
                className="min-h-0 flex-1 w-full resize-none border-0 bg-transparent px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:px-4 sm:py-4 sm:text-[0.95rem]"
                placeholder="Write or paste anything you want to learn better: lecture notes, problem sets, reading highlights, or raw ideas..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  const isMac = navigator.platform
                    .toLowerCase()
                    .includes("mac");
                  const modifier = isMac ? e.metaKey : e.ctrlKey;
                  if (modifier && e.key === "Enter") {
                    e.preventDefault();
                    void generateQuiz();
                  }
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-3 pb-2 text-[10px] text-slate-500 sm:px-4 sm:pb-3 sm:text-xs">
                Press ⌘/Ctrl + Enter to quiz
              </div>
            </div>
          </section>

          {(quizLoading || quizError || quiz) && (
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-100">Quiz</p>
                <div className="flex items-center gap-2">
                  {quiz && quiz.length > 0 && !quizError && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                          return;
                        }
                        const script = quiz
                          .map((q, i) => {
                            const choices = q.choices
                              .map(
                                (c, idx) =>
                                  `${String.fromCharCode(65 + idx)}. ${c}`,
                              )
                              .join(" ");
                            return `Question ${i + 1}. ${q.question}. Choices: ${choices}.`;
                          })
                          .join("\n");
                        speak(script);
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      aria-label={
                        isSpeaking ? "Stop reading quiz" : "Read quiz aloud"
                      }
                    >
                      {isSpeaking ? "Stop" : "Speak"}
                    </button>
                  )}
                  {quizLoading && (
                    <span className="text-xs text-slate-400">Building quiz…</span>
                  )}
                </div>
              </div>

              {quizError && (
                <p className="whitespace-pre-wrap text-sm text-rose-300">
                  {quizError}
                </p>
              )}

              {quiz && quiz.length === 0 && !quizLoading && !quizError && (
                <p className="text-sm text-slate-400">
                  No quiz questions were generated. Try again.
                </p>
              )}

              {quiz && quiz.length > 0 && (
                <div className="space-y-5">
                  {quiz.map((q, idx) => {
                    const picked = selected[idx] ?? null;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4"
                      >
                        <p className="text-xs font-semibold text-slate-300">
                          Q{idx + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-100">
                          {q.question}
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {q.choices.map((choice, cIdx) => {
                            const isPicked = picked === cIdx;
                            const isCorrect = q.answerIndex === cIdx;
                            const showResult = picked !== null;
                            const tone = showResult
                              ? isCorrect
                                ? "border-emerald-400/70 bg-emerald-400/10"
                                : isPicked
                                  ? "border-rose-400/70 bg-rose-400/10"
                                  : "border-slate-800/80 bg-slate-950/20"
                              : isPicked
                                ? "border-emerald-300/60 bg-emerald-400/10"
                                : "border-slate-800/80 bg-slate-950/20";

                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() =>
                                  setSelected((s) => ({
                                    ...s,
                                    [idx]: cIdx,
                                  }))
                                }
                                className={`rounded-xl border px-3 py-2 text-left text-sm text-slate-200 transition hover:border-emerald-400/60 ${tone}`}
                              >
                                <span className="mr-2 inline-block w-5 text-slate-400">
                                  {String.fromCharCode(65 + cIdx)}.
                                </span>
                                {choice}
                              </button>
                            );
                          })}
                        </div>

                        {picked !== null && (
                          <p className="mt-3 text-sm text-slate-300">
                            <span className="font-semibold text-slate-100">
                              Explanation:
                            </span>{" "}
                            {q.explanation || "—"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="space-y-1 text-xs text-slate-300 sm:text-sm">
              <p className="font-medium text-slate-100">
                Ready to quiz yourself?
              </p>
              <p className="max-w-xl text-slate-400">
                Turn your notes into a multiple-choice quiz with explanations.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void generateQuiz()}
                disabled={!canQuiz}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.6)] transition hover:from-emerald-300 hover:to-cyan-200 hover:shadow-[0_0_35px_rgba(52,211,153,0.85)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {quizLoading ? "Quizzing…" : "Quiz me"}
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


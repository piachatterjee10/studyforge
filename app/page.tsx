import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/60 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              StudyForge
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              StudyForge
            </h1>
            <p className="mt-1 text-base font-medium text-slate-300 sm:text-lg">
              Your AI-powered study hub
            </p>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Jump into focused note review, get tailored college readiness
              ideas, or just put on some calm study vibes—all in one place.
            </p>
          </div>
          <div className="hidden shrink-0 text-right text-xs text-slate-400 sm:block">
            <p className="font-medium text-slate-300">4 study spaces</p>
            <p>Pick what you need right now.</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          <section className="grid gap-4 md:grid-cols-2">
            <Link
              href="/notes"
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] transition hover:border-emerald-400/70 hover:bg-slate-900/90"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                Notes → Quiz
              </div>
              <h2 className="text-lg font-semibold text-slate-50">
                Quiz yourself from your notes
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Paste notes and generate an interactive multiple-choice quiz
                with explanations.
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-300 group-hover:translate-x-1 group-hover:text-emerald-200">
                Open workspace →
              </p>
            </Link>

            <Link
              href="/summary"
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] transition hover:border-emerald-400/70 hover:bg-slate-900/90"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70">
                Outline generator
              </div>
              <h2 className="text-lg font-semibold text-slate-50">
                Generate a bullet-point outline
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Turn messy notes into a structured outline with headings,
                bullet points, and bolded key terms.
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-300 group-hover:translate-x-1 group-hover:text-emerald-200">
                Outline my notes →
              </p>
            </Link>

          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Link
              href="/path"
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-emerald-400/70 hover:bg-slate-900/90"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70">
                Path planning
              </div>
              <h2 className="text-lg font-semibold text-slate-50">
                College & passion project planner
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Enter interests, colleges, GPA, scores, awards, and
                extracurriculars to get AI suggestions for passion projects,
                related activities, and classes.
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-300 group-hover:translate-x-1 group-hover:text-emerald-200">
                Plan my path →
              </p>
            </Link>

            <Link
              href="/vibes"
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-emerald-400/70 hover:bg-slate-900/90"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70">
                Focus playlists
              </div>
              <h2 className="text-lg font-semibold text-slate-50">
                Calm study music & ambience
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Quick links to low-fi, piano, and ambient playlists so you can
                get into flow faster.
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-300 group-hover:translate-x-1 group-hover:text-emerald-200">
                Find my study vibe →
              </p>
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-slate-50">
              How to use StudyForge
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                1. Use{" "}
                <span className="font-medium text-slate-100">Outline</span> to
                turn raw notes into headings + bullet points.
              </li>
              <li>
                2. Use{" "}
                <span className="font-medium text-slate-100">Quiz</span> to test
                yourself with instant feedback.
              </li>
              <li>
                3. Use{" "}
                <span className="font-medium text-slate-100">Path planner</span>{" "}
                for passion project and class ideas.
              </li>
              <li>
                4. Use{" "}
                <span className="font-medium text-slate-100">Study vibes</span>{" "}
                to get into focus mode.
              </li>
            </ul>
          </section>
        </main>

        <footer className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4 text-[11px] text-slate-500 sm:text-xs">
          <p>
            Built with{" "}
            <span className="font-medium text-slate-200">Next.js</span> &
            <span className="font-medium text-slate-200"> Tailwind CSS</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}

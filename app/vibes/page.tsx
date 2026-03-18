import Link from "next/link";

export default function VibesPage() {
  const playlists = [
    {
      name: "Lo-fi beats to study to",
      description: "Chill hip-hop beats for long focus sessions.",
      url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
      tag: "lofi",
    },
    {
      name: "Calm piano for concentration",
      description: "Soft piano pieces that stay in the background.",
      url: "https://www.youtube.com/watch?v=f2YqqNdSkFo",
      tag: "piano",
    },
    {
      name: "Rainy day study ambience",
      description: "Rain sounds + soft music for cozy studying.",
      url: "https://www.youtube.com/watch?v=D-td0OEk0HY",
      tag: "rain",
    },
    {
      name: "No-lyrics K-pop focus mix",
      description: "Instrumental K-pop tracks with no vocals for upbeat focus.",
      url: "https://www.youtube.com/watch?v=kLeWLJKijAU",
      tag: "k-pop",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="mb-8 space-y-4">
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
            Study vibes
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Calm music & ambience
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
            Pick a playlist, set your volume, and let the background do its
            job while you focus on the work.
          </p>
        </header>

        <main className="flex-1 space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            {playlists.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 transition hover:border-emerald-400/70 hover:bg-slate-900/90"
              >
                <div>
                  <span className="inline-flex items-center rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    {p.tag}
                  </span>
                  <h2 className="mt-3 text-base font-semibold text-slate-50">
                    {p.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {p.description}
                  </p>
                </div>
                <p className="mt-4 text-sm font-medium text-emerald-300 group-hover:translate-x-1 group-hover:text-emerald-200">
                  Open playlist →
                </p>
              </a>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-sm text-slate-300">
            <h2 className="text-sm font-semibold text-slate-50">
              Tiny focus checklist
            </h2>
            <ul className="mt-2 space-y-1.5">
              <li>• Choose one playlist and keep it for the whole block.</li>
              <li>• Set a 25–50 minute timer and pick a single task.</li>
              <li>• Put your phone face down or in another room.</li>
              <li>• When the timer ends, take a real break, then repeat.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}


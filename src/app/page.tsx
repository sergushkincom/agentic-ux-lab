import Link from "next/link";
import { experimentHref, experiments } from "@/lib/experiments";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">Agentic UX Lab</h1>
      <p className="mt-2 text-[var(--fg-muted)]">
        Interaction problems in AI and enterprise software, built rather than described.
      </p>

      <ol className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link
              href={experimentHref(experiment)}
              className="flex gap-4 py-5 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-[var(--fg-muted)]">
                {experiment.number}
              </span>
              <span>
                <span className="block font-medium text-[var(--accent)]">
                  {experiment.title}
                </span>
                <span className="mt-1 block text-[var(--fg-muted)]">
                  {experiment.question}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}

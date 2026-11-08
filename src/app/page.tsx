import Link from "next/link";
import { experimentHref, experiments, type Experiment } from "@/lib/experiments";

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
            <ExperimentLink experiment={experiment} />
          </li>
        ))}
      </ol>
    </main>
  );
}

function ExperimentLink({ experiment }: { experiment: Experiment }) {
  const className =
    "flex gap-4 py-5 focus-visible:outline-2 focus-visible:outline-[var(--accent)]";
  const content = (
    <>
      <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-[var(--fg-muted)]">
        {experiment.number}
      </span>
      <span>
        <span className="block font-medium text-[var(--accent)]">
          {experiment.title}
          {experiment.href ? <ExternalLinkMarker /> : null}
        </span>
        <span className="mt-1 block text-[var(--fg-muted)]">{experiment.question}</span>
      </span>
    </>
  );

  if (experiment.href) {
    return (
      <a
        href={experimentHref(experiment)}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative ${className}`}
      >
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={experimentHref(experiment)} className={className}>
      {content}
    </Link>
  );
}

function ExternalLinkMarker() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="ml-1 inline-block h-[0.85em] w-[0.85em] shrink-0 align-[-0.125em]"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.25 3.5H3.75A1.25 1.25 0 0 0 2.5 4.75v7.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V9.75M8.5 2.5h5v5M13.5 2.5 7.25 8.75"
      />
    </svg>
  );
}

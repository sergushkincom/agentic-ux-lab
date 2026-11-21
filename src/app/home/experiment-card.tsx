import Link from "next/link";
import { experimentHref, type Experiment } from "@/lib/experiments";
import { ExperimentPreview } from "./previews";

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const external = Boolean(experiment.href);
  const content = (
    <>
      <ExperimentPreview slug={experiment.slug} />
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h2 className="specimen-title text-[15px] font-medium leading-snug">
          {experiment.number ? (
            <span className="mr-1.5 font-mono text-[13px] font-normal tabular-nums text-[var(--fg-muted)]">
              {experiment.number}
            </span>
          ) : null}
          {experiment.number ? " " : null}
          {experiment.title}
          {external ? <ExternalLinkMarker /> : null}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-muted)]">{experiment.question}</p>
      </div>
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  );

  if (external) {
    return (
      <a
        href={experimentHref(experiment)}
        target="_blank"
        rel="noopener noreferrer"
        className="specimen-card"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={experimentHref(experiment)} className="specimen-card">
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

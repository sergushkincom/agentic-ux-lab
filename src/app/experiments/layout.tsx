"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getExperiment } from "@/lib/experiments";

export default function ExperimentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Layouts don't receive child segment params, so read the slug from the URL
  const slug = usePathname().split("/")[2] ?? "";
  const experiment = getExperiment(slug);

  return (
    <div className="flex h-[calc(100dvh-var(--footer-h))] flex-col">
      <header className="flex shrink-0 items-baseline gap-x-4 gap-y-1 overflow-hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm">
        <Link
          href="/"
          className="shrink-0 text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          ← All experiments
        </Link>
        {experiment && (
          <>
            <span className="shrink-0 font-medium">
              {experiment.number ? (
                <>
                  <span className="font-mono tabular-nums text-[var(--fg-muted)]">
                    {experiment.number}
                  </span>
                  {" · "}
                </>
              ) : null}
              {experiment.title}
            </span>
            <span className="truncate text-[var(--fg-muted)]">{experiment.question}</span>
          </>
        )}
      </header>
      <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

import { experiments } from "@/lib/experiments";
import { ExperimentCard } from "./home/experiment-card";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Agentic UX Lab</h1>
        <p className="mt-2 leading-relaxed text-[var(--fg-muted)]">
          Interaction problems in AI and enterprise software, built rather than described.
        </p>
      </div>

      <ul className="mt-12 grid list-none grid-cols-1 gap-4 p-0 sm:mt-14 md:grid-cols-2 md:gap-5">
        {experiments.map((experiment) => (
          <li key={experiment.slug} className="min-w-0">
            <ExperimentCard experiment={experiment} />
          </li>
        ))}
      </ul>
    </main>
  );
}

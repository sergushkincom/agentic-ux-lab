export type Experiment = {
  slug: string;
  /** Set only when a source already publishes this number. */
  number?: string;
  title: string;
  question: string;
  /** Absolute URL when the experiment lives in another repo. */
  href?: string;
};

/**
 * Display order is registry order.
 * 01 is workflow-canvas (its own repo; this lab's index starts at 02).
 * knowledge-atlas, keyword-tracker and permission-rings publish no number.
 */
export const experiments: Experiment[] = [
  {
    slug: "workflow-canvas",
    number: "01",
    title: "Workflow canvas",
    question:
      "What does an interface look like when a system is honest about not knowing, and hands the decision back to a person?",
    href: "https://denys-workflow-canvas.vercel.app/experiments/workflow-canvas",
  },
  {
    slug: "usage-widget",
    number: "02",
    title: "Usage widget",
    question:
      "When you're spending a finite allowance, what number do you actually need to see?",
  },
  {
    slug: "knowledge-atlas",
    title: "Knowledge Atlas",
    question:
      "What if the way an AI sorted your notes were something you could see, question and overrule, and the AI then left your correction alone?",
    href: "https://denys-knowledge-atlas.vercel.app",
  },
  {
    slug: "keyword-tracker",
    title: "Keyword Tracker",
    // The keyword-tracker README has no "The question" line. This is that repo's description.
    question:
      "A keyword rank tracker where the table is the chart — a clickable prototype in React and TypeScript.",
    href: "https://denys-keyword-tracker.vercel.app",
  },
  {
    slug: "permission-rings",
    title: "Permission rings",
    question:
      "When a scheduling agent can take other people's time, how does a person say how far it may go — without a settings page nobody reads, and without turning every booking into a request?",
    href: "https://permission-rings.vercel.app",
  },
];

/** Internal experiments only. External rows are links, not routes in this app. */
export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug && !experiment.href);
}

/** The external URL when set, otherwise the internal route. */
export function experimentHref(experiment: Experiment): string {
  return experiment.href ?? `/experiments/${experiment.slug}`;
}

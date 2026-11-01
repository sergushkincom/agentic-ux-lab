export type Experiment = {
  slug: string;
  number: string;
  title: string;
  question: string;
};

/** Display order is registry order */
export const experiments: Experiment[] = [
  {
    slug: "usage-widget",
    number: "02",
    title: "Usage widget",
    question:
      "When you're spending a finite allowance, what number do you actually need to see?",
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}

export function experimentHref(experiment: Experiment): string {
  return `/experiments/${experiment.slug}`;
}

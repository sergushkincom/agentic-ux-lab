import assert from "node:assert/strict";
import { experimentHref, experiments, getExperiment } from "../src/lib/experiments.ts";

const externalSlugs = [
  "workflow-canvas",
  "knowledge-atlas",
  "keyword-tracker",
  "permission-rings",
] as const;

const bySlug = (slug: string) => {
  const experiment = experiments.find((entry) => entry.slug === slug);
  assert.ok(experiment, `missing registry entry ${slug}`);
  return experiment;
};

const workflow = bySlug("workflow-canvas");
const usage = bySlug("usage-widget");

assert.equal(workflow.number, "01");
assert.equal(workflow.href, "https://denys-workflow-canvas.vercel.app/experiments/workflow-canvas");
assert.equal(experimentHref(workflow), workflow.href);
assert.equal(getExperiment("workflow-canvas"), undefined);

assert.equal(usage.number, "02");
assert.equal(usage.href, undefined);
assert.equal(experimentHref(usage), "/experiments/usage-widget");
assert.equal(getExperiment("usage-widget")?.slug, "usage-widget");

assert.equal(bySlug("knowledge-atlas").href, "https://denys-knowledge-atlas.vercel.app");
assert.equal(bySlug("keyword-tracker").href, "https://denys-keyword-tracker.vercel.app");
assert.equal(bySlug("permission-rings").href, "https://permission-rings.vercel.app");

for (const slug of externalSlugs) {
  const experiment = bySlug(slug);
  assert.equal(getExperiment(slug), undefined);
  assert.equal(experimentHref(experiment), experiment.href);
  assert.match(experiment.href ?? "", /^https:\/\//);
  if (slug !== "workflow-canvas") {
    assert.equal(experiment.number, undefined);
  }
}

const internal = experiments.filter((experiment) => !experiment.href);
assert.deepEqual(
  internal.map((experiment) => experiment.slug),
  ["usage-widget", "translation-trust"],
);

console.log("registry checks passed");

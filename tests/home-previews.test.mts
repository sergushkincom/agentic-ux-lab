import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { experiments } from "../src/lib/experiments.ts";
import { DEDICATED_PREVIEWS, previewKind } from "../src/app/home/preview-kind.ts";

describe("home previews", () => {
  it("draws a preview for each experiment that already has one", () => {
    for (const slug of DEDICATED_PREVIEWS) {
      assert.equal(
        experiments.some((experiment) => experiment.slug === slug),
        true,
        slug,
      );
      assert.equal(previewKind(slug), "dedicated");
    }
  });

  it("keeps a plain plate for an experiment that has no drawing yet", () => {
    assert.equal(previewKind("not-drawn-yet"), "fallback");
  });
});

describe("specimen card motion", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const noPreference = css.slice(
    css.indexOf("@media (prefers-reduced-motion: no-preference)"),
    css.indexOf("@media (prefers-reduced-motion: reduce)"),
  );
  const reduce = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

  it("lifts the card when motion is allowed", () => {
    assert.match(noPreference, /\.specimen-card:hover[\s\S]*translateY\(-4px\)/);
  });

  it("does not move the card when reduced motion is on", () => {
    assert.match(reduce, /\.specimen-card:hover[\s\S]*transform:\s*none/);
    assert.doesNotMatch(reduce, /translateY\(-4px\)/);
  });
});

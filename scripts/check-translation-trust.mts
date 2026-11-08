import assert from "node:assert/strict";
import { getExperiment } from "../src/lib/experiments.ts";
import {
  SEGMENTS,
  originalText,
  outgoingText,
  preserveCorrections,
  simulateSend,
} from "../src/app/experiments/translation-trust/draft.ts";

const original =
  "The parts will be late. We missed the cutoff because the warehouse count was wrong. If you need them Friday, call me — do not wait.";
const rewritten =
  "The parts are expected a little later than planned. Please contact us if Friday is essential.";

assert.equal(originalText(SEGMENTS), original);
assert.equal(outgoingText(SEGMENTS, {}), rewritten);

const restored = outgoingText(SEGMENTS, { cause: { kind: "restored" } });
assert.match(restored, /warehouse count was wrong/);
assert.equal(
  outgoingText(SEGMENTS, {
    late: { kind: "restored" },
    cause: { kind: "restored" },
    friday: { kind: "restored" },
  }),
  original,
);

const edited = "The parts will be late. Tell them that plainly.";
const withEdit = {
  late: { kind: "edited" as const, text: edited },
  friday: { kind: "restored" as const },
};
const editedOutgoing = outgoingText(SEGMENTS, withEdit);
assert.ok(editedOutgoing.includes(edited));
assert.ok(editedOutgoing.includes("do not wait"));

const kept = preserveCorrections({
  ...withEdit,
  cause: { kind: "script" },
});
assert.deepEqual(kept.late, { kind: "edited", text: edited });
assert.deepEqual(kept.friday, { kind: "restored" });
assert.equal(kept.cause, undefined);
const keptOutgoing = outgoingText(SEGMENTS, kept);
assert.ok(keptOutgoing.includes(edited));
assert.equal(keptOutgoing.includes("a little later than planned"), false);

const receipt = simulateSend(outgoingText(SEGMENTS, kept));
assert.equal(receipt.delivered, false);
assert.equal(receipt.text, outgoingText(SEGMENTS, kept));

const entry = getExperiment("translation-trust");
assert.equal(entry?.title, "Translation trust");
assert.equal(entry?.number, undefined);
assert.equal(getExperiment("usage-widget")?.number, "02");
assert.equal(getExperiment("usage-widget")?.slug, "usage-widget");

console.log("translation-trust checks passed");

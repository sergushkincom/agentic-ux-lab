import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_STATE,
  FRAME_WIDTH_VALUES,
  PICKER_VALUES,
  STEP_VALUES,
  parseStateFromSearch,
  serializeStateToSearch,
  type PrototypeState,
} from "../src/app/experiments/state-comments/url-state.ts";

describe("parseStateFromSearch", () => {
  it("returns defaults when query is empty", () => {
    assert.deepEqual(parseStateFromSearch(""), DEFAULT_STATE);
    assert.deepEqual(parseStateFromSearch("?"), DEFAULT_STATE);
  });

  it("parses a complete valid state", () => {
    assert.deepEqual(parseStateFromSearch("?step=2&picker=open&w=360"), {
      step: 2,
      picker: "open",
      width: 360,
    });
  });

  it("falls back to defaults for invalid values", () => {
    assert.deepEqual(parseStateFromSearch("?step=9&picker=maybe&w=500"), DEFAULT_STATE);
    assert.deepEqual(parseStateFromSearch("?step=0&picker=open&w=320"), {
      step: DEFAULT_STATE.step,
      picker: "open",
      width: 320,
    });
  });
});

describe("serializeStateToSearch", () => {
  it("writes the canonical parameter order", () => {
    const state: PrototypeState = { step: 3, picker: "closed", width: 1280 };
    assert.equal(serializeStateToSearch(state), "step=3&picker=closed&w=1280");
  });

  it("round-trips every supported state", () => {
    for (const step of STEP_VALUES) {
      for (const picker of PICKER_VALUES) {
        for (const width of FRAME_WIDTH_VALUES) {
          const input: PrototypeState = { step, picker, width };
          const serialized = serializeStateToSearch(input);
          const parsed = parseStateFromSearch(serialized);
          assert.deepEqual(parsed, input);
        }
      }
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_PLAN,
  EVENTS,
  buildReport,
  planSentences,
  resolve,
  type AbsenceEvent,
  type Plan,
} from "../src/app/experiments/absence-coverage/coverage.ts";

const event = (id: string): AbsenceEvent => {
  const found = EVENTS.find((entry) => entry.id === id);
  assert.ok(found, `missing event ${id}`);
  return found;
};

const plan = (change: Partial<Plan> = {}): Plan => ({ ...DEFAULT_PLAN, ...change });

const ids = (outcomes: { event: AbsenceEvent }[]) => outcomes.map((outcome) => outcome.event.id);

describe("the scripted week", () => {
  it("has fourteen requests with unique ids", () => {
    assert.equal(EVENTS.length, 14);
    assert.equal(new Set(EVENTS.map((entry) => entry.id)).size, 14);
  });

  it("gives every request that can be done a sentence for what was done", () => {
    for (const entry of EVENTS) {
      if (entry.promise || entry.ownCall) {
        assert.equal(entry.action, "", entry.id);
      } else {
        assert.notEqual(entry.action, "", entry.id);
      }
    }
  });

  it("puts every request in exactly one part of the report, for every plan", () => {
    for (const escalateTo of ["cover", "lead", "hold"] as const) {
      for (const meetingSize of ["one", "small", "any"] as const) {
        for (const outside of [true, false]) {
          const report = buildReport(EVENTS, plan({ escalateTo, meetingSize, outside }));
          const all = [...ids(report.waiting), ...ids(report.closed), ...ids(report.done)];
          assert.equal(all.length, EVENTS.length);
          assert.equal(new Set(all).size, EVENTS.length);
          assert.equal(report.total, EVENTS.length);
        }
      }
    }
  });
});

describe("the default plan", () => {
  const report = buildReport(EVENTS, DEFAULT_PLAN);

  it("leaves three things waiting, four closed by Mara, seven done", () => {
    assert.deepEqual(ids(report.waiting), ["discount", "interview", "focus-block"]);
    assert.deepEqual(ids(report.closed), [
      "planning-review",
      "release-date",
      "call-notes",
      "day-off",
    ]);
    assert.equal(report.done.length, 7);
  });

  it("says so in one line", () => {
    assert.equal(
      report.headline,
      "14 things came in. 3 wait for you, 4 closed by Mara, 7 done by the assistant.",
    );
  });
});

describe("who decided", () => {
  it("never promises, whatever the plan allows", () => {
    const wide = plan({ outside: true, meetingSize: "any" });
    for (const id of ["discount", "day-off"]) {
      const outcome = resolve(event(id), wide);
      assert.equal(outcome.stoppedBy, "fixed", id);
      assert.notEqual(outcome.status, "done", id);
    }
    assert.match(resolve(event("discount"), wide).why, /never promises a price/);
    assert.match(resolve(event("day-off"), wide).why, /never promises a yes/);
  });

  it("marks a capability you turned off as your decision", () => {
    const outcome = resolve(
      event("checklist"),
      plan({ may: { ...DEFAULT_PLAN.may, answer: false } }),
    );
    assert.equal(outcome.stoppedBy, "scope");
    assert.equal(outcome.status, "closed");
    assert.match(outcome.why, /you turned off "Answer from your notes"/);
  });

  it("stops for people outside the company until you allow them", () => {
    assert.equal(resolve(event("call-notes"), plan()).stoppedBy, "limit");
    const allowed = resolve(event("call-notes"), plan({ outside: true }));
    assert.equal(allowed.status, "done");
    assert.equal(allowed.stoppedBy, undefined);
  });

  it("counts the people in a meeting against your limit", () => {
    assert.equal(resolve(event("weekly-sync"), plan({ meetingSize: "one" })).stoppedBy, "limit");
    assert.equal(resolve(event("weekly-sync"), plan({ meetingSize: "small" })).status, "done");
    const big = resolve(event("planning-review"), plan({ meetingSize: "small" }));
    assert.equal(big.stoppedBy, "limit");
    assert.match(big.why, /up to 4 people\. This meeting has 6\./);
    assert.equal(resolve(event("planning-review"), plan({ meetingSize: "any" })).status, "done");
  });

  it("keeps its own call apart from your limits", () => {
    const wide = plan({ outside: true, meetingSize: "any" });
    assert.equal(resolve(event("release-date"), wide).stoppedBy, "own");
    assert.equal(resolve(event("focus-block"), wide).stoppedBy, "own");
  });

  it("names the permission it used when it acts", () => {
    const outcome = resolve(event("one-to-one"), plan());
    assert.equal(outcome.status, "done");
    assert.equal(outcome.why, "Allowed by you on Friday: move your meetings.");
    assert.equal(outcome.told, undefined);
  });
});

describe("who gets the rest", () => {
  it("leaves every stop waiting when nobody covers", () => {
    const report = buildReport(EVENTS, plan({ escalateTo: "hold" }));
    assert.equal(report.closed.length, 0);
    assert.equal(report.waiting.length, 7);
    assert.equal(
      report.headline,
      "14 things came in. 7 wait for you, 7 done by the assistant.",
    );
    for (const outcome of report.waiting) {
      assert.match(outcome.told ?? "", /Nobody else has this\.$/);
    }
  });

  it("names the lead when the lead gets them", () => {
    const outcome = resolve(event("day-off"), plan({ escalateTo: "lead" }));
    assert.equal(outcome.status, "closed");
    assert.equal(outcome.told, "Told Noor: you are back on Monday, and Jonas has this.");
    assert.equal(outcome.after, "Jonas said yes on Wednesday.");
  });

  it("still waits for you when the cover could not close it", () => {
    const outcome = resolve(event("discount"), plan());
    assert.equal(outcome.status, "waiting");
    assert.equal(outcome.told, "Told a supplier contact: you are back on Monday, and Mara has this.");
    assert.equal(outcome.after, "Mara would not confirm a price for you either.");
  });

  it("uses singular grammar for one waiting item", () => {
    const report = buildReport([event("discount"), event("checklist")], plan());
    assert.equal(
      report.headline,
      "2 things came in. 1 waits for you, 0 closed by Mara, 1 done by the assistant.",
    );
  });
});

describe("the plan read back", () => {
  it("reads the default plan as four sentences", () => {
    assert.deepEqual(planSentences(DEFAULT_PLAN), [
      "It may answer from your notes, move your meetings of up to 4 people and pass a message to its owner.",
      "It does none of this for people outside the company.",
      "It never promises a price, a date or a yes in your name.",
      "What it does not do goes to Mara.",
    ]);
  });

  it("says plainly when everything is off", () => {
    const sentences = planSentences(
      plan({ may: { answer: false, reschedule: false, forward: false }, escalateTo: "hold" }),
    );
    assert.deepEqual(sentences, [
      "It does nothing in your name. It only says when you are back.",
      "It never promises a price, a date or a yes in your name.",
      "What it does not do waits for you until Monday.",
    ]);
  });

  it("leaves the meeting size out when moving meetings is off", () => {
    const [first] = planSentences(plan({ may: { ...DEFAULT_PLAN.may, reschedule: false } }));
    assert.equal(first, "It may answer from your notes and pass a message to its owner.");
  });
});

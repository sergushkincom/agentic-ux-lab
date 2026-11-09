import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BaseModel, BaseWindow } from "../src/app/experiments/usage-widget/data.ts";
import { EFFORT_MULTIPLIER } from "../src/app/experiments/usage-widget/data.ts";
import {
  SIM_SPEED,
  advanceModels,
  simulatedDeltaMinutes,
  tickWindow,
} from "../src/app/experiments/usage-widget/simulate.ts";

function window(overrides: Partial<BaseWindow> = {}): BaseWindow {
  return {
    used: 0.25,
    resetsInMin: 40,
    baseBurnPerMin: 0.015625,
    ...overrides,
  };
}

function model(overrides: {
  id?: BaseModel["id"];
  session?: Partial<BaseWindow>;
  weekly?: Partial<BaseWindow>;
} = {}): BaseModel {
  return {
    id: overrides.id ?? "opus",
    name: "Opus 5",
    tier: "For complex tasks",
    session: window(overrides.session),
    weekly: window({ used: 0.125, resetsInMin: 4_000, ...overrides.weekly }),
  };
}

describe("simulatedDeltaMinutes", () => {
  it("scales one real second to sixty sim minutes at the default burn", () => {
    assert.equal(SIM_SPEED, 60);
    assert.equal(simulatedDeltaMinutes(1_000, 1), 60);
  });

  it("scales a partial second", () => {
    assert.equal(simulatedDeltaMinutes(500, 1), 30);
  });

  it("stays at zero when no time has elapsed", () => {
    assert.equal(simulatedDeltaMinutes(0, 1), 0);
    assert.equal(simulatedDeltaMinutes(0, 4), 0);
  });

  it("stays at zero when the burn multiplier is zero", () => {
    assert.equal(simulatedDeltaMinutes(5_000, 0), 0);
    assert.equal(simulatedDeltaMinutes(3_600_000, 0), 0);
  });

  it("applies a faster scenario burn multiplier", () => {
    assert.equal(simulatedDeltaMinutes(1_000, 2), 120);
  });

  it("scales a full real minute into a large sim interval", () => {
    assert.equal(simulatedDeltaMinutes(60_000, 1), 3_600);
    assert.equal(simulatedDeltaMinutes(3_600_000, 1), 216_000);
  });

  it("scales a backwards elapsed interval to negative sim minutes", () => {
    assert.equal(simulatedDeltaMinutes(-1_000, 1), -60);
  });
});

describe("tickWindow", () => {
  it("adds burn and counts the reset down", () => {
    const start = window({ used: 0.25, resetsInMin: 40, baseBurnPerMin: 0.015625 });
    const next = tickWindow(start, 0.015625, 2);

    assert.equal(next.used, 0.28125);
    assert.equal(next.resetsInMin, 38);
    assert.equal(next.baseBurnPerMin, 0.015625);
    assert.equal(start.used, 0.25);
    assert.equal(start.resetsInMin, 40);
  });

  it("leaves the window unchanged when delta is zero", () => {
    const start = window();
    assert.deepEqual(tickWindow(start, 0.5, 0), start);
  });

  it("counts the reset down without consuming allowance when burn is zero", () => {
    const next = tickWindow(window({ used: 0.4, resetsInMin: 12 }), 0, 3);
    assert.equal(next.used, 0.4);
    assert.equal(next.resetsInMin, 9);
  });

  it("lands exactly on a full window", () => {
    const next = tickWindow(window({ used: 0.75, resetsInMin: 8 }), 0.25, 1);
    assert.equal(next.used, 1);
    assert.equal(next.resetsInMin, 7);
  });

  it("clamps used at 1 when burn would pass the limit", () => {
    const next = tickWindow(window({ used: 0.9, resetsInMin: 8 }), 0.25, 1);
    assert.equal(next.used, 1);
    assert.equal(next.resetsInMin, 7);
  });

  it("keeps a finished window finished while the reset clock still runs", () => {
    const next = tickWindow(window({ used: 1, resetsInMin: 3 }), 0.5, 1);
    assert.equal(next.used, 1);
    assert.equal(next.resetsInMin, 2);
  });

  it("clamps an over-full window back to 1 even when burn is zero", () => {
    const next = tickWindow(window({ used: 1.4, resetsInMin: 6 }), 0, 0);
    assert.equal(next.used, 1);
    assert.equal(next.resetsInMin, 6);
  });

  it("lands exactly on a reset of zero", () => {
    const next = tickWindow(window({ used: 0.2, resetsInMin: 5 }), 0, 5);
    assert.equal(next.resetsInMin, 0);
    assert.equal(next.used, 0.2);
  });

  it("clamps the reset clock at zero", () => {
    const next = tickWindow(window({ used: 0.2, resetsInMin: 5 }), 0.01, 5.1);
    assert.equal(next.resetsInMin, 0);
  });

  it("keeps a spent reset clock at zero", () => {
    const next = tickWindow(window({ used: 0.2, resetsInMin: 0 }), 0.01, 4);
    assert.equal(next.resetsInMin, 0);
  });

  it("caps both allowance and reset when one step is very large", () => {
    const next = tickWindow(
      window({ used: 0, resetsInMin: 10_000, baseBurnPerMin: 0.0001 }),
      0.0001,
      100_000,
    );
    assert.equal(next.used, 1);
    assert.equal(next.resetsInMin, 0);
  });
});

describe("advanceModels", () => {
  it("consumes one real second at medium effort on each window's own burn", () => {
    const start = model({
      session: { used: 0, resetsInMin: 100, baseBurnPerMin: 0.015625 },
      weekly: { used: 0, resetsInMin: 4_000, baseBurnPerMin: 0.0078125 },
    });
    const before = structuredClone(start);
    const deltaMin = simulatedDeltaMinutes(1_000, 1);
    const [next] = advanceModels([start], EFFORT_MULTIPLIER.Medium, deltaMin);

    assert.equal(deltaMin, 60);
    assert.equal(next.session.used, 0.9375);
    assert.equal(next.session.resetsInMin, 40);
    assert.equal(next.weekly.used, 0.46875);
    assert.equal(next.weekly.resetsInMin, 3_940);
    assert.equal(next.id, "opus");
    assert.equal(next.name, "Opus 5");
    assert.deepEqual(start, before);
  });

  it("burns less at low effort and more at high effort", () => {
    const start = [model({ session: { used: 0 }, weekly: { used: 0, resetsInMin: 100 } })];
    const deltaMin = 1;
    const low = advanceModels(start, EFFORT_MULTIPLIER.Low, deltaMin)[0];
    const high = advanceModels(start, EFFORT_MULTIPLIER.High, deltaMin)[0];

    assert.equal(EFFORT_MULTIPLIER.Low, 0.6);
    assert.equal(EFFORT_MULTIPLIER.High, 1.8);
    assert.equal(low.session.used, 0.015625 * 0.6);
    assert.equal(high.session.used, 0.015625 * 1.8);
    assert.ok(high.session.used > low.session.used);
    assert.equal(low.weekly.used, 0.015625 * 0.6);
    assert.equal(high.weekly.used, 0.015625 * 1.8);
  });

  it("can finish the session window while the weekly window is still open", () => {
    const start = model({
      session: { used: 0.9, resetsInMin: 8, baseBurnPerMin: 0.25 },
      weekly: { used: 0.1, resetsInMin: 80, baseBurnPerMin: 0.125 },
    });
    const [next] = advanceModels([start], EFFORT_MULTIPLIER.Medium, 1);

    assert.equal(next.session.used, 1);
    assert.equal(next.session.resetsInMin, 7);
    assert.equal(next.weekly.used, 0.225);
    assert.equal(next.weekly.resetsInMin, 79);
  });

  it("finishes a window in one real second at high effort", () => {
    const start = model({
      session: { used: 0, resetsInMin: 100 },
      weekly: { used: 0, resetsInMin: 100 },
    });
    const deltaMin = simulatedDeltaMinutes(1_000, 1);
    const [next] = advanceModels([start], EFFORT_MULTIPLIER.High, deltaMin);

    assert.equal(next.session.used, 1);
    assert.equal(next.weekly.used, 1);
    assert.equal(next.session.resetsInMin, 40);
    assert.equal(next.weekly.resetsInMin, 40);
  });

  it("does not consume allowance when the burn multiplier pauses the clock", () => {
    const start = model({ session: { used: 0.89 }, weekly: { used: 0.45 } });
    const deltaMin = simulatedDeltaMinutes(5_000, 0);
    const [next] = advanceModels([start], EFFORT_MULTIPLIER.High, deltaMin);

    assert.equal(deltaMin, 0);
    assert.equal(next.session.used, 0.89);
    assert.equal(next.weekly.used, 0.45);
    assert.equal(next.session.resetsInMin, start.session.resetsInMin);
    assert.equal(next.weekly.resetsInMin, start.weekly.resetsInMin);
  });

  it("advances each model independently and does not mutate the previous step", () => {
    const start = [
      model({ id: "opus", session: { used: 0.5 }, weekly: { used: 0.2 } }),
      model({
        id: "haiku",
        session: { used: 1, resetsInMin: 12, baseBurnPerMin: 0.0004 },
        weekly: { used: 0.35, resetsInMin: 90, baseBurnPerMin: 0.0004 },
      }),
    ];
    const snapshot = structuredClone(start);
    const next = advanceModels(start, EFFORT_MULTIPLIER.Medium, 10);

    assert.deepEqual(start, snapshot);
    assert.equal(next[0].id, "opus");
    assert.equal(next[0].session.used, 0.5 + 0.015625 * 10);
    assert.equal(next[1].id, "haiku");
    assert.equal(next[1].session.used, 1);
    assert.equal(next[1].session.resetsInMin, 2);
    assert.equal(next[1].weekly.used, 0.35 + 0.0004 * 10);
    assert.equal(next[1].weekly.resetsInMin, 80);
    assert.notEqual(next[0], start[0]);
    assert.notEqual(next[1].session, start[1].session);
  });
});

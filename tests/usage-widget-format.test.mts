import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMinutes,
  formatPercent,
  formatTime,
} from "../src/app/experiments/usage-widget/format.ts";

describe("formatMinutes", () => {
  const cases: { minutes: number; expected: string }[] = [
    { minutes: 0, expected: "0m" },
    { minutes: -0.2, expected: "0m" },
    { minutes: -1, expected: "0m" },
    { minutes: -10_000, expected: "0m" },
    { minutes: 0.4, expected: "0m" },
    { minutes: 0.5, expected: "1m" },
    { minutes: 1, expected: "1m" },
    { minutes: 44.49, expected: "44m" },
    { minutes: 44.5, expected: "45m" },
    { minutes: 59, expected: "59m" },
    { minutes: 59.4, expected: "59m" },
    { minutes: 59.5, expected: "1h" },
    { minutes: 60, expected: "1h" },
    { minutes: 60.4, expected: "1h" },
    { minutes: 60.5, expected: "1h 1m" },
    { minutes: 61, expected: "1h 1m" },
    { minutes: 90, expected: "1h 30m" },
    { minutes: 119.5, expected: "2h" },
    { minutes: 120, expected: "2h" },
    { minutes: 1_440, expected: "24h" },
    { minutes: 10_080, expected: "168h" },
    { minutes: 10_081, expected: "168h 1m" },
    { minutes: 100_000, expected: "1666h 40m" },
  ];

  for (const { minutes, expected } of cases) {
    it(`formats ${minutes} as ${expected}`, () => {
      assert.equal(formatMinutes(minutes), expected);
    });
  }
});

describe("formatPercent", () => {
  const cases: { used: number; expected: string }[] = [
    { used: 0, expected: "0%" },
    { used: 0.004, expected: "0%" },
    { used: 0.005, expected: "1%" },
    { used: 0.734, expected: "73%" },
    { used: 0.735, expected: "74%" },
    { used: 0.994, expected: "99%" },
    { used: 0.995, expected: "100%" },
    { used: 1, expected: "100%" },
    { used: 1.2, expected: "120%" },
    { used: -0.2, expected: "-20%" },
    { used: 10, expected: "1000%" },
  ];

  for (const { used, expected } of cases) {
    it(`formats ${used} as ${expected}`, () => {
      assert.equal(formatPercent(used), expected);
    });
  }
});

describe("formatTime", () => {
  it("runs in UTC so the clock strings do not depend on the machine zone", () => {
    assert.equal(Intl.DateTimeFormat().resolvedOptions().timeZone, "UTC");
  });

  const cases: { iso: string; expected: RegExp }[] = [
    { iso: "2026-01-15T00:00:00Z", expected: /^12:00\sAM$/ },
    { iso: "2026-01-15T00:05:00Z", expected: /^12:05\sAM$/ },
    { iso: "2026-01-15T09:07:00Z", expected: /^9:07\sAM$/ },
    { iso: "2026-01-15T12:00:00Z", expected: /^12:00\sPM$/ },
    { iso: "2026-01-15T15:05:00Z", expected: /^3:05\sPM$/ },
    { iso: "2026-01-15T15:05:59Z", expected: /^3:05\sPM$/ },
    { iso: "2026-01-15T23:59:00Z", expected: /^11:59\sPM$/ },
  ];

  for (const { iso, expected } of cases) {
    it(`formats ${iso} as ${expected}`, () => {
      assert.match(formatTime(new Date(iso)), expected);
    });
  }
});

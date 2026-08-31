import type { Model, WindowKey } from "@/lib/data";
import {
  getBindingWindow,
  getMinutesUntilEmpty,
  getWindow,
  windowLabel,
} from "@/lib/provider-status";

export type Size = "small" | "medium" | "large";
export type State = "healthy" | "tight" | "empty";

const FORBIDDEN_COMPACT = /Session|Weekly|resets|runs out/i;

function fmt(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m >= 1440) {
    const d = Math.floor(m / 1440);
    const rem = m % 1440;
    const h = Math.floor(rem / 60);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  }
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m}m`;
}

function fmtEmpty(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m >= 1440) return `${Math.floor(m / 1440)}d`;
  if (m >= 60) return `${Math.floor(m / 60)}h`;
  return `${m}m`;
}

function assertCompact(result: string): void {
  if (process.env.NODE_ENV !== "development") return;
  if (result.length > 12) {
    throw new Error(`compactStatus exceeds 12 chars (${result.length}): "${result}"`);
  }
  if (FORBIDDEN_COMPACT.test(result)) {
    throw new Error(`compactStatus contains forbidden word: "${result}"`);
  }
}

/** COMPACT — small and medium only. Never longer than 12 characters. */
export function compactStatus(state: State, minutes: number): string {
  let result: string;
  switch (state) {
    case "healthy":
      result = `${fmt(minutes)} left`;
      break;
    case "tight":
      result = `${fmt(minutes)} early`;
      break;
    case "empty":
      result = `Limit · ${fmtEmpty(minutes)}`;
      break;
  }
  assertCompact(result);
  return result;
}

export function stateFromWindow(
  window: { used: number; resetsInMin: number },
  minutesLeft: number
): State {
  if (window.used >= 1) return "empty";
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < window.resetsInMin) return "tight";
  return "healthy";
}

export function bindingCompactParams(model: Model): { state: State; minutes: number } {
  const binding = getBindingWindow(model);
  const window = getWindow(model, binding);
  const minutesLeft = getMinutesUntilEmpty(window);
  const state = stateFromWindow(window, minutesLeft);

  if (state === "empty") {
    return { state, minutes: window.resetsInMin };
  }
  if (state === "tight") {
    return { state, minutes: Math.max(0, Math.round(window.resetsInMin - minutesLeft)) };
  }
  return { state, minutes: window.resetsInMin };
}

/** FULL — large only. */
export function fullStatus(
  windowKey: WindowKey,
  state: State,
  minutes: number,
  role: "binding" | "other"
): string {
  const label = windowLabel(windowKey);

  if (state === "empty") {
    return `${label} · limit reached, resets in ${fmt(minutes)}`;
  }
  if (state === "tight") {
    return `${label} · runs out ${fmt(minutes)} early`;
  }
  if (role === "binding") {
    return `${label} · resets in ${fmt(minutes)}`;
  }
  return `${label} · ${fmt(minutes)} left`;
}

export function windowFullParams(
  model: Model,
  windowKey: WindowKey
): { state: State; minutes: number } {
  const window = getWindow(model, windowKey);
  const minutesLeft = getMinutesUntilEmpty(window);
  const state = stateFromWindow(window, minutesLeft);

  if (state === "empty") {
    return { state, minutes: window.resetsInMin };
  }
  if (state === "tight") {
    return { state, minutes: Math.max(0, Math.round(window.resetsInMin - minutesLeft)) };
  }
  if (windowKey === getBindingWindow(model)) {
    return { state, minutes: window.resetsInMin };
  }
  const left = Math.min(minutesLeft, window.resetsInMin);
  return { state, minutes: Math.round(left) };
}

export function getClosestToLimitModel(models: Model[]): Model {
  return models.reduce((closest, m) => {
    const bind = getBindingWindow(m);
    const left = getMinutesUntilEmpty(m[bind]);
    const cBind = getBindingWindow(closest);
    const cLeft = getMinutesUntilEmpty(closest[cBind]);
    return left < cLeft ? m : closest;
  });
}

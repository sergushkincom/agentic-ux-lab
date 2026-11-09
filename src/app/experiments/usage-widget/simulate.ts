import type { BaseModel, BaseWindow } from "./data";

/** Real seconds are scaled by this factor while a scenario is simulating. */
export const SIM_SPEED = 60;

export function simulatedDeltaMinutes(
  elapsedMs: number,
  burnMultiplier: number,
): number {
  const deltaSec = elapsedMs / 1000;
  return deltaSec * SIM_SPEED * burnMultiplier;
}

export function tickWindow(
  window: BaseWindow,
  burnPerMin: number,
  deltaMin: number,
): BaseWindow {
  let used = window.used + burnPerMin * deltaMin;
  let resetsInMin = window.resetsInMin - deltaMin;
  if (used >= 1) used = 1;
  if (resetsInMin < 0) resetsInMin = 0;
  return { ...window, used, resetsInMin };
}

export function advanceModels(
  models: readonly BaseModel[],
  effortMultiplier: number,
  deltaMin: number,
): BaseModel[] {
  return models.map((model) => {
    const sessionBurn = model.session.baseBurnPerMin * effortMultiplier;
    const weeklyBurn = model.weekly.baseBurnPerMin * effortMultiplier;
    return {
      ...model,
      session: tickWindow(model.session, sessionBurn, deltaMin),
      weekly: tickWindow(model.weekly, weeklyBurn, deltaMin),
    };
  });
}

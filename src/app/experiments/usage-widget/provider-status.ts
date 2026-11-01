import type {
  BaseModel,
  Effort,
  Model,
  ProviderStatus,
  WindowKey,
  WindowState,
} from "./data";
import {
  EFFORT_OPTIONS,
  applyEffort,
} from "./data";
import { copy, type WindowLabel } from "./copy";
import { fullStatus } from "./status-copy";

export const STATUS_COLORS: Record<ProviderStatus, string> = {
  healthy: "#34C759",
  tight: "#FF9F0A",
  empty: "#FF3B30",
};

const NEUTRAL_RING = "rgba(255, 255, 255, 0.28)";

export { NEUTRAL_RING };

export function windowLabel(key: WindowKey): WindowLabel {
  return key === "session" ? "Session" : "Weekly";
}

export function otherWindow(key: WindowKey): WindowKey {
  return key === "session" ? "weekly" : "session";
}

export function getWindow(model: Model, key: WindowKey): WindowState {
  return model[key];
}

export function getMinutesUntilEmpty(window: WindowState): number {
  if (window.burnPerMin <= 0 || window.used >= 1) return 0;
  return (1 - window.used) / window.burnPerMin;
}

export function getWindowStatus(window: WindowState): ProviderStatus {
  if (window.used >= 1) return "empty";
  const minutesLeft = getMinutesUntilEmpty(window);
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < window.resetsInMin) return "tight";
  return "healthy";
}

/** The window that depletes soonest — the binding constraint */
export function getBindingWindow(model: Model): WindowKey {
  const sessionLeft = getMinutesUntilEmpty(model.session);
  const weeklyLeft = getMinutesUntilEmpty(model.weekly);

  if (sessionLeft <= weeklyLeft) return "session";
  return "weekly";
}

export function getWindowLine(
  key: WindowKey,
  window: WindowState,
  status?: ProviderStatus
): string {
  const s = status ?? getWindowStatus(window);
  const params = {
    state: s as "healthy" | "tight" | "empty",
    minutes:
      s === "empty"
        ? window.resetsInMin
        : s === "tight"
          ? Math.max(
              0,
              Math.round(
                window.resetsInMin -
                  (window.burnPerMin <= 0 || window.used >= 1
                    ? 0
                    : (1 - window.used) / window.burnPerMin)
              )
            )
          : window.resetsInMin,
  };
  return fullStatus(key, params.state, params.minutes, "binding");
}

export function getPrimaryLine(model: Model): string {
  const binding = getBindingWindow(model);
  return getWindowLine(binding, model[binding]);
}

export function getSecondaryLine(model: Model): string {
  const binding = getBindingWindow(model);
  const other = otherWindow(binding);
  return getWindowLine(other, model[other]);
}

export function getAriaLabel(model: Model): string {
  const binding = getBindingWindow(model);
  const window = model[binding];
  const status = getWindowStatus(window);
  const primary = getPrimaryLine(model);
  const secondary = getSecondaryLine(model);
  return `${model.name}, ${Math.round(window.used * 100)} percent used on ${windowLabel(binding)}, ${status}, ${primary}. ${secondary}`;
}

export function getAdvisoryLine(
  models: BaseModel[],
  effort: Effort
): string | null {
  if (effort !== "High") return null;

  const lowerEffort = EFFORT_OPTIONS[EFFORT_OPTIONS.indexOf(effort) - 1];
  if (lowerEffort !== "Medium") return null;

  const hasQualifyingModel = models.some((base) => {
    const atCurrent = applyEffort(base, effort);
    const atLower = applyEffort(base, lowerEffort);
    const binding = getBindingWindow(atCurrent);
    if (binding !== "session") return false;
    return (
      getWindowStatus(atCurrent.session) === "tight" &&
      getWindowStatus(atLower.session) === "healthy"
    );
  });

  return hasQualifyingModel ? copy.advisory : null;
}

export function sparklineColor(model: Model): string {
  const binding = getBindingWindow(model);
  return STATUS_COLORS[getWindowStatus(model[binding])];
}

/** @deprecated */
export function getProviderStatus(window: WindowState): ProviderStatus {
  return getWindowStatus(window);
}

/** @deprecated */
export function getStatusColor(model: Model): string {
  return sparklineColor(model);
}

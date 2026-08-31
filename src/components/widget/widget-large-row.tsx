"use client";

import type { Model } from "@/lib/data";
import { WINDOW_SHORT } from "@/lib/copy";
import { formatPercent } from "@/lib/format";
import {
  STATUS_COLORS,
  getBindingWindow,
  otherWindow,
} from "@/lib/provider-status";
import {
  fullStatus,
  windowFullParams,
} from "@/lib/status-copy";

export function WidgetLargeRow({ model }: { model: Model }) {
  const binding = getBindingWindow(model);
  const other = otherWindow(binding);
  const bindingParams = windowFullParams(model, binding);
  const otherParams = windowFullParams(model, other);

  const bindingText = fullStatus(binding, bindingParams.state, bindingParams.minutes, "binding");
  const otherText = fullStatus(other, otherParams.state, otherParams.minutes, "other");

  const summary = `${WINDOW_SHORT.session} ${formatPercent(model.session.used)}  ${WINDOW_SHORT.weekly} ${formatPercent(model.weekly.used)}`;

  const bindingColor =
    bindingParams.state === "healthy" ? undefined : STATUS_COLORS[bindingParams.state];

  return (
    <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
        <span className="widget-model-name shrink-0 leading-none">{model.name}</span>
        <span className="widget-window-summary shrink-0 leading-none">{summary}</span>
      </div>
      <p
        className="widget-status-line m-0 leading-none"
        style={{ color: bindingColor }}
      >
        {bindingText}
      </p>
      <p className="widget-status-line m-0 leading-none" style={{ opacity: 0.42 }}>
        {otherText}
      </p>
    </div>
  );
}

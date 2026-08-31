"use client";

import type { Model } from "@/lib/data";
import { formatPercent } from "@/lib/format";
import { STATUS_COLORS, getBindingWindow, getWindow } from "@/lib/provider-status";
import { bindingCompactParams, compactStatus } from "@/lib/status-copy";
import { ModelRing } from "@/components/ModelRing";

const RING = 64;

type WidgetSmallProps = {
  model: Model;
};

function Gap({ h }: { h: number }) {
  return <div style={{ height: h, flexShrink: 0 }} aria-hidden="true" />;
}

export function WidgetSmall({ model }: WidgetSmallProps) {
  const binding = getBindingWindow(model);
  const used = getWindow(model, binding).used;
  const { state, minutes } = bindingCompactParams(model);
  const status = compactStatus(state, minutes);
  const statusColor = state === "healthy" ? undefined : STATUS_COLORS[state];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <ModelRing model={model} diameter={RING} bindingOnly />
      <Gap h={8} />
      <span className="widget-percentage leading-none">{formatPercent(used)}</span>
      <Gap h={4} />
      <span className="widget-model-name leading-none">{model.name}</span>
      <Gap h={4} />
      <p className="widget-status-line m-0 leading-none" style={{ color: statusColor }}>
        {status}
      </p>
    </div>
  );
}

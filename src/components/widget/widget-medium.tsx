"use client";

import type { Effort, Model } from "@/lib/data";
import { formatPercent } from "@/lib/format";
import { STATUS_COLORS, getBindingWindow, getWindow } from "@/lib/provider-status";
import { bindingCompactParams, compactStatus } from "@/lib/status-copy";
import { ModelRing } from "@/components/ModelRing";
import { EffortControl } from "@/components/EffortControl";

const RING = 44;
const GRID_GAP = 12;
const EFFORT_CLEARANCE = 12;
const EFFORT_HEIGHT = 24;

type WidgetMediumProps = {
  models: Model[];
  effort: Effort;
  onEffortChange: (effort: Effort) => void;
};

function Gap({ h }: { h: number }) {
  return <div style={{ height: h, flexShrink: 0 }} aria-hidden="true" />;
}

function MediumColumn({ model }: { model: Model }) {
  const binding = getBindingWindow(model);
  const used = getWindow(model, binding).used;
  const { state, minutes } = bindingCompactParams(model);
  const status = compactStatus(state, minutes);
  const statusColor = state === "healthy" ? undefined : STATUS_COLORS[state];

  return (
    <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
      <ModelRing model={model} diameter={RING} bindingOnly />
      <Gap h={6} />
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

export function WidgetMedium({ models, effort, onEffortChange }: WidgetMediumProps) {
  return (
    <div className="flex h-full flex-col">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: GRID_GAP,
          flex: "1 1 auto",
          minHeight: 0,
          alignContent: "start",
        }}
      >
        {models.map((model) => (
          <MediumColumn key={model.id} model={model} />
        ))}
      </div>
      <Gap h={EFFORT_CLEARANCE} />
      <div style={{ height: EFFORT_HEIGHT, flexShrink: 0 }}>
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>
    </div>
  );
}

"use client";

import type { Effort } from "@/lib/data";
import { EFFORT_OPTIONS } from "@/lib/data";
import { copy } from "@/lib/copy";

type EffortControlProps = {
  value: Effort;
  onChange: (effort: Effort) => void;
};

export function EffortControl({ value, onChange }: EffortControlProps) {
  return (
    <div
      className="flex h-6 items-center justify-between gap-3"
      data-no-drag
      role="group"
      aria-label={copy.effortLabel}
    >
      <span className="widget-effort-label shrink-0">{copy.effortLabel}</span>
      <div
        className="flex h-6 items-center rounded-[7px] p-0.5"
        style={{ background: "rgba(255, 255, 255, 0.08)" }}
        role="radiogroup"
        aria-label={copy.effortLabel}
      >
        {EFFORT_OPTIONS.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              data-no-drag
              onClick={() => onChange(opt)}
              className="focus-ring h-[22px] rounded-[6px] px-2 text-[11px] font-normal outline-none transition-[background] duration-150 ease-out"
              style={{
                background: selected ? "rgba(255, 255, 255, 0.20)" : "transparent",
                color: "rgba(255, 255, 255, 0.92)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{
        background: "var(--control-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "var(--control-shadow)",
        border: "1px solid var(--control-border)",
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={`focus-ring rounded-md px-3 py-1.5 text-[12px] font-medium outline-none transition-colors duration-150 ${
              selected ? "shadow-sm" : "opacity-60 hover:opacity-80"
            }`}
            style={{
              background: selected ? "var(--control-selected)" : "transparent",
              color: "var(--control-text)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

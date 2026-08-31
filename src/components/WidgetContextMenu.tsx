"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Scenario, WidgetSize } from "@/lib/data";
import { SCENARIO_CONFIG } from "@/lib/data";

type MenuState = {
  x: number;
  y: number;
} | null;

type WidgetContextMenuProps = {
  open: MenuState;
  size: WidgetSize;
  scenario: Scenario;
  onClose: () => void;
  onSizeChange: (size: WidgetSize) => void;
  onScenarioChange: (scenario: Scenario) => void;
};

const SIZE_OPTIONS: { value: WidgetSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const SCENARIO_OPTIONS = (Object.keys(SCENARIO_CONFIG) as Scenario[]).map(
  (key) => ({
    value: key,
    label: SCENARIO_CONFIG[key].label,
  })
);

type Focusable =
  | { type: "header"; label: string }
  | { type: "item"; section: "size" | "scenario"; value: string; label: string; checked: boolean }
  | { type: "disabled"; label: string }
  | { type: "separator" };

function buildItems(size: WidgetSize, scenario: Scenario): Focusable[] {
  const items: Focusable[] = [{ type: "header", label: "Size" }];
  for (const opt of SIZE_OPTIONS) {
    items.push({
      type: "item",
      section: "size",
      value: opt.value,
      label: opt.label,
      checked: size === opt.value,
    });
  }
  items.push({ type: "separator" });
  items.push({ type: "header", label: "Scenario" });
  for (const opt of SCENARIO_OPTIONS) {
    items.push({
      type: "item",
      section: "scenario",
      value: opt.value,
      label: opt.label,
      checked: scenario === opt.value,
    });
  }
  items.push({ type: "separator" });
  items.push({ type: "disabled", label: "Remove Widget" });
  items.push({ type: "disabled", label: "Edit Widgets…" });
  return items;
}

export function WidgetContextMenu({
  open,
  size,
  scenario,
  onClose,
  onSizeChange,
  onScenarioChange,
}: WidgetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const items = buildItems(size, scenario);
  const selectableIndices = items
    .map((item, i) => (item.type === "item" ? i : -1))
    .filter((i) => i >= 0);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const selectable = items
      .map((item, i) => (item.type === "item" ? i : -1))
      .filter((i) => i >= 0);
    setFocusIndex(selectable[0] ?? 0);

    const menuW = 200;
    const menuH = 320;
    let x = open.x;
    let y = open.y;
    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    setPosition({ x, y });
  }, [open, size, scenario]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((prev) => {
          const idx = selectableIndices.indexOf(prev);
          const next = selectableIndices[(idx + 1) % selectableIndices.length];
          return next ?? prev;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((prev) => {
          const idx = selectableIndices.indexOf(prev);
          const next =
            selectableIndices[
              (idx - 1 + selectableIndices.length) % selectableIndices.length
            ];
          return next ?? prev;
        });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = items[focusIndex];
        if (item?.type === "item") {
          if (item.section === "size") onSizeChange(item.value as WidgetSize);
          else onScenarioChange(item.value as Scenario);
          onClose();
        }
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, focusIndex, items, onClose, onSizeChange, onScenarioChange, selectableIndices]);

  const handleSelect = useCallback(
    (item: Extract<Focusable, { type: "item" }>) => {
      if (item.section === "size") onSizeChange(item.value as WidgetSize);
      else onScenarioChange(item.value as Scenario);
      onClose();
    },
    [onClose, onSizeChange, onScenarioChange]
  );

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[100]"
      style={{
        left: position.x,
        top: position.y,
        minWidth: 200,
        padding: 5,
        borderRadius: 10,
        background: "rgba(46, 46, 48, 0.72)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "0.5px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
      }}
    >
      {items.map((item, i) => {
        if (item.type === "header") {
          return (
            <div
              key={`h-${item.label}`}
              className="px-2.5 pt-1 pb-0.5 select-none"
              style={{
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.40)",
              }}
            >
              {item.label}
            </div>
          );
        }
        if (item.type === "separator") {
          return (
            <div
              key={`sep-${i}`}
              className="my-1.5"
              style={{ height: 0.5, background: "rgba(255, 255, 255, 0.12)" }}
              role="separator"
            />
          );
        }
        if (item.type === "disabled") {
          return (
            <div
              key={item.label}
              role="menuitem"
              aria-disabled="true"
              className="flex h-6 items-center rounded-[5px] px-2.5 select-none"
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.92)",
                opacity: 0.4,
              }}
            >
              {item.label}
            </div>
          );
        }

        const focused = focusIndex === i;
        return (
          <button
            key={`${item.section}-${item.value}`}
            type="button"
            role="menuitemradio"
            aria-checked={item.checked}
            className="flex h-6 w-full items-center rounded-[5px] px-2.5 text-left outline-none"
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: focused ? "#FFFFFF" : "rgba(255, 255, 255, 0.92)",
              background: focused ? "#0A84FF" : "transparent",
            }}
            onMouseEnter={() => setFocusIndex(i)}
            onClick={() => handleSelect(item)}
          >
            <span className="inline-flex w-4 shrink-0 justify-start text-[12px]">
              {item.checked ? "✓" : ""}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export type { MenuState };

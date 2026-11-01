"use client";

import { useCallback, useRef } from "react";
import type { Effort, Scenario, WidgetSize } from "@/app/experiments/usage-widget/data";
import { Wallpaper } from "./desktop/wallpaper";
import { MenuBar } from "./MenuBar";
import { UsageWidget } from "./UsageWidget";
import { useSimulation } from "@/hooks/useSimulation";

type DesktopStageProps = {
  size: WidgetSize;
  scenario: Scenario;
  onSizeChange: (size: WidgetSize) => void;
  onScenarioChange: (scenario: Scenario) => void;
};

export function DesktopStage({
  size,
  scenario,
  onSizeChange,
  onScenarioChange,
}: DesktopStageProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { models, setEffort } = useSimulation(scenario);

  const handleEffortChange = useCallback(
    (effort: Effort) => {
      setEffort(effort);
    },
    [setEffort]
  );

  return (
    <div className="desktop-stage relative h-full w-full overflow-hidden">
      <Wallpaper />
      <MenuBar />

      <div
        ref={desktopRef}
        className="absolute inset-0 top-7 z-[1]"
        aria-label="Simulated macOS desktop"
      >
        <UsageWidget
          baseModels={models}
          scenario={scenario}
          size={size}
          desktopRef={desktopRef}
          onEffortChange={handleEffortChange}
          onSizeChange={onSizeChange}
          onScenarioChange={onScenarioChange}
        />
      </div>
    </div>
  );
}

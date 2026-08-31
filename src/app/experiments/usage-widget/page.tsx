"use client";

import { useState } from "react";
import type { Scenario, WidgetSize } from "@/lib/data";
import { DesktopStage } from "@/components/DesktopStage";

export default function UsageWidgetPage() {
  const [size, setSize] = useState<WidgetSize>("medium");
  const [scenario, setScenario] = useState<Scenario>("working");

  return (
    <DesktopStage
      size={size}
      scenario={scenario}
      onSizeChange={setSize}
      onScenarioChange={setScenario}
    />
  );
}

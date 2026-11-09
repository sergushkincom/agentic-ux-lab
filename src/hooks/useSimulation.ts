"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseModel, Effort, Scenario } from "@/app/experiments/usage-widget/data";
import { EFFORT_MULTIPLIER, SCENARIO_CONFIG } from "@/app/experiments/usage-widget/data";
import {
  advanceModels,
  simulatedDeltaMinutes,
} from "@/app/experiments/usage-widget/simulate";

export function useSimulation(scenario: Scenario) {
  const [models, setModels] = useState<BaseModel[]>(() =>
    SCENARIO_CONFIG[scenario].models.map((m) => ({
      ...m,
      session: { ...m.session },
      weekly: { ...m.weekly },
    }))
  );

  const modelsRef = useRef(models);
  const scenarioRef = useRef(scenario);
  const effortRef = useRef<Effort>("Medium");
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    scenarioRef.current = scenario;
    const fresh = SCENARIO_CONFIG[scenario].models.map((m) => ({
      ...m,
      session: { ...m.session },
      weekly: { ...m.weekly },
    }));
    modelsRef.current = fresh;
    setModels(fresh);
    lastTimeRef.current = null;
  }, [scenario]);

  const setEffort = useCallback((effort: Effort) => {
    effortRef.current = effort;
  }, []);

  const tick = useCallback((now: number) => {
    const cfg = SCENARIO_CONFIG[scenarioRef.current];

    if (cfg.simulating) {
      if (lastTimeRef.current !== null) {
        const deltaMin = simulatedDeltaMinutes(
          now - lastTimeRef.current,
          cfg.burnMultiplier,
        );
        const multiplier = EFFORT_MULTIPLIER[effortRef.current];
        const next = advanceModels(modelsRef.current, multiplier, deltaMin);

        modelsRef.current = next;
        setModels(next);
      }
      lastTimeRef.current = now;
    } else {
      lastTimeRef.current = null;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return { models, setEffort };
}

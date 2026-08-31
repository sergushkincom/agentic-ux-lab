"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseModel, Effort, Scenario } from "@/lib/data";
import { EFFORT_MULTIPLIER, SCENARIO_CONFIG } from "@/lib/data";

const SIM_SPEED = 60;

function tickWindow(
  window: BaseModel["session"],
  burnPerMin: number,
  deltaMin: number
) {
  let used = window.used + burnPerMin * deltaMin;
  let resetsInMin = window.resetsInMin - deltaMin;
  if (used >= 1) used = 1;
  if (resetsInMin < 0) resetsInMin = 0;
  return { ...window, used, resetsInMin };
}

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
        const deltaSec = (now - lastTimeRef.current) / 1000;
        const deltaMin = deltaSec * SIM_SPEED * cfg.burnMultiplier;
        const multiplier = EFFORT_MULTIPLIER[effortRef.current];

        const next = modelsRef.current.map((m) => {
          const sessionBurn = m.session.baseBurnPerMin * multiplier;
          const weeklyBurn = m.weekly.baseBurnPerMin * multiplier;
          return {
            ...m,
            session: tickWindow(m.session, sessionBurn, deltaMin),
            weekly: tickWindow(m.weekly, weeklyBurn, deltaMin),
          };
        });

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

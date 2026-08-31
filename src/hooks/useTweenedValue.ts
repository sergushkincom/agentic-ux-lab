"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const DURATION_MS = 400;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useTweenedValue(target: number): number {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const targetRef = useRef(target);
  const startRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reducedMotion) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    if (target === displayRef.current) return;

    startRef.current = displayRef.current;
    targetRef.current = target;
    startTimeRef.current = null;

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const value = startRef.current + (targetRef.current - startRef.current) * easeOut(t);
      displayRef.current = value;
      setDisplay(value);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, reducedMotion]);

  return reducedMotion ? target : display;
}

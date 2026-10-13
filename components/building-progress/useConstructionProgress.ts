"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animateConstructionProgress, clampConstructionProgress, PROGRESS_REVEAL_HOLD_MS,
} from "@/lib/building-progress/progress-animation";

export function useConstructionProgress(externalProgress: number, ready: boolean) {
  const [targetProgress, setTargetProgress] = useState(() => clampConstructionProgress(externalProgress));
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const displayedProgress = useRef(0);
  const cancelAnimation = useRef<(() => void) | null>(null);

  const updateDisplay = useCallback((value: number) => {
    displayedProgress.current = value;
    setProgress(value);
  }, []);

  useEffect(() => {
    setTargetProgress(clampConstructionProgress(externalProgress));
  }, [externalProgress]);

  useEffect(() => {
    cancelAnimation.current?.();
    if (!ready) {
      updateDisplay(0);
      setIsAnimating(false);
      return;
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const from = displayedProgress.current;
    setIsAnimating(from !== targetProgress);
    const cancel = animateConstructionProgress({
      from,
      to: targetProgress,
      delayMs: from === 0 ? PROGRESS_REVEAL_HOLD_MS : 0,
      reducedMotion: motionPreference.matches,
      onUpdate: updateDisplay,
      onComplete: () => setIsAnimating(false),
    });
    cancelAnimation.current = cancel;

    const handleMotionPreference = () => {
      if (!motionPreference.matches) return;
      cancel();
      updateDisplay(targetProgress);
      setIsAnimating(false);
    };
    motionPreference.addEventListener("change", handleMotionPreference);
    return () => {
      cancel();
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, [ready, targetProgress, updateDisplay]);

  const selectProgress = useCallback((value: number) => {
    // A user adjustment takes over immediately, including during the entrance.
    cancelAnimation.current?.();
    const next = clampConstructionProgress(value);
    updateDisplay(next);
    setTargetProgress(next);
    setIsAnimating(false);
  }, [updateDisplay]);

  return { progress, isAnimating, selectProgress };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animateConstructionProgress, clampConstructionProgress, getConstructionRevealTiming,
  type ConstructionReveal,
} from "@/lib/building-progress/progress-animation";

export function useConstructionProgress(externalProgress: number, ready: boolean) {
  const [target, setTarget] = useState(() => ({ source: externalProgress, value: clampConstructionProgress(externalProgress) }));
  const targetProgress = target.source === externalProgress ? target.value : clampConstructionProgress(externalProgress);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reveal, setReveal] = useState<ConstructionReveal | null>(null);
  const displayedProgress = useRef(0);
  const cancelAnimation = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);
  const cycleReady = useRef(false);
  const entranceTarget = useRef<number | null>(null);
  const entranceAvailable = useRef(false);

  const updateDisplay = useCallback((value: number) => {
    displayedProgress.current = value;
    setProgress(value);
  }, []);

  useEffect(() => {
    setTarget({ source: externalProgress, value: clampConstructionProgress(externalProgress) });
  }, [externalProgress]);

  useEffect(() => {
    cancelAnimation.current?.();
    if (!ready) {
      runIdRef.current++;
      cycleReady.current = false;
      entranceAvailable.current = false;
      entranceTarget.current = null;
      updateDisplay(0);
      setIsAnimating(false);
      setReveal(null);
      return;
    }

    // Keep the entrance pending through Strict Mode's immediate effect replay.
    // A changed target consumes it, so later slider updates never add a worker.
    if (!cycleReady.current) {
      cycleReady.current = true;
      entranceTarget.current = targetProgress;
      entranceAvailable.current = targetProgress > 0;
    } else if (entranceTarget.current !== targetProgress) {
      entranceAvailable.current = false;
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const from = displayedProgress.current;
    const timing = getConstructionRevealTiming(from, targetProgress);
    const runId = ++runIdRef.current;
    const isInitialReveal = entranceAvailable.current && from === 0;
    const isEntrance = isInitialReveal && !motionPreference.matches;
    const initialReveal: ConstructionReveal = {
      phase: timing.holdMs > 0 ? "holding" : "working",
      elapsedMs: -timing.holdMs,
      durationMs: timing.durationMs,
      targetProgress,
      confirmMs: timing.confirmMs,
      exitMs: timing.exitMs,
      runId,
    };
    setReveal(isEntrance ? initialReveal : null);
    setIsAnimating(from !== targetProgress);
    const cancel = animateConstructionProgress({
      from,
      to: targetProgress,
      delayMs: isInitialReveal ? timing.holdMs : 0,
      reducedMotion: motionPreference.matches,
      onUpdate: (value) => {
        if (runId === runIdRef.current) updateDisplay(value);
      },
      onFrame: isEntrance ? ({ elapsedMs }) => {
        if (runId !== runIdRef.current) return;
        setReveal({ ...initialReveal, phase: elapsedMs < 0 ? "holding" : "working", elapsedMs });
      } : undefined,
      onComplete: () => {
        if (runId !== runIdRef.current) return;
        entranceAvailable.current = false;
        setIsAnimating(false);
        setReveal(isEntrance ? { ...initialReveal, phase: "confirming", elapsedMs: timing.durationMs } : null);
      },
    });
    cancelAnimation.current = cancel;

    const handleMotionPreference = () => {
      if (!motionPreference.matches) return;
      cancel();
      runIdRef.current++;
      entranceAvailable.current = false;
      updateDisplay(targetProgress);
      setIsAnimating(false);
      setReveal(null);
    };
    motionPreference.addEventListener("change", handleMotionPreference);
    return () => {
      cancel();
      if (runIdRef.current === runId) runIdRef.current++;
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, [ready, targetProgress, updateDisplay]);

  const selectProgress = useCallback((value: number) => {
    // A user adjustment takes over immediately, including during the entrance.
    cancelAnimation.current?.();
    runIdRef.current++;
    entranceAvailable.current = false;
    const next = clampConstructionProgress(value);
    updateDisplay(next);
    setTarget({ source: externalProgress, value: next });
    setIsAnimating(false);
    setReveal(null);
  }, [externalProgress, updateDisplay]);

  const finishReveal = useCallback((runId: number) => {
    setReveal((current) => current?.runId === runId && current.phase === "confirming" ? null : current);
  }, []);

  return { progress, isAnimating, selectProgress, reveal, finishReveal };
}

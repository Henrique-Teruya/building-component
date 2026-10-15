export function clampConstructionProgress(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

export function getConstructionRevealTiming(from: number, to: number) {
  const start = clampConstructionProgress(from);
  const target = clampConstructionProgress(to);
  const delta = Math.abs(target - start);
  if (delta === 0) return { durationMs: 0, holdMs: 0, confirmMs: 0, exitMs: 0 };
  return {
    durationMs: 200 + 24 * delta,
    holdMs: start === 0 && target > 0 ? Math.min(200, Math.max(60, 4 * delta)) : 0,
    confirmMs: Math.min(450, Math.max(220, 9 * delta)),
    exitMs: Math.min(150, Math.max(80, 3 * delta)),
  };
}

export interface ConstructionProgressFrame {
  progress: number;
  fraction: number;
  elapsedMs: number;
  durationMs: number;
}

export interface ConstructionReveal {
  phase: "holding" | "working" | "confirming";
  elapsedMs: number;
  durationMs: number;
  targetProgress: number;
  confirmMs: number;
  exitMs: number;
  runId: number;
}

interface AnimationClock {
  now: () => number;
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
}

interface ProgressAnimationOptions {
  from: number;
  to: number;
  delayMs?: number;
  reducedMotion: boolean;
  onUpdate: (progress: number) => void;
  onFrame?: (frame: ConstructionProgressFrame) => void;
  onComplete: () => void;
  clock?: AnimationClock;
}

// One timeline drives the photo, number and slider together.
export function animateConstructionProgress({
  from, to, delayMs = 0, reducedMotion, onUpdate, onFrame, onComplete,
  clock = {
    now: () => performance.now(),
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  },
}: ProgressAnimationOptions): () => void {
  const start = clampConstructionProgress(from);
  const target = clampConstructionProgress(to);
  const { durationMs } = getConstructionRevealTiming(start, target);
  const delay = Number.isFinite(delayMs) ? Math.max(0, delayMs) : 0;
  const startedAt = clock.now();
  let frame: number | null = null;
  let cancelled = false;

  onUpdate(start);
  if (start === target) {
    onComplete();
    return () => undefined;
  }

  const tick = (time: number) => {
    if (cancelled) return;
    const elapsed = time - startedAt - delay;
    const fraction = reducedMotion ? 1 : Math.min(1, Math.max(0, elapsed / durationMs));
    const eased = 1 - (1 - fraction) ** 3;
    const progress = fraction === 1 ? target : start + (target - start) * eased;
    if (elapsed >= 0) {
      onUpdate(progress);
      if (cancelled) return;
    }
    if (!reducedMotion) {
      onFrame?.({ progress, fraction, elapsedMs: elapsed, durationMs });
      if (cancelled) return;
    }
    if (elapsed >= 0 && fraction === 1) {
      frame = null;
      onComplete();
      return;
    }
    frame = clock.request(tick);
  };
  frame = clock.request(tick);

  return () => {
    cancelled = true;
    if (frame !== null) clock.cancel(frame);
  };
}

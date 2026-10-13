export const PROGRESS_REVEAL_HOLD_MS = 200;
export const PROGRESS_REVEAL_DURATION_MS = 1400;

export function clampConstructionProgress(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
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
  onComplete: () => void;
  clock?: AnimationClock;
}

// One timeline drives the photo, number and slider together.
export function animateConstructionProgress({
  from, to, delayMs = 0, reducedMotion, onUpdate, onComplete,
  clock = {
    now: () => performance.now(),
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  },
}: ProgressAnimationOptions): () => void {
  const start = clampConstructionProgress(from);
  const target = clampConstructionProgress(to);
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
    const elapsed = time - startedAt - delayMs;
    if (elapsed >= 0) {
      const fraction = reducedMotion ? 1 : Math.min(1, elapsed / PROGRESS_REVEAL_DURATION_MS);
      const eased = 1 - (1 - fraction) ** 3;
      onUpdate(fraction === 1 ? target : start + (target - start) * eased);
      if (fraction === 1) {
        frame = null;
        onComplete();
        return;
      }
    }
    frame = clock.request(tick);
  };
  frame = clock.request(tick);

  return () => {
    cancelled = true;
    if (frame !== null) clock.cancel(frame);
  };
}

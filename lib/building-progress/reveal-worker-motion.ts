export interface RevealWorkStation {
  /** Horizontal position within the image, independent of its pixel dimensions. */
  x: number;
  facing: 1 | -1;
  startMs: number;
  workMs: number;
  travelMs: number;
  hitsMs: number[];
}

const WORK_POSITIONS = [.32, .7, .4, .64, .29, .72, .42, .66];

// Share the reveal's ease-out rhythm while leaving time for the final contacts.
function timeAtCadence(cadence: number): number {
  if (cadence === 0 || cadence === 1) return cadence;
  let lower = 0;
  let upper = 1;
  for (let iteration = 0; iteration < 20; iteration += 1) {
    const fraction = (lower + upper) / 2;
    const progress = 1 - (1 - fraction) ** 3;
    if ((fraction + progress) / 2 < cadence) lower = fraction;
    else upper = fraction;
  }
  return (lower + upper) / 2;
}

/** Fit the work into the reveal's clock; tiny advances need just one contact. */
export function planRevealWorker(progress: number, durationMs: number): RevealWorkStation[] {
  const target = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  if (target === 0 || !Number.isFinite(durationMs) || durationMs <= 0) return [];

  const hits = Math.min(8, Math.max(1, Math.round(target * .12)));
  const pointCount = Math.min(8, hits, Math.ceil(target / 12.5));
  const hitsPerPoint = Math.floor(hits / pointCount);
  const remainingHits = hits % pointCount;

  return Array.from({ length: pointCount }, (_, index) => {
    const pointHits = hitsPerPoint + (index < remainingHits ? 1 : 0);
    const startMs = timeAtCadence(index / pointCount) * durationMs;
    const endFraction = timeAtCadence((index + 1) / pointCount);
    const spanMs = endFraction * durationMs - startMs;
    const frontierVelocity = 3 * target * (1 - endFraction) ** 2 / durationMs;
    const travelMs = index === pointCount - 1 ? 0
      : Math.min(spanMs * .25, Math.max(40, Math.min(75, 75 / (1 + frontierVelocity * 4))));
    const workMs = spanMs - travelMs;
    const x = pointCount === 1 ? .43 : WORK_POSITIONS[index];
    return {
      x,
      facing: x < .5 ? 1 : -1,
      startMs,
      workMs,
      travelMs,
      hitsMs: Array.from({ length: pointHits }, (_hit, hit) => startMs + workMs * (hit + 1) / (pointHits + 1)),
    };
  });
}

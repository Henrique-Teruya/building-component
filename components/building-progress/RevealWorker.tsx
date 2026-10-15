"use client";

import { useMemo, type CSSProperties } from "react";
import type { ConstructionReveal } from "@/lib/building-progress/progress-animation";
import { planRevealWorker } from "@/lib/building-progress/reveal-worker-motion";
import { WorkerRobot } from "../blueprint/blueprint-scan/WorkerRobot";

interface RevealWorkerProps {
  reveal: ConstructionReveal;
  progress: number;
  width: number;
  height: number;
  onComplete: (runId: number) => void;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function interpolate(from: number, to: number, fraction: number): number {
  return from + (to - from) * fraction;
}

function rotate(degrees: number, x: number, y: number): string {
  const angle = degrees * Math.PI / 180;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return `matrix(${c},${s},${-s},${c},${x - c * x + s * y},${y - s * x - c * y})`;
}

// All work poses read the photo's clock. CSS only handles the brief final gesture.
export function RevealWorker({ reveal, progress, width, height, onComplete }: RevealWorkerProps) {
  const score = useMemo(() => planRevealWorker(reveal.targetProgress, reveal.durationMs), [reveal.targetProgress, reveal.durationMs]);
  if (width <= 0 || height <= 0 || score.length === 0) return null;

  const time = clamp(reveal.elapsedMs, 0, reveal.durationMs);
  const stationIndex = Math.max(0, score.findLastIndex((station) => time >= station.startMs));
  const station = score[stationIndex];
  const next = score[stationIndex + 1];
  const localMs = time - station.startMs;
  const travelling = reveal.phase === "working" && !!next && localMs > station.workMs;
  const travel = travelling ? clamp((localMs - station.workMs) / station.travelMs, 0, 1) : 0;
  const dart = 1 - (1 - travel) ** 3;
  const x = interpolate(station.x, next?.x ?? station.x, dart) * width;
  const facing = travelling && travel > .5 ? next.facing : station.facing;

  const robotHeight = Math.min(44, Math.max(30, width * .12), width * .3, height * .22);
  const scale = robotHeight / 29;
  // Keep the head and free hand visible when the frontier reaches an image edge.
  const frontierY = (1 - clamp(progress, 0, 100) / 100) * height;
  const y = clamp(frontierY + 11 * scale, 29 * scale, height - 1.5 * scale);

  const arrival = stationIndex > 0 ? Math.max(0, 1 - localMs / 60) : 0;
  const departure = next && !travelling ? clamp((localMs - station.workMs + 45) / 45, 0, 1) : 0;
  const poseX = travelling ? interpolate(1.08, .96, travel) : 1 - .04 * arrival + .08 * departure;
  const poseY = travelling ? interpolate(.84, 1.04, travel) : 1 + .04 * arrival - .16 * departure;
  const hitSpacing = station.workMs / (station.hitsMs.length + 1);
  const anticipation = Math.min(72, hitSpacing * .45);
  const recovery = Math.min(76, hitSpacing * .45);
  const currentHit = station.hitsMs.find((hit) => time >= hit - anticipation && time <= hit + recovery);
  const hitTime = currentHit === undefined ? undefined : time - currentHit;

  let armAngle = -12;
  if (reveal.phase === "working" && !travelling && hitTime !== undefined) {
    if (hitTime < -anticipation * .5) {
      armAngle = interpolate(-12, -48, (hitTime + anticipation) / (anticipation * .5));
    } else if (hitTime < 0) {
      armAngle = interpolate(-48, 0, (hitTime + anticipation * .5) / (anticipation * .5));
    } else if (hitTime <= 12) {
      armAngle = 0;
    } else {
      armAngle = interpolate(0, -12, clamp((hitTime - 12) / Math.max(1, recovery - 12), 0, 1));
    }
  }
  const reaction = reveal.phase === "working" && !travelling && hitTime !== undefined && hitTime >= 0
    ? Math.max(0, 1 - Math.abs(hitTime - 12) / 58) : 0;
  const spark = reveal.phase === "working" && !travelling && hitTime !== undefined && hitTime >= 0
    ? Math.max(0, 1 - hitTime / 76) : 0;
  const trail = travelling ? Math.sin(travel * Math.PI) * .28 : 0;
  const direction = next && next.x > station.x ? 1 : -1;
  const style = {
    "--reveal-arm": rotate(armAngle, 6, -12),
    "--reveal-head": rotate(2 * reaction, 0, -21),
    "--reveal-torso": `translate(${.25 * reaction}px,${.6 * reaction}px)`,
    "--reveal-confirm-ms": `${reveal.confirmMs}ms`,
    "--reveal-exit-ms": `${reveal.exitMs}ms`,
  } as CSSProperties;

  return (
    <svg
      className="skr-reveal-worker"
      data-phase={reveal.phase}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={style}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === "skr-reveal-worker-finish") {
          onComplete(reveal.runId);
        }
      }}
    >
      <style>{REVEAL_CSS}</style>
      <path
        d={`M${x - direction * 18 * scale} ${y - 15 * scale}h${direction * 12 * scale}`}
        stroke="var(--brand-primary)" strokeWidth={1.2 * scale} strokeLinecap="round" opacity={trail}
      />
      <g transform={`translate(${x + 20 * scale * facing} ${y - 11 * scale}) scale(${scale})`} opacity={spark * .6}>
        <path d="M-3-1l-1.4-1.6M0-3v-2M3-1l1.4-1.6" stroke="var(--brand-primary)" strokeWidth=".8" strokeLinecap="round" />
      </g>
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
        <g transform={`scale(${poseX} ${poseY})`}><WorkerRobot /></g>
      </g>
    </svg>
  );
}

const REVEAL_CSS = `
  .skr-reveal-worker { display:block; width:100%; height:100%; overflow:visible; pointer-events:none; }
  .skr-reveal-worker .skr-worker-arm { transform:var(--reveal-arm); }
  .skr-reveal-worker .skr-worker-head { transform:var(--reveal-head); }
  .skr-reveal-worker .skr-worker-torso { transform:var(--reveal-torso); }
  .skr-reveal-worker[data-phase="confirming"] {
    animation:skr-reveal-worker-finish var(--reveal-exit-ms) ease-in var(--reveal-confirm-ms) both;
  }
  .skr-reveal-worker[data-phase="confirming"] .skr-worker-arm {
    animation:skr-reveal-worker-lower-hammer var(--reveal-confirm-ms) ease-out both;
  }
  .skr-reveal-worker[data-phase="confirming"] .skr-worker-support-arm {
    animation:skr-reveal-worker-thumbs-up var(--reveal-confirm-ms) cubic-bezier(.2,.8,.3,1) both;
  }
  .skr-reveal-worker[data-phase="confirming"] .skr-worker-head {
    animation:skr-reveal-worker-nod var(--reveal-confirm-ms) ease-in-out both;
  }
  .skr-reveal-worker[data-phase="confirming"] .skr-worker-thumb-hand {
    animation:skr-reveal-worker-show-thumb var(--reveal-confirm-ms) linear both;
  }
  .skr-reveal-worker[data-phase="confirming"] .skr-worker-rest-hand {
    animation:skr-reveal-worker-hide-hand var(--reveal-confirm-ms) linear both;
  }
  @keyframes skr-reveal-worker-finish { from { opacity:1; } to { opacity:0; } }
  @keyframes skr-reveal-worker-lower-hammer {
    0% { transform:${rotate(-12, 6, -12)}; }
    55%,100% { transform:${rotate(50, 6, -12)}; }
  }
  @keyframes skr-reveal-worker-thumbs-up {
    0% { transform:none; }
    60%,100% { transform:${rotate(95, -6.7, -11.1)}; }
  }
  @keyframes skr-reveal-worker-nod {
    0%,25%,100% { transform:none; }
    55% { transform:${rotate(7, 0, -21)}; }
    78% { transform:${rotate(-2, 0, -21)}; }
  }
  @keyframes skr-reveal-worker-show-thumb { 0%,30% { opacity:0; } 45%,100% { opacity:1; } }
  @keyframes skr-reveal-worker-hide-hand { 0%,30% { opacity:1; } 45%,100% { opacity:0; } }
  @media (prefers-reduced-motion:reduce) {
    .skr-reveal-worker { display:none; animation:none!important; }
    .skr-reveal-worker * { animation:none!important; }
  }
`;

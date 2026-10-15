"use client";

import { WorkerRobot } from "./WorkerRobot";

interface WorkStation {
  x: number;
  y: number;
  facing: 1 | -1;
  workMs: number;
  travelMs: number;
  hits: number[];
  marks: string[];
}

// Each hammer contact sits on an existing column or roof vertex in BlueprintScan.
const STATIONS: WorkStation[] = [
  { x: 93, y: 261, facing: 1, workMs: 900, travelMs: 110, hits: [220, 455, 690], marks: ["M113 246v5", "M113 251v5", "M113 256v5"] },
  { x: 189, y: 171, facing: -1, workMs: 780, travelMs: 120, hits: [210, 510], marks: ["M169 156v8", "M169 164v7"] },
  { x: 121, y: 126, facing: 1, workMs: 960, travelMs: 100, hits: [230, 480, 730], marks: ["M141 111v5", "M141 116v5", "M141 121v5"] },
  { x: 194, y: 66, facing: -1, workMs: 840, travelMs: 130, hits: [210, 470, 700], marks: ["M174 52v4", "M174 56v5", "M174 61v5"] },
];

let elapsed = 0;
const SCORE = STATIONS.map((station) => {
  const start = elapsed;
  elapsed += station.workMs + station.travelMs;
  return { ...station, start, departure: start + station.workMs, arrival: elapsed };
});
const CYCLE_MS = elapsed;
type Frame = [time: number, declarations: string];

function keyframes(name: string, samples: Frame[]): string {
  const unique = new Map(samples);
  return `@keyframes skr-worker-${name} { ${[...unique].sort(([a], [b]) => a - b).map(([time, declarations]) =>
    `${(Math.min(time, CYCLE_MS) / CYCLE_MS * 100).toFixed(4)}% { ${declarations} }`).join("\n")} }`;
}

// Explicit matrices rotate around a local SVG joint, independent of its viewBox.
function rotate(degrees: number, x: number, y: number): string {
  const angle = degrees * Math.PI / 180;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return `matrix(${c},${s},${-s},${c},${x - c * x + s * y},${y - s * x - c * y})`;
}

const move: Frame[] = [];
const facing: Frame[] = [];
const compress: Frame[] = [];
const arm: Frame[] = [[0, `transform:${rotate(-12, 6, -12)}`], [CYCLE_MS, `transform:${rotate(-12, 6, -12)}`]];
const torso: Frame[] = [[0, "transform:none"], [CYCLE_MS, "transform:none"]];
const head: Frame[] = [[0, "transform:none"], [CYCLE_MS, "transform:none"]];
const effects: string[] = [];

SCORE.forEach((station, index) => {
  const next = SCORE[(index + 1) % SCORE.length];
  move.push([station.start, `transform:translate(${station.x}px,${station.y}px)`],
    [station.departure, `transform:translate(${station.x}px,${station.y}px);animation-timing-function:cubic-bezier(.25,1,.5,1)`],
    [station.arrival, `transform:translate(${next.x}px,${next.y}px)`]);
  facing.push([station.start, `transform:scaleX(${station.facing})`]);
  compress.push([station.start, "transform:scale(.96,1.03)"], [station.start + 90, "transform:scale(1)"],
    [station.departure - 65, "transform:scale(1)"], [station.departure, "transform:scale(1.08,.84)"],
    [station.arrival, "transform:scale(.96,1.03)"]);

  station.hits.forEach((offset, hit) => {
    const time = station.start + offset;
    arm.push([time - 110, `transform:${rotate(-12, 6, -12)}`], [time - 55, `transform:${rotate(-52, 6, -12)}`],
      [time, "transform:matrix(1,0,0,1,0,0)"], [time + 18, "transform:matrix(1,0,0,1,0,0)"],
      [time + 85, `transform:${rotate(-12, 6, -12)}`]);
    torso.push([time - 20, "transform:none"], [time + 12, "transform:translate(.25px,.6px)"], [time + 80, "transform:none"]);
    head.push([time - 20, "transform:none"], [time + 18, `transform:${rotate(2, 0, -21)}`], [time + 95, "transform:none"]);
    effects.push(keyframes(`spark-${index}-${hit}`, [[0, "opacity:0;transform:scale(.65)"],
      [time - 1, "opacity:0;transform:scale(.65)"], [time + 12, "opacity:.65;transform:scale(1)"],
      [time + 105, "opacity:0;transform:scale(1.15)"], [CYCLE_MS, "opacity:0;transform:scale(.65)"]]));
    effects.push(keyframes(`mark-${index}-${hit}`, [[0, "opacity:0"], [time - 1, "opacity:0"],
      [time + 20, "opacity:.8"], [station.departure - 35, "opacity:.8"],
      [station.arrival, "opacity:0"], [CYCLE_MS, "opacity:0"]]));
  });
  effects.push(keyframes(`trail-${index}`, [[0, "opacity:0"], [station.departure - 1, "opacity:0"],
    [station.departure + station.travelMs * .4, "opacity:.25"], [station.arrival + 55, "opacity:0"],
    [CYCLE_MS, "opacity:0"]]));
});
facing.push([CYCLE_MS, "transform:scaleX(1)"]);

const MOTION_CSS = `
  .skr-scan-worker { opacity:1; transition:opacity 160ms ease-out; }
  .skr-scan-worker .skr-worker-moving { transform:translate(93px,261px); animation:skr-worker-move ${CYCLE_MS}ms linear infinite; }
  .skr-scan-worker .skr-worker-facing { animation:skr-worker-facing ${CYCLE_MS}ms step-end infinite; }
  .skr-scan-worker .skr-worker-pose { animation:skr-worker-compress ${CYCLE_MS}ms cubic-bezier(.25,1,.5,1) infinite; }
  .skr-scan-worker .skr-worker-arm { transform:${rotate(-12, 6, -12)}; animation:skr-worker-arm ${CYCLE_MS}ms linear infinite; }
  .skr-scan-worker .skr-worker-torso { animation:skr-worker-torso ${CYCLE_MS}ms ease-out infinite; }
  .skr-scan-worker .skr-worker-head { animation:skr-worker-head ${CYCLE_MS}ms ease-out infinite; }
  .skr-scan-worker .skr-worker-eyes { transform-origin:0 -21px; animation:skr-worker-eyes ${CYCLE_MS}ms linear infinite; }
  .skr-scan-worker .skr-worker-spark, .skr-scan-worker .skr-worker-mark, .skr-scan-worker .skr-worker-trail { opacity:0; }
  .skr-scan-worker .skr-worker-spark { transform-origin:0 0; }
  .skr-scan-worker[data-finishing="true"] { opacity:0; }
  .skr-scan-worker[data-finishing="true"] .skr-worker-moving,
  .skr-scan-worker[data-finishing="true"] .skr-worker-facing { animation-play-state:paused; }
  .skr-scan-worker[data-finishing="true"] .skr-worker-pose,
  .skr-scan-worker[data-finishing="true"] .skr-worker-torso,
  .skr-scan-worker[data-finishing="true"] .skr-worker-head,
  .skr-scan-worker[data-finishing="true"] .skr-worker-eyes { animation:none; transform:none; }
  .skr-scan-worker[data-finishing="true"] .skr-worker-arm { animation:none; transform:${rotate(-12, 6, -12)}; transition:transform 100ms ease-out; }
  .skr-scan-worker[data-finishing="true"] .skr-worker-spark,
  .skr-scan-worker[data-finishing="true"] .skr-worker-mark,
  .skr-scan-worker[data-finishing="true"] .skr-worker-trail { animation:none!important; opacity:0; }
  ${keyframes("move", move)}
  ${keyframes("facing", facing)}
  ${keyframes("compress", compress)}
  ${keyframes("arm", arm)}
  ${keyframes("torso", torso)}
  ${keyframes("head", head)}
  @keyframes skr-worker-eyes {
    0%,14%,18%,76%,80%,100% { transform:scaleY(1); }
    15.5% { transform:scaleY(.45); }
    78% { transform:scaleY(.8); }
  }
  ${effects.join("\n")}
  @media (prefers-reduced-motion:reduce) {
    .skr-scan-worker, .skr-scan-worker * { animation:none!important; transition:none!important; }
    .skr-scan-worker .skr-worker-moving { transform:translate(93px,261px); }
    .skr-scan-worker .skr-worker-facing, .skr-scan-worker .skr-worker-pose,
    .skr-scan-worker .skr-worker-torso, .skr-scan-worker .skr-worker-head,
    .skr-scan-worker .skr-worker-eyes { transform:none; }
    .skr-scan-worker .skr-worker-arm { transform:matrix(1,0,0,1,0,0); }
    .skr-scan-worker .skr-worker-spark, .skr-scan-worker .skr-worker-mark,
    .skr-scan-worker .skr-worker-trail { opacity:0; }
  }
`;

export function ScanWorker({ finishing = false }: { finishing?: boolean }) {
  return (
    <g className="skr-scan-worker" data-finishing={finishing} aria-hidden="true">
      {/* Native SVG styles keep this motion entirely inside the worker component. */}
      <style>{MOTION_CSS}</style>
      {SCORE.map((station, index) => {
        const next = SCORE[(index + 1) % SCORE.length];
        const distance = Math.hypot(next.x - station.x, next.y - station.y);
        const dx = (next.x - station.x) / distance;
        const dy = (next.y - station.y) / distance;
        const contactX = station.x + 20 * station.facing;
        const contactY = station.y - 11;
        return (
          <g key={index}>
            <path className="skr-worker-trail" d={`M${next.x - dx * 17} ${next.y - 15 - dy * 17}l${dx * 12} ${dy * 12}`}
              stroke="var(--brand-primary)" strokeWidth="1.4" strokeLinecap="round"
              style={{ animation: `skr-worker-trail-${index} ${CYCLE_MS}ms linear infinite` }} />
            {station.hits.map((_time, hit) => (
              <g key={hit}>
                <path className="skr-worker-mark" d={station.marks[hit]} stroke="var(--brand-primary)" strokeWidth="1.35" strokeLinecap="round"
                  style={{ animation: `skr-worker-mark-${index}-${hit} ${CYCLE_MS}ms linear infinite` }} />
                <g transform={`translate(${contactX} ${contactY})`}>
                  <g className="skr-worker-spark" style={{ animation: `skr-worker-spark-${index}-${hit} ${CYCLE_MS}ms linear infinite` }}>
                    <path d="M-3-1l-1.4-1.6M0-3v-2M3-1l1.4-1.6" stroke="var(--brand-primary)" strokeWidth=".8" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            ))}
          </g>
        );
      })}
      <g className="skr-worker-moving">
        <g className="skr-worker-facing">
          <g className="skr-worker-pose"><WorkerRobot /></g>
        </g>
      </g>
    </g>
  );
}

"use client";

import { useId } from "react";

const FLOOR_TOPS = Array.from({ length: 14 }, (_, index) => 66 + index * 15);
const WINDOW_BAYS = [92, 119, 147, 174];
const STRUCTURE_STRANDS = [-2.4, -1.6, -.8, 0, .8, 1.6, 2.4];

interface BlueprintScanProps {
  projectName?: string;
}

export function BlueprintScan({ projectName }: BlueprintScanProps) {
  const structureId = useId();

  return (
    <div className="blueprint-scan" role="status" aria-live="polite" aria-label={projectName ? `Preparando blueprint de ${projectName}` : "Preparando blueprint"}>
      <svg className="scan-drawing" viewBox="48 32 176 276" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true">
        <defs>
          {[86, 196].map((edge) => (
            <linearGradient key={edge} id={`${structureId}-${edge}`} gradientUnits="userSpaceOnUse" x1={edge - 3} y1="0" x2={edge + 3} y2="0">
              <stop offset="0" stopColor="var(--brand-primary)" />
              <stop offset=".45" stopColor="var(--brand-blue-100)" />
              <stop offset="1" stopColor="var(--brand-primary)" />
            </linearGradient>
          ))}
        </defs>
        <g className="drawing-guides" stroke="currentColor" strokeWidth="1">
          <path vectorEffect="non-scaling-stroke" d="M60 44v232M54 44h12M54 276h12M86 296h110M86 290v12M196 290v12" />
          <path vectorEffect="non-scaling-stroke" d="M78 44h-8M78 276h-8M86 284v-4M196 284v-4" />
          <path vectorEffect="non-scaling-stroke" d="M86 36h110M86 32v8M196 32v8M204 66h8M204 276h8M208 66v210" />
          {FLOOR_TOPS.map((y) => (
            <path key={y} vectorEffect="non-scaling-stroke" d={`M205 ${y + 15}h6`} />
          ))}
        </g>
        <g className="drawing-building" stroke="currentColor" strokeWidth=".85">
          <path vectorEffect="non-scaling-stroke" d="M86 66h110M108 66V44h66v22M108 52h66M116 44v8M166 44v8M86 66l22-22M174 44l22 22M76 276h132M82 280h120M113 66v210M141 66v210M169 66v210" />
          {FLOOR_TOPS.map((y) => (
            <g key={y}>
              <path vectorEffect="non-scaling-stroke" d={`M86 ${y + 15}h110M86 ${y + 13.5}h110`} />
              <path vectorEffect="non-scaling-stroke" d={`M89 ${y + 12}h22v3M171 ${y + 12}h22v3`} />
              {WINDOW_BAYS.map((x) => (
                <path key={x} vectorEffect="non-scaling-stroke" strokeWidth=".65" d={`M${x} ${y + 3}h18v9h-18zM${x + 9} ${y + 3}v9`} />
              ))}
            </g>
          ))}
        </g>
        <g className="drawing-structure" strokeWidth=".95" strokeLinecap="round">
          {[86, 196].map((edge) => (
            <g key={edge} stroke={`url(#${structureId}-${edge})`}>
              {STRUCTURE_STRANDS.map((offset) => (
                <path key={offset} vectorEffect="non-scaling-stroke" d={`M${edge + offset} 66v210`} />
              ))}
            </g>
          ))}
        </g>
        <g className="scan-line">
          <path vectorEffect="non-scaling-stroke" d="M52 0h168" stroke="currentColor" strokeWidth="1.5" />
        </g>
      </svg>
      <style jsx>{`
        .blueprint-scan {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          background: transparent;
          overflow: hidden;
        }
        .scan-drawing {
          position: absolute;
          inset: 36px;
          width: calc(100% - 72px);
          height: calc(100% - 72px);
          color: var(--brand-primary);
        }
        .drawing-guides { opacity: .2; }
        .drawing-building { opacity: .62; }
        .drawing-structure { opacity: .9; }
        .scan-line {
          animation: blueprint-sweep 3s linear infinite;
          transform: translateY(156px);
        }
        @keyframes blueprint-sweep {
          0% { transform: translateY(36px); opacity: 0; }
          10%, 85% { opacity: .75; }
          100% { transform: translateY(284px); opacity: 0; }
        }
        @media (max-width: 600px) {
          .blueprint-scan { min-height: 420px; }
          .scan-drawing { inset: 24px; width: calc(100% - 48px); height: calc(100% - 48px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scan-line { animation: none; opacity: .55; }
        }
      `}</style>
    </div>
  );
}

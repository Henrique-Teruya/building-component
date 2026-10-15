"use client";

import { useId } from "react";
import { ScanWorker } from "./ScanWorker";

const FLOOR_TOPS = Array.from({ length: 14 }, (_, index) => 66 + index * 15);
const WINDOW_BAYS = [92, 119, 147, 174];

interface BlueprintScanProps {
  projectName?: string;
  finishing?: boolean;
}

export function BlueprintScan({ projectName, finishing = false }: BlueprintScanProps) {
  const drawingId = useId();
  const bandId = `${drawingId}-band`;
  const maskId = `${drawingId}-mask`;
  const emphasisId = `${drawingId}-emphasis`;

  return (
    <div className="blueprint-scan" role="status" aria-live="polite" aria-label={projectName ? `Preparando blueprint de ${projectName}` : "Preparando blueprint"}>
      <svg className="scan-drawing" viewBox="48 32 176 276" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={bandId} gradientUnits="userSpaceOnUse" x1="0" y1="-68" x2="0" y2="4">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset=".6" stopColor="white" stopOpacity=".8" />
            <stop offset=".9" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="48" y="32" width="176" height="276">
            <g className="scan-sweep">
              <rect x="48" y="-68" width="176" height="72" fill={`url(#${bandId})`} />
            </g>
          </mask>
          <filter id={emphasisId} filterUnits="userSpaceOnUse" x="46" y="30" width="180" height="280" colorInterpolationFilters="sRGB">
            <feOffset in="SourceAlpha" dx=".12" dy=".12" result="edge-forward" />
            <feOffset in="SourceAlpha" dx="-.12" dy="-.12" result="edge-back" />
            <feMerge result="line-alpha">
              <feMergeNode in="SourceAlpha" />
              <feMergeNode in="edge-forward" />
              <feMergeNode in="edge-back" />
            </feMerge>
            <feFlood floodColor="var(--brand-contrast, #0057ad)" result="line-color" />
            <feComposite in="line-color" in2="line-alpha" operator="in" />
          </filter>
        </defs>
        <g id={drawingId}>
          <g className="drawing-guides" stroke="currentColor" strokeWidth="1">
            <path vectorEffect="non-scaling-stroke" d="M60 44v232M54 44h12M54 276h12M86 296h110M86 290v12M196 290v12" />
            <path vectorEffect="non-scaling-stroke" d="M78 44h-8M78 276h-8M86 284v-4M196 284v-4" />
            <path vectorEffect="non-scaling-stroke" d="M86 36h110M86 32v8M196 32v8M204 66h8M204 276h8M208 66v210" />
            {FLOOR_TOPS.map((y) => (
              <path key={y} vectorEffect="non-scaling-stroke" d={`M205 ${y + 15}h6`} />
            ))}
          </g>
          <g className="drawing-building" stroke="currentColor" strokeWidth=".85">
            <path vectorEffect="non-scaling-stroke" d="M86 66h110v210M86 66v210M108 66V44h66v22M108 52h66M116 44v8M166 44v8M86 66l22-22M174 44l22 22M76 276h132M82 280h120M113 66v210M141 66v210M169 66v210" />
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
        </g>
        <g className="scan-emphasis" mask={`url(#${maskId})`} opacity=".72">
          <use href={`#${drawingId}`} filter={`url(#${emphasisId})`} />
        </g>
        <ScanWorker finishing={finishing} />
        <g className="scan-line scan-sweep">
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
        .scan-sweep {
          animation: blueprint-sweep 3s linear infinite;
          transform: translateY(20px);
        }
        .scan-line { opacity: .75; }
        @keyframes blueprint-sweep {
          from { transform: translateY(20px); }
          to { transform: translateY(370px); }
        }
        @media (max-width: 600px) {
          .blueprint-scan { min-height: 420px; }
          .scan-drawing { inset: 24px; width: calc(100% - 48px); height: calc(100% - 48px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scan-sweep { animation: none; }
          .scan-emphasis { display: none; }
          .scan-line {
            transform: translateY(156px);
            opacity: .55;
          }
        }
      `}</style>
    </div>
  );
}

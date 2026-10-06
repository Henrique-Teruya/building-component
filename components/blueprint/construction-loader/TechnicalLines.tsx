"use client";

import React from "react";

interface TechnicalLinesProps {
  step: number; // Current worker iteration count (accumulates lines)
}

export const TechnicalLines: React.FC<TechnicalLinesProps> = ({ step }) => {
  return (
    <svg
      className="technical-drafting-lines"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="loaderSubtleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.08)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* Layer 1: Background technical CAD grid (fade-in on step >= 1) */}
      <rect
        width="1000"
        height="1000"
        fill="url(#loaderSubtleGrid)"
        className={`fade-line ${step >= 1 ? "is-visible" : ""}`}
        style={{ opacity: step >= 1 ? 0.35 : 0 }}
      />

      {/* Architectural Alignment Lines created by the worker as they visit spots */}
      <g stroke="#00e5ff" strokeDasharray="6 6" fill="none">
        {/* Step 1: Base foundation datum */}
        <line
          x1="100"
          y1="820"
          x2="900"
          y2="820"
          strokeWidth="1.2"
          className={`fade-line ${step >= 1 ? "is-visible" : ""}`}
        />

        {/* Step 2: Main vertical column axis */}
        <line
          x1="300"
          y1="150"
          x2="300"
          y2="850"
          strokeWidth="1"
          className={`fade-line ${step >= 2 ? "is-visible" : ""}`}
        />

        {/* Step 3: Lower floor slab guides */}
        <line
          x1="200"
          y1="640"
          x2="800"
          y2="640"
          strokeWidth="1"
          className={`fade-line ${step >= 3 ? "is-visible" : ""}`}
        />

        {/* Step 4: Secondary vertical column axis */}
        <line
          x1="700"
          y1="150"
          x2="700"
          y2="850"
          strokeWidth="1"
          className={`fade-line ${step >= 4 ? "is-visible" : ""}`}
        />

        {/* Step 5: Upper floors slab guides */}
        <line
          x1="200"
          y1="380"
          x2="800"
          y2="380"
          strokeWidth="1"
          className={`fade-line ${step >= 5 ? "is-visible" : ""}`}
        />

        {/* Step 6: Crown & Penthouse roof angle guides */}
        <line
          x1="250"
          y1="220"
          x2="750"
          y2="220"
          strokeWidth="1.4"
          className={`fade-line ${step >= 6 ? "is-visible" : ""}`}
        />
        <line
          x1="500"
          y1="120"
          x2="500"
          y2="880"
          strokeWidth="1"
          strokeDasharray="4 4"
          className={`fade-line ${step >= 6 ? "is-visible" : ""}`}
        />
      </g>

      {/* Crosshair coordinate markers left by the worker */}
      {step >= 1 && <circle cx="300" cy="820" r="3" fill="#00e5ff" opacity="0.6" />}
      {step >= 2 && <circle cx="300" cy="480" r="3" fill="#00e5ff" opacity="0.6" />}
      {step >= 3 && <circle cx="700" cy="640" r="3" fill="#00e5ff" opacity="0.6" />}
      {step >= 4 && <circle cx="700" cy="380" r="3" fill="#00e5ff" opacity="0.6" />}
      {step >= 5 && <circle cx="500" cy="220" r="4" fill="#00e5ff" opacity="0.8" />}

      <style jsx>{`
        .technical-drafting-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 25;
        }

        .fade-line {
          opacity: 0;
          transition: opacity 600ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .fade-line.is-visible {
          opacity: 0.22;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-line {
            transition: none;
            opacity: 0.22;
          }
        }
      `}</style>
    </svg>
  );
};

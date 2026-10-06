"use client";

import React from "react";

interface ProgressOverlayProps {
  progress: number; // 0 to 100
  realPhotoUrl?: string;
  showPhotoFill?: boolean;
  showLaserIndicator?: boolean;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  progress,
  realPhotoUrl,
  showPhotoFill = true,
  showLaserIndicator = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="progress-overlay-root"
      aria-label={`Progresso: ${clampedProgress}%`}
      role="region"
    >
      {/* Real photo revealed up to progress % */}
      {showPhotoFill && realPhotoUrl && (
        <div
          className="progress-built-reveal"
          style={{
            clipPath: `inset(${100 - clampedProgress}% 0 0 0)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={realPhotoUrl}
            alt=""
            className="progress-built-photo"
          />
          <div className="progress-built-tint" />
        </div>
      )}

      {/* Luminous Architectural Construction Hatch */}
      <div
        className="progress-built-hatch"
        style={{
          height: `${clampedProgress}%`,
        }}
      >
        <div className="hatch-pattern" />
        <div className="hatch-glow-edge" />
      </div>

      {/* Minimalist Laser Datum Line */}
      {showLaserIndicator && clampedProgress > 0 && clampedProgress < 100 && (
        <div
          className="progress-laser-line"
          style={{
            bottom: `${clampedProgress}%`,
          }}
        >
          <div className="laser-beam" />
          <div className="laser-badge">
            <span className="laser-dot" />
            <span className="laser-pct">{clampedProgress}%</span>
          </div>
          <div className="laser-beam" />
        </div>
      )}

      <style jsx>{`
        .progress-overlay-root {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 10;
        }

        .progress-built-reveal {
          position: absolute;
          inset: 0;
          transition: clip-path var(--duration-progress) var(--ease-standard);
        }

        .progress-built-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        .progress-built-tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 113, 227, 0.22) 0%,
            rgba(0, 229, 255, 0.12) 60%,
            rgba(0, 229, 255, 0.35) 100%
          );
          mix-blend-mode: screen;
        }

        .progress-built-hatch {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          transition: height var(--duration-progress) var(--ease-standard);
          background: linear-gradient(
            to top,
            rgba(0, 113, 227, 0.18) 0%,
            rgba(0, 229, 255, 0.08) 75%,
            rgba(0, 229, 255, 0.2) 100%
          );
        }

        .hatch-pattern {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(0, 229, 255, 0.04) 0px,
            rgba(0, 229, 255, 0.04) 8px,
            transparent 8px,
            transparent 16px
          );
        }

        .hatch-glow-edge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #00e5ff;
          box-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.7);
        }

        .progress-laser-line {
          position: absolute;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          transform: translateY(50%);
          transition: bottom var(--duration-progress) var(--ease-standard);
          z-index: 20;
          padding: 0 8px;
        }

        .laser-beam {
          flex: 1;
          height: 1.5px;
          background: linear-gradient(
            90deg,
            rgba(0, 229, 255, 0.15) 0%,
            #00e5ff 30%,
            #ffffff 50%,
            #00e5ff 70%,
            rgba(0, 229, 255, 0.15) 100%
          );
          box-shadow: 0 0 8px #00e5ff;
        }

        .laser-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: rgba(10, 25, 47, 0.9);
          border: 1px solid #00e5ff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 229, 255, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          margin: 0 8px;
        }

        .laser-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 6px #00e5ff;
        }

        .laser-pct {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-built-reveal,
          .progress-built-hatch,
          .progress-laser-line {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

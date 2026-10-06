"use client";

import React, { useId } from "react";
import { BuildingPhase } from "@/lib/building-progress/types";
import { CheckCircle2, Clock } from "lucide-react";

interface ProgressOverlayProps {
  progress: number; // 0 to 100
  phases?: BuildingPhase[];
  realPhotoUrl?: string;
  showPhotoFill?: boolean; // If true, reveals photo in the built section
  showLaserIndicator?: boolean;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  progress,
  phases,
  realPhotoUrl,
  showPhotoFill = true,
  showLaserIndicator = true,
}) => {
  const gradientId = useId();
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="progress-overlay-root"
      aria-label={`Progresso da obra: ${clampedProgress}%`}
      role="region"
    >
      {/* Optional Real Photo Revealed from ground up to progress % */}
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
            alt="Empreendimento executado até o nível atual"
            className="progress-built-photo"
          />
          {/* Subtle architectural overlay tint to bind with blueprint */}
          <div className="progress-built-tint" />
        </div>
      )}

      {/* Luminous Architectural Construction Hatch / Gradient Layer */}
      <div
        className="progress-built-hatch"
        style={{
          height: `${clampedProgress}%`,
        }}
      >
        <div className="hatch-pattern" />
        <div className="hatch-glow-edge" />
      </div>

      {/* Dynamic Laser Guide Line (Horizontal construction datum) */}
      {showLaserIndicator && clampedProgress > 0 && clampedProgress < 100 && (
        <div
          className="progress-laser-line"
          style={{
            bottom: `${clampedProgress}%`,
          }}
        >
          {/* Left Ruler Tick */}
          <div className="laser-tick laser-tick-left">
            <span className="tick-dot" />
            <span className="tick-label">NÍVEL EXECUÇÃO</span>
          </div>

          {/* Central Laser Beam */}
          <div className="laser-beam" />

          {/* Floating Laser Level Badge */}
          <div className="laser-badge">
            <span className="laser-pulse" />
            <span className="laser-text">{clampedProgress}% CONCLUÍDO</span>
          </div>

          {/* Right Ruler Tick */}
          <div className="laser-tick laser-tick-right">
            <span className="tick-label">ELEVAÇÃO {Math.round(clampedProgress * 0.64)}m</span>
            <span className="tick-dot" />
          </div>
        </div>
      )}

      {/* 100% Completed Stamp when fully finished */}
      {clampedProgress === 100 && (
        <div className="progress-completed-stamp">
          <CheckCircle2 size={16} />
          <span>OBRA 100% CONCLUÍDA &amp; ENTREGUE</span>
        </div>
      )}

      {/* 0% Just Started Stamp */}
      {clampedProgress === 0 && (
        <div className="progress-starting-stamp">
          <Clock size={15} />
          <span>INÍCIO DAS OBRAS • CANTEIRO INSTALADO</span>
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
          height: 3px;
          background: #00e5ff;
          box-shadow: 0 0 12px #00e5ff, 0 0 24px rgba(0, 229, 255, 0.8);
        }

        .progress-laser-line {
          position: absolute;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translateY(50%);
          transition: bottom var(--duration-progress) var(--ease-standard);
          z-index: 20;
          padding: 0 12px;
        }

        .laser-beam {
          flex: 1;
          height: 1.5px;
          background: linear-gradient(
            90deg,
            rgba(0, 229, 255, 0.2) 0%,
            #00e5ff 30%,
            #ffffff 50%,
            #00e5ff 70%,
            rgba(0, 229, 255, 0.2) 100%
          );
          box-shadow: 0 0 8px #00e5ff;
        }

        .laser-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background: rgba(13, 37, 76, 0.95);
          border: 1px solid #00e5ff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 12px rgba(0, 229, 255, 0.4);
          margin: 0 8px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          white-space: nowrap;
        }

        .laser-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 6px #00e5ff;
          animation: pulse-laser 1.2s infinite ease-in-out;
        }

        .laser-text {
          font-family: var(--font);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #ffffff;
        }

        .laser-tick {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 9.5px;
          font-weight: 600;
          color: #00e5ff;
          background: rgba(10, 25, 47, 0.85);
          padding: 2px 8px;
          border-radius: 4px;
          border: 0.5px solid rgba(0, 229, 255, 0.3);
          backdrop-filter: blur(4px);
        }

        .tick-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00e5ff;
        }

        .progress-completed-stamp {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          background: rgba(16, 126, 62, 0.9);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(16, 126, 62, 0.4);
          backdrop-filter: blur(8px);
        }

        .progress-starting-stamp {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          background: rgba(13, 37, 76, 0.9);
          border: 1px solid rgba(0, 229, 255, 0.4);
          color: #00e5ff;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }

        @keyframes pulse-laser {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @media (max-width: 600px) {
          .laser-tick {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-built-reveal,
          .progress-built-hatch,
          .progress-laser-line {
            transition: none !important;
          }
          .laser-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

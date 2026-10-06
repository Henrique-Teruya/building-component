"use client";

import React, { useState, useEffect } from "react";
import { Worker } from "./Worker";
import { DustParticles } from "./DustParticles";
import { TechnicalLines } from "./TechnicalLines";

interface ConstructionLoaderProps {
  imageUrl: string;
  active: boolean;
  finishing?: boolean;
}

// Predefined architectural points on the building (percentage coordinates)
const WORKER_SPOTS = [
  { x: 30, y: 80 }, // Fundação / Base
  { x: 68, y: 64 }, // Andares baixos
  { x: 32, y: 48 }, // Prumada central
  { x: 66, y: 36 }, // Pavimentos superiores
  { x: 50, y: 22 }, // Cobertura / Platibanda
  { x: 48, y: 55 }, // Fachada central
];

export const ConstructionLoader: React.FC<ConstructionLoaderProps> = ({
  imageUrl,
  active,
  finishing = false,
}) => {
  const [spotIndex, setSpotIndex] = useState(0);
  const [workerVisible, setWorkerVisible] = useState(false);
  const [dustActive, setDustActive] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Status message based on elapsed duration (no fake percentage)
  const statusMessage =
    elapsedSeconds < 2
      ? "Preparando visualização…"
      : elapsedSeconds < 6
      ? "Criando planejamento técnico…"
      : "Finalizando detalhes arquitetônicos…";

  // Timer for elapsed seconds
  useEffect(() => {
    if (!active) {
      setElapsedSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  // Teleportation sequence loop:
  // Spot appears -> Dust puff -> Worker visible ~700ms -> Fade out -> Next spot
  useEffect(() => {
    if (!active) {
      setWorkerVisible(false);
      setDustActive(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const runCycle = () => {
      if (!isMounted) return;

      // 1. Trigger dust and show worker
      setDustActive(true);
      setWorkerVisible(true);

      // 2. Hide dust after puff
      setTimeout(() => {
        if (isMounted) setDustActive(false);
      }, 500);

      // 3. Worker stays ~700ms, then fades out
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setWorkerVisible(false);

        // 4. Pause ~250ms, then advance to next spot
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          setSpotIndex((prev) => (prev + 1) % WORKER_SPOTS.length);
          setStepCount((prev) => Math.min(6, prev + 1));
          runCycle();
        }, 250);
      }, 700);
    };

    runCycle();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [active]);

  const currentSpot = WORKER_SPOTS[spotIndex];

  return (
    <div className={`construction-loader-root ${finishing ? "is-finishing" : ""}`}>
      {/* Central Photograph (Permanence of original image during loading) */}
      <div className="loader-photo-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Fotografia em conversão técnica"
          className="loader-base-photo"
        />

        {/* Blueprint tint slowly building */}
        <div
          className="loader-blueprint-wash"
          style={{ opacity: Math.min(0.45, 0.1 + stepCount * 0.06) }}
        />

        {/* Technical drafting lines progressively created by the worker */}
        <TechnicalLines step={stepCount} />

        {/* Dust Particles at current spot */}
        <DustParticles
          x={currentSpot.x}
          y={currentSpot.y}
          active={dustActive && !finishing}
        />

        {/* The Engineer Silhouette Teleporting Across Floors */}
        {!finishing && (
          <Worker
            x={currentSpot.x}
            y={currentSpot.y}
            visible={workerVisible}
          />
        )}
      </div>

      {/* Discreet Minimalist Status Text Below Viewer */}
      <div className="loader-status-bar" role="status" aria-live="polite">
        <span className="loader-status-dot" />
        <span className="loader-status-text">{statusMessage}</span>
      </div>

      <style jsx>{`
        .construction-loader-root {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: var(--radius-card);
          overflow: hidden;
          transition: opacity 400ms ease;
        }

        .construction-loader-root.is-finishing {
          opacity: 0.85;
        }

        .loader-photo-stage {
          position: relative;
          width: 100%;
          min-height: 520px;
          height: 560px;
          border-radius: var(--radius-card);
          background: #0a192f;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-base-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        .loader-blueprint-wash {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle,
            rgba(0, 113, 227, 0.25) 0%,
            rgba(10, 25, 47, 0.65) 100%
          );
          mix-blend-mode: color;
          pointer-events: none;
          transition: opacity 800ms ease;
        }

        .loader-status-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
        }

        .loader-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand-primary);
          animation: pulse-dot 1.2s infinite ease-in-out;
        }

        .loader-status-text {
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @media (max-width: 600px) {
          .loader-photo-stage {
            height: 420px;
            min-height: 400px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-status-dot {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

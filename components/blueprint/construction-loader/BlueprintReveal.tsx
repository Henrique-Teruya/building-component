"use client";

import React, { useState, useEffect } from "react";

interface BlueprintRevealProps {
  originalPhotoUrl: string;
  blueprintUrl: string;
  onRevealComplete: () => void;
  durationMs?: number; // Default 1400ms
}

export const BlueprintReveal: React.FC<BlueprintRevealProps> = ({
  originalPhotoUrl,
  blueprintUrl,
  onRevealComplete,
  durationMs = 1400,
}) => {
  const [revealProgress, setRevealProgress] = useState(0); // 0 to 100

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth easeInOutCubic
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setRevealProgress(eased * 100);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setTimeout(onRevealComplete, 120);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [durationMs, onRevealComplete]);

  return (
    <div className="blueprint-reveal-stage" aria-hidden="true">
      {/* Base Layer: Original Photograph */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={originalPhotoUrl}
        alt=""
        className="reveal-img base-photo"
      />

      {/* Top Layer: Blueprint revealed from top to bottom via clip-path */}
      <div
        className="reveal-blueprint-curtain"
        style={{
          clipPath: `inset(0 0 ${100 - revealProgress}% 0)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blueprintUrl}
          alt=""
          className="reveal-img blueprint-photo"
        />

        {/* Luminous Architectural Laser Sweep Line at the cut boundary */}
        <div
          className="reveal-laser-edge"
          style={{
            top: `${revealProgress}%`,
          }}
        />
      </div>

      <style jsx>{`
        .blueprint-reveal-stage {
          position: relative;
          width: 100%;
          min-height: 520px;
          height: 560px;
          border-radius: var(--radius-card);
          background: #0a192f;
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }

        .reveal-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        .reveal-blueprint-curtain {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .reveal-laser-edge {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: #00e5ff;
          box-shadow: 0 0 16px #00e5ff, 0 0 32px rgba(0, 229, 255, 0.8);
          transform: translateY(-50%);
          z-index: 20;
        }

        @media (max-width: 600px) {
          .blueprint-reveal-stage {
            height: 420px;
            min-height: 400px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-laser-edge {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

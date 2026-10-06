"use client";

import React from "react";

interface DustParticlesProps {
  x: number; // percentage
  y: number; // percentage
  active: boolean;
}

export const DustParticles: React.FC<DustParticlesProps> = ({ x, y, active }) => {
  if (!active) return null;

  return (
    <div
      className="dust-particles-cluster"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      aria-hidden="true"
    >
      <div className="dust-puff puff-1" />
      <div className="dust-puff puff-2" />
      <div className="dust-puff puff-3" />
      <div className="dust-puff puff-4" />

      <style jsx>{`
        .dust-particles-cluster {
          position: absolute;
          width: 60px;
          height: 60px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 35;
        }

        .dust-puff {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0, 229, 255, 0.22) 0%,
            rgba(0, 113, 227, 0.12) 60%,
            transparent 80%
          );
          filter: blur(5px);
          animation: puff-disperse 700ms ease-out forwards;
        }

        .puff-1 {
          width: 32px;
          height: 32px;
          top: 8px;
          left: 4px;
          animation-delay: 40ms;
        }

        .puff-2 {
          width: 24px;
          height: 24px;
          bottom: 6px;
          right: 8px;
          animation-delay: 80ms;
        }

        .puff-3 {
          width: 40px;
          height: 40px;
          top: 10px;
          right: 2px;
          animation-delay: 120ms;
        }

        .puff-4 {
          width: 20px;
          height: 20px;
          bottom: 12px;
          left: 10px;
          animation-delay: 160ms;
        }

        @keyframes puff-disperse {
          0% {
            opacity: 0;
            transform: scale(0.6) translateY(2px);
          }
          30% {
            opacity: 0.28;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(1.3) translateY(-6px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dust-particles-cluster {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

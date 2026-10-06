"use client";

import React, { useEffect, useState } from "react";

interface BlueprintSkeletonProps {
  projectName?: string;
}

const LOADING_STEPS = [
  "Preparando visualização técnica da obra…",
  "Analisando volumetria e geometria arquitetônica…",
  "Identificando prumadas, pavimentos e fachada…",
  "Renderizando blueprint técnico canônico…",
];

export const BlueprintSkeleton: React.FC<BlueprintSkeletonProps> = ({
  projectName = "Empreendimento",
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="blueprint-skeleton"
      role="status"
      aria-live="polite"
      aria-label="Preparando blueprint arquitetônico"
    >
      {/* Blueprint Grid Canvas Background */}
      <div className="skeleton-grid-layer" />

      {/* Laser Scanning Line */}
      <div className="skeleton-scanner" />

      {/* Architectural Outlines Placeholder */}
      <div className="skeleton-building-outline">
        <div className="skeleton-crown" />
        <div className="skeleton-tower">
          <div className="skeleton-floor-line" style={{ top: "15%" }} />
          <div className="skeleton-floor-line" style={{ top: "30%" }} />
          <div className="skeleton-floor-line" style={{ top: "45%" }} />
          <div className="skeleton-floor-line" style={{ top: "60%" }} />
          <div className="skeleton-floor-line" style={{ top: "75%" }} />
          <div className="skeleton-floor-line" style={{ top: "90%" }} />
        </div>
      </div>

      {/* Informative Floating Card */}
      <div className="skeleton-status-card">
        <div className="skeleton-badge">
          <span className="skeleton-pulse-dot" />
          <span>SKR IA ARQUITETURA</span>
        </div>
        <h4 className="skeleton-title">{projectName}</h4>
        <p className="skeleton-message">{LOADING_STEPS[stepIndex]}</p>
        <div className="skeleton-progress-bar">
          <div className="skeleton-progress-fill" />
        </div>
      </div>

      <style jsx>{`
        .blueprint-skeleton {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          border-radius: var(--radius-card);
          background: #0a192f;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-card);
        }

        .skeleton-grid-layer {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 163, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 163, 255, 0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.8;
        }

        .skeleton-scanner {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #00e5ff 20%,
            #ffffff 50%,
            #00e5ff 80%,
            transparent 100%
          );
          box-shadow: 0 0 16px #00e5ff, 0 0 32px rgba(0, 229, 255, 0.6);
          animation: scan 2.8s ease-in-out infinite alternate;
          z-index: 5;
        }

        .skeleton-building-outline {
          position: absolute;
          bottom: 40px;
          width: 44%;
          height: 72%;
          opacity: 0.45;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .skeleton-crown {
          width: 50%;
          height: 12%;
          border: 1.5px dashed rgba(0, 229, 255, 0.6);
          border-bottom: none;
        }

        .skeleton-tower {
          position: relative;
          width: 100%;
          height: 88%;
          border: 1.5px solid rgba(0, 229, 255, 0.6);
          background: rgba(0, 113, 227, 0.05);
        }

        .skeleton-floor-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0, 229, 255, 0.35);
        }

        .skeleton-status-card {
          position: relative;
          z-index: 10;
          background: rgba(13, 37, 76, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: var(--radius-control);
          padding: 24px 32px;
          max-width: 380px;
          text-align: center;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
        }

        .skeleton-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #00e5ff;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .skeleton-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff;
          animation: pulse 1.4s ease-in-out infinite;
        }

        .skeleton-title {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .skeleton-message {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 18px;
          line-height: 1.4;
          min-height: 36px;
        }

        .skeleton-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          overflow: hidden;
        }

        .skeleton-progress-fill {
          height: 100%;
          width: 40%;
          background: linear-gradient(90deg, #0071e3, #00e5ff);
          border-radius: 2px;
          animation: progress-loop 2s ease-in-out infinite;
        }

        @keyframes scan {
          0% { top: 6%; opacity: 0.3; }
          50% { opacity: 1; }
          100% { top: 92%; opacity: 0.3; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes progress-loop {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-scanner,
          .skeleton-pulse-dot,
          .skeleton-progress-fill {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

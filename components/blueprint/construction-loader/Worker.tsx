"use client";

import React from "react";

interface WorkerProps {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  visible: boolean;
}

export const Worker: React.FC<WorkerProps> = ({ x, y, visible }) => {
  return (
    <div
      className={`construction-worker-node ${visible ? "is-active" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      aria-hidden="true"
    >
      {/* Minimalist Vector Worker (Silhueta sofisticada com capacete de engenharia) */}
      <svg
        viewBox="0 0 32 38"
        className="worker-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="workerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#workerGlow)">
          {/* Capacete de Engenharia (Hardhat) */}
          <path
            d="M9 11C9 7.13401 12.134 4 16 4C19.866 4 23 7.13401 23 11V12H9V11Z"
            fill="#ffffff"
          />
          <path
            d="M7 12H25C25.5523 12 26 12.4477 26 13C26 13.5523 25.5523 14 25 14H7C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12Z"
            fill="#ffffff"
          />
          {/* Cabeça / Pescoço minimalista */}
          <circle cx="16" cy="15.5" r="2.5" fill="#00e5ff" opacity="0.9" />

          {/* Ombros e Torso com colete de obra minimalista */}
          <path
            d="M10 20C10 18.8954 10.8954 18 12 18H20C21.1046 18 22 18.8954 22 20V32H10V20Z"
            fill="#0071e3"
          />
          {/* Detalhes reflexivos sutis */}
          <line x1="12" y1="23" x2="20" y2="23" stroke="#00e5ff" stroke-width="1.2" />
          <line x1="12" y1="27" x2="20" y2="27" stroke="#ffffff" stroke-width="1.2" opacity="0.8" />

          {/* Ferramenta / Prancheta técnica na mão */}
          <rect x="23" y="24" width="5" height="7" rx="1" fill="#ffffff" opacity="0.9" />
          <line x1="24.5" y1="26" x2="26.5" y2="26" stroke="#0a192f" stroke-width="0.8" />
          <line x1="24.5" y1="28" x2="26.5" y2="28" stroke="#0a192f" stroke-width="0.8" />
        </g>
      </svg>

      <style jsx>{`
        .construction-worker-node {
          position: absolute;
          width: 32px;
          height: 38px;
          transform: translate(-50%, -50%) translateY(4px);
          opacity: 0;
          pointer-events: none;
          z-index: 40;
          transition: opacity 280ms cubic-bezier(0.25, 0.1, 0.25, 1),
                      transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .construction-worker-node.is-active {
          opacity: 1;
          transform: translate(-50%, -50%) translateY(0);
        }

        .worker-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
        }

        @media (prefers-reduced-motion: reduce) {
          .construction-worker-node {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

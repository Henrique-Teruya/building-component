"use client";

import React, { useState, useRef, useCallback } from "react";
import { ViewMode, BuildingPhase } from "@/lib/building-progress/types";
import { ProgressOverlay } from "./ProgressOverlay";
import { Maximize2, Minimize2, Compass, Layers } from "lucide-react";

interface BlueprintViewerProps {
  blueprintUrl: string;
  realPhotoUrl: string;
  progress: number;
  viewMode: ViewMode;
  phases?: BuildingPhase[];
  projectName?: string;
  buildingId: string;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({
  blueprintUrl,
  realPhotoUrl,
  progress,
  viewMode,
  phases,
  projectName = "SKR Empreendimento",
  buildingId,
  onViewModeChange,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 for compare slider
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Handle compare split-slider dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode !== "compare") return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || viewMode !== "compare") return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (viewMode !== "compare") return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`blueprint-viewer-frame ${isFullscreen ? "is-fullscreen" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      role="application"
      aria-label={`Visualizador Blueprint de ${projectName}`}
    >
      {/* CAD Technical Grid Canvas Background */}
      <div className="viewer-grid-underlay" />

      {/* Layer 1: Base Image (Blueprint or Photo based on mode) */}
      <div className="viewer-image-container">
        {viewMode === "photo" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={realPhotoUrl}
            alt={`Foto da obra ${projectName}`}
            className="viewer-image base-layer"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={blueprintUrl}
            alt={`Blueprint arquitetônico de ${projectName}`}
            className="viewer-image base-layer"
          />
        )}

        {/* Mode: Progress Overlay (Active during 'progress' mode) */}
        {viewMode === "progress" && (
          <ProgressOverlay
            progress={progress}
            phases={phases}
            realPhotoUrl={realPhotoUrl}
            showPhotoFill={true}
            showLaserIndicator={true}
          />
        )}

        {/* Mode: Interactive Compare Curtain Slider (Blueprint vs Real Photo) */}
        {viewMode === "compare" && (
          <div
            className="viewer-compare-overlay"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */ }
            <img
              src={realPhotoUrl}
              alt="Foto real da obra para comparação"
              className="viewer-image overlay-layer"
            />
          </div>
        )}
      </div>

      {/* Split Slider Handle (Only shown in 'compare' mode) */}
      {viewMode === "compare" && (
        <div
          className="compare-divider"
          style={{ left: `${sliderPosition}%` }}
          onPointerDown={handlePointerDown}
          role="slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Separador de comparação Blueprint e Foto Real"
          tabIndex={0}
        >
          <div className="compare-handle-knob">
            <span className="knob-arrow-left">‹</span>
            <span className="knob-arrow-right">›</span>
          </div>

          <div className="compare-pill pill-left">FOTO REAL</div>
          <div className="compare-pill pill-right">BLUEPRINT</div>
        </div>
      )}

      {/* Technical HUD Overlay: Compass & Meta */}
      <div className="viewer-hud-top">
        <div className="hud-badge">
          <Compass size={14} className="hud-compass-icon" />
          <span>NORTE TÉCNICO • CAD V4.2</span>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="hud-action-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            title="Tela cheia"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Technical HUD Overlay: Footer with Coordinates */}
      <div className="viewer-hud-bottom">
        <div className="hud-meta">
          <span className="hud-code">{buildingId.toUpperCase()}</span>
          <span className="hud-sep">•</span>
          <span className="hud-mode">MODO: {viewMode.toUpperCase()}</span>
          {viewMode === "progress" && (
            <>
              <span className="hud-sep">•</span>
              <span className="hud-highlight">{progress}% CONSTRUÍDO</span>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .blueprint-viewer-frame {
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
          user-select: none;
          touch-action: pan-y;
        }

        .blueprint-viewer-frame.is-fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          border-radius: 0;
          z-index: 9999;
        }

        .viewer-grid-underlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 163, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 163, 255, 0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }

        .viewer-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .viewer-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        .viewer-compare-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .compare-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
          cursor: ew-resize;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateX(-50%);
        }

        .compare-handle-knob {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #00e5ff;
          color: #0a192f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.4);
          gap: 2px;
        }

        .compare-pill {
          position: absolute;
          top: 20px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: rgba(10, 25, 47, 0.85);
          color: #00e5ff;
          border: 0.5px solid rgba(0, 229, 255, 0.4);
          white-space: nowrap;
          pointer-events: none;
          backdrop-filter: blur(4px);
        }

        .pill-left {
          right: 24px;
        }

        .pill-right {
          left: 24px;
        }

        .viewer-hud-top {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 25;
          pointer-events: none;
        }

        .hud-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          background: rgba(10, 25, 47, 0.8);
          border: 0.5px solid rgba(0, 229, 255, 0.3);
          backdrop-filter: blur(8px);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #00e5ff;
        }

        .hud-compass-icon {
          animation: spin-slow 40s linear infinite;
        }

        .hud-actions {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hud-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(10, 25, 47, 0.8);
          border: 0.5px solid rgba(0, 229, 255, 0.3);
          backdrop-filter: blur(8px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .hud-action-btn:hover {
          background: #0071e3;
          border-color: #00e5ff;
          transform: scale(1.05);
        }

        .viewer-hud-bottom {
          position: absolute;
          bottom: 14px;
          left: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 25;
          pointer-events: none;
        }

        .hud-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 6px;
          background: rgba(10, 25, 47, 0.8);
          border: 0.5px solid rgba(0, 229, 255, 0.2);
          backdrop-filter: blur(8px);
          font-family: monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
        }

        .hud-code {
          color: #00e5ff;
          font-weight: 700;
        }

        .hud-highlight {
          color: #ffffff;
          font-weight: 700;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .blueprint-viewer-frame {
            height: 420px;
            min-height: 400px;
          }
          .compare-pill {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

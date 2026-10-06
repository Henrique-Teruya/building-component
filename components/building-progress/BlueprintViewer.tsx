"use client";

import React, { useState, useRef, useCallback } from "react";
import { ViewMode } from "@/lib/building-progress/types";
import { ProgressOverlay } from "./ProgressOverlay";
import { Maximize2, Minimize2 } from "lucide-react";

interface BlueprintViewerProps {
  blueprintUrl: string;
  realPhotoUrl: string;
  progress: number;
  viewMode: ViewMode;
  buildingId?: string;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({
  blueprintUrl,
  realPhotoUrl,
  progress,
  viewMode,
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
      role="region"
      aria-label="Visualizador arquitetônico"
    >
      {/* Background CAD grid */}
      <div className="viewer-grid-underlay" />

      {/* Layer 1: Base Image (Blueprint or Photo based on mode) */}
      <div className="viewer-image-container">
        {viewMode === "photo" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={realPhotoUrl}
            alt="Foto do empreendimento"
            className="viewer-image base-layer"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={blueprintUrl}
            alt="Blueprint arquitetônico"
            className="viewer-image base-layer"
          />
        )}

        {/* Mode: Progress Overlay */}
        {viewMode === "progress" && (
          <ProgressOverlay
            progress={progress}
            realPhotoUrl={realPhotoUrl}
            showPhotoFill={true}
            showLaserIndicator={true}
          />
        )}

        {/* Mode: Interactive Compare Curtain Slider */}
        {viewMode === "compare" && (
          <div
            className="viewer-compare-overlay"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={realPhotoUrl}
              alt="Foto real para comparação"
              className="viewer-image overlay-layer"
            />
          </div>
        )}
      </div>

      {/* Split Slider Handle (Only in compare mode, no text labels) */}
      {viewMode === "compare" && (
        <div
          className="compare-divider"
          style={{ left: `${sliderPosition}%` }}
          onPointerDown={handlePointerDown}
          role="slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div className="compare-handle-knob">
            <span className="knob-arrow-left">‹</span>
            <span className="knob-arrow-right">›</span>
          </div>
        </div>
      )}

      {/* Minimal Top-Right Action (Fullscreen toggle only) */}
      <div className="viewer-hud-actions">
        <button
          type="button"
          className="hud-action-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          title="Tela cheia"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
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
          width: 2px;
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #00e5ff;
          color: #0a192f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.9);
          gap: 2px;
        }

        .viewer-hud-actions {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 25;
        }

        .hud-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(10, 25, 47, 0.7);
          border: 0.5px solid rgba(0, 229, 255, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .hud-action-btn:hover {
          background: var(--brand-primary);
          color: #ffffff;
          border-color: #00e5ff;
          transform: scale(1.05);
        }

        @media (max-width: 600px) {
          .blueprint-viewer-frame {
            height: 420px;
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

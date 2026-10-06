"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ViewMode, BlueprintStatus } from "@/lib/building-progress/types";
import { BlueprintViewer } from "./BlueprintViewer";
import { BlueprintSkeleton } from "./BlueprintSkeleton";
import { BlueprintError } from "./BlueprintError";
import {
  UploadCloud,
  Layers,
  SlidersHorizontal,
  FileCode2,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";

export interface BuildingProgressBlueprintProps {
  buildingId?: string;
  imageUrl?: string;
  progress?: number; // 0 to 100
  initialBlueprintUrl?: string;
  onBlueprintGenerated?: (blueprintUrl: string) => void;
  onProgressChange?: (progress: number) => void;
  className?: string;
  showProgressSlider?: boolean; // Default true
}

export const BuildingProgressBlueprint: React.FC<BuildingProgressBlueprintProps> = ({
  buildingId: initialBuildingId = "skr-building-01",
  imageUrl: initialImageUrl,
  progress: externalProgress = 68,
  initialBlueprintUrl,
  onBlueprintGenerated,
  onProgressChange,
  className = "",
  showProgressSlider = true,
}) => {
  const [buildingId, setBuildingId] = useState<string>(initialBuildingId);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(
    initialBlueprintUrl || null
  );
  const [status, setStatus] = useState<BlueprintStatus>(
    initialBlueprintUrl ? "completed" : initialImageUrl ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("progress");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Internal progress state synced with external
  const [currentProgress, setCurrentProgress] = useState<number>(externalProgress);

  useEffect(() => {
    setCurrentProgress(externalProgress);
  }, [externalProgress]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Blueprint generator API call
  const triggerGeneration = useCallback(
    async (imgUrl: string, bId: string, force = false) => {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const response = await fetch("/api/building-blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildingId: bId,
            imageUrl: imgUrl,
            force,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
          throw new Error(data.error || "Erro ao processar imagem na IA");
        }

        if (data.blueprintUrl) {
          setBlueprintUrl(data.blueprintUrl);
          setStatus("completed");
          if (onBlueprintGenerated) {
            onBlueprintGenerated(data.blueprintUrl);
          }
        } else {
          throw new Error("URL de blueprint não recebida do servidor");
        }
      } catch (err: unknown) {
        console.error("[BuildingProgressBlueprint] Erro:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setErrorMessage(msg);
        setStatus("error");
      }
    },
    [onBlueprintGenerated]
  );

  // Initial load if imageUrl is provided
  useEffect(() => {
    if (initialImageUrl && !blueprintUrl) {
      setCurrentImageUrl(initialImageUrl);
      triggerGeneration(initialImageUrl, buildingId);
    }
  }, [initialImageUrl, buildingId, blueprintUrl, triggerGeneration]);

  // Handle file drop or selection
  const handleFileProcess = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione um arquivo de imagem (PNG, JPEG, WEBP).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        const newId = `building-${Date.now().toString(36)}`;
        setBuildingId(newId);
        setCurrentImageUrl(dataUrl);
        setBlueprintUrl(null);
        triggerGeneration(dataUrl, newId);
      };
      reader.readAsDataURL(file);
    },
    [triggerGeneration]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleProgressSliderChange = (newVal: number) => {
    setCurrentProgress(newVal);
    if (onProgressChange) {
      onProgressChange(newVal);
    }
  };

  const PRESETS = [0, 25, 50, 68, 85, 100];

  return (
    <div
      className={`skr-blueprint-compact-root ${className} ${isDragOver ? "is-dragging-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      {/* State 1: No Image Loaded Yet -> Clean Drag & Drop Zone */}
      {!currentImageUrl && status === "idle" && (
        <div
          className="skr-dropzone-box"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload de foto do prédio"
        >
          <div className="dropzone-icon-circle">
            <UploadCloud size={32} />
          </div>
          <h3 className="dropzone-title">Solte a foto do prédio aqui</h3>
          <p className="dropzone-sub">
            Arraste e solte o arquivo ou <span>clique para navegar</span>
          </p>
          <span className="dropzone-tag">PNG • JPG • WEBP</span>
        </div>
      )}

      {/* State 2: Image Loaded -> Main Blueprint Area */}
      {currentImageUrl && (
        <div className="skr-blueprint-frame">
          {/* Header Controls: Modes + Replace Photo */}
          <div className="blueprint-top-toolbar">
            <div className="toolbar-modes">
              <button
                type="button"
                className={`toolbar-btn ${viewMode === "progress" ? "is-active" : ""}`}
                onClick={() => setViewMode("progress")}
              >
                <Layers size={13} />
                <span>Progresso</span>
              </button>

              <button
                type="button"
                className={`toolbar-btn ${viewMode === "compare" ? "is-active" : ""}`}
                onClick={() => setViewMode("compare")}
              >
                <SlidersHorizontal size={13} />
                <span>Comparar</span>
              </button>

              <button
                type="button"
                className={`toolbar-btn ${viewMode === "blueprint" ? "is-active" : ""}`}
                onClick={() => setViewMode("blueprint")}
              >
                <FileCode2 size={13} />
                <span>Blueprint</span>
              </button>

              <button
                type="button"
                className={`toolbar-btn ${viewMode === "photo" ? "is-active" : ""}`}
                onClick={() => setViewMode("photo")}
              >
                <ImageIcon size={13} />
                <span>Foto Real</span>
              </button>
            </div>

            <button
              type="button"
              className="toolbar-replace-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Trocar imagem ou arrastar novo arquivo"
            >
              <UploadCloud size={13} />
              <span>Trocar Foto</span>
            </button>
          </div>

          {/* Visualizer Body */}
          <div className="blueprint-stage">
            {status === "loading" && <BlueprintSkeleton projectName="Empreendimento" />}

            {status === "error" && (
              <BlueprintError
                message={errorMessage || undefined}
                onRetry={() => {
                  if (currentImageUrl) triggerGeneration(currentImageUrl, buildingId, true);
                }}
                onFallbackToPhoto={() => {
                  setViewMode("photo");
                  setStatus("completed");
                }}
              />
            )}

            {status === "completed" && blueprintUrl && (
              <BlueprintViewer
                blueprintUrl={blueprintUrl}
                realPhotoUrl={currentImageUrl}
                progress={currentProgress}
                viewMode={viewMode}
                buildingId={buildingId}
                onViewModeChange={setViewMode}
              />
            )}
          </div>

          {/* Drag Overlay Hint when dragging over an existing viewer */}
          {isDragOver && (
            <div className="drag-active-scrim">
              <UploadCloud size={44} className="pulse-icon" />
              <p>Solte a nova foto para gerar o blueprint</p>
            </div>
          )}

          {/* Interactive Percentage Slider Bar */}
          {showProgressSlider && (
            <div className="blueprint-slider-bar">
              <div className="slider-left">
                <span className="slider-pct-pill">{currentProgress}%</span>
              </div>

              <div className="slider-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onChange={(e) => handleProgressSliderChange(Number(e.target.value))}
                  className="blueprint-range"
                  aria-label="Porcentagem de conclusão da obra"
                />
              </div>

              <div className="slider-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`preset-pill ${currentProgress === p ? "is-active" : ""}`}
                    onClick={() => handleProgressSliderChange(p)}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .skr-blueprint-compact-root {
          width: 100%;
          position: relative;
          user-select: none;
        }

        .skr-blueprint-compact-root.is-dragging-over {
          outline: 2px dashed var(--brand-primary);
          outline-offset: 4px;
          border-radius: var(--radius-card);
        }

        /* Dropzone Box */
        .skr-dropzone-box {
          width: 100%;
          min-height: 480px;
          border: 2px dashed rgba(0, 113, 227, 0.3);
          border-radius: var(--radius-card);
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 24px;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-standard);
          box-shadow: var(--shadow-card);
        }

        .skr-dropzone-box:hover {
          border-color: var(--brand-primary);
          background: var(--brand-blue-50);
          transform: translateY(-1px);
        }

        .dropzone-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--brand-blue-50);
          color: var(--brand-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .dropzone-title {
          font-family: var(--font);
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .dropzone-sub {
          font-family: var(--font);
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        .dropzone-sub span {
          color: var(--brand-primary);
          font-weight: 600;
        }

        .dropzone-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.04);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          margin-top: 8px;
        }

        /* Main Blueprint Container */
        .skr-blueprint-frame {
          width: 100%;
          border-radius: var(--radius-card);
          background: #ffffff;
          border: 0.5px solid rgba(0, 0, 0, 0.06);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .blueprint-top-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-modes {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--neutral-100);
          padding: 3px;
          border-radius: var(--radius-full);
        }

        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-family: var(--font);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .toolbar-btn:hover {
          color: var(--text-primary);
        }

        .toolbar-btn.is-active {
          color: #ffffff;
          background: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 113, 227, 0.25);
        }

        .toolbar-replace-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-family: var(--font);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--neutral-100);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .toolbar-replace-btn:hover {
          color: var(--brand-primary);
          border-color: var(--brand-primary);
          background: #ffffff;
        }

        .blueprint-stage {
          position: relative;
          width: 100%;
          border-radius: var(--radius-card);
          overflow: hidden;
        }

        .drag-active-scrim {
          position: absolute;
          inset: 0;
          background: rgba(0, 113, 227, 0.92);
          backdrop-filter: blur(8px);
          z-index: 100;
          border-radius: var(--radius-card);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 16px;
          pointer-events: none;
        }

        .pulse-icon {
          animation: pulse-icon 1s infinite alternate;
        }

        /* Slider Controls Bar */
        .blueprint-slider-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 14px;
          background: var(--neutral-50);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-control);
          flex-wrap: wrap;
        }

        .slider-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 110px;
        }

        .slider-pct-pill {
          font-size: 16px;
          font-weight: 800;
          color: var(--brand-primary);
          line-height: 1;
        }

        .slider-pct-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .slider-center {
          flex: 1;
          min-width: 160px;
        }

        .blueprint-range {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--neutral-300);
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .blueprint-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 113, 227, 0.4);
          cursor: pointer;
          border: 2px solid #ffffff;
          transition: transform 150ms;
        }

        .blueprint-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .slider-presets {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .preset-pill {
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: #ffffff;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font);
          transition: all 150ms;
        }

        .preset-pill:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }

        .preset-pill.is-active {
          background: var(--brand-primary);
          border-color: var(--brand-primary);
          color: #ffffff;
        }

        @keyframes pulse-icon {
          from { transform: scale(0.9); }
          to { transform: scale(1.1); }
        }

        @media (max-width: 680px) {
          .blueprint-slider-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .slider-left {
            justify-content: space-between;
          }
          .slider-presets {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

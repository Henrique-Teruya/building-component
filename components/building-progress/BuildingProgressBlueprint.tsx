"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BLUEPRINT_STYLE_VERSION } from "@/lib/building-progress/blueprint-style";
import type { BlueprintState, BuildingProgressBlueprintProps, BlueprintGeneratorInput } from "@/lib/building-progress/types";
import { BlueprintViewer } from "./BlueprintViewer";
import { BlueprintError } from "./BlueprintError";
import { BlueprintScanCover } from "@/components/blueprint/blueprint-scan/BlueprintScanCover";
import { compositionAspectRatio, preloadDecodedImage, prepareRenderedVisual } from "@/lib/building-progress/prepare-visual";
import { BlueprintRequestError, requestBlueprint } from "@/lib/building-progress/request-blueprint";
import { useConstructionProgress } from "./useConstructionProgress";

export type { BuildingProgressBlueprintProps, BlueprintGeneratorInput } from "@/lib/building-progress/types";

export const BuildingProgressBlueprint: React.FC<BuildingProgressBlueprintProps> = ({
  buildingId: initialBuildingId = "skr-building-01",
  imageUrl: initialImageUrl,
  progress: externalProgress = 50,
  initialBlueprintUrl,
  onBlueprintGenerated,
  onProgressChange,
  className = "",
  showProgressSlider = true,
  generateBlueprint = requestBlueprint,
}) => {
  const [buildingId, setBuildingId] = useState<string>(initialBuildingId);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [state, setState] = useState<BlueprintState>(
    initialImageUrl ? "generating" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const { progress: currentProgress, isAnimating: isProgressAnimating, selectProgress } =
    useConstructionProgress(externalProgress, state === "ready");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFileRef = useRef<File | null>(null);
  const requestIdRef = useRef(0);
  const uploadIdRef = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isCovered = state === "generating" || state === "preparing" || state === "readyToReveal" || state === "revealing";
  const isHidden = state === "generating" || state === "preparing" || state === "readyToReveal";

  const MIN_LOADING_DURATION = 2000;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Strict Mode immediately remounts effects; cancel only a real unmount.
      queueMicrotask(() => {
        if (!mountedRef.current) requestController.current?.abort();
      });
    };
  }, []);

  const prepareResult = useCallback(async (imgUrl: string, resultUrl: string, requestId: number, signal: AbortSignal) => {
    if (requestId !== requestIdRef.current || signal.aborted) return;
    setState("preparing");
    const [original, blueprint] = await Promise.all([
      preloadDecodedImage(imgUrl, signal),
      preloadDecodedImage(resultUrl, signal),
    ]);
    if (requestId !== requestIdRef.current || signal.aborted) return;
    const ratio = compositionAspectRatio(original, blueprint);
    setImageAspectRatio(ratio);
    setBlueprintUrl(resultUrl);
    onBlueprintGenerated?.(resultUrl);
  }, [onBlueprintGenerated]);

  // Generation and decoding stay hidden until the composition is ready.
  const triggerGeneration = useCallback(
    async (imgUrl: string, bId: string, force = false, imageFile?: File) => {
      const requestId = ++requestIdRef.current;
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      setState("generating");
      setErrorMessage(null);
      setBlueprintUrl(null);
      setImageAspectRatio(null);

      try {
        const [resultUrl] = await Promise.all([
          generateBlueprint({ buildingId: bId, imageUrl: imgUrl, file: imageFile, force, signal: controller.signal }),
          new Promise((resolve) => setTimeout(resolve, MIN_LOADING_DURATION)),
        ]);
        await prepareResult(imgUrl, resultUrl, requestId, controller.signal);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current || controller.signal.aborted) return;
        if (err instanceof BlueprintRequestError) {
          console.warn("[BuildingProgressBlueprint] Geração recusada:", { status: err.status, code: err.code, message: err.message });
        } else {
          console.error("[BuildingProgressBlueprint] Erro:", err);
        }
        const msg = err instanceof Error ? err.message : "Não foi possível preparar esta visualização.";
        setErrorMessage(msg);
        setState("error");
      }
    },
    [generateBlueprint, prepareResult]
  );

  useEffect(() => {
    if (state !== "preparing" || !blueprintUrl || !imageAspectRatio || !cardRef.current) return;
    const controller = new AbortController();
    const requestId = requestIdRef.current;
    prepareRenderedVisual(cardRef.current, controller.signal)
      .then(() => {
        if (!controller.signal.aborted && requestId === requestIdRef.current) setState("readyToReveal");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        console.error("[BuildingProgressBlueprint] Preparation failed:", error);
        setBlueprintUrl(null);
        setErrorMessage("Não foi possível preparar esta visualização. Tente novamente.");
        setState("error");
      });
    return () => controller.abort();
  }, [state, blueprintUrl, imageAspectRatio]);

  const hasInitializedRef = useRef<string | null>(null);

  // Initialize once; refresh the current upload when its rendering style changes.
  useEffect(() => {
    if (hasInitializedRef.current !== BLUEPRINT_STYLE_VERSION) {
      const wasInitialized = hasInitializedRef.current !== null;
      hasInitializedRef.current = BLUEPRINT_STYLE_VERSION;
      if (wasInitialized) {
        if (currentImageUrl === initialImageUrl && initialImageUrl?.startsWith("data:image/svg+xml")) return;
        if (currentImageUrl) triggerGeneration(currentImageUrl, buildingId, true, uploadedFileRef.current ?? undefined);
        return;
      }
      if (initialImageUrl && initialBlueprintUrl) {
        const requestId = ++requestIdRef.current;
        const controller = new AbortController();
        requestController.current = controller;
        prepareResult(initialImageUrl, initialBlueprintUrl, requestId, controller.signal).catch((error: unknown) => {
          if (controller.signal.aborted) return;
          console.error("[BuildingProgressBlueprint] Preparation failed:", error);
          setErrorMessage("Não foi possível preparar esta visualização. Tente novamente.");
          setState("error");
        });
      } else if (initialImageUrl) {
        setCurrentImageUrl(initialImageUrl);
        triggerGeneration(initialImageUrl, initialBuildingId);
      }
    }
  }, [initialImageUrl, initialBlueprintUrl, initialBuildingId, triggerGeneration, prepareResult, currentImageUrl, buildingId]);

  // Handle file drop or selection
  const handleFileProcess = useCallback(
    (file: File) => {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setErrorMessage("Selecione uma imagem PNG, JPG ou WEBP.");
        setState("error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("A imagem deve ter no máximo 10 MB.");
        setState("error");
        return;
      }

      const uploadId = ++uploadIdRef.current;
      requestController.current?.abort();
      requestIdRef.current += 1;
      setBlueprintUrl(null);
      setImageAspectRatio(null);
      setState("generating");

      const reader = new FileReader();
      reader.onload = (e) => {
        if (uploadId !== uploadIdRef.current) return;
        const dataUrl = e.target?.result;
        if (typeof dataUrl !== "string") {
          setErrorMessage("Não foi possível ler a imagem selecionada.");
          setState("error");
          return;
        }

        const newId = `building-${crypto.randomUUID()}`;
        uploadedFileRef.current = file;
        setBuildingId(newId);
        setCurrentImageUrl(dataUrl);
        setBlueprintUrl(null);
        triggerGeneration(dataUrl, newId, false, file);
      };
      reader.onerror = () => {
        if (uploadId !== uploadIdRef.current) return;
        setErrorMessage("Não foi possível ler a imagem selecionada.");
        setState("error");
      };
      reader.readAsDataURL(file);
    },
    [triggerGeneration]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCovered) setIsDragOver(true);
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

    if (isCovered) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
    // Clear value to allow selecting the same file again
    e.target.value = "";
  };

  const handleProgressSliderChange = (newVal: number) => {
    selectProgress(newVal);
    if (onProgressChange) {
      onProgressChange(newVal);
    }
  };

  return (
    <div
      className={`skr-blueprint-compact-root ${className} ${isDragOver ? "is-dragging-over" : ""}`}
      data-building-state={state}
      aria-busy={isCovered}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      {!currentImageUrl && !isCovered && (
        <button
          type="button"
          className="skr-dropzone-box"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Enviar imagem do empreendimento"
        >
          Arraste uma imagem ou clique para enviar
        </button>
      )}
      {!currentImageUrl && errorMessage && (
        <p className="upload-error" role="alert">{errorMessage}</p>
      )}

      {/* State 2: Image Loaded -> Main Blueprint Area */}
      {(currentImageUrl || isCovered) && (
        <div className="skr-blueprint-frame" ref={cardRef} inert={isCovered} aria-hidden={isCovered} style={{ visibility: isHidden ? "hidden" : "visible", opacity: isHidden ? 0 : 1 }}>
          {/* Visualizer Stage */}
          <div className="blueprint-stage">
            {isCovered && !blueprintUrl && <div className="composition-placeholder" />}

            {/* Error handling with retry */}
            {state === "error" && (
              <BlueprintError
                message={errorMessage || undefined}
                onRetry={() => {
                  if (currentImageUrl) triggerGeneration(currentImageUrl, buildingId, true, uploadedFileRef.current ?? undefined);
                }}
              />
            )}

            {state !== "error" && blueprintUrl && currentImageUrl && imageAspectRatio && (
              <BlueprintViewer
                blueprintUrl={blueprintUrl}
                realPhotoUrl={currentImageUrl}
                progress={currentProgress}
                onImageSelect={() => fileInputRef.current?.click()}
                aspectRatio={imageAspectRatio}
                animateProgress={state === "ready" && !isProgressAnimating}
              />
            )}
          </div>

          {showProgressSlider && state !== "error" && (
            <div className="blueprint-slider-bar">
              <input
                type="range"
                disabled={state !== "ready"}
                min="0"
                max="100"
                step="any"
                value={currentProgress}
                onChange={(event) => handleProgressSliderChange(Math.round(Number(event.target.value)))}
                className="blueprint-range"
                aria-label="Porcentagem de conclusão da obra"
                aria-valuetext={`${Math.round(currentProgress)}% construído`}
              />
            </div>
          )}
        </div>
      )}

      {isCovered && (
        <BlueprintScanCover
          state={state}
          onRevealStart={() => setState("revealing")}
          onRevealComplete={() => setState("ready")}
        />
      )}

      <style jsx>{`
        .skr-blueprint-compact-root {
          width: 100%;
          position: relative;
          user-select: none;
          overflow: visible;
          isolation: isolate;
        }

        .skr-blueprint-compact-root.is-dragging-over {
          outline: 2px dashed var(--brand-primary);
          outline-offset: 4px;
        }

        .skr-dropzone-box {
          width: 100%;
          min-height: 480px;
          border: 1px dashed var(--border-subtle);
          background: transparent;
          padding: 24px;
          color: var(--text-muted);
          font: 500 14px var(--font);
          cursor: pointer;
        }

        .skr-dropzone-box:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }

        .skr-dropzone-box:focus-visible,
        .blueprint-range:focus-visible {
          outline: 2px solid var(--brand-primary);
          outline-offset: 4px;
        }

        .skr-blueprint-frame {
          width: 100%;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: opacity 400ms var(--ease-standard);
        }

        .blueprint-stage {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .composition-placeholder { height: 560px; }

        .upload-error {
          margin-top: 12px;
          color: var(--feedback-danger);
          font: 600 13px var(--font);
          text-align: center;
        }

        .blueprint-slider-bar { padding: 10px 0; }

        .blueprint-range {
          display: block;
          width: 100%;
          height: 6px;
          border: 0;
          border-radius: 3px;
          background: var(--neutral-300);
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }

        .blueprint-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 113, 227, 0.4);
          border: 2px solid var(--surface-canvas);
        }

        .blueprint-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--brand-primary);
          box-shadow: 0 2px 6px rgba(0, 113, 227, 0.4);
          border: 2px solid var(--surface-canvas);
        }

        @media (prefers-reduced-motion: reduce) {
          .skr-blueprint-frame { transition-duration: 150ms; }
        }

        @media (max-width: 600px) {
          .composition-placeholder { height: 420px; }
          .skr-dropzone-box { min-height: 420px; }
        }
      `}</style>
    </div>
  );
};

"use client";

import { ProgressComposition } from "./ProgressComposition";

interface BlueprintViewerProps {
  blueprintUrl: string;
  realPhotoUrl: string;
  progress: number;
  aspectRatio: number;
  animateProgress?: boolean;
  onImageSelect: () => void;
}

export function BlueprintViewer({
  blueprintUrl,
  realPhotoUrl,
  progress,
  aspectRatio,
  animateProgress = true,
  onImageSelect,
}: BlueprintViewerProps) {
  const builtProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  const displayedPercentage = Math.round(builtProgress);

  return (
    <div className="blueprint-viewer-frame" role="region" aria-label="Avanço da construção">
      <button
        type="button"
        className="viewer-image-container"
        onClick={onImageSelect}
        aria-label="Enviar ou substituir imagem do empreendimento"
      >
        <ProgressComposition
          blueprintUrl={blueprintUrl}
          realPhotoUrl={realPhotoUrl}
          aspectRatio={aspectRatio}
          progress={builtProgress}
          animateProgress={animateProgress}
        />
      </button>

      <div className="construction-progress" role="group" aria-label={`${displayedPercentage}% do empreendimento construído`}>
        <p className="construction-progress-value" aria-hidden="true">
          <span>{displayedPercentage}</span><span className="construction-progress-unit">%</span>
        </p>
      </div>

      <style jsx>{`
        .blueprint-viewer-frame {
          position: relative;
          width: 100%;
          min-height: 520px;
          height: 560px;
          background: transparent;
          overflow: hidden;
          container-type: inline-size;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(8px, 2cqw, 24px);
          align-items: center;
          user-select: none;
          touch-action: pan-y;
        }

        .viewer-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-width: 0;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .viewer-image-container:focus-visible {
          outline: 2px solid var(--brand-primary);
          outline-offset: -2px;
        }

        .construction-progress {
          min-width: 0;
          color: var(--brand-primary);
          font-family: var(--font-progress-display, var(--font));
        }

        .construction-progress-value {
          display: flex;
          align-items: baseline;
          margin: 0;
          font-size: clamp(3rem, 28cqw, 22rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: .9;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          transform: scaleY(1.35);
          transform-origin: center;
        }

        .construction-progress-unit {
          margin-left: .12em;
          font-size: .34em;
          letter-spacing: -0.01em;
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
}

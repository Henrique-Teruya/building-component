"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BuildingProgressBlueprintProps,
  BlueprintStatus,
  ViewMode,
  BuildingPhase,
} from "@/lib/building-progress/types";
import { BlueprintViewer } from "./BlueprintViewer";
import { BlueprintSkeleton } from "./BlueprintSkeleton";
import { BlueprintError } from "./BlueprintError";
import {
  Layers,
  SlidersHorizontal,
  FileCode2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";

/**
 * Calculates realistic default construction milestones from overall progress
 */
function deriveDefaultPhases(totalProgress: number): BuildingPhase[] {
  const p = Math.min(100, Math.max(0, totalProgress));

  // Fundações: 0 to 20%
  const fundacao = Math.min(100, Math.round((Math.min(20, p) / 20) * 100));
  // Estrutura: 20 to 50%
  const estrutura = p < 20 ? 0 : Math.min(100, Math.round(((Math.min(50, p) - 20) / 30) * 100));
  // Alvenaria & Fachada: 50 to 75%
  const fachada = p < 50 ? 0 : Math.min(100, Math.round(((Math.min(75, p) - 50) / 25) * 100));
  // Instalações: 60 to 90%
  const instalacoes = p < 60 ? 0 : Math.min(100, Math.round(((Math.min(90, p) - 60) / 30) * 100));
  // Acabamentos: 80 to 100%
  const acabamentos = p < 80 ? 0 : Math.min(100, Math.round(((Math.min(100, p) - 80) / 20) * 100));

  return [
    {
      id: "fundacao",
      name: "Fundação",
      progress: fundacao,
      status: fundacao === 100 ? "completed" : fundacao > 0 ? "in_progress" : "pending",
    },
    {
      id: "estrutura",
      name: "Estrutura",
      progress: estrutura,
      status: estrutura === 100 ? "completed" : estrutura > 0 ? "in_progress" : "pending",
    },
    {
      id: "fachada",
      name: "Fachada",
      progress: fachada,
      status: fachada === 100 ? "completed" : fachada > 0 ? "in_progress" : "pending",
    },
    {
      id: "instalacoes",
      name: "Instalações",
      progress: instalacoes,
      status: instalacoes === 100 ? "completed" : instalacoes > 0 ? "in_progress" : "pending",
    },
    {
      id: "acabamentos",
      name: "Acabamentos",
      progress: acabamentos,
      status: acabamentos === 100 ? "completed" : acabamentos > 0 ? "in_progress" : "pending",
    },
  ];
}

export const BuildingProgressBlueprint: React.FC<BuildingProgressBlueprintProps> = ({
  buildingId,
  imageUrl,
  progress,
  projectName = "SKR Empreendimento",
  location = "São Paulo, SP",
  phases: customPhases,
  initialBlueprintUrl,
  onBlueprintGenerated,
  className = "",
  showControls = true,
  defaultViewMode = "progress",
}) => {
  const [status, setStatus] = useState<BlueprintStatus>(
    initialBlueprintUrl ? "completed" : "idle"
  );
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(
    initialBlueprintUrl ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [isCached, setIsCached] = useState<boolean>(false);

  // Compute or use passed phases
  const activePhases = useMemo(() => {
    return customPhases && customPhases.length > 0
      ? customPhases
      : deriveDefaultPhases(progress);
  }, [customPhases, progress]);

  // Fetch or trigger canonical blueprint generation
  const loadBlueprint = useCallback(
    async (force = false) => {
      // If we already have a blueprint for this building and aren't forcing refresh, skip
      if (blueprintUrl && !force) {
        return;
      }

      setStatus("loading");
      setErrorMessage(null);

      try {
        const response = await fetch("/api/building-blueprint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buildingId,
            imageUrl,
            projectName,
            force,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
          throw new Error(data.error || "Falha ao gerar o blueprint do empreendimento");
        }

        if (data.blueprintUrl) {
          setBlueprintUrl(data.blueprintUrl);
          setIsCached(Boolean(data.cached));
          setStatus("completed");
          if (onBlueprintGenerated) {
            onBlueprintGenerated(data.blueprintUrl);
          }
        } else {
          throw new Error("Blueprint URL não retornada pelo servidor.");
        }
      } catch (err: unknown) {
        console.error("[BuildingProgressBlueprint] Erro ao carregar blueprint:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao gerar blueprint";
        setErrorMessage(msg);
        setStatus("error");
      }
    },
    [buildingId, imageUrl, projectName, blueprintUrl, onBlueprintGenerated]
  );

  // Auto-load on mount or when buildingId changes
  useEffect(() => {
    if (!blueprintUrl) {
      loadBlueprint();
    }
  }, [buildingId, imageUrl, blueprintUrl, loadBlueprint]);

  return (
    <div
      className={`building-progress-blueprint-card skr-card ${className}`}
      data-testid="building-progress-blueprint"
    >
      {/* Header do Componente seguindo o SKR Design System */}
      <header className="bp-header">
        <div className="bp-header-meta">
          <div className="bp-eyebrow">
            <span className="skr-badge skr-badge-brand">
              <Sparkles size={11} />
              BLUEPRINT CANÔNICO
            </span>
            {isCached && (
              <span className="skr-badge skr-badge-neutral" title="Carregado do cache SKR">
                CACHE ATIVO
              </span>
            )}
          </div>
          <h2 className="bp-project-title">{projectName}</h2>
          <p className="bp-location">{location}</p>
        </div>

        {/* Big Progress KPI Indicator */}
        <div className="bp-kpi-badge">
          <div className="bp-kpi-num">{Math.min(100, Math.max(0, progress))}%</div>
          <div className="bp-kpi-label">OBRA CONCLUÍDA</div>
        </div>
      </header>

      {/* Mode Switcher Tabs (SKR Pill Pattern) */}
      {showControls && status === "completed" && (
        <nav className="bp-mode-nav" aria-label="Modos de visualização">
          <button
            type="button"
            className={`bp-mode-btn ${viewMode === "progress" ? "is-active" : ""}`}
            onClick={() => setViewMode("progress")}
            aria-pressed={viewMode === "progress"}
          >
            <Layers size={14} />
            <span>Progresso da Obra</span>
          </button>

          <button
            type="button"
            className={`bp-mode-btn ${viewMode === "compare" ? "is-active" : ""}`}
            onClick={() => setViewMode("compare")}
            aria-pressed={viewMode === "compare"}
          >
            <SlidersHorizontal size={14} />
            <span>Comparar (Slider)</span>
          </button>

          <button
            type="button"
            className={`bp-mode-btn ${viewMode === "blueprint" ? "is-active" : ""}`}
            onClick={() => setViewMode("blueprint")}
            aria-pressed={viewMode === "blueprint"}
          >
            <FileCode2 size={14} />
            <span>Blueprint Técnico</span>
          </button>

          <button
            type="button"
            className={`bp-mode-btn ${viewMode === "photo" ? "is-active" : ""}`}
            onClick={() => setViewMode("photo")}
            aria-pressed={viewMode === "photo"}
          >
            <ImageIcon size={14} />
            <span>Foto do Local</span>
          </button>
        </nav>
      )}

      {/* Main Architectural Stage Area */}
      <section className="bp-viewer-wrapper">
        {status === "loading" && <BlueprintSkeleton projectName={projectName} />}

        {status === "error" && (
          <BlueprintError
            message={errorMessage || undefined}
            onRetry={() => loadBlueprint(true)}
            onFallbackToPhoto={() => {
              setViewMode("photo");
              setStatus("completed");
            }}
          />
        )}

        {status === "completed" && (
          <BlueprintViewer
            blueprintUrl={blueprintUrl || imageUrl}
            realPhotoUrl={imageUrl}
            progress={progress}
            viewMode={viewMode}
            phases={activePhases}
            projectName={projectName}
            buildingId={buildingId}
            onViewModeChange={setViewMode}
          />
        )}
      </section>

      {/* Real Construction Milestone Timeline (Conforme requisito SKR) */}
      <footer className="bp-milestones-section">
        <div className="bp-milestones-header">
          <span className="bp-section-label">ETAPAS DA CONSTRUÇÃO (DADOS REAIS SKR)</span>
          <button
            type="button"
            className="bp-refresh-blueprint-btn"
            onClick={() => loadBlueprint(true)}
            title="Recalcular blueprint canônico"
          >
            <RefreshCw size={12} />
            <span>Sincronizar Blueprint</span>
          </button>
        </div>

        <div className="bp-milestones-track">
          {activePhases.map((phase, idx) => (
            <div
              key={phase.id}
              className={`bp-milestone-item ${
                phase.progress === 100
                  ? "is-complete"
                  : phase.progress > 0
                  ? "is-current"
                  : "is-pending"
              }`}
            >
              <div className="milestone-top">
                <span className="milestone-name">{phase.name}</span>
                <span className="milestone-val">
                  {phase.progress === 100 ? (
                    <span className="check-icon">
                      <CheckCircle2 size={13} /> Concluída
                    </span>
                  ) : (
                    `${phase.progress}%`
                  )}
                </span>
              </div>

              {/* Progress mini bar */}
              <div className="milestone-bar-bg">
                <div
                  className="milestone-bar-fill"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>

              {/* Step arrow indicator */}
              {idx < activePhases.length - 1 && (
                <div className="milestone-step-connector" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </footer>

      <style jsx>{`
        .building-progress-blueprint-card {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 1;
        }

        .bp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .bp-header-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bp-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bp-project-title {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .bp-location {
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        .bp-kpi-badge {
          background: var(--brand-blue-50);
          border: 1px solid var(--brand-blue-100);
          border-radius: var(--radius-control);
          padding: 12px 20px;
          text-align: right;
          min-width: 130px;
        }

        .bp-kpi-num {
          font-size: 28px;
          font-weight: 800;
          color: var(--brand-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .bp-kpi-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--brand-contrast);
          margin-top: 4px;
        }

        .bp-mode-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
        }

        .bp-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-family: var(--font);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--neutral-100);
          border: 1px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .bp-mode-btn:hover {
          color: var(--text-primary);
          background: var(--neutral-200);
        }

        .bp-mode-btn.is-active {
          color: #ffffff;
          background: var(--brand-primary);
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);
        }

        .bp-viewer-wrapper {
          position: relative;
          width: 100%;
        }

        .bp-milestones-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
        }

        .bp-milestones-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bp-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .bp-refresh-blueprint-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: color var(--duration-fast) var(--ease-standard);
        }

        .bp-refresh-blueprint-btn:hover {
          color: var(--brand-primary);
        }

        .bp-milestones-track {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .bp-milestone-item {
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-control);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .bp-milestone-item.is-current {
          border-color: rgba(0, 113, 227, 0.35);
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.06);
        }

        .milestone-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .milestone-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .milestone-val {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .bp-milestone-item.is-complete .milestone-val {
          color: var(--feedback-success);
        }

        .bp-milestone-item.is-current .milestone-val {
          color: var(--brand-primary);
        }

        .check-icon {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .milestone-bar-bg {
          width: 100%;
          height: 5px;
          background: var(--neutral-200);
          border-radius: 3px;
          overflow: hidden;
        }

        .milestone-bar-fill {
          height: 100%;
          background: var(--brand-primary);
          border-radius: 3px;
          transition: width var(--duration-standard) var(--ease-standard);
        }

        .bp-milestone-item.is-complete .milestone-bar-fill {
          background: var(--feedback-success);
        }

        @media (max-width: 768px) {
          .bp-milestones-track {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .bp-header {
            flex-direction: column;
            align-items: stretch;
          }
          .bp-kpi-badge {
            text-align: left;
            display: flex;
            align-items: baseline;
            gap: 12px;
          }
          .building-progress-blueprint-card {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
};

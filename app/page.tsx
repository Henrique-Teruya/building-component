"use client";

import React, { useState } from "react";
import { BuildingProgressBlueprint } from "@/components/building-progress/BuildingProgressBlueprint";
import { MOCK_BUILDINGS } from "@/lib/building-progress/mock-buildings";
import {
  Building2,
  Calendar,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

export default function Home() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("pinheiros-01");
  const currentBuilding = MOCK_BUILDINGS.find((b) => b.id === selectedBuildingId) || MOCK_BUILDINGS[0];

  // Interactive slider state initialized with the building's official progress
  const [interactiveProgress, setInteractiveProgress] = useState<number>(currentBuilding.progress);

  // When changing building, sync interactive progress
  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId(id);
    const b = MOCK_BUILDINGS.find((item) => item.id === id);
    if (b) {
      setInteractiveProgress(b.progress);
    }
  };

  const PRESET_VALUES = [0, 1, 35, 50, 68, 92, 99, 100];

  return (
    <main className="skr-page-root">
      {/* Topbar SKR — Canonical 64px Header */}
      <header className="skr-topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <span className="skr-logo">SKR</span>
            <span className="topbar-divider">/</span>
            <span className="topbar-portal-title">Portal do Proprietário</span>
          </div>

          <div className="topbar-right">
            <span className="skr-badge skr-badge-brand">
              <ShieldCheck size={12} />
              Ambiente Autenticado
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="skr-hero-container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="skr-badge skr-badge-neutral">
              Acompanhamento de Obras
            </span>
            <span className="skr-badge skr-badge-brand">
              <Cpu size={12} />
              Tecnologia Magic Hour • Nano Banana
            </span>
          </div>

          <h1 className="hero-title">
            Evolução Arquitetônica do seu Empreendimento
          </h1>
          <p className="hero-subtitle">
            Acompanhe o avanço físico da obra em tempo real sobre o blueprint canônico
            técnico gerado a partir do projeto arquitetônico oficial.
          </p>
        </div>

        {/* Building Selector Pills */}
        <div className="building-selector-pills">
          {MOCK_BUILDINGS.map((building) => (
            <button
              key={building.id}
              type="button"
              className={`building-pill ${
                selectedBuildingId === building.id ? "is-selected" : ""
              }`}
              onClick={() => handleSelectBuilding(building.id)}
            >
              <Building2 size={15} />
              <div className="pill-text-wrap">
                <span className="pill-name">{building.name}</span>
                <span className="pill-pct">{building.progress}% concluído</span>
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Progress Sandbox Controls */}
        <div className="skr-sandbox-panel skr-card">
          <div className="sandbox-header">
            <div className="sandbox-info">
              <span className="sandbox-label">TESTE INTERATIVO DE PORCENTAGEM</span>
              <p className="sandbox-hint">
                Arraste o slider para simular o avanço. O progresso é calculado e
                animado 100% no cliente sem gerar novas imagens na IA.
              </p>
            </div>

            <div className="sandbox-current-val">
              <span className="val-number">{interactiveProgress}%</span>
              <span className="val-label">NÍVEL SELECIONADO</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="100"
              value={interactiveProgress}
              onChange={(e) => setInteractiveProgress(Number(e.target.value))}
              className="skr-range-slider"
              aria-label="Porcentagem de conclusão da obra"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="presets-row">
            <span className="presets-label">Casos de Teste Rápidos:</span>
            <div className="presets-btns">
              {PRESET_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`preset-btn ${interactiveProgress === val ? "is-active" : ""}`}
                  onClick={() => setInteractiveProgress(val)}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Component */}
        <div className="component-container">
          <BuildingProgressBlueprint
            key={`${currentBuilding.id}-${interactiveProgress === currentBuilding.progress ? "default" : "custom"}`}
            buildingId={currentBuilding.id}
            imageUrl={currentBuilding.imageUrl}
            progress={interactiveProgress}
            projectName={currentBuilding.name}
            location={currentBuilding.location}
            phases={currentBuilding.phases}
          />
        </div>

        {/* Technical Architecture Audit Box */}
        <div className="arch-audit-card skr-card">
          <div className="audit-header">
            <Info size={18} className="audit-icon" />
            <h3 className="audit-title">Arquitetura de Produção Implementada</h3>
          </div>

          <div className="audit-grid">
            <div className="audit-col">
              <div className="audit-badge-title">
                <span className="dot-green" />
                Segurança da API Key
              </div>
              <p className="audit-desc">
                A chave <code>MAGIC_HOUR_API_KEY</code> fica estritamente isolada no servidor
                em <code>/api/building-blueprint</code>. Nenhum segredo ou token é exposto no bundle do cliente.
              </p>
            </div>

            <div className="audit-col">
              <div className="audit-badge-title">
                <span className="dot-blue" />
                Blueprint Canônico Único
              </div>
              <p className="audit-desc">
                A IA é chamada apenas uma vez por empreendimento. O resultado é cacheado via hash.
                10.000 clientes não geram 10.000 requisições à Magic Hour.
              </p>
            </div>

            <div className="audit-col">
              <div className="audit-badge-title">
                <span className="dot-purple" />
                Progresso 100% Orientado a Dados
              </div>
              <p className="audit-desc">
                A IA transforma apenas foto em blueprint. A animação vertical, laser de nível e marcos
                vêm dos dados reais da SKR, respondendo instantaneamente a mudanças.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="skr-page-footer">
        <p>SKR Engenharia &amp; Arquitetura • Todos os direitos reservados</p>
      </footer>

      <style jsx>{`
        .skr-page-root {
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .skr-topbar {
          position: sticky;
          top: 0;
          height: 64px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          z-index: 200;
        }

        .topbar-inner {
          max-width: 1140px;
          margin: 0 auto;
          height: 100%;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .skr-logo {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.04em;
          color: var(--brand-primary);
        }

        .topbar-divider {
          color: var(--border-subtle);
          font-size: 16px;
        }

        .topbar-portal-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .skr-hero-container {
          max-width: 1060px;
          margin: 0 auto;
          padding: 40px 24px 64px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .hero-content {
          text-align: center;
          max-width: 740px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .hero-title {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.035em;
          color: var(--text-primary);
          line-height: 1.15;
        }

        .hero-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .building-selector-pills {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .building-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: var(--radius-full);
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-card);
          cursor: pointer;
          font-family: var(--font);
          color: var(--text-secondary);
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .building-pill:hover {
          border-color: var(--brand-primary);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .building-pill.is-selected {
          border-color: var(--brand-primary);
          background: var(--brand-blue-50);
          color: var(--brand-contrast);
          box-shadow: 0 4px 14px rgba(0, 113, 227, 0.15);
        }

        .pill-text-wrap {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .pill-name {
          font-size: 13px;
          font-weight: 700;
          color: inherit;
        }

        .pill-pct {
          font-size: 11px;
          opacity: 0.8;
        }

        .skr-sandbox-panel {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-color: rgba(0, 113, 227, 0.15);
          background: #ffffff;
        }

        .sandbox-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .sandbox-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--brand-primary);
          text-transform: uppercase;
        }

        .sandbox-hint {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .sandbox-current-val {
          text-align: right;
          min-width: 120px;
        }

        .val-number {
          font-size: 26px;
          font-weight: 800;
          color: var(--brand-primary);
          line-height: 1;
        }

        .val-label {
          display: block;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .slider-wrapper {
          width: 100%;
        }

        .skr-range-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--neutral-200);
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .skr-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brand-primary);
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.4);
          cursor: pointer;
          border: 2px solid #ffffff;
          transition: transform var(--duration-fast);
        }

        .skr-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .presets-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 6px;
          border-top: 1px solid var(--border-subtle);
        }

        .presets-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .presets-btns {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preset-btn {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: var(--neutral-50);
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font);
          transition: all var(--duration-fast) var(--ease-standard);
        }

        .preset-btn:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }

        .preset-btn.is-active {
          background: var(--brand-primary);
          border-color: var(--brand-primary);
          color: #ffffff;
        }

        .component-container {
          width: 100%;
        }

        .arch-audit-card {
          padding: 24px 28px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .audit-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .audit-icon {
          color: var(--brand-primary);
        }

        .audit-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .audit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .audit-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .audit-badge-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--feedback-success);
        }

        .dot-blue {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand-primary);
        }

        .dot-purple {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .audit-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .audit-desc code {
          background: var(--neutral-100);
          padding: 1px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          color: var(--brand-contrast);
        }

        .skr-page-footer {
          text-align: center;
          padding: 32px 24px;
          font-size: 12px;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-subtle);
        }

        @media (max-width: 768px) {
          .audit-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .hero-title {
            font-size: 26px;
          }
          .sandbox-header {
            flex-direction: column;
          }
          .sandbox-current-val {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}

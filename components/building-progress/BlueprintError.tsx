"use client";

import React from "react";
import { AlertCircle, RotateCcw, Image as ImageIcon } from "lucide-react";

interface BlueprintErrorProps {
  message?: string;
  onRetry: () => void;
  onFallbackToPhoto?: () => void;
}

export const BlueprintError: React.FC<BlueprintErrorProps> = ({
  message = "Não foi possível carregar a visualização de blueprint no momento.",
  onRetry,
  onFallbackToPhoto,
}) => {
  return (
    <div className="blueprint-error-container" role="alert">
      <div className="blueprint-error-card">
        <div className="error-icon-wrapper">
          <AlertCircle size={28} className="error-icon" />
        </div>

        <span className="error-badge">SKR ARQUITETURA</span>
        <h3 className="error-title">Indisponibilidade no Blueprint</h3>
        <p className="error-message">{message}</p>

        <div className="error-actions">
          <button
            type="button"
            className="skr-btn skr-btn-primary"
            onClick={onRetry}
          >
            <RotateCcw size={15} />
            <span>Tentar Novamente</span>
          </button>

          {onFallbackToPhoto && (
            <button
              type="button"
              className="skr-btn skr-btn-secondary"
              onClick={onFallbackToPhoto}
            >
              <ImageIcon size={15} />
              <span>Ver Foto Real</span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .blueprint-error-container {
          position: relative;
          width: 100%;
          min-height: 480px;
          border-radius: var(--radius-card);
          background: #0d254c;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }

        .blueprint-error-card {
          position: relative;
          background: rgba(10, 25, 47, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(198, 69, 69, 0.35);
          border-radius: var(--radius-card);
          padding: 36px 32px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .error-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(198, 69, 69, 0.15);
          color: #ff6b6b;
          margin-bottom: 16px;
        }

        .error-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #86868b;
          margin-bottom: 8px;
        }

        .error-title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .error-message {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .error-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

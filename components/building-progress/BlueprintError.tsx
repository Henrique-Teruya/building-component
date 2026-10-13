"use client";

import { RotateCcw } from "lucide-react";

interface BlueprintErrorProps {
  message?: string;
  onRetry: () => void;
}

export function BlueprintError({
  message = "Não foi possível carregar a visualização de blueprint no momento.",
  onRetry,
}: BlueprintErrorProps) {
  return (
    <div className="blueprint-error-container" role="alert" aria-label={message}>
      <button type="button" className="skr-btn skr-btn-primary" onClick={onRetry}>
        <RotateCcw size={15} aria-hidden="true" />
        <span>Tentar novamente</span>
      </button>

      <style jsx>{`
        .blueprint-error-container {
          position: relative;
          width: 100%;
          height: 560px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }

        @media (max-width: 600px) {
          .blueprint-error-container { height: 420px; padding: 16px; }
        }
      `}</style>
    </div>
  );
}

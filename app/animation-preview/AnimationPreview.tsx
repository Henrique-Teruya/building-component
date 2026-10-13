"use client";

import { useCallback, useRef, useState } from "react";
import { BuildingProgressBlueprint, type BlueprintGeneratorInput } from "@/components/building-progress/BuildingProgressBlueprint";

interface AnimationPreviewProps {
  originalPhotoUrl: string;
  blueprintUrl: string;
}

export function AnimationPreview({ originalPhotoUrl, blueprintUrl }: AnimationPreviewProps) {
  const [run, setRun] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const pending = useRef<{ resolve: (url: string) => void; reject: (error: Error) => void } | null>(null);
  const generateBlueprint = useCallback(({ signal }: BlueprintGeneratorInput) => new Promise<string>((resolve, reject) => {
    setWaiting(true);
    const cancel = () => reject(new DOMException("Preview cancelled", "AbortError"));
    signal.addEventListener("abort", cancel, { once: true });
    pending.current = {
      resolve: (url) => {
        signal.removeEventListener("abort", cancel);
        pending.current = null;
        setWaiting(false);
        resolve(url);
      },
      reject: (error) => {
        signal.removeEventListener("abort", cancel);
        pending.current = null;
        setWaiting(false);
        reject(error);
      },
    };
  }), []);

  return (
    <main className="animation-preview-page">
      <header className="preview-heading">
        <h1>Prévia do scan blueprint</h1>
        <p>O scanner revela o blueprint em 0%, seguido pelo avanço até 50%.</p>
      </header>
      <div className="preview-actions">
        <button className="skr-btn skr-btn-primary" disabled={!waiting} onClick={() => pending.current?.resolve(blueprintUrl)}>Revelar resultado</button>
        <button className="skr-btn skr-btn-secondary" disabled={!waiting} onClick={() => pending.current?.reject(new Error("Não foi possível preparar esta visualização. Tente novamente."))}>Simular falha</button>
        <button className="skr-btn skr-btn-secondary" onClick={() => setRun((previous) => previous + 1)}>Repetir</button>
      </div>
      <div className="preview-component">
        <BuildingProgressBlueprint key={run} imageUrl={originalPhotoUrl} progress={50} generateBlueprint={generateBlueprint} />
      </div>
      <style jsx>{`
        .animation-preview-page { max-width: 952px; margin: 48px auto; padding: 0 32px; }
        .preview-heading h1 { font: 700 20px var(--font); letter-spacing: -.03em; margin: 0 0 8px; }
        .preview-heading p { font: 400 13px var(--font); color: var(--text-muted); margin: 0; }
        .preview-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .preview-component { margin-top: 32px; margin-bottom: 32px; }
        @media (max-width: 600px) {
          .animation-preview-page { margin-top: 32px; padding-inline: 20px; }
          .preview-heading h1 { font-size: 18px; }
          .preview-actions :global(.skr-btn) { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>
    </main>
  );
}

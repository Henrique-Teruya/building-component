"use client";

interface ProgressOverlayProps {
  progress: number;
  realPhotoUrl: string;
  animateChanges?: boolean;
}
export function ProgressOverlay({ progress, realPhotoUrl, animateChanges = true }: ProgressOverlayProps) {
  const value = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  return (
    <div className={`progress-overlay-root ${animateChanges ? "can-animate" : ""}`} aria-label={`Progresso: ${Math.round(value)}%`} role="region">
      <div className="progress-built-reveal" style={{ transform: `translateY(${100 - value}%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={realPhotoUrl} alt="" className="progress-built-photo" style={{ transform: `translateY(${value - 100}%)` }} />
      </div>
      {value > 0 && value < 100 && (
        <div className="progress-datum" style={{ transform: `translateY(${-value}%)` }}>
          <span className="datum-line" />
        </div>
      )}
      <style jsx>{`
        .progress-overlay-root { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
        .progress-built-reveal { position: absolute; inset: 0; overflow: hidden; }
        .progress-built-photo { width: 100%; height: 100%; display: block; object-fit: cover; object-position: center; }
        .progress-datum {
          position: absolute;
          inset: 0;
        }
        .datum-line { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; transform: translateY(50%); background: var(--brand-primary); opacity: .7; }
        .can-animate .progress-built-reveal,
        .can-animate .progress-built-photo,
        .can-animate .progress-datum { transition: transform var(--duration-standard) var(--ease-standard); }
        @media (prefers-reduced-motion: reduce) {
          .can-animate .progress-built-reveal, .can-animate .progress-built-photo, .can-animate .progress-datum { transition: none; }
        }
      `}</style>
    </div>
  );
}

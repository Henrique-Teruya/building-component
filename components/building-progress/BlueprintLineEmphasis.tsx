"use client";

import { useId } from "react";

interface BlueprintLineEmphasisProps {
  blueprintUrl: string;
}

export function BlueprintLineEmphasis({ blueprintUrl }: BlueprintLineEmphasisProps) {
  const filterId = `blueprint-line-emphasis-${useId().replace(/:/g, "")}`;

  return (
    <div className="line-emphasis" aria-hidden="true">
      <svg className="filter-definitions" width="0" height="0" focusable="false">
        <defs>
          <filter id={filterId} x="-1%" y="-1%" width="102%" height="102%" colorInterpolationFilters="sRGB">
            <feOffset in="SourceAlpha" dx=".18" dy=".18" result="edge-forward" />
            <feOffset in="SourceAlpha" dx="-.18" dy="-.18" result="edge-back" />
            <feMerge result="line-alpha">
              <feMergeNode in="SourceAlpha" />
              <feMergeNode in="edge-forward" />
              <feMergeNode in="edge-back" />
            </feMerge>
            <feFlood floodColor="var(--brand-contrast, #0057ad)" result="line-color" />
            <feComposite in="line-color" in2="line-alpha" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="emphasis-window">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blueprintUrl} alt="" className="emphasis-image" style={{ filter: `url(#${filterId})` }} />
      </div>
      <style jsx>{`
        .line-emphasis { position: absolute; inset: 0; pointer-events: none; }
        .filter-definitions { position: absolute; }
        .emphasis-window {
          position: absolute;
          inset: 0;
          opacity: .72;
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 7%, #000 14%, transparent 22%);
          mask-image: linear-gradient(to bottom, transparent, #000 7%, #000 14%, transparent 22%);
          animation: emphasis-travel 3s linear infinite;
          will-change: transform;
        }
        .emphasis-image {
          display: block;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          animation: emphasis-image-lock 3s linear infinite;
          will-change: transform;
        }
        @keyframes emphasis-travel {
          from { transform: translateY(-22%); }
          to { transform: translateY(100%); }
        }
        /* Counter the moving window so the blueprint remains pixel-aligned. */
        @keyframes emphasis-image-lock {
          from { transform: translateY(22%); }
          to { transform: translateY(-100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .line-emphasis { display: none; }
          .emphasis-window, .emphasis-image { animation: none; will-change: auto; }
        }
      `}</style>
    </div>
  );
}

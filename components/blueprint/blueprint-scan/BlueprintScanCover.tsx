"use client";

import { useEffect, useRef } from "react";
import { BlueprintScan } from "./BlueprintScan";

type BlueprintScanCoverState = "generating" | "preparing" | "readyToReveal" | "revealing";

interface BlueprintScanCoverProps {
  state: BlueprintScanCoverState;
  onRevealStart: () => void;
  onRevealComplete: () => void;
}

export function BlueprintScanCover({ state, onRevealStart, onRevealComplete }: BlueprintScanCoverProps) {
  const callbacks = useRef({ onRevealStart, onRevealComplete });
  callbacks.current = { onRevealStart, onRevealComplete };

  useEffect(() => {
    if (state === "readyToReveal") callbacks.current.onRevealStart();
  }, [state]);

  useEffect(() => {
    if (state !== "revealing") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => callbacks.current.onRevealComplete(), reducedMotion ? 150 : 400);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className={`blueprint-scan-cover ${state === "revealing" ? "is-revealing" : ""}`} data-cover-state={state}>
      <BlueprintScan finishing={state === "readyToReveal" || state === "revealing"} />
      <style jsx>{`
        .blueprint-scan-cover {
          position: absolute;
          inset: 0;
          z-index: 10;
          cursor: progress;
          transition: opacity 400ms var(--ease-standard);
        }
        .is-revealing { opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          .blueprint-scan-cover { transition-duration: 150ms; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BlueprintLineEmphasis } from "./BlueprintLineEmphasis";
import { ProgressOverlay } from "./ProgressOverlay";
import { RevealWorker } from "./RevealWorker";
import type { ConstructionReveal } from "@/lib/building-progress/progress-animation";

interface ProgressCompositionProps {
  blueprintUrl: string;
  realPhotoUrl: string;
  aspectRatio: number;
  progress: number;
  animateProgress: boolean;
  reveal?: ConstructionReveal | null;
  onRevealComplete?: (runId: number) => void;
}

export function ProgressComposition({
  blueprintUrl, realPhotoUrl, aspectRatio, progress, animateProgress,
  reveal = null, onRevealComplete,
}: ProgressCompositionProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const width = Math.min(frame.clientWidth, frame.clientHeight * aspectRatio);
      const height = width / aspectRatio;
      setBounds((previous) => previous?.width === width && previous.height === height ? previous : { width, height });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    measure();
    return () => observer.disconnect();
  }, [aspectRatio]);

  return (
    <div className="composition-frame" ref={frameRef}>
      <div className="composition-image-plane" style={bounds ?? { width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blueprintUrl} alt="Empreendimento com blueprint na parte a construir" className="composition-image" />
        {progress < 100 && <BlueprintLineEmphasis blueprintUrl={blueprintUrl} />}
        <ProgressOverlay progress={progress} realPhotoUrl={realPhotoUrl} animateChanges={animateProgress} />
      </div>
      {bounds && reveal && onRevealComplete && (
        <div className="composition-worker-plane" style={bounds} aria-hidden="true">
          <RevealWorker key={reveal.runId} reveal={reveal} progress={progress} width={bounds.width} height={bounds.height} onComplete={onRevealComplete} />
        </div>
      )}
      <style jsx>{`
        .composition-frame { position: absolute; inset: 0; }
        .composition-worker-plane {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }
        .composition-image-plane {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
          mask-repeat: no-repeat;
        }
        .composition-image {
          display: block;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      `}</style>
    </div>
  );
}

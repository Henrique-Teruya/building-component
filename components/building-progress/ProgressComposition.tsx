"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ProgressOverlay } from "./ProgressOverlay";

interface ProgressCompositionProps {
  blueprintUrl: string;
  realPhotoUrl: string;
  aspectRatio: number;
  progress: number;
  animateProgress: boolean;
}

export function ProgressComposition({
  blueprintUrl, realPhotoUrl, aspectRatio, progress, animateProgress,
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
        <ProgressOverlay progress={progress} realPhotoUrl={realPhotoUrl} animateChanges={animateProgress} />
      </div>
      <style jsx>{`
        .composition-frame { position: absolute; inset: 0; }
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

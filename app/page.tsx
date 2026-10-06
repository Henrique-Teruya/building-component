"use client";

import React from "react";
import { BuildingProgressBlueprint } from "@/components/building-progress";
import { MOCK_BUILDINGS } from "@/lib/building-progress/mock-buildings";

export default function Home() {
  const defaultBuilding = MOCK_BUILDINGS[0]; // SKR Pinheiros (default)

  return (
    <main className="lean-page-wrapper">
      <div className="component-host">
        <BuildingProgressBlueprint
          buildingId={defaultBuilding.id}
          imageUrl={defaultBuilding.imageUrl}
          progress={defaultBuilding.progress}
        />
      </div>

      <style jsx>{`
        .lean-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .component-host {
          width: 100%;
          max-width: 920px;
        }
      `}</style>
    </main>
  );
}

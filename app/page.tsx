import { BuildingProgressBlueprint } from "@/components/building-progress";
import { MOCK_BUILDINGS } from "@/lib/building-progress/mock-buildings";
import { createDevelopmentBlueprintUrl } from "@/lib/magic-hour/generate-blueprint";
import styles from "./page.module.css";

export default async function Home() {
  const defaultBuilding = MOCK_BUILDINGS[0]; // SKR Pinheiros (default)
  // Opening the playground never submits its synthetic example to the paid API.
  const blueprintUrl = await createDevelopmentBlueprintUrl(defaultBuilding.id, defaultBuilding.name, defaultBuilding.imageUrl);

  return (
    <main className={styles.page}>
      <div className={styles.host}>
        <BuildingProgressBlueprint
          buildingId={defaultBuilding.id}
          imageUrl={defaultBuilding.imageUrl}
          progress={defaultBuilding.progress}
          initialBlueprintUrl={blueprintUrl}
        />
      </div>
    </main>
  );
}

import { MOCK_BUILDINGS } from "@/lib/building-progress/mock-buildings";
import { createDevelopmentBlueprintUrl } from "@/lib/magic-hour/generate-blueprint";
import { AnimationPreview } from "./AnimationPreview";

export default async function AnimationPreviewPage() {
  const building = MOCK_BUILDINGS[0];
  const blueprintUrl = await createDevelopmentBlueprintUrl(building.id, building.name, building.imageUrl);
  return <AnimationPreview originalPhotoUrl={building.imageUrl} blueprintUrl={blueprintUrl} />;
}

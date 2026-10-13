export interface BuildingPhase {
  id: string;
  name: string;
  progress: number; // 0 to 100
  weight?: number; // percent contribution to total
  status?: "completed" | "in_progress" | "pending";
}

export interface BuildingData {
  id: string;
  name: string;
  location?: string;
  imageUrl: string;
  blueprintUrl?: string;
  progress: number; // 0 to 100
  lastUpdated?: string;
  deliveryForecast?: string;
  phases?: BuildingPhase[];
}

export type BlueprintStatus = "idle" | "loading" | "generating" | "completed" | "error";

export type BlueprintState =
  | "idle"
  | "generating"
  | "preparing"
  | "readyToReveal"
  | "revealing"
  | "ready"
  | "error";

export interface BuildingProgressBlueprintProps {
  buildingId?: string;
  imageUrl?: string;
  progress?: number; // Real percentage from SKR backend (0-100)
  initialBlueprintUrl?: string;
  onBlueprintGenerated?: (blueprintUrl: string) => void;
  onProgressChange?: (progress: number) => void;
  className?: string;
  showProgressSlider?: boolean;
  generateBlueprint?: (input: BlueprintGeneratorInput) => Promise<string>;
}

export interface BlueprintGeneratorInput {
  buildingId: string;
  imageUrl: string;
  file?: File;
  force: boolean;
  signal: AbortSignal;
}

export interface BlueprintGenerationRequest {
  buildingId: string;
  imageUrl: string;
  force?: boolean;
}

export interface BlueprintGenerationResponse {
  status: "completed" | "generating" | "cached" | "error";
  blueprintUrl?: string;
  generatedAt?: string;
  cached?: boolean;
  buildingId: string;
  error?: string;
}

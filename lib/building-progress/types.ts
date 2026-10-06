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

export type ViewMode = "progress" | "compare" | "blueprint" | "photo";

export type BlueprintStatus = "idle" | "loading" | "generating" | "completed" | "error";

export type BlueprintState =
  | "idle"
  | "uploading"
  | "processing"
  | "revealing"
  | "completed"
  | "error";

export interface BuildingProgressBlueprintProps {
  buildingId?: string;
  imageUrl?: string;
  progress?: number; // Real percentage from SKR backend (0-100)
  projectName?: string;
  location?: string;
  phases?: BuildingPhase[];
  initialBlueprintUrl?: string;
  onBlueprintGenerated?: (blueprintUrl: string) => void;
  onProgressChange?: (progress: number) => void;
  className?: string;
  showProgressSlider?: boolean;
  defaultViewMode?: ViewMode;
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

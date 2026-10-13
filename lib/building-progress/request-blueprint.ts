import type { BlueprintGeneratorInput } from "./types";

const FAILURE_MESSAGE = "Não foi possível preparar esta visualização. Tente novamente.";

export class BlueprintRequestError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = "BlueprintRequestError";
  }
}

export async function requestBlueprint({ buildingId, imageUrl, file, force, signal }: BlueprintGeneratorInput): Promise<string> {
  const uploadFile = file ?? (imageUrl.startsWith("data:image/svg+xml") ? await rasterizeSvg(imageUrl) : undefined);
  const body = uploadFile ? (() => {
    const form = new FormData();
    form.append("buildingId", buildingId);
    form.append("imageFile", uploadFile);
    form.append("force", String(force));
    return form;
  })() : JSON.stringify({ buildingId, imageUrl, force });
  const response = await fetch("/api/building-blueprint", {
    method: "POST",
    headers: uploadFile ? undefined : { "Content-Type": "application/json" },
    body,
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  const result = data && typeof data === "object" ? data : null;
  if (!response.ok) {
    const message = result && "error" in result && typeof result.error === "string" ? result.error : FAILURE_MESSAGE;
    const code = result && "code" in result && typeof result.code === "string" ? result.code : undefined;
    throw new BlueprintRequestError(message, response.status, code);
  }
  if (!result || !("blueprintUrl" in result) || typeof result.blueprintUrl !== "string" || !result.blueprintUrl.trim()) {
    throw new Error(FAILURE_MESSAGE);
  }
  return result.blueprintUrl;
}

function rasterizeSvg(svgUrl: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Não foi possível preparar a imagem de exemplo."));
        return;
      }
      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], "empreendimento.png", { type: "image/png" }));
        else reject(new Error("Não foi possível preparar a imagem de exemplo."));
      }, "image/png");
    };
    image.onerror = () => reject(new Error("Não foi possível abrir a imagem de exemplo."));
    image.src = svgUrl;
  });
}

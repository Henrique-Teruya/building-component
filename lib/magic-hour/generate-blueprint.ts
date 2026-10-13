import { getMagicHourClient, isMagicHourConfigured } from "./client";
import { ARCHITECTURAL_BLUEPRINT_PROMPT } from "./prompts";
import crypto from "crypto";
import { createPhotoLinework, prepareGeneratedLinework } from "../building-progress/blueprint-linework";
import { prepareBlueprintFrame, restoreBlueprintFrame } from "../building-progress/blueprint-frame";
import { readSourceImage } from "./source-image";
import { BLUEPRINT_STYLE_VERSION } from "../building-progress/blueprint-style";
import { mapMagicHourError } from "./blueprint-error";

interface CachedBlueprint {
  blueprintUrl: string;
  generatedAt: string;
  sourceImageHash: string;
  buildingId: string;
  version: number;
}

// In-memory cache for fast lookup
const blueprintCache = new Map<string, CachedBlueprint>();
const cacheKeyFor = (buildingId: string, imageHash: string) => `${BLUEPRINT_STYLE_VERSION}:padded-frame-v1:${buildingId}:${imageHash}`;

/**
 * Creates a stable hash for the source image URL or buffer
 */
export function computeImageHash(imageUrl: string): string {
  return crypto.createHash("sha256").update(imageUrl).digest("hex").slice(0, 16);
}

/**
 * The local preview traces uploaded raster pixels and returns a transparent PNG.
 * Remote image generation is handled by the configured AI service.
 */
export async function createDevelopmentBlueprintUrl(
  _buildingId: string,
  _projectName = "Empreendimento",
  sourceImageUrl?: string
): Promise<string> {
  const source = sourceImageUrl?.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
  if (!source) {
    throw new Error("Envie uma foto PNG, JPG ou WEBP para a prévia local. Imagens por URL exigem a IA configurada.");
  }
  const blueprint = await createPhotoLinework(Buffer.from(source[1], "base64"));
  return `data:image/png;base64,${blueprint.toString("base64")}`;
}

export interface GenerateBlueprintOptions {
  buildingId: string;
  imageUrl: string;
  projectName?: string;
  force?: boolean;
}

export interface GenerateBlueprintResult {
  blueprintUrl: string;
  generatedAt: string;
  cached: boolean;
  buildingId: string;
  sourceImageHash: string;
}

/**
 * Server-side orchestrator for architectural blueprint generation.
 */
export async function generateBuildingBlueprint(
  options: GenerateBlueprintOptions
): Promise<GenerateBlueprintResult> {
  const { buildingId, imageUrl, projectName, force = false } = options;
  const imageHash = computeImageHash(imageUrl);
  const cacheKey = cacheKeyFor(buildingId, imageHash);

  // 1. Check existing cache
  const cached = blueprintCache.get(cacheKey);
  if (cached && !force) {
    return {
      blueprintUrl: cached.blueprintUrl,
      generatedAt: cached.generatedAt,
      cached: true,
      buildingId,
      sourceImageHash: imageHash,
    };
  }

  const magicHourClient = getMagicHourClient();

  // 2. If Magic Hour is configured, call the API
  if (magicHourClient && isMagicHourConfigured()) {
    try {
      // Credit balance and model access are separate. Free accounts cannot use
      // Nano Banana 2 or request 2k output, even when they have enough credits.
      const account = await magicHourClient.v1.account.list({ timeout: 15_000 });
      const profile = account.tier === "free"
        ? { model: "qwen-image-2.1", resolution: "640px" } as const
        : { model: "nano-banana-2", resolution: "2k" } as const;

      const source = await readSourceImage(imageUrl);
      const frame = await prepareBlueprintFrame(source, profile.resolution === "640px" ? 640 : 2048);
      const inputAssetPath = await magicHourClient.v1.files.uploadFile(
        new File([new Uint8Array(frame.image)], "empreendimento.png", { type: "image/png" })
      );

      const result = await magicHourClient.v1.aiImageEditor.generate(
        {
          assets: {
            imageFilePaths: [inputAssetPath],
          },
          name: `skr-blueprint-${buildingId}`,
          style: {
            prompt: `${ARCHITECTURAL_BLUEPRINT_PROMPT}\nPreserve the entire ${frame.width} x ${frame.height} input canvas, including its blank margins. Do not crop, zoom, center or move the building. The blank margins will be removed after generation.`,
          },
          ...profile,
          imageCount: 1,
          aspectRatio: frame.aspectRatio,
        },
        {
          waitForCompletion: true,
          downloadOutputs: false,
        }
      );

      const downloadUrl = result.downloads?.[0]?.url;

      if (!downloadUrl) {
        throw new Error(
          `Magic Hour response não continha download URL. Status: ${result.status}`
        );
      }

      const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error("Não foi possível carregar o resultado da IA.");
      const generatedImage = Buffer.from(await response.arrayBuffer());
      if (generatedImage.length > 24 * 1024 * 1024) throw new Error("A imagem gerada excede o limite de processamento.");
      const alignedImage = await restoreBlueprintFrame(generatedImage, frame);
      const linework = await prepareGeneratedLinework(alignedImage);
      const blueprintUrl = `data:image/png;base64,${linework.toString("base64")}`;
      const generatedAt = new Date().toISOString();
      const entry: CachedBlueprint = {
        blueprintUrl,
        generatedAt,
        sourceImageHash: imageHash,
        buildingId,
        version: (cached?.version ?? 0) + 1,
      };

      blueprintCache.set(cacheKey, entry);

      return {
        blueprintUrl,
        generatedAt,
        cached: false,
        buildingId,
        sourceImageHash: imageHash,
      };
    } catch (apiError: unknown) {
      console.error(
        "[generateBuildingBlueprint] Magic Hour API execution error:",
        apiError instanceof Error ? apiError.message : "Erro desconhecido"
      );
      throw mapMagicHourError(apiError);
    }
  }

  // 3. Fallback / Development mode (no API key configured)
  const devBlueprintUrl = await createDevelopmentBlueprintUrl(buildingId, projectName, imageUrl);
  const generatedAt = new Date().toISOString();

  const entry: CachedBlueprint = {
    blueprintUrl: devBlueprintUrl,
    generatedAt,
    sourceImageHash: imageHash,
    buildingId,
    version: 1,
  };
  blueprintCache.set(cacheKey, entry);

  return {
    blueprintUrl: devBlueprintUrl,
    generatedAt,
    cached: false,
    buildingId,
    sourceImageHash: imageHash,
  };
}

export function getCachedBlueprint(buildingId: string, imageUrl: string): CachedBlueprint | null {
  const hash = computeImageHash(imageUrl);
  return blueprintCache.get(cacheKeyFor(buildingId, hash)) ?? null;
}

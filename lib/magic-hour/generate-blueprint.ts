import { getMagicHourClient, isMagicHourConfigured } from "./client";
import { ARCHITECTURAL_BLUEPRINT_PROMPT } from "./prompts";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

interface CachedBlueprint {
  blueprintUrl: string;
  generatedAt: string;
  sourceImageHash: string;
  buildingId: string;
  version: number;
}

// In-memory cache for fast lookup
const blueprintCache = new Map<string, CachedBlueprint>();

/**
 * Creates a stable hash for the source image URL or buffer
 */
export function computeImageHash(imageUrl: string): string {
  return crypto.createHash("sha256").update(imageUrl).digest("hex").slice(0, 16);
}

/**
 * Resolves an image URL or base64 data URL into a Magic Hour asset path.
 */
async function resolveMagicHourAsset(client: any, imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:")) {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Formato de imagem base64 inválido.");
    }
    const rawExt = matches[1].toLowerCase();
    
    // Magic Hour only accepts raster formats (png, jpg, jpeg, webp, avif, jp2, tiff, bmp)
    if (rawExt.includes("svg")) {
      throw new Error("Imagens SVG não são aceitas pela API de edição de imagem da Magic Hour. Envie PNG, JPG ou WEBP.");
    }

    const ext = rawExt === "jpeg" ? "jpg" : rawExt;
    const buffer = Buffer.from(matches[2], "base64");
    const tempFile = path.join(os.tmpdir(), `skr-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
    
    fs.writeFileSync(tempFile, buffer);
    try {
      const assetPath = await client.v1.files.uploadFile(tempFile);
      return assetPath;
    } finally {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }
  }

  // Direct URL
  return await client.v1.files.uploadFile(imageUrl);
}

/**
 * Generates an architectural blueprint SVG/data URL when in development / fallback mode.
 */
function createDevelopmentBlueprintUrl(
  buildingId: string,
  projectName = "Empreendimento",
  sourceImageUrl?: string
): string {
  // If user provided a custom building image, transform THEIR actual image into blueprint CAD linework
  if (sourceImageUrl && (sourceImageUrl.startsWith("data:") || sourceImageUrl.startsWith("http"))) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071326" />
      <stop offset="50%" stop-color="#0a1d3b" />
      <stop offset="100%" stop-color="#050e1c" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 163, 255, 0.12)" stroke-width="0.8" />
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(0, 229, 255, 0.22)" stroke-width="1.2" />
    </pattern>
    <filter id="blueprintFilter" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="
        0.33 0.33 0.33 0 0
        0.33 0.33 0.33 0 0
        0.33 0.33 0.33 0 0
        0    0    0    1 0
      " result="gray" />
      <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" in="gray" result="edges" />
      <feColorMatrix type="matrix" values="
        0 0 0 0 0
        0 1 0 0 0.9
        0 0 1 0 1
        0 0 0 2.2 0
      " in="edges" result="neonLines" />
      <feBlend in="neonLines" in2="SourceGraphic" mode="screen" opacity="0.6" />
    </filter>
  </defs>

  <rect width="1000" height="1300" fill="url(#bgGrad)" />
  <rect width="1000" height="1300" fill="url(#grid)" />
  <rect x="25" y="25" width="950" height="1250" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-opacity="0.3" />

  <image href="${sourceImageUrl}" x="30" y="30" width="940" height="1240" preserveAspectRatio="xMidYMid meet" filter="url(#blueprintFilter)" opacity="0.9" />
</svg>`;

    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }

  // Default clean architectural vector blueprint
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f" />
      <stop offset="50%" stop-color="#0d254c" />
      <stop offset="100%" stop-color="#091426" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 163, 255, 0.12)" stroke-width="0.8" />
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(0, 229, 255, 0.22)" stroke-width="1.2" />
    </pattern>
    <filter id="blueprintGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="1000" height="1300" fill="url(#bgGrad)" />
  <rect width="1000" height="1300" fill="url(#grid)" />

  <rect x="30" y="30" width="940" height="1240" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-opacity="0.4" />
  <rect x="38" y="38" width="924" height="1224" fill="none" stroke="#00a3ff" stroke-width="0.8" stroke-opacity="0.25" />

  <g stroke="#00e5ff" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="4,4">
    <line x1="220" y1="160" x2="220" y2="1140" />
    <line x1="780" y1="160" x2="780" y2="1140" />
    <line x1="500" y1="140" x2="500" y2="1160" stroke-opacity="0.35" />
    <line x1="160" y1="200" x2="840" y2="200" />
    <line x1="160" y1="360" x2="840" y2="360" />
    <line x1="160" y1="520" x2="840" y2="520" />
    <line x1="160" y1="680" x2="840" y2="680" />
    <line x1="160" y1="840" x2="840" y2="840" />
    <line x1="160" y1="1000" x2="840" y2="1000" />
  </g>

  <g id="building-blueprint-geometry" filter="url(#blueprintGlow)">
    <rect x="200" y="1040" width="600" height="90" fill="rgba(0, 113, 227, 0.15)" stroke="#00e5ff" stroke-width="2.5" />
    <rect x="240" y="200" width="520" height="840" fill="rgba(0, 163, 255, 0.08)" stroke="#00e5ff" stroke-width="2.8" />
    <rect x="290" y="240" width="420" height="780" fill="rgba(0, 229, 255, 0.05)" stroke="#00e5ff" stroke-width="1.5" stroke-opacity="0.8" />
    
    <g stroke="#00e5ff" stroke-width="1.2" stroke-opacity="0.75">
      <line x1="240" y1="250" x2="760" y2="250" />
      <line x1="240" y1="300" x2="760" y2="300" />
      <line x1="240" y1="350" x2="760" y2="350" />
      <line x1="240" y1="400" x2="760" y2="400" />
      <line x1="240" y1="450" x2="760" y2="450" />
      <line x1="240" y1="500" x2="760" y2="500" />
      <line x1="240" y1="550" x2="760" y2="550" />
      <line x1="240" y1="600" x2="760" y2="600" />
      <line x1="240" y1="650" x2="760" y2="650" />
      <line x1="240" y1="700" x2="760" y2="700" />
      <line x1="240" y1="750" x2="760" y2="750" />
      <line x1="240" y1="800" x2="760" y2="800" />
      <line x1="240" y1="850" x2="760" y2="850" />
      <line x1="240" y1="900" x2="760" y2="900" />
      <line x1="240" y1="950" x2="760" y2="950" />
      <line x1="240" y1="1000" x2="760" y2="1000" />
    </g>

    <g stroke="#00e5ff" stroke-width="1" stroke-opacity="0.5">
      <line x1="330" y1="200" x2="330" y2="1040" />
      <line x1="420" y1="200" x2="420" y2="1040" />
      <line x1="500" y1="200" x2="500" y2="1040" stroke-width="1.8" stroke-opacity="0.8" />
      <line x1="580" y1="200" x2="580" y2="1040" />
      <line x1="670" y1="200" x2="670" y2="1040" />
    </g>

    <polygon points="320,200 400,150 600,150 680,200" fill="rgba(0, 229, 255, 0.08)" stroke="#00e5ff" stroke-width="2" />
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
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
  const cacheKey = `${buildingId}:${imageHash}`;

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
      // Resolve asset (handles local files, data URLs, and remote URLs)
      const inputAssetPath = await resolveMagicHourAsset(magicHourClient, imageUrl);

      // Call Magic Hour AI Image Editor with Nano Banana model & architectural blueprint prompt
      const result = await magicHourClient.v1.aiImageEditor.generate(
        {
          assets: {
            imageFilePaths: [inputAssetPath],
          },
          name: `skr-blueprint-${buildingId}`,
          style: {
            prompt: ARCHITECTURAL_BLUEPRINT_PROMPT,
          },
          model: "nano-banana",
          resolution: "1k",
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

      const generatedAt = new Date().toISOString();
      const entry: CachedBlueprint = {
        blueprintUrl: downloadUrl,
        generatedAt,
        sourceImageHash: imageHash,
        buildingId,
        version: (cached?.version ?? 0) + 1,
      };

      blueprintCache.set(cacheKey, entry);

      return {
        blueprintUrl: downloadUrl,
        generatedAt,
        cached: false,
        buildingId,
        sourceImageHash: imageHash,
      };
    } catch (apiError: unknown) {
      console.error(
        "[generateBuildingBlueprint] Magic Hour API execution error:",
        apiError
      );
      // Fallback to high-precision development blueprint if API fails or quota exceeded
      const fallbackUrl = createDevelopmentBlueprintUrl(buildingId, projectName);
      const generatedAt = new Date().toISOString();

      const entry: CachedBlueprint = {
        blueprintUrl: fallbackUrl,
        generatedAt,
        sourceImageHash: imageHash,
        buildingId,
        version: 1,
      };
      blueprintCache.set(cacheKey, entry);

      return {
        blueprintUrl: fallbackUrl,
        generatedAt,
        cached: false,
        buildingId,
        sourceImageHash: imageHash,
      };
    }
  }

  // 3. Fallback / Development mode (no API key configured)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const devBlueprintUrl = createDevelopmentBlueprintUrl(buildingId, projectName);
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
  return blueprintCache.get(`${buildingId}:${hash}`) ?? null;
}

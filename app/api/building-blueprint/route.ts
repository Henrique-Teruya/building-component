import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BlueprintGenerationError } from "@/lib/magic-hour/blueprint-error";
import {
  generateBuildingBlueprint,
  getCachedBlueprint,
} from "@/lib/magic-hour/generate-blueprint";

export const runtime = "nodejs";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = 14 * 1024 * 1024;

// Zod schema for request validation
const RequestSchema = z.object({
  buildingId: z
    .string()
    .min(1, { message: "buildingId é obrigatório" })
    .max(100),
  imageUrl: z
    .string()
    .min(1, { message: "imageUrl é obrigatório" })
    .max(MAX_REQUEST_BYTES)
    .refine(
      (val) =>
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/") ||
        val.startsWith("data:"),
      { message: "imageUrl deve ser uma URL válida ou caminho local" }
    ),
  projectName: z.string().optional(),
  force: z.boolean().optional().default(false),
});

/**
 * POST /api/building-blueprint
 * Generates or retrieves the canonical architectural blueprint for a building.
 */
export async function POST(req: NextRequest) {
  try {
    const declaredLength = Number(req.headers.get("content-length"));
    if (declaredLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { status: "error", error: "A imagem deve ter no máximo 10 MB." },
        { status: 413 }
      );
    }

    let rawBody: unknown;
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("imageFile");
      if (!(file instanceof File) || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        return NextResponse.json(
          { status: "error", error: "Envie uma imagem PNG, JPG ou WEBP." },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { status: "error", error: "A imagem deve ter no máximo 10 MB." },
          { status: 413 }
        );
      }
      const imageUrl = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
      rawBody = {
        buildingId: form.get("buildingId"),
        imageUrl,
        force: form.get("force") === "true",
      };
    } else {
      rawBody = await req.json();
    }
    const parseResult = RequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          status: "error",
          error: "Entrada inválida",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { buildingId, imageUrl, projectName, force } = parseResult.data;

    // Check if blueprint already exists in cache
    if (!force) {
      const existing = getCachedBlueprint(buildingId, imageUrl);
      if (existing) {
        return NextResponse.json(
          {
            status: "completed",
            blueprintUrl: existing.blueprintUrl,
            generatedAt: existing.generatedAt,
            cached: true,
            buildingId,
          },
          { status: 200 }
        );
      }
    }

    // Call generator service (server-side only)
    const result = await generateBuildingBlueprint({
      buildingId,
      imageUrl,
      projectName,
      force,
    });

    return NextResponse.json(
      {
        status: "completed",
        blueprintUrl: result.blueprintUrl,
        generatedAt: result.generatedAt,
        cached: result.cached,
        buildingId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof BlueprintGenerationError) {
      return NextResponse.json(
        { status: "error", code: error.code, error: error.message },
        { status: error.status }
      );
    }
    console.error("[POST /api/building-blueprint] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Não foi possível gerar o blueprint. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/building-blueprint?buildingId=...&imageUrl=...
 * Query cache status without generating
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get("buildingId");
  const imageUrl = searchParams.get("imageUrl");

  if (!buildingId || !imageUrl) {
    return NextResponse.json(
      { error: "Parâmetros 'buildingId' e 'imageUrl' são obrigatórios" },
      { status: 400 }
    );
  }

  const existing = getCachedBlueprint(buildingId, imageUrl);

  if (existing) {
    return NextResponse.json({
      status: "completed",
      blueprintUrl: existing.blueprintUrl,
      generatedAt: existing.generatedAt,
      cached: true,
      buildingId,
    });
  }

  return NextResponse.json(
    { status: "not_found", cached: false, buildingId },
    { status: 404 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  generateBuildingBlueprint,
  getCachedBlueprint,
} from "@/lib/magic-hour/generate-blueprint";

// Zod schema for request validation
const RequestSchema = z.object({
  buildingId: z
    .string()
    .min(1, { message: "buildingId é obrigatório" })
    .max(100),
  imageUrl: z
    .string()
    .min(1, { message: "imageUrl é obrigatório" })
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
    const rawBody = await req.json();
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
    console.error("[POST /api/building-blueprint] Error:", error);
    const message = error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json(
      {
        status: "error",
        error: message,
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

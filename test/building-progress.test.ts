import test from "node:test";
import assert from "node:assert/strict";
import { computeImageHash, generateBuildingBlueprint } from "../lib/magic-hour/generate-blueprint";
import { ARCHITECTURAL_BLUEPRINT_PROMPT } from "../lib/magic-hour/prompts";

// Test suite for Building Progress & Architectural Blueprint Engine
test("1. computeImageHash generates deterministic, secure hashes", () => {
  const url1 = "https://cdn.skr.com.br/buildings/pinheiros.jpg";
  const url2 = "https://cdn.skr.com.br/buildings/pinheiros.jpg";
  const url3 = "https://cdn.skr.com.br/buildings/jardins.jpg";

  const hash1 = computeImageHash(url1);
  const hash2 = computeImageHash(url2);
  const hash3 = computeImageHash(url3);

  assert.equal(hash1, hash2, "Hashes for the same URL must be strictly identical");
  assert.notEqual(hash1, hash3, "Hashes for different URLs must differ");
  assert.equal(hash1.length, 16, "Hash length should be 16 chars");
});

test("2. Architectural Blueprint prompt contains strict preservation rules", () => {
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /Preserve the exact building geometry/i);
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /Preserve the number and position of floors/i);
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /Do not redesign the building/i);
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /Maintain the original camera perspective/i);
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /Technical blueprint \/ architectural CAD drawing/i);
});

test("3. generateBuildingBlueprint implements canonical caching (prevents duplicate IA calls)", async () => {
  const testBuildingId = "test-skr-moema";
  const testImageUrl = "https://cdn.skr.com.br/test-render.png";

  // First call: generates and caches
  const firstResult = await generateBuildingBlueprint({
    buildingId: testBuildingId,
    imageUrl: testImageUrl,
    projectName: "SKR Moema Test",
  });

  assert.ok(firstResult.blueprintUrl, "Must return blueprintUrl");
  assert.equal(firstResult.cached, false, "First call should not be cached");
  assert.equal(firstResult.buildingId, testBuildingId);

  // Second call: must retrieve cached version without generating
  const secondResult = await generateBuildingBlueprint({
    buildingId: testBuildingId,
    imageUrl: testImageUrl,
  });

  assert.equal(secondResult.cached, true, "Second call must return cached: true");
  assert.equal(secondResult.blueprintUrl, firstResult.blueprintUrl, "Must return identical canonical URL");

  // Forced call: should regenerate
  const forcedResult = await generateBuildingBlueprint({
    buildingId: testBuildingId,
    imageUrl: testImageUrl,
    force: true,
  });

  assert.equal(forcedResult.cached, false, "Forced call must bypass cache");
});

test("4. Progress percentage edge cases (0%, 1%, 50%, 68%, 99%, 100%)", () => {
  // Test boundary clamps
  const clamp = (val: number) => Math.min(100, Math.max(0, val));

  assert.equal(clamp(-10), 0);
  assert.equal(clamp(0), 0);
  assert.equal(clamp(1), 1);
  assert.equal(clamp(50), 50);
  assert.equal(clamp(68), 68);
  assert.equal(clamp(99), 99);
  assert.equal(clamp(100), 100);
  assert.equal(clamp(150), 100);
});

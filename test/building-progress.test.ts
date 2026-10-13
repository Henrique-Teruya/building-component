import test from "node:test";
import assert from "node:assert/strict";
import { computeImageHash, generateBuildingBlueprint } from "../lib/magic-hour/generate-blueprint";
import { ARCHITECTURAL_BLUEPRINT_PROMPT } from "../lib/magic-hour/prompts";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { POST } from "../app/api/building-blueprint/route";
import { MOCK_BUILDINGS } from "../lib/building-progress/mock-buildings";
import { compositionAspectRatio, prepareRenderedVisual } from "../lib/building-progress/prepare-visual";
import { createPhotoLinework, prepareGeneratedLinework } from "../lib/building-progress/blueprint-linework";
import { ApiError } from "magic-hour";
import { getMagicHourClient } from "../lib/magic-hour/client";
import { createDevelopmentBlueprintUrl } from "../lib/magic-hour/generate-blueprint";
import { BlueprintRequestError, requestBlueprint } from "../lib/building-progress/request-blueprint";
import { prepareBlueprintFrame, restoreBlueprintFrame } from "../lib/building-progress/blueprint-frame";
import { readSourceImage } from "../lib/magic-hour/source-image";
import {
  animateConstructionProgress, clampConstructionProgress,
  PROGRESS_REVEAL_HOLD_MS, PROGRESS_REVEAL_DURATION_MS,
} from "../lib/building-progress/progress-animation";

function manualAnimationClock() {
  let time = 0;
  let nextId = 0;
  const frames = new Map<number, (time: number) => void>();
  return {
    now: () => time,
    request: (callback: (time: number) => void) => {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancel: (id: number) => { frames.delete(id); },
    advance: (nextTime: number) => {
      time = nextTime;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(time));
    },
    pendingCount: () => frames.size,
  };
}

test("Construction entrance holds a blueprint at 0, rises monotonically and stops at the real target", () => {
  for (const target of [0, 50, 73, 100]) {
    const clock = manualAnimationClock();
    const values: number[] = [];
    let completed = 0;
    animateConstructionProgress({
      from: 0, to: target, delayMs: PROGRESS_REVEAL_HOLD_MS, reducedMotion: false, clock,
      onUpdate: (value) => values.push(value), onComplete: () => { completed++; },
    });
    clock.advance(PROGRESS_REVEAL_HOLD_MS - 1);
    assert.equal(values.at(-1), 0, "The original photo must remain fully hidden during the initial hold");
    clock.advance(PROGRESS_REVEAL_HOLD_MS + PROGRESS_REVEAL_DURATION_MS / 2);
    if (target > 0) assert.ok(values.at(-1)! > 0 && values.at(-1)! < target);
    clock.advance(PROGRESS_REVEAL_HOLD_MS + PROGRESS_REVEAL_DURATION_MS);
    assert.equal(values.at(-1), target);
    assert.ok(values.every((value, index) => value >= (values[index - 1] ?? 0) && value <= target));
    assert.equal(completed, 1);
    assert.equal(clock.pendingCount(), 0);
  }
});

test("Cancelling an entrance prevents stale updates after user input, a new image or unmount", () => {
  const clock = manualAnimationClock();
  const values: number[] = [];
  let completed = false;
  const cancel = animateConstructionProgress({
    from: 0, to: 50, reducedMotion: false, clock,
    onUpdate: (value) => values.push(value), onComplete: () => { completed = true; },
  });
  clock.advance(300);
  const lastValue = values.at(-1);
  cancel();
  clock.advance(5000);
  assert.equal(values.at(-1), lastValue);
  assert.equal(completed, false);
  assert.equal(clock.pendingCount(), 0);
});

test("Reduced motion preserves the 0% reveal then sets the target without a sweep", () => {
  const clock = manualAnimationClock();
  const values: number[] = [];
  animateConstructionProgress({
    from: 0, to: 50, delayMs: PROGRESS_REVEAL_HOLD_MS, reducedMotion: true, clock,
    onUpdate: (value) => values.push(value), onComplete: () => undefined,
  });
  clock.advance(PROGRESS_REVEAL_HOLD_MS - 1);
  assert.deepEqual(values, [0]);
  clock.advance(PROGRESS_REVEAL_HOLD_MS);
  assert.deepEqual(values, [0, 50]);
  assert.equal(clock.pendingCount(), 0);
});

test("API preserves the provider's 402 and the client receives a safe, actionable error", async (t) => {
  const previousKey = process.env.MAGIC_HOUR_API_KEY;
  process.env.MAGIC_HOUR_API_KEY = "test-key-never-sent";
  const client = getMagicHourClient();
  assert.ok(client);
  t.mock.method(client.v1.account, "list", async () => ({ credits: 600, tier: "free", subscription: null, id: "test-account", email: null }));
  const upload = t.mock.method(client.v1.files, "uploadFile", async () => "api-assets/test/building.png");
  t.mock.method(client.v1.aiImageEditor, "generate", async () => {
    throw new ApiError({ method: "post", path: "/v1/ai-image-editor", headers: { Authorization: "private-test-token" } },
      new Response(JSON.stringify({ code: "insufficient_credits", message: "private-account-details" }), { status: 402 }));
  });
  t.mock.method(console, "error", () => undefined);
  try {
    const bytes = await sharp({ create: { width: 100, height: 130, channels: 3, background: "white" } }).png().toBuffer();
    const input = { buildingId: "provider-402", imageUrl: `data:image/png;base64,${bytes.toString("base64")}`, force: true, signal: new AbortController().signal };
    const response = await POST(new NextRequest("http://localhost/api/building-blueprint", {
      method: "POST", body: JSON.stringify(input), headers: { "Content-Type": "application/json" },
    }));
    assert.equal(response.status, 402);
    const payload: unknown = await response.clone().json();
    assert.deepEqual(payload, {
      status: "error", code: "billing_restricted",
      error: "O Magic Hour recusou a geração. Verifique o saldo e o acesso do plano ao modelo e à resolução.",
    });
    assert.equal(upload.mock.callCount(), 1);
    t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(requestBlueprint(input), (error: unknown) => {
      assert.ok(error instanceof BlueprintRequestError);
      assert.equal(error.status, 402);
      assert.equal(error.code, "billing_restricted");
      assert.match(error.message, /saldo e o acesso do plano/);
      assert.doesNotMatch(error.message, /private-/);
      return true;
    });
  } finally {
    if (previousKey === undefined) delete process.env.MAGIC_HOUR_API_KEY;
    else process.env.MAGIC_HOUR_API_KEY = previousKey;
  }
});

test("A Free account with 600 credits generates with an eligible model and resolution; paid accounts retain 2k", async (t) => {
  const previousKey = process.env.MAGIC_HOUR_API_KEY;
  process.env.MAGIC_HOUR_API_KEY = "test-key-never-sent";
  const client = getMagicHourClient();
  assert.ok(client);
  const image = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="130">
    <rect width="100" height="130" fill="white"/><path d="M20 120V10h60v110Z" fill="none" stroke="#0071e3"/>
  </svg>`)).png().toBuffer();
  const account = t.mock.method(client.v1.account, "list", async () => ({ credits: 600, tier: "free", subscription: null, id: "test-account", email: null }));
  let providerInput = image;
  const upload = t.mock.method(client.v1.files, "uploadFile", async (file: Parameters<typeof client.v1.files.uploadFile>[0]) => {
    assert.ok(file instanceof File);
    providerInput = Buffer.from(await file.arrayBuffer());
    return "api-assets/test/building.png";
  });
  const generate = t.mock.method(client.v1.aiImageEditor, "generate", async () => ({
    status: "complete", downloads: [{ url: "https://example.com/generated.png" }],
  }));
  const download = t.mock.method(globalThis, "fetch", async () => new Response(providerInput));
  try {
    for (const tier of ["free", "creator"] as const) {
      account.mock.mockImplementation(async () => ({ credits: 600, tier, subscription: null, id: "test-account", email: null }));
      const response = await POST(new NextRequest("http://localhost/api/building-blueprint", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId: `eligible-${tier}`, imageUrl: `data:image/png;base64,${image.toString("base64")}`, force: true }),
      }));
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.match(payload.blueprintUrl, /^data:image\/png;base64,/);
      const metadata = await sharp(Buffer.from(payload.blueprintUrl.split(",")[1], "base64")).metadata();
      assert.equal(metadata.hasAlpha, true);
      assert.doesNotThrow(() => compositionAspectRatio({ width: 100, height: 130 }, { width: metadata.width!, height: metadata.height! }));
      const request = generate.mock.calls.at(-1)?.arguments[0];
      assert.ok(request);
      assert.equal(request.model, tier === "free" ? "qwen-image-2.1" : "nano-banana-2");
      assert.equal(request.resolution, tier === "free" ? "640px" : "2k");
      assert.equal(request.imageCount, 1);
      assert.equal(request.aspectRatio, "4:5");
      assert.deepEqual(request.assets.imageFilePaths, ["api-assets/test/building.png"]);
    }
    assert.equal(account.mock.callCount(), 2);
    assert.equal(upload.mock.callCount(), 2);
    assert.equal(generate.mock.callCount(), 2);
    assert.equal(download.mock.callCount(), 2);
  } finally {
    if (previousKey === undefined) delete process.env.MAGIC_HOUR_API_KEY;
    else process.env.MAGIC_HOUR_API_KEY = previousKey;
  }
});

test("A 352x640 quantized result restores a 9:16 source and retains all four image edges", async () => {
  const source = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640">
    <rect width="360" height="640" fill="white"/>
    <rect x="0" y="0" width="360" height="5" fill="#0071e3"/>
    <rect x="0" y="635" width="360" height="5" fill="#0071e3"/>
    <rect x="0" y="0" width="5" height="640" fill="#0071e3"/>
    <rect x="355" y="0" width="5" height="640" fill="#0071e3"/>
  </svg>`)).png().toBuffer();
  const frame = await prepareBlueprintFrame(source, 640);
  assert.equal(frame.aspectRatio, "9:16");
  const quantized = await sharp(frame.image).resize(352, 640, { fit: "fill" }).png().toBuffer();
  const restored = await restoreBlueprintFrame(quantized, frame);
  const { data, info } = await sharp(restored).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 360);
  assert.equal(info.height, 640);
  assert.equal(compositionAspectRatio({ width: 360, height: 640 }, info), 9 / 16);
  for (const [x, y] of [[180, 2], [180, 637], [2, 320], [357, 320]]) {
    const i = (y * info.width + x) * info.channels;
    assert.ok(data[i + 2] > 180 && data[i] < 30, "Original border marks must not be cropped");
  }
});

test("Padding is reversible for arbitrary portrait, landscape and square photos", async () => {
  for (const [width, height] of [[583, 1100], [1200, 731], [900, 900]]) {
    const source = await sharp({ create: { width, height, channels: 3, background: "#0071e3" } }).png().toBuffer();
    const frame = await prepareBlueprintFrame(source, 640);
    const restored = await restoreBlueprintFrame(frame.image, frame);
    const { data, info } = await sharp(restored).raw().toBuffer({ resolveWithObject: true });
    assert.doesNotThrow(() => compositionAspectRatio({ width, height }, info));
    for (const [x, y] of [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]]) {
      const i = (y * info.width + x) * info.channels;
      assert.ok(data[i] < 5 && data[i + 2] > 220, "Only added white margins may be removed");
    }
  }
});

test("Source orientation is respected and unrelated generated canvases are rejected", async () => {
  const source = await sharp({ create: { width: 640, height: 360, channels: 3, background: "#0071e3" } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const frame = await prepareBlueprintFrame(source, 640);
  assert.equal(frame.aspectRatio, "9:16");
  assert.equal(frame.content.width, 360);
  assert.equal(frame.content.height, 640);
  const square = await sharp({ create: { width: 640, height: 640, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(restoreBlueprintFrame(square, frame), /canvas incompatível/);
});

test("Source loading rejects private addresses and oversized inline bodies", async () => {
  await assert.rejects(readSourceImage("http://127.0.0.1/photo.png"), /URL pública/);
  await assert.rejects(readSourceImage("http://[::1]/photo.png"), /URL pública/);
  const oversized = `data:image/png;base64,${Buffer.alloc(11 * 1024 * 1024).toString("base64")}`;
  await assert.rejects(readSourceImage(oversized), /Tamanho da imagem inválido/);
});

test("The sample blueprint works locally even with an API key and a rejecting provider", async (t) => {
  const previousKey = process.env.MAGIC_HOUR_API_KEY;
  process.env.MAGIC_HOUR_API_KEY = "test-key-never-sent";
  const client = getMagicHourClient();
  assert.ok(client);
  const upload = t.mock.method(client.v1.files, "uploadFile", async () => { throw new Error("No network allowed"); });
  const generate = t.mock.method(client.v1.aiImageEditor, "generate", async () => { throw new Error("No network allowed"); });
  try {
    const building = MOCK_BUILDINGS[0];
    const url = await createDevelopmentBlueprintUrl(building.id, building.name, building.imageUrl);
    assert.match(url, /^data:image\/png;base64,/);
    const metadata = await sharp(Buffer.from(url.split(",")[1], "base64")).metadata();
    assert.equal(metadata.width, 1000);
    assert.equal(metadata.height, 1300);
    assert.equal(metadata.hasAlpha, true);
    assert.equal(upload.mock.callCount(), 0);
    assert.equal(generate.mock.callCount(), 0);
  } finally {
    if (previousKey === undefined) delete process.env.MAGIC_HOUR_API_KEY;
    else process.env.MAGIC_HOUR_API_KEY = previousKey;
  }
});

test("Non-JSON gateway failures keep a useful error and empty successful responses are rejected", async (t) => {
  const input = { buildingId: "gateway-test", imageUrl: "https://example.com/building.png", force: false, signal: new AbortController().signal };
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response("Bad gateway", { status: 502 }));
  await assert.rejects(requestBlueprint(input), (error: unknown) => {
    assert.ok(error instanceof BlueprintRequestError);
    assert.equal(error.status, 502);
    assert.match(error.message, /Tente novamente/);
    return true;
  });
  fetchMock.mock.mockImplementation(async () => Response.json({ blueprintUrl: "" }));
  await assert.rejects(requestBlueprint(input), /Tente novamente/);
});

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
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /PRINCIPAL projecting building volumes/i);
  assert.match(ARCHITECTURAL_BLUEPRINT_PROMPT, /TWO projecting facade volumes should have FOUR bold vertical edge bundles/i);
});

test("3. generateBuildingBlueprint implements canonical caching (prevents duplicate IA calls)", async () => {
  const testBuildingId = "test-skr-moema";
  const testImageUrl = MOCK_BUILDINGS[0].imageUrl;

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
  const clamp = clampConstructionProgress;

  assert.equal(clamp(-10), 0);
  assert.equal(clamp(0), 0);
  assert.equal(clamp(1), 1);
  assert.equal(clamp(50), 50);
  assert.equal(clamp(68), 68);
  assert.equal(clamp(99), 99);
  assert.equal(clamp(100), 100);
  assert.equal(clamp(150), 100);
  assert.equal(clamp(NaN), 0);
  assert.equal(clamp(Infinity), 0);
});

test("5. Custom uploaded image produces a raster blueprint from the original pixels", async () => {
  const source = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#e2e8f0" },
  }).png().toBuffer();
  const customImageData = `data:image/png;base64,${source.toString("base64")}`;
  const result = await generateBuildingBlueprint({
    buildingId: "custom-building-unique",
    imageUrl: customImageData,
    force: true,
  });

  assert.ok(result.blueprintUrl.startsWith("data:image/png;base64,"));
  const output = Buffer.from(result.blueprintUrl.split(",")[1], "base64");
  assert.equal((await sharp(output).metadata()).format, "png");
  assert.notDeepEqual(output, Buffer.from(customImageData.split(",")[1], "base64"));
});

test("6. Custom image blueprint preserves exact aspect ratio and dimensions of uploaded image", async () => {
  // SVG image with 800x600 dimensions
  const customSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><rect width="800" height="600" fill="#333"/></svg>`;
  const customDataUrl = `data:image/svg+xml;base64,${Buffer.from(customSvg).toString("base64")}`;

  const result = await generateBuildingBlueprint({
    buildingId: "custom-dims-test",
    imageUrl: customDataUrl,
    force: true,
  });

  const metadata = await sharp(Buffer.from(result.blueprintUrl.split(",")[1], "base64")).metadata();
  assert.equal(metadata.width, 800);
  assert.equal(metadata.height, 600);
});

test("7. Multipart photo upload is accepted by the route", async () => {
  const bytes = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#e2e8f0" },
  }).png().toBuffer();
  const form = new FormData();
  form.set("buildingId", "multipart-test");
  form.set("imageFile", new File([bytes], "building.png", { type: "image/png" }));

  const response = await POST(new NextRequest("http://localhost/api/building-blueprint", {
    method: "POST",
    body: form,
  }));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.status, "completed");
  assert.match(result.blueprintUrl, /^data:image\/png;base64,/);
});

test("8. Multipart upload rejects unsupported image formats", async () => {
  const form = new FormData();
  form.set("buildingId", "unsupported-image");
  form.set("imageFile", new File(["<svg/>"], "building.svg", { type: "image/svg+xml" }));
  const response = await POST(new NextRequest("http://localhost/api/building-blueprint", {
    method: "POST",
    body: form,
  }));
  assert.equal(response.status, 400);
});

test("9. Development blueprint retains facade linework across the building", async () => {
  const result = await generateBuildingBlueprint({
    buildingId: "facade-linework",
    imageUrl: MOCK_BUILDINGS[0].imageUrl,
    force: true,
  });
  const { data, info } = await sharp(Buffer.from(result.blueprintUrl.split(",")[1], "base64"))
    .raw()
    .toBuffer({ resolveWithObject: true });
  let facadePixels = 0;
  for (let y = 250; y < 1000; y++) {
    for (let x = 250; x < 750; x++) {
      const index = (y * info.width + x) * info.channels;
      if (data[index + 3] > 0) facadePixels++;
    }
  }
  assert.ok(facadePixels > 2000, `Expected visible facade linework, found ${facadePixels} pixels`);
  assert.equal(info.channels, 4, "The blueprint must have an alpha channel");
  assert.equal(data[3], 0, "The corner must reveal the card's background");
  assert.equal(data[(400 * info.width + 400) * 4 + 3], 0, "Facade interiors must remain transparent");
  assert.equal(data[(400 * info.width + 240) * 4 + 3], 255, "Lateral structural outlines must remain prominent even against a similar brightness background");
});

test("10. Reveal waits for both mounted images to decode and for two layout frames", async () => {
  let resolveOriginal!: () => void;
  let resolveBlueprint!: () => void;
  let ready = false;
  const original = { decode: () => new Promise<void>((resolve) => { resolveOriginal = resolve; }) };
  const blueprint = { decode: () => new Promise<void>((resolve) => { resolveBlueprint = resolve; }) };
  const element = { querySelectorAll: () => [original, blueprint] } as unknown as HTMLElement;
  const frames: FrameRequestCallback[] = [];
  const previousRequest = Object.getOwnPropertyDescriptor(globalThis, "requestAnimationFrame");
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; } });
  try {
    const preparation = prepareRenderedVisual(element, new AbortController().signal).then(() => { ready = true; });
    resolveOriginal();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(ready, false);
    assert.equal(frames.length, 0, "Must not begin revealing while the blueprint is still decoding");
    resolveBlueprint();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(frames.length, 1);
    frames.shift()!(0);
    assert.equal(ready, false, "One frame is insufficient for the composition to stabilize");
    frames.shift()!(0);
    await preparation;
    assert.equal(ready, true);
  } finally {
    if (previousRequest) Object.defineProperty(globalThis, "requestAnimationFrame", previousRequest);
    else Reflect.deleteProperty(globalThis, "requestAnimationFrame");
  }
});

test("11. A broken image rejects preparation instead of allowing a partial reveal", async () => {
  const element = {
    querySelectorAll: () => [{ decode: () => Promise.resolve() }, { decode: () => Promise.reject(new Error("Broken blueprint")) }],
  } as unknown as HTMLElement;
  await assert.rejects(prepareRenderedVisual(element, new AbortController().signal), /Broken blueprint/);
});

test("12. Composition accepts scaled matching images and rejects a different framing", () => {
  assert.equal(compositionAspectRatio({ width: 1000, height: 1300 }, { width: 2000, height: 2600 }), 1000 / 1300);
  assert.throws(() => compositionAspectRatio({ width: 1000, height: 1300 }, { width: 1300, height: 1000 }), /enquadramento/);
  assert.throws(() => compositionAspectRatio({ width: 1000, height: 1300 }, { width: 0, height: 0 }), /enquadramento/);
});

test("13. Generated drafting canvas becomes transparent with stronger structural strokes", async () => {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect width="100" height="100" fill="white"/>
    <path d="M20 10v80M20 90h60M70 44v6" fill="none" stroke="#0057ad" stroke-width="1"/>
  </svg>`);
  const output = await prepareGeneratedLinework(source);
  const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
  const alpha = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
  assert.equal(info.channels, 4);
  assert.equal(alpha(0, 0), 0);
  assert.equal(alpha(50, 50), 0, "Empty facade areas must have no matte or solid fill");
  assert.equal(alpha(20, 50), 255, "Main vertical supports must have full contrast");
  assert.ok(alpha(18, 50) > 0, "Main supports must extend beyond the thin input stroke");
  assert.equal(alpha(68, 46), 0, "Secondary details must stay thin");
  assert.ok(alpha(70, 46) > 0 && alpha(70, 46) < 255);
});

test("14. Existing transparent linework retains an empty background", async () => {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M30 15v70M30 85h40" fill="none" stroke="white" stroke-width="2"/>
  </svg>`);
  const output = await prepareGeneratedLinework(source);
  const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0);
  const index = (50 * info.width + 30) * 4;
  assert.ok(data[index + 2] > data[index + 1], "Transparent input strokes must use the blue blueprint palette");
  assert.equal(data[index + 3], 255);
});

test("15. Filled AI surfaces are cleared while their contours remain visible", async () => {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect width="100" height="100" fill="white"/>
    <rect x="15" y="15" width="70" height="70" fill="#0057ad"/>
  </svg>`);
  const output = await prepareGeneratedLinework(source);
  const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[(50 * info.width + 50) * 4 + 3], 0, "Solid masses must not remain in the blueprint");
  assert.ok(data[(50 * info.width + 15) * 4 + 3] > 0, "Their original outline must remain aligned");
});

test("16. Only the exterior vertical edges receive rounded cylindrical bundles", async () => {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <path d="M40 60v180M260 60v180M150 60v180M40 240h220" fill="none" stroke="#0071e3" stroke-width="1"/>
  </svg>`);
  const output = await prepareGeneratedLinework(source);
  const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
  const index = (x: number, y: number) => (y * info.width + x) * 4;
  assert.ok(data[index(40, 59) + 3] > 0, "Rounded caps must extend along the edge's centerline");
  assert.equal(data[index(33, 59) + 3], 0, "Caps must leave their outer square corners transparent");
  assert.equal(data[index(40, 150) + 3], 255);
  assert.ok(data[index(40, 150) + 1] > data[index(34, 150) + 1], "The bundle core must be lighter than its outer edge");
  assert.equal(data[index(146, 150) + 3], 0, "Interior columns must not receive a thick bundle");
  assert.equal(data[index(80, 244) + 3], 0, "Horizontal beams must remain thin");
  assert.ok(data[index(150, 150) + 3] > 0, "Fine interior drafting lines must remain visible");
});

const MULTI_VOLUME_BUILDING = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="360">
  <rect width="420" height="360" fill="white"/>
  <path d="M40 320V40h100v280zM200 320V130h80v190zM320 320V210h60v110z
    M90 40v280M240 130v190M350 210v110" fill="none" stroke="#0071e3" stroke-width="1"/>
</svg>`);

for (const [index, [name, convert]] of ([["generated", prepareGeneratedLinework], ["local photo", createPhotoLinework]] as const).entries()) {
  test(`${17 + index}. All six exterior edges of unequal ${name} building volumes receive bundles`, async () => {
    const output = await convert(MULTI_VOLUME_BUILDING);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];
    for (const x of [40, 140, 200, 280, 320, 380]) {
      assert.equal(alpha(x, 260), 255, `Exterior edge ${x} must be prominent, including shorter volumes`);
      assert.ok(alpha(x - 4, 260) > 0, `Exterior edge ${x} must receive the complete bundle`);
    }
    for (const x of [90, 240, 350]) {
      assert.equal(alpha(x - 4, 260), 0, `Internal column ${x} must remain thin`);
    }
    assert.equal(alpha(220, 260), 0, "Facade surfaces must remain transparent");
  });
}

for (const [index, [name, convert]] of ([["generated", prepareGeneratedLinework], ["local photo", createPhotoLinework]] as const).entries()) {
  test(`${19 + index}. A ${name} perspective facade corner is bundled while intermediate columns stay thin`, async () => {
    const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="340">
      <path d="M40 70L170 35L300 70V260L170 300L40 270zM170 35v265
        M105 52.5V285M235 52.5V280" fill="none" stroke="#0071e3" stroke-width="1"/>
    </svg>`);
    const output = await convert(source);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];
    for (const x of [40, 170, 300]) {
      assert.equal(alpha(x, 180), 255, `Visible facade corner ${x} must be emphasized`);
      assert.ok(alpha(x - 4, 180) > 0);
    }
    for (const x of [105, 235]) assert.equal(alpha(x - 4, 180), 0, `Interior column ${x} must stay thin`);
  });
}

const PROJECTING_FACADES = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <rect width="600" height="400" fill="white"/>
  <g fill="none" stroke="#0071e3" stroke-width="1">
    <path d="M80 350V55h150v295zM350 350V35h150v315zM230 90h120M280 90v260M310 90v260"/>
    <path d="M90 55v295M490 35v315M180 45h18M180 45v305M20 120v230M20 120h22"/>
    ${[110, 140, 170, 200, 380, 410, 440, 470].map((x) => `<path d="M${x} 75v260M${x} 75h18M${x} 335h18"/>`).join("")}
    ${[120, 175, 230, 285].map((y) => `<path d="M80 ${y}h150M350 ${y}h150"/>`).join("")}
  </g>
</svg>`);

for (const [index, [name, convert]] of ([["generated", prepareGeneratedLinework], ["local photo", createPhotoLinework]] as const).entries()) {
  test(`${21 + index}. Two ${name} projecting facade volumes have four principal bundles`, async () => {
    const output = await convert(PROJECTING_FACADES);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];
    for (const x of [80, 230, 350, 500]) {
      assert.equal(alpha(x, 200), 255, `Principal volume corner ${x} must be prominent`);
      assert.ok(alpha(x - 4, 200) > 0);
    }
    for (const x of [20, 90, 110, 140, 170, 180, 200, 280, 310, 380, 410, 440, 470, 490]) {
      assert.equal(alpha(x - 4, 200), 0, `Detail ${x} must stay thin, including one-sided window caps and facade fins`);
      assert.ok(alpha(x, 200) > 0, "Original fine lines must remain visible");
    }
  });
}

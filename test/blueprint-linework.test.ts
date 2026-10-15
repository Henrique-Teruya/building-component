import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { createPhotoLinework, prepareGeneratedLinework } from "../lib/building-progress/blueprint-linework";

const FACADE = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280">
  <rect width="320" height="280" fill="white"/>
  <path d="M40 240V40h240v200zM100 40v200M220 40v200M40 120h240M40 180h240"
    fill="none" stroke="#0071e3" stroke-width="2"/>
</svg>`);

for (const [name, convert, maximumOpacity] of [
  ["generated", prepareGeneratedLinework, 204],
  ["local demonstration", createPhotoLinework, 200],
] as const) {
  test(`${name} blueprint keeps exterior and interior lines equally thin and transparent`, async () => {
    const output = await convert(FACADE);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];
    assert.equal(info.width, 320);
    assert.equal(info.height, 280);
    assert.equal(info.channels, 4);
    const exterior = Array.from({ length: 13 }, (_, i) => alpha(34 + i, 150));
    const interior = Array.from({ length: 13 }, (_, i) => alpha(94 + i, 150));
    assert.deepEqual(exterior, interior, "Facade corners must use the same stroke profile as detail columns");
    assert.ok(exterior.some((opacity) => opacity > 0), "Fine lines must remain visible");
    assert.equal(alpha(36, 150), 0, "The corner must not acquire a bundle or a halo");
    assert.equal(alpha(140, 116), 0, "Horizontal beams must remain thin");
    assert.ok(alpha(140, 120) > 0);
    assert.equal(alpha(0, 0), 0);
    assert.equal(alpha(160, 150), 0, "Facade surfaces must reveal the surrounding app background");
    for (let i = 0; i < data.length; i += 4) {
      assert.ok(data[i + 3] <= maximumOpacity);
      if (data[i + 3] > 0) assert.deepEqual([...data.subarray(i, i + 3)], [0, 113, 227], "All drafting lines must share one SKR blue");
    }
  });
}

test("Generated inclined contours retain the original perspective and visible gaps", async () => {
  const source = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">
    <rect width="320" height="320" fill="white"/>
    <path d="M50 35L75 285M130 35L155 130M159 170L170 285M240 35L215 285"
      fill="none" stroke="#0071e3" stroke-width="2"/>
  </svg>`)).png().toBuffer();
  const output = await prepareGeneratedLinework(source);
  const original = await sharp(source).ensureAlpha().raw().toBuffer();
  const result = await sharp(output).raw().toBuffer();
  const alpha = (x: number, y: number) => result[(y * 320 + x) * 4 + 3];
  for (let y = 40; y < 280; y++) {
    const left = Math.round(50 + (y - 35) * .1);
    assert.ok([left - 1, left, left + 1].some((x) => alpha(x, y) > 0), `The inclined original contour must remain connected at row ${y}`);
  }
  for (let i = 0; i < result.length; i += 4) {
    if (result[i + 3] > 0) assert.ok(original[i] < 250, "Processing must not draw displaced segments beyond the source geometry");
  }
  for (let y = 140; y < 160; y++) {
    for (let x = 145; x < 165; x++) assert.equal(alpha(x, y), 0, "The original break must remain empty");
  }
});

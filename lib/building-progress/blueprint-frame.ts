import sharp from "sharp";

const ASPECT_RATIOS = [
  ["1:1", 1], ["4:5", 4 / 5], ["2:3", 2 / 3], ["9:16", 9 / 16],
  ["4:3", 4 / 3], ["3:2", 3 / 2], ["16:9", 16 / 9],
] as const;

export interface BlueprintFrame {
  image: Buffer;
  aspectRatio: typeof ASPECT_RATIOS[number][0];
  width: number;
  height: number;
  content: { left: number; top: number; width: number; height: number };
}

/** Fit the entire oriented photo inside a supported canvas, keeping its margins. */
export async function prepareBlueprintFrame(source: Buffer, maximumEdge: number): Promise<BlueprintFrame> {
  const original = await sharp(source).metadata();
  const dimensions = original.autoOrient ?? original;
  if (!dimensions.width || !dimensions.height) throw new Error("Imagem sem dimensões.");
  const ratio = dimensions.width / dimensions.height;
  const [aspectRatio, canvasRatio] = ASPECT_RATIOS.reduce((best, candidate) =>
    Math.abs(Math.log(candidate[1] / ratio)) < Math.abs(Math.log(best[1] / ratio)) ? candidate : best
  );
  const width = Math.round(maximumEdge * Math.min(1, canvasRatio));
  const height = Math.round(maximumEdge * Math.min(1, 1 / canvasRatio));
  const { data: photo, info } = await sharp(source)
    .rotate()
    .resize(width, height, { fit: "inside" })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.floor((width - info.width) / 2);
  const top = Math.floor((height - info.height) / 2);
  const image = await sharp(photo)
    .extend({ left, right: width - info.width - left, top, bottom: height - info.height - top, background: "#ffffff" })
    .png()
    .toBuffer();
  return { image, aspectRatio, width, height, content: { left, top, width: info.width, height: info.height } };
}

/** Undo the model's pixel rounding, then remove only the padding we added. */
export async function restoreBlueprintFrame(generated: Buffer, frame: BlueprintFrame): Promise<Buffer> {
  const metadata = await sharp(generated).metadata();
  const dimensions = metadata.autoOrient ?? metadata;
  if (!dimensions.width || !dimensions.height) throw new Error("Resultado da IA sem dimensões.");
  const scale = Math.max(dimensions.width, dimensions.height) / Math.max(frame.width, frame.height);
  // Correct at most half a 32px grid cell; reject an unrelated canvas.
  if (Math.abs(dimensions.width - frame.width * scale) > 16 || Math.abs(dimensions.height - frame.height * scale) > 16) {
    throw new Error(`A IA retornou um canvas incompatível: ${dimensions.width}x${dimensions.height}, esperado ${frame.width}x${frame.height}.`);
  }
  const canvas = await sharp(generated)
    .rotate()
    .resize(frame.width, frame.height, { fit: "fill" })
    .png()
    .toBuffer();
  return sharp(canvas).extract(frame.content).png().toBuffer();
}

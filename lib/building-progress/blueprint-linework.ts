import sharp from "sharp";

// Uniform SKR blue. The surface shows through the image's alpha channel.
const INK = [0, 113, 227] as const;

function clearSolidInteriors(alpha: Buffer, width: number, height: number): void {
  const radius = Math.max(3, Math.round(Math.max(width, height) / 256));
  const stride = width + 1;
  const occupied = new Uint32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] >= 32) row++;
      occupied[(y + 1) * stride + x + 1] = occupied[y * stride + x + 1] + row;
    }
  }
  const area = (radius * 2 + 1) ** 2;
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const left = x - radius;
      const right = x + radius + 1;
      const top = y - radius;
      const bottom = y + radius + 1;
      const count = occupied[bottom * stride + right] - occupied[top * stride + right]
        - occupied[bottom * stride + left] + occupied[top * stride + left];
      if (count === area) alpha[y * width + x] = 0;
    }
  }
}


async function encodeLinework(alpha: Buffer, width: number, height: number): Promise<Buffer> {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < alpha.length; i++) {
    pixels[i * 4] = INK[0];
    pixels[i * 4 + 1] = INK[1];
    pixels[i * 4 + 2] = INK[2];
    pixels[i * 4 + 3] = alpha[i];
  }
  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

function photoAlpha(data: Buffer, width: number, height: number): Buffer {
  const alpha = Buffer.alloc(width * height);
  const rowStride = width * 3;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      let strength = 0;
      for (let channel = 0; channel < 3; channel++) {
        const p = i * 3 + channel;
        const gx = -data[p - rowStride - 3] + data[p - rowStride + 3]
          - 2 * data[p - 3] + 2 * data[p + 3] - data[p + rowStride - 3] + data[p + rowStride + 3];
        const gy = -data[p - rowStride - 3] - 2 * data[p - rowStride] - data[p - rowStride + 3]
          + data[p + rowStride - 3] + 2 * data[p + rowStride] + data[p + rowStride + 3];
        strength = Math.max(strength, Math.hypot(gx, gy));
      }
      alpha[i] = Math.round(Math.min(200, Math.max(0, (strength - 24) * .85)));
    }
  }
  return alpha;
}

/** Local demonstration: trace the supplied pixels without inventing geometry. */
export async function createPhotoLinework(source: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(source)
    .rotate()
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encodeLinework(photoAlpha(data, info.width, info.height), info.width, info.height);
}

/** Convert the AI's drafting canvas into real PNG transparency, with no matte. */
export async function prepareGeneratedLinework(source: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(source, { limitInputPixels: 16_777_216 })
    .rotate()
    .toColourspace("srgb")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const luminance = (i: number) => .2126 * data[i * 4] + .7152 * data[i * 4 + 1] + .0722 * data[i * 4 + 2];
  const border: number[] = [];
  let transparentBorder = 0;
  const sample = (i: number) => {
    border.push(luminance(i));
    if (data[i * 4 + 3] < 16) transparentBorder++;
  };
  const step = Math.max(1, Math.floor(Math.min(width, height) / 128));
  for (let x = 0; x < width; x += step) { sample(x); sample((height - 1) * width + x); }
  for (let y = 0; y < height; y += step) { sample(y * width); sample(y * width + width - 1); }
  border.sort((a, b) => a - b);
  const background = border[Math.floor(border.length / 2)];
  const transparent = transparentBorder > border.length / 2;
  const lightBackground = background >= 128;
  let foreground = background;
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] < 16) continue;
    foreground = lightBackground ? Math.min(foreground, luminance(i)) : Math.max(foreground, luminance(i));
  }
  const contrast = Math.max(1, Math.abs(background - foreground));
  const alpha = Buffer.alloc(width * height);
  for (let i = 0; i < alpha.length; i++) {
    const coverage = transparent ? 1 : Math.max(0, Math.min(1,
      (lightBackground ? background - luminance(i) : luminance(i) - background) / contrast));
    alpha[i] = coverage < .06 ? 0 : Math.round(coverage * data[i * 4 + 3] * .8);
  }

  // Keep the original contours if the model leaves a filled surface.
  clearSolidInteriors(alpha, width, height);
  return encodeLinework(alpha, width, height);
}

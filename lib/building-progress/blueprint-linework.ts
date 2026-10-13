import sharp from "sharp";

// SKR brand blue 500 and blue 100. RGB is independent of the card surface.
const INK = [0, 113, 227] as const;
const HIGHLIGHT = [219, 234, 254] as const;

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

interface VerticalEdge {
  left: number;
  right: number;
  start: number;
  end: number;
}

/** Find a sustained straight facade boundary, allowing for perspective. */
function traceJunctionArm(alpha: Buffer, width: number, height: number, column: VerticalEdge, y: number, direction: -1 | 1, reach: number): number | null {
  const band = Math.max(1, Math.round(Math.max(width, height) / 1500));
  const tolerance = Math.max(2, Math.round(Math.max(width, height) / 900));
  const originX = direction < 0 ? column.left : column.right;
  if (originX + direction * reach < 0 || originX + direction * reach >= width) return null;
  const steps = Math.max(8, Math.ceil(reach / (band * 2)));
  const maximumGap = Math.max(2, Math.round(reach * .025));
  let bestSlope: number | null = null;
  let bestHits = 0;
  for (let angle = -steps; angle <= steps; angle++) {
    const slope = angle / steps;
    for (let offset = -tolerance; offset <= tolerance; offset++) {
      let hits = 0;
      let gap = 0;
      for (let distance = 1; distance <= reach; distance++) {
        const x = originX + direction * distance;
        const centerY = Math.round(y + offset + slope * distance);
        let occupied = false;
        for (let delta = -band; delta <= band; delta++) {
          const row = centerY + delta;
          if (row >= 0 && row < height && alpha[row * width + x] >= 32) { occupied = true; break; }
        }
        if (occupied) { hits++; gap = 0; }
        else if (++gap > maximumGap) break;
      }
      if (hits >= reach * .85 && (hits > bestHits || (hits === bestHits && Math.abs(slope) < Math.abs(bestSlope ?? Infinity)))) {
        bestHits = hits;
        bestSlope = slope;
      }
    }
  }
  return bestSlope;
}

function exteriorEdges(alpha: Buffer, width: number, height: number, columns: VerticalEdge[]): VerticalEdge[] {
  return columns.filter((column) => {
    const shortReach = Math.max(5, Math.round(Math.max(width, height) / 500));
    const facadeReach = Math.max(8, Math.round(Math.max(width * .08, (column.end - column.start + 1) * .16)));
    // A principal volume needs a broad roof/base contour. A tiny window cap,
    // railing or branch cannot identify a building corner. Check the immediate
    // continuation too, so an interior column near a corner stays thin.
    return [column.start, column.end].some((y) => {
      const leftNear = traceJunctionArm(alpha, width, height, column, y, -1, shortReach);
      const rightNear = traceJunctionArm(alpha, width, height, column, y, 1, shortReach);
      if (leftNear === null && rightNear === null) return false;
      const leftArm = leftNear === null ? null : traceJunctionArm(alpha, width, height, column, y, -1, facadeReach);
      const rightArm = rightNear === null ? null : traceJunctionArm(alpha, width, height, column, y, 1, facadeReach);
      if (leftNear === null) return rightArm !== null;
      if (rightNear === null) return leftArm !== null;
      return leftArm !== null && rightArm !== null && Math.abs(leftArm + rightArm) > .3;
    });
  });
}

function emphasizeStructure(alpha: Buffer, width: number, height: number): { alpha: Buffer; highlight: Uint8Array } {
  const output = Buffer.from(alpha);
  const highlight = new Uint8Array(alpha.length);
  const maximumGap = Math.max(2, Math.round(Math.min(width, height) / 64));
  const minimumLength = Math.max(12, Math.round(height * .12));
  const runs: { x: number; start: number; end: number }[] = [];

  for (let x = 0; x < width; x++) {
    let start = -1;
    let last = -1;
    for (let y = 0; y <= height; y++) {
      if (y < height && alpha[y * width + x] >= 60) {
        if (start < 0) start = y;
        last = y;
      } else if (start >= 0 && (y === height || y - last > maximumGap)) {
        if (last - start + 1 >= minimumLength) runs.push({ x, start, end: last });
        start = -1;
      }
    }
  }
  if (runs.length === 0) return { alpha: output, highlight };

  const columns: VerticalEdge[] = [];
  const active: VerticalEdge[] = [];
  for (const run of runs) {
    let previous: VerticalEdge | undefined;
    for (let index = active.length - 1; index >= 0; index--) {
      const column = active[index];
      if (run.x - column.right > 2) {
        active.splice(index, 1);
        continue;
      }
      const overlap = Math.min(column.end, run.end) - Math.max(column.start, run.start) + 1;
      if (overlap >= Math.min(column.end - column.start + 1, run.end - run.start + 1) * .6) {
        previous = column;
        break;
      }
    }
    if (previous) {
      previous.right = run.x;
      previous.start = Math.min(previous.start, run.start);
      previous.end = Math.max(previous.end, run.end);
    } else {
      const column = { left: run.x, right: run.x, start: run.start, end: run.end };
      columns.push(column);
      active.push(column);
    }
  }

  const exterior = exteriorEdges(alpha, width, height, columns);
  const bundleRadius = Math.max(5, Math.round(Math.max(width, height) / 150));
  const strandRadius = Math.max(1, Math.max(width, height) / 1200);
  const strandOffsets = [-.9, -.6, -.3, 0, .3, .6, .9];

  for (const column of exterior) {
    const center = (column.left + column.right) / 2;
    for (const offset of strandOffsets) {
      const strandX = center + offset * bundleRadius;
      const shine = Math.round(Math.exp(-((offset + .25) ** 2) * 4) * 140);
      const brush: { dx: number; dy: number; coverage: number }[] = [];
      const originX = Math.round(strandX);
      const reach = Math.ceil(strandRadius + .5);
      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const distance = Math.hypot(originX + dx - strandX, dy);
          const coverage = Math.round(Math.min(1, Math.max(0, strandRadius + .5 - distance)) * 255);
          if (coverage > 0) brush.push({ dx, dy, coverage });
        }
      }
      for (let y = column.start; y <= column.end; y++) {
        let hasLine = false;
        for (let x = column.left; x <= column.right; x++) {
          if (alpha[y * width + x] > 0) { hasLine = true; break; }
        }
        if (!hasLine) continue;
        for (const pixel of brush) {
          const px = originX + pixel.dx;
          const py = y + pixel.dy;
          if (px < 0 || px >= width || py < 0 || py >= height) continue;
          const i = py * width + px;
          output[i] = Math.max(output[i], pixel.coverage);
          highlight[i] = Math.max(highlight[i], shine);
        }
      }
    }
  }
  return { alpha: output, highlight };
}

async function encodeLinework(alpha: Buffer, width: number, height: number): Promise<Buffer> {
  const strengthened = emphasizeStructure(alpha, width, height);
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < strengthened.alpha.length; i++) {
    const shine = strengthened.highlight[i] / 255;
    pixels[i * 4] = Math.round(INK[0] + (HIGHLIGHT[0] - INK[0]) * shine);
    pixels[i * 4 + 1] = Math.round(INK[1] + (HIGHLIGHT[1] - INK[1]) * shine);
    pixels[i * 4 + 2] = Math.round(INK[2] + (HIGHLIGHT[2] - INK[2]) * shine);
    pixels[i * 4 + 3] = strengthened.alpha[i];
  }
  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
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
  const { width, height } = info;
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
  return encodeLinework(alpha, width, height);
}

/** Convert the AI's drafting canvas into real PNG transparency, with no matte. */
export async function prepareGeneratedLinework(source: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(source)
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

  // If the model leaves a filled surface, keep its contour and clear its core.
  // The neighborhood is larger than the intended structural stroke width.
  clearSolidInteriors(alpha, width, height);
  return encodeLinework(alpha, width, height);
}

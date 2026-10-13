export interface ImageDimensions {
  width: number;
  height: number;
}

function aborted() {
  return new DOMException("Preparation cancelled", "AbortError");
}

export function preloadDecodedImage(url: string, signal: AbortSignal): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(aborted());
    const image = new Image();
    image.decoding = "async";
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", cancel);
    };
    const cancel = () => {
      cleanup();
      reject(aborted());
    };
    image.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível carregar as imagens da visualização. Tente novamente."));
    };
    image.onload = async () => {
      try {
        await image.decode();
        if (signal.aborted) throw aborted();
        if (!image.naturalWidth || !image.naturalHeight) throw new Error("Imagem sem dimensões.");
        cleanup();
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    signal.addEventListener("abort", cancel, { once: true });
    image.src = url;
  });
}

export function compositionAspectRatio(original: ImageDimensions, blueprint: ImageDimensions): number {
  const ratio = original.width / original.height;
  const blueprintRatio = blueprint.width / blueprint.height;
  if (!Number.isFinite(ratio) || ratio <= 0 || !Number.isFinite(blueprintRatio) || blueprintRatio <= 0 || Math.abs(blueprintRatio / ratio - 1) > .01) {
    throw new Error("A imagem gerada não preservou o enquadramento da foto. Tente novamente.");
  }
  return ratio;
}

export function waitForNextPaint(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(aborted());
    let frame = 0;
    const cancel = () => {
      cancelAnimationFrame(frame);
      reject(aborted());
    };
    signal.addEventListener("abort", cancel, { once: true });
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        signal.removeEventListener("abort", cancel);
        resolve();
      });
    });
  });
}

// Decode the actual mounted images too, then let the composition and layout paint
// under the cover before allowing any reveal.
export async function prepareRenderedVisual(element: HTMLElement, signal: AbortSignal) {
  const images = Array.from(element.querySelectorAll("img"));
  if (!images.length) throw new Error("A composição visual não foi preparada.");
  await Promise.all(images.map((image) => image.decode()));
  if (signal.aborted) throw aborted();
  await waitForNextPaint(signal);
}

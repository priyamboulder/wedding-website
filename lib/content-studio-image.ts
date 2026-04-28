// Client-side image processing for Content Studio.
// The spec describes server-side `sharp` for thumbnails and aspect-ratio
// crops; in the localStorage-only build we do the same work on a canvas.

export interface PreparedUpload {
  id: string;
  file_name: string;
  file_size: number;
  width: number;                 // original dimensions
  height: number;
  thumbnail_url: string;         // persistable data URI (max 800px on longest edge)
  photo_url: string;             // full-size object URL (session-only)
}

const MAX_THUMB_EDGE = 800;
const THUMB_QUALITY = 0.82;

export async function prepareUpload(file: File): Promise<PreparedUpload> {
  const objectUrl = URL.createObjectURL(file);
  const img = await loadImage(objectUrl);
  const { canvas, width, height } = resizeToFit(img, MAX_THUMB_EDGE);
  const thumbnail_url = canvas.toDataURL("image/jpeg", THUMB_QUALITY);
  return {
    id: `photo_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
    file_name: file.name,
    file_size: file.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
    thumbnail_url,
    photo_url: objectUrl,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function resizeToFit(img: HTMLImageElement, maxEdge: number): { canvas: HTMLCanvasElement; width: number; height: number } {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.min(1, maxEdge / Math.max(iw, ih));
  const w = Math.round(iw * scale);
  const h = Math.round(ih * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, width: w, height: h };
}

export type AspectKey = "1:1" | "4:5" | "9:16" | "16:9" | "original";

const ASPECT_DIMS: Record<AspectKey, { w: number; h: number } | null> = {
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
  "9:16": { w: 1080, h: 1920 },
  "16:9": { w: 1920, h: 1080 },
  original: null,
};

// Centre-cover crop to the target aspect and downscale to the target
// dimensions. Returns a JPEG blob ready to download.
export async function cropToAspect(src: string, aspect: AspectKey, quality = 0.9): Promise<Blob | null> {
  try {
    const img = await loadImage(src);
    const dims = ASPECT_DIMS[aspect];
    if (!dims) {
      // "original" — just re-encode at full size.
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      return canvasToBlob(canvas, quality);
    }
    const targetAspect = dims.w / dims.h;
    const srcAspect = img.naturalWidth / img.naturalHeight;
    let cropW: number;
    let cropH: number;
    if (srcAspect > targetAspect) {
      cropH = img.naturalHeight;
      cropW = cropH * targetAspect;
    } else {
      cropW = img.naturalWidth;
      cropH = cropW / targetAspect;
    }
    const sx = (img.naturalWidth - cropW) / 2;
    const sy = (img.naturalHeight - cropH) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = dims.w;
    canvas.height = dims.h;
    canvas.getContext("2d")!.drawImage(img, sx, sy, cropW, cropH, 0, 0, dims.w, dims.h);
    return canvasToBlob(canvas, quality);
  } catch {
    return null;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

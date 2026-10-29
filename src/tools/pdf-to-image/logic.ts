// Pure helpers for rendering PDF pages to images.
import { baseName, parsePageRanges } from '../pdf-split/logic';

export type ImageFormat = 'jpeg' | 'png';

/** PDF user space is 72 units per inch, so a page rendered at scale 1 is 72 DPI. */
export const PDF_DPI = 72;

export const DPI_PRESETS = [72, 150, 200, 300] as const;

/**
 * Browsers refuse very large canvases. iOS Safari caps a canvas at 16,777,216
 * pixels (4096 x 4096) and every browser caps a side at a few tens of thousands
 * of pixels, so keep well inside both.
 */
export const MAX_CANVAS_PIXELS = 16_777_216;
export const MAX_CANVAS_SIDE = 16_384;

export interface RenderPlan {
  scale: number;
  width: number;
  height: number;
  /** True when the requested DPI had to be lowered to fit the canvas limits. */
  limited: boolean;
  dpi: number;
}

/** Output pixel size for a page of `widthPt` x `heightPt` points at `dpi`. */
export function planRender(widthPt: number, heightPt: number, dpi: number): RenderPlan {
  let scale = Math.max(dpi, 1) / PDF_DPI;
  let limited = false;
  const pixels = widthPt * heightPt * scale * scale;
  if (pixels > MAX_CANVAS_PIXELS) {
    scale = Math.sqrt(MAX_CANVAS_PIXELS / (widthPt * heightPt));
    limited = true;
  }
  const side = Math.max(widthPt, heightPt) * scale;
  if (side > MAX_CANVAS_SIDE) {
    scale = MAX_CANVAS_SIDE / Math.max(widthPt, heightPt);
    limited = true;
  }
  // Floor to whole pixels the same way the renderer does.
  return {
    scale,
    width: Math.max(1, Math.floor(widthPt * scale)),
    height: Math.max(1, Math.floor(heightPt * scale)),
    limited,
    dpi: Math.round(scale * PDF_DPI),
  };
}

export function mimeFor(format: ImageFormat): string {
  return format === 'png' ? 'image/png' : 'image/jpeg';
}

/** report.pdf, page 3 of 120 → report-p003.jpg */
export function imageFilename(pdfName: string, page: number, pageCount: number, format: ImageFormat): string {
  const ext = format === 'png' ? 'png' : 'jpg';
  return `${baseName(pdfName)}-p${String(page).padStart(String(pageCount).length, '0')}.${ext}`;
}

/** Empty input means every page. */
export function pagesToRender(input: string, pageCount: number): { pages: number[]; errors: string[] } {
  if (!input.trim()) return { pages: Array.from({ length: pageCount }, (_, i) => i + 1), errors: [] };
  return parsePageRanges(input, pageCount);
}

/** A4 at a few DPIs, used in the content table and the UI hint. */
export function a4Pixels(dpi: number): { width: number; height: number } {
  const p = planRender(595.28, 841.89, dpi);
  return { width: p.width, height: p.height };
}

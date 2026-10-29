export type OutputChoice = 'keep' | 'jpeg' | 'webp';

export const SUPPORTED_INPUT = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isSupportedInput(type: string): boolean {
  return (SUPPORTED_INPUT as readonly string[]).includes(type);
}

/** MIME type the compressed file will be encoded as. */
export function resolveOutputType(inputType: string, choice: OutputChoice): string {
  if (choice === 'jpeg') return 'image/jpeg';
  if (choice === 'webp') return 'image/webp';
  return isSupportedInput(inputType) ? inputType : 'image/jpeg';
}

/** PNG is lossless, so the browser ignores the quality argument for it. */
export function qualityApplies(type: string): boolean {
  return type === 'image/jpeg' || type === 'image/webp';
}

/** JPG has no alpha channel; transparent pixels must be painted onto a background first. */
export function needsOpaqueBackground(type: string): boolean {
  return type === 'image/jpeg';
}

export interface Size {
  width: number;
  height: number;
}

/** Scales down (never up) so the width is at most `maxWidth`. Empty / invalid limits leave the size unchanged. */
export function fitToMaxWidth(width: number, height: number, maxWidth: number | null): Size {
  if (!maxWidth || !Number.isFinite(maxWidth) || maxWidth <= 0 || width <= maxWidth) return { width, height };
  const w = Math.round(maxWidth);
  return { width: w, height: Math.max(1, Math.round((height * w) / width)) };
}

/**
 * Intermediate sizes for high-quality downscaling: halve each axis while it is
 * still more than twice the target, then draw the final size. Single big jumps
 * with bilinear sampling skip pixels and look jagged.
 */
export function stepDownSizes(width: number, height: number, targetWidth: number, targetHeight: number): Size[] {
  const steps: Size[] = [];
  let w = width;
  let h = height;
  for (;;) {
    const nw = w > targetWidth * 2 ? Math.ceil(w / 2) : w;
    const nh = h > targetHeight * 2 ? Math.ceil(h / 2) : h;
    if (nw === w && nh === h) break;
    w = nw;
    h = nh;
    steps.push({ width: w, height: h });
  }
  return steps;
}

export function extensionFor(type: string): string {
  return EXTENSION[type] ?? 'img';
}

/** photo.final.PNG + image/webp → photo.final-compressed.webp */
export function outputFilename(name: string, type: string, suffix = '-compressed'): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name) || 'image';
  return `${base}${suffix}.${extensionFor(type)}`;
}

/** Percentage saved; negative when the output is bigger. */
export function savedPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return (1 - after / before) * 100;
}

/**
 * A compressor should never hand back a bigger file. When the dimensions were
 * reduced the user asked for a different image, so the output is kept anyway.
 */
export function shouldKeepOriginal(inputSize: number, outputSize: number, resized: boolean): boolean {
  return !resized && outputSize >= inputSize;
}

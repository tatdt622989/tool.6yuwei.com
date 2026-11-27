export type HeicOutput = 'jpeg' | 'png';

export { isHeic } from '../../lib/heic';

export function outputMime(format: HeicOutput): 'image/png' | 'image/jpeg' {
  return format === 'png' ? 'image/png' : 'image/jpeg';
}

/** IMG_1234.HEIC + jpeg → IMG_1234.jpg */
export function outputFilename(name: string, format: HeicOutput): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name).trim() || 'photo';
  return `${base}.${format === 'png' ? 'png' : 'jpg'}`;
}

/** Quality only matters for JPG; 0–100 slider value → 0–1 encoder value, clamped. */
export function encoderQuality(format: HeicOutput, quality: number): number | undefined {
  if (format === 'png') return undefined;
  if (!Number.isFinite(quality)) return 0.9;
  return Math.min(1, Math.max(0.1, quality / 100));
}

/** Size ratio of output vs input as a signed percentage ("+80%" means 1.8x larger). */
export function sizeChangePercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return (after / before - 1) * 100;
}


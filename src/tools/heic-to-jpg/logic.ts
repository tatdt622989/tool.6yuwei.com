export type HeicOutput = 'jpeg' | 'png';

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const HEIC_EXT = /\.(heic|heif|hif)$/i;

/** Windows and some Android browsers report HEIC with an empty or generic MIME type, so the extension counts too. */
export function isHeic(type: string, name: string): boolean {
  if (HEIC_TYPES.includes(type.toLowerCase())) return true;
  return HEIC_EXT.test(name);
}

export function outputMime(format: HeicOutput): string {
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

/** heic2any returns one Blob, or an array when the file holds several images (burst / Live Photo); keep the first. */
export function firstBlob(result: Blob | Blob[]): Blob {
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error('empty');
  return blob;
}

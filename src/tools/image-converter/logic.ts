export type TargetFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export const FORMATS: Record<TargetFormat, { mime: string; ext: string; label: string; lossy: boolean; alpha: boolean }> = {
  jpeg: { mime: 'image/jpeg', ext: 'jpg', label: 'JPG', lossy: true, alpha: false },
  png: { mime: 'image/png', ext: 'png', label: 'PNG', lossy: false, alpha: true },
  webp: { mime: 'image/webp', ext: 'webp', label: 'WebP', lossy: true, alpha: true },
  avif: { mime: 'image/avif', ext: 'avif', label: 'AVIF', lossy: true, alpha: true },
};

const INPUT_LABEL: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
  'image/gif': 'GIF',
  'image/bmp': 'BMP',
  'image/svg+xml': 'SVG',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
  'image/tiff': 'TIFF',
  'image/x-icon': 'ICO',
  'image/vnd.microsoft.icon': 'ICO',
};

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|bmp|svg|heic|heif|tiff?|ico)$/i;

/** Some systems report HEIC and others with an empty MIME type, so fall back to the extension. */
export function looksLikeImage(type: string, name: string): boolean {
  return type.startsWith('image/') || IMAGE_EXT.test(name);
}

/** Short format name for display, e.g. image/jpeg → JPG, falling back to the file extension. */
export function formatLabel(type: string, name = ''): string {
  if (INPUT_LABEL[type]) return INPUT_LABEL[type];
  const ext = name.match(/\.([a-z0-9]+)$/i)?.[1];
  return ext ? ext.toUpperCase() : '未知';
}

/** photo.HEIC + webp → photo.webp */
export function outputFilename(name: string, format: TargetFormat): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name) || 'image';
  return `${base}.${FORMATS[format].ext}`;
}

/** Accepts #rgb, #rrggbb, with or without the hash. Returns lower-case #rrggbb or null. */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(raw)) return `#${raw.split('').map((c) => c + c).join('')}`;
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
  return null;
}

/** True if any pixel in RGBA data is not fully opaque. */
export function hasTransparency(rgba: ArrayLike<number>): boolean {
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 255) return true;
  return false;
}

export function sizeChangePercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return (after / before - 1) * 100;
}

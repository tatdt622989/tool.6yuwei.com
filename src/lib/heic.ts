// iPhone photos are HEIC/HEIF. Only Safari decodes them natively, so image tools run
// them through prepareImage() first: it hands back a JPEG File every browser can draw.

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const HEIC_EXT = /\.(heic|heif|hif)$/i;

/** Windows and some Android browsers report HEIC with an empty or generic MIME type, so the extension counts too. */
export function isHeic(type: string, name: string): boolean {
  if (HEIC_TYPES.includes(type.toLowerCase())) return true;
  return HEIC_EXT.test(name);
}

/** IMG_1234.HEIC → IMG_1234.jpg */
export function jpegName(name: string): string {
  const dot = name.lastIndexOf('.');
  return `${(dot > 0 ? name.slice(0, dot) : name).trim() || 'photo'}.jpg`;
}

const JPEG_QUALITY = 0.92;
type HeicTo = typeof import('heic-to').heicTo;
let decoderPromise: Promise<HeicTo> | null = null;
const cache = new WeakMap<File, Promise<File>>();

/** heic-to ships a current libheif build, which also reads recent iPhone photos that older decoders reject. */
export function loadHeicDecoder(): Promise<HeicTo> {
  decoderPromise ??= import('heic-to').then((m) => m.heicTo);
  decoderPromise.catch(() => (decoderPromise = null));
  return decoderPromise;
}

/** Safari path: draw the natively decoded photo upright and save it as JPEG. */
async function nativeToJpeg(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(bmp, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    canvas.width = canvas.height = 0;
    if (!blob) throw new Error('encode');
    return blob;
  } finally {
    bmp.close();
  }
}

async function convert(file: File): Promise<File> {
  let blob: Blob;
  try {
    blob = await nativeToJpeg(file);
  } catch {
    const heicTo = await loadHeicDecoder();
    blob = await heicTo({ blob: file, type: 'image/jpeg', quality: JPEG_QUALITY });
  }
  return new File([blob], jpegName(file.name), { type: 'image/jpeg', lastModified: file.lastModified });
}

/**
 * Returns the file unchanged unless it is HEIC/HEIF, in which case it resolves to a JPEG
 * copy. Results are cached per File, so re-running a tool with new settings is instant.
 */
export function prepareImage(file: File): Promise<File> {
  if (!isHeic(file.type, file.name)) return Promise.resolve(file);
  let pending = cache.get(file);
  if (!pending) {
    pending = convert(file);
    pending.catch(() => cache.delete(file));
    cache.set(file, pending);
  }
  return pending;
}

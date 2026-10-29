// Pure page-layout and image-sniffing logic for building a PDF from images.
// All lengths are PDF points (1/72 inch) unless the name says otherwise.

export type PageSizeId = 'a4' | 'letter' | 'fit';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type MarginId = 'none' | 'small' | 'large';

/** ISO 216 A4 is 210 x 297 mm; US Letter is 8.5 x 11 in. */
export const PAGE_SIZES: Record<Exclude<PageSizeId, 'fit'>, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export const MARGINS_MM: Record<MarginId, number> = { none: 0, small: 10, large: 20 };

/** CSS pixels are defined as 1/96 inch, so "fit image" pages print at the size the image shows on screen. */
export const PT_PER_PX = 72 / 96;

export function mmToPt(mm: number): number {
  return (mm * 72) / 25.4;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  /** Where the upright image goes, in PDF coordinates (origin bottom-left). */
  box: Box;
}

export interface LayoutOptions {
  size: PageSizeId;
  orientation: Orientation;
  margin: MarginId;
}

/**
 * Lays out one image (given in its upright, displayed pixel size) on a page.
 * Fixed paper sizes scale the image to fit inside the margins, keep its aspect
 * ratio and centre it. "fit" makes the page exactly the image size plus margins.
 */
export function layoutPage(imageWidth: number, imageHeight: number, options: LayoutOptions): PageLayout {
  const w = Math.max(1, imageWidth);
  const h = Math.max(1, imageHeight);
  const m = mmToPt(MARGINS_MM[options.margin] ?? 0);

  if (options.size === 'fit') {
    const width = w * PT_PER_PX;
    const height = h * PT_PER_PX;
    return { pageWidth: width + 2 * m, pageHeight: height + 2 * m, box: { x: m, y: m, width, height } };
  }

  const paper = PAGE_SIZES[options.size];
  const landscape = options.orientation === 'landscape' || (options.orientation === 'auto' && w > h);
  const pageWidth = landscape ? paper.height : paper.width;
  const pageHeight = landscape ? paper.width : paper.height;
  const availW = Math.max(1, pageWidth - 2 * m);
  const availH = Math.max(1, pageHeight - 2 * m);
  const scale = Math.min(availW / w, availH / h);
  const width = w * scale;
  const height = h * scale;
  return {
    pageWidth,
    pageHeight,
    box: { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height },
  };
}

export type ImageKind = 'jpeg' | 'png' | 'other';

export function sniffImage(bytes: Uint8Array): ImageKind {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  return 'other';
}

/**
 * Reads the EXIF Orientation tag (1–8) from a JPEG; 1 when absent or unreadable.
 * Phones store most photos sideways and set this tag instead of rotating pixels.
 */
export function jpegOrientation(bytes: Uint8Array): number {
  if (sniffImage(bytes) !== 'jpeg') return 1;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let p = 2;
  while (p + 4 <= bytes.length) {
    if (bytes[p] !== 0xff) return 1;
    const marker = bytes[p + 1];
    if (marker === 0xd9 || marker === 0xda) return 1; // end of image / start of scan
    const length = view.getUint16(p + 2);
    if (length < 2) return 1;
    if (marker === 0xe1 && p + 10 <= bytes.length && view.getUint32(p + 4) === 0x45786966 /* "Exif" */) {
      return readTiffOrientation(view, p + 10, Math.min(bytes.length, p + 2 + length));
    }
    p += 2 + length;
  }
  return 1;
}

function readTiffOrientation(view: DataView, tiff: number, end: number): number {
  if (tiff + 8 > end) return 1;
  const order = view.getUint16(tiff);
  if (order !== 0x4949 && order !== 0x4d4d) return 1;
  const le = order === 0x4949;
  const ifd = tiff + view.getUint32(tiff + 4, le);
  if (ifd + 2 > end) return 1;
  const count = view.getUint16(ifd, le);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) return 1;
    if (view.getUint16(entry, le) === 0x0112) {
      const value = view.getUint16(entry + 8, le);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

/** Orientations that only rotate (no mirroring) can be drawn rotated in the PDF without re-encoding. */
export function isPureRotation(orientation: number): boolean {
  return orientation === 1 || orientation === 3 || orientation === 6 || orientation === 8;
}

/** Orientations 5–8 are stored sideways: displayed width = stored height. */
export function displaySize(storedWidth: number, storedHeight: number, orientation: number): { width: number; height: number } {
  return orientation >= 5 && orientation <= 8 ? { width: storedHeight, height: storedWidth } : { width: storedWidth, height: storedHeight };
}

export interface Placement extends Box {
  /** Counter-clockwise degrees, rotating about (x, y) — pdf-lib's drawImage convention. */
  rotate: number;
}

/**
 * Arguments for pdf-lib's drawImage so that a JPEG stored with EXIF
 * orientation 3, 6 or 8 appears upright and fills `box` exactly.
 */
export function placement(orientation: number, box: Box): Placement {
  switch (orientation) {
    case 3: // stored upside down
      return { x: box.x + box.width, y: box.y + box.height, width: box.width, height: box.height, rotate: 180 };
    case 6: // stored rotated 90° counter-clockwise; turn it clockwise
      return { x: box.x, y: box.y + box.height, width: box.height, height: box.width, rotate: -90 };
    case 8: // stored rotated 90° clockwise; turn it counter-clockwise
      return { x: box.x + box.width, y: box.y, width: box.height, height: box.width, rotate: 90 };
    default:
      return { ...box, rotate: 0 };
  }
}

export function isImageFile(type: string, name: string): boolean {
  return type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(name);
}

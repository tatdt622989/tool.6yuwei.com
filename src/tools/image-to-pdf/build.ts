// pdf-lib side of the image-to-PDF tool. Imports pdf-lib statically, so the
// tool script loads this module with `await import('./build')` on first use.
// JPEG bytes are embedded as-is (no re-compression, no quality loss); PNG is
// embedded losslessly by pdf-lib. DOM-free and tested in node.

import { degrees, PDFDocument } from 'pdf-lib';
import { displaySize, layoutPage, placement, sniffImage, type LayoutOptions } from './logic';

export interface PdfImageInput {
  bytes: Uint8Array;
  /** EXIF orientation of a JPEG (1, 3, 6 or 8). Mirrored orientations must be re-encoded upright first. */
  orientation?: number;
}

export async function imagesToPdf(
  images: PdfImageInput[],
  options: LayoutOptions,
  title = '',
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  if (title) doc.setTitle(title);
  for (let i = 0; i < images.length; i++) {
    const { bytes } = images[i];
    const kind = sniffImage(bytes);
    if (kind === 'other') throw new Error('unsupported image');
    const image = kind === 'jpeg' ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    const orientation = kind === 'jpeg' ? (images[i].orientation ?? 1) : 1;
    const shown = displaySize(image.width, image.height, orientation);
    const layout = layoutPage(shown.width, shown.height, options);
    const page = doc.addPage([layout.pageWidth, layout.pageHeight]);
    const p = placement(orientation, layout.box);
    page.drawImage(image, { x: p.x, y: p.y, width: p.width, height: p.height, rotate: degrees(p.rotate) });
    onProgress?.(i + 1, images.length);
  }
  return doc.save({ useObjectStreams: true });
}

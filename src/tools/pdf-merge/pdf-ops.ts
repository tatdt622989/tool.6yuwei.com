// pdf-lib operations shared by the PDF merge and split tools. This module
// imports pdf-lib statically, so tool scripts must load it with
// `await import('../pdf-merge/pdf-ops')` to keep pdf-lib out of first paint.
// It has no DOM dependency and is tested in node.

import { degrees, EncryptedPDFError, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type PdfErrorCode = 'encrypted' | 'invalid' | 'empty';

export class PdfError extends Error {
  constructor(
    public code: PdfErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PdfError';
  }
}

export const PDF_ERROR_TEXT: Record<PdfErrorCode, string> = {
  encrypted: '這份 PDF 有密碼保護或加密，無法在瀏覽器中編輯。請先用原本的軟體解除保護（例如開啟後「列印」另存成 PDF），再重新加入。',
  invalid: '無法讀取這個檔案，可能不是 PDF 或檔案已損毀。',
  empty: '這份 PDF 沒有任何頁面。',
};

/** Loads a PDF and turns pdf-lib's exceptions into a code the UI can explain. */
export async function loadPdf(bytes: Uint8Array | ArrayBuffer): Promise<PDFDocument> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    if (err instanceof EncryptedPDFError || (err instanceof Error && /encrypt/i.test(err.message))) {
      throw new PdfError('encrypted', PDF_ERROR_TEXT.encrypted);
    }
    throw new PdfError('invalid', PDF_ERROR_TEXT.invalid);
  }
  if (doc.getPageCount() === 0) throw new PdfError('empty', PDF_ERROR_TEXT.empty);
  return doc;
}

export async function countPages(bytes: Uint8Array | ArrayBuffer): Promise<number> {
  return (await loadPdf(bytes)).getPageCount();
}

export function errorText(err: unknown): string {
  return err instanceof PdfError ? err.message : PDF_ERROR_TEXT.invalid;
}

function rotate(page: ReturnType<PDFDocument['getPage']>, extra: number) {
  if (!extra) return;
  const angle = (((page.getRotation().angle + extra) % 360) + 360) % 360;
  page.setRotation(degrees(angle));
}

/** Concatenates every page of every input, in order. */
export async function mergePdfs(
  inputs: (Uint8Array | ArrayBuffer)[],
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (let i = 0; i < inputs.length; i++) {
    const src = await loadPdf(inputs[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) out.addPage(page);
    onProgress?.(i + 1, inputs.length);
  }
  return out.save({ useObjectStreams: true });
}

/**
 * Builds one output PDF per group of 1-based page numbers from a single source.
 * `rotations` maps a 1-based page number to extra clockwise degrees.
 */
export async function buildFromPages(
  bytes: Uint8Array | ArrayBuffer,
  groups: number[][],
  rotations: Record<number, number> = {},
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array[]> {
  const src = await loadPdf(bytes);
  const count = src.getPageCount();
  const results: Uint8Array[] = [];
  for (let g = 0; g < groups.length; g++) {
    const indices = groups[g].filter((p) => p >= 1 && p <= count).map((p) => p - 1);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach((page, i) => {
      rotate(page, rotations[indices[i] + 1] ?? 0);
      out.addPage(page);
    });
    results.push(await out.save({ useObjectStreams: true }));
    onProgress?.(g + 1, groups.length);
  }
  return results;
}

/** Small demo PDF with numbered pages so people can try a tool without a file at hand. */
export async function makeSamplePdf(label: string, pageCount: number, hue = 0.25): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Sample ${label}`);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const small = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 140, width, height: 140, color: rgb(hue, 0.42, 0.85) });
    page.drawText(`Sample ${label}`, { x: 48, y: height - 92, size: 36, font, color: rgb(1, 1, 1) });
    const text = String(i);
    const size = 220;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, size)) / 2,
      y: height / 2 - 120,
      size,
      font,
      color: rgb(0.2, 0.22, 0.27),
    });
    page.drawText(`Page ${i} of ${pageCount}`, { x: 48, y: 48, size: 14, font: small, color: rgb(0.4, 0.42, 0.47) });
  }
  return doc.save();
}

// Lazy PDF.js loader and page renderer shared by the PDF split and PDF-to-image
// tools. PDF.js (about 1 MB with its worker) is only downloaded on first use.
// The legacy build is used on purpose: it includes polyfills for the older
// iOS Safari versions still common on phones in Taiwan.

import type { PDFDocumentProxy } from 'pdfjs-dist';

type PdfJs = typeof import('pdfjs-dist');
type Assets = typeof import('./pdfjs-assets');

let loader: Promise<{ lib: PdfJs; assets: Assets }> | null = null;

function load() {
  loader ??= Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs') as Promise<PdfJs>,
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    import('./pdfjs-assets'),
  ]).then(([lib, worker, assets]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return { lib, assets };
  });
  return loader;
}

export async function loadPdfJs(): Promise<PdfJs> {
  return (await load()).lib;
}

export type OpenErrorCode = 'encrypted' | 'invalid';

export class OpenError extends Error {
  constructor(public code: OpenErrorCode) {
    super(code);
  }
}

/**
 * Opens a PDF for rendering. PDF.js transfers the buffer to its worker, so a
 * copy is passed and the caller's bytes stay usable (pdf-lib needs them too).
 * Files that only carry an owner password (print / copy restrictions) open
 * fine; files that need a password to view raise OpenError('encrypted').
 */
export async function openForRender(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const { lib, assets } = await load();
  const task = lib.getDocument({
    data: bytes.slice(),
    ...assets.ASSET_OPTIONS,
    BinaryDataFactory: assets.AssetDataFactory,
  });
  task.onPassword = () => {
    void task.destroy();
  };
  try {
    return await task.promise;
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'PasswordException') throw new OpenError('encrypted');
    if (task.destroyed) throw new OpenError('encrypted');
    throw new OpenError('invalid');
  }
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/**
 * Renders one page (1-based) at `scale` (1 = 72 DPI) with an optional extra
 * clockwise rotation. The page is painted on white, so JPG output has no
 * black background.
 */
export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  extraRotation = 0,
  canvas: HTMLCanvasElement = document.createElement('canvas'),
): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);
  try {
    const viewport = page.getViewport({ scale, rotation: (page.rotate + extraRotation) % 360 });
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvas, viewport, background: 'rgb(255,255,255)' }).promise;
    return { canvas, width: canvas.width, height: canvas.height };
  } finally {
    page.cleanup();
  }
}

/** Page size in PDF points (1/72 inch) as displayed, i.e. after the page's own rotation. */
export async function pageSize(doc: PDFDocumentProxy, pageNumber: number): Promise<{ width: number; height: number }> {
  const page = await doc.getPage(pageNumber);
  const vp = page.getViewport({ scale: 1 });
  return { width: vp.width, height: vp.height };
}

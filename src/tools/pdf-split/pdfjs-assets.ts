// Serves PDF.js's binary helper files (CMaps, standard fonts, wasm decoders)
// from hashed Vite assets. Without CMaps, PDFs that use non-embedded CJK fonts
// (common in Taiwanese government and school forms, e.g. UniCNS-UCS2-H) render
// with missing text. Each file is a separate asset fetched only when a PDF
// actually needs it; this module itself is loaded lazily together with PDF.js.

type UrlMap = Record<string, string>;

const cmaps = import.meta.glob('../../../node_modules/pdfjs-dist/cmaps/*.bcmap', {
  query: '?url&no-inline',
  import: 'default',
  eager: true,
}) as UrlMap;
const fonts = import.meta.glob('../../../node_modules/pdfjs-dist/standard_fonts/*.{pfb,ttf}', {
  query: '?url&no-inline',
  import: 'default',
  eager: true,
}) as UrlMap;
const wasm = import.meta.glob('../../../node_modules/pdfjs-dist/wasm/*.wasm', {
  query: '?url&no-inline',
  import: 'default',
  eager: true,
}) as UrlMap;

function byFilename(map: UrlMap): Map<string, string> {
  return new Map(Object.entries(map).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1), url]));
}

const tables: Record<string, Map<string, string>> = {
  cMapUrl: byFilename(cmaps),
  standardFontDataUrl: byFilename(fonts),
  wasmUrl: byFilename(wasm),
};

/**
 * Placeholder base URLs. PDF.js only asks for these resources when the
 * corresponding option is set; the factory below maps file names to real URLs.
 */
export const ASSET_OPTIONS = {
  cMapUrl: 'pdfjs/cmaps/',
  standardFontDataUrl: 'pdfjs/standard_fonts/',
  wasmUrl: 'pdfjs/wasm/',
  useWorkerFetch: false,
} as const;

/** Drop-in replacement for PDF.js's DOMBinaryDataFactory (same constructor and fetch signature). */
export class AssetDataFactory {
  constructor(_options: { cMapUrl?: string | null; standardFontDataUrl?: string | null; wasmUrl?: string | null }) {}

  async fetch({ kind, filename }: { kind: string; filename: string }): Promise<Uint8Array> {
    const url = tables[kind]?.get(filename);
    if (!url) throw new Error(`Missing PDF.js asset: ${kind}/${filename}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return new Uint8Array(await response.arrayBuffer());
  }
}

import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { dropIndex, isPdfFile, mergeSummary, moveItem, safeFilename, shiftFor } from './logic';
import { buildFromPages, countPages, loadPdf, makeSamplePdf, mergePdfs, PdfError } from './pdf-ops';

describe('moveItem', () => {
  it('moves forward and backward without mutating', () => {
    const list = ['a', 'b', 'c', 'd'];
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(list).toEqual(['a', 'b', 'c', 'd']);
  });
  it('clamps the target and ignores invalid sources', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
});

describe('dropIndex / shiftFor', () => {
  // Four rows, 50px tall with 8px gaps.
  const bands = [0, 58, 116, 174].map((top) => ({ top, height: 50 }));
  it('stays put for small moves', () => {
    expect(dropIndex(bands, 1, 10)).toBe(1);
    expect(dropIndex(bands, 1, -20)).toBe(1);
  });
  it('passes a neighbour once the centre crosses its centre', () => {
    expect(dropIndex(bands, 0, 59)).toBe(1);
    expect(dropIndex(bands, 0, 200)).toBe(3);
    expect(dropIndex(bands, 3, -120)).toBe(1);
    expect(dropIndex(bands, 3, -999)).toBe(0);
  });
  it('slides the items between source and target', () => {
    // dragging 0 → 2: items 1 and 2 move up
    expect([0, 1, 2, 3].map((i) => shiftFor(i, 0, 2, 58))).toEqual([0, -58, -58, 0]);
    // dragging 3 → 1: items 1 and 2 move down
    expect([0, 1, 2, 3].map((i) => shiftFor(i, 3, 1, 58))).toEqual([0, 58, 58, 0]);
  });
});

describe('safeFilename', () => {
  it('adds the extension once and strips illegal characters', () => {
    expect(safeFilename('報告', 'merged')).toBe('報告.pdf');
    expect(safeFilename('a/b:c*?.PDF', 'merged')).toBe('abc.pdf');
    expect(safeFilename('   ', 'merged')).toBe('merged.pdf');
  });
});

describe('isPdfFile / mergeSummary', () => {
  it('accepts by MIME type or extension', () => {
    expect(isPdfFile('application/pdf', 'x')).toBe(true);
    expect(isPdfFile('', 'SCAN.PDF')).toBe(true);
    expect(isPdfFile('image/png', 'a.png')).toBe(false);
  });
  it('excludes failed files and needs two readable files', () => {
    expect(mergeSummary([{ size: 100, pages: 3 }, { size: 50, error: 'x' }])).toEqual({ files: 1, pages: 3, bytes: 100, ready: false });
    expect(mergeSummary([{ size: 100, pages: 3 }, { size: 50, pages: 2 }]).ready).toBe(true);
    expect(mergeSummary([{ size: 100, pages: 3 }, { size: 50 }]).ready).toBe(false);
  });
});

describe('pdf-ops (pdf-lib in node)', () => {
  it('merges documents in order', async () => {
    const a = await makeSamplePdf('A', 2);
    const b = await makeSamplePdf('B', 3);
    const merged = await mergePdfs([a, b]);
    expect(await countPages(merged)).toBe(5);
  });

  it('keeps page sizes when merging mixed formats', async () => {
    const letter = await PDFDocument.create();
    letter.addPage([612, 792]);
    const merged = await PDFDocument.load(await mergePdfs([await makeSamplePdf('A', 1), await letter.save()]));
    expect(merged.getPage(0).getSize().width).toBeCloseTo(595.28, 1);
    expect(merged.getPage(1).getSize()).toEqual({ width: 612, height: 792 });
  });

  it('builds outputs from page groups with rotation', async () => {
    const src = await makeSamplePdf('S', 5);
    const [first, second] = await buildFromPages(src, [[1, 3], [5]], { 3: 90 });
    const doc1 = await PDFDocument.load(first);
    expect(doc1.getPageCount()).toBe(2);
    expect(doc1.getPage(0).getRotation().angle).toBe(0);
    expect(doc1.getPage(1).getRotation().angle).toBe(90);
    expect(await countPages(second)).toBe(1);
  });

  it('adds to an existing page rotation', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const { degrees } = await import('pdf-lib');
    page.setRotation(degrees(270));
    const [out] = await buildFromPages(await doc.save(), [[1]], { 1: 180 });
    expect((await PDFDocument.load(out)).getPage(0).getRotation().angle).toBe(90);
  });

  it('reports invalid files with a friendly error', async () => {
    await expect(loadPdf(new TextEncoder().encode('hello, not a pdf'))).rejects.toBeInstanceOf(PdfError);
    await expect(loadPdf(new TextEncoder().encode('hello'))).rejects.toMatchObject({ code: 'invalid' });
  });

  it('detects encrypted PDFs', async () => {
    // A minimal PDF whose trailer declares an /Encrypt dictionary.
    const body = [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] >> endobj',
      '4 0 obj << /Filter /Standard /V 1 /R 2 /O (x) /U (y) /P -4 >> endobj',
      'trailer << /Root 1 0 R /Size 5 /Encrypt 4 0 R >>',
      '%%EOF',
    ].join('\n');
    await expect(loadPdf(new TextEncoder().encode(body))).rejects.toMatchObject({ code: 'encrypted' });
  });
});

import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { imagesToPdf } from './build';
import { JPEG_8x4, JPEG_8x4_ORIENT6, PNG_3x2 } from './fixtures';
import {
  displaySize,
  isImageFile,
  isPureRotation,
  jpegOrientation,
  layoutPage,
  mmToPt,
  PAGE_SIZES,
  placement,
  sniffImage,
  type Box,
} from './logic';

describe('layoutPage', () => {
  it('fits a portrait photo on A4 inside the margins, centred', () => {
    // 3000 x 4000 photo, 10 mm margins: 538.58 x 785.19 pt available, width is the limit.
    const l = layoutPage(3000, 4000, { size: 'a4', orientation: 'auto', margin: 'small' });
    expect(l.pageWidth).toBeCloseTo(595.28);
    expect(l.pageHeight).toBeCloseTo(841.89);
    const m = mmToPt(10);
    expect(l.box.width).toBeCloseTo(595.28 - 2 * m, 5);
    expect(l.box.height).toBeCloseTo(((595.28 - 2 * m) * 4) / 3, 5);
    expect(l.box.x).toBeCloseTo(m, 5);
    expect(l.box.y).toBeCloseTo((841.89 - l.box.height) / 2, 5);
  });

  it('turns the page for landscape images in auto mode', () => {
    const l = layoutPage(1600, 900, { size: 'letter', orientation: 'auto', margin: 'none' });
    expect(l.pageWidth).toBe(792);
    expect(l.pageHeight).toBe(612);
    expect(l.box.width).toBeCloseTo(792);
    expect(l.box.height).toBeCloseTo(445.5);
  });

  it('respects a forced orientation', () => {
    const l = layoutPage(1600, 900, { size: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.pageWidth).toBeCloseTo(PAGE_SIZES.a4.width);
    expect(l.box.width).toBeCloseTo(595.28);
    expect(l.box.height).toBeCloseTo((595.28 * 9) / 16);
  });

  it('scales small images up to fill the printable area', () => {
    const l = layoutPage(100, 100, { size: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.box.width).toBeCloseTo(595.28);
  });

  it('makes the page match the image in fit mode (96 px per inch)', () => {
    const l = layoutPage(960, 480, { size: 'fit', orientation: 'auto', margin: 'none' });
    expect(l).toEqual({ pageWidth: 720, pageHeight: 360, box: { x: 0, y: 0, width: 720, height: 360 } });
    const withMargin = layoutPage(960, 480, { size: 'fit', orientation: 'auto', margin: 'large' });
    expect(withMargin.pageWidth).toBeCloseTo(720 + 2 * mmToPt(20));
    expect(withMargin.box.x).toBeCloseTo(mmToPt(20));
  });

  it('converts millimetres to points', () => {
    expect(mmToPt(25.4)).toBe(72);
    expect(mmToPt(210)).toBeCloseTo(595.28, 1);
  });
});

describe('image sniffing and EXIF', () => {
  it('detects JPEG and PNG by signature', () => {
    expect(sniffImage(JPEG_8x4)).toBe('jpeg');
    expect(sniffImage(PNG_3x2)).toBe('png');
    expect(sniffImage(new TextEncoder().encode('GIF89a....'))).toBe('other');
  });

  it('reads orientation from a big-endian EXIF block', () => {
    expect(jpegOrientation(JPEG_8x4_ORIENT6)).toBe(6);
    expect(jpegOrientation(JPEG_8x4)).toBe(1);
    expect(jpegOrientation(PNG_3x2)).toBe(1);
  });

  it('reads orientation from a little-endian EXIF block', () => {
    const tiff = [0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, 1, 0, 0x12, 0x01, 3, 0, 1, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0];
    const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
    const len = exif.length + 2;
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 0xff, ...exif, 0xff, 0xd9]);
    expect(jpegOrientation(jpeg)).toBe(8);
  });

  it('survives truncated data', () => {
    expect(jpegOrientation(JPEG_8x4_ORIENT6.slice(0, 30))).toBe(1);
    expect(jpegOrientation(new Uint8Array([0xff, 0xd8, 0xff]))).toBe(1);
  });

  it('classifies orientations', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].filter(isPureRotation)).toEqual([1, 3, 6, 8]);
    expect(displaySize(4000, 3000, 6)).toEqual({ width: 3000, height: 4000 });
    expect(displaySize(4000, 3000, 3)).toEqual({ width: 4000, height: 3000 });
  });

  it('accepts images by MIME type or extension', () => {
    expect(isImageFile('image/webp', 'a')).toBe(true);
    expect(isImageFile('', 'scan.JPEG')).toBe(true);
    expect(isImageFile('application/pdf', 'a.pdf')).toBe(false);
  });
});

describe('placement', () => {
  const box: Box = { x: 10, y: 20, width: 300, height: 400 };

  /** Corners covered by a w x h image drawn at (x, y) rotated `deg` CCW about (x, y). */
  function covered(p: ReturnType<typeof placement>) {
    const rad = (p.rotate * Math.PI) / 180;
    const pts = [
      [0, 0],
      [p.width, 0],
      [0, p.height],
      [p.width, p.height],
    ].map(([a, b]) => [p.x + a * Math.cos(rad) - b * Math.sin(rad), p.y + a * Math.sin(rad) + b * Math.cos(rad)]);
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }

  for (const o of [1, 3, 6, 8]) {
    it(`fills the box exactly for orientation ${o}`, () => {
      const c = covered(placement(o, box));
      expect(c.minX).toBeCloseTo(10);
      expect(c.maxX).toBeCloseTo(310);
      expect(c.minY).toBeCloseTo(20);
      expect(c.maxY).toBeCloseTo(420);
    });
  }

  it('maps the stored top-left corner to the top-right for orientation 6', () => {
    // Orientation 6: the stored top row is shown as the right-hand column, so the stored
    // top-left corner (local (0, height)) must land on the box's top-right corner.
    const p = placement(6, box);
    const rad = (p.rotate * Math.PI) / 180;
    const x = p.x - p.height * Math.sin(rad);
    const y = p.y + p.height * Math.cos(rad);
    expect(x).toBeCloseTo(310);
    expect(y).toBeCloseTo(420);
  });
});

describe('imagesToPdf (pdf-lib in node)', () => {
  it('creates one page per image with the chosen layout', async () => {
    const bytes = await imagesToPdf(
      [{ bytes: JPEG_8x4 }, { bytes: PNG_3x2 }, { bytes: JPEG_8x4_ORIENT6, orientation: 6 }],
      { size: 'a4', orientation: 'auto', margin: 'none' },
      'Test',
    );
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    expect(doc.getTitle()).toBe('Test');
    // 8x4 JPEG is landscape → landscape A4
    expect(doc.getPage(0).getSize().width).toBeCloseTo(841.89);
    // 3x2 PNG is landscape too
    expect(doc.getPage(1).getSize().width).toBeCloseTo(841.89);
    // Orientation 6 shows the 8x4 JPEG as 4x8 → portrait page
    expect(doc.getPage(2).getSize().width).toBeCloseTo(595.28);
  });

  it('sizes fit-mode pages to the image', async () => {
    const doc = await PDFDocument.load(await imagesToPdf([{ bytes: JPEG_8x4 }], { size: 'fit', orientation: 'auto', margin: 'none' }));
    expect(doc.getPage(0).getSize()).toEqual({ width: 6, height: 3 });
  });

  it('rejects formats that must be converted first', async () => {
    await expect(imagesToPdf([{ bytes: new Uint8Array([1, 2, 3, 4]) }], { size: 'a4', orientation: 'auto', margin: 'none' })).rejects.toThrow();
  });
});

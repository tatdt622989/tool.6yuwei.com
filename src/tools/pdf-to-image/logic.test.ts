import { describe, expect, it } from 'vitest';
import { a4Pixels, imageFilename, letterPixels, MAX_CANVAS_PIXELS, mimeFor, pagesToRender, paperPixels, planRender } from './logic';

describe('planRender', () => {
  it('converts DPI to a scale of the 72 DPI page', () => {
    const p = planRender(595.28, 841.89, 144);
    expect(p.scale).toBe(2);
    expect(p.width).toBe(1190);
    expect(p.height).toBe(1683);
    expect(p.limited).toBe(false);
  });
  it('matches the common A4 pixel sizes', () => {
    expect(a4Pixels(72)).toEqual({ width: 595, height: 841 });
    expect(a4Pixels(150)).toEqual({ width: 1240, height: 1753 });
    expect(a4Pixels(300)).toEqual({ width: 2480, height: 3507 });
  });
  it('matches the US Letter pixel sizes', () => {
    expect(letterPixels(72)).toEqual({ width: 612, height: 792 });
    expect(letterPixels(150)).toEqual({ width: 1275, height: 1650 });
    expect(letterPixels(300)).toEqual({ width: 2550, height: 3300 });
    expect(paperPixels('letter', 150)).toEqual(letterPixels(150));
    expect(paperPixels('a4', 150)).toEqual(a4Pixels(150));
  });
  it('lowers the resolution for huge pages', () => {
    // A0 poster (2384 x 3370 pt) at 300 DPI would be ~139 million pixels.
    const p = planRender(2384, 3370, 300);
    expect(p.limited).toBe(true);
    expect(p.width * p.height).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
    expect(p.dpi).toBeLessThan(300);
  });
  it('limits very long pages by their longest side', () => {
    const p = planRender(200, 14400, 300);
    expect(p.limited).toBe(true);
    expect(p.height).toBeLessThanOrEqual(16384);
  });
});

describe('pagesToRender', () => {
  it('uses every page when the range is empty', () => {
    expect(pagesToRender('', 4).pages).toEqual([1, 2, 3, 4]);
    expect(pagesToRender('  ', 2).pages).toEqual([1, 2]);
  });
  it('parses ranges and reports errors', () => {
    expect(pagesToRender('2-3', 5).pages).toEqual([2, 3]);
    expect(pagesToRender('9', 5).errors).toHaveLength(1);
  });
  it('uses localized error messages when given', () => {
    const en = { unreadable: 'Can’t read “{token}”', outOfRange: '“{token}” is out of range ({count} pages)' };
    expect(pagesToRender('9', 5, en).errors).toEqual(['“9” is out of range (5 pages)']);
    expect(pagesToRender('9', 5).errors).toEqual(['「9」超出範圍（共 5 頁）']);
  });
});

describe('names and types', () => {
  it('pads page numbers to the document length', () => {
    expect(imageFilename('講義.pdf', 3, 120, 'jpeg')).toBe('講義-p003.jpg');
    expect(imageFilename('a.PDF', 7, 9, 'png')).toBe('a-p7.png');
  });
  it('maps formats to MIME types', () => {
    expect(mimeFor('jpeg')).toBe('image/jpeg');
    expect(mimeFor('png')).toBe('image/png');
  });
});

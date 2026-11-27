import { describe, expect, it } from 'vitest';
import { FORMATS, formatLabel, hasTransparency, looksLikeImage, normalizeHex, outputFilename, sizeChangePercent } from './logic';

describe('looksLikeImage', () => {
  it('accepts image MIME types and known extensions', () => {
    expect(looksLikeImage('image/png', 'a.png')).toBe(true);
    expect(looksLikeImage('', 'IMG_1234.HEIC')).toBe(true);
    expect(looksLikeImage('application/pdf', 'doc.pdf')).toBe(false);
  });
});

describe('formatLabel', () => {
  it('maps MIME types and falls back to the extension', () => {
    expect(formatLabel('image/jpeg')).toBe('JPG');
    expect(formatLabel('image/svg+xml')).toBe('SVG');
    expect(formatLabel('', 'photo.heic')).toBe('HEIC');
    expect(formatLabel('')).toBe('未知');
    expect(formatLabel('', '', 'Unknown')).toBe('Unknown');
    expect(formatLabel('', 'scan.TIF', 'Unknown')).toBe('TIF');
  });
});

describe('outputFilename', () => {
  it('swaps the extension', () => {
    expect(outputFilename('photo.HEIC', 'jpeg')).toBe('photo.jpg');
    expect(outputFilename('a.b.png', 'webp')).toBe('a.b.webp');
    expect(outputFilename('noext', 'avif')).toBe('noext.avif');
    expect(outputFilename('', 'png')).toBe('image.png');
  });
});

describe('FORMATS', () => {
  it('flags JPG as the only format without alpha', () => {
    const noAlpha = Object.entries(FORMATS).filter(([, f]) => !f.alpha).map(([k]) => k);
    expect(noAlpha).toEqual(['jpeg']);
    expect(FORMATS.png.lossy).toBe(false);
  });
});

describe('normalizeHex', () => {
  it('expands and validates colors', () => {
    expect(normalizeHex('#FFF')).toBe('#ffffff');
    expect(normalizeHex('1a2B3c')).toBe('#1a2b3c');
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('red')).toBeNull();
  });
});

describe('hasTransparency', () => {
  it('detects any non-opaque pixel', () => {
    expect(hasTransparency([0, 0, 0, 255, 10, 10, 10, 255])).toBe(false);
    expect(hasTransparency([0, 0, 0, 255, 10, 10, 10, 254])).toBe(true);
    expect(hasTransparency(new Uint8ClampedArray(0))).toBe(false);
  });
});

describe('sizeChangePercent', () => {
  it('reports growth and shrinkage', () => {
    expect(sizeChangePercent(1000, 500)).toBe(-50);
    expect(sizeChangePercent(1000, 1500)).toBe(50);
    expect(sizeChangePercent(0, 10)).toBe(0);
  });
});

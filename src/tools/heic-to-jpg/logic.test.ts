import { describe, expect, it } from 'vitest';
import { encoderQuality, isHeic, outputFilename, outputMime, sizeChangePercent } from './logic';

describe('isHeic', () => {
  it('accepts HEIC / HEIF MIME types', () => {
    expect(isHeic('image/heic', 'a')).toBe(true);
    expect(isHeic('image/HEIF', 'a')).toBe(true);
    expect(isHeic('image/heic-sequence', 'a')).toBe(true);
  });
  it('falls back to the extension when the type is empty or generic', () => {
    expect(isHeic('', 'IMG_1234.HEIC')).toBe(true);
    expect(isHeic('application/octet-stream', 'photo.heif')).toBe(true);
    expect(isHeic('', 'clip.hif')).toBe(true);
  });
  it('rejects other images', () => {
    expect(isHeic('image/jpeg', 'IMG_1.jpg')).toBe(false);
    expect(isHeic('', 'heic.png')).toBe(false);
    expect(isHeic('', 'noext')).toBe(false);
  });
});

describe('outputFilename', () => {
  it('swaps the extension', () => {
    expect(outputFilename('IMG_1234.HEIC', 'jpeg')).toBe('IMG_1234.jpg');
    expect(outputFilename('IMG_1234.heic', 'png')).toBe('IMG_1234.png');
  });
  it('keeps inner dots and handles missing names', () => {
    expect(outputFilename('trip.day1.heic', 'jpeg')).toBe('trip.day1.jpg');
    expect(outputFilename('.heic', 'jpeg')).toBe('.heic.jpg');
    expect(outputFilename('', 'jpeg')).toBe('photo.jpg');
    expect(outputFilename('noext', 'png')).toBe('noext.png');
  });
});

describe('encoder settings', () => {
  it('maps MIME types', () => {
    expect(outputMime('jpeg')).toBe('image/jpeg');
    expect(outputMime('png')).toBe('image/png');
  });
  it('uses quality only for JPG and clamps it', () => {
    expect(encoderQuality('png', 80)).toBeUndefined();
    expect(encoderQuality('jpeg', 92)).toBeCloseTo(0.92);
    expect(encoderQuality('jpeg', 150)).toBe(1);
    expect(encoderQuality('jpeg', 0)).toBe(0.1);
    expect(encoderQuality('jpeg', Number.NaN)).toBe(0.9);
  });
});

describe('sizeChangePercent', () => {
  it('returns signed change', () => {
    expect(sizeChangePercent(1000, 1800)).toBeCloseTo(80);
    expect(sizeChangePercent(1000, 500)).toBeCloseTo(-50);
    expect(sizeChangePercent(0, 500)).toBe(0);
  });
});


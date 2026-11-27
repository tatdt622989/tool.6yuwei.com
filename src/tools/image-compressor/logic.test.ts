import { describe, expect, it } from 'vitest';
import {
  fitToMaxWidth,
  isSupportedInput,
  needsOpaqueBackground,
  outputFilename,
  qualityApplies,
  resolveOutputType,
  savedPercent,
  shouldKeepOriginal,
  stepDownSizes,
} from './logic';

describe('resolveOutputType', () => {
  it('keeps the input format by default', () => {
    expect(resolveOutputType('image/png', 'keep')).toBe('image/png');
    expect(resolveOutputType('image/webp', 'keep')).toBe('image/webp');
  });

  it('honours an explicit format', () => {
    expect(resolveOutputType('image/png', 'jpeg')).toBe('image/jpeg');
    expect(resolveOutputType('image/jpeg', 'webp')).toBe('image/webp');
  });

  it('falls back to JPG for unknown inputs', () => {
    expect(resolveOutputType('image/bmp', 'keep')).toBe('image/jpeg');
  });
});

describe('format traits', () => {
  it('knows which formats are supported and lossy', () => {
    expect(isSupportedInput('image/jpeg')).toBe(true);
    expect(isSupportedInput('image/gif')).toBe(false);
    expect(qualityApplies('image/png')).toBe(false);
    expect(qualityApplies('image/webp')).toBe(true);
    expect(needsOpaqueBackground('image/jpeg')).toBe(true);
    expect(needsOpaqueBackground('image/webp')).toBe(false);
  });
});

describe('fitToMaxWidth', () => {
  it('scales down proportionally', () => {
    expect(fitToMaxWidth(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440 });
  });

  it('never upscales and ignores empty limits', () => {
    expect(fitToMaxWidth(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    expect(fitToMaxWidth(800, 600, null)).toEqual({ width: 800, height: 600 });
    expect(fitToMaxWidth(800, 600, 0)).toEqual({ width: 800, height: 600 });
  });

  it('keeps at least one pixel of height', () => {
    expect(fitToMaxWidth(10000, 2, 100).height).toBe(1);
  });
});

describe('stepDownSizes', () => {
  it('halves until within 2x of the target', () => {
    expect(stepDownSizes(4000, 3000, 500, 375)).toEqual([
      { width: 2000, height: 1500 },
      { width: 1000, height: 750 },
    ]);
  });

  it('returns no steps for small ratios or upscaling', () => {
    expect(stepDownSizes(1000, 800, 600, 480)).toEqual([]);
    expect(stepDownSizes(100, 100, 400, 400)).toEqual([]);
  });

  it('handles each axis independently', () => {
    expect(stepDownSizes(1000, 100, 200, 100)).toEqual([
      { width: 500, height: 100 },
      { width: 250, height: 100 },
    ]);
  });
});

describe('outputFilename', () => {
  it('replaces only the last extension', () => {
    expect(outputFilename('photo.final.PNG', 'image/webp')).toBe('photo.final-compressed.webp');
    expect(outputFilename('IMG_0001.jpeg', 'image/jpeg')).toBe('IMG_0001-compressed.jpg');
  });

  it('handles names without an extension', () => {
    expect(outputFilename('scan', 'image/png')).toBe('scan-compressed.png');
    expect(outputFilename('.hidden', 'image/png')).toBe('.hidden-compressed.png');
  });
});

describe('savings', () => {
  it('computes percent saved', () => {
    expect(savedPercent(1000, 250)).toBe(75);
    expect(savedPercent(1000, 1200)).toBeCloseTo(-20);
    expect(savedPercent(0, 10)).toBe(0);
  });

  it('keeps the original when the output is not smaller', () => {
    expect(shouldKeepOriginal(1000, 1000, false)).toBe(true);
    expect(shouldKeepOriginal(1000, 1100, false)).toBe(true);
    expect(shouldKeepOriginal(1000, 900, false)).toBe(false);
    expect(shouldKeepOriginal(1000, 1100, true)).toBe(false);
  });
});

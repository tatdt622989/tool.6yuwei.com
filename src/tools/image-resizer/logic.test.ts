import { describe, expect, it } from 'vitest';
import {
  computeLayout,
  describeSpec,
  exceedsLimit,
  hasPadding,
  outputFilename,
  PRESETS,
  proportionalHeight,
  proportionalWidth,
  resolveOutputType,
  stepDownSizes,
  type ResizeSpec,
} from './logic';

const size = (width: number | null, height: number | null, lockRatio = true, fit: 'contain' | 'cover' | 'stretch' = 'cover'): ResizeSpec => ({
  mode: 'size',
  width,
  height,
  lockRatio,
  fit,
});

describe('computeLayout: percent', () => {
  it('scales both sides', () => {
    expect(computeLayout(4000, 3000, { mode: 'percent', percent: 25 })).toMatchObject({ width: 1000, height: 750 });
    expect(computeLayout(100, 100, { mode: 'percent', percent: 200 })).toMatchObject({ width: 200, height: 200 });
  });

  it('never produces zero-pixel sides', () => {
    expect(computeLayout(10, 1, { mode: 'percent', percent: 1 })).toMatchObject({ width: 1, height: 1 });
  });

  it('rejects empty or invalid percentages', () => {
    expect(computeLayout(100, 100, { mode: 'percent', percent: 0 })).toBeNull();
    expect(computeLayout(100, 100, { mode: 'percent', percent: Number.NaN })).toBeNull();
  });
});

describe('computeLayout: proportional', () => {
  it('derives the missing side', () => {
    expect(computeLayout(4000, 3000, size(1200, null))).toMatchObject({ width: 1200, height: 900 });
    expect(computeLayout(4000, 3000, size(null, 600))).toMatchObject({ width: 800, height: 600 });
  });

  it('fits inside both sides when locked', () => {
    expect(computeLayout(4000, 3000, size(1000, 1000))).toMatchObject({ width: 1000, height: 750 });
    expect(computeLayout(3000, 4000, size(1000, 1000))).toMatchObject({ width: 750, height: 1000 });
  });

  it('treats one empty side as proportional even when unlocked', () => {
    expect(computeLayout(2000, 1000, size(500, null, false, 'stretch'))).toMatchObject({ width: 500, height: 250 });
  });

  it('returns null with no size', () => {
    expect(computeLayout(100, 100, size(null, null))).toBeNull();
  });
});

describe('computeLayout: fixed box', () => {
  it('stretches to the exact box', () => {
    expect(computeLayout(4000, 3000, size(1080, 1080, false, 'stretch'))).toEqual({
      width: 1080,
      height: 1080,
      sx: 0,
      sy: 0,
      sw: 4000,
      sh: 3000,
      dx: 0,
      dy: 0,
      dw: 1080,
      dh: 1080,
    });
  });

  it('contains with centred padding', () => {
    const l = computeLayout(4000, 2000, size(1000, 1000, false, 'contain'))!;
    expect(l).toMatchObject({ width: 1000, height: 1000, dx: 0, dy: 250, dw: 1000, dh: 500 });
    expect(hasPadding(l)).toBe(true);
  });

  it('covers by cropping the centre', () => {
    const l = computeLayout(4000, 2000, size(1000, 1000, false, 'cover'))!;
    expect(l).toMatchObject({ width: 1000, height: 1000, sx: 1000, sy: 0, sw: 2000, sh: 2000, dw: 1000, dh: 1000 });
    expect(hasPadding(l)).toBe(false);
  });

  it('crops vertically for tall sources', () => {
    const l = computeLayout(1000, 3000, size(1200, 630, false, 'cover'))!;
    expect(l.sw).toBe(1000);
    expect(l.sh).toBeCloseTo(525);
    expect(l.sy).toBeCloseTo(1237.5);
  });
});

describe('limits and helpers', () => {
  it('flags huge canvases', () => {
    expect(exceedsLimit(computeLayout(100, 100, { mode: 'percent', percent: 10000 })!)).toBe(true);
    expect(exceedsLimit(computeLayout(4000, 3000, { mode: 'percent', percent: 100 })!)).toBe(false);
  });

  it('computes proportional sides', () => {
    expect(proportionalHeight(1920, 1080, 1280)).toBe(720);
    expect(proportionalWidth(1920, 1080, 540)).toBe(960);
  });

  it('steps down large reductions', () => {
    expect(stepDownSizes(4000, 4000, 500, 500)).toEqual([
      { width: 2000, height: 2000 },
      { width: 1000, height: 1000 },
    ]);
    expect(stepDownSizes(800, 800, 1600, 1600)).toEqual([]);
  });

  it('has sane presets', () => {
    expect(PRESETS.find((p) => p.label.includes('OG'))).toMatchObject({ width: 1200, height: 630 });
  });
});

describe('describeSpec', () => {
  it('explains each mode', () => {
    expect(describeSpec({ mode: 'percent', percent: 50 })).toContain('50%');
    expect(describeSpec(size(1200, null))).toContain('高度依比例');
    expect(describeSpec(size(1080, 1080, false, 'cover'))).toContain('裁切');
    expect(describeSpec(size(1080, 1080, false, 'contain'))).toContain('留白');
    expect(describeSpec(size(1080, 1080, false, 'stretch'))).toContain('變形');
    expect(describeSpec(size(null, null))).toBe('請輸入寬度或高度');
  });
});

describe('output', () => {
  it('resolves type and filename', () => {
    expect(resolveOutputType('image/jpeg', 'keep')).toBe('image/jpeg');
    expect(resolveOutputType('image/gif', 'keep')).toBe('image/png');
    expect(resolveOutputType('image/png', 'webp')).toBe('image/webp');
    expect(outputFilename('photo.jpeg', 1080, 1080, 'image/jpeg')).toBe('photo-1080x1080.jpg');
    expect(outputFilename('shot', 640, 360, 'image/webp')).toBe('shot-640x360.webp');
  });
});

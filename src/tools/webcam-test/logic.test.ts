import { describe, expect, it } from 'vitest';
import {
  aspectRatio,
  buildVideoConstraints,
  describeMediaError,
  fpsFromCounts,
  fpsFromTimestamps,
  isPreset,
  maxResolution,
  megapixels,
  pushTimestamp,
  resolutionLabel,
  snapshotFilename,
} from './logic';

describe('resolution helpers', () => {
  it('labels common resolutions', () => {
    expect(resolutionLabel(3840, 2160)).toBe('4K UHD');
    expect(resolutionLabel(2560, 1440)).toBe('1440p QHD');
    expect(resolutionLabel(1920, 1080)).toBe('1080p Full HD');
    expect(resolutionLabel(1080, 1920)).toBe('1080p Full HD');
    expect(resolutionLabel(1280, 720)).toBe('720p HD');
    expect(resolutionLabel(640, 480)).toBe('480p SD');
    expect(resolutionLabel(320, 240)).toBe('240p');
    expect(resolutionLabel(0, 0)).toBe('—');
  });

  it('computes aspect ratios', () => {
    expect(aspectRatio(1920, 1080)).toBe('16:9');
    expect(aspectRatio(640, 480)).toBe('4:3');
    expect(aspectRatio(1280, 800)).toBe('16:10');
    expect(aspectRatio(720, 1280)).toBe('9:16');
    expect(aspectRatio(1000, 1000)).toBe('1:1');
    expect(aspectRatio(1366, 768)).toBe('16:9');
    expect(aspectRatio(500, 300)).toBe('5:3');
    expect(aspectRatio(0, 480)).toBe('—');
  });

  it('computes megapixels', () => {
    expect(megapixels(1920, 1080)).toBe(2.1);
    expect(megapixels(3840, 2160)).toBe(8.3);
    expect(megapixels(0, 10)).toBe(0);
  });

  it('formats max capability resolution', () => {
    expect(maxResolution({ width: { max: 3840 }, height: { max: 2160 } })).toBe('3840 × 2160');
    expect(maxResolution({ width: { max: 1920 } })).toBeNull();
    expect(maxResolution(undefined)).toBeNull();
  });
});

describe('constraints', () => {
  it('uses ideal resolution and optional device', () => {
    expect(buildVideoConstraints('1080p')).toEqual({ width: { ideal: 1920 }, height: { ideal: 1080 } });
    expect(buildVideoConstraints('720p', 'abc').deviceId).toEqual({ ideal: 'abc' });
    expect(buildVideoConstraints('4k', 'abc', true).deviceId).toEqual({ exact: 'abc' });
  });

  it('validates presets', () => {
    expect(isPreset('720p')).toBe(true);
    expect(isPreset('8k')).toBe(false);
    expect(isPreset(undefined)).toBe(false);
  });
});

describe('frame rate', () => {
  it('measures fps from timestamps', () => {
    const ts = Array.from({ length: 31 }, (_, i) => i * (1000 / 30));
    expect(fpsFromTimestamps(ts, 1000)).toBeCloseTo(30, 5);
    expect(fpsFromTimestamps([0], 10)).toBe(0);
    expect(fpsFromTimestamps([0, 0], 10)).toBe(0);
    expect(fpsFromTimestamps([0, 100, 5000, 5040], 5040)).toBeCloseTo(25);
  });

  it('measures fps from frame counters', () => {
    expect(fpsFromCounts(100, 160, 2000)).toBe(30);
    expect(fpsFromCounts(100, 90, 1000)).toBe(0);
    expect(fpsFromCounts(0, 10, 0)).toBe(0);
  });

  it('keeps a bounded timestamp window', () => {
    const list: number[] = [];
    for (let t = 0; t <= 3000; t += 100) pushTimestamp(list, t);
    expect(list[0]).toBe(2000);
    expect(list.at(-1)).toBe(3000);
  });
});

describe('misc', () => {
  it('builds snapshot filenames', () => {
    expect(snapshotFilename(new Date(2026, 9, 29, 8, 5, 9))).toBe('webcam-20261029-080509.png');
  });

  it('re-exports camera error messages', () => {
    expect(describeMediaError('NotFoundError', 'camera').title).toBe('找不到相機');
    expect(describeMediaError('NotAllowedError', 'camera').showPermissionHelp).toBe(true);
  });
});

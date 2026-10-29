import { describe, expect, it } from 'vitest';
import { isPatternSet, keyAction, nextIndex, PATTERNS, physicalResolution, prevIndex, steppedGradient, tapAction } from './logic';

describe('patterns', () => {
  it('dead-pixel set uses exact pure colors in the classic order', () => {
    expect(PATTERNS.pixels.map((p) => p.background)).toEqual(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#808080']);
  });

  it('has unique ids across all sets', () => {
    const ids = Object.values(PATTERNS).flat().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('validates set names', () => {
    expect(isPatternSet('gradient')).toBe(true);
    expect(isPatternSet('nope')).toBe(false);
    expect(isPatternSet(undefined)).toBe(false);
  });
});

describe('steppedGradient', () => {
  it('builds flat bands from black to white', () => {
    const g = steppedGradient(4, [0, 0, 0], [255, 255, 255]);
    expect(g.startsWith('linear-gradient(to right,')).toBe(true);
    expect(g).toContain('rgb(0 0 0) 0%, rgb(0 0 0) 25%');
    expect(g).toContain('rgb(85 85 85) 25%');
    expect(g).toContain('rgb(255 255 255) 75%, rgb(255 255 255) 100%');
  });

  it('clamps to at least two steps', () => {
    const g = steppedGradient(1, [0, 0, 0], [255, 0, 0]);
    expect(g).toContain('rgb(255 0 0) 100%');
    expect(g.match(/rgb\(/g)).toHaveLength(4);
  });
});

describe('navigation', () => {
  it('wraps forward and backward', () => {
    expect(nextIndex(0, 6)).toBe(1);
    expect(nextIndex(5, 6)).toBe(0);
    expect(prevIndex(0, 6)).toBe(5);
    expect(prevIndex(3, 6)).toBe(2);
    expect(nextIndex(0, 0)).toBe(0);
    expect(prevIndex(0, 1)).toBe(0);
  });

  it('maps keys', () => {
    expect(keyAction('ArrowRight')).toBe('next');
    expect(keyAction(' ')).toBe('next');
    expect(keyAction('ArrowLeft')).toBe('prev');
    expect(keyAction('Escape')).toBe('exit');
    expect(keyAction('a')).toBeNull();
  });

  it('maps taps by horizontal position', () => {
    expect(tapAction(10, 1000)).toBe('prev');
    expect(tapAction(249, 1000)).toBe('prev');
    expect(tapAction(250, 1000)).toBe('next');
    expect(tapAction(900, 1000)).toBe('next');
    expect(tapAction(0, 0)).toBe('next');
  });
});

describe('physicalResolution', () => {
  it('multiplies by devicePixelRatio', () => {
    expect(physicalResolution({ cssWidth: 1440, cssHeight: 900, dpr: 2 })).toEqual({ width: 2880, height: 1800 });
    expect(physicalResolution({ cssWidth: 1536, cssHeight: 864, dpr: 1.25 })).toEqual({ width: 1920, height: 1080 });
    expect(physicalResolution({ cssWidth: 800, cssHeight: 600, dpr: 0 })).toEqual({ width: 800, height: 600 });
  });
});

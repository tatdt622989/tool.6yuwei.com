import { describe, expect, it } from 'vitest';
import {
  BLACK,
  WHITE,
  composite,
  contrastRatio,
  hslToRgb,
  oklchToRgb,
  parseColor,
  rgbToHsl,
  rgbToOklch,
  toHex,
  toHslString,
  toOklchString,
  toRgbString,
  wcag,
} from './logic';

const rgb = (r: number, g: number, b: number, a = 1) => ({ r, g, b, a });

describe('parseColor', () => {
  it('parses hex in all lengths, with or without #', () => {
    expect(parseColor('#f00')).toEqual(rgb(255, 0, 0));
    expect(parseColor('2456E3')).toEqual(rgb(0x24, 0x56, 0xe3));
    expect(parseColor('#ff000080')).toEqual(rgb(255, 0, 0, 128 / 255));
    expect(parseColor('#f008')?.a).toBeCloseTo(0x88 / 255);
  });

  it('parses rgb() in comma and space syntax, with percentages and alpha', () => {
    expect(parseColor('rgb(36, 86, 227)')).toEqual(rgb(36, 86, 227));
    expect(parseColor('rgba(36,86,227,0.5)')).toEqual(rgb(36, 86, 227, 0.5));
    expect(parseColor('rgb(100% 0% 0% / 25%)')).toEqual(rgb(255, 0, 0, 0.25));
    expect(parseColor('36, 86, 227')).toEqual(rgb(36, 86, 227));
  });

  it('parses hsl() and oklch()', () => {
    const red = parseColor('hsl(0, 100%, 50%)')!;
    expect(toHex(red)).toBe('#ff0000');
    expect(toHex(parseColor('hsl(120deg 100% 25% / 0.5)')!)).toBe('#00800080');
    expect(toHex(parseColor('oklch(62.8% 0.2577 29.23)')!)).toBe('#ff0000');
    expect(toHex(parseColor('oklch(1 0 0)')!)).toBe('#ffffff');
  });

  it('rejects invalid input', () => {
    for (const bad of ['', '#ggg', '#12345', 'rgb(1,2)', 'rgb(a,b,c)', 'hello', 'rgb(1,2,3,4,5)']) {
      expect(parseColor(bad)).toBeNull();
    }
  });
});

describe('conversions', () => {
  it('converts RGB to HSL and back', () => {
    expect(rgbToHsl(rgb(255, 0, 0))).toEqual({ h: 0, s: 100, l: 50 });
    const hsl = rgbToHsl(rgb(36, 86, 227));
    const back = hslToRgb(hsl);
    expect(Math.round(back.r)).toBe(36);
    expect(Math.round(back.g)).toBe(86);
    expect(Math.round(back.b)).toBe(227);
    expect(rgbToHsl(rgb(128, 128, 128))).toMatchObject({ h: 0, s: 0 });
  });

  it('converts to OKLCH with reference values', () => {
    const red = rgbToOklch(rgb(255, 0, 0));
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 3);
    expect(red.h).toBeCloseTo(29.23, 1);
    expect(rgbToOklch(rgb(255, 255, 255))).toMatchObject({ c: 0, h: 0 });
    expect(rgbToOklch(rgb(255, 255, 255)).l).toBeCloseTo(1, 4);
  });

  it('round-trips OKLCH and reports gamut', () => {
    for (const c of [rgb(36, 86, 227), rgb(18, 128, 92), rgb(10, 10, 10)]) {
      const { rgb: back, inGamut } = oklchToRgb(rgbToOklch(c));
      expect(inGamut).toBe(true);
      expect(toHex({ ...back, a: 1 })).toBe(toHex(c));
    }
    expect(oklchToRgb({ l: 0.7, c: 0.4, h: 150 }).inGamut).toBe(false);
  });
});

describe('formatting', () => {
  const blue = rgb(36, 86, 227);
  it('formats each notation', () => {
    expect(toHex(blue)).toBe('#2456e3');
    expect(toRgbString(blue)).toBe('rgb(36, 86, 227)');
    expect(toHslString(blue)).toMatch(/^hsl\(224\.\d, 77\.\d%, 51\.\d%\)$/);
    expect(toOklchString(rgb(255, 0, 0))).toBe('oklch(62.8% 0.258 29.2)');
  });

  it('includes alpha when translucent', () => {
    const half = rgb(255, 0, 0, 0.5);
    expect(toHex(half)).toBe('#ff000080');
    expect(toRgbString(half)).toBe('rgba(255, 0, 0, 0.5)');
    expect(toHslString(half)).toBe('hsla(0, 100%, 50%, 0.5)');
    expect(toOklchString(half)).toBe('oklch(62.8% 0.258 29.2 / 0.5)');
  });
});

describe('WCAG contrast', () => {
  it('computes known ratios', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 5);
    expect(contrastRatio(rgb(0x77, 0x77, 0x77), WHITE)).toBeCloseTo(4.48, 2);
    expect(contrastRatio(rgb(0x76, 0x76, 0x76), WHITE)).toBeCloseTo(4.54, 2);
    expect(contrastRatio(WHITE, WHITE)).toBe(1);
  });

  it('applies AA / AAA thresholds', () => {
    expect(wcag(4.48)).toEqual({ aaNormal: false, aaLarge: true, aaaNormal: false, aaaLarge: false });
    expect(wcag(7.1)).toEqual({ aaNormal: true, aaLarge: true, aaaNormal: true, aaaLarge: true });
    expect(wcag(2.9).aaLarge).toBe(false);
  });

  it('composites translucent colors over the background', () => {
    expect(composite(rgb(0, 0, 0, 0.5), WHITE)).toEqual(rgb(127.5, 127.5, 127.5));
  });
});

describe('gamut clipping', () => {
  it('flags out-of-gamut oklch input', () => {
    expect(parseColor('oklch(70% 0.4 150)')?.clipped).toBe(true);
    expect(parseColor('oklch(62.8% 0.2577 29.23)')?.clipped).toBeUndefined();
  });
});

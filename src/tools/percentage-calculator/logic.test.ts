import { describe, expect, it } from 'vitest';
import { applyPercent, clean, percentChange, percentOf, percentRatio } from './logic';

describe('percentOf', () => {
  it('computes X × Y%', () => {
    expect(percentOf(200, 15)).toBe(30);
    expect(percentOf(80, 12.5)).toBe(10);
    expect(percentOf(-50, 10)).toBe(-5);
    expect(percentOf(0, 30)).toBe(0);
  });

  it('handles percentages above 100', () => {
    expect(percentOf(40, 250)).toBe(100);
  });

  it('returns NaN for invalid input', () => {
    expect(percentOf(Number.NaN, 10)).toBeNaN();
  });
});

describe('percentRatio', () => {
  it('computes part / whole × 100', () => {
    expect(percentRatio(30, 120)).toBe(25);
    expect(percentRatio(150, 100)).toBe(150);
    expect(percentRatio(1, 3)).toBeCloseTo(33.3333, 4);
  });

  it('returns NaN when the whole is zero', () => {
    expect(percentRatio(5, 0)).toBeNaN();
  });
});

describe('percentChange', () => {
  it('computes increase and decrease', () => {
    expect(percentChange(80, 100)).toBe(25);
    expect(percentChange(100, 80)).toBe(-20);
    expect(percentChange(50, 50)).toBe(0);
  });

  it('keeps the sign meaningful for a negative start', () => {
    expect(percentChange(-100, -50)).toBe(50);
    expect(percentChange(-100, -150)).toBe(-50);
  });

  it('returns NaN when starting from zero', () => {
    expect(percentChange(0, 10)).toBeNaN();
  });
});

describe('applyPercent', () => {
  it('increases and decreases', () => {
    expect(applyPercent(1000, 5, 'increase')).toBe(1050);
    expect(applyPercent(1000, 20, 'decrease')).toBe(800);
  });

  it('is not symmetric: +20% then -20% is below the start', () => {
    expect(applyPercent(applyPercent(100, 20, 'increase'), 20, 'decrease')).toBeCloseTo(96, 10);
  });

  it('allows decreases beyond 100%', () => {
    expect(applyPercent(100, 150, 'decrease')).toBe(-50);
  });
});

describe('clean', () => {
  it('removes floating-point noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(clean(percentOf(19.99, 7))).toBe(1.3993);
    expect(clean(-0)).toBe(0);
  });

  it('passes NaN through', () => {
    expect(clean(Number.NaN)).toBeNaN();
  });
});

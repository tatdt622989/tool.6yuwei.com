import { describe, expect, it } from 'vitest';
import { convertArea, convertAreaAll, displayDigits, PING_IN_SQM, splitPublicArea } from './logic';

describe('convertArea', () => {
  it('1 坪 = 3.305785 m²', () => {
    expect(PING_IN_SQM).toBeCloseTo(3.305785, 6);
    expect(convertArea(1, 'ping', 'sqm')).toBeCloseTo(3.305785, 6);
  });

  it('1 m² = 0.3025 坪', () => {
    expect(convertArea(1, 'sqm', 'ping')).toBeCloseTo(0.3025, 10);
  });

  it('30 坪 ≈ 99.17 m² ≈ 1067.5 ft²', () => {
    expect(convertArea(30, 'ping', 'sqm')).toBeCloseTo(99.1736, 4);
    expect(convertArea(30, 'ping', 'sqft')).toBeCloseTo(1067.5, 1);
  });

  it('1 甲 = 2934 坪 = 10 分 ≈ 0.9699 公頃', () => {
    expect(convertArea(1, 'jia', 'ping')).toBeCloseTo(2934, 8);
    expect(convertArea(1, 'jia', 'fen')).toBeCloseTo(10, 10);
    expect(convertArea(1, 'jia', 'hectare')).toBeCloseTo(0.969917, 6);
  });

  it('1 分 = 293.4 坪', () => {
    expect(convertArea(1, 'fen', 'ping')).toBeCloseTo(293.4, 8);
  });

  it('round-trips without drift', () => {
    expect(convertArea(convertArea(123.45, 'ping', 'sqft'), 'sqft', 'ping')).toBeCloseTo(123.45, 10);
  });

  it('handles zero, negatives and NaN', () => {
    expect(convertArea(0, 'ping', 'sqm')).toBe(0);
    expect(convertArea(-1, 'ping', 'sqm')).toBeCloseTo(-3.305785, 6);
    expect(convertArea(Number.NaN, 'ping', 'sqm')).toBeNaN();
  });
});

describe('convertAreaAll', () => {
  it('returns every unit, including the source unchanged', () => {
    const all = convertAreaAll(100, 'sqm');
    expect(all.sqm).toBe(100);
    expect(all.ping).toBeCloseTo(30.25, 10);
    expect(Object.keys(all)).toHaveLength(6);
  });
});

describe('displayDigits', () => {
  it('keeps about five significant digits', () => {
    expect(displayDigits(99.17)).toBe(3);
    expect(displayDigits(9917)).toBe(2);
    expect(displayDigits(0.0102)).toBe(6);
    expect(displayDigits(0.000001)).toBe(8);
    expect(displayDigits(0)).toBe(2);
  });
});

describe('splitPublicArea', () => {
  it('splits 權狀坪數 by 公設比', () => {
    const r = splitPublicArea(35, 33)!;
    expect(r.publicPing).toBeCloseTo(11.55, 10);
    expect(r.privatePing).toBeCloseTo(23.45, 10);
    expect(r.unitPrice).toBeNaN();
  });

  it('computes unit prices when a total price is given', () => {
    const r = splitPublicArea(40, 25, 2000)!;
    expect(r.unitPrice).toBe(50);
    expect(r.privateUnitPrice).toBeCloseTo(66.667, 3);
  });

  it('allows 0% and rejects invalid input', () => {
    expect(splitPublicArea(30, 0)!.privatePing).toBe(30);
    expect(splitPublicArea(0, 30)).toBeNull();
    expect(splitPublicArea(30, 100)).toBeNull();
    expect(splitPublicArea(30, -5)).toBeNull();
    expect(splitPublicArea(Number.NaN, 30)).toBeNull();
  });
});

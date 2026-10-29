import { describe, expect, it } from 'vitest';
import {
  TATAMI,
  TSUBO_M2,
  convertArea,
  maxAdvertisedTatami,
  perM2ToPerTsubo,
  perTsuboToPerM2,
  tatamiM2,
  toSquareMeters,
  unitPrices,
} from './logic';

describe('tsubo ⇄ ㎡', () => {
  it('uses 1 坪 = 400/121 ㎡ (6 尺四方, 1 尺 = 10/33 m)', () => {
    expect(TSUBO_M2).toBeCloseTo(3.305785, 6);
    expect(TSUBO_M2).toBeCloseTo((6 * (10 / 33)) ** 2, 12);
    expect(convertArea(1, 'm2', 'tsubo')).toBeCloseTo(0.3025, 12);
  });

  it('converts common sizes', () => {
    expect(convertArea(30, 'tsubo', 'm2')).toBeCloseTo(99.1736, 4);
    expect(convertArea(100, 'm2', 'tsubo')).toBeCloseTo(30.25, 10);
    expect(convertArea(121, 'tsubo', 'm2')).toBeCloseTo(400, 10);
    expect(convertArea(1, 'a', 'm2')).toBe(100);
    expect(convertArea(1, 'ha', 'tsubo')).toBeCloseTo(3025, 8);
  });

  it('round-trips', () => {
    for (const unit of ['m2', 'tsubo', 'tatami', 'a', 'ha'] as const) {
      expect(convertArea(convertArea(12.34, unit, 'm2', 'edoma'), 'm2', unit, 'edoma')).toBeCloseTo(12.34, 10);
    }
  });
});

describe('tatami', () => {
  it('has the usual tatami sizes', () => {
    expect(tatamiM2('kyoma')).toBeCloseTo(1.82405, 6);
    expect(tatamiM2('chukyoma')).toBeCloseTo(1.6562, 6);
    expect(tatamiM2('edoma')).toBeCloseTo(1.5488, 6);
    expect(tatamiM2('danchima')).toBeCloseTo(1.445, 6);
    expect(tatamiM2('koukoku')).toBe(1.62);
    expect(TATAMI).toHaveLength(5);
  });

  it('converts 6 畳 by type', () => {
    expect(toSquareMeters(6, 'tatami', 'koukoku')).toBeCloseTo(9.72, 10);
    expect(toSquareMeters(6, 'tatami', 'edoma')).toBeCloseTo(9.2928, 10);
    expect(toSquareMeters(6, 'tatami', 'kyoma')).toBeCloseTo(10.9443, 10);
    // 1 坪 ≒ 2 畳（江戸間なら 2 畳でほぼ 0.94 坪）
    expect(convertArea(2, 'tatami', 'tsubo', 'koukoku')).toBeCloseTo(0.98, 2);
  });

  it('caps advertised tatami at area / 1.62, rounded down to 0.1', () => {
    expect(maxAdvertisedTatami(9.72)).toBe(6);
    expect(maxAdvertisedTatami(9.71)).toBe(5.9);
    expect(maxAdvertisedTatami(10)).toBe(6.1);
    expect(maxAdvertisedTatami(0)).toBe(0);
    expect(maxAdvertisedTatami(Number.NaN)).toBe(0);
  });
});

describe('unit prices', () => {
  it('converts 坪単価 ⇄ ㎡単価', () => {
    expect(perTsuboToPerM2(1_000_000)).toBeCloseTo(302_500, 6);
    expect(perM2ToPerTsubo(302_500)).toBeCloseTo(1_000_000, 6);
    expect(perM2ToPerTsubo(100_000)).toBeCloseTo(330_578.51, 2);
  });

  it('derives unit prices from a total', () => {
    const r = unitPrices(30_000_000, 99.17)!;
    expect(r.perM2).toBeCloseTo(302_510.84, 1);
    expect(r.perTsubo).toBeCloseTo(1_000_035.82, 0);
    expect(unitPrices(0, 10)).toBeNull();
    expect(unitPrices(100, 0)).toBeNull();
  });
});

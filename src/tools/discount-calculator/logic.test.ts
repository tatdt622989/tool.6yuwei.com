import { describe, expect, it } from 'vitest';
import {
  applyPercentOff,
  applyThreshold,
  applyZhe,
  buyNGetM,
  factorToPercentOff,
  factorToZhe,
  secondItem,
  zheToFactor,
} from './logic';

describe('zheToFactor', () => {
  it.each([
    [8, 0.8],
    [85, 0.85],
    [8.5, 0.85],
    [75, 0.75],
    [9, 0.9],
    [95, 0.95],
    [88, 0.88],
    [5, 0.5],
  ])('%s 折 = %s', (zhe, factor) => {
    expect(zheToFactor(zhe)).toBeCloseTo(factor, 10);
  });

  it('rejects 0, negatives, 100 and NaN', () => {
    expect(zheToFactor(0)).toBeNaN();
    expect(zheToFactor(-8)).toBeNaN();
    expect(zheToFactor(100)).toBeNaN();
    expect(zheToFactor(Number.NaN)).toBeNaN();
  });
});

describe('factorToZhe', () => {
  it('formats common discounts', () => {
    expect(factorToZhe(0.8)).toBe('8 折');
    expect(factorToZhe(0.85)).toBe('85 折');
    expect(factorToZhe(0.72)).toBe('72 折');
    expect(factorToZhe(2 / 3)).toBe('66.7 折');
    expect(factorToZhe(0.5)).toBe('5 折');
  });

  it('handles no discount and invalid input', () => {
    expect(factorToZhe(1)).toBe('不打折');
    expect(factorToZhe(Number.NaN)).toBe('—');
    expect(factorToZhe(0)).toBe('—');
  });
});

describe('applyZhe', () => {
  it('applies 打 8 折 and 85 折', () => {
    expect(applyZhe(1000, 8)).toMatchObject({ final: 800, saved: 200 });
    expect(applyZhe(1000, 85).final).toBeCloseTo(850, 10);
  });

  it('multiplies stacked discounts (折上折)', () => {
    const r = applyZhe(1000, 8, 9);
    expect(r.final).toBeCloseTo(720, 10);
    expect(factorToZhe(r.factor)).toBe('72 折');
  });

  it('rejects invalid price or 折數', () => {
    expect(applyZhe(-1, 8).final).toBeNaN();
    expect(applyZhe(1000, 0).final).toBeNaN();
    expect(applyZhe(1000).final).toBeNaN();
  });

  it('keeps a zero price at zero', () => {
    expect(applyZhe(0, 8)).toMatchObject({ final: 0, saved: 0 });
  });
});

describe('applyPercentOff', () => {
  it('20% off equals 8 折', () => {
    const r = applyPercentOff(1280, 20);
    expect(r.final).toBe(1024);
    expect(r.saved).toBe(256);
    expect(factorToZhe(r.factor)).toBe('8 折');
  });

  it('rejects percentages outside 0–100', () => {
    expect(applyPercentOff(100, 120).final).toBeNaN();
    expect(applyPercentOff(100, -5).final).toBeNaN();
  });

  it('converts a factor back to % off', () => {
    expect(factorToPercentOff(0.85)).toBeCloseTo(15, 10);
  });
});

describe('applyThreshold (滿額折)', () => {
  it('repeats the discount for every threshold reached', () => {
    const r = applyThreshold(2350, 1000, 100, true);
    expect(r.times).toBe(2);
    expect(r.final).toBe(2150);
    expect(r.toNext).toBe(650);
  });

  it('applies once when not repeatable', () => {
    const r = applyThreshold(2350, 1000, 100, false);
    expect(r.times).toBe(1);
    expect(r.final).toBe(2250);
    expect(r.toNext).toBeNaN();
  });

  it('gives nothing below the threshold and reports the gap', () => {
    const r = applyThreshold(880, 1000, 100, false);
    expect(r.times).toBe(0);
    expect(r.saved).toBe(0);
    expect(r.toNext).toBe(120);
  });

  it('never goes below zero', () => {
    expect(applyThreshold(100, 100, 500, true).final).toBe(0);
  });

  it('rejects a zero threshold', () => {
    expect(applyThreshold(500, 0, 50, true).final).toBeNaN();
  });
});

describe('buyNGetM', () => {
  it('買 2 送 1 is about 66.7 折', () => {
    const r = buyNGetM(90, 2, 1);
    expect(r.items).toBe(3);
    expect(r.paid).toBe(180);
    expect(r.perItem).toBe(60);
    expect(factorToZhe(r.factor)).toBe('66.7 折');
  });

  it('買 1 送 1 is 5 折', () => {
    expect(factorToZhe(buyNGetM(50, 1, 1).factor)).toBe('5 折');
  });

  it('rejects non-integer or zero quantities', () => {
    expect(buyNGetM(50, 0, 1).paid).toBeNaN();
    expect(buyNGetM(50, 1.5, 1).paid).toBeNaN();
  });
});

describe('secondItem', () => {
  it('第二件 6 折 averages 8 折', () => {
    const r = secondItem(500, 6);
    expect(r.paid).toBe(800);
    expect(r.perItem).toBe(400);
    expect(factorToZhe(r.factor)).toBe('8 折');
  });

  it('第二件半價 (5 折) averages 75 折', () => {
    expect(factorToZhe(secondItem(100, 5).factor)).toBe('75 折');
  });
});

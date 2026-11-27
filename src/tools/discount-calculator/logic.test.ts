import { describe, expect, it } from 'vitest';
import {
  addTax,
  applyPercentOff,
  applyPercentsOff,
  applyThreshold,
  applyWariOff,
  applyZhe,
  buyNGetM,
  factorToPercentOff,
  factorToZhe,
  roundMoney,
  secondItem,
  secondItemPercentOff,
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

describe('percent-off markets (en, ja)', () => {
  it('stacks percent-off discounts by multiplying', () => {
    const r = applyPercentsOff(79.99, 30, 20);
    expect(r.final).toBeCloseTo(44.7944, 4);
    expect(factorToPercentOff(r.factor)).toBeCloseTo(44, 6);
    expect(applyPercentsOff(100, 25).final).toBe(75);
    expect(applyPercentsOff(100, 120).final).toBeNaN();
    expect(applyPercentsOff(100).final).toBeNaN();
  });

  it('converts 割引 to percent off', () => {
    expect(applyWariOff(3980, 3).final).toBeCloseTo(2786, 6);
    expect(applyWariOff(1000, 2.5).final).toBe(750);
    expect(applyWariOff(1000, 11).final).toBeNaN();
  });

  it('prices a second item at a percent off', () => {
    const half = secondItemPercentOff(40, 50);
    expect(half.paid).toBe(60);
    expect(half.perItem).toBe(30);
    expect(factorToPercentOff(half.factor)).toBe(25);
    expect(secondItemPercentOff(1980, 100).paid).toBe(1980);
    expect(secondItemPercentOff(1980, -1).paid).toBeNaN();
  });

  it('rounds money per currency', () => {
    expect(roundMoney(2786.0000000001, 'floor')).toBe(2786);
    expect(roundMoney(2785.9999999999, 'floor')).toBe(2786);
    expect(roundMoney(1782.9, 'floor')).toBe(1782);
    expect(roundMoney(55.993, 'cent')).toBe(55.99);
    expect(roundMoney(1.005, 'cent')).toBe(1.01);
    expect(roundMoney(12.345, 'none')).toBe(12.345);
  });

  it('adds sales tax or 消費税', () => {
    expect(addTax(55.99, 8.25, 'cent')).toBe(60.61);
    expect(addTax(2786, 10, 'floor')).toBe(3064);
    expect(addTax(2786, 8, 'floor')).toBe(3008);
    expect(addTax(100, 0)).toBe(100);
    expect(addTax(100, -1)).toBeNaN();
  });
});

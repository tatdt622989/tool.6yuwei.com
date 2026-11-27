import { describe, expect, it } from 'vitest';
import { calculateTip, formatUsd, tipTable, toCents, validateTip, type TipInput } from './logic';

const base: TipInput = { billCents: 8000, tipPercent: 20, people: 1, round: 'none' };

describe('toCents', () => {
  it('converts dollars to integer cents, rounding half up', () => {
    expect(toCents(12.34)).toBe(1234);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(1.005)).toBe(101);
    expect(toCents(19.999)).toBe(2000);
    expect(toCents(0)).toBe(0);
  });
  it('keeps NaN', () => {
    expect(toCents(Number.NaN)).toBeNaN();
    expect(toCents(Infinity)).toBeNaN();
  });
});

describe('calculateTip', () => {
  it('computes a plain 20% tip', () => {
    const r = calculateTip(base)!;
    expect(r.tipCents).toBe(1600);
    expect(r.totalCents).toBe(9600);
    expect(r.perPersonCents).toBe(9600);
    expect(r.effectivePercent).toBeCloseTo(20, 10);
    expect(r.roundingCents).toBe(0);
  });

  it('rounds the tip to the nearest cent, half up', () => {
    // 15% of $47.50 = $7.125 → $7.13
    expect(calculateTip({ ...base, billCents: 4750, tipPercent: 15 })!.tipCents).toBe(713);
    // 18% of $33.33 = $5.9994 → $6.00
    expect(calculateTip({ ...base, billCents: 3333, tipPercent: 18 })!.tipCents).toBe(600);
    // 22% of $64.17 = $14.1174 → $14.12
    expect(calculateTip({ ...base, billCents: 6417, tipPercent: 22 })!.tipCents).toBe(1412);
  });

  it('supports custom and zero tips', () => {
    expect(calculateTip({ ...base, tipPercent: 17.5 })!.tipCents).toBe(1400);
    const zero = calculateTip({ ...base, tipPercent: 0 })!;
    expect(zero.tipCents).toBe(0);
    expect(zero.totalCents).toBe(8000);
  });

  it('splits evenly between people', () => {
    const r = calculateTip({ ...base, billCents: 12000, tipPercent: 20, people: 4 })!;
    expect(r.totalCents).toBe(14400);
    expect(r.perPersonCents).toBe(3600);
    expect(r.tipPerPersonCents).toBe(600);
    expect(r.unevenCount).toBe(0);
  });

  it('reports uneven splits to the cent', () => {
    // $100.00 + 18% = $118.00 / 3 = 39.333… → one person pays $39.34, two pay $39.33
    const r = calculateTip({ ...base, billCents: 10000, tipPercent: 18, people: 3 })!;
    expect(r.totalCents).toBe(11800);
    expect(r.perPersonCents).toBe(3934);
    expect(r.unevenCount).toBe(1);
    expect(3934 * 1 + 3933 * 2).toBe(11800);
  });

  it('tips on the pre-tax amount', () => {
    // $108.25 bill incl. $8.25 tax: 20% of $100 = $20, total $128.25
    const r = calculateTip({ ...base, billCents: 10825, tipPercent: 20, taxCents: 825, tipOnPreTax: true })!;
    expect(r.baseCents).toBe(10000);
    expect(r.tipCents).toBe(2000);
    expect(r.totalCents).toBe(12825);
    expect(r.effectivePercent).toBeCloseTo(20, 10);
  });

  it('ignores tax when tipping on the full bill', () => {
    const r = calculateTip({ ...base, billCents: 10825, tipPercent: 20, taxCents: 825, tipOnPreTax: false })!;
    expect(r.baseCents).toBe(10825);
    expect(r.tipCents).toBe(2165);
  });

  it('rounds the total up to a whole dollar', () => {
    // $47.50 + 18% ($8.55) = $56.05 → $57.00, tip becomes $9.50
    const r = calculateTip({ ...base, billCents: 4750, tipPercent: 18, round: 'total' })!;
    expect(r.totalCents).toBe(5700);
    expect(r.tipCents).toBe(950);
    expect(r.roundingCents).toBe(95);
    expect(r.effectivePercent).toBeCloseTo(20, 1);
  });

  it('does not change a total that is already whole', () => {
    const r = calculateTip({ ...base, round: 'total' })!;
    expect(r.totalCents).toBe(9600);
    expect(r.roundingCents).toBe(0);
  });

  it('rounds each person up to a whole dollar', () => {
    // $87.40 + 20% = $104.88 / 3 = $34.96 → $35 each, total $105, tip $17.60
    const r = calculateTip({ ...base, billCents: 8740, tipPercent: 20, people: 3, round: 'perPerson' })!;
    expect(r.perPersonCents).toBe(3500);
    expect(r.totalCents).toBe(10500);
    expect(r.tipCents).toBe(1760);
    expect(r.unevenCount).toBe(0);
    expect(r.roundingCents).toBe(12);
  });

  it('per-person rounding with one person equals total rounding', () => {
    const a = calculateTip({ ...base, billCents: 4750, tipPercent: 18, round: 'perPerson' })!;
    const b = calculateTip({ ...base, billCents: 4750, tipPercent: 18, round: 'total' })!;
    expect(a.totalCents).toBe(b.totalCents);
  });

  it('total rounding can still leave an uneven split', () => {
    const r = calculateTip({ ...base, billCents: 4750, tipPercent: 18, people: 2, round: 'total' })!;
    expect(r.totalCents).toBe(5700);
    expect(r.perPersonCents).toBe(2850);
  });

  it('returns null for invalid input', () => {
    expect(calculateTip({ ...base, billCents: 0 })).toBeNull();
    expect(calculateTip({ ...base, billCents: Number.NaN })).toBeNull();
    expect(calculateTip({ ...base, tipPercent: -1 })).toBeNull();
    expect(calculateTip({ ...base, people: 0 })).toBeNull();
    expect(calculateTip({ ...base, people: 2.5 })).toBeNull();
    expect(calculateTip({ ...base, taxCents: 8000, tipOnPreTax: true })).toBeNull();
  });
});

describe('validateTip', () => {
  it('names the field that is wrong', () => {
    expect(validateTip(base)).toBeNull();
    expect(validateTip({ ...base, billCents: -5 })).toBe('bill');
    expect(validateTip({ ...base, billCents: 200_000_000 })).toBe('bill');
    expect(validateTip({ ...base, tipPercent: 101 })).toBe('tip');
    expect(validateTip({ ...base, people: 101 })).toBe('people');
    expect(validateTip({ ...base, taxCents: -1, tipOnPreTax: true })).toBe('tax');
    expect(validateTip({ ...base, taxCents: -1, tipOnPreTax: false })).toBeNull();
  });
});

describe('tipTable', () => {
  it('lists the presets for the same bill', () => {
    const rows = tipTable({ billCents: 5000, people: 2 });
    expect(rows.map((r) => r.percent)).toEqual([15, 18, 20, 22, 25]);
    expect(rows[0]).toEqual({ percent: 15, tipCents: 750, totalCents: 5750, perPersonCents: 2875 });
    expect(rows[4]).toEqual({ percent: 25, tipCents: 1250, totalCents: 6250, perPersonCents: 3125 });
  });
  it('is empty for an invalid bill', () => {
    expect(tipTable({ billCents: 0, people: 1 })).toEqual([]);
  });
});

describe('formatUsd', () => {
  it('formats cents as dollars', () => {
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(5)).toBe('$0.05');
    expect(formatUsd(123456789)).toBe('$1,234,567.89');
    expect(formatUsd(-250)).toBe('-$2.50');
    expect(formatUsd(Number.NaN)).toBe('—');
  });
});

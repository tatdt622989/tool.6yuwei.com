import { describe, expect, it } from 'vitest';
import { calculateCompound, effectiveAnnualRate, exactDoublingYears, monthlyRate, ruleOf72 } from './logic';

const base = { principal: 100000, monthly: 0, ratePct: 5, years: 10, frequency: 1 as const };

describe('calculateCompound', () => {
  it('matches P(1 + r)^t for annual compounding', () => {
    const r = calculateCompound(base)!;
    expect(r.finalValue).toBeCloseTo(162889.46, 2);
    expect(r.totalContributed).toBe(100000);
    expect(r.totalInterest).toBeCloseTo(62889.46, 2);
    expect(r.rows).toHaveLength(10);
    expect(r.rows[0].balance).toBeCloseTo(105000, 6);
  });

  it('matches P(1 + r/n)^(nt) for monthly and daily compounding', () => {
    expect(calculateCompound({ ...base, frequency: 12 })!.finalValue).toBeCloseTo(164700.95, 2);
    expect(calculateCompound({ ...base, frequency: 365 })!.finalValue).toBeCloseTo(164866.48, 1);
    expect(calculateCompound({ ...base, frequency: 4 })!.finalValue).toBeCloseTo(164361.95, 2);
  });

  it('handles end-of-month contributions (ordinary annuity)', () => {
    const r = calculateCompound({ principal: 0, monthly: 1000, ratePct: 6, years: 10, frequency: 12 })!;
    // 1000 × ((1.005^120 − 1) / 0.005)
    expect(r.finalValue).toBeCloseTo(163879.35, 2);
    expect(r.totalContributed).toBe(120000);
  });

  it('with 0% interest the final value equals what was put in', () => {
    const r = calculateCompound({ principal: 50000, monthly: 2000, ratePct: 0, years: 3, frequency: 12 })!;
    expect(r.finalValue).toBe(122000);
    expect(r.totalInterest).toBe(0);
    expect(r.rows[1].contributed).toBe(98000);
  });

  it('yearly rows are cumulative and consistent', () => {
    const r = calculateCompound({ principal: 10000, monthly: 500, ratePct: 4, years: 5, frequency: 12 })!;
    const last = r.rows.at(-1)!;
    expect(last.balance).toBeCloseTo(r.finalValue, 8);
    expect(last.totalInterest).toBeCloseTo(r.totalInterest, 8);
    const summed = r.rows.reduce((a, row) => a + row.interest, 0);
    expect(summed).toBeCloseTo(r.totalInterest, 6);
  });

  it('rejects invalid input', () => {
    expect(calculateCompound({ ...base, principal: -1 })).toBeNull();
    expect(calculateCompound({ ...base, ratePct: -2 })).toBeNull();
    expect(calculateCompound({ ...base, ratePct: 150 })).toBeNull();
    expect(calculateCompound({ ...base, years: 0 })).toBeNull();
    expect(calculateCompound({ ...base, years: 2.5 })).toBeNull();
    expect(calculateCompound({ ...base, years: 101 })).toBeNull();
    expect(calculateCompound({ ...base, principal: Number.NaN })).toBeNull();
    expect(calculateCompound({ ...base, principal: 0, monthly: 0 })).toBeNull();
    expect(calculateCompound({ ...base, frequency: 3 as never })).toBeNull();
  });
});

describe('rates', () => {
  it('monthly rate is zero at 0% and equals r/12 for monthly compounding', () => {
    expect(monthlyRate(0, 12)).toBe(0);
    expect(monthlyRate(6, 12)).toBeCloseTo(0.005, 12);
  });

  it('effective annual rate grows with frequency', () => {
    expect(effectiveAnnualRate(5, 1)).toBeCloseTo(5, 10);
    expect(effectiveAnnualRate(5, 12)).toBeCloseTo(5.116, 3);
    expect(effectiveAnnualRate(5, 365)).toBeGreaterThan(effectiveAnnualRate(5, 12));
  });
});

describe('doubling time', () => {
  it('rule of 72 approximates the exact answer', () => {
    expect(ruleOf72(6)).toBe(12);
    expect(exactDoublingYears(6)).toBeCloseTo(11.896, 3);
    expect(ruleOf72(0)).toBe(Number.POSITIVE_INFINITY);
    expect(exactDoublingYears(0)).toBe(Number.POSITIVE_INFINITY);
  });
});

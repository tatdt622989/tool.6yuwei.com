import { describe, expect, it } from 'vitest';
import { annuityPayment, buildSchedule, summarizeByYear, validateLoan, wanToYuan, type LoanInput } from './logic';

const base: LoanInput = { principal: 1_000_000, annualRate: 6, years: 30, graceYears: 0, method: 'annuity' };

describe('annuityPayment', () => {
  it('matches the textbook value (1,000,000 at 6% for 30 years)', () => {
    expect(annuityPayment(1_000_000, 0.06 / 12, 360)).toBeCloseTo(5995.51, 2);
  });

  it('splits evenly at 0%', () => {
    expect(annuityPayment(120_000, 0, 12)).toBe(10_000);
  });
});

describe('buildSchedule — 本息平均攤還', () => {
  const result = buildSchedule(base)!;

  it('has a constant payment and fully repays the loan', () => {
    expect(result.months).toHaveLength(360);
    expect(result.firstPayment).toBeCloseTo(5995.51, 2);
    expect(result.lastPayment).toBeCloseTo(5995.51, 2);
    expect(result.months.at(-1)!.balance).toBe(0);
  });

  it('principal repaid sums to the loan amount', () => {
    const repaid = result.months.reduce((s, m) => s + m.principal, 0);
    expect(repaid).toBeCloseTo(1_000_000, 4);
  });

  it('total paid = principal + interest', () => {
    expect(result.totalPaid).toBeCloseTo(annuityPayment(1_000_000, 0.005, 360) * 360, 4);
    expect(result.totalInterest).toBeCloseTo(result.totalPaid - 1_000_000, 6);
  });
});

describe('buildSchedule — 本金平均攤還', () => {
  const result = buildSchedule({ ...base, principal: 1_200_000, annualRate: 2.4, years: 10, method: 'principal' })!;

  it('repays equal principal and the payment decreases', () => {
    expect(result.months[0].principal).toBe(10_000);
    expect(result.firstPayment).toBeCloseTo(10_000 + 1_200_000 * 0.002, 6);
    expect(result.lastPayment).toBeCloseTo(10_000 + 10_000 * 0.002, 6);
    expect(result.months[1].payment).toBeLessThan(result.months[0].payment);
  });

  it('total interest follows the arithmetic series', () => {
    // Σ interest = r × 10,000 × (120 + 119 + … + 1)
    expect(result.totalInterest).toBeCloseTo(0.002 * 10_000 * ((120 * 121) / 2), 4);
  });

  it('pays less interest than 本息平均攤還 for the same loan', () => {
    const annuity = buildSchedule({ ...base, principal: 1_200_000, annualRate: 2.4, years: 10 })!;
    expect(result.totalInterest).toBeLessThan(annuity.totalInterest);
  });
});

describe('grace period (寬限期)', () => {
  const result = buildSchedule({ ...base, years: 30, graceYears: 3 })!;

  it('charges interest only during the grace period', () => {
    expect(result.firstPayment).toBeCloseTo(5000, 6);
    expect(result.months[35].principal).toBe(0);
    expect(result.months[35].balance).toBe(1_000_000);
  });

  it('amortizes over the remaining term afterwards', () => {
    expect(result.firstAmortizingPayment).toBeCloseTo(annuityPayment(1_000_000, 0.005, 324), 6);
    expect(result.months.at(-1)!.balance).toBe(0);
  });

  it('costs more total interest than no grace period', () => {
    expect(result.totalInterest).toBeGreaterThan(buildSchedule(base)!.totalInterest);
  });
});

describe('zero interest', () => {
  it('has no interest and equal payments', () => {
    const result = buildSchedule({ ...base, principal: 360_000, annualRate: 0, years: 1 })!;
    expect(result.totalInterest).toBe(0);
    expect(result.firstPayment).toBe(30_000);
    expect(result.lastPayment).toBeCloseTo(30_000, 6);
  });
});

describe('validateLoan', () => {
  it('accepts a normal loan', () => {
    expect(validateLoan(base)).toBeNull();
  });

  it.each([
    [{ principal: 0 }],
    [{ principal: -1 }],
    [{ annualRate: -1 }],
    [{ years: 0 }],
    [{ years: 20.5 }],
    [{ years: 41 }],
    [{ graceYears: 30 }],
    [{ graceYears: -1 }],
    [{ annualRate: Number.NaN }],
  ])('rejects %o', (patch) => {
    expect(validateLoan({ ...base, ...patch })).not.toBeNull();
    expect(buildSchedule({ ...base, ...patch })).toBeNull();
  });
});

describe('summarizeByYear', () => {
  it('groups 12 months per year and keeps the year-end balance', () => {
    const result = buildSchedule({ ...base, years: 2 })!;
    const years = summarizeByYear(result.months);
    expect(years).toHaveLength(2);
    expect(years[0].payment).toBeCloseTo(result.months.slice(0, 12).reduce((s, m) => s + m.payment, 0), 6);
    expect(years[0].balance).toBe(result.months[11].balance);
    expect(years[1].balance).toBe(0);
  });
});

describe('wanToYuan', () => {
  it('converts 萬元 to 元', () => {
    expect(wanToYuan(1000)).toBe(10_000_000);
    expect(wanToYuan(0.5)).toBe(5000);
  });
});

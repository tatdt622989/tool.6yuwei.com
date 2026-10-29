import { describe, expect, it } from 'vitest';
import { annuityPayment, calculateLoan, LOAN_PROBLEM_ZH, loanProblem, monthlyIrr, rateForMonth, validateLoan, type LoanInput } from './logic';

const base: LoanInput = { principal: 1_000_000, months: 84, stages: [{ ratePct: 3, months: 0 }], fees: 0 };

describe('annuityPayment', () => {
  it('textbook value', () => {
    expect(annuityPayment(1_000_000, 0.03 / 12, 84)).toBeCloseTo(13_213.30, 1);
  });
});

describe('rateForMonth', () => {
  const stages = [
    { ratePct: 1.88, months: 3 },
    { ratePct: 4.5, months: 0 },
  ];
  it('switches after the first stage', () => {
    expect(rateForMonth(stages, 1)).toBe(1.88);
    expect(rateForMonth(stages, 3)).toBe(1.88);
    expect(rateForMonth(stages, 4)).toBe(4.5);
    expect(rateForMonth(stages, 84)).toBe(4.5);
  });
});

describe('monthlyIrr', () => {
  it('recovers the loan rate when there are no fees', () => {
    const pay = annuityPayment(100_000, 0.01, 12);
    expect(monthlyIrr(100_000, Array(12).fill(pay))).toBeCloseTo(0.01, 9);
  });
});

describe('calculateLoan', () => {
  it('single rate: APR equals the rate without fees', () => {
    const r = calculateLoan(base)!;
    expect(r.firstPayment).toBeCloseTo(13_213.30, 1);
    expect(r.rows.at(-1)!.balance).toBe(0);
    expect(r.aprPct).toBeCloseTo(3, 6);
    expect(r.totalInterest).toBeCloseTo(13_213.30 * 84 - 1_000_000, 0);
  });
  it('fees raise the APR', () => {
    const r = calculateLoan({ ...base, fees: 5000 })!;
    expect(r.aprPct).toBeGreaterThan(3.1);
    expect(r.aprPct).toBeLessThan(3.2);
    expect(r.totalCost).toBeCloseTo(r.totalInterest + 5000, 6);
  });
  it('two-stage rate recalculates the payment', () => {
    const r = calculateLoan({ ...base, stages: [{ ratePct: 1.88, months: 3 }, { ratePct: 4.5, months: 0 }] })!;
    expect(r.stagePayments).toHaveLength(2);
    expect(r.stagePayments[0]).toMatchObject({ fromMonth: 1, toMonth: 3, ratePct: 1.88 });
    expect(r.stagePayments[1]).toMatchObject({ fromMonth: 4, toMonth: 84, ratePct: 4.5 });
    expect(r.stagePayments[1].payment).toBeGreaterThan(r.stagePayments[0].payment);
    expect(r.rows.at(-1)!.balance).toBe(0);
    const repaid = r.rows.reduce((s, x) => s + x.principal, 0);
    expect(repaid).toBeCloseTo(1_000_000, 4);
    expect(r.aprPct).toBeGreaterThan(1.88);
    expect(r.aprPct).toBeLessThan(4.5);
  });
  it('zero interest', () => {
    const r = calculateLoan({ ...base, months: 10, stages: [{ ratePct: 0, months: 0 }] })!;
    expect(r.firstPayment).toBe(100_000);
    expect(r.totalInterest).toBe(0);
    expect(r.aprPct).toBeCloseTo(0, 6);
  });
});

describe('validateLoan', () => {
  it.each([[{ principal: 0 }], [{ months: 0 }], [{ months: 12.5 }], [{ fees: -1 }], [{ fees: 1_000_000 }], [{ stages: [{ ratePct: -1, months: 0 }] }], [{ stages: [] }]])(
    'rejects %o',
    (patch) => {
      expect(validateLoan({ ...base, ...patch })).not.toBeNull();
      expect(calculateLoan({ ...base, ...patch })).toBeNull();
    },
  );
});

describe('loanProblem', () => {
  it('returns codes that map to the zh-TW messages', () => {
    expect(loanProblem(base)).toBeNull();
    expect(loanProblem({ ...base, principal: 0 })).toBe('amount');
    expect(loanProblem({ ...base, months: 481 })).toBe('months');
    expect(loanProblem({ ...base, stages: [] })).toBe('noRate');
    expect(loanProblem({ ...base, stages: [{ ratePct: 31, months: 0 }] })).toBe('rate');
    expect(loanProblem({ ...base, stages: [{ ratePct: 3, months: 1.5 }] })).toBe('stageMonths');
    expect(loanProblem({ ...base, fees: -1 })).toBe('feesNegative');
    expect(loanProblem({ ...base, fees: base.principal })).toBe('feesTooHigh');
    expect(loanProblem({ ...base, fees: Number.NaN })).toBe('incomplete');
    expect(validateLoan({ ...base, principal: 0 })).toBe(LOAN_PROBLEM_ZH.amount);
  });
});

describe('US personal loan with an origination fee (en)', () => {
  it('$15,000 at 12% for 60 months with a $450 fee', () => {
    const r = calculateLoan({ principal: 15_000, months: 60, stages: [{ ratePct: 12, months: 0 }], fees: 450 })!;
    expect(r.firstPayment).toBeCloseTo(333.67, 2);
    expect(r.totalInterest).toBeCloseTo(5020, -1);
    expect(r.aprPct).toBeCloseTo(13.35, 2);
  });
});

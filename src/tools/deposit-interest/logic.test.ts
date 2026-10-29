import { describe, expect, it } from 'vitest';
import { calculateDeposit, supplementaryPremium, validateDeposit, withholdingTax, type DepositInput } from './logic';

const base: DepositInput = { mode: 'lump', amount: 1_000_000, ratePct: 1.7, months: 12, compound: true };
const calc = (patch: Partial<DepositInput>) => calculateDeposit({ ...base, ...patch })!;

describe('整存整付', () => {
  it('compounds monthly', () => {
    const r = calc({});
    expect(r.maturity).toBeCloseTo(1_000_000 * (1 + 0.017 / 12) ** 12, 6);
    expect(r.totalInterest).toBeCloseTo(17_133.09, 1);
    expect(r.payments).toBe(1);
  });
  it('simple interest = P × r × n / 12', () => {
    const r = calc({ compound: false });
    expect(r.totalInterest).toBeCloseTo(17_000, 6);
    expect(r.rows.at(-1)!.balance).toBeCloseTo(1_017_000, 6);
  });
});

describe('存本取息', () => {
  it('pays simple monthly interest and returns the principal', () => {
    const r = calc({ mode: 'income', months: 24 });
    expect(r.singlePayment).toBeCloseTo(1_000_000 * 0.017 / 12, 8);
    expect(r.totalInterest).toBeCloseTo(34_000, 6);
    expect(r.maturity).toBeCloseTo(1_034_000, 6);
    expect(r.payments).toBe(24);
    expect(r.supplementary).toBe(0);
  });
});

describe('零存整付', () => {
  it('deposits at the start of each month and compounds', () => {
    const r = calc({ mode: 'recurring', amount: 10_000, months: 12 });
    const i = 0.017 / 12;
    const fv = 10_000 * (1 + i) * (((1 + i) ** 12 - 1) / i);
    expect(r.totalDeposited).toBe(120_000);
    expect(r.maturity).toBeCloseTo(fv, 6);
  });
  it('simple interest sums n(n+1)/2 deposit-months', () => {
    const r = calc({ mode: 'recurring', amount: 10_000, months: 12, compound: false });
    expect(r.totalInterest).toBeCloseTo(10_000 * (0.017 / 12) * 78, 8);
  });
});

describe('二代健保補充保費 與 扣繳', () => {
  it('applies 2.11% when a single payment reaches 20,000', () => {
    expect(supplementaryPremium(19_999)).toBe(0);
    expect(supplementaryPremium(20_000)).toBe(422);
    expect(supplementaryPremium(50_000_000)).toBe(211_000);
  });
  it('withholds 10% above 20,000', () => {
    expect(withholdingTax(20_000)).toBe(0);
    expect(withholdingTax(20_001)).toBe(2000);
  });
  it('lump-sum interest over the threshold is charged once at maturity', () => {
    const r = calc({ amount: 2_000_000, months: 12 });
    expect(r.singlePayment).toBeGreaterThan(20_000);
    expect(r.supplementary).toBe(supplementaryPremium(r.singlePayment));
  });
  it('monthly interest under the threshold avoids the premium', () => {
    expect(calc({ mode: 'income', amount: 2_000_000 }).supplementary).toBe(0);
  });
});

describe('validateDeposit', () => {
  it.each([[{ amount: 0 }], [{ ratePct: -1 }], [{ months: 0 }], [{ months: 1.5 }], [{ ratePct: Number.NaN }]])('rejects %o', (patch) => {
    expect(validateDeposit({ ...base, ...patch })).not.toBeNull();
    expect(calculateDeposit({ ...base, ...patch })).toBeNull();
  });
});

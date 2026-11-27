import { describe, expect, it } from 'vitest';
import {
  calculateDeposit,
  calculateJpTimeDeposit,
  depositProblem,
  effectiveApyPct,
  jpInterestTax,
  monthlyRate,
  supplementaryPremium,
  validateDeposit,
  withholdingTax,
  type DepositInput,
} from './logic';

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

describe('depositProblem', () => {
  it('returns locale-neutral codes', () => {
    expect(depositProblem(base)).toBeNull();
    expect(depositProblem({ ...base, amount: Number.NaN })).toBe('incomplete');
    expect(depositProblem({ ...base, amount: 0 })).toBe('amount');
    expect(depositProblem({ ...base, amount: 1e12 })).toBe('tooLarge');
    expect(depositProblem({ ...base, ratePct: 21 })).toBe('rate');
    expect(depositProblem({ ...base, months: 0 })).toBe('months');
    expect(depositProblem({ ...base, initial: -1 })).toBe('initial');
  });
  it('keeps the zh messages', () => {
    expect(validateDeposit({ ...base, months: 0 })).toBe('存款期間請輸入 1 到 600 個月。');
  });
});

describe('US savings / CD (en)', () => {
  it('APY: 12 months grow by exactly the APY ($10,000 at 4.50% APY → $450)', () => {
    const r = calc({ amount: 10_000, ratePct: 4.5, rateKind: 'apy' });
    expect(r.totalInterest).toBeCloseTo(450, 8);
    expect(r.maturity).toBeCloseTo(10_450, 8);
  });
  it('APR compounded daily matches (1 + r/365)^365 after a year', () => {
    const r = calc({ amount: 10_000, ratePct: 4.5, rateKind: 'apr', periodsPerYear: 365 });
    expect(r.maturity).toBeCloseTo(10_000 * (1 + 0.045 / 365) ** 365, 6);
    expect(effectiveApyPct(monthlyRate(4.5, 'apr', 365))).toBeCloseTo(4.6025, 3);
  });
  it('APR compounded monthly keeps the zh formula exactly', () => {
    expect(monthlyRate(1.7)).toBe(1.7 / 100 / 12);
    expect(monthlyRate(1.7, 'apr', 12)).toBe(1.7 / 100 / 12);
  });
  it('APR compounded quarterly / annually', () => {
    expect(calc({ amount: 1000, ratePct: 4, periodsPerYear: 4, months: 12 }).maturity).toBeCloseTo(1000 * 1.01 ** 4, 8);
    expect(calc({ amount: 1000, ratePct: 4, periodsPerYear: 1, months: 24 }).maturity).toBeCloseTo(1000 * 1.04 ** 2, 8);
  });
  it('recurring deposits on top of a starting balance', () => {
    const i = monthlyRate(4.5, 'apy');
    const r = calc({ mode: 'recurring', amount: 200, initial: 1000, ratePct: 4.5, rateKind: 'apy', months: 12 });
    const fv = 1000 * (1 + i) ** 12 + 200 * (1 + i) * (((1 + i) ** 12 - 1) / i);
    expect(r.totalDeposited).toBe(3400);
    expect(r.maturity).toBeCloseTo(fv, 6);
  });
});

describe('定期預金 (ja)', () => {
  it('源泉分離課税 20.315%: national and local tax truncated separately', () => {
    expect(jpInterestTax(4000)).toEqual({ national: 612, local: 200, total: 812 });
    expect(jpInterestTax(1000)).toEqual({ national: 153, local: 50, total: 203 });
    expect(jpInterestTax(19)).toEqual({ national: 2, local: 0, total: 2 });
  });
  it('単利型: 100 万円・年 0.4%・1 年 → 税引前 4,000 円、税引後 3,188 円', () => {
    const r = calculateJpTimeDeposit({ principal: 1_000_000, ratePct: 0.4, months: 12, type: 'simple' })!;
    expect(r.gross).toBe(4000);
    expect(r.net).toBe(3188);
    expect(r.maturity).toBe(1_003_188);
    expect(r.netYieldPct).toBeCloseTo(0.3188, 6);
  });
  it('単利型 truncates to the yen (6 months)', () => {
    expect(calculateJpTimeDeposit({ principal: 1_234_567, ratePct: 0.3, months: 6, type: 'simple' })!.gross).toBe(1851);
  });
  it('半年複利型 compounds every 6 months with truncation', () => {
    const r = calculateJpTimeDeposit({ principal: 1_000_000, ratePct: 0.5, months: 36, type: 'semiannual' })!;
    let b = 1_000_000;
    for (let k = 0; k < 6; k++) b += Math.floor(b * 0.0025);
    expect(r.gross).toBe(b - 1_000_000);
    expect(r.gross).toBe(15_092);
    const simple = calculateJpTimeDeposit({ principal: 1_000_000, ratePct: 0.5, months: 36, type: 'simple' })!;
    expect(simple.gross).toBe(15_000);
  });
  it('rejects invalid input', () => {
    expect(calculateJpTimeDeposit({ principal: 0, ratePct: 0.4, months: 12, type: 'simple' })).toBeNull();
  });
});

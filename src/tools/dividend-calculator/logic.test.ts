import { describe, expect, it } from 'vitest';
import {
  CREDIT_CAP_INCOME,
  calculateDividend,
  compareDividendTax,
  exDividendReferencePrice,
  nhiPremium,
  validateDividend,
  type DividendInput,
} from './logic';

const base: DividendInput = {
  shares: 5000,
  cashPerShare: 5,
  stockPerShare: 0,
  price: 1000,
  parValue: 10,
  frequency: 4,
  bracketPct: 12,
  remittanceFee: 10,
  otherAnnualDividend: 0,
};

describe('nhiPremium', () => {
  it('is zero below 20,000', () => {
    expect(nhiPremium(19_999)).toBe(0);
    expect(nhiPremium(0)).toBe(0);
  });
  it('applies 2.11% from exactly 20,000', () => {
    expect(nhiPremium(20_000)).toBe(422);
  });
  it('rounds half up like the NHI example (35,000 → 739)', () => {
    expect(nhiPremium(35_000)).toBe(739);
    expect(nhiPremium(25_000)).toBe(528); // 527.5
  });
  it('caps the base at 10 million per payment', () => {
    expect(nhiPremium(10_000_000)).toBe(211_000);
    expect(nhiPremium(25_000_000)).toBe(211_000);
  });
  it('ignores NaN', () => {
    expect(nhiPremium(Number.NaN)).toBe(0);
  });
});

describe('exDividendReferencePrice', () => {
  it('cash only: price minus dividend', () => {
    expect(exDividendReferencePrice(1000, 5, 0)).toBe(995);
  });
  it('stock only: divides by 1 + 配股率', () => {
    expect(exDividendReferencePrice(60, 0, 2)).toBeCloseTo(50, 10);
  });
  it('玉山金 2022 example: (29.35 − 0.67) ÷ 1.0674 ≈ 26.87', () => {
    expect(exDividendReferencePrice(29.35, 0.67, 0.674)).toBeCloseTo(26.869, 3);
  });
  it('respects a non-10 par value', () => {
    expect(exDividendReferencePrice(50, 0, 1, 5)).toBeCloseTo(50 / 1.2, 10);
  });
});

describe('compareDividendTax', () => {
  it('5% bracket: credit exceeds tax, so combined gives a refund', () => {
    const t = compareDividendTax(500_000, 5);
    expect(t.credit).toBe(42_500);
    expect(t.combinedTax).toBe(-17_500);
    expect(t.separateTax).toBe(140_000);
    expect(t.better).toBe('combined');
    expect(t.saving).toBe(157_500);
  });
  it('credit is capped at 80,000', () => {
    expect(compareDividendTax(2_000_000, 20).credit).toBe(80_000);
    expect(CREDIT_CAP_INCOME).toBeCloseTo(941_176.47, 1);
  });
  it('30% bracket: combined wins below 4,000,000, ties at it, loses above', () => {
    expect(compareDividendTax(3_000_000, 30).better).toBe('combined');
    expect(compareDividendTax(3_000_000, 30).saving).toBe(20_000);
    expect(compareDividendTax(4_000_000, 30).better).toBe('equal');
    expect(compareDividendTax(5_000_000, 30).better).toBe('separate');
  });
  it('40% bracket: separate always wins', () => {
    for (const d of [10_000, 100_000, 941_176, 2_000_000, 20_000_000]) {
      expect(compareDividendTax(d, 40).better).toBe('separate');
    }
    const t = compareDividendTax(100_000, 40);
    expect(t.combinedTax).toBe(31_500);
    expect(t.separateTax).toBe(28_000);
  });
  it('20% bracket: combined always wins', () => {
    for (const d of [10_000, 941_176, 5_000_000, 50_000_000]) {
      expect(compareDividendTax(d, 20).better).toBe('combined');
    }
  });
  it('zero or negative income is all zero', () => {
    const t = compareDividendTax(-5, 12);
    expect(t.dividendIncome).toBe(0);
    expect(t.combinedTax).toBe(0);
    expect(t.separateTax).toBe(0);
    expect(t.better).toBe('equal');
  });
});

describe('calculateDividend', () => {
  it('worked example: 5 張、每股配 5 元、季配、股價 1,000', () => {
    const r = calculateDividend(base);
    expect(r.cashAmount).toBe(25_000);
    expect(r.nhiPremium).toBe(528);
    expect(r.netCash).toBe(24_462);
    expect(r.referencePrice).toBe(995);
    expect(r.cashYieldPct).toBeCloseTo(0.5, 10);
    expect(r.annualCashYieldPct).toBeCloseTo(2, 10);
    expect(r.annualCash).toBe(100_000);
    expect(r.annualNhi).toBe(2_112);
    expect(r.annualNetCash).toBe(97_848);
    expect(r.fillRisePct).toBeCloseTo((1000 / 995 - 1) * 100, 10);
    expect(r.tax.dividendIncome).toBe(100_000);
    expect(r.tax.better).toBe('combined');
  });

  it('below the NHI threshold no premium is withheld', () => {
    const r = calculateDividend({ ...base, shares: 3000, cashPerShare: 6, price: 120, frequency: 1 });
    expect(r.cashAmount).toBe(18_000);
    expect(r.nhiPremium).toBe(0);
    expect(r.netCash).toBe(17_990);
  });

  it('floors the cash dividend to the dollar and survives float error', () => {
    expect(calculateDividend({ ...base, shares: 1000, cashPerShare: 0.29 }).cashAmount).toBe(290);
    expect(calculateDividend({ ...base, shares: 333, cashPerShare: 1.234 }).cashAmount).toBe(410); // 410.922
  });

  it('cash + stock dividend (玉山金 2022)', () => {
    const r = calculateDividend({ ...base, shares: 1000, cashPerShare: 0.67, stockPerShare: 0.674, price: 29.35, frequency: 1 });
    expect(r.cashAmount).toBe(670);
    expect(r.newShares).toBe(67); // 67.4 股
    expect(r.fractionCash).toBe(4); // 0.4 股 × 面額 10
    expect(r.stockDividendValue).toBe(674);
    expect(r.dividendIncome).toBe(1_344);
    expect(r.sharesAfter).toBe(1_067);
    expect(r.netCash).toBe(670 + 4 - 10);
  });

  it('stock dividend counts toward the NHI threshold at par value', () => {
    // 現金 15,000 + 股票股利 10,000（面額）= 25,000 ≥ 20,000
    const r = calculateDividend({ ...base, shares: 10_000, cashPerShare: 1.5, stockPerShare: 1, price: 40, frequency: 1 });
    expect(r.dividendIncome).toBe(25_000);
    expect(r.nhiPremium).toBe(528);
    expect(r.newShares).toBe(1_000);
  });

  it('stock-only payout: premium billed separately, no cash, no remittance fee', () => {
    const r = calculateDividend({ ...base, shares: 100_000, cashPerShare: 0, stockPerShare: 1, price: 30, frequency: 1 });
    expect(r.cashAmount).toBe(0);
    expect(r.nhiPremium).toBe(2_110);
    expect(r.nhiBilledSeparately).toBe(true);
    expect(r.netCash).toBe(0);
    expect(r.referencePrice).toBeCloseTo(30 / 1.1, 10);
  });

  it('monthly ETF annualises yield and income', () => {
    const r = calculateDividend({ ...base, shares: 10_000, cashPerShare: 0.1, price: 20, frequency: 12 });
    expect(r.cashYieldPct).toBeCloseTo(0.5, 10);
    expect(r.annualCashYieldPct).toBeCloseTo(6, 10);
    expect(r.cashAmount).toBe(1_000);
    expect(r.annualCash).toBe(12_000);
    expect(r.nhiPremium).toBe(0);
    expect(r.annualNetCash).toBe(12 * 990);
  });

  it('adds other household dividends to the tax comparison', () => {
    const r = calculateDividend({ ...base, otherAnnualDividend: 900_000, bracketPct: 30 });
    expect(r.tax.dividendIncome).toBe(1_000_000);
    expect(r.tax.credit).toBe(80_000);
    expect(r.tax.combinedTax).toBe(220_000);
    expect(r.tax.separateTax).toBe(280_000);
  });

  it('annual total yield includes stock dividend', () => {
    const r = calculateDividend({ ...base, cashPerShare: 2, stockPerShare: 1, price: 50, frequency: 1 });
    expect(r.annualTotalYieldPct).toBeCloseTo(6, 10);
  });
});

describe('validateDividend', () => {
  it('accepts valid input', () => {
    expect(validateDividend(base)).toBeNull();
  });
  it('rejects bad input', () => {
    expect(validateDividend({ ...base, shares: 0 })).toMatch(/股數/);
    expect(validateDividend({ ...base, shares: 10.5 })).toMatch(/整數/);
    expect(validateDividend({ ...base, cashPerShare: -1 })).toMatch(/現金股利/);
    expect(validateDividend({ ...base, stockPerShare: -1 })).toMatch(/股票股利/);
    expect(validateDividend({ ...base, cashPerShare: 0, stockPerShare: 0 })).toMatch(/請輸入/);
    expect(validateDividend({ ...base, price: 0 })).toMatch(/股價/);
    expect(validateDividend({ ...base, cashPerShare: 1000 })).toMatch(/大於或等於/);
    expect(validateDividend({ ...base, parValue: 0 })).toMatch(/面額/);
    expect(validateDividend({ ...base, remittanceFee: -1 })).toMatch(/匯費/);
    expect(validateDividend({ ...base, otherAnnualDividend: -1 })).toMatch(/其他/);
  });
});

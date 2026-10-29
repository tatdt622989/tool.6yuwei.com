import { describe, expect, it } from 'vitest';
import {
  calculateYearEndBonus,
  grossBonus,
  healthInsuredFor,
  supplementaryPremium,
  validateYearEndBonus,
  withholdingTax,
  type YearEndBonusInput,
} from './logic';

const base: YearEndBonusInput = {
  salary: 50_000,
  mode: 'months',
  months: 2,
  fixedAmount: 0,
  prorate: false,
  employedMonths: 12,
  priorBonus: 0,
  payYear: 2026,
};

describe('grossBonus', () => {
  it('月薪 × 月數', () => {
    expect(grossBonus(base)).toBe(100_000);
    expect(grossBonus({ ...base, months: 1.5 })).toBe(75_000);
  });
  it('固定金額', () => {
    expect(grossBonus({ ...base, mode: 'fixed', fixedAmount: 66_666 })).toBe(66_666);
  });
  it('依在職月數比例：月薪 40,000 × 2 個月 × 6/12 = 40,000', () => {
    expect(grossBonus({ ...base, salary: 40_000, prorate: true, employedMonths: 6 })).toBe(40_000);
  });
  it('比例計算四捨五入到元', () => {
    expect(grossBonus({ ...base, salary: 35_000, months: 1, prorate: true, employedMonths: 7 })).toBe(20_417);
  });
  it('在職月數超過 12 以 12 計', () => {
    expect(grossBonus({ ...base, prorate: true, employedMonths: 15 })).toBe(100_000);
  });
});

describe('withholdingTax（115 年度起扣標準 90,501 元，按給付額扣 5%）', () => {
  it('未達起扣標準免扣繳', () => {
    expect(withholdingTax(90_500)).toBe(0);
    expect(withholdingTax(0)).toBe(0);
  });
  it('剛好達起扣標準即按全額扣 5%，元以下捨去', () => {
    expect(withholdingTax(90_501)).toBe(4_525);
  });
  it('國稅局例：年終 10 萬元扣 5,000 元', () => {
    expect(withholdingTax(100_000)).toBe(5_000);
  });
  it('2027 年發放暫用相同標準', () => {
    expect(withholdingTax(90_500, 2027)).toBe(0);
    expect(withholdingTax(200_000, 2027)).toBe(10_000);
  });
});

describe('supplementaryPremium（2.11%，累計超過當月投保金額 4 倍部分）', () => {
  it('健保署例：投保 31,800 元，年終 10 萬未超過 4 倍 127,200 元，不扣', () => {
    const r = supplementaryPremium(100_000, 31_800);
    expect(r.threshold).toBe(127_200);
    expect(r.base).toBe(0);
    expect(r.premium).toBe(0);
    expect(r.remainingRoom).toBe(27_200);
  });
  it('健保署 Q&A：投保 30,300 元，已領 10 萬、再領 10 萬，扣 1,663 元', () => {
    const r = supplementaryPremium(100_000, 30_300, 100_000);
    expect(r.threshold).toBe(121_200);
    expect(r.base).toBe(78_800);
    expect(r.premium).toBe(1_663);
    expect(r.remainingRoom).toBe(0);
  });
  it('先前已超過門檻時，本次全額計費', () => {
    const r = supplementaryPremium(100_000, 50_000, 300_000);
    expect(r.base).toBe(100_000);
    expect(r.premium).toBe(2_110);
  });
  it('單次給付計費上限 1,000 萬元', () => {
    const r = supplementaryPremium(20_000_000, 313_000);
    expect(r.capped).toBe(true);
    expect(r.base).toBe(10_000_000);
    expect(r.premium).toBe(211_000);
  });
  it('剛好等於 4 倍不扣', () => {
    expect(supplementaryPremium(181_200, 45_300).premium).toBe(0);
  });
  it('四捨五入：超過 1 元 → 0.0211 ≈ 0；超過 24 元 → 0.5064 ≈ 1', () => {
    expect(supplementaryPremium(121_201, 30_300).premium).toBe(0);
    expect(supplementaryPremium(121_224, 30_300).premium).toBe(1);
  });
});

describe('healthInsuredFor', () => {
  it('依 2026 健保級距無條件進位', () => {
    expect(healthInsuredFor(36_000)).toBe(36_300);
    expect(healthInsuredFor(50_000)).toBe(50_600);
    expect(healthInsuredFor(20_000)).toBe(29_500);
    expect(healthInsuredFor(500_000)).toBe(313_000);
  });
});

describe('calculateYearEndBonus', () => {
  it('月薪 5 萬、2 個月：扣稅 5,000，未超過 4 倍（202,400）不扣補充保費，實領 95,000', () => {
    const r = calculateYearEndBonus(base)!;
    expect(r.gross).toBe(100_000);
    expect(r.insured).toBe(50_600);
    expect(r.tax).toBe(5_000);
    expect(r.nhi.premium).toBe(0);
    expect(r.net).toBe(95_000);
    expect(r.nhi.remainingRoom).toBe(102_400);
  });
  it('月薪 3 萬、4 個月 12 萬：4 倍 121,200 元，不扣補充保費，扣稅 6,000', () => {
    const r = calculateYearEndBonus({ ...base, salary: 30_000, months: 4 })!;
    expect(r.insured).toBe(30_300);
    expect(r.tax).toBe(6_000);
    expect(r.nhi.premium).toBe(0);
    expect(r.net).toBe(114_000);
  });
  it('月薪 4 萬、6 個月 24 萬：超過 4 倍 160,400 元的 79,600 元扣 1,680 元', () => {
    const r = calculateYearEndBonus({ ...base, salary: 40_000, months: 6 })!;
    expect(r.insured).toBe(40_100);
    expect(r.nhi.base).toBe(79_600);
    expect(r.nhi.premium).toBe(1_680);
    expect(r.tax).toBe(12_000);
    expect(r.net).toBe(240_000 - 12_000 - 1_680);
  });
  it('已領三節獎金會累計進 4 倍門檻', () => {
    const r = calculateYearEndBonus({ ...base, salary: 36_000, months: 3, priorBonus: 50_000 })!;
    // 36,300 × 4 = 145,200；累計 158,000 → 超過 12,800 → 270.08 ≈ 270
    expect(r.nhi.base).toBe(12_800);
    expect(r.nhi.premium).toBe(270);
  });
  it('自訂投保金額（高薪低報或離職當月級距）', () => {
    const r = calculateYearEndBonus({ ...base, insuredOverride: 20_000 })!;
    expect(r.nhi.base).toBe(20_000);
    expect(r.nhi.premium).toBe(422);
  });
  it('固定金額未達起扣標準，免扣稅', () => {
    const r = calculateYearEndBonus({ ...base, mode: 'fixed', fixedAmount: 80_000 })!;
    expect(r.taxApplies).toBe(false);
    expect(r.tax).toBe(0);
    expect(r.net).toBe(80_000);
  });
  it('年終 0 元', () => {
    const r = calculateYearEndBonus({ ...base, months: 0 })!;
    expect(r.gross).toBe(0);
    expect(r.net).toBe(0);
    expect(r.netRatio).toBe(1);
  });
});

describe('validateYearEndBonus', () => {
  it('rejects bad input', () => {
    expect(validateYearEndBonus({ ...base, salary: Number.NaN })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, salary: 0 })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, months: -1 })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, priorBonus: -5 })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, prorate: true, employedMonths: 13 })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, insuredOverride: 0 })).not.toBeNull();
    expect(validateYearEndBonus({ ...base, mode: 'fixed', fixedAmount: -1 })).not.toBeNull();
  });
  it('固定金額模式可只填投保金額', () => {
    expect(validateYearEndBonus({ ...base, mode: 'fixed', fixedAmount: 100_000, salary: 0 })).not.toBeNull();
    expect(
      validateYearEndBonus({ ...base, mode: 'fixed', fixedAmount: 100_000, salary: 0, insuredOverride: 36_300 }),
    ).toBeNull();
  });
  it('accepts normal input', () => {
    expect(validateYearEndBonus(base)).toBeNull();
    expect(calculateYearEndBonus({ ...base, salary: -1 })).toBeNull();
  });
});

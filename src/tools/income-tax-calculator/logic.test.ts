import { describe, expect, it } from 'vitest';
import { bracketFor, calculateTax, progressiveTax, TAX_YEARS, validateTax, type TaxInput } from './logic';

const base: TaxInput = {
  year: '114',
  married: false,
  salarySelf: 600_000,
  salarySpouse: 0,
  seniorSelf: false,
  seniorSpouse: false,
  dependents: 0,
  seniorDependents: 0,
  interest: 0,
  otherIncome: 0,
  itemized: 0,
  disabled: 0,
  preschool: 0,
  tuition: 0,
  longTermCare: 0,
  rent: 0,
};
const calc = (patch: Partial<TaxInput>) => calculateTax({ ...base, ...patch })!;
const y114 = TAX_YEARS['114'];
const y115 = TAX_YEARS['115'];

describe('year parameters', () => {
  it('114 年度 brackets and 累進差額', () => {
    expect(y114.brackets.map((b) => b.diff)).toEqual([0, 41_300, 147_700, 413_700, 911_700]);
    expect(y114.brackets.map((b) => b.upTo).slice(0, 4)).toEqual([590_000, 1_330_000, 2_660_000, 4_980_000]);
  });
  it('115 年度 brackets and 累進差額', () => {
    expect(y115.brackets.map((b) => b.diff)).toEqual([0, 42_700, 153_100, 430_100, 949_100]);
    expect(y115.exemption).toBe(101_000);
    expect(y115.salaryDeduction).toBe(227_000);
  });
});

describe('progressiveTax', () => {
  it('is continuous at bracket edges', () => {
    expect(progressiveTax(590_000, y114)).toBe(29_500);
    expect(progressiveTax(590_001, y114)).toBe(29_500);
    expect(progressiveTax(1_330_000, y114)).toBe(118_300);
    expect(progressiveTax(4_980_000, y114)).toBe(1_080_300);
    expect(progressiveTax(6_000_000, y114)).toBe(1_488_300);
  });
  it('is 0 for non-positive net income', () => {
    expect(progressiveTax(0, y114)).toBe(0);
    expect(progressiveTax(-5, y114)).toBe(0);
  });
  it('bracketFor picks the right rate', () => {
    expect(bracketFor(600_000, y114).rate).toBe(0.12);
    expect(bracketFor(600_000, y115).rate).toBe(0.05);
  });
});

describe('calculateTax — single', () => {
  it('年薪 60 萬：淨額 154,000，稅額 7,700', () => {
    const r = calc({});
    expect(r.parts[0].net).toBe(154_000);
    expect(r.tax).toBe(7700);
    expect(r.marginalRate).toBe(0.05);
    expect(r.basicLivingDiff).toBe(0);
  });
  it('年薪 100 萬：114 年度 27,700、115 年度 26,800', () => {
    expect(calc({ salarySelf: 1_000_000 }).tax).toBe(27_700);
    expect(calc({ salarySelf: 1_000_000, year: '115' }).tax).toBe(26_800);
  });
  it('uses itemized deductions only when larger than the standard deduction', () => {
    expect(calc({ itemized: 100_000 }).deductionKind).toBe('standard');
    const r = calc({ salarySelf: 1_000_000, itemized: 200_000 });
    expect(r.deductionKind).toBe('itemized');
    expect(r.parts[0].net).toBe(1_000_000 - 218_000 - 97_000 - 200_000);
  });
  it('caps 儲蓄投資特別扣除額 at 270,000', () => {
    const r = calc({ salarySelf: 500_000, interest: 300_000 });
    expect(r.parts[0].net).toBe(500_000 - 218_000 + 300_000 - 97_000 - 131_000 - 270_000);
    expect(r.tax).toBe(4200);
  });
  it('caps rent at 180,000', () => {
    expect(calc({ salarySelf: 1_200_000, rent: 250_000 }).parts[0].net).toBe(1_200_000 - 218_000 - 97_000 - 131_000 - 180_000);
  });
  it('drops 長照 and rent when the rate stays at 20% or more (排富)', () => {
    const r = calc({ salarySelf: 3_000_000, longTermCare: 1, rent: 120_000 });
    expect(r.wealthExcluded).toBe(true);
    expect(r.parts[0].net).toBe(3_000_000 - 218_000 - 97_000 - 131_000);
  });
  it('uses the 70+ exemption', () => {
    expect(calc({ seniorSelf: true }).parts[0].net).toBe(154_000 - 48_500);
  });
});

describe('calculateTax — married', () => {
  it('applies 基本生活費差額 for large households', () => {
    const r = calc({ married: true, salarySelf: 600_000, salarySpouse: 500_000, dependents: 2, seniorDependents: 2 });
    expect(r.basicLivingDiff).toBe(213_000 * 6 - (97_000 * 4 + 145_500 * 2 + 262_000));
    expect(r.tax).toBe(0);
  });
  it('幼兒學前：first child 150,000, second 225,000', () => {
    const r = calc({ married: true, salarySelf: 1_200_000, salarySpouse: 800_000, dependents: 2, preschool: 2 });
    const household = r.parts[r.parts.length - 1];
    expect(household.steps.find((s) => s.label === '幼兒學前特別扣除額')?.amount).toBe(375_000);
    expect(r.tax).toBe(26_950);
  });
  it('picks salary separation when cheaper for high earners', () => {
    const r = calc({ married: true, salarySelf: 2_500_000, salarySpouse: 1_500_000 });
    expect(r.method).toBe('separateSpouse');
    expect(r.parts).toHaveLength(2);
    expect(r.parts[0].net).toBe(1_500_000 - 218_000 - 97_000);
    expect(r.tax).toBe(337_800);
    expect(r.alternatives.find((a) => a.method === 'combined')?.tax).toBe(518_700);
  });
  it('effective rate = tax / total income', () => {
    const r = calc({ married: true, salarySelf: 2_500_000, salarySpouse: 1_500_000 });
    expect(r.effectiveRate).toBeCloseTo(337_800 / 4_000_000, 10);
  });
});

describe('validateTax', () => {
  it.each([[{ salarySelf: -1 }], [{ dependents: 1.5 }], [{ interest: Number.NaN }], [{ disabled: 3 }], [{ preschool: 2 }]])(
    'rejects %o',
    (patch) => {
      expect(validateTax({ ...base, ...patch })).not.toBeNull();
      expect(calculateTax({ ...base, ...patch })).toBeNull();
    },
  );
});

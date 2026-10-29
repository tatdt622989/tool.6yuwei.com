import { describe, expect, it } from 'vitest';
import {
  bmiOf,
  calcBodyFat,
  classifyBodyFat,
  composition,
  deurenbergBodyFat,
  isHpaObese,
  navyBodyFat,
  validateInput,
  type BodyFatInput,
} from './logic';

const man: BodyFatInput = { sex: 'male', age: 30, heightCm: 175, weightKg: 72, neckCm: 38, waistCm: 84, hipCm: Number.NaN };
const woman: BodyFatInput = { sex: 'female', age: 30, heightCm: 160, weightKg: 55, neckCm: 32, waistCm: 70, hipCm: 94 };

describe('navyBodyFat', () => {
  it('matches a hand calculation for men', () => {
    const density = 1.0324 - 0.19077 * Math.log10(46) + 0.15456 * Math.log10(175);
    expect(navyBodyFat(man)).toBeCloseTo(495 / density - 450, 9);
    expect(navyBodyFat(man)).toBeCloseTo(16.15, 2);
  });

  it('uses hip circumference for women', () => {
    expect(navyBodyFat(woman)).toBeCloseTo(25.68, 2);
    expect(navyBodyFat({ ...woman, hipCm: 100 })).toBeGreaterThan(navyBodyFat(woman));
  });

  it('returns NaN when waist is not larger than neck', () => {
    expect(navyBodyFat({ ...man, waistCm: 38 })).toBeNaN();
    expect(navyBodyFat({ ...man, heightCm: 0 })).toBeNaN();
  });
});

describe('deurenbergBodyFat', () => {
  it('applies 1.2 × BMI + 0.23 × age − 10.8 × sex − 5.4', () => {
    expect(deurenbergBodyFat('male', 22, 40)).toBeCloseTo(26.4 + 9.2 - 10.8 - 5.4, 9);
    expect(deurenbergBodyFat('female', 22, 40)).toBeCloseTo(26.4 + 9.2 - 5.4, 9);
  });

  it('bmiOf computes kg/m²', () => {
    expect(bmiOf(160, 51.2)).toBeCloseTo(20, 9);
  });
});

describe('classification', () => {
  it('uses ACE ranges by sex', () => {
    expect(classifyBodyFat('male', 16)!.label).toBe('健康良好');
    expect(classifyBodyFat('male', 25)!.label).toBe('肥胖');
    expect(classifyBodyFat('female', 25.7)!.label).toBe('一般');
    expect(classifyBodyFat('female', 13)!.label).toBe('必需脂肪');
    expect(classifyBodyFat('female', 8)).toBeNull();
  });

  it('applies the 國健署 cut-offs (男 25%、女 30%)', () => {
    expect(isHpaObese('male', 24.9)).toBe(false);
    expect(isHpaObese('male', 25)).toBe(true);
    expect(isHpaObese('female', 29.9)).toBe(false);
    expect(isHpaObese('female', 30)).toBe(true);
  });
});

describe('calcBodyFat', () => {
  it('returns composition that sums to body weight', () => {
    const r = calcBodyFat(man)!;
    expect(r.composition.fatKg + r.composition.leanKg).toBeCloseTo(72, 9);
    expect(r.composition.fatKg).toBeCloseTo(72 * 0.1615, 1);
  });

  it('rejects children and missing hip for women', () => {
    expect(calcBodyFat({ ...man, age: 15 })).toBeNull();
    expect(validateInput({ ...woman, hipCm: Number.NaN })).toMatch(/臀圍/);
    expect(validateInput({ ...man, waistCm: 30, neckCm: 40 })).toMatch(/腰圍/);
  });

  it('composition handles 0%', () => {
    expect(composition(60, 0)).toEqual({ fatKg: 0, leanKg: 60 });
  });
});

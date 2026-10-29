import { describe, expect, it } from 'vitest';
import {
  classifyBmi,
  computeBmi,
  feetInchesToCm,
  healthyWeightRange,
  kgToLb,
  lbToKg,
  roundBmi,
  scalePercent,
  scaleSegments,
  scaleTicks,
  weightAtBmi,
  weightGap,
} from './logic';

describe('computeBmi', () => {
  it('computes weight / height²', () => {
    expect(computeBmi(170, 65)).toBeCloseTo(22.49, 2);
    expect(computeBmi(160, 80)).toBeCloseTo(31.25, 2);
  });

  it('returns NaN for zero, negative or invalid input', () => {
    expect(computeBmi(0, 60)).toBeNaN();
    expect(computeBmi(170, 0)).toBeNaN();
    expect(computeBmi(-170, 60)).toBeNaN();
    expect(computeBmi(Number.NaN, 60)).toBeNaN();
    expect(computeBmi(170, Infinity)).toBeNaN();
  });
});

describe('classifyBmi (Taiwan HPA standard)', () => {
  it.each([
    [17, 'under'],
    [18.4, 'under'],
    [18.5, 'normal'],
    [23.9, 'normal'],
    [24, 'over'],
    [26.9, 'over'],
    [27, 'obese1'],
    [29.9, 'obese1'],
    [30, 'obese2'],
    [34.9, 'obese2'],
    [35, 'obese3'],
    [50, 'obese3'],
  ])('BMI %s is %s', (bmi, level) => {
    expect(classifyBmi(bmi)?.level).toBe(level);
  });

  it('classifies on the one-decimal value people see', () => {
    expect(roundBmi(23.96)).toBe(24);
    expect(classifyBmi(23.96)?.level).toBe('over');
    expect(classifyBmi(18.46)?.level).toBe('normal');
  });

  it('returns null for invalid BMI', () => {
    expect(classifyBmi(Number.NaN)).toBeNull();
    expect(classifyBmi(0)).toBeNull();
  });
});

describe('healthyWeightRange', () => {
  it('uses 18.5 and 24 times height²', () => {
    const r = healthyWeightRange(170)!;
    expect(r.min).toBeCloseTo(53.465, 3);
    expect(r.max).toBeCloseTo(69.36, 2);
  });

  it('returns null for invalid height', () => {
    expect(healthyWeightRange(0)).toBeNull();
    expect(healthyWeightRange(Number.NaN)).toBeNull();
  });
});

describe('weightGap', () => {
  it('is zero inside the healthy range', () => {
    expect(weightGap(170, 65)).toBe(0);
  });

  it('is negative when weight should go down', () => {
    expect(weightGap(170, 80)).toBeCloseTo(-10.64, 2);
  });

  it('is positive when weight should go up', () => {
    expect(weightGap(170, 50)).toBeCloseTo(3.465, 3);
  });

  it('is NaN for invalid input', () => {
    expect(weightGap(170, 0)).toBeNaN();
  });
});

describe('scalePercent', () => {
  it('maps the 14–40 scale and clamps', () => {
    expect(scalePercent(14)).toBe(0);
    expect(scalePercent(27)).toBe(50);
    expect(scalePercent(10)).toBe(0);
    expect(scalePercent(60)).toBe(100);
    expect(scalePercent(Number.NaN)).toBe(0);
  });
});

describe('classifyBmi (日本肥満学会, ja)', () => {
  it.each([
    [18.4, 'under'],
    [18.5, 'normal'],
    [24.9, 'normal'],
    [25, 'obese1'],
    [29.9, 'obese1'],
    [30, 'obese2'],
    [35, 'obese3'],
    [39.9, 'obese3'],
    [40, 'obese4'],
  ])('BMI %s is %s', (bmi, level) => {
    expect(classifyBmi(bmi, 'jp')?.level).toBe(level);
  });

  it('uses 18.5–25 as the normal range and BMI 22 as 標準体重', () => {
    const r = healthyWeightRange(165, 'jp')!;
    expect(r.max).toBeCloseTo(25 * 1.65 ** 2, 6);
    expect(weightAtBmi(165, 22)).toBeCloseTo(59.895, 3);
    expect(weightGap(165, 70, 'jp')).toBeCloseTo(25 * 1.65 ** 2 - 70, 6);
  });
});

describe('classifyBmi (WHO, en)', () => {
  it.each([
    [18.4, 'under'],
    [24.9, 'normal'],
    [25, 'over'],
    [29.9, 'over'],
    [30, 'obese1'],
    [35, 'obese2'],
    [40, 'obese3'],
  ])('BMI %s is %s', (bmi, level) => {
    expect(classifyBmi(bmi, 'who')?.level).toBe(level);
  });
});

describe('US customary units', () => {
  it('converts feet/inches and pounds', () => {
    expect(feetInchesToCm(5, 9)).toBeCloseTo(175.26, 2);
    expect(feetInchesToCm(6, Number.NaN)).toBeCloseTo(182.88, 2);
    expect(feetInchesToCm(Number.NaN, Number.NaN)).toBeNaN();
    expect(lbToKg(160)).toBeCloseTo(72.575, 3);
    expect(kgToLb(lbToKg(123))).toBeCloseTo(123, 9);
  });

  it('matches the 703 × lb / in² formula', () => {
    const bmi = computeBmi(feetInchesToCm(5, 9), lbToKg(160));
    expect(bmi).toBeCloseTo((703 * 160) / 69 ** 2, 1);
  });
});

describe('scale per standard', () => {
  it('keeps the Taiwan scale unchanged', () => {
    expect(scaleTicks('tw').map((t) => t.value)).toEqual([18.5, 24, 27, 30, 35]);
    expect(scaleSegments('tw').map((s) => s.level)).toEqual(['under', 'normal', 'over', 'obese1', 'obese2', 'obese3']);
  });

  it('drops bands that start at the top of the scale', () => {
    expect(scaleSegments('jp').map((s) => s.level)).not.toContain('obese4');
    expect(scaleTicks('who').map((t) => t.value)).toEqual([18.5, 25, 30, 35]);
  });
});

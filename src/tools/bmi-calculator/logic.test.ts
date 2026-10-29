import { describe, expect, it } from 'vitest';
import { classifyBmi, computeBmi, healthyWeightRange, roundBmi, scalePercent, weightGap } from './logic';

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

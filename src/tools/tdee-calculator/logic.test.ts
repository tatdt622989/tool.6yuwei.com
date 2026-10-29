import { describe, expect, it } from 'vitest';
import {
  activityFactor,
  calcTdee,
  cutTarget,
  harrisBenedict,
  macrosFor,
  mifflinStJeor,
  validateBody,
  type BodyInput,
} from './logic';

const man: BodyInput = { sex: 'male', age: 30, heightCm: 175, weightKg: 70 };
const woman: BodyInput = { sex: 'female', age: 30, heightCm: 160, weightKg: 55 };

describe('BMR formulas', () => {
  it('Mifflin-St Jeor matches hand calculation', () => {
    expect(mifflinStJeor(man)).toBeCloseTo(700 + 1093.75 - 150 + 5, 6); // 1648.75
    expect(mifflinStJeor(woman)).toBeCloseTo(550 + 1000 - 150 - 161, 6); // 1239
  });

  it('revised Harris-Benedict matches hand calculation', () => {
    expect(harrisBenedict(man)).toBeCloseTo(88.362 + 937.79 + 839.825 - 170.31, 3);
    expect(harrisBenedict(woman)).toBeCloseTo(447.593 + 508.585 + 495.68 - 129.9, 3);
  });
});

describe('activityFactor', () => {
  it('maps ids to the standard multipliers', () => {
    expect(activityFactor('sedentary')).toBe(1.2);
    expect(activityFactor('moderate')).toBe(1.55);
    expect(activityFactor('athlete')).toBe(1.9);
  });
});

describe('calcTdee', () => {
  it('computes TDEE = BMR × factor and three goals', () => {
    const r = calcTdee(man, 'moderate')!;
    expect(r.tdee).toBeCloseTo(1648.75 * 1.55, 6);
    expect(r.goals.map((g) => g.id)).toEqual(['cut', 'maintain', 'bulk']);
    expect(r.goals[0].kcal).toBeCloseTo(r.tdee - 500, 6);
    expect(r.goals[0].floored).toBe(false);
    expect(r.goals[2].kcal).toBeCloseTo(r.tdee + 300, 6);
  });

  it('raises the cut target to BMR when −500 would go below it', () => {
    const r = calcTdee(woman, 'sedentary')!;
    // TDEE 1486.8 − 500 = 986.8 < BMR 1239
    expect(r.goals[0].kcal).toBeCloseTo(1239, 6);
    expect(r.goals[0].floored).toBe(true);
  });

  it('returns null for invalid input', () => {
    expect(calcTdee({ ...man, age: Number.NaN }, 'light')).toBeNull();
    expect(calcTdee({ ...man, heightCm: 1.75 }, 'light')).toBeNull();
  });
});

describe('cutTarget', () => {
  it('uses the sex minimum when it is higher than BMR', () => {
    expect(cutTarget(1300, 1050, 'female')).toEqual({ kcal: 1200, floored: true });
    expect(cutTarget(1700, 1400, 'male')).toEqual({ kcal: 1500, floored: true });
  });

  it('never exceeds TDEE', () => {
    expect(cutTarget(1150, 1000, 'female')).toEqual({ kcal: 1150, floored: true });
  });
});

describe('macrosFor', () => {
  it('splits protein by g/kg, fat 25 %, carbs the rest', () => {
    const m = macrosFor(2000, 70, 'maintain');
    expect(m.proteinG).toBeCloseTo(112, 6);
    expect(m.fatG).toBeCloseTo(500 / 9, 6);
    expect(m.carbG).toBeCloseTo((2000 - 448 - 500) / 4, 6);
  });

  it('never returns negative carbs', () => {
    expect(macrosFor(800, 120, 'cut').carbG).toBe(0);
  });
});

describe('validateBody', () => {
  it('accepts normal adults and rejects out-of-range values', () => {
    expect(validateBody(man)).toBeNull();
    expect(validateBody({ ...man, age: 10 })).toMatch(/年齡/);
    expect(validateBody({ ...man, weightKg: 500 })).toMatch(/體重/);
  });
});

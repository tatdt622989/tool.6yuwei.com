import { describe, expect, it } from 'vitest';
import {
  calcWater,
  checkWater,
  drinkingSchedule,
  flOzToMl,
  lbToKg,
  mlPerKgToOzPerLb,
  mlToFlOz,
  REFERENCE_FLUID,
  slotsInFlOz,
  validateWater,
  type WaterInput,
} from './logic';

const base: WaterInput = { weightKg: 60, activity: 'low', exerciseMin: 0, hot: false, cupMl: 250 };

describe('calcWater', () => {
  it('uses weight × 30 ml for low activity', () => {
    const r = calcWater(base)!;
    expect(r.total).toBe(1800);
    expect(r.cups).toBe(8); // 1800 / 250 = 7.2 → 8 杯
    expect(r.low).toBe(1800);
    expect(r.high).toBe(2400);
  });

  it('adds exercise and hot-climate adjustments', () => {
    const r = calcWater({ ...base, weightKg: 70, activity: 'normal', exerciseMin: 30, hot: true })!;
    expect(r.base).toBe(2450);
    expect(r.exercise).toBe(250);
    expect(r.climate).toBe(500);
    expect(r.total).toBe(3200);
    expect(r.low).toBe(2100 + 750);
    expect(r.high).toBe(2800 + 750);
    expect(r.cups).toBe(13);
  });

  it('rounds to 10 ml and respects cup size', () => {
    const r = calcWater({ ...base, weightKg: 55.5, activity: 'high', exerciseMin: 45, cupMl: 500 })!;
    expect(r.base).toBe(2220);
    expect(r.exercise).toBe(380);
    expect(r.cups).toBe(Math.ceil(2600 / 500));
  });

  it('validates input', () => {
    expect(calcWater({ ...base, weightKg: Number.NaN })).toBeNull();
    expect(validateWater({ ...base, weightKg: 5 })).toMatch(/體重/);
    expect(validateWater({ ...base, cupMl: 10 })).toMatch(/杯子/);
    expect(validateWater({ ...base, exerciseMin: -5 })).toMatch(/運動/);
  });
});

describe('drinkingSchedule', () => {
  it('spreads cups from 07:00 to 21:00 and sums to the total', () => {
    const s = drinkingSchedule(1800, 8);
    expect(s).toHaveLength(8);
    expect(s[0].time).toBe('07:00');
    expect(s.at(-1)!.time).toBe('21:00');
    expect(s.reduce((sum, x) => sum + x.ml, 0)).toBe(1800);
  });

  it('handles one cup and empty input', () => {
    expect(drinkingSchedule(250, 1)).toEqual([{ time: '07:00', ml: 250 }]);
    expect(drinkingSchedule(0, 3)).toEqual([]);
  });
});

describe('checkWater', () => {
  it('returns problem codes and keeps zh messages', () => {
    expect(checkWater(base)).toBeNull();
    expect(checkWater({ ...base, weightKg: Number.NaN })).toBe('missing');
    expect(checkWater({ ...base, weightKg: 300 })).toBe('weight');
    expect(checkWater({ ...base, exerciseMin: 700 })).toBe('exercise');
    expect(checkWater({ ...base, cupMl: 20 })).toBe('cup');
    expect(validateWater({ ...base, weightKg: Number.NaN })).toBe('請輸入體重。');
  });
});

describe('US customary units', () => {
  it('converts fluid ounces and pounds', () => {
    expect(flOzToMl(8)).toBeCloseTo(236.588, 3);
    expect(mlToFlOz(1000)).toBeCloseTo(33.814, 3);
    expect(lbToKg(150)).toBeCloseTo(68.039, 3);
    expect(mlPerKgToOzPerLb(30)).toBeCloseTo(0.46, 2);
    expect(mlPerKgToOzPerLb(40)).toBeCloseTo(0.61, 2);
  });

  it('works end to end for a 150 lb adult with 8 fl oz glasses', () => {
    const r = calcWater({ ...base, weightKg: lbToKg(150), cupMl: flOzToMl(8) })!;
    expect(r.total).toBe(2040);
    expect(Math.round(mlToFlOz(r.total))).toBe(69);
    expect(r.cups).toBe(9);
  });

  it('splits the total into whole ounces that add up exactly', () => {
    const oz = slotsInFlOz(2040, 9);
    expect(oz).toHaveLength(9);
    expect(oz.reduce((a, b) => a + b, 0)).toBe(69);
    expect(oz).toEqual([8, 8, 8, 8, 8, 8, 7, 7, 7]);
    expect(slotsInFlOz(flOzToMl(106), 14).filter((x) => x === 8)).toHaveLength(8);
    expect(slotsInFlOz(0, 3)).toEqual([]);
    expect(slotsInFlOz(500, 0)).toEqual([]);
  });

  it('has a reference amount for every market', () => {
    expect(REFERENCE_FLUID.tw).toEqual({ male: 2400, female: 2100 });
    expect(REFERENCE_FLUID.us.male).toBe(3000);
    expect(REFERENCE_FLUID.jp.female).toBe(1200);
  });
});

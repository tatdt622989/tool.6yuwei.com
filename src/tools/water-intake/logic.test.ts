import { describe, expect, it } from 'vitest';
import { calcWater, drinkingSchedule, validateWater, type WaterInput } from './logic';

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

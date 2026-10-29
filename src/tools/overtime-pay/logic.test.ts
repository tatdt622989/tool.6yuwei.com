import { describe, expect, it } from 'vitest';
import { calculateOvertime, dayBreakdown, hourlyFromMonthly, validateOvertime } from './logic';

describe('hourlyFromMonthly', () => {
  it('月薪 ÷ 30 ÷ 8', () => {
    expect(hourlyFromMonthly(36_000)).toBe(150);
    expect(hourlyFromMonthly(29_500)).toBeCloseTo(122.9167, 4);
    expect(hourlyFromMonthly(30_900)).toBe(128.75);
  });
});

describe('dayBreakdown', () => {
  it('平日加班 3 小時 = 2 × 4/3 + 1 × 5/3', () => {
    const lines = dayBreakdown('weekday', 3, 150);
    expect(lines.map((l) => l.hours)).toEqual([2, 1]);
    expect(lines.reduce((s, l) => s + l.amount, 0)).toBeCloseTo(400 + 250, 6);
  });
  it('休息日 10 小時 = 2,700 元（臺中市勞工局範例）', () => {
    const total = dayBreakdown('restDay', 10, 150).reduce((s, l) => s + l.amount, 0);
    expect(total).toBeCloseTo(2700, 6);
  });
  it('休息日 4 小時 = 900 元（勞動部範例）', () => {
    expect(dayBreakdown('restDay', 4, 150).reduce((s, l) => s + l.amount, 0)).toBeCloseTo(900, 6);
  });
  it('國定假日 8 小時內一律加發一日工資', () => {
    expect(dayBreakdown('holiday', 3, 150).reduce((s, l) => s + l.amount, 0)).toBe(1200);
    expect(dayBreakdown('holiday', 8, 150).reduce((s, l) => s + l.amount, 0)).toBe(1200);
  });
  it('國定假日 12 小時 = 一日工資 + 2 × 4/3 + 2 × 5/3', () => {
    expect(dayBreakdown('holiday', 12, 150).reduce((s, l) => s + l.amount, 0)).toBeCloseTo(1200 + 400 + 500, 6);
  });
  it('supports half hours', () => {
    expect(dayBreakdown('weekday', 0.5, 150)[0].amount).toBeCloseTo(100, 6);
  });
  it('0 hours gives nothing', () => {
    expect(dayBreakdown('restDay', 0, 150)).toEqual([]);
  });
});

describe('calculateOvertime', () => {
  it('sums days and counts hours toward the 46-hour cap', () => {
    const r = calculateOvertime(150, [
      { dayType: 'weekday', hours: 2, days: 10 },
      { dayType: 'restDay', hours: 8, days: 2 },
      { dayType: 'holiday', hours: 9, days: 1 },
    ])!;
    expect(r.total).toBeCloseTo(400 * 10 + (400 + 1500) * 2 + 1200 + 200, 6);
    expect(r.countedHours).toBe(20 + 16 + 1);
    expect(r.overCap).toBe(false);
  });
  it('flags more than 46 hours a month', () => {
    const r = calculateOvertime(150, [{ dayType: 'weekday', hours: 3, days: 16 }])!;
    expect(r.countedHours).toBe(48);
    expect(r.overCap).toBe(true);
  });
});

describe('validateOvertime', () => {
  it('rejects bad input', () => {
    expect(validateOvertime(0, [])).not.toBeNull();
    expect(validateOvertime(150, [{ dayType: 'weekday', hours: 5, days: 1 }])).not.toBeNull();
    expect(validateOvertime(150, [{ dayType: 'restDay', hours: 13, days: 1 }])).not.toBeNull();
    expect(validateOvertime(150, [{ dayType: 'restDay', hours: 2, days: 1.5 }])).not.toBeNull();
    expect(validateOvertime(150, [{ dayType: 'restDay', hours: -1, days: 1 }])).not.toBeNull();
    expect(validateOvertime(150, [{ dayType: 'restDay', hours: 2, days: 1 }])).toBeNull();
  });
});

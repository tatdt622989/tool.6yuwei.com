import { describe, expect, it } from 'vitest';
import {
  addMonths,
  anniversaryLeave,
  calendarYearLeave,
  entitlementByMonths,
  leavePeriods,
  monthsBetween,
  parseISODate,
  toISO,
  unusedLeavePay,
} from './logic';

const d = (s: string) => parseISODate(s)!;

describe('dates', () => {
  it('parses and validates ISO dates', () => {
    expect(parseISODate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseISODate('2023-02-29')).toBeNull();
    expect(parseISODate('2024/01/01')).toBeNull();
  });
  it('addMonths clamps to month end', () => {
    expect(toISO(addMonths(d('2024-08-31'), 6))).toBe('2025-02-28');
    expect(toISO(addMonths(d('2024-01-15'), 12))).toBe('2025-01-15');
    expect(toISO(addMonths(d('2024-11-30'), 3))).toBe('2025-02-28');
  });
  it('monthsBetween counts whole and partial months', () => {
    expect(monthsBetween(d('2018-07-01'), d('2019-01-01'))).toBe(6);
    expect(monthsBetween(d('2024-01-01'), d('2024-01-16'))).toBeCloseTo(15 / 31, 10);
    expect(monthsBetween(d('2024-05-01'), d('2024-04-01'))).toBe(0);
  });
});

describe('entitlementByMonths (勞基法第 38 條)', () => {
  it.each([
    [5, 0],
    [6, 3],
    [11, 3],
    [12, 7],
    [24, 10],
    [36, 14],
    [59, 14],
    [60, 15],
    [119, 15],
    [120, 16],
    [12 * 15, 21],
    [12 * 24, 30],
    [12 * 40, 30],
  ])('%i 個月 → %i 日', (months, days) => {
    expect(entitlementByMonths(months)).toBe(days);
  });
});

describe('leavePeriods', () => {
  it('starts at 6 months then every anniversary', () => {
    const p = leavePeriods(d('2024-03-10'), 4);
    expect(p.map((x) => toISO(x.start))).toEqual(['2024-09-10', '2025-03-10', '2026-03-10', '2027-03-10']);
    expect(p.map((x) => x.days)).toEqual([3, 7, 10, 14]);
  });
});

describe('anniversaryLeave (週年制)', () => {
  it('returns nothing before 6 months', () => {
    const r = anniversaryLeave(d('2026-06-01'), d('2026-10-29'))!;
    expect(r.current).toBeNull();
    expect(toISO(r.next.start)).toBe('2026-12-01');
  });
  it('finds the current period', () => {
    const r = anniversaryLeave(d('2023-07-01'), d('2026-10-29'))!;
    expect(r.current?.label).toBe('滿 3 年');
    expect(r.current?.days).toBe(14);
    expect(r.next.days).toBe(14);
  });
  it('rejects a date before hiring', () => {
    expect(anniversaryLeave(d('2026-01-01'), d('2025-01-01'))).toBeNull();
  });
});

describe('calendarYearLeave (曆年制)', () => {
  it('matches the 勞動部 example: 2017-07-01 到職 → 2018 年 6.5 日', () => {
    const r = calendarYearLeave(d('2017-07-01'), 2018)!;
    expect(r.total).toBeCloseTo(6.5, 10);
    expect(calendarYearLeave(d('2017-07-01'), 2017)!.total).toBe(0);
    // 2019: 7 × 6/12 + 10 × 6/12
    expect(calendarYearLeave(d('2017-07-01'), 2019)!.total).toBeCloseTo(8.5, 10);
  });
  it('splits the 6-month leave across years', () => {
    // 2025-03-01 到職：滿 6 個月期間 2025-09-01 ~ 2026-03-01，2025 年占 4/6
    const r2025 = calendarYearLeave(d('2025-03-01'), 2025)!;
    expect(r2025.total).toBeCloseTo(2, 10);
    const r2026 = calendarYearLeave(d('2025-03-01'), 2026)!;
    expect(r2026.total).toBeCloseTo(1 + (7 * 10) / 12, 10);
  });
  it('a full year in a stable band equals the annual days', () => {
    expect(calendarYearLeave(d('2015-01-01'), 2022)!.total).toBeCloseTo(15, 10);
  });
  it('rejects years before hiring', () => {
    expect(calendarYearLeave(d('2025-03-01'), 2024)).toBeNull();
  });
});

describe('unusedLeavePay', () => {
  it('pays 月薪 ÷ 30 per unused day', () => {
    expect(unusedLeavePay(5, 36_000)).toBe(6000);
    expect(unusedLeavePay(0.5, 36_000)).toBe(600);
    expect(unusedLeavePay(-1, 36_000)).toBeNaN();
  });
});

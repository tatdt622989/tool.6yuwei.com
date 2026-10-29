import { describe, expect, it } from 'vitest';
import {
  calcDue,
  dueDate,
  gestationalAge,
  gestationStart,
  HPA_PRENATAL,
  milestones,
  trimesterOf,
  validateDueInput,
  type DueInput,
} from './logic';

const today = { y: 2026, m: 10, d: 29 };
const lmp: DueInput = { method: 'lmp', date: { y: 2026, m: 5, d: 1 }, cycle: 28 };

describe('dueDate', () => {
  it("applies Naegele's rule (LMP + 280 days)", () => {
    expect(dueDate(lmp)).toEqual({ y: 2027, m: 2, d: 5 });
    // Classic textbook check: LMP 2025-01-01 → 2025-10-08
    expect(dueDate({ ...lmp, date: { y: 2025, m: 1, d: 1 } })).toEqual({ y: 2025, m: 10, d: 8 });
  });

  it('shifts by cycle length − 28', () => {
    expect(dueDate({ ...lmp, cycle: 32 })).toEqual({ y: 2027, m: 2, d: 9 });
    expect(dueDate({ ...lmp, cycle: 25 })).toEqual({ y: 2027, m: 2, d: 2 });
  });

  it('handles conception and IVF transfer dates', () => {
    expect(dueDate({ method: 'conception', date: { y: 2026, m: 5, d: 15 }, cycle: 28 })).toEqual({ y: 2027, m: 2, d: 5 });
    expect(dueDate({ method: 'ivf5', date: { y: 2026, m: 5, d: 20 }, cycle: 28 })).toEqual({ y: 2027, m: 2, d: 5 });
    expect(dueDate({ method: 'ivf3', date: { y: 2026, m: 5, d: 18 }, cycle: 28 })).toEqual({ y: 2027, m: 2, d: 5 });
  });
});

describe('gestational age and trimester', () => {
  it('counts completed weeks and days', () => {
    expect(gestationalAge(gestationStart(lmp), today)).toEqual({ totalDays: 181, weeks: 25, days: 6 });
  });

  it('uses the 國健署 trimester cut-offs (13 / 29 weeks)', () => {
    expect(trimesterOf(12)).toBe(1);
    expect(trimesterOf(13)).toBe(2);
    expect(trimesterOf(28)).toBe(2);
    expect(trimesterOf(29)).toBe(3);
    expect(trimesterOf(-1)).toBe(0);
  });
});

describe('milestones', () => {
  it('lists all 14 prenatal visits plus screening windows in date order', () => {
    const list = milestones(gestationStart(lmp), today);
    expect(list.filter((m) => m.label.endsWith('次產檢'))).toHaveLength(14);
    expect(list).toHaveLength(14 + HPA_PRENATAL.windows.length);
    const first = list.find((m) => m.label === '第 1 次產檢')!;
    expect(first.from).toEqual({ y: 2026, m: 6, d: 26 }); // 8 週 = LMP + 56 天
    for (let i = 1; i < list.length; i++) {
      expect(list[i].from.y * 400 + list[i].from.m * 32 + list[i].from.d).toBeGreaterThanOrEqual(
        list[i - 1].from.y * 400 + list[i - 1].from.m * 32 + list[i - 1].from.d,
      );
    }
  });

  it('marks done / current / upcoming against today', () => {
    const list = milestones(gestationStart(lmp), today);
    expect(list.find((m) => m.label === '第 5 次產檢')!.status).toBe('done'); // 24 週
    expect(list.find((m) => m.label.startsWith('貧血'))!.status).toBe('current'); // 24–28 週
    expect(list.find((m) => m.label === '第 6 次產檢')!.status).toBe('upcoming'); // 28 週
  });
});

describe('calcDue', () => {
  it('returns a full result', () => {
    const r = calcDue(lmp, today)!;
    expect(r.due).toEqual({ y: 2027, m: 2, d: 5 });
    expect(r.trimester).toBe(2);
    expect(r.daysToDue).toBe(99);
    expect(r.conception).toEqual({ y: 2026, m: 5, d: 15 });
    expect(r.progress).toBeCloseTo((181 / 280) * 100, 9);
  });

  it('validates input', () => {
    expect(validateDueInput({ ...lmp, cycle: 60 }, today)).toMatch(/週期/);
    expect(validateDueInput({ ...lmp, date: { y: 2026, m: 11, d: 5 } }, today)).toMatch(/晚於今天/);
    expect(validateDueInput({ ...lmp, date: { y: 2025, m: 1, d: 1 } }, today)).toMatch(/44 週/);
    expect(calcDue({ ...lmp, cycle: 28.5 }, today)).toBeNull();
  });
});

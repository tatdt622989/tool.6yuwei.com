import { describe, expect, it } from 'vitest';
import {
  calcDue,
  dueDate,
  gestationalAge,
  gestationStart,
  dueInputError,
  HPA_PRENATAL,
  milestones,
  pregnancyMonthJp,
  SCHEDULES,
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

describe('localized schedules', () => {
  it('uses ACOG trimesters for us (14 / 28 weeks) and Japanese 初期・中期・後期 for jp (16 / 28 weeks)', () => {
    expect(trimesterOf(13, 'us')).toBe(1);
    expect(trimesterOf(14, 'us')).toBe(2);
    expect(trimesterOf(27, 'us')).toBe(2);
    expect(trimesterOf(28, 'us')).toBe(3);
    expect(trimesterOf(15, 'jp')).toBe(1);
    expect(trimesterOf(16, 'jp')).toBe(2);
    expect(trimesterOf(28, 'jp')).toBe(3);
    expect(trimesterOf(-1, 'jp')).toBe(0);
  });

  it('counts 妊娠月数 in 4-week blocks, capped at 10ヶ月', () => {
    expect(pregnancyMonthJp(-1)).toBe(0);
    expect(pregnancyMonthJp(0)).toBe(1);
    expect(pregnancyMonthJp(3)).toBe(1);
    expect(pregnancyMonthJp(4)).toBe(2);
    expect(pregnancyMonthJp(25)).toBe(7);
    expect(pregnancyMonthJp(36)).toBe(10);
    expect(pregnancyMonthJp(41)).toBe(10);
  });

  it('builds the us key-dates list without numbered visits', () => {
    const list = milestones(gestationStart(lmp), today, 'us');
    expect(list.filter((m) => m.kind === 'visit')).toHaveLength(0);
    expect(list).toHaveLength(SCHEDULES.us.windows.length);
    const due = list.find((m) => m.id === 'due')!;
    expect(due.point).toBe(true);
    expect(due.from).toEqual({ y: 2027, m: 2, d: 5 });
    expect(due.to).toEqual(due.from);
    const gbs = list.find((m) => m.id === 'gbs')!;
    expect(gbs.from).toEqual({ y: 2027, m: 1, d: 8 }); // 36w0d
    expect(gbs.to).toEqual({ y: 2027, m: 1, d: 21 }); // 37w6d
    expect(list.find((m) => m.id === 'glucose')!.status).toBe('current'); // 25w6d
    expect(list.find((m) => m.id === 'anatomy')!.status).toBe('done');
  });

  it('builds the jp schedule: 14 妊婦健診 plus 産前休業 at 34w1d', () => {
    const list = milestones(gestationStart(lmp), today, 'jp');
    const visits = list.filter((m) => m.kind === 'visit');
    expect(visits).toHaveLength(14);
    expect(visits.map((v) => v.n)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(list.find((m) => m.id === 'leave')!.from).toEqual({ y: 2026, m: 12, d: 26 }); // 42 days incl. the due date
    expect(list.find((m) => m.id === 'due')!.from).toEqual({ y: 2027, m: 2, d: 5 });
  });

  it('passes the schedule through calcDue and keeps tw as the default', () => {
    expect(calcDue(lmp, today, 'us')!.trimester).toBe(2);
    const early = { ...lmp, date: { y: 2026, m: 7, d: 23 } }; // 14w0d on 2026-10-29
    expect(calcDue(early, today)!.trimester).toBe(2);
    expect(calcDue(early, today, 'us')!.trimester).toBe(2);
    expect(calcDue(early, today, 'jp')!.trimester).toBe(1);
    expect(calcDue(lmp, today)!.milestones[0].label).toBe('第 1 次產檢');
  });

  it('returns locale-neutral error codes', () => {
    expect(dueInputError({ ...lmp, cycle: 28.5 }, today)).toBe('cycleInteger');
    expect(dueInputError({ ...lmp, cycle: 60 }, today)).toBe('cycleRange');
    expect(dueInputError({ ...lmp, date: { y: 2026, m: 11, d: 5 } }, today)).toBe('future');
    expect(dueInputError({ ...lmp, date: { y: 2025, m: 1, d: 1 } }, today)).toBe('tooOld');
    expect(dueInputError(lmp, today)).toBeNull();
  });
});

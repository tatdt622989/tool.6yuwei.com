import { addDays, daysInMonth, toDayNumber, weekdayOf, type YMD } from '../date-diff/logic';

/**
 * Calendar-method assumptions:
 * - The luteal phase is ~14 days, so ovulation ≈ next period start − 14 days.
 * - Sperm survive up to ~5 days and the egg ~1 day, so the fertile window is ovulation − 5 to ovulation + 1.
 */
export const OVULATION_RULES = {
  lutealDays: 14,
  fertileBefore: 5,
  fertileAfter: 1,
  cycleRange: { min: 21, max: 45 },
  periodRange: { min: 2, max: 10 },
} as const;

export interface CycleInput {
  /** First day of the most recent period. */
  lastStart: YMD;
  cycle: number;
  period: number;
  /** How many cycles to predict. */
  count: number;
}

export interface Cycle {
  periodStart: YMD;
  periodEnd: YMD;
  fertileStart: YMD;
  ovulation: YMD;
  fertileEnd: YMD;
  /** Start of the following period (exclusive end of this cycle). */
  nextStart: YMD;
}

export type DayKind = 'period' | 'ovulation' | 'fertile' | 'other';

export type CycleInputError = 'cycle' | 'period' | 'future';

/** Locale-neutral validation: an error code, or null when the input is usable. */
export function cycleInputError(input: CycleInput, today: YMD): CycleInputError | null {
  const { cycle, period } = input;
  const { cycleRange, periodRange } = OVULATION_RULES;
  if (!Number.isInteger(cycle) || cycle < cycleRange.min || cycle > cycleRange.max) return 'cycle';
  if (!Number.isInteger(period) || period < periodRange.min || period > periodRange.max) return 'period';
  if (toDayNumber(input.lastStart) > toDayNumber(today)) return 'future';
  return null;
}

/** zh-TW messages for cycleInputError(); localized UIs map the codes through their own dictionary. */
export const CYCLE_ERROR_ZH: Record<CycleInputError, string> = {
  cycle: `月經週期請輸入 ${OVULATION_RULES.cycleRange.min} 到 ${OVULATION_RULES.cycleRange.max} 的整數天數。`,
  period: `經期天數請輸入 ${OVULATION_RULES.periodRange.min} 到 ${OVULATION_RULES.periodRange.max} 的整數。`,
  future: '最後一次月經日期不能晚於今天。',
};

export function validateCycleInput(input: CycleInput, today: YMD): string | null {
  const code = cycleInputError(input, today);
  return code ? CYCLE_ERROR_ZH[code] : null;
}

export function cycleAt(start: YMD, cycle: number, period: number): Cycle {
  const { lutealDays, fertileBefore, fertileAfter } = OVULATION_RULES;
  const nextStart = addDays(start, cycle);
  const ovulation = addDays(nextStart, -lutealDays);
  return {
    periodStart: start,
    periodEnd: addDays(start, period - 1),
    fertileStart: addDays(ovulation, -fertileBefore),
    ovulation,
    fertileEnd: addDays(ovulation, fertileAfter),
    nextStart,
  };
}

/**
 * Predicts `count` cycles beginning with the one that contains `today`
 * (projecting forward when the entered period is several cycles old).
 */
export function predictCycles(input: CycleInput, today: YMD): Cycle[] {
  if (cycleInputError(input, today)) return [];
  const elapsed = toDayNumber(today) - toDayNumber(input.lastStart);
  const skip = Math.max(0, Math.floor(elapsed / input.cycle));
  const count = Math.max(1, Math.min(12, Math.trunc(input.count)));
  return Array.from({ length: count }, (_, i) => cycleAt(addDays(input.lastStart, (skip + i) * input.cycle), input.cycle, input.period));
}

const between = (n: number, a: YMD, b: YMD) => n >= toDayNumber(a) && n <= toDayNumber(b);

/** Classifies a date; period wins over fertile days when a very short cycle makes them overlap. */
export function dayKind(date: YMD, cycles: Cycle[]): DayKind | null {
  const n = toDayNumber(date);
  for (const c of cycles) {
    if (n < toDayNumber(c.periodStart) || n >= toDayNumber(c.nextStart)) continue;
    if (between(n, c.periodStart, c.periodEnd)) return 'period';
    if (n === toDayNumber(c.ovulation)) return 'ovulation';
    if (between(n, c.fertileStart, c.fertileEnd)) return 'fertile';
    return 'other';
  }
  return null;
}

/** Sunday-first weeks for a month; days outside the month are null. */
export function monthGrid(y: number, m: number): (YMD | null)[][] {
  const first = weekdayOf({ y, m, d: 1 });
  const total = daysInMonth(y, m);
  const cells: (YMD | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= total; d++) cells.push({ y, m, d });
  while (cells.length % 7) cells.push(null);
  const weeks: (YMD | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Months (y, m) touched by the predicted cycles, in order. */
export function monthsCovered(cycles: Cycle[]): { y: number; m: number }[] {
  if (!cycles.length) return [];
  const start = cycles[0].periodStart;
  const end = addDays(cycles[cycles.length - 1].nextStart, -1);
  const out: { y: number; m: number }[] = [];
  let y = start.y;
  let m = start.m;
  while (y < end.y || (y === end.y && m <= end.m)) {
    out.push({ y, m });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export interface TodayStatus {
  kind: DayKind | null;
  /** Day number within the current cycle (1 = first day of period). */
  cycleDay: number;
  daysToOvulation: number;
  daysToNextPeriod: number;
}

export function todayStatus(cycles: Cycle[], today: YMD): TodayStatus | null {
  const c = cycles[0];
  if (!c) return null;
  const t = toDayNumber(today);
  return {
    kind: dayKind(today, cycles),
    cycleDay: t - toDayNumber(c.periodStart) + 1,
    daysToOvulation: toDayNumber(c.ovulation) - t,
    daysToNextPeriod: toDayNumber(c.nextStart) - t,
  };
}

import { addDays, toDayNumber, type YMD } from '../date-diff/logic';

export type DueMethod = 'lmp' | 'conception' | 'ivf3' | 'ivf5';

/**
 * Pregnancy dating constants.
 * - Naegele's rule: due date = first day of last menstrual period (LMP) + 280 days, assuming a 28-day cycle;
 *   for other cycle lengths ovulation shifts by (cycle − 28) days.
 * - Conception / ovulation date + 266 days.
 * - IVF: day-3 embryo transfer + 263 days, day-5 blastocyst transfer + 261 days.
 */
export const DATING = {
  pregnancyDays: 280,
  standardCycle: 28,
  /** Days from the LMP-equivalent start (gestational day 0) to the reference event. */
  offsetFromLmp: { conception: 14, ivf3: 17, ivf5: 19 } as Record<Exclude<DueMethod, 'lmp'>, number>,
  cycleRange: { min: 21, max: 45 },
} as const;

/**
 * 國民健康署 公費孕婦產前檢查與相關服務時程。
 * - 14 次產前檢查：懷孕初期第 8、12 週；中期第 16、20、24、28 週（每月 1 次）；
 *   後期第 30、32、34、36 週（每 2 週 1 次），第 37 週起每週 1 次（37、38、39、40 週）。
 *   Source: 衛福部 https://mohw.gov.tw/cp-16-80145-1.html（國健署，113-10-04）；
 *   10 次擴增為 14 次自 110-07-01 起 https://mohw.gov.tw/cp-16-61688-1.html
 * - 3 次一般超音波：8–16 週、約第 20 週、32 週以後。
 * - 貧血檢驗與妊娠糖尿病篩檢：24–28 週。乙型鏈球菌篩檢：35–37 週。
 * - 孕期分期依國健署給付時程：第一孕期未滿 13 週、第二孕期 13 週至未滿 29 週、第三孕期 29 週以上。
 * Verified 2026-10-29（115 年度標準；115 年未調整產檢次數）。
 */
export const HPA_PRENATAL = {
  visitWeeks: [8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40],
  trimesterStarts: { second: 13, third: 29 },
  windows: [
    { label: '第 1 次公費超音波', from: 8, to: 16 },
    { label: '第 2 次公費超音波（約第 20 週）', from: 20, to: 20 },
    { label: '貧血檢驗、妊娠糖尿病篩檢', from: 24, to: 28 },
    { label: '第 3 次公費超音波（32 週以後）', from: 32, to: 32 },
    { label: '乙型鏈球菌篩檢', from: 35, to: 37 },
  ],
} as const;

export interface DueInput {
  method: DueMethod;
  /** LMP start date, conception date, or embryo transfer date depending on method. */
  date: YMD;
  /** Cycle length in days, used only for the LMP method. */
  cycle: number;
}

export function validateDueInput(input: DueInput, today: YMD): string | null {
  const { method, cycle } = input;
  if (method === 'lmp') {
    if (!Number.isFinite(cycle) || !Number.isInteger(cycle)) return '請輸入整數的月經週期天數，例如 28。';
    if (cycle < DATING.cycleRange.min || cycle > DATING.cycleRange.max)
      return `月經週期請輸入 ${DATING.cycleRange.min} 到 ${DATING.cycleRange.max} 天；週期極不規則時建議以超音波推算。`;
  }
  const start = gestationStart(input);
  const days = toDayNumber(today) - toDayNumber(start);
  if (toDayNumber(input.date) > toDayNumber(today)) return '日期不能晚於今天。';
  if (days > 44 * 7) return '這個日期距今已超過 44 週，請確認年份是否正確。';
  return null;
}

/** Gestational day 0: the LMP-equivalent date from which 懷孕週數 is counted. */
export function gestationStart({ method, date, cycle }: DueInput): YMD {
  if (method === 'lmp') return addDays(date, cycle - DATING.standardCycle);
  return addDays(date, -DATING.offsetFromLmp[method]);
}

export function dueDate(input: DueInput): YMD {
  return addDays(gestationStart(input), DATING.pregnancyDays);
}

export interface GestationalAge {
  totalDays: number;
  weeks: number;
  days: number;
}

export function gestationalAge(start: YMD, on: YMD): GestationalAge {
  const totalDays = toDayNumber(on) - toDayNumber(start);
  const weeks = Math.floor(totalDays / 7);
  return { totalDays, weeks, days: totalDays - weeks * 7 };
}

/** 1, 2 or 3 per the 國健署 schedule; 0 before day 0. */
export function trimesterOf(weeks: number): 0 | 1 | 2 | 3 {
  if (weeks < 0) return 0;
  if (weeks < HPA_PRENATAL.trimesterStarts.second) return 1;
  if (weeks < HPA_PRENATAL.trimesterStarts.third) return 2;
  return 3;
}

export const TRIMESTER_LABEL = ['尚未懷孕', '第一孕期', '第二孕期', '第三孕期'] as const;

export type MilestoneStatus = 'done' | 'current' | 'upcoming';

export interface Milestone {
  label: string;
  /** Start of the week (or window) in gestational weeks. */
  week: number;
  toWeek: number;
  from: YMD;
  /** Last day of the window (inclusive). */
  to: YMD;
  status: MilestoneStatus;
}

function status(from: YMD, to: YMD, today: YMD): MilestoneStatus {
  const t = toDayNumber(today);
  if (t > toDayNumber(to)) return 'done';
  if (t >= toDayNumber(from)) return 'current';
  return 'upcoming';
}

/** Prenatal visits (each spans its gestational week) and screening windows, sorted by date. */
export function milestones(start: YMD, today: YMD): Milestone[] {
  const list: Milestone[] = [];
  HPA_PRENATAL.visitWeeks.forEach((week, i) => {
    const from = addDays(start, week * 7);
    const to = addDays(from, 6);
    list.push({ label: `第 ${i + 1} 次產檢`, week, toWeek: week, from, to, status: status(from, to, today) });
  });
  for (const w of HPA_PRENATAL.windows) {
    const from = addDays(start, w.from * 7);
    const to = addDays(start, w.to * 7 + 6);
    list.push({ label: w.label, week: w.from, toWeek: w.to, from, to, status: status(from, to, today) });
  }
  return list.sort((a, b) => toDayNumber(a.from) - toDayNumber(b.from) || a.toWeek - b.toWeek);
}

export interface DueResult {
  start: YMD;
  due: YMD;
  age: GestationalAge;
  trimester: 0 | 1 | 2 | 3;
  daysToDue: number;
  /** 0–100 progress through 40 weeks. */
  progress: number;
  /** Approximate conception (ovulation) date. */
  conception: YMD;
  milestones: Milestone[];
}

export function calcDue(input: DueInput, today: YMD): DueResult | null {
  if (validateDueInput(input, today)) return null;
  const start = gestationStart(input);
  const due = addDays(start, DATING.pregnancyDays);
  const age = gestationalAge(start, today);
  return {
    start,
    due,
    age,
    trimester: trimesterOf(age.weeks),
    daysToDue: toDayNumber(due) - toDayNumber(today),
    progress: Math.min(100, Math.max(0, (age.totalDays / DATING.pregnancyDays) * 100)),
    conception: addDays(start, DATING.offsetFromLmp.conception),
    milestones: milestones(start, today),
  };
}

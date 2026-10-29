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

export type DueInputError = 'cycleInteger' | 'cycleRange' | 'future' | 'tooOld';

/** zh-TW messages for dueInputError(); localized UIs map the codes through their own dictionary. */
export const DUE_ERROR_ZH: Record<DueInputError, string> = {
  cycleInteger: '請輸入整數的月經週期天數，例如 28。',
  cycleRange: `月經週期請輸入 ${DATING.cycleRange.min} 到 ${DATING.cycleRange.max} 天；週期極不規則時建議以超音波推算。`,
  future: '日期不能晚於今天。',
  tooOld: '這個日期距今已超過 44 週，請確認年份是否正確。',
};

/** Locale-neutral validation: an error code, or null when the input is usable. */
export function dueInputError(input: DueInput, today: YMD): DueInputError | null {
  const { method, cycle } = input;
  if (method === 'lmp') {
    if (!Number.isFinite(cycle) || !Number.isInteger(cycle)) return 'cycleInteger';
    if (cycle < DATING.cycleRange.min || cycle > DATING.cycleRange.max) return 'cycleRange';
  }
  const start = gestationStart(input);
  const days = toDayNumber(today) - toDayNumber(start);
  if (toDayNumber(input.date) > toDayNumber(today)) return 'future';
  if (days > 44 * 7) return 'tooOld';
  return null;
}

export function validateDueInput(input: DueInput, today: YMD): string | null {
  const code = dueInputError(input, today);
  return code ? DUE_ERROR_ZH[code] : null;
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

/** 1, 2 or 3 per the schedule's cut-offs (default 國健署); 0 before day 0. */
export function trimesterOf(weeks: number, schedule: ScheduleId = 'tw'): 0 | 1 | 2 | 3 {
  const starts = SCHEDULES[schedule].trimesterStarts;
  if (weeks < 0) return 0;
  if (weeks < starts.second) return 1;
  if (weeks < starts.third) return 2;
  return 3;
}

/**
 * 妊娠月数 as counted in Japan: 4-week blocks, 0–3週 = 1ヶ月 … 36–39週 = 10ヶ月.
 * 40週 and later is still described as 10ヶ月（臨月）. Returns 0 before day 0.
 */
export function pregnancyMonthJp(weeks: number): number {
  if (weeks < 0) return 0;
  return Math.min(10, Math.floor(weeks / 4) + 1);
}

export const TRIMESTER_LABEL = ['尚未懷孕', '第一孕期', '第二孕期', '第三孕期'] as const;

/**
 * Market-specific prenatal schedules. Labels for 'us' and 'jp' items come from the tool's i18n dictionary
 * (keyed by `id`); the zh-TW `label` stays here for backward compatibility.
 *
 * us — ACOG trimesters (1st to 13w6d, 2nd 14w0d–27w6d, 3rd 28w0d+) and commonly recommended timing:
 *   NIPT from 10 wk, NT scan 11–13w6d, anatomy scan 18–22 wk, glucose screen 24–28 wk, Tdap 27–36 wk (CDC),
 *   RSV vaccine 32–36 wk in Sept–Jan (CDC), GBS culture 36w0d–37w6d (ACOG 2020), term definitions (ACOG 2013).
 * jp — 妊娠初期 〜15週, 中期 16〜27週, 後期 28週〜 (日本産科婦人科学会). 厚生労働省「標準的な妊婦健診」14 回：
 *   〜23週は 4 週に 1 回、24〜35週は 2 週に 1 回、36週〜は毎週。血算・血糖 24〜35週、HTLV-1 抗体 30週頃まで、
 *   GBS 33〜37週。産前休業は予定日を含む 42 日前＝34週1日から（労働基準法 65 条、単胎）。正期産 37週0日〜41週6日。
 */
export type ScheduleId = 'tw' | 'us' | 'jp';

export interface ScheduleWindow {
  id: string;
  /** zh-TW label (tw schedule only). */
  label?: string;
  from: number;
  to: number;
  /** A single moment (e.g. "third trimester begins"), shown as one date rather than a week range. */
  point?: boolean;
  /** Extra days after `from` weeks (e.g. 34w1d). */
  day?: number;
}

export interface Schedule {
  trimesterStarts: { second: number; third: number };
  visitWeeks: readonly number[];
  windows: readonly ScheduleWindow[];
}

export const SCHEDULES: Record<ScheduleId, Schedule> = {
  tw: {
    trimesterStarts: HPA_PRENATAL.trimesterStarts,
    visitWeeks: HPA_PRENATAL.visitWeeks,
    windows: [
      { id: 'us1', ...HPA_PRENATAL.windows[0] },
      { id: 'us2', ...HPA_PRENATAL.windows[1] },
      { id: 'gdm', ...HPA_PRENATAL.windows[2] },
      { id: 'us3', ...HPA_PRENATAL.windows[3] },
      { id: 'gbs', ...HPA_PRENATAL.windows[4] },
    ],
  },
  us: {
    trimesterStarts: { second: 14, third: 28 },
    visitWeeks: [],
    windows: [
      { id: 'firstVisit', from: 8, to: 10 },
      { id: 'nipt', from: 10, to: 13 },
      { id: 'nt', from: 11, to: 13 },
      { id: 'second', from: 14, to: 14, point: true },
      { id: 'anatomy', from: 18, to: 22 },
      { id: 'glucose', from: 24, to: 28 },
      { id: 'tdap', from: 27, to: 36 },
      { id: 'third', from: 28, to: 28, point: true },
      { id: 'rsv', from: 32, to: 36 },
      { id: 'gbs', from: 36, to: 37 },
      { id: 'earlyTerm', from: 37, to: 37, point: true },
      { id: 'fullTerm', from: 39, to: 39, point: true },
      { id: 'due', from: 40, to: 40, point: true },
      { id: 'lateTerm', from: 41, to: 41, point: true },
      { id: 'postTerm', from: 42, to: 42, point: true },
    ],
  },
  jp: {
    trimesterStarts: { second: 16, third: 28 },
    visitWeeks: [8, 12, 16, 20, 24, 26, 28, 30, 32, 34, 36, 37, 38, 39],
    windows: [
      { id: 'boshi', from: 8, to: 11 },
      { id: 'early', from: 8, to: 12 },
      { id: 'second', from: 16, to: 16, point: true },
      { id: 'blood', from: 24, to: 35 },
      { id: 'htlv', from: 24, to: 30 },
      { id: 'third', from: 28, to: 28, point: true },
      { id: 'gbs', from: 33, to: 37 },
      { id: 'leave', from: 34, to: 34, point: true, day: 1 },
      { id: 'term', from: 37, to: 37, point: true },
      { id: 'due', from: 40, to: 40, point: true },
      { id: 'postTerm', from: 42, to: 42, point: true },
    ],
  },
};

export type MilestoneStatus = 'done' | 'current' | 'upcoming';

export interface Milestone {
  /** zh-TW label (tw schedule); for other schedules the window id. */
  label: string;
  kind: 'visit' | 'window';
  /** Window id, or 'visit'. */
  id: string;
  /** 1-based visit number (visits only). */
  n?: number;
  point?: boolean;
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
export function milestones(start: YMD, today: YMD, schedule: ScheduleId = 'tw'): Milestone[] {
  const list: Milestone[] = [];
  const plan = SCHEDULES[schedule];
  plan.visitWeeks.forEach((week, i) => {
    const from = addDays(start, week * 7);
    const to = addDays(from, 6);
    const label = `第 ${i + 1} 次產檢`;
    list.push({ label, kind: 'visit', id: 'visit', n: i + 1, week, toWeek: week, from, to, status: status(from, to, today) });
  });
  for (const w of plan.windows) {
    const from = addDays(start, w.from * 7 + (w.day ?? 0));
    const to = w.point ? from : addDays(start, w.to * 7 + 6);
    list.push({
      label: w.label ?? w.id,
      kind: 'window',
      id: w.id,
      ...(w.point ? { point: true } : {}),
      week: w.from,
      toWeek: w.to,
      from,
      to,
      status: status(from, to, today),
    });
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

export function calcDue(input: DueInput, today: YMD, schedule: ScheduleId = 'tw'): DueResult | null {
  if (dueInputError(input, today)) return null;
  const start = gestationStart(input);
  const due = addDays(start, DATING.pregnancyDays);
  const age = gestationalAge(start, today);
  return {
    start,
    due,
    age,
    trimester: trimesterOf(age.weeks, schedule),
    daysToDue: toDayNumber(due) - toDayNumber(today),
    progress: Math.min(100, Math.max(0, (age.totalDays / DATING.pregnancyDays) * 100)),
    conception: addDays(start, DATING.offsetFromLmp.conception),
    milestones: milestones(start, today, schedule),
  };
}

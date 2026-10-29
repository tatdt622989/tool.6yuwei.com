// Calendar arithmetic on plain {y, m, d} values. All math goes through UTC day
// numbers, so local time zones and daylight saving never shift a result.

export interface YMD {
  y: number;
  /** Month 1–12. */
  m: number;
  d: number;
}

const DAY_MS = 86_400_000;

export const WEEKDAY_LABEL = ['日', '一', '二', '三', '四', '五', '六'] as const;

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
}

export function isValidYMD(date: YMD): boolean {
  const { y, m, d } = date;
  return (
    Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m)
  );
}

/** Parses "YYYY-MM-DD" (the value of <input type="date">). Returns null when invalid. */
export function parseISODate(value: string): YMD | null {
  const match = /^(\d{4,6})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const date = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  return isValidYMD(date) ? date : null;
}

export function toISODate(date: YMD): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(date.y, 4)}-${pad(date.m)}-${pad(date.d)}`;
}

/** Days since 1970-01-01. */
export function toDayNumber(date: YMD): number {
  const t = new Date(0);
  t.setUTCFullYear(date.y, date.m - 1, date.d);
  return Math.round(t.getTime() / DAY_MS);
}

export function fromDayNumber(n: number): YMD {
  const t = new Date(n * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function compareYMD(a: YMD, b: YMD): number {
  return toDayNumber(a) - toDayNumber(b);
}

/** Signed number of days from a to b (b − a). */
export function diffDays(a: YMD, b: YMD): number {
  return toDayNumber(b) - toDayNumber(a);
}

export function addDays(date: YMD, n: number): YMD {
  return fromDayNumber(toDayNumber(date) + Math.trunc(n));
}

/** Adds whole months; a day that does not exist in the target month is clamped to its last day (1/31 + 1 個月 = 2/28). */
export function addMonths(date: YMD, n: number): YMD {
  const index = date.y * 12 + (date.m - 1) + Math.trunc(n);
  const y = Math.floor(index / 12);
  const m = index - y * 12 + 1;
  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) };
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: YMD): number {
  return (((toDayNumber(date) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}

export interface YMDSpan {
  years: number;
  months: number;
  days: number;
}

/**
 * Calendar difference from a to b (expects a <= b; swaps otherwise).
 * Whole months are counted first; a month is complete when the same day number is reached,
 * so 1/31 → 2/28 is 0 個月 28 天 and 1/15 → 3/14 is 1 個月 27 天.
 */
export function diffYMD(a: YMD, b: YMD): YMDSpan {
  if (compareYMD(a, b) > 0) [a, b] = [b, a];
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) months--;
  const anchor = addMonths(a, months);
  return { years: Math.floor(months / 12), months: months % 12, days: diffDays(anchor, b) };
}

/**
 * Counts Monday–Friday days from a up to b. The start day is always counted;
 * the end day only when includeEnd is true. Public holidays are not considered.
 */
export function countWeekdays(a: YMD, b: YMD, includeEnd: boolean): number {
  if (compareYMD(a, b) > 0) [a, b] = [b, a];
  const total = diffDays(a, b) + (includeEnd ? 1 : 0);
  let count = Math.floor(total / 7) * 5;
  const start = weekdayOf(a);
  for (let i = 0; i < total % 7; i++) {
    const wd = (start + i) % 7;
    if (wd !== 0 && wd !== 6) count++;
  }
  return count;
}

export interface DateDiffResult {
  /** Absolute day count, +1 when the end day is included. */
  days: number;
  /** True when the end date is before the start date. */
  reversed: boolean;
  span: YMDSpan;
  weeks: number;
  weekRemainder: number;
  workdays: number;
}

export function dateDiff(start: YMD, end: YMD, includeEnd = false): DateDiffResult {
  const signed = diffDays(start, end);
  const reversed = signed < 0;
  const [a, b] = reversed ? [end, start] : [start, end];
  const days = Math.abs(signed) + (includeEnd ? 1 : 0);
  const span = diffYMD(a, includeEnd ? addDays(b, 1) : b);
  return {
    days,
    reversed,
    span,
    weeks: Math.floor(days / 7),
    weekRemainder: days % 7,
    workdays: countWeekdays(a, b, includeEnd),
  };
}

export function formatSpan(span: YMDSpan): string {
  const parts: string[] = [];
  if (span.years) parts.push(`${span.years} 年`);
  if (span.months) parts.push(`${span.months} 個月`);
  if (span.days || parts.length === 0) parts.push(`${span.days} 天`);
  return parts.join(' ');
}

/** e.g. 2026 年 10 月 29 日（四） */
export function formatYMD(date: YMD): string {
  return `${date.y} 年 ${date.m} 月 ${date.d} 日（${WEEKDAY_LABEL[weekdayOf(date)]}）`;
}

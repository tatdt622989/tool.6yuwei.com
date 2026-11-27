// Weekly time card calculator. Pure functions; times are minutes after midnight, durations in minutes.
//
// Overtime rules:
// - Federal (FLSA): non-exempt employees get at least 1.5× the regular rate for hours worked over 40 in a
//   workweek; no daily overtime. 29 U.S.C. § 207(a); U.S. Department of Labor, "Overtime Pay"
//   (https://www.dol.gov/agencies/whd/overtime).
// - California: 1.5× for hours over 8 in a workday and for the first 8 hours on the 7th consecutive day of work
//   in a workweek; 2× for hours over 12 in a workday and over 8 on that 7th day; plus 1.5× over 40 in the week.
//   Cal. Labor Code § 510; California DIR, "Overtime" FAQ (https://www.dir.ca.gov/dlse/faq_overtime.htm).
//   Daily overtime hours are not counted again toward the weekly 40 (DLSE Enforcement Manual § 48.1.4).
// - Rounding punches to the nearest 5 minutes, tenth or quarter hour is allowed under 29 C.F.R. § 785.48(b)
//   if it averages out over time (e.g. the "7-minute rule" for quarter hours).

export const DAY_MINUTES = 1440;
export const WEEKLY_OT_MINUTES = 40 * 60;

export type ClockFormat = '12h' | '24h';

export interface ParsedTime {
  /** 0–1439. */
  minutes: number;
  /** True when AM/PM was typed, or the hour (13–23, 0) can only be 24-hour. */
  explicit: boolean;
}

/**
 * Parse a typed clock time: "9", "9:30", "930", "0930", "9:30am", "9.30 PM", "9a", "17:45", "12:15 a.m.".
 * Returns null when the text isn't a valid time.
 */
export function parseTime(input: string): ParsedTime | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, '').replace(/\./g, ':');
  const m = /^(\d{1,2})(?::?(\d{2}))?(?::(\d{2}))?(a|am|a:m:|p|pm|p:m:)?$/.exec(s);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  if (minute > 59 || (m[3] !== undefined && Number(m[3]) > 59)) return null;
  const meridiem = m[4]?.[0] as 'a' | 'p' | undefined;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === 'a') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
    return { minutes: hour * 60 + minute, explicit: true };
  }
  if (hour === 24 && minute === 0) return { minutes: 0, explicit: true };
  if (hour > 23) return null;
  return { minutes: hour * 60 + minute, explicit: hour === 0 || hour > 12 };
}

const p2 = (n: number) => String(n).padStart(2, '0');

/** 1050 → "5:30 PM" or "17:30". */
export function formatTime(minutes: number, format: ClockFormat): string {
  const m = ((Math.round(minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (format === '24h') return `${p2(h)}:${p2(min)}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${p2(min)} ${h < 12 ? 'AM' : 'PM'}`;
}

/**
 * Resolve an "out" time against the "in" time. In 12-hour mode, a time typed without AM/PM (e.g. "5" after an
 * 8:00 AM start) is read as whichever of AM/PM gives the shorter shift. A shift ending at or before it started
 * runs past midnight. Returns the shift length in minutes (0–1439) and the resolved out time.
 */
export function shiftLength(start: ParsedTime, end: ParsedTime, format: ClockFormat): { minutes: number; end: number } {
  const candidates =
    format === '12h' && !end.explicit && end.minutes < 13 * 60 ? [end.minutes, (end.minutes + 720) % DAY_MINUTES] : [end.minutes];
  let best = { minutes: Infinity, end: end.minutes };
  for (const c of candidates) {
    const d = (c - start.minutes + DAY_MINUTES) % DAY_MINUTES;
    if (d < best.minutes) best = { minutes: d, end: c };
  }
  return best;
}

export type RoundingStep = 0 | 5 | 6 | 15;

/** Round a punch to the nearest step (ties round up, so 7 min → 0 and 8 min → 15 for quarter hours). */
export function roundPunch(minutes: number, step: RoundingStep): number {
  if (!step) return minutes;
  return Math.round(minutes / step) * step;
}

/** "30", "0:30", "1:15", "0.5h" → minutes; empty → 0; null when invalid. */
export function parseBreak(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (s === '') return 0;
  let m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (m) return Number(m[2]) > 59 ? null : Number(m[1]) * 60 + Number(m[2]);
  m = /^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?)$/.exec(s);
  if (m) return Math.round(Number(m[1]) * 60);
  m = /^(\d+)\s*(m|min|mins|minutes?)?$/.exec(s);
  if (m) return Number(m[1]);
  return null;
}

export interface DayEntry {
  start: string;
  end: string;
  /** Unpaid break, as typed. */
  breakText: string;
}

export type DayError = 'start' | 'end' | 'missing' | 'break' | 'break-too-long';

export interface DayResult {
  /** Paid minutes worked (after break). 0 for an empty day. */
  minutes: number;
  error: DayError | null;
  /** Normalized display values for the inputs. */
  start?: string;
  end?: string;
  overnight: boolean;
}

export function computeDay(entry: DayEntry, format: ClockFormat, rounding: RoundingStep = 0): DayResult {
  const startText = entry.start.trim();
  const endText = entry.end.trim();
  const brk = parseBreak(entry.breakText);
  if (!startText && !endText) return { minutes: 0, error: brk === null ? 'break' : null, overnight: false };
  const start = startText ? parseTime(startText) : null;
  const end = endText ? parseTime(endText) : null;
  if (startText && !start) return { minutes: 0, error: 'start', overnight: false };
  if (endText && !end) return { minutes: 0, error: 'end', overnight: false };
  if (!start || !end) return { minutes: 0, error: 'missing', overnight: false };
  if (brk === null) return { minutes: 0, error: 'break', overnight: false };
  const resolved = shiftLength(start, end, format);
  const inR = roundPunch(start.minutes, rounding);
  const outR = roundPunch(start.minutes + resolved.minutes, rounding);
  const gross = outR - inR;
  const result = {
    start: formatTime(start.minutes, format),
    end: formatTime(resolved.end, format),
    overnight: start.minutes + resolved.minutes >= DAY_MINUTES,
  };
  if (brk > gross) return { minutes: 0, error: 'break-too-long', ...result };
  return { minutes: gross - brk, error: null, ...result };
}

export type OvertimeRule = 'federal' | 'california' | 'none';

export interface OvertimeSplit {
  regular: number;
  /** Minutes at 1.5×. */
  overtime: number;
  /** Minutes at 2×. */
  doubleTime: number;
}

/**
 * Split a week's daily minutes (in workweek order) into regular, overtime and double time.
 * California's 7th-day rule applies when all seven days have hours.
 */
export function splitOvertime(days: readonly number[], rule: OvertimeRule): OvertimeSplit {
  const total = days.reduce((a, b) => a + b, 0);
  if (rule === 'none') return { regular: total, overtime: 0, doubleTime: 0 };
  if (rule === 'federal') {
    const regular = Math.min(total, WEEKLY_OT_MINUTES);
    return { regular, overtime: total - regular, doubleTime: 0 };
  }
  const seventh = days.length === 7 && days.every((d) => d > 0);
  let regular = 0;
  let overtime = 0;
  let doubleTime = 0;
  days.forEach((d, i) => {
    if (seventh && i === 6) {
      overtime += Math.min(d, 480);
      doubleTime += Math.max(0, d - 480);
      return;
    }
    // Regular hours beyond the weekly 40 become overtime; daily overtime isn't counted toward the 40.
    const dayRegular = Math.min(d, 480);
    const room = Math.max(0, WEEKLY_OT_MINUTES - regular);
    regular += Math.min(dayRegular, room);
    overtime += Math.max(0, dayRegular - room) + Math.min(Math.max(0, d - 480), 240);
    doubleTime += Math.max(0, d - 720);
  });
  return { regular, overtime, doubleTime };
}

export interface Pay {
  regularCents: number;
  overtimeCents: number;
  doubleTimeCents: number;
  totalCents: number;
}

/** Gross pay in cents from an hourly rate in cents. Each part is rounded to the cent. */
export function grossPay(split: OvertimeSplit, rateCents: number, otMultiplier = 1.5): Pay | null {
  if (!Number.isFinite(rateCents) || rateCents < 0) return null;
  const regularCents = Math.round((split.regular * rateCents) / 60);
  const overtimeCents = Math.round((split.overtime * rateCents * otMultiplier) / 60);
  const doubleTimeCents = Math.round((split.doubleTime * rateCents * 2) / 60);
  return { regularCents, overtimeCents, doubleTimeCents, totalCents: regularCents + overtimeCents + doubleTimeCents };
}

/** 2475 → "41:15". */
export function formatHM(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)}:${p2(m % 60)}`;
}

/** 2475 → "41.25" (two decimals, as payroll systems expect). */
export function formatDecimalHours(minutes: number): string {
  return (Math.round((minutes / 60) * 100) / 100).toFixed(2);
}

export function formatUsd(cents: number): string {
  if (!Number.isFinite(cents)) return '—';
  const abs = Math.abs(Math.round(cents));
  return `${cents < 0 ? '-' : ''}$${Math.floor(abs / 100).toLocaleString('en-US')}.${p2(abs % 100)}`;
}

/** Days of the week in workweek order. */
export function weekDays(startsOn: 'sun' | 'mon'): string[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return startsOn === 'sun' ? days : [...days.slice(1), days[0]];
}

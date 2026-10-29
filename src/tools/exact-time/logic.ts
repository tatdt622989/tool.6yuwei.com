// Exact time: English formatting and time zone helpers. Pure functions; every "now" is passed in.
//
// Clock sync itself is shared with the zh-TW Taiwan time tool: ../taiwan-time/sync.ts measures the device clock
// offset from the HTTP Date header of our own server (whose clock is NTP-disciplined), and the math is
// unit-tested in ../taiwan-time/logic.test.ts. This file only turns the result into English.
// Time zone rules come from the browser's IANA tz database via Intl.DateTimeFormat (ECMA-402).
// ISO week numbering: ISO 8601 (week 1 contains the year's first Thursday).

import type { OffsetEstimate } from '../taiwan-time/logic';

export type { OffsetEstimate };

export interface WorldZone {
  id: string;
  city: string;
}

export const WORLD_ZONES: readonly WorldZone[] = [
  { id: 'UTC', city: 'UTC' },
  { id: 'America/New_York', city: 'New York' },
  { id: 'America/Chicago', city: 'Chicago' },
  { id: 'America/Denver', city: 'Denver' },
  { id: 'America/Phoenix', city: 'Phoenix' },
  { id: 'America/Los_Angeles', city: 'Los Angeles' },
  { id: 'America/Anchorage', city: 'Anchorage' },
  { id: 'Pacific/Honolulu', city: 'Honolulu' },
  { id: 'Europe/London', city: 'London' },
  { id: 'Europe/Paris', city: 'Paris' },
  { id: 'Asia/Kolkata', city: 'Mumbai' },
  { id: 'Asia/Tokyo', city: 'Tokyo' },
  { id: 'Australia/Sydney', city: 'Sydney' },
];

export interface ZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday. */
  weekday: number;
}

const partsCache = new Map<string, Intl.DateTimeFormat>();
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function partsFormat(timeZone: string): Intl.DateTimeFormat {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'short',
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    partsFormat(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock parts of an instant in an IANA time zone. */
export function zoneParts(epochMs: number, timeZone: string): ZoneParts {
  const out: Record<string, string> = {};
  for (const p of partsFormat(timeZone).formatToParts(new Date(Math.floor(epochMs)))) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: WEEKDAY_INDEX[out.weekday] ?? 0,
  };
}

/** Offset of the zone from UTC at that instant, in minutes (e.g. −240 for EDT, 330 for India). */
export function utcOffsetMinutes(epochMs: number, timeZone: string): number {
  const ms = Math.floor(epochMs / 1000) * 1000;
  const p = zoneParts(ms, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - ms) / 60_000);
}

/** −240 → "UTC−4", 330 → "UTC+5:30", 0 → "UTC±0". */
export function formatUtcOffset(minutes: number): string {
  if (minutes === 0) return 'UTC±0';
  const sign = minutes > 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

const p2 = (n: number) => String(n).padStart(2, '0');

/** 15:04:05 → "3:04:05 PM" (12-hour) or "15:04:05"; with ms → "3:04:05.123 PM". */
export function formatClock(hour: number, minute: number, second: number, ms: number, hour12: boolean, showMs = false): string {
  const frac = showMs ? `.${String(Math.floor(ms)).padStart(3, '0')}` : '';
  if (!hour12) return `${p2(hour)}:${p2(minute)}:${p2(second)}${frac}`;
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${p2(minute)}:${p2(second)}${frac} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** Short clock without seconds for the world list: "3:04 PM" / "15:04". */
export function formatShortClock(hour: number, minute: number, hour12: boolean): string {
  if (!hour12) return `${p2(hour)}:${p2(minute)}`;
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${p2(minute)} ${hour < 12 ? 'AM' : 'PM'}`;
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** "Thursday, October 29, 2026". */
export function formatLongDate(p: Pick<ZoneParts, 'year' | 'month' | 'day' | 'weekday'>): string {
  return `${WEEKDAYS[p.weekday]}, ${MONTHS[p.month - 1]} ${p.day}, ${p.year}`;
}

/** Day of the year, 1–366. */
export function dayOfYear(year: number, month: number, day: number): number {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000) + 1;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** ISO 8601 week number and week-numbering year. */
export function isoWeek(year: number, month: number, day: number): { week: number; year: number } {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dow = date.getUTCDay() || 7; // Monday = 1 … Sunday = 7
  date.setUTCDate(date.getUTCDate() + 4 - dow); // Thursday of this week
  const weekYear = date.getUTCFullYear();
  const week = Math.ceil(((date.getTime() - Date.UTC(weekYear, 0, 1)) / 86_400_000 + 1) / 7);
  return { week, year: weekYear };
}

/* ---------- Device offset in words ---------- */

export type OffsetDirection = 'fast' | 'slow' | 'exact';

/** |offset| in words: "0.32 seconds", "2 min 5 s", "3 h 4 min", "63 days 2 h". */
export function formatOffsetAmount(offsetMs: number): string {
  const abs = Math.abs(offsetMs);
  if (abs < 60_000) {
    const s = (abs / 1000).toFixed(2);
    return `${s} ${s === '1.00' ? 'second' : 'seconds'}`;
  }
  const total = Math.round(abs / 1000);
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d} ${d === 1 ? 'day' : 'days'} ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min ${s} s`;
}

/** 12.4 → "12 ms", 1530 → "1.5 s". */
export function formatAccuracy(ms: number): string {
  return ms < 1000 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export interface OffsetDescription {
  direction: OffsetDirection;
  /** Short form for a stat tile: "Exact", "0.32 s fast". */
  short: string;
  /** Sentence for the status line. */
  text: string;
}

/** offset = server − device (ms). Positive: the device is behind (slow). */
export function describeOffset(offset: number, accuracy: number): OffsetDescription {
  const threshold = Math.max(accuracy, 5);
  if (Math.abs(offset) <= threshold) {
    return {
      direction: 'exact',
      short: 'Exact',
      text: `Your clock is accurate to within ${formatAccuracy(threshold)}.`,
    };
  }
  const direction: OffsetDirection = offset > 0 ? 'slow' : 'fast';
  const amount = formatOffsetAmount(offset);
  const word = direction === 'slow' ? 'behind' : 'ahead';
  return {
    direction,
    short: `${amount.replace(' seconds', ' s').replace(' second', ' s')} ${direction}`,
    text: `Your device clock is ${amount} ${word} (${direction}).`,
  };
}

/* ---------- Countdown ---------- */

export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** "2026-12-31T23:59" or "2026-12-31T23:59:30" (datetime-local value) → parts; null if invalid. */
export function parseLocalDateTime(value: string): LocalDateTime | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(value.trim());
  if (!m) return null;
  const [year, month, day, hour, minute] = [1, 2, 3, 4, 5].map((i) => Number(m[i]));
  const second = m[6] === undefined ? 0 : Number(m[6]);
  if (month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 || second > 59) return null;
  const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > dim) return null;
  return { year, month, day, hour, minute, second };
}

/** Parts → datetime-local value, "2026-12-31T23:59:00". */
export function toDateTimeLocal(p: LocalDateTime): string {
  return `${String(p.year).padStart(4, '0')}-${p2(p.month)}-${p2(p.day)}T${p2(p.hour)}:${p2(p.minute)}:${p2(p.second)}`;
}

/**
 * Epoch ms of a wall-clock time in a time zone. Uses the zone's offset at the guessed instant and corrects once,
 * which is exact except inside a DST gap (where the later offset is used).
 */
export function zonedTimeToEpoch(p: LocalDateTime, timeZone: string): number {
  const naive = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  let guess = naive - utcOffsetMinutes(naive, timeZone) * 60_000;
  const corrected = naive - utcOffsetMinutes(guess, timeZone) * 60_000;
  if (corrected !== guess) guess = corrected;
  return guess;
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  tenths: number;
}

/** Remaining time, rounded up to the tenth so it reads 0 exactly at the target. */
export function splitDuration(ms: number): DurationParts {
  const tenthsTotal = Math.max(0, Math.ceil(ms / 100));
  const totalSeconds = Math.floor(tenthsTotal / 10);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    tenths: tenthsTotal % 10,
  };
}

/** "3 days 04:05:06.7", "1 day 00:00:01.0", "04:05:06.7". */
export function formatCountdown(ms: number, showTenths = true): string {
  const d = splitDuration(ms);
  const clock = `${p2(d.hours)}:${p2(d.minutes)}:${p2(d.seconds)}${showTenths ? `.${d.tenths}` : ''}`;
  return d.days > 0 ? `${d.days} ${d.days === 1 ? 'day' : 'days'} ${clock}` : clock;
}

/** Next local midnight / top of the hour / New Year, as wall-clock parts in the zone. */
export function presetTarget(kind: 'hour' | 'midnight' | 'newyear', nowMs: number, timeZone: string): LocalDateTime {
  const p = zoneParts(nowMs, timeZone);
  if (kind === 'newyear') return { year: p.year + 1, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
  if (kind === 'midnight') {
    const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
    return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate(), hour: 0, minute: 0, second: 0 };
  }
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour + 1));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    hour: next.getUTCHours(),
    minute: 0,
    second: 0,
  };
}

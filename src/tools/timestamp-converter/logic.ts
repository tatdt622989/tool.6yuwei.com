export type Unit = 's' | 'ms' | 'us' | 'ns';

export const UNIT_LABEL: Record<Unit, string> = {
  s: '秒（10 位數）',
  ms: '毫秒（13 位數）',
  us: '微秒（16 位數）',
  ns: '奈秒（19 位數）',
};

const UNIT_TO_MS: Record<Unit, number> = { s: 1000, ms: 1, us: 1e-3, ns: 1e-6 };

/** ECMAScript Date range: ±100,000,000 days from the epoch. */
const MAX_MS = 8.64e15;

/**
 * Guesses the unit from magnitude. Seconds stay below 1e11 until the year 5138, so anything
 * larger is treated as milliseconds, then microseconds and nanoseconds.
 */
export function detectUnit(value: number): Unit {
  const abs = Math.abs(value);
  if (abs < 1e11) return 's';
  if (abs < 1e14) return 'ms';
  if (abs < 1e17) return 'us';
  return 'ns';
}

export type TimestampResult = { ok: true; ms: number; unit: Unit } | { ok: false; error: string };

export function parseTimestamp(input: string, unit: Unit | 'auto' = 'auto'): TimestampResult {
  const clean = input.trim().replace(/[,_\s]/g, '');
  if (clean === '') return { ok: false, error: '請輸入時間戳' };
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return { ok: false, error: '時間戳只能包含數字，可帶負號或小數點。' };
  const value = Number(clean);
  const u = unit === 'auto' ? detectUnit(value) : unit;
  const ms = value * UNIT_TO_MS[u];
  if (Math.abs(ms) > MAX_MS) return { ok: false, error: '超出可表示的日期範圍（約西元前 271821 年到西元 275760 年）。' };
  return { ok: true, ms, unit: u };
}

interface WallTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const partFormatters = new Map<string, Intl.DateTimeFormat>();

function wallTime(ms: number, timeZone: string): WallTime {
  let fmt = partFormatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      era: 'short',
    });
    partFormatters.set(timeZone, fmt);
  }
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(ms))) parts[p.type] = p.value;
  const year = Number(parts.year);
  return {
    year: parts.era === 'BC' || parts.era === 'B' ? 1 - year : year,
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

const pad = (n: number, width = 2) => String(Math.abs(n)).padStart(width, '0');

function formatYear(year: number): string {
  if (year >= 0 && year <= 9999) return pad(year, 4);
  return `${year < 0 ? '-' : '+'}${pad(year, 6)}`;
}

/** Date.UTC that also handles years 0–99 (which Date.UTC maps to 1900–1999). */
function utcFromParts(w: WallTime, millisecond = 0): number {
  const d = new Date(Date.UTC(2000, w.month - 1, w.day, w.hour, w.minute, w.second, millisecond));
  d.setUTCFullYear(w.year);
  return d.getTime();
}

/** Offset of the zone from UTC at that instant, in minutes (e.g. 480 for UTC+8). */
export function offsetMinutes(ms: number, timeZone: string): number {
  const asUtc = utcFromParts(wallTime(ms, timeZone));
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** "2026-10-29 15:30:00" (plus ".123" when the instant has milliseconds) in the given zone. */
export function formatDateTime(ms: number, timeZone: string): string {
  const w = wallTime(ms, timeZone);
  const frac = ((ms % 1000) + 1000) % 1000;
  const millis = frac ? `.${pad(Math.floor(frac), 3)}` : '';
  return `${formatYear(w.year)}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}${millis}`;
}

/** ISO 8601 with the zone's offset, e.g. "2026-10-29T15:30:00+08:00". */
export function toIsoWithOffset(ms: number, timeZone: string): string {
  const offset = offsetMinutes(ms, timeZone);
  return `${formatDateTime(ms, timeZone).replace(' ', 'T')}${formatOffset(offset)}`;
}

export function weekday(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat('zh-TW', { timeZone, weekday: 'long' }).format(new Date(ms));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365.25 * 86400],
  ['month', 30.44 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

export function relativeTime(ms: number, nowMs: number): string {
  const diff = (ms - nowMs) / 1000;
  const rtf = new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= size || unit === 'second') return rtf.format(Math.round(diff / size), unit);
  }
  return '';
}

/** Parses "YYYY-MM-DDTHH:mm[:ss[.SSS]]" (the datetime-local format; a space also works). */
export function parseWallTime(value: string): (WallTime & { millisecond: number }) | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value.trim());
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map((v) => Number(v ?? 0));
  const millisecond = Number((m[7] ?? '0').padEnd(3, '0'));
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
  return { year, month, day, hour, minute, second, millisecond };
}

/**
 * Converts a wall-clock time in a time zone to epoch milliseconds. Uses the offsets a day
 * before and after as candidates: in a DST overlap the earlier instant wins, and a time
 * inside a DST gap is shifted forward (the same rule as Temporal's "compatible").
 */
export function wallTimeToMs(value: string, timeZone: string): number | null {
  const w = parseWallTime(value);
  if (!w) return null;
  const guess = utcFromParts(w, w.millisecond);
  const candidates = [-86400000, 86400000].map((d) => guess - offsetMinutes(guess + d, timeZone) * 60000);
  const target = utcFromParts(w);
  const valid = candidates.filter((c) => utcFromParts(wallTime(c, timeZone)) === target);
  return valid.length > 0 ? Math.min(...valid) : Math.max(...candidates);
}

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

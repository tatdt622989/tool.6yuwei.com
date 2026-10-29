// Time zone math built on Intl.DateTimeFormat, so DST rules come from the browser's tz database.

export interface WallTime {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface ZonedTime extends WallTime {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** Offset from UTC in minutes, e.g. 480 for UTC+8. */
  offset: number;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export const DEFAULT_ZONES = [
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
] as const;

/** Chinese city names for common zones (legacy aliases included, since some engines return them). */
export const ZONE_LABELS: Record<string, string> = {
  'Asia/Taipei': '台北',
  'Asia/Tokyo': '東京',
  'Asia/Seoul': '首爾',
  'Asia/Singapore': '新加坡',
  'Asia/Hong_Kong': '香港',
  'Asia/Macau': '澳門',
  'Asia/Shanghai': '北京／上海',
  'Asia/Manila': '馬尼拉',
  'Asia/Bangkok': '曼谷',
  'Asia/Ho_Chi_Minh': '胡志明市',
  'Asia/Saigon': '胡志明市',
  'Asia/Kuala_Lumpur': '吉隆坡',
  'Asia/Jakarta': '雅加達',
  'Asia/Kolkata': '印度（新德里）',
  'Asia/Calcutta': '印度（新德里）',
  'Asia/Dubai': '杜拜',
  'Asia/Jerusalem': '耶路撒冷',
  'Europe/London': '倫敦',
  'Europe/Dublin': '都柏林',
  'Europe/Paris': '巴黎',
  'Europe/Berlin': '柏林',
  'Europe/Amsterdam': '阿姆斯特丹',
  'Europe/Madrid': '馬德里',
  'Europe/Rome': '羅馬',
  'Europe/Zurich': '蘇黎世',
  'Europe/Istanbul': '伊斯坦堡',
  'Europe/Moscow': '莫斯科',
  'America/New_York': '紐約',
  'America/Toronto': '多倫多',
  'America/Chicago': '芝加哥',
  'America/Denver': '丹佛',
  'America/Phoenix': '鳳凰城',
  'America/Los_Angeles': '洛杉磯',
  'America/Vancouver': '溫哥華',
  'America/Anchorage': '安克拉治',
  'America/Mexico_City': '墨西哥城',
  'America/Sao_Paulo': '聖保羅',
  'Pacific/Honolulu': '檀香山',
  'Pacific/Auckland': '奧克蘭',
  'Australia/Sydney': '雪梨',
  'Australia/Melbourne': '墨爾本',
  'Australia/Brisbane': '布里斯本',
  'Australia/Perth': '伯斯',
  'Africa/Cairo': '開羅',
  'Africa/Johannesburg': '約翰尼斯堡',
  UTC: '協調世界時',
};

const FALLBACK_ZONES = [...Object.keys(ZONE_LABELS), 'Europe/Kyiv', 'Asia/Kathmandu', 'America/St_Johns'];

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
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
      era: 'short',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Every zone the runtime knows, plus labelled zones, de-duplicated and sorted. */
export function listTimeZones(): string[] {
  let zones: string[] = [];
  try {
    zones = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];
  } catch {
    zones = [];
  }
  const all = new Set([...zones, ...FALLBACK_ZONES].filter(isValidTimeZone));
  return [...all].sort();
}

/** City name for a zone from a label map (zh by default), else the last segment of its IANA id. */
export function zoneLabel(timeZone: string, labels: Record<string, string> = ZONE_LABELS): string {
  return labels[timeZone] ?? timeZone.split('/').pop()!.replace(/_/g, ' ');
}

/**
 * A locale's starting zone list with the viewer's own zone added ('first' / 'last') when it is valid
 * and not already listed. `userZone` comes from Intl.DateTimeFormat().resolvedOptions().timeZone.
 */
export function buildDefaultZones(
  zones: readonly string[],
  userZone: string | undefined,
  position: 'first' | 'last' | 'none' = 'none',
): string[] {
  const base = zones.filter((z, i) => isValidTimeZone(z) && zones.indexOf(z) === i);
  if (position === 'none' || !userZone || !isValidTimeZone(userZone)) return base;
  const rest = base.filter((z) => z !== userZone);
  return position === 'first' ? [userZone, ...rest] : base.includes(userZone) ? base : [...base, userZone];
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

interface Parts extends WallTime {
  second: number;
  weekday: number;
}

function partsAt(instant: number, timeZone: string): Parts {
  const out: Record<string, string> = {};
  for (const p of formatterFor(timeZone).formatToParts(new Date(instant))) out[p.type] = p.value;
  const year = Number(out.year);
  return {
    year: out.era === 'BC' || out.era === 'B' ? 1 - year : year,
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: WEEKDAYS[out.weekday] ?? 0,
  };
}

/** Treats a wall time as if it were UTC and returns that epoch value. */
function wallAsUTC(w: WallTime & { second?: number }): number {
  const d = new Date(0);
  d.setUTCFullYear(w.year, w.month - 1, w.day);
  d.setUTCHours(w.hour, w.minute, w.second ?? 0, 0);
  return d.getTime();
}

/** Offset of a zone at an instant, in milliseconds (local − UTC). */
export function offsetMs(instant: number, timeZone: string): number {
  const whole = Math.floor(instant / 1000) * 1000;
  return wallAsUTC(partsAt(whole, timeZone)) - whole;
}

export type ResolveStatus = 'ok' | 'gap' | 'ambiguous';

/**
 * Converts a wall-clock time in a zone to a UTC instant.
 * Like Temporal's "compatible" disambiguation: a time skipped by a DST jump
 * moves forward by the jump (02:30 → 03:30), a repeated time takes the earlier instant.
 */
export function zonedToInstant(wall: WallTime, timeZone: string): { instant: number; status: ResolveStatus } {
  const local = wallAsUTC(wall);
  const before = offsetMs(local - DAY_MS, timeZone);
  const after = offsetMs(local + DAY_MS, timeZone);
  const candidates = [...new Set([before, after])]
    .map((off) => local - off)
    .filter((t) => offsetMs(t, timeZone) === local - t)
    .sort((a, b) => a - b);
  if (candidates.length === 0) {
    // A transition within ±1 day that did not apply at this wall time: probe the exact offset.
    const exact = local - offsetMs(local - offsetMs(local, timeZone), timeZone);
    if (offsetMs(exact, timeZone) === local - exact) return { instant: exact, status: 'ok' };
    return { instant: local - before, status: 'gap' };
  }
  return { instant: candidates[0], status: candidates.length > 1 ? 'ambiguous' : 'ok' };
}

export function instantToZoned(instant: number, timeZone: string): ZonedTime {
  const p = partsAt(instant, timeZone);
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    weekday: p.weekday,
    offset: Math.round(offsetMs(instant, timeZone) / 60_000),
  };
}

/** True when the zone is on daylight saving time at that instant (offset above its standard offset that year). */
export function isDST(instant: number, timeZone: string): boolean {
  const year = partsAt(instant, timeZone).year;
  const jan = offsetMs(wallAsUTC({ year, month: 1, day: 1, hour: 12, minute: 0 }), timeZone);
  const jul = offsetMs(wallAsUTC({ year, month: 7, day: 1, hour: 12, minute: 0 }), timeZone);
  return jan !== jul && offsetMs(instant, timeZone) === Math.max(jan, jul);
}

/** 480 → "UTC+8", 330 → "UTC+5:30", -210 → "UTC−3:30", 0 → "UTC±0". */
export function formatOffset(minutes: number): string {
  if (minutes === 0) return 'UTC±0';
  const sign = minutes > 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Whole-day difference between two calendar dates (b − a): −1 = previous day, 1 = next day. */
export function dayShift(a: WallTime, b: WallTime): number {
  const day = (w: WallTime) => wallAsUTC({ ...w, hour: 0, minute: 0 });
  return Math.round((day(b) - day(a)) / DAY_MS);
}

/** Difference in hours between two zones' offsets at an instant (b − a), e.g. Tokyo vs Taipei = 1. */
export function hourDifference(instant: number, a: string, b: string): number {
  return (offsetMs(instant, b) - offsetMs(instant, a)) / HOUR_MS;
}

/** Parses the value of <input type="datetime-local"> ("2026-10-29T14:30"). */
export function parseWallTime(value: string): WallTime | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const w = { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] };
  const check = new Date(wallAsUTC(w));
  const valid =
    check.getUTCMonth() + 1 === w.month && check.getUTCDate() === w.day && w.hour < 24 && w.minute < 60;
  return valid ? w : null;
}

export function toWallTimeValue(w: WallTime): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${String(w.year).padStart(4, '0')}-${p(w.month)}-${p(w.day)}T${p(w.hour)}:${p(w.minute)}`;
}

/** Sanitises a stored zone list: valid, unique, at most `max` entries. */
export function normalizeZones(zones: unknown, max = 24, fallback: readonly string[] = DEFAULT_ZONES): string[] {
  if (!Array.isArray(zones)) return [...fallback];
  const out: string[] = [];
  for (const z of zones) if (typeof z === 'string' && isValidTimeZone(z) && !out.includes(z)) out.push(z);
  return out.slice(0, max);
}

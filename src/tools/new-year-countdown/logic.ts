// 跨年倒數 + 除夕／春節倒數. Year-generic: every target is computed from "now", so the page keeps working
// after 2027. Pure functions only.
//
// Lunar dates come from the shared lunar table (../lunar-converter/logic.ts, 1900–2100). 2027 checked
// 2026-10-29: 除夕 2027-02-05（五）、正月初一 2027-02-06（六）, matching 行政院人事行政總處「116 年政府行政機關
// 辦公日曆表」(春節假期 2/4 小年夜 – 2/10，7 天), reproduced in ../holidays-2027/logic.ts.

import { animalOf, lunarNewYear, MAX_YEAR, yearGanzhi } from '../lunar-converter/logic';
import { cal2026 } from '../holidays-2026/logic';
import { cal2027 } from '../holidays-2027/logic';
import type { HolidayCalendar } from '../holidays-2026/calendar';
import type { YMD } from '../date-diff/logic';

export const TAIPEI_OFFSET_MS = 8 * 3_600_000;
const DAY_MS = 86_400_000;
/** The last 60 seconds switch to a single huge number. */
export const FINAL_SECONDS = 60;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const;

/** Epoch ms of 00:00 Taiwan time on a calendar date. */
export function taipeiMidnight(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d) - TAIPEI_OFFSET_MS;
}

export function taipeiDate(epochMs: number): YMD {
  const d = new Date(epochMs + TAIPEI_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

/**
 * Which calendar the countdown follows. zh-TW counts in Taiwan time, ja in Japan time (both fixed
 * offsets, no DST), en in the viewer's own zone (localClock).
 */
export interface DayClock {
  /** Calendar date at an instant. */
  dateOf(epochMs: number): YMD;
  /** Epoch ms of 00:00 on a calendar date. */
  midnight(y: number, m: number, d: number): number;
}

export function fixedOffsetClock(offsetMs: number): DayClock {
  return {
    dateOf(epochMs) {
      const d = new Date(epochMs + offsetMs);
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
    },
    midnight: (y, m, d) => Date.UTC(y, m - 1, d) - offsetMs,
  };
}

export const TAIPEI_CLOCK: DayClock = { dateOf: taipeiDate, midnight: taipeiMidnight };
export const TOKYO_OFFSET_MS = 9 * 3_600_000;
export const TOKYO_CLOCK: DayClock = fixedOffsetClock(TOKYO_OFFSET_MS);

/** The runtime's own time zone (the viewer's, in the browser), DST included. */
export function localClock(): DayClock {
  return {
    dateOf(epochMs) {
      const d = new Date(epochMs);
      return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
    },
    midnight(y, m, d) {
      const t = new Date(0);
      t.setFullYear(y, m - 1, d);
      t.setHours(0, 0, 0, 0);
      return t.getTime();
    },
  };
}

export function weekdayName(date: YMD): string {
  return `星期${WEEKDAYS[new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()]}`;
}

export function formatDate(date: YMD): string {
  return `${date.y} 年 ${date.m} 月 ${date.d} 日（${WEEKDAYS[new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()]}）`;
}

/* ---------- 跨年 ---------- */

export interface NewYearState {
  /** countdown: counting to the next 1 月 1 日; celebrate: it is 1 月 1 日 in Taiwan. */
  phase: 'countdown' | 'final' | 'celebrate';
  /** The year being counted down to. */
  targetYear: number;
  /** Epoch ms of targetYear-01-01 00:00 Taiwan time. */
  target: number;
  remaining: number;
  /** During the celebration, the year that just began. */
  celebrating: number | null;
}

export function newYearState(now: number, clock: DayClock = TAIPEI_CLOCK): NewYearState {
  const today = clock.dateOf(now);
  const targetYear = today.y + 1;
  const target = clock.midnight(targetYear, 1, 1);
  const remaining = target - now;
  const celebrating = today.m === 1 && today.d === 1 ? today.y : null;
  const phase = celebrating !== null ? 'celebrate' : remaining <= FINAL_SECONDS * 1000 ? 'final' : 'countdown';
  return { phase, targetYear, target, remaining, celebrating };
}

export interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Whole-second split, rounded up so the display reaches 0 exactly at the target. */
export function splitRemaining(ms: number): Parts {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Seconds shown in the final-minute mode (60 … 0). */
export function finalSeconds(ms: number): number {
  return Math.max(0, Math.ceil(ms / 1000));
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** e.g. "63 天 04:05:06", or "04:05:06" under one day. `days` words the day count for other locales. */
export function formatParts(p: Parts, days: (n: number) => string = (n) => `${n} 天`): string {
  const hms = `${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`;
  return p.days > 0 ? `${days(p.days)} ${hms}` : hms;
}

/** Fraction of the year elapsed (0–1), for the progress bar. */
export function yearProgress(now: number, clock: DayClock = TAIPEI_CLOCK): number {
  const y = clock.dateOf(now).y;
  const start = clock.midnight(y, 1, 1);
  const end = clock.midnight(y + 1, 1, 1);
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

/* ---------- 除夕／春節 ---------- */

export type DayStatus = 'upcoming' | 'today' | 'past';

export interface DayEvent {
  date: YMD;
  /** 00:00 Taiwan time on that date. */
  start: number;
  status: DayStatus;
  remaining: number;
  /** Calendar days from today (0 = today). */
  daysUntil: number;
}

export interface LunarNewYearInfo {
  /** The lunar year that 正月初一 starts (numbered by its Gregorian year). */
  year: number;
  ganzhi: string;
  animal: string;
  chuxi: DayEvent;
  chunjie: DayEvent;
  /** Official 春節連假 (incl. weekends) when that year's 辦公日曆表 is in the project's data. */
  holiday: { start: YMD; end: YMD; days: number } | null;
}

const CALENDARS: Record<number, HolidayCalendar> = { 2026: cal2026, 2027: cal2027 };

export function dayEvent(date: YMD, now: number, clock: DayClock = TAIPEI_CLOCK): DayEvent {
  const start = clock.midnight(date.y, date.m, date.d);
  const next = clock.dateOf(start + DAY_MS + 3 * 3_600_000); // the following date, safe across a DST change
  const end = clock.midnight(next.y, next.m, next.d);
  const status: DayStatus = now < start ? 'upcoming' : now < end ? 'today' : 'past';
  const today = clock.dateOf(now);
  const daysUntil = Math.round((Date.UTC(date.y, date.m - 1, date.d) - Date.UTC(today.y, today.m - 1, today.d)) / DAY_MS);
  return { date, start, status, remaining: start - now, daysUntil };
}

function sameOrBefore(a: YMD, b: YMD): boolean {
  return a.y * 10_000 + a.m * 100 + a.d <= b.y * 10_000 + b.m * 100 + b.d;
}

/** The 春節 long weekend containing 正月初一, from the yearly 辦公日曆表 data. */
export function springFestivalHoliday(year: number, chunjie: YMD): LunarNewYearInfo['holiday'] {
  const cal = CALENDARS[year];
  if (!cal) return null;
  const block = cal.longWeekends().find((b) => sameOrBefore(b.start, chunjie) && sameOrBefore(chunjie, b.end));
  return block ? { start: block.start, end: block.end, days: block.days } : null;
}

/**
 * The next 春節 still to come or under way: 正月初一 of this Gregorian year if its day has not ended,
 * otherwise next year's. 除夕 is the day before 初一.
 */
export function lunarNewYearInfo(now: number, clock: DayClock = TAIPEI_CLOCK): LunarNewYearInfo | null {
  let year = clock.dateOf(now).y;
  for (let i = 0; i < 2; i++, year++) {
    if (year > MAX_YEAR) return null;
    const ny = lunarNewYear(year);
    const chunjie = dayEvent(ny, now, clock);
    if (chunjie.status === 'past') continue;
    const eve = clock.dateOf(chunjie.start - 12 * 3_600_000);
    return {
      year,
      ganzhi: yearGanzhi(year),
      animal: animalOf(year),
      chuxi: dayEvent(eve, now, clock),
      chunjie,
      holiday: springFestivalHoliday(year, ny),
    };
  }
  return null;
}

/* ---------- 大晦日と正月三が日 (ja) ---------- */

export interface ShogatsuInfo {
  /** 12 月 31 日 of the current year (never past: on 1 January the year has already moved on). */
  omisoka: DayEvent;
  /** 1 月 1 日 of the 三が日 now under way, or of the coming year. */
  ganjitsu: DayEvent;
  /** 1–3 while it is 三が日 (1 月 1〜3 日), otherwise null. */
  sanganichiDay: number | null;
}

export function shogatsuInfo(now: number, clock: DayClock = TOKYO_CLOCK): ShogatsuInfo {
  const today = clock.dateOf(now);
  const sanganichiDay = today.m === 1 && today.d <= 3 ? today.d : null;
  const ganjitsuYear = sanganichiDay === null ? today.y + 1 : today.y;
  return {
    omisoka: dayEvent({ y: today.y, m: 12, d: 31 }, now, clock),
    ganjitsu: dayEvent({ y: ganjitsuYear, m: 1, d: 1 }, now, clock),
    sanganichiDay,
  };
}

/** 干支 of a Gregorian year as used in Japan (switches on 1 January), e.g. 2027 → 丁未. */
export function yearGanzhiOf(year: number): string {
  return yearGanzhi(year);
}

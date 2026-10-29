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

export function newYearState(now: number): NewYearState {
  const today = taipeiDate(now);
  const targetYear = today.y + 1;
  const target = taipeiMidnight(targetYear, 1, 1);
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

/** e.g. "63 天 04:05:06", or "04:05:06" under one day. */
export function formatParts(p: Parts): string {
  const hms = `${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`;
  return p.days > 0 ? `${p.days} 天 ${hms}` : hms;
}

/** Fraction of the year elapsed (0–1), for the progress bar. */
export function yearProgress(now: number): number {
  const y = taipeiDate(now).y;
  const start = taipeiMidnight(y, 1, 1);
  const end = taipeiMidnight(y + 1, 1, 1);
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

function dayEvent(date: YMD, now: number): DayEvent {
  const start = taipeiMidnight(date.y, date.m, date.d);
  const end = start + DAY_MS;
  const status: DayStatus = now < start ? 'upcoming' : now < end ? 'today' : 'past';
  const today = taipeiDate(now);
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
export function lunarNewYearInfo(now: number): LunarNewYearInfo | null {
  let year = taipeiDate(now).y;
  for (let i = 0; i < 2; i++, year++) {
    if (year > MAX_YEAR) return null;
    const ny = lunarNewYear(year);
    const chunjie = dayEvent(ny, now);
    if (chunjie.status === 'past') continue;
    const eve = taipeiDate(chunjie.start - DAY_MS);
    return {
      year,
      ganzhi: yearGanzhi(year),
      animal: animalOf(year),
      chuxi: dayEvent(eve, now),
      chunjie,
      holiday: springFestivalHoliday(year, ny),
    };
  }
  return null;
}

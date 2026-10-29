// Chinese lunisolar calendar (農曆) for 1900–2100: conversion, 閏月, 干支, 生肖 and 二十四節氣.
// Pure functions on {y, m, d} values; all arithmetic goes through UTC day numbers.

import { fromDayNumber, toDayNumber, type YMD } from '../date-diff/logic';

/**
 * Lunar year info for 1900–2100, one entry per lunar year (the standard compact table).
 * - bits 0–3: leap month number (0 = no 閏月)
 * - bits 4–15: month 12 … month 1 (bit 15 = 正月); 1 = 大月 30 days, 0 = 小月 29 days
 * - bit 16: 1 when the 閏月 has 30 days
 *
 * Source: generated from the Hong Kong Observatory 「公曆與農曆日期對照表」 for 1901–2100
 * (https://www.hko.gov.hk/tc/gts/time/conversion.htm, yearly files T1901e.txt … T2100e.txt) and
 * checked to be identical, entry by entry, with the widely used jjonline/calendar.js table (which
 * also supplies 1900). Verified 2026-10-29.
 */
export const LUNAR_INFO: readonly number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0, // 2050
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090
  0x0d520, // 2100
];

/**
 * Day of month of each 節氣 for Gregorian years 1900–2100, Beijing / Taipei time (UTC+8).
 * Index 0 = 小寒 (January) … 23 = 冬至 (December). day = TERM_BASE[i] + offset, offset 0–3.
 * Packed as 12 hex digits per year: each digit holds two offsets (high 2 bits = even term).
 * Source: Hong Kong Observatory yearly tables (1901–2100) and jjonline/calendar.js sTermInfo
 * (1900); both agree for every year. Verified 2026-10-29.
 */
const TERM_BASE = [4, 19, 3, 18, 4, 19, 4, 19, 4, 20, 4, 20, 6, 22, 6, 22, 6, 22, 7, 22, 6, 21, 6, 21] as const;
const TERM_DATA = [
  '95a59a599aa5a5a6aa9aaaa9a9aaaeaaaaaaaafaeeaeeaaaeaa59a599aa5a5a6aa9aaaa9', // 1900–1905
  'a9aaaaaaaaaaaafaeeaeeaaaeaa59a599aa5a5a6aa9aaaa9a9aaaaaaaaaaaafaeeaeeaaa', // 1906–1911
  'eaa59a599aa595a6aa9aaaa9a5a6aaaaaaaaaabaaeaaeaaaaaa59a59969595a69a9a9aa5', // 1912–1917
  'a5a6aaaaaaa9aabaaeaaeaaaaaa59a59969595a59a9a9aa5a5a6aaaaaaa9a9aaaeaaeaaa', // 1918–1923
  'aaa59a59969595a59a9a9aa5a5a6aa9aaaa9a9aaaeaaaaaaaaa59959955595a59a599aa5', // 1924–1929
  'a5a6aa9aaaa9a9aaaeaaaaaaaaa59959955595a59a599aa5a5a6aa9aaaa9a9aaaaaaaaaa', // 1930–1935
  'aaa59959955595a59a599aa5a5a6aa9aaaa9a9aaaaaaaaaaaaa59959955595a59a599aa5', // 1936–1941
  'a5a6aa9aaaa9a9aaaaaaaaaaaaa55959955595a59a59969595a6aa9a9aa9a5a6aaaaaaaa', // 1942–1947
  'aa655955955555a59a59969595a59a9a9aa9a5a6aaaaaaaaaa655955955555a59a599695', // 1948–1953
  '95a59a9a9aa5a5a6aa9aaaa9aa555955955555a59a59969595a59a599aa5a5a6aa9aaaa9', // 1954–1959
  'a9555955555555a59959955595a59a599aa5a5a6aa9aaaa9a9555955555555a599599555', // 1960–1965
  '95a59a599aa5a5a6aa9aaaa9a9555555555555a59959955595a59a599aa5a5a6aa9aaaa9', // 1966–1971
  'a9555555555555a55959955595a59a599aa5a5a6aa9a9aa9a9515555555555a559559555', // 1972–1977
  '95a59a5996a5a5a69a9a9aa9a9515555555555a55955955595a59a59969595a59a9a9aa9', // 1978–1983
  'a5515545555555655955955555a59a59969595a59a5a9aa5a55155455554555559555555', // 1984–1989
  '55a59959969595a59a599aa5a5515545555454555955555555a59959955595a59a599aa5', // 1990–1995
  'a5515545555454555555555555a59959955595a59a599aa5a55155455554545555555555', // 1996–2001
  '55a59959955595a59a599aa5a5515545555454555555555555a55955955595a59a599aa5', // 2002–2007
  'a5515545455454515555555555a55955955595a59a5996a5a55145454554545155455555', // 2008–2013
  '55a55955955595a59a59969595504545455450515545555555655955955555a599599695', // 2014–2019
  '95504504455450515545555455555955555555a599599695955045044550505155455554', // 2020–2025
  '54555555555555a59959955595504504455050515545555454555555555555a599599555', // 2026–2031
  '95504504455050515545555454555555555555a559559555955045044550505155455554', // 2032–2037
  '54555555555555a55955955595504504455050514545455454515555555555a559559555', // 2038–2043
  '95504504415050504545455454515545555555a559559555955044044140405045044554', // 2044–2049
  '505155455555555559555555555044044140405045044554505155455555555555555555', // 2050–2055
  '555044044140405045044550505155455554555555555555555044044000405045044550', // 2056–2061
  '505155455554545555555555555044044000405045044550505155455554545555555555', // 2062–2067
  '555004004000405045044550505145454554545555555555555004004000405045044150', // 2068–2073
  '505145454554545155455555555004004000405045044150505045054554545155455555', // 2074–2079
  '555004004000405044044140505045044554505155455555550004000000005044044140', // 2080–2085
  '405045044554505155455555550000000000005044044140405045044550505155455554', // 2086–2091
  '550000000000005044044000405045044550505155455554540000000000005044004000', // 2092–2097
  '405045044550505155455554545555555555', // 2098–2100
].join('');

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
/** 正月初一 of lunar year 1900. */
const EPOCH: YMD = { y: 1900, m: 1, d: 31 };

export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '驚蟄', '春分', '清明', '穀雨', '立夏', '小滿', '芒種', '夏至',
  '小暑', '大暑', '立秋', '處暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
] as const;
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;
/** 五行 of each 天干, in pairs: 甲乙木 丙丁火 戊己土 庚辛金 壬癸水. */
export const STEM_ELEMENT = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'] as const;
const MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'] as const;
const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const;

export interface LunarDate {
  /** Lunar year, numbered by the Gregorian year in which its 正月 starts. */
  year: number;
  /** 1–12 */
  month: number;
  /** 1–30 */
  day: number;
  isLeap: boolean;
}

export function inRange(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

function info(year: number): number {
  if (!inRange(year)) throw new RangeError(`Lunar year out of range: ${year}`);
  return LUNAR_INFO[year - MIN_YEAR];
}

/** The 閏月 number of a lunar year, or 0 when there is none. */
export function leapMonth(year: number): number {
  return info(year) & 0xf;
}

/** Days in the 閏月 (0 when the year has none). */
export function leapMonthDays(year: number): number {
  return leapMonth(year) ? (info(year) & 0x10000 ? 30 : 29) : 0;
}

/** Days in a regular (non-leap) month. */
export function monthDays(year: number, month: number): number {
  return info(year) & (0x10000 >> month) ? 30 : 29;
}

/** Days in a lunar month, leap or not; 0 when that month does not exist. */
export function lunarMonthLength(year: number, month: number, isLeap: boolean): number {
  if (!inRange(year) || !Number.isInteger(month) || month < 1 || month > 12) return 0;
  if (isLeap) return leapMonth(year) === month ? leapMonthDays(year) : 0;
  return monthDays(year, month);
}

export function lunarYearDays(year: number): number {
  let sum = 0;
  for (let m = 1; m <= 12; m++) sum += monthDays(year, m);
  return sum + leapMonthDays(year);
}

let yearStarts: number[] | null = null;
/** Day numbers of 正月初一 for 1900 … 2101 (cached). */
function starts(): number[] {
  if (!yearStarts) {
    yearStarts = [toDayNumber(EPOCH)];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) yearStarts.push(yearStarts[y - MIN_YEAR] + lunarYearDays(y));
  }
  return yearStarts;
}

/** Gregorian date of 正月初一 (春節) of a lunar year. */
export function lunarNewYear(year: number): YMD {
  info(year);
  return fromDayNumber(starts()[year - MIN_YEAR]);
}

/** Months of a lunar year in order, the 閏月 right after its regular month. */
export function monthsOf(year: number): { month: number; isLeap: boolean; days: number }[] {
  const leap = leapMonth(year);
  const list: { month: number; isLeap: boolean; days: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    list.push({ month: m, isLeap: false, days: monthDays(year, m) });
    if (m === leap) list.push({ month: m, isLeap: true, days: leapMonthDays(year) });
  }
  return list;
}

/** Gregorian → lunar. Returns null outside 1900-01-31 … 2101-01-28. */
export function solarToLunar(date: YMD): LunarDate | null {
  const n = toDayNumber(date);
  const s = starts();
  if (!Number.isFinite(n) || n < s[0] || n >= s[s.length - 1]) return null;
  let year = MIN_YEAR;
  while (s[year + 1 - MIN_YEAR] <= n) year++;
  let offset = n - s[year - MIN_YEAR];
  for (const m of monthsOf(year)) {
    if (offset < m.days) return { year, month: m.month, day: offset + 1, isLeap: m.isLeap };
    offset -= m.days;
  }
  return null; // unreachable
}

/** Lunar → Gregorian. Returns null when the lunar date does not exist (e.g. 小月三十, a missing 閏月). */
export function lunarToSolar(lunar: LunarDate): YMD | null {
  const { year, month, day, isLeap } = lunar;
  const length = lunarMonthLength(year, month, isLeap);
  if (!length || !Number.isInteger(day) || day < 1 || day > length) return null;
  let n = starts()[year - MIN_YEAR];
  for (const m of monthsOf(year)) {
    if (m.month === month && m.isLeap === isLeap) return fromDayNumber(n + day - 1);
    n += m.days;
  }
  return null;
}

/** 0-based index into the 60-cycle → 「甲子」. */
export function ganzhi(index: number): string {
  const i = ((index % 60) + 60) % 60;
  return STEMS[i % 10] + BRANCHES[i % 12];
}

/** 干支 of a lunar year, e.g. 2026 → 丙午. */
export function yearGanzhi(year: number): string {
  return ganzhi(year - 4);
}

/** 生肖 of a lunar year, e.g. 2026 → 馬. */
export function animalOf(year: number): string {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}

/** 五行 of a year's 天干, e.g. 2026 丙午 → 火. */
export function yearElement(year: number): string {
  return STEM_ELEMENT[(((year - 4) % 10) + 10) % 10];
}

/** Day of month of 節氣 index 0–23 (0 = 小寒) in a Gregorian year 1900–2100. */
export function termDay(year: number, index: number): number {
  info(year);
  const hex = parseInt(TERM_DATA[(year - MIN_YEAR) * 12 + (index >> 1)], 16);
  const offset = index % 2 === 0 ? hex >> 2 : hex & 3;
  return TERM_BASE[index] + offset;
}

export interface SolarTerm {
  name: string;
  index: number;
  date: YMD;
}

/** All 24 節氣 of a Gregorian year, 小寒 first. */
export function solarTermsOf(year: number): SolarTerm[] {
  return SOLAR_TERMS.map((name, index) => ({ name, index, date: { y: year, m: (index >> 1) + 1, d: termDay(year, index) } }));
}

/** The 節氣 falling on this date, or null. */
export function termOn(date: YMD): string | null {
  if (!inRange(date.y)) return null;
  const base = (date.m - 1) * 2;
  if (termDay(date.y, base) === date.d) return SOLAR_TERMS[base];
  if (termDay(date.y, base + 1) === date.d) return SOLAR_TERMS[base + 1];
  return null;
}

/** Most recent term on or before the date and the next one after it (null at the table edges). */
export function nearbyTerms(date: YMD): { prev: SolarTerm | null; next: SolarTerm | null } {
  const n = toDayNumber(date);
  const all = [date.y - 1, date.y, date.y + 1].filter(inRange).flatMap(solarTermsOf);
  let prev: SolarTerm | null = null;
  let next: SolarTerm | null = null;
  for (const t of all) {
    const tn = toDayNumber(t.date);
    if (tn <= n) prev = t;
    else if (!next) next = t;
  }
  return { prev, next };
}

/**
 * 月柱: the month starts at each 「節」 (小寒, 立春, 驚蟄 … 大雪), not at the lunar new moon.
 * 立春 opens the 寅 month. Valid for Gregorian 1900–2100.
 */
export function monthGanzhi(date: YMD): string {
  const node = termDay(date.y, (date.m - 1) * 2);
  const base = (date.y - 1900) * 12 + date.m + 11;
  return ganzhi(date.d >= node ? base + 1 : base);
}

/** 日柱. 2000-01-01 was 戊午. */
export function dayGanzhi(date: YMD): string {
  return ganzhi(toDayNumber(date) + 25_577);
}

/**
 * 年柱 as used in 八字: the year changes at 立春 rather than 春節. Returns the Gregorian year whose 干支 applies.
 */
export function astroYear(date: YMD): number {
  return date.m < 2 || (date.m === 2 && date.d < termDay(date.y, 2)) ? date.y - 1 : date.y;
}

/** 「三」, 「十一」, 「二十」, 「廿一」, 「三十」. */
export function chineseNumber(n: number): string {
  if (n <= 10) return DIGITS[n];
  if (n < 20) return `十${DIGITS[n - 10]}`;
  if (n === 20) return '二十';
  if (n < 30) return `廿${DIGITS[n - 20]}`;
  return n === 30 ? '三十' : String(n);
}

/** 「正月」, 「閏二月」, 「十二月」. */
export function monthName(month: number, isLeap = false): string {
  return `${isLeap ? '閏' : ''}${MONTH_NAMES[month - 1]}月`;
}

/** 「初一」 … 「初十」, 「十一」 … 「二十」, 「廿一」 … 「三十」. */
export function dayName(day: number): string {
  return day <= 10 ? `初${DIGITS[day]}` : chineseNumber(day);
}

/** 「丙午年 正月初一」 */
export function formatLunar(l: LunarDate): string {
  return `${yearGanzhi(l.year)}年 ${monthName(l.month, l.isLeap)}${dayName(l.day)}`;
}

export interface Festival {
  name: string;
  date: YMD;
}

/** Major traditional festivals of a lunar year, in Gregorian dates, sorted. */
export function festivalsOf(year: number): Festival[] {
  const lunar = (name: string, month: number, day: number): Festival | null => {
    const date = lunarToSolar({ year, month, day, isLeap: false });
    return date ? { name, date } : null;
  };
  const eveLength = monthDays(year, 12);
  const list = [
    lunar('春節（正月初一）', 1, 1),
    lunar('元宵節（正月十五）', 1, 15),
    lunar('端午節（五月初五）', 5, 5),
    lunar('七夕情人節（七月初七）', 7, 7),
    lunar('中元節（七月十五）', 7, 15),
    lunar('中秋節（八月十五）', 8, 15),
    lunar('重陽節（九月初九）', 9, 9),
    lunar('尾牙（十二月十六）', 12, 16),
    lunar(`除夕（十二月${dayName(eveLength)}）`, 12, eveLength),
  ].filter((f): f is Festival => f !== null);
  // 清明 is a solar term, not a lunar date.
  if (inRange(year)) list.push({ name: '清明節', date: { y: year, m: 4, d: termDay(year, 6) } });
  return list.sort((a, b) => toDayNumber(a.date) - toDayNumber(b.date));
}

export interface LunarDetails {
  lunar: LunarDate;
  solar: YMD;
  text: string;
  yearGanzhi: string;
  animal: string;
  element: string;
  monthGanzhi: string;
  dayGanzhi: string;
  /** 八字年柱 (changes at 立春). */
  astroYearGanzhi: string;
  term: string | null;
  prevTerm: SolarTerm | null;
  nextTerm: SolarTerm | null;
}

/** Everything the converter shows for one Gregorian date, or null outside the supported range. */
export function describe(solar: YMD): LunarDetails | null {
  if (!inRange(solar.y)) return null;
  const lunar = solarToLunar(solar);
  if (!lunar) return null;
  const { prev, next } = nearbyTerms(solar);
  return {
    lunar,
    solar,
    text: formatLunar(lunar),
    yearGanzhi: yearGanzhi(lunar.year),
    animal: animalOf(lunar.year),
    element: yearElement(lunar.year),
    monthGanzhi: monthGanzhi(solar),
    dayGanzhi: dayGanzhi(solar),
    astroYearGanzhi: yearGanzhi(astroYear(solar)),
    term: termOn(solar),
    prevTerm: prev,
    nextTerm: next,
  };
}

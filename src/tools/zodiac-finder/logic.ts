// 星座 (Western sun sign) and 生肖 (農曆-new-year aware) lookup. Pure functions, no DOM.

import { toDayNumber, type YMD } from '../date-diff/logic';
import { animalOf, inRange, lunarNewYear, solarToLunar, termDay, yearElement, yearGanzhi } from '../lunar-converter/logic';

export interface SignInfo {
  name: string;
  english: string;
  /** Start month/day of the common (Taiwan) date range. */
  start: [number, number];
  /** End month/day, inclusive. */
  end: [number, number];
  element: '火' | '土' | '風' | '水';
  /** 基本（開創）／固定／變動 */
  modality: '基本' | '固定' | '變動';
  ruler: string;
  /** 節氣 at which the Sun enters this sign (the 中氣). */
  term: string;
  /** Index of that 中氣 in the lunar-converter SOLAR_TERMS list (0 = 小寒). */
  termIndex: number;
}

/**
 * Date ranges as commonly published in Taiwan. The true boundary is the moment the Sun reaches the
 * sign's ecliptic longitude, which coincides with a 中氣 (春分 = 牡羊座 0°) and can move by a day.
 */
export const SIGNS: readonly SignInfo[] = [
  { name: '牡羊座', english: 'Aries', start: [3, 21], end: [4, 19], element: '火', modality: '基本', ruler: '火星', term: '春分', termIndex: 5 },
  { name: '金牛座', english: 'Taurus', start: [4, 20], end: [5, 20], element: '土', modality: '固定', ruler: '金星', term: '穀雨', termIndex: 7 },
  { name: '雙子座', english: 'Gemini', start: [5, 21], end: [6, 21], element: '風', modality: '變動', ruler: '水星', term: '小滿', termIndex: 9 },
  { name: '巨蟹座', english: 'Cancer', start: [6, 22], end: [7, 22], element: '水', modality: '基本', ruler: '月亮', term: '夏至', termIndex: 11 },
  { name: '獅子座', english: 'Leo', start: [7, 23], end: [8, 22], element: '火', modality: '固定', ruler: '太陽', term: '大暑', termIndex: 13 },
  { name: '處女座', english: 'Virgo', start: [8, 23], end: [9, 22], element: '土', modality: '變動', ruler: '水星', term: '處暑', termIndex: 15 },
  { name: '天秤座', english: 'Libra', start: [9, 23], end: [10, 23], element: '風', modality: '基本', ruler: '金星', term: '秋分', termIndex: 17 },
  { name: '天蠍座', english: 'Scorpio', start: [10, 24], end: [11, 22], element: '水', modality: '固定', ruler: '冥王星（傳統為火星）', term: '霜降', termIndex: 19 },
  { name: '射手座', english: 'Sagittarius', start: [11, 23], end: [12, 21], element: '火', modality: '變動', ruler: '木星', term: '小雪', termIndex: 21 },
  { name: '摩羯座', english: 'Capricorn', start: [12, 22], end: [1, 19], element: '土', modality: '基本', ruler: '土星', term: '冬至', termIndex: 23 },
  { name: '水瓶座', english: 'Aquarius', start: [1, 20], end: [2, 18], element: '風', modality: '固定', ruler: '天王星（傳統為土星）', term: '大寒', termIndex: 1 },
  { name: '雙魚座', english: 'Pisces', start: [2, 19], end: [3, 20], element: '水', modality: '變動', ruler: '海王星（傳統為木星）', term: '雨水', termIndex: 3 },
];

const md = (m: number, d: number) => m * 100 + d;

/** Sign by the common fixed date table. */
export function signByTable(month: number, day: number): SignInfo {
  const v = md(month, day);
  const found = SIGNS.find((s) => {
    const a = md(...s.start);
    const b = md(...s.end);
    return a <= b ? v >= a && v <= b : v >= a || v <= b;
  });
  return found ?? SIGNS[9];
}

/**
 * Sign by that year's actual 中氣 dates (Taipei time, 1900–2100): the day a 中氣 falls on is counted
 * as the new sign. Falls back to the table outside the supported range.
 */
export function signByTerms(date: YMD): SignInfo {
  if (!inRange(date.y)) return signByTable(date.m, date.d);
  // The 中氣 in month m has index (m − 1) × 2 + 1; on or after it the Sun is in the sign that starts there.
  const termIndex = (date.m - 1) * 2 + 1;
  const startsHere = SIGNS.find((s) => s.termIndex === termIndex)!;
  if (date.d >= termDay(date.y, termIndex)) return startsHere;
  return SIGNS[(SIGNS.indexOf(startsHere) + 11) % 12];
}

export interface AnimalResult {
  /** 生肖 by 農曆 year (the usual answer). */
  animal: string;
  /** 生肖 by the Gregorian year number alone (the common mistake for January–February births). */
  naiveAnimal: string;
  lunarYear: number;
  ganzhi: string;
  element: string;
  /** 春節 of the Gregorian birth year. */
  newYear: YMD;
  /** True when born in Jan/Feb before that year's 春節. */
  beforeNewYear: boolean;
}

/** 生肖 for a birth date, switching at 春節 (正月初一). Null outside 1900-01-31 … 2100. */
export function animalForDate(date: YMD): AnimalResult | null {
  const lunar = solarToLunar(date);
  if (!lunar || !inRange(date.y)) return null;
  const newYear = lunarNewYear(date.y);
  return {
    animal: animalOf(lunar.year),
    naiveAnimal: animalOf(date.y),
    lunarYear: lunar.year,
    ganzhi: yearGanzhi(lunar.year),
    element: yearElement(lunar.year),
    newYear,
    beforeNewYear: toDayNumber(date) < toDayNumber(newYear),
  };
}

export interface ZodiacResult {
  sign: SignInfo;
  /** Sign by that year's 中氣 when it differs from the table (birth on a boundary day). */
  termSign: SignInfo | null;
  /** True when the date is within one day of a sign boundary. */
  nearCusp: boolean;
  animal: AnimalResult | null;
}

export function lookup(date: YMD): ZodiacResult {
  const sign = signByTable(date.m, date.d);
  const termSign = signByTerms(date);
  const next = signByTable(...nextDay(date.m, date.d));
  const prev = signByTable(...prevDay(date.m, date.d));
  return {
    sign,
    termSign: termSign.name === sign.name ? null : termSign,
    nearCusp: next.name !== sign.name || prev.name !== sign.name,
    animal: animalForDate(date),
  };
}

const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function nextDay(m: number, d: number): [number, number] {
  return d < MONTH_DAYS[m - 1] ? [m, d + 1] : [(m % 12) + 1, 1];
}
function prevDay(m: number, d: number): [number, number] {
  if (d > 1) return [m, d - 1];
  const pm = m === 1 ? 12 : m - 1;
  return [pm, MONTH_DAYS[pm - 1]];
}

export const ANIMAL_ORDER = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;

export interface AnimalYearRow {
  animal: string;
  /** Lunar years of this animal within the range, each with its 春節 date. */
  years: { year: number; newYear: YMD; ganzhi: string }[];
}

/** For each 生肖, the lunar years in [from, to] and when each starts. */
export function animalYearTable(from: number, to: number): AnimalYearRow[] {
  return ANIMAL_ORDER.map((animal) => ({
    animal,
    years: Array.from({ length: to - from + 1 }, (_, i) => from + i)
      .filter((y) => animalOf(y) === animal)
      .map((year) => ({ year, newYear: lunarNewYear(year), ganzhi: yearGanzhi(year) })),
  }));
}

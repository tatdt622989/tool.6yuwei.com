import { compareYMD, diffDays, diffYMD, isLeapYear, type YMD } from '../date-diff/logic';

export type { YMD } from '../date-diff/logic';

/** 民國元年 = 西元 1912 年. */
export const ROC_OFFSET = 1911;

export function rocToAD(rocYear: number): number {
  return rocYear + ROC_OFFSET;
}

export function adToRoc(year: number): number {
  return year - ROC_OFFSET;
}

/** 「民國 79 年」, or 「民前 12 年」 for years before 1912. */
export function rocLabel(year: number): string {
  return year > ROC_OFFSET ? `民國 ${year - ROC_OFFSET} 年` : `民前 ${ROC_OFFSET + 1 - year} 年`;
}

const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;

/** Chinese zodiac by Gregorian year (2020 = 鼠). Strictly it changes at 農曆新年, not 1/1. */
export function zodiacOf(year: number): string {
  return ZODIAC[(((year - 2020) % 12) + 12) % 12];
}

// [last day of the sign that starts the month's first part, sign before, sign after]
const SIGNS: [number, string, string][] = [
  [19, '摩羯座', '水瓶座'],
  [18, '水瓶座', '雙魚座'],
  [20, '雙魚座', '牡羊座'],
  [19, '牡羊座', '金牛座'],
  [20, '金牛座', '雙子座'],
  [21, '雙子座', '巨蟹座'],
  [22, '巨蟹座', '獅子座'],
  [22, '獅子座', '處女座'],
  [22, '處女座', '天秤座'],
  [23, '天秤座', '天蠍座'],
  [22, '天蠍座', '射手座'],
  [21, '射手座', '摩羯座'],
];

/** Western zodiac sign using the date ranges common in Taiwan (e.g. 牡羊座 3/21–4/19). */
export function constellationOf(month: number, day: number): string {
  const [cutoff, before, after] = SIGNS[month - 1];
  return day <= cutoff ? before : after;
}

/**
 * The birthday in a given year. A 2/29 birthday falls on 3/1 in common years,
 * matching how 民法 counts a full year (the period ends on 2/28, the new age starts 3/1).
 */
export function birthdayInYear(birth: YMD, year: number): YMD {
  if (birth.m === 2 && birth.d === 29 && !isLeapYear(year)) return { y: year, m: 3, d: 1 };
  return { y: year, m: birth.m, d: birth.d };
}

/** 虛歲 as commonly counted in Taiwan: born = 1 歲, +1 every Gregorian new year. */
export function nominalAge(birthYear: number, onYear: number): number {
  return onYear - birthYear + 1;
}

export interface AgeResult {
  /** 實歲 */
  years: number;
  months: number;
  days: number;
  /** 虛歲 */
  nominal: number;
  daysLived: number;
  nextBirthday: YMD;
  /** 0 when today is the birthday. */
  daysToNextBirthday: number;
  /** Age turned on nextBirthday. */
  nextAge: number;
  zodiac: string;
  constellation: string;
}

/** Returns null when the birth date is after the reference date. */
export function calcAge(birth: YMD, on: YMD): AgeResult | null {
  if (compareYMD(birth, on) > 0) return null;
  const span = diffYMD(birth, on);
  let next = birthdayInYear(birth, on.y);
  if (compareYMD(next, on) < 0) next = birthdayInYear(birth, on.y + 1);
  return {
    years: span.years,
    months: span.months,
    days: span.days,
    nominal: nominalAge(birth.y, on.y),
    daysLived: diffDays(birth, on),
    nextBirthday: next,
    daysToNextBirthday: diffDays(on, next),
    nextAge: next.y - birth.y,
    zodiac: zodiacOf(birth.y),
    constellation: constellationOf(birth.m, birth.d),
  };
}

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

export const SIGN_IDS = [
  'capricorn',
  'aquarius',
  'pisces',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
] as const;
export type SignId = (typeof SIGN_IDS)[number];

/** Locale-neutral id of the sign, same date ranges as constellationOf (localized names live in i18n.ts). */
export function signOf(month: number, day: number): SignId {
  const cutoff = SIGNS[month - 1][0];
  return SIGN_IDS[(month - 1 + (day <= cutoff ? 0 : 1)) % 12];
}

// ---- Japan: 干支 and 和暦 (ja) ----

const JIKKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const JIKKAN_KANA = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'] as const;
const JUNISHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const JUNISHI_KANA = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * 干支 of a Gregorian year as used in Japan (switches on 1 January; 1984 = 甲子).
 * Returns the 十二支 (「午」), its reading, and the full 六十干支 (「庚午」「かのえうま」).
 */
export function kanshiOf(year: number): { shi: string; shiKana: string; kanshi: string; kanshiKana: string } {
  const k = mod(year - 1984, 10);
  const s = mod(year - 1984, 12);
  return {
    shi: JUNISHI[s],
    shiKana: JUNISHI_KANA[s],
    kanshi: `${JIKKAN[k]}${JUNISHI[s]}`,
    kanshiKana: `${JIKKAN_KANA[k]}${JUNISHI_KANA[s]}`,
  };
}

/** Japanese eras since the Gregorian calendar was adopted (明治 6 年 = 1873). Newest first. */
const ERAS: { name: string; start: YMD; offset: number }[] = [
  { name: '令和', start: { y: 2019, m: 5, d: 1 }, offset: 2018 },
  { name: '平成', start: { y: 1989, m: 1, d: 8 }, offset: 1988 },
  { name: '昭和', start: { y: 1926, m: 12, d: 25 }, offset: 1925 },
  { name: '大正', start: { y: 1912, m: 7, d: 30 }, offset: 1911 },
  { name: '明治', start: { y: 1873, m: 1, d: 1 }, offset: 1867 },
];

/** 和暦 of a date: 1990-06-15 → { era: '平成', year: 2 }. null before 1873 (pre-Gregorian Japan). */
export function warekiOf(date: YMD): { era: string; year: number } | null {
  const era = ERAS.find((e) => compareYMD(date, e.start) >= 0);
  return era ? { era: era.name, year: date.y - era.offset } : null;
}

/** 「平成2年6月15日」, 「令和元年5月1日」; falls back to 「1850年1月1日」 before 1873. */
export function warekiLabel(date: YMD): string {
  const w = warekiOf(date);
  const head = w ? `${w.era}${w.year === 1 ? '元' : w.year}年` : `${date.y}年`;
  return `${head}${date.m}月${date.d}日`;
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
  /** Locale-neutral sign id (see signOf). */
  sign: SignId;
  /** Age in whole months (years × 12 + months). */
  totalMonths: number;
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
    sign: signOf(birth.m, birth.d),
    totalMonths: span.years * 12 + span.months,
  };
}

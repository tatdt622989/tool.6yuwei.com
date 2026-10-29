// 民國 ↔ 西元 ↔ 日本和暦 ↔ 干支 ↔ 生肖 conversions. Pure functions, no DOM.

import { isValidYMD, type YMD } from '../date-diff/logic';

/** 民國元年 = 西元 1912 年. */
export const ROC_OFFSET = 1911;

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const ANIMALS = '鼠牛虎兔龍蛇馬羊猴雞狗豬';

export function rocToAD(roc: number): number {
  return roc + ROC_OFFSET;
}

export function adToRoc(year: number): number {
  return year - ROC_OFFSET;
}

/** 「民國 115 年」, 「民國元年」, or 「民前 12 年」 for years before 1912. */
export function rocLabel(year: number): string {
  if (year === ROC_OFFSET + 1) return '民國元年';
  return year > ROC_OFFSET ? `民國 ${year - ROC_OFFSET} 年` : `民前 ${ROC_OFFSET + 1 - year} 年`;
}

/** 干支 of a Gregorian year, e.g. 2026 → 丙午. Strictly the 干支 year starts at 春節 (or 立春). */
export function ganzhiOf(year: number): string {
  const i = (((year - 4) % 60) + 60) % 60;
  return STEMS[i % 10] + BRANCHES[i % 12];
}

export function animalOf(year: number): string {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}

export interface JapaneseEra {
  name: string;
  /** First day of the era. */
  start: YMD;
}

/**
 * Modern Japanese eras (元号). Each era starts on the day after the previous one ends; the first
 * year of an era is 元年. Dates per 内閣府 / 首相官邸 public announcements.
 */
export const JAPANESE_ERAS: readonly JapaneseEra[] = [
  { name: '明治', start: { y: 1868, m: 1, d: 25 } }, // 明治元年 = 1868 (改元 1868-10-23, applied retroactively to 1/1 of 旧暦)
  { name: '大正', start: { y: 1912, m: 7, d: 30 } },
  { name: '昭和', start: { y: 1926, m: 12, d: 25 } },
  { name: '平成', start: { y: 1989, m: 1, d: 8 } },
  { name: '令和', start: { y: 2019, m: 5, d: 1 } },
];

/** 「令和 8 年」 / 「令和元年」. */
export function eraYearLabel(era: string, n: number): string {
  return n === 1 ? `${era}元年` : `${era} ${n} 年`;
}

/** All 和暦 labels that apply in a Gregorian year (two in years when the era changed). Empty before 1868. */
export function japaneseYears(year: number): string[] {
  const labels: string[] = [];
  JAPANESE_ERAS.forEach((era, i) => {
    const next = JAPANESE_ERAS[i + 1];
    const endYear = next ? next.start.y : Number.POSITIVE_INFINITY;
    // In a year when the era changed, both the old and the new era apply.
    if (year >= era.start.y && year <= endYear) {
      labels.push(eraYearLabel(era.name, year - era.start.y + 1));
    }
  });
  return labels;
}

/** Gregorian year from a 和暦 year, or NaN when the era is unknown or the year is beyond the era. */
export function japaneseToAD(era: string, n: number): number {
  const index = JAPANESE_ERAS.findIndex((e) => e.name === era);
  if (index < 0 || !Number.isInteger(n) || n < 1) return Number.NaN;
  const year = JAPANESE_ERAS[index].start.y + n - 1;
  const next = JAPANESE_ERAS[index + 1];
  return next && year > next.start.y ? Number.NaN : year;
}

/** Last year number of an era (e.g. 平成 → 31), or null for the current era. */
export function eraLastYear(era: string): number | null {
  const index = JAPANESE_ERAS.findIndex((e) => e.name === era);
  const next = JAPANESE_ERAS[index + 1];
  return index < 0 || !next ? null : next.start.y - JAPANESE_ERAS[index].start.y + 1;
}

export interface YearInfo {
  ad: number;
  roc: string;
  /** Numeric 民國 year; ≤ 0 means 民前. */
  rocNumber: number;
  japanese: string[];
  ganzhi: string;
  animal: string;
  /** Age (實歲) at this year's birthday for someone born in `ad`, as of `currentYear`; negative = future year. */
  ageThisYear: number;
}

export function yearInfo(ad: number, currentYear: number): YearInfo {
  return {
    ad,
    roc: rocLabel(ad),
    rocNumber: adToRoc(ad),
    japanese: japaneseYears(ad),
    ganzhi: ganzhiOf(ad),
    animal: animalOf(ad),
    ageThisYear: currentYear - ad,
  };
}

/** The 民國 1…to rows of the reference table, oldest first. */
export function rocTable(to: number, currentYear: number): YearInfo[] {
  return Array.from({ length: to }, (_, i) => yearInfo(rocToAD(i + 1), currentYear));
}

// ---------- full dates ----------

export interface ParsedDate {
  /** Gregorian date. */
  date: YMD;
  /** How the input was read. */
  from: 'roc' | 'ad';
}

const toHalfWidth = (s: string) => s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

/**
 * Reads a date typed in common Taiwanese forms and decides whether it is 民國 or 西元:
 * 「115/10/29」「115.10.29」「115-10-29」「民國115年10月29日」「1151029」「0991231」→ 民國;
 * 「2026/10/29」「2026-10-29」「20261029」「西元2026年10月29日」→ 西元.
 * A year with 4 digits is treated as 西元, 1–3 digits as 民國, unless 民國/西元 is written.
 */
export function parseDateText(input: string): ParsedDate | null {
  const text = toHalfWidth(input).trim().replace(/\s+/g, '');
  if (!text) return null;
  const forceRoc = /^(民國|民|中華民國)/.test(text);
  const forceAd = /^(西元|公元)/.test(text);
  const body = text.replace(/^(中華民國|民國|民|西元|公元)/, '');

  let y: number;
  let m: number;
  let d: number;
  let yearDigits: number;
  const sep = /^(\d{1,4})[./\-年](\d{1,2})[./\-月](\d{1,2})日?$/.exec(body);
  if (sep) {
    [y, m, d] = [Number(sep[1]), Number(sep[2]), Number(sep[3])];
    yearDigits = sep[1].length;
  } else if (/^\d{7,8}$/.test(body)) {
    // 7 digits = 民國 YYYMMDD (e.g. 1151029 or 0991231); 8 digits = 西元 YYYYMMDD.
    const yLen = body.length - 4;
    y = Number(body.slice(0, yLen));
    m = Number(body.slice(yLen, yLen + 2));
    d = Number(body.slice(yLen + 2));
    yearDigits = body.length === 7 ? 3 : 4;
  } else {
    return null;
  }

  const roc = forceRoc || (!forceAd && yearDigits <= 3);
  const date = { y: roc ? rocToAD(y) : y, m, d };
  if (roc && y < 1) return null;
  return isValidYMD(date) ? { date, from: roc ? 'roc' : 'ad' } : null;
}

/** 「民國 115 年 10 月 29 日」 */
export function formatRocDate(date: YMD): string {
  return `${rocLabel(date.y)} ${date.m} 月 ${date.d} 日`;
}

/** 「115/10/29」, zero-padded month/day, as on 健保卡 and most forms. */
export function formatRocSlash(date: YMD): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${adToRoc(date.y)}/${pad(date.m)}/${pad(date.d)}`;
}

/** 「2026/10/29」 */
export function formatAdSlash(date: YMD): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.y}/${pad(date.m)}/${pad(date.d)}`;
}

/** The 和暦 label of a specific date, e.g. 2019-04-30 → 平成 31 年, 2019-05-01 → 令和元年. */
export function japaneseDateLabel(date: YMD): string | null {
  const key = (v: YMD) => v.y * 10_000 + v.m * 100 + v.d;
  let found: JapaneseEra | null = null;
  for (const era of JAPANESE_ERAS) if (key(date) >= key(era.start)) found = era;
  return found ? eraYearLabel(found.name, date.y - found.start.y + 1) : null;
}

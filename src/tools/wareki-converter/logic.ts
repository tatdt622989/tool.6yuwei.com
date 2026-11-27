// 和暦 ⇄ 西暦 conversion, 干支, 年齢 and 学年 for the 年齢早見表. Pure functions; "today" is always passed in.
//
// Sources (checked 2026-10-29):
// - 令和: 「元号を改める政令」平成31年政令第143号、平成31年4月1日公布・5月1日施行（内閣府 元号ページ
//   https://www.cao.go.jp/others/soumu/gengou/index.html）。平成31年4月30日 → 令和元年5月1日。
// - 平成: 「元号を改める政令」昭和64年政令第1号、昭和64年1月7日公布・1月8日施行。昭和64年1月7日 → 平成元年1月8日。
// - 昭和: 1926-12-25（大正15年12月25日）大正天皇崩御の当日に改元。大正: 1912-07-30（明治45年7月30日）明治天皇崩御の当日に改元。
//   旧皇室典範による即日改元のため、改元当日は旧元号でも新元号でも表記されることがある（大正元年7月30日／明治45年7月30日）。
//   このツールでは改元当日を新元号として扱い、旧元号の表記も併記する。
// - 明治: 慶応4年9月8日（1868-10-23）の改元詔書で慶応4年1月1日にさかのぼって明治元年とした。
//   日本は明治5年12月2日（旧暦）の翌日を明治6年1月1日（1873-01-01）としてグレゴリオ暦を採用（明治5年太政官布告第337号）。
//   そのため日付単位の変換は 1873-01-01 以降のみ、年単位の換算は明治元年（1868）から行う。
// - 学年: 学校教育法第17条（満6歳に達した日の翌日以後における最初の学年の初めから就学）と
//   「年齢計算ニ関スル法律」（年齢は誕生日の前日の終了時に加算）により、4月2日〜翌年4月1日生まれが同じ学年。
//   学年は4月1日に始まり3月31日に終わる（学校教育法施行規則第59条）。

import { isValidYMD, weekdayOf, type YMD } from '../date-diff/logic';

export interface Era {
  /** 漢字表記 */
  name: string;
  reading: string;
  /** アルファベット略号（M/T/S/H/R） */
  letter: string;
  /** First day of the era for date conversion (明治 = 旧暦元日 1868-01-25, but dates are only converted from 1873). */
  start: YMD;
  /** Last day of the era, null for the current era. */
  end: YMD | null;
}

export const ERAS: readonly Era[] = [
  { name: '明治', reading: 'めいじ', letter: 'M', start: { y: 1868, m: 1, d: 25 }, end: { y: 1912, m: 7, d: 29 } },
  { name: '大正', reading: 'たいしょう', letter: 'T', start: { y: 1912, m: 7, d: 30 }, end: { y: 1926, m: 12, d: 24 } },
  { name: '昭和', reading: 'しょうわ', letter: 'S', start: { y: 1926, m: 12, d: 25 }, end: { y: 1989, m: 1, d: 7 } },
  { name: '平成', reading: 'へいせい', letter: 'H', start: { y: 1989, m: 1, d: 8 }, end: { y: 2019, m: 4, d: 30 } },
  { name: '令和', reading: 'れいわ', letter: 'R', start: { y: 2019, m: 5, d: 1 }, end: null },
];

/** First date that can be converted day by day (グレゴリオ暦の採用日 = 明治6年1月1日). */
export const GREGORIAN_START: YMD = { y: 1873, m: 1, d: 1 };

const key = (d: YMD) => d.y * 10_000 + d.m * 100 + d.d;

export function findEra(nameOrLetter: string): Era | undefined {
  const s = nameOrLetter.trim().toUpperCase();
  return ERAS.find((e) => e.name === nameOrLetter.trim() || e.letter === s);
}

/** 西暦 = 和暦年 + offset（令和 2018・平成 1988・昭和 1925・大正 1911・明治 1867）. */
export function eraOffset(era: Era): number {
  return era.start.y - 1;
}

/** Last year number of an era (平成 → 31), null for the current era. */
export function eraLastYear(era: Era): number | null {
  return era.end ? era.end.y - eraOffset(era) : null;
}

/** 「令和8年」「令和元年」. */
export function eraYearLabel(era: string, n: number): string {
  return n === 1 ? `${era}元年` : `${era}${n}年`;
}

/** Gregorian year of 和暦 year n; NaN when n is not a positive integer. Years past the era's end are still computed. */
export function warekiYearToAD(era: Era, n: number): number {
  return Number.isInteger(n) && n >= 1 ? eraOffset(era) + n : Number.NaN;
}

/** Whether 和暦 year n exists in that era (平成31年 yes, 平成32年 no). */
export function isYearInEra(era: Era, n: number): boolean {
  const last = eraLastYear(era);
  return Number.isInteger(n) && n >= 1 && (last === null || n <= last);
}

export interface WarekiYear {
  era: Era;
  year: number;
  label: string;
}

/** All 和暦 years covering a Gregorian year (two in a year when the era changed: 2019 → 平成31年・令和元年). */
export function adToWarekiYears(ad: number): WarekiYear[] {
  if (!Number.isInteger(ad)) return [];
  return ERAS.filter((e) => ad >= e.start.y && (e.end === null || ad <= e.end.y)).map((era) => {
    const year = ad - eraOffset(era);
    return { era, year, label: eraYearLabel(era.name, year) };
  });
}

/** 「平成31年／令和元年」, or 「—」 before 1868. */
export function warekiYearsText(ad: number, sep = '／'): string {
  const list = adToWarekiYears(ad);
  return list.length ? list.map((w) => w.label).join(sep) : '—';
}

export interface WarekiDate {
  era: Era;
  year: number;
  /** 「令和8年10月29日」 */
  label: string;
  /** 「R8.10.29」 */
  short: string;
  /** The same day in the previous era on 改元当日 (大正元年7月30日 → 明治45年7月30日), else null. */
  alt: string | null;
}

/** 西暦の日付 → 和暦. Null before 1873-01-01 (太陽暦採用前) or for an invalid date. */
export function toWareki(date: YMD): WarekiDate | null {
  if (!isValidYMD(date) || key(date) < key(GREGORIAN_START)) return null;
  let index = -1;
  ERAS.forEach((e, i) => {
    if (key(date) >= key(e.start)) index = i;
  });
  const era = ERAS[index];
  const year = date.y - eraOffset(era);
  const label = `${eraYearLabel(era.name, year)}${date.m}月${date.d}日`;
  // 大正・昭和は前の天皇の崩御当日に改元したので、その日は旧元号でも表記される。
  const prev = ERAS[index - 1];
  const isSameDayChange = key(date) === key(era.start) && (era.name === '大正' || era.name === '昭和');
  const alt = isSameDayChange && prev ? `${eraYearLabel(prev.name, date.y - eraOffset(prev))}${date.m}月${date.d}日` : null;
  return { era, year, label, short: `${era.letter}${year}.${date.m}.${date.d}`, alt };
}

export interface FromWarekiResult {
  /** The Gregorian date (computed even when the 和暦 date does not exist, e.g. 平成32年 → 2020). */
  date: YMD;
  /** False when the date is outside the era (平成31年5月1日, 令和元年4月30日). */
  inEra: boolean;
  /** The correct 和暦 for that date (令和元年5月1日), or null before 1873. */
  actual: WarekiDate | null;
}

/** 和暦の日付 → 西暦. Null when the month/day is invalid or the year is not a positive integer. */
export function fromWareki(era: Era, year: number, m: number, d: number): FromWarekiResult | null {
  const y = warekiYearToAD(era, year);
  const date = { y, m, d };
  if (!Number.isFinite(y) || !isValidYMD(date)) return null;
  const inEra = key(date) >= key(era.start) && (era.end === null || key(date) <= key(era.end));
  return { date, inEra, actual: toWareki(date) };
}

/* ---------- text input ---------- */

const toHalfWidth = (s: string) =>
  s
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[．／－ー―‐]/g, (ch) => ({ '．': '.', '／': '/', '－': '-', 'ー': '-', '―': '-', '‐': '-' })[ch] ?? ch);

export type ParsedInput =
  | { kind: 'ad'; date: YMD }
  | { kind: 'wareki'; era: Era; year: number; m: number; d: number };

/**
 * Reads a date typed in the usual Japanese forms:
 * 西暦「2026/10/29」「2026-10-29」「2026年10月29日」「20261029」;
 * 和暦「令和8年10月29日」「令和元年5月1日」「R8.10.29」「H31/4/30」「S64-1-7」「r1.5.1」.
 * Returns null when it cannot be read or the month/day is invalid.
 */
export function parseDateInput(input: string): ParsedInput | null {
  const text = toHalfWidth(input).trim().replace(/\s+/g, '');
  if (!text) return null;
  const eraNames = ERAS.map((e) => e.name).join('|');
  const w = new RegExp(`^(${eraNames}|[MTSHRmtshr])(元|\\d{1,2})[年./-](\\d{1,2})[月./-](\\d{1,2})日?$`).exec(text);
  if (w) {
    const era = findEra(w[1]);
    const year = w[2] === '元' ? 1 : Number(w[2]);
    const m = Number(w[3]);
    const d = Number(w[4]);
    if (!era || year < 1 || !isValidYMD({ y: eraOffset(era) + year, m, d })) return null;
    return { kind: 'wareki', era, year, m, d };
  }
  const sep = /^(?:西暦)?(\d{4})[年./-](\d{1,2})[月./-](\d{1,2})日?$/.exec(text);
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  const match = sep ?? compact;
  if (!match) return null;
  const date = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  return isValidYMD(date) ? { kind: 'ad', date } : null;
}

/* ---------- 干支 ---------- */

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEM_READINGS = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCH_READINGS = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;

export interface Eto {
  /** 十干十二支「丙午」 */
  kanshi: string;
  /** 「ひのえうま」 */
  reading: string;
  /** 十二支「午」 */
  branch: string;
  /** 「うま」 */
  branchReading: string;
}

/** 干支 of a Gregorian year (年賀状などの慣習どおり 1月1日で切り替え). 1984 = 甲子. */
export function etoOf(year: number): Eto {
  const s = mod(year - 4, 10);
  const b = mod(year - 4, 12);
  return {
    kanshi: STEMS[s] + BRANCHES[b],
    reading: STEM_READINGS[s] + BRANCH_READINGS[b],
    branch: BRANCHES[b],
    branchReading: BRANCH_READINGS[b],
  };
}

/* ---------- 年齢・学年 ---------- */

/** 満年齢 on `on` for someone born on `birth` (誕生日を迎えた日に1歳加算する一般的な数え方). Negative = not born yet. */
export function ageOn(birth: YMD, on: YMD): number {
  const before = on.m < birth.m || (on.m === birth.m && on.d < birth.d);
  return on.y - birth.y - (before ? 1 : 0);
}

/** 早生まれ = 1月1日〜4月1日生まれ（前年4月2日以降生まれと同じ学年）. */
export function isHayaumare(birth: Pick<YMD, 'm' | 'd'>): boolean {
  return birth.m < 4 || (birth.m === 4 && birth.d === 1);
}

export interface SchoolYears {
  /** 小学校入学（4月） */
  elementary: number;
  /** 中学校入学（4月） */
  juniorHigh: number;
  /** 中学校卒業（3月） = 高校入学の年 */
  juniorHighGrad: number;
  /** 高校卒業（3月） = 大学入学の年 */
  highGrad: number;
  /** 4年制大学卒業（3月） */
  univGrad: number;
}

/**
 * Standard school years (浪人・留年なし) for someone born in `birthYear`.
 * `hayaumare` = born 1/1–4/1, which puts the child one school year earlier.
 */
export function schoolYears(birthYear: number, hayaumare = false): SchoolYears {
  const elementary = birthYear + (hayaumare ? 6 : 7);
  return {
    elementary,
    juniorHigh: elementary + 6,
    juniorHighGrad: elementary + 9,
    highGrad: elementary + 12,
    univGrad: elementary + 16,
  };
}

/** Grade on a date, e.g. 「小学3年生」, 「未就学」, or null after high school. */
export function gradeOn(birth: YMD, on: YMD): string | null {
  const entry = schoolYears(birth.y, isHayaumare(birth)).elementary;
  // School year starts April 1: Jan–Mar belong to the previous school year.
  const schoolYear = on.m >= 4 ? on.y : on.y - 1;
  const n = schoolYear - entry + 1; // 1 = 小学1年
  if (n < 1) return '未就学';
  if (n <= 6) return `小学${n}年生`;
  if (n <= 9) return `中学${n - 6}年生`;
  if (n <= 12) return `高校${n - 9}年生`;
  return null;
}

/* ---------- 年齢早見表 ---------- */

export interface AgeRow {
  ad: number;
  wareki: string;
  eto: Eto;
  /** 満年齢 in `currentYear` after the birthday. */
  age: number;
  school: SchoolYears;
}

/** Rows newest first (0歳 at the top), from `currentYear` down to `fromYear`. */
export function ageTable(currentYear: number, fromYear = 1926): AgeRow[] {
  const rows: AgeRow[] = [];
  for (let ad = currentYear; ad >= fromYear; ad--) {
    rows.push({ ad, wareki: warekiYearsText(ad), eto: etoOf(ad), age: currentYear - ad, school: schoolYears(ad) });
  }
  return rows;
}

/* ---------- formatting ---------- */

export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

const p2 = (n: number) => String(n).padStart(2, '0');

/** 「2026年10月29日（木）」 */
export function formatAdJa(date: YMD): string {
  return `${date.y}年${date.m}月${date.d}日（${WEEKDAYS_JA[weekdayOf(date)]}）`;
}

/** 「2026/10/29」 */
export function formatAdSlash(date: YMD): string {
  return `${date.y}/${p2(date.m)}/${p2(date.d)}`;
}

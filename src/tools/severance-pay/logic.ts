/**
 * 資遣費、預告期間與預告工資試算。
 *
 * - 勞退新制（勞工退休金條例第 12 條）：適用本條例後之工作年資，每滿 1 年發給 1/2 個月平均工資，未滿 1 年者以比例計給；
 *   最高以發給 6 個月平均工資為限；應於終止勞動契約後 30 日內發給。https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030020&flno=12
 * - 勞退舊制（勞動基準法第 17 條）：每滿 1 年發給 1 個月平均工資；剩餘月數或工作未滿 1 年者以比例計給，未滿 1 個月者以 1 個月計；
 *   無上限。同時有新、舊制年資者分段計算後合計（勞退條例第 11 條）。
 * - 勞動部「資遣費如何計算」（2025-09-04 更新）https://www.mol.gov.tw/1607/28162/28296/81778/81793/81935/
 *   例：平均工資 30,000 元、年資 3 年 6 個月 15 天：
 *   舊制 30,000 × {3 + [(6 + 1) ÷ 12]} ≈ 107,500 元；新制 30,000 × 1/2 × {3 + [(6 + 15/30) ÷ 12]} ≈ 53,125 元。
 *   → 新制畸零日數以「日數 ÷ 30」換算為月；舊制畸零日數直接進位為 1 個月。
 * - 平均工資（勞基法第 2 條第 4 款）：事由發生當日前 6 個月內所得工資總額 ÷ 該期間總日數；
 *   月平均工資依勞委會 83.4.9 台(83)勞動二字第 25564 號函，以 6 個月工資總額 ÷ 6 計算。
 *   https://www.mol.gov.tw/1607/28690/2282/2284/2290/7111/
 * - 預告期間（勞基法第 16 條）：繼續工作 3 個月以上 1 年未滿 10 日、1 年以上 3 年未滿 20 日、3 年以上 30 日；
 *   雇主未依規定預告應給付預告期間工資；勞工接到預告後，為另謀工作得請謀職假，每星期不超過 2 日之工作時間，工資照給。
 * - 預告期間工資（勞動部 109.10.29 勞動關 2 字第 1090128292A 號令）：月薪制一日工資＝契約終止前最近 1 個月正常工作時間
 *   所得工資 ÷ 30；低於平均工資者以平均工資（日）計給。https://www.mol.gov.tw/1607/28162/28296/81778/81787/81925/
 * - 勞退新制自 2005-07-01 施行；施行前到職者 5 年內（至 2010-06-30）得改選新制，舊制年資保留（勞退條例第 9、11 條）。
 *
 * 年資計算：從到職日起算至最後工作日（含當日），先取完整年、月，剩餘為日數。
 */
import { addMonths, compare, parseISODate, toISO, toMs, type YMD } from '../annual-leave/logic';

export { parseISODate, toISO, type YMD };

export const NEW_SYSTEM_START: YMD = { y: 2005, m: 7, d: 1 };
/** 舊制勞工改選新制的最後期限（含）。 */
export const LAST_SWITCH_DATE: YMD = { y: 2010, m: 6, d: 30 };
/** 新制資遣費上限（月）。 */
export const NEW_SYSTEM_CAP_MONTHS = 6;

const DAY_MS = 86_400_000;

export function addDays(v: YMD, days: number): YMD {
  const d = new Date(toMs(v) + days * DAY_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

export function daysBetween(a: YMD, b: YMD): number {
  return Math.round((toMs(b) - toMs(a)) / DAY_MS);
}

export interface Service {
  years: number;
  months: number;
  days: number;
}

/** from（含）到 toExclusive（不含）的年資，拆成完整年、月與剩餘日數。 */
export function serviceBetween(from: YMD, toExclusive: YMD): Service {
  if (compare(toExclusive, from) <= 0) return { years: 0, months: 0, days: 0 };
  let total = (toExclusive.y - from.y) * 12 + (toExclusive.m - from.m);
  while (total > 0 && compare(addMonths(from, total), toExclusive) > 0) total--;
  const days = daysBetween(addMonths(from, total), toExclusive);
  return { years: Math.floor(total / 12), months: total % 12, days };
}

/** 年資換算為年（僅供顯示與預告期間判斷）。 */
export function serviceInMonths(s: Service): number {
  return s.years * 12 + s.months + s.days / 30;
}

/** 舊制基數（月）：每滿 1 年 1 個月，畸零月數按比例，未滿 1 個月以 1 個月計。 */
export function oldSystemMonths(s: Service): number {
  const months = s.months + (s.days > 0 ? 1 : 0);
  return s.years + months / 12;
}

/** 新制基數（月，未套上限）：每滿 1 年 1/2 個月，未滿 1 年按比例（畸零日數 ÷ 30 換算為月）。 */
export function newSystemMonthsUncapped(s: Service): number {
  return (s.years + (s.months + Math.min(s.days, 30) / 30) / 12) / 2;
}

export function newSystemMonths(s: Service): number {
  return Math.min(NEW_SYSTEM_CAP_MONTHS, newSystemMonthsUncapped(s));
}

/** 勞基法第 16 條預告日數（依總年資）。 */
export function noticeDays(totalService: Service): number {
  const m = totalService.years * 12 + totalService.months;
  if (m < 3) return 0;
  if (m < 12) return 10;
  if (m < 36) return 20;
  return 30;
}

/**
 * 適用制度（僅在 2005-07-01 前到職時有差別）：
 * - mixed：保留舊制年資並改選新制（新舊制分段計算）。
 * - old：一直適用舊制，未改選新制。
 * - settled：改選新制時舊制年資已結清，只計新制年資。
 */
export type Scheme = 'mixed' | 'old' | 'settled';

/**
 * 終止原因：
 * - employer：雇主依勞基法第 11 條或第 13 條但書資遣，需預告或給付預告工資。
 * - worker14：勞工依第 14 條（雇主違法）不經預告終止，可請求資遣費，不適用預告工資。
 */
export type Reason = 'employer' | 'worker14';

export interface SeveranceInput {
  start: YMD;
  /** 最後工作日（含）。 */
  end: YMD;
  scheme: Scheme;
  /** 改選新制日期，預設 2005-07-01。 */
  switchDate: YMD;
  /** 月平均工資，元。 */
  averageWage: number;
  /** 契約終止前最近 1 個月正常工作時間工資（月薪），元；用於預告工資。 */
  lastMonthWage: number;
  reason: Reason;
  /** 雇主已預告的日數。 */
  noticeGivenDays: number;
}

export interface Segment {
  system: 'old' | 'new';
  from: YMD;
  /** 最後一日（含）。 */
  to: YMD;
  service: Service;
  /** 基數（月），新制已套 6 個月上限。 */
  baseMonths: number;
  /** 新制被 6 個月上限截斷。 */
  capped: boolean;
  amount: number;
}

export interface SeveranceResult {
  totalService: Service;
  segments: Segment[];
  totalMonths: number;
  severance: number;
  noticeRequired: number;
  noticeOwed: number;
  /** 預告工資用的一日工資。 */
  dailyWage: number;
  /** 6 個月期間的日平均工資。 */
  dailyAverage: number;
  noticePay: number;
  total: number;
}

/** 平均工資：最近 6 個月工資總額 ÷ 6。 */
export function averageFromSix(wages: readonly number[]): number {
  return wages.reduce((s, w) => s + w, 0) / 6;
}

export function validateSeverance(input: SeveranceInput): string | null {
  const { start, end, averageWage, lastMonthWage, noticeGivenDays } = input;
  if (compare(end, start) < 0) return '最後工作日不可早於到職日。';
  if (![averageWage, lastMonthWage, noticeGivenDays].every(Number.isFinite)) return '請輸入完整的數字。';
  if (averageWage <= 0) return '平均工資需大於 0。';
  if (averageWage > 10_000_000 || lastMonthWage > 10_000_000) return '工資請輸入 1,000 萬元以下。';
  if (lastMonthWage < 0) return '月薪不可為負數。';
  if (noticeGivenDays < 0 || !Number.isInteger(noticeGivenDays)) return '已預告日數請輸入 0 或正整數。';
  if (compare(start, NEW_SYSTEM_START) < 0 && input.scheme !== 'old') {
    if (compare(input.switchDate, NEW_SYSTEM_START) < 0 || compare(input.switchDate, LAST_SWITCH_DATE) > 0)
      return '改選新制日期需介於 2005-07-01 到 2010-06-30 之間。';
  }
  return null;
}

function segment(system: 'old' | 'new', from: YMD, toExclusive: YMD, averageWage: number): Segment {
  const service = serviceBetween(from, toExclusive);
  const uncapped = system === 'old' ? oldSystemMonths(service) : newSystemMonthsUncapped(service);
  const baseMonths = system === 'old' ? uncapped : Math.min(NEW_SYSTEM_CAP_MONTHS, uncapped);
  return {
    system,
    from,
    to: addDays(toExclusive, -1),
    service,
    baseMonths,
    capped: baseMonths < uncapped,
    amount: Math.round(averageWage * baseMonths),
  };
}

export function calculateSeverance(input: SeveranceInput): SeveranceResult | null {
  if (validateSeverance(input)) return null;
  const { start, end, averageWage } = input;
  const endExclusive = addDays(end, 1);
  const segments: Segment[] = [];

  if (compare(start, NEW_SYSTEM_START) >= 0) {
    segments.push(segment('new', start, endExclusive, averageWage));
  } else if (input.scheme === 'old' || compare(input.switchDate, endExclusive) >= 0) {
    segments.push(segment('old', start, endExclusive, averageWage));
  } else {
    if (input.scheme === 'mixed') segments.push(segment('old', start, input.switchDate, averageWage));
    segments.push(segment('new', input.switchDate, endExclusive, averageWage));
  }

  const totalService = serviceBetween(start, endExclusive);
  const severance = segments.reduce((s, x) => s + x.amount, 0);
  const totalMonths = segments.reduce((s, x) => s + x.baseMonths, 0);

  // 預告工資：一日工資 = max(最近一個月正常工時工資 ÷ 30, 6 個月工資總額 ÷ 該期間總日數)。
  const periodDays = daysBetween(addMonths(endExclusive, -6), endExclusive);
  const dailyAverage = (averageWage * 6) / periodDays;
  const dailyWage = Math.max(input.lastMonthWage / 30, dailyAverage);
  const noticeRequired = input.reason === 'employer' ? noticeDays(totalService) : 0;
  const noticeOwed = Math.max(0, noticeRequired - input.noticeGivenDays);
  const noticePay = Math.round(dailyWage * noticeOwed);

  return {
    totalService,
    segments,
    totalMonths,
    severance,
    noticeRequired,
    noticeOwed,
    dailyWage,
    dailyAverage,
    noticePay,
    total: severance + noticePay,
  };
}

export function formatService(s: Service): string {
  const parts: string[] = [];
  if (s.years) parts.push(`${s.years} 年`);
  if (s.months) parts.push(`${s.months} 個月`);
  if (s.days || parts.length === 0) parts.push(`${s.days} 天`);
  return parts.join(' ');
}

// 日割り計算（家賃・給与・月額料金）. Pure functions; amounts are whole yen.
//
// Background (checked 2026-10-29):
// - 民法第89条第2項「法定果実は、これを収取する権利の存続期間に応じて、日割計算によりこれを取得する。」
//   (e-Gov 法令検索 https://laws.e-gov.go.jp/law/129AC0000000089 ) — the legal basis for prorating rent by days.
// - How the base is chosen (その月の暦日数／30日／365日) is not fixed by law; for rent it is set by the 賃貸借契約,
//   for salary by the 就業規則・賃金規程（暦日数、所定労働日数、月平均所定労働日数 などの方式がある）.
// - Day counts here include both the first and the last day (入居日・退去日も1日として数える), which is how
//   rent proration is customarily done; 民法第140条の初日不算入 applies to periods "from" a date and is not used.

import { daysInMonth, isValidYMD, toDayNumber, type YMD } from '../date-diff/logic';

export type Rounding = 'floor' | 'round' | 'ceil';
/** calendar = その月の日数で割る, 30 = 一律30日で割る, 365 = 年額（月額×12）を365日で割る */
export type Basis = 'calendar' | '30' | '365';

/** Rounds a non-negative amount to whole yen. Tolerates floating noise (e.g. 30967.999999). */
export function roundYen(value: number, mode: Rounding): number {
  const v = Math.round(value * 1e6) / 1e6;
  if (mode === 'floor') return Math.floor(v);
  if (mode === 'ceil') return Math.ceil(v);
  return Math.round(v);
}

/** Days in the base for a month under each basis. */
export function baseDays(basis: Basis, y: number, m: number): number {
  if (basis === '30') return 30;
  if (basis === '365') return 365;
  return daysInMonth(y, m);
}

export interface ProrateOptions {
  basis: Basis;
  rounding: Rounding;
  /** Round the daily rate to whole yen first, then multiply by days (some 不動産会社 do this). */
  roundDailyFirst?: boolean;
}

/** monthly × days ÷ base (365-day basis: monthly × 12 × days ÷ 365). */
export function prorateAmount(monthly: number, days: number, base: number, basis: Basis, opts: ProrateOptions): { daily: number; amount: number } {
  const yearly = basis === '365' ? monthly * 12 : monthly;
  const daily = yearly / base;
  if (opts.roundDailyFirst) {
    const d = roundYen(daily, opts.rounding);
    return { daily: d, amount: d * days };
  }
  return { daily, amount: roundYen((yearly * days) / base, opts.rounding) };
}

export interface MonthPart {
  y: number;
  m: number;
  /** Days of this month inside the period. */
  days: number;
  /** Days in the base used for this month. */
  base: number;
  /** True when the whole calendar month is covered: charged as the full monthly amount. */
  full: boolean;
  /** Daily rate (unrounded unless roundDailyFirst). */
  daily: number;
  amount: number;
}

export interface PeriodResult {
  parts: MonthPart[];
  totalDays: number;
  total: number;
}

/**
 * Prorates a monthly amount over [start, end] (both inclusive). Whole calendar months cost the full monthly
 * amount; partial months are prorated by the chosen basis. Null when the dates are invalid or end < start.
 */
export function proratePeriod(monthly: number, start: YMD, end: YMD, opts: ProrateOptions): PeriodResult | null {
  if (!isValidYMD(start) || !isValidYMD(end) || !(monthly >= 0) || toDayNumber(end) < toDayNumber(start)) return null;
  const parts: MonthPart[] = [];
  let y = start.y;
  let m = start.m;
  for (;;) {
    const dim = daysInMonth(y, m);
    const first = y === start.y && m === start.m ? start.d : 1;
    const last = y === end.y && m === end.m ? end.d : dim;
    const days = last - first + 1;
    const base = baseDays(opts.basis, y, m);
    const full = days === dim;
    if (full) {
      parts.push({ y, m, days, base, full, daily: (opts.basis === '365' ? monthly * 12 : monthly) / base, amount: monthly });
    } else {
      const r = prorateAmount(monthly, days, base, opts.basis, opts);
      parts.push({ y, m, days, base, full, ...r });
    }
    if (y === end.y && m === end.m) break;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return {
    parts,
    totalDays: toDayNumber(end) - toDayNumber(start) + 1,
    total: parts.reduce((s, p) => s + p.amount, 0),
  };
}

/** 入居日 → その月の末日 / 退去日 ← その月の1日. */
export function moveInPeriod(moveIn: YMD): { start: YMD; end: YMD } {
  return { start: moveIn, end: { y: moveIn.y, m: moveIn.m, d: daysInMonth(moveIn.y, moveIn.m) } };
}

export function moveOutPeriod(moveOut: YMD): { start: YMD; end: YMD } {
  return { start: { y: moveOut.y, m: moveOut.m, d: 1 }, end: moveOut };
}

/** 給与の日割り: 月給 × 対象日数 ÷ 基準日数（暦日数・所定労働日数・月平均所定労働日数など）. */
export function prorateSalary(monthly: number, days: number, base: number, rounding: Rounding): number | null {
  if (!(monthly >= 0) || !(days >= 0) || !(base > 0) || days > base) return null;
  return roundYen((monthly * days) / base, rounding);
}

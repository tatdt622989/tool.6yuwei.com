// 統一發票對獎 — pure logic (no DOM). Winning numbers live in ./data.json, refreshed by scripts/update-invoice.mjs.

import rawData from './data.json';
import { parsePeriodKey, periodKey, periodLabel, periodOrder, scheduleFor, type InvoicePeriod } from './parse';

export type { InvoicePeriod } from './parse';

/** All stored periods, newest first. */
export const PERIODS: readonly InvoicePeriod[] = rawData as InvoicePeriod[];
export const LATEST: InvoicePeriod = PERIODS[0];

export type PrizeId = 'special' | 'grand' | 'first' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth';

export interface Prize {
  id: PrizeId;
  name: string;
  amount: number;
  /** 對中條件 */
  rule: string;
}

/** 統一發票號碼獎 (統一發票給獎辦法), highest first. 增開六獎 has not been drawn since 111年01-02月. */
export const PRIZES: readonly Prize[] = [
  { id: 'special', name: '特別獎', amount: 10_000_000, rule: '8 碼與特別獎號碼完全相同' },
  { id: 'grand', name: '特獎', amount: 2_000_000, rule: '8 碼與特獎號碼完全相同' },
  { id: 'first', name: '頭獎', amount: 200_000, rule: '8 碼與頭獎號碼完全相同' },
  { id: 'second', name: '二獎', amount: 40_000, rule: '末 7 碼與頭獎相同' },
  { id: 'third', name: '三獎', amount: 10_000, rule: '末 6 碼與頭獎相同' },
  { id: 'fourth', name: '四獎', amount: 4_000, rule: '末 5 碼與頭獎相同' },
  { id: 'fifth', name: '五獎', amount: 1_000, rule: '末 4 碼與頭獎相同' },
  { id: 'sixth', name: '六獎', amount: 200, rule: '末 3 碼與頭獎相同' },
];

const prize = (id: PrizeId) => PRIZES.find((p) => p.id === id)!;

/** 頭獎 tier by how many trailing digits match a 頭獎 number (8 → 頭獎 … 3 → 六獎). */
const TIER_BY_SUFFIX: Record<number, PrizeId> = { 8: 'first', 7: 'second', 6: 'third', 5: 'fourth', 4: 'fifth', 3: 'sixth' };

/** Keep digits only (full-width digits converted), e.g. 「ＡＢ-1234 5678」→ '12345678'. */
export function normalizeInput(raw: string): string {
  return raw.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\D/g, '');
}

function commonSuffix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
  return n;
}

export interface CheckResult {
  /** The trailing digits that were checked (3–8 digits). */
  digits: string;
  /** Best prize already certain from these digits, or null. */
  prize: Prize | null;
  /** The winning number that produced `prize`. */
  matched: string | null;
  /** Higher prizes that are still possible but need more (leading) digits to decide. Highest first. */
  possible: Prize[];
}

/**
 * Check the last `digits.length` digits (3–8) of an invoice number against one period.
 * With 8 digits the answer is final; with fewer, `possible` lists what more digits could still turn up.
 */
export function checkNumber(digits: string, period: InvoicePeriod): CheckResult {
  if (!/^\d{3,8}$/.test(digits)) throw new Error('Enter 3 to 8 digits');
  const n = digits.length;
  let best: Prize | null = null;
  let matched: string | null = null;
  const possible = new Set<PrizeId>();
  const consider = (p: Prize, number: string) => {
    if (!best || p.amount > best.amount) {
      best = p;
      matched = number;
    }
  };

  for (const number of period.first) {
    const k = commonSuffix(digits, number);
    if (k >= 3) consider(prize(TIER_BY_SUFFIX[k]), number);
    if (k === n && n < 8) for (let more = n + 1; more <= 8; more++) possible.add(TIER_BY_SUFFIX[more]);
  }
  for (const [id, number] of [
    ['special', period.special],
    ['grand', period.grand],
  ] as const) {
    if (n === 8 && digits === number) consider(prize(id), number);
    else if (n < 8 && number.endsWith(digits)) possible.add(id);
  }

  const floor = (best as Prize | null)?.amount ?? 0;
  return {
    digits,
    prize: best,
    matched,
    possible: PRIZES.filter((p) => possible.has(p.id) && p.amount > floor),
  };
}

export interface PrizeTax {
  /** 20% 所得稅 withheld when a single prize exceeds NT$5,000 (三獎以上), 分離課稅. */
  incomeTax: number;
  /** 0.4% 印花稅 for prizes of NT$500 or more claimed in person; waived when paid to a registered bank account. */
  stamp: number;
  net: number;
}

export function prizeTax(amount: number, viaAccount = false): PrizeTax {
  const incomeTax = amount > 5_000 ? Math.round(amount * 0.2) : 0;
  const stamp = !viaAccount && amount >= 500 ? Math.round(amount * 0.004) : 0;
  return { incomeTax, stamp, net: amount - incomeTax - stamp };
}

/** 10,000,000 → 「1,000 萬元」, 4,000 → 「4,000 元」. */
export function formatPrize(amount: number): string {
  if (amount >= 10_000 && amount % 10_000 === 0) return `${(amount / 10_000).toLocaleString('zh-TW')} 萬元`;
  return `${amount.toLocaleString('zh-TW')} 元`;
}

// ---------- Dates (all ISO yyyy-mm-dd, Asia/Taipei calendar days) ----------

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const pad = (n: number) => String(n).padStart(2, '0');

function ymd(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

/** Today's date in Taiwan, whatever the device timezone. */
export function todayInTaipei(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = ymd(fromIso);
  const [y2, m2, d2] = ymd(toIso);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** '2026-11-25' → '2026/11/25（三）'. */
export function formatDate(iso: string, withWeekday = true): string {
  const [y, m, d] = ymd(iso);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return withWeekday ? `${y}/${m}/${d}（${wd}）` : `${y}/${m}/${d}`;
}

/** '115-07-08' → '115年7-8月' (the form people search for). */
export function shortLabel(key: string): string {
  const { rocYear, startMonth } = parsePeriodKey(key);
  return `${rocYear}年${startMonth}-${startMonth + 1}月`;
}

export interface Draw {
  date: string;
  period: string;
  label: string;
}

/** The period drawn on the 25th of odd month `m` of Gregorian year `y`. */
function drawOf(y: number, m: number): Draw {
  const startIndex = y * 12 + (m - 1) - 2;
  const sy = Math.floor(startIndex / 12);
  const sm = (startIndex % 12) + 1;
  return { date: `${y}-${pad(m)}-25`, period: periodKey(sy - 1911, sm), label: periodLabel(sy - 1911, sm) };
}

/** Next draw on or after `today` (the 25th of an odd month). */
export function nextDraw(today: string): Draw {
  const [y, m, d] = ymd(today);
  if (m % 2 === 1 && d <= 25) return drawOf(y, m);
  const next = m % 2 === 1 ? m + 2 : m + 1;
  return next > 12 ? drawOf(y + 1, next - 12) : drawOf(y, next);
}

/** Most recent draw on or before `today`. */
export function lastDraw(today: string): Draw {
  const [y, m, d] = ymd(today);
  if (m % 2 === 1 && d >= 25) return drawOf(y, m);
  const prev = m % 2 === 1 ? m - 2 : m - 1;
  return prev < 1 ? drawOf(y - 1, prev + 12) : drawOf(y, prev);
}

/** The draw after a given period, e.g. 115-07-08 → 2026-11-25 for 115年09-10月. */
export function drawAfter(period: InvoicePeriod): Draw {
  const { rocYear, startMonth } = parsePeriodKey(period.period);
  const nextStart = startMonth === 11 ? 1 : startMonth + 2;
  const nextYear = startMonth === 11 ? rocYear + 1 : rocYear;
  return {
    date: scheduleFor(nextYear, nextStart).drawDate,
    period: periodKey(nextYear, nextStart),
    label: periodLabel(nextYear, nextStart),
  };
}

/** True when a draw has happened that is newer than the newest stored period (data not refreshed yet). */
export function isStale(periods: readonly InvoicePeriod[], today: string): boolean {
  if (periods.length === 0) return true;
  return periodOrder(lastDraw(today).period) > periodOrder(periods[0].period);
}

export type ClaimState = 'upcoming' | 'open' | 'expired';

export function claimStatus(period: InvoicePeriod, today: string): { state: ClaimState; days: number } {
  if (today < period.claimStart) return { state: 'upcoming', days: daysBetween(today, period.claimStart) };
  if (today > period.claimEnd) return { state: 'expired', days: daysBetween(period.claimEnd, today) };
  // Days left including today.
  return { state: 'open', days: daysBetween(today, period.claimEnd) + 1 };
}

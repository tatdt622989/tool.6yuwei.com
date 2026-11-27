/**
 * 特別休假（勞動基準法第 38 條，2017-01-01 起施行之現行條文）：
 * 6 個月以上 1 年未滿 3 日；1 年以上 2 年未滿 7 日；2 年以上 3 年未滿 10 日；3 年以上 5 年未滿每年 14 日；
 * 5 年以上 10 年未滿每年 15 日；10 年以上者，每 1 年加給 1 日，加至 30 日為止。
 * 施行細則第 24 條：特休期日得由勞雇雙方協商，於週年制、曆年制、會計年度或其他約定期間內給予；
 * 曆年制等非週年制者，依勞動部示例按比例計算（2017-07-01 到職，2018 年可休 3 + 7 × 6/12 = 6.5 日）。
 * 施行細則第 24 條之 1：未休日數之工資＝未休日數 × 一日工資（月薪制以最近一個月正常工作時間所得工資 ÷ 30）。
 * 來源：https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030001 ；勞動部特休 Q&A https://www.mol.gov.tw/1607/28690/2282/2284/2292/81173/
 */

/** 以 UTC 午夜表示的日期，避免時區造成差一天。 */
export interface YMD {
  y: number;
  m: number; // 1–12
  d: number;
}

export function parseISODate(s: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const v = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  if (v.m < 1 || v.m > 12 || v.d < 1 || v.d > daysInMonth(v.y, v.m)) return null;
  return v;
}

export function toISO(v: YMD): string {
  return `${v.y}-${String(v.m).padStart(2, '0')}-${String(v.d).padStart(2, '0')}`;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function toMs(v: YMD): number {
  return Date.UTC(v.y, v.m - 1, v.d);
}

export function compare(a: YMD, b: YMD): number {
  return toMs(a) - toMs(b);
}

/** 加月數；若該月沒有同一天（例如 8/31 + 6 個月），取該月最後一天。 */
export function addMonths(v: YMD, months: number): YMD {
  const total = v.y * 12 + (v.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return { y, m, d: Math.min(v.d, daysInMonth(y, m)) };
}

/** a 到 b 之間的月數（可為小數）：先算完整月數，剩餘天數除以下一個月區間的天數。 */
export function monthsBetween(a: YMD, b: YMD): number {
  if (compare(b, a) <= 0) return 0;
  let w = (b.y - a.y) * 12 + (b.m - a.m);
  while (w > 0 && compare(addMonths(a, w), b) > 0) w--;
  while (compare(addMonths(a, w + 1), b) <= 0) w++;
  const from = addMonths(a, w);
  const to = addMonths(a, w + 1);
  return w + (toMs(b) - toMs(from)) / (toMs(to) - toMs(from));
}

/** 依已滿年資（月）回傳該年度的特休日數。 */
export function entitlementByMonths(months: number): number {
  if (months < 6) return 0;
  if (months < 12) return 3;
  const years = Math.floor(months / 12);
  if (years < 2) return 7;
  if (years < 3) return 10;
  if (years < 5) return 14;
  if (years < 10) return 15;
  return Math.min(30, 15 + (years - 9));
}

export interface LeavePeriod {
  /** 取得特休的日期（滿 6 個月或滿 N 年）。 */
  start: YMD;
  /** 下一次取得特休的日期（不含）。 */
  end: YMD;
  days: number;
  /** 年資標籤，例如「滿 6 個月」「滿 3 年」。 */
  label: string;
  /** 本期長度（月）：滿 6 個月那期為 6，其餘 12。 */
  lengthMonths: number;
}

/** 從到職日起依序列出各期特休（第一期為滿 6 個月）。 */
export function leavePeriods(hire: YMD, count: number): LeavePeriod[] {
  const out: LeavePeriod[] = [{ start: addMonths(hire, 6), end: addMonths(hire, 12), days: 3, label: '滿 6 個月', lengthMonths: 6 }];
  for (let n = 1; out.length < count; n++) {
    out.push({
      start: addMonths(hire, 12 * n),
      end: addMonths(hire, 12 * (n + 1)),
      days: entitlementByMonths(12 * n),
      label: `滿 ${n} 年`,
      lengthMonths: 12,
    });
  }
  return out;
}

export interface AnniversaryResult {
  /** 目前（基準日）所在的特休期間；未滿 6 個月為 null。 */
  current: LeavePeriod | null;
  next: LeavePeriod;
  serviceMonths: number;
}

/** 週年制：基準日當下可休的特休日數與期間。 */
export function anniversaryLeave(hire: YMD, on: YMD): AnniversaryResult | null {
  if (compare(on, hire) < 0) return null;
  const serviceMonths = monthsBetween(hire, on);
  const periods = leavePeriods(hire, Math.floor(serviceMonths / 12) + 3);
  const current = periods.find((p) => compare(p.start, on) <= 0 && compare(on, p.end) < 0) ?? null;
  const next = periods.find((p) => compare(p.start, on) > 0)!;
  return { current, next, serviceMonths };
}

export interface CalendarShare {
  period: LeavePeriod;
  /** 該期落在此曆年的比例（0–1）。 */
  fraction: number;
  days: number;
}

export interface CalendarResult {
  year: number;
  shares: CalendarShare[];
  total: number;
}

/** 曆年制：某一曆年（1/1–12/31）依比例可休的特休日數。 */
export function calendarYearLeave(hire: YMD, year: number): CalendarResult | null {
  if (!Number.isInteger(year) || year < hire.y || year > hire.y + 80) return null;
  const yStart: YMD = { y: year, m: 1, d: 1 };
  const yEnd: YMD = { y: year + 1, m: 1, d: 1 };
  const periods = leavePeriods(hire, year - hire.y + 3);
  const shares: CalendarShare[] = [];
  for (const p of periods) {
    const from = compare(p.start, yStart) > 0 ? p.start : yStart;
    const to = compare(p.end, yEnd) < 0 ? p.end : yEnd;
    if (compare(to, from) <= 0) continue;
    const fraction = monthsBetween(from, to) / p.lengthMonths;
    shares.push({ period: p, fraction, days: p.days * fraction });
  }
  return { year, shares, total: shares.reduce((s, x) => s + x.days, 0) };
}

/** 未休特休折算工資：未休日數 × 月薪 ÷ 30。 */
export function unusedLeavePay(days: number, monthlySalary: number): number {
  if (!(days >= 0) || !(monthlySalary >= 0)) return Number.NaN;
  return (monthlySalary / 30) * days;
}

export function todayYMD(now: Date = new Date()): YMD {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

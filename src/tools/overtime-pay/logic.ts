/**
 * 加班費計算規則（勞動基準法，現行條文）：
 * - 第 24 條第 1 項：平日延長工時，前 2 小時加給 1/3 以上（× 4/3），第 3–4 小時加給 2/3 以上（× 5/3）。
 * - 第 24 條第 2 項：休息日工作，前 2 小時另再加給 1 又 1/3，第 3 小時起另再加給 1 又 2/3；
 *   勞動部解釋第 9–12 小時另再加給 2 又 2/3（臺中市勞工局「勞動基準法常見問答集」1141125 版範例：
 *   150 ×（4/3 × 2 + 5/3 × 6 + 8/3 × 2）= 2,700 元）。
 * - 第 39 條、第 40 條：國定假日（休假日）與例假（僅限天災、事變或突發事件）出勤，8 小時內加發一日工資；
 *   超過 8 小時部分依第 24 條第 1 項，第 9–10 小時 × 4/3、第 11–12 小時 × 5/3。例假出勤並應事後補假休息。
 * - 第 32 條：正常工時加延長工時一日不得超過 12 小時；延長工時一個月不得超過 46 小時（經工會或勞資會議同意
 *   可達 54 小時、每 3 個月 138 小時）。休息日出勤時數計入延長工時總時數。
 * - 月薪制平日每小時工資額 = 月薪 ÷ 30 ÷ 8（勞動部函釋）。
 * 來源：全國法規資料庫 https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030001
 */
export const OVERTIME_RULES = {
  monthlyCap: 46,
  monthlyCapWithConsent: 54,
} as const;

export type DayType = 'weekday' | 'restDay' | 'holiday' | 'regularOff';

export interface Tier {
  /** 該段起始與結束時數（當日出勤第幾小時，起點不含、終點含）。 */
  from: number;
  to: number;
  /** 時薪倍數；flatDay 代表 8 小時內固定加發一日工資。 */
  multiplier: number;
  flatDay?: boolean;
  label: string;
}

const F = (n: number, d: number) => n / d;

export const TIERS: Record<DayType, Tier[]> = {
  weekday: [
    { from: 0, to: 2, multiplier: F(4, 3), label: '延長工時前 2 小時 × 1⅓' },
    { from: 2, to: 4, multiplier: F(5, 3), label: '延長工時第 3–4 小時 × 1⅔' },
  ],
  restDay: [
    { from: 0, to: 2, multiplier: F(4, 3), label: '第 1–2 小時 × 1⅓' },
    { from: 2, to: 8, multiplier: F(5, 3), label: '第 3–8 小時 × 1⅔' },
    { from: 8, to: 12, multiplier: F(8, 3), label: '第 9–12 小時 × 2⅔' },
  ],
  holiday: [
    { from: 0, to: 8, multiplier: 8, flatDay: true, label: '8 小時內加發一日工資' },
    { from: 8, to: 10, multiplier: F(4, 3), label: '第 9–10 小時 × 1⅓' },
    { from: 10, to: 12, multiplier: F(5, 3), label: '第 11–12 小時 × 1⅔' },
  ],
  regularOff: [
    { from: 0, to: 8, multiplier: 8, flatDay: true, label: '8 小時內加發一日工資（並應補假）' },
    { from: 8, to: 10, multiplier: F(4, 3), label: '第 9–10 小時 × 1⅓' },
    { from: 10, to: 12, multiplier: F(5, 3), label: '第 11–12 小時 × 1⅔' },
  ],
};

export const DAY_LABEL: Record<DayType, string> = {
  weekday: '平日加班',
  restDay: '休息日出勤',
  holiday: '國定假日出勤',
  regularOff: '例假日出勤',
};

/** 每種日別單日可輸入的最多時數（平日正常 8 小時 + 延長 4 小時 = 12）。 */
export const MAX_HOURS: Record<DayType, number> = { weekday: 4, restDay: 12, holiday: 12, regularOff: 12 };

export function hourlyFromMonthly(monthly: number): number {
  return monthly / 30 / 8;
}

export interface TierLine {
  dayType: DayType;
  label: string;
  hours: number;
  multiplier: number;
  flatDay: boolean;
  /** 單日金額。 */
  amount: number;
}

/** 單日某種出勤的加班費分段明細。 */
export function dayBreakdown(dayType: DayType, hours: number, hourly: number): TierLine[] {
  const lines: TierLine[] = [];
  for (const t of TIERS[dayType]) {
    const h = Math.max(0, Math.min(hours, t.to) - t.from);
    if (h <= 0) continue;
    const amount = t.flatDay ? hourly * 8 : hourly * t.multiplier * h;
    lines.push({ dayType, label: t.label, hours: h, multiplier: t.multiplier, flatDay: !!t.flatDay, amount });
  }
  return lines;
}

export interface OvertimeEntry {
  dayType: DayType;
  /** 單日出勤（平日為延長）時數。 */
  hours: number;
  /** 天數。 */
  days: number;
}

export interface OvertimeResult {
  hourly: number;
  lines: (TierLine & { days: number; total: number })[];
  total: number;
  /** 計入第 32 條每月 46 小時上限的延長工時。 */
  countedHours: number;
  overCap: boolean;
}

export function validateOvertime(hourly: number, entries: OvertimeEntry[]): string | null {
  if (!Number.isFinite(hourly) || hourly <= 0) return '請輸入大於 0 的月薪或時薪。';
  for (const e of entries) {
    if (!Number.isFinite(e.hours) || !Number.isFinite(e.days)) return '請輸入完整的數字。';
    if (e.hours < 0 || e.days < 0) return '時數與天數不可為負數。';
    if (e.hours > MAX_HOURS[e.dayType]) return `${DAY_LABEL[e.dayType]}單日最多 ${MAX_HOURS[e.dayType]} 小時。`;
    if (!Number.isInteger(e.days) || e.days > 31) return '天數請輸入 0 到 31 的整數。';
  }
  return null;
}

export function calculateOvertime(hourly: number, entries: OvertimeEntry[]): OvertimeResult | null {
  if (validateOvertime(hourly, entries)) return null;
  const lines: OvertimeResult['lines'] = [];
  let countedHours = 0;
  for (const e of entries) {
    if (e.hours <= 0 || e.days <= 0) continue;
    for (const line of dayBreakdown(e.dayType, e.hours, hourly)) {
      lines.push({ ...line, days: e.days, total: line.amount * e.days });
    }
    const counted = e.dayType === 'weekday' || e.dayType === 'restDay' ? e.hours : Math.max(0, e.hours - 8);
    countedHours += counted * e.days;
  }
  const total = lines.reduce((s, l) => s + l.total, 0);
  return {
    hourly,
    lines,
    total,
    countedHours,
    overCap: countedHours > OVERTIME_RULES.monthlyCap,
  };
}

/**
 * 台電表燈（住商）非時間電價（累進電價）。查證日期 2026-10-29。
 *
 * 現行費率自 2025-10-01（民國 114 年 10 月 1 日）起實施：
 * - 台電「各類電價表及計算範例（114 年 10 月 1 日起實施）」：住宅用、住宅以外非營業用、營業用三張表與計算範例，
 *   https://www.taipower.com.tw/media/wzicn04w/各類電價表及計算範例.pdf
 * - 台電「電價表」（114.11.17 經濟部經授能字第 11400334600 號函同意備查）第三章表燈（住商）電價：
 *   「用戶因 2 個月抄表、收費一次，計費時各段度數係加倍計算。」
 * - 台電常見問答「請問電費如何計算？」（更新 2026-05-05）：夏月為 6 月 1 日至 9 月 30 日；跨夏月與非夏月的計費期間，
 *   分別以夏月、非夏月單價計算整期電費後，依兩段日數占全期日數的比例加權，例如 9/13–11/11（夏月 18 天、非夏月 42 天）
 *   350 度：[1.78 × 240 + 2.55 × 110] × 18/60 + [1.78 × 240 + 2.26 × 110] × 42/60。
 *   https://www.taipower.com.tw/2289/2558/2705/22997/normalPost
 * - 經濟部電價費率審議會 2026 年 4 月與 9 月 18 日兩次會議皆決議電價凍漲（平均每度 3.7823 元），
 *   下一次審議為 2026 年 12 月，若調整自 2027-01-01 起適用（自由時報 https://ec.ltn.com.tw/article/breakingnews/5578451）。
 */
export const TARIFF_EFFECTIVE = '2025-10-01';

export type CustomerType = 'residential' | 'business';
export type Season = 'summer' | 'nonSummer';

export interface Tier {
  /** 每月用電度數上限（含），最後一段為 Infinity。 */
  upTo: number;
  summer: number;
  nonSummer: number;
}

export const TARIFFS: Record<CustomerType, { label: string; tiers: Tier[] }> = {
  residential: {
    label: '住宅用（含住宅以外非營業用）',
    tiers: [
      { upTo: 120, summer: 1.78, nonSummer: 1.78 },
      { upTo: 330, summer: 2.55, nonSummer: 2.26 },
      { upTo: 500, summer: 3.8, nonSummer: 3.13 },
      { upTo: 700, summer: 5.14, nonSummer: 4.24 },
      { upTo: 1000, summer: 6.44, nonSummer: 5.27 },
      { upTo: Infinity, summer: 8.86, nonSummer: 7.03 },
    ],
  },
  business: {
    label: '營業用（小商店、辦公室）',
    tiers: [
      { upTo: 330, summer: 2.71, nonSummer: 2.28 },
      { upTo: 700, summer: 3.76, nonSummer: 3.1 },
      { upTo: 1500, summer: 4.46, nonSummer: 3.61 },
      { upTo: 3000, summer: 7.08, nonSummer: 5.56 },
      { upTo: Infinity, summer: 7.43, nonSummer: 5.83 },
    ],
  },
};

export interface TierRow {
  /** 本段起訖度數（已依抄表月數加倍），from 不含、to 含。 */
  from: number;
  to: number;
  kwh: number;
  price: number;
  amount: number;
}

export interface SeasonBill {
  season: Season;
  rows: TierRow[];
  /** 整期全部以此季節單價計算的電費（未四捨五入）。 */
  amount: number;
}

/** 以單一季節單價計算整期累進電費；months = 2 時各段度數加倍。 */
export function seasonBill(kwh: number, customer: CustomerType, months: 1 | 2, season: Season): SeasonBill {
  const rows: TierRow[] = [];
  let from = 0;
  let amount = 0;
  for (const tier of TARIFFS[customer].tiers) {
    const to = tier.upTo * months;
    const used = Math.max(0, Math.min(kwh, to) - from);
    const price = tier[season];
    if (used > 0) {
      rows.push({ from, to, kwh: used, price, amount: used * price });
      amount += used * price;
    }
    if (kwh <= to) break;
    from = to;
  }
  return { season, rows, amount };
}

export interface BillInput {
  /** 本期用電度數。 */
  kwh: number;
  customer: CustomerType;
  /** 每 1 個月或 2 個月抄表一次。 */
  months: 1 | 2;
  /** 計費期間中屬於夏月（6/1–9/30）與非夏月的日數。 */
  summerDays: number;
  nonSummerDays: number;
}

export interface BillResult {
  /** 應繳電費（四捨五入到元）。 */
  total: number;
  /** 未四捨五入的電費，用來計算增加用電的邊際成本。 */
  exact: number;
  /** 平均每度電價。 */
  average: number;
  summerShare: number;
  summer: SeasonBill | null;
  nonSummer: SeasonBill | null;
  /** 最後 1 度電適用的單價（依日數加權）。 */
  marginalPrice: number;
}

export function validateBill(input: BillInput): string | null {
  const { kwh, summerDays, nonSummerDays } = input;
  if (![kwh, summerDays, nonSummerDays].every(Number.isFinite)) return '請輸入完整的數字。';
  if (kwh < 0) return '用電度數不可為負數。';
  if (kwh > 1_000_000) return '用電度數請輸入 100 萬度以下。';
  if (summerDays < 0 || nonSummerDays < 0 || summerDays + nonSummerDays <= 0) return '計費期間的日數需大於 0。';
  return null;
}

export function calculateBill(input: BillInput): BillResult | null {
  if (validateBill(input)) return null;
  const { kwh, customer, months, summerDays, nonSummerDays } = input;
  const share = summerDays / (summerDays + nonSummerDays);
  const summer = share > 0 ? seasonBill(kwh, customer, months, 'summer') : null;
  const nonSummer = share < 1 ? seasonBill(kwh, customer, months, 'nonSummer') : null;
  const exact = (summer?.amount ?? 0) * share + (nonSummer?.amount ?? 0) * (1 - share);
  const lastPrice = (b: SeasonBill | null) => b?.rows[b.rows.length - 1]?.price ?? 0;
  const firstTier = TARIFFS[customer].tiers[0];
  const marginalPrice =
    kwh > 0
      ? lastPrice(summer) * share + lastPrice(nonSummer) * (1 - share)
      : firstTier.summer * share + firstTier.nonSummer * (1 - share);
  const total = Math.round(exact);
  return { total, exact, average: kwh > 0 ? exact / kwh : 0, summerShare: share, summer, nonSummer, marginalPrice };
}

/** 多用 extraKwh 度電，帳單會增加多少（依累進級距計算的邊際成本）。 */
export function incrementalCost(input: BillInput, extraKwh: number): number {
  const base = calculateBill(input);
  const more = calculateBill({ ...input, kwh: input.kwh + Math.max(0, extraKwh) });
  if (!base || !more) return Number.NaN;
  return more.exact - base.exact;
}

// ---------- 日期與季節 ----------

export interface YMD {
  y: number;
  m: number;
  d: number;
}

const dayNumber = ({ y, m, d }: YMD) => Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);

export function isSummer(date: YMD): boolean {
  return date.m >= 6 && date.m <= 9;
}

/**
 * 計費期間（含起訖兩日，與台電範例 9/13–11/11 共 60 天一致）中夏月與非夏月的日數。
 * 結束日早於開始日時回傳 null。
 */
export function seasonDays(start: YMD, end: YMD): { summerDays: number; nonSummerDays: number } | null {
  const a = dayNumber(start);
  const b = dayNumber(end);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  if (b - a > 800) return null;
  let summerDays = 0;
  for (let n = a; n <= b; n++) {
    const m = new Date(n * 86_400_000).getUTCMonth() + 1;
    if (m >= 6 && m <= 9) summerDays++;
  }
  return { summerDays, nonSummerDays: b - a + 1 - summerDays };
}

// ---------- 電器耗電 ----------

export interface AppliancePreset {
  id: string;
  name: string;
  /** 常見的耗電功率（瓦）。 */
  watts: number;
  /** 預設每日使用時數。 */
  hours: number;
}

/** 常見電器的約略耗電功率，實際請以銘牌或能源效率標示為準。 */
export const APPLIANCES: AppliancePreset[] = [
  { id: 'heater-ceramic', name: '陶瓷電暖器', watts: 1200, hours: 6 },
  { id: 'heater-oil', name: '葉片式電暖器（最高檔）', watts: 1500, hours: 6 },
  { id: 'heater-halogen', name: '鹵素燈電暖器', watts: 800, hours: 4 },
  { id: 'blanket', name: '電熱毯', watts: 60, hours: 8 },
  { id: 'ac-small', name: '冷氣 2.8 kW（4–5 坪）', watts: 800, hours: 8 },
  { id: 'ac-medium', name: '冷氣 3.6 kW（5–6 坪）', watts: 1100, hours: 8 },
  { id: 'ac-large', name: '冷氣 5.0 kW（8–10 坪）', watts: 1600, hours: 8 },
  { id: 'dehumidifier', name: '除濕機（每日 12 公升）', watts: 250, hours: 8 },
  { id: 'fridge', name: '冰箱（約 400 公升，平均）', watts: 40, hours: 24 },
  { id: 'fan', name: '電風扇', watts: 40, hours: 8 },
  { id: 'tv', name: '電視（55 吋）', watts: 120, hours: 4 },
  { id: 'pc', name: '桌上型電腦', watts: 300, hours: 4 },
  { id: 'laptop', name: '筆記型電腦', watts: 60, hours: 6 },
  { id: 'dryer-hair', name: '吹風機', watts: 1200, hours: 0.25 },
  { id: 'rice-cooker', name: '電鍋', watts: 800, hours: 0.5 },
  { id: 'microwave', name: '微波爐', watts: 1200, hours: 0.25 },
  { id: 'led', name: 'LED 燈泡', watts: 10, hours: 6 },
];

/** 耗電度數 = 瓦數 × 每日時數 × 天數 × 台數 ÷ 1000。 */
export function applianceKwh(watts: number, hoursPerDay: number, days: number, quantity = 1): number {
  if (![watts, hoursPerDay, days, quantity].every(Number.isFinite)) return Number.NaN;
  if (watts < 0 || hoursPerDay < 0 || days < 0 || quantity < 0) return Number.NaN;
  return (watts * hoursPerDay * days * quantity) / 1000;
}

export function parseISODate(value: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const date: YMD = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  const check = new Date(Date.UTC(date.y, date.m - 1, date.d));
  if (check.getUTCFullYear() !== date.y || check.getUTCMonth() !== date.m - 1 || check.getUTCDate() !== date.d) return null;
  return date;
}

export function toISODate({ y, m, d }: YMD): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 從某日往前推 n 天（用於預設的計費起日）。 */
export function addDays(date: YMD, n: number): YMD {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

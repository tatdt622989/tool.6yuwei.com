/**
 * 匯率換算。資料來源：ExchangeRate-API 免費開放端點（每日更新一次、支援 CORS、無需金鑰）。
 * https://open.er-api.com/v6/latest/TWD → { result: 'success', base_code: 'TWD', time_last_update_unix,
 *   time_next_update_unix, rates: { USD: 0.0308, JPY: 4.87, ... } }（rates 為 1 TWD 可換得的外幣數量）。
 * 使用條款要求標示來源：「Rates By Exchange Rate API」並連結 https://www.exchangerate-api.com 。
 * 這是國際市場中價參考匯率，非銀行即期／現金買賣匯率。
 */
export const RATE_API_URL = 'https://open.er-api.com/v6/latest/TWD';
export const RATE_SOURCE_URL = 'https://www.exchangerate-api.com';
/** 快取 6 小時；API 每日更新一次。 */
export const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface Currency {
  code: string;
  name: string;
}

/** 台灣常用貨幣在前。 */
export const CURRENCIES: Currency[] = [
  { code: 'TWD', name: '新台幣' },
  { code: 'USD', name: '美元' },
  { code: 'JPY', name: '日圓' },
  { code: 'EUR', name: '歐元' },
  { code: 'CNY', name: '人民幣' },
  { code: 'HKD', name: '港幣' },
  { code: 'KRW', name: '韓元' },
  { code: 'GBP', name: '英鎊' },
  { code: 'AUD', name: '澳幣' },
  { code: 'SGD', name: '新加坡幣' },
  { code: 'THB', name: '泰銖' },
  { code: 'VND', name: '越南盾' },
  { code: 'MYR', name: '馬來西亞令吉' },
  { code: 'PHP', name: '菲律賓披索' },
  { code: 'IDR', name: '印尼盾' },
  { code: 'CAD', name: '加幣' },
  { code: 'NZD', name: '紐西蘭幣' },
  { code: 'CHF', name: '瑞士法郎' },
  { code: 'MOP', name: '澳門幣' },
  { code: 'INR', name: '印度盧比' },
  { code: 'AED', name: '阿聯酋迪拉姆' },
  { code: 'SEK', name: '瑞典克朗' },
  { code: 'ZAR', name: '南非幣' },
  { code: 'TRY', name: '土耳其里拉' },
];

export function currencyName(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.name ?? code;
}

export interface RateData {
  base: 'TWD';
  /** 1 TWD 可換得的各幣別數量。 */
  rates: Record<string, number>;
  updatedUnix: number;
  nextUpdateUnix: number;
}

/** 驗證並整理 API 回應；格式不符時回傳 null。 */
export function parseRateResponse(json: unknown): RateData | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (o.result !== 'success' || o.base_code !== 'TWD') return null;
  const raw = o.rates;
  if (!raw || typeof raw !== 'object') return null;
  const rates: Record<string, number> = {};
  for (const [code, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/^[A-Z]{3}$/.test(code) && typeof v === 'number' && Number.isFinite(v) && v > 0) rates[code] = v;
  }
  rates.TWD = 1;
  if (Object.keys(rates).length < 2) return null;
  const updated = typeof o.time_last_update_unix === 'number' ? o.time_last_update_unix : 0;
  const next = typeof o.time_next_update_unix === 'number' ? o.time_next_update_unix : 0;
  return { base: 'TWD', rates, updatedUnix: updated, nextUpdateUnix: next };
}

/** 把 amount 單位的 from 幣換成 to 幣。 */
export function convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
  const f = rates[from];
  const t = rates[to];
  if (!f || !t || !Number.isFinite(amount)) return Number.NaN;
  return (amount / f) * t;
}

/** 1 單位 from 等於多少 to。 */
export function unitRate(from: string, to: string, rates: Record<string, number>): number {
  return convert(1, from, to, rates);
}

export interface CachedRates {
  fetchedAt: number;
  data: RateData;
}

export function isFresh(cache: CachedRates | null, now: number, maxAge = CACHE_MAX_AGE_MS): boolean {
  return !!cache && now - cache.fetchedAt < maxAge && now >= cache.fetchedAt;
}

/** 依數值大小決定小數位數：大額 2 位、小額保留 4 位有效感。 */
export function decimalsFor(value: number): number {
  const v = Math.abs(value);
  if (v === 0 || v >= 100) return 2;
  if (v >= 1) return 3;
  if (v >= 0.01) return 4;
  return 6;
}

/** 快速對照表的金額。 */
export function quickAmounts(from: string): number[] {
  const big = ['JPY', 'KRW', 'VND', 'IDR'];
  if (from === 'VND' || from === 'IDR') return [10_000, 50_000, 100_000, 500_000, 1_000_000, 5_000_000];
  if (big.includes(from)) return [100, 500, 1_000, 5_000, 10_000, 50_000, 100_000];
  if (from === 'TWD') return [100, 500, 1_000, 5_000, 10_000, 50_000, 100_000];
  return [1, 5, 10, 50, 100, 500, 1_000, 5_000];
}

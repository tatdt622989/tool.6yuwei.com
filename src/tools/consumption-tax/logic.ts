// 消費税の計算（税込⇄税抜、軽減税率、インボイスの端数処理）. Pure functions; amounts are whole yen (integers).
//
// Sources (checked 2026-10-29):
// - 税率: 標準税率10%（消費税7.8%＋地方消費税2.2%）、軽減税率8%（消費税6.24%＋地方消費税1.76%）。
//   軽減税率の対象は「飲食料品（酒類・外食等を除く）」と「週2回以上発行される新聞の定期購読」。一体資産は税抜1万円以下かつ
//   食品部分の価額が3分の2以上なら全体が8%。財務省「消費税の軽減税率制度について」https://www.mof.go.jp/tax_policy/summary/consumption/keigen_02.pdf 、
//   名古屋国税局 説明会資料 https://www.kanzei.or.jp/nagoya/nagoya_files/20190906-1.pdf
// - インボイス（適格請求書）の端数処理: 国税庁「消費税の仕入税額控除制度における適格請求書等保存方式に関するQ&A」問57
//   https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/qa/57.pdf
//   「一の適格請求書につき、税率ごとに１回の端数処理を行う」。切上げ・切捨て・四捨五入のいずれによるかは事業者の任意。
//   個々の商品ごとに端数処理して合計する方法は認められない。
// - 税込価格からの消費税額は 税込価額 × 10/110（軽減税率は 8/108）。
// - 総額表示（税込価格の表示）義務: 消費税法第63条、2021年4月1日から（国税庁 タックスアンサー No.6902）。

export type TaxRate = 10 | 8;
export type Rounding = 'floor' | 'round' | 'ceil';

export const RATES: readonly TaxRate[] = [10, 8];

/** National / local split of each rate, in percent. */
export const RATE_SPLIT: Record<TaxRate, { national: number; local: number }> = {
  10: { national: 7.8, local: 2.2 },
  8: { national: 6.24, local: 1.76 },
};

/**
 * Exact integer division with rounding of |num / den| (den > 0); the sign is kept, so 切り捨て on a refund
 * (negative amount) rounds toward zero just like a sale.
 */
export function roundDiv(num: number, den: number, mode: Rounding): number {
  if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0) return Number.NaN;
  const sign = num < 0 ? -1 : 1;
  const a = Math.abs(num);
  const q = Math.floor(a / den);
  const r = a - q * den;
  let out = q;
  if (mode === 'ceil' && r > 0) out = q + 1;
  else if (mode === 'round' && r * 2 >= den) out = q + 1;
  return sign * out || 0;
}

/** 消費税額 from a tax-exclusive amount: net × rate ÷ 100. */
export function taxFromNet(net: number, rate: TaxRate, rounding: Rounding): number {
  return roundDiv(net * rate, 100, rounding);
}

/** 消費税額 from a tax-inclusive amount: gross × rate ÷ (100 + rate) (10/110, 8/108). */
export function taxFromGross(gross: number, rate: TaxRate, rounding: Rounding): number {
  return roundDiv(gross * rate, 100 + rate, rounding);
}

export interface TaxBreakdown {
  net: number;
  tax: number;
  gross: number;
}

/** 税抜 → 税込 (外税). */
export function netToGross(net: number, rate: TaxRate, rounding: Rounding): TaxBreakdown {
  const tax = taxFromNet(net, rate, rounding);
  return { net, tax, gross: net + tax };
}

/** 税込 → 税抜 (内税): the tax is computed from the gross price and subtracted. */
export function grossToNet(gross: number, rate: TaxRate, rounding: Rounding): TaxBreakdown {
  const tax = taxFromGross(gross, rate, rounding);
  return { net: gross - tax, tax, gross };
}

/* ---------- receipt / インボイス ---------- */

export interface Line {
  name?: string;
  /** 単価 (税抜 for exclusive mode, 税込 for inclusive mode), whole yen; negative for 値引き. */
  price: number;
  /** Whole number of items. */
  qty: number;
  rate: TaxRate;
}

export type PriceMode = 'exclusive' | 'inclusive';

export interface RateTotal extends TaxBreakdown {
  rate: TaxRate;
  /** Number of lines at this rate. */
  lines: number;
}

export interface InvoiceResult {
  /** One entry per rate that has lines, 10% first. */
  byRate: RateTotal[];
  net: number;
  tax: number;
  gross: number;
  /** Tax if every line were rounded separately and summed (not allowed for インボイス), for comparison. */
  perLineTax: number;
}

export function lineAmount(line: Line): number {
  return line.price * line.qty;
}

export function isValidLine(line: Line): boolean {
  return Number.isInteger(line.price) && Number.isInteger(line.qty) && line.qty >= 0 && (line.rate === 10 || line.rate === 8);
}

/**
 * Totals of one 適格請求書: line amounts are summed per rate, and the tax is rounded once per rate
 * (国税庁 Q&A 問57). Invalid lines are ignored.
 */
export function calcInvoice(lines: readonly Line[], mode: PriceMode, rounding: Rounding): InvoiceResult {
  const valid = lines.filter(isValidLine);
  const calc = mode === 'exclusive' ? netToGross : grossToNet;
  const taxOf = mode === 'exclusive' ? taxFromNet : taxFromGross;
  const byRate: RateTotal[] = [];
  for (const rate of RATES) {
    const at = valid.filter((l) => l.rate === rate);
    if (at.length === 0) continue;
    const sum = at.reduce((s, l) => s + lineAmount(l), 0);
    byRate.push({ rate, lines: at.length, ...calc(sum, rate, rounding) });
  }
  return {
    byRate,
    net: byRate.reduce((s, r) => s + r.net, 0),
    tax: byRate.reduce((s, r) => s + r.tax, 0),
    gross: byRate.reduce((s, r) => s + r.gross, 0),
    perLineTax: valid.reduce((s, l) => s + taxOf(lineAmount(l), l.rate, rounding), 0),
  };
}

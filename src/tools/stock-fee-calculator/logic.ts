/**
 * 台股交易成本：券商手續費、證券交易稅、交割金額、損益兩平價。全部費率集中在 FEE_RULES。
 *
 * 來源（查證日 2026-10-29）：
 * - 手續費上限 0.1425%（買賣各收一次），整股最低 20 元、零股電子下單多數券商最低 1 元，
 *   小數點以下無條件捨去：Fugle 富果「手續費怎麼算」https://support.fugle.tw/?p=169 、
 *   玉山證券 https://www.esunsec.com.tw/article/post/111 （0.1425%、低消 20 元）。
 *   手續費折扣、最低手續費與捨去／四捨五入方式由各券商自訂，本工具預設捨去並允許修改低消。
 * - 證券交易稅（證券交易稅條例第 2 條）：公司股票 0.3%、受益憑證（ETF）0.1%，僅賣出時課徵。
 * - 現股當沖證交稅減半 0.15%：立法院 2024-12-31 三讀修正證券交易稅條例第 2 條之 2，
 *   施行至 2027-12-31（https://www.cna.com.tw/news/afe/202603180213.aspx 、
 *   https://www.ctee.com.tw/news/20250101700052-430104）。ETF 本來就是 0.1%，當沖不再減半。
 * - 債券 ETF 停徵證交稅：證券交易稅條例第 2 條之 1，被動式債券 ETF 自 2017-01-01 起停徵至 2026-12-31；
 *   行政院 2026-10-01 通過修正草案延長至 2036-12-31 並納入主動式債券 ETF（自 2027-01-01），
 *   待立法院三讀（https://www.ey.gov.tw/Page/9277F759E41CCD91/0707ee37-6750-4c36-b83a-4fbeb1b6fe7c ）。
 * - 升降單位（證交所「調整股價升降單位」自 94-03-01 實施，https://www.twse.com.tw/downloads/zh/trading/introduce/introduce004.pdf ）：
 *   股票 <10:0.01、10–50:0.05、50–100:0.1、100–500:0.5、500–1000:1、≥1000:5；
 *   ETF <50:0.01、≥50:0.05（證交所營業細則受益憑證升降單位）。
 * - 證交稅計算至元，未滿 1 元捨去（券商對帳單實務）。
 * - 成交價金（股數 × 價格）在零股出現 0.5 元時四捨五入到元（假設，各券商可能略有差異）。
 */

export type SecurityType = 'stock' | 'etf' | 'bond-etf';

export const FEE_RULES = {
  /** 手續費法定上限 0.1425%。 */
  feeRate: 0.001425,
  defaultMinFee: 20,
  oddLotMinFee: 1,
  sharesPerLot: 1000,
  tax: {
    stock: 0.003,
    stockDayTrade: 0.0015,
    etf: 0.001,
    bondEtf: 0,
  },
  dayTradeTaxUntil: '2027-12-31',
  bondEtfExemptUntil: '2026-12-31',
} as const;

export const SECURITY_LABELS: Record<SecurityType, string> = {
  stock: '股票',
  etf: 'ETF',
  'bond-etf': '債券 ETF',
};

/** 證交稅率（賣出時課徵）。ETF 當沖不減半。 */
export function taxRate(type: SecurityType, dayTrade: boolean): number {
  if (type === 'bond-etf') return FEE_RULES.tax.bondEtf;
  if (type === 'etf') return FEE_RULES.tax.etf;
  return dayTrade ? FEE_RULES.tax.stockDayTrade : FEE_RULES.tax.stock;
}

/**
 * 解析手續費折數：「2.8」→ 0.28、「6」→ 0.6、「10」或空白 → 1（不打折）。
 * 也接受直接輸入小於等於 1 的比例（0.28），以及「28」這類兩位數折扣（→ 0.28）。
 */
export function parseDiscount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (value <= 1) return value;
  if (value <= 10) return value / 10;
  if (value < 100) return value / 100;
  return 1;
}

/** 單邊手續費：價金 × 0.1425% × 折扣，無條件捨去，不足低消以低消計；價金為 0 時不收。 */
export function brokerFee(amount: number, discount = 1, minFee: number = FEE_RULES.defaultMinFee): number {
  if (!(amount > 0)) return 0;
  // 先四捨五入到小數 6 位，避免 0.1425% 的浮點誤差讓整數結果少 1 元。
  const raw = Math.round(amount * FEE_RULES.feeRate * discount * 1e6) / 1e6;
  return Math.max(Math.floor(raw), Math.max(0, minFee));
}

/** 證交稅：賣出價金 × 稅率，未滿 1 元捨去。 */
export function transactionTax(amount: number, rate: number): number {
  if (!(amount > 0) || !(rate > 0)) return 0;
  return Math.floor(Math.round(amount * rate * 1e6) / 1e6);
}

/** 證交所升降單位（一檔）。 */
export function tickSize(price: number, type: SecurityType): number {
  if (type !== 'stock') return price < 50 ? 0.01 : 0.05;
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1;
  return 5;
}

/** 把價格對齊到「大於等於 price」的最近合法檔位。 */
export function ceilToTick(price: number, type: SecurityType): number {
  const tick = tickSize(price, type);
  const n = Math.ceil(Math.round((price / tick) * 1e6) / 1e6);
  return round2(n * tick);
}

/** 下一檔價格（處理跨級距，例如 49.95 → 50）。 */
export function nextTick(price: number, type: SecurityType): number {
  return round2(price + tickSize(price, type));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface TradeInput {
  buyPrice: number;
  sellPrice: number;
  /** 股數（1 張 = 1,000 股）。 */
  shares: number;
  type: SecurityType;
  dayTrade: boolean;
  /** 0–1 的折扣比例，1 = 不打折。 */
  discount: number;
  minFee: number;
}

export interface TradeResult {
  buyAmount: number;
  sellAmount: number;
  buyFee: number;
  sellFee: number;
  tax: number;
  taxRate: number;
  /** 手續費 + 證交稅。 */
  totalCost: number;
  /** 買進應付交割金額 = 價金 + 手續費。 */
  buyPayable: number;
  /** 賣出應收交割金額 = 價金 − 手續費 − 證交稅。 */
  sellReceivable: number;
  netProfit: number;
  /** 報酬率 % = 淨損益 ÷ 買進應付金額。 */
  returnPct: number;
  /** 不賠錢的最低賣出價（已對齊升降單位）。 */
  breakEvenPrice: number;
  /** 損益兩平需要上漲的檔數。 */
  breakEvenTicks: number;
}

export function validateTrade(input: TradeInput): string | null {
  if (!Number.isFinite(input.buyPrice) || input.buyPrice <= 0) return '請輸入大於 0 的買進價格。';
  if (!Number.isFinite(input.sellPrice) || input.sellPrice < 0) return '請輸入賣出價格。';
  if (!Number.isFinite(input.shares) || input.shares <= 0) return '請輸入大於 0 的股數。';
  if (!Number.isInteger(input.shares)) return '股數必須是整數。';
  if (!Number.isFinite(input.minFee) || input.minFee < 0) return '最低手續費不可為負數。';
  if (input.buyPrice * input.shares > 1e12) return '金額過大，請確認輸入。';
  return null;
}

/** 以某個賣出價計算淨損益（含買賣手續費與證交稅）。 */
export function netAt(input: TradeInput, sellPrice: number): number {
  const buyAmount = Math.round(input.buyPrice * input.shares);
  const sellAmount = Math.round(sellPrice * input.shares);
  const rate = taxRate(input.type, input.dayTrade);
  const buyPayable = buyAmount + brokerFee(buyAmount, input.discount, input.minFee);
  const sellReceivable =
    sellAmount - brokerFee(sellAmount, input.discount, input.minFee) - transactionTax(sellAmount, rate);
  return sellReceivable - buyPayable;
}

/**
 * 損益兩平賣出價：先用連續近似 buy × (1 + f) ÷ (1 − f − t) 估計，再以升降單位逐檔微調，
 * 因為手續費捨去與低消會讓真正的兩平價落在估計值附近一兩檔。
 */
export function breakEvenPrice(input: TradeInput): number {
  const f = FEE_RULES.feeRate * input.discount;
  const t = taxRate(input.type, input.dayTrade);
  const estimate = (input.buyPrice * (1 + f)) / (1 - f - t);
  let price = ceilToTick(Math.max(input.buyPrice, estimate), input.type);
  // 往下找：若前一檔也已不賠，取更低者。
  for (let i = 0; i < 50; i++) {
    const lower = round2(price - tickSize(price - 1e-9, input.type));
    if (lower < input.buyPrice || netAt(input, lower) < 0) break;
    price = lower;
  }
  // 往上找：低消固定費用可能需要多漲好幾檔（零股小額時）。
  for (let i = 0; i < 100_000 && netAt(input, price) < 0; i++) price = nextTick(price, input.type);
  return price;
}

/** buy → target 之間有幾檔。 */
export function ticksBetween(from: number, to: number, type: SecurityType): number {
  let p = ceilToTick(from, type);
  let n = 0;
  while (p < to - 1e-9 && n < 100_000) {
    p = nextTick(p, type);
    n++;
  }
  return n;
}

export function calculateTrade(input: TradeInput): TradeResult {
  const buyAmount = Math.round(input.buyPrice * input.shares);
  const sellAmount = Math.round(input.sellPrice * input.shares);
  const rate = taxRate(input.type, input.dayTrade);
  const buyFee = brokerFee(buyAmount, input.discount, input.minFee);
  const sellFee = brokerFee(sellAmount, input.discount, input.minFee);
  const tax = transactionTax(sellAmount, rate);
  const buyPayable = buyAmount + buyFee;
  const sellReceivable = sellAmount - sellFee - tax;
  const netProfit = sellReceivable - buyPayable;
  const be = breakEvenPrice(input);
  return {
    buyAmount,
    sellAmount,
    buyFee,
    sellFee,
    tax,
    taxRate: rate,
    totalCost: buyFee + sellFee + tax,
    buyPayable,
    sellReceivable,
    netProfit,
    returnPct: buyPayable > 0 ? (netProfit / buyPayable) * 100 : 0,
    breakEvenPrice: be,
    breakEvenTicks: ticksBetween(input.buyPrice, be, input.type),
  };
}

export interface TickRow {
  ticks: number;
  price: number;
  net: number;
}

/** 從買進價往上 0..count 檔的淨損益，給「漲幾檔才賺」對照表用。 */
export function tickLadder(input: TradeInput, count = 8): TickRow[] {
  const rows: TickRow[] = [];
  let price = ceilToTick(input.buyPrice, input.type);
  for (let i = 0; i <= count; i++) {
    rows.push({ ticks: i, price, net: netAt(input, price) });
    price = nextTick(price, input.type);
  }
  return rows;
}

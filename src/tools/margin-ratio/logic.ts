/**
 * 融資／融券擔保維持率、追繳價與損益試算。
 *
 * 來源（查證日 2026-10-29）：
 * - 最高融資比率上市及上櫃有價證券皆為六成、最低融券保證金成數九成：
 *   金管會 112-02-23 金管證投字第 1120380791 號令；114-04-07 金管證投字第 1140381639 號令曾暫時將融券保證金
 *   成數提高至 130%，已自 114-05-26 起回復為 90%。
 *   https://www.sfb.gov.tw/ch/home.jsp?id=88&parentpath=0%2C3&mcustomize=lawnews_view.jsp&dataserno=202504070002
 *   櫃買中心「櫃檯買賣市場與集中市場股票買賣制度比較表」：融資比率 上市 六成／上櫃 六成，融券保證金成數 九成／九成
 *   https://www.tpex.org.tw/web/service/sotck_info/comparison/market_comparison.php?l=zh-tw
 *   （坊間常見「上櫃融資五成」為舊制說法；個股遭處置或股價異常時，證交所／櫃買中心會調降融資比率、
 *   提高融券保證金成數，以當日公告為準。）
 * - 證券商辦理有價證券買賣融資融券業務操作辦法（115.01.09 版）
 *   https://twse-regulation.twse.com.tw/m/LawContent.aspx?FID=FL007121
 *   第 49 條：融券保證金＝融券賣出成交價款 × 規定成數，未滿百元部分以百元計算。
 *   第 50 條：融資金額＝融資買進成交價款 × 規定比率，未滿千元部分不予計算。
 *   第 53 條：擔保維持率＝（融資擔保品證券市值＋融券擔保品及保證金＋抵繳有價證券市值）
 *            ÷（融資金額＋融券標的證券市值）× 100%，適用整戶及各筆。
 *   第 54 條：整戶擔保維持率低於 130%，證券商應即通知，委託人於通知送達之日起二個營業日內補繳差額。
 *   第 55 條：期限屆滿當日整戶維持率仍不足，自次一營業日起處分擔保品；回升至 130% 以上可暫不處分；
 *            回升至 166% 以上取消追繳紀錄。
 * - 融券擔保品＝賣出價款 − 手續費 − 證交稅 − 融券手續費（借券費，證金公司常見 0.08%，依券商公告）。
 * - 融資利率依券商而定（常見年利率約 6% 上下），按日計息：融資金額 × 年利率 × 天數 ÷ 365。
 */
import { brokerFee, transactionTax } from '../stock-fee-calculator/logic';

export const MARGIN_RULES = {
  /** 上市、上櫃最高融資比率皆為 60%。 */
  defaultLoanRatioPct: 60,
  /** 最低融券保證金成數 90%。 */
  defaultShortMarginPct: 90,
  callLinePct: 130,
  clearRecordPct: 166,
  defaultBorrowFeePct: 0.08,
  stockTaxRate: 0.003,
  /** 表格列出的維持率關卡。 */
  ladderLevels: [200, 180, 166, 150, 140, 130, 120, 110, 100] as const,
} as const;

export interface FeeOptions {
  /** 手續費折扣比例 0–1。 */
  discount: number;
  minFee: number;
}

export interface MarginInput extends FeeOptions {
  buyPrice: number;
  shares: number;
  /** 融資比率 %（上市、上櫃皆為 60）。 */
  loanRatioPct: number;
  currentPrice: number;
  /** 融資年利率 %。 */
  interestRatePct: number;
  /** 已持有天數。 */
  days: number;
}

export interface MarginResult {
  amount: number;
  loan: number;
  buyFee: number;
  /** 自備款＝價金 − 融資金額 ＋ 買進手續費。 */
  ownFunds: number;
  marketValue: number;
  /** 個股（本筆）維持率 %。 */
  maintenancePct: number;
  /** 維持率剛好 130% 的股價，跌破即追繳。 */
  callPrice: number;
  /** 維持率 166% 的股價（追繳後回到此價位以上可取消追繳紀錄）。 */
  clearPrice: number;
  /** 現價距離追繳價的跌幅 %（負數＝已低於追繳線）。 */
  dropToCallPct: number;
  interest: number;
  /** 若以現價賣出：淨損益（含買賣手續費、證交稅、利息）。 */
  netProfit: number;
  /** 淨損益 ÷ 自備款。 */
  returnOnOwnPct: number;
  /** 以現價賣出還款後可拿回的金額。 */
  equityAfterSale: number;
  status: 'safe' | 'warning' | 'call';
}

export interface ShortInput extends FeeOptions {
  sellPrice: number;
  shares: number;
  /** 融券保證金成數 %。 */
  marginPct: number;
  currentPrice: number;
  /** 融券手續費（借券費）%。 */
  borrowFeePct: number;
}

export interface ShortResult {
  amount: number;
  deposit: number;
  sellFee: number;
  tax: number;
  borrowFee: number;
  /** 融券擔保品＝價款 − 手續費 − 證交稅 − 借券費。 */
  collateral: number;
  marketValue: number;
  maintenancePct: number;
  /** 股價漲到這裡維持率跌破 130%。 */
  callPrice: number;
  riseToCallPct: number;
  /** 以現價回補的淨損益（含回補手續費）。 */
  netProfit: number;
  returnOnDepositPct: number;
  status: 'safe' | 'warning' | 'call';
}

export interface LadderRow {
  levelPct: number;
  price: number;
  /** 相對現價的漲跌幅 %。 */
  changePct: number;
}

/** 融資金額：價金 × 比率，未滿千元不予計算。 */
export function loanAmount(amount: number, ratioPct: number): number {
  return Math.floor(Math.round(amount * ratioPct * 1e4) / 1e6 / 1000) * 1000;
}

/** 融券保證金：價金 × 成數，未滿百元以百元計。 */
export function shortDeposit(amount: number, marginPct: number): number {
  return Math.ceil(Math.round(amount * marginPct * 1e4) / 1e6 / 100) * 100;
}

function statusOf(pct: number): 'safe' | 'warning' | 'call' {
  if (pct < MARGIN_RULES.callLinePct) return 'call';
  if (pct < MARGIN_RULES.clearRecordPct) return 'warning';
  return 'safe';
}

function validFees(o: FeeOptions): string | null {
  if (!Number.isFinite(o.discount) || o.discount <= 0 || o.discount > 1) return '手續費折數不正確。';
  if (!Number.isFinite(o.minFee) || o.minFee < 0) return '最低手續費不可為負數。';
  return null;
}

export function validateMargin(input: MarginInput): string | null {
  if (!Number.isFinite(input.buyPrice) || input.buyPrice <= 0) return '請輸入大於 0 的融資買進價。';
  if (!Number.isFinite(input.shares) || input.shares <= 0) return '請輸入大於 0 的股數。';
  if (!Number.isInteger(input.shares)) return '股數必須是整數。';
  if (!Number.isFinite(input.loanRatioPct) || input.loanRatioPct <= 0 || input.loanRatioPct > 100)
    return '融資成數須介於 0 到 100%。';
  if (!Number.isFinite(input.currentPrice) || input.currentPrice <= 0) return '請輸入大於 0 的目前股價。';
  if (!Number.isFinite(input.interestRatePct) || input.interestRatePct < 0) return '融資利率不可為負數。';
  if (!Number.isFinite(input.days) || input.days < 0) return '持有天數不可為負數。';
  if (loanAmount(Math.round(input.buyPrice * input.shares), input.loanRatioPct) <= 0)
    return '融資金額未滿 1,000 元（未滿千元不予融資），請增加股數。';
  return validFees(input);
}

export function calculateMargin(input: MarginInput): MarginResult {
  const amount = Math.round(input.buyPrice * input.shares);
  const loan = loanAmount(amount, input.loanRatioPct);
  const buyFee = brokerFee(amount, input.discount, input.minFee);
  const ownFunds = amount - loan + buyFee;
  const marketValue = Math.round(input.currentPrice * input.shares);
  const maintenancePct = (marketValue / loan) * 100;
  const callPrice = (loan * MARGIN_RULES.callLinePct) / 100 / input.shares;
  const clearPrice = (loan * MARGIN_RULES.clearRecordPct) / 100 / input.shares;
  const interest = Math.round((loan * input.interestRatePct * input.days) / 100 / 365);
  const sellFee = brokerFee(marketValue, input.discount, input.minFee);
  const tax = transactionTax(marketValue, MARGIN_RULES.stockTaxRate);
  const equityAfterSale = marketValue - sellFee - tax - loan - interest;
  const netProfit = equityAfterSale - ownFunds;
  return {
    amount,
    loan,
    buyFee,
    ownFunds,
    marketValue,
    maintenancePct,
    callPrice,
    clearPrice,
    dropToCallPct: (callPrice / input.currentPrice - 1) * 100,
    interest,
    netProfit,
    returnOnOwnPct: (netProfit / ownFunds) * 100,
    equityAfterSale,
    status: statusOf(maintenancePct),
  };
}

/** 各維持率關卡對應的股價：價格＝維持率 × 融資金額 ÷ 股數。 */
export function marginLadder(loan: number, shares: number, currentPrice: number, levels: readonly number[] = MARGIN_RULES.ladderLevels): LadderRow[] {
  return levels.map((levelPct) => {
    const price = (levelPct / 100) * loan / shares;
    return { levelPct, price, changePct: (price / currentPrice - 1) * 100 };
  });
}

export function validateShort(input: ShortInput): string | null {
  if (!Number.isFinite(input.sellPrice) || input.sellPrice <= 0) return '請輸入大於 0 的融券賣出價。';
  if (!Number.isFinite(input.shares) || input.shares <= 0) return '請輸入大於 0 的融券股數。';
  if (!Number.isInteger(input.shares)) return '融券股數必須是整數。';
  if (!Number.isFinite(input.marginPct) || input.marginPct <= 0 || input.marginPct > 300) return '融券保證金成數須介於 0 到 300%。';
  if (!Number.isFinite(input.currentPrice) || input.currentPrice <= 0) return '請輸入大於 0 的融券目前股價。';
  if (!Number.isFinite(input.borrowFeePct) || input.borrowFeePct < 0) return '融券手續費不可為負數。';
  return validFees(input);
}

export function calculateShort(input: ShortInput): ShortResult {
  const amount = Math.round(input.sellPrice * input.shares);
  const deposit = shortDeposit(amount, input.marginPct);
  const sellFee = brokerFee(amount, input.discount, input.minFee);
  const tax = transactionTax(amount, MARGIN_RULES.stockTaxRate);
  const borrowFee = Math.round((amount * input.borrowFeePct) / 100);
  const collateral = amount - sellFee - tax - borrowFee;
  const marketValue = Math.round(input.currentPrice * input.shares);
  const maintenancePct = ((collateral + deposit) / marketValue) * 100;
  const callPrice = (collateral + deposit) / (MARGIN_RULES.callLinePct / 100) / input.shares;
  const coverFee = brokerFee(marketValue, input.discount, input.minFee);
  const netProfit = amount - marketValue - sellFee - tax - borrowFee - coverFee;
  return {
    amount,
    deposit,
    sellFee,
    tax,
    borrowFee,
    collateral,
    marketValue,
    maintenancePct,
    callPrice,
    riseToCallPct: (callPrice / input.currentPrice - 1) * 100,
    netProfit,
    returnOnDepositPct: (netProfit / deposit) * 100,
    status: statusOf(maintenancePct),
  };
}

/** 融券各維持率關卡對應的股價：價格＝（擔保品＋保證金）÷ 維持率 ÷ 股數。 */
export function shortLadder(collateralPlusDeposit: number, shares: number, currentPrice: number, levels: readonly number[] = MARGIN_RULES.ladderLevels): LadderRow[] {
  return levels.map((levelPct) => {
    const price = collateralPlusDeposit / (levelPct / 100) / shares;
    return { levelPct, price, changePct: (price / currentPrice - 1) * 100 };
  });
}

/** 整戶擔保維持率＝（融資擔保品市值＋融券擔保品及保證金）÷（融資金額＋融券標的市值）。 */
export function accountMaintenance(margin: MarginResult | null, short: ShortResult | null): number {
  const numerator = (margin?.marketValue ?? 0) + (short ? short.collateral + short.deposit : 0);
  const denominator = (margin?.loan ?? 0) + (short?.marketValue ?? 0);
  return denominator > 0 ? (numerator / denominator) * 100 : Number.NaN;
}

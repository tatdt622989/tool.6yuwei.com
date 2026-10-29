/**
 * 股利（現金股利＋股票股利）、殖利率、除權息參考價、二代健保補充保費與股利所得稅試算。
 *
 * 來源（查證日 2026-10-29）：
 * - 除權息參考價＝（除權息前收盤價 − 現金股利）÷（1 ＋ 無償配股率），無償配股率＝每股股票股利 ÷ 面額；
 *   證交所除權除息計算結果表公式（不含現金增資）https://www.twse.com.tw/zh/announcement/ex-right/twt49u.html
 * - 二代健保補充保險費率 2.11%（115-01-01 起仍適用），股利單次給付達 20,000 元扣取、單次超過 1,000 萬元部分不計；
 *   股票股利按「配發股數 × 面額」計入，與同一基準日的現金股利合併為同一次給付；保費四捨五入至元
 *   （健保署例：35,000 × 2.11% = 738.5 → 739 元）。
 *   全民健康保險法第 31 條 https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=L0060001&flno=31 、
 *   健保署「股利所得」實例說明 https://www.nhi.gov.tw/ch/cp-2512-4c478-3151-1.html 、
 *   健保署「股票股利為何也要扣繳補充保險費」https://www.nhi.gov.tw/ch/cp-2893-bba7c-3150-1.html
 * - 股利所得課稅二擇一（所得稅法第 15 條）：合併計稅並按股利 8.5% 計算可抵減稅額、每戶上限 80,000 元（可退稅），
 *   或分開計稅按 28% 單一稅率；財政部賦稅署 https://www.dot.gov.tw
 * - 綜所稅累進稅率級距 5%、12%、20%、30%、40%。
 * - 公司配發現金股利計算至元、元以下捨去；股票股利不足一股之畸零股按面額折發現金（多數公司股東會議案慣例）。
 * - 現金股利匯費：多數股務代理機構匯款扣 10 元，依各公司規定，可修改。
 */

export const DIVIDEND_RULES = {
  defaultParValue: 10,
  nhiRate: 0.0211,
  nhiThreshold: 20_000,
  nhiCap: 10_000_000,
  creditRate: 0.085,
  creditCap: 80_000,
  separateRate: 0.28,
  brackets: [5, 12, 20, 30, 40] as const,
  defaultRemittanceFee: 10,
} as const;

export type Frequency = 1 | 2 | 4 | 12;

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  1: '年配',
  2: '半年配',
  4: '季配',
  12: '月配',
};

export interface DividendInput {
  /** 持有股數。 */
  shares: number;
  /** 每股現金股利（元，單次）。 */
  cashPerShare: number;
  /** 每股股票股利（元，單次，以面額計）。 */
  stockPerShare: number;
  /** 除權息前一日收盤價。 */
  price: number;
  /** 每股面額，台股多為 10 元。 */
  parValue: number;
  /** 一年配發次數。 */
  frequency: Frequency;
  /** 綜所稅邊際稅率 %。 */
  bracketPct: number;
  /** 每次匯費（元）。 */
  remittanceFee: number;
  /** 同一申報戶全年其他股利所得（元），用於合併／分開計稅比較。 */
  otherAnnualDividend: number;
}

export interface TaxComparison {
  /** 全戶全年股利所得。 */
  dividendIncome: number;
  /** 合併計稅：股利併入所得後增加的稅額 − 可抵減稅額（負數代表可退稅／抵減其他所得稅）。 */
  combinedTax: number;
  credit: number;
  /** 分開計稅：股利 × 28%。 */
  separateTax: number;
  better: 'combined' | 'separate' | 'equal';
  /** 較划算的方案可省下的稅額。 */
  saving: number;
}

export interface DividendResult {
  /** 單次現金股利（元以下捨去）。 */
  cashAmount: number;
  /** 單次配股股數（取整數）。 */
  newShares: number;
  /** 不足一股按面額折發的現金。 */
  fractionCash: number;
  /** 股票股利以面額計算的股利所得。 */
  stockDividendValue: number;
  /** 單次股利所得合計（現金＋股票股利面額）。 */
  dividendIncome: number;
  /** 二代健保補充保費（單次）。 */
  nhiPremium: number;
  /** 補充保費是否大於現金股利，需由健保署另行開單。 */
  nhiBilledSeparately: boolean;
  /** 單次實際入帳現金＝現金股利＋畸零股折現 − 補充保費 − 匯費。 */
  netCash: number;
  /** 除權息參考價。 */
  referencePrice: number;
  /** 回到除權息前價格（填權息）需上漲的幅度 %。 */
  fillRisePct: number;
  /** 單次現金殖利率 %。 */
  cashYieldPct: number;
  /** 年化現金殖利率 %。 */
  annualCashYieldPct: number;
  /** 年化現金＋股票股利殖利率 %（股票股利以面額元數計）。 */
  annualTotalYieldPct: number;
  /** 年化：全年現金股利、補充保費、實際入帳。 */
  annualCash: number;
  annualNhi: number;
  annualNetCash: number;
  /** 除權後持有股數（原股數＋配股）。 */
  sharesAfter: number;
  tax: TaxComparison;
}

export function validateDividend(input: DividendInput): string | null {
  if (!Number.isFinite(input.shares) || input.shares <= 0) return '請輸入大於 0 的持有股數。';
  if (!Number.isInteger(input.shares)) return '持有股數必須是整數。';
  if (!Number.isFinite(input.cashPerShare) || input.cashPerShare < 0) return '每股現金股利不可為負數。';
  if (!Number.isFinite(input.stockPerShare) || input.stockPerShare < 0) return '每股股票股利不可為負數。';
  if (input.cashPerShare === 0 && input.stockPerShare === 0) return '請輸入現金股利或股票股利。';
  if (!Number.isFinite(input.price) || input.price <= 0) return '請輸入大於 0 的股價。';
  if (input.cashPerShare >= input.price) return '現金股利不可大於或等於股價。';
  if (!Number.isFinite(input.parValue) || input.parValue <= 0) return '請輸入大於 0 的面額。';
  if (!Number.isFinite(input.remittanceFee) || input.remittanceFee < 0) return '匯費不可為負數。';
  if (!Number.isFinite(input.otherAnnualDividend) || input.otherAnnualDividend < 0) return '其他股利所得不可為負數。';
  if (input.shares * input.price > 1e13) return '金額過大，請確認輸入。';
  return null;
}

/** 二代健保補充保費：單次給付 ≥ 2 萬元才扣，上限 1,000 萬元，四捨五入至元。 */
export function nhiPremium(payment: number): number {
  if (!(payment >= DIVIDEND_RULES.nhiThreshold)) return 0;
  const base = Math.min(payment, DIVIDEND_RULES.nhiCap);
  return Math.round(Math.round(base * DIVIDEND_RULES.nhiRate * 1e6) / 1e6);
}

/** 除權息參考價＝（前一日收盤價 − 現金股利）÷（1 ＋ 股票股利 ÷ 面額）。 */
export function exDividendReferencePrice(price: number, cashPerShare: number, stockPerShare: number, parValue = 10): number {
  return (price - cashPerShare) / (1 + stockPerShare / parValue);
}

/**
 * 股利所得合併 vs 分開計稅（簡化：假設股利全部落在所選邊際稅率級距）。
 * 合併：股利 × 邊際稅率 − min(股利 × 8.5%, 80,000)；分開：股利 × 28%。
 */
export function compareDividendTax(dividendIncome: number, bracketPct: number): TaxComparison {
  const income = Math.max(0, dividendIncome);
  const credit = Math.min(Math.round(income * DIVIDEND_RULES.creditRate), DIVIDEND_RULES.creditCap);
  const combinedTax = Math.round((income * bracketPct) / 100) - credit;
  const separateTax = Math.round(income * DIVIDEND_RULES.separateRate);
  const better = combinedTax < separateTax ? 'combined' : combinedTax > separateTax ? 'separate' : 'equal';
  return { dividendIncome: income, combinedTax, credit, separateTax, better, saving: Math.abs(separateTax - combinedTax) };
}

/** 抵減稅額達上限 8 萬元時的股利所得（約 941,176 元）。 */
export const CREDIT_CAP_INCOME = DIVIDEND_RULES.creditCap / DIVIDEND_RULES.creditRate;

export function calculateDividend(input: DividendInput): DividendResult {
  const { shares, cashPerShare, stockPerShare, price, parValue, frequency } = input;
  const cashAmount = Math.floor(Math.round(shares * cashPerShare * 1e6) / 1e6);
  const exactNewShares = Math.round(((shares * stockPerShare) / parValue) * 1e6) / 1e6;
  const newShares = Math.floor(exactNewShares);
  const fractionCash = Math.floor(Math.round((exactNewShares - newShares) * parValue * 1e6) / 1e6);
  const stockDividendValue = Math.round(shares * stockPerShare);
  const dividendIncome = cashAmount + stockDividendValue;
  const premium = nhiPremium(dividendIncome);
  const available = cashAmount + fractionCash;
  const nhiBilledSeparately = premium > available;
  const fee = available > 0 ? input.remittanceFee : 0;
  const netCash = Math.max(0, available - premium - fee);
  const referencePrice = exDividendReferencePrice(price, cashPerShare, stockPerShare, parValue);
  const annualIncome = dividendIncome * frequency;

  return {
    cashAmount,
    newShares,
    fractionCash,
    stockDividendValue,
    dividendIncome,
    nhiPremium: premium,
    nhiBilledSeparately,
    netCash,
    referencePrice,
    fillRisePct: referencePrice > 0 ? (price / referencePrice - 1) * 100 : 0,
    cashYieldPct: (cashPerShare / price) * 100,
    annualCashYieldPct: ((cashPerShare * frequency) / price) * 100,
    annualTotalYieldPct: (((cashPerShare + stockPerShare) * frequency) / price) * 100,
    annualCash: cashAmount * frequency,
    annualNhi: premium * frequency,
    annualNetCash: netCash * frequency,
    sharesAfter: shares + newShares,
    tax: compareDividendTax(annualIncome + input.otherAnnualDividend, input.bracketPct),
  };
}

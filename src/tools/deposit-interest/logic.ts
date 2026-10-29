/**
 * 定存利息試算。
 * - 整存整付：本金一次存入、到期領回本利和，台灣銀行業按月複利（亦可選單利比較）。
 * - 存本取息：本金一次存入，每月領取利息（單利），到期領回本金。
 * - 零存整付：每月月初存入固定金額，按月複利，到期一次領回本利和。
 *
 * 稅費參數（2026 年）：
 * - 二代健保補充保險費：費率 2.11%，利息所得「單次給付達 2 萬元」即由銀行扣取，單次以 1,000 萬元為上限。
 *   來源：健保署補充保險費說明 https://www.nhi.gov.tw/ch/dl-85340-4e58804757e24feda5bf27f429fbbdbc-1.pdf
 * - 儲蓄投資特別扣除額：每一申報戶全年 270,000 元（所得稅法第 17 條，114、115 年度皆同）。
 * - 利息所得扣繳：居住者扣繳率 10%，每次應扣繳稅額不超過 2,000 元（即利息 20,000 元以下）免扣繳（各類所得扣繳率標準）。
 */
export const DEPOSIT_TAX_2026 = {
  supplementaryRatePct: 2.11,
  supplementaryThreshold: 20_000,
  supplementaryCap: 10_000_000,
  withholdingRatePct: 10,
  withholdingThreshold: 20_000,
  savingsDeduction: 270_000,
} as const;

export type DepositMode = 'lump' | 'income' | 'recurring';

export interface DepositInput {
  mode: DepositMode;
  /** 整存整付、存本取息為本金；零存整付為每月存入金額。 */
  amount: number;
  /** 年利率（%）。 */
  ratePct: number;
  months: number;
  compound: boolean;
  /**
   * How `ratePct` is quoted. 'apr' (default, zh) = nominal annual rate compounded `periodsPerYear` times;
   * 'apy' (US savings / CDs) = annual percentage yield, the effective rate after a year of compounding.
   */
  rateKind?: 'apr' | 'apy';
  /** Compounding periods per year for an APR: 12 (default), 365 daily, 4 quarterly, 1 annually. */
  periodsPerYear?: number;
  /** Recurring mode only: balance already in the account before the first monthly deposit. Default 0. */
  initial?: number;
}

export interface DepositRow {
  month: number;
  deposited: number;
  interest: number;
  balance: number;
}

export interface DepositResult {
  totalDeposited: number;
  totalInterest: number;
  maturity: number;
  /** 銀行單次給付的利息金額（存本取息為每月，其餘為到期一次）。 */
  singlePayment: number;
  payments: number;
  /** 補充保費合計。 */
  supplementary: number;
  /** 預扣所得稅合計（可抵繳，不是額外成本）。 */
  withholding: number;
  /** 年化利息（以期數換算），用來對照 27 萬儲蓄投資特別扣除額。 */
  annualInterest: number;
  rows: DepositRow[];
}

export type DepositProblem = 'incomplete' | 'amount' | 'tooLarge' | 'rate' | 'months' | 'initial';

/** Locale-neutral validation; UI maps the code to a message. */
export function depositProblem(input: Pick<DepositInput, 'amount' | 'ratePct' | 'months' | 'initial'>): DepositProblem | null {
  const { amount, ratePct, months } = input;
  if (![amount, ratePct, months].every(Number.isFinite)) return 'incomplete';
  if (amount <= 0) return 'amount';
  if (amount > 1e11) return 'tooLarge';
  if (ratePct < 0 || ratePct > 20) return 'rate';
  if (!Number.isInteger(months) || months < 1 || months > 600) return 'months';
  if (input.initial !== undefined && (!Number.isFinite(input.initial) || input.initial < 0 || input.initial > 1e11)) return 'initial';
  return null;
}

const ZH_PROBLEMS: Record<DepositProblem, string> = {
  incomplete: '請輸入完整的數字。',
  amount: '金額需大於 0。',
  tooLarge: '金額過大。',
  rate: '年利率請輸入 0% 到 20%。',
  months: '存款期間請輸入 1 到 600 個月。',
  initial: '請輸入 0 以上的金額。',
};

/** zh-TW message for the first problem, or null. */
export function validateDeposit(input: DepositInput): string | null {
  const problem = depositProblem(input);
  return problem ? ZH_PROBLEMS[problem] : null;
}

/**
 * Monthly rate used for the month-by-month schedule.
 * APR compounded monthly → APR ÷ 12 (zh default, exact). Other frequencies → the monthly rate with the same
 * effective yield, so balances match the true compounding at each compounding date.
 * APY → (1 + APY)^(1/12) − 1, so 12 months grow by exactly the APY.
 */
export function monthlyRate(ratePct: number, rateKind: 'apr' | 'apy' = 'apr', periodsPerYear = 12): number {
  const r = ratePct / 100;
  if (rateKind === 'apy') return (1 + r) ** (1 / 12) - 1;
  if (periodsPerYear === 12) return r / 12;
  return (1 + r / periodsPerYear) ** (periodsPerYear / 12) - 1;
}

/** Effective annual yield (APY, %) of a monthly rate. */
export function effectiveApyPct(monthly: number): number {
  return ((1 + monthly) ** 12 - 1) * 100;
}

/** 補充保費：單次給付達門檻才扣，費率 2.11%，單次上限 1,000 萬元。四捨五入至元。 */
export function supplementaryPremium(payment: number): number {
  const t = DEPOSIT_TAX_2026;
  if (payment < t.supplementaryThreshold) return 0;
  return Math.round((Math.min(payment, t.supplementaryCap) * t.supplementaryRatePct) / 100);
}

export function withholdingTax(payment: number): number {
  const t = DEPOSIT_TAX_2026;
  if (payment <= t.withholdingThreshold) return 0;
  return Math.round((payment * t.withholdingRatePct) / 100);
}

export function calculateDeposit(input: DepositInput): DepositResult | null {
  if (validateDeposit(input)) return null;
  const { mode, amount, ratePct, months, compound } = input;
  const i = monthlyRate(ratePct, input.rateKind, input.periodsPerYear);
  const initial = mode === 'recurring' ? (input.initial ?? 0) : 0;
  const rows: DepositRow[] = [];
  let deposited = 0;
  let balance = 0;
  let accrued = 0;

  if (mode === 'income') {
    deposited = amount;
    for (let m = 1; m <= months; m++) {
      const interest = amount * i;
      accrued += interest;
      rows.push({ month: m, deposited, interest, balance: amount });
    }
    balance = amount;
  } else {
    if (mode === 'lump') deposited = amount;
    else deposited = initial;
    balance = mode === 'lump' ? amount : initial;
    for (let m = 1; m <= months; m++) {
      if (mode === 'recurring') {
        deposited += amount;
        balance += amount;
      }
      // 單利：利息只按存入本金計算，不滾入計息基礎。
      const interest = (compound ? balance : deposited) * i;
      accrued += interest;
      if (compound) balance += interest;
      rows.push({ month: m, deposited, interest, balance: compound ? balance : deposited + accrued });
    }
    if (!compound) balance = deposited + accrued;
  }

  const singlePayment = mode === 'income' ? amount * i : accrued;
  const payments = mode === 'income' ? months : 1;
  return {
    totalDeposited: deposited,
    totalInterest: accrued,
    maturity: deposited + accrued,
    singlePayment,
    payments,
    supplementary: supplementaryPremium(singlePayment) * payments,
    withholding: withholdingTax(singlePayment) * payments,
    annualInterest: (accrued / months) * 12,
    rows,
  };
}

// ---- Japan: 定期預金 (ja) ----

/**
 * 利子所得の源泉分離課税（2037 年まで）：所得税 15% + 復興特別所得税 0.315%（＝15.315%）、住民税（利子割）5%、計 20.315%。
 * 銀行は国税と地方税をそれぞれ 1 円未満切り捨てで計算して差し引く。
 */
export const JP_INTEREST_TAX = { nationalPct: 15.315, localPct: 5 } as const;

export interface JpInterestTax {
  /** 所得税及び復興特別所得税（15.315%） */
  national: number;
  /** 住民税（5%） */
  local: number;
  total: number;
}

/** Tax withheld on a yen interest amount: each part truncated to the yen. */
export function jpInterestTax(grossYen: number): JpInterestTax {
  const gross = Math.max(0, Math.floor(grossYen));
  const national = Math.floor((gross * 15_315) / 100_000);
  const local = Math.floor((gross * 5) / 100);
  return { national, local, total: national + local };
}

/** 単利型 (most 定期預金) or 半年複利型 (期間 3 年以上の個人向けに多い). */
export type JpDepositType = 'simple' | 'semiannual';

export interface JpDepositInput {
  principal: number;
  /** 年利率（%、税引前）。 */
  ratePct: number;
  months: number;
  type: JpDepositType;
}

export interface JpDepositResult {
  /** 税引前利息（円、1 円未満切り捨て）。 */
  gross: number;
  tax: JpInterestTax;
  /** 税引後利息。 */
  net: number;
  /** 満期受取額（元本 + 税引後利息）。 */
  maturity: number;
  /** 税引後の実質年利回り（%、単利換算）。 */
  netYieldPct: number;
}

/**
 * 定期預金の満期利息。期間は月数 ÷ 12 年で近似（銀行は実際の預入日数 ÷ 365 で日割り計算）。
 * 半年複利型は 6 か月ごとに利息（1 円未満切り捨て）を元本に組み入れ、端数月は単利。税は満期時にまとめて源泉徴収。
 */
export function calculateJpTimeDeposit(input: JpDepositInput): JpDepositResult | null {
  const { principal, ratePct, months, type } = input;
  if (depositProblem({ amount: principal, ratePct, months })) return null;
  const r = ratePct / 100;
  const eps = 1e-6;
  let balance = principal;
  let rest = months;
  if (type === 'semiannual') {
    for (; rest >= 6; rest -= 6) balance += Math.floor((balance * r) / 2 + eps);
  }
  const gross = Math.floor(balance - principal + (balance * r * rest) / 12 + eps);
  const tax = jpInterestTax(gross);
  const net = gross - tax.total;
  return {
    gross,
    tax,
    net,
    maturity: principal + net,
    netYieldPct: (net / principal / (months / 12)) * 100,
  };
}

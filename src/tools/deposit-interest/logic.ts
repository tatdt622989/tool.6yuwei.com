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

export function validateDeposit(input: DepositInput): string | null {
  const { amount, ratePct, months } = input;
  if (![amount, ratePct, months].every(Number.isFinite)) return '請輸入完整的數字。';
  if (amount <= 0) return '金額需大於 0。';
  if (amount > 1e11) return '金額過大。';
  if (ratePct < 0 || ratePct > 20) return '年利率請輸入 0% 到 20%。';
  if (!Number.isInteger(months) || months < 1 || months > 600) return '存款期間請輸入 1 到 600 個月。';
  return null;
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
  const i = ratePct / 100 / 12;
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
    balance = mode === 'lump' ? amount : 0;
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

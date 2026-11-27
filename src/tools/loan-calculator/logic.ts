/**
 * 信用貸款（本息平均攤還）試算與總費用年百分率。
 * 總費用年百分率依金管會「金融機構辦理信用貸款資訊揭露」與銀行公會「總費用年百分率計算方式」：
 * 以實際撥貸金額（貸款金額 − 前置費用）與各期還款現金流求出每月內部報酬率（IRR），再乘以 12。
 */

export interface RateStage {
  /** 年利率（%）。 */
  ratePct: number;
  /** 本段期數（月）；最後一段可為 0，代表適用到期滿。 */
  months: number;
}

export interface LoanInput {
  principal: number;
  /** 總期數（月）。 */
  months: number;
  /** 分段利率，依序適用；未涵蓋的期數沿用最後一段。 */
  stages: RateStage[];
  /** 開辦費、帳管費等前置費用（元）。 */
  fees: number;
}

export interface LoanRow {
  month: number;
  ratePct: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanResult {
  rows: LoanRow[];
  /** 第一期月付金。 */
  firstPayment: number;
  /** 每段的月付金（分段利率時不同）。 */
  stagePayments: { fromMonth: number; toMonth: number; ratePct: number; payment: number }[];
  totalInterest: number;
  totalPaid: number;
  /** 總費用年百分率（%）。 */
  aprPct: number;
  /** 利息 + 費用。 */
  totalCost: number;
}

/** Machine-readable input problems; localized messages live in i18n.ts (zh-TW text in LOAN_PROBLEM_ZH). */
export type LoanProblem =
  | 'incomplete'
  | 'amount'
  | 'months'
  | 'noRate'
  | 'rate'
  | 'stageMonths'
  | 'feesNegative'
  | 'feesTooHigh';

export const LOAN_PROBLEM_ZH: Record<LoanProblem, string> = {
  incomplete: '請輸入完整的數字。',
  amount: '貸款金額需大於 0。',
  months: '貸款期數請輸入 1 到 480 個月。',
  noRate: '請輸入利率。',
  rate: '年利率請輸入 0% 到 30%。',
  stageMonths: '分段期數請輸入 0 或正整數。',
  feesNegative: '費用不可為負數。',
  feesTooHigh: '費用不可大於或等於貸款金額。',
};

export function loanProblem(input: LoanInput): LoanProblem | null {
  const { principal, months, stages, fees } = input;
  if (![principal, months, fees].every(Number.isFinite) || stages.some((s) => !Number.isFinite(s.ratePct) || !Number.isFinite(s.months)))
    return 'incomplete';
  if (principal <= 0) return 'amount';
  if (!Number.isInteger(months) || months < 1 || months > 480) return 'months';
  if (stages.length === 0) return 'noRate';
  if (stages.some((s) => s.ratePct < 0 || s.ratePct > 30)) return 'rate';
  if (stages.some((s) => s.months < 0 || !Number.isInteger(s.months))) return 'stageMonths';
  if (fees < 0) return 'feesNegative';
  if (fees >= principal) return 'feesTooHigh';
  return null;
}

/** zh-TW message for the first input problem, or null. */
export function validateLoan(input: LoanInput): string | null {
  const problem = loanProblem(input);
  return problem ? LOAN_PROBLEM_ZH[problem] : null;
}

export function annuityPayment(principal: number, r: number, n: number): number {
  if (n <= 0) return Number.NaN;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - (1 + r) ** -n);
}

/** 第 month 期（1 起算）適用的年利率。 */
export function rateForMonth(stages: RateStage[], month: number): number {
  let end = 0;
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    if (i === stages.length - 1 || s.months === 0) return s.ratePct;
    end += s.months;
    if (month <= end) return s.ratePct;
  }
  return stages[stages.length - 1].ratePct;
}

/** 解每月 IRR：使 Σ cashflow[t] / (1 + x)^t = 0，cashflow[0] 為撥貸淨額（正）。 */
export function monthlyIrr(netAmount: number, payments: number[]): number {
  const npv = (x: number) => payments.reduce((s, p, i) => s + p / (1 + x) ** (i + 1), 0) - netAmount;
  let lo = -0.99;
  let hi = 1;
  if (npv(lo) < 0 || npv(hi) > 0) return Number.NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function calculateLoan(input: LoanInput): LoanResult | null {
  if (validateLoan(input)) return null;
  const { principal, months, stages, fees } = input;
  const rows: LoanRow[] = [];
  const stagePayments: LoanResult['stagePayments'] = [];
  let balance = principal;
  let payment = 0;
  let currentRate = Number.NaN;

  for (let m = 1; m <= months; m++) {
    const ratePct = rateForMonth(stages, m);
    const r = ratePct / 100 / 12;
    if (ratePct !== currentRate) {
      // 利率變動時，以剩餘本金與剩餘期數重新計算月付金（銀行分段式利率的常見作法）。
      payment = annuityPayment(balance, r, months - m + 1);
      currentRate = ratePct;
      stagePayments.push({ fromMonth: m, toMonth: months, ratePct, payment });
      if (stagePayments.length > 1) stagePayments[stagePayments.length - 2].toMonth = m - 1;
    }
    const interest = balance * r;
    const repaid = m === months ? balance : payment - interest;
    balance = Math.max(0, balance - repaid);
    rows.push({ month: m, ratePct, payment: interest + repaid, interest, principal: repaid, balance });
  }

  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  const irr = monthlyIrr(
    principal - fees,
    rows.map((x) => x.payment),
  );
  return {
    rows,
    firstPayment: rows[0].payment,
    stagePayments,
    totalInterest,
    totalPaid: principal + totalInterest,
    aprPct: irr * 12 * 100,
    totalCost: totalInterest + fees,
  };
}

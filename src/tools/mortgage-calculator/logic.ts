/** 本息平均攤還 (equal payment) or 本金平均攤還 (equal principal). */
export type RepaymentMethod = 'annuity' | 'principal';

export interface LoanInput {
  /** Loan amount in 元. */
  principal: number;
  /** Annual interest rate in percent, e.g. 2.185. */
  annualRate: number;
  /** Total loan term in years, including the grace period. */
  years: number;
  /** Interest-only years at the start (寬限期). */
  graceYears: number;
  method: RepaymentMethod;
}

export interface MonthRow {
  /** 1-based month number. */
  month: number;
  payment: number;
  interest: number;
  principal: number;
  /** Remaining balance after this payment. */
  balance: number;
}

export interface YearRow {
  year: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanResult {
  months: MonthRow[];
  /** Payment in month 1 (interest only when there is a grace period). */
  firstPayment: number;
  /** First payment once principal repayment starts. */
  firstAmortizingPayment: number;
  lastPayment: number;
  totalInterest: number;
  totalPaid: number;
}

export const MAX_YEARS = 40;

/** Machine-readable input problems; localized messages live in i18n.ts (zh-TW text in MORTGAGE_PROBLEM_ZH). */
export type MortgageProblem = 'incomplete' | 'amount' | 'rate' | 'years' | 'grace' | 'graceTooLong';

export const MORTGAGE_PROBLEM_ZH: Record<MortgageProblem, string> = {
  incomplete: '請輸入完整的數字。',
  amount: '貸款金額需大於 0。',
  rate: '年利率請輸入 0 到 30 之間的百分比。',
  years: `貸款年限請輸入 1 到 ${MAX_YEARS} 的整數。`,
  grace: '寬限期請輸入 0 或正整數。',
  graceTooLong: '寬限期必須短於貸款年限。',
};

export function mortgageProblem(input: LoanInput): MortgageProblem | null {
  const { principal, annualRate, years, graceYears } = input;
  if (![principal, annualRate, years, graceYears].every(Number.isFinite)) return 'incomplete';
  if (principal <= 0) return 'amount';
  if (annualRate < 0 || annualRate > 30) return 'rate';
  if (!Number.isInteger(years) || years < 1 || years > MAX_YEARS) return 'years';
  if (!Number.isInteger(graceYears) || graceYears < 0) return 'grace';
  if (graceYears >= years) return 'graceTooLong';
  return null;
}

/** Returns a user-facing (zh-TW) problem with the input, or null when it can be computed. */
export function validateLoan(input: LoanInput): string | null {
  const problem = mortgageProblem(input);
  return problem ? MORTGAGE_PROBLEM_ZH[problem] : null;
}

/** Fixed monthly payment that repays `principal` over `months` at monthly rate `r`. */
export function annuityPayment(principal: number, r: number, months: number): number {
  if (months <= 0) return Number.NaN;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - (1 + r) ** -months);
}

/**
 * Builds the full monthly schedule. Interest is charged monthly at annualRate / 12,
 * the usual convention for Taiwanese bank mortgages. Values are not rounded; round for display.
 */
export function buildSchedule(input: LoanInput): LoanResult | null {
  if (validateLoan(input)) return null;
  const { principal, annualRate, years, graceYears, method } = input;
  const r = annualRate / 100 / 12;
  const total = years * 12;
  const grace = graceYears * 12;
  const amortizing = total - grace;
  const fixed = annuityPayment(principal, r, amortizing);
  const principalPart = principal / amortizing;

  const months: MonthRow[] = [];
  let balance = principal;
  for (let month = 1; month <= total; month++) {
    const interest = balance * r;
    let repaid = 0;
    if (month > grace) {
      const isLast = month === total;
      repaid = isLast ? balance : method === 'annuity' ? fixed - interest : principalPart;
    }
    balance = Math.max(0, balance - repaid);
    months.push({ month, payment: interest + repaid, interest, principal: repaid, balance });
  }

  const totalInterest = months.reduce((sum, m) => sum + m.interest, 0);
  return {
    months,
    firstPayment: months[0].payment,
    firstAmortizingPayment: months[grace].payment,
    lastPayment: months[months.length - 1].payment,
    totalInterest,
    totalPaid: principal + totalInterest,
  };
}

export function summarizeByYear(months: MonthRow[]): YearRow[] {
  const years: YearRow[] = [];
  for (const m of months) {
    const index = Math.floor((m.month - 1) / 12);
    const row = (years[index] ??= { year: index + 1, payment: 0, interest: 0, principal: 0, balance: 0 });
    row.payment += m.payment;
    row.interest += m.interest;
    row.principal += m.principal;
    row.balance = m.balance;
  }
  return years;
}

/** 萬元 → 元. */
export function wanToYuan(wan: number): number {
  return wan * 10_000;
}

// ---- US-style inputs (en): home price, down payment and monthly housing costs ----

/** Loan amount after a down payment given as a percentage of the price. NaN for invalid input. */
export function loanFromPrice(price: number, downPct: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(downPct) || price <= 0 || downPct < 0 || downPct > 100) return Number.NaN;
  return price * (1 - downPct / 100);
}

export interface HousingCosts {
  /** Annual property tax. */
  propertyTaxYear: number;
  /** Annual homeowners insurance. */
  insuranceYear: number;
  /** Monthly HOA dues. */
  hoaMonth: number;
}

/** Monthly PITI(+HOA): principal & interest plus 1/12 of yearly tax and insurance plus HOA dues. */
export function monthlyHousingPayment(principalAndInterest: number, costs: HousingCosts): number {
  return principalAndInterest + costs.propertyTaxYear / 12 + costs.insuranceYear / 12 + costs.hoaMonth;
}

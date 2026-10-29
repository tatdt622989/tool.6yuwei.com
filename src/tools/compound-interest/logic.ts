/** Compounding periods per year. */
export type Frequency = 1 | 2 | 4 | 12 | 365;

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  1: '每年',
  2: '每半年',
  4: '每季',
  12: '每月',
  365: '每日',
};

export interface CompoundInput {
  principal: number;
  /** Deposited at the end of every month. */
  monthly: number;
  /** Nominal annual rate in percent, e.g. 5 for 5%. */
  ratePct: number;
  /** Whole years, 1–100. */
  years: number;
  frequency: Frequency;
}

export interface YearRow {
  year: number;
  /** Cumulative principal + contributions at the end of this year. */
  contributed: number;
  /** Interest earned during this year. */
  interest: number;
  /** Cumulative interest since the start. */
  totalInterest: number;
  balance: number;
}

export interface CompoundResult {
  finalValue: number;
  totalContributed: number;
  totalInterest: number;
  /** Effective annual yield in percent (accounts for compounding frequency). */
  effectiveRatePct: number;
  rows: YearRow[];
}

export const MAX_YEARS = 100;

/**
 * Equivalent monthly growth rate for a nominal annual rate compounded `frequency` times a year.
 * Using it month by month gives exactly P(1 + r/n)^(n·t) for the principal at whole years.
 */
export function monthlyRate(ratePct: number, frequency: Frequency): number {
  const r = ratePct / 100;
  return Math.pow(1 + r / frequency, frequency / 12) - 1;
}

export function effectiveAnnualRate(ratePct: number, frequency: Frequency): number {
  return (Math.pow(1 + ratePct / 100 / frequency, frequency) - 1) * 100;
}

/** Returns null for invalid input (negative amounts or rate, rate ≥ 100%, years outside 1–100). */
export function calculateCompound(input: CompoundInput): CompoundResult | null {
  const { principal, monthly, ratePct, years, frequency } = input;
  if (![principal, monthly, ratePct, years].every(Number.isFinite)) return null;
  if (principal < 0 || monthly < 0 || ratePct < 0 || ratePct > 100) return null;
  if (!Number.isInteger(years) || years < 1 || years > MAX_YEARS) return null;
  if (!(frequency in FREQUENCY_LABEL)) return null;
  if (principal === 0 && monthly === 0) return null;

  const m = monthlyRate(ratePct, frequency);
  let balance = principal;
  let contributed = principal;
  const rows: YearRow[] = [];

  for (let year = 1; year <= years; year++) {
    const start = balance;
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + m) + monthly;
      contributed += monthly;
    }
    const interest = balance - start - monthly * 12;
    rows.push({ year, contributed, interest, totalInterest: balance - contributed, balance });
  }

  return {
    finalValue: balance,
    totalContributed: contributed,
    totalInterest: balance - contributed,
    effectiveRatePct: effectiveAnnualRate(ratePct, frequency),
    rows,
  };
}

/** Rule of 72: approximate years to double at an annual rate (percent). Infinity for 0%. */
export function ruleOf72(ratePct: number): number {
  return ratePct > 0 ? 72 / ratePct : Number.POSITIVE_INFINITY;
}

/** Exact years to double with annual compounding: ln 2 / ln(1 + r). */
export function exactDoublingYears(ratePct: number): number {
  return ratePct > 0 ? Math.log(2) / Math.log(1 + ratePct / 100) : Number.POSITIVE_INFINITY;
}

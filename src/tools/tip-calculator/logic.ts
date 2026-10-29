// Tip calculator. Pure functions; all money is handled in integer cents so splits never drift.
//
// Sources for the etiquette notes in meta.en.ts:
// - Emily Post Institute, tipping guide: 15–20% of the pre-tax bill for sit-down restaurant service
//   (https://emilypost.com/advice/general-tipping-guide).
// - Toast, "Do you tip on tax?" (https://pos.toasttab.com/blog/on-the-line/do-you-tip-on-tax): POS terminals may
//   suggest tips on the post-tax total; automatic gratuities are usually computed on the pre-tax amount.

export const TIP_PRESETS = [15, 18, 20, 22, 25] as const;
export const MAX_PEOPLE = 100;
export const MAX_BILL_CENTS = 100_000_000; // $1,000,000

export type RoundMode = 'none' | 'perPerson' | 'total';

export interface TipInput {
  /** Bill total as printed, in cents (including tax). */
  billCents: number;
  /** Tip percentage, e.g. 18. */
  tipPercent: number;
  /** Number of people splitting; 1 = no split. */
  people: number;
  round: RoundMode;
  /** Sales tax already on the bill, in cents. Only used when tipOnPreTax is true. */
  taxCents?: number;
  /** Tip on the amount before tax (bill − tax). */
  tipOnPreTax?: boolean;
}

export interface TipResult {
  /** Amount the tip percentage is applied to. */
  baseCents: number;
  /** Tip actually paid (after rounding). */
  tipCents: number;
  /** Bill + tip. */
  totalCents: number;
  /** The share people pay (the larger share when it doesn't divide evenly). */
  perPersonCents: number;
  /** When the total doesn't split evenly to the cent: how many people pay perPersonCents; the rest pay 1¢ less. */
  unevenCount: number;
  tipPerPersonCents: number;
  /** Tip ÷ base × 100 after rounding. */
  effectivePercent: number;
  /** How much rounding added to the tip, in cents. */
  roundingCents: number;
}

export type TipError = 'bill' | 'tip' | 'people' | 'tax';

/** Dollars typed by the user → integer cents (half-up). NaN stays NaN. */
export function toCents(dollars: number): number {
  if (!Number.isFinite(dollars)) return Number.NaN;
  return Math.round(dollars * 100 + (dollars >= 0 ? 1e-7 : -1e-7));
}

export function validateTip(input: TipInput): TipError | null {
  const { billCents, tipPercent, people, taxCents = 0, tipOnPreTax = false } = input;
  if (!Number.isFinite(billCents) || billCents <= 0 || billCents > MAX_BILL_CENTS) return 'bill';
  if (!Number.isFinite(tipPercent) || tipPercent < 0 || tipPercent > 100) return 'tip';
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) return 'people';
  if (tipOnPreTax && (!Number.isFinite(taxCents) || taxCents < 0 || taxCents >= billCents)) return 'tax';
  return null;
}

const ceilTo = (cents: number, step: number) => Math.ceil(cents / step) * step;

export function calculateTip(input: TipInput): TipResult | null {
  if (validateTip(input)) return null;
  const { billCents, tipPercent, people, round, taxCents = 0, tipOnPreTax = false } = input;
  const baseCents = tipOnPreTax ? billCents - taxCents : billCents;
  // Round half up to the cent; the epsilon guards values like 0.125 * 100 that land just below .5 in binary.
  const rawTip = Math.round((baseCents * tipPercent) / 100 + 1e-9);
  let totalCents = billCents + rawTip;

  if (round === 'total') totalCents = ceilTo(totalCents, 100);
  else if (round === 'perPerson') totalCents = ceilTo(Math.ceil(totalCents / people), 100) * people;

  const tipCents = totalCents - billCents;
  const share = Math.floor(totalCents / people);
  const remainder = totalCents - share * people;
  return {
    baseCents,
    tipCents,
    totalCents,
    perPersonCents: remainder === 0 ? share : share + 1,
    unevenCount: remainder,
    tipPerPersonCents: Math.round(tipCents / people),
    effectivePercent: baseCents > 0 ? (tipCents / baseCents) * 100 : 0,
    roundingCents: tipCents - rawTip,
  };
}

export interface TipRow {
  percent: number;
  tipCents: number;
  totalCents: number;
  perPersonCents: number;
}

/** Quick-reference table for the presets (no rounding), same bill/split/tax settings. */
export function tipTable(input: Omit<TipInput, 'tipPercent' | 'round'>, percents: readonly number[] = TIP_PRESETS): TipRow[] {
  const rows: TipRow[] = [];
  for (const percent of percents) {
    const r = calculateTip({ ...input, tipPercent: percent, round: 'none' });
    if (r) rows.push({ percent, tipCents: r.tipCents, totalCents: r.totalCents, perPersonCents: r.perPersonCents });
  }
  return rows;
}

/** 1234 → '$12.34'. */
export function formatUsd(cents: number): string {
  if (!Number.isFinite(cents)) return '—';
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`;
}

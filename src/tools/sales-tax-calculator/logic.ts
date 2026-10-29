// Sales tax calculator. Pure functions; money in integer cents, rates as exact integers (1 unit = 0.0001%).
//
// State-level rates (the rate charged statewide before any county/city/district add-ons), as of July 1, 2026:
// - Tax Foundation, "State and Local Sales Tax Rates, Midyear 2026"
//   https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/ (no statewide changes Jan–Jul 2026).
//   Tax Foundation rounds to two decimals; exact statutory rates are used for MN 6.875%, MO 4.225%, NJ 6.625%,
//   NM 4.875% (gross receipts tax).
// - District of Columbia: 6.0% through Sept. 30, 2027; the increase to 7% was delayed to Oct. 1, 2027 by
//   Act 26-416 (D.C. OTR notice; Sales Tax Institute, "District of Columbia General Sales Tax Rate Increases to 7%
//   on October 1, 2027"). Update the preset if that date changes.
// - Hawaii's 4% is the general excise tax (businesses usually pass on 4.166% or 4.712% with the county surcharge);
//   Utah 6.1% and Virginia 5.3% include the statewide local portions, as in the Tax Foundation table.
// Local rates vary by address, so the UI lets users type the combined rate from their receipt.

export interface StateRate {
  code: string;
  name: string;
  /** State-level rate in percent. */
  rate: number;
  /** Average combined state + local rate, Tax Foundation midyear 2026 (percent). */
  avgCombined: number;
}

export const STATE_RATES: readonly StateRate[] = [
  { code: 'AL', name: 'Alabama', rate: 4, avgCombined: 9.46 },
  { code: 'AK', name: 'Alaska', rate: 0, avgCombined: 1.82 },
  { code: 'AZ', name: 'Arizona', rate: 5.6, avgCombined: 8.54 },
  { code: 'AR', name: 'Arkansas', rate: 6.5, avgCombined: 9.48 },
  { code: 'CA', name: 'California', rate: 7.25, avgCombined: 9.03 },
  { code: 'CO', name: 'Colorado', rate: 2.9, avgCombined: 7.89 },
  { code: 'CT', name: 'Connecticut', rate: 6.35, avgCombined: 6.35 },
  { code: 'DE', name: 'Delaware', rate: 0, avgCombined: 0 },
  { code: 'DC', name: 'District of Columbia', rate: 6, avgCombined: 6 },
  { code: 'FL', name: 'Florida', rate: 6, avgCombined: 6.98 },
  { code: 'GA', name: 'Georgia', rate: 4, avgCombined: 7.56 },
  { code: 'HI', name: 'Hawaii', rate: 4, avgCombined: 4.5 },
  { code: 'ID', name: 'Idaho', rate: 6, avgCombined: 6.03 },
  { code: 'IL', name: 'Illinois', rate: 6.25, avgCombined: 8.98 },
  { code: 'IN', name: 'Indiana', rate: 7, avgCombined: 7 },
  { code: 'IA', name: 'Iowa', rate: 6, avgCombined: 6.94 },
  { code: 'KS', name: 'Kansas', rate: 6.5, avgCombined: 8.71 },
  { code: 'KY', name: 'Kentucky', rate: 6, avgCombined: 6 },
  { code: 'LA', name: 'Louisiana', rate: 5, avgCombined: 10.13 },
  { code: 'ME', name: 'Maine', rate: 5.5, avgCombined: 5.5 },
  { code: 'MD', name: 'Maryland', rate: 6, avgCombined: 6 },
  { code: 'MA', name: 'Massachusetts', rate: 6.25, avgCombined: 6.25 },
  { code: 'MI', name: 'Michigan', rate: 6, avgCombined: 6 },
  { code: 'MN', name: 'Minnesota', rate: 6.875, avgCombined: 8.14 },
  { code: 'MS', name: 'Mississippi', rate: 7, avgCombined: 7.06 },
  { code: 'MO', name: 'Missouri', rate: 4.225, avgCombined: 8.44 },
  { code: 'MT', name: 'Montana', rate: 0, avgCombined: 0 },
  { code: 'NE', name: 'Nebraska', rate: 5.5, avgCombined: 6.98 },
  { code: 'NV', name: 'Nevada', rate: 6.85, avgCombined: 8.24 },
  { code: 'NH', name: 'New Hampshire', rate: 0, avgCombined: 0 },
  { code: 'NJ', name: 'New Jersey', rate: 6.625, avgCombined: 6.6 },
  { code: 'NM', name: 'New Mexico', rate: 4.875, avgCombined: 7.68 },
  { code: 'NY', name: 'New York', rate: 4, avgCombined: 8.54 },
  { code: 'NC', name: 'North Carolina', rate: 4.75, avgCombined: 7.1 },
  { code: 'ND', name: 'North Dakota', rate: 5, avgCombined: 7.09 },
  { code: 'OH', name: 'Ohio', rate: 5.75, avgCombined: 7.29 },
  { code: 'OK', name: 'Oklahoma', rate: 4.5, avgCombined: 9.06 },
  { code: 'OR', name: 'Oregon', rate: 0, avgCombined: 0 },
  { code: 'PA', name: 'Pennsylvania', rate: 6, avgCombined: 6.34 },
  { code: 'RI', name: 'Rhode Island', rate: 7, avgCombined: 7 },
  { code: 'SC', name: 'South Carolina', rate: 6, avgCombined: 7.49 },
  { code: 'SD', name: 'South Dakota', rate: 4.2, avgCombined: 6.11 },
  { code: 'TN', name: 'Tennessee', rate: 7, avgCombined: 9.61 },
  { code: 'TX', name: 'Texas', rate: 6.25, avgCombined: 8.2 },
  { code: 'UT', name: 'Utah', rate: 6.1, avgCombined: 7.42 },
  { code: 'VT', name: 'Vermont', rate: 6, avgCombined: 6.43 },
  { code: 'VA', name: 'Virginia', rate: 5.3, avgCombined: 5.77 },
  { code: 'WA', name: 'Washington', rate: 6.5, avgCombined: 9.57 },
  { code: 'WV', name: 'West Virginia', rate: 6, avgCombined: 6.6 },
  { code: 'WI', name: 'Wisconsin', rate: 5, avgCombined: 5.72 },
  { code: 'WY', name: 'Wyoming', rate: 4, avgCombined: 5.39 },
];

export function findState(code: string): StateRate | undefined {
  return STATE_RATES.find((s) => s.code === code.toUpperCase());
}

/** Rates are stored as integers of 1/10,000 of a percent so 8.875% = 88,750 exactly. */
const RATE_SCALE = 10_000;
const DENOM = 100 * RATE_SCALE; // percent → fraction
export const MAX_RATE = 25;
export const MAX_AMOUNT_CENTS = 10_000_000_000; // $100 million

export function rateUnits(percent: number): number {
  return Math.round(percent * RATE_SCALE);
}

export function isValidRate(percent: number): boolean {
  return Number.isFinite(percent) && percent >= 0 && percent <= MAX_RATE;
}

export function isValidAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0 && cents <= MAX_AMOUNT_CENTS;
}

/** Dollars → cents, half up. */
export function toCents(dollars: number): number {
  if (!Number.isFinite(dollars)) return Number.NaN;
  return Math.round(dollars * 100 + (dollars >= 0 ? 1e-7 : -1e-7));
}

/** Tax on a pre-tax price, rounded half up to the cent (the usual rule for a single purchase). */
export function taxOn(priceCents: number, ratePercent: number): number {
  const units = rateUnits(ratePercent);
  // priceCents ≤ 1e10 and units ≤ 2.5e5 keep the product below 2^53.
  return Math.floor((priceCents * units + DENOM / 2) / DENOM);
}

export interface AddResult {
  priceCents: number;
  taxCents: number;
  totalCents: number;
}

export function addTax(priceCents: number, ratePercent: number): AddResult | null {
  if (!isValidAmount(priceCents) || !isValidRate(ratePercent)) return null;
  const taxCents = taxOn(priceCents, ratePercent);
  return { priceCents, taxCents, totalCents: priceCents + taxCents };
}

export interface RemoveResult extends AddResult {
  /** False when no whole-cent price produces exactly this total at this rate (the nearest one is returned). */
  exact: boolean;
}

/** Reverse sales tax: the pre-tax price whose price + rounded tax equals the given total. */
export function removeTax(totalCents: number, ratePercent: number): RemoveResult | null {
  if (!isValidAmount(totalCents) || !isValidRate(ratePercent)) return null;
  const units = rateUnits(ratePercent);
  const estimate = Math.round((totalCents * DENOM) / (DENOM + units));
  // Rounding the tax can make the estimate miss by a cent; check its neighbours.
  for (const candidate of [estimate, estimate - 1, estimate + 1, estimate - 2, estimate + 2]) {
    if (candidate < 0) continue;
    if (candidate + taxOn(candidate, ratePercent) === totalCents) {
      return { priceCents: candidate, taxCents: totalCents - candidate, totalCents, exact: true };
    }
  }
  return { priceCents: estimate, taxCents: totalCents - estimate, totalCents, exact: false };
}

/** Effective tax rate from a pre-tax price and the total paid, in percent. NaN when undefined. */
export function rateFrom(priceCents: number, totalCents: number): number {
  if (!(priceCents > 0) || !(totalCents >= priceCents)) return Number.NaN;
  return ((totalCents - priceCents) / priceCents) * 100;
}

/** 1234 → '$12.34'. */
export function formatUsd(cents: number): string {
  if (!Number.isFinite(cents)) return '—';
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  return `${sign}$${Math.floor(abs / 100).toLocaleString('en-US')}.${String(abs % 100).padStart(2, '0')}`;
}

/** 6.875 → '6.875%', 7 → '7%', 7.25 → '7.25%'. */
export function formatRate(percent: number): string {
  if (!Number.isFinite(percent)) return '—';
  return `${Number(percent.toFixed(4))}%`;
}

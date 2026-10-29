/**
 * Splits an integer total into shares proportional to `weights` so the shares sum exactly to `total`
 * (largest-remainder method). Ties go to earlier entries, so the result is stable.
 */
export function allocate(total: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = sum > 0 ? weights.map((w) => (total * w) / sum) : weights.map(() => total / n);
  const floors = raw.map((v) => Math.floor(v + 1e-9));
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; left > 0 && k < order.length; k++, left--) floors[order[k].i] += 1;
  return floors;
}

export interface Charges {
  /** Service charge in percent, e.g. 10 for Taiwan restaurants. */
  servicePct: number;
  /** Optional tip in percent of the subtotal. */
  tipPct: number;
}

export interface Currency {
  /**
   * Minor units per major unit: 1 for TWD / JPY (whole 元 / 円), 100 for USD (cents).
   * All rounding happens in minor units. Default 1.
   */
  scale?: number;
}

/** 'up' = everyone pays the rounded-up amount and the organizer keeps the surplus (zh default);
 *  'down' = everyone pays the rounded-down amount and the organizer covers the shortfall (幹事が負担). */
export type RoundMode = 'up' | 'down';

export interface EqualSplitInput extends Charges, Currency {
  subtotal: number;
  people: number;
  /**
   * Rounding step in minor units. 1 = split to the exact minor unit (元 / cent);
   * 10 = everyone pays the same amount rounded to 10 元; 100 with scale 100 = whole dollars.
   */
  roundTo: number;
  roundMode?: RoundMode;
}

export interface EqualSplitResult {
  subtotal: number;
  service: number;
  tip: number;
  /** Amount actually owed, rounded to whole 元. */
  grandTotal: number;
  /** Unrounded share per person. */
  exactPerPerson: number;
  /** The lower (or only) per-person amount. */
  basePerPerson: number;
  /** How many people pay `basePerPerson + 1` (roundTo 1 only). */
  extraCount: number;
  /** Amount everyone pays when roundTo > 1. */
  roundedPerPerson: number;
  /** Total collected; may differ from grandTotal when roundTo > 1. */
  collected: number;
  /** collected − grandTotal; negative when rounding down (the organizer pays the difference). */
  surplus: number;
}

function validCharges({ servicePct, tipPct }: Charges): boolean {
  return Number.isFinite(servicePct) && Number.isFinite(tipPct) && servicePct >= 0 && tipPct >= 0;
}

/** Returns null when input is invalid (non-positive subtotal, non-integer or < 1 people, negative %). */
export function splitEqually(input: EqualSplitInput): EqualSplitResult | null {
  const { subtotal, people, roundTo } = input;
  const scale = input.scale ?? 1;
  if (!Number.isFinite(subtotal) || subtotal <= 0) return null;
  if (!Number.isInteger(people) || people < 1) return null;
  if (!validCharges(input)) return null;

  const service = (subtotal * input.servicePct) / 100;
  const tip = (subtotal * input.tipPct) / 100;
  const grandMinor = Math.round((subtotal + service + tip) * scale);
  const grandTotal = grandMinor / scale;
  const exactPerPerson = grandTotal / people;
  const baseMinor = Math.floor(grandMinor / people);
  const basePerPerson = baseMinor / scale;
  const extraCount = grandMinor - baseMinor * people;

  if (roundTo > 1) {
    const steps = grandMinor / people / roundTo;
    // Rounding down to 0 would mean nobody pays anything; fall back to rounding up.
    const count = input.roundMode === 'down' && Math.floor(steps) >= 1 ? Math.floor(steps) : Math.ceil(steps);
    const roundedMinor = count * roundTo;
    const collectedMinor = roundedMinor * people;
    return {
      subtotal, service, tip, grandTotal, exactPerPerson, basePerPerson, extraCount: 0,
      roundedPerPerson: roundedMinor / scale, collected: collectedMinor / scale, surplus: (collectedMinor - grandMinor) / scale,
    };
  }
  return {
    subtotal, service, tip, grandTotal, exactPerPerson, basePerPerson, extraCount,
    roundedPerPerson: basePerPerson, collected: grandTotal, surplus: 0,
  };
}

export interface Person {
  name: string;
  /** Total of this person's own items, before service charge and tip. */
  amount: number;
}

export interface ItemizedInput extends Charges, Currency {
  people: Person[];
  /** Items everyone shares (e.g. 合菜、飲料), split equally before charges. */
  shared: number;
}

export interface ItemizedShare {
  name: string;
  own: number;
  sharedPart: number;
  /** own + sharedPart, before charges. */
  subtotal: number;
  /** Service charge and tip attributed to this person. */
  charges: number;
  /** Final amount, rounded to the currency's minor unit (whole 元 by default). */
  pay: number;
}

export interface ItemizedResult {
  subtotal: number;
  service: number;
  tip: number;
  grandTotal: number;
  shares: ItemizedShare[];
}

/**
 * Each person pays their own items plus an equal part of the shared items, with service charge
 * and tip applied proportionally. Payments are rounded to whole 元 and always sum to the grand total.
 */
export function splitItemized(input: ItemizedInput): ItemizedResult | null {
  const { people, shared } = input;
  if (people.length === 0 || !validCharges(input)) return null;
  if (!Number.isFinite(shared) || shared < 0) return null;
  if (people.some((p) => !Number.isFinite(p.amount) || p.amount < 0)) return null;

  const subtotal = people.reduce((a, p) => a + p.amount, 0) + shared;
  if (subtotal <= 0) return null;
  const service = (subtotal * input.servicePct) / 100;
  const tip = (subtotal * input.tipPct) / 100;
  const scale = input.scale ?? 1;
  const grandMinor = Math.round((subtotal + service + tip) * scale);
  const grandTotal = grandMinor / scale;
  const sharedPart = shared / people.length;
  const rate = (input.servicePct + input.tipPct) / 100;

  const subtotals = people.map((p) => p.amount + sharedPart);
  const pays = allocate(grandMinor, subtotals).map((minor) => minor / scale);
  const shares = people.map((p, i) => ({
    name: p.name,
    own: p.amount,
    sharedPart,
    subtotal: subtotals[i],
    charges: subtotals[i] * rate,
    pay: pays[i],
  }));
  return { subtotal, service, tip, grandTotal, shares };
}

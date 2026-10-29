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

export interface EqualSplitInput extends Charges {
  subtotal: number;
  people: number;
  /** 1 = split to the exact 元; 10 = everyone pays the same amount rounded up to 10 元. */
  roundTo: 1 | 10;
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
  /** Amount everyone pays in roundTo-10 mode. */
  roundedPerPerson: number;
  /** Total collected; may exceed grandTotal in roundTo-10 mode. */
  collected: number;
  /** collected − grandTotal. */
  surplus: number;
}

function validCharges({ servicePct, tipPct }: Charges): boolean {
  return Number.isFinite(servicePct) && Number.isFinite(tipPct) && servicePct >= 0 && tipPct >= 0;
}

/** Returns null when input is invalid (non-positive subtotal, non-integer or < 1 people, negative %). */
export function splitEqually(input: EqualSplitInput): EqualSplitResult | null {
  const { subtotal, people, roundTo } = input;
  if (!Number.isFinite(subtotal) || subtotal <= 0) return null;
  if (!Number.isInteger(people) || people < 1) return null;
  if (!validCharges(input)) return null;

  const service = (subtotal * input.servicePct) / 100;
  const tip = (subtotal * input.tipPct) / 100;
  const grandTotal = Math.round(subtotal + service + tip);
  const exactPerPerson = grandTotal / people;
  const basePerPerson = Math.floor(grandTotal / people);
  const extraCount = grandTotal - basePerPerson * people;

  if (roundTo === 10) {
    const roundedPerPerson = Math.ceil(grandTotal / people / 10) * 10;
    const collected = roundedPerPerson * people;
    return {
      subtotal, service, tip, grandTotal, exactPerPerson, basePerPerson, extraCount: 0,
      roundedPerPerson, collected, surplus: collected - grandTotal,
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

export interface ItemizedInput extends Charges {
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
  /** Final amount in whole 元. */
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
  const grandTotal = Math.round(subtotal + service + tip);
  const sharedPart = shared / people.length;
  const rate = (input.servicePct + input.tipPct) / 100;

  const subtotals = people.map((p) => p.amount + sharedPart);
  const pays = allocate(grandTotal, subtotals);
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

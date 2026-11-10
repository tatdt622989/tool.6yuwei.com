// Stacks several promotions on one order and compares offers. Pure: no DOM, no strings.
import { parseNumber } from '../../lib/format';
import { applyThreshold, roundMoney, zheToFactor, type MoneyRounding } from '../discount-calculator/logic';

/**
 * The stacking rule, in the order the steps are applied:
 *  1. percent    percentage discount on the list price
 *  2. threshold  spend X, get Y off, checked against the amount after step 1
 *  3. coupon     fixed amount off, minimum spend checked against the amount after step 2, never below zero
 *  4. shipping   added to the goods amount; waived when the goods amount after steps 1–3 reaches the threshold
 *  5. cashback   earned on the goods amount paid (shipping excluded), capped; value received later, not money off
 * Real stores differ; the UI says so.
 */
export const ORDER_OF_OPERATIONS = ['percent', 'threshold', 'coupon', 'shipping', 'cashback'] as const;
export type Step = (typeof ORDER_OF_OPERATIONS)[number];

export const MIN_OFFERS = 1;
export const MAX_OFFERS = 4;

/** A repeating threshold is "nearly reached" when the gap is at most this share of the threshold. */
export const NEAR_RATIO = 0.3;

/** 折數 (85 = pay 85%), percent off (15 = pay 85%) or Japanese 割引 (1.5 = pay 85%). */
export type DiscountUnit = 'zhe' | 'percent' | 'wari';

/**
 * How computed amounts are rounded: discount-calculator's modes plus
 * 'unit' = to the nearest whole currency unit (四捨五入到元).
 */
export type Rounding = MoneyRounding | 'unit';

export function roundAmount(value: number, rounding: Rounding): number {
  if (!Number.isFinite(value)) return value;
  // The epsilon keeps binary noise (1,010 × 0.85 = 858.4999…) from rounding the wrong way.
  if (rounding === 'unit') return Math.round(value + 1e-9);
  return roundMoney(value, rounding);
}

/** Price factor of a percentage discount: 0.85 for 85 折, 15% off or 1.5 割引. NaN when out of range. */
export function discountToFactor(value: number, unit: DiscountUnit): number {
  if (!Number.isFinite(value)) return Number.NaN;
  if (unit === 'zhe') return zheToFactor(value);
  const max = unit === 'wari' ? 10 : 100;
  if (value < 0 || value > max) return Number.NaN;
  return tidy(1 - value / max);
}

/** One store or one way of paying. Everything but `price` is optional; `undefined` means "not offered". */
export interface OfferInput {
  /** List price total of the order. */
  price: number;
  /** Price factor of the percentage discount (0.85 = 85 折 = 15% off). */
  factor?: number;
  /** Spend `thresholdSpend`, get `thresholdOff` off. Both are needed for the step to apply. */
  thresholdSpend?: number;
  thresholdOff?: number;
  /** 每滿: the threshold discount applies once for every `thresholdSpend`. */
  thresholdRepeat?: boolean;
  /** Fixed coupon amount, with an optional minimum spend. */
  coupon?: number;
  couponMinSpend?: number;
  /** Shipping fee, waived when the goods amount reaches `freeShippingFrom`. */
  shipping?: number;
  freeShippingFrom?: number;
  /** Cashback or points rate in percent, with an optional cap on the amount. */
  cashbackRate?: number;
  cashbackCap?: number;
}

export interface OfferResult {
  price: number;
  /** Factor of the percentage step (1 when there is none). */
  factor: number;
  percentSaved: number;
  afterPercent: number;
  /** How many times the threshold discount applied (0 when not reached or not offered). */
  thresholdTimes: number;
  thresholdOff: number;
  afterThreshold: number;
  couponApplied: boolean;
  /** Amount the coupon actually removed (less than its face value when the order is smaller). */
  couponOff: number;
  /** Goods amount paid after every discount, before shipping. */
  goods: number;
  shippingWaived: boolean;
  /** Shipping actually charged. */
  shipping: number;
  /** Amount paid now: goods + shipping. */
  paid: number;
  /** Cashback before the cap. */
  cashbackRaw: number;
  cashback: number;
  cashbackCapped: boolean;
  /** Effective cost: paid − cashback. */
  effective: number;
  /** paid ÷ price and effective ÷ price; NaN when the price is 0. */
  paidFactor: number;
  effectiveFactor: number;
}

/** Removes binary noise from sums and differences of money (163.20000000000002 → 163.2). */
function tidy(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

const given = (value: number | undefined): value is number => value !== undefined;
const invalid = (value: number | undefined): boolean => given(value) && !(Number.isFinite(value) && value >= 0);

/**
 * Applies the five steps in ORDER_OF_OPERATIONS. Returns null when the price is missing or any
 * provided number is not a finite, non-negative value in range (factor 0–1, cashback rate 0–100).
 */
export function computeOffer(input: OfferInput, rounding: Rounding = 'none'): OfferResult | null {
  const { price } = input;
  if (!Number.isFinite(price) || price < 0) return null;
  const optional = [
    input.factor,
    input.thresholdSpend,
    input.thresholdOff,
    input.coupon,
    input.couponMinSpend,
    input.shipping,
    input.freeShippingFrom,
    input.cashbackRate,
    input.cashbackCap,
  ];
  if (optional.some(invalid)) return null;
  const factor = input.factor ?? 1;
  const rate = input.cashbackRate ?? 0;
  if (factor > 1 || rate > 100) return null;

  // 1. Percentage discount.
  const afterPercent = roundAmount(price * factor, rounding);

  // 2. Threshold discount on the discounted amount.
  let thresholdTimes = 0;
  let afterThreshold = afterPercent;
  if (given(input.thresholdSpend) && input.thresholdSpend > 0 && given(input.thresholdOff)) {
    const r = applyThreshold(afterPercent, input.thresholdSpend, input.thresholdOff, input.thresholdRepeat === true);
    thresholdTimes = r.times;
    afterThreshold = tidy(r.final);
  }

  // 3. Coupon: minimum spend is checked against the amount at this point; never below zero.
  const coupon = input.coupon ?? 0;
  const couponApplied = coupon > 0 && afterThreshold >= (input.couponMinSpend ?? 0);
  const goods = couponApplied ? Math.max(0, tidy(afterThreshold - coupon)) : afterThreshold;

  // 4. Shipping: free when the goods amount after discounts reaches the threshold.
  const fee = input.shipping ?? 0;
  const shippingWaived = fee > 0 && given(input.freeShippingFrom) && goods >= input.freeShippingFrom;
  const shipping = shippingWaived ? 0 : fee;
  const paid = tidy(goods + shipping);

  // 5. Cashback on the goods amount paid, capped. It comes back later, so it is not taken off `paid`.
  const cashbackRaw = roundAmount((goods * rate) / 100, rounding);
  const cashbackCapped = given(input.cashbackCap) && cashbackRaw > input.cashbackCap;
  const cashback = cashbackCapped ? (input.cashbackCap as number) : cashbackRaw;
  const effective = tidy(paid - cashback);

  return {
    price,
    factor,
    percentSaved: tidy(price - afterPercent),
    afterPercent,
    thresholdTimes,
    thresholdOff: tidy(afterPercent - afterThreshold),
    afterThreshold,
    couponApplied,
    couponOff: tidy(afterThreshold - goods),
    goods,
    shippingWaived,
    shipping,
    paid,
    cashbackRaw,
    cashback,
    cashbackCapped,
    effective,
    paidFactor: price === 0 ? Number.NaN : paid / price,
    effectiveFactor: price === 0 ? Number.NaN : effective / price,
  };
}

// ---- Hints: what a little more spending would unlock, and cashback lost to a cap ----

export type Hint =
  /** Add `add` to the list price to get (another) `off` from the threshold discount. */
  | { kind: 'threshold'; add: number; off: number; again: boolean }
  /** The coupon's minimum spend is not met: add `add` to the list price to use it. */
  | { kind: 'coupon'; add: number; off: number }
  /** Add `add` to the list price to get free shipping and save `fee`. */
  | { kind: 'shipping'; add: number; fee: number }
  /** Cashback hit its cap: `lost` is the part that is not paid out. */
  | { kind: 'cashback-cap'; cap: number; lost: number };

/**
 * Increase of the list price (in whole currency units, or cents for 'cent') that brings `shortfall`
 * to zero. Recomputes the whole offer each round, so rounding and a repeating threshold
 * discount that kicks in on the way are accounted for. NaN when it cannot be reached.
 */
function extraNeeded(input: OfferInput, rounding: Rounding, shortfall: (r: OfferResult) => number): number {
  const unit = rounding === 'cent' ? 0.01 : 1;
  const factor = input.factor ?? 1;
  if (!(factor > 0)) return Number.NaN;
  const reached = (add: number) => {
    const r = computeOffer({ ...input, price: tidy(input.price + add) }, rounding);
    return r ? shortfall(r) : Number.NaN;
  };
  let add = 0;
  for (let i = 0; i < 16; i++) {
    const gap = reached(add);
    if (Number.isNaN(gap)) return Number.NaN;
    if (gap <= 1e-9) {
      // Rounding to the nearest unit can make one unit less enough (2,222 × 0.9 = 1,999.8 → 2,000).
      for (let back = 0; back < 3 && add >= unit && reached(tidy(add - unit)) <= 1e-9; back++) add = tidy(add - unit);
      return add;
    }
    const next = Math.ceil((add + gap / factor) / unit - 1e-7) * unit;
    add = tidy(Math.max(next, add + unit));
  }
  return Number.NaN;
}

export function offerHints(input: OfferInput, rounding: Rounding = 'none'): Hint[] {
  const r = computeOffer(input, rounding);
  if (!r) return [];
  const hints: Hint[] = [];

  const spend = input.thresholdSpend ?? 0;
  const off = input.thresholdOff ?? 0;
  if (spend > 0 && off > 0 && (r.thresholdTimes === 0 || input.thresholdRepeat === true)) {
    const target = (Math.floor(r.afterPercent / spend) + 1) * spend;
    // An unmet threshold is always worth a line; the next repeat only when it is close.
    if (r.thresholdTimes === 0 || target - r.afterPercent <= NEAR_RATIO * spend) {
      const add = extraNeeded(input, rounding, (x) => target - x.afterPercent);
      if (Number.isFinite(add)) hints.push({ kind: 'threshold', add, off, again: r.thresholdTimes > 0 });
    }
  }

  const coupon = input.coupon ?? 0;
  if (coupon > 0 && !r.couponApplied) {
    const min = input.couponMinSpend ?? 0;
    const add = extraNeeded(input, rounding, (x) => min - x.afterThreshold);
    if (Number.isFinite(add)) hints.push({ kind: 'coupon', add, off: coupon });
  }

  const fee = input.shipping ?? 0;
  if (fee > 0 && given(input.freeShippingFrom) && !r.shippingWaived) {
    const from = input.freeShippingFrom;
    const add = extraNeeded(input, rounding, (x) => from - x.goods);
    if (Number.isFinite(add)) hints.push({ kind: 'shipping', add, fee });
  }

  if (r.cashbackCapped) hints.push({ kind: 'cashback-cap', cap: r.cashback, lost: tidy(r.cashbackRaw - r.cashback) });
  return hints;
}

// ---- Comparison ----

type Costs = Pick<OfferResult, 'paid' | 'effective'>;
export type CostKey = keyof Costs;

/** Two amounts are the same money when they differ by less than half a cent. */
const same = (a: number, b: number) => Math.abs(a - b) < 0.005;

export interface Ranking {
  /** Indexes of the valid offers, cheapest effective cost first; ties by amount paid, then input order. */
  order: number[];
  /** Offers tied for the lowest amount paid now. */
  bestPaid: number[];
  /** Offers tied for the lowest effective cost (paid − cashback). */
  bestEffective: number[];
  /** True when the two winner lists are not identical, i.e. cashback changes the answer. */
  split: boolean;
}

/** Ranks offers; `null` entries (incomplete or invalid offers) are skipped but keep their index. */
export function rankOffers(results: readonly (Costs | null)[]): Ranking {
  const valid = results.flatMap((r, index) => (r ? [{ index, ...r }] : []));
  const lowest = (key: CostKey) => {
    const min = Math.min(...valid.map((r) => r[key]));
    return valid.filter((r) => same(r[key], min)).map((r) => r.index);
  };
  const order = [...valid]
    .sort((a, b) =>
      same(a.effective, b.effective)
        ? same(a.paid, b.paid)
          ? a.index - b.index
          : a.paid - b.paid
        : a.effective - b.effective,
    )
    .map((r) => r.index);
  const bestPaid = lowest('paid');
  const bestEffective = lowest('effective');
  const split = bestPaid.length !== bestEffective.length || bestPaid.some((index, i) => index !== bestEffective[i]);
  return { order, bestPaid, bestEffective, split };
}

/** How much offer `best` saves against every other valid offer on `key`, in input order (0 for a tie). */
export function savingsAgainst(
  results: readonly (Costs | null)[],
  best: number,
  key: CostKey,
): { index: number; amount: number }[] {
  const winner = results[best];
  if (!winner) return [];
  return results.flatMap((r, index) => {
    if (!r || index === best) return [];
    const amount = tidy(r[key] - winner[key]);
    return [{ index, amount: same(amount, 0) ? 0 : amount }];
  });
}

// ---- Form fields ↔ numbers ----

/** One offer as typed into the form (and as stored in the browser). */
export interface OfferFields {
  name: string;
  price: string;
  discount: string;
  unit: DiscountUnit;
  thresholdSpend: string;
  thresholdOff: string;
  thresholdRepeat: boolean;
  coupon: string;
  couponMinSpend: string;
  shipping: string;
  freeShippingFrom: string;
  cashbackRate: string;
  cashbackCap: string;
}

/** The text inputs of an offer (everything but the unit select and the repeat checkbox). */
export const TEXT_FIELDS = [
  'name',
  'price',
  'discount',
  'thresholdSpend',
  'thresholdOff',
  'coupon',
  'couponMinSpend',
  'shipping',
  'freeShippingFrom',
  'cashbackRate',
  'cashbackCap',
] as const satisfies readonly (keyof OfferFields)[];

export function blankOffer(unit: DiscountUnit, fields: Partial<OfferFields> = {}): OfferFields {
  return {
    name: '',
    price: '',
    discount: '',
    unit,
    thresholdSpend: '',
    thresholdOff: '',
    thresholdRepeat: false,
    coupon: '',
    couponMinSpend: '',
    shipping: '',
    freeShippingFrom: '',
    cashbackRate: '',
    cashbackCap: '',
    ...fields,
  };
}

/** Blank → undefined (not offered); anything else → a number, NaN when it is not one. */
function amount(text: string): number | undefined {
  // People paste "$240", "3,980 元" or "85 折"; the unit is implied by the field.
  const cleaned = text.replace(/NT\$|[$¥￥%％元円折割]/gi, '').trim();
  if (cleaned === '') return text.trim() === '' ? undefined : Number.NaN;
  return parseNumber(cleaned);
}

/**
 * Turns form fields into an OfferInput. Returns null while the price is blank (nothing to compute yet).
 * Blank optional fields are left out; junk becomes NaN so that computeOffer rejects the offer.
 */
export function parseOffer(fields: OfferFields): OfferInput | null {
  const price = amount(fields.price);
  if (price === undefined) return null;
  const discount = amount(fields.discount);
  return {
    price,
    factor: discount === undefined ? undefined : discountToFactor(discount, fields.unit),
    thresholdSpend: amount(fields.thresholdSpend),
    thresholdOff: amount(fields.thresholdOff),
    thresholdRepeat: fields.thresholdRepeat,
    coupon: amount(fields.coupon),
    couponMinSpend: amount(fields.couponMinSpend),
    shipping: amount(fields.shipping),
    freeShippingFrom: amount(fields.freeShippingFrom),
    cashbackRate: amount(fields.cashbackRate),
    cashbackCap: amount(fields.cashbackCap),
  };
}

/**
 * Validates offers read back from storage: one to four entries, strings where strings belong and a
 * discount unit this locale offers. Returns null when there is nothing usable.
 */
export function restoreOffers(raw: unknown, units: readonly DiscountUnit[]): OfferFields[] | null {
  if (!Array.isArray(raw) || raw.length < MIN_OFFERS || units.length === 0) return null;
  return raw.slice(0, MAX_OFFERS).map((entry) => {
    const saved = (typeof entry === 'object' && entry !== null ? entry : {}) as Record<string, unknown>;
    const offer = blankOffer(units.includes(saved.unit as DiscountUnit) ? (saved.unit as DiscountUnit) : units[0]);
    for (const key of TEXT_FIELDS) if (typeof saved[key] === 'string') offer[key] = saved[key];
    offer.thresholdRepeat = saved.thresholdRepeat === true;
    return offer;
  });
}

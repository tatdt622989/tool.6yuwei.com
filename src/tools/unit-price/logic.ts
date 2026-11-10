// Unit price comparison: turn "price for some amount" into a price per common unit and rank the options.
// Everything is converted to a base unit per dimension: one piece, one gram, one millilitre.

export type Dimension = 'count' | 'weight' | 'volume';
export type UnitId = 'count' | 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'floz' | 'gal';

interface UnitDef {
  dimension: Dimension;
  /** How many base units (piece / g / ml) one of this unit is. Exact by definition. */
  toBase: number;
  imperial: boolean;
}

/**
 * Exact definitions: the international avoirdupois pound is 453.59237 g (an ounce is 1/16 of it),
 * the US gallon is 231 cubic inches = 3785.411784 ml (a US fluid ounce is 1/128 of it).
 */
export const UNITS: Record<UnitId, UnitDef> = {
  count: { dimension: 'count', toBase: 1, imperial: false },
  g: { dimension: 'weight', toBase: 1, imperial: false },
  kg: { dimension: 'weight', toBase: 1000, imperial: false },
  oz: { dimension: 'weight', toBase: 28.349523125, imperial: true },
  lb: { dimension: 'weight', toBase: 453.59237, imperial: true },
  ml: { dimension: 'volume', toBase: 1, imperial: false },
  l: { dimension: 'volume', toBase: 1000, imperial: false },
  floz: { dimension: 'volume', toBase: 29.5735295625, imperial: true },
  gal: { dimension: 'volume', toBase: 3785.411784, imperial: true },
};

export function isUnitId(value: unknown): value is UnitId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(UNITS, value);
}

/** Convert between two units of the same dimension; NaN across dimensions or for non-numbers. */
export function convert(value: number, from: UnitId, to: UnitId): number {
  if (!Number.isFinite(value) || UNITS[from].dimension !== UNITS[to].dimension) return Number.NaN;
  return (value * UNITS[from].toBase) / UNITS[to].toBase;
}

/**
 * How a discounted price is rounded to the currency's smallest unit (same rule as the discount calculator):
 *  - 'none':  keep decimals (zh-TW shows up to 2 decimals)
 *  - 'cent':  round to cents (USD)
 *  - 'floor': drop fractions of a yen (1 円未満切り捨て)
 */
export type MoneyRounding = 'none' | 'cent' | 'floor';

export function roundMoney(value: number, rounding: MoneyRounding): number {
  if (!Number.isFinite(value)) return value;
  // A tiny epsilon keeps binary noise such as 169.99999999 from flooring a yen too low.
  if (rounding === 'floor') return Math.floor(value + 1e-9);
  if (rounding === 'cent') return Math.round((value + Number.EPSILON) * 100) / 100;
  return value;
}

/** 'zhe' = Taiwanese 折數 (85 → pay 85%, 8 → pay 80%); 'percent' = percent off (20 → pay 80%). */
export type DiscountKind = 'zhe' | 'percent';

/**
 * Price factor for a discount entry. NaN when the entry is out of range:
 * 折數 must be above 0 and below 100, percent off from 0 up to (not including) 100.
 */
export function discountFactor(kind: DiscountKind, value: number): number {
  if (!Number.isFinite(value)) return Number.NaN;
  if (kind === 'zhe') {
    if (value <= 0 || value >= 100) return Number.NaN;
    return value < 10 ? value / 10 : value / 100;
  }
  if (value < 0 || value >= 100) return Number.NaN;
  return 1 - value / 100;
}

/** One option as typed by the user. `null` = left blank, NaN = not a number. */
export interface OptionInput {
  /** Listed price for the whole option. Required, above 0. */
  price: number | null;
  /** Amount in one pack, in `unit`. Required, above 0. */
  amount: number | null;
  unit: UnitId;
  /** Number of packs. Blank = 1. */
  packs: number | null;
  /** Shipping fee added to the price. Blank = 0. */
  shipping: number | null;
  /** Discount on the price (not on shipping), read according to `DiscountKind`. Blank = none. */
  discount: number | null;
}

export type OptionField = 'price' | 'amount' | 'packs' | 'shipping' | 'discount';

export interface EvaluatedOption {
  unit: UnitId;
  dimension: Dimension;
  amount: number;
  packs: number;
  /** amount × packs, in the option's own unit. */
  quantity: number;
  /** The same quantity in base units (pieces, g or ml). */
  baseQuantity: number;
  listPrice: number;
  /** Price factor of the discount, 1 when there is none. */
  factor: number;
  shipping: number;
  /** Discounted price (rounded for the currency) plus shipping: what is actually paid. */
  total: number;
  /** total ÷ baseQuantity: price of one piece, one gram or one millilitre. */
  unitPrice: number;
}

export type Evaluation =
  | { status: 'ok'; option: EvaluatedOption }
  /** Nothing typed yet. */
  | { status: 'empty' }
  /** A required field (price or amount) is still blank. */
  | { status: 'incomplete'; field: OptionField }
  /** A field holds something that cannot be used (text, zero, negative, out of range). */
  | { status: 'invalid'; field: OptionField };

export interface EvaluateConfig {
  discountKind: DiscountKind;
  rounding: MoneyRounding;
}

const positive = (n: number) => Number.isFinite(n) && n > 0;

/** Check one option and compute its unit price. Never returns NaN inside an 'ok' result. */
export function evaluateOption(input: OptionInput, config: EvaluateConfig): Evaluation {
  const { price, amount, packs, shipping, discount } = input;
  if (!isUnitId(input.unit)) return { status: 'invalid', field: 'amount' };

  if (price !== null && !positive(price)) return { status: 'invalid', field: 'price' };
  if (packs !== null && !positive(packs)) return { status: 'invalid', field: 'packs' };
  if (amount !== null && !positive(amount)) return { status: 'invalid', field: 'amount' };
  if (shipping !== null && !(Number.isFinite(shipping) && shipping >= 0)) return { status: 'invalid', field: 'shipping' };
  const factor = discount === null ? 1 : discountFactor(config.discountKind, discount);
  if (Number.isNaN(factor)) return { status: 'invalid', field: 'discount' };

  if (price === null || amount === null) {
    const blank = price === null && amount === null && packs === null && shipping === null && discount === null;
    return blank ? { status: 'empty' } : { status: 'incomplete', field: price === null ? 'price' : 'amount' };
  }

  const unit = UNITS[input.unit];
  const packCount = packs ?? 1;
  const fee = shipping ?? 0;
  const quantity = amount * packCount;
  const baseQuantity = quantity * unit.toBase;
  const total = roundMoney(price * factor, config.rounding) + fee;
  const unitPrice = total / baseQuantity;
  // Rounding can take a tiny price down to 0, and absurd magnitudes overflow: neither can be ranked.
  if (!positive(baseQuantity)) return { status: 'invalid', field: 'amount' };
  if (!positive(total) || !positive(unitPrice)) return { status: 'invalid', field: 'price' };

  return {
    status: 'ok',
    option: {
      unit: input.unit,
      dimension: unit.dimension,
      amount,
      packs: packCount,
      quantity,
      baseQuantity,
      listPrice: price,
      factor,
      shipping: fee,
      total,
      unitPrice,
    },
  };
}

/** The amount a unit price is quoted for: { unit: 'g', amount: 100 } = "per 100 g". */
export interface Base {
  unit: UnitId;
  amount: number;
}

export interface BaseRule {
  /**
   * Count items whose cheapest price per piece is below this (in the currency's main unit)
   * are quoted per 100 pieces: 0.16 元 per sheet reads better as 15.87 元 per 100 sheets.
   */
  countPer100Below: number;
}

// Allows for binary noise when a quantity sits exactly on a threshold (16 oz is one pound).
const reaches = (value: number, threshold: number) => value >= threshold * (1 - 1e-12);

/**
 * Pick one shared base for a set of comparable options (all in `dimension`):
 *  - count:  per 1, or per 100 when a single piece costs very little
 *  - metric: per 100 g / 100 ml, or per kg / L once every option holds at least 1 kg / 1 L
 *  - US customary (as soon as one option is entered in oz, lb, fl oz or gal): per oz / fl oz,
 *    or per lb / gal once every option holds at least 1 lb / 1 gal
 */
export function chooseBase(dimension: Dimension, options: EvaluatedOption[], rule: BaseRule): Base {
  if (dimension === 'count') {
    const cheapest = Math.min(...options.map((o) => o.unitPrice));
    return { unit: 'count', amount: cheapest < rule.countPer100Below ? 100 : 1 };
  }
  const smallest = Math.min(...options.map((o) => o.baseQuantity));
  const imperial = options.some((o) => UNITS[o.unit].imperial);
  if (dimension === 'weight') {
    if (imperial) return { unit: reaches(smallest, UNITS.lb.toBase) ? 'lb' : 'oz', amount: 1 };
    return reaches(smallest, 1000) ? { unit: 'kg', amount: 1 } : { unit: 'g', amount: 100 };
  }
  if (imperial) return { unit: reaches(smallest, UNITS.gal.toBase) ? 'gal' : 'floz', amount: 1 };
  return reaches(smallest, 1000) ? { unit: 'l', amount: 1 } : { unit: 'ml', amount: 100 };
}

/** Price for one `base` (e.g. per 100 g) from a price per base unit (per g). */
export function priceForBase(unitPrice: number, base: Base): number {
  return unitPrice * base.amount * UNITS[base.unit].toBase;
}

/**
 * Decimals worth showing for a unit price. Small unit prices need more precision than money:
 * 15.87 per 100 sheets, 0.159 per fl oz, 0.0124 per sheet.
 */
export function priceDigits(value: number): number {
  const v = Math.abs(value);
  if (v >= 1) return 2;
  if (v >= 0.1) return 3;
  return 4;
}

export interface RankedOption extends EvaluatedOption {
  /** Position in the input list. */
  index: number;
  /** 1-based; options with the same unit price share a rank (1, 1, 3). */
  rank: number;
  /** Has the lowest unit price (several options can). */
  best: boolean;
  /** Unit price for the comparison's `base`. */
  basePrice: number;
  /** How much higher the unit price is than the best one, in percent. 0 for the best. */
  percentMore: number;
  /** What this option costs on top of buying its own quantity at the best unit price. 0 for the best. */
  extraCost: number;
}

export type Comparison =
  /** No usable option yet. */
  | { status: 'none'; skipped: number[] }
  /** Options measure different things (weight vs volume vs count): no ranking. */
  | { status: 'mixed'; dimensions: Dimension[]; skipped: number[] }
  /** 'single' = only one usable option, so there is a unit price but nothing to compare with. */
  | {
      status: 'single' | 'ranked';
      dimension: Dimension;
      base: Base;
      /** Cheapest first; ties keep input order. */
      ranked: RankedOption[];
      /** Every usable option has the same unit price. */
      allTied: boolean;
      skipped: number[];
    };

// Two unit prices count as equal when they differ only by floating-point noise (199/1200 vs 398/2400).
const samePrice = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));

/**
 * Rank evaluated options by unit price. `skipped` lists the positions of rows that were
 * started but cannot be used (incomplete or invalid); blank rows are not reported.
 */
export function compareOptions(evaluations: Evaluation[], rule: BaseRule): Comparison {
  const skipped: number[] = [];
  const usable: { index: number; option: EvaluatedOption }[] = [];
  evaluations.forEach((e, index) => {
    if (e.status === 'ok') usable.push({ index, option: e.option });
    else if (e.status !== 'empty') skipped.push(index);
  });
  if (usable.length === 0) return { status: 'none', skipped };

  const dimensions = [...new Set(usable.map((u) => u.option.dimension))];
  if (dimensions.length > 1) return { status: 'mixed', dimensions, skipped };

  const dimension = dimensions[0];
  const base = chooseBase(
    dimension,
    usable.map((u) => u.option),
    rule,
  );
  const sorted = [...usable].sort((a, b) => a.option.unitPrice - b.option.unitPrice || a.index - b.index);
  const bestPrice = sorted[0].option.unitPrice;

  let rank = 0;
  let groupPrice = Number.NaN;
  const ranked = sorted.map(({ index, option }, position): RankedOption => {
    if (position === 0 || !samePrice(option.unitPrice, groupPrice)) {
      rank = position + 1;
      groupPrice = option.unitPrice;
    }
    const best = samePrice(option.unitPrice, bestPrice);
    return {
      ...option,
      index,
      rank,
      best,
      basePrice: priceForBase(option.unitPrice, base),
      percentMore: best ? 0 : (option.unitPrice / bestPrice - 1) * 100,
      extraCost: best ? 0 : option.total - bestPrice * option.baseQuantity,
    };
  });
  // Ties keep the order the user typed them in.
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);

  return {
    status: ranked.length === 1 ? 'single' : 'ranked',
    dimension,
    base,
    ranked,
    allTied: ranked.every((r) => r.best),
    skipped,
  };
}

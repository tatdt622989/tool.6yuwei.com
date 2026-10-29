// A discount is represented as a price factor: 0.8 means 「打 8 折」, i.e. pay 80%.

export interface DiscountResult {
  /** Amount actually paid. */
  final: number;
  /** Amount saved versus the original total. */
  saved: number;
  /** final / original, e.g. 0.8 for 8 折. */
  factor: number;
}

const invalid: DiscountResult = { final: Number.NaN, saved: Number.NaN, factor: Number.NaN };

/**
 * Converts a Taiwanese 折數 to a factor: 8 → 0.8, 85 → 0.85, 8.5 → 0.85, 75 → 0.75.
 * One digit (or one digit plus decimals) is tenths; two digits are hundredths.
 * Returns NaN for 0, negatives, ≥ 100 and non-numbers.
 */
export function zheToFactor(zhe: number): number {
  if (!Number.isFinite(zhe) || zhe <= 0 || zhe >= 100) return Number.NaN;
  return zhe < 10 ? zhe / 10 : zhe / 100;
}

/** Factor → 折數 label: 0.8 → 「8 折」, 0.85 → 「85 折」, 2/3 → 「66.7 折」. */
export function factorToZhe(factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0 || factor >= 1) return factor === 1 ? '不打折' : '—';
  const pct = Math.round(factor * 1000) / 10; // one decimal of a percent
  if (pct % 10 === 0) return `${pct / 10} 折`;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)} 折`;
}

/** Percent off implied by a factor: 0.8 → 20. */
export function factorToPercentOff(factor: number): number {
  return Number.isFinite(factor) ? (1 - factor) * 100 : Number.NaN;
}

function result(original: number, final: number): DiscountResult {
  return { final, saved: original - final, factor: original === 0 ? Number.NaN : final / original };
}

function validPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

/** 打折: apply one or more 折數 in sequence (折上折 multiplies). */
export function applyZhe(price: number, ...zhe: number[]): DiscountResult {
  if (!validPrice(price) || zhe.length === 0) return invalid;
  const factors = zhe.map(zheToFactor);
  if (factors.some(Number.isNaN)) return invalid;
  return result(price, factors.reduce((p, f) => p * f, price));
}

/** X% off. Accepts 0–100. */
export function applyPercentOff(price: number, percentOff: number): DiscountResult {
  if (!validPrice(price) || !Number.isFinite(percentOff) || percentOff < 0 || percentOff > 100) return invalid;
  return result(price, price * (1 - percentOff / 100));
}

export interface ThresholdResult extends DiscountResult {
  /** How many times the threshold was reached. */
  times: number;
  /** Extra spending needed to reach the next discount; NaN when no further discount applies. */
  toNext: number;
}

/**
 * 滿額折: e.g. 每滿 1,000 折 100. When `repeat` is false the discount applies at most once.
 */
export function applyThreshold(total: number, threshold: number, off: number, repeat: boolean): ThresholdResult {
  if (!validPrice(total) || !(threshold > 0) || !Number.isFinite(off) || off < 0) {
    return { ...invalid, times: Number.NaN, toNext: Number.NaN };
  }
  const reached = Math.floor(total / threshold);
  const times = repeat ? reached : Math.min(1, reached);
  const final = Math.max(0, total - times * off);
  const toNext = repeat || reached === 0 ? (reached + 1) * threshold - total : Number.NaN;
  return { ...result(total, final), times, toNext };
}

export interface BundleResult {
  /** Items received. */
  items: number;
  /** Total paid. */
  paid: number;
  /** Average price per item received. */
  perItem: number;
  factor: number;
}

/** 買 N 送 M: pay for N items, receive N + M. */
export function buyNGetM(unitPrice: number, buy: number, free: number): BundleResult {
  if (!validPrice(unitPrice) || !Number.isInteger(buy) || buy < 1 || !Number.isInteger(free) || free < 0) {
    return { items: Number.NaN, paid: Number.NaN, perItem: Number.NaN, factor: Number.NaN };
  }
  const items = buy + free;
  const paid = unitPrice * buy;
  return { items, paid, perItem: paid / items, factor: buy / items };
}

/** 第二件 N 折: two items, the second at the given 折數. */
export function secondItem(unitPrice: number, zhe: number): BundleResult {
  const f = zheToFactor(zhe);
  if (!validPrice(unitPrice) || Number.isNaN(f)) {
    return { items: Number.NaN, paid: Number.NaN, perItem: Number.NaN, factor: Number.NaN };
  }
  const paid = unitPrice * (1 + f);
  return { items: 2, paid, perItem: paid / 2, factor: (1 + f) / 2 };
}

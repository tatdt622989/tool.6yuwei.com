import { describe, expect, it } from 'vitest';
import {
  MAX_OFFERS,
  MIN_OFFERS,
  ORDER_OF_OPERATIONS,
  blankOffer,
  computeOffer,
  discountToFactor,
  offerHints,
  parseOffer,
  rankOffers,
  restoreOffers,
  roundAmount,
  savingsAgainst,
  type OfferInput,
} from './logic';
import i18n from './i18n';

/** Shorthand: a valid offer or a failed test. */
function offer(input: OfferInput, rounding: Parameters<typeof computeOffer>[1] = 'unit') {
  const r = computeOffer(input, rounding);
  if (!r) throw new Error('expected a valid offer');
  return r;
}

describe('discountToFactor', () => {
  it.each([
    [85, 'zhe', 0.85],
    [8, 'zhe', 0.8],
    [8.5, 'zhe', 0.85],
    [88, 'zhe', 0.88],
    [15, 'percent', 0.85],
    [12, 'percent', 0.88],
    [0, 'percent', 1],
    [100, 'percent', 0],
    [1.5, 'wari', 0.85],
    [3, 'wari', 0.7],
    [10, 'wari', 0],
  ] as const)('%s %s → %s', (value, unit, factor) => {
    expect(discountToFactor(value, unit)).toBeCloseTo(factor, 10);
  });

  it('rejects values outside each unit’s range', () => {
    expect(discountToFactor(0, 'zhe')).toBeNaN();
    expect(discountToFactor(100, 'zhe')).toBeNaN();
    expect(discountToFactor(-5, 'percent')).toBeNaN();
    expect(discountToFactor(101, 'percent')).toBeNaN();
    expect(discountToFactor(11, 'wari')).toBeNaN();
    expect(discountToFactor(Number.NaN, 'percent')).toBeNaN();
    expect(discountToFactor(Number.POSITIVE_INFINITY, 'wari')).toBeNaN();
  });
});

describe('roundAmount', () => {
  it('rounds to the nearest whole unit for "unit"', () => {
    expect(roundAmount(3502.4, 'unit')).toBe(3502);
    expect(roundAmount(2639.5, 'unit')).toBe(2640);
    // 1,010 × 0.85 is 858.4999… in binary; it must still round up like 858.5.
    expect(roundAmount(1010 * 0.85, 'unit')).toBe(859);
  });

  it('keeps discount-calculator’s modes', () => {
    expect(roundAmount(169.9915, 'cent')).toBe(169.99);
    expect(roundAmount(2549.15, 'floor')).toBe(2549);
    expect(roundAmount(12.345, 'none')).toBe(12.345);
    expect(roundAmount(Number.NaN, 'unit')).toBeNaN();
  });
});

describe('the stacking rule', () => {
  it('is percent → threshold → coupon → shipping → cashback', () => {
    expect([...ORDER_OF_OPERATIONS]).toEqual(['percent', 'threshold', 'coupon', 'shipping', 'cashback']);
  });

  it('allows one to four offers', () => {
    expect([MIN_OFFERS, MAX_OFFERS]).toEqual([1, 4]);
  });
});

describe('computeOffer: each step alone', () => {
  it('price only: you pay the list price', () => {
    expect(offer({ price: 1280 })).toMatchObject({
      paid: 1280,
      goods: 1280,
      cashback: 0,
      effective: 1280,
      paidFactor: 1,
      effectiveFactor: 1,
      percentSaved: 0,
      thresholdOff: 0,
      couponOff: 0,
      shipping: 0,
    });
  });

  it('percentage discount', () => {
    const r = offer({ price: 1280, factor: 0.8 });
    expect(r).toMatchObject({ afterPercent: 1024, percentSaved: 256, paid: 1024, effective: 1024 });
    expect(r.paidFactor).toBeCloseTo(0.8, 10);
  });

  it('threshold discount: once, repeating, and not reached', () => {
    const once = offer({ price: 2350, thresholdSpend: 1000, thresholdOff: 100 });
    expect(once).toMatchObject({ thresholdTimes: 1, thresholdOff: 100, paid: 2250 });
    const repeat = offer({ price: 2350, thresholdSpend: 1000, thresholdOff: 100, thresholdRepeat: true });
    expect(repeat).toMatchObject({ thresholdTimes: 2, thresholdOff: 200, paid: 2150 });
    const unmet = offer({ price: 999, thresholdSpend: 1000, thresholdOff: 100, thresholdRepeat: true });
    expect(unmet).toMatchObject({ thresholdTimes: 0, thresholdOff: 0, paid: 999 });
  });

  it('threshold is reached at exactly the threshold', () => {
    expect(offer({ price: 1000, thresholdSpend: 1000, thresholdOff: 100 })).toMatchObject({ thresholdTimes: 1, paid: 900 });
    expect(offer({ price: 2000, thresholdSpend: 1000, thresholdOff: 100, thresholdRepeat: true }).paid).toBe(1800);
  });

  it('coupon with and without a minimum spend', () => {
    expect(offer({ price: 500, coupon: 100 })).toMatchObject({ couponApplied: true, couponOff: 100, paid: 400 });
    expect(offer({ price: 500, coupon: 100, couponMinSpend: 500 })).toMatchObject({ couponApplied: true, paid: 400 });
    expect(offer({ price: 499, coupon: 100, couponMinSpend: 500 })).toMatchObject({
      couponApplied: false,
      couponOff: 0,
      paid: 499,
    });
  });

  it('shipping and the free-shipping threshold', () => {
    expect(offer({ price: 500, shipping: 60 })).toMatchObject({ shipping: 60, shippingWaived: false, paid: 560 });
    expect(offer({ price: 500, shipping: 60, freeShippingFrom: 500 })).toMatchObject({
      shipping: 0,
      shippingWaived: true,
      paid: 500,
    });
    expect(offer({ price: 499, shipping: 60, freeShippingFrom: 500 })).toMatchObject({ shipping: 60, paid: 559 });
  });

  it('cashback is value received later, not money off', () => {
    const r = offer({ price: 1000, cashbackRate: 5 });
    expect(r).toMatchObject({ paid: 1000, cashback: 50, cashbackCapped: false, effective: 950 });
    expect(r.paidFactor).toBe(1);
    expect(r.effectiveFactor).toBeCloseTo(0.95, 10);
  });

  it('cashback cap: below, at and above', () => {
    expect(offer({ price: 1000, cashbackRate: 5, cashbackCap: 80 })).toMatchObject({ cashback: 50, cashbackCapped: false });
    expect(offer({ price: 1000, cashbackRate: 5, cashbackCap: 50 })).toMatchObject({ cashback: 50, cashbackCapped: false });
    expect(offer({ price: 1000, cashbackRate: 5, cashbackCap: 30 })).toMatchObject({
      cashbackRaw: 50,
      cashback: 30,
      cashbackCapped: true,
      effective: 970,
    });
    expect(offer({ price: 1000, cashbackRate: 5, cashbackCap: 0 })).toMatchObject({ cashback: 0, effective: 1000 });
  });
});

describe('computeOffer: all steps stacked (hand-computed)', () => {
  it('TWD, rounded to the nearest 元', () => {
    const r = offer(
      {
        price: 3980,
        factor: discountToFactor(88, 'zhe'),
        thresholdSpend: 1000,
        thresholdOff: 100,
        thresholdRepeat: true,
        coupon: 200,
        couponMinSpend: 3000,
        shipping: 80,
        freeShippingFrom: 3000,
        cashbackRate: 5,
        cashbackCap: 120,
      },
      'unit',
    );
    // 1. 3,980 × 0.88 = 3,502.4 → 3,502
    expect(r.afterPercent).toBe(3502);
    expect(r.percentSaved).toBe(478);
    // 2. 3,502 holds three full 1,000s → −300 → 3,202
    expect(r.thresholdTimes).toBe(3);
    expect(r.afterThreshold).toBe(3202);
    // 3. 3,202 ≥ 3,000 → −200 → 3,002
    expect(r.couponApplied).toBe(true);
    expect(r.goods).toBe(3002);
    // 4. 3,002 ≥ 3,000 → free shipping
    expect(r.shippingWaived).toBe(true);
    expect(r.paid).toBe(3002);
    // 5. 3,002 × 5% = 150.1 → 150, capped at 120
    expect(r.cashbackRaw).toBe(150);
    expect(r.cashback).toBe(120);
    expect(r.cashbackCapped).toBe(true);
    expect(r.effective).toBe(2882);
    expect(r.paidFactor).toBeCloseTo(3002 / 3980, 10);
    expect(r.effectiveFactor).toBeCloseTo(2882 / 3980, 10);
  });

  it('USD, rounded to cents', () => {
    const r = offer(
      {
        price: 199.99,
        factor: discountToFactor(15, 'percent'),
        thresholdSpend: 150,
        thresholdOff: 25,
        coupon: 10,
        couponMinSpend: 100,
        shipping: 5.99,
        freeShippingFrom: 135,
        cashbackRate: 3,
      },
      'cent',
    );
    // 199.99 × 0.85 = 169.9915 → 169.99; −25 → 144.99; −10 → 134.99 (one cent short of free shipping)
    expect(r.afterPercent).toBe(169.99);
    expect(r.afterThreshold).toBe(144.99);
    expect(r.goods).toBe(134.99);
    expect(r.shippingWaived).toBe(false);
    expect(r.paid).toBe(140.98);
    // 134.99 × 3% = 4.0497 → 4.05
    expect(r.cashback).toBe(4.05);
    expect(r.effective).toBe(136.93);
  });

  it('JPY, fractions of a yen dropped', () => {
    const r = offer({ price: 2999, factor: discountToFactor(1.5, 'wari'), coupon: 300, cashbackRate: 10 }, 'floor');
    // 2,999 × 0.85 = 2,549.15 → 2,549; −300 → 2,249; 2,249 × 10% = 224.9 → 224
    expect(r.afterPercent).toBe(2549);
    expect(r.paid).toBe(2249);
    expect(r.cashback).toBe(224);
    expect(r.effective).toBe(2025);
  });
});

describe('computeOffer: order of operations', () => {
  it('the threshold is checked after the percentage discount', () => {
    // 2,000 at 9 折 is 1,800, which no longer reaches 滿 2,000 折 200.
    const r = offer({ price: 2000, factor: 0.9, thresholdSpend: 2000, thresholdOff: 200 });
    expect(r.thresholdTimes).toBe(0);
    expect(r.paid).toBe(1800); // not 1,620 (threshold first) and not 1,600
  });

  it('the coupon’s minimum spend is checked after the threshold discount', () => {
    // 1,050 − 100 = 950, below the coupon's 1,000 minimum.
    const r = offer({ price: 1050, thresholdSpend: 1000, thresholdOff: 100, coupon: 50, couponMinSpend: 1000 });
    expect(r.couponApplied).toBe(false);
    expect(r.paid).toBe(950);
  });

  it('a percent discount is taken before a fixed coupon', () => {
    // 20% off then $10 off a $50 item is $30; the other order would be $32.
    expect(offer({ price: 50, factor: 0.8, coupon: 10 }, 'cent').paid).toBe(30);
  });

  it('free shipping is checked against the goods amount after every discount', () => {
    const r = offer({ price: 1050, coupon: 100, shipping: 60, freeShippingFrom: 1000 });
    expect(r.goods).toBe(950);
    expect(r.shippingWaived).toBe(false);
    expect(r.paid).toBe(1010);
  });

  it('cashback is earned on the discounted goods amount and never on shipping', () => {
    const r = offer({ price: 1000, coupon: 200, shipping: 100, cashbackRate: 10 });
    expect(r.goods).toBe(800);
    expect(r.paid).toBe(900);
    expect(r.cashback).toBe(80); // not 90 and not 100
    expect(r.effective).toBe(820);
  });
});

describe('computeOffer: never negative', () => {
  it('a coupon larger than the order brings the goods amount to zero', () => {
    const r = offer({ price: 80, coupon: 100, shipping: 60, cashbackRate: 5 });
    expect(r).toMatchObject({ couponOff: 80, goods: 0, paid: 60, cashback: 0, effective: 60 });
  });

  it('a threshold discount larger than the order stops at zero', () => {
    const r = offer({ price: 300, thresholdSpend: 100, thresholdOff: 500, thresholdRepeat: true, coupon: 50 });
    expect(r).toMatchObject({ afterThreshold: 0, thresholdOff: 300, couponOff: 0, goods: 0, paid: 0, effective: 0 });
  });

  it('100% off', () => {
    expect(offer({ price: 500, factor: 0, cashbackRate: 10 })).toMatchObject({ paid: 0, cashback: 0, effective: 0 });
  });

  it('a cap above the amount paid cannot push the effective cost below zero', () => {
    const r = offer({ price: 100, cashbackRate: 100, cashbackCap: 500 });
    expect(r).toMatchObject({ cashback: 100, effective: 0 });
  });
});

describe('computeOffer: junk and partial input', () => {
  it('needs a price', () => {
    expect(computeOffer({ price: Number.NaN })).toBeNull();
    expect(computeOffer({ price: -1 })).toBeNull();
    expect(computeOffer({ price: Number.POSITIVE_INFINITY })).toBeNull();
  });

  it('rejects a provided number that is not a valid amount', () => {
    expect(computeOffer({ price: 100, coupon: Number.NaN })).toBeNull();
    expect(computeOffer({ price: 100, coupon: -10 })).toBeNull();
    expect(computeOffer({ price: 100, shipping: Number.POSITIVE_INFINITY })).toBeNull();
    expect(computeOffer({ price: 100, factor: Number.NaN })).toBeNull();
    expect(computeOffer({ price: 100, factor: 1.2 })).toBeNull();
    expect(computeOffer({ price: 100, cashbackRate: 101 })).toBeNull();
    expect(computeOffer({ price: 100, cashbackCap: -1 })).toBeNull();
    expect(computeOffer({ price: 100, thresholdSpend: Number.NaN, thresholdOff: 10 })).toBeNull();
  });

  it('treats undefined fields as "not offered"', () => {
    const r = offer({
      price: 100,
      factor: undefined,
      thresholdSpend: undefined,
      thresholdOff: undefined,
      coupon: undefined,
      couponMinSpend: undefined,
      shipping: undefined,
      freeShippingFrom: undefined,
      cashbackRate: undefined,
      cashbackCap: undefined,
    });
    expect(r).toMatchObject({ paid: 100, effective: 100 });
    for (const value of Object.values(r)) if (typeof value === 'number') expect(value).not.toBeNaN();
  });

  it('skips a half-filled threshold or a zero threshold', () => {
    expect(offer({ price: 1500, thresholdSpend: 1000 }).paid).toBe(1500);
    expect(offer({ price: 1500, thresholdOff: 100 }).paid).toBe(1500);
    expect(offer({ price: 1500, thresholdSpend: 0, thresholdOff: 100, thresholdRepeat: true }).paid).toBe(1500);
  });

  it('ignores a minimum spend, free-shipping threshold or cap that has nothing to act on', () => {
    expect(offer({ price: 500, couponMinSpend: 1000 }).paid).toBe(500);
    expect(offer({ price: 500, freeShippingFrom: 100 })).toMatchObject({ shipping: 0, shippingWaived: false, paid: 500 });
    expect(offer({ price: 500, cashbackCap: 10 })).toMatchObject({ cashback: 0, cashbackCapped: false });
  });

  it('a zero price has no discount rate but still charges shipping', () => {
    const r = offer({ price: 0, shipping: 60 });
    expect(r.paid).toBe(60);
    expect(r.paidFactor).toBeNaN();
    expect(r.effectiveFactor).toBeNaN();
  });

  it('shipping can make the cost higher than the list price', () => {
    expect(offer({ price: 100, shipping: 60 }).paidFactor).toBeCloseTo(1.6, 10);
  });
});

describe('offerHints', () => {
  it('unmet threshold: how much more unlocks the discount', () => {
    expect(offerHints({ price: 2850, thresholdSpend: 3000, thresholdOff: 300 }, 'unit')).toEqual([
      { kind: 'threshold', add: 150, off: 300, again: false },
    ]);
  });

  it('repeating threshold: only when the next step is close (within 30% of the threshold)', () => {
    const deal = { thresholdSpend: 1000, thresholdOff: 100, thresholdRepeat: true };
    expect(offerHints({ price: 2850, ...deal }, 'unit')).toEqual([{ kind: 'threshold', add: 150, off: 100, again: true }]);
    expect(offerHints({ price: 2700, ...deal }, 'unit')).toEqual([{ kind: 'threshold', add: 300, off: 100, again: true }]);
    expect(offerHints({ price: 2699, ...deal }, 'unit')).toEqual([]);
    expect(offerHints({ price: 2350, ...deal }, 'unit')).toEqual([]);
  });

  it('a one-time threshold that already applied has no next step', () => {
    expect(offerHints({ price: 1900, thresholdSpend: 1000, thresholdOff: 100 }, 'unit')).toEqual([]);
  });

  it('is expressed in list price when a percentage discount comes first', () => {
    // 2,000 at 9 折 = 1,800; 2,222 × 0.9 = 1,999.8 → 2,000 reaches 滿 2,000 (2,221 → 1,999 does not).
    const input = { price: 2000, factor: 0.9, thresholdSpend: 2000, thresholdOff: 200 };
    expect(offerHints(input, 'unit')).toEqual([{ kind: 'threshold', add: 222, off: 200, again: false }]);
    expect(offer({ ...input, price: 2222 }).thresholdTimes).toBe(1);
    expect(offer({ ...input, price: 2221 }).thresholdTimes).toBe(0);
    // Dropping fractions needs one more: 2,223 × 0.9 = 2,000.7 → 2,000.
    expect(offerHints(input, 'floor')).toEqual([{ kind: 'threshold', add: 223, off: 200, again: false }]);
  });

  it('coupon below its minimum spend', () => {
    expect(offerHints({ price: 800, coupon: 100, couponMinSpend: 1000 }, 'unit')).toEqual([
      { kind: 'coupon', add: 200, off: 100 },
    ]);
  });

  it('coupon minimum: accounts for a repeating threshold that kicks in on the way', () => {
    // At 1,000 the threshold takes 100 off (900), so the coupon needs 1,100 → 1,000.
    const input = { price: 950, thresholdSpend: 1000, thresholdOff: 100, thresholdRepeat: true, coupon: 50, couponMinSpend: 1000 };
    const hints = offerHints(input, 'unit');
    expect(hints).toContainEqual({ kind: 'coupon', add: 150, off: 50 });
    expect(offer({ ...input, price: 1100 }).couponApplied).toBe(true);
    expect(offer({ ...input, price: 1099 }).couponApplied).toBe(false);
  });

  it('free shipping within reach', () => {
    expect(offerHints({ price: 3980, factor: 0.9, shipping: 80, freeShippingFrom: 3600 }, 'unit')).toEqual([
      { kind: 'shipping', add: 20, fee: 80 },
    ]);
    expect(offerHints({ price: 240, factor: 0.7, shipping: 8.95, freeShippingFrom: 175 }, 'cent')).toEqual([
      { kind: 'shipping', add: 10, fee: 8.95 },
    ]);
  });

  it('cashback over the cap: the part that is lost', () => {
    expect(offerHints({ price: 3530, cashbackRate: 10, cashbackCap: 300 }, 'unit')).toEqual([
      { kind: 'cashback-cap', cap: 300, lost: 53 },
    ]);
    expect(offerHints({ price: 3000, cashbackRate: 10, cashbackCap: 300 }, 'unit')).toEqual([]);
  });

  it('several hints come in the order of the steps', () => {
    const kinds = offerHints(
      {
        price: 900,
        thresholdSpend: 1000,
        thresholdOff: 100,
        coupon: 50,
        couponMinSpend: 1200,
        shipping: 60,
        freeShippingFrom: 1500,
        cashbackRate: 50,
        cashbackCap: 100,
      },
      'unit',
    ).map((h) => h.kind);
    expect(kinds).toEqual(['threshold', 'coupon', 'shipping', 'cashback-cap']);
  });

  it('nothing to say when everything applies, and for invalid offers', () => {
    expect(
      offerHints({ price: 1000, thresholdSpend: 1000, thresholdOff: 100, coupon: 50, shipping: 60, freeShippingFrom: 500 }, 'unit'),
    ).toEqual([]);
    expect(offerHints({ price: 500 }, 'unit')).toEqual([]);
    expect(offerHints({ price: Number.NaN, coupon: 100, couponMinSpend: 1000 }, 'unit')).toEqual([]);
    // 100% off: no amount of extra spending reaches a threshold.
    expect(offerHints({ price: 500, factor: 0, thresholdSpend: 1000, thresholdOff: 100 }, 'unit')).toEqual([]);
  });
});

describe('rankOffers', () => {
  const costs = (paid: number, effective = paid) => ({ paid, effective });

  it('finds different winners for paid and for effective cost', () => {
    expect(rankOffers([costs(3302, 3269), costs(3530, 3230), costs(3662, 3555)])).toEqual({
      order: [1, 0, 2],
      bestPaid: [0],
      bestEffective: [1],
      split: true,
    });
  });

  it('one winner on both counts is not a split', () => {
    expect(rankOffers([costs(900, 880), costs(1000, 950)])).toEqual({
      order: [0, 1],
      bestPaid: [0],
      bestEffective: [0],
      split: false,
    });
  });

  it('reports ties', () => {
    expect(rankOffers([costs(500), costs(500), costs(600)])).toMatchObject({
      bestPaid: [0, 1],
      bestEffective: [0, 1],
      split: false,
      order: [0, 1, 2],
    });
    expect(rankOffers([costs(500), costs(500)])).toMatchObject({ bestPaid: [0, 1], bestEffective: [0, 1], split: false });
  });

  it('a tie on paid that cashback breaks is a split', () => {
    expect(rankOffers([costs(500, 500), costs(500, 450)])).toMatchObject({
      bestPaid: [0, 1],
      bestEffective: [1],
      split: true,
      order: [1, 0],
    });
  });

  it('orders an effective-cost tie by the amount paid', () => {
    expect(rankOffers([costs(600, 500), costs(550, 500)]).order).toEqual([1, 0]);
  });

  it('ignores binary noise', () => {
    expect(rankOffers([costs(163.2), costs(163.20000000000002)])).toMatchObject({ bestPaid: [0, 1], split: false });
  });

  it('skips incomplete offers but keeps their positions', () => {
    expect(rankOffers([null, costs(800), null, costs(700)])).toEqual({
      order: [3, 1],
      bestPaid: [3],
      bestEffective: [3],
      split: false,
    });
  });

  it('handles one offer and none', () => {
    expect(rankOffers([costs(100, 90)])).toEqual({ order: [0], bestPaid: [0], bestEffective: [0], split: false });
    expect(rankOffers([])).toEqual({ order: [], bestPaid: [], bestEffective: [], split: false });
    expect(rankOffers([null, null])).toEqual({ order: [], bestPaid: [], bestEffective: [], split: false });
  });
});

describe('savingsAgainst', () => {
  const results = [
    { paid: 3302, effective: 3269 },
    { paid: 3530, effective: 3230 },
    null,
    { paid: 3662, effective: 3555 },
  ];

  it('says how much the best offer saves against each other one', () => {
    expect(savingsAgainst(results, 0, 'paid')).toEqual([
      { index: 1, amount: 228 },
      { index: 3, amount: 360 },
    ]);
    expect(savingsAgainst(results, 1, 'effective')).toEqual([
      { index: 0, amount: 39 },
      { index: 3, amount: 325 },
    ]);
  });

  it('cleans float noise and reports ties as zero', () => {
    expect(savingsAgainst([{ paid: 172, effective: 163.2 }, { paid: 176.95, effective: 176.95 }], 0, 'effective')).toEqual([
      { index: 1, amount: 13.75 },
    ]);
    expect(savingsAgainst([{ paid: 5, effective: 5 }, { paid: 5, effective: 5 }], 0, 'paid')).toEqual([{ index: 1, amount: 0 }]);
  });

  it('returns nothing for a missing winner', () => {
    expect(savingsAgainst(results, 2, 'paid')).toEqual([]);
    expect(savingsAgainst(results, 9, 'paid')).toEqual([]);
  });
});

describe('parseOffer', () => {
  it('returns null while the price is blank', () => {
    expect(parseOffer(blankOffer('zhe'))).toBeNull();
    expect(parseOffer(blankOffer('percent', { price: '   ', coupon: '100' }))).toBeNull();
  });

  it('leaves blank optional fields out, so nothing turns into NaN', () => {
    const input = parseOffer(blankOffer('zhe', { price: '1280' }))!;
    expect(input).toMatchObject({ price: 1280, factor: undefined, coupon: undefined, cashbackRate: undefined });
    const r = computeOffer(input, 'unit')!;
    expect(r.paid).toBe(1280);
    for (const value of Object.values(r)) if (typeof value === 'number') expect(value).not.toBeNaN();
  });

  it('reads the discount in the chosen unit', () => {
    expect(parseOffer(blankOffer('zhe', { price: '1000', discount: '85' }))!.factor).toBeCloseTo(0.85, 10);
    expect(parseOffer(blankOffer('percent', { price: '1000', discount: '15' }))!.factor).toBeCloseTo(0.85, 10);
    expect(parseOffer(blankOffer('wari', { price: '1000', discount: '1.5' }))!.factor).toBeCloseTo(0.85, 10);
  });

  it('accepts separators, full-width digits and a pasted unit', () => {
    const input = parseOffer(
      blankOffer('zhe', {
        price: '3,980 元',
        discount: '88折',
        coupon: '＄２００'.replace('＄', '$'),
        shipping: 'NT$80',
        cashbackRate: '３％',
        cashbackCap: '¥300',
      }),
    )!;
    expect(input).toMatchObject({ price: 3980, coupon: 200, shipping: 80, cashbackRate: 3, cashbackCap: 300 });
    expect(input.factor).toBeCloseTo(0.88, 10);
  });

  it('turns junk into an offer that computeOffer rejects', () => {
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: 'abc' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: '元' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: '1000', coupon: 'x' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: '1000', discount: '100' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('percent', { price: '1000', discount: '120' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: '-5' }))!, 'unit')).toBeNull();
    expect(computeOffer(parseOffer(blankOffer('zhe', { price: '1000', cashbackRate: '1e999' }))!, 'unit')).toBeNull();
  });

  it('passes the repeat checkbox through', () => {
    const fields = blankOffer('zhe', { price: '2350', thresholdSpend: '1000', thresholdOff: '100' });
    expect(computeOffer(parseOffer(fields)!, 'unit')!.paid).toBe(2250);
    expect(computeOffer(parseOffer({ ...fields, thresholdRepeat: true })!, 'unit')!.paid).toBe(2150);
  });
});

describe('restoreOffers', () => {
  it('keeps valid saved offers', () => {
    const saved = [blankOffer('zhe', { name: 'A', price: '100' }), blankOffer('percent', { thresholdRepeat: true })];
    expect(restoreOffers(JSON.parse(JSON.stringify(saved)), ['zhe', 'percent'])).toEqual(saved);
  });

  it('rejects anything that is not a non-empty list', () => {
    expect(restoreOffers(undefined, ['zhe'])).toBeNull();
    expect(restoreOffers('x', ['zhe'])).toBeNull();
    expect(restoreOffers([], ['zhe'])).toBeNull();
    expect(restoreOffers({ length: 2 }, ['zhe'])).toBeNull();
  });

  it('caps the list at four offers', () => {
    const many = Array.from({ length: 9 }, (_, i) => blankOffer('zhe', { name: String(i) }));
    expect(restoreOffers(many, ['zhe'])!.map((o) => o.name)).toEqual(['0', '1', '2', '3']);
  });

  it('repairs broken entries and units the locale does not offer', () => {
    const restored = restoreOffers([null, { price: 12, name: 'ok', unit: 'wari', thresholdRepeat: 'yes' }, 7], ['percent'])!;
    expect(restored).toEqual([blankOffer('percent'), blankOffer('percent', { name: 'ok' }), blankOffer('percent')]);
  });
});

describe('the samples shown in the tool', () => {
  const run = (locale: 'zh-TW' | 'en' | 'ja') => {
    const { sample, rounding, defaultUnit } = i18n[locale]!.client;
    const results = sample.map((fields) => computeOffer(parseOffer(blankOffer(defaultUnit, fields))!, rounding)!);
    return { results, rank: rankOffers(results), numbers: results.map((r) => [r.paid, r.cashback, r.effective]) };
  };

  it('zh-TW: paying least and costing least are different offers', () => {
    const { numbers, rank } = run('zh-TW');
    expect(numbers).toEqual([
      [3302, 33, 3269],
      [3530, 300, 3230],
      [3662, 107, 3555],
    ]);
    expect(rank).toMatchObject({ bestPaid: [0], bestEffective: [1], split: true });
  });

  it('en: paying least and costing least are different offers', () => {
    const { numbers, rank } = run('en');
    expect(numbers).toEqual([
      [176.95, 0, 176.95],
      [172, 0, 172],
      [204, 40, 164],
    ]);
    expect(rank).toMatchObject({ bestPaid: [1], bestEffective: [2], split: true });
  });

  it('ja: paying least and costing least are different offers', () => {
    const { numbers, rank } = run('ja');
    expect(numbers).toEqual([
      [11020, 110, 10910],
      [11800, 1500, 10300],
      [12326, 353, 11973],
    ]);
    expect(rank).toMatchObject({ bestPaid: [0], bestEffective: [1], split: true });
  });

  it('every locale’s sample fits the offer limit and uses a unit that locale offers', () => {
    for (const locale of ['zh-TW', 'en', 'ja'] as const) {
      const strings = i18n[locale]!;
      const units = strings.units.map((u) => u.value);
      expect(strings.client.sample.length).toBeGreaterThanOrEqual(2);
      expect(strings.client.sample.length).toBeLessThanOrEqual(MAX_OFFERS);
      expect(units).toContain(strings.client.defaultUnit);
      for (const fields of strings.client.sample) if (fields.unit) expect(units).toContain(fields.unit);
    }
  });
});

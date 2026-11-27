import { describe, expect, it } from 'vitest';
import {
  UNITS,
  chooseBase,
  compareOptions,
  convert,
  discountFactor,
  evaluateOption,
  isUnitId,
  priceDigits,
  priceForBase,
  roundMoney,
  type Comparison,
  type EvaluateConfig,
  type EvaluatedOption,
  type OptionInput,
  type UnitId,
} from './logic';

const zh: EvaluateConfig = { discountKind: 'zhe', rounding: 'none' };
const en: EvaluateConfig = { discountKind: 'percent', rounding: 'cent' };
const ja: EvaluateConfig = { discountKind: 'percent', rounding: 'floor' };
const rule = { countPer100Below: 1 };

/** price, packs, amount per pack, unit, then the optional extras. */
function opt(
  price: number | null,
  packs: number | null,
  amount: number | null,
  unit: UnitId,
  extras: { shipping?: number | null; discount?: number | null } = {},
): OptionInput {
  return { price, packs, amount, unit, shipping: extras.shipping ?? null, discount: extras.discount ?? null };
}

function ok(input: OptionInput, config = zh): EvaluatedOption {
  const e = evaluateOption(input, config);
  if (e.status !== 'ok') throw new Error(`expected ok, got ${e.status}`);
  return e.option;
}

function compare(inputs: OptionInput[], config = zh, baseRule = rule): Comparison {
  return compareOptions(
    inputs.map((i) => evaluateOption(i, config)),
    baseRule,
  );
}

function ranked(c: Comparison) {
  if (c.status !== 'ranked' && c.status !== 'single') throw new Error(`expected a ranking, got ${c.status}`);
  return c;
}

/** Every number anywhere in a comparison must be finite. */
function expectNoNaN(value: unknown): void {
  if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
  else if (Array.isArray(value)) value.forEach(expectNoNaN);
  else if (value && typeof value === 'object') Object.values(value).forEach(expectNoNaN);
}

describe('unit definitions', () => {
  it('uses the exact legal definitions', () => {
    expect(UNITS.lb.toBase).toBe(453.59237);
    expect(UNITS.oz.toBase).toBe(28.349523125);
    expect(UNITS.floz.toBase).toBe(29.5735295625);
    expect(UNITS.gal.toBase).toBe(3785.411784);
    expect(UNITS.kg.toBase).toBe(1000);
    expect(UNITS.l.toBase).toBe(1000);
    expect(UNITS.g.toBase).toBe(1);
    expect(UNITS.ml.toBase).toBe(1);
    expect(UNITS.count.toBase).toBe(1);
  });

  it('keeps ounces and fluid ounces consistent with pounds and gallons', () => {
    expect(UNITS.oz.toBase * 16).toBeCloseTo(UNITS.lb.toBase, 10);
    expect(UNITS.floz.toBase * 128).toBeCloseTo(UNITS.gal.toBase, 9);
  });

  it('groups units by dimension', () => {
    expect((['g', 'kg', 'oz', 'lb'] as const).every((u) => UNITS[u].dimension === 'weight')).toBe(true);
    expect((['ml', 'l', 'floz', 'gal'] as const).every((u) => UNITS[u].dimension === 'volume')).toBe(true);
    expect(UNITS.count.dimension).toBe('count');
    expect((['oz', 'lb', 'floz', 'gal'] as const).every((u) => UNITS[u].imperial)).toBe(true);
    expect((['count', 'g', 'kg', 'ml', 'l'] as const).some((u) => UNITS[u].imperial)).toBe(false);
  });

  it('recognizes unit ids', () => {
    expect(isUnitId('floz')).toBe(true);
    expect(isUnitId('cup')).toBe(false);
    expect(isUnitId('toString')).toBe(false);
    expect(isUnitId(undefined)).toBe(false);
  });
});

describe('convert', () => {
  it.each([
    [1, 'kg', 'g', 1000],
    [250, 'g', 'kg', 0.25],
    [1, 'lb', 'g', 453.59237],
    [1, 'oz', 'g', 28.349523125],
    [1, 'lb', 'oz', 16],
    [1, 'kg', 'lb', 2.2046226218],
    [1, 'l', 'ml', 1000],
    [1, 'floz', 'ml', 29.5735295625],
    [1, 'gal', 'ml', 3785.411784],
    [1, 'gal', 'floz', 128],
    [1, 'gal', 'l', 3.785411784],
    [12, 'count', 'count', 12],
  ] as const)('%d %s → %s = %d', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBeCloseTo(expected, 9);
  });

  it('refuses to convert across dimensions or non-numbers', () => {
    expect(convert(1, 'g', 'ml')).toBeNaN();
    expect(convert(1, 'count', 'g')).toBeNaN();
    expect(convert(Number.NaN, 'g', 'kg')).toBeNaN();
    expect(convert(Number.POSITIVE_INFINITY, 'g', 'kg')).toBeNaN();
  });
});

describe('discountFactor', () => {
  it.each([
    [85, 0.85],
    [8, 0.8],
    [8.5, 0.85],
    [79, 0.79],
    [5, 0.5],
    [99, 0.99],
  ])('折數 %d → ×%d', (zhe, factor) => {
    expect(discountFactor('zhe', zhe)).toBeCloseTo(factor, 12);
  });

  it.each([
    [20, 0.8],
    [0, 1],
    [12.5, 0.875],
    [99, 0.01],
  ])('%d%% off → ×%d', (percent, factor) => {
    expect(discountFactor('percent', percent)).toBeCloseTo(factor, 12);
  });

  it('rejects entries that are out of range', () => {
    for (const bad of [0, -1, 100, 120, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(discountFactor('zhe', bad)).toBeNaN();
    }
    for (const bad of [-5, 100, 150, Number.NaN, Number.NEGATIVE_INFINITY]) {
      expect(discountFactor('percent', bad)).toBeNaN();
    }
  });
});

describe('roundMoney', () => {
  it('keeps decimals, rounds to cents or drops fractions of a yen', () => {
    expect(roundMoney(169.15, 'none')).toBe(169.15);
    expect(roundMoney(23.783, 'cent')).toBe(23.78);
    expect(roundMoney(23.785, 'cent')).toBe(23.79);
    expect(roundMoney(1.005, 'cent')).toBe(1.01);
    expect(roundMoney(5966.9, 'floor')).toBe(5966);
    expect(roundMoney(3980 * 0.7, 'floor')).toBe(2786);
    expect(roundMoney(Number.NaN, 'cent')).toBeNaN();
  });
});

describe('evaluateOption', () => {
  it('computes the unit price of a multipack', () => {
    const o = ok(opt(199, 12, 100, 'count'));
    expect(o.quantity).toBe(1200);
    expect(o.baseQuantity).toBe(1200);
    expect(o.total).toBe(199);
    expect(o.unitPrice).toBeCloseTo(0.1658333333, 9);
    expect(o.dimension).toBe('count');
    expect(o.factor).toBe(1);
  });

  it('treats a blank pack count as one pack and a blank shipping fee as zero', () => {
    const o = ok(opt(139, null, 1.5, 'kg'));
    expect(o.packs).toBe(1);
    expect(o.shipping).toBe(0);
    expect(o.baseQuantity).toBe(1500);
    expect(o.unitPrice).toBeCloseTo(139 / 1500, 12);
  });

  it('converts to base units before dividing', () => {
    expect(ok(opt(100, 1, 2, 'kg')).unitPrice).toBeCloseTo(0.05, 12);
    expect(ok(opt(100, 1, 2000, 'g')).unitPrice).toBeCloseTo(0.05, 12);
    expect(ok(opt(10, 1, 1, 'lb'), en).unitPrice).toBeCloseTo(10 / 453.59237, 12);
    expect(ok(opt(10, 1, 16, 'oz'), en).unitPrice).toBeCloseTo(10 / 453.59237, 12);
    expect(ok(opt(4, 1, 1, 'gal'), en).unitPrice).toBeCloseTo(4 / 3785.411784, 12);
    expect(ok(opt(4, 2, 64, 'floz'), en).unitPrice).toBeCloseTo(4 / 3785.411784, 12);
  });

  it('applies a 折數 to the price', () => {
    const o = ok(opt(1680, 4, 52, 'count', { discount: 85 }));
    expect(o.factor).toBeCloseTo(0.85, 12);
    expect(o.total).toBeCloseTo(1428, 9);
    expect(o.unitPrice).toBeCloseTo(1428 / 208, 9);
    expect(ok(opt(1000, 1, 1, 'count', { discount: 8 })).total).toBeCloseTo(800, 9);
  });

  it('applies percent off in en / ja and rounds the discounted price for the currency', () => {
    // 27.98 × 0.85 = 23.783 → $23.78
    expect(ok(opt(27.98, 2, 100, 'floz', { discount: 15 }), en).total).toBeCloseTo(23.78, 10);
    // 6,280 × 0.95 = 5,966 円; 1,999 × 0.9 = 1,799.1 → 1,799 円
    expect(ok(opt(6280, 4, 64, 'count', { discount: 5 }), ja).total).toBe(5966);
    expect(ok(opt(1999, 1, 1, 'count', { discount: 10 }), ja).total).toBe(1799);
    // zh-TW keeps the decimals
    expect(ok(opt(629, 36, 100, 'count', { discount: 9 })).total).toBeCloseTo(566.1, 9);
  });

  it('adds shipping after the discount, never discounting the shipping fee', () => {
    const o = ok(opt(629, 36, 100, 'count', { shipping: 60, discount: 9 }));
    expect(o.total).toBeCloseTo(626.1, 9);
    expect(o.shipping).toBe(60);
    expect(o.listPrice).toBe(629);
    expect(o.unitPrice).toBeCloseTo(626.1 / 3600, 12);
    expect(ok(opt(27.98, 2, 100, 'floz', { shipping: 5.99, discount: 15 }), en).total).toBeCloseTo(29.77, 10);
    expect(ok(opt(100, 1, 1, 'count', { shipping: 0 })).total).toBe(100);
  });

  it('reports a blank row as empty', () => {
    expect(evaluateOption(opt(null, null, null, 'g'), zh)).toEqual({ status: 'empty' });
  });

  it('reports the missing field of a row that was started', () => {
    expect(evaluateOption(opt(199, null, null, 'g'), zh)).toEqual({ status: 'incomplete', field: 'amount' });
    expect(evaluateOption(opt(null, null, 500, 'g'), zh)).toEqual({ status: 'incomplete', field: 'price' });
    expect(evaluateOption(opt(null, 12, null, 'g'), zh)).toEqual({ status: 'incomplete', field: 'price' });
    expect(evaluateOption(opt(null, null, null, 'g', { shipping: 60 }), zh)).toEqual({ status: 'incomplete', field: 'price' });
    expect(evaluateOption(opt(null, null, null, 'g', { discount: 85 }), zh)).toEqual({ status: 'incomplete', field: 'price' });
  });

  it.each([
    ['zero price', opt(0, 1, 100, 'g'), 'price'],
    ['negative price', opt(-5, 1, 100, 'g'), 'price'],
    ['text in price', opt(Number.NaN, 1, 100, 'g'), 'price'],
    ['infinite price', opt(Number.POSITIVE_INFINITY, 1, 100, 'g'), 'price'],
    ['zero amount', opt(100, 1, 0, 'g'), 'amount'],
    ['negative amount', opt(100, 1, -3, 'g'), 'amount'],
    ['text in amount', opt(100, 1, Number.NaN, 'g'), 'amount'],
    ['zero packs', opt(100, 0, 100, 'g'), 'packs'],
    ['negative packs', opt(100, -2, 100, 'g'), 'packs'],
    ['text in packs', opt(100, Number.NaN, 100, 'g'), 'packs'],
    ['negative shipping', opt(100, 1, 100, 'g', { shipping: -1 }), 'shipping'],
    ['text in shipping', opt(100, 1, 100, 'g', { shipping: Number.NaN }), 'shipping'],
    ['0 折', opt(100, 1, 100, 'g', { discount: 0 }), 'discount'],
    ['100 折', opt(100, 1, 100, 'g', { discount: 100 }), 'discount'],
    ['text in discount', opt(100, 1, 100, 'g', { discount: Number.NaN }), 'discount'],
  ] as const)('rejects %s', (_label, input, field) => {
    expect(evaluateOption(input, zh)).toEqual({ status: 'invalid', field });
  });

  it('rejects 100% off and above in percent locales, but allows 0%', () => {
    expect(evaluateOption(opt(100, 1, 100, 'g', { discount: 100 }), en)).toEqual({ status: 'invalid', field: 'discount' });
    expect(evaluateOption(opt(100, 1, 100, 'g', { discount: -10 }), ja)).toEqual({ status: 'invalid', field: 'discount' });
    expect(ok(opt(100, 1, 100, 'g', { discount: 0 }), en).total).toBe(100);
  });

  it('flags junk even when the required fields are still blank', () => {
    expect(evaluateOption(opt(null, Number.NaN, null, 'g'), zh)).toEqual({ status: 'invalid', field: 'packs' });
  });

  it('rejects a price that rounds down to nothing, and unknown units', () => {
    expect(evaluateOption(opt(0.4, 1, 10, 'count'), ja)).toEqual({ status: 'invalid', field: 'price' });
    expect(ok(opt(0.4, 1, 10, 'count', { shipping: 500 }), ja).total).toBe(500);
    expect(evaluateOption({ ...opt(100, 1, 1, 'g'), unit: 'cup' as UnitId }, zh)).toEqual({ status: 'invalid', field: 'amount' });
  });

  it('rejects magnitudes that overflow instead of returning Infinity or 0', () => {
    expect(evaluateOption(opt(1e308, 1, 1, 'g', { shipping: 1e308 }), zh).status).toBe('invalid');
    expect(evaluateOption(opt(1, 1e200, 1e200, 'kg'), zh).status).toBe('invalid');
    expect(evaluateOption(opt(1e-200, 1, 1e200, 'kg'), zh).status).toBe('invalid');
  });
});

describe('chooseBase', () => {
  const options = (inputs: OptionInput[], config = zh) => inputs.map((i) => ok(i, config));

  it('quotes count items per piece, or per 100 when one piece costs very little', () => {
    expect(chooseBase('count', options([opt(399, 1, 44, 'count'), opt(1499, 4, 44, 'count')]), rule)).toEqual({ unit: 'count', amount: 1 });
    expect(chooseBase('count', options([opt(199, 12, 100, 'count'), opt(419, 24, 110, 'count')]), rule)).toEqual({ unit: 'count', amount: 100 });
    // the threshold is per currency: $0.30 a diaper stays per piece, $0.013 a sheet goes per 100
    expect(chooseBase('count', options([opt(49.99, 1, 168, 'count')], en), { countPer100Below: 0.1 })).toEqual({ unit: 'count', amount: 1 });
    expect(chooseBase('count', options([opt(17.48, 8, 165, 'count')], en), { countPer100Below: 0.1 })).toEqual({ unit: 'count', amount: 100 });
  });

  it('quotes metric weight per 100 g, and per kg once every option holds a kilogram', () => {
    expect(chooseBase('weight', options([opt(45, 1, 80, 'g'), opt(99, 1, 230, 'g')]), rule)).toEqual({ unit: 'g', amount: 100 });
    expect(chooseBase('weight', options([opt(498, 1, 380, 'g'), opt(980, 1, 1, 'kg')]), rule)).toEqual({ unit: 'g', amount: 100 });
    expect(chooseBase('weight', options([opt(219, 1, 3, 'kg'), opt(139, 1, 1500, 'g')]), rule)).toEqual({ unit: 'kg', amount: 1 });
    expect(chooseBase('weight', options([opt(60, 2, 500, 'g')]), rule)).toEqual({ unit: 'kg', amount: 1 });
  });

  it('quotes metric volume per 100 ml, and per litre once every option holds a litre', () => {
    expect(chooseBase('volume', options([opt(25, 1, 600, 'ml'), opt(35, 1, 1.5, 'l')]), rule)).toEqual({ unit: 'ml', amount: 100 });
    expect(chooseBase('volume', options([opt(169, 1, 2, 'l'), opt(139, 1, 1500, 'ml')]), rule)).toEqual({ unit: 'l', amount: 1 });
  });

  it('switches to US customary bases as soon as one option uses them', () => {
    expect(chooseBase('weight', options([opt(4.29, 1, 12, 'oz'), opt(8.49, 1, 1.7, 'lb')], en), rule)).toEqual({ unit: 'oz', amount: 1 });
    expect(chooseBase('weight', options([opt(4.29, 1, 400, 'g'), opt(5.99, 1, 18, 'oz')], en), rule)).toEqual({ unit: 'oz', amount: 1 });
    expect(chooseBase('weight', options([opt(4.29, 1, 500, 'g'), opt(5.99, 1, 18, 'oz')], en), rule)).toEqual({ unit: 'lb', amount: 1 });
    expect(chooseBase('weight', options([opt(9.99, 1, 3, 'lb'), opt(5.49, 1, 16, 'oz')], en), rule)).toEqual({ unit: 'lb', amount: 1 });
    expect(chooseBase('volume', options([opt(3.89, 1, 1, 'gal'), opt(2.49, 1, 64, 'floz')], en), rule)).toEqual({ unit: 'floz', amount: 1 });
    expect(chooseBase('volume', options([opt(3.89, 1, 1, 'gal'), opt(7.29, 1, 256, 'floz')], en), rule)).toEqual({ unit: 'gal', amount: 1 });
    expect(chooseBase('volume', options([opt(3.89, 1, 128, 'floz'), opt(6.5, 2, 1, 'gal')], en), rule)).toEqual({ unit: 'gal', amount: 1 });
  });
});

describe('priceForBase and priceDigits', () => {
  it('scales a per-gram or per-piece price to the base', () => {
    expect(priceForBase(0.43, { unit: 'g', amount: 100 })).toBeCloseTo(43, 10);
    expect(priceForBase(0.073, { unit: 'kg', amount: 1 })).toBeCloseTo(73, 10);
    expect(priceForBase(10 / 453.59237, { unit: 'lb', amount: 1 })).toBeCloseTo(10, 10);
    expect(priceForBase(10 / 453.59237, { unit: 'oz', amount: 1 })).toBeCloseTo(0.625, 10);
    expect(priceForBase(0.1587, { unit: 'count', amount: 100 })).toBeCloseTo(15.87, 10);
  });

  it('shows more decimals for smaller unit prices', () => {
    expect(priceDigits(1234.56)).toBe(2);
    expect(priceDigits(131.05)).toBe(2);
    expect(priceDigits(15.87)).toBe(2);
    expect(priceDigits(1)).toBe(2);
    expect(priceDigits(0.159)).toBe(3);
    expect(priceDigits(0.0124)).toBe(4);
  });
});

describe('compareOptions', () => {
  it('ranks tissue multipacks per 100 sheets and says how much more the loser costs', () => {
    const c = ranked(compare([opt(199, 12, 100, 'count'), opt(419, 24, 110, 'count')]));
    expect(c.status).toBe('ranked');
    expect(c.base).toEqual({ unit: 'count', amount: 100 });
    expect(c.ranked.map((r) => r.index)).toEqual([1, 0]);
    expect(c.ranked.map((r) => r.rank)).toEqual([1, 2]);
    expect(c.ranked.map((r) => r.best)).toEqual([true, false]);
    expect(c.ranked[0].basePrice).toBeCloseTo(15.8712, 4);
    expect(c.ranked[1].basePrice).toBeCloseTo(16.5833, 4);
    expect(c.ranked[0].percentMore).toBe(0);
    expect(c.ranked[0].extraCost).toBe(0);
    expect(c.ranked[1].percentMore).toBeCloseTo(4.4869, 3);
    // 1,200 sheets at the best rate would cost 190.45, so 199 is 8.55 more
    expect(c.ranked[1].extraCost).toBeCloseTo(8.5455, 4);
    expect(c.allTied).toBe(false);
    expect(c.skipped).toEqual([]);
  });

  it('shows that shipping can turn the cheapest shelf price into the dearest option', () => {
    const c = ranked(
      compare([opt(199, 12, 100, 'count'), opt(419, 24, 110, 'count'), opt(629, 36, 100, 'count', { shipping: 60, discount: 9 })]),
    );
    expect(c.ranked.map((r) => r.index)).toEqual([1, 0, 2]);
    expect(c.ranked[2].basePrice).toBeCloseTo(17.3917, 4);
    expect(c.ranked[2].percentMore).toBeCloseTo(9.58, 2);
    expect(c.ranked[2].extraCost).toBeCloseTo(54.7364, 4);
    // without the shipping fee the same box would have been the best buy
    const free = ranked(compare([opt(199, 12, 100, 'count'), opt(419, 24, 110, 'count'), opt(629, 36, 100, 'count', { discount: 9 })]));
    expect(free.ranked[0].index).toBe(2);
  });

  it('compares g with kg and ml with L after converting', () => {
    const weight = ranked(compare([opt(498, 1, 380, 'g'), opt(980, 1, 1, 'kg')], ja));
    expect(weight.base).toEqual({ unit: 'g', amount: 100 });
    expect(weight.ranked.map((r) => r.index)).toEqual([1, 0]);
    expect(weight.ranked[0].basePrice).toBeCloseTo(98, 9);
    expect(weight.ranked[1].basePrice).toBeCloseTo(131.0526, 4);
    expect(weight.ranked[1].percentMore).toBeCloseTo(33.727, 3);
    expect(weight.ranked[1].extraCost).toBeCloseTo(125.6, 9);

    const volume = ranked(compare([opt(169, 1, 2, 'l'), opt(139, 1, 1500, 'ml'), opt(359, 6, 1.5, 'l')]));
    expect(volume.base).toEqual({ unit: 'l', amount: 1 });
    expect(volume.ranked.map((r) => r.index)).toEqual([2, 0, 1]);
    expect(volume.ranked.map((r) => Number(r.basePrice.toFixed(2)))).toEqual([39.89, 84.5, 92.67]);
  });

  it('compares oz with lb and fl oz with gal, and metric with US units', () => {
    const cereal = ranked(compare([opt(4.29, 1, 12, 'oz'), opt(5.99, 1, 18, 'oz'), opt(8.49, 1, 1.7, 'lb')], en));
    expect(cereal.base).toEqual({ unit: 'oz', amount: 1 });
    expect(cereal.ranked.map((r) => r.index)).toEqual([2, 1, 0]);
    expect(cereal.ranked.map((r) => Number(r.basePrice.toFixed(4)))).toEqual([0.3121, 0.3328, 0.3575]);
    expect(cereal.ranked[2].percentMore).toBeCloseTo(14.535, 3);
    expect(cereal.ranked[2].extraCost).toBeCloseTo(0.5444, 4);

    const milk = ranked(compare([opt(3.89, 1, 1, 'gal'), opt(2.49, 1, 64, 'floz')], en));
    expect(milk.ranked[0].index).toBe(0);
    expect(milk.ranked[0].basePrice).toBeCloseTo(3.89 / 128, 9);
    expect(milk.ranked[1].basePrice).toBeCloseTo(2.49 / 64, 9);
    expect(milk.ranked[1].percentMore).toBeCloseTo(28.021, 3);

    // 500 g for $5 is $4.54 per lb; 1 lb for $5 is $5.00 per lb
    const mixed = ranked(compare([opt(5, 1, 1, 'lb'), opt(5, 1, 500, 'g')], en));
    expect(mixed.base).toEqual({ unit: 'lb', amount: 1 });
    expect(mixed.ranked[0].index).toBe(1);
    expect(mixed.ranked[0].basePrice).toBeCloseTo(4.5359237, 9);
    expect(mixed.ranked[1].basePrice).toBeCloseTo(5, 9);
    expect(mixed.ranked[1].percentMore).toBeCloseTo(10.2311, 3);
  });

  it('treats equal unit prices as a tie that shares first place', () => {
    const c = ranked(compare([opt(199, 12, 100, 'count'), opt(398, 24, 100, 'count'), opt(420, 24, 100, 'count')]));
    expect(c.ranked.map((r) => r.index)).toEqual([0, 1, 2]);
    expect(c.ranked.map((r) => r.rank)).toEqual([1, 1, 3]);
    expect(c.ranked.map((r) => r.best)).toEqual([true, true, false]);
    expect(c.ranked[1].percentMore).toBe(0);
    expect(c.ranked[1].extraCost).toBe(0);
    expect(c.allTied).toBe(false);
  });

  it('sees through floating-point noise when the same deal is written in different units', () => {
    // 0.1 + 0.2 kg style inputs: 300 g for 30 and 0.3 kg for 30 must tie exactly
    const c = ranked(compare([opt(30, 3, 0.1, 'kg'), opt(30, 1, 300, 'g'), opt(10, 1, 100, 'g')]));
    expect(c.ranked.map((r) => r.rank)).toEqual([1, 1, 1]);
    expect(c.allTied).toBe(true);
    const lb = ranked(compare([opt(7.99, 1, 1, 'lb'), opt(7.99, 1, 16, 'oz')], en));
    expect(lb.allTied).toBe(true);
    expect(lb.base).toEqual({ unit: 'lb', amount: 1 });
  });

  it('keeps input order among tied options that are not the best', () => {
    const c = ranked(compare([opt(50, 1, 100, 'g'), opt(100, 1, 200, 'g'), opt(40, 1, 100, 'g')]));
    expect(c.ranked.map((r) => r.index)).toEqual([2, 0, 1]);
    expect(c.ranked.map((r) => r.rank)).toEqual([1, 2, 2]);
    expect(c.ranked[1].percentMore).toBeCloseTo(25, 9);
    expect(c.ranked[2].extraCost).toBeCloseTo(20, 9);
  });

  it('refuses to rank options that measure different things', () => {
    const c = compare([opt(199, 12, 100, 'count'), opt(89, 1, 500, 'g'), opt(45, 1, 600, 'ml')]);
    expect(c).toEqual({ status: 'mixed', dimensions: ['count', 'weight', 'volume'], skipped: [] });
    expect(compare([opt(5, 1, 16, 'oz'), opt(5, 1, 16, 'floz')], en)).toMatchObject({ status: 'mixed', dimensions: ['weight', 'volume'] });
  });

  it('ignores an unfinished row of another dimension instead of calling the list mixed', () => {
    const c = ranked(compare([opt(45, 1, 80, 'g'), opt(99, 1, 230, 'g'), opt(null, null, 500, 'ml')]));
    expect(c.status).toBe('ranked');
    expect(c.ranked).toHaveLength(2);
    expect(c.skipped).toEqual([2]);
  });

  it('skips incomplete and invalid rows, and does not report blank ones', () => {
    const c = ranked(
      compare([
        opt(null, null, null, 'g'),
        opt(45, 1, 80, 'g'),
        opt(60, null, null, 'g'),
        opt(99, 1, 230, 'g'),
        opt(79, 0, 150, 'g'),
        opt(79, 1, 150, 'g', { discount: 0 }),
      ]),
    );
    expect(c.ranked.map((r) => r.index)).toEqual([3, 1]);
    expect(c.skipped).toEqual([2, 4, 5]);
  });

  it('returns a single unit price when only one option is usable', () => {
    const c = ranked(compare([opt(45, 1, 80, 'g'), opt(null, null, null, 'g')]));
    expect(c.status).toBe('single');
    expect(c.ranked).toHaveLength(1);
    expect(c.ranked[0].basePrice).toBeCloseTo(56.25, 9);
    expect(c.ranked[0].best).toBe(true);
    expect(c.allTied).toBe(true);
  });

  it('returns nothing to show for blank or unusable lists', () => {
    expect(compare([])).toEqual({ status: 'none', skipped: [] });
    expect(compare([opt(null, null, null, 'g'), opt(null, null, null, 'g')])).toEqual({ status: 'none', skipped: [] });
    expect(compare([opt(0, 1, 100, 'g'), opt(100, 1, 0, 'g')])).toEqual({ status: 'none', skipped: [0, 1] });
  });

  it('never produces NaN or Infinity, whatever is typed', () => {
    const junk = [null, 0, -1, 1, 0.5, 100, 1e-12, 1e12, Number.NaN, Number.POSITIVE_INFINITY];
    const units: UnitId[] = ['count', 'g', 'lb', 'floz'];
    const rows: OptionInput[] = [];
    junk.forEach((a, i) => {
      junk.forEach((b, j) => {
        rows.push({ price: a, amount: b, unit: units[(i + j) % units.length], packs: junk[(i * 3 + j) % junk.length], shipping: junk[(i + j * 7) % junk.length], discount: junk[(i * 5 + j) % junk.length] });
      });
    });
    for (const config of [zh, en, ja]) {
      for (const row of rows) {
        const e = evaluateOption(row, config);
        if (e.status === 'ok') expectNoNaN(e.option);
        // pair every row with a sane one of the same unit so rankings are exercised too
        const c = compareOptions([e, evaluateOption(opt(10, 1, 3, row.unit), config)], rule);
        expectNoNaN(c);
        if (c.status === 'ranked') {
          for (const r of c.ranked) {
            expect(r.percentMore).toBeGreaterThanOrEqual(0);
            expect(r.extraCost).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });
});

describe('worked examples quoted in the page copy', () => {
  const round = (n: number, digits: number) => Number(n.toFixed(digits));

  it('zh-TW', () => {
    const tissue = ranked(compare([opt(199, 12, 100, 'count'), opt(419, 24, 110, 'count')]));
    expect(tissue.ranked.map((r) => round(r.basePrice, 2))).toEqual([15.87, 16.58]);
    expect(round(tissue.ranked[1].percentMore, 1)).toBe(4.5);
    expect(round(tissue.ranked[1].extraCost, 2)).toBe(8.55);

    const snack = ranked(compare([opt(45, 1, 80, 'g'), opt(99, 1, 230, 'g')]));
    expect(snack.ranked.map((r) => round(r.basePrice, 2))).toEqual([43.04, 56.25]);

    const rice = ranked(compare([opt(219, 1, 3, 'kg'), opt(139, 1, 1.5, 'kg')]));
    expect(rice.ranked.map((r) => round(r.basePrice, 2))).toEqual([73, 92.67]);
  });

  it('en', () => {
    const detergent = ranked(
      compare([opt(12.97, 1, 92, 'floz'), opt(19.94, 1, 154, 'floz'), opt(27.98, 2, 100, 'floz', { shipping: 5.99, discount: 15 })], en, {
        countPer100Below: 0.1,
      }),
    );
    expect(detergent.ranked.map((r) => r.index)).toEqual([1, 0, 2]);
    expect(detergent.ranked.map((r) => round(r.basePrice, 3))).toEqual([0.129, 0.141, 0.149]);
    expect(round(detergent.ranked[1].percentMore, 1)).toBe(8.9);
    expect(round(detergent.ranked[1].extraCost, 2)).toBe(1.06);
    expect(round(detergent.ranked[2].percentMore, 1)).toBe(15);
    expect(round(detergent.ranked[2].extraCost, 2)).toBe(3.87);

    const coffee = ranked(compare([opt(9.99, 1, 12, 'oz'), opt(21.99, 1, 2, 'lb')], en));
    expect(coffee.ranked.map((r) => round(r.basePrice, 3))).toEqual([0.687, 0.833]);
  });

  it('ja', () => {
    const diapers = ranked(compare([opt(1580, 1, 64, 'count'), opt(4380, 3, 58, 'count'), opt(6280, 4, 64, 'count', { discount: 5 })], ja));
    expect(diapers.base).toEqual({ unit: 'count', amount: 1 });
    expect(diapers.ranked.map((r) => r.index)).toEqual([2, 0, 1]);
    expect(diapers.ranked.map((r) => round(r.basePrice, 2))).toEqual([23.3, 24.69, 25.17]);
    expect(round(diapers.ranked[1].percentMore, 1)).toBe(5.9);
    expect(Math.round(diapers.ranked[1].extraCost)).toBe(89);
    expect(round(diapers.ranked[2].percentMore, 1)).toBe(8);
    expect(Math.round(diapers.ranked[2].extraCost)).toBe(325);
  });
});

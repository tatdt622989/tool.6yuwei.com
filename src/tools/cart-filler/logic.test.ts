import { describe, expect, it } from 'vitest';
import {
  MAX_AMOUNT,
  MAX_LINES,
  MAX_QTY,
  parseAmount,
  parseItems,
  parseLine,
  priceOffer,
  setLineMust,
  solveCart,
  solveTiers,
  type CartItem,
  type Combo,
} from './logic';

const item = (price: number, opts: Partial<CartItem> = {}): CartItem => ({ name: '', price, qty: 1, must: false, ...opts });
const sumOf = (items: readonly CartItem[], combo: Combo) => combo.picks.reduce((s, p) => s + items[p.item].price * p.qty, 0);
const picked = (items: readonly CartItem[], combo: Combo) =>
  combo.picks.map((p) => `${items[p.item].name || items[p.item].price}${p.qty > 1 ? `x${p.qty}` : ''}`);

/** Deterministic PRNG so failures can be reproduced. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Brute-force oracle: tries every way to take 0..qty of each optional item.
 * Returns the fewest added pieces per total, once for every cart that reaches the target (`reach`)
 * and once for carts where no added piece can be dropped (`minimal`).
 */
function oracle(items: readonly CartItem[], target: number) {
  const mustTotal = items.filter((i) => i.must).reduce((s, i) => s + i.price * i.qty, 0);
  const optional = items.filter((i) => !i.must);
  const reach = new Map<number, number>();
  const minimal = new Map<number, number>();
  let max = mustTotal;
  const walk = (index: number, total: number, pieces: number, cheapest: number) => {
    if (index === optional.length) {
      max = Math.max(max, total);
      if (total < target) return;
      const keep = (map: Map<number, number>) => map.set(total, Math.min(map.get(total) ?? Infinity, pieces));
      keep(reach);
      if (pieces === 0 || total - cheapest < target) keep(minimal);
      return;
    }
    const { price, qty } = optional[index];
    for (let q = 0; q <= qty; q++) walk(index + 1, total + price * q, pieces + q, q > 0 ? Math.min(cheapest, price) : cheapest);
  };
  walk(0, mustTotal, 0, Infinity);
  const sorted = (map: Map<number, number>) => [...map].sort((a, b) => a[0] - b[0]).map(([total, pieces]) => ({ total, pieces }));
  return { mustTotal, max, reach: sorted(reach), minimal: sorted(minimal) };
}

describe('parseLine', () => {
  it('reads a name and a price, price last', () => {
    expect(parseLine('洗髮精 259')).toEqual({ name: '洗髮精', price: 259, qty: 1, must: false });
    expect(parseLine('  保溫杯\t590  ')).toEqual({ name: '保溫杯', price: 590, qty: 1, must: false });
    expect(parseLine('牙膏89元')).toEqual({ name: '牙膏', price: 89, qty: 1, must: false });
    expect(parseLine('iPhone 15 殼 399')).toMatchObject({ name: 'iPhone 15 殼', price: 399 });
  });

  it('accepts a line that is only a price', () => {
    expect(parseLine('259')).toEqual({ name: '', price: 259, qty: 1, must: false });
    expect(parseLine('$12.99', 100)).toEqual({ name: '', price: 1299, qty: 1, must: false });
  });

  it('marks must-haves with a leading * or !', () => {
    expect(parseLine('*衛生紙 289')).toMatchObject({ name: '衛生紙', price: 289, must: true });
    expect(parseLine('! 衛生紙 289')).toMatchObject({ name: '衛生紙', must: true });
    expect(parseLine('＊衛生紙 289')).toMatchObject({ name: '衛生紙', must: true });
    expect(parseLine('！衛生紙 289')).toMatchObject({ name: '衛生紙', must: true });
    expect(parseLine('衛生紙 289')).toMatchObject({ must: false });
  });

  it('reads a quantity suffix as "up to N"', () => {
    expect(parseLine('牙膏 89 x2')).toMatchObject({ name: '牙膏', price: 89, qty: 2 });
    expect(parseLine('牙膏 89×3')).toMatchObject({ price: 89, qty: 3 });
    expect(parseLine('牙膏 89 X 2')).toMatchObject({ price: 89, qty: 2 });
    expect(parseLine('牙膏 89元 ×2個')).toMatchObject({ name: '牙膏', price: 89, qty: 2 });
    expect(parseLine('牙膏 89*2')).toMatchObject({ price: 89, qty: 2 });
    expect(parseLine('*牙膏 89 x2')).toMatchObject({ price: 89, qty: 2, must: true });
    expect(parseLine('牙膏 89 x500')?.qty).toBe(MAX_QTY);
  });

  it('does not mistake part of a name for a quantity or a price', () => {
    expect(parseLine('Box 12')).toMatchObject({ name: 'Box', price: 12, qty: 1 });
    expect(parseLine('iPhone X 2')).toMatchObject({ name: 'iPhone X', price: 2, qty: 1 });
    expect(parseLine('洗髮精 500ml')).toBeNull();
    expect(parseLine('洗髮精 500ml x2')).toBeNull();
    expect(parseLine('A4')).toBeNull();
    expect(parseLine('洗髮精 500ml 259')).toMatchObject({ name: '洗髮精 500ml', price: 259 });
  });

  it('accepts full-width digits and symbols, thousands separators and currency marks', () => {
    expect(parseLine('吹風機　１，２８０')).toMatchObject({ name: '吹風機', price: 1280 });
    expect(parseLine('吹風機 1,280 ｘ２')).toMatchObject({ price: 1280, qty: 2 });
    expect(parseLine('吹風機 NT$1,280')).toMatchObject({ name: '吹風機', price: 1280 });
    expect(parseLine('吹風機,1,280')).toMatchObject({ name: '吹風機', price: 1280 });
    expect(parseLine('吹風機：1280 元')).toMatchObject({ name: '吹風機', price: 1280 });
    expect(parseLine('ドライヤー ￥3,980')).toMatchObject({ name: 'ドライヤー', price: 3980 });
    expect(parseLine('ドライヤー 3,980円 ×2')).toMatchObject({ name: 'ドライヤー', price: 3980, qty: 2 });
    expect(parseLine('- 吹風機 1280')).toMatchObject({ name: '吹風機', price: 1280 });
    expect(parseLine('Paint $50', 100)).toMatchObject({ name: 'Paint', price: 5000 });
  });

  it('converts to minor units with the scale', () => {
    expect(parseLine('Socks 12.99', 100)).toMatchObject({ name: 'Socks', price: 1299 });
    expect(parseLine('Phone case $9.5 x2', 100)).toMatchObject({ name: 'Phone case', price: 950, qty: 2 });
    expect(parseLine('Socks 0.1', 100)?.price).toBe(10);
    expect(parseLine('襪子 99.5')?.price).toBe(100);
  });

  it('rejects lines without a usable price', () => {
    for (const raw of ['', '   ', '洗髮精', '*', '洗髮精 0', '洗髮精 -', `洗髮精 ${MAX_AMOUNT + 1}`]) {
      expect(parseLine(raw), raw).toBeNull();
    }
  });
});

describe('parseItems', () => {
  it('keeps line numbers, skips blanks and reports unreadable lines', () => {
    const r = parseItems('*衛生紙 289\n\n洗髮精\n牙膏 89 x2\r\n???\n');
    expect(r.items).toEqual([
      { name: '衛生紙', price: 289, qty: 1, must: true, line: 0 },
      { name: '牙膏', price: 89, qty: 2, must: false, line: 3 },
    ]);
    expect(r.invalid).toEqual([3, 5]);
    expect(r.truncated).toBe(false);
  });

  it('returns nothing for empty input', () => {
    expect(parseItems('')).toEqual({ items: [], invalid: [], truncated: false });
    expect(parseItems(' \n \n')).toEqual({ items: [], invalid: [], truncated: false });
  });

  it('stops at MAX_LINES items', () => {
    const r = parseItems(Array.from({ length: MAX_LINES + 5 }, (_, i) => `item ${i + 1}`).join('\n'));
    expect(r.items).toHaveLength(MAX_LINES);
    expect(r.truncated).toBe(true);
  });
});

describe('setLineMust', () => {
  const text = '衛生紙 289\n  ！洗髮精 259\n牙膏 89';
  it('adds and removes the mark on one line only', () => {
    expect(setLineMust(text, 0, true)).toBe('*衛生紙 289\n  ！洗髮精 259\n牙膏 89');
    expect(setLineMust(text, 1, false)).toBe('衛生紙 289\n洗髮精 259\n牙膏 89');
    expect(setLineMust(text, 1, true)).toBe('衛生紙 289\n*洗髮精 259\n牙膏 89');
    expect(setLineMust(text, 2, false)).toBe(text);
    expect(setLineMust(text, 9, true)).toBe(text);
  });
  it('round-trips through the parser', () => {
    const marked = setLineMust(text, 2, true);
    expect(parseItems(marked).items.map((i) => i.must)).toEqual([false, true, true]);
  });
});

describe('parseAmount', () => {
  it('reads amounts in minor units', () => {
    expect(parseAmount('2000')).toBe(2000);
    expect(parseAmount('2,000')).toBe(2000);
    expect(parseAmount('２，０００ 元')).toBe(2000);
    expect(parseAmount('$35', 100)).toBe(3500);
    expect(parseAmount('49.99', 100)).toBe(4999);
    expect(parseAmount('3,980円')).toBe(3980);
    expect(parseAmount('0')).toBe(0);
  });
  it('is NaN for empty or malformed input', () => {
    for (const raw of ['', '  ', 'abc', '-5', '1.2.3', '12a']) expect(parseAmount(raw), raw).toBeNaN();
  });
});

describe('solveCart', () => {
  it('finds the smallest total that reaches the target', () => {
    const items = [item(590), item(399), item(365), item(259), item(199), item(149), item(89), item(79), item(59)];
    const r = solveCart(items, 1000);
    expect(r.status).toBe('ok');
    expect(r.best!.total).toBe(oracle(items, 1000).reach[0].total);
    expect(r.best!.total).toBe(1000);
    expect(picked(items, r.best!)).toEqual([365, 259, 149, 89, 79, 59].map(String));
    expect(sumOf(items, r.best!)).toBe(r.best!.total);
    expect(r.over).toBe(0);
  });

  it('always keeps must-haves and only tops up the rest', () => {
    const items = [
      item(329, { name: 'A', must: true }),
      item(289, { name: 'B', must: true, qty: 2 }),
      item(590, { name: 'C' }),
      item(259, { name: 'D' }),
      item(199, { name: 'E' }),
    ];
    const r = solveCart(items, 1300);
    expect(r.mustTotal).toBe(907);
    expect(picked(items, r.best!)).toEqual(['A', 'Bx2', 'D', 'E']);
    expect(r.best).toMatchObject({ total: 1365, added: 2, addedTotal: 458 });
    expect(r.over).toBe(65);
  });

  it('adds nothing when the must-haves already reach the target', () => {
    const items = [item(1200, { must: true }), item(900, { must: true }), item(50)];
    const r = solveCart(items, 2000);
    expect(r).toMatchObject({ status: 'ok', over: 100, short: 0, alternatives: [] });
    expect(r.best).toMatchObject({ total: 2100, added: 0, addedTotal: 0 });
    expect(r.best!.picks).toEqual([
      { item: 0, qty: 1 },
      { item: 1, qty: 1 },
    ]);
  });

  it('reports the gap when even everything stays below the target', () => {
    const items = [item(300, { must: true }), item(200, { qty: 2 }), item(150)];
    const r = solveCart(items, 1000);
    expect(r).toMatchObject({ status: 'short', short: 150, over: 0, alternatives: [] });
    expect(r.best).toMatchObject({ total: 850, added: 3, addedTotal: 550 });
    expect(r.best!.picks).toEqual([
      { item: 0, qty: 1 },
      { item: 1, qty: 2 },
      { item: 2, qty: 1 },
    ]);
  });

  it('handles an empty list and a zero target', () => {
    expect(solveCart([], 1000)).toMatchObject({ status: 'empty', best: null, alternatives: [] });
    expect(solveCart([item(0), item(Number.NaN), item(10, { qty: 0 })], 1000).status).toBe('empty');
    const r = solveCart([item(100), item(50, { must: true })], 0);
    expect(r).toMatchObject({ status: 'ok', over: 50 });
    expect(r.best).toMatchObject({ total: 50, added: 0 });
    expect(solveCart([item(100)], 0).best).toMatchObject({ total: 0, picks: [] });
    expect(solveCart([item(100)], Number.NaN).best).toMatchObject({ total: 0, picks: [] });
  });

  it('prefers fewer items when totals tie', () => {
    const items = [item(200, { name: 'a' }), item(300, { name: 'b' }), item(500, { name: 'c' }), item(100, { name: 'd' })];
    const r = solveCart(items, 500);
    expect(picked(items, r.best!)).toEqual(['c']);
    const two = solveCart([item(250), item(250), item(125), item(125), item(125), item(125)], 500);
    expect(two.best).toMatchObject({ total: 500, added: 2 });
  });

  it('treats duplicates and quantities as separate pieces', () => {
    const dup = [item(100), item(100), item(100), item(100)];
    expect(solveCart(dup, 250).best).toMatchObject({ total: 300, added: 3 });
    const qty = [item(100, { name: 'a', qty: 4 })];
    const r = solveCart(qty, 250);
    expect(r.best).toMatchObject({ total: 300, added: 3 });
    expect(r.best!.picks).toEqual([{ item: 0, qty: 3 }]);
    expect(solveCart([item(100, { qty: 2 })], 250)).toMatchObject({ status: 'short', short: 50 });
  });

  it('takes a single expensive item when that is the closest', () => {
    const items = [item(5000, { name: 'big' }), item(120, { name: 's1' }), item(130, { name: 's2' })];
    expect(picked(items, solveCart(items, 300).best!)).toEqual(['big']);
    expect(picked(items, solveCart(items, 250).best!)).toEqual(['s1', 's2']);
  });

  it('lists the next totals as alternatives, never a cart with a removable item', () => {
    const items = [600, 450, 420, 380, 180, 30].map((price) => item(price, { name: String(price) }));
    const r = solveCart(items, 1000);
    // 1,040 = 450 + 380 + 180 + 30 also reaches the target, but the 30 is not needed (1,010 already does).
    expect([r.best!, ...r.alternatives].map((c) => [c.total, picked(items, c).join('+')])).toEqual([
      [1010, '450+380+180'],
      [1020, '600+420'],
      [1050, '600+450'],
      [1160, '600+380+180'],
    ]);
    expect(solveCart(items, 1000, { alternatives: 0 }).alternatives).toEqual([]);
    expect(solveCart(items, 1000, { alternatives: 1 }).alternatives.map((a) => a.total)).toEqual([1020]);
  });

  it('works in cents (no common factor) and with a common factor', () => {
    const cents = [item(1299), item(849), item(2450), item(399), item(1999)];
    const r = solveCart(cents, 3500);
    expect(r.best!.total).toBe(oracle(cents, 3500).reach[0].total);
    const tens = [item(1290), item(840), item(2450), item(390), item(1990)];
    const t = solveCart(tens, 3505);
    expect(t.best!.total).toBe(oracle(tens, 3505).reach[0].total);
    expect(t.cells).toBeLessThan(3505); // table is 10× narrower
  });

  it('matches a brute-force oracle on seeded random inputs', () => {
    const rand = mulberry32(20261110);
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    let reached = 0;
    let short = 0;
    for (let round = 0; round < 600; round++) {
      const step = [1, 1, 5, 10][int(0, 3)];
      const items: CartItem[] = Array.from({ length: int(1, 9) }, (_, i) =>
        item(int(1, round % 3 === 0 ? 12 : 400) * step, { name: `i${i}`, qty: rand() < 0.25 ? int(2, 3) : 1, must: rand() < 0.2 }),
      );
      const all = items.reduce((s, i) => s + i.price * i.qty, 0);
      const target = rand() < 0.1 ? all + int(1, 50) : int(0, Math.max(1, Math.round(all * 1.05)));
      const want = oracle(items, target);
      const got = solveCart(items, target);
      const label = `round ${round}: target ${target}, items ${JSON.stringify(items.map((i) => [i.price, i.qty, i.must]))}`;

      expect(got.mustTotal, label).toBe(want.mustTotal);
      if (want.reach.length === 0) {
        short++;
        expect(got.status, label).toBe('short');
        expect(got.best!.total, label).toBe(want.max);
        expect(got.short, label).toBe(target - want.max);
        expect(got.alternatives, label).toEqual([]);
        continue;
      }
      reached++;
      expect(got.status, label).toBe('ok');
      const combos = [got.best!, ...got.alternatives];
      // Best total and fewest pieces among every cart that reaches the target.
      expect({ total: got.best!.total, pieces: got.best!.added }, label).toEqual(want.reach[0]);
      expect(got.over, label).toBe(got.best!.total - target);
      // Alternatives: exactly the next distinct totals of carts without a removable piece.
      expect(combos.map((c) => ({ total: c.total, pieces: c.added })), label).toEqual(want.minimal.slice(0, 4));
      for (const c of combos) {
        expect(sumOf(items, c), label).toBe(c.total);
        expect(c.total - want.mustTotal, label).toBe(c.addedTotal);
        expect(c.total, label).toBeGreaterThanOrEqual(target);
        const seen = new Set<number>();
        for (const p of c.picks) {
          expect(seen.has(p.item), label).toBe(false);
          seen.add(p.item);
          expect(p.qty, label).toBeGreaterThanOrEqual(1);
          expect(p.qty, label).toBeLessThanOrEqual(items[p.item].qty);
          if (items[p.item].must) expect(p.qty, label).toBe(items[p.item].qty);
        }
        for (const [i, it] of items.entries()) if (it.must) expect(seen.has(i), label).toBe(true);
        expect(c.picks.filter((p) => !items[p.item].must).reduce((n, p) => n + p.qty, 0), label).toBe(c.added);
      }
    }
    expect(reached).toBeGreaterThan(400);
    expect(short).toBeGreaterThan(20);
  });

  it('is deterministic', () => {
    const items = [item(100), item(100), item(150), item(50), item(50), item(200)];
    expect(solveCart(items, 300)).toEqual(solveCart(items, 300));
  });

  it('refuses searches beyond the limits instead of hanging', () => {
    const many = Array.from({ length: 80 }, (_, i) => item(40_000 + i * 7));
    expect(solveCart(many, 3_000_000)).toMatchObject({ status: 'too-large', best: null });
    expect(solveCart([item(50)], MAX_AMOUNT + 1)).toMatchObject({ status: 'too-large', best: null });
    expect(solveCart(many, 100_000, { maxCells: 1000 }).status).toBe('too-large');
    const pieces = Array.from({ length: 10 }, (_, i) => item(3 + i, { qty: 99 }));
    expect(solveCart(pieces, 5000).status).toBe('too-large'); // 990 pieces
  });

  it('solves 60 candidates against a 1,000,000 target quickly', () => {
    const rand = mulberry32(7);
    const items = Array.from({ length: 60 }, () => item(1999 + Math.floor(rand() * 60_000)));
    const started = performance.now();
    const r = solveCart(items, 1_000_000);
    const ms = performance.now() - started;
    expect(r.status).toBe('ok');
    expect(sumOf(items, r.best!)).toBe(r.best!.total);
    expect(r.best!.total).toBeGreaterThanOrEqual(1_000_000);
    expect(r.over).toBeLessThan(20); // with 60 prices an almost exact hit exists
    expect(r.alternatives).toHaveLength(3);
    expect(ms).toBeLessThan(3000);
  });
});

describe('priceOffer', () => {
  it('applies a one-time threshold discount', () => {
    expect(priceOffer(2005, 2000, 200, false)).toEqual({ total: 2005, discount: 200, paid: 1805, times: 1, ratio: 1805 / 2005 });
    expect(priceOffer(4100, 2000, 200, false)).toMatchObject({ discount: 200, paid: 3900, times: 1 });
    expect(priceOffer(1999, 2000, 200, false)).toMatchObject({ discount: 0, paid: 1999, times: 0, ratio: 1 });
  });
  it('repeats for every multiple when asked', () => {
    expect(priceOffer(4100, 2000, 200, true)).toMatchObject({ discount: 400, paid: 3700, times: 2 });
    expect(priceOffer(6000, 2000, 200, true)).toMatchObject({ discount: 600, paid: 5400, times: 3, ratio: 0.9 });
  });
  it('ignores a missing or invalid rule and never goes negative', () => {
    expect(priceOffer(500, 0, 100, true)).toMatchObject({ discount: 0, paid: 500, times: 0 });
    expect(priceOffer(500, 400, 0, true)).toMatchObject({ discount: 0, paid: 500 });
    expect(priceOffer(500, 400, Number.NaN, false)).toMatchObject({ discount: 0, paid: 500 });
    expect(priceOffer(500, 400, 900, false)).toMatchObject({ discount: 500, paid: 0 });
    expect(priceOffer(0, 400, 100, false).ratio).toBeNaN();
  });
});

describe('solveTiers', () => {
  const items = [item(1290), item(880), item(760), item(650), item(540), item(499), item(399), item(320), item(250), item(199)];

  it('finds the cheapest cart at 1×, 2× and 3× the threshold', () => {
    const r = solveTiers(items, 1000, 100);
    expect(r.skipped).toBe(false);
    expect(r.tiers.map((t) => t.multiple)).toEqual([1, 2, 3]);
    for (const tier of r.tiers) {
      const want = oracle(items, 1000 * tier.multiple).reach[0].total;
      expect(tier.total).toBe(want);
      expect(tier.combo.total).toBe(want);
      expect(tier.times).toBe(Math.floor(want / 1000));
      expect(tier.paid).toBe(want - tier.times * 100);
    }
    const ratios = r.tiers.map((t) => t.ratio);
    expect(r.best).toBe(ratios.indexOf(Math.min(...ratios)));
  });

  it('stops at the multiples the list can reach', () => {
    const r = solveTiers([item(700), item(600), item(500), item(400)], 1000, 100);
    expect(r.tiers.map((t) => [t.multiple, t.total, t.paid])).toEqual([
      [1, 1000, 900],
      [2, 2200, 2000],
    ]);
    expect(r.best).toBe(0); // 0.9 beats 2000 / 2200
  });

  it('starts from the multiple the must-haves already reach', () => {
    const r = solveTiers([item(2100, { must: true }), item(450), item(480)], 1000, 100);
    expect(r.tiers.map((t) => [t.multiple, t.total, t.times, t.paid])).toEqual([
      [2, 2100, 2, 1900],
      [3, 3030, 3, 2730],
    ]);
    expect(r.best).toBe(1);
    const list = [item(3306, { must: true }), item(437), item(298, { qty: 2 }), item(660), item(382)];
    const far = solveTiers(list, 1000, 100);
    expect(far.tiers.map((t) => [t.multiple, t.total, t.times])).toEqual([
      [3, 3306, 3],
      [4, 4041, 4],
      [5, 5083, 5],
    ]);
    for (const tier of far.tiers) expect(tier.total).toBe(oracle(list, 1000 * tier.multiple).reach[0].total);
  });

  it('does not repeat a cart that covers two multiples at once', () => {
    const r = solveTiers([item(2500), item(2600)], 1000, 100);
    expect(r.tiers.map((t) => [t.multiple, t.total, t.times, t.paid])).toEqual([
      [1, 2500, 2, 2300],
      [3, 5100, 5, 4600],
    ]);
  });

  it('reuses the 1× result it is given', () => {
    const first = solveCart(items, 1000);
    expect(solveTiers(items, 1000, 100, { first })).toEqual(solveTiers(items, 1000, 100));
  });

  it('returns nothing without a valid rule, and flags multiples it had to leave out', () => {
    expect(solveTiers(items, 0, 100)).toEqual({ tiers: [], best: -1, skipped: false });
    expect(solveTiers(items, 1000, 0)).toEqual({ tiers: [], best: -1, skipped: false });
    expect(solveTiers([], 1000, 100)).toEqual({ tiers: [], best: -1, skipped: false });
    const r = solveTiers(items, 1000, 100, { maxCells: 15_000 });
    expect(r.tiers.map((t) => t.multiple)).toEqual([1]);
    expect(r.skipped).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { allocate, splitEqually, splitItemized } from './logic';
import { splitWeighted } from './logic';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('allocate', () => {
  it('splits evenly when possible', () => {
    expect(allocate(300, [1, 1, 1])).toEqual([100, 100, 100]);
  });

  it('gives the remainder to the largest fractions, earlier first on ties', () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(101, [1, 1, 1])).toEqual([34, 34, 33]);
  });

  it('respects proportions and always sums to the total', () => {
    const shares = allocate(1000, [100, 250, 650]);
    expect(shares).toEqual([100, 250, 650]);
    const odd = allocate(997, [3.3, 7.7, 1.1, 0]);
    expect(sum(odd)).toBe(997);
    expect(odd[3]).toBe(0);
  });

  it('handles empty and all-zero weights', () => {
    expect(allocate(10, [])).toEqual([]);
    expect(allocate(10, [0, 0])).toEqual([5, 5]);
  });
});

describe('splitEqually', () => {
  const base = { servicePct: 10, tipPct: 0, roundTo: 1 as const };

  it('adds 10% service charge and splits to the exact 元', () => {
    const r = splitEqually({ ...base, subtotal: 3000, people: 3 })!;
    expect(r.service).toBe(300);
    expect(r.grandTotal).toBe(3300);
    expect(r.basePerPerson).toBe(1100);
    expect(r.extraCount).toBe(0);
  });

  it('reports how many people pay 1 元 more', () => {
    const r = splitEqually({ ...base, servicePct: 0, subtotal: 1000, people: 3 })!;
    expect(r.basePerPerson).toBe(333);
    expect(r.extraCount).toBe(1);
    expect(r.basePerPerson * 3 + r.extraCount).toBe(1000);
    expect(r.exactPerPerson).toBeCloseTo(333.333, 3);
  });

  it('rounds the grand total to whole 元', () => {
    const r = splitEqually({ ...base, subtotal: 1234, people: 4 })!;
    expect(r.grandTotal).toBe(1357); // 1234 × 1.1 = 1357.4
  });

  it('includes tip on the subtotal', () => {
    const r = splitEqually({ ...base, servicePct: 0, tipPct: 15, subtotal: 2000, people: 2 })!;
    expect(r.tip).toBe(300);
    expect(r.grandTotal).toBe(2300);
  });

  it('rounds each share up to 10 元 and reports the surplus', () => {
    const r = splitEqually({ ...base, servicePct: 0, subtotal: 1000, people: 3, roundTo: 10 })!;
    expect(r.roundedPerPerson).toBe(340);
    expect(r.collected).toBe(1020);
    expect(r.surplus).toBe(20);
  });

  it('rejects invalid input', () => {
    expect(splitEqually({ ...base, subtotal: 0, people: 2 })).toBeNull();
    expect(splitEqually({ ...base, subtotal: -100, people: 2 })).toBeNull();
    expect(splitEqually({ ...base, subtotal: 100, people: 0 })).toBeNull();
    expect(splitEqually({ ...base, subtotal: 100, people: 2.5 })).toBeNull();
    expect(splitEqually({ ...base, subtotal: 100, people: 2, servicePct: -1 })).toBeNull();
    expect(splitEqually({ ...base, subtotal: Number.NaN, people: 2 })).toBeNull();
  });

  it('works for a single person', () => {
    expect(splitEqually({ ...base, subtotal: 100, people: 1 })!.basePerPerson).toBe(110);
  });
});

describe('splitEqually in other currencies', () => {
  it('USD: rounds to the cent and spreads leftover cents (scale 100)', () => {
    const r = splitEqually({ subtotal: 120, people: 7, servicePct: 8, tipPct: 20, roundTo: 1, scale: 100 })!;
    expect(r.tip).toBe(24);
    expect(r.grandTotal).toBe(153.6);
    expect(r.basePerPerson).toBe(21.94);
    expect(r.extraCount).toBe(2); // 2 people pay $21.95: 5 × 21.94 + 2 × 21.95 = 153.60
  });

  it('USD: rounds each share up to whole dollars', () => {
    const r = splitEqually({ subtotal: 120, people: 7, servicePct: 8, tipPct: 20, roundTo: 100, scale: 100 })!;
    expect(r.roundedPerPerson).toBe(22);
    expect(r.collected).toBe(154);
    expect(r.surplus).toBeCloseTo(0.4, 10);
  });

  it('JPY 割り勘: rounds up to 100 円 and the organizer keeps the surplus', () => {
    const r = splitEqually({ subtotal: 24800, people: 6, servicePct: 0, tipPct: 0, roundTo: 100 })!;
    expect(r.roundedPerPerson).toBe(4200);
    expect(r.collected).toBe(25200);
    expect(r.surplus).toBe(400);
  });

  it('JPY 割り勘: rounds down to 100 円 and the organizer pays the shortfall', () => {
    const r = splitEqually({ subtotal: 24800, people: 6, servicePct: 0, tipPct: 0, roundTo: 100, roundMode: 'down' })!;
    expect(r.roundedPerPerson).toBe(4100);
    expect(r.collected).toBe(24600);
    expect(r.surplus).toBe(-200);
  });

  it('never rounds a share down to zero', () => {
    const r = splitEqually({ subtotal: 500, people: 4, servicePct: 0, tipPct: 0, roundTo: 1000, roundMode: 'down' })!;
    expect(r.roundedPerPerson).toBe(1000);
  });
});

describe('splitItemized', () => {
  it('USD: allocates cents so payments add up exactly (scale 100)', () => {
    const r = splitItemized({
      people: [
        { name: 'A', amount: 18.5 },
        { name: 'B', amount: 22.25 },
        { name: 'C', amount: 15 },
      ],
      shared: 12,
      servicePct: 8.875,
      tipPct: 20,
      scale: 100,
    })!;
    expect(r.grandTotal).toBe(Math.round(67.75 * 1.28875 * 100) / 100);
    expect(Math.round(sum(r.shares.map((s) => s.pay)) * 100)).toBe(Math.round(r.grandTotal * 100));
    expect(r.shares.every((s) => Number.isInteger(Math.round(s.pay * 100)))).toBe(true);
  });

  it('splits shared items equally and applies charges proportionally', () => {
    const r = splitItemized({
      people: [
        { name: 'A', amount: 300 },
        { name: 'B', amount: 500 },
      ],
      shared: 200,
      servicePct: 10,
      tipPct: 0,
    })!;
    expect(r.subtotal).toBe(1000);
    expect(r.grandTotal).toBe(1100);
    expect(r.shares.map((s) => s.pay)).toEqual([440, 660]);
    expect(r.shares[0].sharedPart).toBe(100);
    expect(r.shares[0].charges).toBe(40);
  });

  it('payments always add up to the grand total', () => {
    const r = splitItemized({
      people: [
        { name: 'A', amount: 123 },
        { name: 'B', amount: 456 },
        { name: 'C', amount: 0 },
      ],
      shared: 389,
      servicePct: 10,
      tipPct: 5,
    })!;
    expect(sum(r.shares.map((s) => s.pay))).toBe(r.grandTotal);
    expect(r.grandTotal).toBe(Math.round(968 * 1.15));
  });

  it('rejects invalid input', () => {
    expect(splitItemized({ people: [], shared: 100, servicePct: 10, tipPct: 0 })).toBeNull();
    expect(splitItemized({ people: [{ name: 'A', amount: -1 }], shared: 0, servicePct: 0, tipPct: 0 })).toBeNull();
    expect(splitItemized({ people: [{ name: 'A', amount: 0 }], shared: 0, servicePct: 0, tipPct: 0 })).toBeNull();
    expect(splitItemized({ people: [{ name: 'A', amount: 10 }], shared: Number.NaN, servicePct: 0, tipPct: 0 })).toBeNull();
  });
});

describe('splitWeighted', () => {
  const people = (...weights: number[]) => weights.map((weight, i) => ({ name: `P${i + 1}`, weight }));
  const pays = (r: { shares: { pay: number }[] }) => r.shares.map((s) => s.pay);
  const noCharges = { servicePct: 0, tipPct: 0 };

  it('splits by weight to the exact 元 and assigns the leftover', () => {
    // 3,280 + 10% = 3,608; weights 1 : 1 : 0.5 → 1,443.2 / 1,443.2 / 721.6
    const r = splitWeighted({ subtotal: 3280, servicePct: 10, tipPct: 0, people: people(1, 1, 0.5), roundTo: 1 })!;
    expect(r.service).toBe(328);
    expect(r.grandTotal).toBe(3608);
    expect(pays(r)).toEqual([1443, 1443, 722]);
    expect(r.collected).toBe(3608);
    expect(r.surplus).toBe(0);
    expect(r.shares.map((s) => s.percent)).toEqual([40, 40, 20]);
    expect(r.shares[2].exact).toBeCloseTo(721.6, 10);
  });

  it('rounds every share up to 10 / 50 / 100 元 and reports the surplus', () => {
    const base = { subtotal: 3280, servicePct: 10, tipPct: 0, people: people(1, 1, 0.5) };
    const r10 = splitWeighted({ ...base, roundTo: 10 })!;
    expect(pays(r10)).toEqual([1450, 1450, 730]);
    expect([r10.collected, r10.surplus]).toEqual([3630, 22]);
    const r50 = splitWeighted({ ...base, roundTo: 50 })!;
    expect(pays(r50)).toEqual([1450, 1450, 750]);
    expect([r50.collected, r50.surplus]).toEqual([3650, 42]);
    const r100 = splitWeighted({ ...base, roundTo: 100 })!;
    expect(pays(r100)).toEqual([1500, 1500, 800]);
    expect([r100.collected, r100.surplus]).toEqual([3800, 192]);
  });

  it('傾斜割り勘: 8 people, 40,000 円, 500 円 steps', () => {
    const r = splitWeighted({ ...noCharges, subtotal: 40000, people: people(1.5, 1.5, 1, 1, 1, 1, 0.5, 0.5), roundTo: 500 })!;
    expect(pays(r)).toEqual([7500, 7500, 5000, 5000, 5000, 5000, 2500, 2500]);
    expect(r.collected).toBe(40000);
    expect(r.surplus).toBe(0);
    expect(r.shares[0].percent).toBe(18.75);
    expect(r.shares[7].percent).toBe(6.25);
  });

  it('傾斜割り勘: rounds up or down to 500 / 1,000 円', () => {
    // 24,800 円 with weights 1.5 : 1 : 1 : 0.5 → 9,300 / 6,200 / 6,200 / 3,100
    const base = { ...noCharges, subtotal: 24800, people: people(1.5, 1, 1, 0.5) };
    expect(pays(splitWeighted({ ...base, roundTo: 1 })!)).toEqual([9300, 6200, 6200, 3100]);
    const up500 = splitWeighted({ ...base, roundTo: 500 })!;
    expect(pays(up500)).toEqual([9500, 6500, 6500, 3500]);
    expect(up500.surplus).toBe(1200);
    const up1000 = splitWeighted({ ...base, roundTo: 1000, roundMode: 'up' })!;
    expect(pays(up1000)).toEqual([10000, 7000, 7000, 4000]);
    expect(up1000.surplus).toBe(3200);
    const down1000 = splitWeighted({ ...base, roundTo: 1000, roundMode: 'down' })!;
    expect(pays(down1000)).toEqual([9000, 6000, 6000, 3000]);
    expect(down1000.collected).toBe(24000);
    expect(down1000.surplus).toBe(-800);
  });

  it('weight 0 pays nothing, in every rounding mode', () => {
    const base = { subtotal: 3000, servicePct: 10, tipPct: 0, people: people(1, 1, 1, 0) };
    const exact = splitWeighted({ ...base, roundTo: 1 })!;
    expect(pays(exact)).toEqual([1100, 1100, 1100, 0]);
    expect(exact.shares[3].percent).toBe(0);
    expect(pays(splitWeighted({ ...base, subtotal: 3100, roundTo: 100 })!)).toEqual([1200, 1200, 1200, 0]);
    expect(pays(splitWeighted({ ...base, subtotal: 3100, roundTo: 100, roundMode: 'down' })!)).toEqual([1100, 1100, 1100, 0]);
  });

  it('one payer covers the whole bill', () => {
    const only = splitWeighted({ ...noCharges, subtotal: 999, people: people(0, 3, 0), roundTo: 1 })!;
    expect(pays(only)).toEqual([0, 999, 0]);
    expect(only.shares[1].percent).toBe(100);
    const rounded = splitWeighted({ ...noCharges, subtotal: 999, people: people(0, 3, 0), roundTo: 100 })!;
    expect(pays(rounded)).toEqual([0, 1000, 0]);
    expect(rounded.surplus).toBe(1);
    expect(pays(splitWeighted({ ...noCharges, subtotal: 500, people: people(1), roundTo: 1 })!)).toEqual([500]);
  });

  it('never rounds a positive share down to zero', () => {
    const r = splitWeighted({ ...noCharges, subtotal: 2400, people: people(1, 1, 0.1), roundTo: 1000, roundMode: 'down' })!;
    // 2,400 × 0.1 / 2.1 ≈ 114 円 would floor to 0
    expect(pays(r)).toEqual([1000, 1000, 1000]);
    expect(r.surplus).toBe(600);
  });

  it('USD by income: exact to the cent (scale 100)', () => {
    // $120 + 8% tax + 20% tip = $153.60, incomes 60,000 : 40,000
    const r = splitWeighted({ subtotal: 120, servicePct: 8, tipPct: 20, people: people(60000, 40000), roundTo: 1, scale: 100 })!;
    expect(r.grandTotal).toBe(153.6);
    expect(pays(r)).toEqual([92.16, 61.44]);
    expect(r.shares.map((s) => s.percent)).toEqual([60, 40]);
    expect(r.surplus).toBe(0);
    expect(pays(splitWeighted({ ...noCharges, subtotal: 100, people: people(2, 1), roundTo: 1, scale: 100 })!)).toEqual([66.67, 33.33]);
    expect(pays(splitWeighted({ ...noCharges, subtotal: 100, people: people(1, 1, 1), roundTo: 1, scale: 100 })!)).toEqual([33.34, 33.33, 33.33]);
  });

  it('USD: rounds each share up to whole dollars', () => {
    const r = splitWeighted({ subtotal: 120, servicePct: 8, tipPct: 20, people: people(60000, 40000), roundTo: 100, scale: 100 })!;
    expect(pays(r)).toEqual([93, 62]);
    expect(r.collected).toBe(155);
    expect(r.surplus).toBeCloseTo(1.4, 10);
  });

  it('rejects invalid input', () => {
    const ok = { ...noCharges, subtotal: 1000, people: people(1, 2), roundTo: 1 };
    expect(splitWeighted(ok)).not.toBeNull();
    expect(splitWeighted({ ...ok, people: people(0, 0, 0) })).toBeNull();
    expect(splitWeighted({ ...ok, people: [] })).toBeNull();
    expect(splitWeighted({ ...ok, people: people(1, -1) })).toBeNull();
    expect(splitWeighted({ ...ok, people: people(1, Number.NaN) })).toBeNull();
    expect(splitWeighted({ ...ok, people: people(1, Number.POSITIVE_INFINITY) })).toBeNull();
    expect(splitWeighted({ ...ok, subtotal: 0 })).toBeNull();
    expect(splitWeighted({ ...ok, subtotal: Number.NaN })).toBeNull();
    expect(splitWeighted({ ...ok, tipPct: -5 })).toBeNull();
    expect(splitWeighted({ ...ok, roundTo: 0 })).toBeNull();
    expect(splitWeighted({ ...ok, roundTo: 2.5 })).toBeNull();
  });

  it('shares always add up to the total plus the stated difference (random cases)', () => {
    // Small deterministic PRNG so failures are reproducible.
    let seed = 20261125;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)];
    const tiers = [0, 0.5, 0.7, 1, 1, 1, 1.5, 2, 3];

    let checked = 0;
    for (let k = 0; k < 4000; k++) {
      const scale = pick([1, 100]);
      const roundTo = pick(scale === 1 ? [1, 10, 50, 100, 500, 1000] : [1, 100, 500]);
      const roundMode = pick(['up', 'down'] as const);
      const n = 1 + Math.floor(rand() * 30);
      const byIncome = rand() < 0.25;
      const weights = Array.from({ length: n }, () => (byIncome ? Math.round(rand() * 150000) : pick(tiers)));
      const subtotal = scale === 1 ? 1 + Math.floor(rand() * 300000) : Math.round((1 + rand() * 3000) * 100) / 100;
      const input = { subtotal, servicePct: pick([0, 0, 8, 8.875, 10]), tipPct: pick([0, 0, 15, 18, 20]), people: people(...weights), roundTo, roundMode, scale };
      const r = splitWeighted(input);
      if (weights.every((w) => w === 0)) {
        expect(r).toBeNull();
        continue;
      }
      checked++;
      const minor = (v: number) => Math.round(v * scale);
      const grand = minor(r!.grandTotal);
      const paid = r!.shares.map((s) => minor(s.pay));

      // Same grand total as the equal split of the same bill.
      expect(r!.grandTotal).toBe(splitEqually({ ...input, people: n, roundTo: 1 })!.grandTotal);
      expect(sum(paid)).toBe(grand + minor(r!.surplus));
      expect(sum(paid)).toBe(minor(r!.collected));
      expect(sum(r!.shares.map((s) => s.percent))).toBeCloseTo(100, 8);
      expect(sum(r!.shares.map((s) => s.exact))).toBeCloseTo(r!.grandTotal, 6);

      r!.shares.forEach((s, i) => {
        const exact = s.exact * scale;
        expect(Number.isInteger(paid[i]) && paid[i] >= 0).toBe(true);
        if (weights[i] === 0) return expect(paid[i]).toBe(0);
        if (roundTo === 1) return expect(Math.abs(paid[i] - exact)).toBeLessThan(1);
        expect(paid[i] % roundTo).toBe(0);
        if (roundMode === 'up') {
          expect(paid[i]).toBeGreaterThanOrEqual(exact - 1e-6);
          expect(paid[i] - exact).toBeLessThan(roundTo + 1e-6);
        } else if (paid[i] > roundTo) {
          expect(paid[i]).toBeLessThanOrEqual(exact + 1e-6);
          expect(exact - paid[i]).toBeLessThan(roundTo + 1e-6);
        }
        // Same weight, same amount once shares are rounded to a cash unit.
        const twin = weights.indexOf(weights[i]);
        expect(paid[i]).toBe(paid[twin]);
      });

      if (roundTo === 1) expect(r!.surplus).toBe(0);
      else if (roundMode === 'up') expect(r!.surplus).toBeGreaterThanOrEqual(0);
    }
    expect(checked).toBeGreaterThan(3900);
  });
});

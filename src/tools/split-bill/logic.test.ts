import { describe, expect, it } from 'vitest';
import { allocate, splitEqually, splitItemized } from './logic';

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

describe('splitItemized', () => {
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

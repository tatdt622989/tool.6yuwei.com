import { describe, expect, it } from 'vitest';
import {
  dicePips,
  flipCoins,
  formatValue,
  generateNumbers,
  randomBelow,
  rangeSize,
  rollDice,
  type NumberOptions,
  type RandomSource,
} from './logic';

function sequence(values: number[]): RandomSource {
  let i = 0;
  return (array) => {
    for (let k = 0; k < array.length; k++) array[k] = values[i++ % values.length];
    return array;
  };
}

const base: NumberOptions = { min: 1, max: 100, count: 10, decimals: 0, unique: false, sort: 'none' };

function values(options: Partial<NumberOptions>, random?: RandomSource): number[] {
  const result = generateNumbers({ ...base, ...options }, random);
  if (!result.ok) throw new Error(result.error);
  return result.values;
}

describe('randomBelow', () => {
  it('rejects the biased tail', () => {
    expect(randomBelow(3, sequence([4294967295, 5]))).toBe(2);
  });

  it('handles ranges wider than 32 bits exactly', () => {
    const n = 2 ** 40;
    for (let i = 0; i < 100; i++) {
      const v = randomBelow(n);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(n);
    }
    expect(randomBelow(n, sequence([0, 7]))).toBe(7);
  });

  it('is roughly uniform', () => {
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60_000; i++) counts[randomBelow(6)]++;
    for (const c of counts) expect(Math.abs(c - 10_000)).toBeLessThan(600);
  });

  it('rejects invalid sizes', () => {
    expect(() => randomBelow(0)).toThrow(RangeError);
  });
});

describe('generateNumbers', () => {
  it('stays inside an inclusive range', () => {
    const v = values({ min: -3, max: 3, count: 500 });
    expect(v).toHaveLength(500);
    expect(Math.min(...v)).toBe(-3);
    expect(Math.max(...v)).toBe(3);
  });

  it('produces unique values, including the dense full-range case', () => {
    const v = values({ min: 1, max: 49, count: 6, unique: true });
    expect(new Set(v).size).toBe(6);
    const all = values({ min: 1, max: 10, count: 10, unique: true, sort: 'asc' });
    expect(all).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('errors when unique values cannot fit in the range', () => {
    const result = generateNumbers({ ...base, min: 1, max: 5, count: 6, unique: true });
    expect(result.ok).toBe(false);
  });

  it('respects decimal places', () => {
    for (const v of values({ min: 0, max: 1, count: 200, decimals: 2 })) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(Math.round(v * 100) / 100).toBe(v);
    }
    expect(rangeSize(0.1, 0.3, 1)).toBe(3);
    expect(rangeSize(0, 1, 2)).toBe(101);
  });

  it('sorts when asked', () => {
    const asc = values({ count: 50, sort: 'asc' });
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = values({ count: 50, sort: 'desc' });
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('validates input', () => {
    expect(generateNumbers({ ...base, min: 10, max: 1 }).ok).toBe(false);
    expect(generateNumbers({ ...base, count: 0 }).ok).toBe(false);
    expect(generateNumbers({ ...base, min: Number.NaN }).ok).toBe(false);
    expect(generateNumbers({ ...base, min: 0.11, max: 0.19, decimals: 1 }).ok).toBe(false);
    expect(generateNumbers({ ...base, min: -1e300, max: 1e300 }).ok).toBe(false);
  });

  it('is deterministic with an injected source', () => {
    expect(values({ min: 5, max: 9, count: 3 }, sequence([0, 1, 4]))).toEqual([5, 6, 9]);
  });

  it('formats with fixed decimals', () => {
    expect(formatValue(0.5, 2)).toBe('0.50');
    expect(formatValue(7, 0)).toBe('7');
  });
});

describe('dice and coins', () => {
  it('rolls faces 1–6 and sums them', () => {
    const roll = rollDice(5);
    expect(roll.values).toHaveLength(5);
    for (const v of roll.values) expect(v).toBeGreaterThanOrEqual(1);
    for (const v of roll.values) expect(v).toBeLessThanOrEqual(6);
    expect(roll.sum).toBe(roll.values.reduce((a, b) => a + b, 0));
    expect(rollDice(2, 6, sequence([0, 5]))).toEqual({ values: [1, 6], sum: 7 });
  });

  it('maps each face to the right number of pips', () => {
    for (let f = 1; f <= 6; f++) expect(dicePips(f)).toHaveLength(f);
  });

  it('counts heads and tails', () => {
    const flips = flipCoins(100);
    expect(flips.heads + flips.tails).toBe(100);
    expect(flipCoins(3, sequence([0, 1, 0]))).toEqual({ values: ['heads', 'tails', 'heads'], heads: 2, tails: 1 });
  });
});

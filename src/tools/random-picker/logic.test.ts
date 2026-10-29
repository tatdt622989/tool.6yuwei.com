import { describe, expect, it } from 'vitest';
import {
  countDuplicates,
  formatGroups,
  formatWinners,
  groupsForSize,
  parseEntries,
  pickWinners,
  randomIndex,
  removeDrawn,
  shuffle,
  splitIntoGroups,
  type RandomSource,
} from './logic';

/** Random source that replays a fixed sequence of 32-bit values. */
function sequence(values: number[]): RandomSource {
  let i = 0;
  return (array) => {
    for (let k = 0; k < array.length; k++) array[k] = values[i++ % values.length];
    return array;
  };
}

const names = ['小明', '小華', '小美', '阿強', '志明', '春嬌', '大雄'];

describe('parseEntries', () => {
  it('trims lines and drops blanks', () => {
    expect(parseEntries('  小明 \n\n小華\r\n  \n小美')).toEqual(['小明', '小華', '小美']);
  });

  it('optionally removes duplicates', () => {
    expect(parseEntries('a\nb\na\nc\nb', true)).toEqual(['a', 'b', 'c']);
    expect(parseEntries('a\nb\na')).toHaveLength(3);
    expect(countDuplicates('a\nb\na\na')).toBe(2);
  });
});

describe('randomIndex', () => {
  it('rejects values in the biased tail', () => {
    // For max = 3, limit = 4294967295; the first value equals limit and must be rejected.
    expect(randomIndex(3, sequence([4294967295, 7]))).toBe(1);
  });

  it('stays within range', () => {
    for (let i = 0; i < 200; i++) {
      const v = randomIndex(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });

  it('is roughly uniform', () => {
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < 50_000; i++) counts[randomIndex(5)]++;
    for (const c of counts) expect(Math.abs(c - 10_000)).toBeLessThan(600);
  });
});

describe('pickWinners', () => {
  it('draws distinct entries without repeats', () => {
    for (let i = 0; i < 50; i++) {
      const winners = pickWinners(names, 4);
      expect(winners).toHaveLength(4);
      expect(new Set(winners).size).toBe(4);
      for (const w of winners) expect(names).toContain(w);
    }
  });

  it('caps the count at the list size', () => {
    expect(pickWinners(names, 99).sort()).toEqual([...names].sort());
    expect(pickWinners(names, 0)).toEqual([]);
  });

  it('is deterministic with an injected source', () => {
    expect(pickWinners(['a', 'b', 'c'], 2, sequence([0]))).toEqual(['a', 'b']);
  });

  it('gives every entry a fair chance', () => {
    const hits = new Map<string, number>();
    for (let i = 0; i < 14_000; i++) {
      const [w] = pickWinners(names, 1);
      hits.set(w, (hits.get(w) ?? 0) + 1);
    }
    for (const n of names) expect(Math.abs((hits.get(n) ?? 0) - 2000)).toBeLessThan(250);
  });
});

describe('splitIntoGroups', () => {
  it('keeps sizes within one of each other and loses nobody', () => {
    const list = Array.from({ length: 23 }, (_, i) => `P${i}`);
    const groups = splitIntoGroups(list, 5);
    expect(groups).toHaveLength(5);
    const sizes = groups.map((g) => g.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(groups.flat().sort()).toEqual([...list].sort());
  });

  it('never creates more groups than people', () => {
    expect(splitIntoGroups(['a', 'b'], 5)).toHaveLength(2);
    expect(splitIntoGroups([], 3)).toEqual([[]]);
  });

  it('computes group count from a target size', () => {
    expect(groupsForSize(10, 3)).toBe(4);
    expect(groupsForSize(12, 4)).toBe(3);
    expect(groupsForSize(0, 3)).toBe(0);
  });
});

describe('helpers', () => {
  it('shuffles without losing entries', () => {
    expect(shuffle(names).sort()).toEqual([...names].sort());
  });

  it('removes only one occurrence per drawn entry', () => {
    expect(removeDrawn(['a', 'b', 'a', 'c'], ['a', 'c'])).toEqual(['b', 'a']);
  });

  it('formats results', () => {
    expect(formatWinners(['小明', '小華'])).toBe('1. 小明\n2. 小華');
    expect(formatGroups([['a', 'b'], ['c']])).toBe('第 1 組（2 人）：a、b\n第 2 組（1 人）：c');
  });
});

import { describe, expect, it } from 'vitest';
import {
  addAffixes,
  dedupeLines,
  isNumberFormat,
  joinLines,
  lineStats,
  numberLines,
  removeEmptyLines,
  reverseLines,
  shuffleLines,
  sortLines,
  splitLines,
  trimLines,
  type CompareOptions,
} from './logic';

const opts: CompareOptions = { caseSensitive: false, collation: 'stroke' };

describe('splitLines', () => {
  it('handles empty text, CRLF and a trailing newline', () => {
    expect(splitLines('')).toEqual([]);
    expect(splitLines('a\r\nb\rc\nd')).toEqual(['a', 'b', 'c', 'd']);
    expect(splitLines('a\nb\n')).toEqual(['a', 'b']);
    expect(splitLines('\n')).toEqual(['']);
    expect(joinLines(['a', 'b'])).toBe('a\nb');
  });
});

describe('sortLines', () => {
  it('sorts A–Z and Z–A ignoring case', () => {
    expect(sortLines(['banana', 'Apple', 'cherry'], 'asc', opts)).toEqual(['Apple', 'banana', 'cherry']);
    expect(sortLines(['banana', 'Apple', 'cherry'], 'desc', opts)).toEqual(['cherry', 'banana', 'Apple']);
  });

  it('sorts numbers naturally', () => {
    const items = ['item10', 'item2', 'item1'];
    expect(sortLines(items, 'asc', opts)).toEqual(['item1', 'item10', 'item2']);
    expect(sortLines(items, 'natural', opts)).toEqual(['item1', 'item2', 'item10']);
  });

  it('sorts Chinese by stroke count or Zhuyin', () => {
    expect(sortLines(['陳', '王', '一', '林'], 'asc', opts)).toEqual(['一', '王', '林', '陳']);
    // ㄌ (林) before ㄓ (陳)
    expect(sortLines(['陳', '林'], 'asc', { ...opts, collation: 'zhuyin' })).toEqual(['林', '陳']);
  });

  it('sorts by length, keeping ties in order', () => {
    expect(sortLines(['ccc', 'a', 'bb', 'd'], 'length', opts)).toEqual(['a', 'd', 'bb', 'ccc']);
    expect(sortLines(['中文字', 'ab'], 'length', opts)).toEqual(['ab', '中文字']);
  });

  it('does not mutate the input', () => {
    const input = ['b', 'a'];
    sortLines(input, 'asc', opts);
    expect(input).toEqual(['b', 'a']);
  });
});

describe('reverse and shuffle', () => {
  it('reverses', () => {
    expect(reverseLines(['1', '2', '3'])).toEqual(['3', '2', '1']);
  });

  it('shuffles deterministically with injected random and keeps all lines', () => {
    expect(shuffleLines(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a']);
    const out = shuffleLines(['a', 'b', 'c', 'd', 'e']);
    expect([...out].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('dedupeLines', () => {
  it('keeps the first occurrence, case-insensitive by default', () => {
    expect(dedupeLines(['Apple', 'apple ', 'pear', 'Apple'], false)).toEqual(['Apple', 'pear']);
  });

  it('respects case sensitivity', () => {
    expect(dedupeLines(['Apple', 'apple', 'Apple'], true)).toEqual(['Apple', 'apple']);
  });

  it('leaves empty lines alone', () => {
    expect(dedupeLines(['a', '', 'a', ''], false)).toEqual(['a', '', '']);
  });
});

describe('cleanup', () => {
  it('removes empty and whitespace-only lines', () => {
    expect(removeEmptyLines(['a', '', '  ', '　', 'b'])).toEqual(['a', 'b']);
  });

  it('trims each line, including full-width spaces', () => {
    expect(trimLines(['  a ', '　b\t'])).toEqual(['a', 'b']);
  });
});

describe('addAffixes', () => {
  it('wraps non-empty lines', () => {
    expect(addAffixes(['a', '', 'b'], '"', '",')).toEqual(['"a",', '', '"b",']);
  });
});

describe('numberLines', () => {
  it('numbers non-empty lines with the chosen format', () => {
    expect(numberLines(['a', '', 'b'], 'dot')).toEqual(['1. a', '', '2. b']);
    expect(numberLines(['a', 'b'], 'comma', 5)).toEqual(['5、a', '6、b']);
    expect(numberLines(['a'], 'tab')).toEqual(['1\ta']);
    expect(numberLines(['a'], 'paren')).toEqual(['1) a']);
  });

  it('zero-pads to the widest number', () => {
    const lines = Array.from({ length: 10 }, (_, i) => `x${i}`);
    const out = numberLines(lines, 'dot', 1, true);
    expect(out[0]).toBe('01. x0');
    expect(out[9]).toBe('10. x9');
  });

  it('validates formats', () => {
    expect(isNumberFormat('dot')).toBe(true);
    expect(isNumberFormat('roman')).toBe(false);
  });
});

describe('lineStats', () => {
  it('counts lines, non-empty and duplicates', () => {
    expect(lineStats(['a', 'A', '', 'b', 'a'], false)).toEqual({ total: 5, nonEmpty: 4, duplicates: 2 });
    expect(lineStats(['a', 'A', '', 'b', 'a'], true)).toEqual({ total: 5, nonEmpty: 4, duplicates: 1 });
    expect(lineStats([], false)).toEqual({ total: 0, nonEmpty: 0, duplicates: 0 });
  });
});

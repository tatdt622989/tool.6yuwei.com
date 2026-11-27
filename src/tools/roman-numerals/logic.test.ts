import { describe, expect, it } from 'vitest';
import {
  breakdown,
  dateToRoman,
  COMMON_NUMBERS,
  looksNumeric,
  normalizeRoman,
  overline,
  parseInteger,
  parseRoman,
  toRoman,
  toRomanBasic,
} from './logic';

const O = '̅';

describe('toRomanBasic', () => {
  it.each([
    [1, 'I'],
    [3, 'III'],
    [4, 'IV'],
    [9, 'IX'],
    [14, 'XIV'],
    [40, 'XL'],
    [44, 'XLIV'],
    [90, 'XC'],
    [99, 'XCIX'],
    [400, 'CD'],
    [444, 'CDXLIV'],
    [900, 'CM'],
    [1666, 'MDCLXVI'],
    [1776, 'MDCCLXXVI'],
    [1994, 'MCMXCIV'],
    [2000, 'MM'],
    [2026, 'MMXXVI'],
    [3888, 'MMMDCCCLXXXVIII'],
    [3999, 'MMMCMXCIX'],
  ])('%i → %s', (n, roman) => {
    expect(toRomanBasic(n)).toBe(roman);
  });

  it('throws outside 1–3999', () => {
    expect(() => toRomanBasic(0)).toThrow(RangeError);
    expect(() => toRomanBasic(4000)).toThrow(RangeError);
    expect(() => toRomanBasic(1.5)).toThrow(RangeError);
  });
});

describe('toRoman', () => {
  it('reports why a number cannot be converted', () => {
    expect(toRoman(0)).toEqual({ ok: false, error: 'zero' });
    expect(toRoman(-5)).toEqual({ ok: false, error: 'negative' });
    expect(toRoman(2.5)).toEqual({ ok: false, error: 'not-integer' });
    expect(toRoman(Number.NaN)).toEqual({ ok: false, error: 'not-integer' });
    expect(toRoman(4000)).toEqual({ ok: false, error: 'too-large' });
    expect(toRoman(4_000_000, true)).toEqual({ ok: false, error: 'too-large' });
  });

  it('uses the vinculum from 4,000 when allowed', () => {
    expect(toRoman(4000, true)).toEqual({ ok: true, roman: `I${O}V${O}`, vinculum: true });
    expect(toRoman(5000, true)).toEqual({ ok: true, roman: `V${O}`, vinculum: true });
    expect(toRoman(4001, true)).toEqual({ ok: true, roman: `I${O}V${O}I`, vinculum: true });
    expect(toRoman(10_000, true)).toMatchObject({ roman: `X${O}` });
    expect(toRoman(1_000_000, true)).toMatchObject({ roman: `M${O}` });
    expect(toRoman(3_999_999, true)).toMatchObject({ roman: `${overline('MMMCMXCIX')}CMXCIX` });
  });

  it('does not use the vinculum below 4,000', () => {
    expect(toRoman(3999, true)).toEqual({ ok: true, roman: 'MMMCMXCIX', vinculum: false });
  });
});

describe('overline', () => {
  it('adds a combining overline after each letter', () => {
    expect(overline('IV')).toBe(`I${O}V${O}`);
    expect([...overline('XL')]).toHaveLength(4);
  });
});

describe('breakdown', () => {
  it('splits a number into Roman parts', () => {
    expect(breakdown(1994)).toEqual([
      [1000, 'M'],
      [900, 'CM'],
      [90, 'XC'],
      [4, 'IV'],
    ]);
    expect(breakdown(3888)).toEqual([
      [3000, 'MMM'],
      [500, 'D'],
      [300, 'CCC'],
      [50, 'L'],
      [30, 'XXX'],
      [5, 'V'],
      [3, 'III'],
    ]);
  });

  it('includes vinculum parts', () => {
    expect(breakdown(12_004)).toEqual([
      [10_000, `X${O}`],
      [2000, `I${O}I${O}`],
      [4, 'IV'],
    ]);
  });

  it('round-trips with toRoman', () => {
    for (const n of [1, 49, 2026, 3999, 4000, 123_456, 3_999_999]) {
      expect(breakdown(n).map((p) => p[1]).join('')).toBe((toRoman(n, true) as { roman: string }).roman);
      expect(breakdown(n).reduce((sum, p) => sum + p[0], 0)).toBe(n);
    }
  });
});

describe('parseRoman', () => {
  it('parses valid numerals in any case and with spaces', () => {
    expect(parseRoman('MMXXVI')).toEqual({ ok: true, value: 2026, canonical: 'MMXXVI' });
    expect(parseRoman(' mcmxciv ')).toMatchObject({ ok: true, value: 1994 });
    expect(parseRoman('M CM XC IV')).toMatchObject({ ok: true, value: 1994 });
    expect(parseRoman('xlii')).toMatchObject({ ok: true, value: 42 });
  });

  it('parses vinculum numerals, also written with a macron', () => {
    expect(parseRoman(`I${O}V${O}`)).toMatchObject({ ok: true, value: 4000 });
    expect(parseRoman(`X${O}CMXCIX`)).toMatchObject({ ok: true, value: 10_999 });
    expect(parseRoman('V̄')).toMatchObject({ ok: true, value: 5000 });
    expect(parseRoman('ĪV̄')).toMatchObject({ ok: true, value: 4000 }); // Ī V̄
  });

  it('parses Unicode Roman numeral characters', () => {
    expect(parseRoman('Ⅻ')).toMatchObject({ ok: true, value: 12 }); // Ⅻ
    expect(parseRoman('Ⅷ')).toMatchObject({ ok: true, value: 8 }); // Ⅷ
  });

  it('round-trips every number from 1 to 3999', () => {
    for (let n = 1; n <= 3999; n++) {
      const r = parseRoman(toRomanBasic(n));
      expect(r.ok && r.value).toBe(n);
    }
  });

  it('round-trips sampled vinculum numbers', () => {
    for (let n = 4000; n <= 3_999_999; n += 7919) {
      const roman = (toRoman(n, true) as { roman: string }).roman;
      expect(parseRoman(roman)).toMatchObject({ ok: true, value: n });
    }
  });

  it.each([
    ['IIII', 4, 'IV'],
    ['VV', 10, 'X'],
    ['IC', 99, 'XCIX'],
    ['IM', 999, 'CMXCIX'],
    ['XM', 990, 'CMXC'],
    ['VX', 5, 'V'],
    ['LL', 100, 'C'],
    ['DD', 1000, 'M'],
    ['XXXX', 40, 'XL'],
    ['CCCC', 400, 'CD'],
    ['MCMC', 2000, 'MM'],
    ['IXI', 10, 'X'],
  ])('rejects malformed %s and suggests the standard form', (input, guess, suggestion) => {
    expect(parseRoman(input)).toEqual({ ok: false, error: 'malformed', guess, suggestion });
  });

  it('rejects MMMM because 4,000 needs a bar, and suggests it', () => {
    expect(parseRoman('MMMM')).toEqual({ ok: false, error: 'malformed', guess: 4000, suggestion: `I${O}V${O}` });
  });

  it('rejects barred thousands below 4,000 (non-standard)', () => {
    expect(parseRoman(`I${O}`)).toMatchObject({ ok: false, error: 'malformed', guess: 1000, suggestion: 'M' });
  });

  it('reports invalid characters', () => {
    expect(parseRoman('MXA')).toEqual({ ok: false, error: 'invalid-char', badChar: 'A' });
    expect(parseRoman('12')).toMatchObject({ ok: false, error: 'invalid-char', badChar: '1' });
    expect(parseRoman(`${O}X`)).toMatchObject({ ok: false, error: 'invalid-char' });
  });

  it('reports empty input', () => {
    expect(parseRoman('   ')).toEqual({ ok: false, error: 'empty' });
  });
});

describe('normalizeRoman', () => {
  it('uppercases, strips spaces and unifies bars', () => {
    expect(normalizeRoman(' x v ')).toBe('XV');
    expect(normalizeRoman('V̄')).toBe(`V${O}`);
    expect(normalizeRoman('V‾')).toBe(`V${O}`);
  });
});

describe('number input helpers', () => {
  it('looksNumeric', () => {
    expect(looksNumeric('2026')).toBe(true);
    expect(looksNumeric('1,000,000')).toBe(true);
    expect(looksNumeric('-3')).toBe(true);
    expect(looksNumeric('XIV')).toBe(false);
    expect(looksNumeric('')).toBe(false);
  });
  it('parseInteger', () => {
    expect(parseInteger('2,026')).toBe(2026);
    expect(parseInteger('1 000 000')).toBe(1_000_000);
    expect(parseInteger('12.0')).toBe(12);
    expect(parseInteger('12.5')).toBe(12.5);
    expect(parseInteger('-7')).toBe(-7);
    expect(parseInteger('abc')).toBeNaN();
  });
  it('common numbers are all convertible', () => {
    for (const n of COMMON_NUMBERS) expect(toRoman(n).ok).toBe(true);
  });
});

describe('dateToRoman', () => {
  it('formats a date in the chosen order', () => {
    expect(dateToRoman('2026-10-29')).toBe('X.XXIX.MMXXVI');
    expect(dateToRoman('2026-10-29', 'dmy')).toBe('XXIX.X.MMXXVI');
    expect(dateToRoman('2026-10-29', 'ymd', ' · ')).toBe('MMXXVI · X · XXIX');
    expect(dateToRoman('1776-07-04', 'mdy', ' ')).toBe('VII IV MDCCLXXVI');
  });
  it('handles leap years', () => {
    expect(dateToRoman('2024-02-29')).toBe('II.XXIX.MMXXIV');
    expect(dateToRoman('2026-02-29')).toBeNull();
    expect(dateToRoman('1900-02-29')).toBeNull();
    expect(dateToRoman('2000-02-29')).toBe('II.XXIX.MM');
  });
  it('rejects invalid dates', () => {
    expect(dateToRoman('')).toBeNull();
    expect(dateToRoman('2026-13-01')).toBeNull();
    expect(dateToRoman('2026-04-31')).toBeNull();
    expect(dateToRoman('0000-01-01')).toBeNull();
    expect(dateToRoman('hello')).toBeNull();
  });
});

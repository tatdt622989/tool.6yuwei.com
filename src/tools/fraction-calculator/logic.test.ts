import { describe, expect, it } from 'vitest';
import {
  add,
  approxDecimal,
  calculate,
  decimalToFractionSteps,
  detectRepeat,
  divide,
  equals,
  formatDecimal,
  formatFraction,
  formatMixed,
  frac,
  gcd,
  lcm,
  multiply,
  parseFraction,
  repeatingToFraction,
  simplify,
  subtract,
  toDecimal,
  toMixed,
  type Fraction,
} from './logic';

const f = (n: number, d = 1): Fraction => frac(n, d);
const val = (input: string) => {
  const p = parseFraction(input);
  if (!p.ok) throw new Error(`parse failed: ${input}`);
  return p.value;
};

describe('gcd / lcm / simplify', () => {
  it('computes gcd and lcm', () => {
    expect(gcd(12n, 18n)).toBe(6n);
    expect(gcd(-12n, 18n)).toBe(6n);
    expect(gcd(7n, 0n)).toBe(7n);
    expect(lcm(4n, 6n)).toBe(12n);
    expect(lcm(3n, 5n)).toBe(15n);
    expect(lcm(0n, 5n)).toBe(0n);
  });
  it('reduces to lowest terms with a positive denominator', () => {
    expect(simplify({ n: 6n, d: 8n })).toEqual({ n: 3n, d: 4n });
    expect(simplify({ n: 3n, d: -6n })).toEqual({ n: -1n, d: 2n });
    expect(simplify({ n: -4n, d: -8n })).toEqual({ n: 1n, d: 2n });
    expect(simplify({ n: 0n, d: -5n })).toEqual({ n: 0n, d: 1n });
    expect(() => simplify({ n: 1n, d: 0n })).toThrow(RangeError);
  });
  it('equals compares values', () => {
    expect(equals({ n: 2n, d: 4n }, { n: 1n, d: 2n })).toBe(true);
    expect(equals(f(1, 3), f(1, 2))).toBe(false);
  });
});

describe('formatting', () => {
  it('formats fractions and mixed numbers', () => {
    expect(formatFraction(f(9, 4))).toBe('9/4');
    expect(formatFraction(f(-3, 8))).toBe('-3/8');
    expect(formatFraction(f(4, 2))).toBe('2');
    expect(formatMixed(f(9, 4))).toBe('2 1/4');
    expect(formatMixed(f(-9, 4))).toBe('-2 1/4');
    expect(formatMixed(f(3, 4))).toBe('3/4');
    expect(formatMixed(f(-3, 4))).toBe('-3/4');
    expect(formatMixed(f(6))).toBe('6');
    expect(formatMixed(f(0))).toBe('0');
  });
  it('toMixed splits whole and remainder', () => {
    expect(toMixed(f(-17, 5))).toEqual({ negative: true, whole: 3n, n: 2n, d: 5n });
  });
});

describe('parseFraction', () => {
  it('parses integers, fractions and mixed numbers', () => {
    expect(parseFraction('5')).toMatchObject({ ok: true, kind: 'integer', value: f(5) });
    expect(parseFraction('-5')).toMatchObject({ ok: true, value: f(-5) });
    expect(parseFraction('3/4')).toMatchObject({ ok: true, kind: 'fraction', value: f(3, 4) });
    expect(parseFraction(' 6 / 8 ')).toMatchObject({ ok: true, value: f(3, 4), raw: { n: 6n, d: 8n } });
    expect(parseFraction('-3/4')).toMatchObject({ value: f(-3, 4) });
    expect(parseFraction('3/-4')).toMatchObject({ value: f(-3, 4) });
    expect(parseFraction('-3/-4')).toMatchObject({ value: f(3, 4) });
    expect(parseFraction('1 1/2')).toMatchObject({ ok: true, kind: 'mixed', value: f(3, 2) });
    expect(parseFraction('-2 3/8')).toMatchObject({ value: f(-19, 8) });
    expect(parseFraction('2_3/8')).toMatchObject({ value: f(19, 8) });
    expect(parseFraction('7/3')).toMatchObject({ value: f(7, 3) });
    expect(parseFraction('1⁄2')).toMatchObject({ value: f(1, 2) }); // fraction slash
    expect(parseFraction('−1/2')).toMatchObject({ value: f(-1, 2) }); // minus sign
  });

  it('parses decimals', () => {
    expect(parseFraction('0.75')).toMatchObject({ ok: true, kind: 'decimal', value: f(3, 4), raw: { n: 75n, d: 100n } });
    expect(parseFraction('.5')).toMatchObject({ value: f(1, 2) });
    expect(parseFraction('-1.25')).toMatchObject({ value: f(-5, 4) });
    expect(parseFraction('2.')).toMatchObject({ value: f(2) });
    expect(parseFraction('0.1')).toMatchObject({ value: f(1, 10) });
  });

  it('parses repeating decimals', () => {
    expect(parseFraction('0.(3)')).toMatchObject({ ok: true, kind: 'repeating', value: f(1, 3) });
    expect(parseFraction('0.1(6)')).toMatchObject({ value: f(1, 6) });
    expect(parseFraction('1.(142857)')).toMatchObject({ value: f(8, 7) });
    expect(parseFraction('0.333...')).toMatchObject({ kind: 'repeating', value: f(1, 3) });
    expect(parseFraction('0.1666…')).toMatchObject({ value: f(1, 6) });
    expect(parseFraction('0.142857142857...')).toMatchObject({ value: f(1, 7) });
    expect(parseFraction('-0.(6)')).toMatchObject({ value: f(-2, 3) });
    expect(parseFraction('0.(9)')).toMatchObject({ value: f(1) });
  });

  it('treats an ellipsis without a repeat as a plain decimal', () => {
    expect(parseFraction('0.5...')).toMatchObject({ kind: 'decimal', value: f(1, 2) });
  });

  it('reports errors', () => {
    expect(parseFraction('')).toEqual({ ok: false, error: 'empty' });
    expect(parseFraction('1/0')).toEqual({ ok: false, error: 'zero-denominator' });
    expect(parseFraction('2 1/0')).toEqual({ ok: false, error: 'zero-denominator' });
    expect(parseFraction('abc')).toEqual({ ok: false, error: 'invalid' });
    expect(parseFraction('1/2/3')).toEqual({ ok: false, error: 'invalid' });
    expect(parseFraction('.')).toEqual({ ok: false, error: 'invalid' });
    expect(parseFraction('1 -1/2')).toEqual({ ok: false, error: 'invalid' });
    expect(parseFraction('1'.repeat(31))).toEqual({ ok: false, error: 'too-long' });
  });
});

describe('detectRepeat / repeatingToFraction', () => {
  it('finds the shortest repeating block', () => {
    expect(detectRepeat('333')).toEqual({ nonRep: '', rep: '3' });
    expect(detectRepeat('1666')).toEqual({ nonRep: '1', rep: '6' });
    expect(detectRepeat('142857142857')).toEqual({ nonRep: '', rep: '142857' });
    expect(detectRepeat('8333')).toEqual({ nonRep: '8', rep: '3' });
    expect(detectRepeat('5')).toBeNull();
    expect(detectRepeat('12')).toBeNull();
  });
  it('converts repeating decimals', () => {
    expect(repeatingToFraction('0', '1', '6')).toEqual(f(1, 6));
    expect(repeatingToFraction('2', '', '45')).toEqual(f(27, 11));
    expect(repeatingToFraction('0', '375', '')).toEqual(f(3, 8));
    expect(repeatingToFraction('0', '', '3', true)).toEqual(f(-1, 3));
  });
});

describe('arithmetic', () => {
  it('adds, subtracts, multiplies and divides exactly', () => {
    expect(add(f(1, 2), f(1, 3))).toEqual(f(5, 6));
    expect(subtract(f(3, 4), f(5, 6))).toEqual(f(-1, 12));
    expect(multiply(f(2, 3), f(9, 4))).toEqual(f(3, 2));
    expect(divide(f(3, 2), f(3, 4))).toEqual(f(2));
    expect(divide(f(1, 2), f(0))).toBeNull();
  });

  it('has no floating point error', () => {
    expect(add(val('0.1'), val('0.2'))).toEqual(f(3, 10));
  });
});

describe('calculate (with steps)', () => {
  it('adds mixed numbers', () => {
    const r = calculate(val('1 1/2'), '+', val('3/4'), ['1 1/2', '3/4']);
    expect(r.ok && r.value).toEqual(f(9, 4));
    if (!r.ok) return;
    expect(r.steps[0]).toBe('Write each number as a simplified fraction: 1 1/2 = 3/2.');
    expect(r.steps).toContain('Find the least common denominator of 2 and 4: LCD = 4.');
    expect(r.steps).toContain('Rewrite both fractions over 4: 3/2 = 6/4 and 3/4 = 3/4.');
    expect(r.steps).toContain('Add the numerators: 6/4 + 3/4 = 9/4.');
    expect(r.steps).toContain('9/4 is already in lowest terms.');
    expect(r.steps.at(-1)).toBe('As a mixed number: 9/4 = 2 1/4.');
  });

  it('subtracts and simplifies', () => {
    const r = calculate(f(5, 6), '-', f(1, 3));
    expect(r.ok && r.value).toEqual(f(1, 2));
    if (!r.ok) return;
    expect(r.steps).toContain('Subtract the numerators: 5/6 − 2/6 = 3/6.');
    expect(r.steps).toContain('Simplify: the greatest common factor of 3 and 6 is 3, so 3/6 = 1/2.');
  });

  it('uses the shared denominator directly', () => {
    const r = calculate(f(1, 8), '+', f(3, 8));
    expect(r.ok && r.steps[0]).toBe('The denominators are already the same (8).');
    expect(r.ok && r.value).toEqual(f(1, 2));
  });

  it('handles negative results and operands', () => {
    const r = calculate(f(1, 4), '-', f(3, 4));
    expect(r.ok && r.value).toEqual(f(-1, 2));
    const s = calculate(f(1, 2), '-', f(-1, 3));
    expect(s.ok && s.value).toEqual(f(5, 6));
    expect(s.ok && s.steps).toContain('Subtract the numerators: 3/6 − (-2)/6 = 5/6.');
  });

  it('multiplies', () => {
    const r = calculate(f(2, 3), '×', f(3, 4));
    expect(r.ok && r.value).toEqual(f(1, 2));
    expect(r.ok && r.steps).toContain('Multiply the numerators and the denominators: (2 × 3) / (3 × 4) = 6/12.');
  });

  it('divides by multiplying by the reciprocal', () => {
    const r = calculate(val('2 1/2'), '÷', f(1, 4), ['2 1/2', '1/4']);
    expect(r.ok && r.value).toEqual(f(10));
    if (!r.ok) return;
    expect(r.steps).toContain('To divide, multiply by the reciprocal of the second fraction: 5/2 ÷ 1/4 = 5/2 × 4.');
    expect(r.steps).toContain('Simplify: the greatest common factor of 20 and 2 is 2, so 20/2 = 10.');
  });

  it('divides by a negative fraction', () => {
    const r = calculate(f(1, 2), '÷', f(-3, 4));
    expect(r.ok && r.value).toEqual(f(-2, 3));
  });

  it('refuses to divide by zero', () => {
    expect(calculate(f(1, 2), '÷', f(0))).toEqual({ ok: false, error: 'divide-by-zero' });
  });

  it('explains a zero result', () => {
    const r = calculate(f(0), '×', f(5, 7));
    expect(r.ok && r.steps.at(-1)).toBe('The numerator is 0, so the result is 0.');
  });

  it('notes decimal inputs converted to fractions', () => {
    const r = calculate(val('0.5'), '+', val('1/3'), ['0.5', '1/3']);
    expect(r.ok && r.steps[0]).toBe('Write each number as a simplified fraction: 0.5 = 1/2.');
  });
});

describe('toDecimal / formatDecimal / approxDecimal', () => {
  it.each([
    [f(3, 8), '0.375'],
    [f(1, 3), '0.(3)'],
    [f(1, 6), '0.1(6)'],
    [f(1, 7), '0.(142857)'],
    [f(22, 7), '3.(142857)'],
    [f(-5, 4), '-1.25'],
    [f(5), '5'],
    [f(1, 12), '0.08(3)'],
    [f(0), '0'],
  ])('%o → %s', (fr, text) => {
    expect(formatDecimal(toDecimal(fr))).toBe(text);
  });

  it('truncates very long periods', () => {
    const e = toDecimal(f(1, 97), 20);
    expect(e.truncated).toBe(true);
    expect(formatDecimal(e)).toBe('0.01030927835051546391…');
  });

  it('rounds for display', () => {
    expect(approxDecimal(f(1, 6))).toBe('0.166667');
    expect(approxDecimal(f(2, 3), 3)).toBe('0.667');
    expect(approxDecimal(f(-1, 8))).toBe('-0.125');
    expect(approxDecimal(f(7))).toBe('7');
    expect(approxDecimal(f(-1, 3000000), 2)).toBe('0');
  });
});

describe('decimalToFractionSteps', () => {
  it('explains a terminating decimal', () => {
    const r = decimalToFractionSteps('0.375')!;
    expect(r.value).toEqual(f(3, 8));
    expect(r.steps).toEqual([
      '0.375 has 3 decimal places, so write it over 1000: 375/1000.',
      'Divide both by their greatest common factor, 125: 3/8.',
    ]);
  });
  it('explains a repeating decimal', () => {
    const r = decimalToFractionSteps('0.1(6)')!;
    expect(r.value).toEqual(f(1, 6));
    expect(r.steps[0]).toBe('Let x = 0.1(6). The repeating block "6" has 1 digit.');
    expect(r.steps[1]).toBe('Multiply by 100 and by 10 so the repeating parts line up, then subtract: 90x = 15.');
    expect(r.steps[2]).toBe('Solve and simplify: x = 1/6.');
  });
  it('explains a purely repeating decimal and a mixed number', () => {
    const r = decimalToFractionSteps('2.(45)')!;
    expect(r.value).toEqual(f(27, 11));
    expect(r.steps[1]).toBe('Multiply by 100 and subtract x: 99x = 243.');
    expect(r.steps.at(-1)).toBe('As a mixed number: 2 5/11.');
  });
  it('handles repeating nines', () => {
    expect(decimalToFractionSteps('0.(9)')!.value).toEqual(f(1));
  });
  it('returns null for non-decimals', () => {
    expect(decimalToFractionSteps('3/4')).toBeNull();
    expect(decimalToFractionSteps('x')).toBeNull();
  });
});

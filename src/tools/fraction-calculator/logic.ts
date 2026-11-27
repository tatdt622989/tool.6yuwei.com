// Fraction calculator. Pure functions on exact rationals (BigInt numerator / denominator), so results never
// pick up floating-point error. Methods follow standard US school arithmetic: least common denominator for
// addition and subtraction, multiply straight across, divide by multiplying by the reciprocal, simplify by the
// greatest common divisor, and the standard algorithm for repeating decimals (x = 0.1(6) → 90x = 15).

export interface Fraction {
  /** Numerator, carries the sign. */
  n: bigint;
  /** Denominator, always > 0. */
  d: bigint;
}

const abs = (x: bigint) => (x < 0n ? -x : x);

export function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return abs(a / gcd(a, b) * b);
}

/** Lowest terms, positive denominator. Throws on a zero denominator. */
export function simplify(f: Fraction): Fraction {
  if (f.d === 0n) throw new RangeError('Zero denominator');
  if (f.n === 0n) return { n: 0n, d: 1n };
  const g = gcd(f.n, f.d);
  const sign = f.d < 0n ? -1n : 1n;
  return { n: (sign * f.n) / g, d: (sign * f.d) / g };
}

export const frac = (n: bigint | number, d: bigint | number = 1n): Fraction => simplify({ n: BigInt(n), d: BigInt(d) });

export function equals(a: Fraction, b: Fraction): boolean {
  const x = simplify(a);
  const y = simplify(b);
  return x.n === y.n && x.d === y.d;
}

/** "3/8", "-3/8", "2". */
export function formatFraction(f: Fraction): string {
  return f.d === 1n ? String(f.n) : `${f.n}/${f.d}`;
}

export interface MixedParts {
  negative: boolean;
  whole: bigint;
  /** Remainder numerator (≥ 0). */
  n: bigint;
  d: bigint;
}

export function toMixed(f: Fraction): MixedParts {
  const s = simplify(f);
  const negative = s.n < 0n;
  const a = abs(s.n);
  return { negative, whole: a / s.d, n: a % s.d, d: s.d };
}

/** "2 1/4", "-2 1/4", "3/4", "5". */
export function formatMixed(f: Fraction): string {
  const m = toMixed(f);
  const sign = m.negative ? '-' : '';
  if (m.n === 0n) return `${sign}${m.whole}`;
  if (m.whole === 0n) return `${sign}${m.n}/${m.d}`;
  return `${sign}${m.whole} ${m.n}/${m.d}`;
}

/* ---------- Parsing ---------- */

export type InputKind = 'integer' | 'fraction' | 'mixed' | 'decimal' | 'repeating';

export type ParseResult =
  | { ok: true; value: Fraction; kind: InputKind; /** Unsimplified as typed, e.g. 6/8 stays 6/8. */ raw: Fraction }
  | { ok: false; error: 'empty' | 'zero-denominator' | 'invalid' | 'too-long' };

const MAX_DIGITS = 30;

/** Repeating decimal digits → fraction: int.nonRep(rep). */
export function repeatingToFraction(intPart: string, nonRep: string, rep: string, negative = false): Fraction {
  const all = BigInt(`${intPart || '0'}${nonRep}${rep}` || '0');
  const head = BigInt(`${intPart || '0'}${nonRep}` || '0');
  const n = rep ? all - head : head;
  const d = rep ? (10n ** BigInt(rep.length) - 1n) * 10n ** BigInt(nonRep.length) : 10n ** BigInt(nonRep.length);
  const f = simplify({ n, d });
  return negative ? { n: -f.n, d: f.d } : f;
}

/**
 * Guess the repeating block of a decimal typed with a trailing "...": the shortest block that appears at least
 * twice at the end ("0.333..." → 3, "0.1666..." → 6 after 1, "0.142857142857..." → 142857). Null if none.
 */
export function detectRepeat(digits: string): { nonRep: string; rep: string } | null {
  for (let p = 1; p * 2 <= digits.length; p++) {
    const unit = digits.slice(-p);
    if (digits.slice(-2 * p, -p) !== unit) continue;
    // Walk left while the pattern continues, so the non-repeating head is as short as possible.
    let start = digits.length - 2 * p;
    while (start > 0 && digits[start - 1] === digits[start - 1 + p]) start--;
    return { nonRep: digits.slice(0, start), rep: digits.slice(start, start + p) };
  }
  return null;
}

export function parseFraction(input: string): ParseResult {
  const s = input
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/[⁄∕÷]/g, '/')
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/_/g, ' ');
  if (s === '') return { ok: false, error: 'empty' };
  if (s.replace(/\D/g, '').length > MAX_DIGITS) return { ok: false, error: 'too-long' };

  let m = /^([+-]?)(\d+)$/.exec(s);
  if (m) {
    const v = frac(BigInt(m[2]) * (m[1] === '-' ? -1n : 1n));
    return { ok: true, value: v, kind: 'integer', raw: v };
  }
  m = /^([+-]?)(\d+)\/([+-]?)(\d+)$/.exec(s);
  if (m) {
    const d = BigInt(m[4]);
    if (d === 0n) return { ok: false, error: 'zero-denominator' };
    const negative = (m[1] === '-') !== (m[3] === '-');
    const raw = { n: BigInt(m[2]) * (negative ? -1n : 1n), d };
    return { ok: true, value: simplify(raw), kind: 'fraction', raw };
  }
  m = /^([+-]?)(\d+) (\d+)\/(\d+)$/.exec(s);
  if (m) {
    const d = BigInt(m[4]);
    if (d === 0n) return { ok: false, error: 'zero-denominator' };
    const n = BigInt(m[2]) * d + BigInt(m[3]);
    const raw = { n: m[1] === '-' ? -n : n, d };
    return { ok: true, value: simplify(raw), kind: 'mixed', raw };
  }
  // Decimal, optionally with a repeating block in parentheses (0.1(6)) or a trailing ellipsis (0.333...).
  m = /^([+-]?)(\d*)\.(\d*)(?:\((\d+)\)|(\.\.\.|…))?$/.exec(s);
  if (m && (m[2] || m[3] || m[4])) {
    const negative = m[1] === '-';
    let nonRep = m[3];
    let rep = m[4] ?? '';
    if (m[5]) {
      const found = detectRepeat(nonRep);
      if (found) ({ nonRep, rep } = found);
    }
    const value = repeatingToFraction(m[2], nonRep, rep, negative);
    const kind: InputKind = rep ? 'repeating' : 'decimal';
    const raw =
      kind === 'decimal'
        ? { n: BigInt(`${m[2] || '0'}${nonRep}`) * (negative ? -1n : 1n), d: 10n ** BigInt(nonRep.length) }
        : value;
    return { ok: true, value, kind, raw };
  }
  return { ok: false, error: 'invalid' };
}

/* ---------- Decimal expansion ---------- */

export interface DecimalExpansion {
  negative: boolean;
  intPart: string;
  nonRepeat: string;
  repeat: string;
  /** True when the repeating block was longer than the limit and the digits were cut off. */
  truncated: boolean;
}

export function toDecimal(f: Fraction, maxDigits = 60): DecimalExpansion {
  const s = simplify(f);
  const negative = s.n < 0n;
  const a = abs(s.n);
  const intPart = (a / s.d).toString();
  let r = a % s.d;
  const digits: string[] = [];
  const seen = new Map<bigint, number>();
  while (r !== 0n && !seen.has(r) && digits.length < maxDigits) {
    seen.set(r, digits.length);
    r *= 10n;
    digits.push((r / s.d).toString());
    r %= s.d;
  }
  if (r === 0n) return { negative, intPart, nonRepeat: digits.join(''), repeat: '', truncated: false };
  if (seen.has(r)) {
    const at = seen.get(r)!;
    return { negative, intPart, nonRepeat: digits.slice(0, at).join(''), repeat: digits.slice(at).join(''), truncated: false };
  }
  return { negative, intPart, nonRepeat: digits.join(''), repeat: '', truncated: true };
}

/** "0.1(6)" style text; "0.375"; "-2"; truncated expansions end with "…". */
export function formatDecimal(e: DecimalExpansion): string {
  const sign = e.negative ? '-' : '';
  const frac = e.nonRepeat + (e.repeat ? `(${e.repeat})` : '') + (e.truncated ? '…' : '');
  return frac ? `${sign}${e.intPart}.${frac}` : `${sign}${e.intPart}`;
}

/** Rounded decimal for display, e.g. 0.1666… → "0.166667". */
export function approxDecimal(f: Fraction, digits = 6): string {
  const s = simplify(f);
  const scale = 10n ** BigInt(digits);
  const negative = s.n < 0n;
  const scaled = (abs(s.n) * scale * 2n + s.d) / (2n * s.d); // round half up
  const intPart = scaled / scale;
  const fracPart = (scaled % scale).toString().padStart(digits, '0').replace(/0+$/, '');
  const text = fracPart ? `${intPart}.${fracPart}` : `${intPart}`;
  return negative && scaled !== 0n ? `-${text}` : text;
}

/* ---------- Arithmetic with steps ---------- */

export type Operator = '+' | '-' | '×' | '÷';

export const OPERATORS: readonly Operator[] = ['+', '-', '×', '÷'];

export function add(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}
export function subtract(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}
export function multiply(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}
export function divide(a: Fraction, b: Fraction): Fraction | null {
  if (b.n === 0n) return null;
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}

export type CalcResult = { ok: true; value: Fraction; steps: string[] } | { ok: false; error: 'divide-by-zero' };

const paren = (f: Fraction) => (f.n < 0n ? `(${formatFraction(f)})` : formatFraction(f));

function simplifySteps(n: bigint, d: bigint, steps: string[]): Fraction {
  const result = simplify({ n, d });
  const g = gcd(n, d);
  if (n === 0n) steps.push('The numerator is 0, so the result is 0.');
  else if (g > 1n) steps.push(`Simplify: the greatest common factor of ${abs(n)} and ${abs(d)} is ${g}, so ${n}/${d} = ${formatFraction(result)}.`);
  else if (d !== 1n) steps.push(`${n}/${d} is already in lowest terms.`);
  const m = toMixed(result);
  if (m.whole !== 0n && m.n !== 0n) steps.push(`As a mixed number: ${formatFraction(result)} = ${formatMixed(result)}.`);
  return result;
}

/**
 * a op b with school-style steps. `a` and `b` are the values as typed (mixed numbers already converted); the
 * caller passes the typed text so the first step can show the conversion.
 */
export function calculate(a: Fraction, op: Operator, b: Fraction, typed?: [string, string]): CalcResult {
  const steps: string[] = [];
  const A = simplify(a);
  const B = simplify(b);
  if (typed) {
    const conversions = [
      [typed[0], A],
      [typed[1], B],
    ] as const;
    const notes = conversions
      .filter(([text, f]) => text.trim() !== formatFraction(f))
      .map(([text, f]) => `${text.trim()} = ${formatFraction(f)}`);
    if (notes.length) steps.push(`Write each number as a simplified fraction: ${notes.join(', ')}.`);
  }

  if (op === '+' || op === '-') {
    const word = op === '+' ? 'Add' : 'Subtract';
    const lcd = lcm(A.d, B.d);
    const an = A.n * (lcd / A.d);
    const bn = B.n * (lcd / B.d);
    if (A.d === B.d) steps.push(`The denominators are already the same (${lcd}).`);
    else {
      steps.push(`Find the least common denominator of ${A.d} and ${B.d}: LCD = ${lcd}.`);
      steps.push(`Rewrite both fractions over ${lcd}: ${formatFraction(A)} = ${an}/${lcd} and ${formatFraction(B)} = ${bn}/${lcd}.`);
    }
    const n = op === '+' ? an + bn : an - bn;
    steps.push(`${word} the numerators: ${an}/${lcd} ${op === '+' ? '+' : '−'} ${bn < 0n ? `(${bn})` : bn}/${lcd} = ${n}/${lcd}.`);
    return { ok: true, value: simplifySteps(n, lcd, steps), steps };
  }

  let right = B;
  if (op === '÷') {
    if (B.n === 0n) return { ok: false, error: 'divide-by-zero' };
    right = simplify({ n: B.d, d: B.n });
    steps.push(`To divide, multiply by the reciprocal of the second fraction: ${paren(A)} ÷ ${paren(B)} = ${paren(A)} × ${paren(right)}.`);
  }
  const n = A.n * right.n;
  const d = A.d * right.d;
  steps.push(`Multiply the numerators and the denominators: (${A.n} × ${right.n}) / (${A.d} × ${right.d}) = ${n}/${d}.`);
  return { ok: true, value: simplifySteps(n, d, steps), steps };
}

/** Steps for turning a typed decimal into a fraction. */
export function decimalToFractionSteps(input: string): { value: Fraction; steps: string[] } | null {
  const p = parseFraction(input);
  if (!p.ok || (p.kind !== 'decimal' && p.kind !== 'repeating')) return null;
  const steps: string[] = [];
  if (p.kind === 'decimal') {
    const places = p.raw.d.toString().length - 1;
    steps.push(`${input.trim()} has ${places} decimal place${places === 1 ? '' : 's'}, so write it over ${p.raw.d}: ${p.raw.n}/${p.raw.d}.`);
    const g = gcd(p.raw.n, p.raw.d);
    if (g > 1n) steps.push(`Divide both by their greatest common factor, ${g}: ${formatFraction(p.value)}.`);
    else steps.push(`${p.raw.n}/${p.raw.d} is already in lowest terms.`);
  } else if (toDecimal(p.value).repeat === '') {
    steps.push(`A block of 9s that repeats forever equals the next value up, so ${input.trim()} = ${formatFraction(p.value)} exactly.`);
  } else {
    const e = toDecimal(p.value);
    const k = e.nonRepeat.length;
    const r = e.repeat.length;
    const big = 10n ** BigInt(k + r);
    const small = 10n ** BigInt(k);
    steps.push(`Let x = ${formatDecimal(e)}. The repeating block "${e.repeat}" has ${r} digit${r === 1 ? '' : 's'}.`);
    steps.push(
      k > 0
        ? `Multiply by ${big} and by ${small} so the repeating parts line up, then subtract: ${big - small}x = ${p.value.n * (big - small) / p.value.d}.`
        : `Multiply by ${big} and subtract x: ${big - 1n}x = ${p.value.n * (big - 1n) / p.value.d}.`,
    );
    steps.push(`Solve and simplify: x = ${formatFraction(p.value)}.`);
  }
  if (toMixed(p.value).whole !== 0n && toMixed(p.value).n !== 0n) steps.push(`As a mixed number: ${formatMixed(p.value)}.`);
  return { value: p.value, steps };
}

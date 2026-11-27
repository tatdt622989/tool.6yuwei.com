// Roman numeral converter. Pure functions.
//
// Standard (subtractive) form, 1–3999: I V X L C D M with the six subtractive pairs IV IX XL XC CD CM, no
// symbol repeated more than three times (Encyclopaedia Britannica, "Roman numeral"; Unicode Standard §22.3
// Number Forms). Zero and negatives have no Roman numeral.
// Large numbers use the vinculum: a bar over a numeral multiplies it by 1,000 (Britannica). We write the bar
// with U+0305 COMBINING OVERLINE after each letter and, as most modern converters do, keep M for the thousands
// up to 3,999 and use the bar only from 4,000: 4,000 = I̅V̅, 3,999,999 = M̅M̅M̅C̅M̅X̅C̅I̅X̅CMXCIX.

export const MAX_STANDARD = 3999;
export const MAX_VINCULUM = 3_999_999;
export const OVERLINE = '\u0305';

const PAIRS: readonly [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

const VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** 1–3999 → standard Roman numeral. */
export function toRomanBasic(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > MAX_STANDARD) throw new RangeError(`Out of range: ${n}`);
  let rest = n;
  let out = '';
  for (const [value, symbol] of PAIRS) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

export function overline(s: string): string {
  return [...s].map((ch) => ch + OVERLINE).join('');
}

export type ToRomanError = 'not-integer' | 'zero' | 'negative' | 'too-large';

export type ToRomanResult = { ok: true; roman: string; vinculum: boolean } | { ok: false; error: ToRomanError };

export function toRoman(n: number, allowVinculum = false): ToRomanResult {
  if (!Number.isFinite(n) || !Number.isInteger(n)) return { ok: false, error: 'not-integer' };
  if (n === 0) return { ok: false, error: 'zero' };
  if (n < 0) return { ok: false, error: 'negative' };
  if (n <= MAX_STANDARD) return { ok: true, roman: toRomanBasic(n), vinculum: false };
  if (!allowVinculum || n > MAX_VINCULUM) return { ok: false, error: 'too-large' };
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  return { ok: true, roman: overline(toRomanBasic(thousands)) + (rest ? toRomanBasic(rest) : ''), vinculum: true };
}

/** Step-by-step breakdown, e.g. 1994 → [[1000,'M'],[900,'CM'],[90,'XC'],[4,'IV']], 3000 → [[3000,'MMM']]. */
export function breakdown(n: number): [number, string][] {
  const parts: { value: number; unit: string; text: string }[] = [];
  const add = (value: number, scale: number) => {
    let rest = value;
    for (const [v, symbol] of PAIRS) {
      const unit = scale === 1 ? symbol : overline(symbol);
      while (rest >= v) {
        const last = parts[parts.length - 1];
        if (last && last.unit === unit) {
          last.value += v * scale;
          last.text += unit;
        } else parts.push({ value: v * scale, unit, text: unit });
        rest -= v;
      }
    }
  };
  if (n > MAX_STANDARD) {
    add(Math.floor(n / 1000), 1000);
    add(n % 1000, 1);
  } else add(n, 1);
  return parts.map((p) => [p.value, p.text]);
}

export type ParseError = 'empty' | 'invalid-char' | 'malformed';

export type ParseResult =
  | { ok: true; value: number; canonical: string }
  | { ok: false; error: ParseError; /** Value under a lenient reading, when one exists. */ guess?: number; suggestion?: string; badChar?: string };

/** Normalize user input: trim, uppercase, unify overline marks (U+0305, U+0304 macron, U+203E), drop spaces. */
export function normalizeRoman(input: string): string {
  return input
    .normalize('NFKD') // also turns Unicode numerals like Ⅻ into XII, and Ī into I + combining macron
    .replace(/\s+/g, '')
    .replace(/[̄‾¯]/g, OVERLINE)
    .toUpperCase();
}

interface Token {
  value: number;
}

function tokenize(s: string): { tokens: Token[]; badChar?: string } {
  const tokens: Token[] = [];
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const base = VALUES[ch];
    if (base === undefined) return { tokens, badChar: ch === OVERLINE ? '‾' : ch };
    if (chars[i + 1] === OVERLINE) {
      tokens.push({ value: base * 1000 });
      i++;
    } else tokens.push({ value: base });
  }
  return { tokens };
}

/** Lenient value: subtract a symbol when a larger one follows (so IIII = 4, IC = 99, VX = 5). */
function lenientValue(tokens: Token[]): number {
  let total = 0;
  for (let i = 0; i < tokens.length; i++) {
    const v = tokens[i].value;
    const next = tokens[i + 1]?.value ?? 0;
    total += v < next ? -v : v;
  }
  return total;
}

/**
 * Strict parse: accepts only the canonical form this converter produces (so "IIII", "IC", "VV", "MMMM" are
 * rejected) and, for malformed input, suggests the canonical numeral of its lenient value.
 */
export function parseRoman(input: string): ParseResult {
  const s = normalizeRoman(input);
  if (s === '') return { ok: false, error: 'empty' };
  const { tokens, badChar } = tokenize(s);
  if (badChar !== undefined) return { ok: false, error: 'invalid-char', badChar };
  const guess = lenientValue(tokens);
  if (guess >= 1 && guess <= MAX_VINCULUM) {
    const canonical = toRoman(guess, true);
    if (canonical.ok && canonical.roman === s) return { ok: true, value: guess, canonical: canonical.roman };
    // 1000–3999 written with barred I (e.g. I̅ for 1000) is also accepted by some; we treat it as non-standard.
    return { ok: false, error: 'malformed', guess, suggestion: canonical.ok ? canonical.roman : undefined };
  }
  return { ok: false, error: 'malformed' };
}

/** True when the text looks like a number rather than a numeral (digits, separators). */
export function looksNumeric(input: string): boolean {
  return /^\s*[+-]?[\d,.\s]+\s*$/.test(input) && /\d/.test(input);
}

/** "2,026" → 2026; NaN unless a plain integer. */
export function parseInteger(input: string): number {
  const s = input.replace(/[,\s_]/g, '');
  if (!/^[+-]?\d+(\.0+)?$/.test(s)) return /^[+-]?\d*\.\d+$/.test(s) ? Number(s) : Number.NaN;
  return Number(s);
}

/** Reference table rows for the page. */
export const COMMON_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 19, 20, 25, 30, 40, 50, 90, 100, 400, 500, 900, 1000];

export type DateOrder = 'mdy' | 'dmy' | 'ymd';

/** "2026-10-29" + order → Roman date, e.g. 'mdy' → 'X.XXIX.MMXXVI'. Null for an invalid date or year > 3999. */
export function dateToRoman(isoDate: string, order: DateOrder = 'mdy', separator = '.'): string | null {
  const m = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(isoDate.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1 || y > MAX_STANDARD || mo < 1 || mo > 12 || d < 1) return null;
  const daysInMonth = new Date(Date.UTC(2000, mo, 0)).getUTCDate() - (mo === 2 && !isLeap(y) ? 1 : 0);
  if (d > daysInMonth) return null;
  const parts = { y: toRomanBasic(y), m: toRomanBasic(mo), d: toRomanBasic(d) };
  const seq = order === 'mdy' ? [parts.m, parts.d, parts.y] : order === 'dmy' ? [parts.d, parts.m, parts.y] : [parts.y, parts.m, parts.d];
  return seq.join(separator);
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

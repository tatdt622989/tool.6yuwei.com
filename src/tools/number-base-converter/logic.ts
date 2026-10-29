// Integer base conversion with BigInt, so values beyond 2^53 stay exact.

export const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

export const MIN_BASE = 2;
export const MAX_BASE = 36;

/** Validation messages from parseInBase (zh defaults; the UI passes its locale's copy). */
export interface ParseMessages {
  badBase: string;
  empty: string;
  /** {ch} {base} {allowed} */
  badDigit: string;
  /** {max} — allowed digits for bases up to 10 */
  allowedDigits: string;
  /** {max} — allowed digits for bases above 10 */
  allowedLetters: string;
}

export const ZH_MESSAGES: ParseMessages = {
  badBase: '進位必須介於 2 到 36',
  empty: '請輸入數字',
  badDigit: '「{ch}」不是 {base} 進位的數字（只能用 {allowed}）',
  allowedDigits: '0–{max}',
  allowedLetters: '0–9 與 A–{max}',
};

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

export type ParseResult = { ok: true; value: bigint } | { ok: false; error: string };

const PREFIX: Record<string, number> = { '0b': 2, '0o': 8, '0x': 16 };

/** Removes the separators people paste: spaces, underscores, commas, apostrophes. */
export function stripSeparators(input: string): string {
  return input.replace(/[\s_,'，]/g, '');
}

/**
 * Parses a signed integer written in `base` (2–36). Accepts an optional sign, a 0b / 0o / 0x
 * prefix matching the base, separators, and upper- or lower-case letters.
 */
export function parseInBase(input: string, base: number, messages: ParseMessages = ZH_MESSAGES): ParseResult {
  if (!Number.isInteger(base) || base < MIN_BASE || base > MAX_BASE) return { ok: false, error: messages.badBase };
  let s = stripSeparators(input).toLowerCase();
  if (s === '') return { ok: false, error: messages.empty };
  let negative = false;
  if (s[0] === '-' || s[0] === '+') {
    negative = s[0] === '-';
    s = s.slice(1);
  }
  const prefix = s.slice(0, 2);
  if (PREFIX[prefix] === base && s.length > 2) s = s.slice(2);
  if (s === '') return { ok: false, error: messages.empty };

  const big = BigInt(base);
  let value = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) {
      const allowed =
        base <= 10
          ? fill(messages.allowedDigits, { max: base - 1 })
          : fill(messages.allowedLetters, { max: DIGITS[base - 1].toUpperCase() });
      return { ok: false, error: fill(messages.badDigit, { ch: ch.toUpperCase(), base, allowed }) };
    }
    value = value * big + BigInt(d);
  }
  return { ok: true, value: negative ? -value : value };
}

export function toBase(value: bigint, base: number, upper = true): string {
  const s = value.toString(base);
  return upper ? s.toUpperCase() : s;
}

/** Inserts a separator every `size` digits counting from the right, keeping the sign in front. */
export function groupDigits(text: string, size: number, sep = ' '): string {
  if (size <= 0) return text;
  const sign = text.startsWith('-') ? '-' : '';
  const body = sign ? text.slice(1) : text;
  const parts: string[] = [];
  for (let end = body.length; end > 0; end -= size) parts.unshift(body.slice(Math.max(0, end - size), end));
  return sign + parts.join(sep);
}

/** Left-pads a binary/hex string to a multiple of `size` digits (e.g. whole nibbles). */
export function padTo(text: string, size: number): string {
  const rem = text.length % size;
  return rem === 0 ? text : '0'.repeat(size - rem) + text;
}

export const BIT_WIDTHS = [8, 16, 32, 64] as const;
export type BitWidth = (typeof BIT_WIDTHS)[number];

export interface TwosComplement {
  bits: BitWidth;
  /** Value fits as a signed or unsigned integer of this width. */
  fits: boolean;
  /** Bit pattern (value mod 2^bits), padded to the full width. */
  binary: string;
  hex: string;
  /** Same bit pattern read as unsigned and as signed (two's complement). */
  unsigned: bigint;
  signed: bigint;
}

/**
 * Two's complement view: the n-bit pattern that stores `value`. Negative values wrap
 * (-1 → 1111…1). A pattern with the top bit set reads as negative when signed (0xFF → -1 in 8 bits).
 */
export function twosComplement(value: bigint, bits: BitWidth): TwosComplement {
  const size = 1n << BigInt(bits);
  const unsigned = ((value % size) + size) % size;
  const signed = unsigned >= size >> 1n ? unsigned - size : unsigned;
  const min = -(size >> 1n);
  return {
    bits,
    fits: value >= min && value < size,
    binary: unsigned.toString(2).padStart(bits, '0'),
    hex: unsigned.toString(16).toUpperCase().padStart(bits / 4, '0'),
    unsigned,
    signed,
  };
}

/** Number of bits needed for |value| (0 needs 1 bit). */
export function bitLength(value: bigint): number {
  const abs = value < 0n ? -value : value;
  return abs === 0n ? 1 : abs.toString(2).length;
}

export function popCount(value: bigint): number {
  const abs = value < 0n ? -value : value;
  let n = 0;
  for (const ch of abs.toString(2)) if (ch === '1') n++;
  return n;
}

/** Display formatting for one base, optionally grouped (binary/hex by 4, decimal by 3). */
export function formatInBase(value: bigint, base: number, opts: { group: boolean; upper: boolean }): string {
  const raw = toBase(value, base, opts.upper);
  if (!opts.group) return raw;
  if (base === 10) return groupDigits(raw, 3, ',');
  if (base === 2 || base === 16) {
    const sign = raw.startsWith('-') ? '-' : '';
    const body = sign ? raw.slice(1) : raw;
    return sign + groupDigits(padTo(body, 4), 4);
  }
  if (base === 8) return groupDigits(raw, 3);
  return raw;
}

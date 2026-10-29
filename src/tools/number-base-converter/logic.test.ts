import { describe, expect, it } from 'vitest';
import { bitLength, formatInBase, groupDigits, padTo, parseInBase, popCount, toBase, twosComplement } from './logic';

function parsed(input: string, base: number): bigint {
  const r = parseInBase(input, base);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe('parseInBase', () => {
  it('parses the common bases', () => {
    expect(parsed('1010', 2)).toBe(10n);
    expect(parsed('777', 8)).toBe(511n);
    expect(parsed('255', 10)).toBe(255n);
    expect(parsed('ff', 16)).toBe(255n);
    expect(parsed('FF', 16)).toBe(255n);
    expect(parsed('z', 36)).toBe(35n);
    expect(parsed('10', 36)).toBe(36n);
  });

  it('accepts prefixes, signs and separators', () => {
    expect(parsed('0x1F', 16)).toBe(31n);
    expect(parsed('0b1111_0000', 2)).toBe(240n);
    expect(parsed('0o17', 8)).toBe(15n);
    expect(parsed('-0xff', 16)).toBe(-255n);
    expect(parsed('+42', 10)).toBe(42n);
    expect(parsed('1,234,567', 10)).toBe(1234567n);
    expect(parsed('1010 0101', 2)).toBe(165n);
  });

  it('does not strip a 0x prefix outside base 16', () => {
    // In base 36 "0x" is just the digits 0 and x.
    expect(parsed('0x', 36)).toBe(33n);
  });

  it('stays exact beyond Number.MAX_SAFE_INTEGER', () => {
    expect(parsed('18446744073709551615', 10)).toBe(2n ** 64n - 1n);
    expect(toBase(parsed('ffffffffffffffffffff', 16), 10)).toBe('1208925819614629174706175');
    expect(parsed('9007199254740993', 10)).toBe(9007199254740993n);
  });

  it('explains invalid digits', () => {
    const r = parseInBase('102', 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('「2」不是 2 進位');
    const h = parseInBase('fg', 16);
    if (!h.ok) expect(h.error).toContain('A–F');
    else throw new Error('should fail');
    expect(parseInBase('', 10).ok).toBe(false);
    expect(parseInBase('-', 10).ok).toBe(false);
  });

  it('uses localized messages', () => {
    const en = {
      badBase: 'Base must be 2–36',
      empty: 'Enter a number',
      badDigit: '"{ch}" is not a base-{base} digit (use {allowed})',
      allowedDigits: '0–{max}',
      allowedLetters: '0–9 and A–{max}',
    };
    expect(parseInBase('102', 2, en)).toEqual({ ok: false, error: '"2" is not a base-2 digit (use 0–1)' });
    expect(parseInBase('fg', 16, en)).toEqual({ ok: false, error: '"G" is not a base-16 digit (use 0–9 and A–F)' });
    expect(parseInBase('', 10, en)).toEqual({ ok: false, error: 'Enter a number' });
    expect(parseInBase('1', 40, en)).toEqual({ ok: false, error: 'Base must be 2–36' });
    expect(parseInBase('1.5', 10).ok).toBe(false);
    expect(parseInBase('1', 37).ok).toBe(false);
    expect(parseInBase('1', 1).ok).toBe(false);
  });
});

describe('toBase / formatInBase', () => {
  it('converts in both directions', () => {
    expect(toBase(255n, 2)).toBe('11111111');
    expect(toBase(255n, 16)).toBe('FF');
    expect(toBase(255n, 16, false)).toBe('ff');
    expect(toBase(-10n, 2)).toBe('-1010');
    expect(toBase(0n, 8)).toBe('0');
  });

  it('groups digits per base', () => {
    const opts = { group: true, upper: true };
    expect(formatInBase(1234567n, 10, opts)).toBe('1,234,567');
    expect(formatInBase(165n, 2, opts)).toBe('1010 0101');
    expect(formatInBase(5n, 2, opts)).toBe('0101');
    expect(formatInBase(0xdeadbeefn, 16, opts)).toBe('DEAD BEEF');
    expect(formatInBase(-0x1ffn, 16, opts)).toBe('-01FF');
    expect(formatInBase(511n, 8, opts)).toBe('777');
    expect(formatInBase(4095n, 8, opts)).toBe('7 777');
    expect(formatInBase(165n, 2, { group: false, upper: true })).toBe('10100101');
  });

  it('round-trips grouped output through the parser', () => {
    for (const base of [2, 8, 10, 16]) {
      const text = formatInBase(-987654321987654321n, base, { group: true, upper: true });
      expect(parsed(text, base)).toBe(-987654321987654321n);
    }
  });

  it('groupDigits and padTo helpers', () => {
    expect(groupDigits('1234567', 3, ',')).toBe('1,234,567');
    expect(groupDigits('-123', 3, ',')).toBe('-123');
    expect(padTo('101', 4)).toBe('0101');
    expect(padTo('1010', 4)).toBe('1010');
  });
});

describe('twosComplement', () => {
  it('encodes negative numbers', () => {
    const t = twosComplement(-1n, 8);
    expect(t.binary).toBe('11111111');
    expect(t.hex).toBe('FF');
    expect(t.unsigned).toBe(255n);
    expect(t.signed).toBe(-1n);
    expect(t.fits).toBe(true);
    expect(twosComplement(-128n, 8).binary).toBe('10000000');
    expect(twosComplement(-42n, 16).hex).toBe('FFD6');
    expect(twosComplement(-1n, 64).hex).toBe('FFFFFFFFFFFFFFFF');
  });

  it('reads patterns with the top bit set as negative', () => {
    const t = twosComplement(200n, 8);
    expect(t.signed).toBe(-56n);
    expect(t.unsigned).toBe(200n);
    expect(twosComplement(0x80000000n, 32).signed).toBe(-2147483648n);
  });

  it('keeps positive values that fit as-is', () => {
    const t = twosComplement(5n, 8);
    expect(t.binary).toBe('00000101');
    expect(t.signed).toBe(5n);
  });

  it('flags overflow and wraps modulo 2^n', () => {
    expect(twosComplement(256n, 8).fits).toBe(false);
    expect(twosComplement(256n, 8).unsigned).toBe(0n);
    expect(twosComplement(-129n, 8).fits).toBe(false);
    expect(twosComplement(-129n, 8).signed).toBe(127n);
    expect(twosComplement(255n, 8).fits).toBe(true);
  });
});

describe('bit statistics', () => {
  it('bitLength and popCount', () => {
    expect(bitLength(0n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(256n)).toBe(9);
    expect(bitLength(-8n)).toBe(4);
    expect(popCount(255n)).toBe(8);
    expect(popCount(0b1010n)).toBe(2);
  });
});

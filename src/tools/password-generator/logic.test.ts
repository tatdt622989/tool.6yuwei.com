import { describe, expect, it } from 'vitest';
import { entropyBits, generatePassword, strengthOf, type PasswordOptions } from './logic';

const base: PasswordOptions = {
  length: 16,
  upper: true,
  lower: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

describe('generatePassword', () => {
  it('respects the requested length', () => {
    expect(generatePassword(base)).toHaveLength(16);
    expect(generatePassword({ ...base, length: 64 })).toHaveLength(64);
  });

  it('includes every selected character set', () => {
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword({ ...base, length: 4 });
      expect(pw).toMatch(/[A-Z]/);
      expect(pw).toMatch(/[a-z]/);
      expect(pw).toMatch(/[0-9]/);
      expect(pw).toMatch(/[^A-Za-z0-9]/);
    }
  });

  it('uses only digits when only digits are selected', () => {
    const pw = generatePassword({ ...base, upper: false, lower: false, symbols: false });
    expect(pw).toMatch(/^[0-9]{16}$/);
  });

  it('excludes ambiguous characters', () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePassword({ ...base, length: 64, excludeAmbiguous: true })).not.toMatch(/[O0oIl1|]/);
    }
  });

  it('returns empty string with no sets selected', () => {
    expect(generatePassword({ ...base, upper: false, lower: false, digits: false, symbols: false })).toBe('');
  });

  it('is deterministic with an injected random source', () => {
    const zero = (a: Uint32Array) => a.fill(0);
    expect(generatePassword({ ...base, upper: false, symbols: false, digits: false, length: 5 }, zero)).toBe('aaaaa');
  });
});

describe('strength', () => {
  it('grows with length and pool size', () => {
    expect(entropyBits({ ...base, length: 8 })).toBeLessThan(entropyBits(base));
    expect(strengthOf(entropyBits({ ...base, length: 6, upper: false, symbols: false, lower: false }))).toBe('weak');
    expect(strengthOf(entropyBits({ ...base, length: 20 }))).toBe('very-strong');
  });
});

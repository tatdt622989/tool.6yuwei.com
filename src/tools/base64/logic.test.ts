import { describe, expect, it } from 'vitest';
import { base64ToBytes, bytesToBase64, decodeText, encodeText, toHex } from './logic';

const std = { urlSafe: false, noPadding: false };

describe('encodeText', () => {
  it('matches RFC 4648 test vectors', () => {
    const vectors: [string, string][] = [
      ['', ''],
      ['f', 'Zg=='],
      ['fo', 'Zm8='],
      ['foo', 'Zm9v'],
      ['foob', 'Zm9vYg=='],
      ['fooba', 'Zm9vYmE='],
      ['foobar', 'Zm9vYmFy'],
    ];
    for (const [plain, encoded] of vectors) expect(encodeText(plain, std)).toBe(encoded);
  });

  it('encodes UTF-8 text (Chinese and emoji)', () => {
    expect(encodeText('中文', std)).toBe('5Lit5paH');
    expect(encodeText('😀', std)).toBe('8J+YgA==');
    expect(encodeText('中文😀', std)).toBe(Buffer.from('中文😀').toString('base64'));
  });

  it('supports URL-safe alphabet and no padding', () => {
    expect(encodeText('😀', { urlSafe: true, noPadding: false })).toBe('8J-YgA==');
    expect(encodeText('😀', { urlSafe: true, noPadding: true })).toBe('8J-YgA');
    expect(bytesToBase64(new Uint8Array([0xfb, 0xff]), { urlSafe: true, noPadding: true })).toBe('-_8');
  });
});

describe('decodeText', () => {
  it('round-trips arbitrary text', () => {
    const text = 'Hello, 世界！\n第二行 ✓';
    const r = decodeText(encodeText(text));
    expect(r.ok && r.text).toBe(text);
  });

  it('accepts URL-safe input, missing padding and whitespace', () => {
    expect(decodeText('8J-YgA')).toMatchObject({ ok: true, text: '😀' });
    expect(decodeText('5Lit\n5paH ')).toMatchObject({ ok: true, text: '中文' });
  });

  it('rejects invalid characters and impossible lengths', () => {
    expect(decodeText('abc$').ok).toBe(false);
    expect(decodeText('A').ok).toBe(false);
    expect(decodeText('QQ===').ok).toBe(false);
  });

  it('reports binary data that is not UTF-8', () => {
    const r = decodeText('/9j/4A==');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain('UTF-8');
      expect(r.bytes?.length).toBe(4);
    }
  });

  it('decodes an empty string', () => {
    expect(decodeText('')).toMatchObject({ ok: true, text: '' });
  });
});

describe('helpers', () => {
  it('converts random bytes both ways', () => {
    for (let len = 0; len < 40; len++) {
      const bytes = Uint8Array.from({ length: len }, (_, i) => (i * 37 + len) & 0xff);
      const encoded = bytesToBase64(bytes);
      expect(encoded).toBe(Buffer.from(bytes).toString('base64'));
      expect(Array.from(base64ToBytes(encoded)!)).toEqual(Array.from(bytes));
    }
  });

  it('formats hex previews', () => {
    expect(toHex(new Uint8Array([0, 255, 16]))).toBe('00 ff 10');
    expect(toHex(new Uint8Array(5), 2)).toBe('00 00 …');
  });
});

import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { digest, findMatch, hashAll, md5, normalizeHash, toHex } from './logic';

const utf8 = (s: string) => new TextEncoder().encode(s);

describe('md5', () => {
  it('matches the RFC 1321 test suite', () => {
    const vectors: [string, string][] = [
      ['', 'd41d8cd98f00b204e9800998ecf8427e'],
      ['a', '0cc175b9c0f1b6a831c399e269772661'],
      ['abc', '900150983cd24fb0d6963f7d28e17f72'],
      ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
      ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
      ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'd174ab98d277d9f5a5611c2c9f419d9f'],
      ['12345678901234567890123456789012345678901234567890123456789012345678901234567890', '57edf4a22be3c955ac49da2e2107b67a'],
    ];
    for (const [input, expected] of vectors) expect(toHex(md5(utf8(input)))).toBe(expected);
  });

  it('agrees with Node for every length around block boundaries and UTF-8 text', () => {
    for (let len = 0; len <= 200; len++) {
      const bytes = Uint8Array.from({ length: len }, (_, i) => (i * 31 + len * 7) & 0xff);
      expect(toHex(md5(bytes))).toBe(createHash('md5').update(bytes).digest('hex'));
    }
    expect(toHex(md5(utf8('繁體中文 😀')))).toBe(createHash('md5').update('繁體中文 😀').digest('hex'));
  });
});

describe('digest', () => {
  it('computes SHA family hashes of "abc" (FIPS 180 examples)', async () => {
    const abc = utf8('abc');
    expect(toHex(await digest('SHA-1', abc))).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(toHex(await digest('SHA-256', abc))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(toHex(await digest('SHA-384', abc))).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
    expect(toHex(await digest('SHA-512', abc))).toBe(createHash('sha512').update('abc').digest('hex'));
  });

  it('hashes all algorithms at once', async () => {
    const all = await hashAll(utf8(''));
    expect(toHex(all.MD5)).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(toHex(all['SHA-256'])).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(Object.keys(all)).toHaveLength(5);
  });
});

describe('helpers', () => {
  it('formats hex in upper case', () => {
    expect(toHex(new Uint8Array([0xab, 0x01]), true)).toBe('AB01');
  });

  it('normalises pasted checksums', () => {
    expect(normalizeHash('  sha256:ABCD ef ')).toBe('abcdef');
  });

  it('finds the matching algorithm', () => {
    const digests = { MD5: '900150983cd24fb0d6963f7d28e17f72', 'SHA-1': 'a9993e364706816aba3e25717850c26c9cd0d89d' };
    expect(findMatch('900150983CD24FB0D6963F7D28E17F72', digests)).toBe('MD5');
    expect(findMatch('a9993e36 4706816a ba3e2571 7850c26c 9cd0d89d', digests)).toBe('SHA-1');
    expect(findMatch('deadbeef', digests)).toBeNull();
    expect(findMatch('', digests)).toBeNull();
  });
});

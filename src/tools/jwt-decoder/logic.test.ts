import { describe, expect, it } from 'vitest';
import {
  base64UrlToBytes,
  decodeJwt,
  durationParts,
  encodeSegment,
  formatDuration,
  timeClaimValue,
  tokenStatus,
} from './logic';

// The widely used HS256 example token from jwt.io.
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('decodeJwt', () => {
  it('decodes header, payload and signature', () => {
    const r = decodeJwt(SAMPLE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(r.jwt.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    expect(r.jwt.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(r.jwt.payloadJson).toContain('\n  "name": "John Doe"');
  });

  it('accepts a Bearer prefix and line breaks', () => {
    expect(decodeJwt(`Bearer ${SAMPLE.slice(0, 40)}\n${SAMPLE.slice(40)}`).ok).toBe(true);
  });

  it('decodes UTF-8 claims', () => {
    const token = `${encodeSegment({ alg: 'none' })}.${encodeSegment({ name: '王小明' })}.`;
    const r = decodeJwt(token);
    expect(r.ok && r.jwt.payload).toEqual({ name: '王小明' });
    expect(r.ok && r.jwt.signature).toBe('');
  });

  it('keeps non-JSON payloads as text', () => {
    const text = btoa('hello').replace(/=+$/, '');
    const r = decodeJwt(`${encodeSegment({ alg: 'HS256' })}.${text}.sig`);
    expect(r.ok && r.jwt.payloadIsJson).toBe(false);
    expect(r.ok && r.jwt.payload).toBe('hello');
  });

  it('explains structural errors', () => {
    expect(decodeJwt('')).toMatchObject({ ok: false });
    expect(decodeJwt('a.b')).toMatchObject({ ok: false, error: expect.stringContaining('2 段') });
    expect(decodeJwt('a.b')).toMatchObject({ code: 'segments', segments: 2 });
    expect(decodeJwt('  ')).toMatchObject({ code: 'empty' });
    expect(decodeJwt('a.b.c.d.e')).toMatchObject({ code: 'jwe' });
    expect(decodeJwt('!!!.e30.sig')).toMatchObject({ code: 'header' });
    expect(decodeJwt(`${encodeSegment({ alg: 'HS256' })}.@@.sig`)).toMatchObject({ code: 'payload' });
    expect(decodeJwt('a.b.c.d.e')).toMatchObject({ ok: false, error: expect.stringContaining('JWE') });
    expect(decodeJwt('!!!.e30.sig')).toMatchObject({ ok: false, error: expect.stringContaining('標頭') });
    expect(decodeJwt(`${encodeSegment([1])}.e30.sig`)).toMatchObject({ ok: false });
    expect(decodeJwt(`${encodeSegment({ alg: 'HS256' })}.@@.sig`)).toMatchObject({ ok: false, error: expect.stringContaining('酬載') });
  });
});

describe('tokenStatus', () => {
  const now = 1_700_000_000_000;
  it('detects valid, expired and not-yet-valid tokens', () => {
    expect(tokenStatus({ exp: 1_700_000_060 }, now)).toEqual({ state: 'valid', delta: 60 });
    expect(tokenStatus({ exp: 1_699_999_000 }, now)).toEqual({ state: 'expired', delta: -1000 });
    expect(tokenStatus({ exp: 1_700_000_000 }, now).state).toBe('expired');
    expect(tokenStatus({ nbf: 1_700_000_100, exp: 1_700_001_000 }, now)).toEqual({ state: 'not-yet-valid', delta: 100 });
  });

  it('handles missing or invalid exp', () => {
    expect(tokenStatus({}, now).state).toBe('no-expiry');
    expect(tokenStatus({ exp: '1700000000' }, now).state).toBe('no-expiry');
    expect(tokenStatus('text payload', now).state).toBe('no-expiry');
  });
});

describe('helpers', () => {
  it('formats durations with two units', () => {
    expect(formatDuration(0)).toBe('0 秒');
    expect(formatDuration(45)).toBe('45 秒');
    expect(formatDuration(-3725)).toBe('1 小時 2 分');
    expect(formatDuration(86405)).toBe('1 天');
    expect(formatDuration(2 * 86400 + 3 * 3600)).toBe('2 天 3 小時');
    expect(durationParts(0)).toEqual([{ n: 0, unit: 'second' }]);
    expect(durationParts(-3725)).toEqual([
      { n: 1, unit: 'hour' },
      { n: 2, unit: 'minute' },
    ]);
    expect(durationParts(86405)).toEqual([{ n: 1, unit: 'day' }]);
  });

  it('reads numeric time claims only', () => {
    expect(timeClaimValue({ iat: 5 }, 'iat')).toBe(5);
    expect(timeClaimValue({ iat: 'x' }, 'iat')).toBeUndefined();
  });

  it('decodes base64url with or without padding', () => {
    expect(Array.from(base64UrlToBytes('-_8')!)).toEqual([0xfb, 0xff]);
    expect(Array.from(base64UrlToBytes('-_8=')!)).toEqual([0xfb, 0xff]);
    expect(base64UrlToBytes('a')).toBeNull();
  });
});

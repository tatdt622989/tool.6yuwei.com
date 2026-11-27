import { describe, expect, it } from 'vitest';
import { clampCount, createV7Generator, formatUuid, parseUuid, uuidV4, type RandomBytes } from './logic';

const fill =
  (value: number): RandomBytes =>
  (bytes) =>
    bytes.fill(value);

/** Deterministic pseudo-random bytes for reproducible tests. */
function seeded(seed = 1): RandomBytes {
  let s = seed;
  return (bytes) => {
    for (let i = 0; i < bytes.length; i++) {
      s = (s * 1103515245 + 12345) >>> 0;
      bytes[i] = s >>> 24;
    }
    return bytes;
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidV4', () => {
  it('sets version and variant bits', () => {
    expect(uuidV4(fill(0xff))).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
    expect(uuidV4(fill(0x00))).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('uses the platform generator by default', () => {
    const id = uuidV4();
    expect(id).toMatch(UUID_RE);
    expect(id[14]).toBe('4');
  });
});

describe('createV7Generator', () => {
  it('encodes the Unix millisecond timestamp (RFC 9562 example time)', () => {
    const gen = createV7Generator(seeded(), () => 0x017f22e279b0);
    const id = gen();
    expect(id.startsWith('017f22e2-79b0-7')).toBe(true);
    expect(id).toMatch(UUID_RE);
    expect(parseUuid(id)).toMatchObject({ ok: true, info: { version: 7, timestamp: 1645557742000 } });
  });

  it('is strictly increasing within the same millisecond, including counter overflow', () => {
    const gen = createV7Generator(seeded(7), () => 1_700_000_000_000);
    const ids = Array.from({ length: 5000 }, gen);
    for (let i = 1; i < ids.length; i++) expect(ids[i] > ids[i - 1]).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('stays monotonic when the clock moves backwards', () => {
    let t = 2_000_000_000_000;
    const gen = createV7Generator(seeded(3), () => t);
    const a = gen();
    t -= 5000;
    const b = gen();
    expect(b > a).toBe(true);
  });

  it('works with the real clock and random source', () => {
    expect(createV7Generator()()).toMatch(UUID_RE);
  });
});

describe('formatUuid', () => {
  const id = '017f22e2-79b0-7cc3-98c4-dc0c0c07398f';
  it('applies case and hyphen options', () => {
    expect(formatUuid(id, { uppercase: true, hyphens: true })).toBe('017F22E2-79B0-7CC3-98C4-DC0C0C07398F');
    expect(formatUuid(id, { uppercase: false, hyphens: false })).toBe('017f22e279b07cc398c4dc0c0c07398f');
  });
});

describe('clampCount', () => {
  it('keeps the count within 1–100', () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(250)).toBe(100);
    expect(clampCount(12.7)).toBe(12);
    expect(clampCount(Number.NaN)).toBe(1);
  });
});

describe('parseUuid', () => {
  it('reads RFC 9562 test vectors for v1, v6 and v7', () => {
    const expected = Date.UTC(2022, 1, 22, 19, 22, 22);
    expect(parseUuid('C232AB00-9414-11EC-B3C8-9F6BDECED846')).toMatchObject({ ok: true, info: { version: 1, timestamp: expected } });
    expect(parseUuid('1EC9414C-232A-6B00-B3C8-9F6BDECED846')).toMatchObject({ ok: true, info: { version: 6, timestamp: expected } });
    expect(parseUuid('017F22E2-79B0-7CC3-98C4-DC0C0C07398F')).toMatchObject({ ok: true, info: { version: 7, timestamp: expected } });
  });

  it('accepts braces, urn prefix and no hyphens', () => {
    expect(parseUuid('{919108F7-52D1-4320-9BAC-F847DB4148A8}')).toMatchObject({ ok: true, info: { version: 4 } });
    expect(parseUuid('urn:uuid:919108f7-52d1-4320-9bac-f847db4148a8')).toMatchObject({ ok: true });
    const r = parseUuid('919108f752d143209bacf847db4148a8');
    expect(r.ok && r.info.uuid).toBe('919108f7-52d1-4320-9bac-f847db4148a8');
  });

  it('recognises Nil and Max UUIDs and the variant', () => {
    expect(parseUuid('00000000-0000-0000-0000-000000000000')).toMatchObject({ ok: true, info: { version: 0 } });
    expect(parseUuid('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toMatchObject({ ok: true, info: { version: 15 } });
    const ms = parseUuid('919108f7-52d1-4320-cbac-f847db4148a8');
    expect(ms.ok && ms.info.variant).toContain('Microsoft');
    expect(ms.ok && ms.info.variantKind).toBe('microsoft');
    expect(parseUuid('919108f7-52d1-4320-9bac-f847db4148a8')).toMatchObject({ info: { variantKind: 'rfc', variant: 'RFC 9562（標準）' } });
    expect(parseUuid('919108f7-52d1-4320-1bac-f847db4148a8')).toMatchObject({ info: { variantKind: 'ncs' } });
    expect(parseUuid('919108f7-52d1-4320-ebac-f847db4148a8')).toMatchObject({ info: { variantKind: 'future' } });
    expect(parseUuid('00000000-0000-0000-0000-000000000000')).toMatchObject({ info: { variantKind: 'none' } });
  });

  it('rejects malformed input', () => {
    expect(parseUuid('not-a-uuid').ok).toBe(false);
    expect(parseUuid('919108f7-52d1-4320-9bac-f847db4148a').ok).toBe(false);
    expect(parseUuid('919108f7-52d14320-9bac-f847db4148a8').ok).toBe(false);
  });
});

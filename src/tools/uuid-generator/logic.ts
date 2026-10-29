/** Fills the array with cryptographically random bytes. Injected for testability. */
export type RandomBytes = (bytes: Uint8Array) => Uint8Array;

export type UuidVersion = 'v4' | 'v7';

export interface FormatOptions {
  uppercase: boolean;
  hyphens: boolean;
}

export const MIN_COUNT = 1;
export const MAX_COUNT = 100;

const defaultRandom: RandomBytes = (bytes) => crypto.getRandomValues(bytes as Uint8Array<ArrayBuffer>);

function bytesToUuid(b: Uint8Array): string {
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Version 4: 122 random bits (RFC 9562 §5.4). */
export function uuidV4(random?: RandomBytes): string {
  if (!random && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = (random ?? defaultRandom)(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return bytesToUuid(b);
}

/**
 * Version 7 generator (RFC 9562 §5.7): 48-bit Unix milliseconds, then version, then
 * 12-bit rand_a used as a counter (§6.2 Method 1) so UUIDs created within the same
 * millisecond still sort in creation order. The counter is seeded randomly with its top
 * bit cleared; on overflow the timestamp is advanced by one millisecond.
 */
export function createV7Generator(random: RandomBytes = defaultRandom, now: () => number = Date.now): () => string {
  let lastMs = -1;
  let counter = 0;
  const seed = () => {
    const r = random(new Uint8Array(2));
    return ((r[0] << 8) | r[1]) & 0x7ff;
  };

  return () => {
    let ms = Math.max(Math.floor(now()), lastMs); // never go backwards if the clock does
    if (ms === lastMs) {
      counter++;
      if (counter > 0xfff) {
        ms++;
        counter = seed();
      }
    } else {
      counter = seed();
    }
    lastMs = ms;

    const b = random(new Uint8Array(16));
    for (let i = 5; i >= 0; i--) {
      b[5 - i] = Math.floor(ms / 2 ** (8 * i)) % 256;
    }
    b[6] = 0x70 | (counter >> 8);
    b[7] = counter & 0xff;
    b[8] = (b[8] & 0x3f) | 0x80;
    return bytesToUuid(b);
  };
}

export function formatUuid(uuid: string, options: FormatOptions): string {
  const s = options.hyphens ? uuid : uuid.replace(/-/g, '');
  return options.uppercase ? s.toUpperCase() : s.toLowerCase();
}

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return MIN_COUNT;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.floor(value)));
}

export interface UuidInfo {
  uuid: string;
  /** 0 for Nil, 15 for Max, otherwise the version nibble. */
  version: number;
  /** zh-TW variant label; see `variantKind` for a language-neutral value. */
  variant: string;
  variantKind: UuidVariant;
  /** Unix milliseconds for time-based versions (1, 6, 7). */
  timestamp?: number;
  /** zh-TW version label. */
  label: string;
}

/** Variant field of a UUID; 'none' for the Nil and Max UUIDs. */
export type UuidVariant = 'ncs' | 'rfc' | 'microsoft' | 'future' | 'none';

const VERSION_LABEL: Record<number, string> = {
  1: '版本 1（時間＋節點）',
  2: '版本 2（DCE 安全性）',
  3: '版本 3（名稱，MD5）',
  4: '版本 4（隨機）',
  5: '版本 5（名稱，SHA-1）',
  6: '版本 6（重新排序的時間）',
  7: '版本 7（Unix 時間排序）',
  8: '版本 8（自訂）',
};

/** Gregorian epoch (1582-10-15) offset from the Unix epoch, in 100-ns intervals. */
const GREGORIAN_OFFSET = 122192928000000000n;

export type ParseResult = { ok: true; info: UuidInfo } | { ok: false; error: string };

const VARIANT_LABEL: Record<UuidVariant, string> = {
  ncs: 'NCS 保留（舊格式）',
  rfc: 'RFC 9562（標準）',
  microsoft: 'Microsoft 保留（GUID 舊格式）',
  future: '未來保留',
  none: '—',
};

export function parseUuid(input: string): ParseResult {
  const raw = input
    .trim()
    .replace(/^urn:uuid:/i, '')
    .replace(/^\{(.*)\}$/, '$1');
  const hex = raw.replace(/-/g, '').toLowerCase();
  const shaped = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw) || /^[0-9a-f]{32}$/i.test(raw);
  if (!shaped) return { ok: false, error: '格式不正確：UUID 應為 32 個十六進位字元，通常寫成 8-4-4-4-12 的形式。' };

  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  if (/^0+$/.test(hex)) {
    return { ok: true, info: { uuid, version: 0, variant: '—', variantKind: 'none', label: 'Nil UUID（全部為 0）' } };
  }
  if (/^f+$/.test(hex)) {
    return { ok: true, info: { uuid, version: 15, variant: '—', variantKind: 'none', label: 'Max UUID（全部為 F）' } };
  }

  const version = parseInt(hex[12], 16);
  const v = parseInt(hex[16], 16);
  const variantKind: UuidVariant = v < 8 ? 'ncs' : v < 12 ? 'rfc' : v < 14 ? 'microsoft' : 'future';
  const variant = VARIANT_LABEL[variantKind];

  let timestamp: number | undefined;
  if (v >= 8 && v < 12) {
    if (version === 7) timestamp = parseInt(hex.slice(0, 12), 16);
    if (version === 1 || version === 6) {
      const ticks =
        version === 1
          ? BigInt(`0x${hex.slice(13, 16)}${hex.slice(8, 12)}${hex.slice(0, 8)}`)
          : BigInt(`0x${hex.slice(0, 12)}${hex.slice(13, 16)}`);
      timestamp = Number((ticks - GREGORIAN_OFFSET) / 10000n);
    }
  }

  return {
    ok: true,
    info: { uuid, version, variant, variantKind, timestamp, label: VERSION_LABEL[version] ?? `未定義的版本 ${version}` },
  };
}

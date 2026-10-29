export interface DecodedJwt {
  header: Record<string, unknown>;
  /** Parsed JSON payload, or the raw text when the payload is not JSON. */
  payload: unknown;
  payloadIsJson: boolean;
  signature: string;
  headerJson: string;
  payloadJson: string;
}

export type DecodeResult = { ok: true; jwt: DecodedJwt } | { ok: false; error: string };

export function base64UrlToBytes(segment: string): Uint8Array | null {
  const b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || b64.replace(/=+$/, '').length % 4 === 1) return null;
  const padded = b64.replace(/=+$/, '').padEnd(Math.ceil(b64.replace(/=+$/, '').length / 4) * 4, '=');
  try {
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** JSON → UTF-8 → base64url, as used for JWT header and payload segments. */
export function encodeSegment(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function segmentText(segment: string): string | null {
  const bytes = base64UrlToBytes(segment);
  if (!bytes) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function decodeJwt(input: string): DecodeResult {
  const token = input.trim().replace(/^Bearer\s+/i, '').replace(/\s+/g, '');
  if (token === '') return { ok: false, error: '請貼上 JWT' };
  const parts = token.split('.');
  if (parts.length === 5) return { ok: false, error: '這是 5 段式的加密 JWT（JWE），內容已加密，需要金鑰才能解開。' };
  if (parts.length !== 3) return { ok: false, error: `JWT 應由三段以「.」分隔的字串組成，目前有 ${parts.length} 段。` };

  const [h, p, signature] = parts;
  const headerText = segmentText(h);
  let header: unknown;
  try {
    header = headerText === null ? null : JSON.parse(headerText);
  } catch {
    header = null;
  }
  if (header === null || typeof header !== 'object' || Array.isArray(header)) {
    return { ok: false, error: '第一段標頭（Header）不是有效的 Base64URL 編碼 JSON 物件。' };
  }

  const payloadText = segmentText(p);
  if (payloadText === null) return { ok: false, error: '第二段酬載（Payload）不是有效的 Base64URL 編碼。' };
  let payload: unknown = payloadText;
  let payloadIsJson = false;
  try {
    payload = JSON.parse(payloadText);
    payloadIsJson = true;
  } catch {
    /* JWS payloads may be arbitrary text */
  }

  return {
    ok: true,
    jwt: {
      header: header as Record<string, unknown>,
      payload,
      payloadIsJson,
      signature,
      headerJson: JSON.stringify(header, null, 2),
      payloadJson: payloadIsJson ? JSON.stringify(payload, null, 2) : payloadText,
    },
  };
}

export const CLAIM_LABELS: Record<string, string> = {
  iss: '簽發者（Issuer）',
  sub: '主體（Subject）',
  aud: '受眾（Audience）',
  exp: '到期時間（Expiration）',
  nbf: '生效時間（Not Before）',
  iat: '簽發時間（Issued At）',
  jti: '權杖 ID（JWT ID）',
};

export const TIME_CLAIMS = ['exp', 'nbf', 'iat'] as const;

export type TokenState = 'valid' | 'expired' | 'not-yet-valid' | 'no-expiry';

export interface TokenStatus {
  state: TokenState;
  /** Seconds until (positive) or since (negative) the relevant instant. */
  delta?: number;
}

function numericClaim(payload: unknown, name: string): number | undefined {
  if (payload === null || typeof payload !== 'object') return undefined;
  const v = (payload as Record<string, unknown>)[name];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Evaluates exp / nbf (NumericDate, seconds since the Unix epoch, RFC 7519 §2). */
export function tokenStatus(payload: unknown, nowMs: number): TokenStatus {
  const now = nowMs / 1000;
  const nbf = numericClaim(payload, 'nbf');
  if (nbf !== undefined && now < nbf) return { state: 'not-yet-valid', delta: nbf - now };
  const exp = numericClaim(payload, 'exp');
  if (exp === undefined) return { state: 'no-expiry' };
  return now >= exp ? { state: 'expired', delta: exp - now } : { state: 'valid', delta: exp - now };
}

export function timeClaimValue(payload: unknown, name: string): number | undefined {
  return numericClaim(payload, name);
}

const UNITS: [number, string][] = [
  [86400, '天'],
  [3600, '小時'],
  [60, '分'],
  [1, '秒'],
];

/** "2 天 3 小時", "5 分 10 秒": the largest unit plus the next one when non-zero. */
export function formatDuration(seconds: number): string {
  const s = Math.round(Math.abs(seconds));
  if (s === 0) return '0 秒';
  const i = UNITS.findIndex(([size]) => s >= size);
  const [size, label] = UNITS[i];
  const parts = [`${Math.floor(s / size)} ${label}`];
  const next = UNITS[i + 1];
  if (next) {
    const rest = Math.floor((s % size) / next[0]);
    if (rest > 0) parts.push(`${rest} ${next[1]}`);
  }
  return parts.join(' ');
}

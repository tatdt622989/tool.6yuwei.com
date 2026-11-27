const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export interface EncodeOptions {
  /** RFC 4648 §5 alphabet: '-' and '_' instead of '+' and '/'. */
  urlSafe: boolean;
  /** Drop trailing '=' padding. */
  noPadding: boolean;
}

export type DecodeResult =
  | { ok: true; text: string; bytes: Uint8Array }
  | { ok: false; reason: DecodeFailure; error: string; bytes?: Uint8Array };

/** Why decoding failed: not Base64 at all, or valid Base64 whose bytes are not UTF-8 text. `error` is the zh message. */
export type DecodeFailure = 'invalid' | 'not-utf8';

export function bytesToBase64(bytes: Uint8Array, options: EncodeOptions = { urlSafe: false, noPadding: false }): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += ALPHABET[(triple >> 18) & 63] + ALPHABET[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? ALPHABET[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? ALPHABET[triple & 63] : '=';
  }
  if (options.urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_');
  if (options.noPadding) out = out.replace(/=+$/, '');
  return out;
}

export function encodeText(text: string, options?: EncodeOptions): string {
  return bytesToBase64(new TextEncoder().encode(text), options);
}

/**
 * Accepts standard and URL-safe alphabets, with or without padding, ignoring whitespace
 * and line breaks (MIME style). Returns null on invalid input.
 */
export function base64ToBytes(input: string): Uint8Array | null {
  const clean = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const body = clean.replace(/=+$/, '');
  if (!/^[A-Za-z0-9+/]*$/.test(body)) return null;
  if (clean.length - body.length > 2) return null;
  if (body.length % 4 === 1) return null;

  const out = new Uint8Array(Math.floor((body.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let j = 0;
  for (const ch of body) {
    buffer = (buffer << 6) | ALPHABET.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[j++] = (buffer >> bits) & 0xff;
    }
  }
  return out;
}

export function decodeText(input: string): DecodeResult {
  const bytes = base64ToBytes(input);
  if (!bytes) {
    return { ok: false, reason: 'invalid', error: '不是有效的 Base64：只能包含 A–Z、a–z、0–9、+ / 或 - _，結尾最多兩個 =。' };
  }
  try {
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), bytes };
  } catch {
    return {
      ok: false,
      reason: 'not-utf8',
      error: `解碼後的 ${bytes.length} 位元組不是 UTF-8 文字，可能是圖片或其他二進位檔案。`,
      bytes,
    };
  }
}

export function toHex(bytes: Uint8Array, max = 64): string {
  const shown = Array.from(bytes.slice(0, max), (b) => b.toString(16).padStart(2, '0')).join(' ');
  return bytes.length > max ? `${shown} …` : shown;
}

// Pure payload builders and checks for the QR code generator. No DOM access.

export type QrMode = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'vcard';
export type EcLevel = 'L' | 'M' | 'Q' | 'H';

export interface WifiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  org: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
  note: string;
}

/** Maximum bytes in byte mode at version 40 for each error-correction level. */
export const BYTE_CAPACITY: Record<EcLevel, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };

/** Approximate share of the symbol that can be damaged and still decode. */
export const EC_RECOVERY: Record<EcLevel, string> = { L: '約 7%', M: '約 15%', Q: '約 25%', H: '約 30%' };

/** Adds https:// to bare domains such as "example.com/path"; leaves anything with a scheme untouched. */
export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (value === '') return '';
  if (/^[a-z][a-z0-9+.-]*:(?!\d+(?:[/?#]|$))/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?([/?#].*)?$/u.test(value)) return `https://${value}`;
  return value;
}

/** Escapes \ ; , : " with a backslash, as required by the WIFI: URI format. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function buildWifi(data: WifiData): string {
  if (data.ssid === '') return '';
  const parts = [`T:${data.security}`, `S:${escapeWifi(data.ssid)}`];
  if (data.security !== 'nopass') parts.push(`P:${escapeWifi(data.password)}`);
  if (data.hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

export function buildEmail(data: EmailData): string {
  const to = data.to.trim();
  if (to === '') return '';
  const query: string[] = [];
  if (data.subject) query.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) query.push(`body=${encodeURIComponent(data.body)}`);
  return `mailto:${to}${query.length ? `?${query.join('&')}` : ''}`;
}

/** Keeps digits, a leading +, and the dial characters * # ; drops spaces, dashes and parentheses. */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/[^\d*#]/g, '');
}

export function buildPhone(input: string): string {
  const phone = normalizePhone(input);
  return phone.replace('+', '') === '' ? '' : `tel:${phone}`;
}

/** Text value escaping from RFC 6350 / 2426: backslash, comma, semicolon and newlines. */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function buildVCard(data: VCardData): string {
  const first = data.firstName.trim();
  const last = data.lastName.trim();
  const org = data.org.trim();
  if (!first && !last && !org) return '';
  // Chinese names read family name first without a space; Latin names read given name first.
  const isCjk = /\p{Script=Han}/u.test(first + last);
  const fullName = (isCjk ? `${last}${first}` : `${first} ${last}`).trim() || org;
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeVCard(last)};${escapeVCard(first)};;;`, `FN:${escapeVCard(fullName)}`];
  if (org) lines.push(`ORG:${escapeVCard(org)}`);
  if (data.title.trim()) lines.push(`TITLE:${escapeVCard(data.title.trim())}`);
  const phone = normalizePhone(data.phone);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (data.email.trim()) lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
  if (data.url.trim()) lines.push(`URL:${normalizeUrl(data.url)}`);
  if (data.address.trim()) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(data.address.trim())};;;;`);
  if (data.note.trim()) lines.push(`NOTE:${escapeVCard(data.note.trim())}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** True when the payload cannot fit even the largest QR version at this level. */
export function exceedsCapacity(text: string, level: EcLevel): boolean {
  return utf8Length(text) > BYTE_CAPACITY[level];
}

/** Accepts #rgb or #rrggbb; returns normalized #rrggbb or null. */
export function normalizeHex(input: string): string | null {
  const m = input.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return `#${hex.toLowerCase()}`;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type ColorWarning = 'inverted' | 'low-contrast' | null;

/** Many scanners need dark modules on a light background with clear contrast. */
export function colorWarning(foreground: string, background: string): ColorWarning {
  if (luminance(foreground) > luminance(background)) return 'inverted';
  if (contrastRatio(foreground, background) < 3) return 'low-contrast';
  return null;
}

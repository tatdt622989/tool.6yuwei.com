// Pure formatting helpers, safe on server and client.
// Every number formatter takes an optional trailing `locale` (default zh-TW); localized tools pass theirs.
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '../i18n/locales';

const cache = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let nf = cache.get(key);
  if (!nf) cache.set(key, (nf = new Intl.NumberFormat(LOCALE_INFO[locale].intl, options)));
  return nf;
}

/** 1234.567 → '1,234.57'. Non-finite → '—'. */
export function formatNumber(value: number, maxFractionDigits = 2, locale: Locale = DEFAULT_LOCALE): string {
  if (!Number.isFinite(value)) return '—';
  return numberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(value);
}

/** Exactly `digits` decimals: formatFixed(22, 1) → '22.0'. */
export function formatFixed(value: number, digits = 1, locale: Locale = DEFAULT_LOCALE): string {
  if (!Number.isFinite(value)) return '—';
  return numberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function formatInteger(value: number, locale: Locale = DEFAULT_LOCALE): string {
  return Number.isFinite(value) ? numberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(value)) : '—';
}

export function formatBytes(bytes: number, locale: Locale = DEFAULT_LOCALE): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${formatNumber(n, i === 0 ? 0 : 1, locale)} ${units[i]}`;
}

/** Parse a user-entered number, tolerating thousands separators and full-width digits. */
export function parseNumber(input: string): number {
  const normalized = input
    .replace(/[０-９．－]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[,\s，]/g, '');
  if (normalized === '') return Number.NaN;
  return Number(normalized);
}

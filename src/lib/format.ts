// Pure formatting helpers, safe on server and client.

const nf = new Intl.NumberFormat('zh-TW');

export function formatNumber(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: maxFractionDigits }).format(value);
}

export function formatInteger(value: number): string {
  return Number.isFinite(value) ? nf.format(Math.round(value)) : '—';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${formatNumber(n, i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Parse a user-entered number, tolerating thousands separators and full-width digits. */
export function parseNumber(input: string): number {
  const normalized = input
    .replace(/[０-９．－]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[,\s，]/g, '');
  if (normalized === '') return Number.NaN;
  return Number(normalized);
}

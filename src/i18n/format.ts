// Locale-aware string helpers. Pure: safe on server and client.
// Number formatters live in src/lib/format.ts (formatNumber / formatInteger / formatFixed / formatBytes)
// and take an optional trailing `locale`; they are re-exported here for convenience.
import { formatNumber } from '../lib/format';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from './locales';

export { formatBytes, formatFixed, formatInteger, formatNumber, parseNumber } from '../lib/format';

export type Vars = Record<string, string | number>;

/**
 * Fill {placeholders}: t('約 {n} 分鐘', { n: 4 }) → '約 4 分鐘'.
 * Numbers are inserted as-is; format them first (formatNumber) if they need separators.
 * Unknown placeholders are left untouched so missing data is visible instead of silent.
 */
export function t(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** Plural forms keyed by Intl.PluralRules category. `other` is required; zh/ja only ever use `other`. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

const pluralCache = new Map<string, Intl.PluralRules>();

/**
 * Pick the plural form for n and fill {n} (formatted for the locale) plus any extra vars:
 *   plural('en', 1, { one: '{n} word', other: '{n} words' }) → '1 word'
 */
export function plural(locale: Locale, n: number, forms: PluralForms, vars: Vars = {}): string {
  const tag = LOCALE_INFO[locale].intl;
  let rules = pluralCache.get(tag);
  if (!rules) pluralCache.set(tag, (rules = new Intl.PluralRules(tag)));
  const template = forms[rules.select(n)] ?? forms.other;
  return t(template, { n: formatNumber(n, 2, locale), ...vars });
}

/** formatDate('2026-10-29', 'en') → 'October 29, 2026'; zh-TW / ja → '2026年10月29日'. */
export function formatDate(
  date: Date | string,
  locale: Locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE_INFO[locale].intl, options);
}

/** ['a','b','c'] → 'a, b, and c' (en) / 'a、b和c' (zh-TW) / 'a、b、c' (ja). */
export function formatList(items: string[], locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.ListFormat(LOCALE_INFO[locale].intl, { style: 'long', type: 'conjunction' }).format(items);
}

/** Comparator for sorting names in a locale (zh-TW uses the zh-Hant collation). */
export function compareText(locale: Locale): (a: string, b: string) => number {
  return new Intl.Collator(locale === 'zh-TW' ? 'zh-Hant' : LOCALE_INFO[locale].intl).compare;
}

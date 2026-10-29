// Locale definitions and URL helpers. Pure module: safe on server, client and in tests.
//
// zh-TW is the default locale and lives at the site root (/<slug>/). Every other locale
// lives under its own prefix (/en/<slug>/, /ja/<slug>/). Slugs are shared across locales.

export const LOCALES = ['zh-TW', 'en', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh-TW';

export interface LocaleInfo {
  /** URL prefix without trailing slash; '' for the default locale. */
  prefix: string;
  /** <html lang>. */
  htmlLang: string;
  /** Value used in <link rel="alternate" hreflang> and sitemap xhtml:link. */
  hreflang: string;
  /** og:locale. */
  ogLocale: string;
  /** BCP 47 tag passed to Intl (numbers, dates, collation, plural rules). */
  intl: string;
  /** Label in the language switcher, written in that language. */
  label: string;
  /** Currency for JSON-LD offers (price is always 0). */
  currency: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  'zh-TW': {
    prefix: '',
    htmlLang: 'zh-Hant-TW',
    hreflang: 'zh-TW',
    ogLocale: 'zh_TW',
    intl: 'zh-TW',
    label: '中文',
    currency: 'TWD',
  },
  en: { prefix: '/en', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US', intl: 'en-US', label: 'English', currency: 'USD' },
  ja: { prefix: '/ja', htmlLang: 'ja', hreflang: 'ja', ogLocale: 'ja_JP', intl: 'ja-JP', label: '日本語', currency: 'JPY' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** '/about/' + 'en' → '/en/about/'. `path` must start with '/'. */
export function localePath(locale: Locale, path = '/'): string {
  if (!path.startsWith('/')) throw new Error(`localePath expects an absolute path, got "${path}"`);
  return `${LOCALE_INFO[locale].prefix}${path}`;
}

/** Home page of a locale: '/', '/en/', '/ja/'. */
export function localeHome(locale: Locale): string {
  return localePath(locale, '/');
}

/** '/en/bmi-calculator/' → { locale: 'en', path: '/bmi-calculator/' }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of LOCALES) {
    const { prefix } = LOCALE_INFO[locale];
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return { locale, path: pathname.slice(prefix.length) || '/' };
    }
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/** Map an <html lang> / navigator tag back to a supported locale. */
export function localeFromTag(tag: string | undefined | null): Locale {
  if (!tag) return DEFAULT_LOCALE;
  if (isLocale(tag)) return tag;
  const lower = tag.toLowerCase();
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

// hreflang / language-switcher logic. Pure: tested in alternates.test.ts.
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, localeHome, localePath, type Locale } from './locales';

/** Locale → site path of the *same* page in that locale. Only locales where the page exists. */
export type Alternates = Partial<Record<Locale, string>>;

/** For pages that exist in every locale at the same base path (home, about, privacy…). */
export function allLocales(basePath: string): Alternates {
  return Object.fromEntries(LOCALES.map((l) => [l, localePath(l, basePath)])) as Alternates;
}

/** Same base path, but only for the given locales (e.g. a tool that exists in zh-TW and ja). */
export function someLocales(basePath: string, locales: readonly Locale[]): Alternates {
  return Object.fromEntries(locales.map((l) => [l, localePath(l, basePath)])) as Alternates;
}

/** x-default: the zh-TW page when it exists, else en, else whatever exists first (in LOCALES order). */
export function xDefaultLocale(alternates: Alternates): Locale | undefined {
  if (alternates[DEFAULT_LOCALE]) return DEFAULT_LOCALE;
  if (alternates.en) return 'en';
  return LOCALES.find((l) => alternates[l]);
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * <link rel="alternate" hreflang> entries: one per existing locale (self included) plus x-default.
 * `toAbsolute` turns a site path into a full URL.
 */
export function hreflangLinks(alternates: Alternates, toAbsolute: (path: string) => string): HreflangLink[] {
  const links: HreflangLink[] = LOCALES.filter((l) => alternates[l]).map((l) => ({
    hreflang: LOCALE_INFO[l].hreflang,
    href: toAbsolute(alternates[l]!),
  }));
  const xDefault = xDefaultLocale(alternates);
  if (xDefault) links.push({ hreflang: 'x-default', href: toAbsolute(alternates[xDefault]!) });
  return links;
}

export interface SwitcherLink {
  locale: Locale;
  label: string;
  hreflang: string;
  htmlLang: string;
  href: string;
  /** False when the page has no version in that locale and the link falls back to that locale's home. */
  samePage: boolean;
  current: boolean;
}

/** Language switcher: same page in each locale when it exists, otherwise that locale's home page. */
export function switcherLinks(current: Locale, alternates: Alternates): SwitcherLink[] {
  return LOCALES.map((locale) => {
    const same = alternates[locale];
    return {
      locale,
      label: LOCALE_INFO[locale].label,
      hreflang: LOCALE_INFO[locale].hreflang,
      htmlLang: LOCALE_INFO[locale].htmlLang,
      href: same ?? localeHome(locale),
      samePage: Boolean(same),
      current: locale === current,
    };
  });
}

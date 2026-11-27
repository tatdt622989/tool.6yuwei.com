// Browser-side counterpart of i18nAttrs(): read the locale and the client strings a
// Tool.astro serialized onto its root element. Import from a tool's <script>.
import { localeFromTag, isLocale, type Locale } from './locales';

export interface ClientI18n<T> {
  locale: Locale;
  /** The `client` strings of the tool's dictionary for this locale. */
  s: T;
}

export function readI18n<T>(root: HTMLElement): ClientI18n<T> {
  const tag = root.dataset.locale;
  const locale = isLocale(tag) ? tag : localeFromTag(document.documentElement.lang);
  let s = {} as T;
  try {
    s = JSON.parse(root.dataset.i18n ?? '{}') as T;
  } catch {
    /* malformed JSON is a build bug; fall back to empty strings rather than crash the tool */
  }
  return { locale, s };
}

/** Locale of the current page, from <html lang>. */
export function pageLocale(): Locale {
  return localeFromTag(document.documentElement.lang);
}

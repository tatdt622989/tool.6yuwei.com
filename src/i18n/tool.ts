// Server-side helpers for per-tool UI dictionaries (src/tools/<slug>/i18n.ts).
// See docs/i18n.md for the full pattern.
import type { Locale } from './locales';

/** Props every Tool.astro receives from the tool page. Unmigrated (zh-only) tools may ignore it. */
export interface ToolProps {
  locale?: Locale;
}

/** A tool's dictionary: one entry per locale the tool supports, all with the same shape. */
export type ToolDict<T> = Partial<Record<Locale, T>>;

/**
 * Identity helper that pins every locale entry to the same interface:
 *   export default defineToolI18n<Strings>({ 'zh-TW': {...}, en: {...}, ja: {...} });
 */
export function defineToolI18n<T>(dict: ToolDict<T>): ToolDict<T> {
  return dict;
}

/** Strings for one locale; throws at build time if the tool has no entry for it. */
export function pickStrings<T>(dict: ToolDict<T>, locale: Locale): T {
  const strings = dict[locale];
  if (!strings) throw new Error(`Missing i18n strings for locale "${locale}"`);
  return strings;
}

/**
 * Attributes for the tool's root element. The client script reads them back with
 * readI18n() from src/i18n/client.ts, so one bundled script serves every locale.
 *   <div class="tool" data-tool="x" {...i18nAttrs(locale, s.client)}>
 */
export function i18nAttrs(locale: Locale, client: unknown): { 'data-locale': Locale; 'data-i18n': string } {
  return { 'data-locale': locale, 'data-i18n': JSON.stringify(client ?? {}) };
}

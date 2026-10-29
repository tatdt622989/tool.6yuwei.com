// Pure registry logic (no import.meta.glob) so it can be unit-tested with fake metas.
// registry.ts feeds it the real src/tools/*/meta*.ts modules.
import { categoriesFor, type Category } from '../config/categories';
import { someLocales, type Alternates } from '../i18n/alternates';
import { compareText } from '../i18n/format';
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from '../i18n/locales';
import type { LocalizedTool, ToolMeta } from './types';

/** Which meta file declares which locale. A tool exists in a locale iff its folder has that file. */
export const META_FILE: Record<Locale, string> = {
  'zh-TW': 'meta.ts',
  en: 'meta.en.ts',
  ja: 'meta.ja.ts',
};

// Top-level paths owned by other pages (in any locale); a tool slug must not shadow them.
export const RESERVED_SLUGS = new Set([
  'about',
  'contact',
  'privacy',
  'terms',
  'category',
  'convert',
  'app',
  '404',
  'tools.json',
  'sw.js',
  'manifest.webmanifest',
  'en',
  'ja',
]);

/** './word-counter/meta.en.ts' → { folder: 'word-counter', locale: 'en' }. */
export function parseMetaPath(path: string): { folder: string; locale: Locale } | null {
  const match = /^\.\/([^/]+)\/(meta(?:\.[a-z-]+)?\.ts)$/i.exec(path);
  if (!match) return null;
  const locale = LOCALES.find((l) => META_FILE[l] === match[2]);
  return locale ? { folder: match[1], locale } : null;
}

export function createRegistry(modules: Record<string, ToolMeta>) {
  const categoryIds = new Set(categoriesFor(DEFAULT_LOCALE).map((c) => c.id));
  const byLocale = Object.fromEntries(LOCALES.map((l) => [l, [] as LocalizedTool[]])) as Record<Locale, LocalizedTool[]>;
  const categoryOf = new Map<string, string>();

  for (const [path, meta] of Object.entries(modules)) {
    const parsed = parseMetaPath(path);
    if (!parsed) throw new Error(`Unexpected tool meta file "${path}" (use meta.ts, meta.en.ts or meta.ja.ts)`);
    const { folder, locale } = parsed;
    const where = `${folder}/${META_FILE[locale]}`;
    if (meta.slug !== folder) throw new Error(`Tool slug "${meta.slug}" must match folder "${folder}" (${where})`);
    if (RESERVED_SLUGS.has(meta.slug)) throw new Error(`Tool slug "${meta.slug}" is reserved`);
    if (!categoryIds.has(meta.category)) throw new Error(`Tool "${where}" has unknown category "${meta.category}"`);
    const known = categoryOf.get(folder);
    if (known && known !== meta.category) {
      throw new Error(`Tool "${folder}" must use the same category in every locale ("${known}" vs "${meta.category}")`);
    }
    categoryOf.set(folder, meta.category);
    if (byLocale[locale].some((t) => t.slug === meta.slug)) throw new Error(`Duplicate tool slug "${meta.slug}" (${locale})`);
    byLocale[locale].push({ ...meta, locale });
  }

  for (const locale of LOCALES) {
    const compare = compareText(locale);
    byLocale[locale].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || compare(a.name, b.name));
  }

  function toolsFor(locale: Locale): readonly LocalizedTool[] {
    return byLocale[locale];
  }

  function findTool(slug: string, locale: Locale = DEFAULT_LOCALE): LocalizedTool | undefined {
    return byLocale[locale].find((t) => t.slug === slug);
  }

  function getTool(slug: string, locale: Locale = DEFAULT_LOCALE): LocalizedTool {
    const tool = findTool(slug, locale);
    if (!tool) throw new Error(`Unknown tool: ${slug} (${locale})`);
    return tool;
  }

  function hasTool(slug: string, locale: Locale): boolean {
    return Boolean(findTool(slug, locale));
  }

  /** Locales a tool exists in, in LOCALES order. */
  function toolLocales(slug: string): Locale[] {
    return LOCALES.filter((l) => hasTool(slug, l));
  }

  function toolsInCategory(id: string, locale: Locale = DEFAULT_LOCALE): LocalizedTool[] {
    return byLocale[locale].filter((t) => t.category === id);
  }

  /** Categories that have at least one tool in `locale`, localized, in display order. */
  function populatedCategories(locale: Locale): Category[] {
    return categoriesFor(locale).filter((c) => toolsInCategory(c.id, locale).length > 0);
  }

  /** Explicit related tools first, then same-category tools, then popular tools — all in the tool's own locale. */
  function relatedTools(tool: LocalizedTool, limit = 6): LocalizedTool[] {
    const pool = byLocale[tool.locale];
    const picked: LocalizedTool[] = [];
    const add = (t: LocalizedTool | undefined) => {
      if (t && t.slug !== tool.slug && !picked.includes(t) && picked.length < limit) picked.push(t);
    };
    tool.related?.forEach((slug) => add(pool.find((t) => t.slug === slug)));
    toolsInCategory(tool.category, tool.locale).forEach(add);
    pool.forEach(add);
    return picked;
  }

  /** Same tool in every locale it exists in. */
  function toolAlternates(slug: string): Alternates {
    return someLocales(`/${slug}/`, toolLocales(slug));
  }

  /** A category page exists in a locale iff that locale has tools in it. */
  function categoryAlternates(id: string): Alternates {
    const locales = LOCALES.filter((l) => populatedCategories(l).some((c) => c.id === id));
    return someLocales(`/category/${id}/`, locales);
  }

  return {
    toolsFor,
    findTool,
    getTool,
    hasTool,
    toolLocales,
    toolsInCategory,
    populatedCategories,
    relatedTools,
    toolAlternates,
    categoryAlternates,
  };
}

export function toolPath(slug: string, locale: Locale = DEFAULT_LOCALE): string {
  return localePath(locale, `/${slug}/`);
}

export function categoryPath(id: string, locale: Locale = DEFAULT_LOCALE): string {
  return localePath(locale, `/category/${id}/`);
}

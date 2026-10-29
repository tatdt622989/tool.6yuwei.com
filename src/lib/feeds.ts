// Per-locale JSON endpoints: /tools.json (+ /en/, /ja/) and /manifest.webmanifest (+ /en/, /ja/).
import { getCategory } from '../config/categories';
import { absoluteUrl, getBrand } from '../config/site';
import { DEFAULT_LOCALE, localeHome, type Locale } from '../i18n/locales';
import { toolPath, toolsFor } from '../tools/registry';

/** Public feed consumed by blog.6yuwei.com to render "related tool" cards. */
export function toolsFeed(locale: Locale): Response {
  const tools = toolsFor(locale).map((t) => ({
    slug: t.slug,
    name: t.name,
    title: t.seoTitle,
    description: t.description,
    intro: t.intro,
    category: getCategory(t.category, locale).name,
    keywords: t.keywords,
    url: absoluteUrl(toolPath(t.slug, locale)),
  }));
  // zh-TW keeps its original shape; other locales add `locale` so consumers can tell feeds apart.
  const body = locale === DEFAULT_LOCALE ? { updated: new Date().toISOString(), tools } : { locale, updated: new Date().toISOString(), tools };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

const ICON = { src: '/icon-192.png', sizes: '192x192', type: 'image/png' };

/** zh-TW shortcuts are hand-picked; other locales use their highest-priority tools. */
function shortcuts(locale: Locale): { name: string; url: string }[] {
  if (locale === DEFAULT_LOCALE) {
    return [
      { name: '薪資計算機', url: '/salary-calculator/' },
      { name: '線上計算機', url: '/calculator/' },
      { name: '匯率換算', url: '/exchange-rate/' },
      { name: '2027 行事曆', url: '/holidays-2027/' },
    ];
  }
  return toolsFor(locale)
    .slice(0, 4)
    .map((t) => ({ name: t.name, url: toolPath(t.slug, locale) }));
}

export function webManifest(locale: Locale): Response {
  const brand = getBrand(locale);
  const home = localeHome(locale);
  return new Response(
    JSON.stringify({
      // Each locale installs as its own app scoped to its prefix; zh-TW keeps the original '/' identity.
      id: home,
      name: `${brand.name}${brand.titleSeparator}${brand.tagline}`,
      short_name: brand.name,
      description: brand.description,
      lang: locale,
      start_url: `${home}?source=pwa`,
      scope: home,
      display: 'standalone',
      categories: ['utilities', 'productivity', 'finance'],
      background_color: '#f7f7f8',
      theme_color: '#f0522e',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      shortcuts: shortcuts(locale).map((s) => ({ ...s, icons: [ICON] })),
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}


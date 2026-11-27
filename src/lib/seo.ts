import { absoluteUrl, getBrand, site } from '../config/site';
import type { Category } from '../config/categories';
import { DEFAULT_LOCALE, LOCALE_INFO, localeHome, type Locale } from '../i18n/locales';
import type { LocalizedTool, ToolMeta } from '../tools/types';
import { toolPath } from '../tools/registry';

type JsonLd = Record<string, unknown>;

function publisher(locale: Locale) {
  return {
    '@type': 'Organization',
    name: getBrand(locale).name,
    url: site.url,
    logo: absoluteUrl('/icon-512.png'),
  };
}

/** WebSite + SearchAction for a locale's home page (/?q=, /en/?q=, /ja/?q=). */
export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE): JsonLd {
  const brand = getBrand(locale);
  const home = absoluteUrl(localeHome(locale));
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: locale === DEFAULT_LOCALE ? site.url : home,
    inLanguage: LOCALE_INFO[locale].htmlLang,
    description: brand.description,
    publisher: publisher(locale),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${locale === DEFAULT_LOCALE ? site.url + '/' : home}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Names are already localized by the caller; paths are site paths. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function toolJsonLd(tool: LocalizedTool, category: Category): JsonLd {
  const { locale } = tool;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    headline: tool.seoTitle,
    description: tool.description,
    url: absoluteUrl(toolPath(tool.slug, locale)),
    applicationCategory: category.id === 'dev' ? 'DeveloperApplication' : 'UtilitiesApplication',
    applicationSubCategory: category.name,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Works in modern browsers.',
    inLanguage: LOCALE_INFO[locale].htmlLang,
    isAccessibleForFree: true,
    keywords: tool.keywords.join(', '),
    dateModified: tool.updated,
    offers: { '@type': 'Offer', price: '0', priceCurrency: LOCALE_INFO[locale].currency },
    publisher: publisher(locale),
  };
}

export function faqJsonLd(faq: ToolMeta['faq']): JsonLd | null {
  if (faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function itemListJsonLd(name: string, list: readonly LocalizedTool[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: list.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(toolPath(tool.slug, tool.locale)),
      name: tool.name,
    })),
  };
}

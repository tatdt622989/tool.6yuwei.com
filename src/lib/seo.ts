import { absoluteUrl, site } from '../config/site';
import type { Category } from '../config/categories';
import type { ToolMeta } from '../tools/types';
import { toolPath } from '../tools/registry';

type JsonLd = Record<string, unknown>;

const publisher = {
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: absoluteUrl('/icon-512.png'),
};

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    inLanguage: site.lang,
    description: site.description,
    publisher,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

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

export function toolJsonLd(tool: ToolMeta, category: Category): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    headline: tool.seoTitle,
    description: tool.description,
    url: absoluteUrl(toolPath(tool.slug)),
    applicationCategory: category.id === 'dev' ? 'DeveloperApplication' : 'UtilitiesApplication',
    applicationSubCategory: category.name,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Works in modern browsers.',
    inLanguage: site.lang,
    isAccessibleForFree: true,
    keywords: tool.keywords.join(', '),
    dateModified: tool.updated,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
    publisher,
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

export function itemListJsonLd(name: string, list: ToolMeta[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: list.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(toolPath(tool.slug)),
      name: tool.name,
    })),
  };
}

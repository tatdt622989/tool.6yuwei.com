import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Keep in sync with src/i18n/locales.ts (LOCALE_INFO[*].hreflang). zh-TW is the unprefixed default.
const SITEMAP_LOCALES = { 'zh-TW': 'zh-TW', en: 'en', ja: 'ja' };

export default defineConfig({
  site: 'https://tool.6yuwei.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      // Emits <xhtml:link rel="alternate" hreflang> for pages that exist under the same path in several locales.
      i18n: { defaultLocale: 'zh-TW', locales: SITEMAP_LOCALES },
      // Add x-default (zh-TW version, else en), matching the <link rel="alternate"> tags in BaseLayout.
      serialize(item) {
        if (item.links && item.links.length > 1) {
          const preferred = item.links.find((l) => l.lang === 'zh-TW') ?? item.links.find((l) => l.lang === 'en') ?? item.links[0];
          item.links = [...item.links, { url: preferred.url, lang: 'x-default' }];
        }
        return item;
      },
    }),
  ],
});

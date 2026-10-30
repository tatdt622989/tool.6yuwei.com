import type { Locale } from '../i18n/locales';

const env = import.meta.env;

/**
 * Brand per locale — the single place to rename the site.
 * `name` is the full brand used in <title>, og:site_name and JSON-LD.
 * `mark` + `markDesc` render the text wordmark (Wordmark.astro): 「隨手｜線上工具」.
 * `titleSeparator` joins page title and brand: 「字數統計｜隨手」 / "Word Counter | Suishou Tools".
 */
export interface Brand {
  name: string;
  tagline: string;
  description: string;
  mark: string;
  markDesc: string;
  titleSeparator: string;
}

export const brands: Record<Locale, Brand> = {
  'zh-TW': {
    name: '隨手',
    tagline: '打開就能用的線上工具',
    description:
      '隨手收錄薪資計算、計算機、行事曆、繁簡轉換、PDF 與圖片處理等數十種免費線上工具，全部在瀏覽器本機執行，免安裝、免註冊、資料不上傳。',
    mark: '隨手',
    markDesc: '線上工具',
    titleSeparator: '｜',
  },
  en: {
    name: 'Suishou Tools',
    tagline: 'Free online tools that just work',
    description:
      'Suishou Tools is a collection of free online tools — BMI calculator, word counter, password generator and more — that run entirely in your browser. No sign-up, no install, no uploads.',
    mark: 'Suishou',
    markDesc: 'Tools',
    titleSeparator: ' | ',
  },
  ja: {
    name: '隨手ツール',
    tagline: 'インストール不要の無料オンラインツール',
    description:
      '隨手ツールは、BMI 計算・文字数カウント・パスワード生成など、ブラウザだけで使える無料オンラインツール集です。登録不要、データの送信もありません。',
    mark: '隨手',
    markDesc: 'ツール',
    titleSeparator: '｜',
  },
};

export function getBrand(locale: Locale): Brand {
  return brands[locale];
}

/** Locale-independent settings. zh-TW brand fields are kept here for backward compatibility; prefer getBrand(locale). */
export const site = {
  name: brands['zh-TW'].name,
  url: 'https://tool.6yuwei.com',
  lang: 'zh-Hant-TW',
  ogLocale: 'zh_TW',
  tagline: brands['zh-TW'].tagline,
  description: brands['zh-TW'].description,
  author: '6yuwei',
  blogUrl: 'https://blog.6yuwei.com',
  repoUrl: 'https://github.com/tatdt622989/tool.6yuwei.com',
  license: 'AGPL-3.0',
  contactEmail: (env.PUBLIC_CONTACT_EMAIL ?? '').trim(),
  gscVerification: (env.PUBLIC_GSC_VERIFICATION ?? '').trim(),
} as const;

export type AdSlotName = 'afterTool' | 'inArticle' | 'bottom' | 'sidebar' | 'home';

export const ads = {
  client: (env.PUBLIC_ADSENSE_CLIENT ?? '').trim(),
  slots: {
    afterTool: (env.PUBLIC_ADSENSE_SLOT_AFTER_TOOL ?? '').trim(),
    inArticle: (env.PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? '').trim(),
    bottom: (env.PUBLIC_ADSENSE_SLOT_BOTTOM ?? '').trim(),
    sidebar: (env.PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '').trim(),
    home: (env.PUBLIC_ADSENSE_SLOT_HOME ?? '').trim(),
  } satisfies Record<AdSlotName, string>,
  showPlaceholders: env.DEV || env.PUBLIC_AD_PLACEHOLDERS === 'true',
};

export const analytics = {
  /** GA4 measurement ID (public). PUBLIC_GA_ID overrides it; the layout only loads GA on the production host. */
  gaId: (env.PUBLIC_GA_ID ?? '').trim() || 'G-10LYBK8Q3W',
};

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

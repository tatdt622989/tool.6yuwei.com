const env = import.meta.env;

export const site = {
  name: '隨手',
  url: 'https://tool.6yuwei.com',
  lang: 'zh-Hant-TW',
  ogLocale: 'zh_TW',
  tagline: '打開就能用的線上工具',
  description:
    '隨手收錄薪資計算、計算機、行事曆、繁簡轉換、PDF 與圖片處理等數十種免費線上工具，全部在瀏覽器本機執行，免安裝、免註冊、資料不上傳。',
  author: '6yuwei',
  blogUrl: 'https://blog.6yuwei.com',
  contactEmail: (env.PUBLIC_CONTACT_EMAIL ?? '').trim(),
  gscVerification: (env.PUBLIC_GSC_VERIFICATION ?? '').trim(),
  ogImage: '/og-default.png',
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
  gaId: (env.PUBLIC_GA_ID ?? '').trim(),
};

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

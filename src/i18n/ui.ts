// Site chrome strings (header, footer, search, tool page frame, home, category, 404).
// Per-tool strings live in src/tools/<slug>/i18n.ts, not here.
// Placeholders like {name} are filled with t() from ./format.
import type { Locale } from './locales';

export interface UiStrings {
  skipToContent: string;
  /** Flash label on copy buttons (data-copy). */
  copied: string;
  breadcrumbsAria: string;
  homeCrumb: string;
  adLabel: string;
  installButton: string;
  header: {
    homeAria: string;
    siteLinksAria: string;
    categoriesAria: string;
    search: string;
    /** null hides the blog link (the blog is written in Chinese). */
    blog: string | null;
    languageAria: string;
  };
  search: {
    aria: string;
    placeholder: string;
    close: string;
    noResults: string;
  };
  footer: {
    /** Follows the tagline. */
    about: string;
    categories: string;
    aboutHeading: string;
    /** null hides the /convert/ link (zh-only pages). */
    conversions: string | null;
    app: string;
    aboutSite: string;
    contact: string;
    privacy: string;
    terms: string;
    blog: string;
  };
  home: {
    heroBefore: string;
    heroAccent: string;
    heroAfter: string;
    /** {count} = number of tools in this locale. */
    lead: string;
    searchLabel: string;
    searchPlaceholder: string;
    popularAria: string;
    appNote: string;
    appNoteLink: string;
    empty: string;
    /** {count} */
    categoryAll: string;
  };
  tool: {
    /** {name} */
    howTo: string;
    conversions: string;
    faq: string;
    furtherReading: string;
    updated: string;
    related: string;
    /** {category} */
    moreInCategory: string;
    /** {name} */
    toolAria: string;
  };
  category: {
    /** <title> when the category has no explicit title. {name} {blurb} */
    title: string;
    others: string;
  };
  notFound: {
    title: string;
    description: string;
    heading: string;
    before: string;
    link: string;
    after: string;
  };
}

export const ui: Record<Locale, UiStrings> = {
  'zh-TW': {
    skipToContent: '跳到主要內容',
    copied: '已複製',
    breadcrumbsAria: '麵包屑',
    homeCrumb: '首頁',
    adLabel: '廣告',
    installButton: '安裝隨手 App',
    header: {
      homeAria: '{name} 首頁',
      siteLinksAria: '站內連結',
      categoriesAria: '工具分類',
      search: '搜尋工具',
      blog: '部落格',
      languageAria: '切換語言',
    },
    search: {
      aria: '搜尋工具',
      placeholder: '搜尋工具，例如：薪資、民國年、PDF',
      close: '關閉',
      noResults: '找不到符合的工具',
    },
    footer: {
      about: '所有工具都在你的瀏覽器裡執行，免安裝、免註冊，資料不會上傳。',
      categories: '分類',
      aboutHeading: '關於',
      conversions: '常用單位換算',
      app: '安裝成 App',
      aboutSite: '關於隨手',
      contact: '聯絡我們',
      privacy: '隱私權政策',
      terms: '使用條款',
      blog: '6yuwei 部落格',
    },
    home: {
      heroBefore: '打開就能用的',
      heroAccent: '線上工具',
      heroAfter: '',
      lead: '{count} 個免費工具：薪資試算、計算機、行事曆、繁簡轉換、PDF 與圖片處理。免安裝、免註冊，資料不會上傳。',
      searchLabel: '搜尋工具',
      searchPlaceholder: '想做什麼？例如：薪資、民國年、PDF 合併',
      popularAria: '熱門工具',
      appNote: '可以安裝成 App，從主畫面一鍵打開。',
      appNoteLink: '怎麼安裝',
      empty: '找不到符合的工具，換個關鍵字試試。',
      categoryAll: '全部 {count} 個',
    },
    tool: {
      howTo: '如何使用{name}',
      conversions: '常用換算',
      faq: '常見問題',
      furtherReading: '延伸閱讀',
      updated: '最後更新：',
      related: '你可能也需要',
      moreInCategory: '更多{category}',
      toolAria: '{name}工具',
    },
    category: {
      title: '{name}線上工具：{blurb}',
      others: '其他分類',
    },
    notFound: {
      title: '找不到頁面',
      description: '你要找的頁面不存在。',
      heading: '找不到這個頁面',
      before: '網址可能打錯了，或工具已經搬家。試試回到',
      link: '首頁',
      after: '搜尋，或看看熱門工具：',
    },
  },

  en: {
    skipToContent: 'Skip to main content',
    copied: 'Copied',
    breadcrumbsAria: 'Breadcrumb',
    homeCrumb: 'Home',
    adLabel: 'Advertisement',
    installButton: 'Install the app',
    header: {
      homeAria: '{name} home',
      siteLinksAria: 'Site links',
      categoriesAria: 'Tool categories',
      search: 'Search tools',
      blog: null,
      languageAria: 'Change language',
    },
    search: {
      aria: 'Search tools',
      placeholder: 'Search tools, e.g. BMI, password, word count',
      close: 'Close',
      noResults: 'No matching tools',
    },
    footer: {
      about: 'Every tool runs in your browser: nothing to install, no account, and your data never leaves your device.',
      categories: 'Categories',
      aboutHeading: 'About',
      conversions: null,
      app: 'Install as an app',
      aboutSite: 'About Suishou Tools',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      blog: '6yuwei blog (Chinese)',
    },
    home: {
      heroBefore: 'Online tools that ',
      heroAccent: 'just work',
      heroAfter: '',
      lead: '{count} free tools that run right in your browser. No sign-up, no install, and nothing you type is uploaded.',
      searchLabel: 'Search tools',
      searchPlaceholder: 'What do you need? e.g. BMI, password, word count',
      popularAria: 'Popular tools',
      appNote: 'Install it as an app and open it from your home screen.',
      appNoteLink: 'How to install',
      empty: 'No tools match that search. Try another keyword.',
      categoryAll: 'View all ({count})',
    },
    tool: {
      howTo: 'How to use the {name}',
      conversions: 'Common conversions',
      faq: 'Frequently asked questions',
      furtherReading: 'Further reading',
      updated: 'Last updated: ',
      related: 'You might also need',
      moreInCategory: 'More {category}',
      toolAria: '{name}',
    },
    category: {
      title: 'Free {name} Online: {blurb}',
      others: 'Other categories',
    },
    notFound: {
      title: 'Page not found',
      description: 'The page you are looking for does not exist.',
      heading: 'We couldn’t find that page',
      before: 'The address may be mistyped, or the tool has moved. Go back to the ',
      link: 'home page',
      after: ' to search, or try one of these popular tools:',
    },
  },

  ja: {
    skipToContent: 'メインコンテンツへ移動',
    copied: 'コピーしました',
    breadcrumbsAria: 'パンくずリスト',
    homeCrumb: 'ホーム',
    adLabel: '広告',
    installButton: 'アプリとしてインストール',
    header: {
      homeAria: '{name} ホーム',
      siteLinksAria: 'サイト内リンク',
      categoriesAria: 'ツールのカテゴリ',
      search: 'ツールを検索',
      blog: null,
      languageAria: '言語を切り替え',
    },
    search: {
      aria: 'ツールを検索',
      placeholder: 'ツールを検索（例：BMI、パスワード、文字数）',
      close: '閉じる',
      noResults: '該当するツールが見つかりません',
    },
    footer: {
      about: 'すべてのツールはブラウザ内で動作します。インストールも登録も不要で、入力したデータが外部に送信されることはありません。',
      categories: 'カテゴリ',
      aboutHeading: 'サイトについて',
      conversions: null,
      app: 'アプリとして使う',
      aboutSite: '隨手ツールについて',
      contact: 'お問い合わせ',
      privacy: 'プライバシーポリシー',
      terms: '利用規約',
      blog: '6yuwei ブログ（中国語）',
    },
    home: {
      heroBefore: 'インストール不要の',
      heroAccent: 'オンラインツール',
      heroAfter: '',
      lead: '{count} 個の無料ツールをブラウザだけで。会員登録もインストールも不要で、入力した内容はサーバーに送信されません。',
      searchLabel: 'ツールを検索',
      searchPlaceholder: '何をしますか？（例：BMI、パスワード、文字数）',
      popularAria: '人気のツール',
      appNote: 'アプリとしてインストールすれば、ホーム画面からすぐに開けます。',
      appNoteLink: 'インストール方法',
      empty: '該当するツールが見つかりません。別のキーワードでお試しください。',
      categoryAll: 'すべて見る（{count}）',
    },
    tool: {
      howTo: '{name}の使い方',
      conversions: 'よく使う換算',
      faq: 'よくある質問',
      furtherReading: '関連記事',
      updated: '最終更新：',
      related: 'こちらもおすすめ',
      moreInCategory: 'ほかの{category}',
      toolAria: '{name}',
    },
    category: {
      title: '{name}の無料オンラインツール：{blurb}',
      others: 'ほかのカテゴリ',
    },
    notFound: {
      title: 'ページが見つかりません',
      description: 'お探しのページは存在しません。',
      heading: 'ページが見つかりませんでした',
      before: 'URL が間違っているか、ツールが移動した可能性があります。',
      link: 'トップページ',
      after: 'から検索するか、人気のツールをお試しください。',
    },
  },
};

export function getUi(locale: Locale): UiStrings {
  return ui[locale];
}

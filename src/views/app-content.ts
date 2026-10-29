// Copy for the "install as an app" page (/app/, /en/app/, /ja/app/).
import type { Locale } from '../i18n/locales';

interface AppContent {
  title: string;
  description: string;
  crumb: string;
  heading: string;
  lead: string;
  standalone: string;
  benefitsAria: string;
  howHeading: string;
  faqHeading: string;
  benefits: { icon: string; title: string; body: string }[];
  platforms: { icon: string; title: string; steps: string[] }[];
  faq: { q: string; a: string }[];
}

export const appContent: Record<Locale, AppContent> = {
  'zh-TW': {
    title: '安裝成 App：把隨手加到手機主畫面或電腦',
    description:
      '隨手可以安裝成 App：加到 iPhone、Android 主畫面或 Windows、Mac 桌面，獨立視窗開啟，長按圖示直達常用工具。免費、免註冊、不用到商店下載。',
    crumb: '安裝成 App',
    heading: '把隨手裝成 App',
    lead: '不用到商店下載，加到主畫面或桌面就能像 App 一樣使用，下次一鍵就能打開常用工具。',
    standalone: '你現在就是用 App 開啟的。',
    benefitsAria: '安裝的好處',
    howHeading: '怎麼安裝',
    faqHeading: '常見問題',
    benefits: [
      { icon: 'LayoutGrid', title: '主畫面一鍵開啟', body: '像一般 App 一樣出現在手機主畫面、電腦 Dock 或開始選單。' },
      { icon: 'Maximize', title: '獨立視窗', body: '沒有網址列和分頁，畫面更大，專心用工具。' },
      {
        icon: 'Zap',
        title: '常用工具直達',
        body: '在圖示上長按（手機）或按右鍵（電腦），可直接開啟薪資計算機、計算機、匯率等常用工具。',
      },
      { icon: 'RefreshCw', title: '自動更新', body: '不用到商店下載更新，每次連線開啟就是最新版。' },
    ],
    platforms: [
      {
        icon: 'Smartphone',
        title: 'iPhone、iPad（Safari）',
        steps: ['用 Safari 開啟 tool.6yuwei.com。', '點下方工具列的「分享」按鈕。', '往下滑，點「加入主畫面」。', '確認名稱後點「新增」。'],
      },
      {
        icon: 'TabletSmartphone',
        title: 'Android（Chrome）',
        steps: ['用 Chrome 開啟 tool.6yuwei.com。', '點右上角「⋮」選單。', '點「安裝應用程式」或「加到主畫面」。', '點「安裝」。'],
      },
      {
        icon: 'Monitor',
        title: 'Windows、Mac（Chrome 或 Edge）',
        steps: [
          '開啟 tool.6yuwei.com。',
          '點網址列右側的「安裝」圖示，或選單中的「安裝隨手」。',
          '點「安裝」，之後可從桌面、Dock 或開始選單開啟。',
        ],
      },
      {
        icon: 'Laptop',
        title: 'Mac（Safari）',
        steps: ['用 Safari 開啟 tool.6yuwei.com。', '點選單列「檔案」→「加入 Dock」。', '點「加入」。'],
      },
    ],
    faq: [
      { q: '安裝要錢嗎？', a: '完全免費，不需要註冊帳號，也不用到 App Store 或 Google Play 下載。' },
      { q: '會佔用很多空間嗎？', a: '幾乎不佔空間。安裝後只是在主畫面放一個捷徑，工具內容每次開啟時從網路載入。' },
      { q: '沒有網路可以用嗎？', a: '需要網路。每次開啟都會載入最新版本的工具與資料，例如最新的勞健保費率與匯率。' },
      { q: '怎麼移除？', a: '和一般 App 一樣：手機長按圖示選擇移除；電腦在 App 視窗的選單中選「解除安裝」。' },
      { q: '我的資料會上傳嗎？', a: '不會。所有工具都在你的裝置上計算，安裝成 App 後也一樣。' },
    ],
  },

  en: {
    title: 'Install Suishou Tools as an App on Your Phone or Computer',
    description:
      'Add Suishou Tools to your iPhone or Android home screen, or install it on Windows and Mac. It opens in its own window with shortcuts to your favorite tools. Free, no account, no app store.',
    crumb: 'Install as an app',
    heading: 'Install Suishou Tools as an app',
    lead: 'No app store needed. Add it to your home screen or desktop and it works like a regular app, one tap away the next time you need a tool.',
    standalone: 'You’re already using the installed app.',
    benefitsAria: 'Why install it',
    howHeading: 'How to install',
    faqHeading: 'Frequently asked questions',
    benefits: [
      { icon: 'LayoutGrid', title: 'One tap from your home screen', body: 'It sits on your home screen, in the Dock or in the Start menu like any other app.' },
      { icon: 'Maximize', title: 'Its own window', body: 'No address bar or tabs, so you get more room for the tool itself.' },
      {
        icon: 'Zap',
        title: 'Shortcuts to favorite tools',
        body: 'Long-press the icon on your phone, or right-click it on a computer, to jump straight to popular tools.',
      },
      { icon: 'RefreshCw', title: 'Always up to date', body: 'There are no updates to download. Every time you open it, you get the latest version.' },
    ],
    platforms: [
      {
        icon: 'Smartphone',
        title: 'iPhone and iPad (Safari)',
        steps: [
          'Open tool.6yuwei.com/en/ in Safari.',
          'Tap the Share button in the toolbar.',
          'Scroll down and tap “Add to Home Screen”.',
          'Check the name and tap “Add”.',
        ],
      },
      {
        icon: 'TabletSmartphone',
        title: 'Android (Chrome)',
        steps: [
          'Open tool.6yuwei.com/en/ in Chrome.',
          'Tap the ⋮ menu in the top-right corner.',
          'Tap “Install app” or “Add to Home screen”.',
          'Tap “Install”.',
        ],
      },
      {
        icon: 'Monitor',
        title: 'Windows and Mac (Chrome or Edge)',
        steps: [
          'Open tool.6yuwei.com/en/.',
          'Click the install icon at the right end of the address bar, or choose “Install” from the browser menu.',
          'Click “Install”. You can then open it from the desktop, Dock or Start menu.',
        ],
      },
      {
        icon: 'Laptop',
        title: 'Mac (Safari)',
        steps: ['Open tool.6yuwei.com/en/ in Safari.', 'Choose File → Add to Dock in the menu bar.', 'Click “Add”.'],
      },
    ],
    faq: [
      { q: 'Does it cost anything?', a: 'No. It’s completely free, needs no account, and doesn’t go through the App Store or Google Play.' },
      {
        q: 'Will it take up a lot of storage?',
        a: 'Hardly any. Installing just adds a shortcut; the tools load from the web each time you open them.',
      },
      {
        q: 'Does it work offline?',
        a: 'No, you need an internet connection. That way you always get the latest version of every tool.',
      },
      {
        q: 'How do I uninstall it?',
        a: 'Like any other app: long-press the icon on your phone and remove it, or choose “Uninstall” from the app window’s menu on a computer.',
      },
      { q: 'Is my data uploaded?', a: 'No. Every tool runs on your device, and that doesn’t change when you install it as an app.' },
    ],
  },

  ja: {
    title: 'アプリとして使う：隨手ツールをスマホのホーム画面やパソコンに追加',
    description:
      '隨手ツールは iPhone・Android のホーム画面や Windows・Mac のデスクトップに追加して、アプリのように使えます。専用ウィンドウで開き、よく使うツールにすぐアクセス。無料・登録不要です。',
    crumb: 'アプリとして使う',
    heading: '隨手ツールをアプリとして使う',
    lead: 'アプリストアからのダウンロードは不要です。ホーム画面やデスクトップに追加すれば、普通のアプリと同じようにワンタップで開けます。',
    standalone: 'いまアプリとして開いています。',
    benefitsAria: 'インストールのメリット',
    howHeading: 'インストール方法',
    faqHeading: 'よくある質問',
    benefits: [
      { icon: 'LayoutGrid', title: 'ホーム画面からワンタップ', body: 'スマホのホーム画面、Mac の Dock、Windows のスタートメニューに普通のアプリと同じように並びます。' },
      { icon: 'Maximize', title: '専用ウィンドウ', body: 'アドレスバーやタブがないので画面を広く使え、ツールに集中できます。' },
      {
        icon: 'Zap',
        title: 'よく使うツールへ直行',
        body: 'アイコンを長押し（スマホ）または右クリック（パソコン）すると、人気のツールを直接開けます。',
      },
      { icon: 'RefreshCw', title: '自動で最新版', body: 'アップデートのダウンロードは不要です。開くたびに最新版が読み込まれます。' },
    ],
    platforms: [
      {
        icon: 'Smartphone',
        title: 'iPhone・iPad（Safari）',
        steps: [
          'Safari で tool.6yuwei.com/ja/ を開きます。',
          '画面下部の「共有」ボタンをタップします。',
          '下にスクロールして「ホーム画面に追加」をタップします。',
          '名前を確認して「追加」をタップします。',
        ],
      },
      {
        icon: 'TabletSmartphone',
        title: 'Android（Chrome）',
        steps: [
          'Chrome で tool.6yuwei.com/ja/ を開きます。',
          '右上の「⋮」メニューをタップします。',
          '「アプリをインストール」または「ホーム画面に追加」をタップします。',
          '「インストール」をタップします。',
        ],
      },
      {
        icon: 'Monitor',
        title: 'Windows・Mac（Chrome / Edge）',
        steps: [
          'tool.6yuwei.com/ja/ を開きます。',
          'アドレスバー右端のインストールアイコン、またはブラウザのメニューから「インストール」を選びます。',
          '「インストール」をクリックすると、デスクトップや Dock、スタートメニューから開けるようになります。',
        ],
      },
      {
        icon: 'Laptop',
        title: 'Mac（Safari）',
        steps: ['Safari で tool.6yuwei.com/ja/ を開きます。', 'メニューバーの「ファイル」→「Dock に追加」を選びます。', '「追加」をクリックします。'],
      },
    ],
    faq: [
      { q: '料金はかかりますか？', a: '完全に無料です。アカウント登録も、App Store や Google Play からのダウンロードも必要ありません。' },
      {
        q: '容量を多く使いますか？',
        a: 'ほとんど使いません。インストールしてもホーム画面にショートカットが追加されるだけで、ツールは開くたびにネットから読み込まれます。',
      },
      { q: 'オフラインでも使えますか？', a: 'インターネット接続が必要です。そのかわり、いつでも最新版のツールを使えます。' },
      {
        q: 'アンインストールするには？',
        a: '普通のアプリと同じです。スマホではアイコンを長押しして削除、パソコンではアプリのウィンドウのメニューから「アンインストール」を選びます。',
      },
      { q: '入力したデータは送信されますか？', a: 'いいえ。すべてのツールは端末内で計算されます。アプリとしてインストールしても変わりません。' },
    ],
  },
};

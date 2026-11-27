import { defineToolI18n } from '../../i18n/tool';
import type { DocumentLocale } from './logic';

export interface Strings {
  viewAria: string;
  edit: string;
  preview: string;
  breaks: string;
  placeholder: string;
  loading: string;
  copyHtml: string;
  downloadMd: string;
  downloadHtml: string;
  sample: string;
  clear: string;
  client: {
    /** Which built-in sample to load. */
    sample: 'zh' | 'en' | 'ja';
    document: DocumentLocale;
    loadFailed: string;
    empty: string;
    /** {chars} {lines} */
    meta: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    viewAria: '切換編輯或預覽',
    edit: '編輯',
    preview: '預覽',
    breaks: '單一換行也換行',
    placeholder: '在這裡輸入 Markdown…',
    loading: '載入中…',
    copyHtml: '複製 HTML',
    downloadMd: '下載 .md',
    downloadHtml: '下載 .html',
    sample: '載入範例',
    clear: '清除',
    client: {
      sample: 'zh',
      document: {
        lang: 'zh-Hant-TW',
        fonts: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
      },
      loadFailed: '預覽元件載入失敗，請重新整理頁面。',
      empty: '預覽會顯示在這裡',
      meta: '{chars} 個字元 · {lines} 行',
    },
  },
  en: {
    viewAria: 'Switch between editor and preview',
    edit: 'Edit',
    preview: 'Preview',
    breaks: 'Treat single line breaks as <br>',
    placeholder: 'Type or paste Markdown here…',
    loading: 'Loading…',
    copyHtml: 'Copy HTML',
    downloadMd: 'Download .md',
    downloadHtml: 'Download .html',
    sample: 'Load example',
    clear: 'Clear',
    client: {
      sample: 'en',
      document: {
        lang: 'en',
        fonts: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      loadFailed: 'The preview couldn’t load. Please refresh the page.',
      empty: 'Your preview will appear here',
      meta: '{chars} characters · {lines} lines',
    },
  },
  ja: {
    viewAria: '編集とプレビューを切り替え',
    edit: '編集',
    preview: 'プレビュー',
    breaks: '1 回の改行でも改行する',
    placeholder: 'ここに Markdown を入力…',
    loading: '読み込み中…',
    copyHtml: 'HTML をコピー',
    downloadMd: '.md をダウンロード',
    downloadHtml: '.html をダウンロード',
    sample: 'サンプルを読み込む',
    clear: 'クリア',
    client: {
      sample: 'ja',
      document: {
        lang: 'ja',
        fonts:
          '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", Meiryo, sans-serif',
      },
      loadFailed: 'プレビューの読み込みに失敗しました。ページを再読み込みしてください。',
      empty: 'ここにプレビューが表示されます',
      meta: '{chars} 文字 · {lines} 行',
    },
  },
});

// UI strings for the word counter. Each locale also picks which stats to show and which one is the
// headline number, because "word count" means different things in Chinese, English and Japanese.
import { defineToolI18n } from '../../i18n/tool';
import type { ReadingTimeLabels, TextStats } from './logic';

/** Numeric TextStats fields, plus computed cells handled in Tool.astro's script. */
export type StatKey = Exclude<keyof TextStats, 'readingMinutes'> | 'reading' | 'speaking' | 'genko';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  /** Stat shown as the big number. */
  main: Exclude<StatKey, 'reading' | 'speaking' | 'genko'>;
  mainLabel: string;
  stats: { key: StatKey; label: string }[];
  copy: string;
  clear: string;
  /** Passed to the client script. */
  client: {
    reading: ReadingTimeLabels;
    /** 原稿用紙 cell; {sheets} {rows}. Only used by locales that show 'genko'. */
    genko: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '輸入或貼上文字',
    placeholder: '在這裡貼上你的文章、報告或貼文內容…',
    main: 'mixedCount',
    mainLabel: '字數（中文字 + 英文單字）',
    stats: [
      { key: 'characters', label: '總字元（含空白）' },
      { key: 'charactersNoSpaces', label: '字元（不含空白）' },
      { key: 'cjk', label: '中文字' },
      { key: 'words', label: '英文單字' },
      { key: 'punctuation', label: '標點符號' },
      { key: 'lines', label: '行數' },
      { key: 'paragraphs', label: '段落' },
      { key: 'reading', label: '閱讀時間' },
    ],
    copy: '複製文字',
    clear: '清除',
    client: {
      reading: { zero: '0 分鐘', underOne: '不到 1 分鐘', about: '約 {n} 分鐘' },
      genko: '',
    },
  },
  en: {
    inputLabel: 'Type or paste your text',
    placeholder: 'Paste your essay, article or post here…',
    main: 'words',
    mainLabel: 'Words',
    stats: [
      { key: 'characters', label: 'Characters' },
      { key: 'charactersNoSpaces', label: 'Characters (no spaces)' },
      { key: 'sentences', label: 'Sentences' },
      { key: 'paragraphs', label: 'Paragraphs' },
      { key: 'lines', label: 'Lines' },
      { key: 'punctuation', label: 'Punctuation marks' },
      { key: 'reading', label: 'Reading time' },
      { key: 'speaking', label: 'Speaking time' },
    ],
    copy: 'Copy text',
    clear: 'Clear',
    client: {
      reading: { zero: '0 min', underOne: '< 1 min', about: '~{n} min' },
      genko: '',
    },
  },
  ja: {
    inputLabel: '文章を入力または貼り付け',
    placeholder: 'レポート、原稿、SNS の投稿などをここに貼り付けてください…',
    main: 'charactersNoSpaces',
    mainLabel: '文字数（空白・改行を除く）',
    stats: [
      { key: 'characters', label: '文字数（空白・改行を含む）' },
      { key: 'genko', label: '原稿用紙（400字詰め）' },
      { key: 'cjk', label: '漢字' },
      { key: 'hiragana', label: 'ひらがな' },
      { key: 'katakana', label: 'カタカナ' },
      { key: 'words', label: '英単語' },
      { key: 'lines', label: '行数' },
      { key: 'paragraphs', label: '段落数' },
      { key: 'reading', label: '読了時間の目安' },
    ],
    copy: 'テキストをコピー',
    clear: 'クリア',
    client: {
      reading: { zero: '0 分', underOne: '1 分未満', about: '約 {n} 分' },
      genko: '{sheets} 枚（{rows} 行）',
    },
  },
});

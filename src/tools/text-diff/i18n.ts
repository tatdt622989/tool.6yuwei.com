import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export interface Strings {
  oldLabel: string;
  oldPlaceholder: string;
  newLabel: string;
  newPlaceholder: string;
  ignoreWhitespace: string;
  ignoreCase: string;
  collapse: string;
  inlineLabel: string;
  inlineWord: string;
  inlineChar: string;
  inlineNone: string;
  viewLabel: string;
  viewSplit: string;
  viewUnified: string;
  statAdded: string;
  statRemoved: string;
  statUnchanged: string;
  swap: string;
  clear: string;
  client: {
    empty: string;
    sameIgnoring: string;
    same: string;
    /** Collapsed unchanged lines; {n} is the count. */
    skip: PluralForms;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    oldLabel: '原始文字',
    oldPlaceholder: '貼上修改前的版本',
    newLabel: '修改後文字',
    newPlaceholder: '貼上修改後的版本',
    ignoreWhitespace: '忽略空白差異',
    ignoreCase: '忽略大小寫',
    collapse: '隱藏相同的行',
    inlineLabel: '行內差異',
    inlineWord: '字詞',
    inlineChar: '字元',
    inlineNone: '關閉',
    viewLabel: '檢視方式',
    viewSplit: '左右並排',
    viewUnified: '單欄',
    statAdded: '新增行',
    statRemoved: '刪除行',
    statUnchanged: '相同行',
    swap: '左右交換',
    clear: '清除',
    client: {
      empty: '在上方兩個欄位貼上文字，差異會自動標示在這裡。',
      sameIgnoring: '在目前的忽略條件下，兩段文字沒有差異。',
      same: '兩段文字完全相同。',
      skip: { other: '略過 {n} 行相同內容' },
    },
  },
  en: {
    oldLabel: 'Original text',
    oldPlaceholder: 'Paste the original version',
    newLabel: 'Changed text',
    newPlaceholder: 'Paste the new version',
    ignoreWhitespace: 'Ignore whitespace',
    ignoreCase: 'Ignore case',
    collapse: 'Hide unchanged lines',
    inlineLabel: 'Highlight changes by',
    inlineWord: 'Word',
    inlineChar: 'Character',
    inlineNone: 'Off',
    viewLabel: 'View',
    viewSplit: 'Side by side',
    viewUnified: 'Unified',
    statAdded: 'Lines added',
    statRemoved: 'Lines removed',
    statUnchanged: 'Unchanged',
    swap: 'Swap sides',
    clear: 'Clear',
    client: {
      empty: 'Paste text into both boxes above and the differences will be highlighted here.',
      sameIgnoring: 'No differences with the current ignore options.',
      same: 'The two texts are identical.',
      skip: { one: '{n} unchanged line hidden', other: '{n} unchanged lines hidden' },
    },
  },
  ja: {
    oldLabel: '変更前のテキスト',
    oldPlaceholder: '元の文章を貼り付け',
    newLabel: '変更後のテキスト',
    newPlaceholder: '修正後の文章を貼り付け',
    ignoreWhitespace: '空白の違いを無視',
    ignoreCase: '大文字・小文字を無視',
    collapse: '同じ行を折りたたむ',
    inlineLabel: '行内の差分',
    inlineWord: '単語',
    inlineChar: '文字',
    inlineNone: 'オフ',
    viewLabel: '表示方法',
    viewSplit: '左右に並べる',
    viewUnified: '1 列',
    statAdded: '追加行',
    statRemoved: '削除行',
    statUnchanged: '同じ行',
    swap: '左右を入れ替え',
    clear: 'クリア',
    client: {
      empty: '上の 2 つの欄にテキストを貼り付けると、違いがここに表示されます。',
      sameIgnoring: '現在の無視設定では、2 つのテキストに違いはありません。',
      same: '2 つのテキストは完全に一致しています。',
      skip: { other: '同じ内容の {n} 行を省略' },
    },
  },
});

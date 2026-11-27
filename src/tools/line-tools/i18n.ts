import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { Collation, NumberFormat, ZhCollation } from './logic';

/** Operation ids used by data-op buttons and the result messages. */
export type LineOp =
  | 'asc'
  | 'desc'
  | 'natural'
  | 'length'
  | 'reverse'
  | 'shuffle'
  | 'dedupe'
  | 'empty'
  | 'trim'
  | 'affix'
  | 'number';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  statTotal: string;
  statNonEmpty: string;
  statDupes: string;
  copy: string;
  undo: string;
  clear: string;
  sortTitle: string;
  asc: string;
  desc: string;
  natural: string;
  byLength: string;
  reverse: string;
  shuffle: string;
  caseSensitive: string;
  /** Chinese collation picker (zh only). Other locales sort with `client.collation`. */
  zhCollation?: { label: string; options: { value: ZhCollation; label: string }[] };
  cleanTitle: string;
  dedupe: string;
  removeEmpty: string;
  trim: string;
  affixTitle: string;
  prefixPlaceholder: string;
  prefixAria: string;
  suffixPlaceholder: string;
  suffixAria: string;
  addAffix: string;
  numberTitle: string;
  numberFormatAria: string;
  numberFormats: { value: NumberFormat; label: string }[];
  start: string;
  pad: string;
  addNumbers: string;
  client: {
    /** Collation used when the page has no Chinese collation picker. */
    collation?: Collation;
    done: Record<LineOp, string>;
    /** {label} {before} {after}; before/after are filled with `lines`. */
    result: string;
    lines: PluralForms;
    empty: string;
    noAffix: string;
    undone: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '文字內容（每行一筆）',
    placeholder: '貼上名單、關鍵字或任何一行一筆的資料，再點選下方的操作',
    statTotal: '行數',
    statNonEmpty: '非空白行',
    statDupes: '重複行',
    copy: '複製結果',
    undo: '復原',
    clear: '清除',
    sortTitle: '排序',
    asc: 'A → Z',
    desc: 'Z → A',
    natural: '數字自然排序',
    byLength: '依長度',
    reverse: '反轉順序',
    shuffle: '隨機打亂',
    caseSensitive: '區分大小寫',
    zhCollation: {
      label: '中文排序',
      options: [
        { value: 'stroke', label: '依筆畫' },
        { value: 'zhuyin', label: '依注音' },
      ],
    },
    cleanTitle: '整理',
    dedupe: '移除重複行',
    removeEmpty: '移除空白行',
    trim: '去除每行前後空白',
    affixTitle: '加上前綴／後綴',
    prefixPlaceholder: '前綴，例如 "',
    prefixAria: '前綴',
    suffixPlaceholder: '後綴，例如 ",',
    suffixAria: '後綴',
    addAffix: '加上',
    numberTitle: '加上行號',
    numberFormatAria: '行號格式',
    numberFormats: [
      { value: 'dot', label: '1. 文字' },
      { value: 'paren', label: '1) 文字' },
      { value: 'comma', label: '1、文字' },
      { value: 'tab', label: '1（Tab）文字' },
    ],
    start: '起始',
    pad: '補零（01、02）',
    addNumbers: '加上行號',
    client: {
      done: {
        asc: '已依 A → Z 排序',
        desc: '已依 Z → A 排序',
        natural: '已依數字自然排序',
        length: '已依長度排序',
        reverse: '已反轉順序',
        shuffle: '已隨機打亂',
        dedupe: '已移除重複行',
        empty: '已移除空白行',
        trim: '已去除前後空白',
        affix: '已加上前綴／後綴',
        number: '已加上行號',
      },
      result: '{label}：{before} → {after}',
      lines: { other: '{n} 行' },
      empty: '請先輸入或貼上文字。',
      noAffix: '請先輸入前綴或後綴。',
      undone: '已復原上一步。',
    },
  },
  en: {
    inputLabel: 'Your list (one item per line)',
    placeholder: 'Paste a list, keywords, emails or any one-per-line data, then pick an action below',
    statTotal: 'Lines',
    statNonEmpty: 'Non-empty',
    statDupes: 'Duplicates',
    copy: 'Copy result',
    undo: 'Undo',
    clear: 'Clear',
    sortTitle: 'Sort',
    asc: 'A → Z',
    desc: 'Z → A',
    natural: 'Natural (1, 2, 10)',
    byLength: 'By length',
    reverse: 'Reverse order',
    shuffle: 'Shuffle',
    caseSensitive: 'Case sensitive',
    cleanTitle: 'Clean up',
    dedupe: 'Remove duplicates',
    removeEmpty: 'Remove empty lines',
    trim: 'Trim spaces',
    affixTitle: 'Add prefix / suffix',
    prefixPlaceholder: 'Prefix, e.g. "',
    prefixAria: 'Prefix',
    suffixPlaceholder: 'Suffix, e.g. ",',
    suffixAria: 'Suffix',
    addAffix: 'Add',
    numberTitle: 'Number lines',
    numberFormatAria: 'Number format',
    numberFormats: [
      { value: 'dot', label: '1. Text' },
      { value: 'paren', label: '1) Text' },
      { value: 'tab', label: '1 (Tab) Text' },
    ],
    start: 'Start at',
    pad: 'Leading zeros (01, 02)',
    addNumbers: 'Add numbers',
    client: {
      collation: 'en',
      done: {
        asc: 'Sorted A → Z',
        desc: 'Sorted Z → A',
        natural: 'Sorted naturally',
        length: 'Sorted by length',
        reverse: 'Reversed',
        shuffle: 'Shuffled',
        dedupe: 'Duplicates removed',
        empty: 'Empty lines removed',
        trim: 'Spaces trimmed',
        affix: 'Prefix / suffix added',
        number: 'Line numbers added',
      },
      result: '{label}: {before} → {after}',
      lines: { one: '{n} line', other: '{n} lines' },
      empty: 'Type or paste some text first.',
      noAffix: 'Enter a prefix or a suffix first.',
      undone: 'Last step undone.',
    },
  },
  ja: {
    inputLabel: 'テキスト（1 行に 1 項目）',
    placeholder: '名簿、キーワード、メールアドレスなど 1 行 1 件のデータを貼り付けて、下の操作を選んでください',
    statTotal: '行数',
    statNonEmpty: '空行以外',
    statDupes: '重複行',
    copy: '結果をコピー',
    undo: '元に戻す',
    clear: 'クリア',
    sortTitle: '並べ替え',
    asc: '昇順（A → Z）',
    desc: '降順（Z → A）',
    natural: '数字順（1, 2, 10）',
    byLength: '文字数順',
    reverse: '逆順にする',
    shuffle: 'シャッフル',
    caseSensitive: '大文字と小文字を区別',
    cleanTitle: '整理',
    dedupe: '重複行を削除',
    removeEmpty: '空行を削除',
    trim: '行頭・行末の空白を削除',
    affixTitle: '行頭・行末に文字を追加',
    prefixPlaceholder: '行頭に追加（例：「）',
    prefixAria: '行頭に追加する文字',
    suffixPlaceholder: '行末に追加（例：」）',
    suffixAria: '行末に追加する文字',
    addAffix: '追加',
    numberTitle: '行番号を付ける',
    numberFormatAria: '番号の形式',
    numberFormats: [
      { value: 'dot', label: '1. テキスト' },
      { value: 'paren', label: '1) テキスト' },
      { value: 'comma', label: '1、テキスト' },
      { value: 'tab', label: '1（タブ）テキスト' },
    ],
    start: '開始番号',
    pad: 'ゼロ埋め（01、02）',
    addNumbers: '番号を付ける',
    client: {
      collation: 'ja',
      done: {
        asc: '昇順（A → Z・あ → ん）に並べ替えました',
        desc: '降順（Z → A・ん → あ）に並べ替えました',
        natural: '数字順に並べ替えました',
        length: '文字数順に並べ替えました',
        reverse: '逆順にしました',
        shuffle: 'シャッフルしました',
        dedupe: '重複行を削除しました',
        empty: '空行を削除しました',
        trim: '前後の空白を削除しました',
        affix: '行頭・行末に文字を追加しました',
        number: '行番号を付けました',
      },
      result: '{label}：{before} → {after}',
      lines: { other: '{n} 行' },
      empty: '先にテキストを入力するか貼り付けてください。',
      noAffix: '行頭か行末に追加する文字を入力してください。',
      undone: '1 つ前の状態に戻しました。',
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { PunctuationMode } from './logic';

/** Stat cells: ids are fw-s-<key>. */
export type StatKey = 'alnum' | 'symbols' | 'spaces' | 'kana' | 'changed';

export interface Strings {
  dirLabel: string;
  toHalf: string;
  toFull: string;
  punctLabel: string;
  /** Punctuation modes offered on this page (first is the default). */
  punctOptions: { value: PunctuationMode; label: string }[];
  classesLegend: string;
  letters: string;
  digits: string;
  symbols: string;
  space: string;
  /** Katakana checkbox; only Japanese has half-width kana. */
  kana?: string;
  inputLabel: string;
  placeholder: string;
  outputLabel: string;
  outputPlaceholder: string;
  stats: { key: StatKey; label: string }[];
  copy: string;
  apply: string;
  clear: string;
  client: {
    hints: Partial<Record<PunctuationMode, string>>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dirLabel: '轉換方向',
    toHalf: '全形 → 半形',
    toFull: '半形 → 全形',
    punctLabel: '標點轉換',
    punctOptions: [
      { value: 'none', label: '不轉換' },
      { value: 'zhToEn', label: '中文標點 → 英文標點' },
      { value: 'enToZh', label: '英文標點 → 中文標點' },
    ],
    classesLegend: '轉換範圍',
    letters: '英文字母',
    digits: '數字',
    symbols: '符號（，！？（）等）',
    space: '空白',
    inputLabel: '原始文字',
    placeholder: '例如：ＡＢＣ１２３　或　iPhone 15, 128GB',
    outputLabel: '轉換結果',
    outputPlaceholder: '結果會即時顯示在這裡',
    stats: [
      { key: 'alnum', label: '原文全形英數' },
      { key: 'symbols', label: '原文全形符號' },
      { key: 'spaces', label: '原文全形空白' },
      { key: 'changed', label: '已轉換字元' },
    ],
    copy: '複製結果',
    apply: '以結果取代原文',
    clear: '清除',
    client: {
      hints: {
        none: '中文內容通常保留全形標點；只想把全形英數字改成半形時，維持預設即可。',
        zhToEn: '會把，。、「」（）等中文標點換成英文標點，並在英文字前補上空格。',
        enToZh: '只轉換緊鄰中文字的英文標點，英文句子、數字（3.14、12:30）與網址不受影響。',
      },
    },
  },
  ja: {
    dirLabel: '変換の方向',
    toHalf: '全角 → 半角',
    toFull: '半角 → 全角',
    punctLabel: '句読点・かっこ',
    punctOptions: [
      { value: 'none', label: '変換しない' },
      { value: 'zhToEn', label: '、。「」（）→ , . " " ( )' },
    ],
    classesLegend: '変換する文字',
    letters: '英字',
    digits: '数字',
    symbols: '記号（！？＠（）など）',
    space: 'スペース',
    kana: 'カタカナ（ｶﾀｶﾅ ⇄ カタカナ）',
    inputLabel: '変換したいテキスト',
    placeholder: '例：ＡＢＣ１２３　ｶﾀｶﾅ　iPhone 15、128GB',
    outputLabel: '変換結果',
    outputPlaceholder: '入力すると結果がここに表示されます',
    stats: [
      { key: 'alnum', label: '全角英数字' },
      { key: 'spaces', label: '全角スペース' },
      { key: 'kana', label: '半角カナ' },
      { key: 'changed', label: '変換した文字' },
    ],
    copy: '結果をコピー',
    apply: '結果を入力欄に戻す',
    clear: 'クリア',
    client: {
      hints: {
        none: '日本語の文章では、句読点やかっこは全角のままにするのが一般的です。',
        zhToEn: '、。「」（）などの和文の約物を半角記号に置き換え、英数字の前にはスペースを入れます。',
      },
    },
  },
});

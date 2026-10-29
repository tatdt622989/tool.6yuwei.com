import { defineToolI18n } from '../../i18n/tool';
import type { CaseStyle } from './logic';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  stylesLegend: string;
  /** Hint under each style name; the style names themselves (UPPER CASE, camelCase…) are not translated. */
  hints: Record<CaseStyle, string>;
  outputLabel: string;
  outputPlaceholder: string;
  copy: string;
  apply: string;
  clear: string;
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '輸入文字',
    placeholder: '貼上英文句子、標題或變數名稱，例如 getUserName 或 hello world',
    stylesLegend: '轉換格式',
    hints: {
      upper: '全部大寫',
      lower: '全部小寫',
      title: '標題大寫',
      sentence: '句首大寫',
      toggle: '大小寫互換',
      camel: '小駝峰',
      pascal: '大駝峰',
      snake: '底線',
      kebab: '連字號',
      constant: '常數',
    },
    outputLabel: '轉換結果',
    outputPlaceholder: '結果會即時顯示在這裡',
    copy: '複製結果',
    apply: '以結果取代輸入',
    clear: '清除',
  },
  en: {
    inputLabel: 'Your text',
    placeholder: 'Paste a headline, a sentence or a variable name, e.g. the quick brown fox or getUserName',
    stylesLegend: 'Convert to',
    hints: {
      upper: 'All capitals',
      lower: 'All lowercase',
      title: 'Headline style (AP)',
      sentence: 'Capitalize first word',
      toggle: 'Swap upper/lower',
      camel: 'JS variables',
      pascal: 'Classes, components',
      snake: 'Python, SQL',
      kebab: 'URLs, CSS',
      constant: 'Constants, env vars',
    },
    outputLabel: 'Result',
    outputPlaceholder: 'The converted text appears here as you type',
    copy: 'Copy result',
    apply: 'Use result as input',
    clear: 'Clear',
  },
  ja: {
    inputLabel: '変換したいテキスト',
    placeholder: '英文や見出し、変数名を貼り付けてください（例：hello world、getUserName）',
    stylesLegend: '変換形式',
    hints: {
      upper: 'すべて大文字',
      lower: 'すべて小文字',
      title: '単語の先頭を大文字',
      sentence: '文頭だけ大文字',
      toggle: '大文字と小文字を反転',
      camel: 'キャメルケース',
      pascal: 'パスカルケース',
      snake: 'スネークケース',
      kebab: 'ケバブケース',
      constant: '定数・環境変数',
    },
    outputLabel: '変換結果',
    outputPlaceholder: '入力すると結果がここに表示されます',
    copy: '結果をコピー',
    apply: '結果を入力欄に戻す',
    clear: 'クリア',
  },
});

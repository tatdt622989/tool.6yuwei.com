import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export interface Strings {
  resultLabel: string;
  again: string;
  removeNow: string;
  presetsLabel: string;
  titleLabel: string;
  titlePlaceholder: string;
  optionsLabel: string;
  shuffle: string;
  clear: string;
  speedLabel: string;
  speedFast: string;
  speedNormal: string;
  speedSlow: string;
  autoRemove: string;
  sound: string;
  oddsSummary: string;
  thOption: string;
  thWeight: string;
  thChance: string;
  history: string;
  copyHistory: string;
  clearHistory: string;
  historyEmpty: string;
  /** Show the full-screen button as an icon only (its label is too wide for the title's side padding). */
  fsIconOnly?: boolean;
  client: {
    /** {n} options on the wheel. */
    count: PluralForms;
    weighted: string;
    spin: string;
    minTwo: string;
    spinning: string;
    /** {n} = spin number in the history */
    nth: string;
    errorMin: string;
    errorChanged: string;
    fullscreen: string;
    exitFullscreen: string;
    /** 24-hour clock in the history list. */
    hour12: boolean;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    resultLabel: '結果',
    again: '再轉一次',
    removeNow: '從轉盤移除',
    presetsLabel: '常用轉盤',
    titleLabel: '轉盤標題',
    titlePlaceholder: '例如：午餐吃什麼',
    optionsLabel: '選項（每行一個，可用「選項*3」設定權重）',
    shuffle: '打亂順序',
    clear: '清空',
    speedLabel: '轉動速度',
    speedFast: '快',
    speedNormal: '標準',
    speedSlow: '慢',
    autoRemove: '抽中後自動移除（不重複抽）',
    sound: '轉動音效',
    oddsSummary: '各選項中獎機率',
    thOption: '選項',
    thWeight: '權重',
    thChance: '機率',
    history: '抽獎紀錄',
    copyHistory: '複製紀錄',
    clearHistory: '清除紀錄',
    historyEmpty: '轉動後的結果會依序記錄在這裡，只儲存在你的瀏覽器。',
    client: {
      count: { other: '共 {n} 個選項' },
      weighted: '（含權重）',
      spin: '開始',
      minTwo: '至少 2 項',
      spinning: '轉動中',
      nth: '第 {n} 次結果',
      errorMin: '請至少輸入 2 個選項，每行一個。',
      errorChanged: '選項內容已變更，請直接在清單中刪除。',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      hour12: false,
    },
  },
  en: {
    resultLabel: 'Result',
    again: 'Spin again',
    removeNow: 'Remove from wheel',
    presetsLabel: 'Ready-made wheels',
    titleLabel: 'Wheel title',
    titlePlaceholder: 'e.g. What should I eat?',
    optionsLabel: 'Entries (one per line; add “*3” to give an entry 3× the odds)',
    shuffle: 'Shuffle',
    clear: 'Clear',
    speedLabel: 'Spin speed',
    speedFast: 'Fast',
    speedNormal: 'Normal',
    speedSlow: 'Slow',
    autoRemove: 'Remove each winner before the next spin',
    sound: 'Tick sound',
    oddsSummary: 'Odds for each entry',
    thOption: 'Entry',
    thWeight: 'Weight',
    thChance: 'Chance',
    history: 'Results history',
    copyHistory: 'Copy history',
    clearHistory: 'Clear history',
    historyEmpty: 'Each result is listed here in order. It is saved only in your browser.',
    fsIconOnly: true,
    client: {
      count: { one: '{n} entry', other: '{n} entries' },
      weighted: ' (weighted)',
      spin: 'Spin',
      minTwo: 'Add 2+',
      spinning: '…',
      nth: 'Spin #{n}',
      errorMin: 'Add at least 2 entries, one per line.',
      errorChanged: 'The entries have changed since that spin. Delete the line from the list instead.',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      hour12: true,
    },
  },
  ja: {
    resultLabel: '結果',
    again: 'もう一度回す',
    removeNow: 'ルーレットから外す',
    presetsLabel: 'テンプレート',
    titleLabel: 'ルーレットのタイトル',
    titlePlaceholder: '例：今日のランチ',
    optionsLabel: '項目（1 行に 1 つ。「項目*3」で当たりやすさを 3 倍に）',
    shuffle: '並び替え',
    clear: 'すべて消去',
    speedLabel: '回転スピード',
    speedFast: '速い',
    speedNormal: '普通',
    speedSlow: 'ゆっくり',
    autoRemove: '当たった項目を次の回転前に外す（重複なし）',
    sound: '回転音',
    oddsSummary: '各項目の当選確率',
    thOption: '項目',
    thWeight: '重み',
    thChance: '確率',
    history: '抽選履歴',
    copyHistory: '履歴をコピー',
    clearHistory: '履歴を消去',
    historyEmpty: '回した結果はここに順番に記録されます。データはブラウザ内にのみ保存されます。',
    client: {
      count: { other: '全 {n} 項目' },
      weighted: '（重み付きあり）',
      spin: 'スタート',
      minTwo: '2 つ以上',
      spinning: '回転中',
      nth: '{n} 回目の結果',
      errorMin: '項目を 2 つ以上、1 行に 1 つずつ入力してください。',
      errorChanged: '項目が変更されています。リストから直接削除してください。',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      hour12: false,
    },
  },
});

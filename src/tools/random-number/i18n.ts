import { defineToolI18n } from '../../i18n/tool';
import type { CoinSide, NumberErrorCode } from './logic';

export interface PresetButton {
  label: string;
  /** "min,max,count,unique[,decimals]" — see parsePreset() in logic.ts. */
  preset: string;
  /** Second zone drawn separately (e.g. the Powerball), same format. */
  bonus?: string;
  bonusLabel?: string;
}

export interface Strings {
  modeAria: string;
  modes: { number: string; dice: string; coin: string };
  min: string;
  max: string;
  count: string;
  decimals: string;
  /** Option labels for 0–6 decimal places. */
  decimalOptions: [string, string, string, string, string, string, string];
  unique: string;
  sort: string;
  sortNone: string;
  sortAsc: string;
  sortDesc: string;
  separator: string;
  sepNewline: string;
  sepComma: string;
  sepSpace: string;
  presetsLabel: string;
  presets: PresetButton[];
  generate: string;
  diceCount: string;
  rollDice: string;
  coinCount: string;
  flipCoin: string;
  copy: string;
  client: {
    errors: Record<NumberErrorCode, string>;
    statCount: string;
    statMin: string;
    statMax: string;
    statMean: string;
    /** aria-label of one die: {n} */
    dieFace: string;
    /** Summary of a single die: {n} */
    singleDie: string;
    coin: Record<CoinSide, string>;
    /** Heads/tails stat label with its share: {label} {pct} */
    share: string;
    /** Stat value for a heads/tails count: {n} */
    times: string;
    /** Separator when listing coin results and when copying them. */
    listSep: string;
    /** Second-zone line for lottery presets: {label} {n} */
    bonus?: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '模式',
    modes: { number: '亂數', dice: '擲骰子', coin: '擲硬幣' },
    min: '最小值',
    max: '最大值',
    count: '數量',
    decimals: '小數位數',
    decimalOptions: ['整數', '1 位', '2 位', '3 位', '4 位', '5 位', '6 位'],
    unique: '不重複',
    sort: '排序',
    sortNone: '不排序',
    sortAsc: '由小到大',
    sortDesc: '由大到小',
    separator: '分隔',
    sepNewline: '換行',
    sepComma: '逗號',
    sepSpace: '空白',
    presetsLabel: '快速設定：',
    presets: [
      { label: '1–10', preset: '1,10,1,0' },
      { label: '1–100', preset: '1,100,1,0' },
      { label: '大樂透 6 碼', preset: '1,49,6,1' },
      { label: '0–1（2 位小數）', preset: '0,1,1,0,2' },
    ],
    generate: '產生亂數',
    diceCount: '骰子數量',
    rollDice: '擲骰子',
    coinCount: '擲幾次',
    flipCoin: '擲硬幣',
    copy: '複製結果',
    client: {
      errors: {
        'invalid-bounds': '請輸入有效的最小值與最大值。',
        'min-over-max': '最小值不能大於最大值。',
        'count-too-small': '數量至少要 1 個。',
        'count-too-large': '一次最多產生 {max} 個。',
        'bad-decimals': '小數位數需介於 0 到 {max}。',
        'range-too-wide': '範圍太大，請縮小範圍或減少小數位數。',
        'empty-range': '範圍內沒有符合小數位數的數字。',
        'not-enough-unique': '範圍內只有 {size} 個不同的數字，無法產生 {count} 個不重複的數字。',
      },
      statCount: '個數',
      statMin: '最小',
      statMax: '最大',
      statMean: '平均',
      dieFace: '{n} 點',
      singleDie: '{n} 點',
      coin: { heads: '正面', tails: '反面' },
      share: '{label}（{pct}%）',
      times: '{n} 次',
      listSep: '、',
    },
  },
  en: {
    modeAria: 'Mode',
    modes: { number: 'Numbers', dice: 'Roll dice', coin: 'Flip a coin' },
    min: 'Min',
    max: 'Max',
    count: 'How many',
    decimals: 'Decimals',
    decimalOptions: ['Whole numbers', '1 place', '2 places', '3 places', '4 places', '5 places', '6 places'],
    unique: 'No repeats',
    sort: 'Sort',
    sortNone: 'Unsorted',
    sortAsc: 'Low to high',
    sortDesc: 'High to low',
    separator: 'Separate by',
    sepNewline: 'New line',
    sepComma: 'Comma',
    sepSpace: 'Space',
    presetsLabel: 'Quick picks:',
    presets: [
      { label: '1–10', preset: '1,10,1,0' },
      { label: '1–100', preset: '1,100,1,0' },
      { label: 'Powerball', preset: '1,69,5,1', bonus: '1,26,1', bonusLabel: 'Powerball' },
      { label: 'Mega Millions', preset: '1,70,5,1', bonus: '1,24,1', bonusLabel: 'Mega Ball' },
      { label: '0–1 (2 decimals)', preset: '0,1,1,0,2' },
    ],
    generate: 'Generate',
    diceCount: 'Number of dice',
    rollDice: 'Roll',
    coinCount: 'Number of flips',
    flipCoin: 'Flip',
    copy: 'Copy results',
    client: {
      errors: {
        'invalid-bounds': 'Enter a valid minimum and maximum.',
        'min-over-max': 'The minimum can’t be greater than the maximum.',
        'count-too-small': 'Generate at least 1 number.',
        'count-too-large': 'You can generate up to {max} numbers at a time.',
        'bad-decimals': 'Decimal places must be between 0 and {max}.',
        'range-too-wide': 'That range is too large. Narrow it or use fewer decimal places.',
        'empty-range': 'No numbers with that many decimal places fit in this range.',
        'not-enough-unique': 'This range only has {size} different numbers, so it can’t produce {count} without repeats.',
      },
      statCount: 'Count',
      statMin: 'Lowest',
      statMax: 'Highest',
      statMean: 'Average',
      dieFace: 'Die showing {n}',
      singleDie: 'You rolled {n}',
      coin: { heads: 'Heads', tails: 'Tails' },
      share: '{label} ({pct}%)',
      times: '{n}',
      listSep: ', ',
      bonus: '{label}: {n}',
    },
  },
  ja: {
    modeAria: 'モード',
    modes: { number: '乱数', dice: 'サイコロ', coin: 'コイントス' },
    min: '最小値',
    max: '最大値',
    count: '個数',
    decimals: '小数点以下',
    decimalOptions: ['整数', '1 桁', '2 桁', '3 桁', '4 桁', '5 桁', '6 桁'],
    unique: '重複なし',
    sort: '並び順',
    sortNone: 'そのまま',
    sortAsc: '小さい順',
    sortDesc: '大きい順',
    separator: '区切り',
    sepNewline: '改行',
    sepComma: 'カンマ',
    sepSpace: 'スペース',
    presetsLabel: 'クイック設定：',
    presets: [
      { label: '1〜10', preset: '1,10,1,0' },
      { label: '1〜100', preset: '1,100,1,0' },
      { label: 'ロト6', preset: '1,43,6,1' },
      { label: 'ロト7', preset: '1,37,7,1' },
      { label: 'ミニロト', preset: '1,31,5,1' },
      { label: '0〜1（小数 2 桁）', preset: '0,1,1,0,2' },
    ],
    generate: '乱数を生成',
    diceCount: 'サイコロの数',
    rollDice: 'サイコロを振る',
    coinCount: '投げる回数',
    flipCoin: 'コインを投げる',
    copy: '結果をコピー',
    client: {
      errors: {
        'invalid-bounds': '最小値と最大値を正しく入力してください。',
        'min-over-max': '最小値が最大値より大きくなっています。',
        'count-too-small': '個数は 1 以上にしてください。',
        'count-too-large': '一度に生成できるのは {max} 個までです。',
        'bad-decimals': '小数点以下の桁数は 0〜{max} の範囲で指定してください。',
        'range-too-wide': '範囲が広すぎます。範囲を狭めるか、小数点以下の桁数を減らしてください。',
        'empty-range': '指定した桁数で、この範囲に入る数がありません。',
        'not-enough-unique': 'この範囲には {size} 種類の数しかないため、重複なしで {count} 個は生成できません。',
      },
      statCount: '個数',
      statMin: '最小',
      statMax: '最大',
      statMean: '平均',
      dieFace: '{n} の目',
      singleDie: '{n} の目',
      coin: { heads: '表', tails: '裏' },
      share: '{label}（{pct}%）',
      times: '{n} 回',
      listSep: '、',
    },
  },
});

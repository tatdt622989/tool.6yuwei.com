import { defineToolI18n } from '../../i18n/tool';

export type FieldKey = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'd1' | 'd2';

/**
 * One piece of a card's sentence. Word order differs by language, so each locale lays out
 * its own sentence: plain text, an input (by key), or the increase / decrease switch.
 */
export type Part = string | { field: FieldKey } | { direction: true };

export interface Card {
  title: string;
  parts: Part[];
}

export interface Strings {
  /** Four cards in fixed order: percent of, ratio, change, apply. */
  cards: [Card, Card, Card, Card];
  /** Accessible name of each input. */
  fieldAria: Record<FieldKey, string>;
  /** Default values (the example shown on first visit). */
  defaults: Record<FieldKey, string>;
  directionAria: string;
  increase: string;
  decrease: string;
  client: {
    enterNumber: string;
    wholeZero: string;
    fromZero: string;
    /** Card 3 result: {n} is the absolute change. */
    up: string;
    down: string;
    same: string;
    /** Card 4 formula: {x} {sign} {p} {r} {d}. */
    applyFormula: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    cards: [
      { title: 'X 的 Y% 是多少', parts: [{ field: 'a1' }, '的', { field: 'a2' }, '% 是'] },
      { title: 'X 是 Y 的幾 %', parts: [{ field: 'b1' }, '是', { field: 'b2' }, '的'] },
      { title: '從 X 變成 Y，增減幾 %', parts: ['從', { field: 'c1' }, '變成', { field: 'c2' }] },
      { title: 'X 增加或減少 Y% 後是多少', parts: [{ field: 'd1' }, { direction: true }, { field: 'd2' }, '% 後是'] },
    ],
    fieldAria: {
      a1: '數值 X',
      a2: '百分比 Y',
      b1: '部分 X',
      b2: '全體 Y',
      c1: '原本的數值 X',
      c2: '新的數值 Y',
      d1: '數值 X',
      d2: '百分比 Y',
    },
    defaults: { a1: '2000', a2: '15', b1: '45', b2: '60', c1: '32000', c2: '35000', d1: '1200', d2: '5' },
    directionAria: '增加或減少',
    increase: '增加',
    decrease: '減少',
    client: {
      enterNumber: '請輸入數字',
      wholeZero: '全體不能是 0',
      fromZero: '原本的數值為 0 時無法計算變化百分比',
      up: '增加 {n}%',
      down: '減少 {n}%',
      same: '沒有變化',
      applyFormula: '{x} × (1 {sign} {p}%) = {r}，差額 {d}',
    },
  },
  en: {
    cards: [
      { title: 'What is P% of X?', parts: ['What is', { field: 'a2' }, '% of', { field: 'a1' }] },
      { title: 'X is what percent of Y?', parts: [{ field: 'b1' }, 'is what % of', { field: 'b2' }] },
      { title: 'Percent change from X to Y', parts: ['From', { field: 'c1' }, 'to', { field: 'c2' }] },
      { title: 'Increase or decrease X by P%', parts: [{ direction: true }, { field: 'd1' }, 'by', { field: 'd2' }, '%'] },
    ],
    fieldAria: {
      a1: 'Number X',
      a2: 'Percentage P',
      b1: 'Part X',
      b2: 'Whole Y',
      c1: 'Starting value X',
      c2: 'New value Y',
      d1: 'Number X',
      d2: 'Percentage P',
    },
    defaults: { a1: '80', a2: '15', b1: '45', b2: '60', c1: '50', c2: '65', d1: '250', d2: '20' },
    directionAria: 'Increase or decrease',
    increase: 'Increase',
    decrease: 'Decrease',
    client: {
      enterNumber: 'Enter a number',
      wholeZero: 'The whole can’t be 0',
      fromZero: 'Percent change is undefined when the starting value is 0',
      up: '{n}% increase',
      down: '{n}% decrease',
      same: 'No change',
      applyFormula: '{x} × (1 {sign} {p}%) = {r}, a difference of {d}',
    },
  },
  ja: {
    cards: [
      { title: 'X の P% はいくつ？', parts: [{ field: 'a1' }, 'の', { field: 'a2' }, '% は'] },
      { title: 'X は Y の何%？（割合）', parts: [{ field: 'b1' }, 'は', { field: 'b2' }, 'の'] },
      { title: 'X から Y への増減率', parts: [{ field: 'c1' }, 'から', { field: 'c2' }, 'へ'] },
      { title: 'X を P% 増やす・減らすと？', parts: [{ field: 'd1' }, 'を', { field: 'd2' }, '%', { direction: true }] },
    ],
    fieldAria: {
      a1: 'もとの数 X',
      a2: 'パーセント P',
      b1: '比べる量 X',
      b2: 'もとにする量 Y',
      c1: '変化前の値 X',
      c2: '変化後の値 Y',
      d1: 'もとの数 X',
      d2: 'パーセント P',
    },
    defaults: { a1: '3000', a2: '15', b1: '45', b2: '60', c1: '250000', c2: '265000', d1: '1980', d2: '10' },
    directionAria: '増やすか減らすか',
    increase: '増やす',
    decrease: '減らす',
    client: {
      enterNumber: '数値を入力してください',
      wholeZero: 'もとにする量に 0 は使えません',
      fromZero: '変化前の値が 0 のときは増減率を計算できません',
      up: '{n}% 増加',
      down: '{n}% 減少',
      same: '変化なし',
      applyFormula: '{x} × (1 {sign} {p}%) = {r}（差は {d}）',
    },
  },
});

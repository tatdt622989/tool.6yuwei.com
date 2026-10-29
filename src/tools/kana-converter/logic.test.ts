import { describe, expect, it } from 'vitest';
import {
  convertKana,
  countKana,
  fullToHalfKana,
  halfToFullKana,
  hiraganaToKatakana,
  katakanaToHiragana,
} from './logic';

describe('hiraganaToKatakana', () => {
  it('converts every hiragana including small kana and voiced marks', () => {
    expect(hiraganaToKatakana('あいうえお')).toBe('アイウエオ');
    expect(hiraganaToKatakana('きゃっぷ')).toBe('キャップ');
    expect(hiraganaToKatakana('ゔぁいおりん')).toBe('ヴァイオリン');
    expect(hiraganaToKatakana('ゕゖ')).toBe('ヵヶ');
    expect(hiraganaToKatakana('ゝゞ')).toBe('ヽヾ');
  });

  it('leaves kanji, latin, digits and katakana untouched', () => {
    expect(hiraganaToKatakana('東京とうきょう2026年 ABC カナ')).toBe('東京トウキョウ2026年 ABC カナ');
  });
});

describe('katakanaToHiragana', () => {
  it('converts katakana and keeps the long vowel mark', () => {
    expect(katakanaToHiragana('コーヒー')).toBe('こーひー');
    expect(katakanaToHiragana('ジャパン')).toBe('じゃぱん');
    expect(katakanaToHiragana('ヴィ')).toBe('ゔぃ');
    expect(katakanaToHiragana('ヽヾ')).toBe('ゝゞ');
  });

  it('keeps katakana with no hiragana counterpart', () => {
    expect(katakanaToHiragana('ヷヸヹヺ')).toBe('ヷヸヹヺ');
  });

  it('accepts half-width katakana', () => {
    expect(katakanaToHiragana('ｶﾞｯｺｳ')).toBe('がっこう');
  });
});

describe('fullToHalfKana', () => {
  it('splits voiced and semi-voiced kana into base + mark', () => {
    expect(fullToHalfKana('ガギグゲゴ')).toBe('ｶﾞｷﾞｸﾞｹﾞｺﾞ');
    expect(fullToHalfKana('パピプペポ')).toBe('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ');
    expect(fullToHalfKana('ヴ')).toBe('ｳﾞ');
    expect(fullToHalfKana('ヷヺ')).toBe('ﾜﾞｦﾞ');
  });

  it('converts punctuation and the long vowel mark', () => {
    expect(fullToHalfKana('「コーヒー」、オネガイ。')).toBe('｢ｺｰﾋｰ｣､ｵﾈｶﾞｲ｡');
    expect(fullToHalfKana('・')).toBe('･');
  });

  it('converts hiragana by default (bank transfer names)', () => {
    expect(fullToHalfKana('やまだ たろう')).toBe('ﾔﾏﾀﾞ ﾀﾛｳ');
    expect(fullToHalfKana('やまだ', { hiragana: false })).toBe('やまだ');
  });

  it('optionally converts full-width alphanumerics and spaces', () => {
    expect(fullToHalfKana('カ）ヤマダ　ＡＢＣ１２３', { ascii: true })).toBe('ｶ)ﾔﾏﾀﾞ ABC123');
    expect(fullToHalfKana('ＡＢＣ')).toBe('ＡＢＣ');
  });

  it('keeps kana without a half-width form', () => {
    expect(fullToHalfKana('ヰヱヵヶヮ')).toBe('ヰヱヵヶヮ');
  });
});

describe('halfToFullKana', () => {
  it('combines base + dakuten / handakuten', () => {
    expect(halfToFullKana('ｶﾞｷﾞｸﾞｹﾞｺﾞ')).toBe('ガギグゲゴ');
    expect(halfToFullKana('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ')).toBe('パピプペポ');
    expect(halfToFullKana('ｳﾞｧｲｵﾘﾝ')).toBe('ヴァイオリン');
    expect(halfToFullKana('ﾜﾞｦﾞ')).toBe('ヷヺ');
  });

  it('keeps marks that cannot be combined as standalone marks', () => {
    expect(halfToFullKana('ｱﾞ')).toBe('ア゛');
    expect(halfToFullKana('ｶﾟ')).toBe('カ゜');
    expect(halfToFullKana('ﾞ')).toBe('゛');
  });

  it('round-trips with fullToHalfKana', () => {
    const text = 'ガッコウ ノ センセイ「パソコン」、ヴィーナス。';
    expect(halfToFullKana(fullToHalfKana(text))).toBe(text);
  });

  it('leaves other characters alone', () => {
    expect(halfToFullKana('ABC 123 漢字')).toBe('ABC 123 漢字');
  });
});

describe('convertKana / countKana', () => {
  it('dispatches by mode', () => {
    expect(convertKana('ひらがな', 'hira-to-kata')).toBe('ヒラガナ');
    expect(convertKana('カタカナ', 'kata-to-hira')).toBe('かたかな');
    expect(convertKana('カタカナ', 'to-half')).toBe('ｶﾀｶﾅ');
    expect(convertKana('ｶﾀｶﾅ', 'to-full')).toBe('カタカナ');
  });

  it('counts scripts', () => {
    expect(countKana('漢字とカナとｶﾅ')).toEqual({ hiragana: 2, katakana: 2, halfKana: 2, kanji: 2 });
  });
});

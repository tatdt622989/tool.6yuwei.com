import { describe, expect, it } from 'vitest';
import {
  convertWidth,
  enToZhPunctuation,
  kanaStats,
  kanaToFullwidth,
  kanaToHalfwidth,
  toFullwidth,
  toHalfwidth,
  widthStats,
  zhToEnPunctuation,
  type WidthClasses,
} from './logic';

const all: WidthClasses = { letters: true, digits: true, symbols: true, space: true };

describe('toHalfwidth', () => {
  it('converts every full-width ASCII class', () => {
    expect(toHalfwidth('ＡＢＣ　ａｂｃ　１２３！＠＃', all)).toEqual({ text: 'ABC abc 123!@#', changed: 14 });
  });

  it('covers the whole U+FF01–FF5E range', () => {
    const full = Array.from({ length: 94 }, (_, i) => String.fromCharCode(0xff01 + i)).join('');
    const half = Array.from({ length: 94 }, (_, i) => String.fromCharCode(0x21 + i)).join('');
    expect(toHalfwidth(full, all).text).toBe(half);
    expect(toFullwidth(half, all).text).toBe(full);
  });

  it('respects the selected classes', () => {
    const text = 'ＡＢ１２，　';
    expect(toHalfwidth(text, { ...all, letters: false }).text).toBe('ＡＢ12, ');
    expect(toHalfwidth(text, { ...all, digits: false }).text).toBe('AB１２, ');
    expect(toHalfwidth(text, { ...all, symbols: false }).text).toBe('AB12， ');
    expect(toHalfwidth(text, { ...all, space: false }).text).toBe('AB12,　');
  });

  it('converts currency and other symbols outside the main block', () => {
    expect(toHalfwidth('￥１００　￡５', all).text).toBe('¥100 £5');
    expect(toFullwidth('¥100', all).text).toBe('￥１００');
  });

  it('leaves Chinese text and CJK punctuation alone', () => {
    expect(toHalfwidth('中文。「引號」', all)).toEqual({ text: '中文。「引號」', changed: 0 });
  });
});

describe('toFullwidth', () => {
  it('converts letters, digits, symbols and spaces', () => {
    expect(toFullwidth('Hi 5!', all)).toEqual({ text: 'Ｈｉ　５！', changed: 5 });
  });

  it('only converts chosen classes', () => {
    expect(toFullwidth('A1 b', { letters: true, digits: false, symbols: false, space: false }).text).toBe('Ａ1 ｂ');
  });

  it('round-trips', () => {
    const text = 'The quick brown fox (2026) #1 ~ok~';
    expect(toHalfwidth(toFullwidth(text, all).text, all).text).toBe(text);
  });
});

describe('zhToEnPunctuation', () => {
  it('maps Chinese punctuation to ASCII', () => {
    expect(zhToEnPunctuation('你好，世界。「引號」『內』（括號）【註】《書名》').text).toBe(
      `你好,世界."引號"'內'(括號)[註]<書名>`,
    );
  });

  it('handles multi-character marks', () => {
    expect(zhToEnPunctuation('等等……然後——結束').text).toBe('等等...然後--結束');
  });

  it('adds a space before Latin text', () => {
    expect(zhToEnPunctuation('Hello，world。OK？yes！').text).toBe('Hello, world. OK? yes!');
  });

  it('counts conversions', () => {
    expect(zhToEnPunctuation('一，二、三。').changed).toBe(3);
  });
});

describe('enToZhPunctuation', () => {
  it('converts marks next to Chinese text and removes the trailing space', () => {
    expect(enToZhPunctuation('今天很忙, 明天再說. 好嗎?').text).toBe('今天很忙，明天再說。好嗎？');
  });

  it('leaves English sentences, numbers, times and URLs alone', () => {
    const english = 'Hello, world. Visit example.com at 12:30, pay 1,000.50 now.';
    expect(enToZhPunctuation(english).text).toBe(english);
    expect(enToZhPunctuation('價格是 3.14 元').text).toBe('價格是 3.14 元');
  });

  it('converts quotes and parentheses that enclose Chinese', () => {
    expect(enToZhPunctuation('他說"你好"(笑)').text).toBe('他說「你好」（笑）');
    expect(enToZhPunctuation("她說'可以'").text).toBe('她說『可以』');
    expect(enToZhPunctuation('say "hi" (now)').text).toBe('say "hi" (now)');
    expect(enToZhPunctuation("don't stop").text).toBe("don't stop");
  });

  it('converts ellipsis', () => {
    expect(enToZhPunctuation('然後...').text).toBe('然後……');
  });

  it('can convert everything when not limited to Chinese context', () => {
    expect(enToZhPunctuation('a, b', false).text).toBe('a，b');
  });
});

describe('convertWidth', () => {
  it('runs punctuation conversion before width conversion', () => {
    expect(convertWidth('ＡＢＣ，你好。', { direction: 'toHalf', classes: all, punctuation: 'zhToEn' }).text).toBe(
      'ABC,你好.',
    );
    expect(convertWidth('好, OK.', { direction: 'toFull', classes: all, punctuation: 'enToZh' }).text).toBe('好，ＯＫ．');
  });

  it('reports total changes', () => {
    expect(convertWidth('ＡＢ', { direction: 'toHalf', classes: all, punctuation: 'none' }).changed).toBe(2);
  });
});

describe('widthStats', () => {
  it('counts full-width characters by class', () => {
    expect(widthStats('ＡＢ１！　ab')).toEqual({ fullAlnum: 3, fullSymbols: 1, fullSpaces: 1, halfAlnum: 2 });
  });
});

describe('katakana', () => {
  it('converts half-width kana to full-width, joining voiced marks', () => {
    expect(kanaToFullwidth('ｶﾞｷﾞｸﾞ ﾊﾟﾋﾟﾌﾟ ｳﾞｧｲｵﾘﾝ')).toEqual({ text: 'ガギグ パピプ ヴァイオリン', changed: 12 });
    expect(kanaToFullwidth('ｺｰﾋｰ｡｢ｱｲｳ｣､ﾃｽﾄ･ﾃﾞｰﾀ').text).toBe('コーヒー。「アイウ」、テスト・データ');
    expect(kanaToFullwidth('ﾜﾞ').text).toBe('ヷ');
  });

  it('keeps marks that cannot combine as spacing marks', () => {
    expect(kanaToFullwidth('ｱﾞ').text).toBe('ア゛');
    expect(kanaToFullwidth('ﾞﾟ').text).toBe('゛゜');
  });

  it('converts full-width katakana to half-width, splitting voiced marks', () => {
    expect(kanaToHalfwidth('ガギグ パピプ ヴァイオリン')).toEqual({ text: 'ｶﾞｷﾞｸﾞ ﾊﾟﾋﾟﾌﾟ ｳﾞｧｲｵﾘﾝ', changed: 12 });
    expect(kanaToHalfwidth('「コーヒー」、テスト・データ。').text).toBe('｢ｺｰﾋｰ｣､ﾃｽﾄ･ﾃﾞｰﾀ｡');
  });

  it('leaves hiragana, kanji and kana without a half-width form alone', () => {
    expect(kanaToHalfwidth('ひらがな漢字ヵヶヰヱ')).toEqual({ text: 'ひらがな漢字ヵヶヰヱ', changed: 0 });
  });

  it('round-trips every half-width kana letter', () => {
    const half = Array.from({ length: 0xff9d - 0xff61 + 1 }, (_, i) => String.fromCharCode(0xff61 + i)).join('');
    expect(kanaToHalfwidth(kanaToFullwidth(half).text).text).toBe(half);
  });

  it('is applied by convertWidth only when the kana class is on', () => {
    const opts = { direction: 'toFull' as const, classes: { ...all, kana: true }, punctuation: 'none' as const };
    expect(convertWidth('ｶﾀｶﾅ ABC', opts).text).toBe('カタカナ　ＡＢＣ');
    expect(convertWidth('ｶﾀｶﾅ ABC', { ...opts, classes: { letters: false, digits: false, symbols: false, space: false, kana: true } }).text).toBe('カタカナ ABC');
    expect(convertWidth('ｶﾀｶﾅ', { ...opts, classes: all }).text).toBe('ｶﾀｶﾅ');
    expect(convertWidth('バッグ　ＡＢＣ', { ...opts, direction: 'toHalf' }).text).toBe('ﾊﾞｯｸﾞ ABC');
  });

  it('counts kana', () => {
    expect(kanaStats('ｶﾞｰ カタカナ ひら')).toEqual({ halfKana: 2, fullKatakana: 4 });
  });
});

import { describe, expect, it } from 'vitest';
import { hasKanji, toAllStyles, toRomaji, tokenize } from './logic';

const passport = (s: string) => toRomaji(s, 'passport');
const macron = (s: string) => toRomaji(s, 'macron');
const doubled = (s: string) => toRomaji(s, 'doubled');
const kunrei = (s: string) => toRomaji(s, 'kunrei');
const input = (s: string) => toRomaji(s, 'input');

describe('passport (外務省ヘボン式) — examples from prefectural passport offices', () => {
  it('撥音: N, but M before B, M, P', () => {
    expect(passport('かんだ')).toBe('KANDA');
    expect(passport('しんや')).toBe('SHINYA');
    expect(passport('じゅん')).toBe('JUN');
    expect(passport('なんば')).toBe('NAMBA');
    expect(passport('ほんま')).toBe('HOMMA');
    expect(passport('さんぺい')).toBe('SAMPEI');
  });

  it('促音: double the consonant, T before CH', () => {
    expect(passport('はっとり')).toBe('HATTORI');
    expect(passport('きっかわ')).toBe('KIKKAWA');
    expect(passport('てっぺい')).toBe('TEPPEI');
    expect(passport('ほっち')).toBe('HOTCHI');
    expect(passport('はっちょう')).toBe('HATCHO');
    expect(passport('えっちゅう')).toBe('ETCHU');
  });

  it('長音: O and U are not written', () => {
    expect(passport('おおの')).toBe('ONO');
    expect(passport('ようこ')).toBe('YOKO');
    expect(passport('とおる')).toBe('TORU');
    expect(passport('ゆうき')).toBe('YUKI');
    expect(passport('さとう')).toBe('SATO');
    expect(passport('おおた')).toBe('OTA');
    expect(passport('ゆうか')).toBe('YUKA');
    expect(passport('みそのう')).toBe('MISONO');
    expect(passport('こおり')).toBe('KORI');
  });

  it('語末のオオは OO', () => {
    expect(passport('よこお')).toBe('YOKOO');
    expect(passport('せのお')).toBe('SENOO');
    expect(passport('みそのお')).toBe('MISONOO');
    expect(passport('たかとお')).toBe('TAKATOO');
    expect(passport('おおおか')).toBe('OOKA');
  });

  it('keeps II and EI, which are not omitted', () => {
    expect(passport('いいづか')).toBe('IIZUKA');
    expect(passport('けいこ')).toBe('KEIKO');
  });

  it('uses JI / ZU / O for ぢ づ を and spells foreign sounds kana by kana', () => {
    expect(passport('ぢ づ を')).toBe('JI ZU O');
    expect(passport('ヴ')).toBe('BU');
    expect(passport('ヴァ')).toBe('BUA');
    expect(passport('シェ')).toBe('SHIE');
    expect(passport('ティ')).toBe('TEI');
    expect(passport('ファ')).toBe('FUA');
  });

  it('accepts katakana, half-width kana and full-width spaces', () => {
    expect(passport('ヤマダ　タロウ')).toBe('YAMADA TARO');
    expect(passport('ｻﾄｳ ｼｮｳﾀ')).toBe('SATO SHOTA');
    expect(passport('スズキ イチロー')).toBe('SUZUKI ICHIRO');
  });

  it('applies the mechanical rule to word-boundary vowels (known limitation)', () => {
    // 正しくは MATSUURA（松＋浦）だが、辞書なしでは語の切れ目が分からない
    expect(passport('まつうら')).toBe('MATSURA');
  });
});

describe('令和7年内閣告示 (macron / doubled vowels)', () => {
  it('writes ん as n everywhere and separates n + vowel/y with an apostrophe', () => {
    expect(macron('しんばし')).toBe('Shinbashi');
    expect(macron('にほんばし')).toBe('Nihonbashi');
    expect(macron('たんい')).toBe("Tan'i");
    expect(macron('しんよう')).toBe("Shin'yō");
  });

  it('doubles c before ch', () => {
    expect(macron('まっちゃ')).toBe('Maccha');
    expect(macron('ざっし')).toBe('Zasshi');
    expect(macron('やっきょく')).toBe('Yakkyoku');
  });

  it('marks long vowels with a macron', () => {
    expect(macron('とうほく')).toBe('Tōhoku');
    expect(macron('おおの')).toBe('Ōno');
    expect(macron('ゆうき')).toBe('Yūki');
    expect(macron('とうきょう')).toBe('Tōkyō');
    expect(macron('おかあさん')).toBe('Okāsan');
    expect(macron('ねえさん')).toBe('Nēsan');
    expect(macron('おおおか')).toBe('Ōoka');
  });

  it('keeps ii and ei as two letters', () => {
    expect(macron('にいがた')).toBe('Niigata');
    expect(macron('しいたけ')).toBe('Shiitake');
    expect(macron('へいせい')).toBe('Heisei');
    expect(macron('れいわ')).toBe('Reiwa');
  });

  it('turns the katakana long mark into a macron', () => {
    expect(macron('ビール')).toBe('Bīru');
    expect(macron('ラーメン')).toBe('Rāmen');
  });

  it('doubled-vowel variant follows the kana spelling (現代仮名遣い)', () => {
    expect(doubled('とうほく')).toBe('Touhoku');
    expect(doubled('おおの')).toBe('Oono');
    expect(doubled('ゆうき')).toBe('Yuuki');
    expect(doubled('おおあめ')).toBe('Ooame');
    expect(doubled('おうさま')).toBe('Ousama');
    expect(doubled('ビール')).toBe('Biiru');
  });

  it('can leave the first letter lower-case', () => {
    expect(toRomaji('すし', 'macron', { capitalize: false })).toBe('sushi');
  });
});

describe('訓令式', () => {
  it('uses the regular 50-sound spellings', () => {
    expect(kunrei('しちつふじ')).toBe('Sitituhuzi');
    expect(kunrei('しゃちゃじゃ')).toBe('Syatyazya');
    expect(kunrei('ぢ づ')).toBe('Zi Zu');
  });

  it('uses a circumflex for long vowels and n for ん', () => {
    expect(kunrei('とうきょう')).toBe('Tôkyô');
    expect(kunrei('しんぶん')).toBe('Sinbun');
    expect(kunrei('きっぷ')).toBe('Kippu');
    expect(kunrei('まっちゃ')).toBe('Mattya');
  });
});

describe('ローマ字入力', () => {
  it('produces keystrokes an IME accepts', () => {
    expect(input('とうきょう')).toBe('toukyou');
    expect(input('こんにちは')).toBe('konnnichiha');
    expect(input('を')).toBe('wo');
    expect(input('ぢ づ')).toBe('di du');
    expect(input('ラーメン')).toBe('ra-menn');
    expect(input('まっちゃ')).toBe('maccha');
    expect(input('ティー')).toBe('thi-');
    expect(input('あっ')).toBe('axtu');
    expect(input('ぁ')).toBe('xa');
  });
});

describe('helpers', () => {
  it('passes through non-kana characters', () => {
    expect(passport('山田 たろう')).toBe('山田 TARO');
    expect(hasKanji('山田 たろう')).toBe(true);
    expect(hasKanji('やまだ')).toBe(false);
  });

  it('tokenizes yoon as one syllable', () => {
    const tokens = tokenize('きょう');
    expect(tokens).toHaveLength(2);
  });

  it('returns every style at once', () => {
    expect(toAllStyles('しんばし')).toEqual({
      passport: 'SHIMBASHI',
      macron: 'Shinbashi',
      doubled: 'Shinbashi',
      kunrei: 'Sinbasi',
      input: 'shinnbashi',
    });
  });
});

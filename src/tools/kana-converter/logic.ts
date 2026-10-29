/**
 * ひらがな ⇄ カタカナ、全角カナ ⇄ 半角カナ の変換（純関数）。
 *
 * 根拠：
 * - Unicode「Hiragana」U+3041–U+309F、「Katakana」U+30A0–U+30FF、
 *   「Halfwidth and Fullwidth Forms」U+FF61–U+FF9F（JIS X 0201 の片仮名に相当）。
 *   https://www.unicode.org/charts/PDF/U3040.pdf ・ https://www.unicode.org/charts/PDF/U30A0.pdf ・
 *   https://www.unicode.org/charts/PDF/UFF00.pdf
 * - 半角カナには濁音・半濁音の合成済み文字がなく、清音 + 半角濁点「ﾞ」(U+FF9E) / 半角半濁点「ﾟ」(U+FF9F)
 *   の 2 文字で表す（例：ｶﾞ = ガ、ﾊﾟ = パ、ｳﾞ = ヴ）。全角への変換では Unicode 正規化（NFC）で合成する。
 * - ヰ・ヱ・ヵ・ヶ・ヮ などは JIS X 0201 に半角形がないため、全角のまま残す。
 */

/** U+FF61 から順に並べた半角カナと、それに対応する全角文字。 */
const HALF = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ';
const FULL = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜';

const HALF_TO_FULL = new Map<string, string>();
const FULL_TO_HALF = new Map<string, string>();
for (let i = 0; i < HALF.length; i++) {
  HALF_TO_FULL.set(HALF[i], FULL[i]);
  FULL_TO_HALF.set(FULL[i], HALF[i]);
}

const COMBINING_DAKUTEN = '゙';
const COMBINING_HANDAKUTEN = '゚';
const HALF_DAKUTEN = 'ﾞ';
const HALF_HANDAKUTEN = 'ﾟ';

const isHiragana = (cp: number) => (cp >= 0x3041 && cp <= 0x3096) || cp === 0x309d || cp === 0x309e;
const isKatakanaConvertible = (cp: number) => (cp >= 0x30a1 && cp <= 0x30f6) || cp === 0x30fd || cp === 0x30fe;

/** ひらがな → 全角カタカナ。ゝゞ → ヽヾ。それ以外の文字はそのまま。 */
export function hiraganaToKatakana(text: string): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    out += isHiragana(cp) ? String.fromCodePoint(cp + 0x60) : ch;
  }
  return out;
}

/**
 * カタカナ → ひらがな。半角カナもいったん全角にしてから変換する。
 * ヷ・ヸ・ヹ・ヺ（対応するひらがながない）と長音符「ー」はそのまま残す。
 */
export function katakanaToHiragana(text: string): string {
  let out = '';
  for (const ch of halfToFullKana(text)) {
    const cp = ch.codePointAt(0)!;
    out += isKatakanaConvertible(cp) ? String.fromCodePoint(cp - 0x60) : ch;
  }
  return out;
}

export interface ToHalfOptions {
  /** ひらがなも半角カナにする（銀行振込の名義入力など）。既定 true。 */
  hiragana?: boolean;
  /** 全角英数字・記号・スペースも半角にする。既定 false。 */
  ascii?: boolean;
}

/** 全角英数字・記号（U+FF01–U+FF5E）と全角スペースを半角に。 */
function asciiToHalf(ch: string): string {
  const cp = ch.codePointAt(0)!;
  if (cp >= 0xff01 && cp <= 0xff5e) return String.fromCodePoint(cp - 0xfee0);
  if (cp === 0x3000) return ' ';
  return ch;
}

/** 全角カナ（と、指定があればひらがな）→ 半角カナ。濁音・半濁音は清音 + ﾞ / ﾟ に分解する。 */
export function fullToHalfKana(text: string, options: ToHalfOptions = {}): string {
  const { hiragana = true, ascii = false } = options;
  let out = '';
  for (const raw of text) {
    let ch = raw;
    const cp = ch.codePointAt(0)!;
    if (hiragana && isHiragana(cp)) ch = String.fromCodePoint(cp + 0x60);
    if (ascii) {
      const half = asciiToHalf(ch);
      if (half !== ch) {
        out += half;
        continue;
      }
    }
    const direct = FULL_TO_HALF.get(ch);
    if (direct) {
      out += direct;
      continue;
    }
    // ガ → カ + U+3099 のように分解して、清音部分が半角にできるときだけ変換する。
    const decomposed = ch.normalize('NFD');
    if (decomposed.length === 2) {
      const base = FULL_TO_HALF.get(decomposed[0]);
      const mark = decomposed[1] === COMBINING_DAKUTEN ? HALF_DAKUTEN : decomposed[1] === COMBINING_HANDAKUTEN ? HALF_HANDAKUTEN : '';
      if (base && mark) {
        out += base + mark;
        continue;
      }
    }
    // 単独の結合用濁点・半濁点
    if (ch === COMBINING_DAKUTEN) out += HALF_DAKUTEN;
    else if (ch === COMBINING_HANDAKUTEN) out += HALF_HANDAKUTEN;
    else out += ch;
  }
  return out;
}

/**
 * 半角カナ → 全角カタカナ。直後の ﾞ / ﾟ は前の文字と合成する（ｶﾞ → ガ、ｳﾞ → ヴ、ﾜﾞ → ヷ）。
 * 合成できない組み合わせ（ｱﾞ など）は「ア゛」のように単独の濁点として残す。
 */
export function halfToFullKana(text: string): string {
  const chars = Array.from(text);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const full = HALF_TO_FULL.get(chars[i]);
    if (full === undefined) {
      out += chars[i];
      continue;
    }
    const next = chars[i + 1];
    if ((next === HALF_DAKUTEN || next === HALF_HANDAKUTEN) && full !== '゛' && full !== '゜') {
      const mark = next === HALF_DAKUTEN ? COMBINING_DAKUTEN : COMBINING_HANDAKUTEN;
      const composed = (full + mark).normalize('NFC');
      if (composed.length === 1) {
        out += composed;
        i++;
        continue;
      }
    }
    out += full;
  }
  return out;
}

export type KanaMode = 'hira-to-kata' | 'kata-to-hira' | 'to-half' | 'to-full';

export const KANA_MODES: { id: KanaMode; label: string }[] = [
  { id: 'hira-to-kata', label: 'ひらがな → カタカナ' },
  { id: 'kata-to-hira', label: 'カタカナ → ひらがな' },
  { id: 'to-half', label: '全角 → 半角カナ' },
  { id: 'to-full', label: '半角 → 全角カナ' },
];

export function convertKana(text: string, mode: KanaMode, options: ToHalfOptions = {}): string {
  switch (mode) {
    case 'hira-to-kata':
      return hiraganaToKatakana(text);
    case 'kata-to-hira':
      return katakanaToHiragana(text);
    case 'to-half':
      return fullToHalfKana(text, options);
    case 'to-full':
      return halfToFullKana(text);
  }
}

export interface KanaStats {
  hiragana: number;
  katakana: number;
  halfKana: number;
  kanji: number;
}

/** 入力に含まれる文字種の数（変換の前後確認用）。 */
export function countKana(text: string): KanaStats {
  const stats: KanaStats = { hiragana: 0, katakana: 0, halfKana: 0, kanji: 0 };
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (isHiragana(cp)) stats.hiragana++;
    else if (cp >= 0x30a1 && cp <= 0x30fa) stats.katakana++;
    else if (cp >= 0xff66 && cp <= 0xff9f) stats.halfKana++;
    else if (/\p{Script=Han}/u.test(ch)) stats.kanji++;
  }
  return stats;
}

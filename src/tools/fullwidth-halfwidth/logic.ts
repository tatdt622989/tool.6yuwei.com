// Full-width ↔ half-width conversion and Chinese ↔ English punctuation.
// Full-width ASCII variants live at U+FF01–U+FF5E, exactly 0xFEE0 above U+0021–U+007E;
// the ideographic space is U+3000.

export interface WidthClasses {
  letters: boolean;
  digits: boolean;
  /** ASCII symbols and punctuation, plus ¢ £ ¬ ¯ ¦ ¥ ₩ ↔ their full-width forms. */
  symbols: boolean;
  space: boolean;
  /**
   * Katakana (Japanese pages): half-width ｶﾀｶﾅ ↔ full-width カタカナ, including voiced marks
   * (ｶﾞ ↔ ガ, ﾊﾟ ↔ パ, ｳﾞ ↔ ヴ), the long-vowel mark ｰ ↔ ー and the half-width ｡｢｣､･ ↔ 。「」、・.
   * Optional and off when omitted, so the Chinese page never touches kana.
   */
  kana?: boolean;
}

export type Direction = 'toHalf' | 'toFull';

export interface ConvertResult {
  text: string;
  /** Number of characters that were replaced. */
  changed: number;
}

const OFFSET = 0xfee0;

/** Half-width ↔ full-width pairs outside the U+FF01–FF5E block. */
const EXTRA_SYMBOLS: readonly [string, string][] = [
  ['¢', '￠'], // ¢ ￠
  ['£', '￡'], // £ ￡
  ['¬', '￢'], // ¬ ￢
  ['¯', '￣'], // ¯ ￣
  ['¦', '￤'], // ¦ ￤
  ['¥', '￥'], // ¥ ￥
  ['₩', '￦'], // ₩ ￦
];
const EXTRA_TO_FULL = new Map(EXTRA_SYMBOLS);
const EXTRA_TO_HALF = new Map(EXTRA_SYMBOLS.map(([h, f]) => [f, h]));

function classOf(halfChar: string): keyof WidthClasses {
  if (halfChar === ' ') return 'space';
  if (/[A-Za-z]/.test(halfChar)) return 'letters';
  if (/[0-9]/.test(halfChar)) return 'digits';
  return 'symbols';
}

export function toHalfwidth(text: string, classes: WidthClasses): ConvertResult {
  let changed = 0;
  const out = text.replace(/[！-～　￠-￦]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const half = ch === '　' ? ' ' : EXTRA_TO_HALF.get(ch) ?? String.fromCharCode(code - OFFSET);
    if (!classes[classOf(half)]) return ch;
    changed++;
    return half;
  });
  return { text: out, changed };
}

export function toFullwidth(text: string, classes: WidthClasses): ConvertResult {
  let changed = 0;
  const out = text.replace(/[\x21-\x7e ¢£¬¯¦¥₩]/g, (ch) => {
    if (!classes[classOf(ch)]) return ch;
    changed++;
    if (ch === ' ') return '　';
    return EXTRA_TO_FULL.get(ch) ?? String.fromCharCode(ch.charCodeAt(0) + OFFSET);
  });
  return { text: out, changed };
}

// ---------- Katakana ----------

/** U+FF61–FF9D (｡ … ﾝ) in order, and their full-width counterparts. */
const HALF_KANA = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const FULL_KANA = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
const KANA_TO_FULL = new Map(Array.from(HALF_KANA).map((h, i) => [h, FULL_KANA[i]]));
const KANA_TO_HALF = new Map(Array.from(FULL_KANA).map((f, i) => [f, HALF_KANA[i]]));
const HALF_VOICED = 'ﾞ'; // U+FF9E
const HALF_SEMI_VOICED = 'ﾟ'; // U+FF9F
const COMBINING_VOICED = '\u3099';
const COMBINING_SEMI_VOICED = '\u309a';

/** Half-width katakana → full-width, joining a following ﾞ / ﾟ into one character (ｶﾞ → ガ). */
export function kanaToFullwidth(text: string): ConvertResult {
  let changed = 0;
  const out = text.replace(/([\uff61-\uff9d])([ﾞﾟ]?)|[ﾞﾟ]/g, (m, base: string | undefined, mark: string) => {
    changed++;
    if (!base) return m === HALF_VOICED ? '゛' : '゜';
    const full = KANA_TO_FULL.get(base) ?? base;
    if (!mark) return full;
    const composed = (full + (mark === HALF_VOICED ? COMBINING_VOICED : COMBINING_SEMI_VOICED)).normalize('NFC');
    // No precomposed form (e.g. ｱﾞ): keep the base and a spacing mark.
    return composed.length === 1 ? composed : full + (mark === HALF_VOICED ? '゛' : '゜');
  });
  return { text: out, changed };
}

/** Full-width katakana → half-width (ガ → ｶﾞ). Letters with no half-width form (ヵ, ヶ, ヮ, ヰ, ヱ) are kept. */
export function kanaToHalfwidth(text: string): ConvertResult {
  let changed = 0;
  const out = text.replace(/[\u30a1-\u30fa\u30fc。「」、・゛゜]/g, (ch) => {
    if (ch === '゛' || ch === '゜') {
      changed++;
      return ch === '゛' ? HALF_VOICED : HALF_SEMI_VOICED;
    }
    const [base, mark] = Array.from(ch.normalize('NFD'));
    const half = KANA_TO_HALF.get(base);
    if (!half) return ch;
    changed++;
    if (mark === COMBINING_VOICED) return half + HALF_VOICED;
    if (mark === COMBINING_SEMI_VOICED) return half + HALF_SEMI_VOICED;
    return half;
  });
  return { text: out, changed };
}

export interface KanaStats {
  halfKana: number;
  fullKatakana: number;
}

/** Half-width katakana letters (marks excluded) and full-width katakana letters in the text. */
export function kanaStats(text: string): KanaStats {
  return {
    halfKana: text.match(/[\uff66-\uff9d]/g)?.length ?? 0,
    fullKatakana: text.match(/[\u30a1-\u30fa\u30fc]/g)?.length ?? 0,
  };
}

// ---------- Punctuation ----------

/** Chinese punctuation → ASCII. */
const ZH_TO_EN: Record<string, string> = {
  '……': '...',
  '…': '...',
  '——': '--',
  '，': ',',
  '、': ',',
  '。': '.',
  '；': ';',
  '：': ':',
  '？': '?',
  '！': '!',
  '（': '(',
  '）': ')',
  '【': '[',
  '】': ']',
  '〔': '[',
  '〕': ']',
  '［': '[',
  '］': ']',
  '「': '"',
  '」': '"',
  '“': '"',
  '”': '"',
  '＂': '"',
  '『': "'",
  '』': "'",
  '‘': "'",
  '’': "'",
  '＇': "'",
  '《': '<',
  '》': '>',
  '〈': '<',
  '〉': '>',
  '～': '~',
};
const ZH_PATTERN = /……|——|[…，、。；：？！（）【】〔〕［］「」“”＂『』‘’＇《》〈〉～]/g;

/**
 * Chinese punctuation to English punctuation. A space is added after , . ; : ? ! when it is
 * directly followed by a Latin letter or digit, as English typography expects.
 */
export function zhToEnPunctuation(text: string): ConvertResult {
  let changed = 0;
  const out = text.replace(ZH_PATTERN, (mark, offset: number, whole: string) => {
    changed++;
    const en = ZH_TO_EN[mark];
    const next = whole.charAt(offset + mark.length);
    return /^[,.;:?!]$/.test(en) && /[A-Za-z0-9]/.test(next) ? `${en} ` : en;
  });
  return { text: out, changed };
}

const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u3000-\\u303f\\uff00-\\uffef';
const NEAR_CJK_BEFORE = new RegExp(`[${CJK}]\\s*$`, 'u');
const NEAR_CJK_AFTER = new RegExp(`^\\s*[${CJK}]`, 'u');
const HAS_CJK = new RegExp(`[${CJK}]`, 'u');

const EN_TO_ZH: Record<string, string> = {
  ',': '，',
  '.': '。',
  ';': '；',
  ':': '：',
  '?': '？',
  '!': '！',
};

/**
 * English punctuation to Chinese punctuation. With `onlyNearCjk` (recommended) a mark is converted
 * only when it touches Chinese / Japanese text, so English sentences, numbers (3.14, 1,000, 12:30),
 * URLs and code inside mixed text stay intact. Spaces after a converted mark are removed.
 */
export function enToZhPunctuation(text: string, onlyNearCjk = true): ConvertResult {
  let changed = 0;
  const near = (before: string, after: string) =>
    !onlyNearCjk || NEAR_CJK_BEFORE.test(before) || NEAR_CJK_AFTER.test(after);

  // Paired marks first, judged by their content.
  let out = text
    .replace(/"([^"\n]*)"/g, (m, inner: string) => {
      if (onlyNearCjk && !HAS_CJK.test(inner)) return m;
      changed += 2;
      return `「${inner}」`;
    })
    .replace(/(^|[^A-Za-z0-9])'([^'\n]*)'(?![A-Za-z0-9])/g, (m, lead: string, inner: string) => {
      if (onlyNearCjk && !HAS_CJK.test(inner)) return m;
      changed += 2;
      return `${lead}『${inner}』`;
    })
    .replace(/\(([^()\n]*)\)/g, (m, inner: string) => {
      if (onlyNearCjk && !HAS_CJK.test(inner)) return m;
      changed += 2;
      return `（${inner}）`;
    });

  out = out.replace(/\.{3,}|…/g, (m, offset: number, whole: string) => {
    if (!near(whole.slice(Math.max(0, offset - 8), offset), whole.slice(offset + m.length, offset + m.length + 8))) return m;
    changed++;
    return '……';
  });

  out = out.replace(/[,.;:?!] */g, (m, offset: number, whole: string) => {
    const mark = m[0];
    const before = whole.slice(Math.max(0, offset - 8), offset);
    const after = whole.slice(offset + m.length, offset + m.length + 8);
    // Never touch numbers (3.14, 1,000, 12:30) or things like URLs and file names (a.b).
    if (/[\p{N}]$/u.test(before) && /^\p{N}/u.test(after)) return m;
    if (mark === '.' || mark === ':') {
      if (/[A-Za-z0-9]$/.test(before) && /^[A-Za-z0-9/]/.test(whole.slice(offset + 1))) return m;
    }
    if (!near(before, after)) return m;
    changed++;
    return EN_TO_ZH[mark];
  });

  return { text: out, changed };
}

// ---------- Combined ----------

export type PunctuationMode = 'none' | 'zhToEn' | 'enToZh';

export interface ConvertOptions {
  direction: Direction;
  classes: WidthClasses;
  punctuation: PunctuationMode;
}

/**
 * Punctuation conversion runs first, then width conversion. For half → full with Chinese
 * punctuation, marks converted to 。「」 etc. are no longer ASCII and are not widened again.
 */
export function convertWidth(text: string, options: ConvertOptions): ConvertResult {
  let changed = 0;
  let out = text;
  if (options.punctuation === 'zhToEn') {
    const r = zhToEnPunctuation(out);
    out = r.text;
    changed += r.changed;
  } else if (options.punctuation === 'enToZh') {
    const r = enToZhPunctuation(out);
    out = r.text;
    changed += r.changed;
  }
  if (options.classes.kana) {
    const k = options.direction === 'toHalf' ? kanaToHalfwidth(out) : kanaToFullwidth(out);
    out = k.text;
    changed += k.changed;
  }
  const r = options.direction === 'toHalf' ? toHalfwidth(out, options.classes) : toFullwidth(out, options.classes);
  return { text: r.text, changed: changed + r.changed };
}

export interface WidthStats {
  fullAlnum: number;
  fullSymbols: number;
  fullSpaces: number;
  halfAlnum: number;
}

export function widthStats(text: string): WidthStats {
  return {
    fullAlnum: text.match(/[０-９Ａ-Ｚａ-ｚ]/g)?.length ?? 0,
    fullSymbols: text.match(/[！-／：-＠［-｀｛-～￠-￦]/g)?.length ?? 0,
    fullSpaces: text.match(/　/g)?.length ?? 0,
    halfAlnum: text.match(/[A-Za-z0-9]/g)?.length ?? 0,
  };
}

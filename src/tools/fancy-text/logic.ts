// Latin letters and digits → Unicode "font" look-alikes.
// Most styles come from the Mathematical Alphanumeric Symbols block (U+1D400–U+1D7FF). Some letters
// were encoded earlier in Letterlike Symbols (U+2100–U+214F), so their slots in the math block are
// reserved/unassigned and must be mapped to the older code points instead (the EXCEPTIONS below).

export interface FancyStyle {
  id: string;
  name: string;
  convert: (text: string) => string;
}

interface AlphabetSpec {
  upper?: number;
  lower?: number;
  digit?: number;
  /** Letters whose code point lives outside the contiguous run. */
  exceptions?: Record<string, number>;
}

const A = 'A'.charCodeAt(0);
const a = 'a'.charCodeAt(0);
const ZERO = '0'.charCodeAt(0);

function alphabet(spec: AlphabetSpec): (text: string) => string {
  return (text) =>
    Array.from(text, (ch) => {
      const ex = spec.exceptions?.[ch];
      if (ex !== undefined) return String.fromCodePoint(ex);
      const c = ch.charCodeAt(0);
      if (spec.upper !== undefined && c >= A && c <= A + 25) return String.fromCodePoint(spec.upper + c - A);
      if (spec.lower !== undefined && c >= a && c <= a + 25) return String.fromCodePoint(spec.lower + c - a);
      if (spec.digit !== undefined && c >= ZERO && c <= ZERO + 9) return String.fromCodePoint(spec.digit + c - ZERO);
      return ch;
    }).join('');
}

/** Reserved code points in the math block and the Letterlike Symbols characters used instead. */
export const EXCEPTIONS = {
  italic: { h: 0x210e },
  script: { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 },
  fraktur: { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 },
  doubleStruck: { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 },
} satisfies Record<string, Record<string, number>>;

function mapTable(table: Record<string, string>, fallbackLower = false): (text: string) => string {
  return (text) =>
    Array.from(text, (ch) => table[ch] ?? (fallbackLower ? (table[ch.toLowerCase()] ?? ch) : ch)).join('');
}

function combining(mark: string): (text: string) => string {
  // Attach the mark to every visible character, including spaces so the line is continuous.
  return (text) => Array.from(text, (ch) => (ch === '\n' ? ch : ch + mark)).join('');
}

const SMALL_CAPS: Record<string, string> = Object.fromEntries(
  Array.from('abcdefghijklmnopqrstuvwxyz').map((ch, i) => [ch, 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ'[i]]),
);

const SUPERSCRIPT: Record<string, string> = {
  ...Object.fromEntries(Array.from('0123456789').map((d, i) => [d, '⁰¹²³⁴⁵⁶⁷⁸⁹'[i]])),
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ',
  n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
  A: 'ᴬ', B: 'ᴮ', D: 'ᴰ', E: 'ᴱ', G: 'ᴳ', H: 'ᴴ', I: 'ᴵ', J: 'ᴶ', K: 'ᴷ', L: 'ᴸ', M: 'ᴹ', N: 'ᴺ', O: 'ᴼ',
  P: 'ᴾ', R: 'ᴿ', T: 'ᵀ', U: 'ᵁ', V: 'ⱽ', W: 'ᵂ', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
};

const UPSIDE_DOWN: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ',
  n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'ꓭ', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ', K: 'ꓘ', L: '˥', M: 'W',
  N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ꓤ', S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<', _: '‾', '&': '⅋', ';': '؛',
};

const CIRCLED_DIGITS = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
const NEGATIVE_CIRCLED_DIGITS = ['⓿', '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾'];

function circled(text: string): string {
  return Array.from(text, (ch) => {
    const c = ch.charCodeAt(0);
    if (c >= A && c <= A + 25) return String.fromCodePoint(0x24b6 + c - A);
    if (c >= a && c <= a + 25) return String.fromCodePoint(0x24d0 + c - a);
    if (c >= ZERO && c <= ZERO + 9) return CIRCLED_DIGITS[c - ZERO];
    return ch;
  }).join('');
}

/** Negative (filled) circled and squared letters only exist in upper case. */
function upperOnly(base: number, digits?: string[]): (text: string) => string {
  return (text) =>
    Array.from(text, (ch) => {
      const up = ch.toUpperCase();
      const c = up.charCodeAt(0);
      if (up.length === 1 && c >= A && c <= A + 25) return String.fromCodePoint(base + c - A);
      if (digits && c >= ZERO && c <= ZERO + 9) return digits[c - ZERO];
      return ch;
    }).join('');
}

function parenthesized(text: string): string {
  return Array.from(text, (ch) => {
    const c = ch.charCodeAt(0);
    if (c >= a && c <= a + 25) return String.fromCodePoint(0x249c + c - a);
    if (c >= A && c <= A + 25) return String.fromCodePoint(0x249c + c - A);
    if (c > ZERO && c <= ZERO + 9) return String.fromCodePoint(0x2474 + c - ZERO - 1);
    return ch;
  }).join('');
}

function fullwidth(text: string): string {
  return Array.from(text, (ch) => {
    const c = ch.charCodeAt(0);
    if (ch === ' ') return '　';
    if (c >= 0x21 && c <= 0x7e) return String.fromCharCode(c + 0xfee0);
    return ch;
  }).join('');
}

function upsideDown(text: string): string {
  return Array.from(text, (ch) => UPSIDE_DOWN[ch] ?? ch)
    .reverse()
    .join('');
}

export const STYLES: FancyStyle[] = [
  { id: 'bold', name: '粗體', convert: alphabet({ upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce }) },
  { id: 'italic', name: '斜體', convert: alphabet({ upper: 0x1d434, lower: 0x1d44e, exceptions: EXCEPTIONS.italic }) },
  { id: 'bold-italic', name: '粗斜體', convert: alphabet({ upper: 0x1d468, lower: 0x1d482, digit: 0x1d7ce }) },
  { id: 'script', name: '草寫體（花體）', convert: alphabet({ upper: 0x1d49c, lower: 0x1d4b6, exceptions: EXCEPTIONS.script }) },
  { id: 'bold-script', name: '粗草寫體', convert: alphabet({ upper: 0x1d4d0, lower: 0x1d4ea }) },
  { id: 'fraktur', name: '哥德體（Fraktur）', convert: alphabet({ upper: 0x1d504, lower: 0x1d51e, exceptions: EXCEPTIONS.fraktur }) },
  { id: 'bold-fraktur', name: '粗哥德體', convert: alphabet({ upper: 0x1d56c, lower: 0x1d586 }) },
  { id: 'double-struck', name: '空心體（雙線體）', convert: alphabet({ upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8, exceptions: EXCEPTIONS.doubleStruck }) },
  { id: 'sans', name: '無襯線體', convert: alphabet({ upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 }) },
  { id: 'sans-bold', name: '無襯線粗體', convert: alphabet({ upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec }) },
  { id: 'sans-italic', name: '無襯線斜體', convert: alphabet({ upper: 0x1d608, lower: 0x1d622 }) },
  { id: 'sans-bold-italic', name: '無襯線粗斜體', convert: alphabet({ upper: 0x1d63c, lower: 0x1d656, digit: 0x1d7ec }) },
  { id: 'monospace', name: '等寬體（打字機）', convert: alphabet({ upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 }) },
  { id: 'circled', name: '圓圈字', convert: circled },
  { id: 'negative-circled', name: '實心圓圈字', convert: upperOnly(0x1f150, NEGATIVE_CIRCLED_DIGITS) },
  { id: 'squared', name: '方框字', convert: upperOnly(0x1f130) },
  { id: 'parenthesized', name: '括號字', convert: parenthesized },
  { id: 'small-caps', name: '小型大寫', convert: mapTable(SMALL_CAPS, true) },
  { id: 'superscript', name: '上標小字', convert: mapTable(SUPERSCRIPT) },
  { id: 'fullwidth', name: '全形寬字', convert: fullwidth },
  { id: 'strike', name: '刪除線', convert: combining('̶') },
  { id: 'underline', name: '底線', convert: combining('̲') },
  { id: 'double-underline', name: '雙底線', convert: combining('̳') },
  { id: 'slash', name: '斜線劃掉', convert: combining('̸') },
  { id: 'upside-down', name: '上下顛倒', convert: upsideDown },
];

export function convertAll(text: string): { style: FancyStyle; output: string }[] {
  return STYLES.map((style) => ({ style, output: style.convert(text) }));
}

/** True when the text contains characters (e.g. CJK) that no style can transform. */
export function hasUnconvertible(text: string): boolean {
  return /[^\x00-\x7f]/.test(text.replace(/[\s　]/g, ''));
}

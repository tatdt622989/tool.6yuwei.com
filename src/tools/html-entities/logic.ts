export type EncodeScope = 'minimal' | 'nonascii';
export type EncodeStyle = 'named' | 'decimal' | 'hex';

export interface EntityInfo {
  char: string;
  name: string;
  description: string;
}

/** Common named entities, used for encoding, decoding and the reference table. */
export const COMMON_ENTITIES: EntityInfo[] = [
  { char: '&', name: 'amp', description: '& 符號' },
  { char: '<', name: 'lt', description: '小於' },
  { char: '>', name: 'gt', description: '大於' },
  { char: '"', name: 'quot', description: '雙引號' },
  { char: "'", name: 'apos', description: '單引號（HTML5）' },
  { char: ' ', name: 'nbsp', description: '不換行空格' },
  { char: '©', name: 'copy', description: '版權符號' },
  { char: '®', name: 'reg', description: '註冊商標' },
  { char: '™', name: 'trade', description: '商標' },
  { char: '°', name: 'deg', description: '度' },
  { char: '±', name: 'plusmn', description: '正負號' },
  { char: '×', name: 'times', description: '乘號' },
  { char: '÷', name: 'divide', description: '除號' },
  { char: '·', name: 'middot', description: '間隔號' },
  { char: '•', name: 'bull', description: '項目符號' },
  { char: '…', name: 'hellip', description: '刪節號' },
  { char: '–', name: 'ndash', description: '短破折號（en dash）' },
  { char: '—', name: 'mdash', description: '長破折號（em dash）' },
  { char: '‘', name: 'lsquo', description: '左單引號' },
  { char: '’', name: 'rsquo', description: '右單引號' },
  { char: '“', name: 'ldquo', description: '左雙引號' },
  { char: '”', name: 'rdquo', description: '右雙引號' },
  { char: '«', name: 'laquo', description: '左書名號（法文引號）' },
  { char: '»', name: 'raquo', description: '右書名號（法文引號）' },
  { char: '§', name: 'sect', description: '章節符號' },
  { char: '¶', name: 'para', description: '段落符號' },
  { char: '€', name: 'euro', description: '歐元' },
  { char: '£', name: 'pound', description: '英鎊' },
  { char: '¥', name: 'yen', description: '日圓／人民幣' },
  { char: '¢', name: 'cent', description: '分' },
  { char: '←', name: 'larr', description: '左箭頭' },
  { char: '→', name: 'rarr', description: '右箭頭' },
  { char: '↑', name: 'uarr', description: '上箭頭' },
  { char: '↓', name: 'darr', description: '下箭頭' },
  { char: '↔', name: 'harr', description: '左右箭頭' },
  { char: '≤', name: 'le', description: '小於等於' },
  { char: '≥', name: 'ge', description: '大於等於' },
  { char: '≠', name: 'ne', description: '不等於' },
  { char: '≈', name: 'asymp', description: '約等於' },
  { char: '∞', name: 'infin', description: '無限大' },
  { char: '½', name: 'frac12', description: '二分之一' },
  { char: '¼', name: 'frac14', description: '四分之一' },
  { char: '¾', name: 'frac34', description: '四分之三' },
  { char: '²', name: 'sup2', description: '上標 2' },
  { char: '³', name: 'sup3', description: '上標 3' },
  { char: 'µ', name: 'micro', description: '微' },
  { char: 'α', name: 'alpha', description: '希臘字母 alpha' },
  { char: 'β', name: 'beta', description: '希臘字母 beta' },
  { char: 'π', name: 'pi', description: '圓周率 pi' },
  { char: 'Ω', name: 'Omega', description: '希臘字母 Omega' },
  { char: 'é', name: 'eacute', description: 'e 加重音符' },
  { char: 'ü', name: 'uuml', description: 'u 加分音符' },
  { char: 'ñ', name: 'ntilde', description: 'n 加波浪號' },
  { char: '‰', name: 'permil', description: '千分比' },
  { char: ' ', name: 'ensp', description: '半形空格（en space）' },
  { char: ' ', name: 'emsp', description: '全形空格（em space）' },
  { char: ' ', name: 'thinsp', description: '窄空格' },
  { char: '­', name: 'shy', description: '軟連字號' },
];

const NAME_BY_CHAR = new Map(COMMON_ENTITIES.map((e) => [e.char, e.name]));
const CHAR_BY_NAME = new Map(COMMON_ENTITIES.map((e) => [e.name, e.char]));

const MINIMAL = new Set(['&', '<', '>', '"', "'"]);

function numeric(codePoint: number, style: EncodeStyle): string {
  return style === 'hex' ? `&#x${codePoint.toString(16).toUpperCase()};` : `&#${codePoint};`;
}

/**
 * minimal: escapes only & < > " ' — enough to place text safely in HTML content and quoted attributes.
 * nonascii: additionally escapes every non-ASCII code point (useful for ASCII-only files or e-mail).
 * The apostrophe uses &#39; in named style because &apos; is not defined in HTML 4.
 */
export function encodeEntities(text: string, scope: EncodeScope, style: EncodeStyle): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (MINIMAL.has(ch)) {
      out += style === 'named' ? (ch === "'" ? '&#39;' : `&${NAME_BY_CHAR.get(ch)};`) : numeric(cp, style);
    } else if (scope === 'nonascii' && cp > 0x7e) {
      const name = style === 'named' ? NAME_BY_CHAR.get(ch) : undefined;
      out += name ? `&${name};` : numeric(cp, style === 'named' ? 'decimal' : style);
    } else {
      out += ch;
    }
  }
  return out;
}

/** Looks up named entities missing from the built-in table (the browser knows all 2,000+). */
export type NameResolver = (name: string) => string | undefined;

const ENTITY = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);/g;

export function decodeEntities(text: string, resolve?: NameResolver): { text: string; count: number } {
  let count = 0;
  const decoded = text.replace(ENTITY, (match, body: string) => {
    let value: string | undefined;
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      value = cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff) ? '�' : String.fromCodePoint(cp);
    } else {
      value = CHAR_BY_NAME.get(body) ?? resolve?.(body);
    }
    if (value === undefined) return match;
    count++;
    return value;
  });
  return { text: decoded, count };
}

export function codePointLabel(char: string): string {
  return `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
}

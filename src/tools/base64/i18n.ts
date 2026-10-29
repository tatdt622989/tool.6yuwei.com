import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { DecodeFailure } from './logic';

export interface Strings {
  modeAria: string;
  encode: string;
  decode: string;
  urlSafe: string;
  noPadding: string;
  copy: string;
  swap: string;
  clear: string;
  client: {
    inputEncode: string;
    inputDecode: string;
    outputEncode: string;
    outputDecode: string;
    placeholderEncode: string;
    placeholderDecode: string;
    /** {bytes} {chars} are filled with the plural forms below. */
    metaEncode: string;
    /** {bytes} */
    metaDecode: string;
    bytes: PluralForms;
    chars: PluralForms;
    /** 'not-utf8' takes {n} (raw byte count). */
    errors: Record<DecodeFailure, string>;
    hexHead: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '轉換方向',
    encode: '編碼',
    decode: '解碼',
    urlSafe: 'URL-safe（- _）',
    noPadding: '移除結尾 =',
    copy: '複製結果',
    swap: '用結果反向轉換',
    clear: '清除',
    client: {
      inputEncode: '要編碼的文字',
      inputDecode: '要解碼的 Base64',
      outputEncode: 'Base64 結果',
      outputDecode: '解碼後的文字',
      placeholderEncode: '輸入任何文字，支援中文與表情符號',
      placeholderDecode: '貼上 Base64 字串，標準或 URL-safe 格式皆可',
      metaEncode: '原文 {bytes} 位元組（UTF-8）→ {chars} 個字元',
      metaDecode: '解碼為 {bytes} 位元組（UTF-8）',
      bytes: { other: '{n}' },
      chars: { other: '{n}' },
      errors: {
        invalid: '不是有效的 Base64：只能包含 A–Z、a–z、0–9、+ / 或 - _，結尾最多兩個 =。',
        'not-utf8': '解碼後的 {n} 位元組不是 UTF-8 文字，可能是圖片或其他二進位檔案。',
      },
      hexHead: '前 64 位元組（十六進位）：',
    },
  },
  en: {
    modeAria: 'Direction',
    encode: 'Encode',
    decode: 'Decode',
    urlSafe: 'URL-safe (- _)',
    noPadding: 'Strip trailing =',
    copy: 'Copy result',
    swap: 'Reverse with result',
    clear: 'Clear',
    client: {
      inputEncode: 'Text to encode',
      inputDecode: 'Base64 to decode',
      outputEncode: 'Base64 output',
      outputDecode: 'Decoded text',
      placeholderEncode: 'Type any text. Accents, emoji and non-Latin scripts are encoded as UTF-8',
      placeholderDecode: 'Paste a Base64 string, standard or URL-safe',
      metaEncode: '{bytes} (UTF-8) → {chars}',
      metaDecode: 'Decoded to {bytes} (UTF-8)',
      bytes: { one: '{n} byte', other: '{n} bytes' },
      chars: { one: '{n} character', other: '{n} characters' },
      errors: {
        invalid: 'Not valid Base64: only A–Z, a–z, 0–9, + / or - _ are allowed, with at most two = at the end.',
        'not-utf8': 'The decoded {n} bytes are not UTF-8 text. This is probably an image or another binary file.',
      },
      hexHead: 'First 64 bytes (hex):',
    },
  },
  ja: {
    modeAria: '変換の方向',
    encode: 'エンコード',
    decode: 'デコード',
    urlSafe: 'URL-safe（- _）',
    noPadding: '末尾の = を削除',
    copy: '結果をコピー',
    swap: '結果を逆変換',
    clear: 'クリア',
    client: {
      inputEncode: 'エンコードする文字列',
      inputDecode: 'デコードする Base64',
      outputEncode: 'Base64 の結果',
      outputDecode: 'デコードした文字列',
      placeholderEncode: '任意の文字列を入力（日本語や絵文字も UTF-8 で正しく変換）',
      placeholderDecode: 'Base64 文字列を貼り付け（標準・URL-safe どちらも可）',
      metaEncode: '元の文字列 {bytes}（UTF-8）→ {chars}',
      metaDecode: '{bytes}（UTF-8）にデコードしました',
      bytes: { other: '{n} バイト' },
      chars: { other: '{n} 文字' },
      errors: {
        invalid: 'Base64 として正しくありません。使える文字は A–Z、a–z、0–9、+ / または - _ で、末尾の = は 2 個までです。',
        'not-utf8': 'デコードした {n} バイトは UTF-8 のテキストではありません。画像などのバイナリファイルの可能性があります。',
      },
      hexHead: '先頭 64 バイト（16 進数）：',
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { ParseMessages } from './logic';

export interface Strings {
  /** Labels for the base 2, 8, 10 and 16 fields, in that order. */
  fieldLabels: [string, string, string, string];
  hint: string;
  copy: string;
  customLabel: string;
  customAria: string;
  /** {b} */
  customOption: string;
  group: string;
  upper: string;
  statBits: string;
  statBytes: string;
  statOnes: string;
  /** Rendered with set:html so the apostrophe stays unescaped (trusted constant). */
  twosTitle: string;
  widthAria: string;
  /** {n} */
  widthOption: string;
  rowBinary: string;
  rowHex: string;
  rowUnsigned: string;
  rowSigned: string;
  client: {
    messages: ParseMessages;
    noSign: string;
    /** {n} */
    negative: string;
    /** {n} */
    highBit: string;
    /** {bits} {min} {smax} {max} */
    range: string;
    /** {bits} {min} {max} */
    overflow: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    fieldLabels: ['二進位（BIN，2 進位）', '八進位（OCT，8 進位）', '十進位（DEC，10 進位）', '十六進位（HEX，16 進位）'],
    hint: '在任一欄輸入整數，其他進位會即時換算。可輸入負號，也可貼上含 0x、0b 前綴或空白分組的數字。',
    copy: '複製',
    customLabel: '自訂進位（2–36 進位）',
    customAria: '自訂進位的基數',
    customOption: '{b} 進位',
    group: '分組顯示（二進位、十六進位每 4 位，十進位每 3 位）',
    upper: '英文字母大寫（FF／ff）',
    statBits: '需要的位元數',
    statBytes: '位元組（byte）',
    statOnes: '二進位中 1 的個數',
    twosTitle: "二補數（Two's complement）表示法",
    widthAria: '位元寬度',
    widthOption: '{n} 位元',
    rowBinary: '二進位位元',
    rowHex: '十六進位',
    rowUnsigned: '視為無號整數（unsigned）',
    rowSigned: '視為有號整數（signed）',
    client: {
      messages: {
        badBase: '進位必須介於 2 到 36',
        empty: '請輸入數字',
        badDigit: '「{ch}」不是 {base} 進位的數字（只能用 {allowed}）',
        allowedDigits: '0–{max}',
        allowedLetters: '0–9 與 A–{max}',
      },
      noSign: '（不含符號）',
      negative: '負數以二補數儲存：把 {n} 的二進位每一位反轉後再加 1。',
      highBit: '最高位元為 1，當成有號整數讀取時是負數 {n}。',
      range: '{bits} 位元可表示的範圍：有號 {min} 到 {smax}，無號 0 到 {max}。',
      overflow: '此數超出 {bits} 位元可表示的範圍（{min} 到 {max}），上表為只保留低 {bits} 位元後的結果（溢位）。',
    },
  },
  en: {
    fieldLabels: ['Binary (base 2)', 'Octal (base 8)', 'Decimal (base 10)', 'Hexadecimal (base 16)'],
    hint: 'Type an integer in any field and the others convert instantly. Negative numbers, 0x / 0b prefixes and digits grouped with spaces all work.',
    copy: 'Copy',
    customLabel: 'Custom base (2–36)',
    customAria: 'Custom base',
    customOption: 'Base {b}',
    group: 'Group digits (binary and hex in 4s, decimal in 3s)',
    upper: 'Uppercase letters (FF / ff)',
    statBits: 'Bits needed',
    statBytes: 'Bytes',
    statOnes: 'Ones in binary (popcount)',
    twosTitle: "Two's complement",
    widthAria: 'Bit width',
    widthOption: '{n}-bit',
    rowBinary: 'Binary',
    rowHex: 'Hex',
    rowUnsigned: 'As unsigned integer',
    rowSigned: 'As signed integer',
    client: {
      messages: {
        badBase: 'The base must be between 2 and 36',
        empty: 'Enter a number',
        badDigit: '“{ch}” is not a valid base-{base} digit (use {allowed})',
        allowedDigits: '0–{max}',
        allowedLetters: '0–9 and A–{max}',
      },
      noSign: ' (excluding sign)',
      negative: 'Negative numbers are stored in two’s complement: invert every bit of {n} in binary, then add 1.',
      highBit: 'The top bit is 1, so read as a signed integer this is the negative number {n}.',
      range: '{bits}-bit range: signed {min} to {smax}, unsigned 0 to {max}.',
      overflow:
        'This number is outside the {bits}-bit range ({min} to {max}). The table shows only the lowest {bits} bits (overflow).',
    },
  },
  ja: {
    fieldLabels: ['2 進数（BIN）', '8 進数（OCT）', '10 進数（DEC）', '16 進数（HEX）'],
    hint: 'どの欄に整数を入力しても、ほかの進数にすぐ変換されます。マイナスの数や、0x・0b の接頭辞、スペースで区切った数字も入力できます。',
    copy: 'コピー',
    customLabel: '任意の進数（2〜36 進数）',
    customAria: '任意の進数の基数',
    customOption: '{b} 進数',
    group: '桁区切りを表示（2 進数・16 進数は 4 桁、10 進数は 3 桁ごと）',
    upper: '英字を大文字で表示（FF／ff）',
    statBits: '必要なビット数',
    statBytes: 'バイト数',
    statOnes: '2 進数の 1 の個数',
    twosTitle: '2 の補数表現',
    widthAria: 'ビット幅',
    widthOption: '{n} ビット',
    rowBinary: '2 進数のビット列',
    rowHex: '16 進数',
    rowUnsigned: '符号なし整数（unsigned）として',
    rowSigned: '符号付き整数（signed）として',
    client: {
      messages: {
        badBase: '基数は 2〜36 の範囲で指定してください',
        empty: '数値を入力してください',
        badDigit: '「{ch}」は {base} 進数で使えない文字です（使えるのは {allowed}）',
        allowedDigits: '0〜{max}',
        allowedLetters: '0〜9 と A〜{max}',
      },
      noSign: '（符号を除く）',
      negative: '負の数は 2 の補数で表します。{n} の 2 進数の各ビットを反転し、1 を足した値です。',
      highBit: '最上位ビットが 1 なので、符号付き整数として読むと負の数 {n} になります。',
      range: '{bits} ビットで表せる範囲：符号付きは {min}〜{smax}、符号なしは 0〜{max} です。',
      overflow: 'この数は {bits} ビットで表せる範囲（{min}〜{max}）を超えています。表は下位 {bits} ビットだけを残した結果（オーバーフロー）です。',
    },
  },
});

/**
 * 數字與國字（大寫、小寫）互轉，用於支票、收據、發票、合約金額。
 * 大寫：零壹貳參肆伍陸柒捌玖 拾佰仟 萬億兆；小寫：零一二三四五六七八九 十百千 萬億兆。
 * 台灣支票與票據慣用「參」（不寫「叁」）、「新臺幣…元整」。
 */
export type NumeralStyle = 'upper' | 'lower';

const DIGITS: Record<NumeralStyle, string[]> = {
  upper: ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'],
  lower: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
};
const SMALL: Record<NumeralStyle, string[]> = {
  upper: ['', '拾', '佰', '仟'],
  lower: ['', '十', '百', '千'],
};
const BIG = ['', '萬', '億', '兆'];

/** 支援到 9,999 兆（16 位整數）。 */
export const MAX_INTEGER_DIGITS = 16;

export interface ParsedAmount {
  integer: string;
  fraction: string;
}

/** 把使用者輸入（可含逗號、全形數字、NT$）整理成整數與小數字串；不合法回傳 null。 */
export function parseAmount(input: string): ParsedAmount | null {
  const s = input
    .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/(NT\$|NTD|TWD|\$|元|[,\s，])/gi, '');
  const m = /^(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || (m[1] === '' && (m[2] ?? '') === '')) return null;
  const integer = m[1].replace(/^0+(?=\d)/, '') || '0';
  if (integer.length > MAX_INTEGER_DIGITS) return null;
  return { integer, fraction: m[2] ?? '' };
}

function group(n: number, style: NumeralStyle): string {
  const d = DIGITS[style];
  let out = '';
  let zero = false;
  for (let i = 3; i >= 0; i--) {
    const digit = Math.floor(n / 10 ** i) % 10;
    if (digit === 0) {
      if (out) zero = true;
      continue;
    }
    if (zero) out += d[0];
    out += d[digit] + SMALL[style][i];
    zero = false;
  }
  return out;
}

/** 整數（字串）轉國字，正確處理中間與跨萬、億的「零」。 */
export function integerToChinese(integer: string, style: NumeralStyle): string {
  const digits = integer.replace(/^0+(?=\d)/, '');
  if (!/^\d+$/.test(digits) || digits.length > MAX_INTEGER_DIGITS) return '';
  if (/^0+$/.test(digits)) return DIGITS[style][0];
  const groups: number[] = [];
  for (let end = digits.length; end > 0; end -= 4) groups.unshift(Number(digits.slice(Math.max(0, end - 4), end)));
  let out = '';
  let pendingZero = false;
  groups.forEach((g, idx) => {
    const bigIndex = groups.length - 1 - idx;
    if (g === 0) {
      if (out) pendingZero = true;
      return;
    }
    if (out && (pendingZero || g < 1000)) out += DIGITS[style][0];
    out += group(g, style) + BIG[bigIndex];
    pendingZero = false;
  });
  // 口語小寫：開頭「一十」寫作「十」，例如 十五、十萬。
  if (style === 'lower' && out.startsWith('一十')) out = out.slice(1);
  return out;
}

export interface CurrencyOptions {
  style: NumeralStyle;
  /** 前面加「新臺幣」。 */
  prefix: boolean;
}

/** 金額轉國字：元、角、分，無角分時加「整」。小數第三位起四捨五入至分。 */
export function amountToChinese(input: string, opts: CurrencyOptions): string | null {
  const p = parseAmount(input);
  if (!p) return null;
  let integer = p.integer;
  let cents = Number((p.fraction + '000').slice(0, 3));
  cents = Math.round(cents / 10);
  if (cents === 100) {
    integer = (BigInt(integer) + 1n).toString();
    cents = 0;
    if (integer.length > MAX_INTEGER_DIGITS) return null;
  }
  const jiao = Math.floor(cents / 10);
  const fen = cents % 10;
  const d = DIGITS[opts.style];
  const hasInt = integer !== '0';
  let out = '';
  if (hasInt || cents === 0) out += integerToChinese(integer, opts.style) + '元';
  if (cents === 0) out += '整';
  else {
    if (jiao > 0) out += d[jiao] + '角';
    else if (hasInt) out += d[0];
    if (fen > 0) out += d[fen] + '分';
    else out += '整';
  }
  return (opts.prefix ? '新臺幣' : '') + out;
}

/** 一般數字轉國字（不加元），小數部分逐字以「點」連接。 */
export function numberToChinese(input: string, style: NumeralStyle): string | null {
  const p = parseAmount(input);
  if (!p) return null;
  let out = integerToChinese(p.integer, style);
  if (p.fraction) out += '點' + [...p.fraction].map((c) => DIGITS[style][Number(c)]).join('');
  return out;
}

const DIGIT_VALUE: Record<string, number> = {
  零: 0, 〇: 0, '○': 0,
  壹: 1, 一: 1, 弌: 1,
  貳: 2, 贰: 2, 二: 2, 兩: 2, 两: 2,
  參: 3, 叁: 3, 叄: 3, 三: 3,
  肆: 4, 四: 4,
  伍: 5, 五: 5,
  陸: 6, 陆: 6, 六: 6,
  柒: 7, 七: 7,
  捌: 8, 八: 8,
  玖: 9, 九: 9,
};
const SMALL_VALUE: Record<string, number> = { 拾: 10, 十: 10, 佰: 100, 百: 100, 仟: 1000, 千: 1000 };
const BIG_VALUE: Record<string, bigint> = { 萬: 10_000n, 万: 10_000n, 億: 100_000_000n, 亿: 100_000_000n, 兆: 1_000_000_000_000n };

function chineseIntegerToBig(s: string): bigint | null {
  if (s === '') return 0n;
  let total = 0n;
  let section = 0;
  let num = 0;
  let seenDigit = false;
  for (const ch of s) {
    if (ch in DIGIT_VALUE) {
      num = DIGIT_VALUE[ch];
      seenDigit = true;
    } else if (ch in SMALL_VALUE) {
      // 「十五」「十萬」開頭省略「一」。
      section += (seenDigit ? num : 1) * SMALL_VALUE[ch];
      num = 0;
      seenDigit = false;
    } else if (ch in BIG_VALUE) {
      total += BigInt(section + num) * BIG_VALUE[ch];
      section = 0;
      num = 0;
      seenDigit = false;
    } else {
      return null;
    }
  }
  return total + BigInt(section + num);
}

/** 國字金額（大寫或小寫）轉回阿拉伯數字字串，例如「壹仟零伍元整」→「1005」。 */
export function chineseToNumber(input: string): string | null {
  let s = input.replace(/\s/g, '').replace(/^(新臺幣|新台幣|NT\$|人民幣)/, '').replace(/[整正]$/, '');
  if (s === '') return null;
  let fraction = '';
  let integerPart = s;
  const yuan = s.search(/[元圓块塊]/);
  if (yuan >= 0) {
    integerPart = s.slice(0, yuan);
    const rest = s.slice(yuan + 1);
    const m = /^零?(?:(.)角)?零?(?:(.)分)?$/.exec(rest);
    if (!m) return null;
    const jiao = m[1] === undefined ? 0 : DIGIT_VALUE[m[1]];
    const fen = m[2] === undefined ? 0 : DIGIT_VALUE[m[2]];
    if (jiao === undefined || fen === undefined) return null;
    if (jiao || fen) fraction = `${jiao}${fen}`.replace(/0$/, '');
  } else if (s.includes('點')) {
    const [a, b] = s.split('點');
    integerPart = a;
    const digits = [...b].map((c) => DIGIT_VALUE[c]);
    if (digits.some((v) => v === undefined) || digits.length === 0) return null;
    fraction = digits.join('');
  } else if (/[角分]/.test(s)) {
    const m = /^(?:(.)角)?零?(?:(.)分)?$/.exec(s);
    if (!m) return null;
    const jiao = m[1] === undefined ? 0 : DIGIT_VALUE[m[1]];
    const fen = m[2] === undefined ? 0 : DIGIT_VALUE[m[2]];
    if (jiao === undefined || fen === undefined) return null;
    integerPart = '';
    fraction = `${jiao}${fen}`.replace(/0$/, '');
  }
  const int = chineseIntegerToBig(integerPart);
  if (int === null) return null;
  return fraction ? `${int}.${fraction}` : int.toString();
}

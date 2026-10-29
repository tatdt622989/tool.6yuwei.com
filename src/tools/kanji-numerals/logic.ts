/**
 * 数字 ⇄ 漢数字・大字（壱弐参拾萬）の変換。純関数。BigInt で 1 京の位（10^16 台）まで扱う。
 *
 * 出典・根拠（2026-10-29 確認）：
 * - 戸籍法施行規則 第31条第2項「年月日を記載するには、壱、弐、参、拾の文字を用いなければならない。」
 *   https://laws.e-gov.go.jp/law/322M40000010094
 * - 命数法（万進）：一、十、百、千、万（10^4）、億（10^8）、兆（10^12）、京（10^16）。
 * - 大字の字体：壱・弐・参・肆・伍・陸・漆・捌・玖・拾・佰（陌）・阡（仟）・萬。
 *   祝儀袋・香典袋・領収書では「壱・弐・参・伍・拾・萬」などを使うのが慣習（改ざん防止）。
 *   旧字体の「貳」「參」「萬」「圓」も受け付ける。
 */

export const MAX_VALUE = 10n ** 20n - 1n; // 9999京9999兆9999億9999万9999

const STD_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const SMALL_UNITS = ['', '十', '百', '千'];
const BIG_UNITS = ['', '万', '億', '兆', '京'];

export type DaijiSet = 'common' | 'full';

/** 大字の字体。common = 一般的な祝儀袋・領収書向け、full = すべて大字（旧字体）。 */
const DAIJI: Record<DaijiSet, { digits: string[]; small: string[]; man: string }> = {
  common: {
    digits: ['〇', '壱', '弐', '参', '四', '伍', '六', '七', '八', '九'],
    small: ['', '拾', '百', '千'],
    man: '萬',
  },
  full: {
    digits: ['零', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖'],
    small: ['', '拾', '佰', '阡'],
    man: '萬',
  },
};

export interface KanjiOptions {
  /** 「千」の前に「一」を付ける（一千）。十・百の前の一は付けない。既定 false。 */
  ichiBeforeSen?: boolean;
}

function groups(n: bigint): number[] {
  const out: number[] = [];
  let rest = n;
  while (rest > 0n) {
    out.push(Number(rest % 10000n));
    rest /= 10000n;
  }
  return out; // 下の位から
}

function assertRange(n: bigint) {
  if (n < 0n) throw new RangeError('負の数には対応していません');
  if (n > MAX_VALUE) throw new RangeError('9999京9999兆9999億9999万9999 までの数を入力してください');
}

/** 位取りの漢数字：12345 → 一万二千三百四十五。0 → 〇（零）。 */
export function toKanji(n: bigint, options: KanjiOptions = {}): string {
  assertRange(n);
  if (n === 0n) return '〇';
  const { ichiBeforeSen = false } = options;
  return groups(n)
    .map((g, gi) => {
      if (g === 0) return '';
      let s = '';
      for (let p = 3; p >= 0; p--) {
        const d = Math.floor(g / 10 ** p) % 10;
        if (d === 0) continue;
        const omitOne = d === 1 && p > 0 && !(p === 3 && ichiBeforeSen);
        s += (omitOne ? '' : STD_DIGITS[d]) + SMALL_UNITS[p];
      }
      return s + BIG_UNITS[gi];
    })
    .reverse()
    .join('');
}

/** 大字：12345 → 壱萬弐千参百四拾伍。十・百・千の前にも必ず「壱」を付ける（改ざん防止）。 */
export function toDaiji(n: bigint, set: DaijiSet = 'common'): string {
  assertRange(n);
  const d = DAIJI[set];
  if (n === 0n) return d.digits[0];
  return groups(n)
    .map((g, gi) => {
      if (g === 0) return '';
      let s = '';
      for (let p = 3; p >= 0; p--) {
        const digit = Math.floor(g / 10 ** p) % 10;
        if (digit === 0) continue;
        s += d.digits[digit] + d.small[p];
      }
      return s + (gi === 1 ? d.man : BIG_UNITS[gi]);
    })
    .reverse()
    .join('');
}

/** 一桁ずつ漢数字に置き換える縦書き用の表記：2026 → 二〇二六。 */
export function toPositional(n: bigint): string {
  assertRange(n);
  return n
    .toString()
    .split('')
    .map((c) => STD_DIGITS[Number(c)])
    .join('');
}

/** 万・億・兆の単位だけ漢字にする表記（新聞・ニュース風）：123456789 → 1億2345万6789。 */
export function toMixed(n: bigint): string {
  assertRange(n);
  if (n === 0n) return '0';
  return groups(n)
    .map((g, gi) => (g === 0 ? '' : `${g}${BIG_UNITS[gi]}`))
    .reverse()
    .join('');
}

/** 祝儀袋・領収書の金額表記：金壱萬円 / 金壱萬円也。 */
export function toAmount(n: bigint, set: DaijiSet = 'common', options: { nari?: boolean; yen?: '円' | '圓' } = {}): string {
  const { nari = false, yen = '円' } = options;
  return `金${toDaiji(n, set)}${yen}${nari ? '也' : ''}`;
}

// ---------------------------------------------------------------- parse

const DIGIT_VALUE: Record<string, number> = {
  '〇': 0, '零': 0, '○': 0,
  '一': 1, '壱': 1, '壹': 1, '弌': 1,
  '二': 2, '弐': 2, '貳': 2, '貮': 2, '弍': 2,
  '三': 3, '参': 3, '參': 3, '弎': 3,
  '四': 4, '肆': 4,
  '五': 5, '伍': 5,
  '六': 6, '陸': 6,
  '七': 7, '漆': 7, '柒': 7,
  '八': 8, '捌': 8,
  '九': 9, '玖': 9,
};
const SMALL_VALUE: Record<string, bigint> = {
  '十': 10n, '拾': 10n, '什': 10n,
  '百': 100n, '佰': 100n, '陌': 100n,
  '千': 1000n, '阡': 1000n, '仟': 1000n,
};
const BIG_VALUE: Record<string, bigint> = {
  '万': 10n ** 4n, '萬': 10n ** 4n,
  '億': 10n ** 8n,
  '兆': 10n ** 12n,
  '京': 10n ** 16n,
};

export type ParseResult = { ok: true; value: bigint } | { ok: false; error: string };

/**
 * 漢数字・大字・算用数字・それらの混在を数値にする。
 * 「一万二千三百」「壱萬弐千」「二〇二六」「3万5千」「金壱萬円也」「１２，３４５」などに対応。
 */
export function parseJapaneseNumber(input: string): ParseResult {
  let s = input
    .normalize('NFKC')
    .replace(/[\s,，、]/g, '')
    .replace(/^金/, '')
    .replace(/(円|圓)?也?$/, '')
    .replace(/(円|圓)$/, '');
  if (s === '') return { ok: false, error: '数字または漢数字を入力してください' };

  // 位の字がなければ一桁ずつの表記（二〇二六、2026）
  const hasUnit = [...s].some((c) => c in SMALL_VALUE || c in BIG_VALUE);
  if (!hasUnit) {
    let digits = '';
    for (const c of s) {
      if (/[0-9]/.test(c)) digits += c;
      else if (c in DIGIT_VALUE) digits += String(DIGIT_VALUE[c]);
      else return { ok: false, error: `「${c}」は数字として読み取れません` };
    }
    const value = BigInt(digits);
    return value > MAX_VALUE ? { ok: false, error: '大きすぎる数です（9999京まで）' } : { ok: true, value };
  }

  let total = 0n; // 確定した万・億…の合計
  let section = 0n; // 現在の万未満の部分
  let pending: bigint | null = null; // 直前の数字（まだ位が付いていない）
  let lastBig = 10n ** 20n;
  let lastSmall = 10000n; // 同じ万未満のまとまりの中で、十・百・千は大きい順に並ぶ
  for (const c of s) {
    if (/[0-9]/.test(c) || c in DIGIT_VALUE) {
      const d = BigInt(/[0-9]/.test(c) ? Number(c) : DIGIT_VALUE[c]);
      pending = (pending ?? 0n) * 10n + d;
      continue;
    }
    if (c in SMALL_VALUE) {
      if (SMALL_VALUE[c] >= lastSmall) return { ok: false, error: `「${c}」の位置が正しくありません` };
      section += (pending ?? 1n) * SMALL_VALUE[c];
      pending = null;
      lastSmall = SMALL_VALUE[c];
      continue;
    }
    if (c in BIG_VALUE) {
      const unit = BIG_VALUE[c];
      if (unit >= lastBig) return { ok: false, error: `「${c}」の位置が正しくありません` };
      const block = section + (pending ?? 0n);
      if (block === 0n) return { ok: false, error: `「${c}」の前に数がありません` };
      if (block >= 10000n) return { ok: false, error: `「${c}」の前の数が大きすぎます` };
      total += block * unit;
      section = 0n;
      pending = null;
      lastBig = unit;
      lastSmall = 10000n;
      continue;
    }
    return { ok: false, error: `「${c}」は数字として読み取れません` };
  }
  const tail = section + (pending ?? 0n);
  if (tail >= 10000n) return { ok: false, error: '万の位より下が 4 桁を超えています' };
  const value = total + tail;
  return value > MAX_VALUE ? { ok: false, error: '大きすぎる数です（9999京まで）' } : { ok: true, value };
}

/** 算用数字だけの入力（カンマ・全角可）を BigInt にする。数字でなければ null。 */
export function parseArabic(input: string): bigint | null {
  const s = input.normalize('NFKC').replace(/[\s,，]/g, '');
  return /^\d+$/.test(s) ? BigInt(s) : null;
}

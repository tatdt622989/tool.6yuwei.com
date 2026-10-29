// Unbiased random numbers, dice and coins. Pure functions; randomness is injected for testability.

/** Fills the array with uniformly random 32-bit integers. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  // TS 5.7+ types getRandomValues as ArrayBuffer-backed only; our buffers always are.
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

const TWO_32 = 0x1_0000_0000;
const TWO_53 = 2 ** 53;

export const MAX_COUNT = 10_000;
export const MAX_DECIMALS = 6;

/**
 * Unbiased integer in [0, n) via rejection sampling. Uses one 32-bit word when n ≤ 2^32,
 * otherwise combines two words into a 53-bit value so the result stays exact.
 */
export function randomBelow(n: number, random: RandomSource = defaultRandom): number {
  if (!Number.isSafeInteger(n) || n < 1) throw new RangeError(`Invalid range size: ${n}`);
  if (n <= TWO_32) {
    const limit = Math.floor(TWO_32 / n) * n;
    const buf = new Uint32Array(1);
    let v: number;
    do v = random(buf)[0];
    while (v >= limit);
    return v % n;
  }
  const limit = Math.floor(TWO_53 / n) * n;
  const buf = new Uint32Array(2);
  let v: number;
  do {
    random(buf);
    v = (buf[0] & 0x1f_ffff) * TWO_32 + buf[1];
  } while (v >= limit);
  return v % n;
}

export type SortOrder = 'none' | 'asc' | 'desc';

export interface NumberOptions {
  min: number;
  max: number;
  count: number;
  /** Digits after the decimal point, 0 for integers. */
  decimals: number;
  unique: boolean;
  sort: SortOrder;
}

/** Machine-readable reason for a failed draw; UIs map it to their own (localized) message. */
export type NumberErrorCode =
  | 'invalid-bounds'
  | 'min-over-max'
  | 'count-too-small'
  | 'count-too-large'
  | 'bad-decimals'
  | 'range-too-wide'
  | 'empty-range'
  | 'not-enough-unique';

export type NumberResult =
  | { ok: true; values: number[] }
  | {
      ok: false;
      /** zh-TW message, kept for existing callers. */
      error: string;
      code: NumberErrorCode;
      /** Numbers referenced by the message: max (count or decimals limit), size, count. */
      vars: { max?: number; size?: number; count?: number };
    };

function fail(code: NumberErrorCode, error: string, vars: { max?: number; size?: number; count?: number } = {}): NumberResult {
  return { ok: false, error, code, vars };
}

/** Number of distinct values available between min and max at the given precision. */
export function rangeSize(min: number, max: number, decimals: number): number {
  const { lo, hi } = scaledBounds(min, max, 10 ** decimals);
  return hi - lo + 1;
}

/** Integer bounds after scaling; toFixed absorbs float noise such as 0.1 * 10 = 1.0000000000000002. */
function scaledBounds(min: number, max: number, scale: number): { lo: number; hi: number } {
  return {
    lo: Math.ceil(Number((min * scale).toFixed(6))),
    hi: Math.floor(Number((max * scale).toFixed(6))),
  };
}

export function generateNumbers(options: NumberOptions, random: RandomSource = defaultRandom): NumberResult {
  const { min, max, unique, sort } = options;
  const count = Math.floor(options.count);
  const decimals = Math.floor(options.decimals);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fail('invalid-bounds', '請輸入有效的最小值與最大值。');
  if (min > max) return fail('min-over-max', '最小值不能大於最大值。');
  if (!Number.isFinite(count) || count < 1) return fail('count-too-small', '數量至少要 1 個。');
  if (count > MAX_COUNT) return fail('count-too-large', `一次最多產生 ${MAX_COUNT.toLocaleString('zh-TW')} 個。`, { max: MAX_COUNT });
  if (decimals < 0 || decimals > MAX_DECIMALS) {
    return fail('bad-decimals', `小數位數需介於 0 到 ${MAX_DECIMALS}。`, { max: MAX_DECIMALS });
  }

  const scale = 10 ** decimals;
  const { lo, hi } = scaledBounds(min, max, scale);
  const size = hi - lo + 1;
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || !Number.isSafeInteger(size)) {
    return fail('range-too-wide', '範圍太大，請縮小範圍或減少小數位數。');
  }
  if (size < 1) return fail('empty-range', '範圍內沒有符合小數位數的數字。');
  if (unique && count > size) {
    return fail(
      'not-enough-unique',
      `範圍內只有 ${size.toLocaleString('zh-TW')} 個不同的數字，無法產生 ${count.toLocaleString('zh-TW')} 個不重複的數字。`,
      { size, count },
    );
  }

  let scaled: number[];
  if (!unique) {
    scaled = Array.from({ length: count }, () => lo + randomBelow(size, random));
  } else if (size <= 100_000 && count > size / 4) {
    // Dense draw: partial Fisher–Yates over the whole range.
    const pool = Array.from({ length: size }, (_, i) => lo + i);
    for (let i = 0; i < count; i++) {
      const j = i + randomBelow(size - i, random);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    scaled = pool.slice(0, count);
  } else {
    // Sparse draw: redraw on collision; expected retries stay low because count ≤ size / 4 or the range is huge.
    const seen = new Set<number>();
    scaled = [];
    while (scaled.length < count) {
      const v = lo + randomBelow(size, random);
      if (!seen.has(v)) {
        seen.add(v);
        scaled.push(v);
      }
    }
  }

  let values = scaled.map((v) => (decimals === 0 ? v : Number((v / scale).toFixed(decimals))));
  if (sort === 'asc') values = values.sort((a, b) => a - b);
  else if (sort === 'desc') values = values.sort((a, b) => b - a);
  return { ok: true, values };
}

export interface Preset {
  min: number;
  max: number;
  count: number;
  unique: boolean;
  decimals: number;
}

/**
 * Parses a quick-setting string "min,max,count,unique[,decimals]" (unique is 1 or 0), as used by the
 * preset buttons and the second-zone ("bonus ball") spec of lottery presets. Returns null when malformed.
 */
export function parsePreset(spec: string): Preset | null {
  const parts = spec.split(',').map((p) => Number(p.trim()));
  if (parts.length < 3 || parts.length > 5 || parts.some((n) => !Number.isFinite(n))) return null;
  const [min, max, count, unique = 0, decimals = 0] = parts;
  return { min, max, count, unique: unique === 1, decimals };
}

export function formatValue(value: number, decimals: number): string {
  return decimals === 0 ? String(value) : value.toFixed(decimals);
}

export interface DiceRoll {
  values: number[];
  sum: number;
}

export function rollDice(count: number, sides = 6, random: RandomSource = defaultRandom): DiceRoll {
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  const values = Array.from({ length: n }, () => 1 + randomBelow(sides, random));
  return { values, sum: values.reduce((a, b) => a + b, 0) };
}

/** Pip positions (0–8, row-major in a 3×3 grid) for each face of a six-sided die. */
export function dicePips(face: number): number[] {
  const map: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return map[face] ?? [];
}

export type CoinSide = 'heads' | 'tails';

export interface CoinFlips {
  values: CoinSide[];
  heads: number;
  tails: number;
}

export function flipCoins(count: number, random: RandomSource = defaultRandom): CoinFlips {
  const n = Math.max(1, Math.min(MAX_COUNT, Math.floor(count)));
  const values = Array.from({ length: n }, (): CoinSide => (randomBelow(2, random) === 0 ? 'heads' : 'tails'));
  const heads = values.filter((v) => v === 'heads').length;
  return { values, heads, tails: n - heads };
}

export const COIN_LABEL: Record<CoinSide, string> = { heads: '正面', tails: '反面' };

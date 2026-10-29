// Fair drawing and grouping. Pure functions; randomness is injected for testability.

/** Fills the array with uniformly random 32-bit integers. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  // TS 5.7+ types getRandomValues as ArrayBuffer-backed only; our buffers always are.
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export const MAX_ENTRIES = 10_000;

/** Unbiased integer in [0, max) using rejection sampling (max ≤ 2^32). */
export function randomIndex(max: number, random: RandomSource = defaultRandom): number {
  if (!Number.isInteger(max) || max < 1 || max > 0x1_0000_0000) throw new RangeError(`Invalid range: ${max}`);
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    value = random(buf)[0];
  } while (value >= limit);
  return value % max;
}

/** Fisher–Yates shuffle into a new array; every permutation is equally likely. */
export function shuffle<T>(items: readonly T[], random: RandomSource = defaultRandom): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * How a pasted list is split into entries.
 * - `lines`: one entry per line (zh-TW, en).
 * - `ja`: lines, plus 読点「、」, full-width comma「，」 and tabs (lists pasted from LINE / Excel).
 *   Spaces are never separators, so 「佐藤　太郎」 stays one entry.
 */
export type SplitMode = 'lines' | 'ja';

const SPLITTERS: Record<SplitMode, RegExp> = {
  lines: /\r\n|\r|\n/,
  ja: /\r\n|\r|\n|\t|、|，/,
};

/** One entry per line; trims, drops blank lines and optionally removes duplicates (first one wins). */
export function parseEntries(text: string, dedupe = false, split: SplitMode = 'lines'): string[] {
  const entries = text
    .split(SPLITTERS[split])
    .map((line) => line.trim())
    .filter(Boolean);
  const list = dedupe ? Array.from(new Set(entries)) : entries;
  return list.slice(0, MAX_ENTRIES);
}

export function countDuplicates(text: string, split: SplitMode = 'lines'): number {
  const entries = parseEntries(text, false, split);
  return entries.length - new Set(entries).size;
}

/** Draws `count` distinct entries (by position) in draw order. */
export function pickWinners(entries: readonly string[], count: number, random: RandomSource = defaultRandom): string[] {
  const n = Math.max(0, Math.min(Math.floor(count), entries.length));
  // Partial Fisher–Yates: only the first n positions need to be settled.
  const pool = entries.slice();
  for (let i = 0; i < n; i++) {
    const j = i + randomIndex(pool.length - i, random);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/**
 * Splits entries into `groupCount` groups whose sizes differ by at most one.
 * Entries are shuffled first, then dealt round-robin; which groups get the extra member is also random.
 */
export function splitIntoGroups(
  entries: readonly string[],
  groupCount: number,
  random: RandomSource = defaultRandom,
): string[][] {
  const k = Math.max(1, Math.min(Math.floor(groupCount), entries.length || 1));
  const groups: string[][] = Array.from({ length: k }, () => []);
  shuffle(entries, random).forEach((entry, i) => groups[i % k].push(entry));
  return shuffle(groups, random);
}

/** Group count needed for a target group size, e.g. 10 people in groups of 3 → 4 groups. */
export function groupsForSize(total: number, size: number): number {
  if (total <= 0 || size <= 0) return 0;
  return Math.ceil(total / Math.floor(size));
}

/** Removes drawn entries (one occurrence each) from the original list, preserving order. */
export function removeDrawn(entries: readonly string[], drawn: readonly string[]): string[] {
  const remaining = new Map<string, number>();
  for (const d of drawn) remaining.set(d, (remaining.get(d) ?? 0) + 1);
  return entries.filter((entry) => {
    const left = remaining.get(entry) ?? 0;
    if (left === 0) return true;
    remaining.set(entry, left - 1);
    return false;
  });
}

export function formatWinners(winners: readonly string[]): string {
  return winners.map((name, i) => `${i + 1}. ${name}`).join('\n');
}

/** One line of copied group output; `index` is zero-based. */
export type GroupLineFormat = (members: readonly string[], index: number) => string;

const zhGroupLine: GroupLineFormat = (g, i) => `第 ${i + 1} 組（${g.length} 人）：${g.join('、')}`;

export function formatGroups(groups: readonly string[][], line: GroupLineFormat = zhGroupLine): string {
  return groups.map((g, i) => line(g, i)).join('\n');
}

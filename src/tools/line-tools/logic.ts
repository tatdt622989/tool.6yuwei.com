// Pure per-line text operations. Every operation takes and returns an array of lines.

export type ZhCollation = 'stroke' | 'zhuyin';

export interface CompareOptions {
  /** Treat "Apple" and "apple" as different lines (dedupe) / sort uppercase separately. */
  caseSensitive: boolean;
  /** How Chinese text is ordered: by stroke count (Taiwan default) or by Zhuyin (Bopomofo). */
  collation: ZhCollation;
}

/** Returns a random number in [0, 1). Injected for testability. */
export type RandomFn = () => number;

/** Splits text into lines. An empty string has no lines; a trailing newline does not add one. */
export function splitLines(text: string): string[] {
  if (text === '') return [];
  const lines = text.split(/\r\n|\r|\n/);
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function joinLines(lines: string[]): string {
  return lines.join('\n');
}

function collator(options: CompareOptions, numeric: boolean): Intl.Collator {
  const locale = options.collation === 'zhuyin' ? 'zh-TW-u-co-zhuyin' : 'zh-Hant-TW';
  return new Intl.Collator(locale, {
    numeric,
    sensitivity: options.caseSensitive ? 'variant' : 'accent',
    caseFirst: options.caseSensitive ? 'upper' : 'false',
  });
}

export type SortMode = 'asc' | 'desc' | 'natural' | 'length';

/**
 * asc / desc: dictionary order (A–Z, Chinese by stroke or Zhuyin).
 * natural: like asc but numbers compare by value (item2 before item10).
 * length: shortest first; ties keep their original order.
 */
export function sortLines(lines: string[], mode: SortMode, options: CompareOptions): string[] {
  if (mode === 'length') {
    return [...lines].sort((a, b) => Array.from(a).length - Array.from(b).length);
  }
  const { compare } = collator(options, mode === 'natural');
  const sorted = [...lines].sort(compare);
  return mode === 'desc' ? sorted.reverse() : sorted;
}

export function reverseLines(lines: string[]): string[] {
  return [...lines].reverse();
}

/** Fisher–Yates shuffle. */
export function shuffleLines(lines: string[], random: RandomFn = Math.random): string[] {
  const out = [...lines];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Keeps the first occurrence of each line. Lines are compared after trimming surrounding spaces.
 * Empty lines are never treated as duplicates (use removeEmptyLines for those).
 */
export function dedupeLines(lines: string[], caseSensitive: boolean): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed === '') return true;
    const key = caseSensitive ? trimmed : trimmed.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Removes empty lines, including lines containing only whitespace. */
export function removeEmptyLines(lines: string[]): string[] {
  return lines.filter((line) => line.trim() !== '');
}

/** Trims leading and trailing whitespace (including full-width spaces) on every line. */
export function trimLines(lines: string[]): string[] {
  return lines.map((line) => line.trim());
}

/** Adds a prefix and suffix to each line. Empty lines are left untouched. */
export function addAffixes(lines: string[], prefix: string, suffix: string): string[] {
  return lines.map((line) => (line.trim() === '' ? line : `${prefix}${line}${suffix}`));
}

export type NumberFormat = 'dot' | 'paren' | 'comma' | 'tab';

const NUMBER_FORMATS: Record<NumberFormat, (n: string) => string> = {
  dot: (n) => `${n}. `,
  paren: (n) => `${n}) `,
  comma: (n) => `${n}、`,
  tab: (n) => `${n}\t`,
};

export function isNumberFormat(value: unknown): value is NumberFormat {
  return typeof value === 'string' && value in NUMBER_FORMATS;
}

/**
 * Prepends line numbers. Empty lines are skipped and do not consume a number.
 * With `pad`, numbers are zero-padded to the width of the largest one (01 … 12).
 */
export function numberLines(lines: string[], format: NumberFormat, start = 1, pad = false): string[] {
  const count = lines.filter((line) => line.trim() !== '').length;
  const width = pad ? String(start + Math.max(count - 1, 0)).length : 0;
  let n = start;
  return lines.map((line) => {
    if (line.trim() === '') return line;
    return NUMBER_FORMATS[format](String(n++).padStart(width, '0')) + line;
  });
}

export interface LineStats {
  total: number;
  nonEmpty: number;
  /** Lines that would be removed by dedupeLines. */
  duplicates: number;
}

export function lineStats(lines: string[], caseSensitive: boolean): LineStats {
  return {
    total: lines.length,
    nonEmpty: removeEmptyLines(lines).length,
    duplicates: lines.length - dedupeLines(lines, caseSensitive).length,
  };
}

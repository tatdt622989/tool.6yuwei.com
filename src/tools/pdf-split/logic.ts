// Pure page-selection logic for PDF split / extract. Page numbers are 1-based
// everywhere in this file (that is what users type); convert at the pdf-lib edge.

export type SplitMode = 'extract' | 'each' | 'every' | 'delete';

/** Templates for parse problems: {token} is the user's text, {count} the page count. */
export interface RangeMessages {
  unreadable: string;
  outOfRange: string;
}

/** Default (zh-TW) messages; localized UIs pass their own. */
export const ZH_RANGE_MESSAGES: RangeMessages = {
  unreadable: '看不懂「{token}」',
  outOfRange: '「{token}」超出範圍（共 {count} 頁）',
};

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

export interface RangeParse {
  /** Sorted, unique, 1-based page numbers inside 1..pageCount. */
  pages: number[];
  /** Human-readable problems (out of range, unreadable tokens). */
  errors: string[];
}

/** Full-width digits and common Chinese / Japanese separators people type on phones. */
function normalize(input: string): string {
  return input
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0))
    .replace(/[－–—~～〜至到]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/[，、；;\s]+/g, ',');
}

/**
 * Parses "1-3,5,8-10". Also accepts "8-" (to the last page), "-3" (from page 1),
 * reversed ranges "10-8", full-width digits and 、，；as separators.
 */
export function parsePageRanges(input: string, pageCount: number, messages: RangeMessages = ZH_RANGE_MESSAGES): RangeParse {
  const set = new Set<number>();
  const errors: string[] = [];
  const tokens = normalize(input)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  for (const token of tokens) {
    const m = /^(\d*)-(\d*)$/.exec(token);
    let from: number;
    let to: number;
    if (/^\d+$/.test(token)) {
      from = to = Number(token);
    } else if (m && (m[1] || m[2])) {
      from = m[1] ? Number(m[1]) : 1;
      to = m[2] ? Number(m[2]) : pageCount;
      if (from > to) [from, to] = [to, from];
    } else {
      errors.push(fill(messages.unreadable, { token }));
      continue;
    }
    if (from < 1 || to > pageCount) {
      errors.push(fill(messages.outOfRange, { token, count: pageCount }));
      from = Math.max(1, from);
      to = Math.min(pageCount, to);
    }
    for (let p = from; p <= to; p++) set.add(p);
  }
  return { pages: [...set].sort((a, b) => a - b), errors };
}

/** [1,2,3,5,8,9,10] → "1-3,5,8-10" */
export function formatPageRanges(pages: Iterable<number>): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    const end = sorted[i];
    parts.push(start === end ? String(start) : end === start + 1 ? `${start},${end}` : `${start}-${end}`);
  }
  return parts.join(',');
}

/** Splits 1..pageCount into consecutive groups of n pages; the last group may be shorter. */
export function chunkPages(pageCount: number, n: number): number[][] {
  const size = Math.max(1, Math.floor(n) || 1);
  const groups: number[][] = [];
  for (let start = 1; start <= pageCount; start += size) {
    const group: number[] = [];
    for (let p = start; p < start + size && p <= pageCount; p++) group.push(p);
    groups.push(group);
  }
  return groups;
}

export interface OutputPlan {
  /** 1-based pages for each output file, in output order. */
  pages: number[];
  filename: string;
}

export function baseName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const base = (dot > 0 ? filename.slice(0, dot) : filename).trim();
  return base || 'document';
}

function pad(n: number, total: number): string {
  return String(n).padStart(String(total).length, '0');
}

function label(group: number[], total: number): string {
  const first = group[0];
  const last = group[group.length - 1];
  return first === last ? `p${pad(first, total)}` : `p${pad(first, total)}-${pad(last, total)}`;
}

/**
 * Decides which files to produce.
 * - extract: one file with the selected pages
 * - delete:  one file with every page except the selected ones
 * - each:    one file per page
 * - every:   one file per `everyN` pages
 */
export function planOutputs(
  mode: SplitMode,
  pageCount: number,
  selected: readonly number[],
  everyN: number,
  sourceName: string,
): OutputPlan[] {
  const base = baseName(sourceName);
  const chosen = [...new Set(selected)].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  if (pageCount <= 0) return [];
  switch (mode) {
    case 'extract': {
      if (!chosen.length) return [];
      const ranges = formatPageRanges(chosen).replace(/,/g, '_');
      return [{ pages: chosen, filename: ranges.length <= 20 ? `${base}-p${ranges}.pdf` : `${base}-extract.pdf` }];
    }
    case 'delete': {
      const removed = new Set(chosen);
      const kept = [];
      for (let p = 1; p <= pageCount; p++) if (!removed.has(p)) kept.push(p);
      return kept.length && removed.size ? [{ pages: kept, filename: `${base}-edited.pdf` }] : [];
    }
    case 'each':
      return chunkPages(pageCount, 1).map((g) => ({ pages: g, filename: `${base}-${label(g, pageCount)}.pdf` }));
    case 'every':
      return chunkPages(pageCount, everyN).map((g) => ({ pages: g, filename: `${base}-${label(g, pageCount)}.pdf` }));
  }
}

/** Adds a quarter turn clockwise, normalized to 0/90/180/270. */
export function addRotation(current: number, delta: number): number {
  return (((current + delta) % 360) + 360) % 360;
}

export function isPdf(type: string, name: string): boolean {
  return type === 'application/pdf' || /\.pdf$/i.test(name);
}

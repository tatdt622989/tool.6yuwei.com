// Pure helpers for ordering files and naming the merged output.

/** Returns a new array with the element at `from` moved to index `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = list.slice();
  if (from < 0 || from >= copy.length) return copy;
  const target = Math.max(0, Math.min(copy.length - 1, to));
  const [item] = copy.splice(from, 1);
  copy.splice(target, 0, item);
  return copy;
}

export interface Band {
  top: number;
  height: number;
}

/**
 * Index the dragged item should land on, given the original vertical bands of
 * every item and how far the dragged item has moved. The item passes a
 * neighbour once its centre crosses the neighbour's centre.
 */
export function dropIndex(bands: readonly Band[], from: number, dy: number): number {
  if (from < 0 || from >= bands.length) return from;
  const center = bands[from].top + bands[from].height / 2 + dy;
  let to = from;
  for (let i = from + 1; i < bands.length; i++) {
    if (center > bands[i].top + bands[i].height / 2) to = i;
    else break;
  }
  for (let i = from - 1; i >= 0; i--) {
    if (center < bands[i].top + bands[i].height / 2) to = i;
    else break;
  }
  return to;
}

/**
 * Vertical offset each non-dragged item should slide by while dragging so a
 * gap opens at the drop position. `shift` is the dragged item's height + gap.
 */
export function shiftFor(index: number, from: number, to: number, shift: number): number {
  if (index === from) return 0;
  if (from < to && index > from && index <= to) return -shift;
  if (from > to && index >= to && index < from) return shift;
  return 0;
}

/** Strips characters Windows / macOS reject in file names and ensures the extension. */
export function safeFilename(input: string, fallback: string, ext = 'pdf'): string {
  const re = new RegExp(`\\.${ext}$`, 'i');
  const cleaned = input
    .replace(re, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return `${cleaned || fallback}.${ext}`;
}

export function isPdfFile(type: string, name: string): boolean {
  return type === 'application/pdf' || /\.pdf$/i.test(name);
}

export interface MergeItemInfo {
  size: number;
  pages?: number;
  error?: string;
}

export function mergeSummary(items: readonly MergeItemInfo[]): { files: number; pages: number; bytes: number; ready: boolean } {
  const usable = items.filter((i) => !i.error);
  return {
    files: usable.length,
    pages: usable.reduce((s, i) => s + (i.pages ?? 0), 0),
    bytes: usable.reduce((s, i) => s + i.size, 0),
    // Merging needs at least two readable files whose page counts are known.
    ready: usable.length >= 2 && usable.every((i) => i.pages !== undefined),
  };
}

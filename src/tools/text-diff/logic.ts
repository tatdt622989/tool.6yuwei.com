// Line diff (Myers O(ND) algorithm) with optional word / character highlighting inside changed lines.

export type EditOp = 'equal' | 'delete' | 'insert';

/** One step of an edit script. `a` / `b` are indexes into the old / new sequence, -1 when not applicable. */
export interface Edit {
  op: EditOp;
  a: number;
  b: number;
}

/** Upper bound on the edit distance explored by Myers; beyond it we fall back to "replace everything". */
export const DEFAULT_MAX_COST = 2000;

function myers(
  a: readonly string[],
  b: readonly string[],
  aOff: number,
  n: number,
  bOff: number,
  m: number,
  maxCost: number,
): Edit[] | null {
  const limit = Math.min(n + m, maxCost);
  const offset = limit + 1;
  const v = new Int32Array(2 * limit + 3);
  // trace[d] holds v (for k in [-d-1, d+1]) as it was before step d; needed to walk back.
  const trace: Int32Array[] = [];

  for (let d = 0; d <= limit; d++) {
    trace.push(v.slice(offset - d - 1, offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[aOff + x] === b[bOff + y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) return backtrack(trace, d, n, m, aOff, bOff);
    }
  }
  return null;
}

function backtrack(trace: Int32Array[], dEnd: number, n: number, m: number, aOff: number, bOff: number): Edit[] {
  const out: Edit[] = [];
  let x = n;
  let y = m;
  for (let d = dEnd; d >= 0; d--) {
    const v = trace[d];
    const at = (k: number) => v[k + d + 1];
    const k = x - y;
    const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
    const prevX = at(prevK);
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      out.push({ op: 'equal', a: aOff + x, b: bOff + y });
    }
    if (d > 0) {
      if (x === prevX) {
        y--;
        out.push({ op: 'insert', a: -1, b: bOff + y });
      } else {
        x--;
        out.push({ op: 'delete', a: aOff + x, b: -1 });
      }
    }
    x = prevX;
    y = prevY;
  }
  return out.reverse();
}

/** Shortest edit script between two sequences of comparison keys. */
export function diffSequences(a: readonly string[], b: readonly string[], maxCost = DEFAULT_MAX_COST): Edit[] {
  const edits: Edit[] = [];
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    edits.push({ op: 'equal', a: start, b: start });
    start++;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const middle = myers(a, b, start, endA - start, start, endB - start, maxCost);
  if (middle) {
    edits.push(...middle);
  } else {
    for (let i = start; i < endA; i++) edits.push({ op: 'delete', a: i, b: -1 });
    for (let j = start; j < endB; j++) edits.push({ op: 'insert', a: -1, b: j });
  }

  for (let i = 0; endA + i < a.length; i++) edits.push({ op: 'equal', a: endA + i, b: endB + i });
  return edits;
}

// ---------- Text diff ----------

export type InlineLevel = 'none' | 'word' | 'char';

export interface DiffOptions {
  /** Ignore leading/trailing whitespace and treat runs of whitespace as one space. */
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  inline: InlineLevel;
}

export interface Segment {
  text: string;
  changed: boolean;
}

export type DiffRow =
  | { kind: 'equal'; oldNo: number; newNo: number; oldText: string; newText: string }
  | { kind: 'delete'; oldNo: number; oldText: string }
  | { kind: 'insert'; newNo: number; newText: string }
  | { kind: 'change'; oldNo: number; newNo: number; oldText: string; newText: string; oldParts: Segment[]; newParts: Segment[] };

export interface DiffResult {
  rows: DiffRow[];
  added: number;
  removed: number;
  unchanged: number;
}

export function splitLines(text: string): string[] {
  return text === '' ? [] : text.split(/\r\n|\r|\n/);
}

function normalize(text: string, options: Pick<DiffOptions, 'ignoreWhitespace' | 'ignoreCase'>): string {
  let out = text;
  if (options.ignoreWhitespace) out = out.trim().replace(/\s+/g, ' ');
  if (options.ignoreCase) out = out.toLowerCase();
  return out;
}

const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}';
// Single CJK characters, runs of other letters/digits, runs of whitespace, or any single character.
const WORD_TOKEN = new RegExp(`[${CJK}]|(?:(?![${CJK}])[\\p{L}\\p{N}_])+|\\s+|[^]`, 'gu');

export function tokenize(text: string, level: Exclude<InlineLevel, 'none'>): string[] {
  return level === 'char' ? Array.from(text) : (text.match(WORD_TOKEN) ?? []);
}

function pushSegment(parts: Segment[], text: string, changed: boolean) {
  const last = parts[parts.length - 1];
  if (last && last.changed === changed) last.text += text;
  else parts.push({ text, changed });
}

/** Highlights the parts of two lines that differ. */
export function diffInline(
  oldLine: string,
  newLine: string,
  level: Exclude<InlineLevel, 'none'>,
  options: Pick<DiffOptions, 'ignoreWhitespace' | 'ignoreCase'>,
): { oldParts: Segment[]; newParts: Segment[] } {
  const a = tokenize(oldLine, level);
  const b = tokenize(newLine, level);
  const key = (t: string) => (options.ignoreWhitespace && /^\s+$/.test(t) ? ' ' : options.ignoreCase ? t.toLowerCase() : t);
  const oldParts: Segment[] = [];
  const newParts: Segment[] = [];
  for (const edit of diffSequences(a.map(key), b.map(key), 500)) {
    if (edit.op === 'equal') {
      pushSegment(oldParts, a[edit.a], false);
      pushSegment(newParts, b[edit.b], false);
    } else if (edit.op === 'delete') {
      pushSegment(oldParts, a[edit.a], true);
    } else {
      pushSegment(newParts, b[edit.b], true);
    }
  }
  return { oldParts, newParts };
}

export function diffText(oldText: string, newText: string, options: DiffOptions): DiffResult {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const edits = diffSequences(
    a.map((line) => normalize(line, options)),
    b.map((line) => normalize(line, options)),
  );

  const rows: DiffRow[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  let dels: number[] = [];
  let ins: number[] = [];

  const flush = () => {
    const paired = Math.min(dels.length, ins.length);
    for (let i = 0; i < paired; i++) {
      const oldLine = a[dels[i]];
      const newLine = b[ins[i]];
      const parts =
        options.inline === 'none'
          ? { oldParts: [{ text: oldLine, changed: false }], newParts: [{ text: newLine, changed: false }] }
          : diffInline(oldLine, newLine, options.inline, options);
      rows.push({ kind: 'change', oldNo: dels[i] + 1, newNo: ins[i] + 1, oldText: oldLine, newText: newLine, ...parts });
    }
    for (const i of dels.slice(paired)) rows.push({ kind: 'delete', oldNo: i + 1, oldText: a[i] });
    for (const j of ins.slice(paired)) rows.push({ kind: 'insert', newNo: j + 1, newText: b[j] });
    removed += dels.length;
    added += ins.length;
    dels = [];
    ins = [];
  };

  for (const edit of edits) {
    if (edit.op === 'delete') dels.push(edit.a);
    else if (edit.op === 'insert') ins.push(edit.b);
    else {
      flush();
      unchanged++;
      rows.push({ kind: 'equal', oldNo: edit.a + 1, newNo: edit.b + 1, oldText: a[edit.a], newText: b[edit.b] });
    }
  }
  flush();
  return { rows, added, removed, unchanged };
}

// ---------- Collapsing unchanged regions ----------

export type DisplayRow = DiffRow | { kind: 'skip'; count: number };

/** Hides unchanged lines further than `context` lines from any change. */
export function collapseRows(rows: DiffRow[], context = 3): DisplayRow[] {
  const keep = rows.map(() => false);
  rows.forEach((row, i) => {
    if (row.kind === 'equal') return;
    for (let j = Math.max(0, i - context); j <= Math.min(rows.length - 1, i + context); j++) keep[j] = true;
  });
  const out: DisplayRow[] = [];
  let hidden = 0;
  rows.forEach((row, i) => {
    if (keep[i]) {
      if (hidden) out.push({ kind: 'skip', count: hidden });
      hidden = 0;
      out.push(row);
    } else {
      hidden++;
    }
  });
  if (hidden) out.push({ kind: 'skip', count: hidden });
  return out;
}

// ---------- HTML rendering ----------

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

function partsHtml(parts: Segment[], mark: 'del' | 'ins'): string {
  return parts.map((p) => (p.changed && p.text ? `<mark class="td-${mark}">${escapeHtml(p.text)}</mark>` : escapeHtml(p.text))).join('');
}

const cell = (cls: string, html: string) => `<td class="${cls}">${html}</td>`;
const skipRow = (count: number, cols: number) =>
  `<tr class="td-skip"><td colspan="${cols}">略過 ${count} 行相同內容</td></tr>`;

/** Two-column table: old on the left, new on the right. */
export function renderSplit(rows: DisplayRow[]): string {
  const body = rows
    .map((row) => {
      switch (row.kind) {
        case 'skip':
          return skipRow(row.count, 4);
        case 'equal':
          return `<tr>${cell('td-no', String(row.oldNo))}${cell('td-code', escapeHtml(row.oldText))}${cell('td-no', String(row.newNo))}${cell('td-code', escapeHtml(row.newText))}</tr>`;
        case 'delete':
          return `<tr>${cell('td-no td-old', String(row.oldNo))}${cell('td-code td-old', escapeHtml(row.oldText))}${cell('td-no td-blank', '')}${cell('td-code td-blank', '')}</tr>`;
        case 'insert':
          return `<tr>${cell('td-no td-blank', '')}${cell('td-code td-blank', '')}${cell('td-no td-new', String(row.newNo))}${cell('td-code td-new', escapeHtml(row.newText))}</tr>`;
        case 'change':
          return `<tr>${cell('td-no td-old', String(row.oldNo))}${cell('td-code td-old', partsHtml(row.oldParts, 'del'))}${cell('td-no td-new', String(row.newNo))}${cell('td-code td-new', partsHtml(row.newParts, 'ins'))}</tr>`;
      }
    })
    .join('');
  return `<table class="td-table td-split"><tbody>${body}</tbody></table>`;
}

/** Single column, git-style: within a changed block all removed lines come before the added ones. */
export function renderUnified(rows: DisplayRow[]): string {
  const out: string[] = [];
  let olds: string[] = [];
  let news: string[] = [];
  const line = (cls: string, oldNo: string, newNo: string, sign: string, html: string) =>
    `<tr>${cell(`td-no ${cls}`, oldNo)}${cell(`td-no ${cls}`, newNo)}${cell(`td-sign ${cls}`, sign)}${cell(`td-code ${cls}`, html)}</tr>`;
  const flush = () => {
    out.push(...olds, ...news);
    olds = [];
    news = [];
  };

  for (const row of rows) {
    if (row.kind === 'delete' || row.kind === 'change') {
      const html = row.kind === 'change' ? partsHtml(row.oldParts, 'del') : escapeHtml(row.oldText);
      olds.push(line('td-old', String(row.oldNo), '', '-', html));
    }
    if (row.kind === 'insert' || row.kind === 'change') {
      const html = row.kind === 'change' ? partsHtml(row.newParts, 'ins') : escapeHtml(row.newText);
      news.push(line('td-new', '', String(row.newNo), '+', html));
    }
    if (row.kind === 'equal' || row.kind === 'skip') {
      flush();
      out.push(row.kind === 'skip' ? skipRow(row.count, 4) : line('', String(row.oldNo), String(row.newNo), '', escapeHtml(row.newText)));
    }
  }
  flush();
  return `<table class="td-table td-unified"><tbody>${out.join('')}</tbody></table>`;
}

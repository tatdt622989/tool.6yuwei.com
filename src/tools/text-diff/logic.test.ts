import { describe, expect, it } from 'vitest';
import {
  collapseRows,
  diffInline,
  diffSequences,
  diffText,
  escapeHtml,
  renderSplit,
  renderUnified,
  tokenize,
  type DiffOptions,
  type Edit,
} from './logic';

const opts: DiffOptions = { ignoreWhitespace: false, ignoreCase: false, inline: 'word' };

/** Rebuilds both sequences from an edit script to prove it is valid. */
function apply(a: string[], b: string[], edits: Edit[]) {
  const oldSide = edits.filter((e) => e.op !== 'insert').map((e) => a[e.a]);
  const newSide = edits.filter((e) => e.op !== 'delete').map((e) => b[e.b]);
  for (const e of edits) if (e.op === 'equal') expect(a[e.a]).toBe(b[e.b]);
  expect(oldSide).toEqual(a);
  expect(newSide).toEqual(b);
}

const cost = (edits: Edit[]) => edits.filter((e) => e.op !== 'equal').length;

describe('diffSequences', () => {
  it('handles empty inputs', () => {
    expect(diffSequences([], [])).toEqual([]);
    expect(diffSequences([], ['a']).map((e) => e.op)).toEqual(['insert']);
    expect(diffSequences(['a'], []).map((e) => e.op)).toEqual(['delete']);
  });

  it('finds the minimal edit script (classic ABCABBA / CBABAC)', () => {
    const a = 'ABCABBA'.split('');
    const b = 'CBABAC'.split('');
    const edits = diffSequences(a, b);
    apply(a, b, edits);
    expect(cost(edits)).toBe(5);
  });

  it('keeps identical sequences equal', () => {
    const a = ['x', 'y', 'z'];
    expect(diffSequences(a, [...a]).every((e) => e.op === 'equal')).toBe(true);
  });

  it('produces valid scripts for random inputs', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let t = 0; t < 40; t++) {
      const a = Array.from({ length: Math.floor(rnd() * 20) }, () => 'abcd'[Math.floor(rnd() * 4)]);
      const b = Array.from({ length: Math.floor(rnd() * 20) }, () => 'abcd'[Math.floor(rnd() * 4)]);
      apply(a, b, diffSequences(a, b));
    }
  });

  it('falls back to replace-all when the cost limit is exceeded', () => {
    const a = ['1', '2', '3'];
    const b = ['4', '5', '6'];
    const edits = diffSequences(a, b, 1);
    apply(a, b, edits);
    expect(edits.map((e) => e.op)).toEqual(['delete', 'delete', 'delete', 'insert', 'insert', 'insert']);
  });
});

describe('diffText', () => {
  it('counts added, removed and unchanged lines', () => {
    const r = diffText('a\nb\nc', 'a\nB\nc\nd', opts);
    expect(r).toMatchObject({ added: 2, removed: 1, unchanged: 2 });
    expect(r.rows.map((row) => row.kind)).toEqual(['equal', 'change', 'equal', 'insert']);
  });

  it('reports identical text as all unchanged', () => {
    const r = diffText('same\ntext', 'same\ntext', opts);
    expect(r).toMatchObject({ added: 0, removed: 0, unchanged: 2 });
  });

  it('handles one empty side', () => {
    expect(diffText('', 'a\nb', opts)).toMatchObject({ added: 2, removed: 0, unchanged: 0 });
    expect(diffText('a', '', opts)).toMatchObject({ added: 0, removed: 1, unchanged: 0 });
  });

  it('can ignore whitespace and case', () => {
    expect(diffText('Hello  World ', 'hello world', opts).unchanged).toBe(0);
    expect(diffText('Hello  World ', 'hello world', { ...opts, ignoreWhitespace: true, ignoreCase: true }).unchanged).toBe(1);
  });

  it('treats CRLF and LF the same', () => {
    expect(diffText('a\r\nb', 'a\nb', opts).unchanged).toBe(2);
  });

  it('pairs changed lines and leaves extras as deletes', () => {
    const r = diffText('x1\nx2\nkeep', 'y1\nkeep', opts);
    expect(r.rows.map((row) => row.kind)).toEqual(['change', 'delete', 'equal']);
  });
});

describe('inline diff', () => {
  it('tokenizes words, CJK characters and whitespace', () => {
    expect(tokenize('Hello, 世界 ok', 'word')).toEqual(['Hello', ',', ' ', '世', '界', ' ', 'ok']);
    expect(tokenize('ab', 'char')).toEqual(['a', 'b']);
  });

  it('highlights only the changed word', () => {
    const { oldParts, newParts } = diffInline('the quick fox', 'the slow fox', 'word', opts);
    expect(oldParts).toEqual([
      { text: 'the ', changed: false },
      { text: 'quick', changed: true },
      { text: ' fox', changed: false },
    ]);
    expect(newParts.find((p) => p.changed)?.text).toBe('slow');
  });

  it('highlights changed Chinese characters', () => {
    const { newParts } = diffInline('今天天氣很好', '今天天氣不好', 'word', opts);
    expect(newParts).toEqual([
      { text: '今天天氣', changed: false },
      { text: '不', changed: true },
      { text: '好', changed: false },
    ]);
  });

  it('works at character level', () => {
    const { oldParts } = diffInline('color', 'colour', 'char', opts);
    expect(oldParts.every((p) => !p.changed)).toBe(true);
  });
});

describe('collapseRows', () => {
  it('hides unchanged lines far from changes', () => {
    const old = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
    const changed = old.replace('line 10', 'LINE 10');
    const rows = collapseRows(diffText(old, changed, opts).rows, 2);
    expect(rows.map((r) => (r.kind === 'skip' ? `skip${r.count}` : r.kind))).toEqual([
      'skip8',
      'equal',
      'equal',
      'change',
      'equal',
      'equal',
      'skip7',
    ]);
  });
});

describe('rendering', () => {
  it('escapes HTML', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&#60;a href=&#34;x&#34;&#62;&#39;&#38;&#39;&#60;/a&#62;');
  });

  it('never outputs raw user markup', () => {
    const r = diffText('<b>old</b>', '<script>alert(1)</script>', opts);
    const html = renderSplit(r.rows) + renderUnified(r.rows);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
  });

  it('marks inline changes and orders unified output git-style', () => {
    const r = diffText('a1\na2', 'b1\nb2', { ...opts, inline: 'none' });
    const html = renderUnified(r.rows);
    expect(html.indexOf('a2')).toBeLessThan(html.indexOf('b1'));
    expect(renderSplit(diffText('the fox', 'the cat', opts).rows)).toContain('<mark class="td-ins">cat</mark>');
  });

  it('labels collapsed rows in zh by default and accepts a localized label', () => {
    const old = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
    const rows = collapseRows(diffText(old, old.replace('line 9', 'line nine'), opts).rows, 1);
    expect(renderSplit(rows)).toContain('<td colspan="4">略過 8 行相同內容</td>');
    const en = (n: number) => `${n} unchanged <lines>`;
    expect(renderUnified(rows, en)).toContain('8 unchanged &#60;lines&#62;');
    expect(renderSplit(rows, en)).not.toContain('略過');
  });
});

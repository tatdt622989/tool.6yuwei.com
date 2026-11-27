import { describe, expect, it } from 'vitest';
import { buildRegex, describeGroups, escapeHtml, findMatches, highlight, run } from './logic';

function re(pattern: string, flags = 'g') {
  const r = buildRegex(pattern, flags);
  if (!r.ok) throw new Error(r.error);
  return r.regex;
}

describe('buildRegex', () => {
  it('builds valid patterns and dedupes flags', () => {
    const r = buildRegex('a+', 'gig');
    expect(r.ok && r.regex.flags).toBe('gi');
  });

  it('reports syntax errors and unsupported flags', () => {
    expect(buildRegex('(abc', 'g')).toMatchObject({ ok: false, error: expect.stringContaining('語法錯誤') });
    expect(buildRegex('a', 'gx')).toMatchObject({ ok: false, error: expect.stringContaining('x') });
  });
});

describe('findMatches', () => {
  it('finds all matches with g and the first without', () => {
    expect(findMatches(re('\\d+'), 'a1 b22 c333').matches.map((m) => m.text)).toEqual(['1', '22', '333']);
    const single = findMatches(re('\\d+', ''), 'a1 b22');
    expect(single.matches).toHaveLength(1);
    expect(single.matches[0]).toMatchObject({ index: 1, end: 2 });
  });

  it('captures numbered and named groups', () => {
    const [m] = findMatches(re('(?<y>\\d{4})-(\\d{2})(x)?'), '2026-10').matches;
    expect(m.groups).toEqual(['2026', '10', undefined]);
    expect(m.named).toEqual({ y: '2026' });
    expect(describeGroups(m)).toBe('$1: 2026 · $2: 10 · $3: （未參與） · y: 2026');
  });

  it('handles zero-length matches without looping forever', () => {
    const { matches } = findMatches(re('a*'), 'baac');
    expect(matches.map((m) => [m.index, m.text])).toEqual([
      [0, ''],
      [1, 'aa'],
      [3, ''],
      [4, ''],
    ]);
  });

  it('advances by code point with the u flag', () => {
    expect(findMatches(re('', 'gu'), '😀a').matches.map((m) => m.index)).toEqual([0, 2, 3]);
  });

  it('respects the sticky flag', () => {
    expect(findMatches(re('a', 'gy'), 'aab').matches).toHaveLength(2);
    expect(findMatches(re('a', 'y'), 'ba').matches).toHaveLength(0);
  });

  it('caps the number of matches', () => {
    const r = findMatches(re('.'), 'x'.repeat(50), 10);
    expect(r.matches).toHaveLength(10);
    expect(r.truncated).toBe(true);
    expect(findMatches(re('.'), 'x'.repeat(10), 10).truncated).toBe(false);
  });

  it('applies case-insensitive, multiline and dotAll flags', () => {
    expect(findMatches(re('^abc', 'gim'), 'x\nABC').matches).toHaveLength(1);
    expect(findMatches(re('a.b', 's'), 'a\nb').matches).toHaveLength(1);
    expect(findMatches(re('a.b', ''), 'a\nb').matches).toHaveLength(0);
  });
});

describe('highlight', () => {
  it('escapes HTML and wraps matches in alternating marks', () => {
    const text = '<b>1</b> & 2';
    const html = highlight(text, findMatches(re('\\d'), text).matches);
    expect(html).toBe('&lt;b&gt;<mark class="">1</mark>&lt;/b&gt; &amp; <mark class="alt">2</mark>');
  });

  it('skips zero-length matches', () => {
    expect(highlight('ab', findMatches(re('x*'), 'ab').matches)).toBe('ab');
  });

  it('escapes quotes', () => {
    expect(escapeHtml(`"'`)).toBe('&quot;&#39;');
  });
});

describe('run', () => {
  it('returns matches and a replace preview', () => {
    const r = run({ pattern: '(?<y>\\d{4})-(\\d{2})', flags: 'g', text: '2026-10 與 2025-01', replacement: '$2/$<y>' });
    expect(r).toMatchObject({ ok: true, replaced: '10/2026 與 01/2025', truncated: false });
    expect(r.ok && r.matches).toHaveLength(2);
  });

  it('replaces only the first match without g', () => {
    const r = run({ pattern: 'a', flags: '', text: 'aaa', replacement: 'b' });
    expect(r.ok && r.replaced).toBe('baa');
  });

  it('passes through errors', () => {
    expect(run({ pattern: '[', flags: 'g', text: '', replacement: '' }).ok).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { COMMON_ENTITIES, codePointLabel, decodeEntities, encodeEntities } from './logic';

describe('encodeEntities', () => {
  const html = `<a href="x?a=1&b=2">Tom's</a>`;

  it('escapes the five special characters by name', () => {
    expect(encodeEntities(html, 'minimal', 'named')).toBe('&lt;a href=&quot;x?a=1&amp;b=2&quot;&gt;Tom&#39;s&lt;/a&gt;');
  });

  it('uses decimal or hex numeric references', () => {
    expect(encodeEntities(`<&'`, 'minimal', 'decimal')).toBe('&#60;&#38;&#39;');
    expect(encodeEntities(`<&'`, 'minimal', 'hex')).toBe('&#x3C;&#x26;&#x27;');
  });

  it('leaves non-ASCII alone in minimal mode', () => {
    expect(encodeEntities('中文 © <b>', 'minimal', 'named')).toBe('中文 © &lt;b&gt;');
  });

  it('encodes all non-ASCII, preferring names when available', () => {
    expect(encodeEntities('© 中', 'nonascii', 'named')).toBe('&copy; &#20013;');
    expect(encodeEntities('© 中', 'nonascii', 'hex')).toBe('&#xA9; &#x4E2D;');
  });

  it('encodes astral characters as one code point', () => {
    expect(encodeEntities('😀', 'nonascii', 'decimal')).toBe('&#128512;');
    expect(encodeEntities('😀', 'nonascii', 'hex')).toBe('&#x1F600;');
  });

  it('keeps ASCII text, newlines and tabs', () => {
    expect(encodeEntities('a\tb\nc', 'nonascii', 'named')).toBe('a\tb\nc');
  });
});

describe('decodeEntities', () => {
  it('decodes named, decimal and hex references', () => {
    expect(decodeEntities('&lt;p&gt;&copy; 2026 &#20013;&#x6587; &#X1F600;&amp;&apos;')).toEqual({
      text: '<p>© 2026 中文 😀&\'',
      count: 8,
    });
  });

  it('round-trips encoded text', () => {
    const text = `<div class="x">Tom's café — 50% off © 2026 😀</div>`;
    for (const style of ['named', 'decimal', 'hex'] as const) {
      expect(decodeEntities(encodeEntities(text, 'nonascii', style)).text).toBe(text);
    }
  });

  it('replaces invalid code points with U+FFFD', () => {
    expect(decodeEntities('&#0;&#xD800;&#1114112;').text).toBe('���');
  });

  it('leaves unknown names and entities without semicolons untouched', () => {
    expect(decodeEntities('&unknown; &amp &lt')).toEqual({ text: '&unknown; &amp &lt', count: 0 });
  });

  it('uses the resolver for names outside the table', () => {
    const resolve = (name: string) => (name === 'check' ? '✓' : undefined);
    expect(decodeEntities('&check; &nope;', resolve)).toEqual({ text: '✓ &nope;', count: 1 });
  });

  it('does not double-decode', () => {
    expect(decodeEntities('&amp;lt;').text).toBe('&lt;');
  });
});

describe('table', () => {
  it('has unique names and single-code-point characters', () => {
    const names = COMMON_ENTITIES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
    for (const e of COMMON_ENTITIES) expect([...e.char]).toHaveLength(1);
  });

  it('labels code points', () => {
    expect(codePointLabel('©')).toBe('U+00A9');
    expect(codePointLabel('😀')).toBe('U+1F600');
  });
});

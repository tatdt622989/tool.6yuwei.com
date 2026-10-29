import { describe, expect, it } from 'vitest';
import { SAMPLE_MARKDOWN, buildHtmlDocument, escapeHtml, extractTitle, toFilename } from './logic';

describe('extractTitle', () => {
  it('reads the first ATX h1 and strips inline markup', () => {
    expect(extractTitle('intro\n# **專案** [說明](https://x.y) #\n# second')).toBe('專案 說明');
  });

  it('supports Setext headings', () => {
    expect(extractTitle('My Title\n========\n\ntext')).toBe('My Title');
  });

  it('ignores headings inside fenced code and h2+', () => {
    expect(extractTitle('```\n# not a title\n```\n## sub\n# Real')).toBe('Real');
  });

  it('returns empty when there is no h1', () => {
    expect(extractTitle('## only h2\n#hashtag')).toBe('');
  });

  it('finds the sample title', () => {
    expect(extractTitle(SAMPLE_MARKDOWN)).toBe('Markdown 預覽範例');
  });
});

describe('toFilename', () => {
  it('removes characters that are invalid in file names', () => {
    expect(toFilename('報告: 2026/10 "草稿"?', 'md')).toBe('報告 2026 10 草稿.md');
  });

  it('falls back to document and truncates long titles', () => {
    expect(toFilename('  ', 'html')).toBe('document.html');
    expect(toFilename('a'.repeat(100), 'md')).toBe(`${'a'.repeat(60)}.md`);
  });
});

describe('buildHtmlDocument', () => {
  it('wraps the body and escapes the title', () => {
    const doc = buildHtmlDocument('<p>hi</p>', 'A <b> & C');
    expect(doc.startsWith('<!doctype html>')).toBe(true);
    expect(doc).toContain('<title>A &lt;b&gt; &amp; C</title>');
    expect(doc).toContain('<body>\n<p>hi</p>\n</body>');
    expect(doc).toContain('<meta charset="utf-8">');
  });

  it('uses a default title', () => {
    expect(buildHtmlDocument('', '')).toContain('<title>Document</title>');
  });
});

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

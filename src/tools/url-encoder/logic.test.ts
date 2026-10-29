import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl, parseUrl, safeDecode } from './logic';

describe('encodeUrl', () => {
  it('encodes a component, including reserved characters', () => {
    expect(encodeUrl('台北 a&b=c/d?', 'component')).toEqual({ ok: true, value: '%E5%8F%B0%E5%8C%97%20a%26b%3Dc%2Fd%3F' });
  });

  it('keeps URL structure with encodeURI', () => {
    expect(encodeUrl('https://example.com/搜尋?q=咖啡 豆&x=1#top', 'uri')).toEqual({
      ok: true,
      value: 'https://example.com/%E6%90%9C%E5%B0%8B?q=%E5%92%96%E5%95%A1%20%E8%B1%86&x=1#top',
    });
  });

  it('can use + for spaces', () => {
    expect(encodeUrl('a b', 'component', true)).toEqual({ ok: true, value: 'a+b' });
  });

  it('reports lone surrogates', () => {
    expect(encodeUrl('\uD800', 'component').ok).toBe(false);
  });
});

describe('decodeUrl', () => {
  it('decodes UTF-8 percent-encoding', () => {
    expect(decodeUrl('%E4%B8%AD%E6%96%87%20ok')).toEqual({ ok: true, value: '中文 ok' });
  });

  it('treats + as space only when asked', () => {
    expect(decodeUrl('a+b')).toEqual({ ok: true, value: 'a+b' });
    expect(decodeUrl('a+b', true)).toEqual({ ok: true, value: 'a b' });
  });

  it('points to a malformed escape', () => {
    const r = decodeUrl('abc%2Gdef');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('第 4 個字元');
  });

  it('reports invalid UTF-8 sequences', () => {
    const r = decodeUrl('%E4%B8');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('UTF-8');
  });

  it('safeDecode falls back to the input', () => {
    expect(safeDecode('%ZZ')).toBe('%ZZ');
  });
});

describe('parseUrl', () => {
  it('splits a full URL', () => {
    const r = parseUrl('https://user:p%40ss@例子.tw:8443/路徑/a%20b?q=%E5%92%96%E5%95%A1&q=2&empty=#sec');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const u = r.url;
    expect(u.protocol).toBe('https:');
    expect(u.username).toBe('user');
    expect(u.password).toBe('p@ss');
    expect(u.hostname).toBe('xn--fsqu00a.tw');
    expect(u.port).toBe('8443');
    expect(u.decodedPathname).toBe('/路徑/a b');
    expect(u.hash).toBe('#sec');
    expect(u.params).toEqual([
      { key: 'q', value: '咖啡' },
      { key: 'q', value: '2' },
      { key: 'empty', value: '' },
    ]);
    expect(u.assumedScheme).toBe(false);
  });

  it('assumes https when the scheme is missing', () => {
    const r = parseUrl('example.com/a?x=1');
    expect(r.ok && r.url.assumedScheme).toBe(true);
    expect(r.ok && r.url.defaultPort).toBe('443');
    const local = parseUrl('localhost:3000/api');
    expect(local.ok && local.url.port).toBe('3000');
  });

  it('accepts non-http schemes', () => {
    const r = parseUrl('mailto:someone@example.com?subject=Hi');
    expect(r.ok && r.url.protocol).toBe('mailto:');
  });

  it('rejects empty and unparsable input', () => {
    expect(parseUrl('  ').ok).toBe(false);
    expect(parseUrl('http://exa mple.com').ok).toBe(false);
  });
});

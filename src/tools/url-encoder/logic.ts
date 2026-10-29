export type EncodeMode = 'component' | 'uri';

export type TextResult = { ok: true; value: string } | { ok: false; error: string };

/**
 * component: encodeURIComponent — for a single query value or path segment.
 * uri: encodeURI — for a whole URL; keeps reserved characters such as : / ? # & =.
 * plusForSpace: application/x-www-form-urlencoded style (space becomes +).
 */
export function encodeUrl(text: string, mode: EncodeMode, plusForSpace = false): TextResult {
  try {
    const encoded = mode === 'component' ? encodeURIComponent(text) : encodeURI(text);
    return { ok: true, value: plusForSpace ? encoded.replace(/%20/g, '+') : encoded };
  } catch {
    return { ok: false, error: '文字中含有不成對的 UTF-16 代理字元，無法編碼。' };
  }
}

export function decodeUrl(text: string, plusAsSpace = false): TextResult {
  const source = plusAsSpace ? text.replace(/\+/g, ' ') : text;
  try {
    return { ok: true, value: decodeURIComponent(source) };
  } catch {
    const bad = /%(?![0-9a-fA-F]{2})/.exec(source);
    if (bad) {
      const snippet = source.slice(bad.index, bad.index + 3);
      return { ok: false, error: `第 ${bad.index + 1} 個字元「${snippet}」不是有效的百分比編碼，% 後面必須接兩位十六進位數字。` };
    }
    return { ok: false, error: '百分比編碼的位元組不是有效的 UTF-8 序列，可能被截斷或原本使用 Big5 等其他編碼。' };
  }
}

/** Decode without throwing; returns the input unchanged when it cannot be decoded. */
export function safeDecode(text: string, plusAsSpace = false): string {
  const r = decodeUrl(text, plusAsSpace);
  return r.ok ? r.value : text;
}

export interface UrlParts {
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  /** Port implied by the scheme when none is written. */
  defaultPort: string;
  pathname: string;
  decodedPathname: string;
  search: string;
  hash: string;
  origin: string;
  params: { key: string; value: string }[];
  /** True when "https://" was prepended because the input had no scheme. */
  assumedScheme: boolean;
}

const DEFAULT_PORTS: Record<string, string> = { 'http:': '80', 'https:': '443', 'ws:': '80', 'wss:': '443', 'ftp:': '21' };

export type ParseResult = { ok: true; url: UrlParts } | { ok: false; error: string };

export function parseUrl(input: string): ParseResult {
  const text = input.trim();
  if (text === '') return { ok: false, error: '請輸入網址' };
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(text) && !/^[^:/]+:\d+(?:[/?#]|$)/.test(text);
  let url: URL;
  try {
    url = new URL(hasScheme ? text : `https://${text}`);
  } catch {
    return { ok: false, error: '無法解析這個網址，請確認格式，例如 https://example.com/path?q=1' };
  }
  return {
    ok: true,
    url: {
      href: url.href,
      protocol: url.protocol,
      username: safeDecode(url.username),
      password: safeDecode(url.password),
      hostname: url.hostname,
      port: url.port,
      defaultPort: DEFAULT_PORTS[url.protocol] ?? '',
      pathname: url.pathname,
      decodedPathname: safeDecode(url.pathname),
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      params: Array.from(url.searchParams, ([key, value]) => ({ key, value })),
      assumedScheme: !hasScheme,
    },
  };
}

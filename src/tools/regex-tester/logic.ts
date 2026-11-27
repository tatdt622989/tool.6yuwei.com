export const SUPPORTED_FLAGS = 'gimsuy';
export const MAX_MATCHES = 1000;

export interface MatchInfo {
  index: number;
  end: number;
  text: string;
  /** Numbered capture groups ($1, $2…); undefined when a group did not participate. */
  groups: (string | undefined)[];
  named: Record<string, string | undefined> | null;
}

/** Error and label text produced by the pure logic (zh defaults; the UI passes its locale's copy). */
export interface RegexMessages {
  /** {flag} */
  badFlag: string;
  /** {message} */
  syntax: string;
  /** {message} */
  failed: string;
  /** Shown for a capture group that did not participate in the match. */
  unset: string;
}

export const ZH_MESSAGES: RegexMessages = {
  badFlag: '不支援的旗標「{flag}」，可用的旗標為 g i m s u y。',
  syntax: '語法錯誤：{message}',
  failed: '執行失敗：{message}',
  unset: '（未參與）',
};

/** Fill {placeholders} in a RegexMessages template. */
export function formatMessage(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

export type BuildResult = { ok: true; regex: RegExp } | { ok: false; error: string };

export function buildRegex(pattern: string, flags: string, messages: RegexMessages = ZH_MESSAGES): BuildResult {
  const bad = [...flags].find((f) => !SUPPORTED_FLAGS.includes(f));
  if (bad) return { ok: false, error: formatMessage(messages.badFlag, { flag: bad }) };
  const unique = [...new Set(flags)].join('');
  try {
    return { ok: true, regex: new RegExp(pattern, unique) };
  } catch (err) {
    return { ok: false, error: formatMessage(messages.syntax, { message: (err as Error).message }) };
  }
}

function advance(text: string, index: number, unicode: boolean): number {
  if (unicode && index < text.length) {
    const code = text.codePointAt(index) ?? 0;
    if (code > 0xffff) return index + 2;
  }
  return index + 1;
}

function toInfo(m: RegExpExecArray): MatchInfo {
  return {
    index: m.index,
    end: m.index + m[0].length,
    text: m[0],
    groups: m.slice(1),
    named: m.groups ? { ...m.groups } : null,
  };
}

/**
 * Collects matches. Without the g flag only the first match is returned (as exec / match do).
 * Zero-length matches advance by one character (one code point with the u flag) to avoid
 * an infinite loop, and the total is capped at `limit`.
 */
export function findMatches(regex: RegExp, text: string, limit = MAX_MATCHES): { matches: MatchInfo[]; truncated: boolean } {
  const re = new RegExp(regex.source, regex.flags);
  if (!re.global) {
    const m = re.exec(text);
    return { matches: m ? [toInfo(m)] : [], truncated: false };
  }
  const matches: MatchInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (matches.length >= limit) return { matches, truncated: true };
    matches.push(toInfo(m));
    if (m[0] === '') re.lastIndex = advance(text, re.lastIndex, re.unicode);
  }
  return { matches, truncated: false };
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

/** Escaped HTML of the text with non-empty matches wrapped in alternating <mark> elements. */
export function highlight(text: string, matches: MatchInfo[]): string {
  let html = '';
  let pos = 0;
  let n = 0;
  for (const m of matches) {
    if (m.end === m.index || m.index < pos) continue;
    html += escapeHtml(text.slice(pos, m.index));
    html += `<mark class="${n++ % 2 ? 'alt' : ''}">${escapeHtml(m.text)}</mark>`;
    pos = m.end;
  }
  return html + escapeHtml(text.slice(pos));
}

export interface RunRequest {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
  limit?: number;
  /** Localized error text; zh when omitted. Travels with the request into the worker. */
  messages?: RegexMessages;
}

export type RunResponse =
  | { ok: true; matches: MatchInfo[]; truncated: boolean; replaced: string }
  | { ok: false; error: string };

/** Everything the UI needs in one call; runs inside a Web Worker so a runaway pattern can be killed. */
export function run(req: RunRequest): RunResponse {
  const built = buildRegex(req.pattern, req.flags, req.messages);
  if (!built.ok) return built;
  const { matches, truncated } = findMatches(built.regex, req.text, req.limit ?? MAX_MATCHES);
  const replaced = req.text.replace(new RegExp(built.regex.source, built.regex.flags), req.replacement);
  return { ok: true, matches, truncated, replaced };
}

/** "$1: abc · year: 2026" summary of a match's capture groups. */
export function describeGroups(m: MatchInfo, unset = ZH_MESSAGES.unset): string {
  const show = (v: string | undefined) => (v === undefined ? unset : v);
  const parts = m.groups.map((g, i) => `$${i + 1}: ${show(g)}`);
  for (const [name, v] of Object.entries(m.named ?? {})) parts.push(`${name}: ${show(v)}`);
  return parts.join(' · ');
}

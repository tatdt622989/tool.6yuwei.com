export type Indent = '2' | '4' | 'tab';

/** Machine-readable reason for a JSON syntax error; the UI maps it to localized text. */
export type JsonErrorCode =
  | 'empty'
  | 'eof'
  | 'comment'
  | 'single-quote'
  | 'unexpected'
  | 'bad-escape'
  | 'control-char'
  | 'unterminated-string'
  | 'bad-number'
  | 'number-format'
  | 'trailing-comma-object'
  | 'trailing-comma-array'
  | 'extra'
  /** Our scanner could not locate it; `message` is the browser's JSON.parse message. */
  | 'native';

/** What the parser expected at the error position (used by 'eof' and 'unexpected'). */
export type JsonExpected = 'value' | 'key' | 'colon' | 'comma-or-brace' | 'comma-or-bracket';

export interface JsonErrorMessages {
  /** Templates; 'eof' takes {expected}, 'unexpected' takes {expected} and {found}. */
  codes: Record<Exclude<JsonErrorCode, 'native'>, string>;
  expected: Record<JsonExpected, string>;
}

/** zh-TW messages (also the default `message` of every JsonError). */
export const ZH_ERROR_MESSAGES: JsonErrorMessages = {
  codes: {
    empty: '請輸入 JSON 內容',
    eof: '內容提前結束，預期為{expected}',
    comment: 'JSON 不支援註解',
    'single-quote': 'JSON 字串必須使用雙引號 "，不能使用單引號',
    unexpected: '預期為{expected}，但遇到「{found}」',
    'bad-escape': '無效的跳脫字元，反斜線後只能接 " \\ / b f n r t 或 uXXXX',
    'control-char': '字串中不能直接換行或包含控制字元，請改用 \\n 等跳脫字元',
    'unterminated-string': '字串缺少結尾的雙引號',
    'bad-number': '數字格式錯誤',
    'number-format': '數字格式錯誤（不可有前導零、多個小數點或十六進位）',
    'trailing-comma-object': '物件最後一個成員後面不能有逗號',
    'trailing-comma-array': '陣列最後一個元素後面不能有逗號',
    extra: 'JSON 結尾之後還有多餘的內容',
  },
  expected: {
    value: '值（物件、陣列、字串、數字、true、false 或 null）',
    key: '以雙引號包住的屬性名稱',
    colon: '冒號 :',
    'comma-or-brace': '逗號 , 或結尾的 }',
    'comma-or-bracket': '逗號 , 或結尾的 ]',
  },
};

interface ErrorDetail {
  code: JsonErrorCode;
  expected?: JsonExpected;
  found?: string;
}

/** Message for an error in the given language table. Placeholders are filled literally. */
export function describeJsonError(error: ErrorDetail & { message?: string }, messages: JsonErrorMessages): string {
  if (error.code === 'native') return error.message ?? '';
  const expected = error.expected ? messages.expected[error.expected] : '';
  return messages.codes[error.code].replace('{expected}', () => expected).replace('{found}', () => error.found ?? '');
}

export interface JsonError extends ErrorDetail {
  /** zh-TW message (see describeJsonError for other languages). */
  message: string;
  /** 0-based character offset into the input. */
  offset: number;
  /** 1-based line and column. */
  line: number;
  column: number;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError };

export interface FormatOptions {
  indent: Indent;
  sortKeys: boolean;
}

export function indentString(indent: Indent): string {
  return indent === 'tab' ? '\t' : ' '.repeat(Number(indent));
}

export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: offset - lineStart + 1 };
}

class JsonSyntaxError extends Error {
  constructor(
    readonly detail: ErrorDetail,
    readonly offset: number,
  ) {
    super(detail.code);
  }
}

/**
 * Strict RFC 8259 scanner used only to locate errors with a readable message.
 * JSON.parse messages differ per browser (Safari gives no position), so we find it ourselves.
 */
function locateError(text: string): (ErrorDetail & { offset: number }) | null {
  const n = text.length;
  let i = 0;

  const fail = (detail: JsonErrorCode | ErrorDetail, at = i): never => {
    throw new JsonSyntaxError(typeof detail === 'string' ? { code: detail } : detail, at);
  };
  const skipWs = () => {
    while (i < n && (text[i] === ' ' || text[i] === '\t' || text[i] === '\n' || text[i] === '\r')) i++;
  };
  const unexpected = (expected: JsonExpected): never => {
    if (i >= n) return fail({ code: 'eof', expected });
    if (text.startsWith('//', i) || text.startsWith('/*', i)) return fail('comment');
    if (text[i] === "'") return fail('single-quote');
    return fail({ code: 'unexpected', expected, found: text[i] });
  };

  const parseString = () => {
    const start = i;
    i++;
    while (i < n) {
      const ch = text[i];
      if (ch === '"') {
        i++;
        return;
      }
      if (ch === '\\') {
        const next = text[i + 1];
        if (next !== undefined && '"\\/bfnrt'.includes(next)) i += 2;
        else if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) i += 6;
        else fail('bad-escape');
      } else if (ch.charCodeAt(0) < 0x20) {
        fail('control-char');
      } else {
        i++;
      }
    }
    fail('unterminated-string', start);
  };

  const numberPattern = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
  const parseNumber = () => {
    const start = i;
    numberPattern.lastIndex = i;
    const match = numberPattern.exec(text);
    if (!match || match[0] === '-') fail('bad-number');
    i = numberPattern.lastIndex;
    if (i < n && /[\d.eExX+-]/.test(text[i])) fail('number-format', start);
  };

  const parseLiteral = (): boolean => {
    for (const word of ['true', 'false', 'null']) {
      if (text.startsWith(word, i)) {
        i += word.length;
        return true;
      }
    }
    return false;
  };

  const parseValue = (): void => {
    skipWs();
    const ch = text[i];
    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === '"') return parseString();
    if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber();
    if (parseLiteral()) return;
    unexpected('value');
  };

  const parseObject = () => {
    i++;
    skipWs();
    if (text[i] === '}') {
      i++;
      return;
    }
    for (;;) {
      skipWs();
      if (text[i] !== '"') {
        if (text[i] === '}') fail('trailing-comma-object');
        unexpected('key');
      }
      parseString();
      skipWs();
      if (text[i] !== ':') unexpected('colon');
      i++;
      parseValue();
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === '}') {
        i++;
        return;
      }
      unexpected('comma-or-brace');
    }
  };

  const parseArray = () => {
    i++;
    skipWs();
    if (text[i] === ']') {
      i++;
      return;
    }
    for (;;) {
      skipWs();
      if (text[i] === ']') fail('trailing-comma-array');
      parseValue();
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === ']') {
        i++;
        return;
      }
      unexpected('comma-or-bracket');
    }
  };

  try {
    parseValue();
    skipWs();
    if (i < n) fail('extra');
    return null;
  } catch (err) {
    if (err instanceof JsonSyntaxError) return { ...err.detail, offset: err.offset };
    return null; // e.g. stack overflow on absurd nesting; caller falls back to the native message
  }
}

export function parseJson(input: string): ParseResult {
  const text = input.replace(/^﻿/, '');
  if (text.trim() === '') {
    return {
      ok: false,
      error: { code: 'empty', message: ZH_ERROR_MESSAGES.codes.empty, offset: 0, line: 1, column: 1 },
    };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const located = locateError(text);
    const error: JsonError = located
      ? { ...located, message: describeJsonError(located, ZH_ERROR_MESSAGES), ...offsetToLineColumn(text, located.offset) }
      : { code: 'native', message: (err as Error).message, offset: 0, line: 1, column: 1 };
    return { ok: false, error };
  }
}

/** Recursively sorts object keys (arrays keep their order). */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    return out;
  }
  return value;
}

export function formatValue(value: unknown, options: FormatOptions): string {
  const v = options.sortKeys ? sortKeysDeep(value) : value;
  return JSON.stringify(v, null, indentString(options.indent));
}

export function minifyValue(value: unknown, sortKeys = false): string {
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value);
}

export type JsonKind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

/** Language-neutral type of a parsed JSON value (summarize().type is the zh label). */
export function jsonKind(value: unknown): JsonKind {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  const t = typeof value;
  return t === 'object' || t === 'string' || t === 'number' || t === 'boolean' ? t : 'null';
}

export interface JsonSummary {
  type: string;
  /** Members of the top-level object or array; 0 for scalars. */
  size: number;
  /** Maximum nesting depth; 0 for scalars. */
  depth: number;
}

export function summarize(value: unknown): JsonSummary {
  const depthOf = (v: unknown): number => {
    if (v === null || typeof v !== 'object') return 0;
    const children = Array.isArray(v) ? v : Object.values(v);
    let max = 0;
    for (const child of children) max = Math.max(max, depthOf(child));
    return max + 1;
  };
  if (Array.isArray(value)) return { type: '陣列', size: value.length, depth: depthOf(value) };
  if (value === null) return { type: 'null', size: 0, depth: 0 };
  if (typeof value === 'object') return { type: '物件', size: Object.keys(value).length, depth: depthOf(value) };
  const scalar: Record<string, string> = { string: '字串', number: '數字', boolean: '布林值' };
  return { type: scalar[typeof value] ?? typeof value, size: 0, depth: 0 };
}

/** One line of context around an error, with a caret under the column. */
export function errorExcerpt(text: string, line: number, column: number, width = 60): string {
  const raw = (text.replace(/^﻿/, '').split('\n')[line - 1] ?? '').replace(/\r$/, '').replace(/\t/g, ' ');
  const start = Math.max(0, column - 1 - Math.floor(width / 2));
  const slice = raw.slice(start, start + width);
  const prefix = start > 0 ? '…' : '';
  const caret = ' '.repeat(prefix.length + column - 1 - start) + '^';
  return `${prefix}${slice}${start + width < raw.length ? '…' : ''}\n${caret}`;
}

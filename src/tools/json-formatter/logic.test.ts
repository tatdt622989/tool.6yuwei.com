import { describe, expect, it } from 'vitest';
import {
  errorExcerpt,
  formatValue,
  minifyValue,
  offsetToLineColumn,
  parseJson,
  sortKeysDeep,
  summarize,
} from './logic';

function errorOf(text: string) {
  const r = parseJson(text);
  if (r.ok) throw new Error('expected invalid JSON');
  return r.error;
}

describe('parseJson', () => {
  it('parses valid JSON including scalars and a BOM', () => {
    expect(parseJson('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseJson('"text"')).toEqual({ ok: true, value: 'text' });
    expect(parseJson('﻿[1,2]')).toEqual({ ok: true, value: [1, 2] });
  });

  it('rejects empty input', () => {
    expect(errorOf('   ').message).toContain('請輸入');
  });

  it('reports trailing commas with line and column', () => {
    const e = errorOf('{\n  "a": 1,\n}');
    expect(e.message).toContain('逗號');
    expect(e.line).toBe(3);
    expect(e.column).toBe(1);
  });

  it('reports trailing comma in arrays', () => {
    expect(errorOf('[1, 2, ]').message).toContain('陣列');
  });

  it('explains single quotes and comments', () => {
    expect(errorOf("{'a': 1}").message).toContain('雙引號');
    expect(errorOf('{"a": 1 // note\n}').message).toContain('註解');
  });

  it('flags a missing comma between members', () => {
    const e = errorOf('{"a": 1 "b": 2}');
    expect(e.offset).toBe(8);
    expect(e.message).toContain('逗號');
  });

  it('flags unterminated strings and raw newlines in strings', () => {
    expect(errorOf('{"a": "abc').message).toContain('結尾的雙引號');
    expect(errorOf('{"a": "line1\nline2"}').message).toContain('控制字元');
  });

  it('flags bad numbers and literals', () => {
    expect(errorOf('[01]').message).toContain('數字');
    expect(errorOf('[NaN]').message).toContain('遇到「N」');
    expect(errorOf('{"a": undefined}').offset).toBe(6);
  });

  it('flags unexpected end and extra content', () => {
    expect(errorOf('{"a": [1, 2').message).toContain('提前結束');
    expect(errorOf('{} {}').message).toContain('多餘');
  });

  it('flags invalid escapes', () => {
    expect(errorOf('["\\x41"]').message).toContain('跳脫');
  });
});

describe('formatting', () => {
  const value = { b: 1, a: { d: [3, { z: 1, y: 2 }], c: null } };

  it('indents with 2, 4 spaces or tabs', () => {
    expect(formatValue([1], { indent: '2', sortKeys: false })).toBe('[\n  1\n]');
    expect(formatValue([1], { indent: '4', sortKeys: false })).toBe('[\n    1\n]');
    expect(formatValue([1], { indent: 'tab', sortKeys: false })).toBe('[\n\t1\n]');
  });

  it('sorts keys recursively but keeps array order', () => {
    expect(minifyValue(value, true)).toBe('{"a":{"c":null,"d":[3,{"y":2,"z":1}]},"b":1}');
    expect(sortKeysDeep([3, 1, 2])).toEqual([3, 1, 2]);
  });

  it('minifies', () => {
    expect(minifyValue({ a: [1, 2] })).toBe('{"a":[1,2]}');
  });
});

describe('summarize', () => {
  it('describes objects, arrays and scalars', () => {
    expect(summarize({ a: { b: [1] } })).toEqual({ type: '物件', size: 1, depth: 3 });
    expect(summarize([])).toEqual({ type: '陣列', size: 0, depth: 1 });
    expect(summarize(5).type).toBe('數字');
    expect(summarize(null).type).toBe('null');
  });
});

describe('helpers', () => {
  it('converts offsets to line and column', () => {
    expect(offsetToLineColumn('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
    expect(offsetToLineColumn('abc', 0)).toEqual({ line: 1, column: 1 });
  });

  it('builds an excerpt with a caret', () => {
    expect(errorExcerpt('{\n  "a": x\n}', 2, 8)).toBe('  "a": x\n       ^');
  });
});

import { describe, expect, it } from 'vitest';
import { compareText, formatDate, formatList, plural, t } from './format';
import { formatFixed, formatInteger, formatNumber } from '../lib/format';

describe('t', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(t('約 {n} 分鐘', { n: 4 })).toBe('約 4 分鐘');
    expect(t('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });
});

describe('plural', () => {
  it('picks English singular / plural forms', () => {
    const forms = { one: '{n} word', other: '{n} words' };
    expect(plural('en', 1, forms)).toBe('1 word');
    expect(plural('en', 1200, forms)).toBe('1,200 words');
  });

  it('always uses `other` for zh-TW and ja', () => {
    expect(plural('ja', 1, { one: 'X', other: '{n} 件' })).toBe('1 件');
    expect(plural('zh-TW', 1, { other: '{n} 個' })).toBe('1 個');
  });
});

describe('locale-aware formatting', () => {
  it('formats numbers with the locale', () => {
    expect(formatNumber(1234.567)).toBe('1,234.57');
    expect(formatNumber(1234.567, 1, 'en')).toBe('1,234.6');
    expect(formatInteger(9876.5, 'ja')).toBe('9,877');
    expect(formatFixed(22, 1, 'en')).toBe('22.0');
    expect(formatNumber(Number.NaN, 2, 'en')).toBe('—');
  });

  it('formats dates per locale', () => {
    expect(formatDate('2026-10-29', 'zh-TW')).toBe('2026年10月29日');
    expect(formatDate('2026-10-29', 'en')).toBe('October 29, 2026');
    expect(formatDate('2026-10-29', 'ja')).toBe('2026年10月29日');
  });

  it('joins lists per locale', () => {
    expect(formatList(['A', 'B', 'C'], 'en')).toBe('A, B, and C');
  });

  it('sorts with the locale collation', () => {
    expect(['b', 'a', 'C'].sort(compareText('en'))).toEqual(['a', 'b', 'C']);
  });
});

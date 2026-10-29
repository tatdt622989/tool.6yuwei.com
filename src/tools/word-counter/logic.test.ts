import { describe, expect, it } from 'vitest';
import { analyzeText, formatReadingTime } from './logic';

describe('analyzeText', () => {
  it('returns zeros for empty input', () => {
    const s = analyzeText('');
    expect(s.characters).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.paragraphs).toBe(0);
  });

  it('counts mixed Chinese and English', () => {
    const s = analyzeText('我愛 JavaScript 和 TypeScript。');
    expect(s.cjk).toBe(3);
    expect(s.words).toBe(2);
    expect(s.mixedCount).toBe(5);
    expect(s.punctuation).toBe(1);
  });

  it('treats emoji with modifiers as one character', () => {
    expect(analyzeText('👍🏽').characters).toBe(1);
  });

  it('counts lines and paragraphs', () => {
    const s = analyzeText('第一段\n還是第一段\n\n第二段');
    expect(s.lines).toBe(4);
    expect(s.paragraphs).toBe(2);
  });

  it('excludes whitespace when asked', () => {
    expect(analyzeText('a b\tc\n').charactersNoSpaces).toBe(3);
  });
});

describe('formatReadingTime', () => {
  it('formats short and long durations', () => {
    expect(formatReadingTime(0)).toBe('0 分鐘');
    expect(formatReadingTime(0.4)).toBe('不到 1 分鐘');
    expect(formatReadingTime(3.6)).toBe('約 4 分鐘');
  });
});

import { describe, expect, it } from 'vitest';
import { analyzeText, formatReadingTime, genkoLayout, readingMinutesFor } from './logic';

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

describe('Japanese and English stats', () => {
  it('counts hiragana, katakana and kanji separately', () => {
    const s = analyzeText('今日はコーヒーを飲みました。');
    expect(s.cjk).toBe(3); // 今 日 飲
    expect(s.hiragana).toBe(6); // は を み ま し た
    expect(s.katakana).toBe(4); // コ ー ヒ ー
  });

  it('counts sentences without splitting decimals or domains', () => {
    expect(analyzeText('Hello world. Pi is 3.14! Visit example.com today?').sentences).toBe(3);
    expect(analyzeText('今日は晴れ。明日は雨！').sentences).toBe(2);
    expect(analyzeText('No terminal punctuation').sentences).toBe(1);
    expect(analyzeText('').sentences).toBe(0);
  });

  it('uses locale reading speeds', () => {
    const en = analyzeText(Array.from({ length: 476 }, () => 'word').join(' '));
    expect(readingMinutesFor(en, 'en')).toBeCloseTo(2, 5);
    const ja = analyzeText('あ'.repeat(1000));
    expect(readingMinutesFor(ja, 'ja')).toBeCloseTo(2, 5);
    expect(readingMinutesFor(ja, 'zh-TW')).toBe(ja.readingMinutes);
  });
});

describe('genkoLayout (400字詰め原稿用紙)', () => {
  it('fills 20 columns per row and starts a new row at each line break', () => {
    expect(genkoLayout('')).toEqual({ rows: 0, sheets: 0 });
    expect(genkoLayout('あ'.repeat(20))).toEqual({ rows: 1, sheets: 1 });
    expect(genkoLayout('あ'.repeat(21))).toEqual({ rows: 2, sheets: 1 });
    expect(genkoLayout('あ\n\nい')).toEqual({ rows: 3, sheets: 1 });
  });

  it('rolls over to a second sheet after 20 rows', () => {
    expect(genkoLayout('あ'.repeat(400))).toEqual({ rows: 20, sheets: 1 });
    expect(genkoLayout('あ'.repeat(401))).toEqual({ rows: 21, sheets: 2 });
  });
});

describe('formatReadingTime with localized labels', () => {
  it('uses the given labels', () => {
    const en = { zero: '0 min', underOne: '< 1 min', about: '~{n} min' };
    expect(formatReadingTime(0, en)).toBe('0 min');
    expect(formatReadingTime(0.5, en)).toBe('< 1 min');
    expect(formatReadingTime(2.6, en)).toBe('~3 min');
  });
});

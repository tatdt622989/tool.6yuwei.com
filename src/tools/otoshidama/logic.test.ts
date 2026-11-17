import { describe, expect, it } from 'vitest';
import {
  AGE_GROUPS,
  breakdownAmount,
  breakdownText,
  compareWithBudget,
  DENOMINATIONS,
  comparisonText,
  groupById,
  listText,
  MAX_AMOUNT,
  MAX_COUNT,
  notesText,
  rowNote,
  sanitizeAmount,
  sanitizeCount,
  summarize,
  SURVEY,
  yen,
  type Breakdown,
  type Entry,
} from './logic';

const value = (b: Breakdown) => DENOMINATIONS.reduce((sum, d) => sum + d * b.notes[d], 0) + b.remainder;

describe('survey data', () => {
  it('keeps the six age groups in order with the top of each bracket as the default', () => {
    expect(AGE_GROUPS.map((g) => g.label)).toEqual([
      '小学生未満',
      '小学校低学年',
      '小学校高学年',
      '中学生',
      '高校生',
      '大学生・専門学校生',
    ]);
    expect(AGE_GROUPS.map((g) => g.defaultAmount)).toEqual([1000, 3000, 5000, 5000, 10000, 10000]);
    for (const g of AGE_GROUPS) expect(g.defaultAmount).toBe(g.bracket[1]);
  });

  it('uses the brackets of the 2026 survey', () => {
    expect(AGE_GROUPS.map((g) => g.bracket)).toEqual([
      [1, 1000],
      [2001, 3000],
      [4001, 5000],
      [4001, 5000],
      [9001, 10000],
      [9001, 10000],
    ]);
    expect(AGE_GROUPS.map((g) => g.bracketLabel)).toEqual([
      '1～1,000円',
      '2,001～3,000円',
      '4,001～5,000円',
      '4,001～5,000円',
      '9,001～1万円',
      '9,001～1万円',
    ]);
    expect(SURVEY.budgetTotal).toBe(24039);
    expect(SURVEY.sampleSize).toBe(5000);
    expect(SURVEY.url).toBe('https://www.intage.co.jp/news/7129/');
  });

  it('finds a group by id', () => {
    expect(groupById('juniorHigh')?.label).toBe('中学生');
    expect(groupById('nobody')).toBeUndefined();
  });
});

describe('sanitizeCount / sanitizeAmount', () => {
  it('floors to a whole number and clamps to the range', () => {
    expect(sanitizeCount(2.9)).toBe(2);
    expect(sanitizeCount(500)).toBe(MAX_COUNT);
    expect(sanitizeAmount(3000.7)).toBe(3000);
    expect(sanitizeAmount(5_000_000)).toBe(MAX_AMOUNT);
  });

  it('turns negative, NaN and infinite input into 0', () => {
    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(sanitizeCount(bad)).toBe(0);
      expect(sanitizeAmount(bad)).toBe(0);
    }
  });
});

describe('breakdownAmount', () => {
  it('uses one note for 10,000円 and 5,000円', () => {
    expect(breakdownAmount(10000)).toEqual({ notes: { 10000: 1, 5000: 0, 1000: 0, 500: 0 }, remainder: 0 });
    expect(breakdownAmount(5000)).toEqual({ notes: { 10000: 0, 5000: 1, 1000: 0, 500: 0 }, remainder: 0 });
  });

  it('uses 千円札 below 5,000円', () => {
    expect(breakdownAmount(1000).notes).toEqual({ 10000: 0, 5000: 0, 1000: 1, 500: 0 });
    expect(breakdownAmount(3000).notes).toEqual({ 10000: 0, 5000: 0, 1000: 3, 500: 0 });
  });

  it('combines notes for other amounts', () => {
    expect(breakdownAmount(8000).notes).toEqual({ 10000: 0, 5000: 1, 1000: 3, 500: 0 });
    expect(breakdownAmount(20000).notes).toEqual({ 10000: 2, 5000: 0, 1000: 0, 500: 0 });
    expect(breakdownAmount(36000).notes).toEqual({ 10000: 3, 5000: 1, 1000: 1, 500: 0 });
  });

  it('adds a 500円玉 when the amount is not divisible by 1,000', () => {
    expect(breakdownAmount(500)).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 0, 500: 1 }, remainder: 0 });
    expect(breakdownAmount(1500)).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 1, 500: 1 }, remainder: 0 });
    expect(breakdownAmount(5500).notes).toEqual({ 10000: 0, 5000: 1, 1000: 0, 500: 1 });
  });

  it('reports what is left under 500円 as a remainder', () => {
    expect(breakdownAmount(300)).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 0, 500: 0 }, remainder: 300 });
    expect(breakdownAmount(1250)).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 1, 500: 0 }, remainder: 250 });
    expect(breakdownAmount(2777)).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 2, 500: 1 }, remainder: 277 });
  });

  it('returns nothing for 0 and invalid amounts', () => {
    const none = { notes: { 10000: 0, 5000: 0, 1000: 0, 500: 0 }, remainder: 0 };
    expect(breakdownAmount(0)).toEqual(none);
    expect(breakdownAmount(-3000)).toEqual(none);
    expect(breakdownAmount(Number.NaN)).toEqual(none);
  });

  it('always adds up to the amount', () => {
    for (let amount = 0; amount <= 31000; amount += 37) {
      const b = breakdownAmount(amount);
      expect(value(b)).toBe(amount);
      expect(b.remainder).toBeLessThan(500);
    }
  });
});

describe('breakdownText', () => {
  it('lists the notes of one ポチ袋', () => {
    expect(breakdownText(breakdownAmount(5000))).toBe('5千円札 1枚');
    expect(breakdownText(breakdownAmount(3000))).toBe('千円札 3枚');
    expect(breakdownText(breakdownAmount(8500))).toBe('5千円札 1枚＋千円札 3枚＋500円玉 1枚');
  });

  it('mentions smaller coins and returns an empty string for 0', () => {
    expect(breakdownText(breakdownAmount(1250))).toBe('千円札 1枚＋硬貨 250円');
    expect(breakdownText(breakdownAmount(300))).toBe('硬貨 300円');
    expect(breakdownText(breakdownAmount(0))).toBe('');
  });
});

describe('summarize', () => {
  it('returns zeros for no recipients', () => {
    const empty = { lines: [], total: 0, people: 0, envelopes: 0, notes: { 10000: 0, 5000: 0, 1000: 0, 500: 0 }, remainder: 0 };
    expect(summarize([])).toEqual(empty);
    expect(summarize(AGE_GROUPS.map((g) => ({ groupId: g.id, count: 0, amount: g.defaultAmount })))).toEqual(empty);
  });

  it('totals the default amounts and counts the notes', () => {
    const entries: Entry[] = [
      { groupId: 'elementaryLower', count: 1, amount: 3000 },
      { groupId: 'juniorHigh', count: 1, amount: 5000 },
      { groupId: 'highSchool', count: 1, amount: 10000 },
    ];
    const s = summarize(entries);
    expect(s.total).toBe(18000);
    expect(s.people).toBe(3);
    expect(s.envelopes).toBe(3);
    expect(s.notes).toEqual({ 10000: 1, 5000: 1, 1000: 3, 500: 0 });
    expect(s.remainder).toBe(0);
    expect(s.lines.map((l) => l.subtotal)).toEqual([3000, 5000, 10000]);
  });

  it('multiplies the notes of one ポチ袋 by the number of people', () => {
    const s = summarize([
      { groupId: 'preschool', count: 2, amount: 1000 },
      { groupId: 'elementaryLower', count: 3, amount: 3000 },
      { groupId: 'elementaryUpper', count: 2, amount: 5000 },
      { groupId: 'college', count: 2, amount: 10000 },
    ]);
    expect(s.total).toBe(41000);
    expect(s.envelopes).toBe(9);
    // Two 5,000円 envelopes stay two 5千円札: notes are never merged across envelopes.
    expect(s.notes).toEqual({ 10000: 2, 5000: 2, 1000: 11, 500: 0 });
  });

  it('counts 500円玉 and smaller coins per person', () => {
    const s = summarize([
      { groupId: 'preschool', count: 3, amount: 500 },
      { groupId: 'elementaryLower', count: 2, amount: 2750 },
    ]);
    expect(s.total).toBe(7000);
    expect(s.notes).toEqual({ 10000: 0, 5000: 0, 1000: 4, 500: 5 });
    expect(s.remainder).toBe(500);
    expect(s.lines[1].perEnvelope).toEqual({ notes: { 10000: 0, 5000: 0, 1000: 2, 500: 1 }, remainder: 250 });
  });

  it('keeps a trimmed name memo and drops an empty one', () => {
    const s = summarize([
      { groupId: 'juniorHigh', count: 2, amount: 5000, names: '  はると、ゆい ' },
      { groupId: 'highSchool', count: 1, amount: 10000, names: '   ' },
    ]);
    expect(s.lines[0].names).toBe('はると、ゆい');
    expect('names' in s.lines[1]).toBe(false);
  });

  it('skips rows without people or without an amount', () => {
    const s = summarize([
      { groupId: 'preschool', count: 2, amount: 0 },
      { groupId: 'juniorHigh', count: 0, amount: 5000 },
      { groupId: 'highSchool', count: 1, amount: 10000 },
    ]);
    expect(s.lines.map((l) => l.groupId)).toEqual(['highSchool']);
    expect(s.total).toBe(10000);
    expect(s.envelopes).toBe(1);
  });

  it('sanitizes counts and amounts', () => {
    const s = summarize([
      { groupId: 'juniorHigh', count: 1.8, amount: 5000.9 },
      { groupId: 'highSchool', count: -2, amount: 10000 },
      { groupId: 'college', count: Number.NaN, amount: 10000 },
    ]);
    expect(s.total).toBe(5000);
    expect(s.people).toBe(1);
  });

  it('keeps notes and total consistent', () => {
    const s = summarize(AGE_GROUPS.map((g, i) => ({ groupId: g.id, count: i + 1, amount: g.defaultAmount + i * 250 })));
    expect(DENOMINATIONS.reduce((sum, d) => sum + d * s.notes[d], 0) + s.remainder).toBe(s.total);
    expect(s.total).toBe(s.lines.reduce((sum, l) => sum + l.subtotal, 0));
  });
});

describe('compareWithBudget', () => {
  it('compares with the survey budget of 24,039円', () => {
    expect(compareWithBudget(18000)).toEqual({ budget: 24039, diff: -6039, percent: 75, relation: 'under' });
    expect(compareWithBudget(41000)).toEqual({ budget: 24039, diff: 16961, percent: 171, relation: 'over' });
    expect(compareWithBudget(24039)).toEqual({ budget: 24039, diff: 0, percent: 100, relation: 'equal' });
  });

  it('handles a total of 0 and a custom budget', () => {
    expect(compareWithBudget(0)).toEqual({ budget: 24039, diff: -24039, percent: 0, relation: 'under' });
    expect(compareWithBudget(30000, 20000)).toEqual({ budget: 20000, diff: 10000, percent: 150, relation: 'over' });
  });
});

describe('text helpers', () => {
  const example = summarize([
    { groupId: 'elementaryLower', count: 1, amount: 3000 },
    { groupId: 'juniorHigh', count: 2, amount: 5000, names: 'はると、ゆい' },
    { groupId: 'highSchool', count: 1, amount: 10000 },
  ]);

  it('formats yen with thousands separators', () => {
    expect(yen(0)).toBe('0円');
    expect(yen(24039)).toBe('24,039円');
  });

  it('describes an input row', () => {
    expect(rowNote(0, 3000)).toBe('');
    expect(rowNote(2, 0)).toBe('1人あたりの金額を入れてください');
    expect(rowNote(2, 3000)).toBe('小計 6,000円（1袋に千円札 3枚）');
    expect(rowNote(1, 1250)).toBe('小計 1,250円（1袋に千円札 1枚＋硬貨 250円）');
  });

  it('lists the notes for the whole list', () => {
    expect(notesText(example)).toBe('1万円札 1枚、5千円札 2枚、千円札 3枚');
    expect(notesText(summarize([{ groupId: 'preschool', count: 2, amount: 750 }]))).toBe('500円玉 2枚、硬貨 500円');
    expect(notesText(summarize([]))).toBe('');
  });

  it('compares the total with the survey budget in a sentence', () => {
    expect(comparisonText(0)).toBe('人数を入れると、インテージ「2026年お年玉調査」の予算総額 24,039円と比べられます。');
    expect(comparisonText(18000)).toBe(
      '合計 18,000円は、インテージ「2026年お年玉調査」の予算総額 24,039円より6,039円少なく、その約75%にあたります。',
    );
    expect(comparisonText(41000)).toBe(
      '合計 41,000円は、インテージ「2026年お年玉調査」の予算総額 24,039円より16,961円多く、その約171%にあたります。',
    );
    expect(comparisonText(24039)).toBe('合計 24,039円は、インテージ「2026年お年玉調査」の予算総額 24,039円と同じです。');
  });

  it('builds the list for the copy button', () => {
    expect(listText(example)).toBe(
      [
        'お年玉の準備リスト（2027年）',
        '小学校低学年：3,000円 × 1人 ＝ 3,000円（1袋に千円札 3枚）',
        '中学生：5,000円 × 2人 ＝ 10,000円（1袋に5千円札 1枚）／はると、ゆい',
        '高校生：10,000円 × 1人 ＝ 10,000円（1袋に1万円札 1枚）',
        '合計：23,000円（4人分）',
        '用意するお金：1万円札 1枚、5千円札 2枚、千円札 3枚',
        'ポチ袋：4枚',
      ].join('\n'),
    );
    expect(listText(summarize([]))).toBe('');
  });
});

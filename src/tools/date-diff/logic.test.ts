import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  countWeekdays,
  dateDiff,
  daysInMonth,
  diffDays,
  diffYMD,
  formatSpan,
  formatYMD,
  isLeapYear,
  parseISODate,
  spanParts,
  toISODate,
  toUTCDate,
  weekdayOf,
} from './logic';

const d = (s: string) => parseISODate(s)!;

describe('parseISODate', () => {
  it('parses valid dates and rejects impossible ones', () => {
    expect(parseISODate('2026-10-29')).toEqual({ y: 2026, m: 10, d: 29 });
    expect(parseISODate('2024-02-29')).not.toBeNull();
    expect(parseISODate('2026-02-29')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('')).toBeNull();
    expect(parseISODate('abc')).toBeNull();
  });

  it('round-trips through toISODate', () => {
    expect(toISODate(d('0999-01-05'))).toBe('0999-01-05');
  });
});

describe('leap years', () => {
  it('follows the Gregorian rules', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });
});

describe('diffDays / addDays', () => {
  it('counts days across a leap February', () => {
    expect(diffDays(d('2024-02-28'), d('2024-03-01'))).toBe(2);
    expect(diffDays(d('2026-02-28'), d('2026-03-01'))).toBe(1);
  });

  it('is unaffected by daylight saving transitions', () => {
    expect(diffDays(d('2026-03-07'), d('2026-03-09'))).toBe(2);
    expect(diffDays(d('2026-10-31'), d('2026-11-02'))).toBe(2);
  });

  it('returns negative values when reversed', () => {
    expect(diffDays(d('2026-12-31'), d('2026-01-01'))).toBe(-364);
  });

  it('adds and subtracts days across years', () => {
    expect(addDays(d('2026-10-29'), 100)).toEqual(d('2027-02-06'));
    expect(addDays(d('2026-01-01'), -1)).toEqual(d('2025-12-31'));
    expect(addDays(d('2026-10-29'), 0)).toEqual(d('2026-10-29'));
  });
});

describe('addMonths', () => {
  it('clamps to the end of shorter months', () => {
    expect(addMonths(d('2026-01-31'), 1)).toEqual(d('2026-02-28'));
    expect(addMonths(d('2024-01-31'), 1)).toEqual(d('2024-02-29'));
    expect(addMonths(d('2026-03-15'), -3)).toEqual(d('2025-12-15'));
  });
});

describe('diffYMD', () => {
  it('splits into years, months and days', () => {
    expect(diffYMD(d('2020-05-10'), d('2026-10-29'))).toEqual({ years: 6, months: 5, days: 19 });
    expect(diffYMD(d('2026-01-15'), d('2026-03-14'))).toEqual({ years: 0, months: 1, days: 27 });
    expect(diffYMD(d('2026-01-31'), d('2026-02-28'))).toEqual({ years: 0, months: 0, days: 28 });
  });

  it('handles identical and swapped dates', () => {
    expect(diffYMD(d('2026-10-29'), d('2026-10-29'))).toEqual({ years: 0, months: 0, days: 0 });
    expect(diffYMD(d('2026-10-29'), d('2025-10-29'))).toEqual({ years: 1, months: 0, days: 0 });
  });
});

describe('weekdays', () => {
  it('knows the day of the week', () => {
    expect(weekdayOf(d('2026-10-29'))).toBe(4); // Thursday
    expect(weekdayOf(d('1970-01-01'))).toBe(4);
    expect(weekdayOf(d('1969-12-28'))).toBe(0);
  });

  it('counts Monday to Friday only', () => {
    // 2026-10-26 is a Monday
    expect(countWeekdays(d('2026-10-26'), d('2026-11-02'), false)).toBe(5);
    expect(countWeekdays(d('2026-10-26'), d('2026-11-01'), true)).toBe(5);
    expect(countWeekdays(d('2026-10-26'), d('2026-11-02'), true)).toBe(6);
    expect(countWeekdays(d('2026-10-31'), d('2026-11-01'), true)).toBe(0); // Sat–Sun
    expect(countWeekdays(d('2026-10-29'), d('2026-10-29'), false)).toBe(0);
    expect(countWeekdays(d('2026-10-29'), d('2026-10-29'), true)).toBe(1);
  });

  it('matches a brute-force count over a long range', () => {
    const a = d('2025-03-17');
    const b = d('2027-08-04');
    let brute = 0;
    for (let x = a; diffDays(x, b) >= 0; x = addDays(x, 1)) if (weekdayOf(x) % 6 !== 0) brute++;
    expect(countWeekdays(a, b, true)).toBe(brute);
  });
});

describe('dateDiff', () => {
  it('summarises a range', () => {
    const r = dateDiff(d('2026-01-01'), d('2026-12-31'));
    expect(r.days).toBe(364);
    expect(r.weeks).toBe(52);
    expect(r.weekRemainder).toBe(0);
    expect(r.reversed).toBe(false);
  });

  it('adds one day when the end date is included', () => {
    const r = dateDiff(d('2026-01-01'), d('2026-12-31'), true);
    expect(r.days).toBe(365);
    expect(r.span).toEqual({ years: 1, months: 0, days: 0 });
  });

  it('flags reversed ranges but keeps positive counts', () => {
    const r = dateDiff(d('2026-12-25'), d('2026-10-29'));
    expect(r.reversed).toBe(true);
    expect(r.days).toBe(57);
  });
});

describe('formatting', () => {
  it('formats spans and dates in Chinese', () => {
    expect(formatSpan({ years: 1, months: 0, days: 3 })).toBe('1 年 3 天');
    expect(formatSpan({ years: 0, months: 0, days: 0 })).toBe('0 天');
    expect(formatYMD(d('2026-10-29'))).toBe('2026 年 10 月 29 日（四）');
  });
});

describe('locale helpers', () => {
  it('splits a span into non-zero parts', () => {
    expect(spanParts({ years: 1, months: 0, days: 3 })).toEqual([
      { unit: 'years', n: 1 },
      { unit: 'days', n: 3 },
    ]);
    expect(spanParts({ years: 0, months: 0, days: 0 })).toEqual([{ unit: 'days', n: 0 }]);
    expect(spanParts({ years: 0, months: 2, days: 0 })).toEqual([{ unit: 'months', n: 2 }]);
  });

  it('builds a UTC date that formats to the same calendar day in any locale', () => {
    const d = toUTCDate({ y: 2026, m: 10, d: 29 });
    expect(d.toISOString()).toBe('2026-10-29T00:00:00.000Z');
    expect(d.toLocaleDateString('en-US', { dateStyle: 'full', timeZone: 'UTC' })).toBe('Thursday, October 29, 2026');
    expect(d.toLocaleDateString('ja-JP', { dateStyle: 'full', timeZone: 'UTC' })).toBe('2026年10月29日木曜日');
    expect(toUTCDate({ y: 50, m: 3, d: 1 }).getUTCFullYear()).toBe(50);
  });
});

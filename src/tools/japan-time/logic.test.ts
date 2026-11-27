import { describe, expect, it } from 'vitest';
import {
  describeOffsetJa,
  formatAccuracyJa,
  formatClock,
  formatDateJa,
  formatOffsetAmountJa,
  formatUtc,
  formatWarekiJa,
  jihoReading,
  jihoTone,
  jstParts,
  nextJstOccurrence,
  nextTenSecondMark,
} from './logic';

// 2026-10-29T12:05:09.123Z = 2026-10-29 21:05:09.123 JST (Thursday)
const T = Date.UTC(2026, 9, 29, 12, 5, 9, 123);

describe('JST wall clock', () => {
  it('adds 9 hours to UTC', () => {
    expect(jstParts(T)).toEqual({ year: 2026, month: 10, day: 29, hour: 21, minute: 5, second: 9, ms: 123, weekday: 4 });
  });

  it('rolls the date over at 15:00 UTC', () => {
    const p = jstParts(Date.UTC(2026, 11, 31, 15, 0, 0));
    expect([p.year, p.month, p.day, p.hour]).toEqual([2027, 1, 1, 0]);
    expect(jstParts(Date.UTC(2026, 11, 31, 14, 59, 59, 999)).day).toBe(31);
  });

  it('formats clock, date, 和暦 and UTC', () => {
    const p = jstParts(T);
    expect(formatClock(p)).toBe('21:05:09');
    expect(formatClock(p, true)).toBe('21:05:09.123');
    expect(formatDateJa(p)).toBe('2026年10月29日（木）');
    expect(formatWarekiJa(p)).toBe('令和8年10月29日');
    expect(formatUtc(T)).toBe('12:05:09');
  });
});

describe('時報', () => {
  it('reads the time like the telephone time signal', () => {
    expect(jihoReading(15, 15, 20)).toBe('午後3時15分20秒');
    expect(jihoReading(0, 0, 0)).toBe('午前0時0分0秒');
    expect(jihoReading(12, 0, 10)).toBe('午後0時0分10秒');
    expect(jihoReading(11, 59, 50)).toBe('午前11時59分50秒');
  });

  it('finds the next 10-second mark', () => {
    expect(nextTenSecondMark(T)).toBe(Date.UTC(2026, 9, 29, 12, 5, 10));
    expect(nextTenSecondMark(Date.UTC(2026, 9, 29, 12, 5, 10))).toBe(Date.UTC(2026, 9, 29, 12, 5, 20));
  });

  it('plays ピッ at x7, x8, x9 and ポーン at x0', () => {
    expect([...Array(11)].map((_, s) => jihoTone(s))).toEqual([
      'pon', null, null, null, null, null, null, 'pi', 'pi', 'pi', 'pon',
    ]);
    expect(jihoTone(59)).toBe('pi');
    expect(jihoTone(30)).toBe('pon');
  });
});

describe('countdown', () => {
  it('targets today when the time has not passed yet', () => {
    // 21:05:09 JST → 22:00:00 JST today = 13:00 UTC
    expect(nextJstOccurrence(T, 22 * 3600)).toBe(Date.UTC(2026, 9, 29, 13, 0, 0));
  });

  it('targets tomorrow when the time has passed', () => {
    // 10:00 JST tomorrow (10/30) = 01:00 UTC 10/30
    expect(nextJstOccurrence(T, 10 * 3600)).toBe(Date.UTC(2026, 9, 30, 1, 0, 0));
  });

  it('keeps a just-passed target during the grace period', () => {
    const target = Date.UTC(2026, 9, 29, 12, 5, 0); // 21:05:00 JST
    expect(nextJstOccurrence(T, 21 * 3600 + 5 * 60, 60_000)).toBe(target);
    expect(nextJstOccurrence(T, 21 * 3600 + 5 * 60, 0)).toBe(target + 86_400_000);
  });

  it('handles JST midnight correctly when UTC is still the previous day', () => {
    // 2026-10-29 23:30 UTC = 10-30 08:30 JST; 10:00 JST same JST day = 01:00 UTC 10-30.
    expect(nextJstOccurrence(Date.UTC(2026, 9, 29, 23, 30), 10 * 3600)).toBe(Date.UTC(2026, 9, 30, 1, 0));
  });
});

describe('offset wording', () => {
  it('formats amounts', () => {
    expect(formatOffsetAmountJa(1234)).toBe('1.23秒');
    expect(formatOffsetAmountJa(-125_000)).toBe('2分5秒');
    expect(formatOffsetAmountJa(3 * 3600_000 + 4 * 60_000)).toBe('3時間4分');
    expect(formatOffsetAmountJa(63 * 86_400_000 + 2 * 3600_000)).toBe('63日2時間');
  });

  it('formats accuracy', () => {
    expect(formatAccuracyJa(12.4)).toBe('12ミリ秒');
    expect(formatAccuracyJa(0.2)).toBe('1ミリ秒');
    expect(formatAccuracyJa(1500)).toBe('1.5秒');
  });

  it('describes the device error (offset = server − device)', () => {
    expect(describeOffsetJa(3, 10).direction).toBe('exact');
    expect(describeOffsetJa(1500, 20)).toMatchObject({ direction: 'slow', short: '1.50秒遅れ' });
    expect(describeOffsetJa(-1500, 20)).toMatchObject({ direction: 'fast', short: '1.50秒進み' });
    expect(describeOffsetJa(-1500, 20).text).toBe('お使いの端末の時計は1.50秒進んでいます');
  });
});

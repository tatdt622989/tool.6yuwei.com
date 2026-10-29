import { describe, expect, it } from 'vitest';
import {
  dayEvent,
  finalSeconds,
  fixedOffsetClock,
  formatDate,
  formatParts,
  localClock,
  lunarNewYearInfo,
  shogatsuInfo,
  TAIPEI_CLOCK,
  TOKYO_CLOCK,
  yearGanzhiOf,
  newYearState,
  splitRemaining,
  taipeiDate,
  taipeiMidnight,
  yearProgress,
} from './logic';

const tpe = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) =>
  Date.UTC(y, m - 1, d, h - 8, min, s, ms);

describe('Taiwan dates', () => {
  it('midnight in Taipei is 16:00 UTC the previous day', () => {
    expect(taipeiMidnight(2027, 1, 1)).toBe(Date.UTC(2026, 11, 31, 16));
    expect(taipeiDate(Date.UTC(2026, 11, 31, 15, 59, 59))).toEqual({ y: 2026, m: 12, d: 31 });
    expect(taipeiDate(Date.UTC(2026, 11, 31, 16))).toEqual({ y: 2027, m: 1, d: 1 });
    expect(formatDate({ y: 2027, m: 1, d: 1 })).toBe('2027 年 1 月 1 日（五）');
  });
});

describe('跨年倒數', () => {
  it('counts down to 2027-01-01 00:00 Taiwan time', () => {
    const now = tpe(2026, 10, 29, 20, 0, 0);
    const s = newYearState(now);
    expect(s.phase).toBe('countdown');
    expect(s.targetYear).toBe(2027);
    expect(s.target).toBe(tpe(2027, 1, 1));
    expect(splitRemaining(s.remaining)).toEqual({ days: 63, hours: 4, minutes: 0, seconds: 0 });
  });

  it('enters the final minute at 23:59:00', () => {
    expect(newYearState(tpe(2026, 12, 31, 23, 58, 59)).phase).toBe('countdown');
    const s = newYearState(tpe(2026, 12, 31, 23, 59, 0));
    expect(s.phase).toBe('final');
    expect(finalSeconds(s.remaining)).toBe(60);
    expect(finalSeconds(tpe(2027, 1, 1) - tpe(2026, 12, 31, 23, 59, 59, 500))).toBe(1);
  });

  it('celebrates all of 1 月 1 日, then counts to the following year', () => {
    const at = newYearState(tpe(2027, 1, 1, 0, 0, 0));
    expect(at.phase).toBe('celebrate');
    expect(at.celebrating).toBe(2027);
    expect(at.targetYear).toBe(2028);
    expect(newYearState(tpe(2027, 1, 1, 23, 59, 59)).phase).toBe('celebrate');
    const next = newYearState(tpe(2027, 1, 2));
    expect(next.phase).toBe('countdown');
    expect(next.celebrating).toBeNull();
    expect(next.target).toBe(tpe(2028, 1, 1));
  });

  it('keeps working in later years and ignores the device time zone', () => {
    const s = newYearState(tpe(2031, 6, 15, 12));
    expect(s.targetYear).toBe(2032);
    expect(s.target).toBe(Date.UTC(2031, 11, 31, 16));
  });

  it('splits and formats, reaching zero exactly at the target', () => {
    expect(splitRemaining(90_061_000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitRemaining(400)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
    expect(splitRemaining(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitRemaining(-5000).seconds).toBe(0);
    expect(formatParts({ days: 63, hours: 4, minutes: 5, seconds: 6 })).toBe('63 天 04:05:06');
    expect(formatParts({ days: 0, hours: 4, minutes: 5, seconds: 6 })).toBe('04:05:06');
  });

  it('reports how much of the year has passed', () => {
    expect(yearProgress(tpe(2026, 1, 1))).toBe(0);
    expect(yearProgress(tpe(2026, 7, 2, 12))).toBeCloseTo(0.5, 2);
  });
});

describe('除夕／春節倒數', () => {
  it('2027: 除夕 2/5, 初一 2/6 (丁未羊年), 春節連假 2/4–2/10', () => {
    const info = lunarNewYearInfo(tpe(2026, 10, 29, 12))!;
    expect(info.year).toBe(2027);
    expect(info.ganzhi).toBe('丁未');
    expect(info.animal).toBe('羊');
    expect(info.chuxi.date).toEqual({ y: 2027, m: 2, d: 5 });
    expect(info.chunjie.date).toEqual({ y: 2027, m: 2, d: 6 });
    expect(info.chunjie.start).toBe(tpe(2027, 2, 6));
    expect(info.chuxi.status).toBe('upcoming');
    expect(info.chuxi.daysUntil).toBe(99);
    expect(info.holiday).toEqual({ start: { y: 2027, m: 2, d: 4 }, end: { y: 2027, m: 2, d: 10 }, days: 7 });
  });

  it('on 除夕 the eve is today and 初一 is still ahead', () => {
    const info = lunarNewYearInfo(tpe(2027, 2, 5, 21))!;
    expect(info.chuxi.status).toBe('today');
    expect(info.chunjie.status).toBe('upcoming');
    expect(info.chunjie.remaining).toBe(3 * 3_600_000);
  });

  it('stays on this year through 初一, then moves to next year', () => {
    const onDay = lunarNewYearInfo(tpe(2027, 2, 6, 10))!;
    expect(onDay.year).toBe(2027);
    expect(onDay.chunjie.status).toBe('today');
    expect(onDay.chuxi.status).toBe('past');
    const after = lunarNewYearInfo(tpe(2027, 2, 7))!;
    expect(after.year).toBe(2028);
    expect(after.chunjie.date).toEqual({ y: 2028, m: 1, d: 26 });
    expect(after.chuxi.date).toEqual({ y: 2028, m: 1, d: 25 });
    expect(after.animal).toBe('猴');
    expect(after.holiday).toBeNull(); // 2028 辦公日曆表 not in the data yet
  });

  it('in early January it still targets the coming 春節 of the same year', () => {
    const info = lunarNewYearInfo(tpe(2026, 1, 10))!;
    expect(info.year).toBe(2026);
    expect(info.chunjie.date).toEqual({ y: 2026, m: 2, d: 17 });
    expect(info.holiday?.start).toEqual({ y: 2026, m: 2, d: 14 });
    expect(info.holiday?.days).toBe(9);
  });

  it('handles a 除夕 that falls in the previous month (2030: 初一 2/3)', () => {
    const info = lunarNewYearInfo(tpe(2029, 12, 1))!;
    expect(info.year).toBe(2030);
    expect(info.chunjie.date).toEqual({ y: 2030, m: 2, d: 3 });
    expect(info.chuxi.date).toEqual({ y: 2030, m: 2, d: 2 });
  });
});

const jst = (y: number, m: number, d: number, h = 0, min = 0, s = 0) => Date.UTC(y, m - 1, d, h - 9, min, s);

describe('clocks', () => {
  it('fixed-offset clocks match the Taipei helpers', () => {
    const t = Date.UTC(2026, 11, 31, 15, 59, 59);
    expect(fixedOffsetClock(8 * 3_600_000).dateOf(t)).toEqual(taipeiDate(t));
    expect(TAIPEI_CLOCK.midnight(2027, 1, 1)).toBe(taipeiMidnight(2027, 1, 1));
  });

  it('Japan time: 2027-01-01 00:00 JST is 15:00 UTC on New Year’s Eve', () => {
    expect(TOKYO_CLOCK.midnight(2027, 1, 1)).toBe(Date.UTC(2026, 11, 31, 15));
    expect(TOKYO_CLOCK.dateOf(Date.UTC(2026, 11, 31, 15))).toEqual({ y: 2027, m: 1, d: 1 });
    expect(TOKYO_CLOCK.dateOf(Date.UTC(2026, 11, 31, 14, 59, 59))).toEqual({ y: 2026, m: 12, d: 31 });
  });

  it('the local clock follows the runtime time zone', () => {
    const local = localClock();
    expect(local.midnight(2027, 1, 1)).toBe(new Date(2027, 0, 1).getTime());
    expect(local.dateOf(new Date(2026, 11, 31, 23, 59).getTime())).toEqual({ y: 2026, m: 12, d: 31 });
  });
});

describe('newYearState in Japan time', () => {
  it('counts down to JST midnight and celebrates on 元日', () => {
    const s = newYearState(jst(2026, 12, 31, 23, 59, 0), TOKYO_CLOCK);
    expect(s).toMatchObject({ phase: 'final', targetYear: 2027, remaining: 60_000 });
    const c = newYearState(jst(2027, 1, 1, 0, 0, 1), TOKYO_CLOCK);
    expect(c).toMatchObject({ phase: 'celebrate', celebrating: 2027, targetYear: 2028 });
    // Already 2027 in Tokyo while still 2026 in Taipei.
    expect(newYearState(jst(2027, 1, 1, 0, 30), TAIPEI_CLOCK).phase).toBe('countdown');
    expect(newYearState(jst(2027, 1, 2), TOKYO_CLOCK).phase).toBe('countdown');
  });

  it('measures the year in Japan time', () => {
    expect(yearProgress(jst(2026, 1, 1), TOKYO_CLOCK)).toBe(0);
    expect(yearProgress(jst(2026, 7, 2, 12), TOKYO_CLOCK)).toBeCloseTo(0.5, 2);
  });

  it('works in the viewer zone too', () => {
    const local = localClock();
    const s = newYearState(new Date(2026, 9, 29, 12).getTime(), local);
    expect(s.targetYear).toBe(2027);
    expect(s.target).toBe(new Date(2027, 0, 1).getTime());
  });
});

describe('formatParts with a locale day word', () => {
  it('uses the given day wording', () => {
    const p = { days: 1, hours: 2, minutes: 3, seconds: 4 };
    expect(formatParts(p, (n) => `${n} day`)).toBe('1 day 02:03:04');
    expect(formatParts({ ...p, days: 0 }, (n) => `${n}日`)).toBe('02:03:04');
  });
});

describe('shogatsuInfo (大晦日・三が日)', () => {
  it('points at this year’s 大晦日 and next 元日 in autumn', () => {
    const info = shogatsuInfo(jst(2026, 10, 29, 12));
    expect(info.omisoka).toMatchObject({ date: { y: 2026, m: 12, d: 31 }, status: 'upcoming', daysUntil: 63 });
    expect(info.ganjitsu).toMatchObject({ date: { y: 2027, m: 1, d: 1 }, status: 'upcoming', daysUntil: 64 });
    expect(info.sanganichiDay).toBeNull();
  });

  it('marks 大晦日 as today on 31 December', () => {
    const info = shogatsuInfo(jst(2026, 12, 31, 20));
    expect(info.omisoka.status).toBe('today');
    expect(info.ganjitsu.daysUntil).toBe(1);
  });

  it('reports the day of 三が日 and moves on afterwards', () => {
    expect(shogatsuInfo(jst(2027, 1, 1, 0, 0, 1)).sanganichiDay).toBe(1);
    const third = shogatsuInfo(jst(2027, 1, 3, 23));
    expect(third.sanganichiDay).toBe(3);
    expect(third.ganjitsu.date).toEqual({ y: 2027, m: 1, d: 1 });
    expect(third.omisoka.date).toEqual({ y: 2027, m: 12, d: 31 });
    const fourth = shogatsuInfo(jst(2027, 1, 4));
    expect(fourth.sanganichiDay).toBeNull();
    expect(fourth.ganjitsu.date).toEqual({ y: 2028, m: 1, d: 1 });
  });

  it('uses Japan time, not the device zone', () => {
    // 2026-12-31 16:00 UTC is already 元日 in Tokyo.
    expect(shogatsuInfo(Date.UTC(2026, 11, 31, 16)).sanganichiDay).toBe(1);
  });
});

describe('dayEvent and lunarNewYearInfo with another clock', () => {
  it('computes status in the given zone', () => {
    const e = dayEvent({ y: 2027, m: 2, d: 6 }, jst(2027, 2, 6, 0, 30), TOKYO_CLOCK);
    expect(e.status).toBe('today');
    expect(dayEvent({ y: 2027, m: 2, d: 6 }, jst(2027, 2, 6, 0, 30), TAIPEI_CLOCK).status).toBe('upcoming');
  });

  it('finds Lunar New Year 2027 (Feb 6, Goat) from autumn 2026', () => {
    const info = lunarNewYearInfo(jst(2026, 10, 29), TOKYO_CLOCK)!;
    expect(info.chunjie.date).toEqual({ y: 2027, m: 2, d: 6 });
    expect(info.chuxi.date).toEqual({ y: 2027, m: 2, d: 5 });
    expect(info.animal).toBe('羊');
  });

  it('names the Japanese 干支 of a year', () => {
    expect(yearGanzhiOf(2027)).toBe('丁未');
  });
});

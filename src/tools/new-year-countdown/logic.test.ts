import { describe, expect, it } from 'vitest';
import {
  finalSeconds,
  formatDate,
  formatParts,
  lunarNewYearInfo,
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

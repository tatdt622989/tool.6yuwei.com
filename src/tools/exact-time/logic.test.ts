import { describe, expect, it } from 'vitest';
import {
  dayOfYear,
  describeOffset,
  formatAccuracy,
  formatClock,
  formatCountdown,
  formatLongDate,
  formatOffsetAmount,
  formatShortClock,
  formatUtcOffset,
  isLeapYear,
  isoWeek,
  isValidTimeZone,
  parseLocalDateTime,
  presetTarget,
  splitDuration,
  toDateTimeLocal,
  utcOffsetMinutes,
  WORLD_ZONES,
  zonedTimeToEpoch,
  zoneParts,
} from './logic';

const T = Date.UTC(2026, 9, 29, 12, 34, 56, 789); // Thu 2026-10-29 12:34:56.789 UTC

describe('zoneParts', () => {
  it('gives wall-clock parts in a time zone', () => {
    expect(zoneParts(T, 'UTC')).toEqual({ year: 2026, month: 10, day: 29, hour: 12, minute: 34, second: 56, weekday: 4 });
    expect(zoneParts(T, 'America/New_York')).toMatchObject({ day: 29, hour: 8, minute: 34 });
    expect(zoneParts(T, 'Asia/Tokyo')).toMatchObject({ day: 29, hour: 21 });
    expect(zoneParts(T, 'Pacific/Honolulu')).toMatchObject({ day: 29, hour: 2 });
  });
  it('rolls over the date', () => {
    expect(zoneParts(Date.UTC(2026, 9, 29, 23, 30), 'Asia/Tokyo')).toMatchObject({ day: 30, hour: 8, weekday: 5 });
    expect(zoneParts(Date.UTC(2026, 0, 1, 2), 'America/Los_Angeles')).toMatchObject({ year: 2025, month: 12, day: 31, hour: 18 });
  });
  it('uses hour 0 at midnight', () => {
    expect(zoneParts(Date.UTC(2026, 9, 29, 0, 0), 'UTC').hour).toBe(0);
  });
});

describe('utcOffsetMinutes', () => {
  it.each([
    ['UTC', 0],
    ['America/New_York', -240], // EDT until Nov 1, 2026
    ['America/Chicago', -300],
    ['America/Denver', -360],
    ['America/Phoenix', -420], // no DST
    ['America/Los_Angeles', -420],
    ['America/Anchorage', -480],
    ['Pacific/Honolulu', -600],
    ['Europe/London', 0], // BST ended Oct 25, 2026
    ['Europe/Paris', 60],
    ['Asia/Kolkata', 330],
    ['Asia/Tokyo', 540],
    ['Australia/Sydney', 660], // AEDT
  ])('%s on Oct 29, 2026 is %i', (zone, offset) => {
    expect(utcOffsetMinutes(T, zone)).toBe(offset);
  });

  it('follows DST changes', () => {
    expect(utcOffsetMinutes(Date.UTC(2026, 10, 2, 12), 'America/New_York')).toBe(-300);
    expect(utcOffsetMinutes(Date.UTC(2026, 6, 1, 12), 'Europe/London')).toBe(60);
  });

  it('covers every world zone', () => {
    for (const z of WORLD_ZONES) {
      expect(isValidTimeZone(z.id)).toBe(true);
      expect(Number.isInteger(utcOffsetMinutes(T, z.id))).toBe(true);
    }
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
  });
});

describe('formatUtcOffset', () => {
  it('formats offsets', () => {
    expect(formatUtcOffset(0)).toBe('UTC±0');
    expect(formatUtcOffset(-240)).toBe('UTC−4');
    expect(formatUtcOffset(330)).toBe('UTC+5:30');
    expect(formatUtcOffset(-570)).toBe('UTC−9:30');
    expect(formatUtcOffset(345)).toBe('UTC+5:45');
  });
});

describe('formatClock', () => {
  it('formats 12-hour and 24-hour clocks', () => {
    expect(formatClock(15, 4, 5, 123, true)).toBe('3:04:05 PM');
    expect(formatClock(0, 0, 0, 0, true)).toBe('12:00:00 AM');
    expect(formatClock(12, 30, 0, 0, true)).toBe('12:30:00 PM');
    expect(formatClock(15, 4, 5, 123, false)).toBe('15:04:05');
    expect(formatClock(15, 4, 5, 7, false, true)).toBe('15:04:05.007');
    expect(formatClock(9, 4, 5, 999.9, true, true)).toBe('9:04:05.999 AM');
  });
  it('formats short clocks', () => {
    expect(formatShortClock(8, 5, true)).toBe('8:05 AM');
    expect(formatShortClock(20, 5, false)).toBe('20:05');
  });
});

describe('dates', () => {
  it('formats a long date', () => {
    expect(formatLongDate(zoneParts(T, 'UTC'))).toBe('Thursday, October 29, 2026');
  });
  it('day of year', () => {
    expect(dayOfYear(2026, 1, 1)).toBe(1);
    expect(dayOfYear(2026, 10, 29)).toBe(302);
    expect(dayOfYear(2026, 12, 31)).toBe(365);
    expect(dayOfYear(2024, 12, 31)).toBe(366);
  });
  it('leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
  it('ISO week numbers', () => {
    expect(isoWeek(2026, 10, 29)).toEqual({ week: 44, year: 2026 });
    expect(isoWeek(2026, 1, 1)).toEqual({ week: 1, year: 2026 }); // Thursday
    expect(isoWeek(2027, 1, 1)).toEqual({ week: 53, year: 2026 }); // Friday belongs to 2026-W53
    expect(isoWeek(2024, 12, 30)).toEqual({ week: 1, year: 2025 });
    expect(isoWeek(2021, 1, 3)).toEqual({ week: 53, year: 2020 });
  });
});

describe('describeOffset', () => {
  it('calls small offsets exact', () => {
    expect(describeOffset(3, 2)).toMatchObject({ direction: 'exact', short: 'Exact' });
    expect(describeOffset(-40, 50).text).toBe('Your clock is accurate to within 50 ms.');
  });
  it('describes a slow device (server ahead)', () => {
    expect(describeOffset(1500, 20)).toEqual({
      direction: 'slow',
      short: '1.50 s slow',
      text: 'Your device clock is 1.50 seconds behind (slow).',
    });
  });
  it('describes a fast device', () => {
    const d = describeOffset(-320, 15);
    expect(d.direction).toBe('fast');
    expect(d.short).toBe('0.32 s fast');
    expect(d.text).toBe('Your device clock is 0.32 seconds ahead (fast).');
  });
  it('handles exactly one second', () => {
    expect(describeOffset(1000, 10).text).toBe('Your device clock is 1.00 second behind (slow).');
  });
  it('describes large offsets', () => {
    expect(describeOffset(-125_000, 20).short).toBe('2 min 5 s fast');
  });
});

describe('formatOffsetAmount / formatAccuracy', () => {
  it('formats amounts', () => {
    expect(formatOffsetAmount(320)).toBe('0.32 seconds');
    expect(formatOffsetAmount(-125_000)).toBe('2 min 5 s');
    expect(formatOffsetAmount(3 * 3_600_000 + 4 * 60_000)).toBe('3 h 4 min');
    expect(formatOffsetAmount(86_400_000 + 7_200_000)).toBe('1 day 2 h');
    expect(formatOffsetAmount(63 * 86_400_000)).toBe('63 days 0 h');
  });
  it('formats accuracy', () => {
    expect(formatAccuracy(12.4)).toBe('12 ms');
    expect(formatAccuracy(0.2)).toBe('1 ms');
    expect(formatAccuracy(1530)).toBe('1.5 s');
  });
});

describe('countdown helpers', () => {
  it('parses datetime-local values', () => {
    expect(parseLocalDateTime('2026-12-31T23:59')).toEqual({ year: 2026, month: 12, day: 31, hour: 23, minute: 59, second: 0 });
    expect(parseLocalDateTime('2026-12-31T23:59:30')).toMatchObject({ second: 30 });
    expect(parseLocalDateTime('2026-12-31T23:59:30.250')).toMatchObject({ second: 30 });
    expect(parseLocalDateTime('2026-02-29T10:00')).toBeNull();
    expect(parseLocalDateTime('2028-02-29T10:00')).not.toBeNull();
    expect(parseLocalDateTime('2026-13-01T10:00')).toBeNull();
    expect(parseLocalDateTime('2026-12-31T24:00')).toBeNull();
    expect(parseLocalDateTime('')).toBeNull();
  });
  it('round-trips datetime-local text', () => {
    expect(toDateTimeLocal(parseLocalDateTime('2027-01-01T00:00')!)).toBe('2027-01-01T00:00:00');
  });
  it('converts wall time in a zone to an instant', () => {
    const p = parseLocalDateTime('2027-01-01T00:00')!;
    expect(zonedTimeToEpoch(p, 'America/New_York')).toBe(Date.UTC(2027, 0, 1, 5));
    expect(zonedTimeToEpoch(p, 'Asia/Tokyo')).toBe(Date.UTC(2026, 11, 31, 15));
    expect(zonedTimeToEpoch(p, 'UTC')).toBe(Date.UTC(2027, 0, 1));
    // Across the DST change: Nov 1, 2026 03:00 New York is EST (UTC−5)
    expect(zonedTimeToEpoch(parseLocalDateTime('2026-11-01T03:00')!, 'America/New_York')).toBe(Date.UTC(2026, 10, 1, 8));
    // Before it: Oct 31 is EDT (UTC−4)
    expect(zonedTimeToEpoch(parseLocalDateTime('2026-10-31T12:00')!, 'America/New_York')).toBe(Date.UTC(2026, 9, 31, 16));
  });
  it('splits durations, rounding up to the tenth', () => {
    expect(splitDuration(3 * 86_400_000 + 4 * 3_600_000 + 5 * 60_000 + 6_700)).toEqual({
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      tenths: 7,
    });
    expect(splitDuration(1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, tenths: 1 });
    expect(splitDuration(-50)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, tenths: 0 });
  });
  it('formats countdowns', () => {
    expect(formatCountdown(3 * 86_400_000 + 4 * 3_600_000 + 5 * 60_000 + 6_700)).toBe('3 days 04:05:06.7');
    expect(formatCountdown(86_400_000 + 1000)).toBe('1 day 00:00:01.0');
    expect(formatCountdown(65_000, false)).toBe('00:01:05');
    expect(formatCountdown(0)).toBe('00:00:00.0');
  });
  it('builds preset targets', () => {
    expect(presetTarget('newyear', T, 'UTC')).toEqual({ year: 2027, month: 1, day: 1, hour: 0, minute: 0, second: 0 });
    expect(presetTarget('midnight', T, 'UTC')).toEqual({ year: 2026, month: 10, day: 30, hour: 0, minute: 0, second: 0 });
    expect(presetTarget('hour', T, 'UTC')).toEqual({ year: 2026, month: 10, day: 29, hour: 13, minute: 0, second: 0 });
    expect(presetTarget('midnight', Date.UTC(2026, 11, 31, 12), 'UTC')).toMatchObject({ year: 2027, month: 1, day: 1 });
    expect(presetTarget('hour', Date.UTC(2026, 11, 31, 23, 30), 'UTC')).toMatchObject({ year: 2027, month: 1, day: 1, hour: 0 });
    expect(presetTarget('midnight', T, 'Asia/Tokyo')).toMatchObject({ day: 30 });
  });
});

import { describe, expect, it } from 'vitest';
import {
  detectUnit,
  formatDateTime,
  formatOffset,
  offsetMinutes,
  parseTimestamp,
  parseWallTime,
  relativeTime,
  toIsoWithOffset,
  wallTimeToMs,
  weekday,
} from './logic';

const TAIPEI = 'Asia/Taipei';
const NY = 'America/New_York';

describe('detectUnit / parseTimestamp', () => {
  it('detects seconds, milliseconds, microseconds and nanoseconds', () => {
    expect(detectUnit(1_761_717_600)).toBe('s');
    expect(detectUnit(1_761_717_600_000)).toBe('ms');
    expect(detectUnit(1_761_717_600_000_000)).toBe('us');
    expect(detectUnit(1.7617176e18)).toBe('ns');
    expect(detectUnit(0)).toBe('s');
  });

  it('converts to milliseconds', () => {
    expect(parseTimestamp('1761717600')).toEqual({ ok: true, ms: 1_761_717_600_000, unit: 's' });
    expect(parseTimestamp('1761717600123')).toEqual({ ok: true, ms: 1_761_717_600_123, unit: 'ms' });
    expect(parseTimestamp('1,761,717,600')).toMatchObject({ ok: true, unit: 's' });
    expect(parseTimestamp('1761717600.5')).toMatchObject({ ok: true, ms: 1_761_717_600_500 });
    expect(parseTimestamp('-86400')).toMatchObject({ ok: true, ms: -86_400_000 });
  });

  it('honours an explicit unit', () => {
    expect(parseTimestamp('1000', 'ms')).toMatchObject({ ok: true, ms: 1000, unit: 'ms' });
  });

  it('rejects invalid or out-of-range input', () => {
    expect(parseTimestamp('').ok).toBe(false);
    expect(parseTimestamp('12abc').ok).toBe(false);
    expect(parseTimestamp('99999999999999999', 's').ok).toBe(false);
  });
});

describe('formatting in a time zone', () => {
  const ms = Date.UTC(2026, 9, 29, 7, 30, 0); // 2026-10-29 07:30:00 UTC

  it('formats local and UTC wall time', () => {
    expect(formatDateTime(ms, TAIPEI)).toBe('2026-10-29 15:30:00');
    expect(formatDateTime(ms, 'UTC')).toBe('2026-10-29 07:30:00');
    expect(formatDateTime(ms + 45, 'UTC')).toBe('2026-10-29 07:30:00.045');
  });

  it('computes offsets including DST', () => {
    expect(offsetMinutes(ms, TAIPEI)).toBe(480);
    expect(offsetMinutes(Date.UTC(2026, 6, 1), NY)).toBe(-240);
    expect(offsetMinutes(Date.UTC(2026, 0, 1), NY)).toBe(-300);
    expect(formatOffset(480)).toBe('+08:00');
    expect(formatOffset(-210)).toBe('-03:30');
    expect(formatOffset(0)).toBe('+00:00');
  });

  it('builds ISO 8601 with offset', () => {
    expect(toIsoWithOffset(ms, TAIPEI)).toBe('2026-10-29T15:30:00+08:00');
    expect(toIsoWithOffset(ms, 'UTC')).toBe('2026-10-29T07:30:00+00:00');
  });

  it('handles the epoch, negative timestamps and early years', () => {
    expect(formatDateTime(0, 'UTC')).toBe('1970-01-01 00:00:00');
    expect(formatDateTime(-1000, 'UTC')).toBe('1969-12-31 23:59:59');
    const d = new Date(0);
    d.setUTCFullYear(50, 0, 1);
    expect(formatDateTime(d.getTime(), 'UTC')).toBe('0050-01-01 00:00:00');
  });

  it('names the weekday', () => {
    expect(weekday(ms, TAIPEI)).toBe('星期四');
  });
});

describe('relativeTime', () => {
  const now = Date.UTC(2026, 9, 29);
  it('describes past and future', () => {
    expect(relativeTime(now - 3 * 3600_000, now)).toBe('3 小時前');
    expect(relativeTime(now + 2 * 86400_000, now)).toBe('後天');
    expect(relativeTime(now, now)).toBe('現在');
  });
});

describe('wall time to timestamp', () => {
  it('parses datetime-local values', () => {
    expect(parseWallTime('2026-10-29T15:30')).toEqual({ year: 2026, month: 10, day: 29, hour: 15, minute: 30, second: 0, millisecond: 0 });
    expect(parseWallTime('2026-10-29 15:30:05.5')?.millisecond).toBe(500);
    expect(parseWallTime('2026-13-01T00:00')).toBeNull();
    expect(parseWallTime('yesterday')).toBeNull();
  });

  it('converts in a fixed-offset zone and UTC', () => {
    expect(wallTimeToMs('2026-10-29T15:30:00', TAIPEI)).toBe(Date.UTC(2026, 9, 29, 7, 30));
    expect(wallTimeToMs('2026-10-29T15:30:00', 'UTC')).toBe(Date.UTC(2026, 9, 29, 15, 30));
  });

  it('resolves DST gaps forward and overlaps to the earlier instant', () => {
    // 2026-03-08 02:30 does not exist in New York; becomes 03:30 EDT (07:30 UTC).
    expect(wallTimeToMs('2026-03-08T02:30', NY)).toBe(Date.UTC(2026, 2, 8, 7, 30));
    // 2026-11-01 01:30 happens twice; the first is EDT (05:30 UTC).
    expect(wallTimeToMs('2026-11-01T01:30', NY)).toBe(Date.UTC(2026, 10, 1, 5, 30));
    expect(wallTimeToMs('2026-10-25T02:30', 'Europe/Berlin')).toBe(Date.UTC(2026, 9, 25, 0, 30));
  });

  it('returns null for invalid input', () => {
    expect(wallTimeToMs('', TAIPEI)).toBeNull();
  });
});

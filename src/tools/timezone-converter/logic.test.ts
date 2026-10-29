import { describe, expect, it } from 'vitest';
import {
  dayShift,
  DEFAULT_ZONES,
  formatOffset,
  hourDifference,
  instantToZoned,
  isDST,
  isValidTimeZone,
  listTimeZones,
  normalizeZones,
  offsetMs,
  parseWallTime,
  toWallTimeValue,
  zonedToInstant,
  zoneLabel,
  type WallTime,
} from './logic';

const wall = (s: string): WallTime => parseWallTime(s)!;
const iso = (t: number) => new Date(t).toISOString();

describe('zonedToInstant', () => {
  it('converts Taipei time (UTC+8, no DST)', () => {
    const r = zonedToInstant(wall('2026-10-29T14:30'), 'Asia/Taipei');
    expect(r.status).toBe('ok');
    expect(iso(r.instant)).toBe('2026-10-29T06:30:00.000Z');
    expect(iso(zonedToInstant(wall('2026-07-01T09:00'), 'Asia/Taipei').instant)).toBe('2026-07-01T01:00:00.000Z');
  });

  it('applies New York standard and daylight time', () => {
    expect(iso(zonedToInstant(wall('2026-01-15T09:00'), 'America/New_York').instant)).toBe('2026-01-15T14:00:00.000Z');
    expect(iso(zonedToInstant(wall('2026-07-15T09:00'), 'America/New_York').instant)).toBe('2026-07-15T13:00:00.000Z');
  });

  it('moves a time skipped by spring-forward ahead by one hour (New York 2026-03-08)', () => {
    const r = zonedToInstant(wall('2026-03-08T02:30'), 'America/New_York');
    expect(r.status).toBe('gap');
    expect(iso(r.instant)).toBe('2026-03-08T07:30:00.000Z');
    const local = instantToZoned(r.instant, 'America/New_York');
    expect([local.hour, local.minute, local.offset]).toEqual([3, 30, -240]);
  });

  it('takes the earlier instant for a repeated fall-back time (New York 2026-11-01)', () => {
    const r = zonedToInstant(wall('2026-11-01T01:30'), 'America/New_York');
    expect(r.status).toBe('ambiguous');
    expect(iso(r.instant)).toBe('2026-11-01T05:30:00.000Z');
  });

  it('handles London on the 2026-03-29 transition day', () => {
    expect(iso(zonedToInstant(wall('2026-03-29T00:30'), 'Europe/London').instant)).toBe('2026-03-29T00:30:00.000Z');
    expect(zonedToInstant(wall('2026-03-29T01:30'), 'Europe/London').status).toBe('gap');
    expect(iso(zonedToInstant(wall('2026-03-29T03:00'), 'Europe/London').instant)).toBe('2026-03-29T02:00:00.000Z');
  });

  it('handles half-hour and southern-hemisphere zones', () => {
    expect(iso(zonedToInstant(wall('2026-10-29T12:00'), 'Asia/Kolkata').instant)).toBe('2026-10-29T06:30:00.000Z');
    // Sydney is on daylight time (UTC+11) in October.
    expect(iso(zonedToInstant(wall('2026-10-29T12:00'), 'Australia/Sydney').instant)).toBe('2026-10-29T01:00:00.000Z');
  });
});

describe('instantToZoned', () => {
  const t = Date.UTC(2026, 9, 29, 6, 30); // 14:30 in Taipei

  it('shows the same instant in several zones', () => {
    expect(instantToZoned(t, 'Asia/Taipei')).toMatchObject({ day: 29, hour: 14, minute: 30, weekday: 4, offset: 480 });
    expect(instantToZoned(t, 'Asia/Tokyo')).toMatchObject({ hour: 15, offset: 540 });
    expect(instantToZoned(t, 'Europe/London')).toMatchObject({ hour: 6, offset: 0 });
    expect(instantToZoned(t, 'America/Los_Angeles')).toMatchObject({ day: 28, hour: 23, offset: -420 });
  });

  it('round-trips with zonedToInstant', () => {
    for (const zone of DEFAULT_ZONES) {
      const z = instantToZoned(t, zone);
      expect(zonedToInstant(z, zone).instant).toBe(t);
    }
  });

  it('reports midnight as hour 0', () => {
    expect(instantToZoned(Date.UTC(2026, 0, 1, 16, 0), 'Asia/Taipei')).toMatchObject({ year: 2026, month: 1, day: 2, hour: 0 });
  });
});

describe('offsets and DST', () => {
  it('reads offsets in milliseconds', () => {
    expect(offsetMs(Date.UTC(2026, 5, 1), 'Asia/Taipei')).toBe(8 * 3_600_000);
    expect(offsetMs(Date.UTC(2026, 5, 1), 'UTC')).toBe(0);
  });

  it('detects daylight saving time in both hemispheres', () => {
    expect(isDST(Date.UTC(2026, 6, 1), 'America/New_York')).toBe(true);
    expect(isDST(Date.UTC(2026, 0, 1), 'America/New_York')).toBe(false);
    expect(isDST(Date.UTC(2026, 0, 1), 'Australia/Sydney')).toBe(true);
    expect(isDST(Date.UTC(2026, 6, 1), 'Asia/Taipei')).toBe(false);
  });

  it('computes hour differences that change with DST', () => {
    expect(hourDifference(Date.UTC(2026, 0, 15), 'Asia/Taipei', 'America/New_York')).toBe(-13);
    expect(hourDifference(Date.UTC(2026, 6, 15), 'Asia/Taipei', 'America/New_York')).toBe(-12);
    expect(hourDifference(Date.UTC(2026, 6, 15), 'Asia/Taipei', 'Asia/Kolkata')).toBe(-2.5);
  });
});

describe('formatOffset', () => {
  it('formats whole and fractional offsets', () => {
    expect(formatOffset(480)).toBe('UTC+8');
    expect(formatOffset(330)).toBe('UTC+5:30');
    expect(formatOffset(-210)).toBe('UTC−3:30');
    expect(formatOffset(-300)).toBe('UTC−5');
    expect(formatOffset(0)).toBe('UTC±0');
  });
});

describe('dayShift', () => {
  it('compares calendar dates', () => {
    expect(dayShift(wall('2026-10-29T14:30'), wall('2026-10-28T23:30'))).toBe(-1);
    expect(dayShift(wall('2026-12-31T23:00'), wall('2027-01-01T01:00'))).toBe(1);
    expect(dayShift(wall('2026-10-29T00:00'), wall('2026-10-29T23:59'))).toBe(0);
  });
});

describe('parseWallTime', () => {
  it('parses datetime-local values and rejects invalid dates', () => {
    expect(parseWallTime('2026-10-29T14:30')).toEqual({ year: 2026, month: 10, day: 29, hour: 14, minute: 30 });
    expect(parseWallTime('2026-02-30T10:00')).toBeNull();
    expect(parseWallTime('')).toBeNull();
    expect(toWallTimeValue(wall('2026-01-02T03:04'))).toBe('2026-01-02T03:04');
  });
});

describe('zone lists', () => {
  it('validates zone names', () => {
    expect(isValidTimeZone('Asia/Taipei')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });

  it('lists zones including the defaults', () => {
    const zones = listTimeZones();
    for (const z of DEFAULT_ZONES) expect(zones).toContain(z);
    expect(zones).toContain('UTC');
    expect(new Set(zones).size).toBe(zones.length);
  });

  it('normalises stored lists', () => {
    expect(normalizeZones(null)).toEqual([...DEFAULT_ZONES]);
    expect(normalizeZones(['Asia/Tokyo', 'bad/zone', 'Asia/Tokyo', 3])).toEqual(['Asia/Tokyo']);
  });

  it('labels zones in Chinese with a readable fallback', () => {
    expect(zoneLabel('Asia/Taipei')).toBe('台北');
    expect(zoneLabel('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
  });
});

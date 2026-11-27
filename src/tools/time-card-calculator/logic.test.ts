import { describe, expect, it } from 'vitest';
import {
  computeDay,
  formatDecimalHours,
  formatHM,
  formatTime,
  formatUsd,
  grossPay,
  parseBreak,
  parseTime,
  roundPunch,
  shiftLength,
  splitOvertime,
  weekDays,
} from './logic';

const h = (hours: number) => hours * 60;

describe('parseTime', () => {
  it.each([
    ['9', 540, false],
    ['9:30', 570, false],
    ['930', 570, false],
    ['0930', 570, false],
    ['09:30', 570, false],
    ['9.30', 570, false],
    ['17:45', 1065, true],
    ['1745', 1065, true],
    ['0:15', 15, true],
    ['00:00', 0, true],
    ['12', 720, false],
    ['9am', 540, true],
    ['9 AM', 540, true],
    ['9a', 540, true],
    ['9:30pm', 1290, true],
    ['9:30 p.m.', 1290, true],
    ['5p', 1020, true],
    ['12am', 0, true],
    ['12:15 AM', 15, true],
    ['12pm', 720, true],
    ['12:30 PM', 750, true],
    ['24:00', 0, true],
    ['8:15:30', 495, false],
  ])('%s → %i minutes (explicit %s)', (input, minutes, explicit) => {
    expect(parseTime(input)).toEqual({ minutes, explicit });
  });

  it.each(['', 'abc', '25', '9:60', '13pm', '0am', '24:30', '9:5', '9:30xm', '123456'])('rejects %j', (input) => {
    expect(parseTime(input)).toBeNull();
  });
});

describe('formatTime', () => {
  it('formats 12-hour and 24-hour clocks', () => {
    expect(formatTime(0, '12h')).toBe('12:00 AM');
    expect(formatTime(720, '12h')).toBe('12:00 PM');
    expect(formatTime(1050, '12h')).toBe('5:30 PM');
    expect(formatTime(545, '12h')).toBe('9:05 AM');
    expect(formatTime(1050, '24h')).toBe('17:30');
    expect(formatTime(5, '24h')).toBe('00:05');
    expect(formatTime(1440 + 60, '24h')).toBe('01:00');
  });
});

describe('shiftLength', () => {
  const t = (s: string) => parseTime(s)!;
  it('reads a bare out time as PM after a morning start in 12-hour mode', () => {
    expect(shiftLength(t('9'), t('5'), '12h')).toEqual({ minutes: h(8), end: h(17) });
    expect(shiftLength(t('8:30'), t('12:30'), '12h')).toEqual({ minutes: h(4), end: h(12.5) });
  });
  it('picks the shorter reading for overnight shifts', () => {
    expect(shiftLength(t('10pm'), t('6'), '12h')).toEqual({ minutes: h(8), end: h(6) });
    expect(shiftLength(t('8pm'), t('12'), '12h')).toEqual({ minutes: h(4), end: 0 });
  });
  it('respects explicit AM/PM', () => {
    expect(shiftLength(t('9am'), t('5am'), '12h')).toEqual({ minutes: h(20), end: h(5) });
  });
  it('treats 24-hour times literally and wraps past midnight', () => {
    expect(shiftLength(t('9'), t('5'), '24h')).toEqual({ minutes: h(20), end: h(5) });
    expect(shiftLength(t('22:00'), t('06:30'), '24h')).toEqual({ minutes: h(8.5), end: h(6.5) });
    expect(shiftLength(t('9:00'), t('17:00'), '24h')).toEqual({ minutes: h(8), end: h(17) });
  });
});

describe('roundPunch', () => {
  it('applies the 7-minute rule for quarter hours', () => {
    expect(roundPunch(h(9) + 7, 15)).toBe(h(9));
    expect(roundPunch(h(9) + 8, 15)).toBe(h(9) + 15);
    expect(roundPunch(h(9) - 7, 15)).toBe(h(9));
    expect(roundPunch(h(9) - 8, 15)).toBe(h(9) - 15);
  });
  it('rounds to 5 and 6 minutes', () => {
    expect(roundPunch(h(9) + 2, 5)).toBe(h(9));
    expect(roundPunch(h(9) + 3, 5)).toBe(h(9) + 5);
    expect(roundPunch(h(9) + 3, 6)).toBe(h(9) + 6);
    expect(roundPunch(h(9) + 2, 6)).toBe(h(9));
  });
  it('leaves times alone with no rounding', () => {
    expect(roundPunch(553, 0)).toBe(553);
  });
});

describe('parseBreak', () => {
  it.each([
    ['', 0],
    ['30', 30],
    ['45 min', 45],
    ['0:30', 30],
    ['1:15', 75],
    ['1h', 60],
    ['0.5 hours', 30],
    ['1.25hr', 75],
  ])('%j → %i', (input, minutes) => {
    expect(parseBreak(input)).toBe(minutes);
  });
  it.each(['abc', '-30', '0:75', '30s'])('rejects %j', (input) => {
    expect(parseBreak(input)).toBeNull();
  });
});

describe('computeDay', () => {
  it('subtracts the break and normalizes the inputs', () => {
    expect(computeDay({ start: '9', end: '5:30', breakText: '30' }, '12h')).toEqual({
      minutes: h(8),
      error: null,
      start: '9:00 AM',
      end: '5:30 PM',
      overnight: false,
    });
  });
  it('handles overnight shifts', () => {
    const r = computeDay({ start: '22:00', end: '06:00', breakText: '0:30' }, '24h');
    expect(r.minutes).toBe(h(7.5));
    expect(r.overnight).toBe(true);
    expect(r.end).toBe('06:00');
  });
  it('treats an empty day as zero', () => {
    expect(computeDay({ start: '', end: '', breakText: '' }, '12h')).toEqual({ minutes: 0, error: null, overnight: false });
    expect(computeDay({ start: '', end: '', breakText: '30' }, '12h').minutes).toBe(0);
  });
  it('reports errors', () => {
    expect(computeDay({ start: '9', end: '', breakText: '' }, '12h').error).toBe('missing');
    expect(computeDay({ start: 'x', end: '5', breakText: '' }, '12h').error).toBe('start');
    expect(computeDay({ start: '9', end: '99', breakText: '' }, '12h').error).toBe('end');
    expect(computeDay({ start: '9', end: '5', breakText: 'lunch' }, '12h').error).toBe('break');
    expect(computeDay({ start: '9', end: '10', breakText: '90' }, '12h').error).toBe('break-too-long');
  });
  it('applies punch rounding to in and out', () => {
    // 8:53 → 9:00, 17:07 → 17:00 with quarter-hour rounding
    expect(computeDay({ start: '8:53', end: '17:07', breakText: '' }, '24h', 15).minutes).toBe(h(8));
    expect(computeDay({ start: '8:53', end: '17:07', breakText: '' }, '24h', 0).minutes).toBe(h(8) + 14);
  });
});

describe('splitOvertime', () => {
  it('federal: overtime after 40 hours in the week', () => {
    expect(splitOvertime([h(9), h(9), h(9), h(9), h(9), 0, 0], 'federal')).toEqual({
      regular: h(40),
      overtime: h(5),
      doubleTime: 0,
    });
    expect(splitOvertime([h(8), h(8), h(8), h(8), h(6)], 'federal')).toEqual({ regular: h(38), overtime: 0, doubleTime: 0 });
  });

  it('federal: a 12-hour day alone is not overtime', () => {
    expect(splitOvertime([h(12), h(12), h(12), 0, 0, 0, 0], 'federal').overtime).toBe(0);
  });

  it('none: everything is regular', () => {
    expect(splitOvertime([h(12), h(12), h(12), h(12)], 'none')).toEqual({ regular: h(48), overtime: 0, doubleTime: 0 });
  });

  it('california: daily overtime after 8 and double time after 12', () => {
    expect(splitOvertime([h(13), 0, 0, 0, 0, 0, 0], 'california')).toEqual({
      regular: h(8),
      overtime: h(4),
      doubleTime: h(1),
    });
  });

  it('california: four 10-hour days', () => {
    // 32 regular + 8 daily OT; weekly total 40 → no extra weekly OT
    expect(splitOvertime([h(10), h(10), h(10), h(10), 0, 0, 0], 'california')).toEqual({
      regular: h(32),
      overtime: h(8),
      doubleTime: 0,
    });
  });

  it('california: weekly overtime counts only regular hours toward 40', () => {
    // Mon–Fri 9h (8 reg + 1 OT each) = 40 reg + 5 OT; Sat 6h → all weekly OT
    expect(splitOvertime([h(9), h(9), h(9), h(9), h(9), h(6), 0], 'california')).toEqual({
      regular: h(40),
      overtime: h(11),
      doubleTime: 0,
    });
  });

  it('california: seventh consecutive day', () => {
    // Six 8-hour days = 40 reg + 8 weekly OT; 7th day 10h → 8 OT + 2 DT
    expect(splitOvertime([h(8), h(8), h(8), h(8), h(8), h(8), h(10)], 'california')).toEqual({
      regular: h(40),
      overtime: h(16),
      doubleTime: h(2),
    });
  });

  it('california: the 7th-day rule needs all seven days worked', () => {
    expect(splitOvertime([0, h(8), h(8), h(8), h(8), h(8), h(10)], 'california')).toEqual({
      regular: h(40),
      overtime: h(10),
      doubleTime: 0,
    });
  });

  it('keeps the total', () => {
    const days = [h(11.5), h(13), h(3), h(8.25), h(9), h(7), h(12.75)];
    for (const rule of ['federal', 'california', 'none'] as const) {
      const s = splitOvertime(days, rule);
      expect(s.regular + s.overtime + s.doubleTime).toBe(days.reduce((a, b) => a + b, 0));
    }
  });
});

describe('grossPay', () => {
  it('pays 1.5× for overtime and 2× for double time', () => {
    // $20/h: 40 × 20 = 800, 5 × 30 = 150, 1 × 40 = 40
    expect(grossPay({ regular: h(40), overtime: h(5), doubleTime: h(1) }, 2000)).toEqual({
      regularCents: 80000,
      overtimeCents: 15000,
      doubleTimeCents: 4000,
      totalCents: 99000,
    });
  });
  it('rounds to the cent', () => {
    // 7h 20m at $17.25 = 7.3333 × 17.25 = 126.50
    expect(grossPay({ regular: 440, overtime: 0, doubleTime: 0 }, 1725)!.totalCents).toBe(12650);
  });
  it('rejects a negative or missing rate', () => {
    expect(grossPay({ regular: 60, overtime: 0, doubleTime: 0 }, -1)).toBeNull();
    expect(grossPay({ regular: 60, overtime: 0, doubleTime: 0 }, Number.NaN)).toBeNull();
  });
});

describe('formatting', () => {
  it('formats hours and minutes and decimal hours', () => {
    expect(formatHM(2475)).toBe('41:15');
    expect(formatHM(5)).toBe('0:05');
    expect(formatDecimalHours(2475)).toBe('41.25');
    expect(formatDecimalHours(500)).toBe('8.33');
    expect(formatDecimalHours(0)).toBe('0.00');
  });
  it('formats dollars', () => {
    expect(formatUsd(99000)).toBe('$990.00');
    expect(formatUsd(123456)).toBe('$1,234.56');
  });
  it('lists workweek days', () => {
    expect(weekDays('mon')[0]).toBe('Monday');
    expect(weekDays('mon')[6]).toBe('Sunday');
    expect(weekDays('sun')[0]).toBe('Sunday');
  });
});

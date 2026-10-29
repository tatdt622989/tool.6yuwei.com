import { describe, expect, it } from 'vitest';
import { cal2027, CALENDAR_2027 } from './logic';

const md = (d: { m: number; d: number }) => `${d.m}/${d.d}`;

describe('2027 official calendar (116 年)', () => {
  it('has 121 days off, as announced by 人事行政總處', () => {
    expect(CALENDAR_2027.totalDaysOff).toBe(121);
    expect(cal2027.countDaysOff()).toBe(121);
  });

  it('lists the 9 breaks of 3+ days', () => {
    const list = cal2027.longWeekends().map((b) => `${b.label} ${md(b.start)}-${md(b.end)} ${b.days}`);
    expect(list).toEqual([
      '開國紀念日 1/1-1/3 3',
      '春節 2/4-2/10 7',
      '和平紀念日 2/27-3/1 3',
      '兒童節及清明節 4/3-4/6 4',
      '勞動節 4/30-5/2 3',
      '國慶日 10/9-10/11 3',
      '光復節 10/23-10/25 3',
      '行憲紀念日 12/24-12/26 3',
      '2028 元旦 12/31-1/2 3',
    ]);
  });

  it('has no 補班 and every 補假 is on a weekday', () => {
    expect(CALENDAR_2027.makeupWorkdays).toEqual([]);
    for (const h of CALENDAR_2027.holidays.filter((x) => x.kind === 'compensatory')) {
      const [y, m, d] = h.date.split('-').map(Number);
      const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      expect(wd > 0 && wd < 6, h.date).toBe(true);
    }
  });

  it('has unique sorted 2027 dates', () => {
    const dates = CALENDAR_2027.holidays.map((h) => h.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort()).toEqual(dates);
    expect(dates.every((d) => d.startsWith('2027-'))).toBe(true);
  });

  it('mid-week holidays are single days off', () => {
    for (const d of [9, 15]) expect(cal2027.isDayOff({ y: 2027, m: d === 9 ? 6 : 9, d })).toBe(true);
    expect(cal2027.isDayOff({ y: 2027, m: 6, d: 10 })).toBe(false);
    expect(cal2027.isDayOff({ y: 2027, m: 9, d: 28 })).toBe(true);
    expect(cal2027.isDayOff({ y: 2027, m: 9, d: 27 })).toBe(false);
  });
});

describe('2027 請假攻略', () => {
  const plans = cal2027.bridgePlans();
  const find = (leave: string) => plans.find((p) => p.leave.map(md).join(',') === leave);

  it('春節: 2 days for 11, 3 for 12, 5 (both sides) for 16', () => {
    expect(find('2/11,2/12')?.days).toBe(11);
    expect(find('2/1,2/2,2/3')?.days).toBe(12);
    const gold = find('2/1,2/2,2/3,2/11,2/12')!;
    expect(gold.bothSides).toBe(true);
    expect(`${md(gold.start)}-${md(gold.end)} ${gold.days}`).toBe('1/30-2/14 16');
  });

  it('mid-week 端午、中秋、教師節', () => {
    expect(find('6/7,6/8,6/10,6/11')?.days).toBe(9);
    expect(find('9/13,9/14,9/16,9/17')?.days).toBe(9);
    expect(find('9/27')?.days).toBe(4);
    expect(find('4/7,4/8,4/9')?.days).toBe(9);
  });

  it('year end: 4 days for 10 through the 2028 New Year weekend', () => {
    const p = find('12/27,12/28,12/29,12/30')!;
    expect(p.end).toEqual({ y: 2028, m: 1, d: 2 });
    expect(p.days).toBe(10);
  });

  it('keeps leave inside 2027', () => {
    expect(plans.every((p) => p.leave.every((d) => d.y === 2027))).toBe(true);
  });
});

describe('countdown', () => {
  it('from late 2026 the next 2027 holiday is New Year', () => {
    expect(cal2027.nextHoliday({ y: 2026, m: 10, d: 29 })).toMatchObject({ holiday: { date: '2027-01-01' }, daysUntil: 64 });
    expect(cal2027.nextLongWeekend({ y: 2026, m: 10, d: 29 })).toMatchObject({ daysUntil: 64, ongoing: false });
    expect(cal2027.daysOffLeft({ y: 2026, m: 10, d: 29 })).toBe(121);
  });

  it('after 行憲紀念日 it points to the 2028 New Year', () => {
    expect(cal2027.nextHoliday({ y: 2027, m: 12, d: 26 })?.holiday.date).toBe('2028-01-01');
    expect(cal2027.nextLongWeekend({ y: 2027, m: 12, d: 31 })).toMatchObject({ ongoing: true });
  });

  it('month stats', () => {
    expect(cal2027.monthStats(2)).toEqual({ off: 13, work: 15 });
  });
});

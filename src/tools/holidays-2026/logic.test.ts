import { describe, expect, it } from 'vitest';
import { blockLabel, iso, parseIso } from './calendar';
import { cal2026, CALENDAR_2026 } from './logic';

const HOLIDAYS_2026 = CALENDAR_2026.holidays;
const bridgePlans = () => cal2026.bridgePlans();
const countDaysOff = () => cal2026.countDaysOff();
const isDayOff = (d: { y: number; m: number; d: number }) => cal2026.isDayOff(d);
const longWeekends = () => cal2026.longWeekends();
const monthGrid = (m: number) => cal2026.monthGrid(m);
const monthStats = (m: number) => cal2026.monthStats(m);
const nextHoliday = (d: { y: number; m: number; d: number }) => cal2026.nextHoliday(d);
const nextLongWeekend = (d: { y: number; m: number; d: number }) => cal2026.nextLongWeekend(d);

const md = (d: { m: number; d: number }) => `${d.m}/${d.d}`;

describe('2026 official calendar', () => {
  it('has 120 days off in total, as announced by 人事行政總處', () => {
    expect(countDaysOff()).toBe(CALENDAR_2026.totalDaysOff);
    expect(CALENDAR_2026.totalDaysOff).toBe(120);
  });

  it('lists the 9 long weekends with the official dates and lengths', () => {
    const list = longWeekends().map((b) => `${b.label} ${md(b.start)}-${md(b.end)} ${b.days}`);
    expect(list).toEqual([
      '春節 2/14-2/22 9',
      '和平紀念日 2/27-3/1 3',
      '兒童節及清明節 4/3-4/6 4',
      '勞動節 5/1-5/3 3',
      '端午節 6/19-6/21 3',
      '中秋節及教師節 9/25-9/28 4',
      '國慶日 10/9-10/11 3',
      '光復節 10/24-10/26 3',
      '行憲紀念日 12/25-12/27 3',
    ]);
  });

  it('has unique, sorted dates that are all in 2026', () => {
    const dates = HOLIDAYS_2026.map((h) => h.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort()).toEqual(dates);
    expect(dates.every((d) => d.startsWith('2026-'))).toBe(true);
  });

  it('every 補假 is on a weekday and has no 補班', () => {
    for (const h of HOLIDAYS_2026.filter((x) => x.kind === 'compensatory')) {
      const [y, m, d] = h.date.split('-').map(Number);
      const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      expect(wd, h.date).toBeGreaterThan(0);
      expect(wd, h.date).toBeLessThan(6);
    }
  });

  it('knows ordinary days', () => {
    expect(isDayOff({ y: 2026, m: 1, d: 2 })).toBe(false); // Friday after 元旦 is a workday
    expect(isDayOff({ y: 2026, m: 2, d: 20 })).toBe(true);
    expect(isDayOff({ y: 2026, m: 10, d: 31 })).toBe(true); // Saturday
  });
});

describe('bridgePlans', () => {
  const plans = bridgePlans();
  const find = (leaveStart: string) => plans.find((p) => md(p.leave[0]) === leaveStart);

  it('suggests 4 days of leave between 春節 and 228 for 16 days off', () => {
    const p = find('2/23')!;
    expect(p.leave).toHaveLength(4);
    expect(`${md(p.start)}-${md(p.end)}`).toBe('2/14-3/1');
    expect(p.days).toBe(16);
  });

  it('suggests 1/2 to make 元旦 a 4-day weekend', () => {
    const p = find('1/2')!;
    expect(p.leave).toHaveLength(1);
    expect(p.days).toBe(4);
  });

  it('bridges 行憲紀念日 into the 2027 New Year weekend', () => {
    const p = find('12/28')!;
    expect(p.leave).toHaveLength(4);
    expect(p.end).toEqual({ y: 2027, m: 1, d: 3 });
    expect(p.days).toBe(10);
  });

  it('other examples from the published 請假攻略', () => {
    expect(find('3/30')?.days).toBe(10); // 3/28–4/6
    expect(find('4/7')?.days).toBe(10); // 4/3–4/12
    expect(find('6/15')?.days).toBe(9); // 6/13–6/21
    expect(find('9/21')?.days).toBe(10); // 9/19–9/28
    expect(find('9/29')?.days).toBe(10); // 9/25–10/4
    expect(find('10/27')?.days).toBe(9); // 10/24–11/1
  });

  it('one-sided plans ask for at most 4 days, two-sided at most 5, all inside 2026, sorted', () => {
    expect(plans.every((p) => p.leave.length >= 1 && p.leave.length <= (p.bothSides ? 5 : 4))).toBe(true);
    expect(plans.every((p) => p.leave.every((d) => d.y === 2026))).toBe(true);
    const firsts = plans.map((p) => Date.UTC(p.leave[0].y, p.leave[0].m - 1, p.leave[0].d));
    expect([...firsts].sort((a, b) => a - b)).toEqual(firsts);
  });
});

describe('countdown', () => {
  it('finds the next holiday', () => {
    expect(nextHoliday({ y: 2026, m: 10, d: 29 })).toMatchObject({ holiday: { name: '行憲紀念日' }, daysUntil: 57 });
    expect(nextHoliday({ y: 2026, m: 12, d: 25 })?.daysUntil).toBe(0);
    expect(nextHoliday({ y: 2026, m: 12, d: 26 })?.holiday.date).toBe('2027-01-01');
    expect(nextHoliday({ y: 2027, m: 1, d: 2 })).toBeNull();
  });

  it('finds the next or ongoing long weekend', () => {
    expect(nextLongWeekend({ y: 2026, m: 10, d: 29 })).toMatchObject({ daysUntil: 57, ongoing: false });
    expect(nextLongWeekend({ y: 2026, m: 2, d: 18 })).toMatchObject({ daysUntil: 0, ongoing: true });
    expect(nextLongWeekend({ y: 2026, m: 12, d: 28 })).toBeNull();
  });
});

describe('monthGrid', () => {
  it('starts on the right weekday and marks days off', () => {
    const feb = monthGrid(2);
    expect(feb[0]).toMatchObject({ d: 1, weekday: 0 }); // 2026-02-01 is a Sunday, so no leading blanks
    expect(feb.filter(Boolean)).toHaveLength(28);
    const jan = monthGrid(1);
    expect(jan.slice(0, 4)).toEqual([null, null, null, null]); // 1/1 is a Thursday
    expect(jan[4]).toMatchObject({ d: 1, off: true, holiday: { name: '開國紀念日（元旦）' } });
  });

  it('month stats', () => {
    expect(monthStats(2)).toEqual({ off: 14, work: 14 });
    expect(monthStats(1)).toEqual({ off: 10, work: 21 });
  });
});

describe('calendar helpers', () => {
  it('iso / parseIso round-trip', () => {
    expect(iso({ y: 2026, m: 2, d: 5 })).toBe('2026-02-05');
    expect(parseIso('2026-02-05')).toEqual({ y: 2026, m: 2, d: 5 });
  });

  it('labels breaks', () => {
    expect(blockLabel(['小年夜', '除夕', '春節（初一）'])).toBe('春節');
    expect(blockLabel(['兒童節', '民族掃墓節（清明節）'])).toBe('兒童節及清明節');
    expect(blockLabel(['臺灣光復暨金門古寧頭大捷紀念日'])).toBe('光復節');
  });

  it('days off left', () => {
    expect(cal2026.daysOffLeft({ y: 2025, m: 6, d: 1 })).toBe(120);
    expect(cal2026.daysOffLeft({ y: 2026, m: 12, d: 31 })).toBe(0); // Thursday, a workday
    expect(cal2026.daysOffLeft({ y: 2027, m: 1, d: 1 })).toBe(0);
  });
});

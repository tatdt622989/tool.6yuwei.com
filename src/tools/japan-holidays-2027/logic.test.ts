import { describe, expect, it } from 'vitest';
import { iso } from '../japan-holidays-2026/calendar';
import { cal2027, DATA_2027 } from './logic';

const list = (hs: readonly { date: string; name: string }[]) => hs.map((h) => `${h.date.slice(5)} ${h.name}`);
const fmt = (b: { start: { y: number; m: number; d: number }; end: { y: number; m: number; d: number }; days: number }) =>
  `${iso(b.start)}..${iso(b.end)} ${b.days}`;

describe('2027 (内閣府「国民の祝日について」・国立天文台 暦要項)', () => {
  it('matches the official list exactly', () => {
    expect(list(DATA_2027.holidays)).toEqual([
      '01-01 元日',
      '01-11 成人の日',
      '02-11 建国記念の日',
      '02-23 天皇誕生日',
      '03-21 春分の日',
      '03-22 振替休日',
      '04-29 昭和の日',
      '05-03 憲法記念日',
      '05-04 みどりの日',
      '05-05 こどもの日',
      '07-19 海の日',
      '08-11 山の日',
      '09-20 敬老の日',
      '09-23 秋分の日',
      '10-11 スポーツの日',
      '11-03 文化の日',
      '11-23 勤労感謝の日',
    ]);
  });

  it('counts holidays and days off', () => {
    // Only 3/21 falls on a weekend; 104 weekend days + 16 weekday holidays = 120.
    expect(cal2027.stats()).toEqual({ national: 16, extra: 1, weekdayHolidays: 16, daysOff: 120 });
  });

  it('lists the 3+ day breaks (no シルバーウィーク in 2027)', () => {
    expect(cal2027.longWeekends().map((b) => `${b.label} ${fmt(b)}`)).toEqual([
      '元日の3連休 2027-01-01..2027-01-03 3',
      '成人の日の3連休 2027-01-09..2027-01-11 3',
      '春分の日の3連休 2027-03-20..2027-03-22 3',
      'ゴールデンウィーク 2027-05-01..2027-05-05 5',
      '海の日の3連休 2027-07-17..2027-07-19 3',
      '敬老の日の3連休 2027-09-18..2027-09-20 3',
      'スポーツの日の3連休 2027-10-09..2027-10-11 3',
    ]);
  });

  it('computes the 年末年始 breaks', () => {
    expect(fmt(cal2027.newYearBreak('start'))).toBe('2026-12-29..2027-01-03 6');
    expect(fmt(cal2027.newYearBreak('end'))).toBe('2027-12-29..2028-01-03 6');
  });

  it('suggests 有給 plans (GW 4/29–5/5 with 4/30 off)', () => {
    const gw = cal2027.leavePlans().find((p) => p.label === 'ゴールデンウィーク');
    expect(gw && fmt(gw)).toBe('2027-04-29..2027-05-05 7');
    expect(gw?.leave.map(iso)).toEqual(['2027-04-30']);
  });

  it('counts down into 2028', () => {
    expect(cal2027.nextHoliday({ y: 2026, m: 10, d: 29 })).toMatchObject({ holiday: { date: '2027-01-01' }, daysUntil: 64 });
    expect(cal2027.nextHoliday({ y: 2027, m: 11, d: 24 })).toMatchObject({ holiday: { date: '2028-01-01' } });
    expect(DATA_2027.nextYear.map((h) => h.date)).toEqual(['2028-01-01', '2028-01-10']);
  });
});

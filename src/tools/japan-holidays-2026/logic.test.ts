import { describe, expect, it } from 'vitest';
import { blockLabel, holidaysOf, iso, nationalHolidays, nthMonday } from './calendar';
import { cal2026, DATA_2026 } from './logic';

const list = (hs: readonly { date: string; name: string }[]) => hs.map((h) => `${h.date.slice(5)} ${h.name}`);
const fmt = (b: { start: { y: number; m: number; d: number }; end: { y: number; m: number; d: number }; days: number }) =>
  `${iso(b.start)}..${iso(b.end)} ${b.days}`;

describe('rule engine', () => {
  it('finds the n-th Monday', () => {
    expect(iso(nthMonday(2026, 1, 2))).toBe('2026-01-12');
    expect(iso(nthMonday(2026, 6, 1))).toBe('2026-06-01'); // June 1, 2026 is a Monday
    expect(iso(nthMonday(2026, 9, 3))).toBe('2026-09-21');
  });

  it('applies 振替休日 to the nearest non-祝日 (2026-05-03 Sunday → 5/6)', () => {
    const hs = holidaysOf(2026, { spring: 20, autumn: 23 });
    expect(hs.find((h) => h.date === '2026-05-06')).toEqual({ date: '2026-05-06', name: '振替休日', kind: 'substitute' });
  });

  it('applies 国民の休日 between two 祝日 (2026-09-22)', () => {
    const hs = holidaysOf(2026, { spring: 20, autumn: 23 });
    expect(hs.find((h) => h.date === '2026-09-22')).toEqual({ date: '2026-09-22', name: '国民の休日', kind: 'citizens' });
  });

  it('reproduces 2025 (振替休日 2/24・5/6・11/24)', () => {
    // 内閣府 2025: 元日1/1 成人1/13 建国2/11 天皇2/23 休日2/24 春分3/20 昭和4/29 憲法5/3 みどり5/4 こども5/5 休日5/6
    // 海7/21 山8/11 敬老9/15 秋分9/23 スポーツ10/13 文化11/3 勤労11/23 休日11/24
    expect(list(holidaysOf(2025, { spring: 20, autumn: 23 }))).toEqual([
      '01-01 元日',
      '01-13 成人の日',
      '02-11 建国記念の日',
      '02-23 天皇誕生日',
      '02-24 振替休日',
      '03-20 春分の日',
      '04-29 昭和の日',
      '05-03 憲法記念日',
      '05-04 みどりの日',
      '05-05 こどもの日',
      '05-06 振替休日',
      '07-21 海の日',
      '08-11 山の日',
      '09-15 敬老の日',
      '09-23 秋分の日',
      '10-13 スポーツの日',
      '11-03 文化の日',
      '11-23 勤労感謝の日',
      '11-24 振替休日',
    ]);
  });

  it('always has 16 国民の祝日', () => {
    expect(nationalHolidays(2026, { spring: 20, autumn: 23 })).toHaveLength(16);
  });

  it('labels blocks', () => {
    const b = { start: { y: 2026, m: 1, d: 10 }, end: { y: 2026, m: 1, d: 12 }, days: 3 };
    expect(blockLabel({ ...b, names: ['成人の日'] })).toBe('成人の日の3連休');
    expect(blockLabel({ ...b, names: ['憲法記念日', 'みどりの日', 'こどもの日'] })).toBe('ゴールデンウィーク');
    expect(blockLabel({ ...b, names: ['敬老の日', '秋分の日'] })).toBe('シルバーウィーク');
  });
});

describe('2026 (内閣府「国民の祝日について」)', () => {
  it('matches the official list exactly', () => {
    expect(list(DATA_2026.holidays)).toEqual([
      '01-01 元日',
      '01-12 成人の日',
      '02-11 建国記念の日',
      '02-23 天皇誕生日',
      '03-20 春分の日',
      '04-29 昭和の日',
      '05-03 憲法記念日',
      '05-04 みどりの日',
      '05-05 こどもの日',
      '05-06 振替休日',
      '07-20 海の日',
      '08-11 山の日',
      '09-21 敬老の日',
      '09-22 国民の休日',
      '09-23 秋分の日',
      '10-12 スポーツの日',
      '11-03 文化の日',
      '11-23 勤労感謝の日',
    ]);
  });

  it('counts holidays and days off', () => {
    // Only 5/3 falls on a weekend; 104 weekend days + 17 weekday holidays = 121.
    expect(cal2026.stats()).toEqual({ national: 16, extra: 2, weekdayHolidays: 17, daysOff: 121 });
  });

  it('lists the 3+ day breaks', () => {
    expect(cal2026.longWeekends().map((b) => `${b.label} ${fmt(b)}`)).toEqual([
      '成人の日の3連休 2026-01-10..2026-01-12 3',
      '天皇誕生日の3連休 2026-02-21..2026-02-23 3',
      '春分の日の3連休 2026-03-20..2026-03-22 3',
      'ゴールデンウィーク 2026-05-02..2026-05-06 5',
      '海の日の3連休 2026-07-18..2026-07-20 3',
      'シルバーウィーク 2026-09-19..2026-09-23 5',
      'スポーツの日の3連休 2026-10-10..2026-10-12 3',
      '勤労感謝の日の3連休 2026-11-21..2026-11-23 3',
    ]);
  });

  it('computes the 年末年始 breaks (12/29–1/3 plus weekends)', () => {
    expect(fmt(cal2026.newYearBreak('start'))).toBe('2025-12-27..2026-01-04 9');
    expect(fmt(cal2026.newYearBreak('end'))).toBe('2026-12-29..2027-01-03 6');
  });

  it('suggests 有給 plans (GW 4/29–5/6 with 4/30・5/1 off)', () => {
    const gw = cal2026.leavePlans().find((p) => p.label === 'ゴールデンウィーク');
    expect(gw && fmt(gw)).toBe('2026-04-29..2026-05-06 8');
    expect(gw?.leave.map(iso)).toEqual(['2026-04-30', '2026-05-01']);
    for (const p of cal2026.leavePlans()) {
      expect(p.days).toBeGreaterThanOrEqual(5);
      expect(p.leave.length).toBeLessThanOrEqual(2);
    }
  });

  it('counts down to the next holiday', () => {
    expect(cal2026.nextHoliday({ y: 2026, m: 10, d: 29 })).toMatchObject({ holiday: { name: '文化の日' }, daysUntil: 5 });
    expect(cal2026.nextHoliday({ y: 2026, m: 11, d: 3 })?.daysUntil).toBe(0);
    // After 11/23 it looks into 2027.
    expect(cal2026.nextHoliday({ y: 2026, m: 11, d: 24 })).toMatchObject({ holiday: { date: '2027-01-01' }, daysUntil: 38 });
    expect(cal2026.holidaysLeft({ y: 2026, m: 10, d: 29 })).toBe(2);
  });

  it('finds the next long weekend, including an ongoing one', () => {
    expect(cal2026.nextLongWeekend({ y: 2026, m: 10, d: 29 })).toMatchObject({ daysUntil: 23, ongoing: false });
    expect(cal2026.nextLongWeekend({ y: 2026, m: 9, d: 21 })).toMatchObject({ block: { label: 'シルバーウィーク' }, ongoing: true });
    expect(cal2026.nextLongWeekend({ y: 2026, m: 11, d: 24 })).toBeNull();
  });

  it('builds month grids starting on Sunday', () => {
    const jan = cal2026.monthGrid(1);
    expect(jan.slice(0, 4)).toEqual([null, null, null, null]); // 2026-01-01 is a Thursday
    expect(jan[4]).toMatchObject({ d: 1, weekday: 4, holiday: { name: '元日' } });
    expect(jan.filter(Boolean)).toHaveLength(31);
    expect(cal2026.monthGrid(2).filter(Boolean)).toHaveLength(28);
  });
});

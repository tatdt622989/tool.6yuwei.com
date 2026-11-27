import { describe, expect, it } from 'vitest';
import { addDays, toDayNumber, type YMD } from '../date-diff/logic';
import {
  animalOf,
  astroYear,
  dayGanzhi,
  dayName,
  describe as describeDate,
  festivalsOf,
  formatLunar,
  leapMonth,
  LUNAR_INFO,
  lunarMonthLength,
  lunarNewYear,
  lunarToSolar,
  lunarYearDays,
  monthGanzhi,
  monthName,
  nearbyTerms,
  solarTermsOf,
  solarToLunar,
  termOn,
  yearGanzhi,
} from './logic';

const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });

describe('table', () => {
  it('covers 1900–2100', () => {
    expect(LUNAR_INFO).toHaveLength(201);
  });

  it('every lunar year has a plausible length', () => {
    for (let y = 1900; y <= 2100; y++) {
      const days = lunarYearDays(y);
      expect(leapMonth(y) ? [383, 384, 385] : [353, 354, 355]).toContain(days);
    }
  });
});

describe('solarToLunar — dates checked against the Hong Kong Observatory tables', () => {
  it('2026 春節 is 2026-02-17 and 除夕 2026-02-16', () => {
    expect(solarToLunar(ymd(2026, 2, 17))).toEqual({ year: 2026, month: 1, day: 1, isLeap: false });
    expect(solarToLunar(ymd(2026, 2, 16))).toEqual({ year: 2025, month: 12, day: 29, isLeap: false });
    expect(lunarNewYear(2026)).toEqual(ymd(2026, 2, 17));
    expect(lunarNewYear(2027)).toEqual(ymd(2027, 2, 6));
  });

  it('2023 has 閏二月 starting 2023-03-22', () => {
    expect(leapMonth(2023)).toBe(2);
    expect(solarToLunar(ymd(2023, 3, 21))).toEqual({ year: 2023, month: 2, day: 30, isLeap: false });
    expect(solarToLunar(ymd(2023, 3, 22))).toEqual({ year: 2023, month: 2, day: 1, isLeap: true });
    expect(solarToLunar(ymd(2023, 4, 20))).toEqual({ year: 2023, month: 3, day: 1, isLeap: false });
  });

  it('2025 has 閏六月, 2020 閏四月, 2033 閏十一月', () => {
    expect(leapMonth(2025)).toBe(6);
    expect(solarToLunar(ymd(2025, 7, 25))).toEqual({ year: 2025, month: 6, day: 1, isLeap: true });
    expect(leapMonth(2020)).toBe(4);
    expect(solarToLunar(ymd(2020, 5, 23))).toEqual({ year: 2020, month: 4, day: 1, isLeap: true });
    expect(leapMonth(2033)).toBe(11);
    expect(solarToLunar(ymd(2033, 12, 22))).toEqual({ year: 2033, month: 11, day: 1, isLeap: true });
    expect(leapMonth(2026)).toBe(0);
  });

  it('2026 festivals: 端午 6/19, 中秋 9/25', () => {
    expect(lunarToSolar({ year: 2026, month: 5, day: 5, isLeap: false })).toEqual(ymd(2026, 6, 19));
    expect(lunarToSolar({ year: 2026, month: 8, day: 15, isLeap: false })).toEqual(ymd(2026, 9, 25));
    expect(solarToLunar(ymd(2026, 10, 29))).toEqual({ year: 2026, month: 9, day: 20, isLeap: false });
  });

  it('handles the edges of the table', () => {
    expect(solarToLunar(ymd(1900, 1, 31))).toEqual({ year: 1900, month: 1, day: 1, isLeap: false });
    expect(solarToLunar(ymd(1900, 1, 30))).toBeNull();
    expect(solarToLunar(ymd(2100, 12, 31))).toEqual({ year: 2100, month: 12, day: 1, isLeap: false });
    expect(solarToLunar(ymd(2101, 6, 1))).toBeNull();
  });
});

describe('lunarToSolar', () => {
  it('rejects dates that do not exist', () => {
    expect(lunarToSolar({ year: 2026, month: 6, day: 1, isLeap: true })).toBeNull();
    expect(lunarMonthLength(2025, 12, false)).toBe(29);
    expect(lunarToSolar({ year: 2025, month: 12, day: 30, isLeap: false })).toBeNull();
    expect(lunarToSolar({ year: 1899, month: 1, day: 1, isLeap: false })).toBeNull();
    expect(lunarToSolar({ year: 2026, month: 13, day: 1, isLeap: false })).toBeNull();
  });

  it('round-trips every day from 1900-01-31 to 2100-12-31', () => {
    let date = ymd(1900, 1, 31);
    const end = toDayNumber(ymd(2100, 12, 31));
    let checked = 0;
    while (toDayNumber(date) <= end) {
      const lunar = solarToLunar(date);
      expect(lunar).not.toBeNull();
      const back = lunarToSolar(lunar!);
      if (!back || toDayNumber(back) !== toDayNumber(date)) throw new Error(`round trip failed at ${JSON.stringify(date)}`);
      date = addDays(date, 1);
      checked++;
    }
    expect(checked).toBe(73_384);
  });
});

describe('干支 and 生肖', () => {
  it('year', () => {
    expect(yearGanzhi(2026)).toBe('丙午');
    expect(animalOf(2026)).toBe('馬');
    expect(yearGanzhi(1984)).toBe('甲子');
    expect(animalOf(1900)).toBe('鼠');
  });

  it('day: 2000-01-01 戊午, 1949-10-01 甲子', () => {
    expect(dayGanzhi(ymd(2000, 1, 1))).toBe('戊午');
    expect(dayGanzhi(ymd(1949, 10, 1))).toBe('甲子');
  });

  it('month changes at the 節, 立春 opens 寅 month', () => {
    expect(monthGanzhi(ymd(2026, 2, 4))).toBe('庚寅');
    expect(monthGanzhi(ymd(2026, 2, 3))).toBe('己丑');
    expect(monthGanzhi(ymd(1900, 1, 1))).toBe('丙子');
  });

  it('八字 year changes at 立春', () => {
    expect(astroYear(ymd(2026, 2, 3))).toBe(2025);
    expect(astroYear(ymd(2026, 2, 4))).toBe(2026);
    expect(astroYear(ymd(2026, 1, 20))).toBe(2025);
  });
});

describe('節氣', () => {
  it('2026 dates match the HKO / 中央氣象署 calendar', () => {
    const terms = Object.fromEntries(solarTermsOf(2026).map((t) => [t.name, `${t.date.m}/${t.date.d}`]));
    expect(terms).toMatchObject({
      小寒: '1/5',
      立春: '2/4',
      清明: '4/5',
      夏至: '6/21',
      秋分: '9/23',
      霜降: '10/23',
      冬至: '12/22',
    });
  });

  it('termOn and nearbyTerms', () => {
    expect(termOn(ymd(2026, 4, 5))).toBe('清明');
    expect(termOn(ymd(2026, 4, 6))).toBeNull();
    const { prev, next } = nearbyTerms(ymd(2026, 10, 29));
    expect(prev?.name).toBe('霜降');
    expect(next?.name).toBe('立冬');
    expect(next?.date).toEqual(ymd(2026, 11, 7));
  });

  it('crosses the year boundary', () => {
    const { prev, next } = nearbyTerms(ymd(2026, 1, 2));
    expect(prev?.name).toBe('冬至');
    expect(prev?.date.y).toBe(2025);
    expect(next?.name).toBe('小寒');
  });
});

describe('formatting', () => {
  it('names months and days', () => {
    expect(monthName(1)).toBe('正月');
    expect(monthName(2, true)).toBe('閏二月');
    expect(monthName(12)).toBe('十二月');
    expect(dayName(1)).toBe('初一');
    expect(dayName(10)).toBe('初十');
    expect(dayName(15)).toBe('十五');
    expect(dayName(20)).toBe('二十');
    expect(dayName(21)).toBe('廿一');
    expect(dayName(30)).toBe('三十');
    expect(formatLunar({ year: 2023, month: 2, day: 1, isLeap: true })).toBe('癸卯年 閏二月初一');
  });

  it('describe gathers everything for a date', () => {
    const d = describeDate(ymd(2026, 2, 17))!;
    expect(d.text).toBe('丙午年 正月初一');
    expect(d.animal).toBe('馬');
    expect(d.element).toBe('火');
    expect(describeDate(ymd(1899, 6, 1))).toBeNull();
  });

  it('festivals of 2026', () => {
    const list = Object.fromEntries(festivalsOf(2026).map((f) => [f.name.slice(0, 2), `${f.date.m}/${f.date.d}`]));
    expect(list['春節']).toBe('2/17');
    expect(list['端午']).toBe('6/19');
    expect(list['中秋']).toBe('9/25');
    expect(list['清明']).toBe('4/5');
    expect(list['除夕']).toBe('2/5'); // 除夕 of lunar 2026 falls on 2027-02-05
  });
});

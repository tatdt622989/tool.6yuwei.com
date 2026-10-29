import { describe, expect, it } from 'vitest';
import {
  adToRoc,
  birthdayInYear,
  calcAge,
  constellationOf,
  nominalAge,
  rocLabel,
  rocToAD,
  zodiacOf,
  type YMD,
} from './logic';

const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });

describe('calcAge', () => {
  it('computes 實歲 in years, months and days', () => {
    const r = calcAge(ymd(1990, 6, 15), ymd(2026, 10, 29))!;
    expect(r.years).toBe(36);
    expect(r.months).toBe(4);
    expect(r.days).toBe(14);
    expect(r.nominal).toBe(37);
  });

  it('does not add a year until the birthday is reached', () => {
    expect(calcAge(ymd(2000, 10, 30), ymd(2026, 10, 29))!.years).toBe(25);
    expect(calcAge(ymd(2000, 10, 29), ymd(2026, 10, 29))!.years).toBe(26);
  });

  it('handles birthdays that are today', () => {
    const r = calcAge(ymd(2000, 10, 29), ymd(2026, 10, 29))!;
    expect(r.daysToNextBirthday).toBe(0);
    expect(r.nextAge).toBe(26);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
  });

  it('counts down to the next birthday across the new year', () => {
    const r = calcAge(ymd(1995, 1, 5), ymd(2026, 10, 29))!;
    expect(r.nextBirthday).toEqual(ymd(2027, 1, 5));
    expect(r.daysToNextBirthday).toBe(68);
    expect(r.nextAge).toBe(32);
  });

  it('counts days lived including leap days', () => {
    expect(calcAge(ymd(2024, 1, 1), ymd(2025, 1, 1))!.daysLived).toBe(366);
    expect(calcAge(ymd(2026, 10, 29), ymd(2026, 10, 29))!.daysLived).toBe(0);
  });

  it('returns null for a birth date in the future', () => {
    expect(calcAge(ymd(2026, 10, 30), ymd(2026, 10, 29))).toBeNull();
  });

  it('treats 2/29 birthdays as 3/1 in common years', () => {
    const born = ymd(2000, 2, 29);
    expect(calcAge(born, ymd(2027, 2, 28))!.years).toBe(26);
    expect(calcAge(born, ymd(2027, 3, 1))!.years).toBe(27);
    expect(calcAge(born, ymd(2028, 2, 29))!.years).toBe(28);
    expect(calcAge(born, ymd(2026, 10, 29))!.nextBirthday).toEqual(ymd(2027, 3, 1));
    expect(calcAge(born, ymd(2027, 10, 29))!.nextBirthday).toEqual(ymd(2028, 2, 29));
  });
});

describe('birthdayInYear', () => {
  it('keeps ordinary dates', () => {
    expect(birthdayInYear(ymd(1990, 6, 15), 2026)).toEqual(ymd(2026, 6, 15));
    expect(birthdayInYear(ymd(2000, 2, 29), 2024)).toEqual(ymd(2024, 2, 29));
  });
});

describe('虛歲', () => {
  it('is 1 in the birth year and grows each calendar year', () => {
    expect(nominalAge(2026, 2026)).toBe(1);
    expect(nominalAge(2025, 2026)).toBe(2);
    expect(calcAge(ymd(2025, 12, 31), ymd(2026, 1, 1))!.nominal).toBe(2);
  });
});

describe('民國年', () => {
  it('converts both ways', () => {
    expect(rocToAD(79)).toBe(1990);
    expect(adToRoc(2026)).toBe(115);
    expect(rocLabel(1912)).toBe('民國 1 年');
    expect(rocLabel(2026)).toBe('民國 115 年');
    expect(rocLabel(1911)).toBe('民前 1 年');
    expect(rocLabel(1900)).toBe('民前 12 年');
  });
});

describe('zodiacOf', () => {
  it('cycles through the twelve animals', () => {
    expect(zodiacOf(2020)).toBe('鼠');
    expect(zodiacOf(2024)).toBe('龍');
    expect(zodiacOf(2026)).toBe('馬');
    expect(zodiacOf(1990)).toBe('馬');
    expect(zodiacOf(2019)).toBe('豬');
    expect(zodiacOf(1900)).toBe('鼠');
  });
});

describe('constellationOf', () => {
  it('uses the common date boundaries', () => {
    expect(constellationOf(1, 19)).toBe('摩羯座');
    expect(constellationOf(1, 20)).toBe('水瓶座');
    expect(constellationOf(3, 21)).toBe('牡羊座');
    expect(constellationOf(6, 15)).toBe('雙子座');
    expect(constellationOf(8, 23)).toBe('處女座');
    expect(constellationOf(10, 29)).toBe('天蠍座');
    expect(constellationOf(12, 22)).toBe('摩羯座');
    expect(constellationOf(2, 29)).toBe('雙魚座');
  });
});

import { describe, expect, it } from 'vitest';
import {
  birthYearForKazoe,
  DEFAULT_YEAR,
  hayamiTable,
  HONYAKU_AGES,
  kazoeAge,
  kindText,
  lifetimeYakudoshi,
  manAge,
  nextYakudoshi,
  TAIYAKU_AGE,
  yakuStatus,
  YEAR_MAX,
  YEAR_MIN,
  yearLabel,
} from './logic';

describe('kazoeAge', () => {
  it('counts the birth year as 1 and adds one every New Year', () => {
    expect(kazoeAge(2027, 2027)).toBe(1);
    expect(kazoeAge(1986, 2027)).toBe(42);
    expect(kazoeAge(1995, 2027)).toBe(33);
    expect(kazoeAge(2000, 2026)).toBe(27);
  });

  it('is zero or negative before birth', () => {
    expect(kazoeAge(2028, 2027)).toBe(0);
    expect(kazoeAge(2030, 2027)).toBe(-2);
  });

  it('birthYearForKazoe is the inverse', () => {
    for (const year of [2026, 2027, 2030]) {
      for (const kazoe of [1, 19, 33, 42, 61]) expect(kazoeAge(birthYearForKazoe(kazoe, year), year)).toBe(kazoe);
    }
  });
});

describe('manAge', () => {
  it('is 数え年 − 1 after the birthday and 数え年 − 2 before it', () => {
    expect(manAge(1986, 2027)).toEqual({ before: 40, after: 41 });
    expect(manAge(2009, 2027)).toEqual({ before: 17, after: 18 });
  });

  it('has no "before birthday" age in the birth year', () => {
    expect(manAge(2027, 2027)).toEqual({ before: null, after: 0 });
  });
});

describe('rules', () => {
  it('uses the commonly published 本厄 ages', () => {
    expect(HONYAKU_AGES.male).toEqual([25, 42, 61]);
    expect(HONYAKU_AGES.female).toEqual([19, 33, 37, 61]);
    expect(TAIYAKU_AGE).toEqual({ male: 42, female: 33 });
  });

  it('offers 2026–2030 at least, with 2027 as the default', () => {
    expect(YEAR_MIN).toBeLessThanOrEqual(2026);
    expect(YEAR_MAX).toBeGreaterThanOrEqual(2030);
    expect(DEFAULT_YEAR).toBe(2027);
  });
});

describe('hayamiTable: published 2027 (令和9年) values', () => {
  const born = (sex: 'male' | 'female', kind: 'mae' | 'hon' | 'ato', year = 2027) =>
    hayamiTable(year, sex).map((r) => r[kind].birthYear);

  it('men 本厄 = born 2003, 1986, 1967', () => {
    expect(born('male', 'hon')).toEqual([2003, 1986, 1967]);
  });

  it('women 本厄 = born 2009, 1995, 1991, 1967', () => {
    expect(born('female', 'hon')).toEqual([2009, 1995, 1991, 1967]);
  });

  it('前厄 is one year younger, 後厄 one year older', () => {
    expect(born('male', 'mae')).toEqual([2004, 1987, 1968]);
    expect(born('male', 'ato')).toEqual([2002, 1985, 1966]);
    expect(born('female', 'mae')).toEqual([2010, 1996, 1992, 1968]);
    expect(born('female', 'ato')).toEqual([2008, 1994, 1990, 1966]);
  });

  it('carries 数え年, 和暦 and the 大厄 mark', () => {
    const [m25, m42, m61] = hayamiTable(2027, 'male');
    expect(m25.taiyaku).toBe(false);
    expect(m42.taiyaku).toBe(true);
    expect(m61.taiyaku).toBe(false);
    expect(m42.mae).toEqual({ kind: 'mae', kazoe: 41, birthYear: 1987, wareki: '昭和62年' });
    expect(m42.hon).toEqual({ kind: 'hon', kazoe: 42, birthYear: 1986, wareki: '昭和61年' });
    expect(m42.ato).toEqual({ kind: 'ato', kazoe: 43, birthYear: 1985, wareki: '昭和60年' });
    expect(m25.hon.wareki).toBe('平成15年');
    const women = hayamiTable(2027, 'female');
    expect(women.map((r) => r.taiyaku)).toEqual([false, true, false, false]);
    expect(women.map((r) => r.hon.wareki)).toEqual(['平成21年', '平成7年', '平成3年', '昭和42年']);
  });

  it('shifts by one birth year per calendar year', () => {
    expect(born('male', 'hon', 2026)).toEqual([2002, 1985, 1966]);
    expect(born('female', 'hon', 2026)).toEqual([2008, 1994, 1990, 1966]);
    expect(born('male', 'hon', 2028)).toEqual([2004, 1987, 1968]);
    expect(born('female', 'hon', 2030)).toEqual([2012, 1998, 1994, 1970]);
  });

  it('labels birth years in which the era changed with both 和暦', () => {
    // 2026年に数え年38歳（女性・後厄）= 1989年生まれ
    const row37 = hayamiTable(2026, 'female')[2];
    expect(row37.ato.birthYear).toBe(1989);
    expect(row37.ato.wareki).toBe('昭和64年／平成元年');
  });
});

describe('lifetimeYakudoshi', () => {
  it('lists 9 entries for men in order', () => {
    const list = lifetimeYakudoshi(1986, 'male');
    expect(list.map((e) => e.kazoe)).toEqual([24, 25, 26, 41, 42, 43, 60, 61, 62]);
    expect(list.map((e) => e.year)).toEqual([2009, 2010, 2011, 2026, 2027, 2028, 2045, 2046, 2047]);
    expect(list.map((e) => e.kind)).toEqual(['mae', 'hon', 'ato', 'mae', 'hon', 'ato', 'mae', 'hon', 'ato']);
    expect(list.filter((e) => e.taiyaku).map((e) => e.kazoe)).toEqual([41, 42, 43]);
  });

  it('lists 12 entries for women; the 33 and 37 groups do not overlap', () => {
    const list = lifetimeYakudoshi(1995, 'female');
    expect(list.map((e) => e.kazoe)).toEqual([18, 19, 20, 32, 33, 34, 36, 37, 38, 60, 61, 62]);
    expect(list.map((e) => e.year)).toEqual([2012, 2013, 2014, 2026, 2027, 2028, 2030, 2031, 2032, 2054, 2055, 2056]);
    expect(new Set(list.map((e) => e.year)).size).toBe(12);
    expect(list.filter((e) => e.taiyaku).map((e) => e.kazoe)).toEqual([32, 33, 34]);
  });

  it('every entry satisfies 数え年 = year − birth year + 1', () => {
    for (const sex of ['male', 'female'] as const) {
      for (const e of lifetimeYakudoshi(1970, sex)) expect(kazoeAge(1970, e.year)).toBe(e.kazoe);
    }
  });

  it('returns nothing for a non-integer birth year', () => {
    expect(lifetimeYakudoshi(Number.NaN, 'male')).toEqual([]);
    expect(lifetimeYakudoshi(1986.5, 'female')).toEqual([]);
  });
});

describe('yakuStatus', () => {
  it('finds 前厄・本厄・後厄 around the 大厄', () => {
    expect(yakuStatus(1986, 'male', 2026)).toMatchObject({ kind: 'mae', kazoe: 41, honAge: 42, taiyaku: true });
    expect(yakuStatus(1986, 'male', 2027)).toMatchObject({ kind: 'hon', kazoe: 42, honAge: 42, taiyaku: true });
    expect(yakuStatus(1986, 'male', 2028)).toMatchObject({ kind: 'ato', kazoe: 43, honAge: 42, taiyaku: true });
    expect(yakuStatus(1995, 'female', 2027)).toMatchObject({ kind: 'hon', kazoe: 33, taiyaku: true });
  });

  it('is null in an ordinary year', () => {
    expect(yakuStatus(1986, 'male', 2029)).toBeNull();
    expect(yakuStatus(1990, 'male', 2027)).toBeNull();
    expect(yakuStatus(1986, 'male', 2027.5)).toBeNull();
  });

  it('depends on sex', () => {
    // 1986年生まれは2027年に数え年42歳: 男性は本厄、女性は厄年ではない
    expect(yakuStatus(1986, 'female', 2027)).toBeNull();
    // 1991年生まれは数え年37歳: 女性は本厄、男性は厄年ではない
    expect(yakuStatus(1991, 'female', 2027)).toMatchObject({ kind: 'hon', kazoe: 37, taiyaku: false });
    expect(yakuStatus(1991, 'male', 2027)).toBeNull();
    // 61歳は男女共通
    expect(yakuStatus(1967, 'male', 2027)).toMatchObject({ kind: 'hon', kazoe: 61 });
    expect(yakuStatus(1967, 'female', 2027)).toMatchObject({ kind: 'hon', kazoe: 61 });
  });

  it('agrees with the 早見表 for every offered year', () => {
    for (let year = YEAR_MIN; year <= YEAR_MAX; year++) {
      for (const sex of ['male', 'female'] as const) {
        for (const row of hayamiTable(year, sex)) {
          for (const cell of [row.mae, row.hon, row.ato]) {
            expect(yakuStatus(cell.birthYear, sex, year)).toMatchObject({ kind: cell.kind, kazoe: cell.kazoe, honAge: row.honAge });
          }
        }
      }
    }
  });
});

describe('nextYakudoshi', () => {
  it('returns the next entry after the year', () => {
    expect(nextYakudoshi(1990, 'male', 2027)).toMatchObject({ kind: 'mae', kazoe: 41, year: 2030 });
    expect(nextYakudoshi(1986, 'male', 2027)).toMatchObject({ kind: 'ato', kazoe: 43, year: 2028 });
    expect(nextYakudoshi(2010, 'female', 2027)).toMatchObject({ kind: 'hon', kazoe: 19, year: 2028 });
  });

  it('is null once the 後厄 at 62 has passed', () => {
    expect(nextYakudoshi(1965, 'male', 2026)).toBeNull();
    expect(nextYakudoshi(1965, 'male', 2025)).toMatchObject({ kind: 'ato', kazoe: 62, year: 2026 });
  });
});

describe('labels', () => {
  it('marks only the 本厄 as 大厄', () => {
    expect(kindText({ kind: 'hon', taiyaku: true })).toBe('本厄（大厄）');
    expect(kindText({ kind: 'hon', taiyaku: false })).toBe('本厄');
    expect(kindText({ kind: 'mae', taiyaku: true })).toBe('前厄');
    expect(kindText({ kind: 'ato', taiyaku: true })).toBe('後厄');
  });

  it('writes the year with its 和暦', () => {
    expect(yearLabel(2027)).toBe('2027年（令和9年）');
    expect(yearLabel(2019)).toBe('2019年（平成31年／令和元年）');
    expect(yearLabel(1986)).toBe('1986年（昭和61年）');
  });
});

import { describe, expect, it } from 'vitest';
import {
  adToWarekiYears,
  ageOn,
  ageTable,
  eraLastYear,
  eraOffset,
  etoOf,
  findEra,
  formatAdJa,
  formatAdSlash,
  fromWareki,
  gradeOn,
  isHayaumare,
  isYearInEra,
  parseDateInput,
  schoolYears,
  toWareki,
  warekiYearToAD,
  warekiYearsText,
} from './logic';

const era = (name: string) => {
  const e = findEra(name);
  if (!e) throw new Error(name);
  return e;
};

describe('eras', () => {
  it('uses the well-known offsets (西暦 = 和暦 + n)', () => {
    expect(eraOffset(era('令和'))).toBe(2018);
    expect(eraOffset(era('平成'))).toBe(1988);
    expect(eraOffset(era('昭和'))).toBe(1925);
    expect(eraOffset(era('大正'))).toBe(1911);
    expect(eraOffset(era('明治'))).toBe(1867);
  });

  it('knows the last year of each closed era', () => {
    expect(eraLastYear(era('明治'))).toBe(45);
    expect(eraLastYear(era('大正'))).toBe(15);
    expect(eraLastYear(era('昭和'))).toBe(64);
    expect(eraLastYear(era('平成'))).toBe(31);
    expect(eraLastYear(era('令和'))).toBeNull();
  });

  it('finds eras by kanji or letter', () => {
    expect(findEra('R')?.name).toBe('令和');
    expect(findEra('h')?.name).toBe('平成');
    expect(findEra('S')?.name).toBe('昭和');
    expect(findEra('X')).toBeUndefined();
  });

  it('converts 和暦 years to 西暦', () => {
    expect(warekiYearToAD(era('令和'), 8)).toBe(2026);
    expect(warekiYearToAD(era('令和'), 1)).toBe(2019);
    expect(warekiYearToAD(era('平成'), 31)).toBe(2019);
    expect(warekiYearToAD(era('昭和'), 64)).toBe(1989);
    expect(warekiYearToAD(era('大正'), 15)).toBe(1926);
    expect(warekiYearToAD(era('明治'), 45)).toBe(1912);
    // 平成換算 (beyond the era) still computes the year.
    expect(warekiYearToAD(era('平成'), 38)).toBe(2026);
    expect(warekiYearToAD(era('令和'), 0)).toBeNaN();
    expect(warekiYearToAD(era('令和'), 1.5)).toBeNaN();
  });

  it('checks whether a year exists in an era', () => {
    expect(isYearInEra(era('平成'), 31)).toBe(true);
    expect(isYearInEra(era('平成'), 32)).toBe(false);
    expect(isYearInEra(era('令和'), 99)).toBe(true);
    expect(isYearInEra(era('令和'), 0)).toBe(false);
  });

  it('lists both eras in a change year', () => {
    expect(warekiYearsText(2019)).toBe('平成31年／令和元年');
    expect(warekiYearsText(1989)).toBe('昭和64年／平成元年');
    expect(warekiYearsText(1926)).toBe('大正15年／昭和元年');
    expect(warekiYearsText(1912)).toBe('明治45年／大正元年');
    expect(warekiYearsText(2026)).toBe('令和8年');
    expect(warekiYearsText(1868)).toBe('明治元年');
    expect(warekiYearsText(1867)).toBe('—');
    expect(adToWarekiYears(2000).map((w) => w.label)).toEqual(['平成12年']);
  });
});

describe('toWareki (西暦 → 和暦)', () => {
  it('handles the 令和 change: 平成31年4月30日 / 令和元年5月1日', () => {
    expect(toWareki({ y: 2019, m: 4, d: 30 })?.label).toBe('平成31年4月30日');
    expect(toWareki({ y: 2019, m: 5, d: 1 })?.label).toBe('令和元年5月1日');
    expect(toWareki({ y: 2019, m: 5, d: 1 })?.short).toBe('R1.5.1');
  });

  it('handles the 平成 change: 昭和64年1月7日 / 平成元年1月8日', () => {
    expect(toWareki({ y: 1989, m: 1, d: 7 })?.label).toBe('昭和64年1月7日');
    expect(toWareki({ y: 1989, m: 1, d: 8 })?.label).toBe('平成元年1月8日');
    expect(toWareki({ y: 1989, m: 1, d: 8 })?.alt).toBeNull();
  });

  it('marks 改元当日 of 大正 and 昭和 with the old-era form', () => {
    const t = toWareki({ y: 1912, m: 7, d: 30 });
    expect(t?.label).toBe('大正元年7月30日');
    expect(t?.alt).toBe('明治45年7月30日');
    expect(toWareki({ y: 1912, m: 7, d: 29 })?.label).toBe('明治45年7月29日');
    const s = toWareki({ y: 1926, m: 12, d: 25 });
    expect(s?.label).toBe('昭和元年12月25日');
    expect(s?.alt).toBe('大正15年12月25日');
    expect(toWareki({ y: 1926, m: 12, d: 24 })?.label).toBe('大正15年12月24日');
  });

  it('converts ordinary dates', () => {
    expect(toWareki({ y: 2026, m: 10, d: 29 })?.label).toBe('令和8年10月29日');
    expect(toWareki({ y: 2026, m: 10, d: 29 })?.short).toBe('R8.10.29');
    expect(toWareki({ y: 2000, m: 1, d: 1 })?.label).toBe('平成12年1月1日');
    expect(toWareki({ y: 1964, m: 10, d: 10 })?.label).toBe('昭和39年10月10日');
    expect(toWareki({ y: 1873, m: 1, d: 1 })?.label).toBe('明治6年1月1日');
  });

  it('refuses dates before the Gregorian calendar was adopted, and invalid dates', () => {
    expect(toWareki({ y: 1872, m: 12, d: 31 })).toBeNull();
    expect(toWareki({ y: 2026, m: 2, d: 29 })).toBeNull();
  });
});

describe('fromWareki (和暦 → 西暦)', () => {
  it('converts valid dates', () => {
    const r = fromWareki(era('令和'), 8, 10, 29);
    expect(r?.date).toEqual({ y: 2026, m: 10, d: 29 });
    expect(r?.inEra).toBe(true);
    expect(fromWareki(era('平成'), 31, 4, 30)?.date).toEqual({ y: 2019, m: 4, d: 30 });
    expect(fromWareki(era('昭和'), 64, 1, 7)?.inEra).toBe(true);
  });

  it('flags dates outside the era and gives the correct 和暦', () => {
    const r = fromWareki(era('平成'), 31, 5, 1);
    expect(r?.date).toEqual({ y: 2019, m: 5, d: 1 });
    expect(r?.inEra).toBe(false);
    expect(r?.actual?.label).toBe('令和元年5月1日');

    const early = fromWareki(era('令和'), 1, 4, 1);
    expect(early?.inEra).toBe(false);
    expect(early?.actual?.label).toBe('平成31年4月1日');

    const h38 = fromWareki(era('平成'), 38, 10, 29);
    expect(h38?.date.y).toBe(2026);
    expect(h38?.inEra).toBe(false);
    expect(h38?.actual?.label).toBe('令和8年10月29日');

    expect(fromWareki(era('昭和'), 64, 1, 8)?.inEra).toBe(false);
  });

  it('returns null for impossible dates', () => {
    expect(fromWareki(era('令和'), 8, 2, 29)).toBeNull(); // 2026 is not a leap year
    expect(fromWareki(era('令和'), 6, 2, 29)?.date).toEqual({ y: 2024, m: 2, d: 29 });
    expect(fromWareki(era('令和'), 0, 1, 1)).toBeNull();
    expect(fromWareki(era('令和'), 8, 13, 1)).toBeNull();
  });
});

describe('parseDateInput', () => {
  it('reads 和暦 forms', () => {
    expect(parseDateInput('令和8年10月29日')).toMatchObject({ kind: 'wareki', year: 8, m: 10, d: 29 });
    expect(parseDateInput('令和元年5月1日')).toMatchObject({ kind: 'wareki', year: 1, m: 5, d: 1 });
    expect(parseDateInput('R8.10.29')).toMatchObject({ kind: 'wareki', year: 8 });
    expect(parseDateInput('h31/4/30')).toMatchObject({ kind: 'wareki', year: 31, m: 4, d: 30 });
    expect(parseDateInput('S64-1-7')).toMatchObject({ kind: 'wareki', year: 64, m: 1, d: 7 });
    expect(parseDateInput('Ｒ８．１０．２９')).toMatchObject({ kind: 'wareki', year: 8, m: 10, d: 29 });
    const p = parseDateInput('平成 31 年 4 月 30 日');
    expect(p?.kind === 'wareki' && p.era.name).toBe('平成');
  });

  it('reads 西暦 forms', () => {
    expect(parseDateInput('2026/10/29')).toEqual({ kind: 'ad', date: { y: 2026, m: 10, d: 29 } });
    expect(parseDateInput('2026-1-5')).toEqual({ kind: 'ad', date: { y: 2026, m: 1, d: 5 } });
    expect(parseDateInput('2026年10月29日')).toEqual({ kind: 'ad', date: { y: 2026, m: 10, d: 29 } });
    expect(parseDateInput('20261029')).toEqual({ kind: 'ad', date: { y: 2026, m: 10, d: 29 } });
    expect(parseDateInput('２０２６／１０／２９')).toEqual({ kind: 'ad', date: { y: 2026, m: 10, d: 29 } });
  });

  it('rejects garbage and impossible dates', () => {
    expect(parseDateInput('')).toBeNull();
    expect(parseDateInput('hello')).toBeNull();
    expect(parseDateInput('2026/2/30')).toBeNull();
    expect(parseDateInput('令和0年1月1日')).toBeNull();
    expect(parseDateInput('X8.1.1')).toBeNull();
  });
});

describe('干支', () => {
  it('matches known years', () => {
    expect(etoOf(2026)).toEqual({ kanshi: '丙午', reading: 'ひのえうま', branch: '午', branchReading: 'うま' });
    expect(etoOf(1966).kanshi).toBe('丙午');
    expect(etoOf(1984).kanshi).toBe('甲子');
    expect(etoOf(2027).kanshi).toBe('丁未');
    expect(etoOf(2024).kanshi).toBe('甲辰');
    expect(etoOf(2025).reading).toBe('きのとみ');
    expect(etoOf(1926).kanshi).toBe('丙寅');
    expect(etoOf(2000).branch).toBe('辰');
  });
});

describe('年齢・学年', () => {
  it('counts 満年齢 by birthday', () => {
    expect(ageOn({ y: 2000, m: 5, d: 10 }, { y: 2026, m: 5, d: 9 })).toBe(25);
    expect(ageOn({ y: 2000, m: 5, d: 10 }, { y: 2026, m: 5, d: 10 })).toBe(26);
    expect(ageOn({ y: 2026, m: 1, d: 1 }, { y: 2026, m: 10, d: 29 })).toBe(0);
  });

  it('treats 1/1–4/1 as 早生まれ', () => {
    expect(isHayaumare({ m: 4, d: 1 })).toBe(true);
    expect(isHayaumare({ m: 4, d: 2 })).toBe(false);
    expect(isHayaumare({ m: 1, d: 1 })).toBe(true);
    expect(isHayaumare({ m: 12, d: 31 })).toBe(false);
  });

  it('computes school years (born 2000-05-10: 小学校 2007, 高卒 2019, 大卒 2023)', () => {
    expect(schoolYears(2000)).toEqual({ elementary: 2007, juniorHigh: 2013, juniorHighGrad: 2016, highGrad: 2019, univGrad: 2023 });
    // 2001-03-01 (早生まれ) is in the same school year as 2000-05-10.
    expect(schoolYears(2001, true)).toEqual(schoolYears(2000));
  });

  it('gives the grade on a date', () => {
    // Born 2019-06-01 → entered 小学校 2026-04 → 小学1年生 on 2026-10-29.
    expect(gradeOn({ y: 2019, m: 6, d: 1 }, { y: 2026, m: 10, d: 29 })).toBe('小学1年生');
    // Born 2020-04-01 (早生まれ) → also enters 2026-04.
    expect(gradeOn({ y: 2020, m: 4, d: 1 }, { y: 2026, m: 10, d: 29 })).toBe('小学1年生');
    expect(gradeOn({ y: 2020, m: 4, d: 2 }, { y: 2026, m: 10, d: 29 })).toBe('未就学');
    // Jan–Mar still belongs to the previous school year.
    expect(gradeOn({ y: 2019, m: 6, d: 1 }, { y: 2027, m: 3, d: 31 })).toBe('小学1年生');
    expect(gradeOn({ y: 2019, m: 6, d: 1 }, { y: 2027, m: 4, d: 1 })).toBe('小学2年生');
    expect(gradeOn({ y: 2012, m: 8, d: 1 }, { y: 2026, m: 10, d: 29 })).toBe('中学2年生');
    expect(gradeOn({ y: 2009, m: 8, d: 1 }, { y: 2026, m: 10, d: 29 })).toBe('高校2年生');
    expect(gradeOn({ y: 2000, m: 8, d: 1 }, { y: 2026, m: 10, d: 29 })).toBeNull();
  });
});

describe('ageTable', () => {
  const rows = ageTable(2026);
  it('covers every year 2026 → 1926 newest first', () => {
    expect(rows).toHaveLength(101);
    expect(rows[0]).toMatchObject({ ad: 2026, wareki: '令和8年', age: 0 });
    expect(rows.at(-1)).toMatchObject({ ad: 1926, wareki: '大正15年／昭和元年', age: 100 });
  });
  it('has correct sample rows', () => {
    const r1989 = rows.find((r) => r.ad === 1989);
    expect(r1989).toMatchObject({ wareki: '昭和64年／平成元年', age: 37 });
    expect(r1989?.eto.kanshi).toBe('己巳');
    expect(rows.find((r) => r.ad === 2019)?.wareki).toBe('平成31年／令和元年');
  });
});

describe('formatting', () => {
  it('formats Japanese dates with the weekday', () => {
    expect(formatAdJa({ y: 2026, m: 10, d: 29 })).toBe('2026年10月29日（木）');
    expect(formatAdJa({ y: 2019, m: 5, d: 1 })).toBe('2019年5月1日（水）');
    expect(formatAdSlash({ y: 2026, m: 1, d: 5 })).toBe('2026/01/05');
  });
});

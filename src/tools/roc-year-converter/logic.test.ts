import { describe, expect, it } from 'vitest';
import {
  adToRoc,
  animalOf,
  eraLastYear,
  formatAdSlash,
  formatRocDate,
  formatRocSlash,
  ganzhiOf,
  japaneseDateLabel,
  japaneseToAD,
  japaneseYears,
  parseDateText,
  rocLabel,
  rocTable,
  rocToAD,
  yearInfo,
} from './logic';

describe('民國 ↔ 西元', () => {
  it('converts both ways', () => {
    expect(rocToAD(115)).toBe(2026);
    expect(adToRoc(2026)).toBe(115);
    expect(rocToAD(1)).toBe(1912);
    expect(adToRoc(1990)).toBe(79);
  });

  it('labels 民國元年 and 民前', () => {
    expect(rocLabel(2026)).toBe('民國 115 年');
    expect(rocLabel(1912)).toBe('民國元年');
    expect(rocLabel(1911)).toBe('民前 1 年');
    expect(rocLabel(1900)).toBe('民前 12 年');
  });
});

describe('干支 / 生肖', () => {
  it('matches known years', () => {
    expect(ganzhiOf(2026)).toBe('丙午');
    expect(animalOf(2026)).toBe('馬');
    expect(ganzhiOf(1984)).toBe('甲子');
    expect(ganzhiOf(1912)).toBe('壬子');
    expect(animalOf(1912)).toBe('鼠');
    expect(ganzhiOf(2044)).toBe('甲子');
  });
});

describe('和暦', () => {
  it('current and past eras', () => {
    expect(japaneseYears(2026)).toEqual(['令和 8 年']);
    expect(japaneseYears(2000)).toEqual(['平成 12 年']);
    expect(japaneseYears(1970)).toEqual(['昭和 45 年']);
    expect(japaneseYears(1800)).toEqual([]);
  });

  it('shows both eras in a change year', () => {
    expect(japaneseYears(2019)).toEqual(['平成 31 年', '令和元年']);
    expect(japaneseYears(1989)).toEqual(['昭和 64 年', '平成元年']);
    expect(japaneseYears(1926)).toEqual(['大正 15 年', '昭和元年']);
    expect(japaneseYears(1912)).toEqual(['明治 45 年', '大正元年']);
  });

  it('converts back to 西元 and rejects years past the era', () => {
    expect(japaneseToAD('令和', 8)).toBe(2026);
    expect(japaneseToAD('平成', 31)).toBe(2019);
    expect(japaneseToAD('平成', 32)).toBeNaN();
    expect(japaneseToAD('昭和', 64)).toBe(1989);
    expect(japaneseToAD('昭和', 0)).toBeNaN();
    expect(japaneseToAD('天平', 1)).toBeNaN();
    expect(eraLastYear('昭和')).toBe(64);
    expect(eraLastYear('令和')).toBeNull();
  });

  it('labels a precise date', () => {
    expect(japaneseDateLabel({ y: 2019, m: 4, d: 30 })).toBe('平成 31 年');
    expect(japaneseDateLabel({ y: 2019, m: 5, d: 1 })).toBe('令和元年');
    expect(japaneseDateLabel({ y: 1989, m: 1, d: 7 })).toBe('昭和 64 年');
    expect(japaneseDateLabel({ y: 1989, m: 1, d: 8 })).toBe('平成元年');
    expect(japaneseDateLabel({ y: 1800, m: 1, d: 1 })).toBeNull();
  });
});

describe('yearInfo / rocTable', () => {
  it('builds a row', () => {
    expect(yearInfo(1990, 2026)).toMatchObject({ roc: '民國 79 年', ganzhi: '庚午', animal: '馬', ageThisYear: 36, japanese: ['平成 2 年'] });
  });

  it('table runs from 民國 1 to N', () => {
    const rows = rocTable(130, 2026);
    expect(rows).toHaveLength(130);
    expect(rows[0].ad).toBe(1912);
    expect(rows[114]).toMatchObject({ ad: 2026, rocNumber: 115, ageThisYear: 0 });
    expect(rows[129].ad).toBe(2041);
  });
});

describe('parseDateText', () => {
  it('reads 民國 forms', () => {
    for (const s of ['115/10/29', '115.10.29', '115-10-29', '民國115年10月29日', '1151029', '１１５／１０／２９'.replace(/／/g, '/')]) {
      expect(parseDateText(s), s).toEqual({ date: { y: 2026, m: 10, d: 29 }, from: 'roc' });
    }
    expect(parseDateText('0991231')).toEqual({ date: { y: 2010, m: 12, d: 31 }, from: 'roc' });
    expect(parseDateText('79/1/5')).toEqual({ date: { y: 1990, m: 1, d: 5 }, from: 'roc' });
  });

  it('reads 西元 forms', () => {
    for (const s of ['2026/10/29', '2026-10-29', '20261029', '西元2026年10月29日', ' 2026.10.29 ']) {
      expect(parseDateText(s), s).toEqual({ date: { y: 2026, m: 10, d: 29 }, from: 'ad' });
    }
  });

  it('respects an explicit 民國 prefix on a short year and rejects bad dates', () => {
    expect(parseDateText('民國 9 年 2 月 29 日')).toEqual({ date: { y: 1920, m: 2, d: 29 }, from: 'roc' });
    expect(parseDateText('115/02/30')).toBeNull();
    expect(parseDateText('115/13/01')).toBeNull();
    expect(parseDateText('0/1/1')).toBeNull();
    expect(parseDateText('hello')).toBeNull();
    expect(parseDateText('')).toBeNull();
  });

  it('formats', () => {
    const d = { y: 2026, m: 3, d: 5 };
    expect(formatRocDate(d)).toBe('民國 115 年 3 月 5 日');
    expect(formatRocSlash(d)).toBe('115/03/05');
    expect(formatAdSlash(d)).toBe('2026/03/05');
  });
});

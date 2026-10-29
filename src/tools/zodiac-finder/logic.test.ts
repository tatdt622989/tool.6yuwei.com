import { describe, expect, it } from 'vitest';
import { constellationOf } from '../age-calculator/logic';
import i18n from './i18n';
import {
  animalForDate,
  animalYearTable,
  branchYearTable,
  chineseZodiacOf,
  etoOfDate,
  kanrekiYear,
  lookup,
  nextAnimalYear,
  signByTable,
  signByTerms,
  SIGNS,
  stemBranchOf,
  warekiOf,
} from './logic';

describe('signByTable', () => {
  it('matches the boundaries', () => {
    expect(signByTable(3, 21).name).toBe('牡羊座');
    expect(signByTable(3, 20).name).toBe('雙魚座');
    expect(signByTable(12, 22).name).toBe('摩羯座');
    expect(signByTable(1, 19).name).toBe('摩羯座');
    expect(signByTable(1, 20).name).toBe('水瓶座');
    expect(signByTable(2, 29).name).toBe('雙魚座');
  });

  it('agrees with the age calculator for every day of the year', () => {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; d++) {
        expect(signByTable(m, d).name, `${m}/${d}`).toBe(constellationOf(m, d));
      }
    }
  });

  it('ranges cover 366 days with no overlap', () => {
    const counts = new Map<string, number>();
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; d++) {
        const name = signByTable(m, d).name;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    expect(counts.size).toBe(12);
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(366);
  });
});

describe('signByTerms', () => {
  it('uses the actual 中氣 date of that year', () => {
    // 2026 春分 is 3/20, so 3/20/2026 is already 牡羊座 astronomically.
    expect(signByTerms({ y: 2026, m: 3, d: 20 }).name).toBe('牡羊座');
    expect(signByTerms({ y: 2026, m: 3, d: 19 }).name).toBe('雙魚座');
    // 2026 冬至 is 12/22.
    expect(signByTerms({ y: 2026, m: 12, d: 21 }).name).toBe('射手座');
    expect(signByTerms({ y: 2026, m: 12, d: 22 }).name).toBe('摩羯座');
    expect(signByTerms({ y: 2026, m: 1, d: 5 }).name).toBe('摩羯座');
  });

  it('falls back to the table outside 1900–2100', () => {
    expect(signByTerms({ y: 1800, m: 3, d: 20 }).name).toBe('雙魚座');
  });
});

describe('animalForDate', () => {
  it('switches at 春節, not 1/1', () => {
    const before = animalForDate({ y: 2026, m: 2, d: 16 })!;
    expect(before).toMatchObject({ animal: '蛇', naiveAnimal: '馬', lunarYear: 2025, ganzhi: '乙巳', beforeNewYear: true });
    const after = animalForDate({ y: 2026, m: 2, d: 17 })!;
    expect(after).toMatchObject({ animal: '馬', naiveAnimal: '馬', ganzhi: '丙午', element: '火', beforeNewYear: false });
    expect(animalForDate({ y: 1990, m: 1, d: 15 })).toMatchObject({ animal: '蛇', naiveAnimal: '馬' });
  });

  it('returns null outside the table', () => {
    expect(animalForDate({ y: 1900, m: 1, d: 1 })).toBeNull();
    expect(animalForDate({ y: 2101, m: 1, d: 1 })).toBeNull();
  });
});

describe('lookup', () => {
  it('combines sign, cusp and animal', () => {
    const r = lookup({ y: 1990, m: 10, d: 3 });
    expect(r.sign.name).toBe('天秤座');
    expect(r.termSign).toBeNull();
    expect(r.nearCusp).toBe(false);
    expect(r.animal?.animal).toBe('馬');
  });

  it('flags boundary days', () => {
    const r = lookup({ y: 2026, m: 3, d: 20 });
    expect(r.sign.name).toBe('雙魚座');
    expect(r.termSign?.name).toBe('牡羊座');
    expect(r.nearCusp).toBe(true);
    expect(lookup({ y: 2026, m: 3, d: 21 }).nearCusp).toBe(true);
  });
});

describe('tables', () => {
  it('has 12 signs with metadata', () => {
    expect(SIGNS).toHaveLength(12);
    expect(new Set(SIGNS.map((s) => s.element)).size).toBe(4);
  });

  it('animal year table', () => {
    const rows = animalYearTable(1924, 2031);
    expect(rows).toHaveLength(12);
    const horse = rows.find((r) => r.animal === '馬')!;
    expect(horse.years.map((y) => y.year)).toEqual([1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026]);
    expect(horse.years.at(-1)).toMatchObject({ ganzhi: '丙午', newYear: { y: 2026, m: 2, d: 17 } });
  });
});

describe('stemBranchOf', () => {
  it('cycles through the 60 combinations', () => {
    expect(stemBranchOf(1984)).toMatchObject({ ganzhi: '甲子', stemIndex: 0, branchIndex: 0, element: '木', yang: true });
    expect(stemBranchOf(2026)).toMatchObject({ ganzhi: '丙午', element: '火', yang: true });
    expect(stemBranchOf(2027)).toMatchObject({ ganzhi: '丁未', element: '火', yang: false });
    expect(stemBranchOf(1990).ganzhi).toBe('庚午');
    expect(stemBranchOf(1966).ganzhi).toBe('丙午');
    expect(stemBranchOf(1924 + 60).ganzhi).toBe(stemBranchOf(1924).ganzhi);
  });
});

describe('Japanese 干支 vs Chinese zodiac boundary', () => {
  it('ja switches on 1 January', () => {
    expect(etoOfDate({ y: 2026, m: 1, d: 1 }).ganzhi).toBe('丙午');
    expect(etoOfDate({ y: 2026, m: 2, d: 1 }).ganzhi).toBe('丙午');
    expect(etoOfDate({ y: 2025, m: 12, d: 31 }).ganzhi).toBe('乙巳');
  });

  it('en switches at Lunar New Year (2026-02-17)', () => {
    expect(chineseZodiacOf({ y: 2026, m: 2, d: 1 })).toMatchObject({ animal: '蛇', ganzhi: '乙巳', lunarYear: 2025, beforeNewYear: true });
    expect(chineseZodiacOf({ y: 2026, m: 2, d: 17 })).toMatchObject({ animal: '馬', ganzhi: '丙午', beforeNewYear: false, yang: true });
    expect(chineseZodiacOf({ y: 1995, m: 1, d: 20 })).toMatchObject({ animal: '狗', element: '木', yang: true, branchIndex: 10 });
    expect(chineseZodiacOf({ y: 1900, m: 1, d: 1 })).toBeNull();
  });

  it('en animal names line up with the branch order', () => {
    const z = chineseZodiacOf({ y: 1995, m: 8, d: 15 })!;
    expect(i18n.en!.client.chinese!.animals[z.branchIndex]).toBe('Pig');
    expect(i18n.ja!.client.eto!.animals[stemBranchOf(2031).branchIndex]).toBe('イノシシ');
  });
});

describe('年女・年男 and 還暦', () => {
  it('finds the next year with the same 十二支', () => {
    expect(nextAnimalYear(1990, 2026)).toEqual({ year: 2026, age: 36 });
    expect(nextAnimalYear(1990, 2027)).toEqual({ year: 2038, age: 48 });
    expect(nextAnimalYear(2026, 2026)).toEqual({ year: 2038, age: 12 });
    expect(nextAnimalYear(2030, 2026)).toEqual({ year: 2042, age: 12 });
  });

  it('puts 還暦 sixty years later with the same 干支', () => {
    expect(kanrekiYear(1966)).toBe(2026);
    expect(stemBranchOf(kanrekiYear(1966)).ganzhi).toBe(stemBranchOf(1966).ganzhi);
  });
});

describe('warekiOf', () => {
  it('names the era year and both eras in a change year', () => {
    expect(warekiOf(1990)).toEqual(['平成2年']);
    expect(warekiOf(1989)).toEqual(['昭和64年', '平成元年']);
    expect(warekiOf(2019)).toEqual(['平成31年', '令和元年']);
    expect(warekiOf(2026)).toEqual(['令和8年']);
    expect(warekiOf(1926)).toEqual(['大正15年', '昭和元年']);
    expect(warekiOf(1912)).toEqual(['明治45年', '大正元年']);
    expect(warekiOf(1900)).toEqual(['明治33年']);
    expect(warekiOf(1800)).toEqual([]);
  });
});

describe('branchYearTable', () => {
  it('lists Gregorian years per 十二支', () => {
    const rows = branchYearTable(1924, 2031);
    expect(rows).toHaveLength(12);
    expect(rows[6].years.map((y) => y.year)).toContain(2026);
    expect(rows[6].years.find((y) => y.year === 2026)!.ganzhi).toBe('丙午');
    expect(rows[0].years[0]).toEqual({ year: 1924, ganzhi: '甲子' });
  });
});

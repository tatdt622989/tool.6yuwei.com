import { describe, expect, it } from 'vitest';
import { constellationOf } from '../age-calculator/logic';
import { animalForDate, animalYearTable, lookup, signByTable, signByTerms, SIGNS } from './logic';

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

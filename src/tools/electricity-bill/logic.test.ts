import { describe, expect, it } from 'vitest';
import {
  addDays,
  applianceKwh,
  calculateBill,
  incrementalCost,
  isSummer,
  parseISODate,
  seasonBill,
  seasonDays,
  TARIFFS,
  toISODate,
  validateBill,
  type BillInput,
} from './logic';

const summerMonth: BillInput = { kwh: 400, customer: 'residential', months: 1, summerDays: 31, nonSummerDays: 0 };
const winter2: BillInput = { kwh: 700, customer: 'residential', months: 2, summerDays: 0, nonSummerDays: 61 };
const bill = (patch: Partial<BillInput>, base = winter2) => calculateBill({ ...base, ...patch })!;

describe('tariff tables', () => {
  it('match the 2025-10-01 台電 電價表', () => {
    expect(TARIFFS.residential.tiers.map((t) => t.summer)).toEqual([1.78, 2.55, 3.8, 5.14, 6.44, 8.86]);
    expect(TARIFFS.residential.tiers.map((t) => t.nonSummer)).toEqual([1.78, 2.26, 3.13, 4.24, 5.27, 7.03]);
    expect(TARIFFS.residential.tiers.map((t) => t.upTo)).toEqual([120, 330, 500, 700, 1000, Infinity]);
    expect(TARIFFS.business.tiers.map((t) => t.summer)).toEqual([2.71, 3.76, 4.46, 7.08, 7.43]);
    expect(TARIFFS.business.tiers.map((t) => t.nonSummer)).toEqual([2.28, 3.1, 3.61, 5.56, 5.83]);
  });
});

describe('台電官方計算範例', () => {
  it('住宅 8 月用電 400 度 = 1,015 元', () => {
    expect(calculateBill(summerMonth)!.total).toBe(1015);
  });
  it('非營業 8 月用電 800 度 = 3,067 元', () => {
    expect(bill({ kwh: 800 }, summerMonth).total).toBe(3067);
  });
  it('營業用 8 月用電 1,800 度 = 7,978 元', () => {
    expect(bill({ kwh: 1800, customer: 'business' }, summerMonth).total).toBe(7978);
  });
  it('跨季 9/13–11/11、350 度：依 18/60 與 42/60 加權', () => {
    const days = seasonDays({ y: 2026, m: 9, d: 13 }, { y: 2026, m: 11, d: 11 })!;
    expect(days).toEqual({ summerDays: 18, nonSummerDays: 42 });
    const r = bill({ kwh: 350, ...days });
    const expected = (1.78 * 240 + 2.55 * 110) * (18 / 60) + (1.78 * 240 + 2.26 * 110) * (42 / 60);
    expect(r.exact).toBeCloseTo(expected, 9);
    expect(r.total).toBe(685);
    expect(r.summerShare).toBeCloseTo(0.3, 12);
  });
});

describe('seasonBill', () => {
  it('doubles the tier boundaries for bi-monthly bills', () => {
    const b = seasonBill(700, 'residential', 2, 'nonSummer');
    expect(b.rows.map((r) => [r.from, r.to, r.kwh, r.price])).toEqual([
      [0, 240, 240, 1.78],
      [240, 660, 420, 2.26],
      [660, 1000, 40, 3.13],
    ]);
    expect(b.amount).toBeCloseTo(1501.6, 9);
  });
  it('stops at the exact boundary', () => {
    expect(seasonBill(120, 'residential', 1, 'summer').rows).toHaveLength(1);
    expect(seasonBill(0, 'residential', 1, 'summer').rows).toHaveLength(0);
  });
  it('uses the top tier above 1,000 / 2,000 kWh', () => {
    const b = seasonBill(2500, 'residential', 2, 'summer');
    expect(b.rows[b.rows.length - 1]).toMatchObject({ from: 2000, kwh: 500, price: 8.86 });
  });
});

describe('calculateBill', () => {
  it('2 個月非夏月 700 度 = 1,502 元，平均每度約 2.15 元', () => {
    const r = bill({});
    expect(r.total).toBe(1502);
    expect(r.average).toBeCloseTo(2.145, 3);
    expect(r.marginalPrice).toBe(3.13);
    expect(r.summer).toBeNull();
  });
  it('2 個月夏月 900 度 = 2,410 元', () => {
    expect(bill({ kwh: 900, summerDays: 61, nonSummerDays: 0 }).total).toBe(2410);
  });
  it('1 個月 vs 2 個月：same kWh costs more on a 1-month bill', () => {
    expect(bill({ kwh: 700, months: 1 }).total).toBeGreaterThan(bill({ kwh: 700 }).total);
  });
  it('zero usage costs nothing', () => {
    const r = bill({ kwh: 0 });
    expect(r.total).toBe(0);
    expect(r.average).toBe(0);
    expect(r.marginalPrice).toBe(1.78);
  });
  it('rejects invalid input', () => {
    expect(validateBill({ ...winter2, kwh: -1 })).not.toBeNull();
    expect(validateBill({ ...winter2, kwh: Number.NaN })).not.toBeNull();
    expect(validateBill({ ...winter2, summerDays: 0, nonSummerDays: 0 })).not.toBeNull();
    expect(calculateBill({ ...winter2, kwh: -5 })).toBeNull();
  });
});

describe('seasonDays', () => {
  it('counts inclusive days on each side of 6/1 and 10/1', () => {
    expect(seasonDays({ y: 2026, m: 5, d: 20 }, { y: 2026, m: 7, d: 19 })).toEqual({ summerDays: 49, nonSummerDays: 12 });
    expect(seasonDays({ y: 2026, m: 7, d: 1 }, { y: 2026, m: 8, d: 31 })).toEqual({ summerDays: 62, nonSummerDays: 0 });
    expect(seasonDays({ y: 2026, m: 12, d: 1 }, { y: 2027, m: 1, d: 31 })).toEqual({ summerDays: 0, nonSummerDays: 62 });
  });
  it('rejects reversed ranges', () => {
    expect(seasonDays({ y: 2026, m: 9, d: 1 }, { y: 2026, m: 8, d: 1 })).toBeNull();
  });
  it('isSummer', () => {
    expect(isSummer({ y: 2026, m: 6, d: 1 })).toBe(true);
    expect(isSummer({ y: 2026, m: 9, d: 30 })).toBe(true);
    expect(isSummer({ y: 2026, m: 10, d: 1 })).toBe(false);
  });
});

describe('appliances', () => {
  it('電暖器 1,200 W 開 1 小時 = 1.2 度', () => {
    expect(applianceKwh(1200, 1, 1)).toBe(1.2);
    expect(applianceKwh(1200, 8, 30)).toBe(288);
    expect(applianceKwh(250, 8, 30, 2)).toBe(120);
    expect(applianceKwh(-1, 1, 1)).toBeNaN();
  });
  it('incremental cost follows the progressive tiers', () => {
    // 冬季兩個月已用 600 度，再加電暖器 288 度：1,241 → 2,090，多 849 元
    const base = { ...winter2, kwh: 600 };
    expect(calculateBill(base)!.total).toBe(1241);
    expect(calculateBill({ ...base, kwh: 888 })!.total).toBe(2090);
    expect(incrementalCost(base, 288)).toBeCloseTo(849.24, 6);
    // 用電量很少時，邊際成本就是第一段 1.78 元
    expect(incrementalCost({ ...winter2, kwh: 0 }, 10)).toBeCloseTo(17.8, 9);
  });
});

describe('date helpers', () => {
  it('parses and formats ISO dates', () => {
    expect(parseISODate('2026-09-13')).toEqual({ y: 2026, m: 9, d: 13 });
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(parseISODate('')).toBeNull();
    expect(toISODate(addDays({ y: 2026, m: 10, d: 29 }, -59))).toBe('2026-08-31');
  });
});

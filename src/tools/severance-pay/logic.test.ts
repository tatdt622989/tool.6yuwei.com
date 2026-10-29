import { describe, expect, it } from 'vitest';
import {
  addDays,
  averageFromSix,
  calculateSeverance,
  formatService,
  newSystemMonths,
  newSystemMonthsUncapped,
  noticeDays,
  oldSystemMonths,
  serviceBetween,
  validateSeverance,
  type SeveranceInput,
  type YMD,
} from './logic';

const d = (s: string): YMD => {
  const [y, m, day] = s.split('-').map(Number);
  return { y, m, d: day };
};

const base: SeveranceInput = {
  start: d('2020-01-01'),
  end: d('2023-07-15'),
  scheme: 'mixed',
  switchDate: d('2005-07-01'),
  averageWage: 30_000,
  lastMonthWage: 30_000,
  reason: 'employer',
  noticeGivenDays: 0,
};

describe('serviceBetween', () => {
  it('3 年 6 個月 15 天', () => {
    expect(serviceBetween(d('2020-01-01'), d('2023-07-16'))).toEqual({ years: 3, months: 6, days: 15 });
  });
  it('整年', () => {
    expect(serviceBetween(d('2020-01-01'), d('2023-01-01'))).toEqual({ years: 3, months: 0, days: 0 });
  });
  it('月底到職：1/31 + 1 個月 = 2/29（閏年）', () => {
    expect(serviceBetween(d('2024-01-31'), d('2024-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
  });
  it('反向或同日為 0', () => {
    expect(serviceBetween(d('2024-05-01'), d('2024-05-01'))).toEqual({ years: 0, months: 0, days: 0 });
    expect(serviceBetween(d('2024-05-02'), d('2024-05-01'))).toEqual({ years: 0, months: 0, days: 0 });
  });
});

describe('基數計算（勞動部例：年資 3 年 6 個月 15 天）', () => {
  const s = { years: 3, months: 6, days: 15 };
  it('舊制：3 + (6 + 1) / 12，未滿 1 個月以 1 個月計', () => {
    expect(oldSystemMonths(s)).toBeCloseTo(3 + 7 / 12, 10);
  });
  it('新制：1/2 × [3 + (6 + 15/30) / 12]', () => {
    expect(newSystemMonths(s)).toBeCloseTo(0.5 * (3 + 6.5 / 12), 10);
  });
  it('新制上限 6 個月（滿 12 年即達上限）', () => {
    expect(newSystemMonths({ years: 12, months: 0, days: 0 })).toBe(6);
    expect(newSystemMonths({ years: 20, months: 3, days: 0 })).toBe(6);
    expect(newSystemMonthsUncapped({ years: 20, months: 0, days: 0 })).toBe(10);
  });
  it('舊制畸零 11 個月又幾天進位為整年', () => {
    expect(oldSystemMonths({ years: 2, months: 11, days: 3 })).toBe(3);
  });
  it('未滿 1 個月：舊制以 1 個月計，新制以日數 ÷ 30', () => {
    expect(oldSystemMonths({ years: 0, months: 0, days: 10 })).toBeCloseTo(1 / 12, 10);
    expect(newSystemMonths({ years: 0, months: 0, days: 10 })).toBeCloseTo((10 / 30 / 12) / 2, 10);
  });
});

describe('noticeDays（勞基法第 16 條）', () => {
  it('依繼續工作期間', () => {
    expect(noticeDays({ years: 0, months: 2, days: 29 })).toBe(0);
    expect(noticeDays({ years: 0, months: 3, days: 0 })).toBe(10);
    expect(noticeDays({ years: 0, months: 11, days: 30 })).toBe(10);
    expect(noticeDays({ years: 1, months: 0, days: 0 })).toBe(20);
    expect(noticeDays({ years: 2, months: 11, days: 30 })).toBe(20);
    expect(noticeDays({ years: 3, months: 0, days: 0 })).toBe(30);
    expect(noticeDays({ years: 25, months: 0, days: 0 })).toBe(30);
  });
});

describe('calculateSeverance', () => {
  it('勞動部新制例：平均工資 30,000、3 年 6 個月 15 天 ≈ 53,125 元', () => {
    const r = calculateSeverance(base)!;
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0].system).toBe('new');
    expect(r.segments[0].service).toEqual({ years: 3, months: 6, days: 15 });
    expect(r.severance).toBe(53_125);
    expect(r.noticeRequired).toBe(30);
  });
  it('勞動部舊制例：全程舊制 3 年 6 個月 15 天 ≈ 107,500 元', () => {
    const r = calculateSeverance({ ...base, start: d('1995-01-01'), end: d('1998-07-15'), scheme: 'old' })!;
    expect(r.segments[0].system).toBe('old');
    expect(r.severance).toBe(107_500);
  });
  it('新舊制併計：舊制 5 年 4 個月 + 新制 20 年（上限 6 個月）', () => {
    const r = calculateSeverance({
      ...base,
      start: d('2000-03-01'),
      end: d('2025-06-30'),
      averageWage: 40_000,
      lastMonthWage: 40_000,
    })!;
    expect(r.segments.map((s) => s.system)).toEqual(['old', 'new']);
    expect(r.segments[0].service).toEqual({ years: 5, months: 4, days: 0 });
    expect(r.segments[0].amount).toBe(213_333);
    expect(r.segments[1].service).toEqual({ years: 20, months: 0, days: 0 });
    expect(r.segments[1].capped).toBe(true);
    expect(r.segments[1].amount).toBe(240_000);
    expect(r.severance).toBe(453_333);
    expect(r.totalService).toEqual({ years: 25, months: 4, days: 0 });
  });
  it('舊制年資已結清：只計改選日之後的新制年資', () => {
    const r = calculateSeverance({
      ...base,
      start: d('2000-03-01'),
      end: d('2010-06-30'),
      scheme: 'settled',
      switchDate: d('2006-07-01'),
    })!;
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0].service).toEqual({ years: 4, months: 0, days: 0 });
    expect(r.severance).toBe(60_000);
  });
  it('改選日晚於離職日視為全程舊制', () => {
    const r = calculateSeverance({
      ...base,
      start: d('2004-01-01'),
      end: d('2005-12-31'),
      switchDate: d('2008-01-01'),
    })!;
    expect(r.segments.map((s) => s.system)).toEqual(['old']);
    expect(r.severance).toBe(60_000);
  });
  it('2005-07-01 以後到職一律新制，忽略制度選項', () => {
    const r = calculateSeverance({ ...base, scheme: 'old' })!;
    expect(r.segments[0].system).toBe('new');
  });
  it('預告工資：月薪 30,000、年資 2 年 6 個月，應預告 20 日 → 20,000 元', () => {
    const r = calculateSeverance({ ...base, start: d('2023-01-01'), end: d('2025-06-30'), averageWage: 29_000 })!;
    expect(r.noticeRequired).toBe(20);
    expect(r.dailyWage).toBe(1_000);
    expect(r.noticePay).toBe(20_000);
  });
  it('平均工資（日）高於月薪 ÷ 30 時，以平均工資計（勞動部例：日平均 1,100 元 → 22,000 元）', () => {
    // 2025-01-01 ~ 2025-06-30 共 181 天；6 個月工資總額 199,100 → 日平均 1,100。
    const r = calculateSeverance({
      ...base,
      start: d('2023-01-01'),
      end: d('2025-06-30'),
      averageWage: 199_100 / 6,
    })!;
    expect(r.dailyAverage).toBeCloseTo(1_100, 6);
    expect(r.noticePay).toBe(22_000);
  });
  it('已預告部分日數，只補差額', () => {
    const r = calculateSeverance({ ...base, noticeGivenDays: 12 })!;
    expect(r.noticeOwed).toBe(18);
    expect(r.noticePay).toBe(18_000);
    expect(calculateSeverance({ ...base, noticeGivenDays: 45 })!.noticePay).toBe(0);
  });
  it('勞工依第 14 條終止：有資遣費、無預告工資', () => {
    const r = calculateSeverance({ ...base, reason: 'worker14' })!;
    expect(r.severance).toBe(53_125);
    expect(r.noticeRequired).toBe(0);
    expect(r.noticePay).toBe(0);
    expect(r.total).toBe(53_125);
  });
  it('未滿 3 個月：資遣費按比例、免預告', () => {
    const r = calculateSeverance({ ...base, start: d('2026-08-01'), end: d('2026-09-15') })!;
    // 1 個月 15 天 → 1/2 × (1.5/12) × 30,000 = 1,875
    expect(r.severance).toBe(1_875);
    expect(r.noticeRequired).toBe(0);
  });
  it('同一天到職離職算 1 天', () => {
    const r = calculateSeverance({ ...base, start: d('2026-08-01'), end: d('2026-08-01') })!;
    expect(r.totalService).toEqual({ years: 0, months: 0, days: 1 });
    expect(r.severance).toBe(42);
  });
});

describe('helpers', () => {
  it('averageFromSix', () => {
    expect(averageFromSix([30_000, 30_000, 32_000, 30_000, 34_000, 30_000])).toBe(31_000);
  });
  it('addDays 跨月', () => {
    expect(addDays(d('2024-02-28'), 2)).toEqual(d('2024-03-01'));
    expect(addDays(d('2025-01-01'), -1)).toEqual(d('2024-12-31'));
  });
  it('formatService', () => {
    expect(formatService({ years: 3, months: 6, days: 15 })).toBe('3 年 6 個月 15 天');
    expect(formatService({ years: 2, months: 0, days: 0 })).toBe('2 年');
    expect(formatService({ years: 0, months: 0, days: 0 })).toBe('0 天');
  });
});

describe('validateSeverance', () => {
  it('rejects bad input', () => {
    expect(validateSeverance({ ...base, end: d('2019-12-31') })).not.toBeNull();
    expect(validateSeverance({ ...base, averageWage: 0 })).not.toBeNull();
    expect(validateSeverance({ ...base, averageWage: Number.NaN })).not.toBeNull();
    expect(validateSeverance({ ...base, noticeGivenDays: 1.5 })).not.toBeNull();
    expect(validateSeverance({ ...base, lastMonthWage: -1 })).not.toBeNull();
    expect(
      validateSeverance({ ...base, start: d('2000-01-01'), switchDate: d('2011-01-01') }),
    ).not.toBeNull();
  });
  it('全程舊制不檢查改選日', () => {
    expect(
      validateSeverance({ ...base, start: d('2000-01-01'), scheme: 'old', switchDate: d('2011-01-01') }),
    ).toBeNull();
  });
});

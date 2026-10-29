import { describe, expect, it } from 'vitest';
import { baseDays, moveInPeriod, moveOutPeriod, prorateAmount, proratePeriod, prorateSalary, roundYen } from './logic';

const opts = (basis: '30' | 'calendar' | '365', rounding: 'floor' | 'round' | 'ceil' = 'floor', roundDailyFirst = false) => ({
  basis,
  rounding,
  roundDailyFirst,
});

describe('roundYen', () => {
  it('rounds whole yen three ways', () => {
    expect(roundYen(30967.74, 'floor')).toBe(30967);
    expect(roundYen(30967.74, 'round')).toBe(30968);
    expect(roundYen(30967.24, 'ceil')).toBe(30968);
    expect(roundYen(30967.5, 'round')).toBe(30968);
  });
  it('ignores floating noise', () => {
    expect(roundYen(32000.000000001, 'ceil')).toBe(32000);
    expect(roundYen(31999.9999999, 'floor')).toBe(32000);
  });
});

describe('baseDays', () => {
  it('uses the right base per basis', () => {
    expect(baseDays('calendar', 2026, 2)).toBe(28);
    expect(baseDays('calendar', 2028, 2)).toBe(29);
    expect(baseDays('calendar', 2026, 10)).toBe(31);
    expect(baseDays('30', 2026, 2)).toBe(30);
    expect(baseDays('365', 2026, 2)).toBe(365);
  });
});

describe('家賃の日割り（入居）', () => {
  // 家賃 80,000円、2026年10月20日入居 → 10/20〜10/31 の12日分
  const p = moveInPeriod({ y: 2026, m: 10, d: 20 });

  it('calendar basis: 80,000 × 12 ÷ 31 = 30,967.74…', () => {
    const r = proratePeriod(80_000, p.start, p.end, opts('calendar', 'floor'));
    expect(r?.totalDays).toBe(12);
    expect(r?.total).toBe(30_967);
    expect(proratePeriod(80_000, p.start, p.end, opts('calendar', 'round'))?.total).toBe(30_968);
    expect(proratePeriod(80_000, p.start, p.end, opts('calendar', 'ceil'))?.total).toBe(30_968);
  });

  it('30-day basis: 80,000 × 12 ÷ 30 = 32,000', () => {
    expect(proratePeriod(80_000, p.start, p.end, opts('30'))?.total).toBe(32_000);
  });

  it('365-day basis: 80,000 × 12 × 12 ÷ 365 = 31,561.64…', () => {
    expect(proratePeriod(80_000, p.start, p.end, opts('365'))?.total).toBe(31_561);
  });

  it('daily rate rounded first: floor(80,000 ÷ 31) = 2,580 × 12 = 30,960', () => {
    const r = proratePeriod(80_000, p.start, p.end, opts('calendar', 'floor', true));
    expect(r?.parts[0].daily).toBe(2580);
    expect(r?.total).toBe(30_960);
  });

  it('February: 2026-02-15 move-in, 14 days of 28 = half the rent', () => {
    const f = moveInPeriod({ y: 2026, m: 2, d: 15 });
    expect(proratePeriod(80_000, f.start, f.end, opts('calendar'))?.total).toBe(40_000);
    // 30-day basis: 80,000 × 14 ÷ 30 = 37,333.33…
    expect(proratePeriod(80_000, f.start, f.end, opts('30'))?.total).toBe(37_333);
  });

  it('move-in on the 1st is a full month', () => {
    const f = moveInPeriod({ y: 2026, m: 11, d: 1 });
    const r = proratePeriod(80_000, f.start, f.end, opts('30'));
    expect(r?.parts[0].full).toBe(true);
    expect(r?.total).toBe(80_000);
  });
});

describe('家賃の日割り（退去）', () => {
  it('2027-03-15 move-out: 15 days of 31', () => {
    const p = moveOutPeriod({ y: 2027, m: 3, d: 15 });
    expect(p.start).toEqual({ y: 2027, m: 3, d: 1 });
    // 80,000 × 15 ÷ 31 = 38,709.67…
    expect(proratePeriod(80_000, p.start, p.end, opts('calendar'))?.total).toBe(38_709);
    expect(proratePeriod(80_000, p.start, p.end, opts('calendar', 'round'))?.total).toBe(38_710);
    expect(proratePeriod(80_000, p.start, p.end, opts('30'))?.total).toBe(40_000);
  });
});

describe('periods across months', () => {
  it('splits into partial + full + partial months', () => {
    // 2026-10-20 〜 2026-12-10, 家賃 90,000
    const r = proratePeriod(90_000, { y: 2026, m: 10, d: 20 }, { y: 2026, m: 12, d: 10 }, opts('calendar'));
    expect(r?.parts.map((x) => [x.m, x.days, x.full, x.amount])).toEqual([
      [10, 12, false, 34_838], // 90,000 × 12 ÷ 31 = 34,838.70…
      [11, 30, true, 90_000],
      [12, 10, false, 29_032], // 90,000 × 10 ÷ 31 = 29,032.25…
    ]);
    expect(r?.totalDays).toBe(52);
    expect(r?.total).toBe(153_870);
  });

  it('crosses a year boundary', () => {
    const r = proratePeriod(60_000, { y: 2026, m: 12, d: 16 }, { y: 2027, m: 1, d: 15 }, opts('30'));
    expect(r?.parts.map((x) => [x.y, x.m, x.days, x.amount])).toEqual([
      [2026, 12, 16, 32_000],
      [2027, 1, 15, 30_000],
    ]);
  });

  it('rejects bad input', () => {
    expect(proratePeriod(80_000, { y: 2026, m: 10, d: 20 }, { y: 2026, m: 10, d: 19 }, opts('30'))).toBeNull();
    expect(proratePeriod(80_000, { y: 2026, m: 2, d: 30 }, { y: 2026, m: 3, d: 1 }, opts('30'))).toBeNull();
    expect(proratePeriod(-1, { y: 2026, m: 1, d: 1 }, { y: 2026, m: 1, d: 2 }, opts('30'))).toBeNull();
  });
});

describe('prorateAmount', () => {
  it('returns the unrounded daily rate', () => {
    const r = prorateAmount(80_000, 12, 31, 'calendar', opts('calendar'));
    expect(r.daily).toBeCloseTo(2580.645, 3);
    expect(r.amount).toBe(30_967);
  });
});

describe('給与の日割り', () => {
  it('calendar days: 月給 300,000、10月に20日在籍 → 300,000 × 20 ÷ 31 = 193,548.38…', () => {
    expect(prorateSalary(300_000, 20, 31, 'floor')).toBe(193_548);
  });
  it('scheduled workdays: 月給 300,000、所定21日のうち15日出勤 → 214,285.71…', () => {
    expect(prorateSalary(300_000, 15, 21, 'floor')).toBe(214_285);
    expect(prorateSalary(300_000, 15, 21, 'round')).toBe(214_286);
  });
  it('monthly average workdays (20.5)', () => {
    // 300,000 × 10 ÷ 20.5 = 146,341.46…
    expect(prorateSalary(300_000, 10, 20.5, 'floor')).toBe(146_341);
  });
  it('rejects days over the base or a zero base', () => {
    expect(prorateSalary(300_000, 22, 21, 'floor')).toBeNull();
    expect(prorateSalary(300_000, 1, 0, 'floor')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { monthlyAnnuity, PENSION_DEFAULTS, projectPension, validatePension, type PensionInput } from './logic';

const base: PensionInput = {
  currentAge: 30,
  retireAge: 65,
  salary: 40_000,
  balance: 0,
  pastYears: 0,
  employerPct: 6,
  selfPct: 0,
  returnPct: 0,
  salaryGrowthPct: 0,
  lifeExpectancyYears: 23,
  annuityRatePct: 1.1473,
};

describe('monthlyAnnuity', () => {
  it('matches the 勞保局 example: 100 萬, 23 年, 1.1473% ≈ 4,117 元', () => {
    expect(monthlyAnnuity(1_000_000, 23, 1.1473)).toBeGreaterThan(4110);
    expect(monthlyAnnuity(1_000_000, 23, 1.1473)).toBeLessThan(4122);
  });
  it('splits evenly at 0%', () => {
    expect(monthlyAnnuity(276_000, 23, 0)).toBeCloseTo(1000, 6);
  });
  it('returns 0 for empty balances', () => {
    expect(monthlyAnnuity(0, 23, 1)).toBe(0);
  });
});

describe('projectPension', () => {
  it('without returns the balance equals contributions (月提繳工資 40,100 × 6%)', () => {
    const r = projectPension(base)!;
    expect(r.years).toBe(35);
    expect(r.rows).toHaveLength(35);
    expect(r.totalContribution).toBe(2406 * 12 * 35);
    expect(r.finalBalance).toBeCloseTo(2406 * 12 * 35, 6);
    expect(r.totalEarnings).toBe(0);
  });
  it('adds self contributions', () => {
    const r = projectPension({ ...base, selfPct: 6 })!;
    expect(r.selfContribution).toBe(2406 * 12 * 35);
    expect(r.totalContribution).toBe(2406 * 2 * 12 * 35);
  });
  it('compounds returns and grows salary', () => {
    const flat = projectPension({ ...base, returnPct: 3 })!;
    expect(flat.totalEarnings).toBeGreaterThan(0);
    expect(flat.finalBalance).toBeCloseTo(flat.totalContribution + flat.totalEarnings, 4);
    const growing = projectPension({ ...base, returnPct: 3, salaryGrowthPct: 2 })!;
    expect(growing.finalBalance).toBeGreaterThan(flat.finalBalance);
    expect(growing.rows.at(-1)!.wage).toBeGreaterThan(40_100);
  });
  it('caps the wage at 150,000', () => {
    const r = projectPension({ ...base, salary: 400_000, retireAge: 61, currentAge: 60 })!;
    expect(r.rows[0].wage).toBe(PENSION_DEFAULTS.maxWage);
    expect(r.totalContribution).toBe(9000 * 12);
  });
  it('grows an existing balance', () => {
    const r = projectPension({ ...base, salary: 0, balance: 1_000_000, returnPct: 3, currentAge: 59, retireAge: 60 })!;
    expect(r.finalBalance).toBeCloseTo(1_030_000, 0);
  });
  it('checks the 15-year rule for monthly pension', () => {
    expect(projectPension({ ...base, currentAge: 50, retireAge: 60 })!.monthlyEligible).toBe(false);
    expect(projectPension({ ...base, currentAge: 50, retireAge: 60, pastYears: 5 })!.monthlyEligible).toBe(true);
  });
  it('retiring now just annuitises the balance', () => {
    const r = projectPension({ ...base, currentAge: 60, retireAge: 60, balance: 1_000_000 })!;
    expect(r.rows).toHaveLength(0);
    expect(r.monthlyPension).toBeCloseTo(monthlyAnnuity(1_000_000, 23, 1.1473), 6);
  });
});

describe('validatePension', () => {
  it.each([[{ retireAge: 55 }], [{ currentAge: 70, retireAge: 65 }], [{ employerPct: 5 }], [{ selfPct: 7 }], [{ salary: -1 }], [{ returnPct: Number.NaN }]])(
    'rejects %o',
    (patch) => {
      expect(validatePension({ ...base, ...patch })).not.toBeNull();
      expect(projectPension({ ...base, ...patch })).toBeNull();
    },
  );
});

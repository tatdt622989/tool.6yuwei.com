import { describe, expect, it } from 'vitest';
import {
  calculateSalary,
  defaultInsuranceYear,
  gradeFor,
  INSURANCE_2026,
  INSURANCE_2027,
  insuranceTable,
  laborInsuredFor,
  roundDiv,
  validateSalary,
  type SalaryInput,
} from './logic';

const base: SalaryInput = {
  salary: 30_000,
  dependents: 0,
  selfPensionPct: 0,
  employmentInsurance: true,
  partTime: false,
  occupationalRatePct: 0.11,
  otherDeduction: 0,
};
const calc = (patch: Partial<SalaryInput>) => calculateSalary({ ...base, ...patch })!;

describe('gradeFor', () => {
  const g = INSURANCE_2026.laborGrades;
  it('rounds up to the next grade', () => {
    expect(gradeFor(30_000, g)).toBe(30_300);
    expect(gradeFor(30_300, g)).toBe(30_300);
    expect(gradeFor(30_301, g)).toBe(31_800);
  });
  it('clamps to the first and last grade', () => {
    expect(gradeFor(1, g)).toBe(29_500);
    expect(gradeFor(100_000, g)).toBe(45_800);
    expect(gradeFor(500_000, INSURANCE_2026.healthGrades)).toBe(313_000);
    expect(gradeFor(200_000, INSURANCE_2026.pensionGrades)).toBe(150_000);
  });
  it('tables are strictly increasing', () => {
    for (const table of [g, INSURANCE_2026.healthGrades, INSURANCE_2026.pensionGrades, INSURANCE_2026.occupationalGrades]) {
      for (let i = 1; i < table.length; i++) expect(table[i]).toBeGreaterThan(table[i - 1]);
    }
    expect(INSURANCE_2026.healthGrades).toHaveLength(58);
    expect(INSURANCE_2026.pensionGrades).toHaveLength(62);
  });
});

describe('roundDiv', () => {
  it('rounds half up exactly', () => {
    expect(roundDiv(2065, 10)).toBe(207);
    expect(roundDiv(2064, 10)).toBe(206);
  });
});

describe('matches the official 2026 premium tables', () => {
  it('勞保 at 29,500: employee 738 (679 + 59), employer with 0.11% 職災 = 2,614', () => {
    const r = calc({ salary: 29_500 });
    expect(r.employee.laborOrdinary).toBe(679);
    expect(r.employee.labor).toBe(738);
    expect(r.employer.labor).toBe(2614);
  });
  it('勞保 at 45,800 with 職災 insured at 48,200: employer 4,061', () => {
    const r = calc({ salary: 48_000 });
    expect(r.laborInsured).toBe(45_800);
    expect(r.occupationalInsured).toBe(48_200);
    expect(r.employee.labor).toBe(1145);
    expect(r.employer.labor).toBe(4061);
  });
  it('健保 at 29,500: 458 per head, 1,832 with 3 dependents, employer 1,428', () => {
    expect(calc({ salary: 29_500 }).employee.health).toBe(458);
    expect(calc({ salary: 29_500, dependents: 3 }).employee.health).toBe(1832);
    expect(calc({ salary: 29_500, dependents: 5 }).employee.health).toBe(1832);
    expect(calc({ salary: 29_500 }).employer.health).toBe(1428);
  });
  it('健保 at the top grade 313,000: 4,855 / employer 15,146', () => {
    const r = calc({ salary: 400_000 });
    expect(r.healthInsured).toBe(313_000);
    expect(r.employee.health).toBe(4855);
    expect(r.employer.health).toBe(15_146);
  });
  it('健保 at 150,000: 2,327 / employer 7,259', () => {
    const r = calc({ salary: 150_000 });
    expect(r.employee.health).toBe(2327);
    expect(r.employer.health).toBe(7259);
  });
});

describe('calculateSalary', () => {
  it('30,000 月薪 → 實領 28,772', () => {
    const r = calc({});
    expect(r.laborInsured).toBe(30_300);
    expect(r.employee.labor).toBe(758);
    expect(r.employee.health).toBe(470);
    expect(r.takeHome).toBe(28_772);
    expect(r.employer.pension).toBe(1818);
  });
  it('50,000 月薪、自提 6%、1 位眷屬', () => {
    const r = calc({ salary: 50_000, selfPensionPct: 6, dependents: 1 });
    expect(r.employee.labor).toBe(1145);
    expect(r.healthInsured).toBe(50_600);
    expect(r.employee.health).toBe(1570);
    expect(r.pensionWage).toBe(50_600);
    expect(r.employee.pension).toBe(3036);
    expect(r.takeHome).toBe(50_000 - 1145 - 1570 - 3036);
  });
  it('employer cost adds all employer shares', () => {
    const r = calc({ salary: 40_000 });
    const e = r.employer;
    expect(e.total).toBe(e.laborOrdinary + e.employment + e.occupational + e.wageArrears + e.health + e.pension);
    expect(r.employerCost).toBe(40_000 + e.total);
    expect(e.wageArrears).toBe(10);
  });
  it('no employment insurance removes the 1% part', () => {
    expect(calc({ salary: 29_500, employmentInsurance: false }).employee.labor).toBe(679);
  });
  it('honours custom insured amounts', () => {
    const r = calc({ salary: 60_000, laborInsuredOverride: 29_500, healthInsuredOverride: 29_500, pensionWageOverride: 29_500 });
    expect(r.employee.labor).toBe(738);
    expect(r.employee.health).toBe(458);
    expect(r.occupationalInsured).toBe(29_500);
  });
  it('subtracts other deductions', () => {
    expect(calc({ otherDeduction: 1500 }).takeHome).toBe(28_772 - 1500);
  });
  it('flags salaries below the minimum wage', () => {
    expect(calc({ salary: 20_000 }).belowMinWage).toBe(true);
    expect(calc({ salary: 20_000 }).laborInsured).toBe(29_500);
  });
});

describe('laborInsuredFor part-time', () => {
  it('uses the lower part-time grades below the minimum wage', () => {
    expect(laborInsuredFor(10_000, true)).toBe(11_100);
    expect(laborInsuredFor(20_000, true)).toBe(20_008);
    expect(laborInsuredFor(29_000, true)).toBe(29_500);
    expect(laborInsuredFor(35_000, true)).toBe(36_300);
  });
});

describe('validateSalary', () => {
  it.each([[{ salary: 0 }], [{ salary: Number.NaN }], [{ selfPensionPct: 7 }], [{ dependents: -1 }], [{ dependents: 1.5 }], [{ otherDeduction: -1 }], [{ laborInsuredOverride: 0 }]])(
    'rejects %o',
    (patch) => {
      expect(validateSalary({ ...base, ...patch })).not.toBeNull();
      expect(calculateSalary({ ...base, ...patch })).toBeNull();
    },
  );
});

describe('2027（民國 116 年）', () => {
  const t = INSURANCE_2027;
  const calc27 = (patch: Partial<SalaryInput>) => calculateSalary({ ...base, year: 2027, ...patch })!;

  it('defaults to 2026 before 2027-01-01 and 2027 afterwards', () => {
    expect(defaultInsuranceYear(new Date(2026, 9, 29))).toBe(2026);
    expect(defaultInsuranceYear(new Date(2026, 11, 31, 23, 59))).toBe(2026);
    expect(defaultInsuranceYear(new Date(2027, 0, 1, 0, 0))).toBe(2027);
    expect(insuranceTable(2027)).toBe(t);
    expect(insuranceTable()).toBe(INSURANCE_2026);
  });
  it('official minimum wage and 勞保 rate', () => {
    expect(t.minWage).toBe(30_900);
    expect(t.minHourlyWage).toBe(205);
    expect(t.laborOrdinaryRateBp + t.employmentRateBp).toBe(1300);
    expect(t.estimated).toBe(true);
    expect(INSURANCE_2026.estimated).toBe(false);
  });
  it('derived tables start at 30,900 and keep the 2026 grades above it', () => {
    for (const [g27, g26] of [
      [t.laborGrades, INSURANCE_2026.laborGrades],
      [t.occupationalGrades, INSURANCE_2026.occupationalGrades],
      [t.healthGrades, INSURANCE_2026.healthGrades],
    ] as const) {
      expect(g27[0]).toBe(30_900);
      expect(g27.slice(1)).toEqual(g26.filter((g) => g > 30_900));
      for (let i = 1; i < g27.length; i++) expect(g27[i]).toBeGreaterThan(g27[i - 1]);
    }
    expect(t.laborGrades).toHaveLength(10);
    expect(t.healthGrades).toHaveLength(57);
    expect(t.pensionGrades).toHaveLength(62);
    expect(t.pensionGrades).toContain(30_900);
    expect(t.pensionGrades).not.toContain(30_300);
    for (let i = 1; i < t.pensionGrades.length; i++) expect(t.pensionGrades[i]).toBeGreaterThan(t.pensionGrades[i - 1]);
  });
  it('最低工資 30,900：勞保 742 + 就保 62 = 804，健保 479，雇主勞保含職災 2,846', () => {
    const r = calc27({ salary: 30_900 });
    expect(r.laborInsured).toBe(30_900);
    expect(r.employee.laborOrdinary).toBe(742);
    expect(r.employee.employment).toBe(62);
    expect(r.employee.labor).toBe(804);
    expect(r.employer.labor).toBe(2596 + 216 + 34);
    expect(r.employee.health).toBe(479);
    expect(r.employer.health).toBe(1495);
    expect(r.employer.pension).toBe(1854);
    expect(r.takeHome).toBe(30_900 - 804 - 479);
    expect(r.belowMinWage).toBe(false);
  });
  it('30,000 月薪 is below the 2027 minimum wage and is insured at 30,900', () => {
    const r = calc27({ salary: 30_000 });
    expect(r.belowMinWage).toBe(true);
    expect(r.laborInsured).toBe(30_900);
    expect(calc({ salary: 30_000 }).belowMinWage).toBe(false);
  });
  it('higher 勞保 rate: 36,000 月薪 自付 944（2026 年 908）', () => {
    expect(calc27({ salary: 36_000 }).employee.labor).toBe(871 + 73);
    expect(calc({ salary: 36_000 }).employee.labor).toBe(908);
  });
  it('勞保 top grade 45,800：自付 1,191', () => {
    const r = calc27({ salary: 60_000 });
    expect(r.laborInsured).toBe(45_800);
    expect(r.employee.labor).toBe(1099 + 92);
  });
  it('part-time grades include 29,500 below the 2027 minimum wage', () => {
    expect(laborInsuredFor(29_000, true, 2027)).toBe(29_500);
    expect(laborInsuredFor(30_000, true, 2027)).toBe(30_900);
    expect(laborInsuredFor(20_000, true, 2027)).toBe(20_008);
  });
});

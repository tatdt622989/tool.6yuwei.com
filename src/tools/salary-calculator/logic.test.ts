import { describe, expect, it } from 'vitest';
import { calculateSalary, gradeFor, INSURANCE_2026, laborInsuredFor, roundDiv, validateSalary, type SalaryInput } from './logic';

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

/**
 * 2026（民國 115 年）勞健保、勞退費率與投保級距。全部數字集中在這裡，年度更新只需改這個物件。
 *
 * 來源（皆自 2026-01-01 起適用）：
 * - 勞工保險投保薪資分級表：勞動部 114.11.21 勞動保 2 字第 1140091863 號令，https://www.bli.gov.tw/0005475.html（/Files/25661）
 * - 勞工職業災害保險投保薪資分級表（上限 72,800）：https://www.bli.gov.tw/0005475.html
 * - 勞工退休金月提繳分級表：勞動部 114.11.24 勞動福 3 字第 1140153598 號令，https://www.bli.gov.tw/0101077.html（/Files/25709）
 * - 全民健康保險投保金額分級表與保險費負擔金額表（費率 5.17%、平均眷口數 0.56）：
 *   健保署「保險費負擔金額表」115.1.1 生效，https://www.nhi.gov.tw/ch/cp-19418-9eefb-2576-1.html
 * - 勞保普通事故費率 11.5%（另就業保險 1%），被保險人 20%／投保單位 70%／政府 10%：勞保局 115 年保險費分擔表
 * - 最低工資 29,500 元／時薪 196 元：勞動部 114 年最低工資審議會，自 115-01-01 起
 * - 積欠工資墊償基金：投保薪資總額萬分之 2.5（勞基法第 28 條），https://www.bli.gov.tw
 */
export const INSURANCE_2026 = {
  label: '2026 年（民國 115 年）',
  effective: '2026-01-01',
  minWage: 29_500,
  minHourlyWage: 196,
  /** 勞保普通事故保險費率，萬分比。 */
  laborOrdinaryRateBp: 1150,
  /** 就業保險費率，萬分比。 */
  employmentRateBp: 100,
  laborEmployeeShare: 20,
  laborEmployerShare: 70,
  /** 職業災害保險費率（行業別 + 上下班 0.07%），依行業不同，預設以常見的 0.11% 估算，%。 */
  defaultOccupationalRatePct: 0.11,
  /** 積欠工資墊償基金提繳率，十萬分比（0.025%）。 */
  wageArrearsRatePer100k: 25,
  /** 健保費率，萬分比（5.17%）。 */
  healthRateBp: 517,
  healthEmployeeShare: 30,
  healthEmployerShare: 60,
  /** 投保單位負擔以本人 + 平均眷口數 0.56 人計，以百分比表示 1.56 = 156。 */
  healthEmployerHeadcountPct: 156,
  /** 眷屬超過 3 人以 3 人計。 */
  maxDependents: 3,
  employerPensionPct: 6,
  maxSelfPensionPct: 6,
  laborGrades: [29_500, 30_300, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800],
  /** 部分工時勞工薪資未達最低工資時適用的較低級距（分級表備註二、三）。 */
  laborPartTimeGrades: [
    11_100, 12_540, 13_500, 15_840, 16_500, 17_280, 17_880, 19_047, 20_008, 21_009, 22_000, 23_100, 24_000, 25_250,
    26_400, 27_600, 28_590,
  ],
  occupationalGrades: [
    29_500, 30_300, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000,
    55_400, 57_800, 60_800, 63_800, 66_800, 69_800, 72_800,
  ],
  healthGrades: [
    29_500, 30_300, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000,
    55_400, 57_800, 60_800, 63_800, 66_800, 69_800, 72_800, 76_500, 80_200, 83_900, 87_600, 92_100, 96_600, 101_100,
    105_600, 110_100, 115_500, 120_900, 126_300, 131_700, 137_100, 142_500, 147_900, 150_000, 156_400, 162_800,
    169_200, 175_600, 182_000, 189_500, 197_000, 204_500, 212_000, 219_500, 228_200, 236_900, 245_600, 254_300,
    263_000, 273_000, 283_000, 293_000, 303_000, 313_000,
  ],
  pensionGrades: [
    1_500, 3_000, 4_500, 6_000, 7_500, 8_700, 9_900, 11_100, 12_540, 13_500, 15_840, 16_500, 17_280, 17_880, 19_047,
    20_008, 21_009, 22_000, 23_100, 24_000, 25_250, 26_400, 27_600, 28_590, 29_500, 30_300, 31_800, 33_300, 34_800,
    36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000, 55_400, 57_800, 60_800, 63_800, 66_800,
    69_800, 72_800, 76_500, 80_200, 83_900, 87_600, 92_100, 96_600, 101_100, 105_600, 110_100, 115_500, 120_900,
    126_300, 131_700, 137_100, 142_500, 147_900, 150_000,
  ],
} as const;

/**
 * 依月薪找出投保級距：取「大於或等於月薪」的最低一級（無條件進位到下一級），
 * 低於第一級以第一級計，高於最高級以最高級計。
 */
export function gradeFor(salary: number, grades: readonly number[]): number {
  for (const g of grades) if (salary <= g) return g;
  return grades[grades.length - 1];
}

/** 四捨五入 numerator / denominator（皆為非負整數），避免浮點誤差把 x.5 捨掉。 */
export function roundDiv(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

export interface SalaryInput {
  /** 月薪（經常性薪資），元。 */
  salary: number;
  /** 健保眷屬人數 0–3（超過 3 人以 3 人計）。 */
  dependents: number;
  /** 勞退自提比例 0–6（%）。 */
  selfPensionPct: number;
  /** 是否適用就業保險（本國籍、未滿 65 歲的受僱勞工）。 */
  employmentInsurance: boolean;
  /** 部分工時，薪資低於最低工資時套用較低的勞保級距。 */
  partTime: boolean;
  /** 職災保險費率（%），僅影響雇主成本。 */
  occupationalRatePct: number;
  /** 其他扣款（所得稅預扣、福利金等），元。 */
  otherDeduction: number;
  /** 自訂投保金額；undefined 代表依月薪自動對照級距。 */
  laborInsuredOverride?: number;
  healthInsuredOverride?: number;
  pensionWageOverride?: number;
}

export interface SalaryResult {
  laborInsured: number;
  occupationalInsured: number;
  healthInsured: number;
  pensionWage: number;
  employee: {
    laborOrdinary: number;
    employment: number;
    labor: number;
    health: number;
    pension: number;
    other: number;
    total: number;
  };
  employer: {
    laborOrdinary: number;
    employment: number;
    occupational: number;
    wageArrears: number;
    labor: number;
    health: number;
    pension: number;
    total: number;
  };
  takeHome: number;
  employerCost: number;
  belowMinWage: boolean;
}

export function validateSalary(input: SalaryInput): string | null {
  const { salary, dependents, selfPensionPct, occupationalRatePct, otherDeduction } = input;
  if (![salary, dependents, selfPensionPct, occupationalRatePct, otherDeduction].every(Number.isFinite))
    return '請輸入完整的數字。';
  if (salary <= 0) return '月薪需大於 0。';
  if (salary > 10_000_000) return '月薪請輸入 1,000 萬元以下。';
  if (!Number.isInteger(dependents) || dependents < 0) return '眷屬人數請輸入 0 或正整數。';
  if (selfPensionPct < 0 || selfPensionPct > INSURANCE_2026.maxSelfPensionPct) return '勞退自提比例需介於 0% 到 6%。';
  if (occupationalRatePct < 0 || occupationalRatePct > 2) return '職災保險費率請輸入 0% 到 2%。';
  if (otherDeduction < 0) return '其他扣款不可為負數。';
  for (const v of [input.laborInsuredOverride, input.healthInsuredOverride, input.pensionWageOverride]) {
    if (v !== undefined && (!Number.isFinite(v) || v <= 0)) return '自訂投保金額需大於 0。';
  }
  return null;
}

export function laborInsuredFor(salary: number, partTime: boolean): number {
  const t = INSURANCE_2026;
  if (partTime && salary < t.minWage) {
    // 備註二：薪資超過 28,590 元而未達最低工資者，依第一級申報。
    if (salary > t.laborPartTimeGrades[t.laborPartTimeGrades.length - 1]) return t.laborGrades[0];
    return gradeFor(salary, t.laborPartTimeGrades);
  }
  return gradeFor(salary, t.laborGrades);
}

export function calculateSalary(input: SalaryInput): SalaryResult | null {
  if (validateSalary(input)) return null;
  const t = INSURANCE_2026;
  const salary = input.salary;
  const laborInsured = Math.round(input.laborInsuredOverride ?? laborInsuredFor(salary, input.partTime));
  const occupationalInsured = gradeFor(input.laborInsuredOverride ?? salary, t.occupationalGrades);
  const healthInsured = Math.round(input.healthInsuredOverride ?? gradeFor(salary, t.healthGrades));
  const pensionWage = Math.round(input.pensionWageOverride ?? gradeFor(salary, t.pensionGrades));
  const dependents = Math.min(input.dependents, t.maxDependents);

  // 勞保：普通事故與就業保險分別計算後四捨五入（與勞保局分擔金額表一致）。
  const empOrdinary = roundDiv(laborInsured * t.laborOrdinaryRateBp * t.laborEmployeeShare, 1_000_000);
  const empEmployment = input.employmentInsurance
    ? roundDiv(laborInsured * t.employmentRateBp * t.laborEmployeeShare, 1_000_000)
    : 0;
  // 健保：本人金額四捨五入後，乘以（本人 + 眷屬人數），與健保署負擔金額表一致。
  const empHealthPerHead = roundDiv(healthInsured * t.healthRateBp * t.healthEmployeeShare, 1_000_000);
  const empHealth = empHealthPerHead * (1 + dependents);
  const empPension = roundDiv(pensionWage * Math.round(input.selfPensionPct * 100), 10_000);
  const other = Math.round(input.otherDeduction);

  const erOrdinary = roundDiv(laborInsured * t.laborOrdinaryRateBp * t.laborEmployerShare, 1_000_000);
  const erEmployment = input.employmentInsurance
    ? roundDiv(laborInsured * t.employmentRateBp * t.laborEmployerShare, 1_000_000)
    : 0;
  const erOccupational = roundDiv(occupationalInsured * Math.round(input.occupationalRatePct * 100), 10_000);
  const erArrears = roundDiv(laborInsured * t.wageArrearsRatePer100k, 100_000);
  const erHealth = roundDiv(
    healthInsured * t.healthRateBp * t.healthEmployerShare * t.healthEmployerHeadcountPct,
    100_000_000,
  );
  const erPension = roundDiv(pensionWage * t.employerPensionPct, 100);

  const employeeTotal = empOrdinary + empEmployment + empHealth + empPension + other;
  const employerTotal = erOrdinary + erEmployment + erOccupational + erArrears + erHealth + erPension;

  return {
    laborInsured,
    occupationalInsured,
    healthInsured,
    pensionWage,
    employee: {
      laborOrdinary: empOrdinary,
      employment: empEmployment,
      labor: empOrdinary + empEmployment,
      health: empHealth,
      pension: empPension,
      other,
      total: employeeTotal,
    },
    employer: {
      laborOrdinary: erOrdinary,
      employment: erEmployment,
      occupational: erOccupational,
      wageArrears: erArrears,
      labor: erOrdinary + erEmployment + erOccupational,
      health: erHealth,
      pension: erPension,
      total: employerTotal,
    },
    takeHome: salary - employeeTotal,
    employerCost: salary + employerTotal,
    belowMinWage: salary < t.minWage,
  };
}

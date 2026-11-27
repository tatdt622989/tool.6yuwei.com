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
  year: 2026,
  label: '2026 年（民國 115 年）',
  effective: '2026-01-01',
  /** 全部數字皆為官方公告值。 */
  estimated: false,
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
 * 2027（民國 116 年）勞健保、勞退費率與投保級距。查證日期 2026-10-29。
 *
 * 【官方已公告／依法確定】
 * - 最低工資 30,900 元／時薪 205 元：最低工資審議會 2026-09-24 決議，勞動部 2026-10-16 公告
 *   （勞動條 2 字第 1150148692 號），116-01-01 生效。https://www.mol.gov.tw/1607/1632/1633/99195/post 、
 *   https://www.cna.com.tw/news/ahel/202610160269.aspx
 * - 勞保普通事故費率 12%（另就業保險 1%，合計 13%）：勞工保險條例第 13 條費率自動調整機制（每 2 年調高 0.5%
 *   至上限 13%，含就保 1%），116-01-01 起適用；分擔比例 20／70／10 不變。
 *
 * 【沿用現行、尚待正式確認】
 * - 健保費率 5.17%：衛福部 2026-09-23 健保總額協商後表示 2027 年一般保險費率不調整（健保會年底正式審議）；
 *   平均眷口數 0.56 為 115 年數值，116 年數值尚未公告。
 * - 就業保險 1%、積欠工資墊償基金 0.025%、雇主勞退提繳 6%：法令未變動，沿用。
 *
 * 【依最低工資調整預估（正式分級表公告後更新）】
 * 截至 2026-10-29，勞保局 https://www.bli.gov.tw/0005475.html（勞保）、/0101077.html（勞退）與健保署
 * 投保金額分級表頁面仍只有 115-01-01 版本，116 年分級表尚未發布（115 年版是 114-11-21／11-24 才發布）。
 * 以下依歷年調整方式推估：
 * - 勞保投保薪資分級表：114→115 年的做法是第 1 級改為新最低工資、低於新最低工資的原第 2 級（28,800）刪除，
 *   原第 1 級（28,590）移入備註二的較低級距。比照推估：第 1 級 30,900、刪除 30,300、29,500 移入備註級距，
 *   其餘不變，共 10 級（最高 45,800）。
 * - 職災保險投保薪資分級表：同上，第 1 級 30,900、刪除 30,300，最高 72,800 不變。
 * - 健保投保金額分級表：衛福部 2026-09-24 說明 116 年將第 1、2 級合併，由 58 級減為 57 級
 *   （聯合報／中央社 https://udn.com/news/story/7238/9776270），即第 1 級 30,900、其餘不變，最高 313,000。
 * - 勞退月提繳分級表：歷年維持 62 級，115 年將介於新舊最低工資之間的 28,800 改為 29,500。比照推估：
 *   30,300 改為 30,900，其餘不變。
 * 月薪 30,900 元以上的全時勞工，上述推估只影響第 1 級，其餘級距金額與 2026 年相同。
 */
export const INSURANCE_2027 = {
  year: 2027,
  label: '2027 年（民國 116 年）',
  effective: '2027-01-01',
  /** 分級表為依最低工資調整的預估值，正式公告後更新。 */
  estimated: true,
  minWage: 30_900,
  minHourlyWage: 205,
  laborOrdinaryRateBp: 1200,
  employmentRateBp: 100,
  laborEmployeeShare: 20,
  laborEmployerShare: 70,
  defaultOccupationalRatePct: 0.11,
  wageArrearsRatePer100k: 25,
  healthRateBp: 517,
  healthEmployeeShare: 30,
  healthEmployerShare: 60,
  healthEmployerHeadcountPct: 156,
  maxDependents: 3,
  employerPensionPct: 6,
  maxSelfPensionPct: 6,
  laborGrades: [30_900, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800],
  laborPartTimeGrades: [
    11_100, 12_540, 13_500, 15_840, 16_500, 17_280, 17_880, 19_047, 20_008, 21_009, 22_000, 23_100, 24_000, 25_250,
    26_400, 27_600, 28_590, 29_500,
  ],
  occupationalGrades: [
    30_900, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000, 55_400,
    57_800, 60_800, 63_800, 66_800, 69_800, 72_800,
  ],
  healthGrades: [
    30_900, 31_800, 33_300, 34_800, 36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000, 55_400,
    57_800, 60_800, 63_800, 66_800, 69_800, 72_800, 76_500, 80_200, 83_900, 87_600, 92_100, 96_600, 101_100, 105_600,
    110_100, 115_500, 120_900, 126_300, 131_700, 137_100, 142_500, 147_900, 150_000, 156_400, 162_800, 169_200,
    175_600, 182_000, 189_500, 197_000, 204_500, 212_000, 219_500, 228_200, 236_900, 245_600, 254_300, 263_000,
    273_000, 283_000, 293_000, 303_000, 313_000,
  ],
  pensionGrades: [
    1_500, 3_000, 4_500, 6_000, 7_500, 8_700, 9_900, 11_100, 12_540, 13_500, 15_840, 16_500, 17_280, 17_880, 19_047,
    20_008, 21_009, 22_000, 23_100, 24_000, 25_250, 26_400, 27_600, 28_590, 29_500, 30_900, 31_800, 33_300, 34_800,
    36_300, 38_200, 40_100, 42_000, 43_900, 45_800, 48_200, 50_600, 53_000, 55_400, 57_800, 60_800, 63_800, 66_800,
    69_800, 72_800, 76_500, 80_200, 83_900, 87_600, 92_100, 96_600, 101_100, 105_600, 110_100, 115_500, 120_900,
    126_300, 131_700, 137_100, 142_500, 147_900, 150_000,
  ],
} as const;

/** 兩個年度共用的資料結構。 */
export interface InsuranceTable {
  year: number;
  label: string;
  effective: string;
  estimated: boolean;
  minWage: number;
  minHourlyWage: number;
  laborOrdinaryRateBp: number;
  employmentRateBp: number;
  laborEmployeeShare: number;
  laborEmployerShare: number;
  defaultOccupationalRatePct: number;
  wageArrearsRatePer100k: number;
  healthRateBp: number;
  healthEmployeeShare: number;
  healthEmployerShare: number;
  healthEmployerHeadcountPct: number;
  maxDependents: number;
  employerPensionPct: number;
  maxSelfPensionPct: number;
  laborGrades: readonly number[];
  laborPartTimeGrades: readonly number[];
  occupationalGrades: readonly number[];
  healthGrades: readonly number[];
  pensionGrades: readonly number[];
}

export type InsuranceYear = 2026 | 2027;

export const INSURANCE_TABLES: Record<InsuranceYear, InsuranceTable> = {
  2026: INSURANCE_2026,
  2027: INSURANCE_2027,
};

export const INSURANCE_YEARS: readonly InsuranceYear[] = [2026, 2027];

/** 依日期（使用者當地時間）決定預設年度：2027-01-01 起用 2027 年，之前用 2026 年。 */
export function defaultInsuranceYear(now: Date = new Date()): InsuranceYear {
  return now.getFullYear() >= 2027 ? 2027 : 2026;
}

export function insuranceTable(year: InsuranceYear = 2026): InsuranceTable {
  return INSURANCE_TABLES[year] ?? INSURANCE_2026;
}

/** 費率（萬分比）轉成顯示用百分比字串，例如 1150 → '11.5'。 */
export function bpToPct(bp: number): string {
  return String(bp / 100);
}

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
  /** 適用年度，預設 2026。 */
  year?: InsuranceYear;
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
  if (selfPensionPct < 0 || selfPensionPct > insuranceTable(input.year).maxSelfPensionPct) return '勞退自提比例需介於 0% 到 6%。';
  if (occupationalRatePct < 0 || occupationalRatePct > 2) return '職災保險費率請輸入 0% 到 2%。';
  if (otherDeduction < 0) return '其他扣款不可為負數。';
  for (const v of [input.laborInsuredOverride, input.healthInsuredOverride, input.pensionWageOverride]) {
    if (v !== undefined && (!Number.isFinite(v) || v <= 0)) return '自訂投保金額需大於 0。';
  }
  return null;
}

export function laborInsuredFor(salary: number, partTime: boolean, year: InsuranceYear = 2026): number {
  const t = insuranceTable(year);
  if (partTime && salary < t.minWage) {
    // 備註二：薪資超過備註最高一級（2026 年為 28,590 元）而未達最低工資者，依第一級申報。
    if (salary > t.laborPartTimeGrades[t.laborPartTimeGrades.length - 1]) return t.laborGrades[0];
    return gradeFor(salary, t.laborPartTimeGrades);
  }
  return gradeFor(salary, t.laborGrades);
}

export function calculateSalary(input: SalaryInput): SalaryResult | null {
  if (validateSalary(input)) return null;
  const t = insuranceTable(input.year);
  const salary = input.salary;
  const laborInsured = Math.round(input.laborInsuredOverride ?? laborInsuredFor(salary, input.partTime, input.year));
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

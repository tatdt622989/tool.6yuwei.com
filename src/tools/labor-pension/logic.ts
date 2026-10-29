import { gradeFor, INSURANCE_2026 } from '../salary-calculator/logic';

/**
 * 勞工退休金新制（勞工退休金條例）試算參數：
 * - 雇主每月提繳不得低於月提繳工資 6%（第 14 條第 1 項），勞工可自願提繳 6% 以內（第 14 條第 3 項），
 *   自提部分自當年度個人綜合所得總額中全數扣除。
 * - 月提繳工資依「勞工退休金月提繳分級表」（2026-01-01 起，最高 150,000 元），見 ../salary-calculator/logic.ts。
 *   2027 年分級表（INSURANCE_2027，依最低工資 30,900 元預估）只把 30,300 元一級改為 30,900 元，最高級距相同，
 *   長期試算沿用 2026 年正式分級表。
 * - 年滿 60 歲、提繳年資滿 15 年者得請領月退休金，未滿 15 年請領一次退休金（第 24 條）。
 * - 月退休金依年金生命表、平均餘命、利率計算，按季發給（第 23 條）；累積收益不得低於二年期定存利率（保證收益）。
 * - 平均餘命 23 年、利率 1.1473% 為勞保局月退休金試算範例採用之數值（2024 年起引用），可自行修改。
 *   勞保局：https://www.bli.gov.tw
 */
export const PENSION_DEFAULTS = {
  employerPct: INSURANCE_2026.employerPensionPct,
  maxSelfPct: INSURANCE_2026.maxSelfPensionPct,
  claimAge: 60,
  minYearsForMonthly: 15,
  lifeExpectancyYears: 23,
  annuityRatePct: 1.1473,
  maxWage: INSURANCE_2026.pensionGrades[INSURANCE_2026.pensionGrades.length - 1],
} as const;

export interface PensionInput {
  currentAge: number;
  retireAge: number;
  /** 目前月薪。 */
  salary: number;
  /** 目前個人專戶累積金額（含收益）。 */
  balance: number;
  /** 已提繳年資（年）。 */
  pastYears: number;
  employerPct: number;
  selfPct: number;
  /** 假設年化投資報酬率（%）。 */
  returnPct: number;
  /** 假設每年調薪幅度（%）。 */
  salaryGrowthPct: number;
  lifeExpectancyYears: number;
  annuityRatePct: number;
}

export interface PensionYearRow {
  age: number;
  salary: number;
  wage: number;
  contribution: number;
  earnings: number;
  balance: number;
}

export interface PensionResult {
  years: number;
  rows: PensionYearRow[];
  finalBalance: number;
  totalContribution: number;
  totalEarnings: number;
  selfContribution: number;
  monthlyPension: number;
  quarterlyPension: number;
  totalServiceYears: number;
  monthlyEligible: boolean;
}

export function validatePension(i: PensionInput): string | null {
  const nums = Object.values(i) as number[];
  if (!nums.every(Number.isFinite)) return '請輸入完整的數字。';
  if (i.currentAge < 15 || i.currentAge > 80) return '目前年齡請輸入 15 到 80 歲。';
  if (i.retireAge < PENSION_DEFAULTS.claimAge || i.retireAge > 80) return '退休年齡請輸入 60 到 80 歲（年滿 60 歲才能請領）。';
  if (i.retireAge < i.currentAge) return '退休年齡不可小於目前年齡。';
  if (i.salary < 0 || i.balance < 0 || i.pastYears < 0) return '金額與年資不可為負數。';
  if (i.employerPct < PENSION_DEFAULTS.employerPct || i.employerPct > 100) return '雇主提繳率至少 6%。';
  if (i.selfPct < 0 || i.selfPct > PENSION_DEFAULTS.maxSelfPct) return '自提比例需介於 0% 到 6%。';
  if (i.returnPct < -10 || i.returnPct > 20) return '年化報酬率請輸入 −10% 到 20%。';
  if (i.salaryGrowthPct < -10 || i.salaryGrowthPct > 20) return '調薪幅度請輸入 −10% 到 20%。';
  if (i.lifeExpectancyYears < 1 || i.lifeExpectancyYears > 50) return '平均餘命請輸入 1 到 50 年。';
  if (i.annuityRatePct < 0 || i.annuityRatePct > 10) return '月退休金計算利率請輸入 0% 到 10%。';
  return null;
}

/** 依季發給的年金（期初給付）計算每季金額，再換算每月。 */
export function monthlyAnnuity(balance: number, years: number, ratePct: number): number {
  const n = Math.round(years * 4);
  if (n <= 0 || balance <= 0) return 0;
  const q = ratePct / 100 / 4;
  const factor = q === 0 ? n : ((1 - (1 + q) ** -n) / q) * (1 + q);
  return balance / factor / 3;
}

export function projectPension(i: PensionInput): PensionResult | null {
  if (validatePension(i)) return null;
  const totalMonths = Math.round((i.retireAge - i.currentAge) * 12);
  const monthlyRate = (1 + i.returnPct / 100) ** (1 / 12) - 1;
  const rows: PensionYearRow[] = [];
  let balance = i.balance;
  let salary = i.salary;
  let totalContribution = 0;
  let selfContribution = 0;
  let totalEarnings = 0;
  let yearContribution = 0;
  let yearEarnings = 0;
  let wage = salary > 0 ? gradeFor(salary, INSURANCE_2026.pensionGrades) : 0;

  for (let m = 1; m <= totalMonths; m++) {
    const earnings = balance * monthlyRate;
    const employer = Math.round((wage * i.employerPct) / 100);
    const self = Math.round((wage * i.selfPct) / 100);
    balance += earnings + employer + self;
    totalEarnings += earnings;
    totalContribution += employer + self;
    selfContribution += self;
    yearContribution += employer + self;
    yearEarnings += earnings;
    if (m % 12 === 0 || m === totalMonths) {
      rows.push({
        age: i.currentAge + Math.ceil(m / 12),
        salary,
        wage,
        contribution: yearContribution,
        earnings: yearEarnings,
        balance,
      });
      yearContribution = 0;
      yearEarnings = 0;
      salary *= 1 + i.salaryGrowthPct / 100;
      wage = salary > 0 ? gradeFor(salary, INSURANCE_2026.pensionGrades) : 0;
    }
  }

  const totalServiceYears = i.pastYears + totalMonths / 12;
  const monthlyPension = monthlyAnnuity(balance, i.lifeExpectancyYears, i.annuityRatePct);
  return {
    years: totalMonths / 12,
    rows,
    finalBalance: balance,
    totalContribution,
    totalEarnings,
    selfContribution,
    monthlyPension,
    quarterlyPension: monthlyPension * 3,
    totalServiceYears,
    monthlyEligible: totalServiceYears >= PENSION_DEFAULTS.minYearsForMonthly,
  };
}

/**
 * 就業保險失業給付試算。
 *
 * 來源：
 * - 就業保險法第 11 條（請領條件）、第 16 條（給付標準與期間、再次請領）、第 17 條（失業期間工作收入扣除）、
 *   第 18 條（提早就業獎助津貼）、第 19 條之 1（扶養眷屬加給）、第 20 條（自求職登記第 15 日起算）。
 *   https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0050021
 * - 勞保局「給付標準及期間」（2023-01-17 更新）https://www.bli.gov.tw/0005071.html
 *   失業給付按離職辦理本保險退保之當月起前 6 個月平均月投保薪資 60% 按月發給，最長 6 個月；
 *   離職退保時已年滿 45 歲或領有身心障礙證明者最長 9 個月。
 *   領滿給付期間者，自領滿之日起 2 年內再次請領，以原給付期間之 1/2 為限；領滿後保險年資重行起算。
 *   受領未滿給付期間再非自願離職者，合併原已領月數及已領提早就業獎助津貼，以給付期間為限。
 * - 勞保局失業給付試算說明（2026-09-23 更新）https://www.bli.gov.tw/0100405.html
 *   平均月投保薪資＝離職退保當月起（含當月）前 6 個月月投保薪資合計 ÷ 6；扶養無工作收入之父母、配偶、未成年子女
 *   或身心障礙子女，每 1 人加給 10%，最多 20%。
 * - 勞保局 FAQ 例：平均月投保薪資 38,000 元、2 名眷屬 → 38,000 × 80% = 30,400 元。https://www.bli.gov.tw/0017282.html
 * - 勞保局「115 年度業務說明會 勞、就、災保給付作業重點與實務案例」：提早就業獎助津貼按尚未請領之失業給付金額 50%
 *   一次發給，採最後 1 次失業給付金額計算；失業期間每月工作收入超過最低工資（115 年 29,500 元）不得請領，
 *   未超過者，工作收入加失業給付超過平均月投保薪資 80% 部分自失業給付扣除，但總額低於最低工資者不扣除。
 *   https://www.bli.gov.tw/Files/25292
 * - 就業保險投保薪資依勞工保險投保薪資分級表，2026 年最高 45,800 元（勞動部 114.11.21 令）。
 *   2027 年最低工資 30,900 元（勞動部 2026-10-16 公告）；116 年勞保投保薪資分級表截至 2026-10-29 尚未公告。
 *
 * 金額以元為單位四捨五入（勞保局未公告尾數處理方式，差額不超過 1 元）。
 */
import { INSURANCE_2026, roundDiv } from '../salary-calculator/logic';

export const UNEMPLOYMENT_RULES = {
  baseRatePct: 60,
  dependentRatePct: 10,
  maxDependents: 2,
  normalMonths: 6,
  extendedMonths: 9,
  extendedAge: 45,
  maxInsuredSalary: INSURANCE_2026.laborGrades[INSURANCE_2026.laborGrades.length - 1],
  earlyAllowancePct: 50,
  /** 失業期間工作收入＋給付超過平均月投保薪資此比例的部分要扣除。 */
  workIncomeCapPct: 80,
  minWage: { 2026: 29_500, 2027: 30_900 },
} as const;

export type WageYear = keyof typeof UNEMPLOYMENT_RULES.minWage;

/**
 * 請領紀錄：
 * - first：第一次請領，或上次領滿已超過 2 年（年資重新起算後再符合條件）。
 * - partial：上次未領滿給付期間就再就業，這次再非自願離職（合併計算已領月數）。
 * - reapply：上次領滿給付期間，自領滿之日起 2 年內再次請領（以原期間 1/2 為限）。
 */
export type History = 'first' | 'partial' | 'reapply';

export interface UnemploymentInput {
  /** 離職退保當月起前 6 個月的月投保薪資；只填 1 個值代表直接輸入平均。 */
  insuredSalaries: number[];
  /** 離職退保時的年齡。 */
  age: number;
  disability: boolean;
  /** 受扶養無工作收入眷屬人數（超過 2 人以 2 人計）。 */
  dependents: number;
  history: History;
  /** history = partial 時，上次已領的失業給付月數（含已領提早就業獎助津貼所折抵的月數）。 */
  usedMonths: number;
}

export interface UnemploymentResult {
  averageInsured: number;
  /** 有月投保薪資超過上限而被截為 45,800。 */
  cappedSalaries: boolean;
  ratePct: number;
  monthly: number;
  /** 依年齡、身障的完整給付期間（6 或 9）。 */
  entitlementMonths: number;
  /** 本次可領月數。 */
  availableMonths: number;
  total: number;
  /** 最高月領（投保薪資上限 × 給付比例）。 */
  maxMonthly: number;
}

export function validateUnemployment(input: UnemploymentInput): string | null {
  const { insuredSalaries, age, dependents, usedMonths } = input;
  if (insuredSalaries.length !== 1 && insuredSalaries.length !== 6) return '請輸入平均月投保薪資或 6 個月的月投保薪資。';
  if (![...insuredSalaries, age, dependents, usedMonths].every(Number.isFinite)) return '請輸入完整的數字。';
  if (insuredSalaries.some((s) => s < 0)) return '月投保薪資不可為負數。';
  if (insuredSalaries.reduce((a, b) => a + b, 0) <= 0) return '月投保薪資需大於 0。';
  if (!Number.isInteger(age) || age < 15 || age > 100) return '年齡請輸入 15 到 100 的整數。';
  if (!Number.isInteger(dependents) || dependents < 0) return '眷屬人數請輸入 0 或正整數。';
  if (input.history === 'partial' && (usedMonths < 0 || usedMonths > UNEMPLOYMENT_RULES.extendedMonths))
    return '已領月數請輸入 0 到 9。';
  return null;
}

/** 平均月投保薪資：每月先套用上限，再加總 ÷ 月數。 */
export function averageInsured(salaries: readonly number[]): { average: number; capped: boolean } {
  const cap = UNEMPLOYMENT_RULES.maxInsuredSalary;
  const clamped = salaries.map((s) => Math.min(s, cap));
  return {
    average: clamped.reduce((a, b) => a + b, 0) / clamped.length,
    capped: salaries.some((s) => s > cap),
  };
}

export function benefitRatePct(dependents: number): number {
  const r = UNEMPLOYMENT_RULES;
  return r.baseRatePct + Math.min(Math.max(dependents, 0), r.maxDependents) * r.dependentRatePct;
}

export function entitlementMonths(age: number, disability: boolean): number {
  const r = UNEMPLOYMENT_RULES;
  return disability || age >= r.extendedAge ? r.extendedMonths : r.normalMonths;
}

export function availableMonths(entitlement: number, history: History, usedMonths = 0): number {
  if (history === 'reapply') return entitlement / 2;
  if (history === 'partial') return Math.max(0, entitlement - usedMonths);
  return entitlement;
}

export function calculateUnemployment(input: UnemploymentInput): UnemploymentResult | null {
  if (validateUnemployment(input)) return null;
  const { average, capped } = averageInsured(input.insuredSalaries);
  const ratePct = benefitRatePct(input.dependents);
  const cap = UNEMPLOYMENT_RULES.maxInsuredSalary;
  const sum = input.insuredSalaries.reduce((s, x) => s + Math.min(x, cap), 0);
  const monthly = roundDiv(Math.round(sum) * ratePct, 100 * input.insuredSalaries.length);
  const entitlement = entitlementMonths(input.age, input.disability);
  const available = availableMonths(entitlement, input.history, input.usedMonths);
  return {
    averageInsured: average,
    cappedSalaries: capped,
    ratePct,
    monthly,
    entitlementMonths: entitlement,
    availableMonths: available,
    total: Math.round(monthly * available),
    maxMonthly: roundDiv(cap * ratePct, 100),
  };
}

/**
 * 提早就業獎助津貼：失業給付期間屆滿前再就業並參加就業保險滿 3 個月，
 * 按尚未請領之失業給付金額（最後 1 次月領金額 × 剩餘月數）50% 一次發給。
 */
export function earlyEmploymentAllowance(monthly: number, available: number, receivedMonths: number): {
  remainingMonths: number;
  allowance: number;
} {
  const remainingMonths = Math.max(0, available - Math.max(0, receivedMonths));
  return {
    remainingMonths,
    allowance: Math.round((monthly * remainingMonths * UNEMPLOYMENT_RULES.earlyAllowancePct) / 100),
  };
}

export interface WorkIncomeResult {
  /** 當月實際可領失業給付。 */
  benefit: number;
  deduction: number;
  /** 工作收入超過最低工資，當月不得請領。 */
  disqualified: boolean;
  /** 平均月投保薪資 80%。 */
  cap: number;
  minWage: number;
}

/** 就業保險法第 17 條：失業期間另有工作收入時，當月失業給付的扣除。 */
export function adjustForWorkIncome(
  monthly: number,
  average: number,
  income: number,
  year: WageYear = 2026,
): WorkIncomeResult {
  const minWage = UNEMPLOYMENT_RULES.minWage[year];
  const cap = Math.round((average * UNEMPLOYMENT_RULES.workIncomeCapPct) / 100);
  if (income > minWage) return { benefit: 0, deduction: monthly, disqualified: true, cap, minWage };
  const sum = income + monthly;
  if (sum < minWage) return { benefit: monthly, deduction: 0, disqualified: false, cap, minWage };
  const deduction = Math.min(monthly, Math.max(0, sum - cap));
  return { benefit: monthly - deduction, deduction, disqualified: false, cap, minWage };
}

export interface EligibilityAnswers {
  /** 非自願離職（資遣、關廠歇業、定期契約屆滿等）。 */
  involuntary: boolean;
  /** 離職退保當日前 3 年內，就業保險年資合計滿 1 年。 */
  insuredOneYear: boolean;
  /** 具有工作能力及繼續工作意願，已（將）向公立就業服務機構辦理求職登記。 */
  registered: boolean;
  /** 未領取勞保老年給付或公教人員保險養老給付。 */
  noOldAgeBenefit: boolean;
}

export const ELIGIBILITY_LABELS: Record<keyof EligibilityAnswers, string> = {
  involuntary: '非自願離職（資遣、關廠歇業、依勞基法第 14 條終止契約，或定期契約屆滿逾 1 個月未就業且前 1 年內契約合計滿 6 個月）',
  insuredOneYear: '離職退保當日前 3 年內，就業保險年資合計滿 1 年',
  registered: '具工作能力與意願，向就業服務站辦理求職登記，14 日內無法推介就業或安排職訓',
  noOldAgeBenefit: '未領取勞保老年給付或公教人員保險養老給付',
};

export const ELIGIBILITY_SHORT: Record<keyof EligibilityAnswers, string> = {
  involuntary: '非自願離職',
  insuredOneYear: '3 年內就保年資滿 1 年',
  registered: '辦理求職登記',
  noOldAgeBenefit: '未領老年或養老給付',
};

export function missingEligibility(answers: EligibilityAnswers): (keyof EligibilityAnswers)[] {
  return (Object.keys(ELIGIBILITY_LABELS) as (keyof EligibilityAnswers)[]).filter((k) => !answers[k]);
}

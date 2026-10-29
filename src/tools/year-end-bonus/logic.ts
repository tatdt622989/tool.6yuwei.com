/**
 * 年終獎金試算：所得稅預扣 5% 與二代健保補充保險費。
 *
 * 所得稅（各類所得扣繳率標準第 2 條第 1 項第 1 款、薪資所得扣繳辦法）：
 * - 非每月給付之薪資（年終、三節獎金、紅利）按「每次給付額」扣取 5%，免併入全月給付總額扣繳；
 *   每次給付金額未達薪資所得扣繳稅額表無配偶及受扶養親屬者之起扣標準者免予扣繳。
 * - 起扣標準 115 年度為 90,501 元。來源：財政部全國稅務入口網「薪資所得如何辦理扣繳」
 *   https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/individual-income-tax/withheld-rule/rule/NM11BZY
 * - 116 年度（2027 年發放）薪資所得扣繳稅額表依慣例於 2026 年 12 月公告，截至 2026-10-29 尚未公告，暫沿用 90,501 元。
 * - 扣繳稅額元以下捨去（實務作法；5% 只在給付額非 20 的倍數時才有小數，差額不超過 1 元）。
 * - 非境內居住者（在臺未滿 183 天的外籍人士）按給付額扣取 18%，本工具不處理。
 *
 * 二代健保補充保險費（全民健康保險法第 31 條第 1 項第 1 款、第 33 條；健保署「二代健保補充保險費簡介」115.01.05 版）：
 * - 費率 2.11%（自 110-01-01 起）。https://www.nhi.gov.tw/ch/dl-26429-47de962ef1464d8f91828d4421028290-1.pdf
 * - 費基：同一投保單位給付所屬被保險人、未列入投保金額且具獎勵性質之獎金，當年度累計超過「當月投保金額 4 倍」的部分；
 *   每次給付時以「全年累計獎金 − 當月投保金額 × 4 − 先前已計費部分」為該次費基，最多為該次給付額。
 * - 單次給付超過 1,000 萬元者，以 1,000 萬元計。
 * - 補充保險費計算至元，元以下四捨五入。健保署 Q&A 例：投保金額 30,300 元，2 月領 10 萬、10 月再領 10 萬，
 *   第二次應扣 (200,000 − 121,200) × 2.11% = 1,662.68 ≈ 1,663 元。
 * - 離職後才發放的獎金，以離職當月的投保金額計算 4 倍門檻（健保署扣取及繳納補充保險費實務手冊）。
 * - 2025-11 衛福部曾提出改以最低工資 4 倍為門檻、上限提高至 5,000 萬元的修法構想，行政院已決議暫緩，現行規定不變。
 */
import { INSURANCE_2026, gradeFor, roundDiv } from '../salary-calculator/logic';

export const BONUS_RULES = {
  /** 發放年度 → 非每月薪資起扣標準與是否為已公告數字。 */
  withholdingThreshold: {
    2026: { amount: 90_501, label: '115 年度', official: true },
    2027: { amount: 90_501, label: '116 年度（尚未公告，暫用 115 年度標準）', official: false },
  },
  /** 非每月給付薪資扣繳率，%。 */
  withholdingRatePct: 5,
  /** 二代健保補充保險費率，萬分比（2.11%）。 */
  supplementaryRateBp: 211,
  /** 累計獎金超過當月投保金額幾倍才計費。 */
  insuredMultiple: 4,
  /** 單次給付計費上限。 */
  singlePaymentCap: 10_000_000,
} as const;

export type PayYear = keyof typeof BONUS_RULES.withholdingThreshold;

/** 依月薪對照健保投保金額（2026 年分級表）。 */
export function healthInsuredFor(salary: number): number {
  return gradeFor(salary, INSURANCE_2026.healthGrades);
}

export interface BonusAmountInput {
  /** 月薪，元。 */
  salary: number;
  mode: 'months' | 'fixed';
  /** 年終月數，例如 1.5。 */
  months: number;
  /** 固定金額，元。 */
  fixedAmount: number;
  /** 依本年度在職月數比例發放。 */
  prorate: boolean;
  /** 本年度在職月數 0–12（可有小數）。 */
  employedMonths: number;
}

/** 年終獎金總額（四捨五入到元）。 */
export function grossBonus(input: BonusAmountInput): number {
  const base = input.mode === 'months' ? input.salary * input.months : input.fixedAmount;
  const ratio = input.prorate ? Math.min(Math.max(input.employedMonths, 0), 12) / 12 : 1;
  return Math.round(base * ratio);
}

/** 所得稅預扣：單次給付達起扣標準時按給付額扣 5%，元以下捨去。 */
export function withholdingTax(bonus: number, year: PayYear = 2026): number {
  const threshold = BONUS_RULES.withholdingThreshold[year].amount;
  if (bonus < threshold) return 0;
  return Math.floor((bonus * BONUS_RULES.withholdingRatePct) / 100);
}

export interface SupplementaryResult {
  /** 4 倍門檻 = 當月投保金額 × 4。 */
  threshold: number;
  /** 本次計費基礎。 */
  base: number;
  /** 本次補充保險費。 */
  premium: number;
  /** 本次發放後，今年還可再領多少獎金不需扣補充保費。 */
  remainingRoom: number;
  /** 費基被 1,000 萬元上限截斷。 */
  capped: boolean;
}

/**
 * 二代健保補充保費。priorBonus 為今年同一雇主已發放的獎金（三節獎金、績效獎金等），
 * 假設先前各次的投保金額與本次相同，先前已計費部分 = max(0, prior − 4 倍)。
 */
export function supplementaryPremium(bonus: number, insured: number, priorBonus = 0): SupplementaryResult {
  const threshold = insured * BONUS_RULES.insuredMultiple;
  const before = Math.max(0, priorBonus - threshold);
  const after = Math.max(0, priorBonus + bonus - threshold);
  const uncapped = Math.min(bonus, after - before);
  const base = Math.min(uncapped, BONUS_RULES.singlePaymentCap);
  return {
    threshold,
    base,
    premium: roundDiv(base * BONUS_RULES.supplementaryRateBp, 10_000),
    remainingRoom: Math.max(0, threshold - priorBonus - bonus),
    capped: uncapped > BONUS_RULES.singlePaymentCap,
  };
}

export interface YearEndBonusInput extends BonusAmountInput {
  /** 健保投保金額；undefined 代表依月薪自動對照級距。 */
  insuredOverride?: number;
  /** 今年同一雇主已領的其他獎金，元。 */
  priorBonus: number;
  payYear: PayYear;
}

export interface YearEndBonusResult {
  gross: number;
  insured: number;
  tax: number;
  taxApplies: boolean;
  taxThreshold: number;
  nhi: SupplementaryResult;
  net: number;
  /** 實領佔總額比例 0–1。 */
  netRatio: number;
}

export function validateYearEndBonus(input: YearEndBonusInput): string | null {
  const nums = [input.salary, input.months, input.fixedAmount, input.employedMonths, input.priorBonus];
  if (!nums.every(Number.isFinite)) return '請輸入完整的數字。';
  if (input.mode === 'months') {
    if (input.salary <= 0) return '月薪需大於 0。';
    if (input.salary > 10_000_000) return '月薪請輸入 1,000 萬元以下。';
    if (input.months < 0 || input.months > 60) return '年終月數請輸入 0 到 60 之間。';
  } else if (input.fixedAmount < 0 || input.fixedAmount > 1_000_000_000) {
    return '年終金額請輸入 0 到 10 億元之間。';
  } else if (input.salary < 0) {
    return '月薪不可為負數。';
  }
  if (input.prorate && (input.employedMonths < 0 || input.employedMonths > 12)) return '在職月數請輸入 0 到 12。';
  if (input.priorBonus < 0) return '已領獎金不可為負數。';
  if (input.insuredOverride !== undefined && (!Number.isFinite(input.insuredOverride) || input.insuredOverride <= 0))
    return '健保投保金額需大於 0。';
  if (input.insuredOverride === undefined && input.salary <= 0) return '請輸入月薪或健保投保金額，才能計算補充保費門檻。';
  return null;
}

export function calculateYearEndBonus(input: YearEndBonusInput): YearEndBonusResult | null {
  if (validateYearEndBonus(input)) return null;
  const gross = grossBonus(input);
  const insured = Math.round(input.insuredOverride ?? healthInsuredFor(input.salary));
  const taxThreshold = BONUS_RULES.withholdingThreshold[input.payYear].amount;
  const tax = withholdingTax(gross, input.payYear);
  const nhi = supplementaryPremium(gross, insured, Math.round(input.priorBonus));
  const net = gross - tax - nhi.premium;
  return {
    gross,
    insured,
    tax,
    taxApplies: gross >= taxThreshold,
    taxThreshold,
    nhi,
    net,
    netRatio: gross > 0 ? net / gross : 1,
  };
}

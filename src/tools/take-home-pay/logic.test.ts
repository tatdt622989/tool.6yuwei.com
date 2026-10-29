import { describe, expect, it } from 'vitest';
import {
  annualIncomeTax,
  basicDeduction2026,
  bonusSocialInsurance,
  calculateTakeHome,
  halfPremium,
  healthStandard,
  incomeTaxBeforeReconstruction,
  monthlyFromAnnual,
  monthlySocialInsurance,
  monthlyWithholding,
  pensionStandard,
  residentTax,
  roundEmployeeShare,
  salaryIncome2025,
  salaryIncome2026,
  spouseDeduction,
  validate,
  withholdingBasicDeduction,
  withholdingSalaryDeduction,
  type TakeHomeInput,
} from './logic';
import { HEALTH_GRADES, PREFECTURE_HEALTH_RATES } from './rates';

const none = { spouse: false, dependents: 0, specificDependents: 0 };

describe('rates', () => {
  it('has all 47 prefectures with the 令和8年度 協会けんぽ rates', () => {
    expect(PREFECTURE_HEALTH_RATES).toHaveLength(47);
    const rate = (n: string) => PREFECTURE_HEALTH_RATES.find((p) => p.name === n)!.bp;
    expect(rate('東京都')).toBe(985);
    expect(rate('大阪府')).toBe(1013);
    expect(rate('愛知県')).toBe(993);
    expect(rate('新潟県')).toBe(921); // 最低
    expect(rate('佐賀県')).toBe(1055); // 最高
    expect(rate('沖縄県')).toBe(944);
  });

  it('has 50 health grades from 58,000 to 1,390,000', () => {
    expect(HEALTH_GRADES).toHaveLength(50);
    expect(HEALTH_GRADES[0].standard).toBe(58_000);
    expect(HEALTH_GRADES[49].standard).toBe(1_390_000);
  });
});

describe('端数処理（50 銭以下切り捨て・50 銭超切り上げ）', () => {
  it('rounds the employee share like the 協会けんぽ table notes', () => {
    expect(roundEmployeeShare(2_8565, 10)).toBe(2_856); // 2,856.5 → 2,856
    expect(roundEmployeeShare(667, 10)).toBe(67); // 66.7 → 67
    expect(roundEmployeeShare(28_566, 10)).toBe(2_857); // 2,856.6 → 2,857
    expect(roundEmployeeShare(1_500, 1)).toBe(1_500);
  });
});

describe('標準報酬月額と保険料（協会けんぽ東京支部 令和8年3月分〜の保険料額表）', () => {
  it('looks up the standard monthly remuneration', () => {
    expect(healthStandard(62_999)).toBe(58_000);
    expect(healthStandard(63_000)).toBe(68_000);
    expect(healthStandard(300_000)).toBe(300_000);
    expect(healthStandard(289_999)).toBe(280_000);
    expect(healthStandard(2_000_000)).toBe(1_390_000);
    expect(pensionStandard(50_000)).toBe(88_000);
    expect(pensionStandard(1_000_000)).toBe(650_000);
  });

  it('matches the Tokyo table (9.85% / 11.47% / 0.23% / 18.3%)', () => {
    // 22(19) 等級 300,000
    expect(halfPremium(300_000, 985)).toBe(14_775);
    expect(halfPremium(300_000, 1147)).toBe(17_205);
    expect(halfPremium(300_000, 23)).toBe(345);
    expect(halfPremium(300_000, 1830)).toBe(27_450);
    // 1 等級 58,000：2,856.5 → 2,856、支援金 66.7 → 67
    expect(halfPremium(58_000, 985)).toBe(2_856);
    expect(halfPremium(58_000, 23)).toBe(67);
    // 27(24) 等級 410,000：20,192.5 → 20,192、介護あり 23,513.5 → 23,513、支援金 471.5 → 471
    expect(halfPremium(410_000, 985)).toBe(20_192);
    expect(halfPremium(410_000, 1147)).toBe(23_513);
    expect(halfPremium(410_000, 23)).toBe(471);
    // 50 等級 1,390,000：68,457.5 → 68,457
    expect(halfPremium(1_390_000, 985)).toBe(68_457);
    // 厚生年金 35(32) 等級 650,000 → 59,475、4(1) 等級 88,000 → 8,052
    expect(halfPremium(650_000, 1830)).toBe(59_475);
    expect(halfPremium(88_000, 1830)).toBe(8_052);
  });

  it('computes monthly social insurance incl. 雇用保険 5/1000 on salary + commute', () => {
    const s = monthlySocialInsurance({ salary: 290_000, commute: 10_000, prefecture: '東京都', care: false, employment: 'general' });
    expect(s.healthStandard).toBe(300_000);
    expect(s.health).toBe(14_775);
    expect(s.childSupport).toBe(345);
    expect(s.pension).toBe(27_450);
    expect(s.employment).toBe(1_500);
    expect(s.total).toBe(44_070);

    const care = monthlySocialInsurance({ salary: 300_000, commute: 0, prefecture: '東京都', care: true, employment: 'construction' });
    expect(care.health).toBe(17_205);
    expect(care.employment).toBe(1_800);
  });

  it('rounds 雇用保険 the same way', () => {
    // 123,456 × 5/1000 = 617.28 → 617、123,500 × 5/1000 = 617.5 → 617、123,700 × 5/1000 = 618.5 → 618
    const emp = (salary: number) =>
      monthlySocialInsurance({ salary, commute: 0, prefecture: '東京都', care: false, employment: 'general' }).employment;
    expect(emp(123_456)).toBe(617);
    expect(emp(123_500)).toBe(617);
    expect(emp(123_700)).toBe(618);
  });
});

describe('賞与の社会保険料', () => {
  const base = { prefecture: '東京都', care: false, employment: 'general' as const };

  it('splits the annual bonus evenly and floors the standard bonus to 1,000 yen', () => {
    const b = bonusSocialInsurance(1_000_000, 2, base);
    expect(b.health).toBe(24_625 * 2);
    expect(b.childSupport).toBe(575 * 2);
    expect(b.pension).toBe(45_750 * 2);
    expect(b.employment).toBe(2_500 * 2);
    expect(b.total).toBe(49_250 + 1_150 + 91_500 + 5_000);
  });

  it('caps pension at 1.5M per payment and health at 5.73M per year', () => {
    const p = bonusSocialInsurance(4_000_000, 2, base);
    expect(p.pension).toBe(halfPremium(1_500_000, 1830) * 2);
    const h = bonusSocialInsurance(7_000_000, 2, base);
    expect(h.health).toBe(halfPremium(3_500_000, 985) + halfPremium(2_230_000, 985));
  });

  it('returns zero without a bonus', () => {
    expect(bonusSocialInsurance(0, 2, base).total).toBe(0);
  });
});

describe('源泉徴収（令和8年分 電算機計算の特例）', () => {
  it('uses 別表第一 and 別表第三', () => {
    expect(withholdingSalaryDeduction(150_000)).toBe(54_167);
    expect(withholdingSalaryDeduction(255_930)).toBe(83_446); // 76,779 + 6,667
    expect(withholdingSalaryDeduction(356_600)).toBe(107_987);
    expect(withholdingSalaryDeduction(600_000)).toBe(151_667);
    expect(withholdingSalaryDeduction(1_000_000)).toBe(162_500);
    expect(withholdingBasicDeduction(2_120_833)).toBe(48_334);
    expect(withholdingBasicDeduction(2_200_000)).toBe(26_667);
    expect(withholdingBasicDeduction(3_000_000)).toBe(0);
  });

  it('computes 6,340 yen for 255,930 yen with no dependents', () => {
    // B = 255,930 − 83,446 − 48,334 = 124,150 → × 5.105% = 6,337.8… → 6,340
    expect(monthlyWithholding(255_930, 0)).toBe(6_340);
  });

  it('is within 10 yen of the official 月額表 at the middle of each row', () => {
    // 国税庁「令和8年分 源泉徴収税額表」21 ページの抜粋（その月の社会保険料等控除後の給与等の金額）
    const rows: [number, number, number[]][] = [
      [332_000, 335_000, [10_260, 7_670, 6_040, 4_430, 2_820, 1_190]],
      [341_000, 344_000, [11_000, 8_040, 6_410, 4_800, 3_190, 1_560]],
      [350_000, 353_000, [11_730, 8_500, 6_780, 5_170, 3_550, 1_930]],
      [356_000, 359_000, [12_220, 9_000, 7_020, 5_410, 3_800, 2_170]],
      [365_000, 368_000, [12_960, 9_730, 7_390, 5_780, 4_170, 2_540]],
      [377_000, 380_000, [13_940, 10_710, 7_880, 6_270, 4_660, 3_030]],
    ];
    for (const [lo, hi, taxes] of rows) {
      taxes.forEach((tax, dependents) => {
        expect(Math.abs(monthlyWithholding((lo + hi) / 2, dependents) - tax)).toBeLessThanOrEqual(10);
      });
    }
  });

  it('matches the 国税庁 設例 (420,000 − 63,400 = 356,600 yen, 2 人 → 7,020 円 in the table) within 30 yen', () => {
    // 電算機計算の特例は行の幅で丸めないため、表の値と数十円ずれることがある
    expect(monthlyWithholding(356_600, 2)).toBe(6_990);
  });

  it('returns 0 for low salaries', () => {
    expect(monthlyWithholding(100_000, 0)).toBe(0);
    expect(monthlyWithholding(0, 0)).toBe(0);
  });
});

describe('給与所得（令和8年分の年末調整等のための表と算式）', () => {
  it('applies the 74万円 minimum and the special table up to 220万円', () => {
    expect(salaryIncome2026(740_000)).toBe(0);
    expect(salaryIncome2026(741_000)).toBe(1_000);
    expect(salaryIncome2026(1_030_000)).toBe(290_000);
    expect(salaryIncome2026(1_780_000)).toBe(1_040_000);
    expect(salaryIncome2026(2_060_000)).toBe(1_320_000);
    expect(salaryIncome2026(2_190_999)).toBe(1_450_000);
    expect(salaryIncome2026(2_191_000)).toBe(1_451_000);
    expect(salaryIncome2026(2_193_000)).toBe(1_453_000);
    expect(salaryIncome2026(2_196_000)).toBe(1_456_000);
    expect(salaryIncome2026(2_200_000)).toBe(1_460_000);
  });

  it('uses the unchanged table above 220万円 (boundaries quoted by 国税庁)', () => {
    expect(salaryIncome2026(3_600_000)).toBe(2_440_000);
    expect(salaryIncome2026(4_751_999)).toBe(3_358_400); // ≤ 336 万円
    expect(salaryIncome2026(4_752_000)).toBeGreaterThan(3_360_000);
    expect(salaryIncome2026(6_655_556)).toBe(4_890_000); // 489 万円以下の上限
    expect(salaryIncome2026(6_655_557)).toBe(4_890_001);
    expect(salaryIncome2026(8_500_000)).toBe(6_550_000);
    expect(salaryIncome2026(25_450_000)).toBe(23_500_000);
  });

  it('uses the 65万円 minimum for 令和7年分 (令和8年度住民税)', () => {
    expect(salaryIncome2025(650_000)).toBe(0);
    expect(salaryIncome2025(1_100_000)).toBe(450_000);
    expect(salaryIncome2025(1_899_999)).toBe(1_249_999);
    expect(salaryIncome2025(1_900_000)).toBe(1_250_000);
    expect(salaryIncome2025(3_600_000)).toBe(2_440_000);
  });
});

describe('基礎控除・配偶者控除・税率（令和8年分）', () => {
  it('raises the basic deduction by income tier', () => {
    expect(basicDeduction2026(1_320_000)).toBe(1_040_000);
    expect(basicDeduction2026(4_890_000)).toBe(1_040_000);
    expect(basicDeduction2026(4_890_001)).toBe(670_000);
    expect(basicDeduction2026(6_550_000)).toBe(670_000);
    expect(basicDeduction2026(6_550_001)).toBe(620_000);
    expect(basicDeduction2026(23_500_000)).toBe(620_000);
    expect(basicDeduction2026(24_000_000)).toBe(480_000);
    expect(basicDeduction2026(24_500_000)).toBe(320_000);
    expect(basicDeduction2026(25_000_000)).toBe(160_000);
    expect(basicDeduction2026(25_000_001)).toBe(0);
  });

  it('reduces the spouse deduction above 900万円', () => {
    expect(spouseDeduction(9_000_000, 'income')).toBe(380_000);
    expect(spouseDeduction(9_400_000, 'income')).toBe(260_000);
    expect(spouseDeduction(9_900_000, 'income')).toBe(130_000);
    expect(spouseDeduction(10_000_001, 'income')).toBe(0);
    expect(spouseDeduction(5_000_000, 'resident')).toBe(330_000);
  });

  it('uses the 速算表', () => {
    expect(incomeTaxBeforeReconstruction(1_949_000)).toBe(97_450);
    expect(incomeTaxBeforeReconstruction(3_000_000)).toBe(202_500);
    expect(incomeTaxBeforeReconstruction(7_000_000)).toBe(974_000);
    expect(incomeTaxBeforeReconstruction(0)).toBe(0);
  });

  it('makes 年収 178 万円 the income tax threshold for a salary-only single person', () => {
    expect(annualIncomeTax(1_780_000, 0, none).tax).toBe(0);
    // 180 万円：給与所得 106 万 − 基礎控除 104 万 = 2 万 → 1,000 × 102.1% = 1,021 → 1,000
    expect(annualIncomeTax(1_800_000, 0, none).tax).toBe(1_000);
  });

  it('computes the year-end tax with deductions', () => {
    const t = annualIncomeTax(3_600_000, 528_840, none);
    expect(t.salaryIncome).toBe(2_440_000);
    expect(t.basic).toBe(1_040_000);
    expect(t.taxable).toBe(871_000);
    expect(t.tax).toBe(44_400); // 43,550 × 1.021 = 44,464 → 44,400

    const f = annualIncomeTax(6_000_000, 900_000, { spouse: true, dependents: 1, specificDependents: 1 });
    // 給与所得 4,360,000 − (1,040,000 + 380,000 + 380,000 + 630,000 + 900,000) = 1,030,000 → 51,500 × 1.021 → 52,500
    expect(f.salaryIncome).toBe(4_360_000);
    expect(f.taxable).toBe(1_030_000);
    expect(f.tax).toBe(52_500);
  });
});

describe('住民税の概算（令和8年度）', () => {
  it('is zero up to 年収 110 万円 for a single person', () => {
    expect(residentTax(1_100_000, 0, none).total).toBe(0);
  });

  it('charges 均等割 and a small 所得割 just above the line', () => {
    const r = residentTax(1_110_000, 0, none);
    // 給与所得 46 万 − 基礎控除 43 万 = 3 万 → 市 1,800 − 900、県 1,200 − 600
    expect(r.incomeLevy).toBe(1_500);
    expect(r.total).toBe(6_500);
  });

  it('computes 10% minus 調整控除 for a typical salary', () => {
    const r = residentTax(3_600_000, 528_840, none);
    expect(r.taxable).toBe(1_481_000);
    expect(r.incomeLevy).toBe(87_300 + 58_200);
    expect(r.total).toBe(150_500);
    expect(r.monthly).toBe(12_500);
  });

  it('raises the non-taxable line with dependents', () => {
    // 扶養 1 人：均等割の非課税限度額 35 万 × 2 + 10 万 + 21 万 = 101 万（給与所得）
    expect(residentTax(1_660_000, 0, { spouse: true, dependents: 0, specificDependents: 0 }).total).toBe(0);
    expect(residentTax(1_670_000, 0, { spouse: true, dependents: 0, specificDependents: 0 }).total).toBeGreaterThan(0);
  });
});

describe('calculateTakeHome', () => {
  const input: TakeHomeInput = {
    salary: 300_000,
    commute: 0,
    prefecture: '東京都',
    care: false,
    employment: 'general',
    bonus: 0,
    bonusTimes: 2,
    spouse: false,
    dependents: 0,
    specificDependents: 0,
    residentMode: 'estimate',
    residentMonthly: 0,
  };

  it('東京都・30 歳・月給 30 万円・扶養なし', () => {
    const r = calculateTakeHome(input);
    expect(r.monthly.social.total).toBe(44_070);
    expect(r.monthly.incomeTax).toBe(6_340);
    expect(r.monthly.resident).toBe(12_500);
    expect(r.monthly.takeHome).toBe(300_000 - 44_070 - 6_340 - 12_500);
    expect(r.annual.social).toBe(528_840);
    expect(r.annual.incomeTax.tax).toBe(44_400);
    expect(r.annual.resident).toBe(150_500);
    expect(r.annual.takeHome).toBe(3_600_000 - 528_840 - 44_400 - 150_500);
  });

  it('adds commute allowance to gross and social insurance but not to tax', () => {
    const r = calculateTakeHome({ ...input, salary: 290_000, commute: 10_000 });
    expect(r.monthly.gross).toBe(300_000);
    expect(r.monthly.social.total).toBe(44_070);
    expect(r.monthly.incomeTax).toBe(monthlyWithholding(290_000 - 44_070, 0));
    expect(r.annual.incomeTax.salaryIncome).toBe(salaryIncome2026(3_480_000));
  });

  it('includes bonus insurance and tax in the annual view', () => {
    const r = calculateTakeHome({ ...input, bonus: 1_000_000 });
    expect(r.annual.gross).toBe(4_600_000);
    expect(r.annual.social).toBe(528_840 + r.bonus.total);
    expect(r.annual.incomeTax).toEqual(annualIncomeTax(4_600_000, 528_840 + r.bonus.total, none));
  });

  it('handles resident tax modes and dependents', () => {
    expect(calculateTakeHome({ ...input, residentMode: 'none' }).monthly.resident).toBe(0);
    const manual = calculateTakeHome({ ...input, residentMode: 'manual', residentMonthly: 9_800 });
    expect(manual.monthly.resident).toBe(9_800);
    expect(manual.annual.resident).toBe(117_600);
    const fam = calculateTakeHome({ ...input, spouse: true, dependents: 1 });
    expect(fam.dependentsCount).toBe(2);
    expect(fam.monthly.incomeTax).toBe(monthlyWithholding(255_930, 2));
  });

  it('does not count the spouse for withholding above 900万円 of income', () => {
    const r = calculateTakeHome({ ...input, salary: 1_000_000, spouse: true });
    expect(r.dependentsCount).toBe(0);
  });

  it('validates input', () => {
    expect(validate(input)).toBeNull();
    expect(validate({ ...input, salary: 0 })).not.toBeNull();
    expect(validate({ ...input, commute: -1 })).not.toBeNull();
    expect(validate({ ...input, residentMode: 'manual', residentMonthly: Number.NaN })).not.toBeNull();
  });

  it('derives the monthly salary from an annual amount', () => {
    expect(monthlyFromAnnual(5_000_000, 0)).toBe(416_666);
    expect(monthlyFromAnnual(5_000_000, 1_000_000)).toBe(333_333);
  });
});

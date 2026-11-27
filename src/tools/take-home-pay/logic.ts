/**
 * 会社員の手取り計算（2026 年・令和8年）。純関数。すべて概算。
 *
 * 出典（2026-10-29 確認）：
 * - 協会けんぽ「令和8年度の協会けんぽの保険料率は3月分（4月納付分）から改定されます」
 *   https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r08
 *   都道府県単位保険料率（全国平均 9.9%）、介護保険料率 1.62%、子ども・子育て支援金率 0.23%（令和8年4月分から）。
 * - 協会けんぽ 東京支部「令和8年3月分（4月納付分）からの健康保険・厚生年金保険の保険料額表」
 *   https://www.kyoukaikenpo.or.jp/assets/R8_13tokyo.pdf
 *   標準報酬月額の等級表、被保険者負担分の端数処理（給与から控除する場合 50 銭以下切り捨て・50 銭超切り上げ）、
 *   標準賞与額（1,000 円未満切り捨て、健保・介護・支援金は年度累計 573 万円、厚生年金は月 150 万円が上限）、厚生年金 18.3%。
 * - 厚生労働省 山形労働局「令和8年度の雇用保険料率について」https://jsite.mhlw.go.jp/yamagata-roudoukyoku/koyouhoken-20260316.html
 *   一般の事業 労働者負担 5/1000、農林水産・清酒製造／建設の事業 6/1000（令和8年4月1日〜）。
 * - 国税庁「令和8年分 源泉徴収税額表」https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/01.htm
 *   18 ページ「月額表の甲欄を適用する給与等に対する源泉徴収税額の電算機計算の特例」（別表第一〜第四）。
 *   ※ 令和8年 11 月までの毎月の源泉徴収はこの表（改正前）のまま。21 ページの月額表の設例（356,600 円・2 人 → 7,020 円）。
 * - 国税庁「令和8年分 年末調整のしかた」3〜4 ページ「昨年と比べて変わった点」
 *   https://www.nta.go.jp/publication/pamph/gensen/nencho2026/pdf/102.pdf
 *   令和8年度税制改正（令和8年12月1日施行、令和8年分以後の所得税に適用）：
 *   基礎控除 合計所得 489 万円以下 104 万円／655 万円以下 67 万円／2,350 万円以下 62 万円、
 *   給与所得控除の最低保障額 74 万円（令和8・9年分、収入 220 万円以下）、
 *   収入 69.1 万〜220 万円の給与所得の特例表、扶養親族の所得要件 62 万円以下。
 * - 国税庁 タックスアンサー No.2260 所得税の税率（速算表）、No.1410 給与所得控除。
 * - 個人住民税（令和8年度＝令和7年分の所得が対象）：総務省「個人住民税」、京都市資料
 *   https://www2.city.kyoto.lg.jp/shikai/img/iinkai/soumushoubou/R08/data/080525gyouzai.pdf
 *   所得割 10%（市町村 6%・道府県 4%）、均等割 4,000 円 + 森林環境税 1,000 円、基礎控除 43 万円、
 *   給与所得控除の最低保障額 65 万円（令和8年度）、所得割の非課税限度額 45 万円（単身）、調整控除。
 */
import {
  CARE_RATE_BP,
  CHILD_SUPPORT_RATE_BP,
  EMPLOYMENT_RATES,
  HEALTH_BONUS_ANNUAL_CAP,
  HEALTH_GRADES,
  PENSION_BONUS_PER_PAYMENT_CAP,
  PENSION_MAX_STANDARD,
  PENSION_MIN_STANDARD,
  PENSION_RATE_BP,
  PREFECTURE_HEALTH_RATES,
  RESIDENT_PER_CAPITA,
  type EmploymentKind,
} from './rates';

// ------------------------------------------------------------------ 端数処理

/**
 * 給与から控除する被保険者負担分の端数処理：50 銭以下切り捨て、50 銭を超えると切り上げ。
 * amount = numerator / denominator（円）。浮動小数点誤差を避けるため整数で受け取る。
 */
export function roundEmployeeShare(numerator: number, denominator: number): number {
  const q = Math.floor(numerator / denominator);
  const r = numerator - q * denominator;
  return r * 2 > denominator ? q + 1 : q;
}

const floorTo = (n: number, unit: number) => Math.floor(n / unit) * unit;

// ------------------------------------------------------------------ 社会保険

/** 報酬月額 → 健康保険の標準報酬月額。 */
export function healthStandard(remuneration: number): number {
  let standard = HEALTH_GRADES[0].standard;
  for (const g of HEALTH_GRADES) if (remuneration >= g.from) standard = g.standard;
  return standard;
}

/** 報酬月額 → 厚生年金の標準報酬月額（88,000〜650,000 円）。 */
export function pensionStandard(remuneration: number): number {
  return Math.min(PENSION_MAX_STANDARD, Math.max(PENSION_MIN_STANDARD, healthStandard(remuneration)));
}

/** 標準報酬 × 料率（bp = % × 100）の被保険者負担分（折半）。 */
export function halfPremium(standard: number, rateBp: number): number {
  return roundEmployeeShare(standard * rateBp, 20_000);
}

export function prefectureRateBp(prefecture: string): number {
  const p = PREFECTURE_HEALTH_RATES.find((x) => x.name === prefecture);
  if (!p) throw new Error(`Unknown prefecture: ${prefecture}`);
  return p.bp;
}

export interface SocialInsuranceInput {
  /** 毎月の給与（通勤手当を除く、残業代など毎月の手当を含む）。 */
  salary: number;
  /** 通勤手当（月額）。社会保険・雇用保険の対象、所得税は非課税（月 15 万円まで）。 */
  commute: number;
  prefecture: string;
  /** 40〜64 歳（介護保険第2号被保険者）。 */
  care: boolean;
  employment: EmploymentKind;
}

export interface MonthlySocial {
  healthStandard: number;
  pensionStandard: number;
  /** 健康保険料（介護保険料を含む）。 */
  health: number;
  /** うち介護保険分を分けずに、健保と介護の合計料率で計算した額。 */
  healthRateBp: number;
  childSupport: number;
  pension: number;
  employment: number;
  total: number;
}

/** 毎月の社会保険料（被保険者負担分）。標準報酬月額は給与 + 通勤手当で決まるものとする。 */
export function monthlySocialInsurance(input: SocialInsuranceInput): MonthlySocial {
  const remuneration = input.salary + input.commute;
  const hs = healthStandard(remuneration);
  const ps = pensionStandard(remuneration);
  const healthRateBp = prefectureRateBp(input.prefecture) + (input.care ? CARE_RATE_BP : 0);
  const health = halfPremium(hs, healthRateBp);
  const childSupport = halfPremium(hs, CHILD_SUPPORT_RATE_BP);
  const pension = halfPremium(ps, PENSION_RATE_BP);
  const employment = roundEmployeeShare(remuneration * EMPLOYMENT_RATES[input.employment].permille, 1000);
  return {
    healthStandard: hs,
    pensionStandard: ps,
    health,
    healthRateBp,
    childSupport,
    pension,
    employment,
    total: health + childSupport + pension + employment,
  };
}

export interface BonusSocial {
  health: number;
  childSupport: number;
  pension: number;
  employment: number;
  total: number;
}

/** 年間の賞与に係る社会保険料（同額を年 `times` 回支給するものとして計算）。 */
export function bonusSocialInsurance(
  annualBonus: number,
  times: number,
  input: Omit<SocialInsuranceInput, 'salary' | 'commute'>,
): BonusSocial {
  const zero = { health: 0, childSupport: 0, pension: 0, employment: 0, total: 0 };
  if (!(annualBonus > 0) || times < 1) return zero;
  const each = Math.floor(annualBonus / times);
  const healthRateBp = prefectureRateBp(input.prefecture) + (input.care ? CARE_RATE_BP : 0);
  const permille = EMPLOYMENT_RATES[input.employment].permille;
  const r = { ...zero };
  let healthCumulative = 0;
  for (let i = 0; i < times; i++) {
    const standardBonus = floorTo(each, 1000);
    const healthBase = Math.max(0, Math.min(standardBonus, HEALTH_BONUS_ANNUAL_CAP - healthCumulative));
    healthCumulative += healthBase;
    const pensionBase = Math.min(standardBonus, PENSION_BONUS_PER_PAYMENT_CAP);
    r.health += halfPremium(healthBase, healthRateBp);
    r.childSupport += halfPremium(healthBase, CHILD_SUPPORT_RATE_BP);
    r.pension += halfPremium(pensionBase, PENSION_RATE_BP);
    r.employment += roundEmployeeShare(each * permille, 1000);
  }
  r.total = r.health + r.childSupport + r.pension + r.employment;
  return r;
}

// ------------------------------------------------------------------ 所得税（毎月の源泉徴収）

/** 令和8年分 月額表甲欄 電算機計算の特例：別表第一（給与所得控除の額）。1 円未満切り上げ。 */
export function withholdingSalaryDeduction(a: number): number {
  if (a <= 158_333) return 54_167;
  if (a <= 299_999) return Math.ceil((a * 3) / 10) + 6_667;
  if (a <= 549_999) return Math.ceil((a * 2) / 10) + 36_667;
  if (a <= 708_330) return Math.ceil(a / 10) + 91_667;
  return 162_500;
}

/** 別表第三（基礎控除の額）。 */
export function withholdingBasicDeduction(a: number): number {
  if (a <= 2_120_833) return 48_334;
  if (a <= 2_162_499) return 40_000;
  if (a <= 2_204_166) return 26_667;
  if (a <= 2_245_833) return 13_334;
  return 0;
}

/** 別表第二：配偶者（特別）控除・扶養控除の額（源泉控除対象親族 1 人につき）。 */
export const WITHHOLDING_DEPENDENT = 31_667;

/** 別表第四：課税給与所得金額 B に対する税額（復興特別所得税込み）。税率は 1/100000 %。10 円未満四捨五入。 */
const WITHHOLDING_TABLE: readonly [limit: number, rate: number, sub: number][] = [
  [162_500, 5_105, 0],
  [275_000, 10_210, 8_296],
  [579_166, 20_420, 36_374],
  [750_000, 23_483, 54_113],
  [1_500_000, 33_693, 130_688],
  [3_333_333, 40_840, 237_893],
  [Number.POSITIVE_INFINITY, 45_945, 408_061],
];

/**
 * 毎月の源泉徴収税額（月額表甲欄・電算機計算の特例、令和8年分）。
 * @param afterSocial その月の社会保険料等控除後の給与等の金額（A）
 * @param dependents 扶養親族等の数（源泉控除対象配偶者 + 源泉控除対象親族）
 */
export function monthlyWithholding(afterSocial: number, dependents: number): number {
  const a = Math.max(0, Math.floor(afterSocial));
  const b = a - withholdingSalaryDeduction(a) - withholdingBasicDeduction(a) - WITHHOLDING_DEPENDENT * dependents;
  if (b <= 0) return 0;
  const [, rate, sub] = WITHHOLDING_TABLE.find(([limit]) => b <= limit)!;
  // 税額（1e-5 円単位）= B × rate − sub × 100000。10 円 = 1e6 単位で四捨五入。
  const scaled = b * rate - sub * 100_000;
  if (scaled <= 0) return 0;
  return Math.floor((scaled + 500_000) / 1_000_000) * 10;
}

// ------------------------------------------------------------------ 所得税（年税額＝年末調整）

/**
 * 令和8年分の給与所得（給与所得控除後の金額）。「年末調整等のための給与所得控除後の給与等の金額の表」
 * （収入 660 万円未満は 4,000 円刻みの表、令和8・9年分の特例を反映）と、660 万円以上の算式。
 */
export function salaryIncome2026(income: number): number {
  const x = Math.max(0, Math.floor(income));
  if (x < 741_000) return 0;
  if (x < 2_191_000) return floorTo(x, 1000) - 740_000;
  if (x < 2_193_000) return 1_451_000;
  if (x < 2_196_000) return 1_453_000;
  if (x < 2_200_000) return 1_456_000;
  return salaryIncomeOver220(x);
}

/** 令和7年分（＝令和8年度住民税の計算に使う）給与所得。最低保障額 65 万円。 */
export function salaryIncome2025(income: number): number {
  const x = Math.max(0, Math.floor(income));
  if (x < 651_000) return 0;
  if (x < 1_900_000) return x - 650_000;
  if (x < 2_200_000) return Math.floor((floorTo(x, 4000) * 7) / 10) - 80_000;
  return salaryIncomeOver220(x);
}

/** 収入 220 万円以上は令和7・8年分とも同じ（所得税法別表第五と算式）。 */
function salaryIncomeOver220(x: number): number {
  if (x < 3_600_000) return Math.floor((floorTo(x, 4000) * 7) / 10) - 80_000;
  if (x < 6_600_000) return Math.floor((floorTo(x, 4000) * 8) / 10) - 440_000;
  if (x < 8_500_000) return Math.floor((x * 9) / 10) - 1_100_000;
  return x - 1_950_000;
}

/** 令和8年分の基礎控除（所得税、令和8年度税制改正後）。 */
export function basicDeduction2026(totalIncome: number): number {
  if (totalIncome <= 4_890_000) return 1_040_000;
  if (totalIncome <= 6_550_000) return 670_000;
  if (totalIncome <= 23_500_000) return 620_000;
  if (totalIncome <= 24_000_000) return 480_000;
  if (totalIncome <= 24_500_000) return 320_000;
  if (totalIncome <= 25_000_000) return 160_000;
  return 0;
}

/** 配偶者控除（一般の控除対象配偶者、70 歳未満）。本人の合計所得金額で段階的に減る。 */
export function spouseDeduction(totalIncome: number, kind: 'income' | 'resident'): number {
  const [a, b, c] = kind === 'income' ? [380_000, 260_000, 130_000] : [330_000, 220_000, 110_000];
  if (totalIncome <= 9_000_000) return a;
  if (totalIncome <= 9_500_000) return b;
  if (totalIncome <= 10_000_000) return c;
  return 0;
}

/** 所得税の速算表（課税所得金額は 1,000 円未満切り捨て済み）。 */
export function incomeTaxBeforeReconstruction(taxable: number): number {
  const brackets: [number, number, number][] = [
    [1_949_000, 5, 0],
    [3_299_000, 10, 97_500],
    [6_949_000, 20, 427_500],
    [8_999_000, 23, 636_000],
    [17_999_000, 33, 1_536_000],
    [39_999_000, 40, 2_796_000],
    [Number.POSITIVE_INFINITY, 45, 4_796_000],
  ];
  if (taxable <= 0) return 0;
  const [, pct, sub] = brackets.find(([limit]) => taxable <= limit)!;
  return Math.max(0, Math.floor((taxable * pct) / 100) - sub);
}

export interface Family {
  /** 控除対象配偶者（配偶者の所得 62 万円以下＝給与収入 136 万円以下）。 */
  spouse: boolean;
  /** 一般の控除対象扶養親族（16〜18 歳、23〜69 歳など）。 */
  dependents: number;
  /** 特定扶養親族（19〜22 歳）。 */
  specificDependents: number;
}

export interface AnnualIncomeTax {
  salaryIncome: number;
  basic: number;
  spouse: number;
  dependents: number;
  social: number;
  taxable: number;
  /** 年税額（所得税 + 復興特別所得税、100 円未満切り捨て）。 */
  tax: number;
}

/** 年末調整ベースの年税額（令和8年分）。給与以外の所得・その他の所得控除はないものとする。 */
export function annualIncomeTax(income: number, socialTotal: number, family: Family): AnnualIncomeTax {
  const si = salaryIncome2026(income);
  const basic = basicDeduction2026(si);
  const spouse = family.spouse ? spouseDeduction(si, 'income') : 0;
  const dependents = family.dependents * 380_000 + family.specificDependents * 630_000;
  const deductions = basic + spouse + dependents + socialTotal;
  const taxable = Math.max(0, floorTo(si - deductions, 1000));
  const base = incomeTaxBeforeReconstruction(taxable);
  const tax = floorTo(Math.floor((base * 1021) / 1000), 100);
  return { salaryIncome: si, basic, spouse, dependents, social: socialTotal, taxable, tax };
}

// ------------------------------------------------------------------ 住民税（概算）

export interface ResidentTax {
  taxable: number;
  incomeLevy: number;
  perCapita: number;
  /** 年税額。 */
  total: number;
  /** 6 月を除く毎月の天引き額（100 円未満は 6 月にまとめる）。 */
  monthly: number;
}

/**
 * 個人住民税の概算（令和8年度＝令和7年分の所得に課税。前年も同じ収入・社会保険料だったと仮定）。
 * 1 級地（東京 23 区・政令市など）の非課税限度額で判定。税額控除（住宅ローン・ふるさと納税など）は考慮しない。
 */
export function residentTax(income: number, socialTotal: number, family: Family): ResidentTax {
  const si = salaryIncome2025(income);
  const people = (family.spouse ? 1 : 0) + family.dependents + family.specificDependents;
  const zero = { taxable: 0, incomeLevy: 0, perCapita: 0, total: 0, monthly: 0 };
  // 均等割の非課税限度額（1 級地）：35 万円 × (本人 + 同一生計配偶者 + 扶養親族) + 10 万円 + 21 万円（扶養ありの場合）
  const perCapitaLimit = 350_000 * (1 + people) + 100_000 + (people > 0 ? 210_000 : 0);
  if (si <= perCapitaLimit) return zero;
  // 所得割の非課税限度額：35 万円 × (本人 + 扶養) + 10 万円 + 32 万円（扶養ありの場合）
  const incomeLevyLimit = 350_000 * (1 + people) + 100_000 + (people > 0 ? 320_000 : 0);

  const spouse = family.spouse ? spouseDeduction(si, 'resident') : 0;
  const deductions = 430_000 + spouse + family.dependents * 330_000 + family.specificDependents * 450_000 + socialTotal;
  const taxable = Math.max(0, floorTo(si - deductions, 1000));

  let incomeLevy = 0;
  if (si > incomeLevyLimit && taxable > 0) {
    // 調整控除：所得税との人的控除額の差（基礎 5 万、配偶者 5 万、一般扶養 5 万、特定扶養 18 万）
    const spouseDiff = !family.spouse ? 0 : si <= 9_000_000 ? 50_000 : si <= 9_500_000 ? 40_000 : si <= 10_000_000 ? 20_000 : 0;
    const diff = 50_000 + spouseDiff + family.dependents * 50_000 + family.specificDependents * 180_000;
    let adjBase = 0;
    if (si <= 25_000_000) {
      adjBase = taxable <= 2_000_000 ? Math.min(diff, taxable) : Math.max(diff - (taxable - 2_000_000), 50_000);
    }
    const city = floorTo(Math.max(0, Math.floor((taxable * 6) / 100) - Math.floor((adjBase * 3) / 100)), 100);
    const pref = floorTo(Math.max(0, Math.floor((taxable * 4) / 100) - Math.floor((adjBase * 2) / 100)), 100);
    incomeLevy = city + pref;
  }
  const total = incomeLevy + RESIDENT_PER_CAPITA;
  return { taxable, incomeLevy, perCapita: RESIDENT_PER_CAPITA, total, monthly: floorTo(Math.floor(total / 12), 100) };
}

// ------------------------------------------------------------------ まとめ

export type ResidentMode = 'estimate' | 'manual' | 'none';

export interface TakeHomeInput extends SocialInsuranceInput, Family {
  /** 年間の賞与（額面合計）。 */
  bonus: number;
  /** 賞与の支給回数（年）。 */
  bonusTimes: number;
  residentMode: ResidentMode;
  /** residentMode = 'manual' のときの住民税（月額）。 */
  residentMonthly: number;
}

export interface TakeHomeResult {
  monthly: {
    gross: number;
    social: MonthlySocial;
    incomeTax: number;
    resident: number;
    takeHome: number;
  };
  annual: {
    gross: number;
    salaryGross: number;
    bonusGross: number;
    commute: number;
    health: number;
    childSupport: number;
    pension: number;
    employment: number;
    social: number;
    incomeTax: AnnualIncomeTax;
    resident: number;
    takeHome: number;
    /** 毎月の源泉徴収 × 12 −（年税額のうち給与分の目安）。賞与の源泉分は含めない。 */
    withheldMonthly12: number;
  };
  bonus: BonusSocial;
  residentEstimate: ResidentTax;
  /** 扶養親族等の数（源泉徴収用）。 */
  dependentsCount: number;
}

export function validate(input: TakeHomeInput): string | null {
  if (!Number.isFinite(input.salary) || input.salary <= 0) return '月給（額面）を入力してください。';
  if (input.salary > 20_000_000) return '月給は 2,000 万円以下で入力してください。';
  if (!Number.isFinite(input.commute) || input.commute < 0) return '通勤手当は 0 以上で入力してください。';
  if (!Number.isFinite(input.bonus) || input.bonus < 0) return '賞与は 0 以上で入力してください。';
  if (input.residentMode === 'manual' && (!Number.isFinite(input.residentMonthly) || input.residentMonthly < 0))
    return '住民税（月額）は 0 以上で入力してください。';
  return null;
}

export function calculateTakeHome(input: TakeHomeInput): TakeHomeResult {
  const social = monthlySocialInsurance(input);
  const bonus = bonusSocialInsurance(input.bonus, input.bonusTimes, input);
  const salaryGross = input.salary * 12;
  const taxableIncome = salaryGross + input.bonus; // 通勤手当は非課税
  const socialAnnual = social.total * 12 + bonus.total;

  // 源泉控除対象配偶者は本人の合計所得金額（見積額）が 900 万円以下の場合に限る
  const estimatedIncome = salaryIncome2026(taxableIncome);
  const dependentsCount =
    (input.spouse && estimatedIncome <= 9_000_000 ? 1 : 0) + input.dependents + input.specificDependents;
  const withholding = monthlyWithholding(input.salary - social.total, dependentsCount);

  const incomeTax = annualIncomeTax(taxableIncome, socialAnnual, input);
  const residentEstimate = residentTax(taxableIncome, socialAnnual, input);
  const residentMonthly =
    input.residentMode === 'none' ? 0 : input.residentMode === 'manual' ? Math.floor(input.residentMonthly) : residentEstimate.monthly;
  const residentAnnual =
    input.residentMode === 'none' ? 0 : input.residentMode === 'manual' ? residentMonthly * 12 : residentEstimate.total;

  const monthlyGross = input.salary + input.commute;
  const monthlyTakeHome = monthlyGross - social.total - withholding - residentMonthly;
  const annualGross = salaryGross + input.bonus + input.commute * 12;
  const annualTakeHome = annualGross - socialAnnual - incomeTax.tax - residentAnnual;

  return {
    monthly: { gross: monthlyGross, social, incomeTax: withholding, resident: residentMonthly, takeHome: monthlyTakeHome },
    annual: {
      gross: annualGross,
      salaryGross,
      bonusGross: input.bonus,
      commute: input.commute * 12,
      health: social.health * 12 + bonus.health,
      childSupport: social.childSupport * 12 + bonus.childSupport,
      pension: social.pension * 12 + bonus.pension,
      employment: social.employment * 12 + bonus.employment,
      social: socialAnnual,
      incomeTax,
      resident: residentAnnual,
      takeHome: annualTakeHome,
      withheldMonthly12: withholding * 12,
    },
    bonus,
    residentEstimate,
    dependentsCount,
  };
}

/** 年収（額面、賞与込み・通勤手当除く）から月給を逆算：賞与を除いた額を 12 等分。 */
export function monthlyFromAnnual(annual: number, bonus: number): number {
  return Math.floor(Math.max(0, annual - bonus) / 12);
}

/**
 * 綜合所得稅年度參數。
 *
 * 114 年度（2025 年所得、2026 年 5 月申報）：財政部 113.11 公告維持 113 年度標準；基本生活費 213,000 元（財政部 114.11.27 公告）；
 *   長期照顧特別扣除額依 114.12 三讀修正所得稅法第 17 條提高為 180,000 元並自 114 年度適用。
 *   來源：財政部北區國稅局「114 年度綜合所得稅結算申報實務」（115.4.21），https://www.dot.gov.tw/multiplehtml/06afbfc0e60e4ccb88f3f7f956aaacc7
 * 115 年度（2026 年所得、2027 年 5 月申報）：財政部 114.11.27 公告（CPI 累計漲幅 4.13% 達 3%，免稅額、標準扣除額、
 *   薪資與身障特別扣除額及課稅級距調高）。115 年度基本生活費尚未公告，暫以 114 年度 213,000 元預設並可自行修改。
 */
export interface Bracket {
  /** 綜合所得淨額上限（含），最後一級為 Infinity。 */
  upTo: number;
  rate: number;
  /** 累進差額。 */
  diff: number;
}

export interface TaxYear {
  id: '114' | '115';
  label: string;
  filed: string;
  exemption: number;
  exemptionSenior: number;
  standardSingle: number;
  standardMarried: number;
  salaryDeduction: number;
  disabilityDeduction: number;
  savingsDeduction: number;
  tuitionDeduction: number;
  preschoolFirst: number;
  preschoolOther: number;
  longTermCare: number;
  rentDeduction: number;
  basicLiving: number;
  basicLivingOfficial: boolean;
  brackets: Bracket[];
}

function brackets(limits: [number, number, number, number]): Bracket[] {
  const rates = [0.05, 0.12, 0.2, 0.3, 0.4];
  const ups = [...limits, Infinity];
  const out: Bracket[] = [];
  let diff = 0;
  for (let i = 0; i < rates.length; i++) {
    if (i > 0) diff += limits[i - 1] * (rates[i] - rates[i - 1]);
    out.push({ upTo: ups[i], rate: rates[i], diff: Math.round(diff) });
  }
  return out;
}

export const TAX_YEARS: Record<TaxYear['id'], TaxYear> = {
  '114': {
    id: '114',
    label: '114 年度（2025 年所得）',
    filed: '2026 年 5 月申報',
    exemption: 97_000,
    exemptionSenior: 145_500,
    standardSingle: 131_000,
    standardMarried: 262_000,
    salaryDeduction: 218_000,
    disabilityDeduction: 218_000,
    savingsDeduction: 270_000,
    tuitionDeduction: 25_000,
    preschoolFirst: 150_000,
    preschoolOther: 225_000,
    longTermCare: 180_000,
    rentDeduction: 180_000,
    basicLiving: 213_000,
    basicLivingOfficial: true,
    brackets: brackets([590_000, 1_330_000, 2_660_000, 4_980_000]),
  },
  '115': {
    id: '115',
    label: '115 年度（2026 年所得）',
    filed: '2027 年 5 月申報',
    exemption: 101_000,
    exemptionSenior: 151_500,
    standardSingle: 136_000,
    standardMarried: 272_000,
    salaryDeduction: 227_000,
    disabilityDeduction: 227_000,
    savingsDeduction: 270_000,
    tuitionDeduction: 25_000,
    preschoolFirst: 150_000,
    preschoolOther: 225_000,
    longTermCare: 180_000,
    rentDeduction: 180_000,
    basicLiving: 213_000,
    basicLivingOfficial: false,
    brackets: brackets([610_000, 1_380_000, 2_770_000, 5_190_000]),
  },
};

export function bracketFor(net: number, year: TaxYear): Bracket {
  return year.brackets.find((b) => net <= b.upTo) ?? year.brackets[year.brackets.length - 1];
}

/** 應納稅額 = 綜合所得淨額 × 稅率 − 累進差額。 */
export function progressiveTax(net: number, year: TaxYear): number {
  if (net <= 0) return 0;
  const b = bracketFor(net, year);
  return Math.round(net * b.rate - b.diff);
}

export interface TaxInput {
  year: TaxYear['id'];
  married: boolean;
  /** 全年薪資收入（元），已扣除勞退自提。 */
  salarySelf: number;
  salarySpouse: number;
  seniorSelf: boolean;
  seniorSpouse: boolean;
  /** 一般受扶養親屬人數（子女、兄弟姊妹等）。 */
  dependents: number;
  /** 年滿 70 歲受扶養直系尊親屬人數。 */
  seniorDependents: number;
  /** 利息所得（存款、債券等）。 */
  interest: number;
  /** 其他所得（股利合併計稅、租賃、執行業務等）。 */
  otherIncome: number;
  /** 列舉扣除額合計；0 代表使用標準扣除額。 */
  itemized: number;
  disabled: number;
  preschool: number;
  tuition: number;
  longTermCare: number;
  /** 全年房屋租金支出。 */
  rent: number;
  /** 每人基本生活費（可自訂）。 */
  basicLiving?: number;
}

export interface Step {
  label: string;
  amount: number;
  /** '+' 加、'-' 減、'=' 小計。 */
  op: '+' | '-' | '=';
}

export interface TaxPart {
  title: string;
  steps: Step[];
  net: number;
  rate: number;
  diff: number;
  tax: number;
}

export type TaxMethod = 'combined' | 'separateSelf' | 'separateSpouse';

export interface TaxResult {
  method: TaxMethod;
  parts: TaxPart[];
  tax: number;
  /** 最高適用稅率。 */
  marginalRate: number;
  /** 應納稅額 ÷ 所得總收入。 */
  effectiveRate: number;
  totalIncome: number;
  /** 其他計稅方式的稅額，方便比較。 */
  alternatives: { method: TaxMethod; tax: number }[];
  /** 長照或租金特別扣除額因適用稅率達 20% 而不得列報。 */
  wealthExcluded: boolean;
  basicLivingDiff: number;
  deductionKind: 'standard' | 'itemized';
}

export const METHOD_LABEL: Record<TaxMethod, string> = {
  combined: '全部合併計稅',
  separateSelf: '本人薪資分開計稅',
  separateSpouse: '配偶薪資分開計稅',
};

export function validateTax(input: TaxInput): string | null {
  const money = [input.salarySelf, input.salarySpouse, input.interest, input.otherIncome, input.itemized, input.rent];
  const counts = [input.dependents, input.seniorDependents, input.disabled, input.preschool, input.tuition, input.longTermCare];
  if (![...money, ...counts].every(Number.isFinite)) return '請輸入完整的數字。';
  if (money.some((v) => v < 0)) return '金額不可為負數。';
  if (counts.some((v) => !Number.isInteger(v) || v < 0 || v > 20)) return '人數請輸入 0 到 20 的整數。';
  if (input.basicLiving !== undefined && (!Number.isFinite(input.basicLiving) || input.basicLiving < 0))
    return '基本生活費請輸入 0 或正數。';
  const people = 1 + (input.married ? 1 : 0) + input.dependents + input.seniorDependents;
  if (input.disabled > people || input.longTermCare > people) return '身心障礙或長照人數不可超過申報戶人數。';
  if (input.preschool + input.tuition > people) return '幼兒與大專子女人數不可超過申報戶人數。';
  return null;
}

interface Pool {
  people: number;
  exemptionTotal: number;
  deduction: number;
  deductionKind: 'standard' | 'itemized';
  savings: number;
  disability: number;
  preschool: number;
  tuition: number;
  longTermCare: number;
  rent: number;
}

function pool(input: TaxInput, y: TaxYear, includeWealthTested: boolean): Pool {
  const people = 1 + (input.married ? 1 : 0) + input.dependents + input.seniorDependents;
  const exemptionTotal =
    (input.seniorSelf ? y.exemptionSenior : y.exemption) +
    (input.married ? (input.seniorSpouse ? y.exemptionSenior : y.exemption) : 0) +
    input.dependents * y.exemption +
    input.seniorDependents * y.exemptionSenior;
  const standard = input.married ? y.standardMarried : y.standardSingle;
  const itemizedWins = input.itemized > standard;
  return {
    people,
    exemptionTotal,
    deduction: itemizedWins ? input.itemized : standard,
    deductionKind: itemizedWins ? 'itemized' : 'standard',
    savings: Math.min(input.interest, y.savingsDeduction),
    disability: input.disabled * y.disabilityDeduction,
    preschool: input.preschool > 0 ? y.preschoolFirst + (input.preschool - 1) * y.preschoolOther : 0,
    tuition: input.tuition * y.tuitionDeduction,
    longTermCare: includeWealthTested ? input.longTermCare * y.longTermCare : 0,
    // 房屋租金支出特別扣除額與列舉扣除額中的購屋借款利息不得同時適用，這裡只檢查上限。
    rent: includeWealthTested ? Math.min(input.rent, y.rentDeduction) : 0,
  };
}

function specials(p: Pool): number {
  return p.savings + p.disability + p.preschool + p.tuition + p.longTermCare + p.rent;
}

function finishPart(title: string, steps: Step[], net: number, y: TaxYear): TaxPart {
  const n = Math.max(0, net);
  const b = bracketFor(n, y);
  steps.push({ label: '綜合所得淨額', amount: n, op: '=' });
  return { title, steps, net: n, rate: b.rate, diff: b.diff, tax: progressiveTax(n, y) };
}

function compute(input: TaxInput, y: TaxYear, method: TaxMethod, includeWealthTested: boolean) {
  const p = pool(input, y, includeWealthTested);
  const basicLiving = input.basicLiving ?? y.basicLiving;
  const salaryIncomeSelf = Math.max(0, input.salarySelf - y.salaryDeduction);
  const salaryIncomeSpouse = input.married ? Math.max(0, input.salarySpouse - y.salaryDeduction) : 0;
  const basicLivingDiff = Math.max(0, basicLiving * p.people - (p.exemptionTotal + p.deduction + specials(p)));

  const parts: TaxPart[] = [];
  let householdExemption = p.exemptionTotal;
  let householdSalaryReceipts = input.salarySelf + (input.married ? input.salarySpouse : 0);
  let householdSalaryIncome = salaryIncomeSelf + salaryIncomeSpouse;

  if (method !== 'combined') {
    const isSelf = method === 'separateSelf';
    const receipts = isSelf ? input.salarySelf : input.salarySpouse;
    const income = isSelf ? salaryIncomeSelf : salaryIncomeSpouse;
    const senior = isSelf ? input.seniorSelf : input.seniorSpouse;
    const ex = senior ? y.exemptionSenior : y.exemption;
    householdExemption -= ex;
    householdSalaryReceipts -= receipts;
    householdSalaryIncome -= income;
    parts.push(
      finishPart(
        isSelf ? '本人薪資分開計算' : '配偶薪資分開計算',
        [
          { label: '薪資收入', amount: receipts, op: '+' },
          { label: '薪資所得特別扣除額', amount: Math.min(receipts, y.salaryDeduction), op: '-' },
          { label: '本人免稅額', amount: ex, op: '-' },
        ],
        income - ex,
        y,
      ),
    );
  }

  const gross = householdSalaryIncome + input.interest + input.otherIncome;
  const steps: Step[] = [];
  if (householdSalaryReceipts > 0) {
    steps.push({ label: '薪資收入', amount: householdSalaryReceipts, op: '+' });
    steps.push({ label: '薪資所得特別扣除額', amount: householdSalaryReceipts - householdSalaryIncome, op: '-' });
  }
  if (input.interest > 0) steps.push({ label: '利息所得', amount: input.interest, op: '+' });
  if (input.otherIncome > 0) steps.push({ label: '其他所得', amount: input.otherIncome, op: '+' });
  steps.push({ label: '綜合所得總額', amount: gross, op: '=' });
  steps.push({ label: `免稅額（${method === 'combined' ? p.people : p.people - 1} 人）`, amount: householdExemption, op: '-' });
  steps.push({ label: p.deductionKind === 'itemized' ? '列舉扣除額' : '標準扣除額', amount: p.deduction, op: '-' });
  const specialRows: [string, number][] = [
    ['儲蓄投資特別扣除額', p.savings],
    ['身心障礙特別扣除額', p.disability],
    ['幼兒學前特別扣除額', p.preschool],
    ['教育學費特別扣除額', p.tuition],
    ['長期照顧特別扣除額', p.longTermCare],
    ['房屋租金支出特別扣除額', p.rent],
    ['基本生活費差額', basicLivingDiff],
  ];
  for (const [label, amount] of specialRows) if (amount > 0) steps.push({ label, amount, op: '-' });
  const householdNet = gross - householdExemption - p.deduction - specials(p) - basicLivingDiff;
  parts.push(finishPart(method === 'combined' ? '合併計算' : '其餘所得合併計算', steps, householdNet, y));

  return { parts, tax: parts.reduce((s, x) => s + x.tax, 0), basicLivingDiff, deductionKind: p.deductionKind };
}

function computeWithWealthTest(input: TaxInput, y: TaxYear, method: TaxMethod) {
  const withAll = compute(input, y, method, true);
  const hasWealthTested = input.longTermCare > 0 || input.rent > 0;
  // 排富：減除長照、房屋租金特別扣除額後，（合併部分）適用稅率仍達 20% 以上者不得列報。
  const household = withAll.parts[withAll.parts.length - 1];
  if (hasWealthTested && household.rate >= 0.2) {
    return { ...compute(input, y, method, false), wealthExcluded: true };
  }
  return { ...withAll, wealthExcluded: false };
}

export function calculateTax(input: TaxInput): TaxResult | null {
  if (validateTax(input)) return null;
  const y = TAX_YEARS[input.year];
  const methods: TaxMethod[] = input.married ? ['combined', 'separateSelf', 'separateSpouse'] : ['combined'];
  const results = methods
    .filter((m) => m === 'combined' || (m === 'separateSelf' ? input.salarySelf : input.salarySpouse) > 0)
    .map((m) => ({ method: m, ...computeWithWealthTest(input, y, m) }));
  const best = results.reduce((a, b) => (b.tax < a.tax ? b : a));
  const totalIncome = input.salarySelf + (input.married ? input.salarySpouse : 0) + input.interest + input.otherIncome;
  return {
    method: best.method,
    parts: best.parts,
    tax: best.tax,
    marginalRate: Math.max(...best.parts.map((p) => (p.net > 0 ? p.rate : 0))),
    effectiveRate: totalIncome > 0 ? best.tax / totalIncome : 0,
    totalIncome,
    alternatives: results.map((r) => ({ method: r.method, tax: r.tax })),
    wealthExcluded: best.wealthExcluded,
    basicLivingDiff: best.basicLivingDiff,
    deductionKind: best.deductionKind,
  };
}

import { defineToolI18n } from '../../i18n/tool';
import type { MortgageProblem, RepaymentMethod } from './logic';

export interface Strings {
  /** Loan amount typed directly in units of 10,000 (zh 萬元, ja 万円). */
  amount?: { label: string; value: string };
  /** US-style inputs (en): home price, down payment, and optional monthly housing costs. */
  us?: {
    price: string;
    priceValue: string;
    down: string;
    downValue: string;
    costsLabel: string;
    tax: string;
    taxValue: string;
    insurance: string;
    insuranceValue: string;
    hoa: string;
    hoaValue: string;
    costsHint: string;
    piLabel: string;
    loanLabel: string;
  };
  rate: string;
  rateValue: string;
  years: string;
  yearsValue: string;
  /** 寬限期 (interest-only years) is a Taiwan mortgage feature; zh only. */
  grace?: { label: string; stat: string };
  /** Equal-payment vs equal-principal choice (zh 本息/本金平均攤還, ja 元利/元金均等返済). */
  method?: { label: string };
  mainLabel: string;
  /** Last payment of an equal-principal loan; only where `method` exists. */
  lastLabel?: string;
  interest: string;
  total: string;
  schedule: string;
  thPeriod: string;
  thPayment: string;
  thPrincipal: string;
  thInterest: string;
  thBalance: string;
  notice: string;
  client: {
    /** Currency template: '{n} 元', '${n}', '{n}円'. */
    money: string;
    /** Decimals for monthly amounts (2 = cents for USD). Totals are always whole units. */
    decimals: number;
    main: Record<RepaymentMethod, string>;
    /** Prefix for the main label when a grace period is set (zh). */
    afterGrace?: string;
    /** Comparison with the other repayment method; only where `method` exists. {method} {money} {first} */
    compare?: { methods: Record<RepaymentMethod, string>; more: string; less: string };
    year: string;
    month: string;
    /** {max} = longest term in years. */
    errors: Record<MortgageProblem, string>;
    fallback: string;
    us?: {
      /** {list} = the non-zero parts below, joined with Intl.ListFormat. */
      breakdown: string;
      /** {n} = monthly amount. */
      parts: { pi: string; tax: string; ins: string; hoa: string };
      /** Shown when the down payment is under 20%. */
      pmi: string;
      /** {money} {saved} */
      fifteen: string;
      costsError: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    amount: { label: '貸款金額（萬元）', value: '1000' },
    rate: '年利率（%）',
    rateValue: '2.2',
    years: '貸款年限（年）',
    yearsValue: '30',
    grace: { label: '寬限期（年，只繳利息）', stat: '寬限期每月（只繳利息）' },
    method: { label: '還款方式' },
    mainLabel: '每月應繳',
    lastLabel: '最後一期',
    interest: '總利息',
    total: '本息合計',
    schedule: '還款明細（點年度展開每月）',
    thPeriod: '期間',
    thPayment: '繳款',
    thPrincipal: '本金',
    thInterest: '利息',
    thBalance: '剩餘本金',
    notice: '試算結果為估算值，以月利率＝年利率 ÷ 12 計算，未含手續費、保險與利率調整。實際金額以銀行核貸條件為準。',
    client: {
      money: '{n} 元',
      decimals: 0,
      main: { annuity: '每月應繳', principal: '首月應繳（之後逐月遞減）' },
      afterGrace: '寬限期後',
      compare: {
        methods: { annuity: '本息平均攤還', principal: '本金平均攤還' },
        more: '若改用{method}，總利息約多 {money}。',
        less: '若改用{method}，總利息約少 {money}，但前期月付較高（首月 {first}）。',
      },
      year: '第 {n} 年',
      month: '第 {n} 期',
      errors: {
        incomplete: '請輸入完整的數字。',
        amount: '貸款金額需大於 0。',
        rate: '年利率請輸入 0 到 30 之間的百分比。',
        years: '貸款年限請輸入 1 到 {max} 的整數。',
        grace: '寬限期請輸入 0 或正整數。',
        graceTooLong: '寬限期必須短於貸款年限。',
      },
      fallback: '無法計算，請檢查輸入。',
    },
  },
  en: {
    us: {
      price: 'Home price ($)',
      priceValue: '350000',
      down: 'Down payment (%)',
      downValue: '20',
      costsLabel: 'Monthly housing costs (optional)',
      tax: 'Property tax ($/year)',
      taxValue: '3850',
      insurance: 'Home insurance ($/year)',
      insuranceValue: '1800',
      hoa: 'HOA dues ($/month)',
      hoaValue: '0',
      costsHint: 'Set these to 0 to see principal and interest only.',
      piLabel: 'Principal & interest',
      loanLabel: 'Loan amount',
    },
    rate: 'Interest rate (%)',
    rateValue: '6.5',
    years: 'Loan term (years)',
    yearsValue: '30',
    mainLabel: 'Estimated monthly payment',
    interest: 'Total interest',
    total: 'Total of payments (P&I)',
    schedule: 'Amortization schedule (tap a year to see each month)',
    thPeriod: 'Period',
    thPayment: 'Payment',
    thPrincipal: 'Principal',
    thInterest: 'Interest',
    thBalance: 'Balance',
    notice: 'Estimate for a fixed-rate loan with a monthly rate of the interest rate ÷ 12. PMI, closing costs and rate changes are not included. Your lender’s Loan Estimate shows the exact figures.',
    client: {
      money: '${n}',
      decimals: 2,
      main: { annuity: 'Estimated monthly payment', principal: 'Estimated first monthly payment' },
      year: 'Year {n}',
      month: 'Month {n}',
      errors: {
        incomplete: 'Enter a number in every field.',
        amount: 'The home price must be more than the down payment.',
        rate: 'Enter an interest rate from 0% to 30%.',
        years: 'Enter a loan term from 1 to {max} years.',
        grace: 'Enter 0 or a whole number of years.',
        graceTooLong: 'The interest-only period must be shorter than the loan term.',
      },
      fallback: 'Can’t calculate this mortgage. Check your numbers.',
      us: {
        breakdown: 'Includes {list} a month.',
        parts: { pi: '{n} principal and interest', tax: '{n} property tax', ins: '{n} homeowners insurance', hoa: '{n} HOA dues' },
        pmi: 'With less than 20% down, lenders usually add private mortgage insurance (PMI), often 0.3% to 1.5% of the loan a year. It is not included here.',
        fifteen: 'A 15-year loan at the same rate would cost {money} a month in principal and interest and save {saved} in interest.',
        costsError: 'Enter property tax, insurance and HOA dues as 0 or more.',
      },
    },
  },
  ja: {
    amount: { label: '借入金額（万円）', value: '3000' },
    rate: '金利（年 %）',
    rateValue: '1',
    years: '返済期間（年）',
    yearsValue: '35',
    method: { label: '返済方法' },
    mainLabel: '毎月の返済額',
    lastLabel: '最終回の返済額',
    interest: '利息の総額',
    total: '総返済額',
    schedule: '返済予定表（年をタップすると毎月の明細を表示）',
    thPeriod: '期間',
    thPayment: '返済額',
    thPrincipal: '元金',
    thInterest: '利息',
    thBalance: 'ローン残高',
    notice: '月利＝年利 ÷ 12 で計算した概算です。金利は返済期間中一定とし、ボーナス返済、保証料、事務手数料、団体信用生命保険料、金利の見直しは含みません。実際の返済額は金融機関の返済予定表でご確認ください。',
    client: {
      money: '{n}円',
      decimals: 0,
      main: { annuity: '毎月の返済額', principal: '初回の返済額（以後毎月減少）' },
      compare: {
        methods: { annuity: '元利均等返済', principal: '元金均等返済' },
        more: '{method}にすると、利息の総額は約 {money} 増えます。',
        less: '{method}にすると、利息の総額は約 {money} 減りますが、返済初期の負担が重くなります（初回 {first}）。',
      },
      year: '{n} 年目',
      month: '{n} 回目',
      errors: {
        incomplete: 'すべての欄に数字を入力してください。',
        amount: '借入金額は 0 より大きい金額を入力してください。',
        rate: '金利は 0〜30% の範囲で入力してください。',
        years: '返済期間は 1〜{max} 年の整数で入力してください。',
        grace: '0 以上の整数を入力してください。',
        graceTooLong: '据置期間は返済期間より短くしてください。',
      },
      fallback: '計算できません。入力内容を確認してください。',
    },
  },
});

import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { LoanProblem } from './logic';

export interface Strings {
  amount: string;
  defaults: { amount: string; months: string; rate1: string; fees: string };
  months: string;
  monthsHint: string;
  /** Two-stage promotional rates (分段式利率) are a Taiwan bank product; only zh offers them. */
  staged?: {
    kind: string;
    single: string;
    staged: string;
    stage1: string;
    rate2: string;
  };
  rate1: string;
  fees: string;
  feesHint: string;
  payment: string;
  apr: string;
  interest: string;
  cost: string;
  total: string;
  schedule: string;
  thMonth: string;
  thRate: string;
  thPayment: string;
  thPrincipal: string;
  thInterest: string;
  thBalance: string;
  hint: string;
  client: {
    /** The amount field is entered in this many currency units (zh 萬元 / ja 万円 = 10,000; en dollars = 1). */
    amountScale: number;
    /** Currency template: '{n} 元', '${n}', '{n}円'. */
    money: string;
    /** Decimal places for money (2 = cents for USD). */
    decimals: number;
    rate1: string;
    /** {n} = number of monthly payments. */
    paymentLabel: PluralForms;
    /** {n} = payment number in the schedule. */
    period: string;
    errors: Record<LoanProblem, string>;
    fallback: string;
    staged?: {
      rate1: string;
      stageError: string;
      /** {to} = last month of the first stage. */
      paymentLabel: string;
      /** {from} {to} {rate} {money} */
      note: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    amount: '貸款金額（萬元）',
    defaults: { amount: '50', months: '60', rate1: '2.88', fees: '3000' },
    months: '還款期數（月）',
    monthsHint: '5 年 = 60 期，7 年 = 84 期。',
    staged: {
      kind: '利率方式',
      single: '單一利率',
      staged: '分段式利率',
      stage1: '第一段期數（月）',
      rate2: '第二段年利率（%）',
    },
    rate1: '年利率（%）',
    fees: '開辦費與其他費用（元）',
    feesHint: '開辦費、帳戶管理費、徵信查詢費等貸款時一次支付的費用。',
    payment: '每月月付金',
    apr: '總費用年百分率',
    interest: '總利息',
    cost: '總成本（利息＋費用）',
    total: '本息合計',
    schedule: '攤還明細表',
    thMonth: '期數',
    thRate: '利率',
    thPayment: '月付金',
    thPrincipal: '本金',
    thInterest: '利息',
    thBalance: '剩餘本金',
    hint: '採本息平均攤還、月利率＝年利率 ÷ 12；分段式利率在利率變動時以剩餘本金重新計算月付金。總費用年百分率依實際撥款金額（貸款金額 − 費用）與每期還款求內部報酬率再乘以 12。結果僅供參考，實際條件以銀行契約為準；資料只在你的瀏覽器內計算。',
    client: {
      amountScale: 10_000,
      money: '{n} 元',
      decimals: 0,
      rate1: '年利率（%）',
      paymentLabel: { other: '每月月付金（共 {n} 期）' },
      period: '第 {n} 期',
      errors: {
        incomplete: '請輸入完整的數字。',
        amount: '貸款金額需大於 0。',
        months: '貸款期數請輸入 1 到 480 個月。',
        noRate: '請輸入利率。',
        rate: '年利率請輸入 0% 到 30%。',
        stageMonths: '分段期數請輸入 0 或正整數。',
        feesNegative: '費用不可為負數。',
        feesTooHigh: '費用不可大於或等於貸款金額。',
      },
      fallback: '無法計算，請檢查輸入。',
      staged: {
        rate1: '第一段年利率（%）',
        stageError: '第一段期數需大於 0 且小於總期數。',
        paymentLabel: '第 1–{to} 期每月月付金',
        note: '第 {from}–{to} 期利率 {rate}%，每月月付金 {money}。',
      },
    },
  },
  en: {
    amount: 'Loan amount ($)',
    defaults: { amount: '15000', months: '60', rate1: '12', fees: '450' },
    months: 'Loan term (months)',
    monthsHint: '3 years = 36 months, 5 years = 60 months.',
    rate1: 'Interest rate (%)',
    fees: 'Origination fee and other upfront fees ($)',
    feesHint: 'Many lenders deduct a 1% to 10% origination fee from the money you receive. Enter 0 if there is none.',
    payment: 'Monthly payment',
    apr: 'APR including fees',
    interest: 'Total interest',
    cost: 'Total cost (interest + fees)',
    total: 'Total of payments',
    schedule: 'Amortization schedule',
    thMonth: 'Month',
    thRate: 'Rate',
    thPayment: 'Amount',
    thPrincipal: 'Principal',
    thInterest: 'Interest',
    thBalance: 'Balance',
    hint: 'Uses a fixed monthly payment with a monthly rate of the interest rate ÷ 12. APR treats the fee the way lenders’ Truth in Lending disclosures do: it is the yearly rate at which the cash you actually receive (loan minus fees) equals your payments. Results are estimates; your loan agreement is what counts. Everything is calculated in your browser.',
    client: {
      amountScale: 1,
      money: '${n}',
      decimals: 2,
      rate1: 'Interest rate (%)',
      paymentLabel: { one: 'Monthly payment ({n} payment)', other: 'Monthly payment ({n} payments)' },
      period: '{n}',
      errors: {
        incomplete: 'Enter a number in every field.',
        amount: 'The loan amount must be more than 0.',
        months: 'Enter a loan term from 1 to 480 months.',
        noRate: 'Enter an interest rate.',
        rate: 'Enter an interest rate from 0% to 30%.',
        stageMonths: 'Enter 0 or a whole number of months.',
        feesNegative: 'Fees can’t be negative.',
        feesTooHigh: 'Fees must be less than the loan amount.',
      },
      fallback: 'Can’t calculate this loan. Check your numbers.',
    },
  },
  ja: {
    amount: '借入金額（万円）',
    defaults: { amount: '200', months: '60', rate1: '3', fees: '0' },
    months: '返済回数（か月）',
    monthsHint: '5 年 = 60 回、7 年 = 84 回。',
    rate1: '年利（%）',
    fees: '事務手数料・保証料など（円）',
    feesHint: '借入時に一括で支払う費用です。保証料が金利に含まれているローンも多いので、別途かからない場合は 0 のままにします。',
    payment: '毎月の返済額',
    apr: '実質年率（手数料込み）',
    interest: '利息の総額',
    cost: '総コスト（利息＋手数料）',
    total: '総返済額',
    schedule: '返済予定表',
    thMonth: '回数',
    thRate: '金利',
    thPayment: '返済額',
    thPrincipal: '元金',
    thInterest: '利息',
    thBalance: '残高',
    hint: '元利均等返済、月利＝年利 ÷ 12 で計算しています。手数料込みの実質年率は、手数料を差し引いた実際の受取額と毎月の返済額から求めた年率です。結果は目安で、実際の返済額は金融機関の返済予定表をご確認ください。計算はすべてブラウザ内で行います。',
    client: {
      amountScale: 10_000,
      money: '{n}円',
      decimals: 0,
      rate1: '年利（%）',
      paymentLabel: { other: '毎月の返済額（{n} 回払い）' },
      period: '{n} 回目',
      errors: {
        incomplete: 'すべての欄に数字を入力してください。',
        amount: '借入金額は 0 より大きい金額を入力してください。',
        months: '返済回数は 1〜480 か月の範囲で入力してください。',
        noRate: '金利を入力してください。',
        rate: '年利は 0〜30% の範囲で入力してください。',
        stageMonths: '期間は 0 以上の整数で入力してください。',
        feesNegative: '手数料はマイナスにできません。',
        feesTooHigh: '手数料は借入金額より少なくしてください。',
      },
      fallback: '計算できません。入力内容を確認してください。',
    },
  },
});

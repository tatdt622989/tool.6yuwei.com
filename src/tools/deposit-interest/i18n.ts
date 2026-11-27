import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { DepositMode, DepositProblem } from './logic';

/**
 * Each locale gets the deposit product and tax rules of its market:
 *  - tw: 台灣定存（整存整付 / 存本取息 / 零存整付、二代健保補充保費、儲蓄投資特別扣除額）
 *  - us: US savings accounts and CDs (APY vs APR, compounding frequency, no tax withheld)
 *  - jp: 日本の定期預金（単利型 / 半年複利型、利子の源泉分離課税 20.315%）
 */
export type Variant = 'tw' | 'us' | 'jp';

export interface Strings {
  /** Deposit-mode selector (tw, us). */
  modes?: { legend: string; options: { value: DepositMode; label: string }[] };
  /** Starting balance for recurring deposits (us). */
  initialLabel?: string;
  amountLabel: string;
  rateLabel: string;
  rateHint: string;
  monthsLabel: string;
  monthsHint: string;
  compLegend: string;
  compOptions: { value: string; label: string }[];
  /** Compounding frequency for an APR (us). */
  frequency?: { label: string; options: { value: number; label: string }[] };
  mainLabel: string;
  stats: { id: string; label: string; labelId?: string }[];
  table?: { label: string; head: [string, string, string, string] };
  hint: string;
  client: {
    variant: Variant;
    prefKey: string;
    /** '{n} 元' / '${n}' / '{n} 円' */
    money: string;
    digits: 0 | 2;
    errors: Record<DepositProblem, string>;
    defaults: { mode: DepositMode; comp: string; amount: string; rate: string; months: string; freq?: string; initial?: string };
    /** Table row label: '第 {n} 月'. */
    month?: string;
    tw?: {
      modeLabels: Record<DepositMode, string>;
      compSuffix: { compound: string; simple: string };
      /** {mode} {comp} {months} */
      mainLabel: string;
      amountLump: string;
      amountRecurring: string;
      /** {n} */
      singleIncome: string;
      singleLump: string;
      /** {single} {threshold} {pct} {premium} */
      nhiCharged: string;
      /** {threshold} */
      nhiFree: string;
      /** {pct} {amount} */
      withholding: string;
      /** {annual} {deduction} {over} */
      deduction: string;
      over: string;
      fallback: string;
    };
    us?: {
      amountLump: string;
      amountRecurring: string;
      rateApy: string;
      rateApr: string;
      mainLabel: PluralForms;
      apyLabel: string;
      aprLabel: string;
      /** {interest} {deposits} */
      note: string;
      noteCd: string;
      noteSavings: string;
    };
    jp?: {
      typeLabels: Record<'simple' | 'semiannual', string>;
      /** {type} {months} */
      mainLabel: string;
      /** {gross} {national} {local} {tax} {yield} */
      note: string;
      noteSemiannual: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modes: {
      legend: '存款方式',
      options: [
        { value: 'lump', label: '整存整付' },
        { value: 'income', label: '存本取息' },
        { value: 'recurring', label: '零存整付' },
      ],
    },
    amountLabel: '存入本金（元）',
    rateLabel: '年利率（%）',
    rateHint: '依銀行牌告或專案利率填寫。',
    monthsLabel: '存款期間（月）',
    monthsHint: '1 年 = 12 個月，3 年 = 36 個月。',
    compLegend: '計息方式',
    compOptions: [
      { value: '1', label: '按月複利' },
      { value: '0', label: '單利' },
    ],
    mainLabel: '利息合計',
    stats: [
      { id: 'di-maturity', label: '到期本利和' },
      { id: 'di-single', label: '每次領取利息', labelId: 'di-single-label' },
      { id: 'di-nhi', label: '二代健保補充保費' },
      { id: 'di-net', label: '扣補充保費後利息' },
    ],
    table: { label: '逐月明細', head: ['月份', '累計存入', '當月利息', '月底金額'] },
    hint: '月利率＝年利率 ÷ 12；補充保費與扣繳依 2026 年規定（利息單次給付達 2 萬元扣 2.11%、超過 2 萬元預扣 10% 所得稅）估算。結果僅供參考，實際利息以銀行計息方式與利率為準；資料只在你的瀏覽器內計算。',
    client: {
      variant: 'tw',
      prefKey: 'deposit-interest',
      money: '{n} 元',
      digits: 0,
      errors: {
        incomplete: '請輸入完整的數字。',
        amount: '金額需大於 0。',
        tooLarge: '金額過大。',
        rate: '年利率請輸入 0% 到 20%。',
        months: '存款期間請輸入 1 到 600 個月。',
        initial: '請輸入 0 以上的金額。',
      },
      defaults: { mode: 'lump', comp: '1', amount: '1000000', rate: '1.7', months: '12' },
      month: '第 {n} 月',
      tw: {
        modeLabels: { lump: '整存整付', income: '存本取息', recurring: '零存整付' },
        compSuffix: { compound: '（按月複利）', simple: '（單利）' },
        mainLabel: '{mode}{comp}，{months} 個月利息合計',
        amountLump: '存入本金（元）',
        amountRecurring: '每月存入金額（元）',
        singleIncome: '每月領取利息（共 {n} 次）',
        singleLump: '到期一次領取利息',
        nhiCharged:
          '單次利息 {single} 達 {threshold} 元，銀行會扣 {pct}% 二代健保補充保費 {premium}；改用存本取息或分成較小的存單，讓每次利息低於 2 萬元即可不用扣。',
        nhiFree: '每次領取的利息未達 {threshold} 元，不需扣二代健保補充保費。',
        withholding: '另會預扣 {pct}% 所得稅 {amount}，報稅時可抵繳或退回。',
        deduction: '換算每年利息約 {annual}，全戶全年利息在 {deduction} 元以內可用儲蓄投資特別扣除額全額扣除{over}。',
        over: '，你的利息已超過此額度',
        fallback: '無法計算，請檢查輸入。',
      },
    },
  },
  en: {
    modes: {
      legend: 'Account type',
      options: [
        { value: 'lump', label: 'CD or one-time deposit' },
        { value: 'recurring', label: 'Savings with monthly deposits' },
      ],
    },
    initialLabel: 'Starting balance ($)',
    amountLabel: 'Deposit amount ($)',
    rateLabel: 'APY (%)',
    rateHint: 'Use the rate your bank advertises.',
    monthsLabel: 'Term (months)',
    monthsHint: '12 months = 1 year, 60 months = 5 years.',
    compLegend: 'Rate type',
    compOptions: [
      { value: 'apy', label: 'APY' },
      { value: 'apr', label: 'Interest rate (APR)' },
    ],
    frequency: {
      label: 'Compounding',
      options: [
        { value: 365, label: 'Daily' },
        { value: 12, label: 'Monthly' },
        { value: 4, label: 'Quarterly' },
        { value: 1, label: 'Annually' },
      ],
    },
    mainLabel: 'Interest earned',
    stats: [
      { id: 'di-maturity', label: 'Ending balance' },
      { id: 'di-deposited', label: 'Total deposits' },
      { id: 'di-apy', label: 'Equivalent APR, compounded monthly', labelId: 'di-apy-label' },
    ],
    table: { label: 'Month-by-month schedule', head: ['Month', 'Total deposited', 'Interest', 'Balance'] },
    hint: 'Assumes the rate stays the same for the whole term and that deposits are made at the start of each month. Your bank’s day count and crediting schedule can change the result by a few cents. Everything is calculated in your browser.',
    client: {
      variant: 'us',
      prefKey: 'deposit-interest:en',
      money: '${n}',
      digits: 2,
      errors: {
        incomplete: 'Fill in every field with a number.',
        amount: 'The deposit amount must be more than 0.',
        tooLarge: 'That amount is too large.',
        rate: 'Enter a rate from 0% to 20%.',
        months: 'Enter a term from 1 to 600 months.',
        initial: 'The starting balance can’t be negative.',
      },
      defaults: { mode: 'lump', comp: 'apy', amount: '10000', rate: '4.5', months: '12', freq: '365', initial: '1000' },
      month: '{n}',
      us: {
        amountLump: 'Deposit amount ($)',
        amountRecurring: 'Monthly deposit ($)',
        rateApy: 'APY (%)',
        rateApr: 'Interest rate, APR (%)',
        mainLabel: { one: 'Interest earned over {n} month', other: 'Interest earned over {n} months' },
        apyLabel: 'APY (effective annual yield)',
        aprLabel: 'Equivalent APR, compounded monthly',
        note: 'You earn {interest} on {deposits} of deposits.',
        noteCd: 'With a CD, withdrawing before the term ends usually costs an early withdrawal penalty, often several months of interest.',
        noteSavings: 'Savings account rates are variable, so the bank can change your APY at any time.',
      },
    },
  },
  ja: {
    amountLabel: '預入金額（円）',
    rateLabel: '年利率（%・税引前）',
    rateHint: '銀行が表示している店頭金利やキャンペーン金利を入力します。',
    monthsLabel: '預入期間（か月）',
    monthsHint: '1 年 = 12 か月、3 年 = 36 か月。',
    compLegend: '金利タイプ',
    compOptions: [
      { value: 'simple', label: '単利型' },
      { value: 'semiannual', label: '半年複利型' },
    ],
    mainLabel: '受取利息（税引後）',
    stats: [
      { id: 'di-gross', label: '税引前利息' },
      { id: 'di-tax-national', label: '所得税・復興特別所得税（15.315%）' },
      { id: 'di-tax-local', label: '住民税（5%）' },
      { id: 'di-maturity', label: '満期受取額（税引後）' },
    ],
    hint: '期間は「月数 ÷ 12」年として計算しています。実際の銀行は預入日数 ÷ 365 の日割りで計算するため、数円ずれることがあります。2 年以上の単利型で中間利払いがある場合や、金利が途中で変わる場合も結果が異なります。入力内容はブラウザ内だけで計算されます。',
    client: {
      variant: 'jp',
      prefKey: 'deposit-interest:ja',
      money: '{n} 円',
      digits: 0,
      errors: {
        incomplete: 'すべての欄に数字を入力してください。',
        amount: '預入金額は 0 より大きい金額を入力してください。',
        tooLarge: '金額が大きすぎます。',
        rate: '年利率は 0〜20% の範囲で入力してください。',
        months: '預入期間は 1〜600 か月の整数で入力してください。',
        initial: '0 以上の金額を入力してください。',
      },
      defaults: { mode: 'lump', comp: 'simple', amount: '1000000', rate: '0.4', months: '12' },
      jp: {
        typeLabels: { simple: '単利型', semiannual: '半年複利型' },
        mainLabel: '受取利息（税引後・{type}・{months} か月）',
        note: '税引前の利息 {gross}から、20.315%（所得税・復興特別所得税 {national}、住民税 {local}）の計 {tax}が源泉徴収されます。税引後の実質利回りは年 {yield}% です。',
        noteSemiannual: '半年複利型は 6 か月ごとに利息を元本に組み入れて計算しています。',
      },
    },
  },
});

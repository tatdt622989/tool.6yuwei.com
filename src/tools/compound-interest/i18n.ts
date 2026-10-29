import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { Frequency } from './logic';

export interface Strings {
  principal: string;
  monthly: string;
  monthlyHint: string;
  rate: string;
  years: string;
  freq: string;
  /** Option labels of the compounding select. */
  freqOptions: Record<Frequency, string>;
  /** Default input values, in this locale's currency. */
  defaults: { principal: string; monthly: string; rate: string; years: string };
  finalLabel: string;
  contributed: string;
  interest: string;
  effective: string;
  double: string;
  legendPrincipal: string;
  legendInterest: string;
  tableTitle: string;
  thYear: string;
  thContributed: string;
  thInterest: string;
  thTotalInterest: string;
  thBalance: string;
  hint: string;
  client: {
    /** Currency template: '{n} 元', '${n}', '{n}円'. */
    money: string;
    error: string;
    /** {n} = years, {freq} = freqInline[frequency]. */
    finalLabel: PluralForms;
    freqInline: Record<Frequency, string>;
    /** {n} = years to double (one decimal). */
    doubling: PluralForms;
    /** {n} = year number in the table. */
    year: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    principal: '初始本金（元）',
    monthly: '每月投入（元）',
    monthlyHint: '於每月月底投入，不投入填 0。',
    rate: '年利率／年報酬率（%）',
    years: '投資年數',
    freq: '複利頻率',
    freqOptions: { 1: '每年', 2: '每半年', 4: '每季', 12: '每月', 365: '每日' },
    defaults: { principal: '100000', monthly: '5000', rate: '5', years: '20' },
    finalLabel: '期末總金額',
    contributed: '累計投入本金',
    interest: '累計利息',
    effective: '實質年利率',
    double: '72 法則翻倍年數',
    legendPrincipal: '投入本金',
    legendInterest: '利息',
    tableTitle: '逐年明細',
    thYear: '年度',
    thContributed: '累計投入',
    thInterest: '當年利息',
    thTotalInterest: '累計利息',
    thBalance: '年底餘額',
    hint: '計算結果為假設利率固定不變的試算，未計入稅負、手續費與通膨，實際報酬請以金融機構或投資商品的資料為準。',
    client: {
      money: '{n} 元',
      error: '請輸入本金或每月投入（不可為負）、0–100% 的年利率，以及 1–100 的整數年數。',
      finalLabel: { other: '{n} 年後期末總金額（{freq}複利）' },
      freqInline: { 1: '每年', 2: '每半年', 4: '每季', 12: '每月', 365: '每日' },
      doubling: { other: '約 {n} 年' },
      year: '第 {n} 年',
    },
  },
  en: {
    principal: 'Initial deposit ($)',
    monthly: 'Monthly contribution ($)',
    monthlyHint: 'Added at the end of each month. Enter 0 for none.',
    rate: 'Annual interest rate or return (%)',
    years: 'Years to grow',
    freq: 'Compound frequency',
    freqOptions: { 1: 'Annually', 2: 'Semiannually', 4: 'Quarterly', 12: 'Monthly', 365: 'Daily' },
    defaults: { principal: '10000', monthly: '500', rate: '7', years: '20' },
    finalLabel: 'Future balance',
    contributed: 'Total contributions',
    interest: 'Total interest earned',
    effective: 'Effective annual rate (APY)',
    double: 'Years to double (rule of 72)',
    legendPrincipal: 'Contributions',
    legendInterest: 'Interest',
    tableTitle: 'Year-by-year breakdown',
    thYear: 'Year',
    thContributed: 'Contributed',
    thInterest: 'Interest that year',
    thTotalInterest: 'Total interest',
    thBalance: 'End balance',
    hint: 'Assumes a constant rate and contributions at the end of each month. It ignores taxes, fees and inflation, and investment returns are not guaranteed, so treat the result as an estimate.',
    client: {
      money: '${n}',
      error: 'Enter a starting amount or monthly contribution (not negative), a rate from 0 to 100%, and a whole number of years from 1 to 100.',
      finalLabel: { one: 'Balance after {n} year, compounded {freq}', other: 'Balance after {n} years, compounded {freq}' },
      freqInline: { 1: 'annually', 2: 'semiannually', 4: 'quarterly', 12: 'monthly', 365: 'daily' },
      doubling: { one: 'About {n} year', other: 'About {n} years' },
      year: 'Year {n}',
    },
  },
  ja: {
    principal: '初期投資額（円）',
    monthly: '毎月の積立額（円）',
    monthlyHint: '毎月末に積み立てる前提です。積立しない場合は 0 を入力します。',
    rate: '年利・想定利回り（%）',
    years: '運用期間（年）',
    freq: '複利の回数',
    freqOptions: { 1: '年 1 回', 2: '半年ごと', 4: '四半期ごと', 12: '毎月', 365: '毎日' },
    defaults: { principal: '1000000', monthly: '30000', rate: '5', years: '20' },
    finalLabel: '最終積立金額',
    contributed: '元本（投資額の合計）',
    interest: '運用収益（利息）',
    effective: '実効年利回り',
    double: '72 の法則で 2 倍になる年数',
    legendPrincipal: '元本',
    legendInterest: '運用収益',
    tableTitle: '年ごとの推移',
    thYear: '年数',
    thContributed: '元本累計',
    thInterest: 'その年の収益',
    thTotalInterest: '収益累計',
    thBalance: '年末残高',
    hint: '利回りが一定と仮定した試算です。税金（運用益への 20.315% など）、手数料、インフレは含みません。投資信託などの実際のリターンは毎年変動し、元本は保証されません。',
    client: {
      money: '{n}円',
      error: '初期投資額または毎月の積立額（マイナス不可）、0〜100% の年利、1〜100 の整数の年数を入力してください。',
      finalLabel: { other: '{n} 年後の最終積立金額（{freq}複利）' },
      freqInline: { 1: '年', 2: '半年', 4: '四半期', 12: '月', 365: '日' },
      doubling: { other: '約 {n} 年' },
      year: '{n} 年目',
    },
  },
});

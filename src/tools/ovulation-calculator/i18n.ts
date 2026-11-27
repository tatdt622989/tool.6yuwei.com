import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { CycleInputError, DayKind } from './logic';

export interface Strings {
  lastLabel: string;
  cycleLabel: string;
  periodLabel: string;
  countLabel: string;
  count3: string;
  count6: string;
  mainLabel: string;
  fertileLabel: string;
  nextLabel: string;
  todayLabel: string;
  calendarLabel: string;
  legend: Record<'period' | 'fertile' | 'ovulation' | 'other' | 'today', string>;
  tableLabel: string;
  thStart: string;
  thFertile: string;
  thOvulation: string;
  thNext: string;
  notice: string;
  client: {
    kinds: Record<DayKind, string>;
    errors: Record<CycleInputError, string>;
    errorDate: string;
    errorGeneric: string;
    mainToday: string;
    mainFuture: PluralForms;
    mainPast: string;
    /** {n} = day of the current cycle. */
    todayCycle: string;
    /** Joins a calendar day's date with its kind / "today" in the aria-label. */
    sep: string;
    today: string;
    /** Intl date styles; zh-TW keeps its hand-built 11/3（二） format. */
    intl?: {
      main: Intl.DateTimeFormatOptions;
      md: Intl.DateTimeFormatOptions;
      mdw: Intl.DateTimeFormatOptions;
      caption: Intl.DateTimeFormatOptions;
      day: Intl.DateTimeFormatOptions;
      weekday: 'narrow' | 'short';
      /** Join two md() dates with this instead of Intl formatRange (ja: avoids zero-padded 11/04). */
      rangeSep?: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    lastLabel: '最後一次月經第一天',
    cycleLabel: '月經週期（天）',
    periodLabel: '經期天數（天）',
    countLabel: '預測週期數',
    count3: '3 個週期',
    count6: '6 個週期',
    mainLabel: '本週期排卵日',
    fertileLabel: '易孕期（排卵期）',
    nextLabel: '下次月經預計',
    todayLabel: '今天',
    calendarLabel: '排卵期日曆',
    legend: {
      period: '月經期（預測）',
      fertile: '易孕期',
      ovulation: '排卵日',
      other: '相對安全期（不可靠）',
      today: '今天',
    },
    tableLabel: '各週期日期一覽',
    thStart: '月經開始',
    thFertile: '易孕期',
    thOvulation: '排卵日',
    thNext: '下次月經',
    notice:
      '結果僅供參考，請諮詢醫師。「安全期」不是可靠的避孕方法：排卵日會受壓力、作息、疾病影響而提前或延後，以日曆推算避孕的一般使用失敗率約 2 成以上。需要避孕請使用保險套或經醫師評估的避孕方式。資料只在你的瀏覽器中計算，不會上傳。',
    client: {
      kinds: { period: '月經期', ovulation: '排卵日', fertile: '易孕期', other: '相對安全期' },
      errors: {
        cycle: '月經週期請輸入 21 到 45 的整數天數。',
        period: '經期天數請輸入 2 到 10 的整數。',
        future: '最後一次月經日期不能晚於今天。',
      },
      errorDate: '請選擇最後一次月經第一天。',
      errorGeneric: '無法計算，請檢查輸入。',
      mainToday: '今天是預估排卵日',
      mainFuture: { other: '預估排卵日（{n} 天後）' },
      mainPast: '本週期預估排卵日（已過）',
      todayCycle: '今天（週期第 {n} 天）',
      sep: '，',
      today: '今天',
    },
  },
  en: {
    lastLabel: 'First day of your last period',
    cycleLabel: 'Cycle length (days)',
    periodLabel: 'Period length (days)',
    countLabel: 'Cycles to show',
    count3: '3 cycles',
    count6: '6 cycles',
    mainLabel: 'Ovulation this cycle',
    fertileLabel: 'Fertile window',
    nextLabel: 'Next period expected',
    todayLabel: 'Today',
    calendarLabel: 'Fertility calendar',
    legend: {
      period: 'Period (predicted)',
      fertile: 'Fertile window',
      ovulation: 'Ovulation day',
      other: 'Less fertile days (not reliable)',
      today: 'Today',
    },
    tableLabel: 'Dates by cycle',
    thStart: 'Period starts',
    thFertile: 'Fertile window',
    thOvulation: 'Ovulation',
    thNext: 'Next period',
    notice:
      'For information only; it does not replace advice from your doctor. The calendar method is not reliable birth control: ovulation can move earlier or later with stress, illness, travel or breastfeeding, and with typical use up to about 1 in 4 people relying on fertility awareness get pregnant within a year. Everything is calculated in your browser and nothing is uploaded.',
    client: {
      kinds: { period: 'Period', ovulation: 'Ovulation day', fertile: 'Fertile window', other: 'Less fertile' },
      errors: {
        cycle: 'Enter a cycle length from 21 to 45 days, as a whole number.',
        period: 'Enter a period length from 2 to 10 days, as a whole number.',
        future: 'The first day of your last period can’t be in the future.',
      },
      errorDate: 'Choose the first day of your last period.',
      errorGeneric: 'Can’t calculate. Check your entries.',
      mainToday: 'Today is your estimated ovulation day',
      mainFuture: { one: 'Estimated ovulation (tomorrow)', other: 'Estimated ovulation (in {n} days)' },
      mainPast: 'Estimated ovulation this cycle (passed)',
      todayCycle: 'Today (cycle day {n})',
      sep: ', ',
      today: 'today',
      intl: {
        main: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
        md: { month: 'short', day: 'numeric' },
        mdw: { weekday: 'short', month: 'short', day: 'numeric' },
        caption: { month: 'long', year: 'numeric' },
        day: { month: 'long', day: 'numeric' },
        weekday: 'narrow',
      },
    },
  },
  ja: {
    lastLabel: '最終月経の開始日',
    cycleLabel: '月経周期（日）',
    periodLabel: '月経期間（日）',
    countLabel: '予測する周期数',
    count3: '3 周期',
    count6: '6 周期',
    mainLabel: '今周期の排卵日',
    fertileLabel: '妊娠しやすい時期',
    nextLabel: '次の月経予定日',
    todayLabel: '今日',
    calendarLabel: '排卵日カレンダー',
    legend: {
      period: '月経（予測）',
      fertile: '妊娠しやすい時期',
      ovulation: '排卵日',
      other: '妊娠しにくい時期（確実ではありません）',
      today: '今日',
    },
    tableLabel: '周期ごとの予定日',
    thStart: '月経開始',
    thFertile: '妊娠しやすい時期',
    thOvulation: '排卵日',
    thNext: '次の月経',
    notice:
      '結果は目安です。気になることは医師にご相談ください。いわゆる「安全日」は避妊法として確実ではありません。排卵日はストレスや体調、授乳などで前後し、精子は数日生きるため、どの時期でも妊娠の可能性があります。避妊にはコンドームや低用量ピルなど確実な方法を使ってください。データはブラウザ内で計算され、送信されません。',
    client: {
      kinds: { period: '月経期間', ovulation: '排卵日', fertile: '妊娠しやすい時期', other: '妊娠しにくい時期' },
      errors: {
        cycle: '月経周期は 21〜45 日の整数で入力してください。',
        period: '月経期間は 2〜10 日の整数で入力してください。',
        future: '最終月経の開始日に未来の日付は指定できません。',
      },
      errorDate: '最終月経の開始日を選択してください。',
      errorGeneric: '計算できません。入力内容をご確認ください。',
      mainToday: '今日が排卵予定日です',
      mainFuture: { other: '排卵予定日（あと {n} 日）' },
      mainPast: '今周期の排卵予定日（経過）',
      todayCycle: '今日（周期 {n} 日目）',
      sep: '、',
      today: '今日',
      intl: {
        main: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' },
        md: { month: 'numeric', day: 'numeric' },
        mdw: { month: 'numeric', day: 'numeric', weekday: 'short' },
        caption: { year: 'numeric', month: 'long' },
        day: { month: 'long', day: 'numeric' },
        weekday: 'short',
        rangeSep: '〜',
      },
    },
  },
});

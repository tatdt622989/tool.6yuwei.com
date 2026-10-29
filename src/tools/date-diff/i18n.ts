import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { SpanUnit } from './logic';

export interface Strings {
  modeAria: string;
  modeDiff: string;
  modeAdd: string;
  startLabel: string;
  endLabel: string;
  includeEnd: string;
  setToday: string;
  swap: string;
  statSpan: string;
  statWeeks: string;
  statWork: string;
  statHours: string;
  hint: string;
  baseLabel: string;
  nLabel: string;
  dirLabel: string;
  dirAfter: string;
  dirBefore: string;
  quickAria: string;
  quickLabel: string;
  client: {
    /** Date display: 'zh' = 2026 年 10 月 29 日（四）, 'intl' = Intl full date in the page locale. */
    dateStyle: 'zh' | 'intl';
    days: PluralForms;
    weeks: PluralForms;
    hours: PluralForms;
    span: Record<SpanUnit, PluralForms>;
    /** {a} {b} = formatted dates. */
    range: string;
    includedSuffix: string;
    reversed: string;
    pickDates: string;
    pickBase: string;
    enterDays: string;
    /** {date} {days} */
    after: string;
    before: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '計算模式',
    modeDiff: '兩個日期相差幾天',
    modeAdd: '日期加減天數',
    startLabel: '開始日期',
    endLabel: '結束日期',
    includeEnd: '包含結束日（多算 1 天）',
    setToday: '開始日設為今天',
    swap: '對調日期',
    statSpan: '年／月／日',
    statWeeks: '週數',
    statWork: '工作天（週一至週五）',
    statHours: '總小時數',
    hint: '工作天只排除週六、週日，未扣除國定假日、颱風假與補班日。',
    baseLabel: '起算日期',
    nLabel: '天數',
    dirLabel: '方向',
    dirAfter: '之後（往後算）',
    dirBefore: '之前（往前算）',
    quickAria: '常用天數',
    quickLabel: '常用：',
    client: {
      dateStyle: 'zh',
      days: { other: '{n} 天' },
      weeks: { other: '{n} 週' },
      hours: { other: '{n} 小時' },
      span: { years: { other: '{n} 年' }, months: { other: '{n} 個月' }, days: { other: '{n} 天' } },
      range: '{a} 到 {b}',
      includedSuffix: '（含結束日）',
      reversed: '結束日期早於開始日期，已改以較早的日期起算',
      pickDates: '請選擇開始與結束日期',
      pickBase: '請選擇起算日期',
      enterDays: '請輸入天數，例如 100',
      after: '{date} 之後 {days}',
      before: '{date} 之前 {days}',
    },
  },
  en: {
    modeAria: 'Calculation',
    modeDiff: 'Days between dates',
    modeAdd: 'Add or subtract days',
    startLabel: 'Start date',
    endLabel: 'End date',
    includeEnd: 'Include end date (adds 1 day)',
    setToday: 'Start from today',
    swap: 'Swap dates',
    statSpan: 'Years, months, days',
    statWeeks: 'Weeks',
    statWork: 'Business days (Mon–Fri)',
    statHours: 'Total hours',
    hint: 'Business days skip Saturdays and Sundays only. Federal and state holidays are not subtracted.',
    baseLabel: 'Start date',
    nLabel: 'Number of days',
    dirLabel: 'Direction',
    dirAfter: 'After (add)',
    dirBefore: 'Before (subtract)',
    quickAria: 'Common day counts',
    quickLabel: 'Quick:',
    client: {
      dateStyle: 'intl',
      days: { one: '{n} day', other: '{n} days' },
      weeks: { one: '{n} week', other: '{n} weeks' },
      hours: { one: '{n} hour', other: '{n} hours' },
      span: {
        years: { one: '{n} year', other: '{n} years' },
        months: { one: '{n} month', other: '{n} months' },
        days: { one: '{n} day', other: '{n} days' },
      },
      range: 'From {a} to {b}',
      includedSuffix: ' (end date included)',
      reversed: 'The end date is before the start date, so the count runs from the earlier date.',
      pickDates: 'Choose a start date and an end date',
      pickBase: 'Choose a start date',
      enterDays: 'Enter a number of days, for example 90',
      after: '{days} after {date}',
      before: '{days} before {date}',
    },
  },
  ja: {
    modeAria: '計算の種類',
    modeDiff: '2 つの日付の日数',
    modeAdd: '日付に日数を足す・引く',
    startLabel: '開始日',
    endLabel: '終了日',
    includeEnd: '終了日も含める（1 日多く数える）',
    setToday: '開始日を今日にする',
    swap: '日付を入れ替える',
    statSpan: '年・か月・日',
    statWeeks: '週数',
    statWork: '平日（月〜金）',
    statHours: '合計時間',
    hint: '平日は土曜・日曜を除いた日数です。国民の祝日や年末年始の休業日は差し引いていません。',
    baseLabel: '基準日',
    nLabel: '日数',
    dirLabel: '方向',
    dirAfter: '後（足す）',
    dirBefore: '前（引く）',
    quickAria: 'よく使う日数',
    quickLabel: 'よく使う日数：',
    client: {
      dateStyle: 'intl',
      days: { other: '{n} 日' },
      weeks: { other: '{n} 週' },
      hours: { other: '{n} 時間' },
      span: { years: { other: '{n} 年' }, months: { other: '{n} か月' }, days: { other: '{n} 日' } },
      range: '{a} から {b} まで',
      includedSuffix: '（終了日を含む）',
      reversed: '終了日が開始日より前なので、早いほうの日付から数えています',
      pickDates: '開始日と終了日を選んでください',
      pickBase: '基準日を選んでください',
      enterDays: '日数を入力してください（例：100）',
      after: '{date} の {days}後',
      before: '{date} の {days}前',
    },
  },
});

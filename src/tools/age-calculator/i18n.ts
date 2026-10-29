import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { SignId } from './logic';

/** Stat tiles under the result. ids in Tool.astro: #ag-<key>. */
export type AgeStat = 'nominal' | 'months' | 'weeks' | 'lived' | 'next' | 'zodiac' | 'kanshi' | 'sign' | 'born';

export interface Strings {
  /** Present only where 民國 years are offered (zh-TW). */
  era?: {
    legend: string;
    ad: string;
    roc: string;
  };
  /** US order: month, day, year. */
  monthFirst?: boolean;
  yearLabel: string;
  monthLabel: string;
  dayLabel: string;
  onLabel: string;
  onHint: string;
  stats: Partial<Record<AgeStat, string>>;
  hint: string;
  client: {
    /** 'zh' = hand-written zh-TW formats; 'intl' = Intl dates in the page locale. */
    dateStyle: 'zh' | 'intl';
    /** Birth date shown in the "born" tile label: 和暦 (ja) or a full Intl date (en). */
    bornLabel?: 'wareki' | 'intl';
    yearLabelAd: string;
    yearLabelRoc?: string;
    /** Month option text; absent = Intl month name. */
    monthOption?: string;
    dayOption: string;
    main: PluralForms;
    years: PluralForms;
    months: PluralForms;
    days: PluralForms;
    weeks?: PluralForms;
    /** {years} {months} {days} = already formatted parts. */
    detail: string;
    nextToday: string;
    /** {age} */
    nextTodayLabel: string;
    /** {age} {date} */
    nextLabel: string;
    signs?: Record<SignId, string>;
    errorYear: string;
    errorYearRoc?: string;
    errorFuture: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    era: { legend: '出生年份格式', ad: '西元年', roc: '民國年' },
    yearLabel: '出生年（西元）',
    monthLabel: '月',
    dayLabel: '日',
    onLabel: '計算到哪一天',
    onHint: '預設為今天，可改成任一日期，查詢當時或未來的年齡。',
    stats: {
      nominal: '虛歲',
      lived: '已經活了',
      next: '距離下次生日',
      zodiac: '生肖（依西元年）',
      sign: '星座',
      born: '出生日',
    },
    hint: '生肖以西元年切換；1–2 月出生、在農曆新年前的人，傳統上屬前一年的生肖。',
    client: {
      dateStyle: 'zh',
      yearLabelAd: '出生年（西元）',
      yearLabelRoc: '出生年（民國）',
      monthOption: '{n} 月',
      dayOption: '{n} 日',
      main: { other: '{n} 歲' },
      years: { other: '{n} 歲' },
      months: { other: '{n} 個月' },
      days: { other: '{n} 天' },
      detail: '實歲 {years} {months} {days}',
      nextToday: '就是今天',
      nextTodayLabel: '{age} 歲生日',
      nextLabel: '距離 {age} 歲生日（{date}）',
      errorYear: '請輸入西元出生年，例如 1990',
      errorYearRoc: '請輸入民國出生年，例如 79',
      errorFuture: '出生日期晚於計算日期，請確認年份是否正確',
    },
  },
  en: {
    monthFirst: true,
    yearLabel: 'Birth year',
    monthLabel: 'Month',
    dayLabel: 'Day',
    onLabel: 'Age on this date',
    onHint: 'Defaults to today. Pick any date to see your age in the past or future.',
    stats: {
      months: 'Age in months',
      weeks: 'Age in weeks',
      lived: 'Age in days',
      next: 'Until your next birthday',
      sign: 'Zodiac sign',
      born: 'Day you were born',
    },
    hint: 'You turn a year older on your birthday. If you were born on February 29, the calculator counts your birthday as March 1 in non-leap years.',
    client: {
      dateStyle: 'intl',
      bornLabel: 'intl',
      yearLabelAd: 'Birth year',
      dayOption: '{n}',
      main: { one: '{n} year old', other: '{n} years old' },
      years: { one: '{n} year', other: '{n} years' },
      months: { one: '{n} month', other: '{n} months' },
      days: { one: '{n} day', other: '{n} days' },
      weeks: { one: '{n} week', other: '{n} weeks' },
      detail: '{years}, {months}, {days}',
      nextToday: 'Today',
      nextTodayLabel: 'Happy birthday! You turn {age} today',
      nextLabel: 'Until you turn {age} on {date}',
      signs: {
        capricorn: 'Capricorn',
        aquarius: 'Aquarius',
        pisces: 'Pisces',
        aries: 'Aries',
        taurus: 'Taurus',
        gemini: 'Gemini',
        cancer: 'Cancer',
        leo: 'Leo',
        virgo: 'Virgo',
        libra: 'Libra',
        scorpio: 'Scorpio',
        sagittarius: 'Sagittarius',
      },
      errorYear: 'Enter your birth year, for example 1990',
      errorFuture: 'The birth date is after the date you are calculating to. Check the year.',
    },
  },
  ja: {
    yearLabel: '生まれた年（西暦）',
    monthLabel: '月',
    dayLabel: '日',
    onLabel: '基準日',
    onHint: '初期値は今日です。別の日付にすると、その日時点の年齢がわかります。',
    stats: {
      nominal: '数え年',
      lived: '生まれてからの日数',
      next: '次の誕生日まで',
      kanshi: '干支',
      sign: '星座',
      born: '生まれた日',
    },
    hint: '満年齢は誕生日に 1 歳加わる数え方で表示しています。干支は 1 月 1 日で切り替えています（占いなどで立春を境にする場合は、1 月 1 日〜2 月 3 日ごろ生まれの方は前年の干支になります）。',
    client: {
      dateStyle: 'intl',
      bornLabel: 'wareki',
      yearLabelAd: '生まれた年（西暦）',
      monthOption: '{n}月',
      dayOption: '{n}日',
      main: { other: '満 {n} 歳' },
      years: { other: '{n} 歳' },
      months: { other: '{n} か月' },
      days: { other: '{n} 日' },
      detail: '満 {years} {months} {days}',
      nextToday: '今日です',
      nextTodayLabel: '{age} 歳の誕生日',
      nextLabel: '{age} 歳の誕生日（{date}）まで',
      signs: {
        capricorn: 'やぎ座',
        aquarius: 'みずがめ座',
        pisces: 'うお座',
        aries: 'おひつじ座',
        taurus: 'おうし座',
        gemini: 'ふたご座',
        cancer: 'かに座',
        leo: 'しし座',
        virgo: 'おとめ座',
        libra: 'てんびん座',
        scorpio: 'さそり座',
        sagittarius: 'いて座',
      },
      errorYear: '生まれた年を西暦で入力してください（例：1990）',
      errorFuture: '生年月日が基準日より後になっています。年を確認してください',
    },
  },
});

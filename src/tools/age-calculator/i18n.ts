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
  /** Day-count milestones (logic.ts DAY_MILESTONES). */
  milestones: {
    title: string;
    /** One name per DAY_MILESTONES entry, in the same order. */
    names: string[];
    hint: string;
  };
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
    /** {n} = 實歲 on the milestone date. */
    msAge: PluralForms;
    /** {n} = days from the reference date. */
    msUntil: PluralForms;
    msToday: string;
    msPassed: PluralForms;
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
    milestones: {
      title: '活滿 1 萬天、2 萬天、3 萬天是哪一天',
      names: ['1 萬天', '2 萬天', '3 萬天'],
      hint: '天數和上方「已經活了」一樣，以出生當天為第 0 天計算，列出的日期就是「已經活了」剛好顯示 10,000、20,000、30,000 天的那天；若把出生當天算成第 1 天，「第 1 萬天」會早一天。倒數以「計算到哪一天」為準。',
    },
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
      msAge: { other: '當時 {n} 歲' },
      msUntil: { other: '還有 {n} 天' },
      msToday: '就是今天',
      msPassed: { other: '已過 {n} 天' },
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
    milestones: {
      title: 'When you turn 10,000, 20,000 and 30,000 days old',
      names: ['10,000 days', '20,000 days', '30,000 days'],
      hint: 'Days are counted the same way as Age in days: the day you were born is day 0, so these are the dates when Age in days reads exactly 10,000, 20,000 and 30,000. If you count your birth day as day 1, your 10,000th day is one day earlier. The countdown runs from Age on this date.',
    },
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
      msAge: { other: 'at age {n}' },
      msUntil: { one: 'in {n} day', other: 'in {n} days' },
      msToday: 'Today',
      msPassed: { one: '{n} day ago', other: '{n} days ago' },
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
    milestones: {
      title: '生まれてから 1 万日・2 万日・3 万日になる日',
      names: ['1 万日', '2 万日', '3 万日'],
      hint: '「生まれてからの日数」と同じく、生まれた日を 0 日目として数えています。表示している日付は、その日数がちょうど 10,000 日・20,000 日・30,000 日になる日です。生まれた日を 1 日目と数える「1 万日目」は、その前日になります。残り日数は基準日から数えています。',
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
      msAge: { other: '{n} 歳のとき' },
      msUntil: { other: 'あと {n} 日' },
      msToday: '今日です',
      msPassed: { other: '{n} 日前' },
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { ExampleId, Frequency, Mode, PayPeriod } from './logic';

export interface Strings {
  modeAria: string;
  modes: Record<Mode, string>;
  priceLabel: string;
  amountLabel: string;
  frequencyLabel: string;
  examplesLabel: string;
  examplesHint: string;
  resultAria: string;
  /** Labels of the four numbers under the result, per mode. */
  statsOnce: { hours: string; monthShare: string; hourly: string; daily: string };
  statsHabit: { perYear: string; perMonth: string; hours: string; yearShare: string };
  settings: string;
  periodAria: string;
  periods: Record<PayPeriod, string>;
  /** Label of the amount field, per pay period. */
  payLabel: Record<PayPeriod, string>;
  currency: string;
  workDays: string;
  hoursPerDay: string;
  grossNote: string;
  saveHint: string;
  /** Link in the result that jumps to the pay form. */
  editPay: string;
  share: string;
  shareHint: string;
  client: {
    /** Line above the big result. {price}; for habits {amount}, {freq} (a freqPhrase) and {year} = cost per year. */
    lead: Record<Mode, string>;
    /** Shown instead of a result while the price is empty or 0. */
    needInput: Record<Mode, string>;
    needPay: string;
    /** Short labels of the "how often" buttons. */
    frequencies: Record<Frequency, string>;
    /** A recurring cost in a sentence: "every workday". */
    freqPhrase: Record<Frequency, string>;
    /** Parts of the working time, {n} first: "16 days", "4 hours". The big result splits number and unit. */
    units: { day: PluralForms; hour: PluralForms; minute: PluralForms };
    underMinute: string;
    /** Total hours with decimals, {n}. */
    hoursValue: PluralForms;
    /** "From Monday at {start} to…" sentences. {time}, {day} = a weekday, {week} = week number, {years}. */
    sentence: { sameDay: string; sameWeek: string; later: string; years: string };
    /** {amount} = cost each time, {each} = working time for one, {share} = percent of a year's working time. */
    habitSentence: string;
    /** {start}, {h} = paid hours per day. */
    clockNote: string;
    /** Monday to Friday. */
    weekdays: [string, string, string, string, string];
    /** Clock style for {start} and {time}. */
    hour12: boolean;
    /** {hourly}. */
    rateLine: string;
    /** {hours} = paid hours a month, {hourly}. */
    basis: string;
    /** Captions of the picture. {n} = working days per month, {m} = months shown, {days} = a units.day text. */
    grid: { once: string; months: string; overflow: string; habit: string; habitOverflow: string };
    /** Label under a month block, {n}. */
    monthLabel: string;
    exampleNames: Record<ExampleId, string>;
    /** Text of an example button. {name}, {price}; for habits also {freq} (a freqPhrase) and {often} (a frequencies label). */
    example: Record<Mode, string>;
    noExamples: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '要換算的花費類型',
    modes: { once: '買一樣東西', habit: '固定花費' },
    priceLabel: '價格',
    amountLabel: '每次金額',
    frequencyLabel: '多久一次',
    examplesLabel: '範例價格（按一下帶入，可以再改）',
    examplesHint: '範例是方便試算的整數，不代表任何商品或品牌的實際售價。',
    resultAria: '換算結果',
    statsOnce: { hours: '總工時', monthShare: '佔一個月薪水', hourly: '你的時薪', daily: '你的日薪' },
    statsHabit: { perYear: '一年花費', perMonth: '平均每月', hours: '一年工時', yearShare: '佔一年薪水' },
    settings: '你的薪水與工時',
    periodAria: '薪資計算方式',
    periods: { month: '月薪', year: '年薪', hour: '時薪' },
    payLabel: { month: '月薪（稅前）', year: '年薪（稅前）', hour: '時薪' },
    currency: '幣別',
    workDays: '每月上班天數',
    hoursPerDay: '每天上班時數',
    grossNote: '以稅前薪水換算，沒有扣掉勞健保、所得稅和生活開銷。想用實領來算，把薪水改填實領金額就可以。',
    saveHint: '薪水設定只存在這個瀏覽器，不會上傳。',
    editPay: '改成我的薪水',
    share: '複製結果連結',
    shareHint: '連結會帶著你填的薪水和價格，對方打開就看到同一個結果；不想讓對方知道薪水就不要分享。',
    client: {
      lead: { once: '{price} 等於你上班', habit: '{freq} {amount}，一年 {year}，等於你上班' },
      needInput: { once: '輸入價格，看看要上班多久', habit: '輸入每次的金額，看看一年要上班多久' },
      needPay: '請先在「你的薪水與工時」填入大於 0 的薪水。',
      frequencies: { workday: '每個上班日', day: '每天', week: '每週', month: '每月' },
      freqPhrase: { workday: '每個上班日', day: '每天', week: '每週', month: '每月' },
      units: { day: { other: '{n} 天' }, hour: { other: '{n} 小時' }, minute: { other: '{n} 分鐘' } },
      underMinute: '不到 1 分鐘',
      hoursValue: { other: '{n} 小時' },
      sentence: {
        sameDay: '以週一 {start} 上班來算，做到當天 {time} 就賺到這筆錢。',
        sameWeek: '以週一 {start} 上班來算，要做到{day} {time} 才賺到這筆錢。',
        later: '以週一 {start} 上班來算，要做到第 {week} 週的{day} {time} 才賺到這筆錢。',
        years: '這筆錢相當於你 {years} 年的稅前薪水。',
      },
      habitSentence: '每次 {amount} 等於上班 {each}；一整年的上班時間裡，有 {share} 是在付這筆花費。',
      clockNote: '假設週一到週五、每天從 {start} 起連續上班 {h} 小時，不計休息時間。',
      weekdays: ['週一', '週二', '週三', '週四', '週五'],
      hour12: false,
      rateLine: '以稅前時薪 {hourly} 換算',
      basis: '一個月上班 {hours} 小時，換算時薪 {hourly}',
      grid: {
        once: '一個月 {n} 個上班日，塗色的 {days}是在付這筆錢。',
        months: '{m} 個月的上班日（每月 {n} 天），塗色的 {days}是在付這筆錢。',
        overflow: '這筆錢超過 12 個月的薪水，圖上只畫出前 12 個月。',
        habit: '一年 12 個月的上班日（每月 {n} 天），塗色的 {days}是在付這筆花費。',
        habitOverflow: '這筆花費超過一整年的薪水，12 個月都塗滿了。',
      },
      monthLabel: '第 {n} 個月',
      exampleNames: {
        phone: '手機',
        laptop: '筆電',
        concert: '演唱會門票',
        trip: '出國旅行',
        coffee: '咖啡',
        lunch: '午餐',
        dinner: '聚餐',
        streaming: '影音訂閱',
        gym: '健身房',
      },
      example: { once: '{name} {price}', habit: '{name} {price}／{often}' },
      noExamples: '範例價格只提供新台幣、美元和日圓。',
    },
  },
  en: {
    modeAria: 'Kind of cost to convert',
    modes: { once: 'One-off purchase', habit: 'Recurring cost' },
    priceLabel: 'Price',
    amountLabel: 'Cost each time',
    frequencyLabel: 'How often',
    examplesLabel: 'Example prices (tap to fill in, then edit)',
    examplesHint: 'Examples are round numbers to start from, not the price of any product or brand.',
    resultAria: 'Result',
    statsOnce: { hours: 'Total hours', monthShare: 'Share of a month’s pay', hourly: 'Your hourly pay', daily: 'Your daily pay' },
    statsHabit: { perYear: 'Cost per year', perMonth: 'Average per month', hours: 'Hours per year', yearShare: 'Share of a year’s pay' },
    settings: 'Your pay and hours',
    periodAria: 'Pay period',
    periods: { month: 'Monthly', year: 'Yearly', hour: 'Hourly' },
    payLabel: { month: 'Monthly salary (gross)', year: 'Annual salary (gross)', hour: 'Hourly wage' },
    currency: 'Currency',
    workDays: 'Working days per month',
    hoursPerDay: 'Paid hours per day',
    grossNote:
      'Converted from gross pay: taxes, deductions and living costs are not taken off. To work from take-home pay, enter your net pay instead.',
    saveHint: 'Your pay settings stay in this browser and are never uploaded.',
    editPay: 'Use my pay',
    share: 'Copy link to this result',
    shareHint:
      'The link includes the pay and price you entered, so anyone who opens it sees the same result. Do not share it if you want to keep your pay private.',
    client: {
      lead: { once: 'To earn {price}, you work', habit: '{amount} {freq} is {year} a year. To earn that, you work' },
      needInput: { once: 'Enter a price to see how long you work for it', habit: 'Enter the cost each time to see the hours per year' },
      needPay: 'Enter pay above 0 under “Your pay and hours” first.',
      frequencies: { workday: 'Workdays', day: 'Daily', week: 'Weekly', month: 'Monthly' },
      freqPhrase: { workday: 'every workday', day: 'every day', week: 'every week', month: 'every month' },
      units: {
        day: { one: '{n} day', other: '{n} days' },
        hour: { one: '{n} hour', other: '{n} hours' },
        minute: { one: '{n} min', other: '{n} min' },
      },
      underMinute: 'Under 1 min',
      hoursValue: { one: '{n} hour', other: '{n} hours' },
      sentence: {
        sameDay: 'Start on Monday at {start} and you have earned it by {time} the same day.',
        sameWeek: 'Start on Monday at {start} and you have earned it by {time} on {day}.',
        later: 'Start on Monday at {start} and you have earned it by {time} on {day} of week {week}.',
        years: 'That is {years} years of your gross pay.',
      },
      habitSentence: 'Each {amount} is {each} of work. Over a year, {share} of your working time goes to this cost.',
      clockNote: 'Assumes Monday to Friday, {h} paid hours in a row from {start} each day, breaks not counted.',
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hour12: true,
      rateLine: 'Converted at {hourly} an hour, before tax',
      basis: '{hours} paid hours a month, which is {hourly} an hour',
      grid: {
        once: 'One month of {n} working days. Filled in: the {days} that pay for this.',
        months: '{m} months of working days ({n} a month). Filled in: the {days} that pay for this.',
        overflow: 'This is more than 12 months of pay. The picture shows the first 12 months only.',
        habit: 'A year of working days (12 months of {n}). Filled in: the {days} that pay for this cost.',
        habitOverflow: 'This cost is more than a full year of pay, so all 12 months are filled in.',
      },
      monthLabel: 'Month {n}',
      exampleNames: {
        phone: 'Phone',
        laptop: 'Laptop',
        concert: 'Concert ticket',
        trip: 'Vacation',
        coffee: 'Coffee',
        lunch: 'Lunch out',
        dinner: 'Dinner out',
        streaming: 'Streaming',
        gym: 'Gym',
      },
      example: { once: '{name} {price}', habit: '{name} {price} {freq}' },
      noExamples: 'Example prices are available for USD, JPY and TWD.',
    },
  },
  ja: {
    modeAria: '換算する出費の種類',
    modes: { once: '一度きりの買い物', habit: '繰り返す出費' },
    priceLabel: '値段',
    amountLabel: '1回あたりの金額',
    frequencyLabel: '頻度',
    examplesLabel: '金額の例（タップで入力、あとから変更できます）',
    examplesHint: '例はきりのよい目安の金額で、特定の商品やブランドの価格ではありません。',
    resultAria: '換算結果',
    statsOnce: { hours: '合計の勤務時間', monthShare: '月給に占める割合', hourly: 'あなたの時給', daily: 'あなたの日給' },
    statsHabit: { perYear: '1年の出費', perMonth: '1か月あたり', hours: '1年の勤務時間', yearShare: '年収に占める割合' },
    settings: '給与と勤務時間',
    periodAria: '給与の形態',
    periods: { month: '月給', year: '年収', hour: '時給' },
    payLabel: { month: '月給（額面）', year: '年収（額面）', hour: '時給' },
    currency: '通貨',
    workDays: '月の出勤日数',
    hoursPerDay: '1日の労働時間',
    grossNote:
      '額面の給与で換算しています。税金・社会保険料や生活費は引いていません。手取りで計算したいときは、給与の欄に手取り額を入れてください。',
    saveHint: '給与の設定はこのブラウザにだけ保存され、送信されません。',
    editPay: '自分の給与に変更',
    share: '結果のリンクをコピー',
    shareHint: 'リンクには入力した給与と値段が含まれ、開いた人に同じ結果が表示されます。給与を知られたくない相手には共有しないでください。',
    client: {
      lead: { once: '{price} を稼ぐのに必要な勤務時間', habit: '{freq} {amount}、1年で {year}。これを稼ぐのに必要な勤務時間' },
      needInput: { once: '値段を入れると、何時間働けば買えるかがわかります', habit: '1回あたりの金額を入れると、1年分の勤務時間がわかります' },
      needPay: '先に「給与と勤務時間」で 0 より大きい給与を入れてください。',
      frequencies: { workday: '出勤日ごと', day: '毎日', week: '毎週', month: '毎月' },
      freqPhrase: { workday: '出勤日ごとに', day: '毎日', week: '毎週', month: '毎月' },
      units: { day: { other: '{n}日' }, hour: { other: '{n}時間' }, minute: { other: '{n}分' } },
      underMinute: '1分未満',
      hoursValue: { other: '{n}時間' },
      sentence: {
        sameDay: '月曜の {start} に働き始めると、その日の {time} に稼ぎ終わります。',
        sameWeek: '月曜の {start} に働き始めると、{day}の {time} に稼ぎ終わります。',
        later: '月曜の {start} に働き始めると、{week}週目の{day} {time} に稼ぎ終わります。',
        years: 'あなたの額面給与の {years} 年分にあたります。',
      },
      habitSentence: '1回 {amount} は {each}の勤務にあたります。1年の勤務時間のうち {share} をこの出費にあてている計算です。',
      clockNote: '月〜金、毎日 {start} から {h} 時間続けて働くと仮定しています（休憩は含みません）。',
      weekdays: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'],
      hour12: false,
      rateLine: '額面の時給 {hourly} で換算',
      basis: '1か月の勤務は {hours} 時間、時給に直すと {hourly}',
      grid: {
        once: '1か月の出勤日 {n} 日のうち、色の付いた {days}分がこの買い物にあたります。',
        months: '{m}か月分の出勤日（1か月 {n} 日）。色の付いた {days}分がこの買い物にあたります。',
        overflow: '給与 12か月分を超えています。図は最初の 12か月分だけを表示しています。',
        habit: '1年（12か月）の出勤日（1か月 {n} 日）。色の付いた {days}分がこの出費にあたります。',
        habitOverflow: 'この出費は 1年分の給与を超えているため、12か月すべてに色が付いています。',
      },
      monthLabel: '{n}か月目',
      exampleNames: {
        phone: 'スマホ',
        laptop: 'ノートパソコン',
        concert: 'ライブのチケット',
        trip: '海外旅行',
        coffee: 'コーヒー',
        lunch: '外食ランチ',
        dinner: '飲み会',
        streaming: '動画サブスク',
        gym: 'ジム',
      },
      example: { once: '{name} {price}', habit: '{name} {price}（{often}）' },
      noExamples: '金額の例は円・米ドル・台湾ドルのみ用意しています。',
    },
  },
});

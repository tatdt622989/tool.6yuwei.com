import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { DueInputError, DueMethod, MilestoneStatus, ScheduleId } from './logic';

export interface Strings {
  methodLabel: string;
  methods: Record<DueMethod, string>;
  cycleLabel: string;
  cycleHint: string;
  dueLabel: string;
  ageLabel: string;
  /** 妊娠月数 stat (ja only). */
  monthLabel?: string;
  triLabel: string;
  leftLabel: string;
  concLabel: string;
  tableLabel: string;
  thItem: string;
  thWeeks: string;
  thDate: string;
  thStatus: string;
  tableHint: string;
  notice: string;
  client: {
    /** Prenatal schedule and trimester cut-offs for this market. */
    schedule: ScheduleId;
    dateLabels: Record<DueMethod, string>;
    status: Record<MilestoneStatus, string>;
    errors: Record<DueInputError, string>;
    errorDate: string;
    errorGeneric: string;
    trimesters: [string, string, string, string];
    /** {weeks} {days}: each filled from the plural forms below. */
    age: string;
    weeks: PluralForms;
    days: PluralForms;
    left: PluralForms;
    overdue: PluralForms;
    weekOne: string;
    /** {a} {b} */
    weekRange: string;
    /** 妊娠{n}ヶ月 (ja only). */
    month?: string;
    /** Milestone labels by window id; zh-TW uses the labels from logic.ts. */
    windows?: Record<string, string>;
    /** Numbered prenatal visit, {n}; zh-TW uses the labels from logic.ts. */
    visit?: string;
    /** Intl date styles; zh-TW keeps its hand-built 2027 年 2 月 5 日（五） format. */
    intl?: {
      due: Intl.DateTimeFormatOptions;
      table: Intl.DateTimeFormatOptions;
      short: Intl.DateTimeFormatOptions;
      /** Join two table dates with this instead of Intl formatRange (ja: avoids zero-padded 06/26). */
      rangeSep?: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    methodLabel: '推算依據',
    methods: {
      lmp: '最後一次月經',
      conception: '受孕日',
      ivf3: '試管植入（第 3 天胚胎）',
      ivf5: '試管植入（第 5 天囊胚）',
    },
    cycleLabel: '月經週期（天）',
    cycleHint: '從這次月經第一天到下次月經第一天的天數，一般為 28 天。',
    dueLabel: '預產期（懷孕滿 40 週）',
    ageLabel: '目前懷孕週數',
    triLabel: '孕期（國健署分期）',
    leftLabel: '距離預產期',
    concLabel: '推估受孕日',
    tableLabel: '國健署公費產檢與篩檢時程',
    thItem: '項目',
    thWeeks: '懷孕週數',
    thDate: '建議日期',
    thStatus: '狀態',
    tableHint: '實際產檢日期請依產檢醫院安排；公費項目以國健署最新公告為準。',
    notice:
      '結果僅供參考，請諮詢醫師。只有約 4%–5% 的寶寶剛好在預產期當天出生，37 到 42 週之間出生都屬足月；醫師會依早期超音波量測的胎兒大小校正預產期。日期只在你的瀏覽器中計算，不會上傳。',
    client: {
      schedule: 'tw',
      dateLabels: {
        lmp: '最後一次月經第一天',
        conception: '受孕日（排卵或同房日）',
        ivf3: '胚胎植入日（第 3 天胚胎）',
        ivf5: '囊胚植入日（第 5 天囊胚）',
      },
      status: { done: '已過', current: '進行中', upcoming: '未到' },
      errors: {
        cycleInteger: '請輸入整數的月經週期天數，例如 28。',
        cycleRange: '月經週期請輸入 21 到 45 天；週期極不規則時建議以超音波推算。',
        future: '日期不能晚於今天。',
        tooOld: '這個日期距今已超過 44 週，請確認年份是否正確。',
      },
      errorDate: '請選擇日期。',
      errorGeneric: '無法計算，請檢查輸入。',
      trimesters: ['尚未懷孕', '第一孕期', '第二孕期', '第三孕期'],
      age: '{weeks} {days}',
      weeks: { other: '{n} 週' },
      days: { other: '{n} 天' },
      left: { other: '{n} 天' },
      overdue: { other: '已過 {n} 天' },
      weekOne: '{w} 週',
      weekRange: '{a}–{b} 週',
    },
  },
  en: {
    methodLabel: 'Calculate from',
    methods: {
      lmp: 'Last period',
      conception: 'Conception date',
      ivf3: 'IVF transfer (day 3)',
      ivf5: 'IVF transfer (day 5)',
    },
    cycleLabel: 'Average cycle length (days)',
    cycleHint: 'Count from the first day of one period to the first day of the next. 28 days is typical.',
    dueLabel: 'Estimated due date (40 weeks)',
    ageLabel: 'How far along you are today',
    triLabel: 'Trimester',
    leftLabel: 'Until your due date',
    concLabel: 'Estimated conception',
    tableLabel: 'Key prenatal dates',
    thItem: 'Milestone',
    thWeeks: 'Weeks',
    thDate: 'Dates',
    thStatus: 'Status',
    tableHint:
      'Typical timing based on ACOG and CDC guidance. Your OB-GYN or midwife sets your actual schedule; most people have a visit every 4 weeks until 28 weeks, every 2 weeks until 36 weeks, then weekly.',
    notice:
      'For information only; it does not replace advice from your doctor or midwife. Only about 4% of babies are born on their due date, and most arrive between 37 and 42 weeks. Your provider may adjust your due date after an early ultrasound. Dates are calculated in your browser and never uploaded.',
    client: {
      schedule: 'us',
      dateLabels: {
        lmp: 'First day of your last period',
        conception: 'Conception date (ovulation or intercourse)',
        ivf3: 'Embryo transfer date (day 3 embryo)',
        ivf5: 'Embryo transfer date (day 5 blastocyst)',
      },
      status: { done: 'Past', current: 'Now', upcoming: 'Upcoming' },
      errors: {
        cycleInteger: 'Enter your cycle length as a whole number of days, such as 28.',
        cycleRange: 'Enter a cycle length from 21 to 45 days. If your cycles are very irregular, an early ultrasound dates the pregnancy more accurately.',
        future: 'The date can’t be in the future.',
        tooOld: 'That date is more than 44 weeks ago. Check the year.',
      },
      errorDate: 'Choose a date.',
      errorGeneric: 'Can’t calculate. Check your entries.',
      trimesters: ['Not pregnant yet', 'First trimester', 'Second trimester', 'Third trimester'],
      age: '{weeks}, {days}',
      weeks: { one: '{n} week', other: '{n} weeks' },
      days: { one: '{n} day', other: '{n} days' },
      left: { one: '{n} day', other: '{n} days' },
      overdue: { one: '{n} day past due', other: '{n} days past due' },
      weekOne: '{w}',
      weekRange: '{a}–{b}',
      windows: {
        firstVisit: 'First prenatal visit (typical timing)',
        nipt: 'Cell-free DNA (NIPT) screening, optional',
        nt: 'Nuchal translucency (NT) ultrasound',
        second: 'Second trimester begins',
        anatomy: 'Anatomy scan (20-week ultrasound)',
        glucose: 'Glucose screening for gestational diabetes',
        tdap: 'Tdap vaccine (whooping cough)',
        third: 'Third trimester begins',
        rsv: 'RSV vaccine, if this falls September to January',
        gbs: 'Group B strep (GBS) test',
        earlyTerm: 'Early term (37 weeks)',
        fullTerm: 'Full term (39 weeks)',
        due: 'Due date (40 weeks)',
        lateTerm: 'Late term (41 weeks)',
        postTerm: 'Post-term (42 weeks)',
      },
      intl: {
        due: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
        table: { month: 'short', day: 'numeric', year: 'numeric' },
        short: { month: 'long', day: 'numeric' },
      },
    },
  },
  ja: {
    methodLabel: '計算方法',
    methods: {
      lmp: '最終月経',
      conception: '排卵日',
      ivf3: '初期胚移植（3日目）',
      ivf5: '胚盤胞移植（5日目）',
    },
    cycleLabel: '月経周期（日）',
    cycleHint: '月経が始まった日から次の月経が始まる前日までの日数です。一般的には 28 日です。',
    dueLabel: '出産予定日（40週0日）',
    ageLabel: '今日の妊娠週数',
    monthLabel: '妊娠月数',
    triLabel: '時期',
    leftLabel: '予定日まで',
    concLabel: '受精日の目安',
    tableLabel: '妊婦健診と主な検査・手続きの目安',
    thItem: '項目',
    thWeeks: '妊娠週数',
    thDate: '日付',
    thStatus: '状況',
    tableHint:
      '厚生労働省が示す標準的な妊婦健診（14 回）にもとづく目安です。実際の日程はかかりつけの産院の指示に従ってください。健診の受診票（補助券）は母子健康手帳と一緒に自治体から交付されます。',
    notice:
      '結果は目安です。体調や予定日については必ず医師・助産師にご確認ください。予定日ちょうどに生まれる赤ちゃんは約 5% で、37週0日から41週6日までの出産は正期産です。妊娠初期の超音波検査で予定日が修正されることもあります。日付はブラウザ内で計算され、送信されません。',
    client: {
      schedule: 'jp',
      dateLabels: {
        lmp: '最終月経の開始日',
        conception: '排卵日（受精日）',
        ivf3: '胚移植日（3日目の初期胚）',
        ivf5: '胚移植日（5日目の胚盤胞）',
      },
      status: { done: '済み', current: '期間中', upcoming: 'これから' },
      errors: {
        cycleInteger: '月経周期は整数の日数で入力してください（例：28）。',
        cycleRange: '月経周期は 21〜45 日の範囲で入力してください。周期が不規則な場合は、超音波検査による推定のほうが確実です。',
        future: '未来の日付は指定できません。',
        tooOld: 'この日付は 44 週以上前です。年をご確認ください。',
      },
      errorDate: '日付を選択してください。',
      errorGeneric: '計算できません。入力内容をご確認ください。',
      trimesters: ['妊娠前', '妊娠初期', '妊娠中期', '妊娠後期'],
      age: '{weeks}{days}',
      weeks: { other: '{n}週' },
      days: { other: '{n}日' },
      left: { other: '{n} 日' },
      overdue: { other: '予定日を {n} 日超過' },
      weekOne: '{w}週',
      weekRange: '{a}–{b}週',
      month: '妊娠{n}ヶ月',
      visit: '妊婦健診（{n}回目）',
      windows: {
        boshi: '妊娠届の提出・母子健康手帳の交付（目安）',
        early: '妊娠初期の血液検査（血液型・感染症など）',
        second: '妊娠中期に入る（安定期の目安）',
        blood: '血算・血糖検査',
        htlv: 'HTLV-1 抗体検査（30週頃まで）',
        third: '妊娠後期に入る',
        gbs: 'B群溶血性レンサ球菌（GBS）検査',
        leave: '産前休業の開始（単胎は予定日の 6 週間前）',
        term: '正期産に入る（37週0日）',
        due: '出産予定日（40週0日）',
        postTerm: '過期産（42週0日以降）',
      },
      intl: {
        due: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' },
        table: { month: 'numeric', day: 'numeric' },
        short: { month: 'long', day: 'numeric' },
        rangeSep: '〜',
      },
    },
  },
});

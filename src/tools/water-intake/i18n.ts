import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { ActivityLevel, FluidReference, WaterProblem } from './logic';

export interface Strings {
  weightKg: string;
  sexLabel: string;
  female: string;
  male: string;
  activityLabel: string;
  activities: Record<ActivityLevel, string>;
  exercise: string;
  cupMl: string;
  hot: string;
  /** Present only where a US customary / metric toggle is offered (en). US is the default. */
  units?: {
    legend: string;
    imperial: string;
    metric: string;
    weightLb: string;
    cupOz: string;
  };
  unitPerDay: string;
  rangeLabel: string;
  baseLabel: string;
  extraLabel: string;
  refLabel: string;
  scheduleLabel: string;
  thTime: string;
  thAmount: string;
  disclaimer: string;
  client: {
    /** Which official reference amount to show in the fourth stat. */
    reference: FluidReference;
    /** Show schedule times in the locale's 12-hour clock (7:00 AM) instead of 07:00. */
    clock12?: boolean;
    /** {n} cups, {liters}, {cup} (formatted cup size with unit). */
    cupsLine: PluralForms;
    /** Cup size in metric mode when the cupsLine template has no unit of its own: {n} */
    cupMetric?: string;
    /** {n} ml per kg */
    baseLabel: string;
    /** {n} fl oz per lb (only with `units`). */
    baseLabelUs?: string;
    /** {sex} */
    refLabel: string;
    refSex: { male: string; female: string };
    /** Unit next to the total, per unit system (only with `units`). */
    unitPerDayMetric?: string;
    unitPerDayUs?: string;
    problems: Record<WaterProblem, string>;
    /** Same problems worded for US units (only with `units`). */
    problemsUs?: Partial<Record<WaterProblem, string>>;
    fallback: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    weightKg: '體重（公斤）',
    sexLabel: '性別',
    female: '女性',
    male: '男性',
    activityLabel: '日常活動量',
    activities: { low: '久坐（× 30 ml）', normal: '一般（× 35 ml）', high: '活動量大（× 40 ml）' },
    exercise: '每天運動時間（分鐘）',
    cupMl: '杯子容量（毫升）',
    hot: '天氣炎熱或在高溫環境工作、大量流汗',
    unitPerDay: '毫升／天',
    rangeLabel: '體重 × 30–40 ml 範圍',
    baseLabel: '基本需求',
    extraLabel: '運動與環境補充',
    refLabel: '國健署建議總液體量',
    scheduleLabel: '建議喝水時間表（07:00–21:00 平均分配）',
    thTime: '時間',
    thAmount: '喝水量',
    disclaimer: '結果僅供參考，請諮詢醫師。腎臟病、心臟衰竭、肝硬化或需要限水的人，每日喝水量請遵照醫囑，不要自行增加。資料只在你的瀏覽器中計算，不會上傳。',
    client: {
      reference: 'tw',
      cupsLine: { other: '約 {liters} 公升，{cup} ml 的杯子約喝 {n} 杯' },
      baseLabel: '基本需求（體重 × {n} ml）',
      refLabel: '國健署建議{sex}性每日總液體量',
      refSex: { male: '男', female: '女' },
      problems: {
        missing: '請輸入體重。',
        weight: '體重請以公斤輸入，例如 60。',
        exercise: '運動時間請輸入 0 到 600 分鐘。',
        cup: '杯子容量請輸入 50 到 2000 毫升。',
      },
      fallback: '無法計算，請檢查輸入。',
    },
  },
  en: {
    weightKg: 'Weight (kg)',
    sexLabel: 'Sex',
    female: 'Female',
    male: 'Male',
    activityLabel: 'Daily activity',
    activities: { low: 'Mostly sitting', normal: 'Moderately active', high: 'Very active' },
    exercise: 'Exercise per day (minutes)',
    cupMl: 'Glass size (ml)',
    hot: 'Hot weather, working in the heat or sweating a lot',
    units: {
      legend: 'Units',
      imperial: 'US (fl oz, lb)',
      metric: 'Metric (ml, kg)',
      weightLb: 'Weight (lb)',
      cupOz: 'Glass or bottle size (fl oz)',
    },
    unitPerDay: 'ml/day',
    rangeLabel: 'Typical range for your weight',
    baseLabel: 'Baseline',
    extraLabel: 'Extra for exercise and heat',
    refLabel: 'National Academies guideline',
    scheduleLabel: 'Drinking schedule (spread from 7 AM to 9 PM)',
    thTime: 'Time',
    thAmount: 'Amount',
    disclaimer:
      'For information only, not medical advice. If you have kidney disease, heart failure, liver disease or have been told to limit fluids, follow your doctor’s advice instead. Everything is calculated in your browser and nothing is uploaded.',
    client: {
      reference: 'us',
      clock12: true,
      cupsLine: {
        one: 'That’s {n} glass of {cup} (about {liters} L)',
        other: 'That’s {n} glasses of {cup} (about {liters} L)',
      },
      cupMetric: '{n} ml',
      baseLabel: 'Baseline (weight × {n} ml/kg)',
      baseLabelUs: 'Baseline (weight × {n} fl oz/lb)',
      refLabel: 'National Academies guideline for {sex} (all beverages)',
      refSex: { male: 'men', female: 'women' },
      unitPerDayMetric: 'ml/day',
      unitPerDayUs: 'fl oz/day',
      problems: {
        missing: 'Enter your weight.',
        weight: 'Enter a weight between 20 and 250 kg.',
        exercise: 'Enter 0 to 600 minutes of exercise.',
        cup: 'Enter a glass size between 50 and 2,000 ml.',
      },
      problemsUs: {
        weight: 'Enter a weight between 45 and 550 lb.',
        cup: 'Enter a glass size between 2 and 67 fl oz.',
      },
      fallback: 'Can’t calculate. Check your entries.',
    },
  },
  ja: {
    weightKg: '体重（kg）',
    sexLabel: '性別',
    female: '女性',
    male: '男性',
    activityLabel: 'ふだんの活動量',
    activities: { low: '座りがち（× 30 ml）', normal: 'ふつう（× 35 ml）', high: '活発（× 40 ml）' },
    exercise: '1日の運動時間（分）',
    cupMl: 'コップの容量（ml）',
    hot: '暑い日・暑い場所での作業・汗を多くかく',
    unitPerDay: 'ml／日',
    rangeLabel: '体重 × 30〜40 ml の範囲',
    baseLabel: '基本の量',
    extraLabel: '運動・暑さによる追加分',
    refLabel: '飲み水の目安（厚生労働省）',
    scheduleLabel: '水分補給のタイムテーブル（7:00〜21:00 に均等に配分）',
    thTime: '時刻',
    thAmount: '飲む量',
    disclaimer:
      '結果は目安です。腎臓病、心不全、肝硬変などで水分制限を受けている方は、医師の指示に従い、自己判断で量を増やさないでください。計算はすべてブラウザ内で行い、データは送信されません。',
    client: {
      reference: 'jp',
      cupsLine: { other: '約 {liters} L、{cup} ml のコップで約 {n} 杯' },
      baseLabel: '基本の量（体重 × {n} ml）',
      refLabel: '飲み水の目安（厚生労働省・男女共通）',
      refSex: { male: '男性', female: '女性' },
      problems: {
        missing: '体重を入力してください。',
        weight: '体重は kg で入力してください（例：55）。',
        exercise: '運動時間は 0〜600 分で入力してください。',
        cup: 'コップの容量は 50〜2,000 ml で入力してください。',
      },
      fallback: '計算できません。入力内容を確認してください。',
    },
  },
});

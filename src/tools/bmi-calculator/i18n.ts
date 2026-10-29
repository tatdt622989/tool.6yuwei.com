import { defineToolI18n } from '../../i18n/tool';
import type { BmiLevel, BmiStandard } from './logic';

export interface Strings {
  /** Classification standard for this locale's readers. */
  standard: BmiStandard;
  heightCm: string;
  weightKg: string;
  /** Present only where a metric / US customary toggle is offered (en). */
  units?: {
    legend: string;
    metric: string;
    imperial: string;
    heightFt: string;
    heightIn: string;
    weightLb: string;
  };
  resultLabel: string;
  rangeLabel: string;
  /** Optional third stat: 標準体重 (BMI 22) for ja. */
  idealLabel?: string;
  hint: string;
  client: {
    levels: Partial<Record<BmiLevel, string>>;
    errorEmpty: string;
    errorHeight: string;
    errorWeight: string;
    inRange: string;
    gapDefault: string;
    gapLose: string;
    gapGain: string;
    kg: string;
    lb: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    standard: 'tw',
    heightCm: '身高（公分）',
    weightKg: '體重（公斤）',
    resultLabel: '你的 BMI（身體質量指數）',
    rangeLabel: '此身高的健康體重',
    hint: '標準依衛福部國民健康署成人定義：BMI < 18.5 過輕、18.5–24 正常、24–27 過重、27 以上肥胖。未滿 18 歲、孕婦與肌肉量高的運動員不適用此標準。',
    client: {
      levels: {
        under: '體重過輕',
        normal: '健康體位',
        over: '體重過重',
        obese1: '輕度肥胖',
        obese2: '中度肥胖',
        obese3: '重度肥胖',
      },
      errorEmpty: '請輸入身高與體重。',
      errorHeight: '身高請以公分輸入，例如 170。',
      errorWeight: '體重請以公斤輸入，例如 65。',
      inRange: '已在範圍內',
      gapDefault: '距離健康體位',
      gapLose: '減重至健康上限約需',
      gapGain: '增重至健康下限約需',
      kg: 'kg',
      lb: 'lb',
    },
  },
  en: {
    standard: 'who',
    heightCm: 'Height (cm)',
    weightKg: 'Weight (kg)',
    units: {
      legend: 'Units',
      metric: 'Metric (cm, kg)',
      imperial: 'US (ft, in, lb)',
      heightFt: 'Height (ft)',
      heightIn: 'Height (in)',
      weightLb: 'Weight (lb)',
    },
    resultLabel: 'Your BMI (body mass index)',
    rangeLabel: 'Healthy weight for your height',
    hint: 'Uses the WHO adult categories: under 18.5 underweight, 18.5–24.9 healthy weight, 25–29.9 overweight, 30 and above obesity. Not intended for children and teens, pregnant women, or very muscular athletes.',
    client: {
      levels: {
        under: 'Underweight',
        normal: 'Healthy weight',
        over: 'Overweight',
        obese1: 'Obesity class I',
        obese2: 'Obesity class II',
        obese3: 'Obesity class III',
      },
      errorEmpty: 'Enter your height and weight.',
      errorHeight: 'Enter a height between 50 and 250 cm (about 1 ft 8 in to 8 ft 2 in).',
      errorWeight: 'Enter a weight between 10 and 400 kg (about 22 to 880 lb).',
      inRange: 'In range',
      gapDefault: 'Distance from a healthy weight',
      gapLose: 'To reach the healthy range, lose about',
      gapGain: 'To reach the healthy range, gain about',
      kg: 'kg',
      lb: 'lb',
    },
  },
  ja: {
    standard: 'jp',
    heightCm: '身長（cm）',
    weightKg: '体重（kg）',
    resultLabel: 'あなたの BMI',
    rangeLabel: '普通体重の範囲',
    idealLabel: '標準体重（BMI 22）',
    hint: '判定は日本肥満学会の基準によります：18.5 未満 低体重、18.5 以上 25 未満 普通体重、25 以上 肥満（1〜4 度）。18 歳未満の方、妊娠中の方、筋肉量の多いアスリートには当てはまりません。',
    client: {
      levels: {
        under: '低体重',
        normal: '普通体重',
        obese1: '肥満（1度）',
        obese2: '肥満（2度）',
        obese3: '肥満（3度）',
        obese4: '肥満（4度）',
      },
      errorEmpty: '身長と体重を入力してください。',
      errorHeight: '身長は cm で入力してください（例：165）。',
      errorWeight: '体重は kg で入力してください（例：60）。',
      inRange: '範囲内です',
      gapDefault: '普通体重までの差',
      gapLose: '普通体重の上限まで減らす目安',
      gapGain: '普通体重の下限まで増やす目安',
      kg: 'kg',
      lb: 'lb',
    },
  },
});

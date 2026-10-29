import { defineToolI18n } from '../../i18n/tool';
import type { ActivityId, BodyProblem, GoalId } from './logic';

export interface Strings {
  sexLabel: string;
  male: string;
  female: string;
  age: string;
  heightCm: string;
  weightKg: string;
  /** Present only where a US customary / metric toggle is offered (en). US is the default. */
  units?: {
    legend: string;
    imperial: string;
    metric: string;
    heightFt: string;
    heightIn: string;
    weightLb: string;
  };
  activityLabel: string;
  activities: Record<ActivityId, { label: string; hint: string }>;
  /** {label} {hint} {factor} */
  activityOption: string;
  unitPerDay: string;
  resultLabel: string;
  bmrLabel: string;
  /** Labels of the two comparison stats: Harris-Benedict (zh, en) or Japanese formulas (ja). */
  altLabels: [string, string];
  goalsLabel: string;
  thGoal: string;
  thKcal: string;
  thProtein: string;
  thFat: string;
  thCarb: string;
  disclaimer: string;
  client: {
    /** Which comparison stats to show next to the Mifflin-St Jeor BMR. */
    alt: 'harris' | 'japan';
    goals: Record<GoalId, string>;
    /** {n} formatted kcal: stats and table cells. */
    kcal: string;
    kcalCell: string;
    /** {kcal} {floor} */
    hintFloored: string;
    /** {n} formatted minimum, per sex. */
    floorMale: string;
    floorFemale: string;
    hintDefault: string;
    /** Same as hintDefault, worded for US units (only with `units`). */
    hintDefaultUs?: string;
    problems: Record<BodyProblem, string>;
    fallback: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    sexLabel: '性別',
    male: '男性',
    female: '女性',
    age: '年齡（歲）',
    heightCm: '身高（公分）',
    weightKg: '體重（公斤）',
    activityLabel: '活動量',
    activities: {
      sedentary: { label: '久坐', hint: '辦公室工作、幾乎不運動' },
      light: { label: '輕度活動', hint: '每週運動 1–3 天' },
      moderate: { label: '中度活動', hint: '每週運動 3–5 天' },
      active: { label: '高度活動', hint: '每週運動 6–7 天' },
      athlete: { label: '非常高度活動', hint: '每天高強度訓練或勞力工作' },
    },
    activityOption: '{label}（{hint}）× {factor}',
    unitPerDay: '大卡／天',
    resultLabel: '每日總熱量消耗 TDEE（Mifflin-St Jeor 公式）',
    bmrLabel: '基礎代謝率 BMR（Mifflin-St Jeor）',
    altLabels: ['BMR（Harris-Benedict 修訂版）', 'TDEE（Harris-Benedict 修訂版）'],
    goalsLabel: '不同目標的每日熱量與三大營養素建議',
    thGoal: '目標',
    thKcal: '每日熱量',
    thProtein: '蛋白質',
    thFat: '脂肪',
    thCarb: '碳水化合物',
    disclaimer:
      '結果僅供參考，請諮詢醫師或營養師。公式估算的是一般成人的平均值，懷孕、哺乳、未成年、慢性病或正在服藥者，熱量需求應由專業人員評估。所有數字只在你的瀏覽器中計算，不會上傳。',
    client: {
      alt: 'harris',
      goals: { cut: '減脂', maintain: '維持', bulk: '增肌' },
      kcal: '{n} 大卡',
      kcalCell: '{n} 大卡',
      hintFloored: '減脂熱量已調整為 {kcal} 大卡：TDEE 減 500 會低於基礎代謝率或{floor} 大卡的安全下限，建議改以增加活動量製造熱量赤字。',
      floorMale: '男性 {n}',
      floorFemale: '女性 {n}',
      hintDefault: '減脂為 TDEE − 500 大卡（約每週減 0.5 公斤），增肌為 TDEE + 300 大卡；脂肪約占總熱量 25%，其餘熱量分配給碳水化合物。',
      problems: {
        missing: '請輸入年齡、身高與體重。',
        age: '年齡請輸入 15 到 100 歲。',
        height: '身高請以公分輸入，例如 165。',
        weight: '體重請以公斤輸入，例如 60。',
      },
      fallback: '無法計算，請檢查輸入。',
    },
  },
  en: {
    sexLabel: 'Sex',
    male: 'Male',
    female: 'Female',
    age: 'Age (years)',
    heightCm: 'Height (cm)',
    weightKg: 'Weight (kg)',
    units: {
      legend: 'Units',
      imperial: 'US (ft, in, lb)',
      metric: 'Metric (cm, kg)',
      heightFt: 'Height (ft)',
      heightIn: 'Height (in)',
      weightLb: 'Weight (lb)',
    },
    activityLabel: 'Activity level',
    activities: {
      sedentary: { label: 'Sedentary', hint: 'desk job, little or no exercise' },
      light: { label: 'Lightly active', hint: 'exercise 1–3 days a week' },
      moderate: { label: 'Moderately active', hint: 'exercise 3–5 days a week' },
      active: { label: 'Very active', hint: 'exercise 6–7 days a week' },
      athlete: { label: 'Extra active', hint: 'hard daily training or a physical job' },
    },
    activityOption: '{label} ({hint}) × {factor}',
    unitPerDay: 'Calories/day',
    resultLabel: 'Total daily energy expenditure (Mifflin-St Jeor)',
    bmrLabel: 'BMR (Mifflin-St Jeor)',
    altLabels: ['BMR (revised Harris-Benedict)', 'TDEE (revised Harris-Benedict)'],
    goalsLabel: 'Daily Calories and macros by goal',
    thGoal: 'Goal',
    thKcal: 'Calories/day',
    thProtein: 'Protein',
    thFat: 'Fat',
    thCarb: 'Carbs',
    disclaimer:
      'For information only, not medical or nutrition advice. These formulas estimate averages for healthy adults. If you are pregnant, breastfeeding, under 18, managing a medical condition or taking medication, ask a doctor or registered dietitian. Everything is calculated in your browser and nothing is uploaded.',
    client: {
      alt: 'harris',
      goals: { cut: 'Lose fat', maintain: 'Maintain', bulk: 'Build muscle' },
      kcal: '{n} Calories',
      kcalCell: '{n}',
      hintFloored:
        'Your fat-loss target was raised to {kcal} Calories: TDEE − 500 would fall below your BMR or the {floor}. Add activity to widen the deficit instead.',
      floorMale: '{n}-Calorie minimum for men',
      floorFemale: '{n}-Calorie minimum for women',
      hintDefault:
        'Lose fat = TDEE − 500 Calories (about 0.5 kg a week). Build muscle = TDEE + 300 Calories. Fat is about 25% of Calories; carbs fill the rest.',
      hintDefaultUs:
        'Lose fat = TDEE − 500 Calories (about 1 lb a week). Build muscle = TDEE + 300 Calories. Fat is about 25% of Calories; carbs fill the rest.',
      problems: {
        missing: 'Enter your age, height and weight.',
        age: 'Enter an age from 15 to 100.',
        height: 'Enter a height between 3 ft 4 in and 8 ft 2 in (100 to 250 cm).',
        weight: 'Enter a weight between 55 and 660 lb (25 to 300 kg).',
      },
      fallback: 'Can’t calculate. Check your entries.',
    },
  },
  ja: {
    sexLabel: '性別',
    male: '男性',
    female: '女性',
    age: '年齢（歳）',
    heightCm: '身長（cm）',
    weightKg: '体重（kg）',
    activityLabel: '活動レベル',
    activities: {
      sedentary: { label: 'ほとんど動かない', hint: 'デスクワーク中心・運動なし' },
      light: { label: 'やや低い', hint: '週 1〜3 日運動' },
      moderate: { label: 'ふつう', hint: '週 3〜5 日運動' },
      active: { label: '高い', hint: '週 6〜7 日運動' },
      athlete: { label: 'かなり高い', hint: '毎日ハードな練習・肉体労働' },
    },
    activityOption: '{label}（{hint}）× {factor}',
    unitPerDay: 'kcal／日',
    resultLabel: '1日の消費カロリー TDEE（Mifflin-St Jeor 式）',
    bmrLabel: '基礎代謝量（Mifflin-St Jeor 式）',
    altLabels: ['基礎代謝量（国立健康・栄養研究所の式）', '基礎代謝量（基礎代謝基準値 × 体重）'],
    goalsLabel: '目的別の摂取カロリーと PFC バランスの目安',
    thGoal: '目的',
    thKcal: '1日の摂取カロリー',
    thProtein: 'たんぱく質',
    thFat: '脂質',
    thCarb: '炭水化物',
    disclaimer:
      '結果は目安です。計算式は健康な成人の平均的な値を推定するもので、妊娠中・授乳中の方、18 歳未満の方、持病のある方や服薬中の方は、医師や管理栄養士にご相談ください。計算はすべてブラウザ内で行い、データは送信されません。',
    client: {
      alt: 'japan',
      goals: { cut: '減量', maintain: '維持', bulk: '増量' },
      kcal: '{n} kcal',
      kcalCell: '{n} kcal',
      hintFloored:
        '減量の摂取カロリーを {kcal} kcal に引き上げました。TDEE − 500 だと基礎代謝量または{floor} kcal を下回るためです。食事を減らすより活動量を増やして差をつくりましょう。',
      floorMale: '男性の下限 {n}',
      floorFemale: '女性の下限 {n}',
      hintDefault:
        '減量は TDEE − 500 kcal（1 週間で約 0.5kg）、増量は TDEE + 300 kcal です。脂質は総カロリーの約 25%、残りを炭水化物に割り当てています。',
      problems: {
        missing: '年齢・身長・体重を入力してください。',
        age: '年齢は 15〜100 歳で入力してください。',
        height: '身長は cm で入力してください（例：165）。',
        weight: '体重は kg で入力してください（例：60）。',
      },
      fallback: '計算できません。入力内容を確認してください。',
    },
  },
});

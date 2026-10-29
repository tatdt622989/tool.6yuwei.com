export type Sex = 'male' | 'female';
export type ActivityId = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type GoalId = 'cut' | 'maintain' | 'bulk';

export interface ActivityLevel {
  id: ActivityId;
  factor: number;
  label: string;
  hint: string;
}

/** Standard activity multipliers (Katch-McArdle / Harris-Benedict convention). */
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  { id: 'sedentary', factor: 1.2, label: '久坐', hint: '辦公室工作、幾乎不運動' },
  { id: 'light', factor: 1.375, label: '輕度活動', hint: '每週運動 1–3 天' },
  { id: 'moderate', factor: 1.55, label: '中度活動', hint: '每週運動 3–5 天' },
  { id: 'active', factor: 1.725, label: '高度活動', hint: '每週運動 6–7 天' },
  { id: 'athlete', factor: 1.9, label: '非常高度活動', hint: '每天高強度訓練或勞力工作' },
];

/**
 * Calorie targets and macro assumptions.
 * - 減脂：TDEE − 500 kcal（約每週減 0.5 公斤），但不低於 BMR，也不低於女性 1,200／男性 1,500 kcal
 *   （常見的低熱量飲食安全下限，再低應在醫師或營養師監督下進行）。
 * - 增肌：TDEE + 300 kcal（小幅熱量盈餘，減少多餘脂肪堆積）。
 * - 蛋白質 g/kg：一般有訓練者常用 1.6–2.2 g/kg 的範圍；脂肪約占總熱量 25%，其餘為碳水化合物。
 */
export const TDEE_RULES = {
  cutDeficit: 500,
  bulkSurplus: 300,
  minIntake: { female: 1200, male: 1500 } as Record<Sex, number>,
  proteinPerKg: { cut: 2.0, maintain: 1.6, bulk: 1.8 } as Record<GoalId, number>,
  fatShare: 0.25,
  kcalPerGram: { protein: 4, fat: 9, carb: 4 },
} as const;

export interface BodyInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}

export const AGE_RANGE = { min: 15, max: 100 } as const;
export const HEIGHT_RANGE = { min: 100, max: 250 } as const;
export const WEIGHT_RANGE = { min: 25, max: 300 } as const;

export function validateBody(input: BodyInput): string | null {
  const { age, heightCm, weightKg } = input;
  if (![age, heightCm, weightKg].every(Number.isFinite)) return '請輸入年齡、身高與體重。';
  if (age < AGE_RANGE.min || age > AGE_RANGE.max) return `年齡請輸入 ${AGE_RANGE.min} 到 ${AGE_RANGE.max} 歲。`;
  if (heightCm < HEIGHT_RANGE.min || heightCm > HEIGHT_RANGE.max) return '身高請以公分輸入，例如 165。';
  if (weightKg < WEIGHT_RANGE.min || weightKg > WEIGHT_RANGE.max) return '體重請以公斤輸入，例如 60。';
  return null;
}

/** Mifflin-St Jeor (1990): 10w + 6.25h − 5a + 5（男）／ − 161（女）. */
export function mifflinStJeor({ sex, age, heightCm, weightKg }: BodyInput): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

/** Revised Harris-Benedict (Roza & Shizgal, 1984). */
export function harrisBenedict({ sex, age, heightCm, weightKg }: BodyInput): number {
  return sex === 'male'
    ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
    : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function activityFactor(id: ActivityId): number {
  return ACTIVITY_LEVELS.find((a) => a.id === id)?.factor ?? 1.2;
}

export interface GoalPlan {
  id: GoalId;
  label: string;
  kcal: number;
  /** Difference from TDEE (negative = deficit). */
  delta: number;
  /** True when the plain −500 target was raised to the safety floor. */
  floored: boolean;
  proteinG: number;
  fatG: number;
  carbG: number;
}

export interface TdeeResult {
  bmr: number;
  bmrHarris: number;
  tdee: number;
  tdeeHarris: number;
  factor: number;
  goals: GoalPlan[];
}

const GOAL_LABEL: Record<GoalId, string> = { cut: '減脂', maintain: '維持', bulk: '增肌' };

export function macrosFor(kcal: number, weightKg: number, goal: GoalId): { proteinG: number; fatG: number; carbG: number } {
  const { kcalPerGram, fatShare, proteinPerKg } = TDEE_RULES;
  const proteinG = weightKg * proteinPerKg[goal];
  const fatG = (kcal * fatShare) / kcalPerGram.fat;
  const carbKcal = kcal - proteinG * kcalPerGram.protein - fatG * kcalPerGram.fat;
  return { proteinG, fatG, carbG: Math.max(0, carbKcal / kcalPerGram.carb) };
}

/** Target intake for 減脂: TDEE − 500, never below BMR or the sex-specific minimum (and never above TDEE). */
export function cutTarget(tdee: number, bmr: number, sex: Sex): { kcal: number; floored: boolean } {
  const plain = tdee - TDEE_RULES.cutDeficit;
  const floor = Math.max(bmr, TDEE_RULES.minIntake[sex]);
  if (plain >= floor) return { kcal: plain, floored: false };
  return { kcal: Math.min(tdee, floor), floored: true };
}

export function calcTdee(input: BodyInput, activity: ActivityId): TdeeResult | null {
  if (validateBody(input)) return null;
  const factor = activityFactor(activity);
  const bmr = mifflinStJeor(input);
  const bmrHarris = harrisBenedict(input);
  const tdee = bmr * factor;
  const cut = cutTarget(tdee, bmr, input.sex);
  const targets: { id: GoalId; kcal: number; floored: boolean }[] = [
    { id: 'cut', ...cut },
    { id: 'maintain', kcal: tdee, floored: false },
    { id: 'bulk', kcal: tdee + TDEE_RULES.bulkSurplus, floored: false },
  ];
  return {
    bmr,
    bmrHarris,
    tdee,
    tdeeHarris: bmrHarris * factor,
    factor,
    goals: targets.map((t) => ({
      id: t.id,
      label: GOAL_LABEL[t.id],
      kcal: t.kcal,
      delta: t.kcal - tdee,
      floored: t.floored,
      ...macrosFor(t.kcal, input.weightKg, t.id),
    })),
  };
}

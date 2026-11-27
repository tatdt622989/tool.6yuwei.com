export type Sex = 'male' | 'female';

export interface NavyInput {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  /** Required for women only. */
  hipCm: number;
}

/**
 * U.S. Navy circumference method (Hodgdon & Beckett, 1984), metric form:
 *   男：495 ÷ (1.0324 − 0.19077 × log10(腰圍 − 頸圍) + 0.15456 × log10(身高)) − 450
 *   女：495 ÷ (1.29579 − 0.35004 × log10(腰圍 + 臀圍 − 頸圍) + 0.22100 × log10(身高)) − 450
 * Returns NaN when the measurements cannot produce a result (e.g. waist ≤ neck).
 */
export function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }: NavyInput): number {
  if (!(heightCm > 0)) return Number.NaN;
  const girth = sex === 'male' ? waistCm - neckCm : waistCm + hipCm - neckCm;
  if (!(girth > 0) || !Number.isFinite(girth)) return Number.NaN;
  const density =
    sex === 'male'
      ? 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(heightCm)
      : 1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(heightCm);
  return 495 / density - 450;
}

export function bmiOf(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** Deurenberg et al. (1991) adult BMI-based estimate: 1.20 × BMI + 0.23 × 年齡 − 10.8 × 性別（男 1、女 0）− 5.4. */
export function deurenbergBodyFat(sex: Sex, bmi: number, age: number): number {
  return 1.2 * bmi + 0.23 * age - 10.8 * (sex === 'male' ? 1 : 0) - 5.4;
}

export interface FatCategory {
  id: 'essential' | 'athlete' | 'fitness' | 'average' | 'obese';
  label: string;
  /** Inclusive lower bound in %. */
  min: number;
}

/** American Council on Exercise (ACE) body-fat categories. */
export const FAT_CATEGORIES: Record<Sex, readonly FatCategory[]> = {
  male: [
    { id: 'essential', label: '必需脂肪', min: 2 },
    { id: 'athlete', label: '運動員', min: 6 },
    { id: 'fitness', label: '健康良好', min: 14 },
    { id: 'average', label: '一般', min: 18 },
    { id: 'obese', label: '肥胖', min: 25 },
  ],
  female: [
    { id: 'essential', label: '必需脂肪', min: 10 },
    { id: 'athlete', label: '運動員', min: 14 },
    { id: 'fitness', label: '健康良好', min: 21 },
    { id: 'average', label: '一般', min: 25 },
    { id: 'obese', label: '肥胖', min: 32 },
  ],
};

/**
 * 衛福部國民健康署成人肥胖的體脂肪率切點：男性 ≥ 25%、女性 ≥ 30%。
 * Source: 國健署「成人過重與肥胖盛行率」資料集說明 https://data.gov.tw/dataset/151272 (checked 2026-10-29).
 */
export const HPA_OBESITY_CUTOFF: Record<Sex, number> = { male: 25, female: 30 };

/** Returns the ACE category, or null below the essential-fat minimum or for invalid input. */
export function classifyBodyFat(sex: Sex, percent: number): FatCategory | null {
  if (!Number.isFinite(percent)) return null;
  const list = FAT_CATEGORIES[sex];
  let found: FatCategory | null = null;
  for (const c of list) if (percent >= c.min) found = c;
  return found;
}

export function isHpaObese(sex: Sex, percent: number): boolean {
  return Number.isFinite(percent) && percent >= HPA_OBESITY_CUTOFF[sex];
}

export interface BodyComposition {
  fatKg: number;
  leanKg: number;
}

export function composition(weightKg: number, percent: number): BodyComposition {
  const fatKg = (weightKg * percent) / 100;
  return { fatKg, leanKg: weightKg - fatKg };
}

export interface BodyFatInput extends NavyInput {
  age: number;
  weightKg: number;
}

/** Which input is out of range; the UI maps it to a localized message. */
export type BodyFatProblem = 'missing' | 'age' | 'height' | 'weight' | 'neck' | 'waist' | 'hip' | 'waistNeck';

export function checkInput(input: BodyFatInput): BodyFatProblem | null {
  const { sex, age, heightCm, weightKg, neckCm, waistCm, hipCm } = input;
  const needed = [age, heightCm, weightKg, neckCm, waistCm, ...(sex === 'female' ? [hipCm] : [])];
  if (!needed.every(Number.isFinite)) return 'missing';
  if (age < 18 || age > 100) return 'age';
  if (heightCm < 120 || heightCm > 230) return 'height';
  if (weightKg < 30 || weightKg > 300) return 'weight';
  if (neckCm < 20 || neckCm > 70) return 'neck';
  if (waistCm < 40 || waistCm > 200) return 'waist';
  if (sex === 'female' && (hipCm < 50 || hipCm > 200)) return 'hip';
  if (waistCm <= neckCm) return 'waistNeck';
  return null;
}

const ZH_PROBLEMS: Record<Exclude<BodyFatProblem, 'missing'>, string> = {
  age: '本公式適用 18 歲以上成人，請輸入 18 到 100 歲。',
  height: '身高請以公分輸入，例如 170。',
  weight: '體重請以公斤輸入，例如 65。',
  neck: '頸圍請以公分輸入，一般成人約 30 到 45 公分。',
  waist: '腰圍請以公分輸入，例如 80。',
  hip: '臀圍請以公分輸入，例如 95。',
  waistNeck: '腰圍必須大於頸圍，請確認是否量錯位置。',
};

/** zh-TW message for checkInput(); localized UIs map the problem code themselves. */
export function validateInput(input: BodyFatInput): string | null {
  const problem = checkInput(input);
  if (!problem) return null;
  if (problem === 'missing')
    return input.sex === 'female' ? '請填寫年齡、身高、體重、頸圍、腰圍與臀圍。' : '請填寫年齡、身高、體重、頸圍與腰圍。';
  return ZH_PROBLEMS[problem];
}

/** US customary conversions (exact NIST factors). */
export const CM_PER_IN = 2.54;
export const KG_PER_LB = 0.45359237;
export const inToCm = (inches: number): number => inches * CM_PER_IN;
export const cmToIn = (cm: number): number => cm / CM_PER_IN;
export const lbToKg = (lb: number): number => lb * KG_PER_LB;
export const kgToLb = (kg: number): number => kg / KG_PER_LB;
/** 5 ft 9 in → 175.26 cm. An empty inches field counts as 0. */
export function feetInchesToCm(feet: number, inches: number): number {
  return inToCm(feet * 12 + (Number.isFinite(inches) ? inches : 0));
}

export interface BodyFatResult {
  navy: number;
  deurenberg: number;
  bmi: number;
  category: FatCategory | null;
  hpaObese: boolean;
  composition: BodyComposition;
}

export function calcBodyFat(input: BodyFatInput): BodyFatResult | null {
  if (checkInput(input)) return null;
  const navy = navyBodyFat(input);
  if (!Number.isFinite(navy)) return null;
  const bmi = bmiOf(input.heightCm, input.weightKg);
  const shown = Math.max(0, navy);
  return {
    navy: shown,
    deurenberg: deurenbergBodyFat(input.sex, bmi, input.age),
    bmi,
    category: classifyBodyFat(input.sex, shown),
    hpaObese: isHpaObese(input.sex, shown),
    composition: composition(input.weightKg, shown),
  };
}

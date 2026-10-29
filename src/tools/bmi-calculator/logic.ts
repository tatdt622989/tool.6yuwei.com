export type BmiLevel = 'under' | 'normal' | 'over' | 'obese1' | 'obese2' | 'obese3' | 'obese4';

/**
 * Classification standard. Each locale uses the one its readers are measured against:
 *  - tw:  衛福部國民健康署 (Taiwan HPA)      — zh-TW
 *  - jp:  日本肥満学会 (JASSO, 2000/2022)     — ja
 *  - who: World Health Organization          — en
 */
export type BmiStandard = 'tw' | 'jp' | 'who';

export interface BmiBand {
  level: BmiLevel;
  /** zh-TW label (Taiwan standard). Localized labels live in i18n.ts. */
  label: string;
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound. */
  max: number;
}

/** 衛福部國民健康署成人 BMI 標準 (zh-TW default). */
export const BMI_BANDS: readonly BmiBand[] = [
  { level: 'under', label: '體重過輕', min: 0, max: 18.5 },
  { level: 'normal', label: '健康體位', min: 18.5, max: 24 },
  { level: 'over', label: '體重過重', min: 24, max: 27 },
  { level: 'obese1', label: '輕度肥胖', min: 27, max: 30 },
  { level: 'obese2', label: '中度肥胖', min: 30, max: 35 },
  { level: 'obese3', label: '重度肥胖', min: 35, max: Infinity },
];

export const HEALTHY_MIN = 18.5;
export const HEALTHY_MAX = 24;

export interface StandardSpec {
  bands: readonly BmiBand[];
  /** Healthy BMI range [min, max). */
  healthyMin: number;
  healthyMax: number;
}

export const STANDARDS: Record<BmiStandard, StandardSpec> = {
  tw: { bands: BMI_BANDS, healthyMin: HEALTHY_MIN, healthyMax: HEALTHY_MAX },
  // 日本肥満学会「肥満症診療ガイドライン」: 25 以上は肥満（普通体重の上限は 25 未満）。
  jp: {
    bands: [
      { level: 'under', label: '低体重', min: 0, max: 18.5 },
      { level: 'normal', label: '普通体重', min: 18.5, max: 25 },
      { level: 'obese1', label: '肥満（1度）', min: 25, max: 30 },
      { level: 'obese2', label: '肥満（2度）', min: 30, max: 35 },
      { level: 'obese3', label: '肥満（3度）', min: 35, max: 40 },
      { level: 'obese4', label: '肥満（4度）', min: 40, max: Infinity },
    ],
    healthyMin: 18.5,
    healthyMax: 25,
  },
  // WHO adult classification: overweight (pre-obese) 25–29.9, obesity class I/II/III.
  who: {
    bands: [
      { level: 'under', label: 'Underweight', min: 0, max: 18.5 },
      { level: 'normal', label: 'Healthy weight', min: 18.5, max: 25 },
      { level: 'over', label: 'Overweight', min: 25, max: 30 },
      { level: 'obese1', label: 'Obesity class I', min: 30, max: 35 },
      { level: 'obese2', label: 'Obesity class II', min: 35, max: 40 },
      { level: 'obese3', label: 'Obesity class III', min: 40, max: Infinity },
    ],
    healthyMin: 18.5,
    healthyMax: 25,
  },
};

/** Japan's 標準体重 (ideal weight) uses BMI 22. */
export const IDEAL_BMI = 22;

/** Reasonable bounds for adult input; outside these the result is almost certainly a typo. */
export const HEIGHT_RANGE = { min: 50, max: 250 } as const;
export const WEIGHT_RANGE = { min: 10, max: 400 } as const;

/** BMI = 體重(kg) ÷ 身高(m)². Returns NaN for non-positive or non-finite input. */
export function computeBmi(heightCm: number, weightKg: number): number {
  if (!(heightCm > 0) || !(weightKg > 0) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return Number.NaN;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** Rounds to one decimal the way the BMI is usually reported, then classifies. */
export function roundBmi(bmi: number): number {
  return Math.round(bmi * 10) / 10;
}

export function classifyBmi(bmi: number, standard: BmiStandard = 'tw'): BmiBand | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  const value = roundBmi(bmi);
  return STANDARDS[standard].bands.find((band) => value >= band.min && value < band.max) ?? null;
}

/** Weight range (kg) that keeps BMI in the standard's healthy range (tw: 18.5 ≤ BMI < 24). */
export function healthyWeightRange(heightCm: number, standard: BmiStandard = 'tw'): { min: number; max: number } | null {
  if (!(heightCm > 0) || !Number.isFinite(heightCm)) return null;
  const m2 = (heightCm / 100) ** 2;
  const spec = STANDARDS[standard];
  return { min: spec.healthyMin * m2, max: spec.healthyMax * m2 };
}

/** Weight (kg) at a given BMI for a height, e.g. Japan's 標準体重 = 22 × height(m)². */
export function weightAtBmi(heightCm: number, bmi: number): number {
  if (!(heightCm > 0) || !Number.isFinite(heightCm)) return Number.NaN;
  return bmi * (heightCm / 100) ** 2;
}

/**
 * How far the weight is from the healthy range: negative = kg to lose,
 * positive = kg to gain, 0 = already inside.
 */
export function weightGap(heightCm: number, weightKg: number, standard: BmiStandard = 'tw'): number {
  const range = healthyWeightRange(heightCm, standard);
  if (!range || !(weightKg > 0)) return Number.NaN;
  if (weightKg < range.min) return range.min - weightKg;
  if (weightKg >= range.max) return range.max - weightKg;
  return 0;
}

/** Visual scale shown on the page spans BMI 14–40. */
export const SCALE_MIN = 14;
export const SCALE_MAX = 40;

/** Position of a BMI value on the visual scale, 0–100 (clamped). */
export function scalePercent(bmi: number): number {
  if (!Number.isFinite(bmi)) return 0;
  const p = ((bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  return Math.min(100, Math.max(0, p));
}

/** Visible bands on the 14–40 scale (bands entirely above SCALE_MAX are dropped). */
export function scaleSegments(standard: BmiStandard): { level: BmiLevel; grow: number }[] {
  return STANDARDS[standard].bands
    .map((band) => ({ level: band.level, grow: Math.min(band.max, SCALE_MAX) - Math.max(band.min, SCALE_MIN) }))
    .filter((segment) => segment.grow > 0);
}

/** Tick labels at band boundaries inside the scale. */
export function scaleTicks(standard: BmiStandard): { value: number; left: number }[] {
  return STANDARDS[standard].bands
    .slice(1)
    .filter((band) => band.min > SCALE_MIN && band.min < SCALE_MAX)
    .map((band) => ({ value: band.min, left: ((band.min - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100 }));
}

// ---- US customary units (en) ----
export const CM_PER_INCH = 2.54;
export const KG_PER_LB = 0.45359237;

/** 5 ft 9 in → 175.26 cm. Either part may be 0; NaN parts are treated as 0 unless both are NaN. */
export function feetInchesToCm(feet: number, inches: number): number {
  const ft = Number.isFinite(feet) ? feet : 0;
  const inch = Number.isFinite(inches) ? inches : 0;
  if (!Number.isFinite(feet) && !Number.isFinite(inches)) return Number.NaN;
  return (ft * 12 + inch) * CM_PER_INCH;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

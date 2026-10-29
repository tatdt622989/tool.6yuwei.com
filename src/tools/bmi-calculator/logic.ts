export type BmiLevel = 'under' | 'normal' | 'over' | 'obese1' | 'obese2' | 'obese3';

export interface BmiBand {
  level: BmiLevel;
  label: string;
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound. */
  max: number;
}

/** 衛福部國民健康署成人 BMI 標準. */
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

export function classifyBmi(bmi: number): BmiBand | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  const value = roundBmi(bmi);
  return BMI_BANDS.find((band) => value >= band.min && value < band.max) ?? null;
}

/** Weight range (kg) that keeps BMI within 18.5 ≤ BMI < 24 for the given height. */
export function healthyWeightRange(heightCm: number): { min: number; max: number } | null {
  if (!(heightCm > 0) || !Number.isFinite(heightCm)) return null;
  const m2 = (heightCm / 100) ** 2;
  return { min: HEALTHY_MIN * m2, max: HEALTHY_MAX * m2 };
}

/**
 * How far the weight is from the healthy range: negative = kg to lose,
 * positive = kg to gain, 0 = already inside.
 */
export function weightGap(heightCm: number, weightKg: number): number {
  const range = healthyWeightRange(heightCm);
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

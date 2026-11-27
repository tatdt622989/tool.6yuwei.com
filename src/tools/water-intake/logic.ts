export type Sex = 'male' | 'female';
export type ActivityLevel = 'low' | 'normal' | 'high';

/**
 * Daily water estimate rules.
 * - 體重 × 30–40 ml：臨床與營養衛教常用的成人每日飲水估算（活動量低取 30、一般 35、活動量大 40）。
 * - 運動：每運動 1 小時額外補充約 500 ml（運動醫學常見建議為每小時 400–800 ml，依流汗量調整）。
 * - 炎熱環境或大量流汗：額外約 500 ml。
 * - 國民健康署飲水建議（國人膳食營養素參考攝取量第九版草案，媒體轉述）：每日總液體攝取量
 *   男性 2,400 ml、女性 2,100 ml（含白開水與飲料、不含食物中的水分）。
 *   Source: https://n.yam.com/Article/20260626569549 (2026-06-26), checked 2026-10-29.
 */
export const WATER_RULES = {
  mlPerKg: { low: 30, normal: 35, high: 40 } as Record<ActivityLevel, number>,
  exerciseMlPerHour: 500,
  hotClimateMl: 500,
  hpaTotalFluid: { male: 2400, female: 2100 } as Record<Sex, number>,
} as const;

export interface WaterInput {
  weightKg: number;
  activity: ActivityLevel;
  /** Minutes of exercise per day. */
  exerciseMin: number;
  hot: boolean;
  /** Cup size in ml. */
  cupMl: number;
}

export interface WaterResult {
  base: number;
  exercise: number;
  climate: number;
  total: number;
  /** Range using 30 and 40 ml/kg plus the same adjustments. */
  low: number;
  high: number;
  cups: number;
}

/** Which input is missing or out of range; the UI maps it to a localized message. */
export type WaterProblem = 'missing' | 'weight' | 'exercise' | 'cup';

export function checkWater({ weightKg, exerciseMin, cupMl }: WaterInput): WaterProblem | null {
  if (!Number.isFinite(weightKg)) return 'missing';
  if (weightKg < 20 || weightKg > 250) return 'weight';
  if (!Number.isFinite(exerciseMin) || exerciseMin < 0 || exerciseMin > 600) return 'exercise';
  if (!Number.isFinite(cupMl) || cupMl < 50 || cupMl > 2000) return 'cup';
  return null;
}

const ZH_PROBLEMS: Record<WaterProblem, string> = {
  missing: '請輸入體重。',
  weight: '體重請以公斤輸入，例如 60。',
  exercise: '運動時間請輸入 0 到 600 分鐘。',
  cup: '杯子容量請輸入 50 到 2000 毫升。',
};

/** zh-TW message for checkWater(); localized UIs map the problem code themselves. */
export function validateWater(input: WaterInput): string | null {
  const problem = checkWater(input);
  return problem ? ZH_PROBLEMS[problem] : null;
}

/** US customary conversions (exact NIST factors). 1 US fl oz = 29.5735295625 ml. */
export const ML_PER_FL_OZ = 29.5735295625;
export const KG_PER_LB = 0.45359237;
export const flOzToMl = (oz: number): number => oz * ML_PER_FL_OZ;
export const mlToFlOz = (ml: number): number => ml / ML_PER_FL_OZ;
export const lbToKg = (lb: number): number => lb * KG_PER_LB;
/** ml per kg → fl oz per lb: 30 ml/kg ≈ 0.46 oz/lb. */
export const mlPerKgToOzPerLb = (mlPerKg: number): number => mlToFlOz(mlPerKg * KG_PER_LB);

/**
 * Whole fl oz for each of `count` drinks that add up to the total rounded to 1 fl oz:
 * the remainder is spread one ounce at a time over the first drinks (106 oz / 14 → 8 × 8 oz + 6 × 7 oz).
 */
export function slotsInFlOz(totalMl: number, count: number): number[] {
  const n = Math.trunc(count);
  if (!(n > 0) || !(totalMl > 0)) return [];
  const total = Math.round(mlToFlOz(totalMl));
  const per = Math.floor(total / n);
  const extra = total - per * n;
  return Array.from({ length: n }, (_, i) => per + (i < extra ? 1 : 0));
}

/**
 * Official reference amounts shown next to the estimate, by market (ml/day).
 * - tw: 國健署建議每日總液體量（see WATER_RULES.hpaTotalFluid）.
 * - us: National Academies (2004) adequate intake of total beverages, including drinking water:
 *   men about 3.0 L (13 cups), women about 2.2 L (9 cups). Total water incl. food is 3.7 L / 2.7 L.
 * - jp: 厚生労働省「健康のため水を飲もう」推進運動: 飲み水として 1 日あたり約 1.2 L（男女共通）。
 */
export type FluidReference = 'tw' | 'us' | 'jp';
export const REFERENCE_FLUID: Record<FluidReference, Record<Sex, number>> = {
  tw: WATER_RULES.hpaTotalFluid,
  us: { male: 3000, female: 2200 },
  jp: { male: 1200, female: 1200 },
};

/** Rounds to the nearest 10 ml so results read naturally. */
const round10 = (ml: number) => Math.round(ml / 10) * 10;

export function calcWater(input: WaterInput): WaterResult | null {
  if (checkWater(input)) return null;
  const { weightKg, activity, exerciseMin, hot, cupMl } = input;
  const exercise = round10((exerciseMin / 60) * WATER_RULES.exerciseMlPerHour);
  const climate = hot ? WATER_RULES.hotClimateMl : 0;
  const base = round10(weightKg * WATER_RULES.mlPerKg[activity]);
  const total = base + exercise + climate;
  return {
    base,
    exercise,
    climate,
    total,
    low: round10(weightKg * WATER_RULES.mlPerKg.low) + exercise + climate,
    high: round10(weightKg * WATER_RULES.mlPerKg.high) + exercise + climate,
    cups: Math.ceil(total / cupMl),
  };
}

export interface ScheduleSlot {
  time: string;
  ml: number;
}

/**
 * Spreads `cups` evenly between start and end (minutes after midnight), inclusive.
 * The last cup gets whatever is left so the total adds up exactly.
 */
export function drinkingSchedule(total: number, cups: number, startMin = 7 * 60, endMin = 21 * 60): ScheduleSlot[] {
  if (!(cups > 0) || !(total > 0)) return [];
  const n = Math.min(Math.trunc(cups), 40);
  const step = n === 1 ? 0 : (endMin - startMin) / (n - 1);
  const per = Math.round(total / n / 10) * 10;
  const pad = (v: number) => String(v).padStart(2, '0');
  return Array.from({ length: n }, (_, i) => {
    const t = Math.round((startMin + step * i) / 5) * 5;
    const ml = i === n - 1 ? total - per * (n - 1) : per;
    return { time: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`, ml };
  });
}

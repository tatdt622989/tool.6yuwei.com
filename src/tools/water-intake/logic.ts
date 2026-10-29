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

export function validateWater({ weightKg, exerciseMin, cupMl }: WaterInput): string | null {
  if (!Number.isFinite(weightKg)) return '請輸入體重。';
  if (weightKg < 20 || weightKg > 250) return '體重請以公斤輸入，例如 60。';
  if (!Number.isFinite(exerciseMin) || exerciseMin < 0 || exerciseMin > 600) return '運動時間請輸入 0 到 600 分鐘。';
  if (!Number.isFinite(cupMl) || cupMl < 50 || cupMl > 2000) return '杯子容量請輸入 50 到 2000 毫升。';
  return null;
}

/** Rounds to the nearest 10 ml so results read naturally. */
const round10 = (ml: number) => Math.round(ml / 10) * 10;

export function calcWater(input: WaterInput): WaterResult | null {
  if (validateWater(input)) return null;
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

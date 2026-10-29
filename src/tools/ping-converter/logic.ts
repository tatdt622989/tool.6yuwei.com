export type AreaUnit = 'ping' | 'sqm' | 'sqft' | 'fen' | 'jia' | 'hectare';

/** 1 坪 = 400/121 m² (6 台尺 × 6 台尺, 1 台尺 = 10/33 m). */
export const PING_IN_SQM = 400 / 121;

export interface AreaUnitInfo {
  id: AreaUnit;
  label: string;
  /** Size of one unit in square metres. */
  sqm: number;
}

export const AREA_UNITS: readonly AreaUnitInfo[] = [
  { id: 'ping', label: '坪', sqm: PING_IN_SQM },
  { id: 'sqm', label: '平方公尺（m²）', sqm: 1 },
  { id: 'sqft', label: '平方英尺（ft²）', sqm: 0.09290304 },
  { id: 'fen', label: '分（台分）', sqm: 293.4 * PING_IN_SQM },
  { id: 'jia', label: '甲', sqm: 2934 * PING_IN_SQM },
  { id: 'hectare', label: '公頃', sqm: 10_000 },
];

const BY_ID = new Map(AREA_UNITS.map((u) => [u.id, u]));

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return (value * BY_ID.get(from)!.sqm) / BY_ID.get(to)!.sqm;
}

export function convertAreaAll(value: number, from: AreaUnit): Record<AreaUnit, number> {
  const out = {} as Record<AreaUnit, number>;
  for (const u of AREA_UNITS) out[u.id] = convertArea(value, from, u.id);
  return out;
}

/**
 * Decimal places worth showing: about 5 significant digits, at least 2 and at most 8,
 * so 30 坪 shows 99.174 m² and 0.010225 甲 keeps its digits.
 */
export function displayDigits(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 2;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  return Math.min(8, Math.max(2, 4 - magnitude));
}

export interface PublicAreaResult {
  /** 公設坪數. */
  publicPing: number;
  /** 扣除公設後的坪數（主建物＋附屬建物）. */
  privatePing: number;
  /** 總價 ÷ 權狀坪數 (萬元/坪); NaN without a price. */
  unitPrice: number;
  /** 總價 ÷ 扣除公設後坪數 (萬元/坪); NaN without a price. */
  privateUnitPrice: number;
}

/**
 * 公設比 split. `ratioPercent` is 0–<100. `totalPrice` (萬元) is optional; pass NaN to skip.
 * Returns null for invalid input.
 */
export function splitPublicArea(titlePing: number, ratioPercent: number, totalPrice = Number.NaN): PublicAreaResult | null {
  if (!Number.isFinite(titlePing) || titlePing <= 0) return null;
  if (!Number.isFinite(ratioPercent) || ratioPercent < 0 || ratioPercent >= 100) return null;
  const publicPing = (titlePing * ratioPercent) / 100;
  const privatePing = titlePing - publicPing;
  const hasPrice = Number.isFinite(totalPrice) && totalPrice > 0;
  return {
    publicPing,
    privatePing,
    unitPrice: hasPrice ? totalPrice / titlePing : Number.NaN,
    privateUnitPrice: hasPrice ? totalPrice / privatePing : Number.NaN,
  };
}

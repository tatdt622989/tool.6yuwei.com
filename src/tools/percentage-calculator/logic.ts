// All functions return NaN when the result is undefined (e.g. division by zero)
// or any input is not a finite number.

function finite(...values: number[]): boolean {
  return values.every((v) => Number.isFinite(v));
}

/** X 的 Y% 是多少：value × percent / 100. */
export function percentOf(value: number, percent: number): number {
  if (!finite(value, percent)) return Number.NaN;
  return (value * percent) / 100;
}

/** X 是 Y 的幾 %：part / whole × 100. */
export function percentRatio(part: number, whole: number): number {
  if (!finite(part, whole) || whole === 0) return Number.NaN;
  return (part / whole) * 100;
}

/**
 * 從 X 到 Y 增減幾 %：(to − from) / |from| × 100.
 * Dividing by |from| keeps the sign meaningful when the starting value is negative.
 */
export function percentChange(from: number, to: number): number {
  if (!finite(from, to) || from === 0) return Number.NaN;
  return ((to - from) / Math.abs(from)) * 100;
}

export type Direction = 'increase' | 'decrease';

/** X 增加／減少 Y% 後是多少. */
export function applyPercent(value: number, percent: number, direction: Direction): number {
  if (!finite(value, percent)) return Number.NaN;
  const factor = direction === 'increase' ? 1 + percent / 100 : 1 - percent / 100;
  return value * factor;
}

/** Removes binary floating-point noise such as 0.1 + 0.2 = 0.30000000000000004. */
export function clean(value: number, digits = 10): number {
  if (!Number.isFinite(value)) return value;
  return Number.parseFloat(value.toPrecision(digits)) || 0;
}

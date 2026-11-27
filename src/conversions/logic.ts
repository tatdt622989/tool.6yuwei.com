import { convert, formatValue, getCategory, getUnit, type CategoryKey } from '../tools/unit-converter/logic';

export interface PairUnits {
  fromName: string;
  fromSymbol: string;
  toName: string;
  toSymbol: string;
}

export function pairUnits(category: CategoryKey, from: string, to: string): PairUnits {
  const cat = getCategory(category);
  const a = getUnit(cat, from);
  const b = getUnit(cat, to);
  if (!a || !b) throw new Error(`Unknown units ${from}/${to} in ${category}`);
  return { fromName: a.name, fromSymbol: a.symbol, toName: b.name, toSymbol: b.symbol };
}

/** Decimal places needed to write `n` exactly (up to `max`), or Infinity if it needs more. */
function decimals(n: number, max = 4): number {
  for (let d = 0; d <= max; d++) if (Math.abs(n - Number(n.toFixed(d))) < 1e-12) return d;
  return Infinity;
}

/**
 * Human formula for a conversion, e.g. 「英寸 = 公分 ÷ 2.54」.
 * Prefers division when the reverse factor is the round, defined constant.
 */
export function formulaText(category: CategoryKey, from: string, to: string): string {
  const u = pairUnits(category, from, to);
  if (category === 'temperature') {
    const key = `${from}-${to}`;
    const formulas: Record<string, string> = {
      'c-f': '°F = °C × 9/5 + 32',
      'f-c': '°C = (°F − 32) × 5/9',
      'c-k': 'K = °C + 273.15',
      'k-c': '°C = K − 273.15',
      'f-k': 'K = (°F − 32) × 5/9 + 273.15',
      'k-f': '°F = (K − 273.15) × 9/5 + 32',
    };
    return formulas[key] ?? '';
  }
  const factor = convert(1, category, from, to);
  const inverse = convert(1, category, to, from);
  if (decimals(factor) > decimals(inverse)) return `${u.toName} = ${u.fromName} ÷ ${formatValue(inverse)}`;
  return `${u.toName} = ${u.fromName} × ${formatValue(factor)}`;
}

/** 170 cm → 「5 呎 7 吋」 (inches rounded to nearest whole, carrying 12 → next foot). */
export function feetInches(feet: number): string {
  if (!Number.isFinite(feet) || feet < 0) return '—';
  let whole = Math.floor(feet);
  let inches = Math.round((feet - whole) * 12);
  if (inches === 12) {
    whole += 1;
    inches = 0;
  }
  return `${whole} 呎 ${inches} 吋`;
}

/** Reader-friendly rounding for landing pages: 4 decimals, or 4 significant digits below 1. */
export function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const opts: Intl.NumberFormatOptions =
    abs !== 0 && abs < 1 ? { maximumSignificantDigits: 4 } : { maximumFractionDigits: 4 };
  return new Intl.NumberFormat('zh-TW', opts).format(value);
}

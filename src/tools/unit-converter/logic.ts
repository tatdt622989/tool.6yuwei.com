import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '../../i18n/locales';

export type CategoryKey = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'data';

export interface Unit {
  id: string;
  /** Display name, e.g. 「公尺」. */
  name: string;
  /** Short symbol shown next to values, e.g. 「m」. */
  symbol: string;
  /** Converts a value in this unit to the category's base unit. */
  toBase: (value: number) => number;
  /** Converts a value in the category's base unit to this unit. */
  fromBase: (value: number) => number;
}

export interface UnitCategory {
  key: CategoryKey;
  name: string;
  units: Unit[];
  /** Example shown on first load. */
  defaults: { from: string; to: string; value: number };
}

function linear(id: string, name: string, symbol: string, factor: number): Unit {
  return { id, name, symbol, toBase: (v) => v * factor, fromBase: (v) => v / factor };
}

/** 1 坪 = 400/121 m²（約 3.305785 m²）。 */
export const PING_M2 = 400 / 121;
/** 1 台尺 = 10/33 m（約 30.303 cm）。 */
const TAI_CHI_M = 10 / 33;

export const CATEGORIES: UnitCategory[] = [
  {
    key: 'length',
    name: '長度',
    defaults: { from: 'cm', to: 'in', value: 170 },
    units: [
      linear('mm', '公釐', 'mm', 0.001),
      linear('cm', '公分', 'cm', 0.01),
      linear('m', '公尺', 'm', 1),
      linear('km', '公里', 'km', 1000),
      linear('in', '英寸', 'in', 0.0254),
      linear('ft', '英尺', 'ft', 0.3048),
      linear('yd', '碼', 'yd', 0.9144),
      linear('mi', '英里', 'mi', 1609.344),
      linear('nmi', '海里', 'nmi', 1852),
      linear('taichi', '台尺', '台尺', TAI_CHI_M),
      linear('taicun', '台寸', '台寸', TAI_CHI_M / 10),
    ],
  },
  {
    key: 'weight',
    name: '重量',
    defaults: { from: 'jin', to: 'g', value: 1 },
    units: [
      linear('mg', '毫克', 'mg', 1e-6),
      linear('g', '公克', 'g', 0.001),
      linear('kg', '公斤', 'kg', 1),
      linear('t', '公噸', 't', 1000),
      linear('jin', '台斤', '台斤', 0.6),
      linear('liang', '兩', '兩', 0.0375),
      linear('qian', '錢', '錢', 0.00375),
      linear('lb', '磅', 'lb', 0.45359237),
      linear('oz', '盎司', 'oz', 0.028349523125),
      linear('ct', '克拉', 'ct', 0.0002),
    ],
  },
  {
    key: 'temperature',
    name: '溫度',
    defaults: { from: 'c', to: 'f', value: 25 },
    units: [
      { id: 'c', name: '攝氏', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: '華氏', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', name: '克氏（絕對溫度）', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    key: 'area',
    name: '面積',
    defaults: { from: 'ping', to: 'm2', value: 30 },
    units: [
      linear('cm2', '平方公分', 'cm²', 1e-4),
      linear('m2', '平方公尺', 'm²', 1),
      linear('ping', '坪', '坪', PING_M2),
      linear('are', '公畝', 'a', 100),
      linear('ha', '公頃', 'ha', 10000),
      linear('km2', '平方公里', 'km²', 1e6),
      linear('jia', '甲', '甲', 2934 * PING_M2),
      linear('ft2', '平方英尺', 'ft²', 0.09290304),
      linear('acre', '英畝', 'acre', 4046.8564224),
    ],
  },
  {
    key: 'volume',
    name: '體積',
    defaults: { from: 'l', to: 'usgal', value: 1 },
    units: [
      linear('ml', '毫升', 'mL', 0.001),
      linear('l', '公升', 'L', 1),
      linear('m3', '立方公尺', 'm³', 1000),
      linear('tsp', '小匙（茶匙）', '小匙', 0.005),
      linear('tbsp', '大匙（湯匙）', '大匙', 0.015),
      linear('cup', '杯（美制）', 'cup', 0.2365882365),
      linear('floz', '液量盎司（美制）', 'fl oz', 0.0295735295625),
      linear('usgal', '加侖（美制）', 'gal', 3.785411784),
      linear('ukgal', '加侖（英制）', 'gal (UK)', 4.54609),
    ],
  },
  {
    key: 'speed',
    name: '速度',
    defaults: { from: 'kmh', to: 'ms', value: 100 },
    units: [
      linear('ms', '公尺／秒', 'm/s', 1),
      linear('kmh', '公里／小時', 'km/h', 1 / 3.6),
      linear('mph', '英里／小時', 'mph', 0.44704),
      linear('kn', '節', 'kn', 1852 / 3600),
      linear('fts', '英尺／秒', 'ft/s', 0.3048),
    ],
  },
  {
    key: 'data',
    name: '資料量',
    defaults: { from: 'gb', to: 'gib', value: 512 },
    units: [
      linear('bit', '位元', 'bit', 1 / 8),
      linear('b', '位元組', 'B', 1),
      linear('kb', '千位元組（十進位）', 'KB', 1e3),
      linear('mb', '百萬位元組（十進位）', 'MB', 1e6),
      linear('gb', '十億位元組（十進位）', 'GB', 1e9),
      linear('tb', '兆位元組（十進位）', 'TB', 1e12),
      linear('kib', 'KiB（二進位）', 'KiB', 1024),
      linear('mib', 'MiB（二進位）', 'MiB', 1024 ** 2),
      linear('gib', 'GiB（二進位）', 'GiB', 1024 ** 3),
      linear('tib', 'TiB（二進位）', 'TiB', 1024 ** 4),
    ],
  },
];

// ---- Per-market unit sets (en: US customary first; ja: metric + 尺貫法) ----

/** Which units a locale shows. 'tw' (default) is the zh-TW list above, unchanged. */
export type UnitSet = 'tw' | 'us' | 'jp';

/** 日本の尺（曲尺）= 10/33 m, the same length as 台尺. */
const SHAKU_M = 10 / 33;
/** 1 升 = 2401/1331 L（約 1.8039 L, 1891 年度量衡法）. */
const SHO_L = 2401 / 1331;
/** 1 畳 = 1.62 m²（不動産公正取引協議会の表示規約: 1 畳あたり 1.62 m² 以上）. */
export const JO_M2 = 1.62;

/** Units that only appear outside zh-TW. `name` is a fallback; localized names live in i18n.ts. */
const EXTRA_UNITS: Partial<Record<CategoryKey, Unit[]>> = {
  length: [
    linear('shaku', '尺', '尺', SHAKU_M),
    linear('sun', '寸', '寸', SHAKU_M / 10),
    linear('ken', '間', '間', SHAKU_M * 6),
  ],
  weight: [
    linear('ston', 'Short ton (US)', 'ton', 907.18474),
    linear('st', 'Stone', 'st', 6.35029318),
    linear('kan', '貫', '貫', 3.75),
    linear('monme', '匁', '匁', 0.00375),
  ],
  area: [
    linear('in2', 'Square inches', 'in²', 0.00064516),
    linear('yd2', 'Square yards', 'yd²', 0.83612736),
    linear('mi2', 'Square miles', 'mi²', 2589988.110336),
    linear('tsubo', '坪', '坪', PING_M2),
    linear('jo', '畳', '畳', JO_M2),
  ],
  volume: [
    linear('ustsp', 'Teaspoons (US)', 'tsp', 0.00492892159375),
    linear('ustbsp', 'Tablespoons (US)', 'tbsp', 0.01478676478125),
    linear('pt', 'Pints (US)', 'pt', 0.473176473),
    linear('qt', 'Quarts (US)', 'qt', 0.946352946),
    linear('ft3', 'Cubic feet', 'ft³', 28.316846592),
    linear('jpcup', 'カップ', 'カップ', 0.2),
    linear('go', '合', '合', SHO_L / 10),
    linear('sho', '升', '升', SHO_L),
  ],
};

interface SetSpec {
  units: string[];
  defaults: { from: string; to: string; value: number };
}

const SET_SPECS: Record<Exclude<UnitSet, 'tw'>, Record<CategoryKey, SetSpec>> = {
  us: {
    length: { units: ['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km', 'nmi'], defaults: { from: 'ft', to: 'm', value: 6 } },
    weight: { units: ['oz', 'lb', 'ston', 'st', 'mg', 'g', 'kg', 't', 'ct'], defaults: { from: 'lb', to: 'kg', value: 150 } },
    temperature: { units: ['f', 'c', 'k'], defaults: { from: 'f', to: 'c', value: 72 } },
    area: {
      units: ['in2', 'ft2', 'yd2', 'acre', 'mi2', 'cm2', 'm2', 'ha', 'km2'],
      defaults: { from: 'ft2', to: 'm2', value: 1000 },
    },
    volume: {
      units: ['ustsp', 'ustbsp', 'floz', 'cup', 'pt', 'qt', 'usgal', 'ft3', 'ml', 'l', 'm3', 'ukgal'],
      defaults: { from: 'cup', to: 'ml', value: 1 },
    },
    speed: { units: ['mph', 'fts', 'kmh', 'ms', 'kn'], defaults: { from: 'mph', to: 'kmh', value: 65 } },
    data: { units: ['bit', 'b', 'kb', 'mb', 'gb', 'tb', 'kib', 'mib', 'gib', 'tib'], defaults: { from: 'tb', to: 'gib', value: 1 } },
  },
  jp: {
    length: {
      units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'nmi', 'shaku', 'sun', 'ken'],
      defaults: { from: 'in', to: 'cm', value: 27 },
    },
    weight: { units: ['mg', 'g', 'kg', 't', 'lb', 'oz', 'ct', 'kan', 'monme'], defaults: { from: 'lb', to: 'kg', value: 100 } },
    temperature: { units: ['c', 'f', 'k'], defaults: { from: 'f', to: 'c', value: 100 } },
    area: {
      units: ['cm2', 'm2', 'are', 'ha', 'km2', 'tsubo', 'jo', 'ft2', 'acre'],
      defaults: { from: 'tsubo', to: 'm2', value: 30 },
    },
    volume: {
      units: ['ml', 'l', 'm3', 'tsp', 'tbsp', 'jpcup', 'go', 'sho', 'cup', 'floz', 'usgal', 'ukgal'],
      defaults: { from: 'go', to: 'ml', value: 3 },
    },
    speed: { units: ['kmh', 'ms', 'mph', 'kn'], defaults: { from: 'kmh', to: 'ms', value: 100 } },
    data: { units: ['bit', 'b', 'kb', 'mb', 'gb', 'tb', 'kib', 'mib', 'gib', 'tib'], defaults: { from: 'tb', to: 'gib', value: 1 } },
  },
};

function buildSet(set: Exclude<UnitSet, 'tw'>): UnitCategory[] {
  return CATEGORIES.map((category) => {
    const spec = SET_SPECS[set][category.key];
    const pool = [...category.units, ...(EXTRA_UNITS[category.key] ?? [])];
    const units = spec.units.map((id) => {
      const unit = pool.find((u) => u.id === id);
      if (!unit) throw new Error(`Unknown unit "${id}" in ${set}/${category.key}`);
      return unit;
    });
    return { ...category, units, defaults: spec.defaults };
  });
}

const SETS: Record<UnitSet, UnitCategory[]> = { tw: CATEGORIES, us: buildSet('us'), jp: buildSet('jp') };

/** Categories with the units a market expects, in display order. 'tw' returns CATEGORIES itself. */
export function categoriesFor(set: UnitSet = 'tw'): UnitCategory[] {
  return SETS[set];
}

export function getCategory(key: string, set: UnitSet = 'tw'): UnitCategory {
  const list = SETS[set];
  return list.find((c) => c.key === key) ?? list[0];
}

export function getUnit(category: UnitCategory, id: string): Unit | undefined {
  return category.units.find((u) => u.id === id);
}

/** Absolute zero in °C; temperatures below this are physically impossible. */
export const ABSOLUTE_ZERO_C = -273.15;

/** Removes binary floating-point noise such as 0.30000000000000004. */
export function cleanFloat(value: number, significant = 12): number {
  if (!Number.isFinite(value) || value === 0) return value;
  return Number(value.toPrecision(significant));
}

/**
 * Converts `value` between two units of the same category.
 * Returns NaN for unknown units, non-finite input, or temperatures below absolute zero.
 */
export function convert(
  value: number,
  categoryKey: CategoryKey,
  fromId: string,
  toId: string,
  set: UnitSet = 'tw',
): number {
  const category = getCategory(categoryKey, set);
  const from = getUnit(category, fromId);
  const to = getUnit(category, toId);
  if (!from || !to || !Number.isFinite(value)) return Number.NaN;
  const base = from.toBase(value);
  if (category.key === 'temperature' && base < ABSOLUTE_ZERO_C - 1e-9) return Number.NaN;
  if (category.key !== 'temperature' && value < 0) return Number.NaN;
  return cleanFloat(to.fromBase(base));
}

export interface ConversionRow {
  unit: Unit;
  value: number;
}

/** Converts `value` into every unit of the category, in display order. */
export function convertAll(value: number, categoryKey: CategoryKey, fromId: string, set: UnitSet = 'tw'): ConversionRow[] {
  const category = getCategory(categoryKey, set);
  return category.units.map((unit) => ({ unit, value: convert(value, category.key, fromId, unit.id, set) }));
}

/**
 * Formats a converted value with up to 10 significant digits; very large or very small
 * magnitudes use scientific notation so tiny results never collapse to 0.
 */
export function formatValue(value: number, locale: Locale = DEFAULT_LOCALE): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-6) {
    const [mantissa, exponent] = value.toExponential(6).split('e');
    const m = mantissa.replace(/\.?0+$/, '');
    return `${m} × 10^${Number(exponent)}`;
  }
  return new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumSignificantDigits: 10 }).format(value);
}

// ---- Localized unit labels (strings come from i18n.ts) ----

export interface UnitText {
  /** '{name}（{symbol}）' */
  unitLabel: string;
  /** Used when name and symbol are identical (ja 坪 → '坪' instead of '坪（坪）'). */
  unitLabelSame?: string;
  unitNames?: Record<string, string>;
  unitSymbols?: Record<string, string>;
}

export function unitName(unit: Unit, text: UnitText): string {
  return text.unitNames?.[unit.id] ?? unit.name;
}

export function unitSymbol(unit: Unit, text: UnitText): string {
  return text.unitSymbols?.[unit.id] ?? unit.symbol;
}

/** Option / table label: '公尺（m）', 'Meters (m)', '坪'. */
export function unitLabel(unit: Unit, text: UnitText): string {
  const name = unitName(unit, text);
  const symbol = unitSymbol(unit, text);
  const template = name === symbol && text.unitLabelSame ? text.unitLabelSame : text.unitLabel;
  return template.replace('{name}', name).replace('{symbol}', symbol);
}

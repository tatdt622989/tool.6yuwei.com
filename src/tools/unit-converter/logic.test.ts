import { describe, expect, it } from 'vitest';
import { CATEGORIES, cleanFloat, convert, convertAll, formatValue, getCategory, PING_M2 } from './logic';

describe('convert: linear units', () => {
  it('converts length', () => {
    expect(convert(1, 'length', 'in', 'cm')).toBe(2.54);
    expect(convert(1, 'length', 'mi', 'km')).toBe(1.609344);
    expect(convert(1, 'length', 'taichi', 'cm')).toBeCloseTo(30.303, 3);
    expect(convert(170, 'length', 'cm', 'ft')).toBeCloseTo(5.5774, 4);
  });

  it('converts Taiwan weight units', () => {
    expect(convert(1, 'weight', 'jin', 'g')).toBe(600);
    expect(convert(1, 'weight', 'liang', 'g')).toBe(37.5);
    expect(convert(1, 'weight', 'jin', 'liang')).toBe(16);
    expect(convert(1, 'weight', 'kg', 'jin')).toBeCloseTo(1.666667, 6);
    expect(convert(1, 'weight', 'lb', 'oz')).toBe(16);
  });

  it('converts area including 坪 and 甲', () => {
    expect(convert(1, 'area', 'ping', 'm2')).toBeCloseTo(3.305785, 6);
    expect(convert(121, 'area', 'ping', 'm2')).toBe(400);
    expect(convert(1, 'area', 'jia', 'ping')).toBe(2934);
    expect(convert(1, 'area', 'ha', 'm2')).toBe(10000);
    expect(convert(1, 'area', 'acre', 'm2')).toBeCloseTo(4046.856, 3);
    expect(PING_M2).toBeCloseTo(3.305785, 6);
  });

  it('converts volume and speed', () => {
    expect(convert(1, 'volume', 'usgal', 'l')).toBe(3.785411784);
    expect(convert(1, 'volume', 'tbsp', 'tsp')).toBe(3);
    expect(convert(100, 'speed', 'kmh', 'ms')).toBeCloseTo(27.7778, 4);
    expect(convert(1, 'speed', 'kn', 'kmh')).toBe(1.852);
  });

  it('distinguishes decimal and binary data sizes', () => {
    expect(convert(1, 'data', 'kb', 'b')).toBe(1000);
    expect(convert(1, 'data', 'kib', 'b')).toBe(1024);
    expect(convert(1, 'data', 'b', 'bit')).toBe(8);
    expect(convert(1, 'data', 'tb', 'gib')).toBeCloseTo(931.3226, 4);
  });

  it('removes floating-point noise', () => {
    expect(convert(0.3, 'length', 'm', 'cm')).toBe(30);
    expect(convert(0.1, 'weight', 'kg', 'g')).toBe(100);
  });

  it('returns the same value for identical units and handles zero', () => {
    expect(convert(42, 'volume', 'l', 'l')).toBe(42);
    expect(convert(0, 'length', 'km', 'mi')).toBe(0);
  });
});

describe('convert: temperature', () => {
  it('handles offsets correctly', () => {
    expect(convert(0, 'temperature', 'c', 'f')).toBe(32);
    expect(convert(100, 'temperature', 'c', 'f')).toBe(212);
    expect(convert(-40, 'temperature', 'c', 'f')).toBe(-40);
    expect(convert(98.6, 'temperature', 'f', 'c')).toBe(37);
    expect(convert(0, 'temperature', 'k', 'c')).toBe(-273.15);
    expect(convert(32, 'temperature', 'f', 'k')).toBe(273.15);
  });

  it('allows negative temperatures but rejects values below absolute zero', () => {
    expect(convert(-10, 'temperature', 'c', 'k')).toBe(263.15);
    expect(convert(-300, 'temperature', 'c', 'f')).toBeNaN();
    expect(convert(-1, 'temperature', 'k', 'c')).toBeNaN();
  });
});

describe('convert: invalid input', () => {
  it('rejects unknown units, NaN and negative quantities', () => {
    expect(convert(1, 'length', 'm', 'nope')).toBeNaN();
    expect(convert(Number.NaN, 'length', 'm', 'cm')).toBeNaN();
    expect(convert(Number.POSITIVE_INFINITY, 'length', 'm', 'cm')).toBeNaN();
    expect(convert(-5, 'length', 'm', 'cm')).toBeNaN();
  });
});

describe('convertAll', () => {
  it('returns one row per unit, including the source unit', () => {
    const rows = convertAll(1, 'weight', 'jin');
    expect(rows).toHaveLength(getCategory('weight').units.length);
    expect(rows.find((r) => r.unit.id === 'jin')?.value).toBe(1);
    expect(rows.find((r) => r.unit.id === 'kg')?.value).toBe(0.6);
  });

  it('every category default points to real units', () => {
    for (const cat of CATEGORIES) {
      expect(cat.units.some((u) => u.id === cat.defaults.from)).toBe(true);
      expect(cat.units.some((u) => u.id === cat.defaults.to)).toBe(true);
      expect(new Set(cat.units.map((u) => u.id)).size).toBe(cat.units.length);
    }
  });
});

describe('formatValue', () => {
  it('formats normal, tiny, huge and invalid values', () => {
    expect(formatValue(0)).toBe('0');
    expect(formatValue(1234.5)).toBe('1,234.5');
    expect(formatValue(0.000123)).toBe('0.000123');
    expect(formatValue(1e-9)).toBe('1 × 10^-9');
    expect(formatValue(2.5e18)).toBe('2.5 × 10^18');
    expect(formatValue(Number.NaN)).toBe('—');
  });

  it('cleanFloat keeps zero and trims noise', () => {
    expect(cleanFloat(0)).toBe(0);
    expect(cleanFloat(0.1 + 0.2)).toBe(0.3);
  });
});

import { describe, expect, it } from 'vitest';
import { convert } from '../tools/unit-converter/logic';
import { feetInches, formatDisplay, formulaText } from './logic';
import { pairs } from './pairs';

describe('pairs', () => {
  it('all reference valid units and unique slugs', () => {
    const slugs = new Set<string>();
    for (const p of pairs) {
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(Number.isFinite(convert(1, p.category, p.from, p.to))).toBe(true);
      expect(p.values.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('formulaText', () => {
  it('uses division by the defined constant when it is rounder', () => {
    expect(formulaText('length', 'cm', 'in')).toBe('英寸 = 公分 ÷ 2.54');
    expect(formulaText('length', 'in', 'cm')).toBe('公分 = 英寸 × 2.54');
  });

  it('uses dedicated temperature formulas', () => {
    expect(formulaText('temperature', 'c', 'f')).toBe('°F = °C × 9/5 + 32');
  });
});

describe('feetInches', () => {
  it('formats heights', () => {
    expect(feetInches(convert(170, 'length', 'cm', 'ft'))).toBe('5 呎 7 吋');
    expect(feetInches(convert(182.88, 'length', 'cm', 'ft'))).toBe('6 呎 0 吋');
  });

  it('carries 12 inches into the next foot', () => {
    expect(feetInches(5.99)).toBe('6 呎 0 吋');
  });
});

describe('formatDisplay', () => {
  it('rounds for readability', () => {
    expect(formatDisplay(5.577427822)).toBe('5.5774');
    expect(formatDisplay(0.0328083989)).toBe('0.03281');
    expect(formatDisplay(1000)).toBe('1,000');
  });
});

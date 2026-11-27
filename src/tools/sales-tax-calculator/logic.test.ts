import { describe, expect, it } from 'vitest';
import {
  addTax,
  findState,
  formatRate,
  formatUsd,
  isValidRate,
  rateFrom,
  removeTax,
  STATE_RATES,
  taxOn,
  toCents,
} from './logic';

describe('STATE_RATES', () => {
  it('has 50 states plus DC, sorted by name, with unique codes', () => {
    expect(STATE_RATES).toHaveLength(51);
    expect(new Set(STATE_RATES.map((s) => s.code)).size).toBe(51);
    const names = STATE_RATES.map((s) => s.name);
    expect([...names].sort((a, b) => a.localeCompare(b, 'en'))).toEqual(names);
  });

  it('matches the 2026 state-level rates', () => {
    expect(findState('CA')?.rate).toBe(7.25);
    expect(findState('tx')?.rate).toBe(6.25);
    expect(findState('NY')?.rate).toBe(4);
    expect(findState('FL')?.rate).toBe(6);
    expect(findState('LA')?.rate).toBe(5);
    expect(findState('MN')?.rate).toBe(6.875);
    expect(findState('NJ')?.rate).toBe(6.625);
    expect(findState('MO')?.rate).toBe(4.225);
    expect(findState('DC')?.rate).toBe(6);
    expect(findState('ZZ')).toBeUndefined();
  });

  it('lists the five states without a statewide sales tax', () => {
    expect(STATE_RATES.filter((s) => s.rate === 0).map((s) => s.code)).toEqual(['AK', 'DE', 'MT', 'NH', 'OR']);
  });

  it('never has a combined average below the state rate except rounding (NJ)', () => {
    for (const s of STATE_RATES) expect(s.avgCombined).toBeGreaterThanOrEqual(s.rate - 0.03);
  });
});

describe('taxOn / addTax', () => {
  it('adds tax and rounds half up to the cent', () => {
    expect(addTax(10000, 7.25)).toEqual({ priceCents: 10000, taxCents: 725, totalCents: 10725 });
    // $10.00 × 7.25% = $0.725 → $0.73
    expect(taxOn(1000, 7.25)).toBe(73);
    // $19.99 × 8.875% = $1.7741 → $1.77
    expect(taxOn(1999, 8.875)).toBe(177);
    // $49.99 × 6.25% = $3.124375 → $3.12
    expect(taxOn(4999, 6.25)).toBe(312);
    // $1,250.00 × 9.5% = $118.75
    expect(taxOn(125000, 9.5)).toBe(11875);
  });

  it('handles zero rate and zero price', () => {
    expect(addTax(5000, 0)).toEqual({ priceCents: 5000, taxCents: 0, totalCents: 5000 });
    expect(addTax(0, 8)).toEqual({ priceCents: 0, taxCents: 0, totalCents: 0 });
  });

  it('is exact for rates with three decimals', () => {
    // 4.225% of $1,000,000.00 = $42,250.00
    expect(taxOn(100_000_000, 4.225)).toBe(4_225_000);
  });

  it('rejects invalid input', () => {
    expect(addTax(-1, 7)).toBeNull();
    expect(addTax(100.5, 7)).toBeNull();
    expect(addTax(100, -1)).toBeNull();
    expect(addTax(100, 26)).toBeNull();
    expect(addTax(Number.NaN, 7)).toBeNull();
  });
});

describe('removeTax (reverse sales tax)', () => {
  it('finds the pre-tax price from a total', () => {
    expect(removeTax(10725, 7.25)).toEqual({ priceCents: 10000, taxCents: 725, totalCents: 10725, exact: true });
    // $54.11 at 8.25% → $49.99 + $4.12
    expect(removeTax(5411, 8.25)).toEqual({ priceCents: 4999, taxCents: 412, totalCents: 5411, exact: true });
  });

  it('round-trips addTax for many prices and rates', () => {
    for (const rate of [2.9, 4, 4.225, 6.25, 6.875, 7.25, 8.875, 9.5, 10.25]) {
      for (let price = 1; price < 30000; price += 137) {
        const total = addTax(price, rate)!.totalCents;
        const back = removeTax(total, rate)!;
        expect(back.exact).toBe(true);
        expect(back.priceCents + taxOn(back.priceCents, rate)).toBe(total);
      }
    }
  });

  it('flags totals no whole-cent price can produce', () => {
    // At 8.25%, $49.87 → $53.98 and $49.88 → $54.00, so a $53.99 total is impossible.
    const r = removeTax(5399, 8.25)!;
    expect(r.exact).toBe(false);
    expect(r.priceCents + r.taxCents).toBe(5399);
    expect(addTax(4987, 8.25)!.totalCents).toBe(5398);
    expect(addTax(4988, 8.25)!.totalCents).toBe(5400);
  });

  it('returns the total itself at 0%', () => {
    expect(removeTax(1234, 0)).toEqual({ priceCents: 1234, taxCents: 0, totalCents: 1234, exact: true });
  });

  it('rejects invalid input', () => {
    expect(removeTax(-5, 7)).toBeNull();
    expect(removeTax(500, Number.NaN)).toBeNull();
  });
});

describe('rateFrom', () => {
  it('derives the rate from price and total', () => {
    expect(rateFrom(10000, 10725)).toBeCloseTo(7.25, 10);
    expect(rateFrom(2000, 2000)).toBe(0);
  });
  it('is NaN when undefined', () => {
    expect(rateFrom(0, 100)).toBeNaN();
    expect(rateFrom(100, 50)).toBeNaN();
  });
});

describe('helpers', () => {
  it('toCents', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.07)).toBe(7);
    expect(toCents(Number.NaN)).toBeNaN();
  });
  it('isValidRate', () => {
    expect(isValidRate(0)).toBe(true);
    expect(isValidRate(25)).toBe(true);
    expect(isValidRate(25.01)).toBe(false);
  });
  it('formatUsd / formatRate', () => {
    expect(formatUsd(1072500)).toBe('$10,725.00');
    expect(formatUsd(-5)).toBe('-$0.05');
    expect(formatRate(6.875)).toBe('6.875%');
    expect(formatRate(7)).toBe('7%');
    expect(formatRate(7.25)).toBe('7.25%');
    expect(formatRate(1 / 3)).toBe('0.3333%');
    expect(formatRate(Number.NaN)).toBe('—');
  });
});

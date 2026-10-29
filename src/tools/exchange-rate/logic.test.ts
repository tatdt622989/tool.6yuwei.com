import { describe, expect, it } from 'vitest';
import { convert, currencyName, decimalsFor, isFresh, parseRateResponse, quickAmounts, unitRate, CACHE_MAX_AGE_MS } from './logic';

const sample = {
  result: 'success',
  base_code: 'TWD',
  time_last_update_unix: 1_793_232_151,
  time_next_update_unix: 1_793_319_341,
  rates: { TWD: 1, USD: 0.030849, JPY: 4.87279, EUR: 0.027681, BAD: 'x', XX: 1 },
};

describe('parseRateResponse', () => {
  it('accepts the API shape and drops invalid entries', () => {
    const d = parseRateResponse(sample)!;
    expect(d.rates.USD).toBe(0.030849);
    expect(d.rates.TWD).toBe(1);
    expect(d.rates.BAD).toBeUndefined();
    expect(d.rates.XX).toBeUndefined();
    expect(d.updatedUnix).toBe(1_793_232_151);
  });
  it('rejects errors and other bases', () => {
    expect(parseRateResponse({ result: 'error', 'error-type': 'unsupported-code' })).toBeNull();
    expect(parseRateResponse({ ...sample, base_code: 'USD' })).toBeNull();
    expect(parseRateResponse(null)).toBeNull();
    expect(parseRateResponse('x')).toBeNull();
    expect(parseRateResponse({ ...sample, rates: {} })).toBeNull();
  });
});

describe('convert', () => {
  const { rates } = parseRateResponse(sample)!;
  it('TWD → foreign multiplies', () => {
    expect(convert(1000, 'TWD', 'USD', rates)).toBeCloseTo(30.849, 6);
  });
  it('foreign → TWD divides', () => {
    expect(convert(100, 'USD', 'TWD', rates)).toBeCloseTo(100 / 0.030849, 6);
    expect(unitRate('USD', 'TWD', rates)).toBeCloseTo(32.4159, 3);
  });
  it('cross rates go through TWD', () => {
    expect(convert(1, 'USD', 'JPY', rates)).toBeCloseTo(4.87279 / 0.030849, 6);
  });
  it('round-trips', () => {
    expect(convert(convert(123.45, 'EUR', 'JPY', rates), 'JPY', 'EUR', rates)).toBeCloseTo(123.45, 8);
  });
  it('unknown currency gives NaN', () => {
    expect(convert(1, 'USD', 'ABC', rates)).toBeNaN();
  });
});

describe('cache freshness', () => {
  it('is fresh within the max age', () => {
    const cache = { fetchedAt: 1000, data: parseRateResponse(sample)! };
    expect(isFresh(cache, 1000 + CACHE_MAX_AGE_MS - 1)).toBe(true);
    expect(isFresh(cache, 1000 + CACHE_MAX_AGE_MS)).toBe(false);
    expect(isFresh(cache, 500)).toBe(false);
    expect(isFresh(null, 1000)).toBe(false);
  });
});

describe('helpers', () => {
  it('decimalsFor scales with magnitude', () => {
    expect(decimalsFor(32.4)).toBe(3);
    expect(decimalsFor(1234)).toBe(2);
    expect(decimalsFor(0.0308)).toBe(4);
    expect(decimalsFor(0.00125)).toBe(6);
  });
  it('quickAmounts uses larger steps for small-unit currencies', () => {
    expect(quickAmounts('USD')[0]).toBe(1);
    expect(quickAmounts('JPY')[0]).toBe(100);
    expect(quickAmounts('VND')[0]).toBe(10_000);
  });
  it('currencyName', () => {
    expect(currencyName('JPY')).toBe('日圓');
    expect(currencyName('ZZZ')).toBe('ZZZ');
  });
});

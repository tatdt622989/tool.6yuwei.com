import { describe, expect, it } from 'vitest';
import {
  checkNumber,
  claimStatus,
  daysBetween,
  drawAfter,
  formatDate,
  formatPrize,
  isStale,
  lastDraw,
  LATEST,
  nextDraw,
  normalizeInput,
  PERIODS,
  prizeTax,
  shortLabel,
  todayInTaipei,
  type InvoicePeriod,
} from './logic';

const period: InvoicePeriod = {
  period: '115-07-08',
  label: '115年07-08月',
  drawDate: '2026-09-25',
  claimStart: '2026-10-06',
  claimEnd: '2027-01-05',
  special: '89996565',
  grand: '91098182',
  first: ['54348835', '44991397', '06595111'],
};

const name = (digits: string) => checkNumber(digits, period).prize?.name ?? null;

describe('checkNumber — full 8 digits', () => {
  it('finds every prize tier', () => {
    expect(name('89996565')).toBe('特別獎');
    expect(name('91098182')).toBe('特獎');
    expect(name('54348835')).toBe('頭獎');
    expect(name('14348835')).toBe('二獎');
    expect(name('12348835')).toBe('三獎');
    expect(name('12148835')).toBe('四獎');
    expect(name('12318835')).toBe('五獎');
    expect(name('12345635')).toBe(null);
    expect(name('00000835')).toBe('六獎');
    expect(name('00000000')).toBe(null);
  });

  it('only full matches count for 特別獎 / 特獎', () => {
    expect(name('19996565')).toBe(null);
    expect(name('11098182')).toBe(null);
    expect(checkNumber('19996565', period).possible).toEqual([]);
  });

  it('takes the best tier across the three 頭獎 numbers', () => {
    const p = { ...period, first: ['11111835', '22220835', '33333333'] };
    const r = checkNumber('99920835', p);
    expect(r.prize?.name).toBe('四獎');
    expect(r.matched).toBe('22220835');
  });
});

describe('checkNumber — 末三碼 quick check', () => {
  it('no match means no prize at all', () => {
    const r = checkNumber('123', period);
    expect(r.prize).toBe(null);
    expect(r.possible).toEqual([]);
  });

  it('a 頭獎 tail is at least 六獎, with higher tiers still possible', () => {
    const r = checkNumber('835', period);
    expect(r.prize?.name).toBe('六獎');
    expect(r.possible.map((p) => p.name)).toEqual(['頭獎', '二獎', '三獎', '四獎', '五獎']);
  });

  it('a 特別獎 / 特獎 tail is not a prize yet but needs all 8 digits', () => {
    const special = checkNumber('565', period);
    expect(special.prize).toBe(null);
    expect(special.possible.map((p) => p.name)).toEqual(['特別獎']);
    expect(checkNumber('182', period).possible.map((p) => p.name)).toEqual(['特獎']);
  });

  it('narrows as more digits are entered', () => {
    const r = checkNumber('48835', period);
    expect(r.prize?.name).toBe('四獎');
    expect(r.possible.map((p) => p.name)).toEqual(['頭獎', '二獎', '三獎']);
    expect(checkNumber('08835', period).possible).toEqual([]);
  });

  it('rejects malformed input', () => {
    expect(() => checkNumber('12', period)).toThrow();
    expect(() => checkNumber('123456789', period)).toThrow();
    expect(() => checkNumber('12a', period)).toThrow();
  });
});

describe('normalizeInput', () => {
  it('keeps digits only and converts full-width digits', () => {
    expect(normalizeInput('AB-1234 5678')).toBe('12345678');
    expect(normalizeInput('８３５')).toBe('835');
  });
});

describe('prizeTax', () => {
  it('withholds 20% above NT$5,000 and 0.4% stamp duty from NT$500 when claimed in person', () => {
    expect(prizeTax(10_000_000)).toEqual({ incomeTax: 2_000_000, stamp: 40_000, net: 7_960_000 });
    expect(prizeTax(2_000_000).net).toBe(1_592_000);
    expect(prizeTax(200_000).net).toBe(159_200);
    expect(prizeTax(40_000).net).toBe(31_840);
    expect(prizeTax(10_000).net).toBe(7_960);
    expect(prizeTax(4_000)).toEqual({ incomeTax: 0, stamp: 16, net: 3_984 });
    expect(prizeTax(1_000).net).toBe(996);
    expect(prizeTax(200)).toEqual({ incomeTax: 0, stamp: 0, net: 200 });
  });

  it('waives stamp duty for prizes paid to a registered account', () => {
    expect(prizeTax(10_000_000, true).net).toBe(8_000_000);
    expect(prizeTax(1_000, true).net).toBe(1_000);
  });
});

describe('formatting', () => {
  it('formats prize amounts and dates', () => {
    expect(formatPrize(10_000_000)).toBe('1,000 萬元');
    expect(formatPrize(200_000)).toBe('20 萬元');
    expect(formatPrize(4_000)).toBe('4,000 元');
    expect(formatDate('2026-11-25')).toBe('2026/11/25（三）');
    expect(formatDate('2027-01-05', false)).toBe('2027/1/5');
    expect(shortLabel('115-07-08')).toBe('115年7-8月');
  });

  it('gets the Taiwan calendar day regardless of device timezone', () => {
    expect(todayInTaipei(new Date('2026-10-28T16:30:00Z'))).toBe('2026-10-29');
    expect(todayInTaipei(new Date('2026-10-28T15:30:00Z'))).toBe('2026-10-28');
  });
});

describe('draw schedule', () => {
  it('finds the next draw (25th of odd months)', () => {
    expect(nextDraw('2026-10-29')).toEqual({ date: '2026-11-25', period: '115-09-10', label: '115年09-10月' });
    expect(nextDraw('2026-11-25').date).toBe('2026-11-25');
    expect(nextDraw('2026-11-26')).toEqual({ date: '2027-01-25', period: '115-11-12', label: '115年11-12月' });
    expect(nextDraw('2026-12-31').period).toBe('115-11-12');
    expect(nextDraw('2027-01-10').date).toBe('2027-01-25');
  });

  it('finds the last draw', () => {
    expect(lastDraw('2026-10-29').period).toBe('115-07-08');
    expect(lastDraw('2026-11-24').period).toBe('115-07-08');
    expect(lastDraw('2026-11-25').period).toBe('115-09-10');
    expect(lastDraw('2027-01-10')).toEqual({ date: '2026-11-25', period: '115-09-10', label: '115年09-10月' });
    expect(lastDraw('2027-01-25').period).toBe('115-11-12');
  });

  it('computes the draw after a stored period', () => {
    expect(drawAfter(period)).toEqual({ date: '2026-11-25', period: '115-09-10', label: '115年09-10月' });
    expect(drawAfter({ ...period, period: '115-11-12' }).period).toBe('116-01-02');
  });

  it('detects when the data is behind the calendar', () => {
    expect(isStale([period], '2026-10-29')).toBe(false);
    expect(isStale([period], '2026-11-25')).toBe(true);
    expect(isStale([], '2026-10-29')).toBe(true);
  });

  it('reports claim windows', () => {
    expect(claimStatus(period, '2026-10-01')).toEqual({ state: 'upcoming', days: 5 });
    expect(claimStatus(period, '2027-01-05')).toEqual({ state: 'open', days: 1 });
    expect(claimStatus(period, '2026-10-29').state).toBe('open');
    expect(claimStatus(period, '2027-01-06')).toEqual({ state: 'expired', days: 1 });
    expect(daysBetween('2026-10-29', '2026-11-25')).toBe(27);
  });
});

describe('stored data', () => {
  it('exposes the newest period first', () => {
    expect(LATEST).toBe(PERIODS[0]);
    // Generic on purpose: data.json is rewritten by the updater, and `npm test` gates the Docker build.
    expect(PERIODS.length).toBeGreaterThanOrEqual(2);
    expect(PERIODS[0].period > PERIODS[1].period || PERIODS[0].period.length > PERIODS[1].period.length).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import {
  CLOCK_START,
  DEFAULTS,
  EXAMPLE_IDS,
  EXAMPLE_PRICES,
  FREQUENCIES,
  clockSpan,
  dayGrid,
  decodeShare,
  encodeShare,
  exampleLabel,
  examplesFor,
  formatPrice,
  formatRate,
  habit,
  hourlyRate,
  matchesExample,
  monthShare,
  monthlyPay,
  normalizeSettings,
  payOf,
  splitWorkTime,
  timesPerYear,
  workHours,
  type Pay,
  type Settings,
} from './logic';

const zh = DEFAULTS['zh-TW'];
const pay = (over: Partial<Pay> = {}): Pay => ({ currency: 'TWD', pay: 44_000, period: 'month', workDays: 22, hoursPerDay: 8, ...over });

describe('hourlyRate', () => {
  it('divides monthly pay by working days × paid hours', () => {
    expect(hourlyRate(pay())).toBe(250);
    expect(hourlyRate(pay({ pay: 40_000 }))).toBeCloseTo(227.2727, 4);
  });

  it('divides yearly pay by 12 first', () => {
    expect(hourlyRate(pay({ pay: 528_000, period: 'year' }))).toBe(250);
    expect(hourlyRate(pay({ pay: 60_000, period: 'year', hoursPerDay: 7.5 }))).toBeCloseTo(30.303, 3);
  });

  it('uses hourly pay as it is, whatever the days and hours', () => {
    expect(hourlyRate(pay({ pay: 196, period: 'hour', workDays: 10, hoursPerDay: 4 }))).toBe(196);
  });

  it('is 0 without pay or without paid time', () => {
    expect(hourlyRate(pay({ pay: 0 }))).toBe(0);
    expect(hourlyRate(pay({ pay: -5 }))).toBe(0);
    expect(hourlyRate(pay({ pay: Number.NaN }))).toBe(0);
    expect(hourlyRate(pay({ workDays: 0 }))).toBe(0);
    expect(hourlyRate(pay({ hoursPerDay: 0 }))).toBe(0);
  });

  it('monthlyPay gives the salary back, or wage × hours in a month for hourly pay', () => {
    expect(monthlyPay(pay())).toBeCloseTo(44_000, 6);
    expect(monthlyPay(pay({ pay: 528_000, period: 'year' }))).toBeCloseTo(44_000, 6);
    expect(monthlyPay(pay({ pay: 200, period: 'hour' }))).toBe(35_200);
  });
});

describe('workHours and splitWorkTime', () => {
  it('turns a price into hours', () => {
    expect(workHours(30_000, 250)).toBe(120);
    expect(workHours(0, 250)).toBe(0);
  });

  it('is null without a usable rate or with a bad price', () => {
    expect(workHours(30_000, 0)).toBeNull();
    expect(workHours(30_000, Number.NaN)).toBeNull();
    expect(workHours(-1, 250)).toBeNull();
    expect(workHours(Number.NaN, 250)).toBeNull();
    expect(workHours(Number.POSITIVE_INFINITY, 250)).toBeNull();
  });

  it('splits hours into working days, hours and minutes', () => {
    expect(splitWorkTime(120, 8)).toEqual({ days: 15, hours: 0, minutes: 0 });
    expect(splitWorkTime(22.5, 8)).toEqual({ days: 2, hours: 6, minutes: 30 });
    expect(splitWorkTime(33, 7.5)).toEqual({ days: 4, hours: 3, minutes: 0 });
    expect(splitWorkTime(0.75, 8)).toEqual({ days: 0, hours: 0, minutes: 45 });
    expect(splitWorkTime(17.6, 8)).toEqual({ days: 2, hours: 1, minutes: 36 });
  });

  it('carries rounded minutes into hours and days', () => {
    // 7 h 59.7 min rounds to a full 8-hour day, never "7 hours 60 minutes".
    expect(splitWorkTime(7.995, 8)).toEqual({ days: 1, hours: 0, minutes: 0 });
    expect(splitWorkTime(1.9999, 8)).toEqual({ days: 0, hours: 2, minutes: 0 });
    // 3 days of 7.6 hours must not land a hair under 3 days.
    expect(splitWorkTime(7.6 * 3, 7.6)).toEqual({ days: 3, hours: 0, minutes: 0 });
  });

  it('is all zero for nothing, bad hours or a zero-hour day', () => {
    const zero = { days: 0, hours: 0, minutes: 0 };
    expect(splitWorkTime(0, 8)).toEqual(zero);
    expect(splitWorkTime(-3, 8)).toEqual(zero);
    expect(splitWorkTime(Number.NaN, 8)).toEqual(zero);
    expect(splitWorkTime(Number.POSITIVE_INFINITY, 8)).toEqual(zero);
    expect(splitWorkTime(10, 0)).toEqual(zero);
  });

  it('gives the share of a month', () => {
    expect(monthShare(132, pay())).toBe(0.75);
    expect(monthShare(352, pay())).toBe(2);
    expect(monthShare(0, pay())).toBe(0);
    expect(monthShare(10, pay({ workDays: 0 }))).toBe(0);
  });
});

describe('clockSpan', () => {
  it('starts on Monday at 9:00', () => {
    expect(CLOCK_START).toBe(540);
    // 22.5 hours at 8 a day: Monday 8, Tuesday 8, Wednesday 6.5 → Wednesday 15:30.
    expect(clockSpan(22.5, 8)).toEqual({ week: 0, weekday: 2, endMinutes: 15 * 60 + 30 });
    expect(clockSpan(2, 8)).toEqual({ week: 0, weekday: 0, endMinutes: 11 * 60 });
  });

  it('ends on the last worked day when the hours fill it exactly', () => {
    expect(clockSpan(16, 8)).toEqual({ week: 0, weekday: 1, endMinutes: 17 * 60 });
    expect(clockSpan(40, 8)).toEqual({ week: 0, weekday: 4, endMinutes: 17 * 60 });
    expect(clockSpan(7.6 * 3, 7.6)).toEqual({ week: 0, weekday: 2, endMinutes: 540 + 456 });
  });

  it('rolls over into later weeks of five working days', () => {
    expect(clockSpan(41, 8)).toEqual({ week: 1, weekday: 0, endMinutes: 10 * 60 });
    // 132 hours = 16.5 days: the 17th working day is Tuesday of week 4.
    expect(clockSpan(132, 8)).toEqual({ week: 3, weekday: 1, endMinutes: 13 * 60 });
    expect(clockSpan(33, 7.5)).toEqual({ week: 0, weekday: 4, endMinutes: 12 * 60 });
  });

  it('counts at least one minute', () => {
    expect(clockSpan(0.001, 8)).toEqual({ week: 0, weekday: 0, endMinutes: 541 });
  });

  it('is null for nothing, bad input or a day that cannot end before midnight', () => {
    expect(clockSpan(0, 8)).toBeNull();
    expect(clockSpan(-1, 8)).toBeNull();
    expect(clockSpan(Number.NaN, 8)).toBeNull();
    expect(clockSpan(10, 0)).toBeNull();
    expect(clockSpan(10, 14.5)).not.toBeNull();
    expect(clockSpan(10, 15)).toBeNull();
    expect(clockSpan(10, 24)).toBeNull();
  });
});

describe('habit', () => {
  it('counts the times a year per frequency', () => {
    expect(timesPerYear('workday', 22)).toBe(264);
    expect(timesPerYear('workday', 21)).toBe(252);
    expect(timesPerYear('day', 22)).toBe(365);
    expect(timesPerYear('week', 22)).toBe(52);
    expect(timesPerYear('month', 22)).toBe(12);
    expect(FREQUENCIES).toEqual(['workday', 'day', 'week', 'month']);
  });

  it('adds a coffee every working day up to a year', () => {
    const h = habit(70, 'workday', pay());
    expect(h.times).toBe(264);
    expect(h.perYear).toBe(18_480);
    expect(h.perMonth).toBe(1_540);
    expect(h.hours).toBeCloseTo(73.92, 10);
    expect(splitWorkTime(h.hours!, 8)).toEqual({ days: 9, hours: 1, minutes: 55 });
  });

  it('handles weekly, monthly and daily costs', () => {
    expect(habit(1_000, 'week', pay()).perYear).toBe(52_000);
    expect(habit(300, 'month', pay()).perYear).toBe(3_600);
    expect(habit(10, 'day', pay()).perYear).toBe(3_650);
    expect(habit(300, 'month', pay()).hours).toBeCloseTo(14.4, 10);
  });

  it('survives bad input', () => {
    expect(habit(Number.NaN, 'week', pay())).toMatchObject({ perYear: 0, hours: 0 });
    expect(habit(-5, 'week', pay()).perYear).toBe(0);
    expect(habit(70, 'workday', pay({ pay: 0 })).hours).toBeNull();
  });
});

describe('dayGrid', () => {
  it('fills part of one month for a small purchase', () => {
    expect(dayGrid(0.75, 22)).toEqual({ cells: 22, blocks: [16.5], overflow: false });
    expect(dayGrid(0, 22)).toEqual({ cells: 22, blocks: [0], overflow: false });
    expect(dayGrid(1, 22)).toEqual({ cells: 22, blocks: [22], overflow: false });
  });

  it('adds a block per month and stops at twelve', () => {
    expect(dayGrid(2.5, 20)).toEqual({ cells: 20, blocks: [20, 20, 10], overflow: false });
    const big = dayGrid(30, 20);
    expect(big.blocks).toHaveLength(12);
    expect(big.blocks.every((b) => b === 20)).toBe(true);
    expect(big.overflow).toBe(true);
    expect(dayGrid(12, 20).overflow).toBe(false);
  });

  it('draws a fixed year for habits', () => {
    const g = dayGrid(0.42, 22, 12);
    expect(g.blocks).toHaveLength(12);
    expect(g.blocks[0]).toBeCloseTo(9.24, 10);
    expect(g.blocks.slice(1).every((b) => b === 0)).toBe(true);
    expect(dayGrid(13, 22, 12).overflow).toBe(true);
  });

  it('rounds the squares to whole days and survives bad input', () => {
    expect(dayGrid(0.5, 21.5).cells).toBe(22);
    expect(dayGrid(0.5, 0).cells).toBe(1);
    expect(dayGrid(0.5, 99).cells).toBe(31);
    expect(dayGrid(Number.NaN, 22)).toEqual({ cells: 22, blocks: [0], overflow: false });
    expect(dayGrid(-2, 22).blocks).toEqual([0]);
    expect(dayGrid(Number.POSITIVE_INFINITY, 22).blocks).toEqual([0]);
  });
});

describe('money text', () => {
  it('drops decimals for whole and large prices', () => {
    expect(formatPrice(30_000, 'TWD', 'zh-TW')).toBe('NT$30,000');
    expect(formatPrice(18_480.4, 'TWD', 'zh-TW')).toBe('NT$18,480');
    expect(formatPrice(1_000, 'USD', 'en-US')).toBe('$1,000');
    expect(formatPrice(5, 'USD', 'en-US')).toBe('$5');
    expect(formatPrice(4.75, 'USD', 'en-US')).toBe('$4.75');
    expect(formatPrice(150_000, 'JPY', 'ja-JP')).toMatch(/150,000$/);
  });

  it('keeps the usual decimals for rates', () => {
    expect(formatRate(227.2727, 'TWD', 'zh-TW')).toBe('NT$227.27');
    expect(formatRate(30.303, 'USD', 'en-US')).toBe('$30.30');
    expect(formatRate(1785.714, 'JPY', 'ja-JP')).toMatch(/1,786$/);
  });

  it('shows a dash for non-numbers', () => {
    expect(formatPrice(Number.NaN, 'USD', 'en-US')).toBe('—');
    expect(formatRate(Number.POSITIVE_INFINITY, 'USD', 'en-US')).toBe('—');
  });
});

describe('normalizeSettings', () => {
  it('returns the defaults for junk', () => {
    expect(normalizeSettings(null, zh)).toEqual(zh);
    expect(normalizeSettings('nope', zh)).toEqual(zh);
    expect(normalizeSettings({ mode: 'weird', period: 'day', frequency: 'hourly', currency: 'XXX' }, zh)).toEqual(zh);
    expect(normalizeSettings(null, zh)).not.toBe(zh);
  });

  it('accepts numbers typed as text and clamps them', () => {
    const s = normalizeSettings({ pay: '52000', workDays: '40', hoursPerDay: '0', price: '-9', amount: '1e15' }, zh);
    expect(s.pay).toBe(52_000);
    expect(s.workDays).toBe(31);
    expect(s.hoursPerDay).toBe(0.25);
    expect(s.price).toBe(0);
    expect(s.amount).toBe(1e12);
  });

  it('keeps the fallback for empty, non-numeric or boolean values', () => {
    const s = normalizeSettings({ pay: '', workDays: 'abc', hoursPerDay: null, price: true, amount: undefined }, zh);
    expect(s).toEqual(zh);
  });

  it('takes valid choices', () => {
    const s = normalizeSettings({ mode: 'habit', period: 'hour', frequency: 'week', currency: 'JPY' }, zh);
    expect(s).toMatchObject({ mode: 'habit', period: 'hour', frequency: 'week', currency: 'JPY' });
  });

  it('payOf keeps only the pay side', () => {
    expect(payOf(zh)).toEqual({ currency: 'TWD', pay: 40_000, period: 'month', workDays: 22, hoursPerDay: 8 });
  });
});

describe('share links', () => {
  it('round-trips every field', () => {
    const s: Settings = {
      currency: 'USD',
      pay: 72_500.5,
      period: 'year',
      workDays: 21.67,
      hoursPerDay: 7.5,
      mode: 'habit',
      price: 1_299.99,
      amount: 4.75,
      frequency: 'week',
    };
    expect(normalizeSettings(decodeShare(encodeShare(s)), zh)).toEqual(s);
    expect(normalizeSettings(decodeShare(`#${encodeShare(s)}`), zh)).toEqual(s);
    for (const locale of ['zh-TW', 'en', 'ja'] as const) {
      const d = DEFAULTS[locale];
      expect(normalizeSettings(decodeShare(`#${encodeShare(d)}`), zh)).toEqual(d);
    }
  });

  it('writes a short readable hash', () => {
    expect(encodeShare(zh)).toBe('m=once&p=30000&a=70&f=workday&pay=40000&per=month&cur=TWD&d=22&h=8');
  });

  it('reads a partial link over the defaults', () => {
    expect(decodeShare('#p=1234')).toEqual({ price: '1234' });
    expect(normalizeSettings(decodeShare('#p=1234'), zh)).toEqual({ ...zh, price: 1234 });
  });

  it('ignores hashes that are not share links', () => {
    expect(decodeShare('')).toBeNull();
    expect(decodeShare('#')).toBeNull();
    expect(decodeShare('#faq')).toBeNull();
    expect(decodeShare('#m=habit')).toBeNull();
    expect(decodeShare('#p=')).toBeNull();
  });

  it('never trusts the values', () => {
    const raw = decodeShare('#m=<script>&p=abc&a=-5&f=yearly&pay=1e99&per=decade&cur=BTC&d=0&h=99');
    expect(raw).not.toBeNull();
    const s = normalizeSettings(raw, zh);
    expect(s).toEqual({ ...zh, amount: 0, pay: 1e12, workDays: 1, hoursPerDay: 24 });
  });

  it('does not throw on odd input', () => {
    expect(() => decodeShare('#%E0%A4%A')).not.toThrow();
    expect(() => decodeShare(undefined as unknown as string)).not.toThrow();
  });
});

describe('examples', () => {
  it('has a price for every example in the three default currencies', () => {
    for (const currency of ['TWD', 'USD', 'JPY']) {
      const list = examplesFor(currency);
      expect(list.map((e) => e.id)).toEqual(EXAMPLE_IDS);
      for (const e of list) {
        expect(e.price).toBe(EXAMPLE_PRICES[currency][e.id]);
        expect(e.price).toBeGreaterThan(0);
        expect(e.mode === 'habit').toBe(e.frequency !== undefined);
      }
    }
  });

  it('has none for other currencies', () => {
    expect(examplesFor('EUR')).toEqual([]);
  });

  it('builds the button text from the page templates', () => {
    const text = {
      example: { once: '{name} {price}', habit: '{name} {price} {freq} [{often}]' },
      exampleNames: Object.fromEntries(EXAMPLE_IDS.map((id) => [id, id.toUpperCase()])) as Record<(typeof EXAMPLE_IDS)[number], string>,
      freqPhrase: { workday: 'every workday', day: 'every day', week: 'every week', month: 'every month' },
      frequencies: { workday: 'Workdays', day: 'Daily', week: 'Weekly', month: 'Monthly' },
    };
    const list = examplesFor('USD');
    expect(exampleLabel(list[0], 'USD', 'en-US', text)).toBe('PHONE $1,000');
    expect(exampleLabel(list.find((e) => e.id === 'coffee')!, 'USD', 'en-US', text)).toBe('COFFEE $5 every workday [Workdays]');
    expect(exampleLabel(list.find((e) => e.id === 'gym')!, 'USD', 'en-US', text)).toBe('GYM $40 every month [Monthly]');
  });

  it('marks the example that equals the current inputs', () => {
    const [phone, laptop] = examplesFor('TWD');
    const coffee = examplesFor('TWD').find((e) => e.id === 'coffee')!;
    expect(matchesExample(zh, phone)).toBe(true);
    expect(matchesExample(zh, laptop)).toBe(false);
    expect(matchesExample(zh, coffee)).toBe(false);
    expect(matchesExample({ ...zh, mode: 'habit' }, coffee)).toBe(true);
    expect(matchesExample({ ...zh, mode: 'habit', frequency: 'day' }, coffee)).toBe(false);
  });
});

describe('defaults', () => {
  it('reuse the pay defaults of salary-per-second', () => {
    expect(DEFAULTS['zh-TW']).toMatchObject({ currency: 'TWD', pay: 40_000, period: 'month', workDays: 22, hoursPerDay: 8 });
    expect(DEFAULTS.en).toMatchObject({ currency: 'USD', pay: 60_000, period: 'year', workDays: 22, hoursPerDay: 7.5 });
    expect(DEFAULTS.ja).toMatchObject({ currency: 'JPY', pay: 300_000, period: 'month', workDays: 21, hoursPerDay: 8 });
  });

  it('give round results for the default phone', () => {
    const cases = [
      ['zh-TW', 132, { days: 16, hours: 4, minutes: 0 }, 0.75],
      ['en', 33, { days: 4, hours: 3, minutes: 0 }, 0.2],
      ['ja', 84, { days: 10, hours: 4, minutes: 0 }, 0.5],
    ] as const;
    for (const [locale, hours, split, share] of cases) {
      const d = DEFAULTS[locale];
      const h = workHours(d.price, hourlyRate(d))!;
      expect(h).toBeCloseTo(hours, 9);
      expect(splitWorkTime(h, d.hoursPerDay)).toEqual(split);
      expect(monthShare(h, d)).toBeCloseTo(share, 9);
    }
  });
});

// 要上班多久才買得起: turns a price into working time at your own hourly pay.
// Pure functions only. Pay periods, currencies and per-locale pay defaults come from the sibling tool salary-per-second.
import {
  CURRENCIES,
  DEFAULTS as PAY_DEFAULTS,
  buildShift,
  paidMinutes,
  type PayPeriod,
} from '../salary-per-second/logic';

export { CURRENCIES, type PayPeriod };

export type Mode = 'once' | 'habit';
/** How often a recurring cost comes back. "workday" = every working day (working days per month × 12 a year). */
export type Frequency = 'workday' | 'day' | 'week' | 'month';

export const MODES: readonly Mode[] = ['once', 'habit'];
export const PERIODS: readonly PayPeriod[] = ['month', 'year', 'hour'];
export const FREQUENCIES: readonly Frequency[] = ['workday', 'day', 'week', 'month'];

/** The pay side: what the visitor earns and how much paid time that covers. Remembered in the browser. */
export interface Pay {
  /** ISO 4217 code. */
  currency: string;
  /** Pay amount for `period`, before tax. */
  pay: number;
  period: PayPeriod;
  /** Working days per month and paid hours per day: turn monthly or yearly pay into an hourly rate. */
  workDays: number;
  hoursPerDay: number;
}

export interface Settings extends Pay {
  mode: Mode;
  /** One-off price. */
  price: number;
  /** Recurring cost, paid once per `frequency`. */
  amount: number;
  frequency: Frequency;
}

export const LIMITS = {
  pay: [0, 1e12],
  workDays: [1, 31],
  hoursPerDay: [0.25, 24],
  price: [0, 1e12],
  amount: [0, 1e12],
} as const;

/* ---------- Settings ---------- */

function num(value: unknown, [min, max]: readonly [number, number], fallback: number): number {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function isPeriod(value: unknown): value is PayPeriod {
  return value === 'month' || value === 'year' || value === 'hour';
}

/** Coerces stored, shared or typed values into valid settings, falling back to `defaults` field by field. */
export function normalizeSettings(raw: unknown, defaults: Settings): Settings {
  const out = { ...defaults };
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.currency === 'string' && (CURRENCIES as readonly string[]).includes(r.currency)) out.currency = r.currency;
  if (isPeriod(r.period)) out.period = r.period;
  if ((MODES as readonly unknown[]).includes(r.mode)) out.mode = r.mode as Mode;
  if ((FREQUENCIES as readonly unknown[]).includes(r.frequency)) out.frequency = r.frequency as Frequency;
  for (const key of ['pay', 'workDays', 'hoursPerDay', 'price', 'amount'] as const) out[key] = num(r[key], LIMITS[key], out[key]);
  return out;
}

/** The part of the settings that is remembered between visits. */
export function payOf(s: Settings): Pay {
  return { currency: s.currency, pay: s.pay, period: s.period, workDays: s.workDays, hoursPerDay: s.hoursPerDay };
}

/* ---------- Pay → hourly rate ---------- */

/** Paid hours in a month: working days × paid hours per day. */
export function monthlyHours(p: Pick<Pay, 'workDays' | 'hoursPerDay'>): number {
  return p.workDays * p.hoursPerDay;
}

/** Hourly pay: monthly pay ÷ (days × hours); yearly pay is divided by 12 first; hourly pay is used as it is. */
export function hourlyRate(p: Pick<Pay, 'pay' | 'period' | 'workDays' | 'hoursPerDay'>): number {
  if (!(p.pay > 0)) return 0;
  if (p.period === 'hour') return p.pay;
  const hours = monthlyHours(p);
  if (!(hours > 0)) return 0;
  return (p.period === 'year' ? p.pay / 12 : p.pay) / hours;
}

/** A month's pay at these settings (for hourly pay: wage × hours in a month). */
export function monthlyPay(p: Pick<Pay, 'pay' | 'period' | 'workDays' | 'hoursPerDay'>): number {
  return hourlyRate(p) * monthlyHours(p);
}

/* ---------- Price → working time ---------- */

/** Paid hours it takes to earn `price`; null without a usable hourly rate. */
export function workHours(price: number, hourly: number): number | null {
  if (!(hourly > 0) || !Number.isFinite(price) || price < 0) return null;
  return price / hourly;
}

export interface WorkTime {
  /** Whole working days of `hoursPerDay` hours. */
  days: number;
  /** Whole hours on top of the days. */
  hours: number;
  /** Minutes on top of the hours, rounded to the nearest minute. */
  minutes: number;
}

/** 22.5 hours at 8 hours a day → 2 days, 6 hours, 30 minutes. Rounds to the minute first, so 59.7 minutes carries over. */
export function splitWorkTime(hours: number, hoursPerDay: number): WorkTime {
  if (!(hours > 0) || !(hoursPerDay > 0) || !Number.isFinite(hours)) return { days: 0, hours: 0, minutes: 0 };
  const total = Math.round(hours * 60);
  const perDay = hoursPerDay * 60;
  // The epsilon keeps 3 × 7.6 hours from landing a hair under three days.
  const days = Math.floor(total / perDay + 1e-9);
  const rest = Math.max(0, Math.round(total - days * perDay));
  return { days, hours: Math.floor(rest / 60), minutes: rest % 60 };
}

/** Share of one month's pay (and of one month's working time), 0.75 = 75 %. */
export function monthShare(hours: number, p: Pick<Pay, 'workDays' | 'hoursPerDay'>): number {
  const perMonth = monthlyHours(p);
  return perMonth > 0 && hours > 0 ? hours / perMonth : 0;
}

/** The clock for the "from Monday morning until…" sentence starts here: 9:00, in minutes after midnight. */
export const CLOCK_START = 9 * 60;

export interface ClockSpan {
  /** 0 = the first week. Weeks have five working days, Monday to Friday. */
  week: number;
  /** 0 = Monday … 4 = Friday: the day the last hour is worked. */
  weekday: number;
  /** Time of day the work is done, in minutes after midnight. */
  endMinutes: number;
}

/**
 * Where you end up if you start on a Monday at 9:00 and work `hoursPerDay` paid hours in a row every weekday
 * (breaks are not counted). 22.5 hours at 8 a day → Wednesday of the first week, 15:30.
 * Null when there is nothing to work, or when a "day" is too long to end before midnight.
 */
export function clockSpan(hours: number, hoursPerDay: number, start = CLOCK_START): ClockSpan | null {
  if (!(hours > 0) || !Number.isFinite(hours) || !(hoursPerDay > 0)) return null;
  // A day that runs to midnight or beyond has no sensible "done by" time.
  if (start + hoursPerDay * 60 >= 1440) return null;
  const total = Math.max(1, Math.round(hours * 60));
  const perDay = hoursPerDay * 60;
  // A sum that ends exactly at the end of a day finishes on that day, not at 9:00 the next morning.
  const index = Math.max(0, Math.ceil(total / perDay - 1e-9) - 1);
  const onLastDay = Math.min(perDay, total - index * perDay);
  return { week: Math.floor(index / 5), weekday: index % 5, endMinutes: Math.round(start + onLastDay) };
}

/* ---------- Habit: a cost that comes back ---------- */

/** How many times a year a recurring cost is paid. */
export function timesPerYear(frequency: Frequency, workDays: number): number {
  switch (frequency) {
    case 'workday':
      return workDays * 12;
    case 'day':
      return 365;
    case 'week':
      return 52;
    default:
      return 12;
  }
}

export interface Habit {
  times: number;
  perYear: number;
  perMonth: number;
  /** Paid hours a year it takes to earn `perYear`; null without a usable hourly rate. */
  hours: number | null;
}

export function habit(amount: number, frequency: Frequency, p: Pay): Habit {
  const times = timesPerYear(frequency, p.workDays);
  const perYear = Math.max(0, Number.isFinite(amount) ? amount : 0) * times;
  return { times, perYear, perMonth: perYear / 12, hours: workHours(perYear, hourlyRate(p)) };
}

/* ---------- The picture: working days of a month, filled as far as the cost reaches ---------- */

export const MAX_BLOCKS = 12;

export interface DayGrid {
  /** Squares per month block (working days per month, rounded to a whole number). */
  cells: number;
  /** One entry per month block: how many of its squares are filled (may be fractional, 0…cells). */
  blocks: number[];
  /** True when the cost needs more months than the picture shows. */
  overflow: boolean;
}

/**
 * `months` = working time needed, in months of pay. A one-off purchase shows as many blocks as it needs
 * (at least one, at most `max`); pass `fixed` to always draw that many (a year for habits).
 */
export function dayGrid(months: number, workDays: number, fixed?: number, max = MAX_BLOCKS): DayGrid {
  const cells = Math.min(31, Math.max(1, Math.round(workDays)));
  const need = Number.isFinite(months) && months > 0 ? months : 0;
  const count = fixed ?? Math.min(max, Math.max(1, Math.ceil(need - 1e-9)));
  const blocks = Array.from({ length: count }, (_, i) => Math.min(1, Math.max(0, need - i)) * cells);
  return { cells, blocks, overflow: need > count + 1e-9 };
}

/* ---------- Money text ---------- */

/** zh-TW writes TWD as a bare "$"; en-US writes "NT$" with the same digit grouping. */
function moneyTag(intlTag: string, currency: string): string {
  return intlTag === 'zh-TW' && currency === 'TWD' ? 'en-US' : intlTag;
}

/**
 * A price: whole amounts and amounts of 100 or more without decimals ("NT$30,000"),
 * small odd ones with the currency's usual decimals ("$4.75"). `intlTag` is the page locale's Intl tag.
 */
export function formatPrice(value: number, currency: string, intlTag: string): string {
  if (!Number.isFinite(value)) return '—';
  const whole = Number.isInteger(value) || Math.abs(value) >= 100;
  return new Intl.NumberFormat(moneyTag(intlTag, currency), {
    style: 'currency',
    currency,
    ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }).format(value);
}

/** A rate, always with the currency's usual decimals: "NT$227.27", "$30.30". */
export function formatRate(value: number, currency: string, intlTag: string): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(moneyTag(intlTag, currency), { style: 'currency', currency }).format(value);
}

/* ---------- Share links (#m=once&p=30000&a=70&f=workday&pay=40000&per=month&cur=TWD&d=22&h=8) ---------- */

export function encodeShare(s: Settings): string {
  const q = new URLSearchParams();
  q.set('m', s.mode);
  q.set('p', String(s.price));
  q.set('a', String(s.amount));
  q.set('f', s.frequency);
  q.set('pay', String(s.pay));
  q.set('per', s.period);
  q.set('cur', s.currency);
  q.set('d', String(s.workDays));
  q.set('h', String(s.hoursPerDay));
  return q.toString();
}

/** Reads a share hash. Returns only the fields it holds, or null when it is not a share link; never throws. */
export function decodeShare(hash: string): Partial<Record<keyof Settings, string>> | null {
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(String(hash).replace(/^[#?]/, ''));
  } catch {
    return null;
  }
  const keys: [string, keyof Settings][] = [
    ['m', 'mode'],
    ['p', 'price'],
    ['a', 'amount'],
    ['f', 'frequency'],
    ['pay', 'pay'],
    ['per', 'period'],
    ['cur', 'currency'],
    ['d', 'workDays'],
    ['h', 'hoursPerDay'],
  ];
  const out: Partial<Record<keyof Settings, string>> = {};
  for (const [param, key] of keys) {
    const value = q.get(param);
    if (value !== null && value.trim() !== '') out[key] = value.trim();
  }
  // A link must at least name a price, a recurring amount or a pay; anything else is some other hash.
  if (out.price === undefined && out.amount === undefined && out.pay === undefined) return null;
  return out;
}

/* ---------- One-tap examples ---------- */

export type ExampleId = 'phone' | 'laptop' | 'concert' | 'trip' | 'coffee' | 'lunch' | 'dinner' | 'streaming' | 'gym';

export interface Example {
  id: ExampleId;
  mode: Mode;
  /** Price (one-off) or amount per `frequency` (habit). */
  price: number;
  frequency?: Frequency;
}

type ExampleShape = { id: ExampleId; mode: Mode; frequency?: Frequency };

const EXAMPLE_SHAPES: readonly ExampleShape[] = [
  { id: 'phone', mode: 'once' },
  { id: 'laptop', mode: 'once' },
  { id: 'concert', mode: 'once' },
  { id: 'trip', mode: 'once' },
  { id: 'coffee', mode: 'habit', frequency: 'workday' },
  { id: 'lunch', mode: 'habit', frequency: 'workday' },
  { id: 'dinner', mode: 'habit', frequency: 'week' },
  { id: 'streaming', mode: 'habit', frequency: 'month' },
  { id: 'gym', mode: 'habit', frequency: 'month' },
];

export const EXAMPLE_IDS: readonly ExampleId[] = EXAMPLE_SHAPES.map((e) => e.id);

/** Round example prices to start from. They are not the price of any particular product. Only these currencies have examples. */
export const EXAMPLE_PRICES: Record<string, Record<ExampleId, number>> = {
  TWD: { phone: 30_000, laptop: 40_000, concert: 4_000, trip: 50_000, coffee: 70, lunch: 120, dinner: 1_000, streaming: 300, gym: 1_200 },
  USD: { phone: 1_000, laptop: 1_200, concert: 150, trip: 2_500, coffee: 5, lunch: 15, dinner: 60, streaming: 15, gym: 40 },
  JPY: { phone: 150_000, laptop: 180_000, concert: 12_000, trip: 200_000, coffee: 400, lunch: 1_000, dinner: 5_000, streaming: 1_500, gym: 8_000 },
};

/** Examples for a currency, in display order; empty when the currency has no price list. */
export function examplesFor(currency: string): Example[] {
  const prices = EXAMPLE_PRICES[currency];
  if (!prices) return [];
  return EXAMPLE_SHAPES.map((shape) => ({ ...shape, price: prices[shape.id] }));
}

/** Whether the current inputs are exactly this example (to mark its button as pressed). */
export function matchesExample(s: Settings, e: Example): boolean {
  if (s.mode !== e.mode) return false;
  return e.mode === 'once' ? s.price === e.price : s.amount === e.price && s.frequency === e.frequency;
}

/** The page's strings an example button is built from (see i18n.ts). */
export interface ExampleText {
  /** Per mode; placeholders {name}, {price}, {freq}, {often}. */
  example: Record<Mode, string>;
  exampleNames: Record<ExampleId, string>;
  freqPhrase: Record<Frequency, string>;
  frequencies: Record<Frequency, string>;
}

/** Text of an example button: "Phone $1,000", "Coffee $5 every workday". */
export function exampleLabel(e: Example, currency: string, intlTag: string, text: ExampleText): string {
  const vars: Record<string, string> = {
    name: text.exampleNames[e.id],
    price: formatPrice(e.price, currency, intlTag),
    freq: e.frequency ? text.freqPhrase[e.frequency] : '',
    often: e.frequency ? text.frequencies[e.frequency] : '',
  };
  return text.example[e.mode].replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/* ---------- Defaults ---------- */

type Locale = 'zh-TW' | 'en' | 'ja';

function defaultsFor(locale: Locale): Settings {
  const pay = PAY_DEFAULTS[locale];
  const prices = EXAMPLE_PRICES[pay.currency];
  return {
    currency: pay.currency,
    pay: pay.pay,
    period: pay.period,
    workDays: pay.workDays,
    // The paid hours of salary-per-second's default shift (8 for zh-TW and ja, 7.5 for en), so both tools show the same hourly rate.
    hoursPerDay: paidMinutes(buildShift(pay)) / 60,
    mode: 'once',
    price: prices.phone,
    amount: prices.coffee,
    frequency: 'workday',
  };
}

/** Starting values per locale: local currency, pay quoted the usual way there, a phone and a daily coffee as examples. */
export const DEFAULTS: Record<Locale, Settings> = {
  'zh-TW': defaultsFor('zh-TW'),
  en: defaultsFor('en'),
  ja: defaultsFor('ja'),
};

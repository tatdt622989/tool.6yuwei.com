// Pure parsing / period helpers for 統一發票中獎號碼. No imports, no DOM, no Node APIs:
// shared by logic.ts (browser) and scripts/update-invoice.mjs (Node 24 runs this file via type stripping),
// so keep it to erasable TypeScript syntax only (no enums, namespaces or parameter properties).

/** One 統一發票 period (two months) as stored in data.json. Dates are ISO yyyy-mm-dd (Asia/Taipei). */
export interface InvoicePeriod {
  /** '115-07-08' — ROC year, start month, end month. Sorts chronologically as a string. */
  period: string;
  /** '115年07-08月' */
  label: string;
  /** 開獎日: the 25th of the month after the period. */
  drawDate: string;
  /** 領獎期間 first day: the 6th of the month after the draw. */
  claimStart: string;
  /** 領獎期間 last day: three months later on the 5th, moved to the next workday when it falls on a weekend. */
  claimEnd: string;
  /** 特別獎（1,000 萬元）8 碼 */
  special: string;
  /** 特獎（200 萬元）8 碼 */
  grand: string;
  /** 頭獎（20 萬元）8 碼 ×3 */
  first: string[];
}

export class InvoiceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvoiceParseError';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** Year/month arithmetic on a 1-based month, returning a normalized { y, m }. */
function addMonths(y: number, m: number, delta: number): { y: number; m: number } {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

/** Day of week for a Gregorian date (0 = Sunday), timezone-independent. */
function weekday(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function periodKey(rocYear: number, startMonth: number): string {
  return `${rocYear}-${pad(startMonth)}-${pad(startMonth + 1)}`;
}

export function periodLabel(rocYear: number, startMonth: number): string {
  return `${rocYear}年${pad(startMonth)}-${pad(startMonth + 1)}月`;
}

/** Parse '115-07-08' back into its ROC year and start month. */
export function parsePeriodKey(key: string): { rocYear: number; startMonth: number } {
  const m = /^(\d{2,3})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) throw new InvoiceParseError(`Bad period key: ${key}`);
  const rocYear = Number(m[1]);
  const startMonth = Number(m[2]);
  if (startMonth % 2 !== 1 || startMonth > 11 || Number(m[3]) !== startMonth + 1) {
    throw new InvoiceParseError(`Bad period key: ${key}`);
  }
  return { rocYear, startMonth };
}

/**
 * Official schedule (統一發票給獎辦法): drawn on the 25th of the odd month after the period; prizes are claimable
 * from the 6th of the following month for three months, ending on the 5th. When the last day is a Saturday or
 * Sunday it moves to the next Monday (e.g. 115年03-04月 ends 115/9/7 because 9/5 is a Saturday). National
 * holidays are not modelled here — the updater prefers the dates printed on the official page.
 */
export function scheduleFor(rocYear: number, startMonth: number): Pick<InvoicePeriod, 'drawDate' | 'claimStart' | 'claimEnd'> {
  const year = rocYear + 1911;
  const draw = addMonths(year, startMonth, 2);
  const start = addMonths(draw.y, draw.m, 1);
  const end = addMonths(draw.y, draw.m, 4);
  const wd = weekday(end.y, end.m, 5);
  const endDay = 5 + (wd === 6 ? 2 : wd === 0 ? 1 : 0);
  return {
    drawDate: isoOf(draw.y, draw.m, 25),
    claimStart: isoOf(start.y, start.m, 6),
    claimEnd: isoOf(end.y, end.m, endDay),
  };
}

/** Convert full-width digits to ASCII. */
function normalizeDigits(text: string): string {
  return text.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

const PERIOD_RE = /(\d{2,3})\s*年\s*(\d{1,2})\s*[-~～－]\s*(\d{1,2})\s*月/;

function findPeriod(html: string): { rocYear: number; startMonth: number } {
  // invoice.etax.nat.gov.tw marks the current page in its sub-menu with class="etw-on";
  // the etax.nat.gov.tw archive pages put the period in <title>.
  const active = /<a\b[^>]*\bclass="[^"]*\betw-on\b[^"]*"[^>]*>([\s\S]*?)<\/a>/i.exec(html);
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html);
  for (const source of [active?.[0], title?.[1]]) {
    const m = source ? PERIOD_RE.exec(source) : null;
    if (!m) continue;
    const rocYear = Number(m[1]);
    const startMonth = Number(m[2]);
    if (startMonth % 2 !== 1 || startMonth > 11 || Number(m[3]) !== startMonth + 1) {
      throw new InvoiceParseError(`Unexpected period months: ${m[0]}`);
    }
    return { rocYear, startMonth };
  }
  throw new InvoiceParseError('Period label (e.g. 115年07-08月) not found');
}

/** Flatten the prize table into trimmed text lines, one per cell / paragraph / block. */
function tableLines(html: string): string[] {
  const tables = html.match(/<table\b[\s\S]*?<\/table>/gi) ?? [];
  const table = tables.find((t) => t.includes('特別獎'));
  if (!table) throw new InvoiceParseError('Prize table (特別獎) not found');
  return table
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/<(?:br|\/(?:td|th|p|div|tr|li|h\d))\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ''))
    .filter(Boolean);
}

const LABELS: Record<string, 'special' | 'grand' | 'first'> = { 特別獎: 'special', 特獎: 'grand', 頭獎: 'first' };

const CLAIM_RE = /領獎期間自(\d{2,3})年(\d{1,2})月(\d{1,2})日起至(\d{2,3})年(\d{1,2})月(\d{1,2})日止/;

/**
 * Parse a 中獎號碼單 page — https://invoice.etax.nat.gov.tw/index.html or lastNumber.html, or an archive page
 * https://www.etax.nat.gov.tw/etw-main/ETW183W2_<yyymm>/ — into one InvoicePeriod. Throws InvoiceParseError when
 * anything is missing or inconsistent, so a layout change never produces a half-parsed period.
 */
export function parseWinningPage(rawHtml: string): InvoicePeriod {
  const html = normalizeDigits(rawHtml);
  const { rocYear, startMonth } = findPeriod(html);

  const found: Record<'special' | 'grand' | 'first', string[]> = { special: [], grand: [], first: [] };
  let current: keyof typeof found | null = null;
  for (const line of tableLines(html)) {
    if (line in LABELS) current = LABELS[line];
    else if (/^\d{8}$/.test(line)) {
      if (current) found[current].push(line);
    } else if (/^(?:二|三|四|五|六|增開六)獎$/.test(line)) current = null;
  }
  if (found.special.length !== 1) throw new InvoiceParseError(`Expected 1 特別獎 number, got ${found.special.length}`);
  if (found.grand.length !== 1) throw new InvoiceParseError(`Expected 1 特獎 number, got ${found.grand.length}`);
  if (found.first.length !== 3) throw new InvoiceParseError(`Expected 3 頭獎 numbers, got ${found.first.length}`);

  const schedule = scheduleFor(rocYear, startMonth);
  const claim = CLAIM_RE.exec(html.replace(/\s+/g, ''));
  let { claimStart, claimEnd } = schedule;
  if (claim) {
    const [, y1, m1, d1, y2, m2, d2] = claim.map(Number);
    claimStart = isoOf(y1 + 1911, m1, d1);
    claimEnd = isoOf(y2 + 1911, m2, d2);
    // The printed window must belong to this period; otherwise we picked up the wrong period label.
    const slack = (Date.parse(claimEnd) - Date.parse(schedule.claimEnd)) / 86_400_000;
    if (claimStart !== schedule.claimStart || slack < -4 || slack > 7) {
      throw new InvoiceParseError(
        `領獎期間 ${claimStart}–${claimEnd} does not match period ${periodLabel(rocYear, startMonth)}`,
      );
    }
  }

  return {
    period: periodKey(rocYear, startMonth),
    label: periodLabel(rocYear, startMonth),
    drawDate: schedule.drawDate,
    claimStart,
    claimEnd,
    special: found.special[0],
    grand: found.grand[0],
    first: found.first,
  };
}

/** Structural check for one stored period (used by the updater before writing, and by tests on data.json). */
export function validatePeriod(p: InvoicePeriod): void {
  const { rocYear, startMonth } = parsePeriodKey(p.period);
  const eight = /^\d{8}$/;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const ok =
    p.label === periodLabel(rocYear, startMonth) &&
    p.drawDate === scheduleFor(rocYear, startMonth).drawDate &&
    iso.test(p.claimStart) &&
    iso.test(p.claimEnd) &&
    p.claimStart < p.claimEnd &&
    eight.test(p.special) &&
    eight.test(p.grand) &&
    p.first.length === 3 &&
    p.first.every((n) => eight.test(n));
  if (!ok) throw new InvoiceParseError(`Invalid period record: ${JSON.stringify(p)}`);
}

/** Chronological sort key for a period key ('115-07-08' → 11507). */
export function periodOrder(key: string): number {
  const { rocYear, startMonth } = parsePeriodKey(key);
  return rocYear * 100 + startMonth;
}

/** Merge newly parsed periods into the stored list: dedupe by period (incoming wins), newest first, keep `keep`. */
export function mergePeriods(existing: InvoicePeriod[], incoming: InvoicePeriod[], keep = 12): InvoicePeriod[] {
  const byKey = new Map(existing.map((p) => [p.period, p]));
  for (const p of incoming) byKey.set(p.period, p);
  return [...byKey.values()].sort((a, b) => periodOrder(b.period) - periodOrder(a.period)).slice(0, keep);
}

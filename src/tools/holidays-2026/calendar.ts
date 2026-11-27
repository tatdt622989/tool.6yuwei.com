// Shared engine for the yearly 行事曆 tools (holidays-2026, holidays-2027): days off, 連假, 請假攻略,
// countdown and month grids for one 政府行政機關辦公日曆表. Each tool keeps its own data object.
// Pure functions; "today" is always passed in.

import { addDays, fromDayNumber, toDayNumber, weekdayOf, type YMD } from '../date-diff/logic';

export type HolidayKind = 'holiday' | 'compensatory';

export interface Holiday {
  /** ISO date YYYY-MM-DD */
  date: string;
  name: string;
  /** holiday = 紀念日/節日當天放假；compensatory = 補假（節日逢週末，於前後上班日補假） */
  kind: HolidayKind;
}

export interface CalendarData {
  year: number;
  /** Every 放假日 of the year that is not an ordinary weekend day (weekend-dated holidays included). */
  holidays: readonly Holiday[];
  /** 補行上班日 (Saturdays that are workdays). */
  makeupWorkdays: readonly string[];
  /** Holidays early in the following year, so year-end bridges and the countdown can look past 12/31. */
  nextYear: readonly Holiday[];
  /** Official 全年放假日數 (weekends included), asserted by the tests. */
  totalDaysOff: number;
}

export interface Block {
  start: YMD;
  end: YMD;
  days: number;
  /** Names of the holidays inside, without 補假 entries. */
  names: string[];
}

export interface LongWeekend extends Block {
  label: string;
}

export interface BridgePlan {
  /** Workdays to take as leave, in date order. */
  leave: YMD[];
  start: YMD;
  end: YMD;
  days: number;
  /** The holiday break(s) this plan extends. */
  label: string;
  /** True when leave is taken on both sides of the holiday. */
  bothSides: boolean;
}

export interface NextHoliday {
  holiday: Holiday;
  /** Days from today; 0 = today. */
  daysUntil: number;
}

export interface CalendarCell {
  d: number;
  weekday: number;
  off: boolean;
  holiday?: Holiday;
}

export const iso = (d: YMD): string => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;

export const parseIso = (s: string): YMD => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
};

/** Short label for a break, e.g. 「春節」「兒童節及清明節」. */
export function blockLabel(names: string[]): string {
  const short = names.map((n) =>
    n
      .replace(/（.*?）/g, '')
      .replace('民族掃墓節', '清明節')
      .replace('臺灣光復暨金門古寧頭大捷紀念日', '光復節')
      .replace(/^(小年夜|除夕)$/, '春節'),
  );
  return [...new Set(short)].join('及');
}

export class HolidayCalendar {
  readonly year: number;
  private readonly map: Map<string, Holiday>;
  private readonly makeup: Set<string>;

  constructor(readonly data: CalendarData) {
    this.year = data.year;
    this.map = new Map([...data.holidays, ...data.nextYear].map((h) => [h.date, h]));
    this.makeup = new Set(data.makeupWorkdays);
  }

  holidayOn(date: YMD): Holiday | undefined {
    return this.map.get(iso(date));
  }

  isMakeupWorkday(date: YMD): boolean {
    return this.makeup.has(iso(date));
  }

  /** A day off for 公務人員: weekend or holiday, unless it is a 補班 day. */
  isDayOff(date: YMD): boolean {
    if (this.makeup.has(iso(date))) return false;
    const w = weekdayOf(date);
    return w === 0 || w === 6 || this.map.has(iso(date));
  }

  /** Maximal runs of consecutive days off between two dates (inclusive). */
  offBlocks(from: YMD, to: YMD): Block[] {
    const blocks: Block[] = [];
    let current: Block | null = null;
    for (let n = toDayNumber(from); n <= toDayNumber(to); n++) {
      const date = fromDayNumber(n);
      if (this.isDayOff(date)) {
        const h = this.holidayOn(date);
        current ??= { start: date, end: date, days: 0, names: [] };
        current.end = date;
        current.days++;
        if (h?.kind === 'holiday' && !current.names.includes(h.name)) current.names.push(h.name);
      } else if (current) {
        blocks.push(current);
        current = null;
      }
    }
    if (current) blocks.push(current);
    return blocks;
  }

  /** Blocks around the whole year, a little into the neighbouring years so edge breaks are complete. */
  private yearBlocks(): Block[] {
    return this.offBlocks({ y: this.year - 1, m: 12, d: 20 }, { y: this.year + 1, m: 1, d: 10 });
  }

  /** 3 日以上連續假期 starting in the year and containing at least one holiday. */
  longWeekends(): LongWeekend[] {
    return this.yearBlocks()
      .filter((b) => b.start.y === this.year && b.days >= 3 && b.names.length > 0)
      .map((b) => ({ ...b, label: blockLabel(b.names) }));
  }

  countDaysOff(): number {
    let count = 0;
    for (let n = toDayNumber({ y: this.year, m: 1, d: 1 }); n <= toDayNumber({ y: this.year, m: 12, d: 31 }); n++) {
      if (this.isDayOff(fromDayNumber(n))) count++;
    }
    return count;
  }

  /**
   * 請假攻略: for each holiday break, take 1–maxLeave consecutive workdays right before or right after it so it
   * joins the neighbouring run of days off; and, when both gaps together are at most maxBoth days, both at once.
   * Only plans whose leave days all fall inside the year are kept. Sorted by first leave day.
   */
  bridgePlans(maxLeave = 4, maxBoth = 5): BridgePlan[] {
    const blocks = this.yearBlocks();
    const plans: BridgePlan[] = [];
    const make = (first: Block, last: Block, leave: YMD[], labelled: Block[], bothSides: boolean): BridgePlan => ({
      leave,
      start: first.start,
      end: last.end,
      days: toDayNumber(last.end) - toDayNumber(first.start) + 1,
      label: [...new Set(labelled.filter((x) => x.names.length).map((x) => blockLabel(x.names)))].join('＋'),
      bothSides,
    });
    const between = (a: Block, b: Block) => {
      const gap = toDayNumber(b.start) - toDayNumber(a.end) - 1;
      return Array.from({ length: gap }, (_, k) => addDays(a.end, k + 1));
    };

    blocks.forEach((hb, i) => {
      if (hb.names.length === 0) return;
      const prev = blocks[i - 1];
      const next = blocks[i + 1];
      const before = prev ? between(prev, hb) : [];
      const after = next ? between(hb, next) : [];
      // A gap between two holiday breaks is listed once, from the earlier break.
      if (prev && before.length <= maxLeave && prev.names.length === 0) plans.push(make(prev, hb, before, [hb], false));
      if (next && after.length <= maxLeave) plans.push(make(hb, next, after, [hb, next], false));
      if (prev && next && before.length + after.length <= maxBoth) {
        plans.push(make(prev, next, [...before, ...after], [prev, hb, next], true));
      }
    });
    return plans
      .filter((p) => p.leave.length > 0 && p.leave.every((d) => d.y === this.year))
      .sort((x, y) => toDayNumber(x.leave[0]) - toDayNumber(y.leave[0]) || x.leave.length - y.leave.length);
  }

  /** The next holiday (not 補假) on or after today, looking into the next year's listed holidays too. */
  nextHoliday(today: YMD): NextHoliday | null {
    const t = toDayNumber(today);
    for (const h of [...this.data.holidays, ...this.data.nextYear]) {
      if (h.kind !== 'holiday') continue;
      const n = toDayNumber(parseIso(h.date));
      if (n >= t) return { holiday: h, daysUntil: n - t };
    }
    return null;
  }

  /** The next 3+ day break that has not ended yet (the current one when today is inside it). */
  nextLongWeekend(today: YMD): { block: LongWeekend; daysUntil: number; ongoing: boolean } | null {
    const t = toDayNumber(today);
    for (const block of this.longWeekends()) {
      if (toDayNumber(block.end) < t) continue;
      const s = toDayNumber(block.start);
      return { block, daysUntil: Math.max(0, s - t), ongoing: s <= t };
    }
    return null;
  }

  /** Days off from today (inclusive) to the end of the year; the whole year before it starts, 0 after it ends. */
  daysOffLeft(today: YMD): number {
    if (today.y > this.year) return 0;
    const start = today.y < this.year ? toDayNumber({ y: this.year, m: 1, d: 1 }) : toDayNumber(today);
    let left = 0;
    for (let n = start; n <= toDayNumber({ y: this.year, m: 12, d: 31 }); n++) if (this.isDayOff(fromDayNumber(n))) left++;
    return left;
  }

  /** Month grid: leading nulls for the days before the 1st (weeks start on Sunday). */
  monthGrid(month: number): (CalendarCell | null)[] {
    const first = { y: this.year, m: month, d: 1 };
    const cells: (CalendarCell | null)[] = Array.from({ length: weekdayOf(first) }, () => null);
    for (let date = first; date.m === month; date = addDays(date, 1)) {
      cells.push({ d: date.d, weekday: weekdayOf(date), off: this.isDayOff(date), holiday: this.holidayOn(date) });
    }
    return cells;
  }

  monthStats(month: number): { off: number; work: number } {
    const cells = this.monthGrid(month).filter((c): c is CalendarCell => c !== null);
    const off = cells.filter((c) => c.off).length;
    return { off, work: cells.length - off };
  }
}

// 日本の祝日エンジン (shared by japan-holidays-2026 and japan-holidays-2027). Pure functions; "today" is passed in.
//
// Rules follow 「国民の祝日に関する法律」（祝日法）as in force since 2020 (天皇誕生日 2/23, スポーツの日):
// - 第2条: 元日 1/1, 成人の日 1月第2月曜, 建国記念の日 2/11, 天皇誕生日 2/23, 春分の日（春分日）, 昭和の日 4/29,
//   憲法記念日 5/3, みどりの日 5/4, こどもの日 5/5, 海の日 7月第3月曜, 山の日 8/11, 敬老の日 9月第3月曜,
//   秋分の日（秋分日）, スポーツの日 10月第2月曜, 文化の日 11/3, 勤労感謝の日 11/23.
// - 第3条第2項（振替休日）:「国民の祝日」が日曜日に当たるときは、その日後においてその日に最も近い「国民の祝日」でない日を休日とする。
// - 第3条第3項（国民の休日）: その前日及び翌日が「国民の祝日」である日（「国民の祝日」でない日に限る。）は、休日とする。
// 春分日・秋分日は法律では決まらず、国立天文台が前年2月1日の官報で公表する「暦要項」で確定する。
// Sources: 内閣府「国民の祝日について」https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html (2026・2027 lists, checked 2026-10-29)
//          国立天文台 暦要項 https://eco.mtk.nao.ac.jp/koyomi/yoko/ (2026: 春分 3/20・秋分 9/23; 2027: 春分 3/21・秋分 9/23,
//          令和8年2月2日発表)
// 年末年始 12/29–1/3 is not a 国民の祝日 (except 元日); it is 「行政機関の休日に関する法律」第1条 for government offices,
// and a custom (就業規則) for private companies.

import { addDays, fromDayNumber, toDayNumber, weekdayOf, type YMD } from '../date-diff/logic';

export type JaHolidayKind = 'national' | 'substitute' | 'citizens';

export interface JaHoliday {
  /** ISO YYYY-MM-DD */
  date: string;
  name: string;
  /** national = 国民の祝日, substitute = 振替休日（第3条第2項）, citizens = 国民の休日（第3条第3項） */
  kind: JaHolidayKind;
}

export interface Equinox {
  /** 春分の日（3月の日） */
  spring: number;
  /** 秋分の日（9月の日） */
  autumn: number;
}

export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const iso = (d: YMD): string => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;

export const parseIso = (s: string): YMD => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
};

/** The n-th Monday of a month (ハッピーマンデー). */
export function nthMonday(y: number, m: number, n: number): YMD {
  const first = { y, m, d: 1 };
  const offset = (8 - weekdayOf(first)) % 7; // days from the 1st to the first Monday
  return { y, m, d: 1 + offset + (n - 1) * 7 };
}

/** The 16 国民の祝日 of a year (current law), sorted by date. */
export function nationalHolidays(year: number, eq: Equinox): JaHoliday[] {
  const fixed = (m: number, d: number, name: string): JaHoliday => ({ date: iso({ y: year, m, d }), name, kind: 'national' });
  const monday = (m: number, n: number, name: string): JaHoliday => ({ date: iso(nthMonday(year, m, n)), name, kind: 'national' });
  return [
    fixed(1, 1, '元日'),
    monday(1, 2, '成人の日'),
    fixed(2, 11, '建国記念の日'),
    fixed(2, 23, '天皇誕生日'),
    fixed(3, eq.spring, '春分の日'),
    fixed(4, 29, '昭和の日'),
    fixed(5, 3, '憲法記念日'),
    fixed(5, 4, 'みどりの日'),
    fixed(5, 5, 'こどもの日'),
    monday(7, 3, '海の日'),
    fixed(8, 11, '山の日'),
    monday(9, 3, '敬老の日'),
    fixed(9, eq.autumn, '秋分の日'),
    monday(10, 2, 'スポーツの日'),
    fixed(11, 3, '文化の日'),
    fixed(11, 23, '勤労感謝の日'),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

/** 国民の祝日 plus 振替休日 and 国民の休日 (祝日法第3条), sorted by date. */
export function holidaysOf(year: number, eq: Equinox): JaHoliday[] {
  const national = nationalHolidays(year, eq);
  const isNational = new Set(national.map((h) => h.date));
  const extra: JaHoliday[] = [];

  // 第3条第2項: a 祝日 on Sunday moves the day off to the nearest following day that is not a 祝日.
  for (const h of national) {
    const d = parseIso(h.date);
    if (weekdayOf(d) !== 0) continue;
    let next = addDays(d, 1);
    while (isNational.has(iso(next))) next = addDays(next, 1);
    extra.push({ date: iso(next), name: '振替休日', kind: 'substitute' });
  }

  // 第3条第3項: a non-祝日 between two 祝日.
  const taken = new Set(extra.map((h) => h.date));
  for (const h of national) {
    const mid = addDays(parseIso(h.date), 1);
    const after = addDays(mid, 1);
    if (!isNational.has(iso(mid)) && isNational.has(iso(after)) && !taken.has(iso(mid))) {
      extra.push({ date: iso(mid), name: '国民の休日', kind: 'citizens' });
    }
  }

  return [...national, ...extra].filter((h) => h.date.startsWith(`${year}-`)).sort((a, b) => a.date.localeCompare(b.date));
}

/* ---------- calendar ---------- */

export interface HolidayYearData {
  year: number;
  holidays: readonly JaHoliday[];
  /** Holidays early in the following year, so the countdown and year-end blocks can look past 12/31. */
  nextYear: readonly JaHoliday[];
  /** Holidays late in the previous year (for the 年末年始 block that starts the year). */
  prevYear: readonly JaHoliday[];
}

export interface Block {
  start: YMD;
  end: YMD;
  days: number;
  /** 国民の祝日 names inside (振替休日・国民の休日 excluded). */
  names: string[];
}

export interface LongWeekend extends Block {
  label: string;
}

export interface LeavePlan {
  /** Weekdays to take off (有給休暇), in date order. */
  leave: YMD[];
  start: YMD;
  end: YMD;
  days: number;
  label: string;
}

export interface CalendarCell {
  d: number;
  weekday: number;
  holiday?: JaHoliday;
}

/** 「ゴールデンウィーク」「シルバーウィーク」 or 「成人の日の3連休」. */
export function blockLabel(block: Block): string {
  const n = block.names;
  if (n.some((x) => x === '憲法記念日' || x === 'こどもの日')) return 'ゴールデンウィーク';
  if (n.includes('敬老の日') && n.includes('秋分の日')) return 'シルバーウィーク';
  return `${n.join('・')}の${block.days}連休`;
}

export class JapanHolidayCalendar {
  readonly year: number;
  private readonly map: Map<string, JaHoliday>;

  constructor(readonly data: HolidayYearData) {
    this.year = data.year;
    this.map = new Map([...data.prevYear, ...data.holidays, ...data.nextYear].map((h) => [h.date, h]));
  }

  holidayOn(date: YMD): JaHoliday | undefined {
    return this.map.get(iso(date));
  }

  /** 土日・祝日・休日 (the usual 土日祝休み calendar). */
  isDayOff(date: YMD): boolean {
    const w = weekdayOf(date);
    return w === 0 || w === 6 || this.map.has(iso(date));
  }

  /** 年末年始 12/29–1/3 (行政機関の休日) on top of the normal days off. */
  isDayOffWithNewYear(date: YMD): boolean {
    return this.isDayOff(date) || (date.m === 12 && date.d >= 29) || (date.m === 1 && date.d <= 3);
  }

  /** Maximal runs of consecutive days off between two dates (inclusive). */
  offBlocks(from: YMD, to: YMD, isOff: (d: YMD) => boolean = (d) => this.isDayOff(d)): Block[] {
    const blocks: Block[] = [];
    let current: Block | null = null;
    for (let n = toDayNumber(from); n <= toDayNumber(to); n++) {
      const date = fromDayNumber(n);
      if (isOff(date)) {
        const h = this.holidayOn(date);
        current ??= { start: date, end: date, days: 0, names: [] };
        current.end = date;
        current.days++;
        if (h?.kind === 'national' && !current.names.includes(h.name)) current.names.push(h.name);
      } else if (current) {
        blocks.push(current);
        current = null;
      }
    }
    if (current) blocks.push(current);
    return blocks;
  }

  private yearBlocks(): Block[] {
    return this.offBlocks({ y: this.year, m: 1, d: 1 }, { y: this.year, m: 12, d: 28 });
  }

  /** 3日以上の連休 that contain at least one 祝日, starting in the year. */
  longWeekends(): LongWeekend[] {
    return this.yearBlocks()
      .filter((b) => b.days >= 3 && b.names.length > 0)
      .map((b) => ({ ...b, label: blockLabel(b) }));
  }

  /**
   * 年末年始 as government offices observe it (12/29–1/3) joined with adjacent weekends/holidays.
   * `which` = 'start' for the break that ends in early January of this year, 'end' for the one starting in late December.
   */
  newYearBreak(which: 'start' | 'end'): Block {
    const y = which === 'start' ? this.year - 1 : this.year;
    const blocks = this.offBlocks({ y, m: 12, d: 15 }, { y: y + 1, m: 1, d: 15 }, (d) => this.isDayOffWithNewYear(d));
    const anchor = toDayNumber({ y, m: 12, d: 31 });
    return blocks.find((b) => toDayNumber(b.start) <= anchor && toDayNumber(b.end) >= anchor)!;
  }

  /** Counts for the year: 祝日, 休日 (振替・国民の休日), weekday holidays, and total days off with weekends. */
  stats(): { national: number; extra: number; weekdayHolidays: number; daysOff: number } {
    const hs = this.data.holidays;
    let daysOff = 0;
    for (let n = toDayNumber({ y: this.year, m: 1, d: 1 }); n <= toDayNumber({ y: this.year, m: 12, d: 31 }); n++) {
      if (this.isDayOff(fromDayNumber(n))) daysOff++;
    }
    return {
      national: hs.filter((h) => h.kind === 'national').length,
      extra: hs.filter((h) => h.kind !== 'national').length,
      weekdayHolidays: hs.filter((h) => {
        const w = weekdayOf(parseIso(h.date));
        return w !== 0 && w !== 6;
      }).length,
      daysOff,
    };
  }

  /**
   * 有給休暇で作れる連休: take 1–maxLeave consecutive weekdays between a 祝日 block and the neighbouring days off.
   * Only plans whose leave days fall in the year and that reach at least `minDays` are kept.
   */
  leavePlans(maxLeave = 2, minDays = 5): LeavePlan[] {
    const blocks = this.offBlocks({ y: this.year - 1, m: 12, d: 25 }, { y: this.year, m: 12, d: 28 });
    const plans: LeavePlan[] = [];
    const gap = (a: Block, b: Block) =>
      Array.from({ length: toDayNumber(b.start) - toDayNumber(a.end) - 1 }, (_, k) => addDays(a.end, k + 1));
    const make = (first: Block, last: Block, leave: YMD[]): LeavePlan => {
      const names = [...new Set([first, last].flatMap((b) => b.names))];
      const span = { start: first.start, end: last.end, days: toDayNumber(last.end) - toDayNumber(first.start) + 1, names };
      return { leave, ...span, label: blockLabel(span).replace(/の\d+連休$/, '') };
    };
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = blocks[i];
      const b = blocks[i + 1];
      if (a.names.length === 0 && b.names.length === 0) continue;
      const leave = gap(a, b);
      if (leave.length === 0 || leave.length > maxLeave) continue;
      plans.push(make(a, b, leave));
    }
    return plans
      .filter((p) => p.days >= minDays && p.leave.every((d) => d.y === this.year))
      .sort((x, y) => toDayNumber(x.leave[0]) - toDayNumber(y.leave[0]));
  }

  /** The next 国民の祝日・休日 on or after today. */
  nextHoliday(today: YMD): { holiday: JaHoliday; daysUntil: number } | null {
    const t = toDayNumber(today);
    for (const h of [...this.data.holidays, ...this.data.nextYear]) {
      const n = toDayNumber(parseIso(h.date));
      if (n >= t) return { holiday: h, daysUntil: n - t };
    }
    return null;
  }

  /** The next 3+ day break not yet over (the current one when today is inside it). */
  nextLongWeekend(today: YMD): { block: LongWeekend; daysUntil: number; ongoing: boolean } | null {
    const t = toDayNumber(today);
    for (const block of this.longWeekends()) {
      if (toDayNumber(block.end) < t) continue;
      const s = toDayNumber(block.start);
      return { block, daysUntil: Math.max(0, s - t), ongoing: s <= t };
    }
    return null;
  }

  /** Remaining 祝日・休日 (not weekends) from today to 12/31. */
  holidaysLeft(today: YMD): number {
    const t = toDayNumber(today);
    return this.data.holidays.filter((h) => toDayNumber(parseIso(h.date)) >= t).length;
  }

  /** Month grid: leading nulls for the days before the 1st (weeks start on Sunday). */
  monthGrid(month: number): (CalendarCell | null)[] {
    const first = { y: this.year, m: month, d: 1 };
    const cells: (CalendarCell | null)[] = Array.from({ length: weekdayOf(first) }, () => null);
    for (let date = first; date.m === month; date = addDays(date, 1)) {
      cells.push({ d: date.d, weekday: weekdayOf(date), holiday: this.holidayOn(date) });
    }
    return cells;
  }
}

/** Builds the data for one year. January and December holidays do not depend on the equinoxes. */
export function buildYearData(year: number, eq: Equinox): HolidayYearData {
  const placeholder: Equinox = { spring: 20, autumn: 23 };
  return {
    year,
    holidays: holidaysOf(year, eq),
    nextYear: holidaysOf(year + 1, placeholder).filter((h) => h.date < `${year + 1}-02-01`),
    prevYear: holidaysOf(year - 1, placeholder).filter((h) => h.date >= `${year - 1}-12-01`),
  };
}

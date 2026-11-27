// 入学・卒業年度の計算（履歴書の学歴欄用）. Pure functions.
//
// Rules (checked 2026-11-10):
// - 学年は4月1日に始まり翌年3月31日に終わる（学校教育法施行規則第59条）。
// - 小学校は「満6歳に達した日の翌日以後における最初の学年の初め」から就学する（学校教育法第17条）。
//   年齢は誕生日の前日の終了時に加わる（年齢計算ニ関スル法律・民法第143条）ので、4月1日生まれは3月31日に満6歳となり、
//   翌日の4月1日に始まる学年に入る。したがって4月2日〜12月31日生まれは「生まれ年＋7」年の4月、
//   1月1日〜4月1日生まれ（早生まれ）は「生まれ年＋6」年の4月に入学する。
// - 修業年限: 小学校6年・中学校3年・高等学校3年（全日制）・大学4年（医・歯・薬・獣医は6年）・短期大学2年・
//   専門学校2年（学校により1〜4年）・大学院修士課程2年・高等専門学校5年。卒業は最終学年の3月。
// - 現在の6・3・3・4制は1947年4月に始まったため、1947年4月以降に小学校へ入学した人
//   （1940年4月2日以降生まれ）だけを対象にする。
// - 和暦は月の初日で判定する。改元は 1989-01-08 と 2019-05-01 なので、3月・4月の途中で元号が変わることはない
//   （2019年4月 = 平成31年4月、2020年3月 = 令和2年3月、1989年3月 = 平成元年3月）。

import { isValidYMD, type YMD } from '../date-diff/logic';
import { eraYearLabel, isHayaumare, toWareki } from '../wareki-converter/logic';

export type StageId = 'elementary' | 'juniorHigh' | 'high' | 'kosen' | 'university' | 'juniorCollege' | 'vocational' | 'graduate';

export interface Stage {
  id: StageId;
  /** Name as written in a 履歴書 (「高校」ではなく「高等学校」). */
  name: string;
  /** Standard length in years. */
  years: number;
  /** 「卒業」, or 「修了」 for 大学院. */
  endWord: '卒業' | '修了';
}

export const STAGES: Readonly<Record<StageId, Stage>> = {
  elementary: { id: 'elementary', name: '小学校', years: 6, endWord: '卒業' },
  juniorHigh: { id: 'juniorHigh', name: '中学校', years: 3, endWord: '卒業' },
  high: { id: 'high', name: '高等学校', years: 3, endWord: '卒業' },
  kosen: { id: 'kosen', name: '高等専門学校', years: 5, endWord: '卒業' },
  university: { id: 'university', name: '大学', years: 4, endWord: '卒業' },
  juniorCollege: { id: 'juniorCollege', name: '短期大学', years: 2, endWord: '卒業' },
  vocational: { id: 'vocational', name: '専門学校', years: 2, endWord: '卒業' },
  graduate: { id: 'graduate', name: '大学院 修士課程', years: 2, endWord: '修了' },
};

export type LastSchool = 'high' | 'university' | 'university6' | 'juniorCollege' | 'vocational' | 'graduate' | 'kosen';

export interface LastSchoolOption {
  id: LastSchool;
  /** Menu label. */
  label: string;
  /** Stages after 中学校, in order, with their length in years. */
  path: readonly { stage: StageId; years: number }[];
  /** Index in `path` of the school that 浪人 and 留年・休学 apply to. */
  target: number;
}

const step = (stage: StageId, years = STAGES[stage].years) => ({ stage, years });

export const LAST_SCHOOLS: readonly LastSchoolOption[] = [
  { id: 'university', label: '大学（4年）', path: [step('high'), step('university')], target: 1 },
  { id: 'juniorCollege', label: '短大（2年）', path: [step('high'), step('juniorCollege')], target: 1 },
  { id: 'vocational', label: '専門学校（2年）', path: [step('high'), step('vocational')], target: 1 },
  { id: 'graduate', label: '大学院 修士（大学4年＋2年）', path: [step('high'), step('university'), step('graduate')], target: 1 },
  { id: 'university6', label: '大学（6年制：医・歯・薬・獣医）', path: [step('high'), step('university', 6)], target: 1 },
  { id: 'kosen', label: '高専（5年・高校の代わり）', path: [step('kosen')], target: 0 },
  { id: 'high', label: '高校まで', path: [step('high')], target: 0 },
];

export const DEFAULT_LAST_SCHOOL: LastSchool = 'university';

export function findLastSchool(id: string): LastSchoolOption {
  return LAST_SCHOOLS.find((o) => o.id === id) ?? LAST_SCHOOLS.find((o) => o.id === DEFAULT_LAST_SCHOOL)!;
}

/** The school that 浪人 and 留年・休学 are applied to (大学院を選んだ場合は大学). */
export function targetStage(last: LastSchool | string): Stage {
  const option = findLastSchool(last);
  return STAGES[option.path[option.target].stage];
}

/** Earliest supported birth date: the first children of the 6・3・3 制 (小学校入学 1947年4月). */
export const MIN_BIRTH: YMD = { y: 1940, m: 4, d: 2 };
export const MAX_BIRTH_YEAR = 2100;
/** Upper limit for 浪人 and 留年・休学. */
export const MAX_EXTRA_YEARS = 5;

const key = (d: YMD) => d.y * 10_000 + d.m * 100 + d.d;

export function isSupportedBirth(birth: YMD): boolean {
  return isValidYMD(birth) && key(birth) >= key(MIN_BIRTH) && birth.y <= MAX_BIRTH_YEAR;
}

/** Year of the April in which the child enters 小学校. */
export function elementaryEntryYear(birth: YMD): number {
  return birth.y + (isHayaumare(birth) ? 6 : 7);
}

/** Birth dates that share the school year: 4月2日 〜 翌年4月1日. */
export function cohortRange(birth: YMD): { from: YMD; to: YMD } {
  const entry = elementaryEntryYear(birth);
  return { from: { y: entry - 7, m: 4, d: 2 }, to: { y: entry - 6, m: 4, d: 1 } };
}

export interface SchoolEvent {
  stage: StageId;
  kind: 'entry' | 'end';
  y: number;
  /** 4 = 入学, 3 = 卒業・修了. */
  m: 3 | 4;
}

export interface TimelineOptions {
  last: LastSchool;
  /** 浪人: years between leaving the previous school and entering the target school (0–5). */
  ronin: number;
  /** 留年・休学: extra years spent in the target school (0–5). */
  extra: number;
}

/** Whole number clamped to 0–5; anything unreadable counts as 0. */
export function clampYears(n: number): number {
  return Number.isFinite(n) ? Math.min(MAX_EXTRA_YEARS, Math.max(0, Math.trunc(n))) : 0;
}

/**
 * 入学・卒業 events from 小学校 to the last school, oldest first.
 * Null when the birth date is invalid or outside the supported range.
 */
export function schoolTimeline(birth: YMD, options: Partial<TimelineOptions> = {}): SchoolEvent[] | null {
  if (!isSupportedBirth(birth)) return null;
  const option = findLastSchool(options.last ?? DEFAULT_LAST_SCHOOL);
  const ronin = clampYears(options.ronin ?? 0);
  const extra = clampYears(options.extra ?? 0);
  const events: SchoolEvent[] = [];
  // `cursor` is the year whose March ends the previous school, i.e. the earliest April to enter the next one.
  let cursor = elementaryEntryYear(birth);
  const add = (stage: StageId, years: number, delay: number, longer: number) => {
    const entry = cursor + delay;
    cursor = entry + years + longer;
    events.push({ stage, kind: 'entry', y: entry, m: 4 }, { stage, kind: 'end', y: cursor, m: 3 });
  };
  add('elementary', STAGES.elementary.years, 0, 0);
  add('juniorHigh', STAGES.juniorHigh.years, 0, 0);
  option.path.forEach((s, i) => {
    const isTarget = i === option.target;
    add(s.stage, s.years, isTarget ? ronin : 0, isTarget ? extra : 0);
  });
  return events;
}

/** 履歴書の一般的な書き方: 義務教育は中学校卒業だけを残す. */
export function fromJuniorHighEnd(events: readonly SchoolEvent[]): SchoolEvent[] {
  return events.filter((e) => e.stage !== 'elementary' && !(e.stage === 'juniorHigh' && e.kind === 'entry'));
}

/* ---------- formatting ---------- */

export type YearOrder = 'ad' | 'wareki';

/** 和暦 of a month, judged on its first day: (2019, 4) → 「平成31年」, (2019, 5) → 「令和元年」. */
export function warekiYearOfMonth(y: number, m: number): string {
  const w = toWareki({ y, m, d: 1 });
  return w ? eraYearLabel(w.era.name, w.year) : '—';
}

/**
 * 「2015年（平成27年）4月」 (order 'ad') or 「平成27年（2015年）4月」 (order 'wareki').
 * With `both` false only the leading calendar is written: 「2015年4月」「平成27年4月」.
 */
export function formatYearMonth(y: number, m: number, order: YearOrder = 'ad', both = true): string {
  const ad = `${y}年`;
  const wareki = warekiYearOfMonth(y, m);
  const [first, second] = order === 'ad' ? [ad, wareki] : [wareki, ad];
  return both ? `${first}（${second}）${m}月` : `${first}${m}月`;
}

/** 「入学」「卒業」「修了」 */
export function eventWord(event: Pick<SchoolEvent, 'stage' | 'kind'>): string {
  return event.kind === 'entry' ? '入学' : STAGES[event.stage].endWord;
}

/** School name with a blank to fill in: 「○○高等学校」「○○大学大学院 修士課程」. */
export function resumeSchoolName(stage: StageId): string {
  return stage === 'graduate' ? '○○大学大学院 修士課程' : `○○${STAGES[stage].name}`;
}

/**
 * Whether a 卒業・修了 is still ahead on `today` (the school year ends in March, so it counts as
 * ahead until the end of that March).
 */
export function isExpected(event: SchoolEvent, today: Pick<YMD, 'y' | 'm'>): boolean {
  return event.kind === 'end' && (today.y < event.y || (today.y === event.y && today.m <= event.m));
}

export interface ResumeRow {
  /** 「2015年（平成27年）4月」 */
  when: string;
  /** 「○○高等学校 入学」 */
  what: string;
}

/**
 * One row per event for the 学歴 column, with a blank school name.
 * When `today` is given and the last row is a 卒業・修了 that has not happened yet, it is written as
 * 「卒業見込み」「修了見込み」, the usual wording for a school one is still attending.
 */
export function resumeRows(
  events: readonly SchoolEvent[],
  order: YearOrder = 'ad',
  both = true,
  today?: Pick<YMD, 'y' | 'm'>,
): ResumeRow[] {
  return events.map((e, i) => {
    const expected = today !== undefined && i === events.length - 1 && isExpected(e, today);
    return {
      when: formatYearMonth(e.y, e.m, order, both),
      what: `${resumeSchoolName(e.stage)} ${eventWord(e)}${expected ? '見込み' : ''}`,
    };
  });
}

/** The rows as text lines: 「2015年（平成27年）4月　○○高等学校 入学」. */
export function resumeLines(
  events: readonly SchoolEvent[],
  order: YearOrder = 'ad',
  both = true,
  today?: Pick<YMD, 'y' | 'm'>,
): string[] {
  return resumeRows(events, order, both, today).map((row) => `${row.when}　${row.what}`);
}

/** 「2004年4月2日」 */
export function formatDateJa(date: YMD): string {
  return `${date.y}年${date.m}月${date.d}日`;
}

// お年玉 計算: totals, the notes and coins to prepare, and a comparison with the survey budget. Pure functions.
// ja-only tool, so the Japanese labels and sentences live here (see docs/i18n.md §3).
import { formatInteger } from '../../lib/format';

/** The survey every default and comparison on the page comes from. Do not add figures that are not in it. */
export const SURVEY = {
  publisher: 'インテージ',
  title: '2026年お年玉調査',
  url: 'https://www.intage.co.jp/news/7129/',
  published: '2025年12月22日',
  fielded: '2025年11月19日～11月25日',
  region: '全国',
  sampleSize: 5000,
  ages: '15～79歳',
  /** お年玉の予算総額（円）. Down for the second year in a row. */
  budgetTotal: 24039,
} as const;

/** New Year the page is written for. */
export const TARGET_YEAR = 2027;
export const TARGET_YEAR_LABEL = '2027年（令和9年）';

export type GroupId = 'preschool' | 'elementaryLower' | 'elementaryUpper' | 'juniorHigh' | 'highSchool' | 'college';

export interface AgeGroup {
  id: GroupId;
  /** Label of the input row. */
  label: string;
  /** Group name as the survey writes it. */
  surveyLabel: string;
  /** Lower and upper end (円) of the most common amount bracket in the survey: the mode, not an average. */
  bracket: readonly [number, number];
  /** The bracket as the survey writes it. */
  bracketLabel: string;
  /** How the survey describes the share of that bracket, when it gives one. */
  share?: string;
  /** Default amount per person: the top of the bracket. */
  defaultAmount: number;
}

export const AGE_GROUPS: readonly AgeGroup[] = [
  { id: 'preschool', label: '小学生未満', surveyLabel: '小学生未満', bracket: [1, 1000], bracketLabel: '1～1,000円', defaultAmount: 1000 },
  { id: 'elementaryLower', label: '小学校低学年', surveyLabel: '小学校低学年', bracket: [2001, 3000], bracketLabel: '2,001～3,000円', defaultAmount: 3000 },
  { id: 'elementaryUpper', label: '小学校高学年', surveyLabel: '小学校高学年', bracket: [4001, 5000], bracketLabel: '4,001～5,000円', defaultAmount: 5000 },
  {
    id: 'juniorHigh',
    label: '中学生',
    surveyLabel: '中学生',
    bracket: [4001, 5000],
    bracketLabel: '4,001～5,000円',
    share: '5割以上',
    defaultAmount: 5000,
  },
  {
    id: 'highSchool',
    label: '高校生',
    surveyLabel: '高校生',
    bracket: [9001, 10000],
    bracketLabel: '9,001～1万円',
    share: '約半数',
    defaultAmount: 10000,
  },
  {
    id: 'college',
    label: '大学生・専門学校生',
    surveyLabel: '大学生・専門学校生・短大生',
    bracket: [9001, 10000],
    bracketLabel: '9,001～1万円',
    share: '約3人に2人',
    defaultAmount: 10000,
  },
];

export const MAX_COUNT = 99;
export const MAX_AMOUNT = 1_000_000;

/** Notes and the one coin the tool counts, largest first. Anything under 500円 is reported as a remainder. */
export const DENOMINATIONS = [10000, 5000, 1000, 500] as const;
export type Denomination = (typeof DENOMINATIONS)[number];
export type NoteCounts = Record<Denomination, number>;

export const DENOMINATION_LABEL: Record<Denomination, string> = {
  10000: '1万円札',
  5000: '5千円札',
  1000: '千円札',
  500: '500円玉',
};

export interface Breakdown {
  notes: NoteCounts;
  /** Yen left over after the 500円玉 (0–499): smaller coins. */
  remainder: number;
}

export interface Entry {
  groupId: GroupId;
  count: number;
  amount: number;
  /** Optional memo of who the envelopes are for. */
  names?: string;
}

export interface SummaryLine extends Entry {
  subtotal: number;
  /** What goes into one ポチ袋 of this line. */
  perEnvelope: Breakdown;
}

export interface Summary {
  /** Lines that have at least one person and an amount above 0, in input order. */
  lines: SummaryLine[];
  total: number;
  people: number;
  /** One ポチ袋 per person. */
  envelopes: number;
  notes: NoteCounts;
  remainder: number;
}

export interface BudgetComparison {
  budget: number;
  /** total − budget. */
  diff: number;
  /** total as a percentage of the budget, rounded. */
  percent: number;
  relation: 'over' | 'under' | 'equal';
}

function clampInteger(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.floor(value), max);
}

/** People in a group: a whole number from 0 to 99. Anything else becomes 0. */
export function sanitizeCount(value: number): number {
  return clampInteger(value, MAX_COUNT);
}

/** Amount per person in whole yen, 0 to 1,000,000. Anything else becomes 0. */
export function sanitizeAmount(value: number): number {
  return clampInteger(value, MAX_AMOUNT);
}

function emptyNotes(): NoteCounts {
  return { 10000: 0, 5000: 0, 1000: 0, 500: 0 };
}

/**
 * Notes for one ポチ袋: the fewest pieces, largest first.
 * 10,000円 → 1万円札 1枚, 5,000円 → 5千円札 1枚, 3,000円 → 千円札 3枚, 1,500円 → 千円札 1枚 + 500円玉 1枚.
 */
export function breakdownAmount(amount: number): Breakdown {
  let rest = sanitizeAmount(amount);
  const notes = emptyNotes();
  for (const d of DENOMINATIONS) {
    notes[d] = Math.floor(rest / d);
    rest -= notes[d] * d;
  }
  return { notes, remainder: rest };
}

/** 18000 → 「18,000円」. */
export function yen(value: number): string {
  return `${formatInteger(value, 'ja')}円`;
}

/** 「5千円札 1枚＋千円札 3枚」. An amount under 500円 gives 「硬貨 300円」; 0 gives ''. */
export function breakdownText(b: Breakdown): string {
  const parts = DENOMINATIONS.filter((d) => b.notes[d] > 0).map((d) => `${DENOMINATION_LABEL[d]} ${b.notes[d]}枚`);
  if (b.remainder > 0) parts.push(`硬貨 ${yen(b.remainder)}`);
  return parts.join('＋');
}

/** Totals for the whole list. Rows with 0 people or 0円 are left out and need no ポチ袋. */
export function summarize(entries: readonly Entry[]): Summary {
  const summary: Summary = { lines: [], total: 0, people: 0, envelopes: 0, notes: emptyNotes(), remainder: 0 };
  for (const entry of entries) {
    const count = sanitizeCount(entry.count);
    const amount = sanitizeAmount(entry.amount);
    if (count === 0 || amount === 0) continue;
    const perEnvelope = breakdownAmount(amount);
    const names = entry.names?.trim();
    summary.lines.push({
      groupId: entry.groupId,
      count,
      amount,
      subtotal: count * amount,
      perEnvelope,
      ...(names ? { names } : {}),
    });
    summary.total += count * amount;
    summary.people += count;
    for (const d of DENOMINATIONS) summary.notes[d] += perEnvelope.notes[d] * count;
    summary.remainder += perEnvelope.remainder * count;
  }
  summary.envelopes = summary.people;
  return summary;
}

/** Compares a total with the survey's お年玉の予算総額 (24,039円 by default). */
export function compareWithBudget(total: number, budget: number = SURVEY.budgetTotal): BudgetComparison {
  const diff = total - budget;
  return {
    budget,
    diff,
    percent: Math.round((total / budget) * 100),
    relation: diff > 0 ? 'over' : diff < 0 ? 'under' : 'equal',
  };
}

export function groupById(id: string): AgeGroup | undefined {
  return AGE_GROUPS.find((g) => g.id === id);
}

/** Line under an input row: the subtotal and what goes into one ポチ袋. '' while the row has no people. */
export function rowNote(count: number, amount: number): string {
  const people = sanitizeCount(count);
  const each = sanitizeAmount(amount);
  if (people === 0) return '';
  if (each === 0) return '1人あたりの金額を入れてください';
  return `小計 ${yen(people * each)}（1袋に${breakdownText(breakdownAmount(each))}）`;
}

/** 「1万円札 1枚、5千円札 1枚、千円札 3枚」 for the whole list; '' when nothing is needed. */
export function notesText(summary: Pick<Summary, 'notes' | 'remainder'>): string {
  const parts = DENOMINATIONS.filter((d) => summary.notes[d] > 0).map((d) => `${DENOMINATION_LABEL[d]} ${summary.notes[d]}枚`);
  if (summary.remainder > 0) parts.push(`硬貨 ${yen(summary.remainder)}`);
  return parts.join('、');
}

/** One sentence comparing the total with the survey's お年玉の予算総額. */
export function comparisonText(total: number): string {
  const source = `${SURVEY.publisher}「${SURVEY.title}」の予算総額 ${yen(SURVEY.budgetTotal)}`;
  if (total <= 0) return `人数を入れると、${source}と比べられます。`;
  const c = compareWithBudget(total);
  if (c.relation === 'equal') return `合計 ${yen(total)}は、${source}と同じです。`;
  const gap = `${yen(Math.abs(c.diff))}${c.relation === 'over' ? '多く' : '少なく'}`;
  return `合計 ${yen(total)}は、${source}より${gap}、その約${c.percent}%にあたります。`;
}

/** Plain-text shopping list for the copy button. '' when there is nobody on the list. */
export function listText(summary: Summary): string {
  if (summary.lines.length === 0) return '';
  const lines = summary.lines.map((line) => {
    const label = groupById(line.groupId)?.label ?? line.groupId;
    const names = line.names ? `／${line.names}` : '';
    return `${label}：${yen(line.amount)} × ${line.count}人 ＝ ${yen(line.subtotal)}（1袋に${breakdownText(line.perEnvelope)}）${names}`;
  });
  return [
    `お年玉の準備リスト（${TARGET_YEAR}年）`,
    ...lines,
    `合計：${yen(summary.total)}（${summary.people}人分）`,
    `用意するお金：${notesText(summary)}`,
    `ポチ袋：${summary.envelopes}枚`,
  ].join('\n');
}

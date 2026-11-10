// Big-screen prize draw. Pure, DOM-free: the prize list, the state of a live draw, drawing and
// redrawing winners, the exported results and how names are laid out on screen.
// Randomness is injected for tests; in the browser it comes from crypto.getRandomValues().
import { MAX_ENTRIES, randomIndex, type RandomSource } from '../random-picker/logic';

export type { RandomSource };

export const LIMITS = {
  /** Lines read from the prize list. */
  prizes: 100,
  /** Winners of one prize. */
  quantity: 999,
  /** Winners of all prizes together. */
  slots: MAX_ENTRIES,
} as const;

/* ---------- Prize list ---------- */

export interface PrizeInput {
  name: string;
  quantity: number;
}

// A quantity at the end of the line: 「x1」「x 3」「×3」「*3」 and the full-width forms 「＊３」「Ｘ３」,
// optionally followed by a counter word.
const QUANTITY = /^(.*?)(\s*)([xXｘＸ×✕*＊])\s*([0-9０-９]{1,6})\s*(?:名|位|個|份|人|本|枚|組)?$/u;
const LETTER_MARKS = 'xXｘＸ';
const ENDS_WITH_LETTER = /[A-Za-zＡ-Ｚａ-ｚ]$/;

/** One line of the prize list, or null for a blank line. */
export function parsePrizeLine(line: string): PrizeInput | null {
  const text = line.trim();
  if (!text) return null;
  const match = QUANTITY.exec(text);
  if (match) {
    const [, name, space, mark, digits] = match;
    // 「Xbox 360」 is a name, not 「Xbo」 times 360: a letter x only counts when it stands apart from a word.
    const partOfWord = LETTER_MARKS.includes(mark) && space === '' && ENDS_WITH_LETTER.test(name);
    if (name && !partOfWord) {
      const quantity = Number(digits.normalize('NFKC'));
      return { name, quantity: Math.min(LIMITS.quantity, Math.max(1, quantity)) };
    }
  }
  return { name: text, quantity: 1 };
}

/** One prize per line; a line without a quantity has one winner. */
export function parsePrizes(text: string): PrizeInput[] {
  const prizes: PrizeInput[] = [];
  for (const line of text.split(/\r\n|\r|\n/)) {
    const prize = parsePrizeLine(line);
    if (prize) prizes.push(prize);
    if (prizes.length === LIMITS.prizes) break;
  }
  return prizes;
}

export function totalSlots(prizes: readonly { quantity: number }[]): number {
  return prizes.reduce((sum, prize) => sum + prize.quantity, 0);
}

export type SetupError = 'noPeople' | 'noPrizes' | 'tooManySlots' | 'tooFewPeople';

/** What stops a draw from starting, or null when the lists are fine. */
export function checkSetup(people: number, prizes: readonly PrizeInput[], noRepeat: boolean): SetupError | null {
  if (people === 0) return 'noPeople';
  if (prizes.length === 0) return 'noPrizes';
  const slots = totalSlots(prizes);
  if (slots > LIMITS.slots) return 'tooManySlots';
  if (noRepeat && slots > people) return 'tooFewPeople';
  return null;
}

/* ---------- A live draw ---------- */

/** One place among a prize's winners. People are stored as positions in the participant list. */
export interface Slot {
  /** Who holds the prize now. */
  person: number;
  /** Earlier winners of this slot who were not there to collect, oldest first. */
  absent: number[];
}

export interface Prize {
  name: string;
  quantity: number;
  /** Added from the stage after the draw had started. */
  bonus: boolean;
  /** Winners in the order they were drawn; never longer than `quantity`. */
  slots: Slot[];
}

export const BATCHES = ['one', 'all'] as const;
/** Draw one winner per press, or every remaining winner of the prize at once. */
export type Batch = (typeof BATCHES)[number];
export const isBatch = (v: unknown): v is Batch => typeof v === 'string' && (BATCHES as readonly string[]).includes(v);

export interface Session {
  participants: string[];
  prizes: Prize[];
  /** A winner is out of every later draw. When off, a person can still win a given prize only once. */
  noRepeat: boolean;
  batch: Batch;
  /** The prize the host has selected. */
  current: number;
}

export const remainingOf = (prize: Prize): number => prize.quantity - prize.slots.length;

/**
 * The prize to draw next: the last one on the list that still has winners to draw, because parties
 * work up from the small prizes to the top one. -1 when everything has been drawn.
 */
export function defaultPrize(session: Session): number {
  for (let i = session.prizes.length - 1; i >= 0; i--) if (remainingOf(session.prizes[i]) > 0) return i;
  return -1;
}

export const isFinished = (session: Session): boolean => defaultPrize(session) === -1;

export function startSession(participants: readonly string[], prizes: readonly PrizeInput[], noRepeat: boolean, batch: Batch = 'one'): Session {
  const session: Session = {
    participants: [...participants],
    prizes: prizes.map(({ name, quantity }) => ({ name, quantity, bonus: false, slots: [] })),
    noRepeat,
    batch,
    current: 0,
  };
  session.current = Math.max(0, defaultPrize(session));
  return session;
}

export function progress(session: Session): { done: number; total: number } {
  return {
    done: session.prizes.reduce((sum, prize) => sum + prize.slots.length, 0),
    total: totalSlots(session.prizes),
  };
}

/**
 * People who can be drawn for a prize, in list order. Anyone marked absent is out for good.
 * With no-repeat, so is every winner; without it, only the people who already hold this prize.
 */
export function eligible(session: Session, prizeIndex: number): number[] {
  const out = new Set<number>();
  session.prizes.forEach((prize, i) => {
    for (const slot of prize.slots) {
      if (session.noRepeat || i === prizeIndex) out.add(slot.person);
      for (const person of slot.absent) out.add(person);
    }
  });
  const pool: number[] = [];
  for (let person = 0; person < session.participants.length; person++) if (!out.has(person)) pool.push(person);
  return pool;
}

/** `count` different items in draw order; every ordered selection is equally likely. */
function sample<T>(items: readonly T[], count: number, random?: RandomSource): T[] {
  const pool = items.slice();
  const n = Math.max(0, Math.min(Math.floor(count), pool.length));
  // Partial Fisher–Yates: only the first n positions need to be settled.
  for (let i = 0; i < n; i++) {
    const j = i + randomIndex(pool.length - i, random);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

const withPrize = (session: Session, prizeIndex: number, prize: Prize): Session => ({
  ...session,
  prizes: session.prizes.map((old, i) => (i === prizeIndex ? prize : old)),
});

export interface DrawResult {
  session: Session;
  /** Positions of the new winners in the prize's `slots`. Shorter than asked when people ran out. */
  slots: number[];
}

/** Draws up to `count` winners for a prize, limited by what the prize has left and by who can still win. */
export function drawWinners(session: Session, prizeIndex: number, count: number, random?: RandomSource): DrawResult {
  const prize = session.prizes[prizeIndex];
  if (!prize) return { session, slots: [] };
  const people = sample(eligible(session, prizeIndex), Math.min(count, remainingOf(prize)), random);
  if (people.length === 0) return { session, slots: [] };
  const first = prize.slots.length;
  const slots = [...prize.slots, ...people.map((person): Slot => ({ person, absent: [] }))];
  return {
    session: withPrize(session, prizeIndex, { ...prize, slots }),
    slots: people.map((_, i) => first + i),
  };
}

export interface RedrawResult {
  session: Session;
  /** The person who was replaced. */
  absent: number;
}

/**
 * The winner of a slot is not there: marks them absent and draws the slot again from the people who can
 * still win. Returns null, changing nothing, when the slot does not exist or nobody is left to draw.
 */
export function redrawSlot(session: Session, prizeIndex: number, slotIndex: number, random?: RandomSource): RedrawResult | null {
  const prize = session.prizes[prizeIndex];
  const slot = prize?.slots[slotIndex];
  if (!prize || !slot) return null;
  // The absent winner is already out of the pool, as a current holder of this prize.
  const [person] = sample(eligible(session, prizeIndex), 1, random);
  if (person === undefined) return null;
  const slots = prize.slots.map((old, i) => (i === slotIndex ? { person, absent: [...old.absent, old.person] } : old));
  return { session: withPrize(session, prizeIndex, { ...prize, slots }), absent: slot.person };
}

/**
 * How many winners a new prize could have: with no-repeat, the people who have not won minus the
 * winners still to be drawn for the other prizes; otherwise everyone who has not been marked absent.
 */
export function spareCapacity(session: Session): number {
  const pool = eligible(session, -1).length;
  if (!session.noRepeat) return pool;
  const { done, total } = progress(session);
  return Math.max(0, pool - (total - done));
}

export const cleanQuantity = (value: number): number =>
  Math.min(LIMITS.quantity, Math.max(1, Math.floor(Number.isFinite(value) ? value : 1)));

/** Adds a bonus prize at the end of the list and selects it. */
export function addBonusPrize(session: Session, name: string, quantity: number): Session {
  const prize: Prize = { name: name.trim(), quantity: cleanQuantity(quantity), bonus: true, slots: [] };
  return { ...session, prizes: [...session.prizes, prize], current: session.prizes.length };
}

/* ---------- Results ---------- */

/** One line of the copied results: the prize and the names of its current winners. */
export type ResultLine = (prize: Prize, names: string[]) => string;

const zhResultLine: ResultLine = (prize, names) => `${prize.name}：${names.length ? names.join('、') : '尚未抽出'}`;

export function winnerNames(session: Session, prize: Prize): string[] {
  return prize.slots.map((slot) => session.participants[slot.person]);
}

/** Plain text for a chat group or an announcement, one prize per line in list order. */
export function formatResults(session: Session, line: ResultLine = zhResultLine): string {
  return session.prizes.map((prize) => line(prize, winnerNames(session, prize))).join('\n');
}

export interface CsvLabels {
  /** Column headings: prize, number within the prize, name, status. */
  header: [string, string, string, string];
  won: string;
  absent: string;
}

export const CSV_BOM = '﻿';

/** Quotes a cell when needed, and keeps a spreadsheet from running a name as a formula. */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * Every winner as a CSV row, with the people who were absent listed before whoever replaced them.
 * Starts with a byte order mark so Excel reads it as UTF-8.
 */
export function resultsCsv(session: Session, labels: CsvLabels): string {
  const rows: (string | number)[][] = [labels.header];
  for (const prize of session.prizes) {
    prize.slots.forEach((slot, i) => {
      for (const person of slot.absent) rows.push([prize.name, i + 1, session.participants[person], labels.absent]);
      rows.push([prize.name, i + 1, session.participants[slot.person], labels.won]);
    });
  }
  return CSV_BOM + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/* ---------- Saved state ---------- */

const isIndexList = (value: unknown, max: number): value is number[] =>
  Array.isArray(value) && value.every((v) => Number.isInteger(v) && v >= 0 && v < max);

function normalizePrize(raw: unknown, people: number): Prize | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.name !== 'string' || !o.name.trim()) return null;
  if (!Number.isInteger(o.quantity) || (o.quantity as number) < 1 || (o.quantity as number) > LIMITS.quantity) return null;
  if (!Array.isArray(o.slots) || o.slots.length > (o.quantity as number)) return null;
  const slots: Slot[] = [];
  for (const item of o.slots) {
    if (!item || typeof item !== 'object') return null;
    const { person, absent } = item as Record<string, unknown>;
    if (!isIndexList([person], people) || !isIndexList(absent, people)) return null;
    slots.push({ person: person as number, absent });
  }
  return { name: o.name, quantity: o.quantity as number, bonus: o.bonus === true, slots };
}

/** Validates a draw read from localStorage; anything that could not have come from this tool is dropped. */
export function normalizeSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.participants) || o.participants.length === 0 || o.participants.length > MAX_ENTRIES) return null;
  const participants = o.participants.filter((name): name is string => typeof name === 'string' && name.trim() !== '');
  if (participants.length !== o.participants.length) return null;
  if (!Array.isArray(o.prizes) || o.prizes.length === 0) return null;
  const prizes: Prize[] = [];
  for (const item of o.prizes) {
    const prize = normalizePrize(item, participants.length);
    if (!prize) return null;
    prizes.push(prize);
  }
  if (totalSlots(prizes) > LIMITS.slots) return null;
  const noRepeat = o.noRepeat !== false;

  // Nobody is absent twice or wins after being marked absent, and nobody wins more often than the rules allow.
  const absent = new Set<number>();
  const winners = new Set<number>();
  for (const prize of prizes) {
    const holders = new Set<number>();
    for (const slot of prize.slots) {
      if (holders.has(slot.person) || (noRepeat && winners.has(slot.person))) return null;
      holders.add(slot.person);
      winners.add(slot.person);
      for (const person of slot.absent) {
        if (absent.has(person)) return null;
        absent.add(person);
      }
    }
  }
  for (const person of absent) if (winners.has(person)) return null;

  const session: Session = { participants, prizes, noRepeat, batch: isBatch(o.batch) ? o.batch : 'one', current: 0 };
  const current = o.current;
  session.current = isIndexList([current], prizes.length) ? (current as number) : Math.max(0, defaultPrize(session));
  return session;
}

/** The setup form as typed. */
export interface Draft {
  people: string;
  prizes: string;
  noRepeat: boolean;
  dedupe: boolean;
}

export const EMPTY_DRAFT: Draft = { people: '', prizes: '', noRepeat: true, dedupe: true };

/** Validates a draft read from localStorage, keeping what the visitor typed as far as possible. */
export function normalizeDraft(raw: unknown): Draft {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    people: typeof o.people === 'string' ? o.people : '',
    prizes: typeof o.prizes === 'string' ? o.prizes : '',
    noRepeat: o.noRepeat !== false,
    dedupe: o.dedupe !== false,
  };
}

/* ---------- Names on screen ---------- */

const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

const isWide = (char: string): boolean => WIDE.test(char) || char.codePointAt(0)! > 0xffff;

/** Rough width of a name in em, for when the browser cannot measure text: CJK and full-width forms take one em. */
export function estimateEm(name: string): number {
  let width = 0;
  for (const char of name) width += isWide(char) ? 1 : 0.62;
  return width;
}

/**
 * The pieces of a name that a line break cannot split: each CJK character on its own, and each run of
 * other characters between spaces (「Maximilian」 in 「Maximilian Rodriguez」).
 */
export function unbreakableParts(name: string): string[] {
  const parts: string[] = [];
  let run = '';
  for (const char of name) {
    if (isWide(char) || /\s/.test(char)) {
      if (run) parts.push(run);
      run = '';
      if (isWide(char)) parts.push(char);
    } else run += char;
  }
  if (run) parts.push(run);
  return parts;
}

export interface NameFitOptions {
  /** Space between cards, px. */
  gap: number;
  /** Horizontal padding and border of a card, px. */
  padX: number;
  /** Everything in a card's height that is not the name: padding, border and the redraw button, px. */
  extraY: number;
  /** Largest and smallest font size, px. */
  max: number;
  min: number;
  /** Width at 1em of the widest piece no line break can split; a wrapped line is never narrower than this. */
  wordEm?: number;
}

export interface NameFit {
  columns: number;
  /** Lines the widest name may wrap onto. */
  lines: number;
  /** Font size in px. */
  size: number;
}

const LINE_HEIGHT = 1.15;
const MAX_COLUMNS = 8;
const MAX_LINES = 3;
/** Measured widths are trusted this far, so a name does not touch the edge of its card. */
const WIDTH_SLACK = 0.94;
/** A wrapped name rarely breaks into equal lines; its longest line is assumed this much over the average. */
const WRAP_SLACK = 1.15;
/** A layout this close to the largest type is as good, and the tidier one wins. */
const NEAR_BEST = 0.9;
/** Names wrap only when that makes the type at least this much larger than keeping them on one line. */
const WRAP_GAIN = 1.3;

type Layout = NameFit & { rows: number };

/** The tidiest of the layouts whose type is close to the largest: fewest lines, then rows, then columns. */
function tidiest(layouts: Layout[]): Layout {
  const largest = Math.max(...layouts.map((layout) => layout.size));
  return layouts
    .filter((layout) => layout.size >= largest * NEAR_BEST)
    .sort((a, b) => a.lines - b.lines || a.rows - b.rows || a.columns - b.columns)[0];
}

/**
 * Columns and font size that show `count` names as large as possible in a width × height area;
 * `height` is Infinity when the page can simply grow. `widestEm` is the widest name at 1em.
 * Names stay on one line unless wrapping makes them much larger. Among layouts close to the largest
 * type, fewer rows win, then fewer columns.
 */
export function fitNames(count: number, widestEm: number, width: number, height: number, options: NameFitOptions): NameFit {
  const { gap, padX, extraY, max, min, wordEm = 0 } = options;
  const widest = Math.max(widestEm, 0.5);
  const layouts: Layout[] = [];
  for (let columns = 1; columns <= Math.min(Math.max(count, 1), MAX_COLUMNS); columns++) {
    const rows = Math.ceil(count / columns);
    const cardWidth = (width - (columns - 1) * gap) / columns - padX;
    const cardHeight = Number.isFinite(height) ? (height - (rows - 1) * gap) / rows - extraY : Infinity;
    for (let lines = 1; lines <= MAX_LINES; lines++) {
      const lineEm = lines === 1 ? widest : Math.max((widest / lines) * WRAP_SLACK, wordEm);
      const size = Math.max(0, Math.floor(Math.min((cardWidth * WIDTH_SLACK) / lineEm, cardHeight / (lines * LINE_HEIGHT), max)));
      layouts.push({ columns, rows, lines, size });
    }
  }
  const oneLine = tidiest(layouts.filter((layout) => layout.lines === 1));
  const wrapped = tidiest(layouts);
  const best = wrapped.size >= oneLine.size * WRAP_GAIN ? wrapped : oneLine;
  return { columns: best.columns, lines: best.lines, size: Math.max(min, Math.min(best.size, max)) };
}

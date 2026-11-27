// Amidakuji (ladder lottery). Pure, DOM-free: the name and outcome lists, the seeded ladder,
// tracing a path, the saved state and the share link.
//
// One 128-bit seed decides everything about a draw: which column each outcome sits under and where
// the rungs go. The seed comes from crypto.getRandomValues; the same seed with the same lists always
// rebuilds the same ladder, which is what makes a link reproducible.
//
// Link format: <page URL>#amida=<base64url(UTF-8 JSON)>. Everything after # stays in the browser.
import { shuffled } from '../gift-exchange/logic';
import { cleanLine, fromBase64Url, randomIndex, toBase64Url, type RandomSource } from '../scratch-card/logic';

export type { RandomSource };

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export const FORMAT_VERSION = 1;
/** Only fragments that start with this are ladders; other anchors (#faq …) are ignored. */
export const FRAGMENT_KEY = 'amida=';

/** Text limits are in code points (an emoji or a CJK character counts as one). */
export const LIMITS = {
  minPeople: 2,
  maxPeople: 20,
  name: 20,
  outcome: 20,
  title: 30,
  /** Longest fragment accepted when decoding (characters after #). */
  fragment: 6000,
} as const;

/** Rungs between each pair of neighbouring lines. */
export const RUNGS = { min: 2, max: 4 } as const;

/**
 * Path colours, one per line. Each has a contrast of at least 4.5:1 with white, so a name can sit
 * on its colour in white type. Neighbours in the list are far apart in hue.
 */
export const PATH_COLORS = [
  '#d13f1c', '#1f6fd0', '#0c8259', '#8a4fd3', '#a35a00',
  '#0b7c8c', '#b3256e', '#5f7410', '#4257c9', '#8f2d1f',
  '#2e5e4e', '#b03ab3', '#96700a', '#3a4a8c', '#d6304a',
  '#3d7d1f', '#7a4a2b', '#5b6170', '#6b4fb5', '#9c3d7a',
] as const;

/* ---------- Lists ---------- */

// Spaces are not separators: 'Mary Jane' is one person.
const NAME_SEPARATORS = /\r\n|\r|\n|[,，、;；]/;

export function parseNames(text: string): string[] {
  return text
    .split(NAME_SEPARATORS)
    .map((name) => cleanLine(name, LIMITS.name))
    .filter(Boolean);
}

export type NamesError = 'few' | 'many' | null;

export function checkNames(names: string[]): NamesError {
  if (names.length < LIMITS.minPeople) return 'few';
  return names.length > LIMITS.maxPeople ? 'many' : null;
}

// 'Wash up x2', '洗碗 ×2', '洗碗*2': a count at the end of a line repeats the outcome.
const REPEAT_RE = /^(.*\S)\s*[x×*＊]\s*(\d{1,3})$/iu;
/** Parsing stops here; a list this long is already over the limit. */
const PARSE_CAP = LIMITS.maxPeople * 2;

/** One outcome per line, expanded: 'Blank x3' becomes three entries. */
export function parseOutcomes(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = cleanLine(raw, LIMITS.outcome + 8);
    if (!line) continue;
    const match = REPEAT_RE.exec(line);
    const label = cleanLine(match ? match[1] : line, LIMITS.outcome);
    const count = match ? Number(match[2]) : 1;
    for (let i = 0; i < count && out.length < PARSE_CAP; i++) out.push(label);
    if (out.length >= PARSE_CAP) break;
  }
  return out;
}

export const MODES = ['one', 'some', 'order', 'custom'] as const;
export type Mode = (typeof MODES)[number];
export const isMode = (v: unknown): v is Mode => typeof v === 'string' && (MODES as readonly string[]).includes(v);

/** What the setup form holds. */
export interface Draft {
  names: string;
  mode: Mode;
  /** How many people win in 'some' mode. */
  winners: number;
  /** What a winner and everyone else get in 'one' and 'some' mode; empty means the locale default. */
  hit: string;
  blank: string;
  custom: string;
  title: string;
}

export const EMPTY_DRAFT: Draft = { names: '', mode: 'one', winners: 2, hit: '', blank: '', custom: '', title: '' };

export function cleanWinners(value: unknown): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.min(LIMITS.maxPeople, Math.max(1, n)) : EMPTY_DRAFT.winners;
}

export function normalizeDraft(raw: unknown): Draft {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_DRAFT };
  const r = raw as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
  return {
    names: text(r.names, 4000),
    mode: isMode(r.mode) ? r.mode : EMPTY_DRAFT.mode,
    winners: cleanWinners(r.winners),
    hit: text(r.hit, 200),
    blank: text(r.blank, 200),
    custom: text(r.custom, 4000),
    title: text(r.title, 200),
  };
}

/** Locale text the outcome presets need. `order` is a template with {n}. */
export interface OutcomeLabels {
  hit: string;
  blank: string;
  order: string;
}

export type OutcomesError = 'empty' | 'many' | null;

/**
 * The outcomes for `count` people, one each. A custom list shorter than the group is filled up
 * with blanks; a longer one is an error, because someone's outcome would be dropped.
 */
export function buildOutcomes(count: number, draft: Draft, labels: OutcomeLabels): { outcomes: string[]; error: OutcomesError } {
  const hit = cleanLine(draft.hit, LIMITS.outcome) || labels.hit;
  const blank = cleanLine(draft.blank, LIMITS.outcome) || labels.blank;
  const fill = (wins: number) => Array.from({ length: count }, (_, i) => (i < wins ? hit : blank));
  if (draft.mode === 'one') return { outcomes: fill(1), error: null };
  if (draft.mode === 'some') return { outcomes: fill(Math.min(count, cleanWinners(draft.winners))), error: null };
  if (draft.mode === 'order') {
    return { outcomes: Array.from({ length: count }, (_, i) => labels.order.replace('{n}', String(i + 1))), error: null };
  }
  const custom = parseOutcomes(draft.custom);
  if (custom.length === 0) return { outcomes: [], error: 'empty' };
  if (custom.length > count) return { outcomes: custom, error: 'many' };
  return { outcomes: [...custom, ...Array.from({ length: count - custom.length }, () => blank)], error: null };
}

/** Each distinct outcome with how often it appears, in first-seen order. */
export function countOutcomes(outcomes: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const outcome of outcomes) counts.set(outcome, (counts.get(outcome) ?? 0) + 1);
  return [...counts];
}

/* ---------- Seed ---------- */

/** Four unsigned 32-bit words. */
export type Seed = [number, number, number, number];

export function newSeed(random: RandomSource = defaultRandom): Seed {
  const words = random(new Uint32Array(4));
  return [words[0], words[1], words[2], words[3]];
}

/** 22 base64url characters. */
export function seedToText(seed: Seed): string {
  const bytes = new Uint8Array(16);
  const view = new DataView(bytes.buffer);
  seed.forEach((word, i) => view.setUint32(i * 4, word >>> 0));
  return toBase64Url(bytes);
}

export function seedFromText(text: unknown): Seed | null {
  if (typeof text !== 'string' || text.length !== 22) return null;
  const bytes = fromBase64Url(text);
  if (!bytes || bytes.length !== 16) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, 16);
  return [view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)];
}

/**
 * A repeatable random source from a seed (sfc32, the 32-bit Small Fast Counting generator).
 * The first outputs are skipped so that similar seeds do not start out alike.
 */
export function seededRandom(seed: Seed): RandomSource {
  let [a, b, c, d] = seed.map((word) => word | 0);
  const next = () => {
    const out = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (((c << 21) | (c >>> 11)) + out) | 0;
    return out >>> 0;
  };
  for (let i = 0; i < 15; i++) next();
  return (array) => {
    for (let i = 0; i < array.length; i++) array[i] = next();
    return array;
  };
}

/* ---------- Ladder ---------- */

export interface Ladder {
  columns: number;
  /** One entry per height, top to bottom: the gaps with a rung, ascending. Gap g joins lines g and g + 1. */
  rungs: number[][];
}

/** Heights a rung can sit at. Always enough for two neighbouring gaps to get RUNGS.max rungs each. */
export function ladderRows(columns: number): number {
  if (columns <= 4) return 8;
  return columns <= 9 ? 10 : 12;
}

/**
 * Random rungs: every gap gets RUNGS.min to RUNGS.max of them, at heights its left neighbour does
 * not use, so two rungs never meet on a line.
 */
export function buildLadder(columns: number, random: RandomSource = defaultRandom): Ladder {
  if (!Number.isInteger(columns) || columns < LIMITS.minPeople || columns > LIMITS.maxPeople) {
    throw new RangeError(`Invalid column count: ${columns}`);
  }
  const rows = ladderRows(columns);
  const taken = Array.from({ length: rows }, () => new Array<boolean>(columns - 1).fill(false));
  for (let gap = 0; gap < columns - 1; gap++) {
    const free: number[] = [];
    for (let row = 0; row < rows; row++) if (gap === 0 || !taken[row][gap - 1]) free.push(row);
    const count = RUNGS.min + randomIndex(RUNGS.max - RUNGS.min + 1, random);
    for (const row of shuffled(free, random).slice(0, count)) taken[row][gap] = true;
  }
  return { columns, rungs: taken.map((row) => row.flatMap((on, gap) => (on ? [gap] : []))) };
}

/** The line a path is on before the first height and after each one: rows + 1 entries. */
export function traceColumns(ladder: Ladder, start: number): number[] {
  let column = start;
  const columns = [column];
  for (const row of ladder.rungs) {
    if (row.includes(column)) column++;
    else if (row.includes(column - 1)) column--;
    columns.push(column);
  }
  return columns;
}

/** Where each top position comes out at the bottom. Always a permutation. */
export function ladderEnds(ladder: Ladder): number[] {
  return Array.from({ length: ladder.columns }, (_, start) => traceColumns(ladder, start).at(-1)!);
}

/**
 * Corner points of a path in grid units: x is the line (0 … columns − 1), y runs from 0 (top) to
 * rows + 1 (bottom), with the rung of row r at y = r + 1.
 */
export function pathPoints(ladder: Ladder, start: number): [number, number][] {
  const columns = traceColumns(ladder, start);
  const points: [number, number][] = [[start, 0]];
  for (let row = 0; row < ladder.rungs.length; row++) {
    if (columns[row + 1] === columns[row]) continue;
    points.push([columns[row], row + 1], [columns[row + 1], row + 1]);
  }
  points.push([columns.at(-1)!, ladder.rungs.length + 1]);
  return points;
}

/* ---------- A draw ---------- */

export interface Game {
  title: string;
  /** Top of the ladder, left to right. */
  names: string[];
  /** One per person, in the order they were entered; the seed decides where each one sits. */
  outcomes: string[];
  seed: Seed;
}

export interface Play {
  ladder: Ladder;
  /** The outcome under each line, left to right. */
  bottom: string[];
  /** For each name, the line it ends on. */
  ends: number[];
  /** For each name, its outcome. */
  results: string[];
}

/**
 * Everything the seed decides. The outcomes are shuffled along the bottom with an unbiased
 * Fisher–Yates before the rungs are drawn, so each name is equally likely to get each outcome
 * whatever shape the ladder takes.
 */
export function play(game: Game): Play {
  const random = seededRandom(game.seed);
  const bottom = shuffled(game.outcomes, random);
  const ladder = buildLadder(game.names.length, random);
  const ends = ladderEnds(ladder);
  return { ladder, bottom, ends, results: ends.map((end) => bottom[end]) };
}

export function newGame(title: string, names: string[], outcomes: string[], random: RandomSource = defaultRandom): Game {
  return { title: cleanLine(title, LIMITS.title), names: [...names], outcomes: [...outcomes], seed: newSeed(random) };
}

function cleanList(raw: unknown, max: number): string[] | null {
  if (!Array.isArray(raw)) return null;
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') return null;
    const text = cleanLine(item, max);
    if (!text) return null;
    out.push(text);
  }
  return out;
}

function validGame(title: unknown, names: string[] | null, outcomes: string[] | null, seed: Seed | null): Game | null {
  if (!names || !outcomes || !seed || checkNames(names) || outcomes.length !== names.length) return null;
  return { title: typeof title === 'string' ? cleanLine(title, LIMITS.title) : '', names, outcomes, seed };
}

/* ---------- Saved state ---------- */

export interface Session {
  game: Game;
  /** False while the rungs are still covered. */
  opened: boolean;
  /** Names whose path has been shown, in the order they were shown. */
  revealed: number[];
}

export const startSession = (game: Game): Session => ({ game, opened: false, revealed: [] });

/** Shows one more path (and uncovers the ladder). Showing a path twice changes nothing. */
export function reveal(session: Session, person: number): Session {
  if (person < 0 || person >= session.game.names.length) return session;
  return { ...session, opened: true, revealed: session.revealed.includes(person) ? session.revealed : [...session.revealed, person] };
}

export function revealAll(session: Session): Session {
  const rest = session.game.names.map((_, i) => i).filter((i) => !session.revealed.includes(i));
  return { ...session, opened: true, revealed: [...session.revealed, ...rest] };
}

export const isFinished = (session: Session): boolean => session.revealed.length === session.game.names.length;

/** What localStorage holds: the seed as text. */
export function serializeSession(session: Session): unknown {
  const { title, names, outcomes, seed } = session.game;
  return { title, names, outcomes, seed: seedToText(seed), opened: session.opened, revealed: session.revealed };
}

export function normalizeSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const game = validGame(r.title, cleanList(r.names, LIMITS.name), cleanList(r.outcomes, LIMITS.outcome), seedFromText(r.seed));
  if (!game) return null;
  const revealed: number[] = [];
  if (Array.isArray(r.revealed)) {
    for (const item of r.revealed) {
      if (Number.isInteger(item) && item >= 0 && item < game.names.length && !revealed.includes(item)) revealed.push(item);
    }
  }
  return { game, opened: r.opened === true || revealed.length > 0, revealed };
}

/* ---------- Share link ---------- */

type WireOutcome = string | [string, number];

/** The fragment for a draw, without the leading '#': 'amida=eyJ2Ijox…'. Repeated outcomes are run-length encoded. */
export function encodeGame(game: Game): string {
  const runs: WireOutcome[] = [];
  for (const outcome of game.outcomes) {
    const last = runs.at(-1);
    if (Array.isArray(last) && last[0] === outcome) last[1]++;
    else if (last === outcome) runs[runs.length - 1] = [outcome, 2];
    else runs.push(outcome);
  }
  const wire: Record<string, unknown> = { v: FORMAT_VERSION, s: seedToText(game.seed), n: game.names, o: runs };
  if (game.title) wire.t = game.title;
  return FRAGMENT_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

/** Page URL without query string or fragment + '#amida=…'. Names never go into the query string. */
export function shareUrl(pageUrl: string, game: Game): string {
  const cut = pageUrl.search(/[?#]/);
  return `${cut < 0 ? pageUrl : pageUrl.slice(0, cut)}#${encodeGame(game)}`;
}

export type DecodeResult = { status: 'none' } | { status: 'invalid' } | { status: 'ok'; game: Game };

const INVALID: DecodeResult = { status: 'invalid' };

function expandRuns(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const out: unknown[] = [];
  for (const item of raw) {
    if (Array.isArray(item)) {
      const [label, count] = item as unknown[];
      if (item.length !== 2 || !Number.isInteger(count) || (count as number) < 1 || (count as number) > LIMITS.maxPeople) return null;
      for (let i = 0; i < (count as number); i++) out.push(label);
    } else {
      out.push(item);
    }
    if (out.length > LIMITS.maxPeople) return null;
  }
  return cleanList(out, LIMITS.outcome);
}

/**
 * Reads a draw from a location hash. Never throws: anything that is not a well-formed v1 ladder
 * within the limits is 'invalid'; a fragment that is not a ladder is 'none'.
 */
export function decodeGame(hash: string): DecodeResult {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith(FRAGMENT_KEY)) return { status: 'none' };
  const payload = raw.slice(FRAGMENT_KEY.length);
  if (payload.length === 0 || raw.length > LIMITS.fragment) return INVALID;
  const bytes = fromBase64Url(payload);
  if (!bytes) return INVALID;

  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return INVALID;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return INVALID;
  const w = data as Record<string, unknown>;
  if (w.v !== FORMAT_VERSION || (w.t !== undefined && typeof w.t !== 'string')) return INVALID;
  const game = validGame(w.t, cleanList(w.n, LIMITS.name), expandRuns(w.o), seedFromText(w.s));
  return game ? { status: 'ok', game } : INVALID;
}

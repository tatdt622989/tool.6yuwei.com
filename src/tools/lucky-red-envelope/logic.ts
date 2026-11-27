// Lucky red envelopes. Pure, DOM-free: checking the host's numbers, splitting a total into random
// amounts, the state of a round and the personal link format. No money moves; the tool only decides
// who gets how much.
//
// Link format: <page URL>#hb=<base64url(UTF-8 JSON)>. A link holds one envelope: its amount and, when
// the host typed names, its owner. Everything after # stays in the browser.
import { duplicateNames, parseNames, shuffled } from '../gift-exchange/logic';
import { cleanLine, fromBase64Url, randomIndex, toBase64Url, type RandomSource } from '../scratch-card/logic';

export { duplicateNames, parseNames };
export type { RandomSource };

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export const FORMAT_VERSION = 1;
/** Only fragments that start with this are envelopes; other anchors (#faq …) are ignored. */
export const FRAGMENT_KEY = 'hb=';

export const LIMITS = {
  minCount: 2,
  maxCount: 100,
  maxTotal: 9_999_999,
  /** Code points, as in the gift exchange. */
  name: 20,
  title: 30,
  /** Longest fragment accepted when decoding (characters after #). A full legit link is under 300. */
  fragment: 1024,
} as const;

export const UNITS = [1, 10, 100] as const;
export type Unit = (typeof UNITS)[number];
export const isUnit = (v: unknown): v is Unit => (UNITS as readonly unknown[]).includes(v);

/** pick: everyone taps an envelope on one screen. named: each envelope has an owner. link: one link each. */
export const MODES = ['pick', 'named', 'link'] as const;
export type Mode = (typeof MODES)[number];
export const isMode = (v: unknown): v is Mode => typeof v === 'string' && (MODES as readonly string[]).includes(v);

/* ---------- The split ---------- */

export interface SplitInput {
  total: number;
  count: number;
  /** Smallest amount an envelope may hold. */
  minimum: number;
  /** Every amount is a multiple of this. */
  unit: number;
}

export type SplitError =
  | { code: 'total' }
  | { code: 'totalMax'; max: number }
  | { code: 'count'; min: number; max: number }
  | { code: 'unit' }
  | { code: 'minimum' }
  | { code: 'totalUnit'; unit: number }
  | { code: 'minimumUnit'; unit: number }
  | { code: 'tooSmall'; need: number };

/** The first reason these numbers cannot be split, or null when they can. */
export function checkSplit({ total, count, minimum, unit }: SplitInput): SplitError | null {
  if (!Number.isInteger(total) || total < 1) return { code: 'total' };
  if (total > LIMITS.maxTotal) return { code: 'totalMax', max: LIMITS.maxTotal };
  if (!Number.isInteger(count) || count < LIMITS.minCount || count > LIMITS.maxCount) {
    return { code: 'count', min: LIMITS.minCount, max: LIMITS.maxCount };
  }
  if (!isUnit(unit)) return { code: 'unit' };
  if (!Number.isInteger(minimum) || minimum < 1) return { code: 'minimum' };
  if (total % unit !== 0) return { code: 'totalUnit', unit };
  if (minimum % unit !== 0) return { code: 'minimumUnit', unit };
  if (count * minimum > total) return { code: 'tooSmall', need: count * minimum };
  return null;
}

/**
 * Splits `total` into `count` amounts by the double-average method, then shuffles them.
 *
 * Everyone first gets `minimum`. What is left is handed out one envelope at a time: each takes a
 * uniformly random number of units between 0 and twice the average still left per envelope, and the
 * last one takes the rest. Drawn in that order the later envelopes swing more, so the amounts are
 * shuffled afterwards and every position ends up with the same odds.
 *
 * The input must pass checkSplit(); otherwise this throws.
 */
export function splitAmounts(input: SplitInput, random: RandomSource = defaultRandom): number[] {
  if (checkSplit(input)) throw new RangeError('Invalid split');
  const { total, count, minimum, unit } = input;
  let rest = (total - count * minimum) / unit;
  const extras: number[] = [];
  for (let left = count; left > 1; left--) {
    const most = Math.floor((2 * rest) / left);
    const extra = randomIndex(most + 1, random);
    extras.push(extra);
    rest -= extra;
  }
  extras.push(rest);
  return shuffled(
    extras.map((extra) => minimum + extra * unit),
    random,
  );
}

/* ---------- A round ---------- */

export interface Round {
  mode: Mode;
  title: string;
  minimum: number;
  unit: Unit;
  /** amounts[i] is what envelope i holds. They add up to the total. */
  amounts: number[];
  /** Empty when the host only gave a count. Otherwise one name per envelope. */
  names: string[];
  /** owners[i] is the person who has envelope i, or -1 while nobody does. Always -1 without names. */
  owners: number[];
  /** Envelopes that are open, in the order they were opened. */
  opened: number[];
  /** pick mode with names: who still has to pick, next person first. */
  queue: number[];
  /** link mode: envelopes whose link has been copied or shared. */
  sent: number[];
}

export interface RoundInput extends SplitInput {
  mode: Mode;
  names: string[];
  title: string;
}

export type RoundError = SplitError | { code: 'needNames' } | { code: 'duplicate'; names: string[] };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** With names the count is the number of names; `count` is only used when the list is empty. */
export function checkRound(input: RoundInput): RoundError | null {
  const named = input.names.length > 0;
  if (!named && input.mode === 'named') return { code: 'needNames' };
  const problem = checkSplit({ ...input, count: named ? input.names.length : input.count });
  if (problem) return problem;
  const repeated = duplicateNames(input.names);
  return repeated.length ? { code: 'duplicate', names: repeated } : null;
}

export function startRound(input: RoundInput, random: RandomSource = defaultRandom): { round: Round } | { error: RoundError } {
  const error = checkRound(input);
  if (error) return { error };
  const named = input.names.length > 0;
  const count = named ? input.names.length : input.count;
  const amounts = splitAmounts({ total: input.total, count, minimum: input.minimum, unit: input.unit }, random);
  const fixed = named && input.mode !== 'pick';
  return {
    round: {
      mode: input.mode,
      title: cleanLine(input.title, LIMITS.title),
      minimum: input.minimum,
      unit: input.unit as Unit,
      amounts,
      names: [...input.names],
      owners: fixed ? range(count) : new Array<number>(count).fill(-1),
      opened: [],
      queue: named && input.mode === 'pick' ? range(count) : [],
      sent: [],
    },
  };
}

export const totalOf = (round: Round): number => sum(round.amounts);
export const isOpen = (round: Round, envelope: number): boolean => round.opened.includes(envelope);
export const isFinished = (round: Round): boolean => round.opened.length === round.amounts.length;

/** Whose turn it is to pick, or -1 when nobody is waiting (no names, or not a pick round). */
export const nextPicker = (round: Round): number => (round.queue.length ? round.queue[0] : -1);

/** Opens one envelope. In a pick round with names it goes to the person at the front of the queue. */
export function openEnvelope(round: Round, envelope: number): Round {
  if (!Number.isInteger(envelope) || envelope < 0 || envelope >= round.amounts.length || isOpen(round, envelope)) return round;
  const opened = [...round.opened, envelope];
  if (round.queue.length === 0) return { ...round, opened };
  const [person, ...queue] = round.queue;
  const owners = [...round.owners];
  owners[envelope] = person;
  return { ...round, opened, owners, queue };
}

/** The person at the front is away: move them to the back. */
export function skipTurn(round: Round): Round {
  if (round.queue.length < 2) return round;
  const [person, ...queue] = round.queue;
  return { ...round, queue: [...queue, person] };
}

/** Opens what is left, lowest number first; people still waiting take them in queue order. */
export function openAll(round: Round): Round {
  let next = round;
  for (const envelope of range(round.amounts.length)) next = openEnvelope(next, envelope);
  return next;
}

/** Envelopes holding the largest amount: more than one on a tie, none when every envelope holds the same. */
function largest(amounts: readonly number[]): number[] {
  const most = Math.max(...amounts);
  if (Math.min(...amounts) === most) return [];
  return range(amounts.length).filter((i) => amounts[i] === most);
}

/** The luckiest envelopes, once every envelope is open. */
export function luckiest(round: Round): number[] {
  return isFinished(round) ? largest(round.amounts) : [];
}

export function markSent(round: Round, envelope: number): Round {
  return round.sent.includes(envelope) ? round : { ...round, sent: [...round.sent, envelope] };
}

export interface ResultRow {
  envelope: number;
  /** The owner's name, or '' when the round has no names. */
  name: string;
  amount: number;
  best: boolean;
}

const rowOf = (round: Round, envelope: number, best: number[]): ResultRow => ({
  envelope,
  name: round.owners[envelope] >= 0 ? round.names[round.owners[envelope]] : '',
  amount: round.amounts[envelope],
  best: best.includes(envelope),
});

/** Open envelopes in the order they were opened. */
export function resultRows(round: Round): ResultRow[] {
  const best = luckiest(round);
  return round.opened.map((envelope) => rowOf(round, envelope, best));
}

/** Every envelope in list order, for the host of a link round. Marks the largest whether or not it is open. */
export function allRows(round: Round): ResultRow[] {
  const best = largest(round.amounts);
  return range(round.amounts.length).map((envelope) => rowOf(round, envelope, best));
}

const isIntList = (v: unknown, n: number): v is number[] =>
  Array.isArray(v) && v.every((x) => Number.isInteger(x) && x >= 0 && x < n);

/** Validates a round read from localStorage; anything inconsistent is dropped rather than repaired. */
export function normalizeRound(raw: unknown): Round | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!isMode(o.mode) || !isUnit(o.unit) || !Array.isArray(o.amounts) || !Array.isArray(o.names)) return null;
  const amounts = o.amounts.filter((a): a is number => Number.isInteger(a));
  const names = o.names.filter((name): name is string => typeof name === 'string' && name !== '' && cleanLine(name, LIMITS.name) === name);
  const n = amounts.length;
  if (n !== o.amounts.length || names.length !== o.names.length) return null;
  if (names.length !== 0 && names.length !== n) return null;
  if (duplicateNames(names).length) return null;
  const minimum = o.minimum;
  if (typeof minimum !== 'number') return null;
  if (checkSplit({ total: sum(amounts), count: n, minimum, unit: o.unit })) return null;
  if (amounts.some((a) => a < minimum || a % (o.unit as number) !== 0)) return null;

  const named = names.length > 0;
  if (!named && o.mode === 'named') return null;
  if (!isIntList(o.opened, n) || new Set(o.opened).size !== o.opened.length) return null;
  const opened = o.opened;
  if (!Array.isArray(o.owners) || o.owners.length !== n) return null;
  if (!o.owners.every((p) => Number.isInteger(p) && p >= -1 && p < n)) return null;
  const owners = o.owners as number[];
  if (!isIntList(o.queue, n)) return null;
  const queue = o.queue;

  if (named && o.mode === 'pick') {
    // Open envelopes have owners, closed ones do not, and everyone is either waiting or holding one.
    const holders = owners.filter((p) => p >= 0);
    if (owners.some((p, i) => p >= 0 !== opened.includes(i))) return null;
    const everyone = [...holders, ...queue];
    if (everyone.length !== n || new Set(everyone).size !== n) return null;
  } else {
    if (queue.length) return null;
    if (owners.some((p, i) => p !== (named ? i : -1))) return null;
  }
  const sent = isIntList(o.sent, n) ? [...new Set(o.sent)] : [];
  const title = typeof o.title === 'string' ? cleanLine(o.title, LIMITS.title) : '';
  return { mode: o.mode, title, minimum, unit: o.unit, amounts, names, owners, opened, queue, sent };
}

/* ---------- Result text ---------- */

/** The result as plain text for a chat group: a heading line, then one line per open envelope. */
export function resultText(round: Round, rows: ResultRow[], formatAmount: (amount: number) => string): string {
  const head = `${round.title ? `${round.title} ` : ''}拼手氣紅包結果（共 ${round.amounts.length} 包，總金額 ${formatAmount(totalOf(round))} 元）`;
  const lines = rows.map((row, i) => {
    const who = row.name || `第 ${row.envelope + 1} 包`;
    return `${i + 1}. ${who}：${formatAmount(row.amount)} 元${row.best ? '（手氣最佳）' : ''}`;
  });
  return [head, ...lines].join('\n');
}

/* ---------- Personal links ---------- */

export interface Invite {
  /** '' when the round has no names. */
  name: string;
  amount: number;
  title: string;
}

export function roundInvite(round: Round, envelope: number): Invite {
  return { name: round.names[envelope] ?? '', amount: round.amounts[envelope], title: round.title };
}

/** The fragment for an envelope, without the leading '#': 'hb=eyJ2Ijox…'. */
export function encodeInvite(invite: Invite): string {
  const wire: Record<string, string | number> = { v: FORMAT_VERSION, a: invite.amount };
  if (invite.name) wire.n = invite.name;
  if (invite.title) wire.t = invite.title;
  return FRAGMENT_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

/** Page URL without any fragment + '#hb=…'. */
export function inviteUrl(pageUrl: string, invite: Invite): string {
  const cut = pageUrl.indexOf('#');
  return `${cut < 0 ? pageUrl : pageUrl.slice(0, cut)}#${encodeInvite(invite)}`;
}

export type DecodeResult = { status: 'none' } | { status: 'invalid' } | { status: 'ok'; invite: Invite };

const INVALID: DecodeResult = { status: 'invalid' };

/**
 * Reads an envelope from a location hash. Never throws: anything that is not a well-formed v1 link
 * is 'invalid'; a fragment that is not an envelope is 'none'.
 */
export function decodeInvite(hash: string): DecodeResult {
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
  if (w.v !== FORMAT_VERSION) return INVALID;
  if (typeof w.a !== 'number' || !Number.isInteger(w.a) || w.a < 1 || w.a > LIMITS.maxTotal) return INVALID;
  if ((w.n !== undefined && typeof w.n !== 'string') || (w.t !== undefined && typeof w.t !== 'string')) return INVALID;
  return {
    status: 'ok',
    invite: { name: cleanLine(w.n ?? '', LIMITS.name), amount: w.a, title: cleanLine(w.t ?? '', LIMITS.title) },
  };
}

/* ---------- Form draft ---------- */

export type InputBy = 'count' | 'names';

export interface Draft {
  by: InputBy;
  total: string;
  count: string;
  namesText: string;
  minimum: string;
  unit: Unit;
  mode: Mode;
  title: string;
}

export const DEFAULT_DRAFT: Draft = { by: 'count', total: '', count: '', namesText: '', minimum: '', unit: 1, mode: 'pick', title: '' };

/** Validates a draft read from localStorage, keeping what the visitor typed as far as possible. */
export function normalizeDraft(raw: unknown): Draft {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
  return {
    by: o.by === 'names' ? 'names' : 'count',
    total: text(o.total, 12),
    count: text(o.count, 4),
    namesText: text(o.namesText, 8000),
    minimum: text(o.minimum, 12),
    unit: isUnit(o.unit) ? o.unit : 1,
    mode: isMode(o.mode) ? o.mode : 'pick',
    title: typeof o.title === 'string' ? cleanLine(o.title, LIMITS.title) : '',
  };
}

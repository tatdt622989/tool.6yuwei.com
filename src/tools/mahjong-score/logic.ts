// Score pad for four-player Taiwanese 16-tile mahjong. Pure functions, no DOM.
//
// The players count the tai (台) of a hand themselves; this module only does the money:
//   discard win (放槍)   the discarder pays  base + tai × perTai
//   self-draw (自摸)     each of the other three pays  base + tai × perTai
// With the dealer bonus on, 2n + 1 extra tai (dealer 1 + streak n × 2) are added to every
// payment between the dealer and the other party, and never between two non-dealers.
// Everything on screen is replayed from the list of entries, so deleting or editing any
// entry recomputes the totals and the dealer state after it.

export type Seat = 0 | 1 | 2 | 3;
export type Quad = [number, number, number, number];

export const SEATS: readonly Seat[] = [0, 1, 2, 3];
export const WINDS = ['東', '南', '西', '北'] as const;

export const NAME_MAX = 8;
export const MAX_TAI = 200;
export const MAX_STREAK = 99;
export const MAX_AMOUNT = 1_000_000;
export const MAX_ENTRIES = 500;

export interface Stakes {
  /** 底: paid once per payer on every win. */
  base: number;
  /** 每台: paid per tai. */
  perTai: number;
}

export const STAKE_PRESETS: readonly Stakes[] = [
  { base: 30, perTai: 10 },
  { base: 50, perTai: 20 },
  { base: 100, perTai: 20 },
  { base: 100, perTai: 50 },
  { base: 300, perTai: 100 },
];
export const DEFAULT_STAKES: Stakes = STAKE_PRESETS[1];

export interface WinEntry {
  kind: 'win';
  winner: Seat;
  /** The discarder, or null for a self-draw. */
  from: Seat | null;
  /** Tai as entered. Excludes the dealer bonus when `bonus` is true. */
  tai: number;
  /** Whether the dealer bonus was added automatically for this hand. */
  bonus: boolean;
}
export interface DrawEntry {
  kind: 'draw';
}
/** Win/loss keyed in directly; does not move the dealer. */
export interface DirectEntry {
  kind: 'direct';
  deltas: Quad;
}
/** The dealer was set by hand. */
export interface DealerEntry {
  kind: 'dealer';
  dealer: Seat;
  streak: number;
  /** Prevailing wind 0–3 to jump to, or null to keep the current one. */
  wind: number | null;
}
export type Entry = WinEntry | DrawEntry | DirectEntry | DealerEntry;

export interface Game {
  names: [string, string, string, string];
  stakes: Stakes;
  startDealer: Seat;
  entries: Entry[];
}

export interface DealerState {
  dealer: Seat;
  /** n in 連 n 拉 n: how many hands in a row the dealer has kept the deal. */
  streak: number;
  /** How many times the deal has moved on since the start; drives the wind display. */
  passes: number;
}

export interface Payment {
  payer: Seat;
  /** Tai as entered. */
  tai: number;
  /** Dealer bonus tai added to this payment (0 between two non-dealers). */
  extraTai: number;
  amount: number;
}

export interface Row {
  index: number;
  entry: Entry;
  /** 1-based number among played hands (wins and draws); null for other entries. */
  handNo: number | null;
  before: DealerState;
  after: DealerState;
  payments: Payment[];
  deltas: Quad;
  totals: Quad;
}

export interface Replay {
  rows: Row[];
  totals: Quad;
  dealer: DealerState;
  hands: number;
}

export interface Transfer {
  from: number;
  to: number;
  amount: number;
}

const zero = (): Quad => [0, 0, 0, 0];

function toInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isSeat(value: unknown): value is Seat {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

export function cleanName(raw: string): string {
  return Array.from(raw.replace(/\s+/g, ' ').trim()).slice(0, NAME_MAX).join('').trim();
}

export function cleanStakes(raw: { base?: unknown; perTai?: unknown } | null | undefined): Stakes {
  return {
    base: toInt(raw?.base, 0, MAX_AMOUNT, DEFAULT_STAKES.base),
    perTai: toInt(raw?.perTai, 0, MAX_AMOUNT, DEFAULT_STAKES.perTai),
  };
}

/** Index into STAKE_PRESETS, or -1 for a custom pair. */
export function presetIndex(stakes: Stakes): number {
  return STAKE_PRESETS.findIndex((p) => p.base === stakes.base && p.perTai === stakes.perTai);
}

/** Dealer bonus at streak n: 1 tai for being dealer plus 連 n 拉 n (2n). */
export function dealerExtraTai(streak: number): number {
  return 2 * streak + 1;
}

/** Who pays what for a winning hand, given who is dealer when it is played. */
export function handPayments(hand: WinEntry, dealer: Pick<DealerState, 'dealer' | 'streak'>, stakes: Stakes): Payment[] {
  const payers = hand.from === null ? SEATS.filter((seat) => seat !== hand.winner) : [hand.from];
  const extra = hand.bonus ? dealerExtraTai(dealer.streak) : 0;
  return payers.map((payer) => {
    const extraTai = hand.winner === dealer.dealer || payer === dealer.dealer ? extra : 0;
    return { payer, tai: hand.tai, extraTai, amount: stakes.base + (hand.tai + extraTai) * stakes.perTai };
  });
}

export function paymentDeltas(winner: Seat, payments: readonly Payment[]): Quad {
  const deltas = zero();
  for (const p of payments) {
    deltas[p.payer] -= p.amount;
    deltas[winner] += p.amount;
  }
  return deltas;
}

export function initialDealer(startDealer: Seat): DealerState {
  return { dealer: startDealer, streak: 0, passes: 0 };
}

/**
 * Dealer after an entry. Dealer win or drawn hand: same dealer, streak + 1.
 * Any other win: the next seat deals with streak 0. Direct entries change nothing.
 */
export function advanceDealer(state: DealerState, entry: Entry, startDealer: Seat): DealerState {
  switch (entry.kind) {
    case 'direct':
      return state;
    case 'draw':
      return { ...state, streak: Math.min(MAX_STREAK, state.streak + 1) };
    case 'win':
      if (entry.winner === state.dealer) return { ...state, streak: Math.min(MAX_STREAK, state.streak + 1) };
      return { dealer: ((state.dealer + 1) % 4) as Seat, streak: 0, passes: state.passes + 1 };
    case 'dealer': {
      // Keep passes in step with the seat, so the wind display stays consistent after a manual change.
      const game = Math.floor(state.passes / 16);
      const wind = entry.wind ?? Math.floor(state.passes / 4) % 4;
      const position = (entry.dealer - startDealer + 4) % 4;
      return { dealer: entry.dealer, streak: entry.streak, passes: game * 16 + wind * 4 + position };
    }
  }
}

/** Replays the whole game: per-entry payments, running totals and the dealer before and after. */
export function replay(game: Pick<Game, 'stakes' | 'startDealer' | 'entries'>): Replay {
  let dealer = initialDealer(game.startDealer);
  let totals = zero();
  let hands = 0;
  const rows = game.entries.map((entry, index): Row => {
    const before = dealer;
    const payments = entry.kind === 'win' ? handPayments(entry, before, game.stakes) : [];
    const deltas: Quad =
      entry.kind === 'win' ? paymentDeltas(entry.winner, payments) : entry.kind === 'direct' ? [...entry.deltas] : zero();
    totals = totals.map((v, i) => v + deltas[i]) as Quad;
    dealer = advanceDealer(before, entry, game.startDealer);
    const handNo = entry.kind === 'win' || entry.kind === 'draw' ? ++hands : null;
    return { index, entry, handNo, before, after: dealer, payments, deltas, totals };
  });
  return { rows, totals, dealer, hands };
}

/** 圈風 and position from the number of dealer passes: 0 → 東風東, 5 → 南風南, 16 → second game, 東風東. */
export function roundInfo(passes: number): { game: number; wind: number; position: number; label: string } {
  const game = Math.floor(passes / 16) + 1;
  const wind = Math.floor(passes / 4) % 4;
  const position = passes % 4;
  return { game, wind, position, label: `${WINDS[wind]}風${WINDS[position]}` };
}

/**
 * Fewest transfers that clear the balances: the largest debtor keeps paying the largest creditor.
 * For four players that is optimal, and never more than three transfers.
 */
export function settle(totals: readonly number[]): Transfer[] {
  const left = [...totals];
  const out: Transfer[] = [];
  for (;;) {
    let to = 0;
    let from = 0;
    left.forEach((v, i) => {
      if (v > left[to]) to = i;
      if (v < left[from]) from = i;
    });
    if (left[to] <= 0 || left[from] >= 0) break;
    const amount = Math.min(left[to], -left[from]);
    out.push({ from, to, amount });
    left[to] -= amount;
    left[from] += amount;
  }
  return out;
}

export function sumOf(values: readonly (number | null)[]): number {
  return values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
}

/** When exactly one value is missing, fills it so the four add up to zero; otherwise returns null. */
export function fillFourth(values: readonly (number | null)[]): Quad | null {
  if (values.length !== 4) return null;
  const missing = values.flatMap((v, i) => (v === null ? [i] : []));
  if (missing.length !== 1) return null;
  const filled = values.map((v) => v ?? 0) as Quad;
  filled[missing[0]] = 0 - sumOf(values);
  return filled;
}

/** A direct entry is valid when all four values are present, add up to zero and are not all zero. */
export function directDeltas(values: readonly (number | null)[]): Quad | null {
  if (values.length !== 4 || values.some((v) => v === null || !Number.isInteger(v) || Math.abs(v) > MAX_AMOUNT)) return null;
  if (sumOf(values) !== 0 || values.every((v) => v === 0)) return null;
  return values.map((v) => v ?? 0) as Quad;
}

export function removeEntry(entries: readonly Entry[], index: number): Entry[] {
  return entries.filter((_, i) => i !== index);
}

export function replaceEntry(entries: readonly Entry[], index: number, entry: Entry): Entry[] {
  return entries.map((e, i) => (i === index ? entry : e));
}

function cleanEntry(raw: unknown): Entry | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  switch (e.kind) {
    case 'draw':
      return { kind: 'draw' };
    case 'win': {
      if (!isSeat(e.winner)) return null;
      const from = e.from === null || e.from === undefined ? null : e.from;
      if (from !== null && (!isSeat(from) || from === e.winner)) return null;
      return { kind: 'win', winner: e.winner, from, tai: toInt(e.tai, 0, MAX_TAI, 0), bonus: e.bonus !== false };
    }
    case 'direct': {
      const values = Array.isArray(e.deltas) ? e.deltas.slice(0, 4).map((v) => (typeof v === 'number' ? v : null)) : [];
      const deltas = directDeltas(values);
      return deltas ? { kind: 'direct', deltas } : null;
    }
    case 'dealer':
      if (!isSeat(e.dealer)) return null;
      return {
        kind: 'dealer',
        dealer: e.dealer,
        streak: toInt(e.streak, 0, MAX_STREAK, 0),
        wind: e.wind === null || e.wind === undefined ? null : toInt(e.wind, 0, 3, 0),
      };
    default:
      return null;
  }
}

/** Rebuilds a game from stored JSON, dropping anything malformed. Never throws. */
export function sanitizeGame(raw: unknown): Game {
  const g = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const names = Array.isArray(g.names) ? g.names : [];
  const entries = Array.isArray(g.entries) ? g.entries : [];
  return {
    names: SEATS.map((i) => (typeof names[i] === 'string' ? cleanName(names[i]) : '')) as Game['names'],
    stakes: cleanStakes(g.stakes as Stakes | undefined),
    startDealer: isSeat(g.startDealer) ? g.startDealer : 0,
    entries: entries.flatMap((e) => cleanEntry(e) ?? []).slice(-MAX_ENTRIES),
  };
}

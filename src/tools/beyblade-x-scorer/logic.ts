// Beyblade X match scoring and win-rate statistics. Pure functions, no DOM.
// Official finishes: Spin 1 point, Over 2, Burst 2, Xtreme 3; the standard match goes to 4 points.

export type Finish = 'spin' | 'over' | 'burst' | 'xtreme';
export type Side = 0 | 1;

export const FINISHES: readonly Finish[] = ['spin', 'over', 'burst', 'xtreme'];
export const FINISH_POINTS: Readonly<Record<Finish, number>> = { spin: 1, over: 2, burst: 2, xtreme: 3 };
export const DEFAULT_TARGET = 4;
export const TARGETS: readonly number[] = [3, 4, 5, 7];
export const DECK_SIZE = 3;
export const NAME_MAX = 40;
export const HISTORY_MAX = 500;

/** One battle (round). winner null = draw, no points. bey = the Beyblade each side launched. */
export interface Round {
  winner: Side | null;
  finish: Finish | null;
  bey: [string, string];
}

export interface Match {
  target: number;
  names: [string, string];
  rounds: Round[];
}

export interface SavedMatch extends Match {
  /** Epoch ms when the match ended. */
  at: number;
}

export function cleanName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
}

export function roundPoints(round: Round): number {
  return round.winner === null || round.finish === null ? 0 : FINISH_POINTS[round.finish];
}

export function scores(rounds: readonly Round[]): [number, number] {
  const s: [number, number] = [0, 0];
  for (const r of rounds) if (r.winner !== null) s[r.winner] += roundPoints(r);
  return s;
}

/** The side that reached the target first, or null while the match is still running. */
export function matchWinner(match: Match): Side | null {
  const [a, b] = scores(match.rounds);
  if (a >= match.target && a > b) return 0;
  if (b >= match.target && b > a) return 1;
  return null;
}

export function addRound(match: Match, round: Round): Match {
  if (matchWinner(match) !== null) return match;
  const bey: [string, string] = [cleanName(round.bey[0]), cleanName(round.bey[1])];
  return { ...match, rounds: [...match.rounds, { ...round, bey }] };
}

export function undoRound(match: Match): Match {
  return { ...match, rounds: match.rounds.slice(0, -1) };
}

/** 3on3 decks rotate: after each battle both players move to their next Beyblade. */
export function nextDeckIndex(current: number, deckLength: number): number {
  return deckLength <= 1 ? 0 : (current + 1) % deckLength;
}

export interface Interval {
  low: number;
  high: number;
}

/** 95% Wilson score interval for a win rate; stays inside 0–1 even for tiny samples. */
export function wilson(wins: number, total: number, z = 1.96): Interval {
  if (total <= 0) return { low: 0, high: 1 };
  const p = wins / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const centre = (p + z2 / (2 * total)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;
  return { low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) };
}

/** Fewer battles than this and a win rate says little; the UI flags it. */
export const SMALL_SAMPLE = 10;

export interface BeyStats {
  name: string;
  battles: number;
  wins: number;
  losses: number;
  draws: number;
  /** Points scored per battle. */
  pointsPerBattle: number;
  /** Wins broken down by finish type. */
  winsBy: Record<Finish, number>;
  /** Losses broken down by the finish the opponent used. */
  lossesBy: Record<Finish, number>;
  winRate: number;
  interval: Interval;
}

const emptyFinishes = (): Record<Finish, number> => ({ spin: 0, over: 0, burst: 0, xtreme: 0 });
const keyOf = (name: string) => name.toLocaleLowerCase();

/** Per-Beyblade record across saved matches. Battles without a Beyblade name are skipped. */
export function beyStats(matches: readonly Match[]): BeyStats[] {
  const map = new Map<string, Omit<BeyStats, 'winRate' | 'interval' | 'pointsPerBattle'> & { points: number }>();
  for (const m of matches) {
    for (const r of m.rounds) {
      for (const side of [0, 1] as const) {
        const name = cleanName(r.bey[side] ?? '');
        if (!name) continue;
        const k = keyOf(name);
        let s = map.get(k);
        if (!s) {
          s = { name, battles: 0, wins: 0, losses: 0, draws: 0, points: 0, winsBy: emptyFinishes(), lossesBy: emptyFinishes() };
          map.set(k, s);
        }
        s.battles++;
        if (r.winner === null || r.finish === null) s.draws++;
        else if (r.winner === side) {
          s.wins++;
          s.points += FINISH_POINTS[r.finish];
          s.winsBy[r.finish]++;
        } else {
          s.losses++;
          s.lossesBy[r.finish]++;
        }
      }
    }
  }
  return [...map.values()]
    .map(({ points, ...s }) => ({
      ...s,
      pointsPerBattle: s.battles ? points / s.battles : 0,
      winRate: s.battles ? s.wins / s.battles : 0,
      interval: wilson(s.wins, s.battles),
    }))
    .sort((a, b) => b.battles - a.battles || b.winRate - a.winRate || a.name.localeCompare(b.name));
}

export interface Summary {
  matches: number;
  battles: number;
  draws: number;
  finishes: Record<Finish, number>;
  /** Battles per completed match. */
  battlesPerMatch: number;
}

export function summary(matches: readonly Match[]): Summary {
  const finishes = emptyFinishes();
  let battles = 0;
  let draws = 0;
  for (const m of matches) {
    for (const r of m.rounds) {
      battles++;
      if (r.winner === null || r.finish === null) draws++;
      else finishes[r.finish]++;
    }
  }
  return { matches: matches.length, battles, draws, finishes, battlesPerMatch: matches.length ? battles / matches.length : 0 };
}

/** Rebuilds history read from storage, dropping anything malformed. */
export function sanitizeHistory(value: unknown): SavedMatch[] {
  if (!Array.isArray(value)) return [];
  const out: SavedMatch[] = [];
  for (const m of value) {
    if (!m || typeof m !== 'object') continue;
    const { at, target, names, rounds } = m as Partial<SavedMatch>;
    if (typeof at !== 'number' || typeof target !== 'number' || !Array.isArray(names) || !Array.isArray(rounds)) continue;
    const clean: Round[] = [];
    for (const r of rounds as Partial<Round>[]) {
      if (!r || typeof r !== 'object') continue;
      const winner = r.winner === 0 || r.winner === 1 ? r.winner : null;
      const finish = winner !== null && FINISHES.includes(r.finish as Finish) ? (r.finish as Finish) : null;
      const bey = Array.isArray(r.bey) ? r.bey : [];
      clean.push({ winner: finish ? winner : null, finish, bey: [cleanName(String(bey[0] ?? '')), cleanName(String(bey[1] ?? ''))] });
    }
    out.push({ at, target, names: [cleanName(String(names[0] ?? '')), cleanName(String(names[1] ?? ''))], rounds: clean });
  }
  return out.slice(-HISTORY_MAX);
}

function csvCell(value: string | number): string {
  const text = String(value);
  // Leading = + - @ would run as a formula in spreadsheet apps.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** One row per battle, ready for Excel or Google Sheets. */
export function historyCsv(matches: readonly SavedMatch[], headers: string[], finishLabel: (f: Finish | null) => string): string {
  const rows = [headers];
  matches.forEach((m, i) => {
    const date = new Date(m.at).toISOString().slice(0, 10);
    m.rounds.forEach((r, j) => {
      rows.push([
        String(i + 1),
        date,
        String(j + 1),
        m.names[0],
        r.bey[0],
        m.names[1],
        r.bey[1],
        r.winner === null ? '' : m.names[r.winner],
        finishLabel(r.finish),
        String(roundPoints(r)),
      ]);
    });
  });
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

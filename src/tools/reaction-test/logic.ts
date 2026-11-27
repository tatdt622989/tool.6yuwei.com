// Pure logic for the reaction time test. Time (ms, e.g. performance.now()) and
// randomness are injected, so the state machine is fully deterministic in tests.

export const ROUNDS = 5;
export const MIN_DELAY_MS = 1500;
export const MAX_DELAY_MS = 5000;
/** Presses right after a screen change are ignored, so a double click does not skip it. */
export const LOCK_MS = 400;
/** Results faster than this are almost certainly anticipation, not reaction. */
export const SUSPECT_MS = 100;

export type Phase = 'idle' | 'waiting' | 'go' | 'early' | 'result' | 'done';

export interface ReactionState {
  phase: Phase;
  /** Completed reaction times in ms, in order. */
  results: number[];
  /** Clock value at which the green screen is due (phase 'waiting'). */
  goDueAt: number | null;
  /** Clock value of the frame that painted green (phase 'go'). */
  goAt: number | null;
  /** Presses before this clock value are ignored. */
  lockedUntil: number;
  /** How many times the player clicked too early in this run. */
  earlyCount: number;
}

export type Random = () => number;

export function createState(): ReactionState {
  return { phase: 'idle', results: [], goDueAt: null, goAt: null, lockedUntil: 0, earlyCount: 0 };
}

/** Random wait in [MIN_DELAY_MS, MAX_DELAY_MS). */
export function randomDelay(random: Random = Math.random): number {
  const r = Math.min(Math.max(random(), 0), 0.999999);
  return Math.round(MIN_DELAY_MS + r * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function startWaiting(state: ReactionState, now: number, random: Random): ReactionState {
  const fresh = state.phase === 'done' ? createState() : state;
  return { ...fresh, phase: 'waiting', goDueAt: now + randomDelay(random), goAt: null };
}

/** Handles a click / tap / key press. */
export function press(state: ReactionState, now: number, random: Random = Math.random): ReactionState {
  if (now < state.lockedUntil) return state;
  switch (state.phase) {
    case 'idle':
    case 'early':
    case 'result':
    case 'done':
      return startWaiting(state, now, random);
    case 'waiting':
      // Still red on screen (even if the timer is overdue but not yet painted): too early.
      return { ...state, phase: 'early', goDueAt: null, lockedUntil: now + LOCK_MS, earlyCount: state.earlyCount + 1 };
    case 'go': {
      const ms = Math.max(0, now - (state.goAt ?? now));
      const results = [...state.results, ms];
      return {
        ...state,
        phase: results.length >= ROUNDS ? 'done' : 'result',
        results,
        goDueAt: null,
        goAt: null,
        lockedUntil: now + LOCK_MS,
      };
    }
  }
}

/** Called with the timestamp of the animation frame in which the screen turned green. */
export function showGo(state: ReactionState, paintedAt: number): ReactionState {
  if (state.phase !== 'waiting') return state;
  return { ...state, phase: 'go', goAt: paintedAt, goDueAt: null };
}

/** Cancels a round in progress (e.g. tab hidden). Completed rounds are kept. */
export function abort(state: ReactionState): ReactionState {
  if (state.phase !== 'waiting' && state.phase !== 'go') return state;
  return { ...state, phase: 'idle', goDueAt: null, goAt: null };
}

/** Starts over from round 1. */
export function reset(): ReactionState {
  return createState();
}

/** 1-based number of the round currently being played or just finished. */
export function currentRound(state: ReactionState): number {
  if (state.phase === 'result' || state.phase === 'done') return state.results.length;
  return Math.min(ROUNDS, state.results.length + 1);
}

export interface Summary {
  count: number;
  average: number;
  best: number;
  worst: number;
  median: number;
}

export function summarize(results: readonly number[]): Summary | null {
  if (results.length === 0) return null;
  const sorted = [...results].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const sum = sorted.reduce((a, b) => a + b, 0);
  return { count: sorted.length, average: sum / sorted.length, best: sorted[0], worst: sorted[sorted.length - 1], median };
}

export interface Rating {
  id: string;
  label: string;
  note: string;
  /** Upper bound (exclusive) in ms. */
  max: number;
}

export const RATINGS: readonly Rating[] = [
  { id: 'elite', label: '頂尖', note: '電競選手等級的反應速度', max: 180 },
  { id: 'fast', label: '很快', note: '明顯快於一般人', max: 220 },
  { id: 'good', label: '優於平均', note: '比多數人稍快', max: 260 },
  { id: 'average', label: '一般', note: '落在一般成人的常見範圍', max: 300 },
  { id: 'slow', label: '稍慢', note: '可能受裝置延遲或專注度影響', max: 360 },
  { id: 'slower', label: '偏慢', note: '休息一下、換有線滑鼠再測試看看', max: Number.POSITIVE_INFINITY },
];

export function rateMs(ms: number): Rating {
  return RATINGS.find((r) => ms < r.max) ?? RATINGS[RATINGS.length - 1];
}

export interface BestRecord {
  bestAverage: number | null;
  bestSingle: number | null;
}

export function mergeBest(prev: BestRecord, results: readonly number[]): { best: BestRecord; newAverage: boolean; newSingle: boolean } {
  const s = summarize(results);
  if (!s) return { best: prev, newAverage: false, newSingle: false };
  const newAverage = s.count >= ROUNDS && (prev.bestAverage === null || s.average < prev.bestAverage);
  const newSingle = prev.bestSingle === null || s.best < prev.bestSingle;
  return {
    best: {
      bestAverage: newAverage ? s.average : prev.bestAverage,
      bestSingle: newSingle ? s.best : prev.bestSingle,
    },
    newAverage,
    newSingle,
  };
}

export function sanitizeBest(raw: unknown): BestRecord {
  const pick = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
  if (!raw || typeof raw !== 'object') return { bestAverage: null, bestSingle: null };
  const r = raw as Record<string, unknown>;
  return { bestAverage: pick(r.bestAverage), bestSingle: pick(r.bestSingle) };
}

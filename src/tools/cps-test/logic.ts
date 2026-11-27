// Pure logic for the CPS (clicks per second) test. The clock is always passed in
// (milliseconds, e.g. performance.now()), so every function is deterministic.

export const MODES = [1, 5, 10, 30, 60] as const;
export type CpsMode = (typeof MODES)[number];

/** After a test ends, clicks are ignored for this long so a trailing click does not restart it. */
export const COOLDOWN_MS = 1000;

export type Phase = 'idle' | 'running' | 'done';

export interface CpsSession {
  phase: Phase;
  /** Test length in seconds. */
  duration: CpsMode;
  /** Clock value of the first click (test start). */
  startedAt: number | null;
  /** Clock value when the test was finalised. */
  endedAt: number | null;
  /** Click times relative to startedAt, in ms. The first click is at 0. */
  clicks: number[];
}

export function isMode(value: unknown): value is CpsMode {
  return MODES.includes(value as CpsMode);
}

export function createSession(duration: CpsMode): CpsSession {
  return { phase: 'idle', duration, startedAt: null, endedAt: null, clicks: [] };
}

function durationMs(s: CpsSession): number {
  return s.duration * 1000;
}

/** Finalises the session when its time is up. Returns the same object when nothing changes. */
export function tick(s: CpsSession, now: number): CpsSession {
  if (s.phase !== 'running' || s.startedAt === null) return s;
  if (now - s.startedAt < durationMs(s)) return s;
  return { ...s, phase: 'done', endedAt: s.startedAt + durationMs(s) };
}

/**
 * Registers one click. The first click starts the timer and counts.
 * Clicks after the deadline end the test without counting. Once done, a click
 * after the cooldown starts a fresh session of the same length.
 */
export function registerClick(s: CpsSession, now: number): CpsSession {
  if (s.phase === 'done') {
    if (s.endedAt !== null && now - s.endedAt < COOLDOWN_MS) return s;
    return registerClick(createSession(s.duration), now);
  }
  if (s.phase === 'idle' || s.startedAt === null) {
    return { ...s, phase: 'running', startedAt: now, endedAt: null, clicks: [0] };
  }
  const ticked = tick(s, now);
  if (ticked.phase === 'done') return ticked;
  return { ...s, clicks: [...s.clicks, now - s.startedAt] };
}

export function elapsedMs(s: CpsSession, now: number): number {
  if (s.startedAt === null) return 0;
  const end = s.phase === 'done' && s.endedAt !== null ? s.endedAt : now;
  return Math.min(durationMs(s), Math.max(0, end - s.startedAt));
}

export function remainingMs(s: CpsSession, now: number): number {
  return durationMs(s) - elapsedMs(s, now);
}

/**
 * CPS shown while the test runs. Divides by at least one second (or the full
 * duration if shorter) so the first few clicks do not show absurd spikes.
 */
export function liveCps(s: CpsSession, now: number): number {
  if (s.clicks.length === 0) return 0;
  const seconds = Math.max(elapsedMs(s, now) / 1000, Math.min(1, s.duration));
  return s.clicks.length / seconds;
}

/** Final score: clicks divided by the full test length. */
export function finalCps(s: CpsSession): number {
  return s.clicks.length / s.duration;
}

/** Clicks counted in each whole second of the test (length = duration). */
export function clicksPerSecond(s: CpsSession): number[] {
  const buckets = new Array<number>(s.duration).fill(0);
  for (const t of s.clicks) {
    const i = Math.min(s.duration - 1, Math.floor(t / 1000));
    buckets[i]++;
  }
  return buckets;
}

export interface Rank {
  id: string;
  label: string;
  note: string;
  /** Lower bound (inclusive) in CPS. */
  min: number;
}

/** Ordered from slowest to fastest. */
export const RANKS: readonly Rank[] = [
  { id: 'sloth', label: '樹懶', note: '慢慢來，先找到順手的點擊姿勢', min: 0 },
  { id: 'turtle', label: '烏龜', note: '比一般人慢一些，多練幾次就會進步', min: 3 },
  { id: 'rabbit', label: '兔子', note: '一般人的正常水準', min: 5 },
  { id: 'cheetah', label: '獵豹', note: '比大多數人快，手指很靈活', min: 7 },
  { id: 'falcon', label: '獵鷹', note: '遊戲玩家等級，可能已經會用 Jitter 點擊', min: 9 },
  { id: 'lightning', label: '閃電', note: 'Jitter 高手的水準', min: 11 },
  { id: 'supersonic', label: '超音速', note: '蝴蝶點擊或拖曳點擊才可能達到', min: 14 },
  { id: 'machine', label: '連點器等級', note: '已接近或超過人類極限', min: 20 },
];

export function rankFor(cps: number): Rank {
  let found = RANKS[0];
  for (const r of RANKS) if (cps >= r.min) found = r;
  return found;
}

export type BestScores = Partial<Record<`${CpsMode}`, number>>;

/** Merges a new score into the per-mode best table. */
export function mergeBest(best: BestScores, mode: CpsMode, cps: number): { best: BestScores; isNew: boolean } {
  const key = `${mode}` as const;
  const previous = best[key];
  if (!Number.isFinite(cps) || cps <= 0 || (previous !== undefined && previous >= cps)) {
    return { best, isNew: false };
  }
  return { best: { ...best, [key]: cps }, isNew: true };
}

/** Keeps only valid positive scores for known modes (for data read back from storage). */
export function sanitizeBest(raw: unknown): BestScores {
  const out: BestScores = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const mode of MODES) {
    const v = (raw as Record<string, unknown>)[String(mode)];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[`${mode}`] = v;
  }
  return out;
}

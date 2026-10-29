// Pomodoro state machine. Like the countdown timer it stores an absolute end time,
// and `advance` replays any phases that ended while the tab was in the background.

export type Phase = 'focus' | 'short' | 'long';
export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  focusMin: number;
  shortMin: number;
  longMin: number;
  /** A long break replaces the short one after every N completed focus sessions. */
  longEvery: number;
  /** Start the next phase automatically when one ends. */
  autoStart: boolean;
  sound: boolean;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
  autoStart: false,
  sound: true,
};

export const LIMITS = {
  focusMin: [1, 180],
  shortMin: [1, 60],
  longMin: [1, 120],
  longEvery: [1, 12],
} as const;

export const PHASE_LABEL: Record<Phase, string> = { focus: '專注', short: '短休息', long: '長休息' };

/** Coerces stored or user-entered values into valid settings. */
export function normalizeSettings(raw: Partial<Record<keyof PomodoroSettings, unknown>> | null | undefined): PomodoroSettings {
  const out = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    const value = Number(raw?.[key]);
    if (raw?.[key] === '' || raw?.[key] === null || !Number.isFinite(value)) continue;
    const [min, max] = LIMITS[key];
    out[key] = Math.min(max, Math.max(min, Math.round(value)));
  }
  if (typeof raw?.autoStart === 'boolean') out.autoStart = raw.autoStart;
  if (typeof raw?.sound === 'boolean') out.sound = raw.sound;
  return out;
}

export function phaseDuration(phase: Phase, settings: PomodoroSettings): number {
  const min = phase === 'focus' ? settings.focusMin : phase === 'short' ? settings.shortMin : settings.longMin;
  return min * 60_000;
}

/** Phase that follows `phase`. `completed` is the number of focus sessions done after it ends. */
export function nextPhase(phase: Phase, completed: number, longEvery: number): Phase {
  if (phase !== 'focus') return 'focus';
  return completed > 0 && completed % longEvery === 0 ? 'long' : 'short';
}

export interface PomodoroState {
  phase: Phase;
  status: PomodoroStatus;
  /** Remaining time while idle or paused. */
  remainingMs: number;
  /** Absolute end timestamp while running. */
  endsAt: number | null;
  /** Focus sessions completed in this sitting. */
  completed: number;
}

export function createPomodoro(settings: PomodoroSettings): PomodoroState {
  return { phase: 'focus', status: 'idle', remainingMs: phaseDuration('focus', settings), endsAt: null, completed: 0 };
}

export function remainingOf(state: PomodoroState, now: number): number {
  if (state.status === 'running' && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.remainingMs;
}

/** Elapsed fraction of the current phase, 0–1 (drives the progress ring). */
export function progressOf(state: PomodoroState, settings: PomodoroSettings, now: number): number {
  const total = phaseDuration(state.phase, settings);
  return Math.min(1, Math.max(0, 1 - remainingOf(state, now) / total));
}

export function startPomodoro(state: PomodoroState, now: number): PomodoroState {
  if (state.status === 'running') return state;
  return { ...state, status: 'running', endsAt: now + state.remainingMs };
}

export function pausePomodoro(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', remainingMs: remainingOf(state, now), endsAt: null };
}

/** Stops and rewinds the current phase. */
export function resetPhase(state: PomodoroState, settings: PomodoroSettings): PomodoroState {
  return { ...state, status: 'idle', remainingMs: phaseDuration(state.phase, settings), endsAt: null };
}

/** Manually switches to a phase (stopped, full length). */
export function selectPhase(state: PomodoroState, phase: Phase, settings: PomodoroSettings): PomodoroState {
  return { ...state, phase, status: 'idle', remainingMs: phaseDuration(phase, settings), endsAt: null };
}

/** Applies changed settings: an idle phase picks up its new length; a running or paused one is left alone. */
export function applySettings(state: PomodoroState, settings: PomodoroSettings): PomodoroState {
  return state.status === 'idle' ? resetPhase(state, settings) : state;
}

/**
 * Moves on to the next phase without counting the current one. A skipped focus session
 * leads to the break it would have earned; keeps running if auto-start is on.
 */
export function skipPhase(state: PomodoroState, settings: PomodoroSettings, now: number): PomodoroState {
  const phase = nextPhase(state.phase, state.completed + 1, settings.longEvery);
  const duration = phaseDuration(phase, settings);
  const keepRunning = state.status === 'running' && settings.autoStart;
  return {
    ...state,
    phase,
    status: keepRunning ? 'running' : 'idle',
    remainingMs: duration,
    endsAt: keepRunning ? now + duration : null,
  };
}

export interface AdvanceResult {
  state: PomodoroState;
  /** Phases that ended, in order. Usually zero or one; more after a long background gap. */
  finished: Phase[];
}

/**
 * Completes every phase whose end time has passed. With auto-start the next phase begins
 * exactly at the previous end time, so the schedule doesn't drift in a background tab.
 */
export function advance(state: PomodoroState, settings: PomodoroSettings, now: number): AdvanceResult {
  const finished: Phase[] = [];
  let s = state;
  while (s.status === 'running' && s.endsAt !== null && now >= s.endsAt && finished.length < 1000) {
    const endedAt = s.endsAt;
    const completed = s.completed + (s.phase === 'focus' ? 1 : 0);
    const phase = nextPhase(s.phase, completed, settings.longEvery);
    const duration = phaseDuration(phase, settings);
    finished.push(s.phase);
    s = settings.autoStart
      ? { phase, status: 'running', remainingMs: duration, endsAt: endedAt + duration, completed }
      : { phase, status: 'idle', remainingMs: duration, endsAt: null, completed };
  }
  return { state: s, finished };
}

/** Position within the current set of focus sessions, e.g. 2 of 4. */
export function cyclePosition(state: PomodoroState, longEvery: number): { current: number; total: number } {
  const done = state.completed % longEvery;
  // During a long break the set just finished, so show it as full.
  if (state.phase === 'long' && state.completed > 0 && done === 0) return { current: longEvery, total: longEvery };
  return { current: state.phase === 'focus' ? done + 1 : done, total: longEvery };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "MM:SS", rounding up to whole seconds; minutes can exceed 59 (e.g. "90:00"). */
export function formatClock(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function formatMinutes(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} 分鐘`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} 小時 ${m} 分` : `${h} 小時`;
}

/* ---------- Daily tally (persisted, resets each local day) ---------- */

export interface DailyRecord {
  date: string;
  count: number;
  focusMs: number;
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Returns today's record, starting fresh when the stored one is from another day or malformed. */
export function rollDaily(stored: unknown, today: string): DailyRecord {
  const fresh = { date: today, count: 0, focusMs: 0 };
  if (!stored || typeof stored !== 'object') return fresh;
  const r = stored as Partial<DailyRecord>;
  if (r.date !== today) return fresh;
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  return { date: today, count: ok(r.count) ? Math.floor(r.count) : 0, focusMs: ok(r.focusMs) ? r.focusMs : 0 };
}

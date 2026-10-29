// Countdown state machine. While running it stores the absolute end time, so the
// remaining time is always `endsAt - now` and stays correct in a throttled background tab.

export type CountdownStatus = 'idle' | 'running' | 'paused' | 'done';

export interface CountdownState {
  status: CountdownStatus;
  /** The duration the user set. */
  durationMs: number;
  /** Remaining time while idle or paused (ignored while running). */
  remainingMs: number;
  /** Absolute end timestamp while running, otherwise null. */
  endsAt: number | null;
}

export const MAX_DURATION_MS = (99 * 3600 + 59 * 60 + 59) * 1000;
export const PRESET_MINUTES = [1, 3, 5, 10, 15, 30] as const;

export function clampDuration(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.min(MAX_DURATION_MS, Math.round(ms / 1000) * 1000);
}

export function createCountdown(durationMs: number): CountdownState {
  const d = clampDuration(durationMs);
  return { status: 'idle', durationMs: d, remainingMs: d, endsAt: null };
}

export function remainingOf(state: CountdownState, now: number): number {
  if (state.status === 'running' && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.remainingMs;
}

/** Starts or resumes. After finishing, starting again restarts the full duration. */
export function startCountdown(state: CountdownState, now: number): CountdownState {
  if (state.status === 'running' || state.durationMs <= 0) return state;
  const remaining = state.status === 'done' || state.remainingMs <= 0 ? state.durationMs : state.remainingMs;
  return { ...state, status: 'running', remainingMs: remaining, endsAt: now + remaining };
}

export function pauseCountdown(state: CountdownState, now: number): CountdownState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', remainingMs: remainingOf(state, now), endsAt: null };
}

export function resetCountdown(state: CountdownState): CountdownState {
  return createCountdown(state.durationMs);
}

/** Changing the duration stops any countdown in progress. */
export function setDuration(_state: CountdownState, durationMs: number): CountdownState {
  return createCountdown(durationMs);
}

/** Moves a running countdown to 'done' once its end time has passed. */
export function tickCountdown(state: CountdownState, now: number): CountdownState {
  if (state.status !== 'running' || state.endsAt === null || now < state.endsAt) return state;
  return { ...state, status: 'done', remainingMs: 0, endsAt: null };
}

/** Fraction of the duration still remaining, 0–1. */
export function remainingFraction(state: CountdownState, now: number): number {
  if (state.durationMs <= 0) return 0;
  return Math.min(1, Math.max(0, remainingOf(state, now) / state.durationMs));
}

export function toMs(hours: number, minutes: number, seconds: number): number {
  const n = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  return clampDuration((n(hours) * 3600 + n(minutes) * 60 + n(seconds)) * 1000);
}

export function splitDuration(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, Math.round(ms / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor(total / 60) % 60, s: total % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Formats remaining time, rounding up to whole seconds so the display reads 00:01
 * until the very end and only shows 00:00 when time is up.
 */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Human-readable duration such as「1 小時 30 分」or「45 秒」. */
export function describeDuration(ms: number): string {
  const { h, m, s } = splitDuration(ms);
  const parts: string[] = [];
  if (h) parts.push(`${h} 小時`);
  if (m) parts.push(`${m} 分`);
  if (s) parts.push(`${s} 秒`);
  return parts.length ? parts.join(' ') : '0 秒';
}

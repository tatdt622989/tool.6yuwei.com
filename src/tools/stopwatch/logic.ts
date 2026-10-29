// Stopwatch state machine. Time is never counted by ticks: elapsed time is always
// derived from timestamps, so a throttled background tab or a page reload stays accurate.

export interface StopwatchState {
  /** Timestamp (ms) when the current running segment began; null while paused or idle. */
  startedAt: number | null;
  /** Time accumulated by earlier running segments. */
  accumulated: number;
  /** Cumulative elapsed time at each lap mark, ascending. */
  splits: number[];
}

export function initialStopwatch(): StopwatchState {
  return { startedAt: null, accumulated: 0, splits: [] };
}

export function isRunning(state: StopwatchState): boolean {
  return state.startedAt !== null;
}

export function elapsed(state: StopwatchState, now: number): number {
  return state.accumulated + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));
}

export function start(state: StopwatchState, now: number): StopwatchState {
  return isRunning(state) ? state : { ...state, startedAt: now };
}

export function pause(state: StopwatchState, now: number): StopwatchState {
  return isRunning(state) ? { ...state, accumulated: elapsed(state, now), startedAt: null } : state;
}

export function toggle(state: StopwatchState, now: number): StopwatchState {
  return isRunning(state) ? pause(state, now) : start(state, now);
}

/** Records a lap mark. Only allowed while running; ignores a duplicate mark at the same instant. */
export function lap(state: StopwatchState, now: number): StopwatchState {
  if (!isRunning(state)) return state;
  const t = elapsed(state, now);
  if (state.splits.length > 0 && state.splits[state.splits.length - 1] >= t) return state;
  return { ...state, splits: [...state.splits, t] };
}

export function reset(): StopwatchState {
  return initialStopwatch();
}

/** Time spent in the lap that is currently in progress. */
export function currentLap(state: StopwatchState, now: number): number {
  const last = state.splits.length > 0 ? state.splits[state.splits.length - 1] : 0;
  return elapsed(state, now) - last;
}

export interface LapRow {
  /** 1-based lap number. */
  index: number;
  /** Duration of this lap alone. */
  lap: number;
  /** Cumulative time when the lap was marked. */
  split: number;
  tag: 'fastest' | 'slowest' | null;
}

/** Lap table rows, oldest first. Fastest / slowest are tagged once there are two or more distinct laps. */
export function lapRows(splits: readonly number[]): LapRow[] {
  const rows: LapRow[] = splits.map((split, i) => ({
    index: i + 1,
    lap: split - (i === 0 ? 0 : splits[i - 1]),
    split,
    tag: null,
  }));
  if (rows.length < 2) return rows;
  const laps = rows.map((r) => r.lap);
  const min = Math.min(...laps);
  const max = Math.max(...laps);
  if (min === max) return rows;
  for (const row of rows) {
    if (row.lap === min) row.tag = 'fastest';
    else if (row.lap === max) row.tag = 'slowest';
  }
  return rows;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Splits a duration into the large part ("MM:SS" or "H:MM:SS") and the hundredths (".cc"). */
export function formatStopwatchParts(ms: number): { main: string; fraction: string } {
  const totalCs = Math.floor(Math.max(0, ms) / 10);
  const cs = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  const main = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return { main, fraction: `.${pad(cs)}` };
}

export function formatStopwatch(ms: number): string {
  const { main, fraction } = formatStopwatchParts(ms);
  return main + fraction;
}

/** Plain-text lap table (tab separated) for pasting into notes or a spreadsheet. */
export function lapsToText(splits: readonly number[]): string {
  if (splits.length === 0) return '';
  const lines = ['圈數\t單圈時間\t累計時間'];
  for (const row of lapRows(splits)) lines.push(`${row.index}\t${formatStopwatch(row.lap)}\t${formatStopwatch(row.split)}`);
  return lines.join('\n');
}

/** Validates a state restored from storage so a corrupted value can never break the page. */
export function restoreState(value: unknown, now: number): StopwatchState {
  if (!value || typeof value !== 'object') return initialStopwatch();
  const v = value as Partial<StopwatchState>;
  const okNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  if (!okNumber(v.accumulated)) return initialStopwatch();
  if (v.startedAt !== null && !(okNumber(v.startedAt) && v.startedAt <= now)) return initialStopwatch();
  if (!Array.isArray(v.splits) || !v.splits.every(okNumber)) return initialStopwatch();
  for (let i = 1; i < v.splits.length; i++) if (v.splits[i] < v.splits[i - 1]) return initialStopwatch();
  return { startedAt: v.startedAt ?? null, accumulated: v.accumulated, splits: v.splits.slice() };
}

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  advance,
  applySettings,
  createPomodoro,
  cyclePosition,
  formatClock,
  formatMinutes,
  localDateKey,
  nextPhase,
  normalizeSettings,
  pausePomodoro,
  phaseDuration,
  progressOf,
  remainingOf,
  resetPhase,
  rollDaily,
  selectPhase,
  skipPhase,
  startPomodoro,
  type PomodoroSettings,
} from './logic';

const MIN = 60_000;
const manual: PomodoroSettings = { ...DEFAULT_SETTINGS, autoStart: false };
const auto: PomodoroSettings = { ...DEFAULT_SETTINGS, autoStart: true };

describe('settings', () => {
  it('fills defaults and clamps out-of-range values', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ focusMin: 999, shortMin: 0, longMin: '20', longEvery: 2.6 })).toMatchObject({
      focusMin: 180,
      shortMin: 1,
      longMin: 20,
      longEvery: 3,
    });
  });

  it('ignores blanks and garbage', () => {
    expect(normalizeSettings({ focusMin: '', shortMin: 'abc', autoStart: 'yes' })).toEqual(DEFAULT_SETTINGS);
  });
});

describe('phase sequence', () => {
  it('alternates focus and short breaks, with a long break every N sessions', () => {
    expect(nextPhase('focus', 1, 4)).toBe('short');
    expect(nextPhase('focus', 4, 4)).toBe('long');
    expect(nextPhase('short', 1, 4)).toBe('focus');
    expect(nextPhase('long', 4, 4)).toBe('focus');
  });

  it('runs a full default cycle with auto-start', () => {
    let s = startPomodoro(createPomodoro(auto), 0);
    const seen: string[] = [];
    let t = 0;
    for (let i = 0; i < 8; i++) {
      t = s.endsAt!;
      const r = advance(s, auto, t);
      seen.push(...r.finished);
      s = r.state;
    }
    expect(seen).toEqual(['focus', 'short', 'focus', 'short', 'focus', 'short', 'focus', 'long']);
    expect(s.completed).toBe(4);
    expect(s.phase).toBe('focus');
    expect(t).toBe((25 * 4 + 5 * 3 + 15) * MIN);
  });
});

describe('timing', () => {
  it('pauses and resumes from timestamps', () => {
    let s = startPomodoro(createPomodoro(manual), 1000);
    expect(remainingOf(s, 1000 + 5 * MIN)).toBe(20 * MIN);
    s = pausePomodoro(s, 1000 + 5 * MIN);
    expect(remainingOf(s, 10 ** 9)).toBe(20 * MIN);
    expect(progressOf(s, manual, 0)).toBeCloseTo(0.2);
  });

  it('stops after one phase without auto-start', () => {
    const s = startPomodoro(createPomodoro(manual), 0);
    const r = advance(s, manual, 2 * 60 * MIN);
    expect(r.finished).toEqual(['focus']);
    expect(r.state).toMatchObject({ phase: 'short', status: 'idle', completed: 1, remainingMs: 5 * MIN });
  });

  it('catches up on several phases after a background gap without drifting', () => {
    const s = startPomodoro(createPomodoro(auto), 0);
    const r = advance(s, auto, 31 * MIN);
    expect(r.finished).toEqual(['focus', 'short']);
    expect(r.state.phase).toBe('focus');
    expect(r.state.endsAt).toBe(55 * MIN);
  });

  it('does nothing before the end time', () => {
    const s = startPomodoro(createPomodoro(auto), 0);
    expect(advance(s, auto, 25 * MIN - 1)).toEqual({ state: s, finished: [] });
  });
});

describe('manual controls', () => {
  it('skip does not count the focus session', () => {
    const s = skipPhase(startPomodoro(createPomodoro(manual), 0), manual, 1000);
    expect(s).toMatchObject({ phase: 'short', status: 'idle', completed: 0 });
  });

  it('skip keeps running with auto-start', () => {
    const s = skipPhase(startPomodoro(createPomodoro(auto), 0), auto, 1000);
    expect(s).toMatchObject({ phase: 'short', status: 'running', endsAt: 1000 + 5 * MIN });
  });

  it('select, reset and settings changes', () => {
    let s = selectPhase(createPomodoro(manual), 'long', manual);
    expect(s.remainingMs).toBe(phaseDuration('long', manual));
    s = resetPhase(pausePomodoro(startPomodoro(s, 0), MIN), manual);
    expect(s).toMatchObject({ status: 'idle', remainingMs: 15 * MIN });
    expect(applySettings(s, { ...manual, longMin: 30 }).remainingMs).toBe(30 * MIN);
    const running = startPomodoro(s, 0);
    expect(applySettings(running, { ...manual, longMin: 30 })).toBe(running);
  });
});

describe('display helpers', () => {
  it('reports the position within the set', () => {
    const base = createPomodoro(manual);
    expect(cyclePosition(base, 4)).toEqual({ current: 1, total: 4 });
    expect(cyclePosition({ ...base, phase: 'short', completed: 2 }, 4)).toEqual({ current: 2, total: 4 });
    expect(cyclePosition({ ...base, phase: 'long', completed: 4 }, 4)).toEqual({ current: 4, total: 4 });
    expect(cyclePosition({ ...base, phase: 'focus', completed: 4 }, 4)).toEqual({ current: 1, total: 4 });
  });

  it('formats the clock and totals', () => {
    expect(formatClock(25 * MIN)).toBe('25:00');
    expect(formatClock(1)).toBe('00:01');
    expect(formatClock(90 * MIN)).toBe('90:00');
    expect(formatMinutes(50 * MIN)).toBe('50 分鐘');
    expect(formatMinutes(125 * MIN)).toBe('2 小時 5 分');
    expect(formatMinutes(120 * MIN)).toBe('2 小時');
  });
});

describe('daily record', () => {
  it('keeps today and resets on a new day', () => {
    const today = localDateKey(new Date(2026, 9, 29, 23, 59));
    expect(today).toBe('2026-10-29');
    expect(rollDaily({ date: today, count: 3, focusMs: 75 * MIN }, today)).toEqual({ date: today, count: 3, focusMs: 75 * MIN });
    expect(rollDaily({ date: '2026-10-28', count: 3, focusMs: 1 }, today)).toEqual({ date: today, count: 0, focusMs: 0 });
    expect(rollDaily('bad', today).count).toBe(0);
  });
});

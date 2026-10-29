import { describe, expect, it } from 'vitest';
import {
  currentLap,
  elapsed,
  formatStopwatch,
  formatStopwatchParts,
  initialStopwatch,
  isRunning,
  lap,
  lapRows,
  lapsToText,
  pause,
  reset,
  restoreState,
  start,
  toggle,
} from './logic';

describe('stopwatch state machine', () => {
  it('derives elapsed time from timestamps', () => {
    let s = start(initialStopwatch(), 1000);
    expect(isRunning(s)).toBe(true);
    expect(elapsed(s, 4500)).toBe(3500);
    s = pause(s, 5000);
    expect(isRunning(s)).toBe(false);
    expect(elapsed(s, 99_999)).toBe(4000);
  });

  it('accumulates across pause and resume', () => {
    let s = start(initialStopwatch(), 0);
    s = pause(s, 2000);
    s = start(s, 10_000);
    expect(elapsed(s, 13_000)).toBe(5000);
  });

  it('toggle starts and pauses; start while running is a no-op', () => {
    let s = toggle(initialStopwatch(), 100);
    expect(isRunning(s)).toBe(true);
    expect(start(s, 500)).toBe(s);
    s = toggle(s, 600);
    expect(isRunning(s)).toBe(false);
    expect(elapsed(s, 0)).toBe(500);
  });

  it('records laps only while running and ignores duplicates', () => {
    let s = lap(initialStopwatch(), 0);
    expect(s.splits).toEqual([]);
    s = start(s, 0);
    s = lap(s, 1000);
    s = lap(s, 1000);
    s = lap(s, 2500);
    expect(s.splits).toEqual([1000, 2500]);
    expect(currentLap(s, 3000)).toBe(500);
  });

  it('never goes negative if the clock moves backwards', () => {
    const s = start(initialStopwatch(), 5000);
    expect(elapsed(s, 4000)).toBe(0);
  });

  it('reset clears everything', () => {
    expect(reset()).toEqual(initialStopwatch());
  });
});

describe('lapRows', () => {
  it('computes lap durations and tags fastest / slowest', () => {
    const rows = lapRows([1000, 3000, 4500]);
    expect(rows.map((r) => r.lap)).toEqual([1000, 2000, 1500]);
    expect(rows.map((r) => r.tag)).toEqual(['fastest', 'slowest', null]);
  });

  it('does not tag a single lap or identical laps', () => {
    expect(lapRows([1000])[0].tag).toBeNull();
    expect(lapRows([1000, 2000]).every((r) => r.tag === null)).toBe(true);
  });
});

describe('formatting', () => {
  it('formats minutes, seconds and hundredths', () => {
    expect(formatStopwatch(0)).toBe('00:00.00');
    expect(formatStopwatch(61_234)).toBe('01:01.23');
    expect(formatStopwatch(59_999)).toBe('00:59.99');
  });

  it('adds hours past 60 minutes', () => {
    expect(formatStopwatchParts(3_723_450)).toEqual({ main: '1:02:03', fraction: '.45' });
  });

  it('exports laps as tab separated text', () => {
    expect(lapsToText([])).toBe('');
    expect(lapsToText([1500, 4000]).split('\n')).toEqual([
      '圈數\t單圈時間\t累計時間',
      '1\t00:01.50\t00:01.50',
      '2\t00:02.50\t00:04.00',
    ]);
  });
});

describe('restoreState', () => {
  it('accepts a valid saved state', () => {
    const saved = { startedAt: 1000, accumulated: 500, splits: [100, 400] };
    expect(restoreState(saved, 2000)).toEqual(saved);
  });

  it('rejects malformed values', () => {
    expect(restoreState(null, 0)).toEqual(initialStopwatch());
    expect(restoreState({ startedAt: 'x', accumulated: 0, splits: [] }, 0)).toEqual(initialStopwatch());
    expect(restoreState({ startedAt: null, accumulated: 0, splits: [5, 2] }, 0)).toEqual(initialStopwatch());
    expect(restoreState({ startedAt: 9000, accumulated: 0, splits: [] }, 1000)).toEqual(initialStopwatch());
  });
});

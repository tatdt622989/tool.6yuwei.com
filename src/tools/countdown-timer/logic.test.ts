import { describe, expect, it } from 'vitest';
import {
  MAX_DURATION_MS,
  clampDuration,
  createCountdown,
  describeDuration,
  formatCountdown,
  pauseCountdown,
  remainingFraction,
  remainingOf,
  resetCountdown,
  setDuration,
  splitDuration,
  startCountdown,
  tickCountdown,
  toMs,
} from './logic';

describe('countdown state machine', () => {
  it('computes remaining time from the end timestamp', () => {
    const s = startCountdown(createCountdown(60_000), 1000);
    expect(s.status).toBe('running');
    expect(s.endsAt).toBe(61_000);
    expect(remainingOf(s, 31_000)).toBe(30_000);
    expect(remainingOf(s, 999_999)).toBe(0);
  });

  it('pauses and resumes without losing time', () => {
    let s = startCountdown(createCountdown(10_000), 0);
    s = pauseCountdown(s, 4000);
    expect(s.status).toBe('paused');
    expect(remainingOf(s, 50_000)).toBe(6000);
    s = startCountdown(s, 50_000);
    expect(s.endsAt).toBe(56_000);
  });

  it('finishes once the end time passes, even after a long gap', () => {
    let s = startCountdown(createCountdown(5000), 0);
    expect(tickCountdown(s, 4999)).toBe(s);
    s = tickCountdown(s, 3_600_000);
    expect(s.status).toBe('done');
    expect(remainingOf(s, 3_600_000)).toBe(0);
  });

  it('restarts the full duration after finishing', () => {
    const done = tickCountdown(startCountdown(createCountdown(5000), 0), 5000);
    const again = startCountdown(done, 10_000);
    expect(again.status).toBe('running');
    expect(again.endsAt).toBe(15_000);
  });

  it('does not start with a zero duration', () => {
    const s = createCountdown(0);
    expect(startCountdown(s, 0)).toBe(s);
  });

  it('reset and setDuration return to idle', () => {
    const running = startCountdown(createCountdown(5000), 0);
    expect(resetCountdown(running)).toEqual(createCountdown(5000));
    expect(setDuration(running, 9000)).toEqual(createCountdown(9000));
  });

  it('reports the remaining fraction', () => {
    const s = startCountdown(createCountdown(10_000), 0);
    expect(remainingFraction(s, 2500)).toBe(0.75);
    expect(remainingFraction(createCountdown(0), 0)).toBe(0);
  });
});

describe('duration helpers', () => {
  it('converts and normalizes h/m/s', () => {
    expect(toMs(1, 2, 3)).toBe(3_723_000);
    expect(splitDuration(toMs(0, 0, 90))).toEqual({ h: 0, m: 1, s: 30 });
    expect(toMs(-1, Number.NaN, 5)).toBe(5000);
  });

  it('clamps to the supported range', () => {
    expect(toMs(500, 0, 0)).toBe(MAX_DURATION_MS);
    expect(clampDuration(-5)).toBe(0);
  });

  it('formats remaining time rounding up to whole seconds', () => {
    expect(formatCountdown(300_000)).toBe('05:00');
    expect(formatCountdown(4200)).toBe('00:05');
    expect(formatCountdown(1)).toBe('00:01');
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(3_723_000)).toBe('1:02:03');
  });

  it('describes durations in words', () => {
    expect(describeDuration(5_400_000)).toBe('1 小時 30 分');
    expect(describeDuration(45_000)).toBe('45 秒');
    expect(describeDuration(0)).toBe('0 秒');
  });
});

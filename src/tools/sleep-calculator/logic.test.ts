import { describe, expect, it } from 'vitest';
import {
  bedtimesFor,
  checkPlan,
  checkSettings,
  durationParts,
  formatTime,
  minutesBetween,
  parseTime,
  roundToStep,
  SLEEP_DEFAULTS,
  sleepTier,
  sleepTimeline,
  wakeTimesFor,
  wrapMinutes,
  type SleepSettings,
} from './logic';

const defaults: SleepSettings = { latency: SLEEP_DEFAULTS.latency, cycle: SLEEP_DEFAULTS.cycle };
const at = (hhmm: string) => parseTime(hhmm)!;
const times = (list: { bed?: number; wake?: number }[], key: 'bed' | 'wake') => list.map((o) => formatTime(o[key]!));

describe('time helpers', () => {
  it('parses and formats HH:MM', () => {
    expect(parseTime('07:00')).toBe(420);
    expect(parseTime('7:05')).toBe(425);
    expect(parseTime('23:15:00')).toBe(1395);
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('')).toBeNull();
    expect(parseTime('abc')).toBeNull();
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(1395)).toBe('23:15');
  });

  it('wraps past midnight in both directions', () => {
    expect(wrapMinutes(-45)).toBe(1395);
    expect(wrapMinutes(1440 + 45)).toBe(45);
    expect(formatTime(-135)).toBe('21:45');
    expect(minutesBetween(at('23:00'), at('07:00'))).toBe(480);
    expect(minutesBetween(at('01:00'), at('07:00'))).toBe(360);
  });

  it('rounds the current time to 5 minutes', () => {
    expect(formatTime(roundToStep(at('22:57')))).toBe('22:55');
    expect(formatTime(roundToStep(at('22:58')))).toBe('23:00');
    expect(formatTime(roundToStep(at('23:58')))).toBe('00:00');
  });

  it('splits durations', () => {
    expect(durationParts(450)).toEqual({ h: 7, m: 30 });
    expect(durationParts(400)).toEqual({ h: 6, m: 40 });
  });
});

describe('bedtimesFor', () => {
  it('gives 21:45, 23:15, 00:45 and 02:15 for a 07:00 alarm with the defaults', () => {
    const options = bedtimesFor(at('07:00'), defaults);
    expect(times(options, 'bed')).toEqual(['21:45', '23:15', '00:45', '02:15']);
    expect(options.map((o) => o.cycles)).toEqual([6, 5, 4, 3]);
    expect(options.map((o) => o.sleepMin / 60)).toEqual([9, 7.5, 6, 4.5]);
    expect(options.map((o) => o.tier)).toEqual(['recommended', 'recommended', 'short', 'short']);
    // 21:45 and 23:15 fall on the day before the alarm, 00:45 and 02:15 on the same day.
    expect(options.map((o) => o.dayOffset)).toEqual([-1, -1, 0, 0]);
  });

  it('applies latency and cycle length', () => {
    const options = bedtimesFor(at('06:30'), { latency: 0, cycle: 100 });
    expect(times(options, 'bed')).toEqual(['20:30', '22:10', '23:50', '01:30']);
    const slow = bedtimesFor(at('07:00'), { latency: 30, cycle: 90 });
    expect(times(slow, 'bed')).toEqual(['21:30', '23:00', '00:30', '02:00']);
  });

  it('wraps an afternoon wake-up without a day change', () => {
    const options = bedtimesFor(at('15:00'), defaults);
    expect(times(options, 'bed')).toEqual(['05:45', '07:15', '08:45', '10:15']);
    expect(options.every((o) => o.dayOffset === 0)).toBe(true);
  });
});

describe('wakeTimesFor', () => {
  it('adds latency and cycles, marking the next day', () => {
    const options = wakeTimesFor(at('23:00'), defaults);
    expect(times(options, 'wake')).toEqual(['03:45', '05:15', '06:45', '08:15']);
    expect(options.map((o) => o.cycles)).toEqual([3, 4, 5, 6]);
    expect(options.every((o) => o.dayOffset === 1)).toBe(true);
  });

  it('stays on the same day after midnight', () => {
    const options = wakeTimesFor(at('00:30'), { latency: 10, cycle: 80 });
    expect(times(options, 'wake')).toEqual(['04:40', '06:00', '07:20', '08:40']);
    expect(options.every((o) => o.dayOffset === 0)).toBe(true);
  });

  it('mixes days when the night crosses midnight part way', () => {
    const options = wakeTimesFor(at('20:00'), defaults);
    expect(times(options, 'wake')).toEqual(['00:45', '02:15', '03:45', '05:15']);
    expect(options[0].dayOffset).toBe(1);
    expect(wakeTimesFor(at('15:00'), defaults)[0].dayOffset).toBe(0);
  });
});

describe('checkPlan', () => {
  it('07:00 alarm and 23:00 bedtime: 5 full cycles, 15 minutes into the 6th', () => {
    const r = checkPlan(at('23:00'), at('07:00'), defaults)!;
    expect(r.inBed).toBe(480);
    expect(r.asleep).toBe(465);
    expect(r.fullCycles).toBe(5);
    expect(r.intoNext).toBe(15);
    expect(r.aligned).toBe(false);
    expect(r.alternatives.map((a) => [formatTime(a.bed), a.cycles, a.shift])).toEqual([
      ['23:15', 5, 15],
      ['21:45', 6, -75],
    ]);
  });

  it('reports a cycle-aligned bedtime', () => {
    const r = checkPlan(at('23:15'), at('07:00'), defaults)!;
    expect(r.fullCycles).toBe(5);
    expect(r.intoNext).toBe(0);
    expect(r.aligned).toBe(true);
    expect(r.alternatives).toEqual([]);
  });

  it('puts the earlier bedtime first when it is closer', () => {
    const r = checkPlan(at('22:00'), at('07:00'), defaults)!;
    expect(r.fullCycles).toBe(5);
    expect(r.intoNext).toBe(75);
    expect(r.alternatives.map((a) => formatTime(a.bed))).toEqual(['21:45', '23:15']);
  });

  it('follows the latency and cycle settings', () => {
    const r = checkPlan(at('23:00'), at('07:00'), { latency: 0, cycle: 80 })!;
    expect(r.fullCycles).toBe(6);
    expect(r.intoNext).toBe(0);
    const s = checkPlan(at('23:00'), at('07:00'), { latency: 30, cycle: 100 })!;
    expect(s.fullCycles).toBe(4);
    expect(s.intoNext).toBe(50);
  });

  it('handles nights shorter than one cycle and no time at all', () => {
    const r = checkPlan(at('06:00'), at('07:00'), defaults)!;
    expect(r.fullCycles).toBe(0);
    expect(r.intoNext).toBe(45);
    expect(r.alternatives.map((a) => [formatTime(a.bed), a.cycles])).toEqual([['05:15', 1]]);
    expect(checkPlan(at('07:00'), at('07:00'), defaults)).toBeNull();
    expect(checkPlan(at('06:50'), at('07:00'), defaults)).toBeNull();
  });
});

describe('sleepTimeline', () => {
  it('splits 23:00 → 07:00 into latency, 5 cycles and a 15-minute partial cycle', () => {
    const { total, segments } = sleepTimeline(at('23:00'), at('07:00'), defaults);
    expect(total).toBe(480);
    expect(segments.map((s) => s.kind)).toEqual(['latency', 'cycle', 'cycle', 'cycle', 'cycle', 'cycle', 'partial']);
    expect(segments.at(-1)).toEqual({ kind: 'partial', start: 465, minutes: 15, index: 6 });
    expect(segments.reduce((sum, s) => sum + s.minutes, 0)).toBe(480);
  });

  it('has no partial cycle for an aligned night and no latency segment at 0', () => {
    const aligned = sleepTimeline(at('23:15'), at('07:00'), defaults).segments;
    expect(aligned.filter((s) => s.kind === 'cycle')).toHaveLength(5);
    expect(aligned.some((s) => s.kind === 'partial')).toBe(false);
    const noLatency = sleepTimeline(at('01:00'), at('07:00'), { latency: 0, cycle: 90 }).segments;
    expect(noLatency.map((s) => s.kind)).toEqual(['cycle', 'cycle', 'cycle', 'cycle']);
    expect(sleepTimeline(at('07:00'), at('07:00'), defaults).segments).toEqual([]);
  });
});

describe('settings and tiers', () => {
  it('validates latency and cycle ranges', () => {
    expect(checkSettings(defaults)).toBeNull();
    expect(checkSettings({ latency: -1, cycle: 90 })).toBe('latency');
    expect(checkSettings({ latency: 61, cycle: 90 })).toBe('latency');
    expect(checkSettings({ latency: Number.NaN, cycle: 90 })).toBe('latency');
    expect(checkSettings({ latency: 15, cycle: 69 })).toBe('cycle');
    expect(checkSettings({ latency: 15, cycle: 121 })).toBe('cycle');
    expect(checkSettings({ latency: 0, cycle: 70 })).toBeNull();
    expect(checkSettings({ latency: 60, cycle: 120 })).toBeNull();
  });

  it('marks 7–9 hours as recommended for adults', () => {
    expect(sleepTier(419)).toBe('short');
    expect(sleepTier(420)).toBe('recommended');
    expect(sleepTier(540)).toBe('recommended');
    expect(sleepTier(570)).toBe('long');
  });
});

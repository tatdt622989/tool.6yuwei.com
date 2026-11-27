/**
 * Sleep-cycle estimates. All times are minutes after midnight (0–1439).
 *
 * - A sleep cycle (N1 → N2 → N3 → REM) averages about 90 minutes in adults, but real cycles run
 *   roughly 70–120 minutes and vary through the night and between people, so every result is an estimate.
 * - Sleep latency (time to fall asleep) is typically 10–20 minutes; the default is 15.
 * - AASM / SRS consensus and the CDC: adults (18–60) need at least 7 hours of sleep a night;
 *   the National Sleep Foundation recommends 7–9 hours for adults 18–64.
 */
export const SLEEP_DEFAULTS = {
  /** 07:00 */
  wake: 7 * 60,
  latency: 15,
  cycle: 90,
} as const;

export const LATENCY_RANGE = { min: 0, max: 60 } as const;
export const CYCLE_RANGE = { min: 70, max: 120 } as const;

/** Cycle counts offered, fewest first. */
export const CYCLE_COUNTS = [3, 4, 5, 6] as const;

/** Adults: at least 7 hours (AASM, CDC); more than 9 is longer than most adults need. */
export const RECOMMENDED_SLEEP = { min: 7 * 60, max: 9 * 60 } as const;

export const MINUTES_PER_DAY = 24 * 60;

export interface SleepSettings {
  /** Minutes it takes to fall asleep. */
  latency: number;
  /** Length of one sleep cycle in minutes. */
  cycle: number;
}

export type SettingsProblem = 'latency' | 'cycle';

export function checkSettings({ latency, cycle }: SleepSettings): SettingsProblem | null {
  if (!Number.isFinite(latency) || latency < LATENCY_RANGE.min || latency > LATENCY_RANGE.max) return 'latency';
  if (!Number.isFinite(cycle) || cycle < CYCLE_RANGE.min || cycle > CYCLE_RANGE.max) return 'cycle';
  return null;
}

/** Wraps any minute count into 0–1439 (−45 → 1395 = 23:15). */
export function wrapMinutes(minutes: number): number {
  return ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** '07:00' / '7:05' / '23:15:00' → minutes after midnight; anything else → null. */
export function parseTime(value: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?\s*$/.exec(value);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** Minutes → 'HH:MM' on a 24-hour clock, wrapping past midnight. */
export function formatTime(minutes: number): string {
  const t = wrapMinutes(minutes);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Rounds to the nearest `step` minutes, wrapping 23:58 → 00:00. */
export function roundToStep(minutes: number, step = 5): number {
  return wrapMinutes(Math.round(minutes / step) * step);
}

/** Minutes from `from` forward to `to`, 0–1439 (23:00 → 07:00 = 480). */
export function minutesBetween(from: number, to: number): number {
  return wrapMinutes(to - from);
}

/** 450 → { h: 7, m: 30 }. */
export function durationParts(minutes: number): { h: number; m: number } {
  const total = Math.max(0, Math.round(minutes));
  return { h: Math.floor(total / 60), m: total % 60 };
}

export type SleepTier = 'recommended' | 'short' | 'long';

/** Under 7 h is short for an adult; 7–9 h is the recommended range; over 9 h is longer than most adults need. */
export function sleepTier(sleepMinutes: number): SleepTier {
  if (sleepMinutes < RECOMMENDED_SLEEP.min) return 'short';
  if (sleepMinutes > RECOMMENDED_SLEEP.max) return 'long';
  return 'recommended';
}

export interface SleepOption {
  cycles: number;
  /** Minutes actually asleep (cycles × cycle length). */
  sleepMin: number;
  /** Time to go to bed (minutes after midnight). */
  bed: number;
  /** Time to wake up (minutes after midnight). */
  wake: number;
  /**
   * Calendar day of the computed time relative to the time the user typed:
   * −1 = the day before (a bedtime before a morning alarm), +1 = the next day, 0 = same day.
   */
  dayOffset: -1 | 0 | 1;
  tier: SleepTier;
}

const offsetOf = (raw: number) => Math.max(-1, Math.min(1, Math.floor(raw / MINUTES_PER_DAY))) as -1 | 0 | 1;

/**
 * Bedtimes for a wake-up time: bed = wake − cycles × cycle − latency.
 * Returned earliest bedtime first (6, 5, 4, 3 cycles with the defaults).
 */
export function bedtimesFor(wake: number, settings: SleepSettings, counts: readonly number[] = CYCLE_COUNTS): SleepOption[] {
  return [...counts]
    .sort((a, b) => b - a)
    .map((cycles) => {
      const sleepMin = cycles * settings.cycle;
      const raw = wake - sleepMin - settings.latency;
      return { cycles, sleepMin, bed: wrapMinutes(raw), wake: wrapMinutes(wake), dayOffset: offsetOf(raw), tier: sleepTier(sleepMin) };
    });
}

/**
 * Wake-up times for a bedtime: wake = bed + latency + cycles × cycle.
 * Returned earliest wake-up first (3, 4, 5, 6 cycles with the defaults).
 */
export function wakeTimesFor(bed: number, settings: SleepSettings, counts: readonly number[] = CYCLE_COUNTS): SleepOption[] {
  return [...counts]
    .sort((a, b) => a - b)
    .map((cycles) => {
      const sleepMin = cycles * settings.cycle;
      const raw = bed + settings.latency + sleepMin;
      return { cycles, sleepMin, bed: wrapMinutes(bed), wake: wrapMinutes(raw), dayOffset: offsetOf(raw), tier: sleepTier(sleepMin) };
    });
}

export interface PlanAlternative {
  /** Cycle-aligned bedtime for the same wake-up time. */
  bed: number;
  cycles: number;
  sleepMin: number;
  /** Minutes to move the planned bedtime: positive = later, negative = earlier. */
  shift: number;
}

export interface PlanCheck {
  /** Minutes in bed, bedtime to alarm. */
  inBed: number;
  /** Minutes asleep after the latency. */
  asleep: number;
  /** Complete cycles that fit before the alarm. */
  fullCycles: number;
  /** Minutes into the next, unfinished cycle when the alarm goes off (0 = on a cycle boundary). */
  intoNext: number;
  aligned: boolean;
  /** Nearest cycle-aligned bedtimes, nearest first. Empty when the plan is already aligned. */
  alternatives: PlanAlternative[];
}

/**
 * How a chosen bedtime lines up with the cycles before an alarm.
 * 23:00 → 07:00 with the defaults: 480 min in bed, 465 asleep, 5 full cycles and 15 minutes into the 6th;
 * nearest aligned bedtimes are 23:15 (5 cycles) and 21:45 (6 cycles).
 * Returns null when there is no time to sleep (the alarm comes before the latency is over).
 */
export function checkPlan(bed: number, wake: number, settings: SleepSettings): PlanCheck | null {
  const inBed = minutesBetween(bed, wake);
  const asleep = inBed - settings.latency;
  if (inBed === 0 || asleep <= 0) return null;
  const fullCycles = Math.floor(asleep / settings.cycle);
  const intoNext = asleep - fullCycles * settings.cycle;
  const at = (cycles: number, shift: number): PlanAlternative => ({
    bed: wrapMinutes(wake - cycles * settings.cycle - settings.latency),
    cycles,
    sleepMin: cycles * settings.cycle,
    shift,
  });
  const alternatives: PlanAlternative[] = [];
  if (intoNext > 0) {
    if (fullCycles > 0) alternatives.push(at(fullCycles, intoNext));
    // A full extra cycle still has to fit in one night.
    if (inBed + settings.cycle - intoNext < MINUTES_PER_DAY) alternatives.push(at(fullCycles + 1, -(settings.cycle - intoNext)));
    // Nearest first; on a tie, the one with more sleep.
    alternatives.sort((a, b) => Math.abs(a.shift) - Math.abs(b.shift) || b.cycles - a.cycles);
  }
  return { inBed, asleep, fullCycles, intoNext, aligned: intoNext === 0, alternatives };
}

export type SegmentKind = 'latency' | 'cycle' | 'partial';

export interface TimelineSegment {
  kind: SegmentKind;
  /** Minutes from bedtime to the start of the segment. */
  start: number;
  minutes: number;
  /** 1-based cycle number for 'cycle' and 'partial' segments. */
  index?: number;
}

/**
 * Bedtime to alarm split into falling asleep, complete cycles and the unfinished cycle the alarm cuts into.
 * Empty when bed equals wake.
 */
export function sleepTimeline(bed: number, wake: number, settings: SleepSettings): { total: number; segments: TimelineSegment[] } {
  const total = minutesBetween(bed, wake);
  const segments: TimelineSegment[] = [];
  if (total === 0) return { total, segments };
  const latency = Math.min(settings.latency, total);
  if (latency > 0) segments.push({ kind: 'latency', start: 0, minutes: latency });
  let start = latency;
  let index = 1;
  while (total - start >= settings.cycle) {
    segments.push({ kind: 'cycle', start, minutes: settings.cycle, index });
    start += settings.cycle;
    index += 1;
  }
  if (total > start) segments.push({ kind: 'partial', start, minutes: total - start, index });
  return { total, segments };
}

import { describe, expect, it } from 'vitest';
import { cycleAt, dayKind, monthGrid, monthsCovered, predictCycles, todayStatus, validateCycleInput, type CycleInput } from './logic';

const today = { y: 2026, m: 10, d: 29 };
const input: CycleInput = { lastStart: { y: 2026, m: 10, d: 20 }, cycle: 28, period: 5, count: 3 };

describe('cycleAt', () => {
  it('puts ovulation 14 days before the next period and the fertile window around it', () => {
    const c = cycleAt(input.lastStart, 28, 5);
    expect(c.periodEnd).toEqual({ y: 2026, m: 10, d: 24 });
    expect(c.nextStart).toEqual({ y: 2026, m: 11, d: 17 });
    expect(c.ovulation).toEqual({ y: 2026, m: 11, d: 3 });
    expect(c.fertileStart).toEqual({ y: 2026, m: 10, d: 29 });
    expect(c.fertileEnd).toEqual({ y: 2026, m: 11, d: 4 });
  });

  it('moves ovulation later in a long cycle', () => {
    expect(cycleAt(input.lastStart, 35, 5).ovulation).toEqual({ y: 2026, m: 11, d: 10 });
  });
});

describe('predictCycles', () => {
  it('returns consecutive cycles', () => {
    const cycles = predictCycles(input, today);
    expect(cycles).toHaveLength(3);
    expect(cycles[1].periodStart).toEqual(cycles[0].nextStart);
    expect(cycles[2].periodStart).toEqual({ y: 2026, m: 12, d: 15 });
  });

  it('projects forward from an old period so the first cycle contains today', () => {
    const cycles = predictCycles({ ...input, lastStart: { y: 2026, m: 8, d: 25 } }, today);
    // 8/25 + 2 × 28 = 10/20
    expect(cycles[0].periodStart).toEqual({ y: 2026, m: 10, d: 20 });
  });

  it('returns [] for invalid input', () => {
    expect(predictCycles({ ...input, cycle: 15 }, today)).toEqual([]);
    expect(validateCycleInput({ ...input, period: 12 }, today)).toMatch(/經期/);
    expect(validateCycleInput({ ...input, lastStart: { y: 2026, m: 11, d: 1 } }, today)).toMatch(/晚於今天/);
  });
});

describe('dayKind', () => {
  const cycles = predictCycles(input, today);
  it('classifies days', () => {
    expect(dayKind({ y: 2026, m: 10, d: 22 }, cycles)).toBe('period');
    expect(dayKind({ y: 2026, m: 10, d: 28 }, cycles)).toBe('other');
    expect(dayKind({ y: 2026, m: 10, d: 29 }, cycles)).toBe('fertile');
    expect(dayKind({ y: 2026, m: 11, d: 3 }, cycles)).toBe('ovulation');
    expect(dayKind({ y: 2026, m: 11, d: 5 }, cycles)).toBe('other');
    expect(dayKind({ y: 2026, m: 10, d: 1 }, cycles)).toBeNull();
  });

  it('gives period priority when a short cycle overlaps the fertile window', () => {
    const short = predictCycles({ ...input, cycle: 21, period: 7 }, { y: 2026, m: 10, d: 20 });
    // ovulation = 10/20 + 7 = 10/27, fertile from 10/22, period until 10/26
    expect(dayKind({ y: 2026, m: 10, d: 23 }, short)).toBe('period');
    expect(dayKind({ y: 2026, m: 10, d: 27 }, short)).toBe('ovulation');
  });
});

describe('calendar helpers', () => {
  it('builds Sunday-first month grids', () => {
    const grid = monthGrid(2026, 11); // 2026-11-01 is a Sunday
    expect(grid[0][0]).toEqual({ y: 2026, m: 11, d: 1 });
    expect(grid.flat().filter(Boolean)).toHaveLength(30);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(monthGrid(2026, 10)[0].slice(0, 4)).toEqual([null, null, null, null]); // 10/1 is Thursday
  });

  it('lists the months covered across a year boundary', () => {
    const cycles = predictCycles({ ...input, count: 6 }, today);
    const months = monthsCovered(cycles);
    expect(months[0]).toEqual({ y: 2026, m: 10 });
    expect(months.at(-1)).toEqual({ y: 2027, m: 4 });
  });

  it('reports today status', () => {
    const s = todayStatus(predictCycles(input, today), today)!;
    expect(s).toEqual({ kind: 'fertile', cycleDay: 10, daysToOvulation: 5, daysToNextPeriod: 19 });
  });
});

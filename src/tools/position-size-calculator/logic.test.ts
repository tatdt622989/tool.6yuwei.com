import { describe, expect, it } from 'vitest';
import {
  RECOVERY_LOSSES,
  STREAK_LENGTHS,
  calculatePosition,
  recoveryGain,
  recoveryTable,
  remainingAfterLosses,
  sideOf,
  streakColumns,
  streakTable,
  tidy,
  type PositionInput,
  type PositionResult,
} from './logic';

function input(overrides: Partial<PositionInput> = {}): PositionInput {
  return {
    account: 1_000_000,
    riskPercent: 2,
    entry: 100,
    stop: 95,
    target: null,
    lotSize: 1000,
    wholeLots: false,
    ...overrides,
  };
}

function ok(overrides: Partial<PositionInput> = {}): PositionResult {
  const outcome = calculatePosition(input(overrides));
  if (outcome.status !== 'ok') throw new Error(`expected ok, got ${outcome.field}/${outcome.problem}`);
  return outcome.result;
}

function error(overrides: Partial<PositionInput>) {
  const outcome = calculatePosition(input(overrides));
  if (outcome.status !== 'error') throw new Error('expected an error');
  return outcome;
}

describe('calculatePosition: default examples', () => {
  it('zh-TW: 本金 100 萬、風險 2%、進場 100、停損 95 → 4,000 股 = 4 張', () => {
    const r = ok();
    expect(r.side).toBe('long');
    expect(r.budget).toBe(20_000);
    expect(r.riskPerUnit).toBe(5);
    expect(r.stopPercent).toBe(5);
    expect(r.quantity).toBe(4000);
    expect(r.lots).toBe(4);
    expect(r.oddUnits).toBe(0);
    expect(r.cost).toBe(400_000);
    expect(r.costPercent).toBe(40);
    expect(r.loss).toBe(20_000);
    expect(r.lossPercent).toBe(2);
    expect(r.leveraged).toBe(false);
    expect(r.rMultiple).toBeNull();
    expect(r.profit).toBeNull();
  });

  it('ja: 100 万円、2%、1,000 円、950 円 → 400 株（4 単元）、40 万円', () => {
    const r = ok({ entry: 1000, stop: 950, lotSize: 100, wholeLots: true });
    expect(r.budget).toBe(20_000);
    expect(r.riskPerUnit).toBe(50);
    expect(r.quantity).toBe(400);
    expect(r.lots).toBe(4);
    expect(r.cost).toBe(400_000);
    expect(r.loss).toBe(20_000);
  });

  it('en: $10,000, 2%, entry 50, stop 47.50 → $200 risk, 80 shares, $4,000', () => {
    const r = ok({ account: 10_000, entry: 50, stop: 47.5, lotSize: 100 });
    expect(r.budget).toBe(200);
    expect(r.riskPerUnit).toBe(2.5);
    expect(r.quantity).toBe(80);
    expect(r.cost).toBe(4000);
    expect(r.costPercent).toBe(40);
    expect(r.loss).toBe(200);
  });
});

describe('calculatePosition: quantity', () => {
  it('rounds the share count down, never up', () => {
    const r = ok({ stop: 93 }); // 20,000 ÷ 7 = 2,857.14
    expect(r.rawQuantity).toBe(2857);
    expect(r.quantity).toBe(2857);
    expect(r.lots).toBe(2);
    expect(r.oddUnits).toBe(857);
    expect(r.loss).toBe(19_999);
    expect(r.loss).toBeLessThanOrEqual(r.budget);
  });

  it('rounds down to whole lots when odd lots are not wanted', () => {
    const r = ok({ stop: 93, wholeLots: true });
    expect(r.rawQuantity).toBe(2857);
    expect(r.quantity).toBe(2000);
    expect(r.lots).toBe(2);
    expect(r.oddUnits).toBe(0);
    expect(r.loss).toBe(14_000);
    expect(r.lossPercent).toBe(1.4);
  });

  it('is not fooled by floating-point noise in prices', () => {
    // 1.1 − 1.0 is 0.10000000000000009 in binary floating point.
    const r = ok({ account: 10_000, entry: 1.1, stop: 1.0, lotSize: null });
    expect(r.riskPerUnit).toBe(0.1);
    expect(r.quantity).toBe(2000);
    expect(r.loss).toBe(200);
    expect(ok({ account: 10_000, entry: 0.3, stop: 0.1, lotSize: null }).quantity).toBe(1000);
  });

  it('keeps the loss at the stop within the budget for many random inputs', () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 500; i++) {
      const entry = Math.round((1 + rand() * 999) * 100) / 100;
      const stop = Math.round(entry * (0.5 + rand()) * 100) / 100;
      if (stop === entry || stop <= 0) continue;
      const r = ok({ account: Math.round(rand() * 5_000_000) + 1000, riskPercent: Math.round(rand() * 500) / 100 + 0.1, entry, stop, wholeLots: rand() > 0.5 });
      expect(r.loss).toBeLessThanOrEqual(r.budget + 1e-6);
      expect(Number.isInteger(r.quantity)).toBe(true);
      expect(r.quantity % r.step).toBe(0);
      // One more step would break the budget.
      expect((r.quantity + r.step) * r.riskPerUnit).toBeGreaterThan(r.budget - 1e-6);
    }
  });

  it('reports a zero quantity when the budget cannot cover one lot', () => {
    const r = ok({ account: 100_000, riskPercent: 1, entry: 600, stop: 590, wholeLots: true });
    expect(r.budget).toBe(1000);
    expect(r.rawQuantity).toBe(100);
    expect(r.quantity).toBe(0);
    expect(r.step).toBe(1000);
    expect(r.stepLoss).toBe(10_000);
    expect(r.cost).toBe(0);
    expect(r.loss).toBe(0);
  });

  it('treats a blank lot size as single units', () => {
    const r = ok({ lotSize: null, wholeLots: true });
    expect(r.lotSize).toBe(1);
    expect(r.step).toBe(1);
    expect(r.quantity).toBe(4000);
    expect(r.lots).toBe(4000);
  });

  it('supports a custom lot size such as a 100-share round lot', () => {
    const r = ok({ account: 25_000, riskPercent: 1, entry: 42.3, stop: 40.1, lotSize: 100, wholeLots: true });
    expect(r.rawQuantity).toBe(113); // 250 ÷ 2.2 = 113.6
    expect(r.quantity).toBe(100);
    expect(r.lots).toBe(1);
  });
});

describe('calculatePosition: short positions', () => {
  it('detects a short when the stop is above the entry', () => {
    expect(sideOf(100, 95)).toBe('long');
    expect(sideOf(100, 105)).toBe('short');
    const r = ok({ entry: 100, stop: 105 });
    expect(r.side).toBe('short');
    expect(r.riskPerUnit).toBe(5);
    expect(r.quantity).toBe(4000);
    expect(r.cost).toBe(400_000);
    expect(r.loss).toBe(20_000);
  });

  it('measures the reward of a short downwards', () => {
    const r = ok({ entry: 100, stop: 105, target: 90 });
    expect(r.rMultiple).toBe(2);
    expect(r.profit).toBe(40_000);
  });

  it('rejects a short target above the entry', () => {
    expect(error({ entry: 100, stop: 105, target: 110 })).toEqual({ status: 'error', field: 'target', problem: 'targetSide', side: 'short' });
  });
});

describe('calculatePosition: target and R multiple', () => {
  it('computes the reward-to-risk ratio and the profit at the target', () => {
    const r = ok({ target: 110 });
    expect(r.rMultiple).toBe(2);
    expect(r.profit).toBe(40_000);
    expect(ok({ account: 10_000, entry: 50, stop: 47.5, target: 55 }).rMultiple).toBe(2);
    expect(ok({ target: 107.5 }).rMultiple).toBe(1.5);
  });

  it('uses the final (rounded) quantity for the profit', () => {
    const r = ok({ stop: 93, target: 114, wholeLots: true });
    expect(r.quantity).toBe(2000);
    expect(r.rMultiple).toBe(2);
    expect(r.profit).toBe(28_000);
  });

  it('rejects a long target at or below the entry', () => {
    expect(error({ target: 100 })).toMatchObject({ field: 'target', problem: 'targetSide', side: 'long' });
    expect(error({ target: 90 })).toMatchObject({ field: 'target', problem: 'targetSide', side: 'long' });
  });

  it('rejects a target that is not a positive number', () => {
    expect(error({ target: -5 })).toMatchObject({ field: 'target', problem: 'invalid' });
    expect(error({ target: Number.NaN })).toMatchObject({ field: 'target', problem: 'invalid' });
  });
});

describe('calculatePosition: leverage', () => {
  it('flags a position that costs more than the account and gives the cash-only size', () => {
    const r = ok({ account: 100_000, riskPercent: 2, entry: 100, stop: 99 });
    expect(r.quantity).toBe(2000);
    expect(r.cost).toBe(200_000);
    expect(r.costPercent).toBe(200);
    expect(r.leveraged).toBe(true);
    expect(r.cashQuantity).toBe(1000);
    expect(r.cashLoss).toBe(1000);
  });

  it('rounds the cash-only size to whole lots too', () => {
    const r = ok({ account: 150_000, entry: 100, stop: 99.5, wholeLots: true });
    expect(r.quantity).toBe(6000);
    expect(r.leveraged).toBe(true);
    expect(r.cashQuantity).toBe(1000);
  });

  it('does not flag a position that exactly uses the account', () => {
    const r = ok({ account: 100_000, riskPercent: 5, entry: 100, stop: 95 });
    expect(r.cost).toBe(100_000);
    expect(r.leveraged).toBe(false);
    expect(r.cashQuantity).toBe(r.quantity);
  });
});

describe('calculatePosition: validation', () => {
  it('asks for every required field', () => {
    expect(error({ account: null })).toEqual({ status: 'error', field: 'account', problem: 'missing' });
    expect(error({ riskPercent: null })).toEqual({ status: 'error', field: 'risk', problem: 'missing' });
    expect(error({ entry: null })).toEqual({ status: 'error', field: 'entry', problem: 'missing' });
    expect(error({ stop: null })).toEqual({ status: 'error', field: 'stop', problem: 'missing' });
  });

  it('rejects zero, negative and non-numeric values', () => {
    expect(error({ account: 0 })).toMatchObject({ field: 'account', problem: 'invalid' });
    expect(error({ account: -1000 })).toMatchObject({ field: 'account', problem: 'invalid' });
    expect(error({ account: Number.NaN })).toMatchObject({ field: 'account', problem: 'invalid' });
    expect(error({ riskPercent: 0 })).toMatchObject({ field: 'risk', problem: 'invalid' });
    expect(error({ riskPercent: -2 })).toMatchObject({ field: 'risk', problem: 'invalid' });
    expect(error({ riskPercent: 101 })).toMatchObject({ field: 'risk', problem: 'invalid' });
    expect(error({ entry: -100 })).toMatchObject({ field: 'entry', problem: 'invalid' });
    expect(error({ stop: -95 })).toMatchObject({ field: 'stop', problem: 'invalid' });
    expect(error({ stop: 0 })).toMatchObject({ field: 'stop', problem: 'invalid' });
  });

  it('rejects a stop equal to the entry', () => {
    expect(error({ stop: 100 })).toEqual({ status: 'error', field: 'stop', problem: 'stopAtEntry' });
  });

  it('rejects a lot size that is not a whole number of at least 1', () => {
    expect(error({ lotSize: 0 })).toMatchObject({ field: 'lotSize', problem: 'invalid' });
    expect(error({ lotSize: 2.5 })).toMatchObject({ field: 'lotSize', problem: 'invalid' });
    expect(error({ lotSize: -100 })).toMatchObject({ field: 'lotSize', problem: 'invalid' });
  });

  it('accepts a 100% risk', () => {
    expect(ok({ riskPercent: 100 }).budget).toBe(1_000_000);
  });

  it('never returns Infinity inside an ok result', () => {
    expect(error({ account: 1e308, riskPercent: 100, entry: 1e-10, stop: 2e-10 })).toMatchObject({ problem: 'invalid' });
  });
});

describe('tidy', () => {
  it('removes binary noise but keeps real precision', () => {
    expect(tidy(0.1 + 0.2)).toBe(0.3);
    expect(tidy(1.1 - 1.0)).toBe(0.1);
    expect(tidy(1999.9999999999998)).toBe(2000);
    expect(tidy(0.00025)).toBe(0.00025);
    expect(tidy(123456.789)).toBe(123456.789);
    expect(tidy(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('recoveryGain', () => {
  it('matches the familiar drawdown table', () => {
    const gains = recoveryTable().map((r) => Math.round(r.gain * 10) / 10);
    expect(RECOVERY_LOSSES).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90]);
    expect(gains).toEqual([11.1, 25, 42.9, 66.7, 100, 150, 233.3, 400, 900]);
  });

  it('is exact at round numbers', () => {
    expect(recoveryGain(50)).toBe(100);
    expect(recoveryGain(90)).toBe(900);
    expect(recoveryGain(20)).toBe(25);
    expect(recoveryGain(0)).toBe(0);
  });

  it('handles the edges', () => {
    expect(recoveryGain(100)).toBe(Number.POSITIVE_INFINITY);
    expect(recoveryGain(-1)).toBeNaN();
    expect(recoveryGain(101)).toBeNaN();
    expect(recoveryGain(Number.NaN)).toBeNaN();
  });
});

describe('losing streaks', () => {
  it('compounds each loss on what is left: (1 − r)^n', () => {
    expect(remainingAfterLosses(2, 5)).toBeCloseTo(90.392, 3);
    expect(remainingAfterLosses(2, 10)).toBeCloseTo(81.707, 3);
    expect(remainingAfterLosses(2, 20)).toBeCloseTo(66.761, 3);
    expect(remainingAfterLosses(10, 10)).toBeCloseTo(34.868, 3);
    expect(remainingAfterLosses(20, 5)).toBeCloseTo(32.768, 3);
    expect(remainingAfterLosses(20, 20)).toBeCloseTo(1.153, 3);
    expect(remainingAfterLosses(5, 0)).toBe(100);
    expect(remainingAfterLosses(100, 1)).toBe(0);
  });

  it('rejects impossible inputs', () => {
    expect(remainingAfterLosses(-1, 5)).toBeNaN();
    expect(remainingAfterLosses(2, 1.5)).toBeNaN();
    expect(remainingAfterLosses(2, -1)).toBeNaN();
  });

  it('builds sorted, unique columns around the user’s risk', () => {
    expect(streakColumns(2)).toEqual([2, 10, 20]);
    expect(streakColumns(15)).toEqual([10, 15, 20]);
    expect(streakColumns(10)).toEqual([10, 20]);
    expect(streakColumns(null)).toEqual([10, 20]);
    expect(streakColumns(Number.NaN)).toEqual([10, 20]);
    expect(streakColumns(0)).toEqual([10, 20]);
  });

  it('fills one row per streak length', () => {
    const rows = streakTable([2, 10, 20]);
    expect(rows.map((r) => r.losses)).toEqual([...STREAK_LENGTHS]);
    expect(rows[1].remaining.map((v) => Math.round(v * 10) / 10)).toEqual([81.7, 34.9, 10.7]);
  });
});

// Position sizing for one trade with a fixed share of the account at risk, plus two tables that show why
// the risk per trade matters: the gain needed to recover from a drawdown, and what a losing streak leaves.
// Pure functions, no DOM. Prices and amounts are in any one currency; quantities are whole units (shares).

export type Side = 'long' | 'short';

export interface PositionInput {
  /** Account size (本金). Required, above 0. `null` = left blank, NaN = not a number. */
  account: number | null;
  /** Risk per trade as a percent of the account: 2 = 2%. Required, above 0 and at most 100. */
  riskPercent: number | null;
  /** Entry price. Required, above 0. */
  entry: number | null;
  /** Stop-loss price. Required, above 0 and not equal to the entry. Below the entry = long, above = short. */
  stop: number | null;
  /** Optional profit target, on the winning side of the entry. */
  target: number | null;
  /** Units (shares) per lot: 1,000 for a Taiwan 張, 100 for a Japanese 単元 or a US round lot. Blank = 1. */
  lotSize: number | null;
  /** Round the quantity down to whole lots (no odd lots). */
  wholeLots: boolean;
}

export type PositionField = 'account' | 'risk' | 'entry' | 'stop' | 'target' | 'lotSize';

/**
 * Why an input cannot be used:
 *  - missing:     a required field is blank
 *  - invalid:     not a number, zero or negative, or out of range
 *  - stopAtEntry: the stop equals the entry, so there is no risk per share to divide by
 *  - targetSide:  the target is not on the winning side of the entry (below it for a long, above it for a short)
 */
export type PositionProblem = 'missing' | 'invalid' | 'stopAtEntry' | 'targetSide';

export interface PositionResult {
  side: Side;
  /** account × risk%: the most this trade may lose at the stop. */
  budget: number;
  /** |entry − stop|. */
  riskPerUnit: number;
  /** riskPerUnit as a percent of the entry price (distance to the stop). */
  stopPercent: number;
  /** Units per lot actually used (1 when the lot size is blank). */
  lotSize: number;
  /** floor(budget ÷ riskPerUnit), before rounding to lots. */
  rawQuantity: number;
  /** Final quantity: rawQuantity, rounded down to whole lots when wholeLots is on. */
  quantity: number;
  /** quantity split into whole lots and the odd units left over. */
  lots: number;
  oddUnits: number;
  /** Smallest quantity that can be bought: one lot in whole-lot mode, else one unit. */
  step: number;
  /** Loss at the stop for one step (shown when the budget cannot cover even that). */
  stepLoss: number;
  /** quantity × entry (the notional value for a short). */
  cost: number;
  /** cost as a percent of the account. Above 100 means the trade needs margin or leverage. */
  costPercent: number;
  /** quantity × riskPerUnit: the loss if the stop is hit. Never above budget. */
  loss: number;
  /** loss as a percent of the account. At most the risk percent; lower when rounding down cut the quantity. */
  lossPercent: number;
  /** The position costs more than the account. */
  leveraged: boolean;
  /** Largest quantity the account can pay for in cash (same lot rounding), and its loss at the stop. */
  cashQuantity: number;
  cashLoss: number;
  /** Reward ÷ risk per unit at the target (the R multiple). null without a target. */
  rMultiple: number | null;
  /** quantity × |target − entry|. null without a target. */
  profit: number | null;
}

export type PositionOutcome =
  | { status: 'ok'; result: PositionResult }
  | { status: 'error'; field: PositionField; problem: PositionProblem; side?: Side };

/**
 * Drop binary noise (1.1 − 1.0 = 0.10000000000000009) so that exact inputs give exact outputs:
 * 200 ÷ (50 − 47.5) must be 80 shares, not 79.
 */
export function tidy(n: number): number {
  return Number.isFinite(n) ? Number(n.toPrecision(12)) : n;
}

const positive = (n: number | null): n is number => n !== null && Number.isFinite(n) && n > 0;

function check(value: number | null, field: PositionField): PositionOutcome | null {
  if (value === null) return { status: 'error', field, problem: 'missing' };
  if (!positive(value)) return { status: 'error', field, problem: 'invalid' };
  return null;
}

/** Long when the stop is below the entry, short when it is above. */
export function sideOf(entry: number, stop: number): Side {
  return stop < entry ? 'long' : 'short';
}

/** Size one trade so that hitting the stop loses at most account × risk%. */
export function calculatePosition(input: PositionInput): PositionOutcome {
  const { account, riskPercent, entry, stop, target, lotSize, wholeLots } = input;

  const firstError =
    check(account, 'account') ??
    check(riskPercent, 'risk') ??
    (riskPercent !== null && riskPercent > 100 ? ({ status: 'error', field: 'risk', problem: 'invalid' } as const) : null) ??
    check(entry, 'entry') ??
    check(stop, 'stop');
  if (firstError) return firstError;
  // The checks above guarantee positive finite numbers from here on.
  const acc = account as number;
  const risk = riskPercent as number;
  const entryPrice = entry as number;
  const stopPrice = stop as number;

  const riskPerUnit = tidy(Math.abs(entryPrice - stopPrice));
  if (riskPerUnit === 0) return { status: 'error', field: 'stop', problem: 'stopAtEntry' };
  const side = sideOf(entryPrice, stopPrice);

  if (target !== null) {
    if (!positive(target)) return { status: 'error', field: 'target', problem: 'invalid' };
    const winning = side === 'long' ? target > entryPrice : target < entryPrice;
    if (!winning) return { status: 'error', field: 'target', problem: 'targetSide', side };
  }

  if (lotSize !== null && !(Number.isInteger(lotSize) && lotSize >= 1)) return { status: 'error', field: 'lotSize', problem: 'invalid' };
  const lot = lotSize ?? 1;
  const step = wholeLots ? lot : 1;

  const budget = tidy((acc * risk) / 100);
  const rawQuantity = Math.floor(tidy(budget / riskPerUnit));
  const quantity = Math.floor(rawQuantity / step) * step;
  const cost = tidy(quantity * entryPrice);
  const loss = tidy(quantity * riskPerUnit);
  const cashQuantity = Math.min(quantity, Math.floor(Math.floor(tidy(acc / entryPrice)) / step) * step);
  const reward = target === null ? null : tidy(Math.abs(target - entryPrice));

  const result: PositionResult = {
    side,
    budget,
    riskPerUnit,
    stopPercent: tidy((riskPerUnit / entryPrice) * 100),
    lotSize: lot,
    rawQuantity,
    quantity,
    lots: Math.floor(quantity / lot),
    oddUnits: quantity % lot,
    step,
    stepLoss: tidy(step * riskPerUnit),
    cost,
    costPercent: tidy((cost / acc) * 100),
    loss,
    lossPercent: tidy((loss / acc) * 100),
    leveraged: cost > acc,
    cashQuantity,
    cashLoss: tidy(cashQuantity * riskPerUnit),
    rMultiple: reward === null ? null : tidy(reward / riskPerUnit),
    profit: reward === null ? null : tidy(quantity * reward),
  };
  // Absurd magnitudes (1e300 × 1e300) overflow; report them as unusable instead of showing Infinity.
  const numbers = Object.values(result).filter((v): v is number => typeof v === 'number');
  if (!numbers.every(Number.isFinite)) return { status: 'error', field: 'account', problem: 'invalid' };
  return { status: 'ok', result };
}

// ---- Drawdown recovery ----

/** The losses listed in the recovery table, in percent. */
export const RECOVERY_LOSSES = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

/**
 * Gain (in percent) needed to get back to break-even after losing `lossPercent` % of the account:
 * d ÷ (1 − d). Losing 50% needs +100%. Infinity at 100% (nothing left to grow), NaN outside 0–100.
 */
export function recoveryGain(lossPercent: number): number {
  if (!Number.isFinite(lossPercent) || lossPercent < 0 || lossPercent > 100) return Number.NaN;
  if (lossPercent === 100) return Number.POSITIVE_INFINITY;
  return tidy((lossPercent / (100 - lossPercent)) * 100);
}

export function recoveryTable(losses: readonly number[] = RECOVERY_LOSSES): { loss: number; gain: number }[] {
  return losses.map((loss) => ({ loss, gain: recoveryGain(loss) }));
}

// ---- Losing streaks ----

/** Streak lengths in the losing-streak table. */
export const STREAK_LENGTHS = [5, 10, 20] as const;
/** Risk levels the user's own setting is compared with, in percent. */
export const STREAK_COMPARE = [10, 20] as const;

/**
 * Percent of the account left after `losses` stopped trades in a row, when each one loses `riskPercent` %
 * of what is left at the time (the position is re-sized after every loss): (1 − r)^n × 100.
 */
export function remainingAfterLosses(riskPercent: number, losses: number): number {
  if (!Number.isFinite(riskPercent) || riskPercent < 0 || riskPercent > 100) return Number.NaN;
  if (!Number.isInteger(losses) || losses < 0) return Number.NaN;
  return tidy((1 - riskPercent / 100) ** losses * 100);
}

/**
 * Columns of the losing-streak table: the user's risk (when usable) plus the comparison levels,
 * ascending and without duplicates.
 */
export function streakColumns(userRisk: number | null, compare: readonly number[] = STREAK_COMPARE): number[] {
  const usable = userRisk !== null && Number.isFinite(userRisk) && userRisk > 0 && userRisk <= 100;
  const all = usable ? [userRisk, ...compare] : [...compare];
  return [...new Set(all)].sort((a, b) => a - b);
}

export interface StreakRow {
  losses: number;
  /** Percent of the account left, one entry per column. */
  remaining: number[];
}

export function streakTable(columns: readonly number[], lengths: readonly number[] = STREAK_LENGTHS): StreakRow[] {
  return lengths.map((losses) => ({ losses, remaining: columns.map((risk) => remainingAfterLosses(risk, losses)) }));
}

import { describe, expect, it } from 'vitest';
import {
  addRound,
  beyStats,
  historyCsv,
  matchWinner,
  nextDeckIndex,
  sanitizeHistory,
  scores,
  summary,
  undoRound,
  wilson,
  type Match,
  type Round,
} from './logic';

const r = (winner: 0 | 1 | null, finish: Round['finish'], a = 'Dran', b = 'Hells'): Round => ({ winner, finish, bey: [a, b] });
const fresh = (target = 4): Match => ({ target, names: ['A', 'B'], rounds: [] });

describe('scoring', () => {
  it('uses the official points per finish', () => {
    expect(scores([r(0, 'spin'), r(0, 'over'), r(1, 'burst'), r(1, 'xtreme')])).toEqual([3, 5]);
  });

  it('draws score nothing', () => {
    expect(scores([r(null, null), r(0, 'spin')])).toEqual([1, 0]);
  });

  it('ends the match when a side reaches the target', () => {
    let m = fresh();
    m = addRound(m, r(0, 'over'));
    expect(matchWinner(m)).toBeNull();
    m = addRound(m, r(0, 'spin'));
    expect(matchWinner(m)).toBeNull();
    m = addRound(m, r(0, 'xtreme'));
    expect(scores(m.rounds)).toEqual([6, 0]);
    expect(matchWinner(m)).toBe(0);
  });

  it('ignores rounds added after the match is over', () => {
    let m = addRound(fresh(3), r(1, 'xtreme'));
    expect(matchWinner(m)).toBe(1);
    m = addRound(m, r(0, 'spin'));
    expect(m.rounds).toHaveLength(1);
  });

  it('respects custom targets and undo', () => {
    let m = addRound(fresh(7), r(0, 'xtreme'));
    m = addRound(m, r(0, 'xtreme'));
    expect(matchWinner(m)).toBeNull();
    m = undoRound(m);
    expect(m.rounds).toHaveLength(1);
    expect(undoRound(fresh()).rounds).toEqual([]);
  });

  it('cleans Beyblade names', () => {
    const m = addRound(fresh(), { winner: 0, finish: 'spin', bey: ['  Dran   Sword 3-60F ', 'x'.repeat(60)] });
    expect(m.rounds[0].bey).toEqual(['Dran Sword 3-60F', 'x'.repeat(40)]);
  });
});

describe('3on3 rotation', () => {
  it('cycles through the deck', () => {
    expect([0, 1, 2].map((i) => nextDeckIndex(i, 3))).toEqual([1, 2, 0]);
    expect(nextDeckIndex(0, 1)).toBe(0);
    expect(nextDeckIndex(0, 0)).toBe(0);
  });
});

describe('wilson', () => {
  it('matches the textbook 95% interval', () => {
    const { low, high } = wilson(7, 10);
    expect(low).toBeCloseTo(0.3968, 3);
    expect(high).toBeCloseTo(0.8922, 3);
  });

  it('stays within 0–1 at the edges', () => {
    expect(wilson(0, 0)).toEqual({ low: 0, high: 1 });
    const all = wilson(5, 5);
    expect(all.high).toBe(1);
    expect(all.low).toBeGreaterThan(0.4);
    expect(wilson(0, 5).low).toBe(0);
  });
});

describe('beyStats', () => {
  const history: Match[] = [
    { ...fresh(), rounds: [r(0, 'over'), r(0, 'spin', 'dran'), r(1, 'burst'), r(null, null)] },
    { ...fresh(), rounds: [r(1, 'xtreme', 'Wizard', 'Hells'), r(0, 'spin', '', 'Hells')] },
  ];

  it('tallies wins, losses, draws and finishes per Beyblade, merging case', () => {
    const stats = beyStats(history);
    const dran = stats.find((s) => s.name === 'Dran')!;
    expect(dran).toMatchObject({ battles: 4, wins: 2, losses: 1, draws: 1 });
    expect(dran.winsBy).toEqual({ spin: 1, over: 1, burst: 0, xtreme: 0 });
    expect(dran.lossesBy.burst).toBe(1);
    expect(dran.winRate).toBe(0.5);
    expect(dran.pointsPerBattle).toBe(0.75);

    const hells = stats.find((s) => s.name === 'Hells')!;
    expect(hells).toMatchObject({ battles: 6, wins: 2, losses: 3, draws: 1 });
    expect(stats[0].name).toBe('Hells');
  });

  it('skips battles with no Beyblade name', () => {
    expect(beyStats(history).reduce((n, s) => n + s.battles, 0)).toBe(11);
  });

  it('summarises finishes across matches', () => {
    expect(summary(history)).toEqual({
      matches: 2,
      battles: 6,
      draws: 1,
      finishes: { spin: 2, over: 1, burst: 1, xtreme: 1 },
      battlesPerMatch: 3,
    });
    expect(summary([]).battlesPerMatch).toBe(0);
  });
});

describe('sanitizeHistory', () => {
  it('drops malformed entries and repairs rounds', () => {
    const out = sanitizeHistory([
      null,
      { at: 'x' },
      { at: 1, target: 4, names: ['A', 'B'], rounds: [{ winner: 0, finish: 'nope', bey: ['a'] }, { winner: 1, finish: 'over', bey: ['a', 'b'] }, 5] },
    ]);
    expect(out).toEqual([
      {
        at: 1,
        target: 4,
        names: ['A', 'B'],
        rounds: [
          { winner: null, finish: null, bey: ['a', ''] },
          { winner: 1, finish: 'over', bey: ['a', 'b'] },
        ],
      },
    ]);
    expect(sanitizeHistory('nope')).toEqual([]);
  });
});

describe('historyCsv', () => {
  it('writes one row per battle and neutralises formulas', () => {
    const csv = historyCsv(
      [{ at: Date.UTC(2026, 9, 30), target: 4, names: ['=A', 'B, Jr'], rounds: [r(1, 'over'), r(null, null)] }],
      ['match', 'date', 'battle', 'p1', 'bey1', 'p2', 'bey2', 'winner', 'finish', 'points'],
      (f) => f ?? 'draw',
    );
    expect(csv.split('\n')).toEqual([
      'match,date,battle,p1,bey1,p2,bey2,winner,finish,points',
      `1,2026-10-30,1,'=A,Dran,"B, Jr",Hells,"B, Jr",over,2`,
      `1,2026-10-30,2,'=A,Dran,"B, Jr",Hells,,draw,0`,
    ]);
  });
});

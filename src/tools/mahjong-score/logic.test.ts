import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAKES,
  MAX_ENTRIES,
  NAME_MAX,
  STAKE_PRESETS,
  advanceDealer,
  cleanName,
  cleanStakes,
  dealerExtraTai,
  directDeltas,
  fillFourth,
  handPayments,
  initialDealer,
  paymentDeltas,
  presetIndex,
  removeEntry,
  replaceEntry,
  replay,
  roundInfo,
  sanitizeGame,
  settle,
  type DealerState,
  type Entry,
  type Seat,
  type Stakes,
  type WinEntry,
} from './logic';

const stakes: Stakes = { base: 100, perTai: 20 };
const win = (winner: Seat, from: Seat | null, tai: number, bonus = true): WinEntry => ({ kind: 'win', winner, from, tai, bonus });
const draw: Entry = { kind: 'draw' };
const at = (dealer: Seat, streak = 0): DealerState => ({ dealer, streak, passes: 0 });
const amounts = (hand: WinEntry, dealer: DealerState, s = stakes) =>
  Object.fromEntries(handPayments(hand, dealer, s).map((p) => [p.payer, p.amount]));

describe('dealerExtraTai', () => {
  it('is 1 for the dealer plus 2 per streak', () => {
    expect([0, 1, 2, 3, 5].map(dealerExtraTai)).toEqual([1, 3, 5, 7, 11]);
  });
});

describe('handPayments', () => {
  it('discard between two non-dealers: base + tai × perTai, no bonus', () => {
    // 100 + 3 × 20 = 160
    expect(amounts(win(1, 2, 3), at(0, 4))).toEqual({ 2: 160 });
    expect(handPayments(win(1, 2, 3), at(0, 4), stakes)[0]).toEqual({ payer: 2, tai: 3, extraTai: 0, amount: 160 });
  });

  it('non-dealer wins off the dealer: the dealer pays the bonus', () => {
    // n = 0: 100 + (5 + 1) × 20 = 220; n = 2: 100 + (5 + 5) × 20 = 300
    expect(amounts(win(0, 2, 5), at(2, 0))).toEqual({ 2: 220 });
    expect(amounts(win(0, 2, 5), at(2, 2))).toEqual({ 2: 300 });
  });

  it('dealer wins off a discard: the discarder pays the bonus', () => {
    // 100 + (1 + 1) × 20 = 140; n = 3: 100 + (1 + 7) × 20 = 260
    expect(amounts(win(3, 0, 1), at(3, 0))).toEqual({ 0: 140 });
    expect(amounts(win(3, 0, 1), at(3, 3))).toEqual({ 0: 260 });
  });

  it('dealer self-draw at n = 2 with 5 tai on 100/20: each of three pays 300', () => {
    // 100 + (5 + 5) × 20 = 300
    const payments = handPayments(win(3, null, 5), at(3, 2), stakes);
    expect(payments.map((p) => p.payer)).toEqual([0, 1, 2]);
    expect(payments.map((p) => p.amount)).toEqual([300, 300, 300]);
    expect(payments.every((p) => p.extraTai === 5)).toBe(true);
    expect(paymentDeltas(3, payments)).toEqual([-300, -300, -300, 900]);
  });

  it('non-dealer self-draw: only the dealer pays the bonus', () => {
    // dealer seat 1 at n = 2: 100 + (2 + 5) × 20 = 240; the two others 100 + 2 × 20 = 140
    expect(amounts(win(3, null, 2), at(1, 2))).toEqual({ 0: 140, 1: 240, 2: 140 });
    expect(paymentDeltas(3, handPayments(win(3, null, 2), at(1, 2), stakes))).toEqual([-140, -240, -140, 520]);
  });

  it('adds nothing when the bonus is off for the hand', () => {
    expect(amounts(win(3, null, 5, false), at(3, 2))).toEqual({ 0: 200, 1: 200, 2: 200 });
    expect(amounts(win(0, 2, 5, false), at(2, 4))).toEqual({ 2: 200 });
  });

  it('a hand with 0 tai pays the base only', () => {
    expect(amounts(win(1, 2, 0), at(0))).toEqual({ 2: 100 });
    // dealer still adds 1 tai: 100 + 1 × 20
    expect(amounts(win(0, 2, 0), at(0))).toEqual({ 2: 120 });
  });

  it('uses the stakes it is given', () => {
    // 300 + (4 + 3) × 100 = 1000
    expect(amounts(win(0, 1, 4), at(0, 1), { base: 300, perTai: 100 })).toEqual({ 1: 1000 });
    // 30 + 6 × 10 = 90
    expect(amounts(win(2, 1, 6), at(0, 1), { base: 30, perTai: 10 })).toEqual({ 1: 90 });
  });
});

describe('advanceDealer', () => {
  it('dealer win keeps the deal and adds to the streak', () => {
    expect(advanceDealer({ dealer: 1, streak: 0, passes: 1 }, win(1, null, 3), 0)).toEqual({ dealer: 1, streak: 1, passes: 1 });
    expect(advanceDealer({ dealer: 1, streak: 4, passes: 1 }, win(1, 3, 3), 0)).toEqual({ dealer: 1, streak: 5, passes: 1 });
  });

  it('a drawn hand keeps the deal and adds to the streak', () => {
    expect(advanceDealer({ dealer: 2, streak: 1, passes: 2 }, draw, 0)).toEqual({ dealer: 2, streak: 2, passes: 2 });
  });

  it('any other win moves the deal to the next seat with streak 0', () => {
    expect(advanceDealer({ dealer: 0, streak: 3, passes: 0 }, win(2, 0, 1), 0)).toEqual({ dealer: 1, streak: 0, passes: 1 });
    expect(advanceDealer({ dealer: 3, streak: 0, passes: 3 }, win(1, null, 1), 0)).toEqual({ dealer: 0, streak: 0, passes: 4 });
  });

  it('a direct entry changes nothing', () => {
    const state = { dealer: 2 as Seat, streak: 2, passes: 6 };
    expect(advanceDealer(state, { kind: 'direct', deltas: [10, -10, 0, 0] }, 0)).toEqual(state);
  });

  it('a manual change sets dealer and streak and keeps the wind display consistent', () => {
    // passes 5 = 南風南 with start dealer 0; moving the deal to seat 3 → 南風北 = passes 7
    expect(advanceDealer({ dealer: 1, streak: 0, passes: 5 }, { kind: 'dealer', dealer: 3, streak: 2, wind: null }, 0)).toEqual({
      dealer: 3,
      streak: 2,
      passes: 7,
    });
    // jump to 西風 as well; start dealer is seat 2, so seat 1 is the fourth position → passes 8 + 3
    expect(advanceDealer({ dealer: 2, streak: 0, passes: 0 }, { kind: 'dealer', dealer: 1, streak: 0, wind: 2 }, 2)).toEqual({
      dealer: 1,
      streak: 0,
      passes: 11,
    });
  });
});

describe('roundInfo', () => {
  it('names the wind and position from the number of passes', () => {
    expect(roundInfo(0).label).toBe('東風東');
    expect(roundInfo(3).label).toBe('東風北');
    expect(roundInfo(4).label).toBe('南風東');
    expect(roundInfo(10).label).toBe('西風西');
    expect(roundInfo(15)).toEqual({ game: 1, wind: 3, position: 3, label: '北風北' });
    expect(roundInfo(16)).toEqual({ game: 2, wind: 0, position: 0, label: '東風東' });
  });
});

/** Small seeded generator (mulberry32) so the random cases are the same on every run. */
function rng(seed: number): (n: number) => number {
  let a = seed | 0;
  return (n) => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
}

/** Nine hands on 100/20, start dealer seat 0. Every expected number below is worked out by hand. */
const script: Entry[] = [
  win(1, 2, 3), // dealer 0: no dealer involved, seat 2 pays 100 + 3×20 = 160; deal moves to seat 1
  win(1, null, 4), // dealer 1 (n=0) self-draw: 100 + (4+1)×20 = 200 each; stays, n=1
  draw, // stays, n=2
  win(3, null, 2), // dealer 1 (n=2): seats 0 and 2 pay 140, dealer pays 100 + (2+5)×20 = 240; moves to seat 2
  win(0, 2, 5), // dealer 2 (n=0) discards: 100 + (5+1)×20 = 220; moves to seat 3
  win(3, 0, 1), // dealer 3 (n=0) wins: 100 + (1+1)×20 = 140; stays, n=1
  draw, // stays, n=2
  win(3, null, 5), // dealer 3 (n=2) self-draw: 300 each; stays, n=3
  win(1, 2, 2), // dealer 3: no dealer involved, 100 + 2×20 = 140; moves to seat 0
];

describe('replay', () => {
  const game = { stakes, startDealer: 0 as Seat, entries: script };

  it('keeps running totals that match the hand calculation', () => {
    const { rows, totals, hands } = replay(game);
    expect(rows.map((r) => r.totals)).toEqual([
      [0, 160, -160, 0],
      [-200, 760, -360, -200],
      [-200, 760, -360, -200],
      [-340, 520, -500, 320],
      [-120, 520, -720, 320],
      [-260, 520, -720, 460],
      [-260, 520, -720, 460],
      [-560, 220, -1020, 1360],
      [-560, 360, -1160, 1360],
    ]);
    expect(totals).toEqual([-560, 360, -1160, 1360]);
    expect(hands).toBe(9);
    expect(rows.map((r) => r.handNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('tracks the dealer, the streak and the wind', () => {
    const { rows, dealer } = replay(game);
    expect(rows.map((r) => [r.before.dealer, r.before.streak])).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
    ]);
    expect(dealer).toEqual({ dealer: 0, streak: 0, passes: 4 });
    expect(roundInfo(dealer.passes).label).toBe('南風東');
    expect(roundInfo(rows[5].before.passes).label).toBe('東風北');
  });

  it('every row and the running total sum to zero', () => {
    for (const row of replay(game).rows) {
      expect(row.deltas.reduce((a, b) => a + b, 0)).toBe(0);
      expect(row.totals.reduce((a, b) => a + b, 0)).toBe(0);
    }
  });

  it('recomputes payments and the dealer after a middle hand is deleted', () => {
    // Without hand 4 the deal stays on seat 1 (n=2) one hand longer, so every later hand changes:
    // hand 5: seat 2 is no longer dealer → 100 + 5×20 = 200; deal moves to seat 2
    // hand 6: seat 3 is not dealer yet → 100 + 1×20 = 120; deal moves to seat 3
    // hand 8: dealer 3 at n=1 → 100 + (5+3)×20 = 260 each
    const { rows, totals, dealer } = replay({ ...game, entries: removeEntry(script, 3) });
    expect(rows).toHaveLength(8);
    expect(rows.map((r) => r.handNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(rows[3].deltas).toEqual([200, 0, -200, 0]);
    expect(rows[4].deltas).toEqual([-120, 0, 0, 120]);
    expect(rows[6].deltas).toEqual([-260, -260, -260, 780]);
    expect(totals).toEqual([-380, 640, -960, 700]);
    expect(dealer).toEqual({ dealer: 0, streak: 0, passes: 4 });
  });

  it('recomputes after a hand is edited', () => {
    // hand 2 becomes a non-dealer win, so the deal moves on and hand 3 (draw) belongs to seat 2
    const { rows } = replay({ ...game, entries: replaceEntry(script, 1, win(0, 3, 2)) });
    expect(rows[1].deltas).toEqual([140, 0, 0, -140]);
    expect([rows[2].before.dealer, rows[2].after.streak]).toEqual([2, 1]);
  });

  it('mixes direct entries and manual dealer changes into the same totals', () => {
    const entries: Entry[] = [
      { kind: 'direct', deltas: [500, -200, -300, 0] },
      { kind: 'dealer', dealer: 2, streak: 1, wind: null },
      win(2, null, 3), // dealer 2 at n=1: 100 + (3+3)×20 = 220 each
    ];
    const { rows, totals, dealer, hands } = replay({ stakes, startDealer: 0, entries });
    expect(rows.map((r) => r.handNo)).toEqual([null, null, 1]);
    expect(rows[1].deltas).toEqual([0, 0, 0, 0]);
    expect(totals).toEqual([280, -420, 360, -220]);
    expect(dealer).toEqual({ dealer: 2, streak: 2, passes: 2 });
    expect(hands).toBe(1);
  });

  it('stays zero-sum over random games', () => {
    const rand = rng(20270205);
    for (let g = 0; g < 50; g++) {
      const entries: Entry[] = [];
      for (let i = 0; i < 40; i++) {
        const roll = rand(10);
        if (roll === 0) entries.push(draw);
        else if (roll === 1) entries.push({ kind: 'dealer', dealer: rand(4) as Seat, streak: rand(6), wind: null });
        else {
          const winner = rand(4) as Seat;
          const from = rand(3) === 0 ? null : (((winner + 1 + rand(3)) % 4) as Seat);
          entries.push(win(winner, from, rand(20), rand(4) !== 0));
        }
      }
      const { rows, totals } = replay({ stakes: STAKE_PRESETS[rand(STAKE_PRESETS.length)], startDealer: rand(4) as Seat, entries });
      expect(totals.reduce((a, b) => a + b, 0)).toBe(0);
      for (const row of rows) expect(row.deltas.reduce((a, b) => a + b, 0)).toBe(0);
      const transfers = settle(totals);
      expect(transfers.length).toBeLessThanOrEqual(3);
    }
  });
});

/** Applies the transfers and returns what is left of each balance. */
function afterTransfers(totals: number[], transfers: ReturnType<typeof settle>): number[] {
  const left = [...totals];
  for (const t of transfers) {
    expect(t.amount).toBeGreaterThan(0);
    expect(t.from).not.toBe(t.to);
    left[t.from] += t.amount;
    left[t.to] -= t.amount;
  }
  return left;
}

/** Fewest transfers possible for four zero-sum balances. */
function fewest(totals: number[]): number {
  const nonZero = totals.filter((v) => v !== 0);
  if (nonZero.length <= 1) return 0;
  if (nonZero.length < 4) return nonZero.length - 1;
  const [a, b, c, d] = nonZero;
  return a + b === 0 || a + c === 0 || a + d === 0 ? 2 : 3;
}

describe('settle', () => {
  it('clears the scripted game in three transfers', () => {
    expect(settle([-560, 360, -1160, 1360])).toEqual([
      { from: 2, to: 3, amount: 1160 },
      { from: 0, to: 1, amount: 360 },
      { from: 0, to: 3, amount: 200 },
    ]);
  });

  it('needs no transfers when everybody is even', () => {
    expect(settle([0, 0, 0, 0])).toEqual([]);
  });

  it('one loser pays three winners, one winner collects from three losers', () => {
    expect(settle([-900, 300, 300, 300])).toHaveLength(3);
    expect(settle([900, -300, -300, -300])).toHaveLength(3);
    expect(afterTransfers([900, -300, -300, -300], settle([900, -300, -300, -300]))).toEqual([0, 0, 0, 0]);
  });

  it('finds the two-transfer answer when the balances pair up', () => {
    expect(settle([600, 400, -400, -600])).toHaveLength(2);
    expect(settle([500, -200, 200, -500])).toEqual([
      { from: 3, to: 0, amount: 500 },
      { from: 1, to: 2, amount: 200 },
    ]);
    expect(settle([300, 700, -700, -300])).toHaveLength(2);
  });

  it('covers every balance with the fewest transfers, never more than three', () => {
    const rand = rng(7);
    for (let i = 0; i < 2000; i++) {
      const a = (rand(41) - 20) * 10;
      const b = (rand(41) - 20) * 10;
      const c = (rand(41) - 20) * 10;
      const totals = [a, b, c, 0 - (a + b + c)];
      const transfers = settle(totals);
      expect(afterTransfers(totals, transfers)).toEqual([0, 0, 0, 0]);
      expect(transfers.length).toBe(fewest(totals));
      expect(transfers.length).toBeLessThanOrEqual(3);
    }
  });
});

describe('direct entry', () => {
  it('fills the one missing value so the four sum to zero', () => {
    expect(fillFourth([500, -200, -100, null])).toEqual([500, -200, -100, -200]);
    expect(fillFourth([null, -200, -100, -200])).toEqual([500, -200, -100, -200]);
    expect(fillFourth([0, 0, null, 0])).toEqual([0, 0, 0, 0]);
  });

  it('does not guess when none or several values are missing', () => {
    expect(fillFourth([1, 2, 3, -6])).toBeNull();
    expect(fillFourth([1, null, null, 4])).toBeNull();
    expect(fillFourth([1, 2, null])).toBeNull();
  });

  it('accepts only complete, zero-sum, non-empty rounds', () => {
    expect(directDeltas([500, -200, -100, -200])).toEqual([500, -200, -100, -200]);
    expect(directDeltas([500, -200, -100, -100])).toBeNull();
    expect(directDeltas([500, -200, -300, null])).toBeNull();
    expect(directDeltas([0, 0, 0, 0])).toBeNull();
    expect(directDeltas([0.5, -0.5, 0, 0])).toBeNull();
  });
});

describe('stakes and names', () => {
  it('recognises the presets', () => {
    expect(STAKE_PRESETS.map((p) => `${p.base}/${p.perTai}`)).toEqual(['30/10', '50/20', '100/20', '100/50', '300/100']);
    expect(presetIndex({ base: 100, perTai: 50 })).toBe(3);
    expect(presetIndex({ base: 200, perTai: 50 })).toBe(-1);
  });

  it('cleans stakes to non-negative whole numbers', () => {
    expect(cleanStakes({ base: '200', perTai: 49.6 })).toEqual({ base: 200, perTai: 50 });
    expect(cleanStakes({ base: -5, perTai: 'x' })).toEqual({ base: 0, perTai: DEFAULT_STAKES.perTai });
    expect(cleanStakes(null)).toEqual(DEFAULT_STAKES);
  });

  it('trims names', () => {
    expect(cleanName('  阿  公 ')).toBe('阿 公');
    expect(Array.from(cleanName('一二三四五六七八九十'))).toHaveLength(NAME_MAX);
    expect(cleanName('Grandpa Chen')).toBe('Grandpa');
  });
});

describe('sanitizeGame', () => {
  it('returns an empty game for junk', () => {
    for (const junk of [null, undefined, 'x', 42, [], { entries: 'no' }]) {
      expect(sanitizeGame(junk)).toEqual({ names: ['', '', '', ''], stakes: DEFAULT_STAKES, startDealer: 0, entries: [] });
    }
  });

  it('round-trips a stored game', () => {
    const game = {
      names: ['爸', '媽', '阿姨', '我'] as [string, string, string, string],
      stakes,
      startDealer: 2 as Seat,
      entries: [...script, { kind: 'direct', deltas: [10, -10, 0, 0] }, { kind: 'dealer', dealer: 1, streak: 2, wind: 3 }] as Entry[],
    };
    expect(sanitizeGame(JSON.parse(JSON.stringify(game)))).toEqual(game);
  });

  it('drops malformed entries and keeps the rest', () => {
    const game = sanitizeGame({
      names: ['A', 5, null],
      startDealer: 7,
      entries: [
        { kind: 'win', winner: 1, from: 1, tai: 3 },
        { kind: 'win', winner: 4, from: null, tai: 3 },
        { kind: 'win', winner: 2, tai: -4 },
        { kind: 'direct', deltas: [10, 10, 0, 0] },
        { kind: 'dealer', dealer: 2, streak: 500 },
        { kind: 'what' },
        null,
      ],
    });
    expect(game.names).toEqual(['A', '', '', '']);
    expect(game.startDealer).toBe(0);
    expect(game.entries).toEqual([
      { kind: 'win', winner: 2, from: null, tai: 0, bonus: true },
      { kind: 'dealer', dealer: 2, streak: 99, wind: null },
    ]);
  });

  it('caps the history length', () => {
    const entries = Array.from({ length: MAX_ENTRIES + 20 }, () => ({ kind: 'draw' }));
    expect(sanitizeGame({ entries }).entries).toHaveLength(MAX_ENTRIES);
  });
});

describe('initialDealer', () => {
  it('starts at the chosen seat with no streak', () => {
    expect(initialDealer(2)).toEqual({ dealer: 2, streak: 0, passes: 0 });
  });
});

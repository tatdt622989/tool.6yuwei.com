import { describe, expect, it } from 'vitest';
import {
  buildLadder,
  buildOutcomes,
  checkNames,
  cleanWinners,
  countOutcomes,
  decodeGame,
  EMPTY_DRAFT,
  encodeGame,
  FRAGMENT_KEY,
  isFinished,
  ladderEnds,
  ladderRows,
  LIMITS,
  newGame,
  newSeed,
  normalizeDraft,
  normalizeSession,
  parseNames,
  parseOutcomes,
  PATH_COLORS,
  pathPoints,
  play,
  reveal,
  revealAll,
  RUNGS,
  seededRandom,
  seedFromText,
  seedToText,
  serializeSession,
  shareUrl,
  startSession,
  traceColumns,
  type Draft,
  type Game,
  type Ladder,
  type RandomSource,
  type Seed,
} from './logic';
import { toBase64Url } from '../scratch-card/logic';

/** Repeatable generator (mulberry32) so statistical tests cannot flake. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return (array) => {
    for (let i = 0; i < array.length; i++) {
      state = (state + 0x6d2b79f5) >>> 0;
      let z = state;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      array[i] = (z ^ (z >>> 14)) >>> 0;
    }
    return array;
  };
}

const LABELS = { hit: '中獎', blank: '沒中', order: '{n} 號' };
const draft = (patch: Partial<Draft>): Draft => ({ ...EMPTY_DRAFT, ...patch });
const people = (n: number) => Array.from({ length: n }, (_, i) => `P${i + 1}`);
const SEED: Seed = [1, 2, 3, 4];
const GAME: Game = { title: '誰買飲料', names: ['小明', '小美', '阿傑', '雅婷'], outcomes: ['買飲料', '沒事', '沒事', '沒事'], seed: SEED };

function wire(data: unknown): string {
  return FRAGMENT_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

describe('parseNames / checkNames', () => {
  it('splits on line breaks and list punctuation, but not on spaces', () => {
    expect(parseNames('小明\n小美，阿傑、雅婷;Mary Jane\r\n\n  Bob  ')).toEqual(['小明', '小美', '阿傑', '雅婷', 'Mary Jane', 'Bob']);
  });

  it('cuts a name to the limit in code points', () => {
    expect(parseNames('好'.repeat(30))[0]).toBe('好'.repeat(LIMITS.name));
  });

  it('keeps repeated names, since each still gets its own line', () => {
    expect(parseNames('小明\n小明')).toEqual(['小明', '小明']);
  });

  it('accepts 2 to 20 people', () => {
    expect(checkNames(people(1))).toBe('few');
    expect(checkNames(people(2))).toBeNull();
    expect(checkNames(people(20))).toBeNull();
    expect(checkNames(people(21))).toBe('many');
  });
});

describe('parseOutcomes', () => {
  it('reads one outcome per line and repeats a line that ends with a count', () => {
    expect(parseOutcomes('買飲料\n洗碗 x2\n沒事×3\n\nFree*2')).toEqual(['買飲料', '洗碗', '洗碗', '沒事', '沒事', '沒事', 'Free', 'Free']);
  });

  it('does not treat a word ending in x as a count', () => {
    expect(parseOutcomes('Xbox\nMax\niPhone 16')).toEqual(['Xbox', 'Max', 'iPhone 16']);
  });

  it('stops expanding far past the limit', () => {
    expect(parseOutcomes('A x999').length).toBe(LIMITS.maxPeople * 2);
  });
});

describe('buildOutcomes', () => {
  it('one winner, the rest blank', () => {
    expect(buildOutcomes(4, draft({ mode: 'one' }), LABELS)).toEqual({ outcomes: ['中獎', '沒中', '沒中', '沒中'], error: null });
  });

  it('uses the labels typed in the form', () => {
    const { outcomes } = buildOutcomes(3, draft({ mode: 'one', hit: ' 請客 ', blank: '免費' }), LABELS);
    expect(outcomes).toEqual(['請客', '免費', '免費']);
  });

  it('several winners, never more than the group', () => {
    expect(buildOutcomes(5, draft({ mode: 'some', winners: 2 }), LABELS).outcomes).toEqual(['中獎', '中獎', '沒中', '沒中', '沒中']);
    expect(buildOutcomes(3, draft({ mode: 'some', winners: 9 }), LABELS).outcomes).toEqual(['中獎', '中獎', '中獎']);
  });

  it('numbered order', () => {
    expect(buildOutcomes(3, draft({ mode: 'order' }), LABELS).outcomes).toEqual(['1 號', '2 號', '3 號']);
  });

  it('fills a short custom list with blanks', () => {
    expect(buildOutcomes(4, draft({ mode: 'custom', custom: '買飲料\n洗碗' }), LABELS)).toEqual({
      outcomes: ['買飲料', '洗碗', '沒中', '沒中'],
      error: null,
    });
  });

  it('rejects an empty custom list and one longer than the group', () => {
    expect(buildOutcomes(3, draft({ mode: 'custom', custom: ' \n' }), LABELS).error).toBe('empty');
    const tooMany = buildOutcomes(3, draft({ mode: 'custom', custom: 'A x4' }), LABELS);
    expect(tooMany.error).toBe('many');
    expect(tooMany.outcomes).toHaveLength(4);
  });

  it('always returns one outcome per person when there is no error', () => {
    for (const mode of ['one', 'some', 'order', 'custom'] as const) {
      for (let n = LIMITS.minPeople; n <= LIMITS.maxPeople; n++) {
        const result = buildOutcomes(n, draft({ mode, custom: 'A\nB' }), LABELS);
        expect(result.error).toBeNull();
        expect(result.outcomes).toHaveLength(n);
      }
    }
  });
});

describe('countOutcomes / cleanWinners / normalizeDraft', () => {
  it('counts each distinct outcome in first-seen order', () => {
    expect(countOutcomes(['中獎', '沒中', '沒中', '中獎', '加碼'])).toEqual([['中獎', 2], ['沒中', 2], ['加碼', 1]]);
  });

  it('keeps the winner count between 1 and the largest group', () => {
    expect(cleanWinners('3')).toBe(3);
    expect(cleanWinners(0)).toBe(1);
    expect(cleanWinners(99)).toBe(LIMITS.maxPeople);
    expect(cleanWinners('abc')).toBe(EMPTY_DRAFT.winners);
  });

  it('falls back to an empty draft for anything malformed', () => {
    expect(normalizeDraft(null)).toEqual(EMPTY_DRAFT);
    expect(normalizeDraft({ names: 5, mode: 'bogus', winners: 'x' })).toEqual(EMPTY_DRAFT);
    expect(normalizeDraft({ names: 'A\nB', mode: 'order', winners: 3, hit: 'H', blank: 'B', custom: 'C', title: 'T' })).toEqual({
      names: 'A\nB',
      mode: 'order',
      winners: 3,
      hit: 'H',
      blank: 'B',
      custom: 'C',
      title: 'T',
    });
  });
});

describe('seed', () => {
  it('round-trips through 22 characters of text', () => {
    const seed: Seed = [0, 0xffffffff, 0x12345678, 0x80000001];
    const text = seedToText(seed);
    expect(text).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(seedFromText(text)).toEqual(seed);
  });

  it('rejects text that is not a seed', () => {
    for (const bad of ['', 'abc', 'A'.repeat(21), 'A'.repeat(23), '!'.repeat(22), 5, null]) expect(seedFromText(bad)).toBeNull();
  });

  it('draws four words from the random source', () => {
    expect(newSeed((array) => array.fill(7))).toEqual([7, 7, 7, 7]);
    const real = newSeed();
    expect(real).toHaveLength(4);
    for (const word of real) expect(Number.isInteger(word) && word >= 0 && word <= 0xffffffff).toBe(true);
  });

  it('gives the same stream for the same seed and a different one for another', () => {
    const take = (seed: Seed) => Array.from(seededRandom(seed)(new Uint32Array(8)));
    expect(take(SEED)).toEqual(take(SEED));
    expect(take(SEED)).not.toEqual(take([1, 2, 3, 5]));
    expect(take([0, 0, 0, 0])).not.toEqual(take([0, 0, 0, 1]));
  });

  it('spreads its output evenly over the 32-bit range', () => {
    const values = seededRandom([9, 8, 7, 6])(new Uint32Array(40_000));
    const buckets = new Array<number>(8).fill(0);
    for (const value of values) buckets[value >>> 29]++;
    for (const count of buckets) expect(Math.abs(count - 5000)).toBeLessThan(300);
  });
});

function checkLadder(ladder: Ladder) {
  const rows = ladderRows(ladder.columns);
  expect(ladder.rungs).toHaveLength(rows);
  for (const row of ladder.rungs) {
    for (let i = 0; i < row.length; i++) {
      expect(row[i]).toBeGreaterThanOrEqual(0);
      expect(row[i]).toBeLessThan(ladder.columns - 1);
      // Ascending, and never two rungs on neighbouring gaps at one height.
      if (i > 0) expect(row[i] - row[i - 1]).toBeGreaterThanOrEqual(2);
    }
  }
  for (let gap = 0; gap < ladder.columns - 1; gap++) {
    const count = ladder.rungs.filter((row) => row.includes(gap)).length;
    expect(count).toBeGreaterThanOrEqual(RUNGS.min);
    expect(count).toBeLessThanOrEqual(RUNGS.max);
  }
}

describe('buildLadder', () => {
  it('keeps rungs apart and gives every gap its share, for every group size', () => {
    const random = seeded(11);
    for (let columns = LIMITS.minPeople; columns <= LIMITS.maxPeople; columns++) {
      for (let i = 0; i < 60; i++) checkLadder(buildLadder(columns, random));
    }
  });

  it('always maps the top to the bottom as a permutation', () => {
    const random = seeded(12);
    for (let columns = LIMITS.minPeople; columns <= LIMITS.maxPeople; columns++) {
      for (let i = 0; i < 60; i++) {
        const ends = ladderEnds(buildLadder(columns, random));
        expect([...ends].sort((a, b) => a - b)).toEqual(Array.from({ length: columns }, (_, c) => c));
      }
    }
  });

  it('is repeatable with the same random source', () => {
    expect(buildLadder(9, seeded(5))).toEqual(buildLadder(9, seeded(5)));
    expect(buildLadder(9, seeded(5))).not.toEqual(buildLadder(9, seeded(6)));
  });

  it('works with the browser random source', () => {
    checkLadder(buildLadder(6));
  });

  it('rejects a group outside 2 to 20', () => {
    for (const bad of [1, 21, 2.5, NaN]) expect(() => buildLadder(bad)).toThrow(RangeError);
  });
});

describe('traceColumns / pathPoints', () => {
  // Lines 0-1-2; rungs: 0–1 at row 0, 1–2 at row 1, 0–1 at row 3.
  const ladder: Ladder = { columns: 3, rungs: [[0], [1], [], [0]] };

  it('follows every rung it meets', () => {
    expect(traceColumns(ladder, 0)).toEqual([0, 1, 2, 2, 2]);
    expect(traceColumns(ladder, 1)).toEqual([1, 0, 0, 0, 1]);
    expect(traceColumns(ladder, 2)).toEqual([2, 2, 1, 1, 0]);
    expect(ladderEnds(ladder)).toEqual([2, 1, 0]);
  });

  it('lists the corners of a path from the top edge to the bottom edge', () => {
    expect(pathPoints(ladder, 0)).toEqual([[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 5]]);
    expect(pathPoints({ columns: 2, rungs: [[], []] }, 1)).toEqual([[1, 0], [1, 3]]);
  });

  it('only ever moves straight down or straight across', () => {
    const big = buildLadder(20, seeded(3));
    for (let start = 0; start < 20; start++) {
      const points = pathPoints(big, start);
      for (let i = 1; i < points.length; i++) {
        const dx = Math.abs(points[i][0] - points[i - 1][0]);
        const dy = points[i][1] - points[i - 1][1];
        expect((dx === 1 && dy === 0) || (dx === 0 && dy > 0)).toBe(true);
      }
      expect(points.at(-1)).toEqual([ladderEnds(big)[start], ladderRows(20) + 1]);
    }
  });
});

describe('play', () => {
  it('rebuilds the same ladder and results from the same seed', () => {
    expect(play(GAME)).toEqual(play({ ...GAME, names: [...GAME.names], outcomes: [...GAME.outcomes] }));
    const other = play({ ...GAME, seed: [4, 3, 2, 1] });
    expect(other.ladder).not.toEqual(play(GAME).ladder);
  });

  it('gives each person exactly one of the outcomes', () => {
    const random = seeded(21);
    for (let n = LIMITS.minPeople; n <= LIMITS.maxPeople; n++) {
      const outcomes = people(n).map((_, i) => `O${i}`);
      const result = play(newGame('', people(n), outcomes, random));
      expect([...result.results].sort()).toEqual([...outcomes].sort());
      expect([...result.bottom].sort()).toEqual([...outcomes].sort());
      result.ends.forEach((end, person) => expect(result.results[person]).toBe(result.bottom[end]));
    }
  });

  it('gives every position the same chance at every outcome', () => {
    const random = seeded(2026);
    const n = 6;
    const trials = 30_000;
    const names = people(n);
    const outcomes = names.map((_, i) => String(i));
    const counts = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let i = 0; i < trials; i++) {
      play(newGame('', names, outcomes, random)).results.forEach((outcome, person) => counts[person][Number(outcome)]++);
    }
    // Expected 5,000 per cell with a standard deviation near 65.
    for (const row of counts) for (const count of row) expect(Math.abs(count - trials / n)).toBeLessThan(330);
  });

  it('would not be even from the rungs alone, which is why the bottom is shuffled', () => {
    const random = seeded(7);
    const trials = 4000;
    let stayed = 0;
    for (let i = 0; i < trials; i++) if (ladderEnds(buildLadder(8, random))[0] === 0) stayed++;
    // With eight lines an even draw would bring the first line back to itself 12.5% of the time.
    expect(stayed / trials).toBeGreaterThan(0.25);
  });
});

describe('session', () => {
  it('starts covered and uncovers with the first path', () => {
    let session = startSession(GAME);
    expect(session).toEqual({ game: GAME, opened: false, revealed: [] });
    session = reveal(session, 2);
    expect(session.opened).toBe(true);
    expect(session.revealed).toEqual([2]);
    expect(reveal(session, 2).revealed).toEqual([2]);
    expect(reveal(session, 9)).toBe(session);
    expect(isFinished(session)).toBe(false);
  });

  it('reveals everyone, keeping the order paths were already shown in', () => {
    const session = revealAll(reveal(startSession(GAME), 3));
    expect(session.revealed).toEqual([3, 0, 1, 2]);
    expect(isFinished(session)).toBe(true);
  });

  it('survives a round trip through storage', () => {
    const session = reveal(reveal(startSession(GAME), 1), 0);
    const stored = JSON.parse(JSON.stringify(serializeSession(session)));
    expect(normalizeSession(stored)).toEqual(session);
    expect(play(normalizeSession(stored)!.game)).toEqual(play(GAME));
  });

  it('drops stored state that is not a valid draw', () => {
    const good = serializeSession(startSession(GAME)) as Record<string, unknown>;
    expect(normalizeSession(null)).toBeNull();
    expect(normalizeSession({ ...good, seed: 'nope' })).toBeNull();
    expect(normalizeSession({ ...good, names: ['只有一個'] })).toBeNull();
    expect(normalizeSession({ ...good, outcomes: ['少一個'] })).toBeNull();
    expect(normalizeSession({ ...good, names: ['A', 5, 'C', 'D'] })).toBeNull();
    expect(normalizeSession({ ...good, revealed: [1, 1, 99, -1, 'x', 0] })!.revealed).toEqual([1, 0]);
  });
});

describe('share link', () => {
  it('round-trips a draw through the fragment', () => {
    const decoded = decodeGame('#' + encodeGame(GAME));
    expect(decoded).toEqual({ status: 'ok', game: GAME });
    if (decoded.status === 'ok') expect(play(decoded.game)).toEqual(play(GAME));
  });

  it('round-trips every group size, with and without repeated outcomes', () => {
    const random = seeded(31);
    for (let n = LIMITS.minPeople; n <= LIMITS.maxPeople; n++) {
      for (const outcomes of [people(n).map((_, i) => `第 ${i + 1} 個`), buildOutcomes(n, draft({ mode: 'some', winners: 2 }), LABELS).outcomes]) {
        const game = newGame('', people(n), outcomes, random);
        expect(decodeGame(encodeGame(game))).toEqual({ status: 'ok', game });
      }
    }
  });

  it('keeps the outcome order when runs of the same outcome are packed', () => {
    const game: Game = { ...GAME, names: people(7), outcomes: ['A', 'B', 'B', 'A', 'A', 'A', 'C'] };
    const decoded = decodeGame(encodeGame(game));
    expect(decoded.status === 'ok' && decoded.game.outcomes).toEqual(game.outcomes);
  });

  it('stays within the fragment limit for the largest draw', () => {
    const game = newGame('字'.repeat(LIMITS.title), people(20).map(() => '😀'.repeat(LIMITS.name)), people(20).map((_, i) => '獎'.repeat(LIMITS.outcome - 2) + String(i).padStart(2, '0')));
    expect(encodeGame(game).length).toBeLessThan(LIMITS.fragment);
    expect(decodeGame(encodeGame(game)).status).toBe('ok');
  });

  it('puts the draw after # and drops any query string', () => {
    const url = shareUrl('https://example.com/amidakuji/?utm_source=x#old', GAME);
    expect(url.startsWith('https://example.com/amidakuji/#amida=')).toBe(true);
    expect(url).not.toContain('?');
    expect(shareUrl('https://example.com/ja/amidakuji/', GAME)).toBe(`https://example.com/ja/amidakuji/#${encodeGame(GAME)}`);
  });

  it('ignores fragments that are not ladders', () => {
    expect(decodeGame('')).toEqual({ status: 'none' });
    expect(decodeGame('#faq')).toEqual({ status: 'none' });
    expect(decodeGame('#gift=abc')).toEqual({ status: 'none' });
  });

  it('never throws on a damaged or hostile fragment', () => {
    const seed = seedToText(SEED);
    const bad = [
      '#amida=',
      '#amida=***',
      '#amida=' + 'A'.repeat(LIMITS.fragment),
      '#' + FRAGMENT_KEY + toBase64Url(new Uint8Array([0xff, 0xfe, 0xfd])),
      '#' + wire('text'),
      '#' + wire([1, 2]),
      '#' + wire({ v: 2, s: seed, n: ['A', 'B'], o: ['X', 'Y'] }),
      '#' + wire({ v: 1, s: 'short', n: ['A', 'B'], o: ['X', 'Y'] }),
      '#' + wire({ v: 1, s: seed, n: ['A'], o: ['X'] }),
      '#' + wire({ v: 1, s: seed, n: people(21), o: people(21) }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: ['X'] }),
      '#' + wire({ v: 1, s: seed, n: ['A', ''], o: ['X', 'Y'] }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: [['X', 0], 'Y'] }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: [['X', 1e9]] }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: [['X', 2, 3]] }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: [{ x: 1 }, 'Y'] }),
      '#' + wire({ v: 1, s: seed, n: 'AB', o: ['X', 'Y'] }),
      '#' + wire({ v: 1, s: seed, n: ['A', 'B'], o: ['X', 'Y'], t: 5 }),
    ];
    for (const hash of bad) expect(decodeGame(hash)).toEqual({ status: 'invalid' });
  });

  it('strips control characters and line breaks from shared text', () => {
    const decoded = decodeGame(wire({ v: 1, s: seedToText(SEED), n: ['A\nB', 'C‮'], o: ['X\tY', 'Z'], t: ' T ' }));
    expect(decoded).toEqual({ status: 'ok', game: { title: 'T', names: ['A B', 'C'], outcomes: ['X Y', 'Z'], seed: SEED } });
  });
});

describe('PATH_COLORS', () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  it('has a distinct colour for each of the 20 lines', () => {
    expect(PATH_COLORS).toHaveLength(LIMITS.maxPeople);
    expect(new Set(PATH_COLORS).size).toBe(PATH_COLORS.length);
  });

  it('keeps white text readable on every colour (WCAG AA, 4.5:1)', () => {
    for (const color of PATH_COLORS) expect(1.05 / (luminance(color) + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});

import { describe, expect, it } from 'vitest';
import i18n, { type RatingId } from './i18n';
import {
  RATINGS,
  LOCK_MS,
  MAX_DELAY_MS,
  MIN_DELAY_MS,
  ROUNDS,
  abort,
  createState,
  currentRound,
  mergeBest,
  press,
  randomDelay,
  rateMs,
  sanitizeBest,
  showGo,
  summarize,
  type ReactionState,
} from './logic';

const half = () => 0.5;

/** Plays one full round: press to start, green at +delay, press after `rt` ms. */
function playRound(state: ReactionState, start: number, rt: number): ReactionState {
  let s = press(state, start, half);
  const goAt = s.goDueAt!;
  s = showGo(s, goAt);
  return press(s, goAt + rt, half);
}

describe('randomDelay', () => {
  it('stays inside the configured range', () => {
    expect(randomDelay(() => 0)).toBe(MIN_DELAY_MS);
    expect(randomDelay(() => 0.5)).toBe(3250);
    expect(randomDelay(() => 1)).toBeLessThanOrEqual(MAX_DELAY_MS);
    expect(randomDelay(() => -3)).toBe(MIN_DELAY_MS);
  });
});

describe('state machine', () => {
  it('goes idle -> waiting -> go -> result', () => {
    let s = press(createState(), 1000, half);
    expect(s.phase).toBe('waiting');
    expect(s.goDueAt).toBe(1000 + 3250);
    s = showGo(s, 4260);
    expect(s.phase).toBe('go');
    s = press(s, 4500, half);
    expect(s.phase).toBe('result');
    expect(s.results).toEqual([240]);
    expect(currentRound(s)).toBe(1);
  });

  it('flags a press before green as too early without recording', () => {
    let s = press(createState(), 0, half);
    s = press(s, 800, half);
    expect(s.phase).toBe('early');
    expect(s.results).toEqual([]);
    expect(s.earlyCount).toBe(1);
    // Overdue timer that has not painted yet still counts as early.
    s = press(press(s, 800 + LOCK_MS, half), 99999, half);
    expect(s.phase).toBe('early');
    expect(s.earlyCount).toBe(2);
  });

  it('ignores presses during the lock window', () => {
    const s = playRound(createState(), 0, 250);
    const lockedAt = s.lockedUntil;
    expect(press(s, lockedAt - 1, half)).toBe(s);
    expect(press(s, lockedAt, half).phase).toBe('waiting');
  });

  it('showGo only applies while waiting', () => {
    const idle = createState();
    expect(showGo(idle, 10)).toBe(idle);
  });

  it('finishes after five rounds and restarts on the next press', () => {
    let s = createState();
    let t = 0;
    for (const rt of [200, 250, 300, 220, 280]) {
      s = playRound(s, t, rt);
      t = s.lockedUntil + 10;
    }
    expect(s.phase).toBe('done');
    expect(s.results).toHaveLength(ROUNDS);
    expect(currentRound(s)).toBe(5);
    const next = press(s, t, half);
    expect(next.phase).toBe('waiting');
    expect(next.results).toEqual([]);
  });

  it('abort cancels a round but keeps results', () => {
    let s = playRound(createState(), 0, 240);
    s = press(s, s.lockedUntil, half);
    s = abort(s);
    expect(s.phase).toBe('idle');
    expect(s.results).toEqual([240]);
    expect(currentRound(s)).toBe(2);
    expect(abort(s)).toBe(s);
  });
});

describe('stats', () => {
  it('summarises results', () => {
    expect(summarize([300, 200, 250, 220, 280])).toEqual({ count: 5, average: 250, best: 200, worst: 300, median: 250 });
    expect(summarize([200, 300])?.median).toBe(250);
    expect(summarize([])).toBeNull();
  });

  it('rates reaction times', () => {
    expect(rateMs(150).id).toBe('elite');
    expect(rateMs(180).id).toBe('fast');
    expect(rateMs(250).id).toBe('good');
    expect(rateMs(273).id).toBe('average');
    expect(rateMs(1000).id).toBe('slower');
  });

  it('keeps the best average only for complete runs', () => {
    const empty = { bestAverage: null, bestSingle: null };
    const partial = mergeBest(empty, [210, 260]);
    expect(partial.best).toEqual({ bestAverage: null, bestSingle: 210 });
    expect(partial.newAverage).toBe(false);
    const full = mergeBest(partial.best, [240, 240, 240, 240, 240]);
    expect(full.best).toEqual({ bestAverage: 240, bestSingle: 210 });
    expect(full.newAverage).toBe(true);
    expect(full.newSingle).toBe(false);
    expect(mergeBest(full.best, [250, 250, 250, 250, 250]).newAverage).toBe(false);
  });

  it('sanitises stored data', () => {
    expect(sanitizeBest({ bestAverage: 230, bestSingle: 'x' })).toEqual({ bestAverage: 230, bestSingle: null });
    expect(sanitizeBest(undefined)).toEqual({ bestAverage: null, bestSingle: null });
  });
});

describe('i18n', () => {
  it('has a label and note for every rating in every locale', () => {
    expect(Object.keys(i18n).sort()).toEqual(['en', 'ja', 'zh-TW']);
    for (const strings of Object.values(i18n)) {
      for (const r of RATINGS) {
        expect(strings!.client.ratings[r.id as RatingId]?.label, r.id).toBeTruthy();
        expect(strings!.client.ratings[r.id as RatingId]?.note, r.id).toBeTruthy();
      }
    }
  });

  it('keeps the zh-TW rating text identical to logic', () => {
    for (const r of RATINGS) expect(i18n['zh-TW']!.client.ratings[r.id as RatingId]).toEqual({ label: r.label, note: r.note });
  });
});

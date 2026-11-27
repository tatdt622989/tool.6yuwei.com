import { describe, expect, it } from 'vitest';
import type { RankId } from './i18n';
import {
  COOLDOWN_MS,
  RANKS,
  clicksPerSecond,
  createSession,
  elapsedMs,
  finalCps,
  isMode,
  liveCps,
  mergeBest,
  rankFor,
  registerClick,
  remainingMs,
  sanitizeBest,
  tick,
  type CpsSession,
} from './logic';

function clickAt(s: CpsSession, ...times: number[]): CpsSession {
  return times.reduce((acc, t) => registerClick(acc, t), s);
}

describe('session state machine', () => {
  it('starts on the first click and counts it', () => {
    const s = registerClick(createSession(5), 1000);
    expect(s.phase).toBe('running');
    expect(s.startedAt).toBe(1000);
    expect(s.clicks).toEqual([0]);
  });

  it('counts clicks before the deadline and ignores the one after', () => {
    let s = clickAt(createSession(1), 0, 100, 500, 999);
    expect(s.clicks).toHaveLength(4);
    s = registerClick(s, 1000);
    expect(s.phase).toBe('done');
    expect(s.clicks).toHaveLength(4);
    expect(s.endedAt).toBe(1000);
  });

  it('tick finalises at the deadline and is a no-op before it', () => {
    const s = clickAt(createSession(5), 200, 300);
    expect(tick(s, 5199)).toBe(s);
    const done = tick(s, 5300);
    expect(done.phase).toBe('done');
    expect(done.endedAt).toBe(5200);
    expect(tick(createSession(5), 99999).phase).toBe('idle');
  });

  it('ignores clicks during the cooldown, then restarts', () => {
    const done = tick(clickAt(createSession(1), 0, 10), 1000);
    expect(registerClick(done, 1000 + COOLDOWN_MS - 1)).toBe(done);
    const fresh = registerClick(done, 1000 + COOLDOWN_MS);
    expect(fresh.phase).toBe('running');
    expect(fresh.clicks).toEqual([0]);
    expect(fresh.duration).toBe(1);
  });

  it('reports elapsed and remaining time clamped to the duration', () => {
    const s = clickAt(createSession(10), 1000);
    expect(elapsedMs(s, 3500)).toBe(2500);
    expect(remainingMs(s, 3500)).toBe(7500);
    expect(remainingMs(s, 50000)).toBe(0);
    expect(elapsedMs(createSession(10), 3500)).toBe(0);
  });
});

describe('scores', () => {
  it('final CPS divides by the full duration', () => {
    const times = Array.from({ length: 35 }, (_, i) => i * 140);
    const s = tick(clickAt(createSession(5), ...times), 6000);
    expect(s.clicks).toHaveLength(35);
    expect(finalCps(s)).toBe(7);
  });

  it('live CPS divides by at least one second', () => {
    const s = clickAt(createSession(5), 0, 50, 100);
    expect(liveCps(s, 100)).toBe(3);
    expect(liveCps(clickAt(createSession(5), 0, 500, 1000, 1500), 2000)).toBe(2);
    expect(liveCps(createSession(5), 0)).toBe(0);
  });

  it('buckets clicks per second', () => {
    const s = tick(clickAt(createSession(5), 0, 100, 900, 1000, 4999), 5000);
    expect(clicksPerSecond(s)).toEqual([3, 1, 0, 0, 1]);
  });

  it('maps CPS to rank tiers at the boundaries', () => {
    expect(rankFor(0).id).toBe('sloth');
    expect(rankFor(4.99).id).toBe('turtle');
    expect(rankFor(5).id).toBe('rabbit');
    expect(rankFor(6.8).id).toBe('rabbit');
    expect(rankFor(11).id).toBe('lightning');
    expect(rankFor(25).id).toBe('machine');
  });
});

describe('best scores', () => {
  it('stores a higher score and rejects lower or equal ones', () => {
    let r = mergeBest({}, 5, 7.2);
    expect(r).toEqual({ best: { '5': 7.2 }, isNew: true });
    r = mergeBest(r.best, 5, 6);
    expect(r.isNew).toBe(false);
    expect(r.best['5']).toBe(7.2);
    expect(mergeBest(r.best, 5, 7.2).isNew).toBe(false);
    expect(mergeBest(r.best, 10, 6).best).toEqual({ '5': 7.2, '10': 6 });
  });

  it('never records zero or invalid scores', () => {
    expect(mergeBest({}, 1, 0).isNew).toBe(false);
    expect(mergeBest({}, 1, Number.NaN).isNew).toBe(false);
  });

  it('sanitises stored data', () => {
    expect(sanitizeBest({ '5': 8, '7': 3, '10': -1, '30': 'x' })).toEqual({ '5': 8 });
    expect(sanitizeBest(null)).toEqual({});
    expect(isMode(30)).toBe(true);
    expect(isMode(2)).toBe(false);
  });
});

describe('i18n', () => {
  it('has a label and note for every rank in every locale', async () => {
    const { default: i18n } = await import('./i18n');
    for (const strings of Object.values(i18n)) {
      for (const r of RANKS) {
        const text = strings!.client.ranks[r.id as RankId];
        expect(text?.label, r.id).toBeTruthy();
        expect(text?.note, r.id).toBeTruthy();
      }
    }
    expect(Object.keys(i18n).sort()).toEqual(['en', 'ja', 'zh-TW']);
  });

  it('keeps the zh-TW rank labels identical to logic', async () => {
    const { default: i18n } = await import('./i18n');
    for (const r of RANKS) expect(i18n['zh-TW']!.client.ranks[r.id as RankId]).toEqual({ label: r.label, note: r.note });
  });
});

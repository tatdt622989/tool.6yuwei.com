import { describe, expect, it } from 'vitest';
import {
  describeOffset,
  estimateOffset,
  formatClock,
  formatDateLine,
  formatElapsed,
  formatOffsetAmount,
  formatRocLine,
  formatTenths,
  formatTimeOfDay,
  isConverged,
  isUsable,
  marzullo,
  nextTaipeiOccurrence,
  parseHttpDate,
  parseTimeOfDay,
  planProbes,
  sampleBounds,
  taipeiParts,
  type SyncSample,
} from './logic';

/** Deterministic PRNG so the simulations are reproducible. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Simulated server whose clock is `offset` ms ahead of the device. A request sent at device time t0
 * takes `rtt` ms; the server stamps it somewhere inside the trip and truncates its clock to the second.
 */
function simulate(offset: number, sentAt: number, rtt: number, stampFraction: number): SyncSample {
  const stampDevice = sentAt + rtt * stampFraction;
  const serverNow = stampDevice + offset;
  return { sentAt, receivedAt: sentAt + rtt, serverSecond: Math.floor(serverNow / 1000) * 1000 };
}

/** Same loop the page runs: two warm-up requests, then rounds of planned probes. */
function runSync(offset: number, seed: number, baseRtt: number, jitter: number, rounds = 5) {
  const rand = rng(seed);
  const rtt = () => baseRtt + rand() * jitter;
  let now = 1_798_000_000_123; // arbitrary device clock
  const samples: SyncSample[] = [];
  for (let i = 0; i < 2; i++) {
    const r = rtt();
    samples.push(simulate(offset, now, r, rand()));
    now += r + 5;
  }
  let est = estimateOffset(samples)!;
  for (let round = 0; round < rounds && !isConverged(est); round++) {
    const times = planProbes(est, now, 4);
    for (const t of times) {
      expect(t).toBeGreaterThan(now);
      samples.push(simulate(offset, t, rtt(), rand()));
    }
    now = Math.max(...times) + baseRtt + jitter + 10;
    est = estimateOffset(samples)!;
  }
  return { est, samples };
}

describe('Taiwan wall clock', () => {
  it('is UTC+8 regardless of the device time zone', () => {
    // 2026-10-29T12:44:38.250Z → 20:44:38.250 in Taipei
    const p = taipeiParts(Date.UTC(2026, 9, 29, 12, 44, 38, 250));
    expect(p).toMatchObject({ year: 2026, month: 10, day: 29, hour: 20, minute: 44, second: 38, ms: 250, weekday: 4 });
    expect(p.rocYear).toBe(115);
    expect(formatClock(p)).toBe('20:44:38');
    expect(formatClock(p, true)).toBe('20:44:38.250');
    expect(formatDateLine(p)).toBe('2026 年 10 月 29 日 星期四');
    expect(formatRocLine(p)).toBe('民國 115 年 10 月 29 日');
  });

  it('rolls the date over at 16:00 UTC', () => {
    expect(taipeiParts(Date.UTC(2026, 11, 31, 15, 59, 59)).day).toBe(31);
    const ny = taipeiParts(Date.UTC(2026, 11, 31, 16, 0, 0));
    expect([ny.year, ny.month, ny.day, ny.hour, ny.rocYear]).toEqual([2027, 1, 1, 0, 116]);
  });
});

describe('HTTP Date parsing', () => {
  it('reads IMF-fixdate to whole seconds', () => {
    expect(parseHttpDate('Thu, 29 Oct 2026 12:44:38 GMT')).toBe(Date.UTC(2026, 9, 29, 12, 44, 38));
  });
  it('rejects missing or invalid headers', () => {
    expect(parseHttpDate(null)).toBeNull();
    expect(parseHttpDate('')).toBeNull();
    expect(parseHttpDate('not a date')).toBeNull();
  });
});

describe('offset bounds', () => {
  it('derives the interval from one sample', () => {
    const s: SyncSample = { sentAt: 10_000, receivedAt: 10_040, serverSecond: 15_000 };
    expect(sampleBounds(s)).toEqual({ lo: 4960, hi: 6000 });
  });

  it('drops samples with negative or huge round trips', () => {
    expect(isUsable({ sentAt: 100, receivedAt: 90, serverSecond: 0 })).toBe(false);
    expect(isUsable({ sentAt: 0, receivedAt: 9000, serverSecond: 0 })).toBe(false);
    expect(isUsable({ sentAt: 0, receivedAt: 30, serverSecond: 0 })).toBe(true);
  });

  it('marzullo finds the region most intervals agree on', () => {
    expect(marzullo([])).toBeNull();
    expect(marzullo([{ lo: 0, hi: 10 }, { lo: 5, hi: 15 }, { lo: 8, hi: 12 }])).toEqual({ lo: 8, hi: 10, count: 3 });
    // One outlier far away does not empty the result.
    expect(marzullo([{ lo: 0, hi: 10 }, { lo: 4, hi: 9 }, { lo: 500, hi: 600 }])).toEqual({ lo: 4, hi: 9, count: 2 });
  });

  it('a single sample gives roughly ±(500 + rtt/2) ms', () => {
    const est = estimateOffset([{ sentAt: 0, receivedAt: 100, serverSecond: 3000 }])!;
    expect(est.lo).toBe(2900);
    expect(est.hi).toBe(4000);
    expect(est.offset).toBe(3450);
    expect(est.accuracy).toBe(550);
    expect(est.minRtt).toBe(100);
  });

  it('a pair straddling a server second rollover pins the boundary', () => {
    // True offset 250 ms. Probe A is stamped at server 999 (second 0), probe B at server 1001 (second 1000).
    const a = simulate(250, 700, 98, 0.5);
    const b = simulate(250, 702, 98, 0.5);
    expect(a.serverSecond).toBe(0);
    expect(b.serverSecond).toBe(1000);
    const est = estimateOffset([a, b])!;
    expect(est.lo).toBeLessThan(250);
    expect(est.hi).toBeGreaterThan(250);
    expect(est.accuracy).toBeLessThan(60);
  });

  it('returns null without usable samples', () => {
    expect(estimateOffset([])).toBeNull();
  });
});

describe('probe planning', () => {
  it('schedules probes in the future, one per hypothesis, around one server second', () => {
    const est = estimateOffset([{ sentAt: 0, receivedAt: 40, serverSecond: 3000 }])!;
    const times = planProbes(est, 100, 4);
    expect(times).toHaveLength(4);
    expect(times[0]).toBeGreaterThanOrEqual(160);
    expect(times[3] - times[0]).toBeLessThan(1000);
    // Each probe, if its hypothesis is right, is stamped at a whole server second.
    const span = est.hi - est.lo;
    const hyps = [1, 2, 3, 4].map((j) => est.lo + (j * span) / 5).sort((a, b) => b - a);
    times.forEach((t, i) => expect((t + 20 + hyps[i]) % 1000).toBeCloseTo(0, -1));
  });
});

describe('full sync simulation', () => {
  const cases = [
    { offset: 0, rtt: 20, jitter: 10 },
    { offset: 1234, rtt: 30, jitter: 20 },
    { offset: -2750.5, rtt: 15, jitter: 5 },
    { offset: 47_000, rtt: 60, jitter: 40 },
    { offset: -315, rtt: 150, jitter: 120 },
  ];
  for (const c of cases) {
    it(`finds offset ${c.offset} ms with rtt ${c.rtt}+${c.jitter} ms`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        const { est, samples } = runSync(c.offset, seed, c.rtt, c.jitter);
        // The true offset is always inside the reported interval…
        expect(est.lo).toBeLessThanOrEqual(c.offset);
        expect(est.hi).toBeGreaterThanOrEqual(c.offset);
        expect(Math.abs(est.offset - c.offset)).toBeLessThanOrEqual(est.accuracy);
        // …and the interval is far tighter than the 1-second header resolution.
        expect(est.accuracy).toBeLessThanOrEqual(Math.max(25, (c.rtt + c.jitter) * 0.9));
        expect(samples.length).toBeLessThanOrEqual(22);
      }
    });
  }

  it('survives an outlier sample (e.g. a stale cached Date)', () => {
    const { samples } = runSync(800, 7, 20, 10);
    const stale: SyncSample = { sentAt: samples[3].sentAt, receivedAt: samples[3].receivedAt + 20, serverSecond: samples[3].serverSecond - 60_000 };
    const est = estimateOffset([...samples, stale])!;
    expect(est.lo).toBeLessThanOrEqual(800);
    expect(est.hi).toBeGreaterThanOrEqual(800);
    expect(est.agreeing).toBe(samples.length);
  });
});

describe('describeOffset', () => {
  it('positive offset means the device is slow', () => {
    expect(describeOffset(1234, 12)).toMatchObject({ direction: 'slow', seconds: '1.23', text: '你的裝置時間慢 1.23 秒' });
  });
  it('negative offset means the device is fast', () => {
    expect(describeOffset(-560, 10)).toMatchObject({ direction: 'fast', text: '你的裝置時間快 0.56 秒' });
  });
  it('large offsets are written in minutes, hours or days', () => {
    expect(formatOffsetAmount(-59_990)).toBe('59.99 秒');
    expect(formatOffsetAmount(125_000)).toBe('2 分 5 秒');
    expect(formatOffsetAmount(3 * 3_600_000 + 4 * 60_000)).toBe('3 小時 4 分');
    expect(formatOffsetAmount(-(63 * 86_400_000 + 2 * 3_600_000))).toBe('63 天 2 小時');
    expect(describeOffset(-125_000, 20).text).toBe('你的裝置時間快 2 分 5 秒');
  });
  it('within the accuracy it is called exact', () => {
    expect(describeOffset(8, 12).direction).toBe('exact');
    expect(describeOffset(8, 12).text).toContain('12 毫秒');
  });
});

describe('搶票倒數', () => {
  it('parses times of day', () => {
    expect(parseTimeOfDay('12:00')).toBe(43_200);
    expect(parseTimeOfDay('12:00:30')).toBe(43_230);
    expect(parseTimeOfDay('9：05')).toBe(32_700);
    expect(parseTimeOfDay('24:00')).toBeNull();
    expect(parseTimeOfDay('12:60')).toBeNull();
    expect(parseTimeOfDay('noon')).toBeNull();
    expect(formatTimeOfDay(43_230)).toBe('12:00:30');
  });

  it('targets today in Taiwan, or tomorrow once passed', () => {
    const now = Date.UTC(2026, 9, 29, 2, 0, 0); // 10:00 Taipei
    expect(nextTaipeiOccurrence(now, 12 * 3600)).toBe(Date.UTC(2026, 9, 29, 4, 0, 0));
    expect(nextTaipeiOccurrence(now, 9 * 3600)).toBe(Date.UTC(2026, 9, 30, 1, 0, 0));
    // Just passed, within the grace period: keep today's target.
    expect(nextTaipeiOccurrence(now + 3000, 10 * 3600, 60_000)).toBe(now);
  });

  it('handles Taiwan midnight correctly near UTC day boundaries', () => {
    const now = Date.UTC(2026, 9, 29, 17, 0, 0); // 01:00 on 10/30 in Taipei
    expect(nextTaipeiOccurrence(now, 12 * 3600)).toBe(Date.UTC(2026, 9, 30, 4, 0, 0));
  });

  it('formats tenths, reaching zero exactly at the target', () => {
    expect(formatTenths(3_723_400)).toBe('01:02:03.4');
    expect(formatTenths(3_723_401)).toBe('01:02:03.5');
    expect(formatTenths(50)).toBe('00:00:00.1');
    expect(formatTenths(0)).toBe('00:00:00.0');
    expect(formatTenths(-500)).toBe('00:00:00.0');
    expect(formatElapsed(65_250)).toBe('+01:05.2');
  });
});

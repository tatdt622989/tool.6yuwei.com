// Browser-only clock sync driver (fetch + timers). The math lives in ./logic.ts and is unit-tested there.
// Also used by ../new-year-countdown/Tool.astro.

import { estimateOffset, isConverged, parseHttpDate, planProbes, type OffsetEstimate, type SyncSample } from './logic';

/**
 * Same-origin static file; only its Date header is read. A fixed URL is used on purpose: Cloudflare
 * answers it from the edge cache with a fresh Date header (lowest round trip), while a cache-busting
 * query string would force a slower trip to the origin on every probe. `cache: 'no-store'` keeps the
 * browser's HTTP cache out of the way.
 */
export const SYNC_URL = '/robots.txt';

export interface SyncOptions {
  rounds?: number;
  probesPerRound?: number;
  /** Called after the warm-up and after each round with the current estimate. */
  onProgress?: (estimate: OffsetEstimate, round: number, rounds: number) => void;
  /** Return true to abandon this run (e.g. the user pressed 重新校時 again). */
  cancelled?: () => boolean;
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, ms)));

export async function probeServerTime(timeoutMs = 4000): Promise<SyncSample | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const sentAt = Date.now();
    const res = await fetch(location.origin + SYNC_URL, {
      method: 'HEAD',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    const receivedAt = Date.now();
    const serverSecond = parseHttpDate(res.headers.get('date'));
    return serverSecond === null ? null : { sentAt, receivedAt, serverSecond };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Resolves with the offset estimate (server − device), or null when no usable answer came back. */
export async function syncClock(options: SyncOptions = {}): Promise<OffsetEstimate | null> {
  const { rounds = 5, probesPerRound = 4, onProgress, cancelled = () => false } = options;
  const samples: SyncSample[] = [];
  // Two sequential warm-up requests; the first also opens the connection (slow but still valid).
  for (let i = 0; i < 2; i++) {
    const s = await probeServerTime();
    if (cancelled()) return null;
    if (s) samples.push(s);
  }
  let est = estimateOffset(samples);
  if (!est) return null;
  onProgress?.(est, 0, rounds);
  for (let round = 1; round <= rounds && !isConverged(est); round++) {
    const times = planProbes(est, Date.now(), probesPerRound);
    const results = await Promise.all(times.map((t) => wait(t - Date.now()).then(() => probeServerTime())));
    if (cancelled()) return null;
    for (const s of results) if (s) samples.push(s);
    est = estimateOffset(samples) ?? est;
    onProgress?.(est, round, rounds);
  }
  return est;
}

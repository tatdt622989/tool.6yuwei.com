// 台灣標準時間 + 伺服器校時. Pure functions only: every "now" is passed in.
//
// Clock sync model
// ----------------
// The HTTP `Date` header carries the server's clock truncated to whole seconds. For one request sent at
// device time t0 and answered at device time t1 with header second S (epoch ms, a multiple of 1000), the
// server stamped the header at some device instant τ ∈ [t0, t1] when its own clock read σ ∈ [S, S + 1000).
// So the offset (server − device) satisfies   S − t1  <  offset  <  S + 1000 − t0.
// Each sample is an interval; intersecting many of them pins the offset. Samples whose request straddles
// a server second rollover cut the interval the most, so probes are timed to land on the predicted
// rollover (see planProbes). Intersection uses Marzullo's algorithm, so one bad sample (a clock jump, a
// stale proxy copy) cannot make the result empty.

export const TAIPEI_OFFSET_MS = 8 * 3_600_000;
const DAY_MS = 86_400_000;
export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const;

/* ---------- Taiwan wall clock (UTC+8, no DST since 1980) ---------- */

export interface TaipeiParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
  /** 0 = 星期日 */
  weekday: number;
  /** 民國年 */
  rocYear: number;
}

export function taipeiParts(epochMs: number): TaipeiParts {
  const d = new Date(Math.floor(epochMs) + TAIPEI_OFFSET_MS);
  const year = d.getUTCFullYear();
  return {
    year,
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
    weekday: d.getUTCDay(),
    rocYear: year - 1911,
  };
}

const p2 = (n: number) => String(n).padStart(2, '0');

export function formatClock(p: TaipeiParts, showMs = false): string {
  const base = `${p2(p.hour)}:${p2(p.minute)}:${p2(p.second)}`;
  return showMs ? `${base}.${String(p.ms).padStart(3, '0')}` : base;
}

export function formatDateLine(p: TaipeiParts): string {
  return `${p.year} 年 ${p.month} 月 ${p.day} 日 星期${WEEKDAYS[p.weekday]}`;
}

export function formatRocLine(p: TaipeiParts): string {
  return `民國 ${p.rocYear} 年 ${p.month} 月 ${p.day} 日`;
}

/* ---------- HTTP Date samples ---------- */

export interface SyncSample {
  /** Device clock (Date.now()) when the request was sent. */
  sentAt: number;
  /** Device clock when the response headers arrived. */
  receivedAt: number;
  /** Server clock from the Date header, epoch ms (whole second). */
  serverSecond: number;
}

/** Parse an RFC 7231 IMF-fixdate (e.g. "Thu, 29 Oct 2026 12:44:38 GMT"). Null when missing or invalid. */
export function parseHttpDate(header: string | null | undefined): number | null {
  if (!header) return null;
  const ms = Date.parse(header);
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 1000) * 1000;
}

export function rttOf(s: SyncSample): number {
  return s.receivedAt - s.sentAt;
}

export interface Bounds {
  /** Exclusive lower bound of offset (server − device), ms. */
  lo: number;
  /** Exclusive upper bound, ms. */
  hi: number;
}

export function sampleBounds(s: SyncSample): Bounds {
  return { lo: s.serverSecond - s.receivedAt, hi: s.serverSecond + 1000 - s.sentAt };
}

/** Samples with a negative or absurd round trip are discarded (clock jumped during the request). */
export function isUsable(s: SyncSample, maxRtt = 5000): boolean {
  const rtt = rttOf(s);
  return Number.isFinite(rtt) && rtt >= 0 && rtt <= maxRtt && Number.isFinite(s.serverSecond);
}

/**
 * Marzullo's algorithm: the region where the largest number of intervals overlap.
 * Returns that region and how many intervals agree on it.
 */
export function marzullo(intervals: readonly Bounds[]): (Bounds & { count: number }) | null {
  if (intervals.length === 0) return null;
  const edges: { at: number; type: 1 | -1 }[] = [];
  for (const { lo, hi } of intervals) {
    if (!(hi >= lo)) continue;
    edges.push({ at: lo, type: 1 }, { at: hi, type: -1 });
  }
  if (edges.length === 0) return null;
  // At equal positions process starts before ends, so touching intervals count as overlapping.
  edges.sort((a, b) => a.at - b.at || b.type - a.type);
  let best = 0;
  let count = 0;
  let result: (Bounds & { count: number }) | null = null;
  for (let i = 0; i < edges.length; i++) {
    count += edges[i].type;
    if (edges[i].type === 1 && count > best) {
      best = count;
      result = { lo: edges[i].at, hi: edges[i + 1].at, count };
    }
  }
  return result;
}

export interface OffsetEstimate {
  /** Best estimate of server − device in ms (positive: the device is slow). */
  offset: number;
  /** Half-width of the consistent interval, ms. The true offset is within offset ± accuracy. */
  accuracy: number;
  lo: number;
  hi: number;
  /** Samples used / samples consistent with the result. */
  samples: number;
  agreeing: number;
  /** Smallest observed round trip, ms. */
  minRtt: number;
}

export function estimateOffset(samples: readonly SyncSample[]): OffsetEstimate | null {
  const usable = samples.filter((s) => isUsable(s));
  if (usable.length === 0) return null;
  const region = marzullo(usable.map(sampleBounds));
  if (!region) return null;
  return {
    offset: (region.lo + region.hi) / 2,
    accuracy: (region.hi - region.lo) / 2,
    lo: region.lo,
    hi: region.hi,
    samples: usable.length,
    agreeing: region.count,
    minRtt: Math.min(...usable.map(rttOf)),
  };
}

/**
 * Device send times for the next round of probes. Each probe tests one hypothesis o inside [lo, hi]:
 * it is sent so that, if offset = o, the server stamps it exactly on a whole second B. The answer
 * (B or B − 1 s) then tells whether the true offset is above or below o, within ± half a round trip.
 * Hypotheses are spread evenly across the current interval, so each round shrinks it about count + 1 times.
 */
export function planProbes(est: OffsetEstimate, now: number, count = 4, lead = 60): number[] {
  const n = Math.max(1, Math.floor(count));
  const halfRtt = Math.max(0, est.minRtt) / 2;
  const span = est.hi - est.lo;
  const hyps = Array.from({ length: n }, (_, j) => est.lo + ((j + 1) * span) / (n + 1));
  // Smallest whole server second B whose earliest probe (largest hypothesis) is still in the future.
  const boundary = Math.ceil((now + lead + Math.max(...hyps) + halfRtt) / 1000) * 1000;
  return hyps.map((o) => Math.round(boundary - o - halfRtt)).sort((a, b) => a - b);
}

/** Stop once the interval is tight enough, or it can no longer shrink because round trips dominate. */
export function isConverged(est: OffsetEstimate, target = 15): boolean {
  return est.accuracy <= Math.max(target, est.minRtt * 0.6);
}

export type OffsetDirection = 'fast' | 'slow' | 'exact';

export interface OffsetDescription {
  direction: OffsetDirection;
  /** Absolute device error in seconds, two decimals. */
  seconds: string;
  text: string;
}

/** Human-readable device error. offset = server − device, so a positive offset means the device is behind. */
export function describeOffset(offset: number, accuracy: number): OffsetDescription {
  const seconds = (Math.abs(offset) / 1000).toFixed(2);
  if (Math.abs(offset) <= Math.max(accuracy, 5)) {
    return { direction: 'exact', seconds, text: `你的裝置時間很準，與標準時間相差不到 ${formatAccuracy(Math.max(accuracy, 5))}` };
  }
  const direction: OffsetDirection = offset > 0 ? 'slow' : 'fast';
  return { direction, seconds, text: `你的裝置時間${direction === 'slow' ? '慢' : '快'} ${formatOffsetAmount(offset)}` };
}

/** |offset| in words: "1.23 秒", "2 分 5 秒", "3 小時 4 分", "63 天 2 小時". */
export function formatOffsetAmount(offsetMs: number): string {
  const abs = Math.abs(offsetMs);
  if (abs < 60_000) return `${(abs / 1000).toFixed(2)} 秒`;
  const totalSeconds = Math.round(abs / 1000);
  const d = Math.floor(totalSeconds / 86_400);
  const h = Math.floor((totalSeconds % 86_400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (d > 0) return `${d} 天 ${h} 小時`;
  if (h > 0) return `${h} 小時 ${m} 分`;
  return `${m} 分 ${s} 秒`;
}

export function formatAccuracy(ms: number): string {
  return ms < 1000 ? `${Math.max(1, Math.round(ms))} 毫秒` : `${(ms / 1000).toFixed(1)} 秒`;
}

/* ---------- 搶票倒數 ---------- */

/** "12:00", "12:00:30", "9:5" → seconds after midnight; null when invalid. */
export function parseTimeOfDay(input: string): number | null {
  const m = /^\s*(\d{1,2})[:：](\d{1,2})(?:[:：](\d{1,2}))?\s*$/.exec(input);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const s = m[3] === undefined ? 0 : Number(m[3]);
  if (h > 23 || min > 59 || s > 59) return null;
  return h * 3600 + min * 60 + s;
}

export function formatTimeOfDay(secondsOfDay: number): string {
  const s = ((Math.floor(secondsOfDay) % 86_400) + 86_400) % 86_400;
  return `${p2(Math.floor(s / 3600))}:${p2(Math.floor((s % 3600) / 60))}:${p2(s % 60)}`;
}

/**
 * The next instant (epoch ms) at which Taiwan clocks read secondsOfDay. A target reached less than
 * `grace` ms ago is kept, so the page can show 「已開賣」 for a moment instead of jumping to tomorrow.
 */
export function nextTaipeiOccurrence(now: number, secondsOfDay: number, grace = 0): number {
  const localMidnight = Math.floor((now + TAIPEI_OFFSET_MS) / DAY_MS) * DAY_MS - TAIPEI_OFFSET_MS;
  let target = localMidnight + secondsOfDay * 1000;
  while (target < now - grace) target += DAY_MS;
  return target;
}

/** Countdown text with tenths, e.g. "01:02:03.4". Rounds up so it reads 00:00:00.0 exactly at the target. */
export function formatTenths(remainingMs: number): string {
  const tenths = Math.max(0, Math.ceil(remainingMs / 100));
  const totalSeconds = Math.floor(tenths / 10);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${p2(h)}:${p2(m)}:${p2(s)}.${tenths % 10}`;
}

/** Elapsed time after the target, e.g. "+00:05.2" (minutes:seconds). */
export function formatElapsed(ms: number): string {
  const tenths = Math.max(0, Math.floor(ms / 100));
  const totalSeconds = Math.floor(tenths / 10);
  const m = Math.floor(totalSeconds / 60);
  return `+${p2(m)}:${p2(totalSeconds % 60)}.${tenths % 10}`;
}

// Pure, DOM-free helpers for the webcam test.

// Permission / error helpers are shared with the microphone test.
export { describeMediaError, detectEnv, deviceLabel, permissionHelp } from '../mic-test/logic';

export type Preset = '480p' | '720p' | '1080p' | '4k';

export const PRESETS: Record<Preset, { width: number; height: number; label: string }> = {
  '480p': { width: 640, height: 480, label: '480p' },
  '720p': { width: 1280, height: 720, label: '720p' },
  '1080p': { width: 1920, height: 1080, label: '1080p' },
  '4k': { width: 3840, height: 2160, label: '4K' },
};

export function isPreset(value: unknown): value is Preset {
  return typeof value === 'string' && value in PRESETS;
}

/**
 * Video constraints for getUserMedia. Resolution is `ideal` so the browser falls back to the
 * closest supported mode instead of failing; the device id is `exact` only when the user picked it.
 */
export function buildVideoConstraints(preset: Preset, deviceId = '', exactDevice = false): MediaTrackConstraints {
  const { width, height } = PRESETS[preset];
  const c: MediaTrackConstraints = { width: { ideal: width }, height: { ideal: height } };
  if (deviceId) c.deviceId = exactDevice ? { exact: deviceId } : { ideal: deviceId };
  return c;
}

/** Common name for a capture resolution, based on its short side. */
export function resolutionLabel(width: number, height: number): string {
  const short = Math.min(width, height);
  if (!(short > 0)) return '—';
  if (short >= 2160) return '4K UHD';
  if (short >= 1440) return '1440p QHD';
  if (short >= 1080) return '1080p Full HD';
  if (short >= 720) return '720p HD';
  if (short >= 480) return '480p SD';
  return `${short}p`;
}

const KNOWN_RATIOS: [string, number][] = [
  ['16:9', 16 / 9],
  ['4:3', 4 / 3],
  ['16:10', 16 / 10],
  ['3:2', 3 / 2],
  ['1:1', 1],
  ['21:9', 64 / 27],
  ['9:16', 9 / 16],
  ['3:4', 3 / 4],
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Aspect ratio as "16:9"; snaps to well-known ratios within 1.5%, else reduces by GCD. */
export function aspectRatio(width: number, height: number): string {
  const w = Math.round(width);
  const h = Math.round(height);
  if (!(w > 0 && h > 0)) return '—';
  const r = w / h;
  for (const [label, value] of KNOWN_RATIOS) if (Math.abs(r - value) / value < 0.015) return label;
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

export function megapixels(width: number, height: number): number {
  if (!(width > 0 && height > 0)) return 0;
  return Math.round((width * height) / 1e5) / 10;
}

/** Frames per second from a list of frame timestamps (ms), using those within `windowMs` of `now`. */
export function fpsFromTimestamps(timestamps: readonly number[], now: number, windowMs = 1000): number {
  const recent = timestamps.filter((t) => now - t <= windowMs && t <= now);
  if (recent.length < 2) return 0;
  const span = recent[recent.length - 1] - recent[0];
  return span > 0 ? ((recent.length - 1) * 1000) / span : 0;
}

/** Frames per second from two frame counters sampled `elapsedMs` apart. */
export function fpsFromCounts(previousFrames: number, currentFrames: number, elapsedMs: number): number {
  if (!(elapsedMs > 0) || currentFrames < previousFrames) return 0;
  return ((currentFrames - previousFrames) * 1000) / elapsedMs;
}

/** Keeps the last second of frame timestamps without unbounded growth. */
export function pushTimestamp(list: number[], t: number, windowMs = 1000): number[] {
  list.push(t);
  while (list.length && t - list[0] > windowMs) list.shift();
  return list;
}

export function snapshotFilename(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `webcam-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}.png`;
}

/** "3840 × 2160" from MediaTrackCapabilities-like ranges, or null when the browser does not expose them. */
export function maxResolution(caps: { width?: { max?: number }; height?: { max?: number } } | null | undefined): string | null {
  const w = caps?.width?.max;
  const h = caps?.height?.max;
  if (!w || !h) return null;
  return `${w} × ${h}`;
}

// 日本標準時（JST）の時計と時報. Pure functions only: every "now" is passed in.
// The clock-sync math (HTTP Date header + Marzullo) and the browser driver are reused from ../taiwan-time
// (logic.ts / sync.ts); this file only adds the JST wall clock, Japanese wording and the 時報 tones.
//
// Sources (checked 2026-10-29):
// - 日本標準時は UTC+9、夏時間なし。「本初子午線経度計算方及標準時ノ件」（明治19年勅令第51号、1888年1月1日から適用）で
//   東経135度の子午線の時刻を標準時と定めた。現在の日本標準時（JST）は、情報通信研究機構（NICT）が原子時計で生成する
//   協定世界時 UTC(NICT) を9時間進めた時刻（NICT パンフレット https://rri.nict.go.jp/_assets/pdf/panf_JST.pdf ）。
// - 電話の時報（117）は「午後3時15分20秒をお知らせします」の後に「ピッ・ピッ・ピッ・ポーン」と10秒ごとに鳴る形式。
//   正午は「午後0時」と読む（12時間制の慣用）。

import { toWareki } from '../wareki-converter/logic';

export const JST_OFFSET_MS = 9 * 3_600_000;
const DAY_MS = 86_400_000;
export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

export interface JstParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
  /** 0 = 日曜日 */
  weekday: number;
}

export function jstParts(epochMs: number): JstParts {
  const d = new Date(Math.floor(epochMs) + JST_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
    weekday: d.getUTCDay(),
  };
}

const p2 = (n: number) => String(n).padStart(2, '0');

/** 「21:05:09」 or 「21:05:09.123」 */
export function formatClock(p: Pick<JstParts, 'hour' | 'minute' | 'second' | 'ms'>, showMs = false): string {
  const base = `${p2(p.hour)}:${p2(p.minute)}:${p2(p.second)}`;
  return showMs ? `${base}.${String(p.ms).padStart(3, '0')}` : base;
}

/** 「2026年10月29日（木）」 */
export function formatDateJa(p: JstParts): string {
  return `${p.year}年${p.month}月${p.day}日（${WEEKDAYS_JA[p.weekday]}）`;
}

/** 「令和8年10月29日」 */
export function formatWarekiJa(p: JstParts): string {
  return toWareki({ y: p.year, m: p.month, d: p.day })?.label ?? '';
}

/** UTC clock for the same instant, 「12:05:09」. */
export function formatUtc(epochMs: number): string {
  const d = new Date(Math.floor(epochMs));
  return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
}

/* ---------- 時報 ---------- */

/** 12-hour reading used by the telephone time signal: 0時 → 午前0時, 12時 → 午後0時. 「午後3時15分20秒」 */
export function jihoReading(hour: number, minute: number, second: number): string {
  const ampm = hour < 12 ? '午前' : '午後';
  return `${ampm}${hour % 12}時${minute}分${second}秒`;
}

/** The next 10-second mark strictly after `epochMs` (epoch ms). */
export function nextTenSecondMark(epochMs: number): number {
  return (Math.floor(epochMs / 10_000) + 1) * 10_000;
}

export type JihoTone = 'pi' | 'pon' | null;

/**
 * Tone for a whole second of the minute in the 10-second time signal:
 * x7・x8・x9 秒 → 「ピッ」, x0 秒 → 「ポーン」(the instant announced), otherwise silent.
 */
export function jihoTone(second: number): JihoTone {
  const r = ((second % 10) + 10) % 10;
  if (r === 0) return 'pon';
  if (r >= 7) return 'pi';
  return null;
}

/* ---------- countdown ---------- */

/**
 * The next instant (epoch ms) at which Japanese clocks read secondsOfDay. A target reached less than
 * `grace` ms ago is kept, so the page can show 「発売開始」 for a moment instead of jumping to tomorrow.
 */
export function nextJstOccurrence(now: number, secondsOfDay: number, grace = 0): number {
  const localMidnight = Math.floor((now + JST_OFFSET_MS) / DAY_MS) * DAY_MS - JST_OFFSET_MS;
  let target = localMidnight + secondsOfDay * 1000;
  while (target < now - grace) target += DAY_MS;
  return target;
}

/* ---------- device offset wording ---------- */

export type OffsetDirection = 'fast' | 'slow' | 'exact';

/** |offset| in words: 「1.23秒」「2分5秒」「3時間4分」「63日2時間」. */
export function formatOffsetAmountJa(offsetMs: number): string {
  const abs = Math.abs(offsetMs);
  if (abs < 60_000) return `${(abs / 1000).toFixed(2)}秒`;
  const total = Math.round(abs / 1000);
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}日${h}時間`;
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分${s}秒`;
}

/** 「12ミリ秒」 / 「1.5秒」 */
export function formatAccuracyJa(ms: number): string {
  return ms < 1000 ? `${Math.max(1, Math.round(ms))}ミリ秒` : `${(ms / 1000).toFixed(1)}秒`;
}

/** offset = server − device: positive means the device clock is behind (遅れている). */
export function describeOffsetJa(offset: number, accuracy: number): { direction: OffsetDirection; short: string; text: string } {
  const tolerance = Math.max(accuracy, 5);
  if (Math.abs(offset) <= tolerance) {
    return { direction: 'exact', short: 'ほぼ正確', text: `お使いの端末の時計は正確です（誤差${formatAccuracyJa(tolerance)}以内）` };
  }
  const direction: OffsetDirection = offset > 0 ? 'slow' : 'fast';
  const word = direction === 'slow' ? '遅れ' : '進み';
  const amount = formatOffsetAmountJa(offset);
  return { direction, short: `${amount}${word}`, text: `お使いの端末の時計は${amount}${direction === 'slow' ? '遅れています' : '進んでいます'}` };
}

// Spin wheel (轉盤抽獎). Pure, DOM-free: parsing, weighted draw, geometry, easing and colors.
// The winner is drawn first with crypto randomness; the animation is then computed to land on it.
import type { Locale } from '../../i18n/locales';

/** Fills the array with uniformly random 32-bit integers. Injected for testability. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export interface WheelOption {
  label: string;
  /** Relative weight (> 0). Written as 「選項*3」. */
  weight: number;
  /** Zero-based line number in the source text, so the option can be removed later. */
  line: number;
}

export const MAX_OPTIONS = 100;
export const MAX_WEIGHT = 1000;
export const MAX_LABEL = 40;

// 「選項*3」「選項 * 2.5」「選項＊3」「選項×3」「選項 x3」 → weight. A bare 「x」 needs a space before it,
// so words such as 「Box3」 stay intact.
const WEIGHT_RE = /^(.*?)(?:\s*[*＊×]\s*|\s+[xX]\s*)([0-9０-９]+(?:[.．][0-9０-９]+)?)$/;

function toHalfWidth(s: string): string {
  return s.replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

/** One option per line; blank lines are skipped. An optional 「*權重」 suffix sets the weight. */
export function parseOptions(text: string): WheelOption[] {
  const out: WheelOption[] = [];
  const lines = text.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length && out.length < MAX_OPTIONS; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    let label = raw;
    let weight = 1;
    const m = WEIGHT_RE.exec(raw);
    if (m && m[1].trim()) {
      const w = Number(toHalfWidth(m[2]));
      if (w === 0) continue; // 「選項*0」 temporarily disables an option
      if (Number.isFinite(w) && w > 0) {
        label = m[1].trim();
        weight = Math.min(MAX_WEIGHT, w);
      }
    }
    out.push({ label: label.slice(0, MAX_LABEL), weight, line: i });
  }
  return out;
}

export function totalWeight(options: readonly WheelOption[]): number {
  return options.reduce((sum, o) => sum + o.weight, 0);
}

export function hasCustomWeights(options: readonly WheelOption[]): boolean {
  return options.some((o) => o.weight !== 1);
}

/** Probability of each option, 0–1. */
export function probabilities(options: readonly WheelOption[]): number[] {
  const total = totalWeight(options);
  return options.map((o) => (total > 0 ? o.weight / total : 0));
}

/** Uniform float in [0, 1) with 53 bits of randomness. */
export function randomFloat(random: RandomSource = defaultRandom): number {
  const buf = random(new Uint32Array(2));
  return ((buf[0] >>> 5) * 67108864 + (buf[1] >>> 6)) / 9007199254740992;
}

/** Weighted draw; returns the index of the winning option, or -1 for an empty list. */
export function pickWeighted(options: readonly WheelOption[], random: RandomSource = defaultRandom): number {
  const total = totalWeight(options);
  if (options.length === 0 || total <= 0) return -1;
  let r = randomFloat(random) * total;
  for (let i = 0; i < options.length; i++) {
    r -= options[i].weight;
    if (r < 0) return i;
  }
  return options.length - 1; // floating-point safety net
}

export interface Segment {
  /** Degrees, clockwise from 12 o'clock in the wheel's own frame. */
  start: number;
  end: number;
}

/** Each option gets a slice proportional to its weight. */
export function segmentsOf(options: readonly WheelOption[]): Segment[] {
  const total = totalWeight(options);
  let acc = 0;
  return options.map((o) => {
    const start = (acc / total) * 360;
    acc += o.weight;
    return { start, end: (acc / total) * 360 };
  });
}

const mod360 = (deg: number) => ((deg % 360) + 360) % 360;

/** Which segment sits under the fixed pointer at 12 o'clock after the wheel is rotated clockwise by `rotation` degrees. */
export function segmentAtPointer(segments: readonly Segment[], rotation: number): number {
  const angle = mod360(-rotation);
  const i = segments.findIndex((s) => angle >= s.start && angle < s.end);
  return i === -1 ? segments.length - 1 : i;
}

/**
 * Final rotation (always larger than `current`) so the pointer lands inside segment `index`.
 * `offset` in [0,1) picks where inside the slice to stop; the outer 15% on each side is avoided
 * so the result is never ambiguous on a boundary.
 */
export function targetRotation(
  segments: readonly Segment[],
  index: number,
  current: number,
  turns: number,
  offset: number,
): number {
  const seg = segments[index];
  const width = seg.end - seg.start;
  const margin = Math.min(width * 0.15, 6);
  const theta = seg.start + margin + (width - 2 * margin) * Math.min(Math.max(offset, 0), 0.999999);
  const needed = mod360(-theta - current); // extra clockwise rotation to bring theta to the top
  return current + needed + 360 * Math.max(0, Math.floor(turns));
}

/** Ease-out quart: fast start, long gentle stop like a real wheel. */
export function easeOutQuart(t: number): number {
  const x = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - x) ** 4;
}

/** Rotation at progress t (0–1) of a spin from `from` to `to`. */
export function rotationAt(from: number, to: number, t: number): number {
  return from + (to - from) * easeOutQuart(t);
}

/** Removes the source line that produced `option`, leaving other lines (and blank lines) untouched. */
export function removeOptionLine(text: string, option: WheelOption): string {
  const lines = text.split(/\r\n|\r|\n/);
  if (option.line < 0 || option.line >= lines.length) return text;
  lines.splice(option.line, 1);
  return lines.join('\n');
}

/** Unbiased integer in [0, max) using rejection sampling. */
export function randomIndex(max: number, random: RandomSource = defaultRandom): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    value = random(buf)[0];
  } while (value >= limit);
  return value % max;
}

/** Shuffles the non-blank lines (Fisher–Yates) so the slices are rearranged around the wheel. */
export function shuffleLines(text: string, random: RandomSource = defaultRandom): string {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim());
  for (let i = lines.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  return lines.join('\n');
}

export type Theme = 'light' | 'dark';
export type ColorSpace = 'oklch' | 'hsl';

/**
 * Distinct slice colors: hues evenly spread around the OKLCH wheel, with lightness alternating
 * for large wheels so neighbours never blend. Dark labels stay readable on every slice in both themes.
 */
export function sliceColor(
  index: number,
  count: number,
  theme: Theme,
  space: ColorSpace = 'oklch',
): { fill: string; text: string } {
  const n = Math.max(1, count);
  const hue = Math.round((25 + (index * 360) / n) % 360);
  const alternate = n > 10 && index % 2 === 1;
  const dark = theme === 'dark';
  if (space === 'hsl') {
    // Fallback for browsers whose canvas does not understand oklch().
    const l = dark ? (alternate ? 55 : 64) : alternate ? 70 : 80;
    return { fill: `hsl(${hue} 65% ${l}%)`, text: `hsl(${hue} 40% 14%)` };
  }
  const l = dark ? (alternate ? 0.66 : 0.74) : alternate ? 0.74 : 0.84;
  const c = dark ? 0.13 : 0.12;
  return { fill: `oklch(${l} ${c} ${hue})`, text: `oklch(0.24 0.04 ${hue})` };
}

/** Shortens a label to fit `maxChars` display columns (CJK = 2, others = 1), adding an ellipsis. */
export function fitLabel(label: string, maxColumns: number): string {
  let cols = 0;
  let out = '';
  for (const ch of label) {
    const w = /[⺀-￯]/.test(ch) ? 2 : 1;
    if (cols + w > maxColumns) return out.replace(/\s+$/, '') + '…';
    cols += w;
    out += ch;
  }
  return out;
}

export interface Preset {
  id: string;
  name: string;
  options: string[];
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'lunch',
    name: '午餐吃什麼',
    options: ['便當', '牛肉麵', '滷肉飯', '水餃', '拉麵', '義大利麵', '自助餐', '炒飯', '咖哩飯', '鍋貼', '麻醬麵', '壽司'],
  },
  {
    id: 'dinner',
    name: '晚餐吃什麼',
    options: ['火鍋', '燒肉', '熱炒', '牛排', '披薩', '韓式料理', '泰式料理', '鹹酥雞', '涼麵', '麻辣燙', '小籠包', '炸雞'],
  },
  { id: 'yesno', name: '是或否', options: ['是', '否'] },
  { id: 'num10', name: '數字 1–10', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  {
    id: 'drink',
    name: '喝什麼飲料',
    options: ['珍珠奶茶', '紅茶拿鐵', '四季春', '多多綠', '冬瓜檸檬', '鮮奶茶', '百香綠茶', '黑糖鮮奶', '美式咖啡'],
  },
  { id: 'truth', name: '真心話大冒險', options: ['真心話', '大冒險', '真心話', '大冒險', '跳過一次', '指定別人'] },
  { id: 'prize', name: '抽獎（權重）', options: ['頭獎*1', '二獎*3', '三獎*6', '參加獎*20', '再接再厲*10'] },
];

/** US-oriented starter wheels for /en/. */
export const PRESETS_EN: readonly Preset[] = [
  {
    id: 'lunch',
    name: 'What should I eat?',
    options: ['Pizza', 'Tacos', 'Burgers', 'Sushi', 'Salad', 'Chinese takeout', 'Burritos', 'Ramen', 'Sandwiches', 'Thai', 'Pho', 'Fried chicken'],
  },
  {
    id: 'dinner',
    name: 'What’s for dinner?',
    options: ['Pasta', 'Tacos', 'Stir-fry', 'Steak', 'Chili', 'Curry', 'Grilled chicken', 'Pizza night', 'Soup', 'Breakfast for dinner', 'Salmon', 'Leftovers'],
  },
  { id: 'yesno', name: 'Yes or no', options: ['Yes', 'No'] },
  { id: 'names', name: 'Wheel of names', options: ['Alex', 'Jordan', 'Taylor', 'Sam', 'Morgan', 'Casey', 'Riley', 'Jamie'] },
  { id: 'num10', name: 'Numbers 1–10', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  {
    id: 'weekend',
    name: 'Weekend plans',
    options: ['Movie night', 'Hiking', 'Board games', 'Beach day', 'Museum', 'Bowling', 'Farmers market', 'Stay in'],
  },
  { id: 'truth', name: 'Truth or dare', options: ['Truth', 'Dare', 'Truth', 'Dare', 'Skip', 'Pick someone'] },
  { id: 'prize', name: 'Prize wheel (weighted)', options: ['Grand prize*1', 'Gift card*3', 'T-shirt*6', 'Sticker*20', 'Try again*10'] },
];

/** Japan-oriented starter wheels for /ja/. */
export const PRESETS_JA: readonly Preset[] = [
  {
    id: 'lunch',
    name: '今日のランチ',
    options: ['ラーメン', 'カレー', '寿司', 'うどん', 'そば', '牛丼', '定食', 'パスタ', 'ハンバーガー', '中華', '天丼', 'コンビニ'],
  },
  {
    id: 'dinner',
    name: '今日の晩ごはん',
    options: ['焼肉', '鍋', '唐揚げ', 'ハンバーグ', '餃子', '生姜焼き', 'お好み焼き', '刺身', '天ぷら', 'オムライス', '肉じゃが', '外食'],
  },
  { id: 'yesno', name: 'はい・いいえ', options: ['はい', 'いいえ'] },
  { id: 'names', name: '名前ルーレット', options: ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村'] },
  { id: 'num10', name: '数字 1–10', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  { id: 'penalty', name: '罰ゲーム', options: ['一発ギャグ', 'モノマネ', '変顔で写真', '恥ずかしい話', '全員にジュース', 'セーフ'] },
  { id: 'prize', name: '景品抽選（重み付き）', options: ['1等*1', '2等*3', '3等*6', '参加賞*20', 'はずれ*10'] },
];

/** Starter wheels for a locale; zh-TW keeps the original Taiwan presets. */
export function presetsFor(locale: Locale = 'zh-TW'): readonly Preset[] {
  if (locale === 'en') return PRESETS_EN;
  if (locale === 'ja') return PRESETS_JA;
  return PRESETS;
}

// Characters that are turned 90° when a label is stacked vertically (縦書き), e.g. the 「ー」 in 「ラーメン」.
const ROTATE_IN_VERTICAL = /^[ー〜～]$/;

/** True for glyphs drawn sideways in a vertically stacked CJK label. */
export function rotatesInVertical(ch: string): boolean {
  return ROTATE_IN_VERTICAL.test(ch);
}

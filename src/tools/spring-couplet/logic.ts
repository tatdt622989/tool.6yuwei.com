// Spring couplet generator: text handling, presets and layout geometry. Pure functions, no DOM.
// Lengths are in "cells": one cell is the square that holds one character.

export const FORMATS = ['door', 'doufang', 'banner', 'strip'] as const;
export type Format = (typeof FORMATS)[number];

/** `none` leaves the paper white so only the characters are printed (for red paper you already have). */
export const PAPERS = ['fleck', 'plain', 'border', 'none'] as const;
export type Paper = (typeof PAPERS)[number];

export const INKS = ['black', 'gold'] as const;
export type Ink = (typeof INKS)[number];

/**
 * rtl: the traditional way. The banner reads right to left and the first line hangs on the
 * right as you face the door. ltr: the banner reads left to right and the first line moves
 * to the left, so both follow the same reading direction.
 */
export const READINGS = ['rtl', 'ltr'] as const;
export type Reading = (typeof READINGS)[number];

/** Character counts per text field: [min, max]. */
export const LIMITS = {
  door: [5, 9],
  banner: [2, 6],
  strip: [2, 8],
  signature: [0, 8],
} as const;

export interface Settings {
  format: Format;
  /** Doufang character. */
  char: string;
  /** Hang the doufang character upside down (倒福). */
  flip: boolean;
  banner: string;
  strip: string;
  upper: string;
  lower: string;
  /** Banner above a door couplet; empty for none. */
  top: string;
  paper: Paper;
  ink: Ink;
  reading: Reading;
  /** Small inscription such as 丁未年; empty for none. */
  signature: string;
}

export interface DoorPreset {
  /** First line: ends in an oblique (仄) tone. */
  upper: string;
  /** Second line: ends in a level (平) tone. */
  lower: string;
  top: string;
}

/** Single characters for a doufang. */
export const DOUFANG_PRESETS = ['福', '春', '滿', '吉', '財', '羊'] as const;

/** Four-character blessings for a banner or a vertical strip. The last four are for the year of the sheep. */
export const PHRASE_PRESETS = [
  '恭賀新禧',
  '招財進寶',
  '大地回春',
  '萬象更新',
  '吉祥如意',
  '萬事如意',
  '恭喜發財',
  '新春大吉',
  '五福臨門',
  '年年有餘',
  '歲歲平安',
  '出入平安',
  '財源廣進',
  '金玉滿堂',
  '花開富貴',
  '風調雨順',
  '三陽開泰',
  '三羊開泰',
  '喜氣洋洋',
  '羊年大吉',
] as const;

/** Traditional door couplets, first line then second line. */
export const DOOR_PRESETS: readonly DoorPreset[] = [
  { upper: '天增歲月人增壽', lower: '春滿乾坤福滿門', top: '四季長安' },
  { upper: '一帆風順年年好', lower: '萬事如意步步高', top: '吉星高照' },
  { upper: '和順一門有百福', lower: '平安二字值千金', top: '萬象更新' },
  { upper: '一年四季春常在', lower: '萬紫千紅永開花', top: '喜迎新春' },
  { upper: '迎新春事事如意', lower: '接鴻福步步高升', top: '好事臨門' },
  { upper: '年年順景財源廣', lower: '歲歲平安福壽多', top: '吉星高照' },
  { upper: '財源滾滾隨春到', lower: '喜氣洋洋伴福來', top: '財源廣進' },
  { upper: '向陽門第春常在', lower: '積善人家慶有餘', top: '喜迎新春' },
  { upper: '門迎春夏秋冬福', lower: '戶納東西南北財', top: '招財進寶' },
  { upper: '生意興隆通四海', lower: '財源茂盛達三江', top: '大展鴻圖' },
  { upper: '爆竹一聲除舊', lower: '桃符萬戶更新', top: '辭舊迎新' },
  { upper: '歲歲平安日', lower: '年年如意春', top: '新春大吉' },
  { upper: '忠厚傳家久', lower: '詩書繼世長', top: '' },
  { upper: '新年納餘慶', lower: '嘉節號長春', top: '' },
];

export const DEFAULTS: Settings = {
  format: 'door',
  char: DOUFANG_PRESETS[0],
  flip: false,
  banner: PHRASE_PRESETS[0],
  strip: PHRASE_PRESETS[2],
  upper: DOOR_PRESETS[0].upper,
  lower: DOOR_PRESETS[0].lower,
  top: DOOR_PRESETS[0].top,
  paper: 'fleck',
  ink: 'black',
  reading: 'rtl',
  signature: '',
};

// ---------- Text ----------

type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };

function graphemes(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: new (locale?: string, options?: { granularity: 'grapheme' }) => SegmenterLike })
    .Segmenter;
  if (Segmenter) return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (part) => part.segment);
  return Array.from(text);
}

/** User-perceived characters with all whitespace removed. A surrogate pair or an emoji sequence stays one item. */
export function splitChars(text: string): string[] {
  return graphemes(text.normalize('NFC')).filter((ch) => ch.trim() !== '');
}

/** Punctuation that has a separate upright form for vertical writing. */
const VERTICAL_FORMS: Record<string, string> = {
  '，': '︐',
  '、': '︑',
  '。': '︒',
  '：': '︓',
  '；': '︔',
  '！': '︕',
  '？': '︖',
  '…': '︙',
  '—': '︱',
  '－': '︱',
  '（': '︵',
  '）': '︶',
  '「': '﹁',
  '」': '﹂',
  '『': '﹃',
  '』': '﹄',
  '《': '︽',
  '》': '︾',
  '〈': '︿',
  '〉': '﹀',
};

export function toVertical(ch: string): string {
  return VERTICAL_FORMS[ch] ?? ch;
}

export function isFormat(value: unknown): value is Format {
  return FORMATS.includes(value as Format);
}

/** Merge saved or partial settings over the defaults, dropping anything that is not valid. */
export function normalizeSettings(input: unknown): Settings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const text = (key: keyof Settings): string => {
    const value = raw[key];
    return typeof value === 'string' ? value.slice(0, 60) : (DEFAULTS[key] as string);
  };
  const oneOf = <T extends string>(list: readonly T[], value: unknown, fallback: T): T =>
    list.includes(value as T) ? (value as T) : fallback;
  return {
    format: oneOf(FORMATS, raw.format, DEFAULTS.format),
    char: text('char'),
    flip: raw.flip === true,
    banner: text('banner'),
    strip: text('strip'),
    upper: text('upper'),
    lower: text('lower'),
    top: text('top'),
    paper: oneOf(PAPERS, raw.paper, DEFAULTS.paper),
    ink: oneOf(INKS, raw.ink, DEFAULTS.ink),
    reading: oneOf(READINGS, raw.reading, DEFAULTS.reading),
    signature: text('signature'),
  };
}

export type TextIssue = 'empty' | 'too-short' | 'too-long' | 'mismatch';

/** What is wrong with the text of the current format, most important first. Empty when it is fine. */
export function textIssues(settings: Settings): TextIssue[] {
  const issues = new Set<TextIssue>();
  const check = (text: string, [min, max]: readonly [number, number], optional = false) => {
    const n = splitChars(text).length;
    if (n === 0) {
      if (!optional) issues.add('empty');
    } else if (n < min) issues.add('too-short');
    else if (n > max) issues.add('too-long');
  };
  switch (settings.format) {
    case 'doufang':
      if (splitChars(settings.char).length === 0) issues.add('empty');
      break;
    case 'banner':
      check(settings.banner, LIMITS.banner);
      break;
    case 'strip':
      check(settings.strip, LIMITS.strip);
      break;
    case 'door': {
      check(settings.upper, LIMITS.door);
      check(settings.lower, LIMITS.door);
      check(settings.top, LIMITS.banner, true);
      const upper = splitChars(settings.upper).length;
      const lower = splitChars(settings.lower).length;
      if (upper > 0 && lower > 0 && upper !== lower) issues.add('mismatch');
      break;
    }
  }
  return (['empty', 'mismatch', 'too-short', 'too-long'] as const).filter((issue) => issues.has(issue));
}

/** A random item that differs from the current one whenever there is a choice. */
export function pickRandom<T>(items: readonly T[], current?: T, random: () => number = Math.random): T {
  const pool = items.length > 1 ? items.filter((item) => item !== current) : items;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

// ---------- Pieces ----------

export type PieceRole = 'doufang' | 'banner' | 'strip' | 'upper' | 'lower';
export type PieceShape = 'square' | 'vertical' | 'horizontal';

/** One sheet of red paper. */
export interface Piece {
  role: PieceRole;
  shape: PieceShape;
  /** Characters in drawing order: top to bottom, or left to right for a horizontal piece. */
  chars: string[];
  /** Paper size in cells. */
  w: number;
  h: number;
  /** Inscription characters, top to bottom. */
  signature: string[];
  /** Draw the character upside down (doufang only). */
  flip: boolean;
}

/** Blank paper before the first and after the last character, in cells. */
export const END_PAD = 0.3;
/** Width of a strip (height of a banner), in cells. */
export const CROSS = 1.44;
/** Side of the doufang square, in cells: the character sits on the diagonal. */
export const SQUARE = 1.5;

function linePiece(role: PieceRole, shape: 'vertical' | 'horizontal', chars: string[], cells: number, signature: string[]): Piece {
  const length = cells + END_PAD * 2;
  return {
    role,
    shape,
    chars,
    w: shape === 'vertical' ? CROSS : length,
    h: shape === 'vertical' ? length : CROSS,
    signature,
    flip: false,
  };
}

function bannerPiece(text: string, reading: Reading): Piece {
  const chars = splitChars(text).slice(0, LIMITS.banner[1]);
  const visual = reading === 'rtl' ? [...chars].reverse() : chars;
  return linePiece('banner', 'horizontal', visual, Math.max(chars.length, LIMITS.banner[0]), []);
}

/**
 * The paper pieces for the current format. A door couplet returns the banner first (when
 * there is one), then the first line, then the second line; both lines get the same length.
 */
export function buildPieces(settings: Settings): Piece[] {
  const signature = splitChars(settings.signature).slice(0, LIMITS.signature[1]);
  switch (settings.format) {
    case 'doufang': {
      const chars = splitChars(settings.char).slice(0, 1);
      return [{ role: 'doufang', shape: 'square', chars, w: SQUARE, h: SQUARE, signature, flip: settings.flip }];
    }
    case 'banner':
      return [bannerPiece(settings.banner, settings.reading)];
    case 'strip': {
      const chars = splitChars(settings.strip).slice(0, LIMITS.strip[1]).map(toVertical);
      return [linePiece('strip', 'vertical', chars, Math.max(chars.length, LIMITS.strip[0]), signature)];
    }
    case 'door': {
      const [min, max] = LIMITS.door;
      const upper = splitChars(settings.upper).slice(0, max).map(toVertical);
      const lower = splitChars(settings.lower).slice(0, max).map(toVertical);
      const cells = Math.max(upper.length, lower.length, min);
      const pieces = [linePiece('upper', 'vertical', upper, cells, []), linePiece('lower', 'vertical', lower, cells, signature)];
      return splitChars(settings.top).length > 0 ? [bannerPiece(settings.top, settings.reading), ...pieces] : pieces;
    }
  }
}

/** Every character that will be drawn, for loading the font before drawing. */
export function piecesText(pieces: Piece[]): string[] {
  return [...new Set(pieces.flatMap((piece) => [...piece.chars, ...piece.signature]))];
}

// ---------- Layout ----------

/** A piece placed on a surface: centre point, and a clockwise rotation about it in degrees. */
export interface Placed {
  piece: Piece;
  cx: number;
  cy: number;
  rotate: 0 | 45 | 90;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The preview and share image: the pieces as they hang, in cells. */
export interface Scene {
  width: number;
  height: number;
  items: Placed[];
  /** The door between the two lines of a door couplet. */
  door?: Rect;
}

const SCENE_MARGIN = 0.55;
const DIAMOND_MARGIN = 0.3;
const DOOR_GAP = 0.32;
const DOOR_MIN_WIDTH = 3.4;

/** Which side the first line hangs on, as seen facing the door. */
export function upperSide(reading: Reading): 'right' | 'left' {
  return reading === 'rtl' ? 'right' : 'left';
}

export function layoutScene(pieces: Piece[], reading: Reading): Scene {
  const upper = pieces.find((piece) => piece.role === 'upper');
  const lower = pieces.find((piece) => piece.role === 'lower');
  if (upper && lower) {
    const banner = pieces.find((piece) => piece.role === 'banner');
    const doorWidth = Math.max(banner?.w ?? 0, DOOR_MIN_WIDTH);
    const width = SCENE_MARGIN * 2 + CROSS * 2 + DOOR_GAP * 2 + doorWidth;
    const stripTop = SCENE_MARGIN + (banner ? banner.h + DOOR_GAP : 0);
    const height = stripTop + upper.h + SCENE_MARGIN;
    const leftX = SCENE_MARGIN + CROSS / 2;
    const rightX = width - SCENE_MARGIN - CROSS / 2;
    const cy = stripTop + upper.h / 2;
    const onRight = upperSide(reading) === 'right';
    const items: Placed[] = [
      { piece: upper, cx: onRight ? rightX : leftX, cy, rotate: 0 },
      { piece: lower, cx: onRight ? leftX : rightX, cy, rotate: 0 },
    ];
    if (banner) items.unshift({ piece: banner, cx: width / 2, cy: SCENE_MARGIN + banner.h / 2, rotate: 0 });
    return {
      width,
      height,
      items,
      door: { x: (width - doorWidth) / 2, y: stripTop, w: doorWidth, h: height - stripTop },
    };
  }

  const piece = pieces[0];
  if (piece.shape === 'square') {
    const side = piece.w * Math.SQRT2 + DIAMOND_MARGIN * 2;
    return { width: side, height: side, items: [{ piece, cx: side / 2, cy: side / 2, rotate: 45 }] };
  }
  const width = piece.w + SCENE_MARGIN * 2;
  const height = piece.h + SCENE_MARGIN * 2;
  return { width, height, items: [{ piece, cx: width / 2, cy: height / 2, rotate: 0 }] };
}

/** Pixels per cell for a scene canvas: as sharp as allowed without a huge canvas on phones. */
export function sceneCell(scene: Scene, maxSide = 2000, maxCell = 520): number {
  return Math.max(1, Math.floor(Math.min(maxCell, maxSide / Math.max(scene.width, scene.height))));
}

/** A4 portrait at 300 dpi. About 8.7 megapixels, under the canvas limits of current phones. */
export const SHEET = {
  width: 2480,
  height: 3508,
  dpi: 300,
  /** Blank edge that home printers cannot reach. */
  margin: 59,
  /** Room under the pieces for the labels. */
  labelBand: 110,
} as const;

export interface SheetItem extends Placed {
  /** Caption printed under the piece, outside the paper. */
  label: string;
}

/** The print file: the pieces packed side by side for cutting, in pixels. */
export interface Sheet {
  width: number;
  height: number;
  /** Pixels per cell. */
  cell: number;
  items: SheetItem[];
}

function sheetLabel(piece: Piece, reading: Reading): string {
  const side = upperSide(reading);
  switch (piece.role) {
    case 'upper':
      return side === 'right' ? '上聯．面對門貼右邊' : '上聯．面對門貼左邊';
    case 'lower':
      return side === 'right' ? '下聯．面對門貼左邊' : '下聯．面對門貼右邊';
    case 'banner':
      return reading === 'rtl' ? '橫批．由右往左讀' : '橫批．由左往右讀';
    case 'doufang':
      return '沿紙邊剪下，轉成菱形再貼';
    case 'strip':
      return '';
  }
}

/**
 * Pack the pieces onto one A4 sheet as large as they fit. Horizontal pieces are turned a
 * quarter turn so every piece runs down the long side of the page; a door couplet keeps the
 * order it hangs in, with the banner in the middle.
 */
export function layoutSheet(pieces: Piece[], reading: Reading): Sheet {
  const { width, height, margin, labelBand } = SHEET;
  const order = [...pieces];
  const upper = order.find((piece) => piece.role === 'upper');
  const lower = order.find((piece) => piece.role === 'lower');
  if (upper && lower) {
    const banner = order.find((piece) => piece.role === 'banner');
    const [left, right] = upperSide(reading) === 'right' ? [lower, upper] : [upper, lower];
    order.splice(0, order.length, ...(banner ? [left, banner, right] : [left, right]));
  }

  const footprints = order.map((piece) => (piece.shape === 'horizontal' ? { w: piece.h, h: piece.w } : { w: piece.w, h: piece.h }));
  const availW = width - margin * 2;
  const availH = height - margin * 2 - labelBand;
  const minGap = 0.3;
  const totalW = footprints.reduce((sum, f) => sum + f.w, 0);
  const maxH = Math.max(...footprints.map((f) => f.h));
  const cell = Math.floor(Math.min(availH / maxH, availW / (totalW + minGap * (order.length - 1))));
  const gap = order.length > 1 ? Math.min(cell * 0.9, (availW - totalW * cell) / (order.length - 1)) : 0;
  const used = totalW * cell + gap * (order.length - 1);

  let x = margin + (availW - used) / 2;
  const items = order.map((piece, i): SheetItem => {
    const f = footprints[i];
    const item: SheetItem = {
      piece,
      cx: x + (f.w * cell) / 2,
      cy: margin + (f.h * cell) / 2,
      rotate: piece.shape === 'horizontal' ? 90 : 0,
      label: sheetLabel(piece, reading),
    };
    x += f.w * cell + gap;
    return item;
  });
  return { width, height, cell, items };
}

/** Printed size of one character cell in millimetres when the sheet fills an A4 page. */
export function cellMillimetres(sheet: Sheet): number {
  return (sheet.cell / SHEET.dpi) * 25.4;
}

// ---------- Decoration ----------

/** Small deterministic generator so the gold flecks look the same in the preview and in the print file. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Fleck {
  /** Centre, in cells from the top-left corner of the paper. */
  x: number;
  y: number;
  /** Half-size in cells. */
  size: number;
  /** Rotation in radians. */
  angle: number;
  alpha: number;
}

const ROLE_SEED: Record<PieceRole, number> = { doufang: 11, banner: 23, strip: 37, upper: 41, lower: 53 };

/**
 * Gold flecks scattered over a piece of paper; the same piece always gets the same flecks.
 * A doufang is drawn with one large cell, so its flecks are scaled down to match the strips.
 */
export function goldFlecks(piece: Piece, perCell = 18): Fleck[] {
  const random = seededRandom(ROLE_SEED[piece.role] * 7919 + Math.round(piece.w * 100) * 31 + Math.round(piece.h * 100));
  const scale = piece.shape === 'square' ? 0.4 : 1;
  const count = Math.round((piece.w * piece.h * perCell) / (scale * scale));
  return Array.from({ length: count }, () => ({
    x: random() * piece.w,
    y: random() * piece.h,
    size: (0.006 + random() * random() * 0.024) * scale,
    angle: random() * Math.PI,
    alpha: 0.7 + random() * 0.3,
  }));
}

export function fileName(format: Format, kind: 'image' | 'a4'): string {
  return kind === 'a4' ? `spring-couplet-${format}-a4.png` : `spring-couplet-${format}.png`;
}

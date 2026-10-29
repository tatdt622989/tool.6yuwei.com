export type FitMode = 'contain' | 'cover' | 'stretch';

export type ResizeSpec =
  | { mode: 'percent'; percent: number }
  | { mode: 'size'; width: number | null; height: number | null; lockRatio: boolean; fit: FitMode };

/** Where to read from the source and where to draw on the output canvas. */
export interface Layout {
  width: number;
  height: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export interface Preset {
  label: string;
  width: number;
  height: number;
}

export const PRESETS: Preset[] = [
  { label: 'IG 方形', width: 1080, height: 1080 },
  { label: 'IG 直式', width: 1080, height: 1350 },
  { label: '限時動態', width: 1080, height: 1920 },
  { label: 'FB／OG 分享圖', width: 1200, height: 630 },
  { label: 'YouTube 縮圖', width: 1280, height: 720 },
  { label: 'Full HD', width: 1920, height: 1080 },
];

/** Browsers refuse or crash on very large canvases (iOS Safari is the strictest). */
export const MAX_PIXELS = 40_000_000;
export const MAX_SIDE = 16_384;

function positive(n: number | null): n is number {
  return n !== null && Number.isFinite(n) && n > 0;
}

function px(n: number): number {
  return Math.max(1, Math.round(n));
}

function whole(srcW: number, srcH: number, width: number, height: number): Layout {
  return { width, height, sx: 0, sy: 0, sw: srcW, sh: srcH, dx: 0, dy: 0, dw: width, dh: height };
}

/** Height that keeps the source aspect ratio for a given width. */
export function proportionalHeight(srcW: number, srcH: number, width: number): number {
  return px((srcH * width) / srcW);
}

export function proportionalWidth(srcW: number, srcH: number, height: number): number {
  return px((srcW * height) / srcH);
}

/**
 * Computes the output layout. Returns null when the spec does not describe a size yet
 * (e.g. both width and height are empty).
 *
 * - percent: scale both sides.
 * - size + lockRatio, or only one side given: scale proportionally to fit inside the given side(s).
 * - size with both sides and unlocked: a fixed box, filled according to `fit`.
 */
export function computeLayout(srcW: number, srcH: number, spec: ResizeSpec): Layout | null {
  if (srcW <= 0 || srcH <= 0) return null;

  if (spec.mode === 'percent') {
    if (!positive(spec.percent)) return null;
    return whole(srcW, srcH, px((srcW * spec.percent) / 100), px((srcH * spec.percent) / 100));
  }

  const w = positive(spec.width) ? spec.width : null;
  const h = positive(spec.height) ? spec.height : null;
  if (w === null && h === null) return null;

  if (spec.lockRatio || w === null || h === null) {
    const scale = Math.min(w === null ? Infinity : w / srcW, h === null ? Infinity : h / srcH);
    return whole(srcW, srcH, px(srcW * scale), px(srcH * scale));
  }

  const width = px(w);
  const height = px(h);
  if (spec.fit === 'stretch') return whole(srcW, srcH, width, height);

  if (spec.fit === 'contain') {
    const scale = Math.min(width / srcW, height / srcH);
    const dw = px(srcW * scale);
    const dh = px(srcH * scale);
    return {
      width,
      height,
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
      dx: Math.floor((width - dw) / 2),
      dy: Math.floor((height - dh) / 2),
      dw,
      dh,
    };
  }

  // cover: crop the centre of the source to the box's aspect ratio.
  const scale = Math.max(width / srcW, height / srcH);
  const sw = Math.min(srcW, width / scale);
  const sh = Math.min(srcH, height / scale);
  return {
    width,
    height,
    sx: (srcW - sw) / 2,
    sy: (srcH - sh) / 2,
    sw,
    sh,
    dx: 0,
    dy: 0,
    dw: width,
    dh: height,
  };
}

export function exceedsLimit(layout: Layout): boolean {
  return layout.width > MAX_SIDE || layout.height > MAX_SIDE || layout.width * layout.height > MAX_PIXELS;
}

/** True when the drawn image does not cover the whole canvas, so a background shows. */
export function hasPadding(layout: Layout): boolean {
  return layout.dx > 0 || layout.dy > 0 || layout.dw < layout.width || layout.dh < layout.height;
}

export interface Size {
  width: number;
  height: number;
}

/** Halve each axis while it is more than twice the target; big single jumps look jagged. */
export function stepDownSizes(width: number, height: number, targetWidth: number, targetHeight: number): Size[] {
  const steps: Size[] = [];
  let w = width;
  let h = height;
  for (;;) {
    const nw = w > targetWidth * 2 ? Math.ceil(w / 2) : w;
    const nh = h > targetHeight * 2 ? Math.ceil(h / 2) : h;
    if (nw === w && nh === h) break;
    w = nw;
    h = nh;
    steps.push({ width: w, height: h });
  }
  return steps;
}

/** One-line explanation of what the current settings will do. */
export function describeSpec(spec: ResizeSpec): string {
  if (spec.mode === 'percent') return positive(spec.percent) ? `寬高各縮放為原圖的 ${spec.percent}%` : '請輸入百分比';
  const w = positive(spec.width) ? Math.round(spec.width) : null;
  const h = positive(spec.height) ? Math.round(spec.height) : null;
  if (w === null && h === null) return '請輸入寬度或高度';
  if (h === null) return `寬度設為 ${w} px，高度依比例自動計算`;
  if (w === null) return `高度設為 ${h} px，寬度依比例自動計算`;
  if (spec.lockRatio) return `等比例縮放到 ${w} × ${h} 的範圍內，不裁切也不留白`;
  if (spec.fit === 'contain') return `輸出 ${w} × ${h}，完整保留畫面，不足處留白`;
  if (spec.fit === 'cover') return `輸出 ${w} × ${h}，填滿畫面並從中央裁切多餘部分`;
  return `輸出 ${w} × ${h}，強制拉伸，比例不同時畫面會變形`;
}

const EXTENSION: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export type OutputChoice = 'keep' | 'jpeg' | 'png' | 'webp';

export function resolveOutputType(inputType: string, choice: OutputChoice): string {
  if (choice !== 'keep') return `image/${choice}`;
  return inputType in EXTENSION ? inputType : 'image/png';
}

/** photo.jpg, 1080, 1080, image/webp → photo-1080x1080.webp */
export function outputFilename(name: string, width: number, height: number, type: string): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name) || 'image';
  return `${base}-${width}x${height}.${EXTENSION[type] ?? 'png'}`;
}

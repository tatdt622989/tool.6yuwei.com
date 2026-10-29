// Crop-box geometry for the image crop tool. All rects are in pixels of the
// *oriented* image (after rotation / flip), with the origin at the top-left.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export type Rotation = 0 | 90 | 180 | 270;
export type AspectId = 'free' | '1:1' | '4:3' | '16:9' | '9:16' | '4:5';
export type OutputChoice = 'keep' | 'jpeg' | 'png' | 'webp';

export const ASPECTS: Record<AspectId, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '4:5': 4 / 5,
};

export function aspectValue(id: string): number | null {
  return id in ASPECTS ? ASPECTS[id as AspectId] : null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Default crop for a freshly loaded image: the largest centred box with the
 * given aspect ratio, or a centred box covering `coverage` of each side when free.
 */
export function initialCrop(width: number, height: number, aspect: number | null, coverage = 0.8): Rect {
  if (!aspect) {
    const w = width * coverage;
    const h = height * coverage;
    return { x: (width - w) / 2, y: (height - h) / 2, w, h };
  }
  let w = width;
  let h = w / aspect;
  if (h > height) {
    h = height;
    w = h * aspect;
  }
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

/** Moves the box by (dx, dy) without letting any edge leave the image. */
export function moveRect(r: Rect, dx: number, dy: number, width: number, height: number): Rect {
  return {
    x: clamp(r.x + dx, 0, Math.max(0, width - r.w)),
    y: clamp(r.y + dy, 0, Math.max(0, height - r.h)),
    w: r.w,
    h: r.h,
  };
}

/**
 * Resizes `start` by dragging `handle` a total of (dx, dy) image pixels.
 * The opposite edge / corner stays fixed; with an aspect ratio, edge handles
 * keep the box centred on the other axis. Results stay inside the image and
 * no side gets smaller than `minSize` (unless the image itself is smaller).
 */
export function resizeRect(
  start: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  width: number,
  height: number,
  aspect: number | null,
  minSize = 16,
): Rect {
  const left = start.x;
  const top = start.y;
  const right = start.x + start.w;
  const bottom = start.y + start.h;
  const hasW = handle.includes('w');
  const hasE = handle.includes('e');
  const hasN = handle.includes('n');
  const hasS = handle.includes('s');

  if (!aspect) {
    const minW = Math.min(minSize, width);
    const minH = Math.min(minSize, height);
    let l = left;
    let r = right;
    let t = top;
    let b = bottom;
    if (hasW) l = clamp(left + dx, 0, right - minW);
    if (hasE) r = clamp(right + dx, left + minW, width);
    if (hasN) t = clamp(top + dy, 0, bottom - minH);
    if (hasS) b = clamp(bottom + dy, top + minH, height);
    return { x: l, y: t, w: r - l, h: b - t };
  }

  // Smallest width that keeps both sides >= minSize.
  const minW = Math.max(minSize, minSize * aspect);
  const isCorner = (hasW || hasE) && (hasN || hasS);

  if (isCorner) {
    const sx = hasE ? 1 : -1;
    const sy = hasS ? 1 : -1;
    const anchorX = hasE ? left : right;
    const anchorY = hasS ? top : bottom;
    const wFromX = start.w + sx * dx;
    const wFromY = (start.h + sy * dy) * aspect;
    let w = Math.abs(wFromX - start.w) >= Math.abs(wFromY - start.w) ? wFromX : wFromY;
    const maxW = Math.min(sx > 0 ? width - anchorX : anchorX, (sy > 0 ? height - anchorY : anchorY) * aspect);
    w = clamp(w, Math.min(minW, maxW), maxW);
    const h = w / aspect;
    return { x: sx > 0 ? anchorX : anchorX - w, y: sy > 0 ? anchorY : anchorY - h, w, h };
  }

  if (hasE || hasW) {
    const cy = top + start.h / 2;
    const anchorX = hasE ? left : right;
    let w = start.w + (hasE ? dx : -dx);
    const maxW = Math.min(hasE ? width - anchorX : anchorX, 2 * Math.min(cy, height - cy) * aspect);
    w = clamp(w, Math.min(minW, maxW), maxW);
    const h = w / aspect;
    return { x: hasE ? anchorX : anchorX - w, y: cy - h / 2, w, h };
  }

  const cx = left + start.w / 2;
  const anchorY = hasS ? top : bottom;
  let h = start.h + (hasS ? dy : -dy);
  const maxH = Math.min(hasS ? height - anchorY : anchorY, (2 * Math.min(cx, width - cx)) / aspect);
  h = clamp(h, Math.min(minW / aspect, maxH), maxH);
  const w = h * aspect;
  return { x: cx - w / 2, y: hasS ? anchorY : anchorY - h, w, h };
}

/** Integer pixel rect for the canvas, kept inside the image. Locked ratios are re-derived from the rounded width. */
export function pixelRect(r: Rect, width: number, height: number, aspect: number | null): Rect {
  const x = clamp(Math.round(r.x), 0, Math.max(0, width - 1));
  const y = clamp(Math.round(r.y), 0, Math.max(0, height - 1));
  let w = clamp(Math.round(r.w), 1, width - x);
  let h = clamp(Math.round(aspect ? w / aspect : r.h), 1, height - y);
  if (aspect && Math.round(w / aspect) > height - y) w = clamp(Math.round(h * aspect), 1, width - x);
  return { x, y, w, h };
}

// ---------- Orientation ----------

export function normalizeRotation(deg: number): Rotation {
  return ((((Math.round(deg / 90) * 90) % 360) + 360) % 360) as Rotation;
}

/** Size of the image after rotating by `rotation` degrees clockwise. */
export function orientedSize(width: number, height: number, rotation: Rotation): { width: number; height: number } {
  return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height };
}

/**
 * Canvas transform [a, b, c, d, e, f] that draws the source image (width × height)
 * rotated clockwise by `rotation`, then mirrored in the rotated view.
 * x' = a·x + c·y + e, y' = b·x + d·y + f  (same order as ctx.setTransform).
 */
export function orientMatrix(
  width: number,
  height: number,
  rotation: Rotation,
  flipH: boolean,
  flipV: boolean,
): [number, number, number, number, number, number] {
  let m: [number, number, number, number, number, number];
  switch (rotation) {
    case 90:
      m = [0, 1, -1, 0, height, 0];
      break;
    case 180:
      m = [-1, 0, 0, -1, width, height];
      break;
    case 270:
      m = [0, -1, 1, 0, 0, width];
      break;
    default:
      m = [1, 0, 0, 1, 0, 0];
  }
  const out = orientedSize(width, height, rotation);
  if (flipH) m = [-m[0], m[1], -m[2], m[3], out.width - m[4], m[5]];
  if (flipV) m = [m[0], -m[1], m[2], -m[3], m[4], out.height - m[5]];
  return m;
}

export function applyMatrix(m: readonly number[], x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** The same box after the whole image (width × height, before turning) is rotated 90° clockwise or counter-clockwise. */
export function rotateRect(r: Rect, width: number, height: number, clockwise: boolean): Rect {
  return clockwise
    ? { x: height - (r.y + r.h), y: r.x, w: r.h, h: r.w }
    : { x: r.y, y: width - (r.x + r.w), w: r.h, h: r.w };
}

export function flipRect(r: Rect, width: number, height: number, horizontal: boolean): Rect {
  return horizontal ? { ...r, x: width - r.x - r.w } : { ...r, y: height - r.y - r.h };
}

/**
 * Turns the current view by 90°. Flips are applied after rotation, and
 * turn ∘ mirrorH = mirrorV ∘ turn, so the turn is added to the rotation and the
 * two mirror flags swap.
 */
export function rotateState(
  state: { rotation: Rotation; flipH: boolean; flipV: boolean },
  clockwise: boolean,
): { rotation: Rotation; flipH: boolean; flipV: boolean } {
  return {
    rotation: normalizeRotation(state.rotation + (clockwise ? 90 : -90)),
    flipH: state.flipV,
    flipV: state.flipH,
  };
}

// ---------- Output ----------

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function resolveOutputType(inputType: string, choice: OutputChoice): string {
  if (choice === 'jpeg') return 'image/jpeg';
  if (choice === 'png') return 'image/png';
  if (choice === 'webp') return 'image/webp';
  return inputType in EXT ? inputType : 'image/png';
}

export function outputFilename(name: string, type: string): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name).trim() || 'image';
  return `${base}-crop.${EXT[type] ?? 'png'}`;
}

/** Reduced ratio label such as 16:9 for a width × height, or the decimal ratio when it does not reduce nicely. */
export function ratioLabel(width: number, height: number): string {
  if (width <= 0 || height <= 0) return '—';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(Math.round(width), Math.round(height));
  const a = Math.round(width) / g;
  const b = Math.round(height) / g;
  if (a <= 50 && b <= 50) return `${a}:${b}`;
  return `${(width / height).toFixed(2)}:1`;
}

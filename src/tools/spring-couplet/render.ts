// Canvas drawing for the spring couplet generator. Browser-only; geometry comes from logic.ts.
import { CROSS, END_PAD, goldFlecks, type Ink, type Paper, type Piece, type Placed, type Scene, type Sheet } from './logic';

/** The web font first, then the brush-style fonts some systems ship, so a missing glyph still gets drawn. */
export const FONT_FAMILY = '"LXGW WenKai TC", "Kaiti TC", "BiauKai", "DFKai-SB", "KaiTi", serif';
export const FONT_WEIGHT = 700;

const LABEL_FAMILY = 'system-ui, -apple-system, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';

const COLORS = {
  red: '#c8171e',
  gold: '#f3cf6b',
  fleck: '#f6d98a',
  black: '#17110e',
  plainInk: '#111111',
  wall: '#f3eee6',
  door: '#e4dccf',
  doorLine: '#cdc2b1',
  cut: '#9aa0a8',
  label: '#5b6069',
};

export interface Style {
  paper: Paper;
  ink: Ink;
}

function inkColor(style: Style): string {
  if (style.paper === 'none') return COLORS.plainInk;
  return style.ink === 'gold' ? COLORS.gold : COLORS.black;
}

function setFont(ctx: CanvasRenderingContext2D, px: number): void {
  ctx.font = `${FONT_WEIGHT} ${px}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
}

/**
 * Distance from the centre of a cell down to the baseline. Measured from a full-height
 * character, so the text sits in the middle whichever font ends up drawing it.
 */
function baselineShift(ctx: CanvasRenderingContext2D): number {
  const m = ctx.measureText('國');
  return (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
}

function drawPaper(ctx: CanvasRenderingContext2D, piece: Piece, cell: number, style: Style): void {
  const w = piece.w * cell;
  const h = piece.h * cell;
  if (style.paper === 'none') {
    const line = Math.max(1, cell * 0.006);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = COLORS.cut;
    ctx.lineWidth = line;
    ctx.setLineDash([line * 6, line * 5]);
    ctx.strokeRect(line / 2, line / 2, w - line, h - line);
    ctx.setLineDash([]);
    return;
  }

  ctx.fillStyle = COLORS.red;
  ctx.fillRect(0, 0, w, h);

  if (style.paper === 'fleck') {
    ctx.fillStyle = COLORS.fleck;
    for (const fleck of goldFlecks(piece)) {
      const r = fleck.size * cell;
      ctx.save();
      ctx.globalAlpha = fleck.alpha;
      ctx.translate(fleck.x * cell, fleck.y * cell);
      ctx.rotate(fleck.angle);
      ctx.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
      ctx.restore();
    }
  }

  if (style.paper === 'border') {
    ctx.strokeStyle = COLORS.gold;
    const outer = cell * 0.042;
    ctx.lineWidth = cell * 0.018;
    ctx.strokeRect(outer, outer, w - outer * 2, h - outer * 2);
    const inner = cell * 0.072;
    ctx.lineWidth = Math.max(1, cell * 0.006);
    ctx.strokeRect(inner, inner, w - inner * 2, h - inner * 2);
  }
}

function drawSignature(ctx: CanvasRenderingContext2D, chars: string[], x: number, bottom: number, px: number): void {
  if (chars.length === 0) return;
  setFont(ctx, px);
  const shift = baselineShift(ctx);
  const step = px * 1.08;
  chars.forEach((ch, i) => {
    const cy = bottom - (chars.length - 1 - i) * step - px / 2;
    ctx.fillText(ch, x, cy + shift);
  });
}

/** Draw one piece with its top-left corner at the origin. */
export function drawPiece(ctx: CanvasRenderingContext2D, piece: Piece, cell: number, style: Style): void {
  const w = piece.w * cell;
  const h = piece.h * cell;
  ctx.save();
  drawPaper(ctx, piece, cell, style);
  ctx.fillStyle = inkColor(style);

  if (piece.shape === 'square') {
    // The paper is drawn square; the character lies on the diagonal so it stands upright once
    // the paper is turned into a diamond.
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 4);
    if (piece.chars[0]) {
      ctx.save();
      if (piece.flip) ctx.rotate(Math.PI);
      setFont(ctx, cell);
      ctx.fillText(piece.chars[0], 0, baselineShift(ctx));
      ctx.restore();
    }
    const px = Math.min(cell * 0.095, (cell * 0.5) / Math.max(piece.signature.length, 1));
    drawSignature(ctx, piece.signature, -cell * 0.62, cell * 0.27, px);
  } else {
    setFont(ctx, cell * 0.9);
    const shift = baselineShift(ctx);
    piece.chars.forEach((ch, i) => {
      const along = (END_PAD + i + 0.5) * cell;
      if (piece.shape === 'vertical') ctx.fillText(ch, w / 2, along + shift);
      else ctx.fillText(ch, along, h / 2 + shift);
    });
    if (piece.shape === 'vertical') drawSignature(ctx, piece.signature, cell * 0.165, h - cell * 0.34, cell * 0.15);
  }
  ctx.restore();
}

function withPlacement(ctx: CanvasRenderingContext2D, item: Placed, scale: number, draw: (w: number, h: number) => void): void {
  const w = item.piece.w * scale;
  const h = item.piece.h * scale;
  ctx.save();
  ctx.translate(item.cx, item.cy);
  ctx.rotate((item.rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  draw(w, h);
  ctx.restore();
}

function context(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  return ctx;
}

/** The pieces as they hang: the preview, and the image people share. */
export function renderScene(canvas: HTMLCanvasElement, scene: Scene, cell: number, style: Style): void {
  const ctx = context(canvas, scene.width * cell, scene.height * cell);
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (scene.door) {
    const { x, y, w, h } = scene.door;
    const line = Math.max(1, cell * 0.014);
    ctx.fillStyle = COLORS.door;
    ctx.fillRect(x * cell, y * cell, w * cell, h * cell);
    ctx.strokeStyle = COLORS.doorLine;
    ctx.lineWidth = line;
    ctx.strokeRect(x * cell, y * cell, w * cell, h * cell + line * 2);
    ctx.beginPath();
    ctx.moveTo((x + w / 2) * cell, y * cell);
    ctx.lineTo((x + w / 2) * cell, (y + h) * cell);
    ctx.stroke();
    ctx.fillStyle = COLORS.doorLine;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc((x + w / 2 + side * 0.22) * cell, (y + h * 0.52) * cell, cell * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const item of scene.items) {
    const placed = { ...item, cx: item.cx * cell, cy: item.cy * cell };
    withPlacement(ctx, placed, cell, (w, h) => {
      ctx.save();
      ctx.shadowColor = 'rgb(70 40 20 / 0.28)';
      ctx.shadowBlur = cell * 0.09;
      ctx.shadowOffsetY = cell * 0.03;
      ctx.fillStyle = style.paper === 'none' ? '#ffffff' : COLORS.red;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      drawPiece(ctx, item.piece, cell, style);
    });
  }
}

/** The A4 print file: white page, pieces packed for cutting, a caption under each. */
export function renderSheet(canvas: HTMLCanvasElement, sheet: Sheet, style: Style): void {
  const ctx = context(canvas, sheet.width, sheet.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  for (const item of sheet.items) {
    withPlacement(ctx, item, sheet.cell, () => drawPiece(ctx, item.piece, sheet.cell, style));
    if (!item.label) continue;
    const footH = (item.rotate === 90 ? item.piece.w : item.piece.h) * sheet.cell;
    const footW = (item.rotate === 90 ? item.piece.h : item.piece.w) * sheet.cell;
    let px = 40;
    ctx.font = `600 ${px}px ${LABEL_FAMILY}`;
    const maxWidth = Math.max(footW, CROSS * sheet.cell) * 1.25;
    const measured = ctx.measureText(item.label).width;
    if (measured > maxWidth) {
      px = Math.max(24, Math.floor((px * maxWidth) / measured));
      ctx.font = `600 ${px}px ${LABEL_FAMILY}`;
    }
    ctx.fillStyle = COLORS.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, item.cx, item.cy + footH / 2 + 56);
  }
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode'))), 'image/png');
  });
}

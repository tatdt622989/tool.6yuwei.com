import { describe, expect, it } from 'vitest';
import {
  applyMatrix,
  aspectValue,
  flipRect,
  initialCrop,
  moveRect,
  normalizeRotation,
  orientMatrix,
  orientedSize,
  outputFilename,
  pixelRect,
  ratioLabel,
  resizeRect,
  resolveOutputType,
  rotateRect,
  rotateState,
  type Rect,
  type Rotation,
} from './logic';

const W = 1200;
const H = 800;

function inside(r: Rect, width = W, height = H) {
  expect(r.x).toBeGreaterThanOrEqual(-1e-9);
  expect(r.y).toBeGreaterThanOrEqual(-1e-9);
  expect(r.x + r.w).toBeLessThanOrEqual(width + 1e-9);
  expect(r.y + r.h).toBeLessThanOrEqual(height + 1e-9);
}

describe('aspectValue', () => {
  it('maps presets', () => {
    expect(aspectValue('free')).toBeNull();
    expect(aspectValue('1:1')).toBe(1);
    expect(aspectValue('16:9')).toBeCloseTo(16 / 9);
    expect(aspectValue('4:5')).toBeCloseTo(0.8);
    expect(aspectValue('3:4')).toBeCloseTo(0.75);
    expect(aspectValue('3:2')).toBeCloseTo(1.5);
    expect(aspectValue('bogus')).toBeNull();
  });
});

describe('initialCrop', () => {
  it('free crop covers 80% centred', () => {
    expect(initialCrop(W, H, null)).toEqual({ x: 120, y: 80, w: 960, h: 640 });
  });
  it('locked crop is the largest centred box', () => {
    expect(initialCrop(W, H, 1)).toEqual({ x: 200, y: 0, w: 800, h: 800 });
    const wide = initialCrop(W, H, 16 / 9);
    expect(wide.w).toBe(1200);
    expect(wide.h).toBeCloseTo(675);
    expect(wide.y).toBeCloseTo(62.5);
    const tall = initialCrop(W, H, 9 / 16);
    expect(tall.h).toBe(800);
    expect(tall.w).toBeCloseTo(450);
    expect(tall.x).toBeCloseTo(375);
  });
});

describe('moveRect', () => {
  const r = { x: 100, y: 100, w: 400, h: 300 };
  it('moves freely inside', () => {
    expect(moveRect(r, 50, -20, W, H)).toEqual({ x: 150, y: 80, w: 400, h: 300 });
  });
  it('clamps at every edge', () => {
    expect(moveRect(r, -500, -500, W, H)).toEqual({ x: 0, y: 0, w: 400, h: 300 });
    expect(moveRect(r, 5000, 5000, W, H)).toEqual({ x: 800, y: 500, w: 400, h: 300 });
  });
});

describe('resizeRect (free)', () => {
  const r = { x: 100, y: 100, w: 400, h: 300 };
  it('drags the south-east corner', () => {
    expect(resizeRect(r, 'se', 50, 30, W, H, null)).toEqual({ x: 100, y: 100, w: 450, h: 330 });
  });
  it('drags the north-west corner keeping the far corner fixed', () => {
    expect(resizeRect(r, 'nw', -50, 20, W, H, null)).toEqual({ x: 50, y: 120, w: 450, h: 280 });
  });
  it('edge handles only change one axis', () => {
    expect(resizeRect(r, 'e', 100, 999, W, H, null)).toEqual({ x: 100, y: 100, w: 500, h: 300 });
    expect(resizeRect(r, 'n', 999, -40, W, H, null)).toEqual({ x: 100, y: 60, w: 400, h: 340 });
  });
  it('clamps to the image and the minimum size', () => {
    expect(resizeRect(r, 'se', 5000, 5000, W, H, null)).toEqual({ x: 100, y: 100, w: 1100, h: 700 });
    expect(resizeRect(r, 'w', 1000, 0, W, H, null, 20)).toEqual({ x: 480, y: 100, w: 20, h: 300 });
    expect(resizeRect(r, 'nw', -1000, -1000, W, H, null)).toEqual({ x: 0, y: 0, w: 500, h: 400 });
  });
  it('never inverts when dragged past the opposite edge', () => {
    const out = resizeRect(r, 's', 0, -1000, W, H, null, 10);
    expect(out.h).toBe(10);
    expect(out.y).toBe(100);
  });
});

describe('resizeRect (locked aspect)', () => {
  const square = { x: 400, y: 200, w: 300, h: 300 };
  it('corner keeps the ratio and the anchor', () => {
    const out = resizeRect(square, 'se', 100, 20, W, H, 1);
    expect(out).toEqual({ x: 400, y: 200, w: 400, h: 400 });
  });
  it('uses the larger of the two drags', () => {
    const out = resizeRect(square, 'nw', -10, -60, W, H, 1);
    expect(out.w).toBe(360);
    expect(out.h).toBe(360);
    expect(out.x + out.w).toBe(700);
    expect(out.y + out.h).toBe(500);
  });
  it('stops at the image edge without breaking the ratio', () => {
    const out = resizeRect(square, 'se', 5000, 0, W, H, 1);
    expect(out.w).toBe(600); // limited by height: 800 - 200
    expect(out.h).toBe(600);
    inside(out);
  });
  it('edge handle keeps the box centred on the other axis', () => {
    const r = { x: 100, y: 200, w: 320, h: 180 };
    const out = resizeRect(r, 'e', 160, 0, W, H, 16 / 9);
    expect(out.w).toBeCloseTo(480);
    expect(out.h).toBeCloseTo(270);
    expect(out.y + out.h / 2).toBeCloseTo(290);
    expect(out.x).toBe(100);
    inside(out);
  });
  it('vertical edge handle respects width limits', () => {
    const r = { x: 1000, y: 100, w: 100, h: 100 };
    const out = resizeRect(r, 's', 0, 600, W, H, 1);
    // centre x = 1050, so at most 2 × 150 wide
    expect(out.w).toBeCloseTo(300);
    expect(out.h).toBeCloseTo(300);
    inside(out);
  });
  it('enforces the minimum on both sides for wide ratios', () => {
    const out = resizeRect({ x: 100, y: 100, w: 320, h: 180 }, 'se', -1000, -1000, W, H, 16 / 9, 20);
    expect(out.h).toBeCloseTo(20);
    expect(out.w).toBeCloseTo(20 * (16 / 9));
  });
  it('always stays inside for random drags', () => {
    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (const aspect of [null, 1, 4 / 3, 9 / 16, 4 / 5]) {
      let r = initialCrop(W, H, aspect, 0.5);
      for (let i = 0; i < 300; i++) {
        r = resizeRect(r, handles[i % 8], rand() * 400, rand() * 400, W, H, aspect);
        inside(r);
        expect(r.w).toBeGreaterThan(0);
        if (aspect) expect(r.w / r.h).toBeCloseTo(aspect, 6);
      }
    }
  });
});

describe('pixelRect', () => {
  it('rounds and clamps', () => {
    expect(pixelRect({ x: 10.4, y: 9.6, w: 100.5, h: 50.2 }, W, H, null)).toEqual({ x: 10, y: 10, w: 101, h: 50 });
    expect(pixelRect({ x: -3, y: 0, w: 5000, h: 5000 }, W, H, null)).toEqual({ x: 0, y: 0, w: 1200, h: 800 });
  });
  it('derives height from width for locked ratios', () => {
    expect(pixelRect({ x: 0, y: 62.5, w: 1200, h: 675 }, W, H, 16 / 9)).toEqual({ x: 0, y: 63, w: 1200, h: 675 });
    expect(pixelRect({ x: 0, y: 0, w: 799.6, h: 799.6 }, W, H, 1)).toEqual({ x: 0, y: 0, w: 800, h: 800 });
  });
});

describe('orientation', () => {
  it('normalizes rotation', () => {
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(360)).toBe(0);
  });
  it('swaps size for quarter turns', () => {
    expect(orientedSize(1200, 800, 90)).toEqual({ width: 800, height: 1200 });
    expect(orientedSize(1200, 800, 180)).toEqual({ width: 1200, height: 800 });
  });

  // Where the source's top-left / top-right corners end up.
  const cases: [Rotation, boolean, boolean, [number, number], [number, number]][] = [
    [0, false, false, [0, 0], [W, 0]],
    [90, false, false, [H, 0], [H, W]],
    [180, false, false, [W, H], [0, H]],
    [270, false, false, [0, W], [0, 0]],
    [0, true, false, [W, 0], [0, 0]],
    [0, false, true, [0, H], [W, H]],
    [90, true, false, [0, 0], [0, W]],
  ];
  it.each(cases)('rotation %i flipH %s flipV %s maps corners', (rot, fh, fv, tl, tr) => {
    const m = orientMatrix(W, H, rot, fh, fv);
    expect(applyMatrix(m, 0, 0)).toEqual(tl);
    expect(applyMatrix(m, W, 0)).toEqual(tr);
  });

  it('keeps every source corner inside the oriented canvas', () => {
    for (const rot of [0, 90, 180, 270] as Rotation[]) {
      for (const fh of [false, true]) {
        for (const fv of [false, true]) {
          const m = orientMatrix(W, H, rot, fh, fv);
          const out = orientedSize(W, H, rot);
          const corners = [applyMatrix(m, 0, 0), applyMatrix(m, W, 0), applyMatrix(m, 0, H), applyMatrix(m, W, H)];
          expect(new Set(corners.map((c) => c.join()))).toEqual(
            new Set([`0,0`, `${out.width},0`, `0,${out.height}`, `${out.width},${out.height}`]),
          );
        }
      }
    }
  });

  it('rotateState turns the current view, whatever flips are on', () => {
    const p = [123, 45] as const;
    for (const rot of [0, 90, 180, 270] as Rotation[]) {
      for (const fh of [false, true]) {
        for (const fv of [false, true]) {
          for (const cw of [true, false]) {
            const before = orientMatrix(W, H, rot, fh, fv);
            const size = orientedSize(W, H, rot);
            const [x, y] = applyMatrix(before, p[0], p[1]);
            const expected = cw ? [size.height - y, x] : [y, size.width - x];
            const next = rotateState({ rotation: rot, flipH: fh, flipV: fv }, cw);
            const after = orientMatrix(W, H, next.rotation, next.flipH, next.flipV);
            expect(applyMatrix(after, p[0], p[1])).toEqual(expected);
          }
        }
      }
    }
  });

  it('rotateRect follows the image', () => {
    const r = { x: 100, y: 50, w: 200, h: 100 };
    expect(rotateRect(r, W, H, true)).toEqual({ x: 650, y: 100, w: 100, h: 200 });
    expect(rotateRect(r, W, H, false)).toEqual({ x: 50, y: 900, w: 100, h: 200 });
    // Four clockwise turns return to the start.
    let q = r;
    let size = { w: W, h: H };
    for (let i = 0; i < 4; i++) {
      q = rotateRect(q, size.w, size.h, true);
      size = { w: size.h, h: size.w };
    }
    expect(q).toEqual(r);
  });

  it('flipRect mirrors the box', () => {
    const r = { x: 100, y: 50, w: 200, h: 100 };
    expect(flipRect(r, W, H, true)).toEqual({ x: 900, y: 50, w: 200, h: 100 });
    expect(flipRect(r, W, H, false)).toEqual({ x: 100, y: 650, w: 200, h: 100 });
  });
});

describe('output', () => {
  it('resolves the output type', () => {
    expect(resolveOutputType('image/jpeg', 'keep')).toBe('image/jpeg');
    expect(resolveOutputType('image/gif', 'keep')).toBe('image/png');
    expect(resolveOutputType('image/png', 'jpeg')).toBe('image/jpeg');
    expect(resolveOutputType('image/png', 'webp')).toBe('image/webp');
  });
  it('builds file names', () => {
    expect(outputFilename('IMG_0001.JPG', 'image/jpeg')).toBe('IMG_0001-crop.jpg');
    expect(outputFilename('shot', 'image/png')).toBe('shot-crop.png');
    expect(outputFilename('', 'image/webp')).toBe('image-crop.webp');
  });
  it('labels ratios', () => {
    expect(ratioLabel(1920, 1080)).toBe('16:9');
    expect(ratioLabel(1080, 1350)).toBe('4:5');
    expect(ratioLabel(1001, 333)).toBe('3.01:1');
    expect(ratioLabel(0, 10)).toBe('—');
  });
});

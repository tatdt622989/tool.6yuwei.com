import { describe, expect, it } from 'vitest';
import {
  easeOutQuart,
  fitLabel,
  hasCustomWeights,
  MAX_OPTIONS,
  parseOptions,
  pickWeighted,
  PRESETS,
  probabilities,
  randomFloat,
  removeOptionLine,
  rotationAt,
  segmentAtPointer,
  segmentsOf,
  shuffleLines,
  sliceColor,
  targetRotation,
  type RandomSource,
} from './logic';

/** Random source that always yields `value` for every 32-bit word. */
const constant =
  (value: number): RandomSource =>
  (a) =>
    a.fill(value);

/** Deterministic xorshift generator for property-style tests. */
function seeded(seed: number): RandomSource {
  let x = seed >>> 0 || 1;
  return (a) => {
    for (let i = 0; i < a.length; i++) {
      x ^= x << 13;
      x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      a[i] = x;
    }
    return a;
  };
}

describe('parseOptions', () => {
  it('reads one option per line and skips blank lines', () => {
    const opts = parseOptions('  便當 \n\n牛肉麵\r\n滷肉飯');
    expect(opts.map((o) => o.label)).toEqual(['便當', '牛肉麵', '滷肉飯']);
    expect(opts.map((o) => o.line)).toEqual([0, 2, 3]);
    expect(opts.every((o) => o.weight === 1)).toBe(true);
  });

  it('parses weights in several notations', () => {
    const opts = parseOptions('頭獎*1\n二獎 * 3\n三獎＊2.5\n參加獎×20\nBig x4\n全形*１０');
    expect(opts.map((o) => [o.label, o.weight])).toEqual([
      ['頭獎', 1],
      ['二獎', 3],
      ['三獎', 2.5],
      ['參加獎', 20],
      ['Big', 4],
      ['全形', 10],
    ]);
    expect(hasCustomWeights(opts)).toBe(true);
  });

  it('keeps labels that merely contain x or digits', () => {
    expect(parseOptions('Box3\n3x3 魔術方塊\n*5').map((o) => o.label)).toEqual(['Box3', '3x3 魔術方塊', '*5']);
  });

  it('treats weight 0 as disabled and caps huge weights', () => {
    const opts = parseOptions('A*0\nB*99999');
    expect(opts).toHaveLength(1);
    expect(opts[0]).toMatchObject({ label: 'B', weight: 1000 });
  });

  it('limits the number of options', () => {
    const text = Array.from({ length: 150 }, (_, i) => `項目${i}`).join('\n');
    expect(parseOptions(text)).toHaveLength(MAX_OPTIONS);
  });
});

describe('pickWeighted', () => {
  it('returns -1 for an empty list', () => {
    expect(pickWeighted([])).toBe(-1);
  });

  it('maps the random range onto cumulative weights', () => {
    const opts = parseOptions('A*1\nB*3');
    expect(pickWeighted(opts, constant(0))).toBe(0); // r = 0
    expect(pickWeighted(opts, constant(0xffffffff))).toBe(1); // r → 1
  });

  it('is roughly proportional to weight', () => {
    const opts = parseOptions('A*1\nB*3');
    const rng = seeded(42);
    let b = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) if (pickWeighted(opts, rng) === 1) b++;
    expect(b / n).toBeGreaterThan(0.73);
    expect(b / n).toBeLessThan(0.77);
  });

  it('randomFloat stays in [0, 1)', () => {
    expect(randomFloat(constant(0))).toBe(0);
    expect(randomFloat(constant(0xffffffff))).toBeLessThan(1);
  });
});

describe('geometry', () => {
  it('splits the circle proportionally', () => {
    const segs = segmentsOf(parseOptions('A\nB*2\nC'));
    expect(segs).toEqual([
      { start: 0, end: 90 },
      { start: 90, end: 270 },
      { start: 270, end: 360 },
    ]);
  });

  it('finds the slice under the 12 o’clock pointer', () => {
    const segs = segmentsOf(parseOptions('A\nB\nC\nD'));
    expect(segmentAtPointer(segs, 0)).toBe(0);
    expect(segmentAtPointer(segs, -100)).toBe(1); // wheel turned back 100° → pointer reads 100°
    expect(segmentAtPointer(segs, 45)).toBe(3); // turned forward 45° → pointer reads 315°
    expect(segmentAtPointer(segs, 720 + 10)).toBe(3);
  });

  it('always lands on the pre-drawn winner, from any start angle', () => {
    const opts = parseOptions('A\nB*3\nC\nD*0.5\nE\nF*2');
    const segs = segmentsOf(opts);
    const rng = seeded(7);
    let current = 0;
    for (let i = 0; i < 500; i++) {
      const winner = pickWeighted(opts, rng);
      const to = targetRotation(segs, winner, current, 6, randomFloat(rng));
      expect(to).toBeGreaterThan(current + 360 * 6 - 1e-9);
      expect(to - current).toBeLessThan(360 * 7);
      expect(segmentAtPointer(segs, to)).toBe(winner);
      current = to;
    }
  });

  it('stays away from slice boundaries', () => {
    const segs = segmentsOf(parseOptions('A\nB'));
    for (const offset of [0, 0.999999, 1.5, -1]) {
      const to = targetRotation(segs, 1, 0, 0, offset);
      const angle = (((-to % 360) + 360) % 360);
      expect(angle).toBeGreaterThanOrEqual(180 + 6 - 1e-9);
      expect(angle).toBeLessThanOrEqual(360 - 6 + 1e-6);
    }
  });

  it('eases out and ends exactly on the target', () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.9);
    expect(rotationAt(10, 2000, 1)).toBe(2000);
    expect(rotationAt(10, 2000, 0)).toBe(10);
    expect(rotationAt(10, 2000, 2)).toBe(2000);
  });
});

describe('removeOptionLine', () => {
  it('removes only the winning line', () => {
    const text = '甲\n\n乙*2\n丙';
    const opts = parseOptions(text);
    expect(removeOptionLine(text, opts[1])).toBe('甲\n\n丙');
    expect(removeOptionLine(text, { label: 'x', weight: 1, line: 99 })).toBe(text);
  });
});

describe('shuffleLines', () => {
  it('keeps every non-blank line exactly once', () => {
    const out = shuffleLines('A\n\nB*2\nC\nD', seeded(3)).split('\n');
    expect(out.slice().sort()).toEqual(['A', 'B*2', 'C', 'D']);
  });
});

describe('colors and labels', () => {
  it('gives neighbouring slices different colors in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const n of [2, 3, 7, 12, 24]) {
        const fills = Array.from({ length: n }, (_, i) => sliceColor(i, n, theme).fill);
        for (let i = 0; i < n; i++) expect(fills[i]).not.toBe(fills[(i + 1) % n]);
        expect(fills[0]).toMatch(/^oklch\(/);
      }
    }
  });

  it('offers an hsl fallback', () => {
    expect(sliceColor(0, 4, 'light', 'hsl').fill).toMatch(/^hsl\(/);
  });

  it('truncates long labels by display width', () => {
    expect(fitLabel('牛肉麵', 10)).toBe('牛肉麵');
    expect(fitLabel('超級無敵好吃的牛肉麵', 8)).toBe('超級無敵…');
    expect(fitLabel('Hello world', 6)).toBe('Hello…');
  });

  it('presets parse into non-empty wheels', () => {
    for (const p of PRESETS) expect(parseOptions(p.options.join('\n')).length).toBeGreaterThanOrEqual(2);
    expect(probabilities(parseOptions(PRESETS.find((p) => p.id === 'prize')!.options.join('\n')))[0]).toBeCloseTo(1 / 40);
  });
});

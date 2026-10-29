import { describe, expect, it } from 'vitest';
import {
  buildLayout,
  displayKey,
  KeyTracker,
  keyLabel,
  locationLabel,
  normalizeCode,
  Q,
  rolloverHint,
  shouldPreventDefault,
} from './logic';

describe('buildLayout', () => {
  const full = buildLayout(true);
  const compact = buildLayout(false);

  it('every main row spans exactly 15 key widths', () => {
    const rows = new Map<number, number>();
    for (const k of full.keys.filter((k) => k.block === 'main')) {
      rows.set(k.y, Math.max(rows.get(k.y) ?? 0, k.x + k.w));
    }
    for (const end of rows.values()) expect(end).toBe(15 * Q);
  });

  it('has unique codes and no overlapping keys', () => {
    const codes = full.keys.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
    const cells = new Set<string>();
    for (const k of full.keys) {
      for (let dx = 0; dx < k.w; dx++)
        for (let dy = 0; dy < k.h; dy++) {
          const cell = `${k.x + dx},${k.y + dy}`;
          expect(cells.has(cell)).toBe(false);
          cells.add(cell);
        }
    }
  });

  it('includes the full ANSI set and optional numpad', () => {
    expect(compact.keys).toHaveLength(87); // tenkeyless ANSI
    expect(full.keys).toHaveLength(104); // full-size ANSI
    expect(compact.keys.some((k) => k.block === 'numpad')).toBe(false);
    expect(full.columns).toBeGreaterThan(compact.columns);
    const add = full.keys.find((k) => k.code === 'NumpadAdd');
    expect(add?.h).toBe(2);
  });

  it('keeps everything inside the grid', () => {
    for (const k of full.keys) {
      expect(k.x + k.w).toBeLessThanOrEqual(full.columns);
      expect(k.y + k.h).toBeLessThanOrEqual(full.rows);
    }
  });
});

describe('labels and codes', () => {
  it('uses Mac labels when requested', () => {
    const meta = buildLayout(false).keys.find((k) => k.code === 'MetaLeft')!;
    expect(keyLabel(meta, false)).toBe('Win');
    expect(keyLabel(meta, true)).toContain('Cmd');
  });

  it('normalizes missing codes', () => {
    expect(normalizeCode('KeyA', 'a')).toBe('KeyA');
    expect(normalizeCode('', 'a')).toBe('Key(a)');
    expect(normalizeCode('Unidentified', '')).toBe('Unidentified');
  });

  it('describes key values and locations', () => {
    expect(displayKey(' ')).toContain('Space');
    expect(displayKey('a')).toBe('a');
    expect(locationLabel(1)).toBe('左側');
    expect(locationLabel(3)).toBe('數字鍵盤');
    expect(locationLabel(9)).toBe('9');
  });

  it('lets Ctrl/Cmd shortcuts through but captures plain keys', () => {
    expect(shouldPreventDefault('Tab', false, false)).toBe(true);
    expect(shouldPreventDefault('Space', false, false)).toBe(true);
    expect(shouldPreventDefault('KeyW', false, true)).toBe(false);
    expect(shouldPreventDefault('Tab', true, false)).toBe(false);
    expect(shouldPreventDefault('MetaLeft', false, true)).toBe(true);
  });
});

describe('KeyTracker', () => {
  it('tracks down, tested and peak simultaneous keys', () => {
    const t = new KeyTracker();
    expect(t.press('KeyA')).toBe(true);
    expect(t.press('KeyA')).toBe(false); // auto-repeat
    t.press('KeyS');
    t.press('KeyD');
    expect(t.down.size).toBe(3);
    t.release('KeyS');
    expect(t.down.size).toBe(2);
    expect(t.maxSimultaneous).toBe(3);
    expect(t.presses).toBe(3);
    expect(t.testedIn(['KeyA', 'KeyS', 'KeyQ'])).toBe(2);
  });

  it('releases everything on blur and on Mac Command up', () => {
    const t = new KeyTracker();
    t.press('MetaLeft');
    t.press('KeyC');
    t.release('MetaLeft', true);
    expect(t.down.size).toBe(0);
    t.press('KeyX');
    t.press('KeyZ');
    t.releaseAll();
    expect(t.down.size).toBe(0);
    expect(t.tested.size).toBe(4);
  });

  it('only clears the Meta key itself when not on Mac', () => {
    const t = new KeyTracker();
    t.press('MetaLeft');
    t.press('KeyE');
    t.release('MetaLeft', false);
    expect([...t.down]).toEqual(['KeyE']);
  });

  it('resets', () => {
    const t = new KeyTracker();
    t.press('KeyA');
    t.reset();
    expect(t.tested.size + t.down.size + t.maxSimultaneous + t.presses).toBe(0);
  });
});

describe('rolloverHint', () => {
  it('scales with the measured rollover', () => {
    expect(rolloverHint(0)).toContain('同時按住');
    expect(rolloverHint(3)).toContain('鬼鍵');
    expect(rolloverHint(6)).toContain('6KRO');
    expect(rolloverHint(10)).toContain('NKRO');
  });
});

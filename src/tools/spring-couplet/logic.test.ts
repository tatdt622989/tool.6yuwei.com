import { pinyin } from 'pinyin-pro';
import { describe, expect, it } from 'vitest';
import {
  CROSS,
  DEFAULTS,
  DOOR_PRESETS,
  DOUFANG_PRESETS,
  END_PAD,
  LIMITS,
  PHRASE_PRESETS,
  SHEET,
  SQUARE,
  buildPieces,
  cellMillimetres,
  fileName,
  goldFlecks,
  layoutScene,
  layoutSheet,
  normalizeSettings,
  pickRandom,
  piecesText,
  sceneCell,
  seededRandom,
  splitChars,
  textIssues,
  toVertical,
  upperSide,
  type Piece,
  type Settings,
} from './logic';

const settings = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULTS, ...patch });
const byRole = (pieces: Piece[], role: Piece['role']) => pieces.find((piece) => piece.role === role)!;

describe('splitChars', () => {
  it('drops whitespace and keeps one item per character', () => {
    expect(splitChars(' 恭賀　新禧\n')).toEqual(['恭', '賀', '新', '禧']);
    expect(splitChars('')).toEqual([]);
  });

  it('keeps characters outside the basic plane and Latin letters whole', () => {
    expect(splitChars('𠮷祥A1')).toEqual(['𠮷', '祥', 'A', '1']);
  });
});

describe('toVertical', () => {
  it('swaps punctuation for its vertical form and leaves other characters alone', () => {
    expect(toVertical('，')).toBe('︐');
    expect(toVertical('「')).toBe('﹁');
    expect(toVertical('福')).toBe('福');
  });
});

describe('presets', () => {
  // Characters that are oblique (entering tone) in classical prosody but level in Mandarin.
  const ENTERING = new Set(['福']);
  const lastTone = (line: string): number => {
    const tones = pinyin(line, { toneType: 'num', type: 'array' });
    return Number(tones[tones.length - 1].slice(-1));
  };

  it('has between 20 and 40 phrases and couplets, all unique', () => {
    const total = PHRASE_PRESETS.length + DOOR_PRESETS.length;
    expect(total).toBeGreaterThanOrEqual(20);
    expect(total).toBeLessThanOrEqual(40);
    expect(new Set(PHRASE_PRESETS).size).toBe(PHRASE_PRESETS.length);
    expect(new Set(DOUFANG_PRESETS).size).toBe(DOUFANG_PRESETS.length);
    expect(new Set(DOOR_PRESETS.map((p) => p.upper)).size).toBe(DOOR_PRESETS.length);
  });

  it('keeps every preset inside the limits of its format', () => {
    for (const ch of DOUFANG_PRESETS) expect(splitChars(ch)).toHaveLength(1);
    for (const phrase of PHRASE_PRESETS) expect(splitChars(phrase)).toHaveLength(4);
    for (const p of DOOR_PRESETS) {
      const n = splitChars(p.upper).length;
      expect(n).toBeGreaterThanOrEqual(LIMITS.door[0]);
      expect(n).toBeLessThanOrEqual(LIMITS.door[1]);
      expect(splitChars(p.lower), p.lower).toHaveLength(n);
      if (p.top) expect(splitChars(p.top), p.top).toHaveLength(4);
      expect(textIssues(settings({ format: 'door', ...p }))).toEqual([]);
    }
  });

  it.each(DOOR_PRESETS.map((p) => [p.upper, p.lower]))('%s ends oblique and %s ends level', (upper, lower) => {
    const upperLast = splitChars(upper).at(-1)!;
    expect(ENTERING.has(upperLast) || [3, 4].includes(lastTone(upper)), `上聯 ${upper}`).toBe(true);
    expect([1, 2], `下聯 ${lower}`).toContain(lastTone(lower));
    expect(ENTERING.has(splitChars(lower).at(-1)!)).toBe(false);
  });

  it('includes phrases for the year of the sheep', () => {
    expect(PHRASE_PRESETS.filter((phrase) => /[羊陽洋]/.test(phrase)).length).toBeGreaterThanOrEqual(3);
    expect(DOUFANG_PRESETS).toContain('羊');
  });
});

describe('normalizeSettings', () => {
  it('returns the defaults for missing or broken input', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULTS);
    expect(normalizeSettings('x')).toEqual(DEFAULTS);
    expect(normalizeSettings({ format: 'poster', paper: 7, ink: 'blue', reading: 'up', flip: 'yes' })).toEqual(DEFAULTS);
  });

  it('keeps valid values, including empty text', () => {
    const saved = settings({ format: 'doufang', char: '春', flip: true, paper: 'none', ink: 'gold', reading: 'ltr', top: '', signature: '丁未年' });
    expect(normalizeSettings(saved)).toEqual(saved);
  });

  it('cuts very long text', () => {
    expect(normalizeSettings({ upper: '福'.repeat(500) }).upper).toHaveLength(60);
  });
});

describe('textIssues', () => {
  it('accepts the defaults in every format', () => {
    for (const format of ['door', 'doufang', 'banner', 'strip'] as const) expect(textIssues(settings({ format }))).toEqual([]);
  });

  it('reports lines of different lengths', () => {
    expect(textIssues(settings({ upper: '歲歲平安日', lower: '年年如意新春' }))).toEqual(['mismatch']);
  });

  it('reports text outside the limits', () => {
    expect(textIssues(settings({ upper: '春', lower: '福' }))).toEqual(['too-short']);
    expect(textIssues(settings({ format: 'banner', banner: '恭賀新禧萬事如意' }))).toEqual(['too-long']);
    expect(textIssues(settings({ format: 'strip', strip: '' }))).toEqual(['empty']);
    expect(textIssues(settings({ format: 'doufang', char: '  ' }))).toEqual(['empty']);
  });

  it('lets a door couplet go without a banner', () => {
    expect(textIssues(settings({ top: '' }))).toEqual([]);
  });
});

describe('pickRandom', () => {
  it('never repeats the current item when there is another one', () => {
    for (let i = 0; i < 20; i++) expect(pickRandom(['a', 'b'], 'a')).toBe('b');
    expect(pickRandom(['a'], 'a')).toBe('a');
  });

  it('stays inside the list at both ends of the random range', () => {
    expect(pickRandom(['a', 'b', 'c'], undefined, () => 0)).toBe('a');
    expect(pickRandom(['a', 'b', 'c'], undefined, () => 0.999999)).toBe('c');
  });
});

describe('buildPieces', () => {
  it('builds a door couplet as banner, first line, second line', () => {
    const pieces = buildPieces(settings({ signature: '丁未年' }));
    expect(pieces.map((p) => p.role)).toEqual(['banner', 'upper', 'lower']);
    const upper = byRole(pieces, 'upper');
    expect(upper.chars.join('')).toBe('天增歲月人增壽');
    expect(upper.shape).toBe('vertical');
    expect(upper.w).toBe(CROSS);
    expect(upper.h).toBeCloseTo(7 + END_PAD * 2);
    expect(upper.signature).toEqual([]);
    expect(byRole(pieces, 'lower').signature).toEqual(['丁', '未', '年']);
  });

  it('writes the banner right to left by default and left to right when asked', () => {
    expect(byRole(buildPieces(settings()), 'banner').chars.join('')).toBe('安長季四');
    expect(byRole(buildPieces(settings({ reading: 'ltr' })), 'banner').chars.join('')).toBe('四季長安');
    expect(buildPieces(settings({ format: 'banner', banner: '恭賀新禧' }))[0].chars.join('')).toBe('禧新賀恭');
  });

  it('leaves out the banner when it is empty', () => {
    expect(buildPieces(settings({ top: ' ' })).map((p) => p.role)).toEqual(['upper', 'lower']);
  });

  it('gives both lines the length of the longer one and cuts at nine characters', () => {
    const pieces = buildPieces(settings({ upper: '歲歲平安日', lower: '一二三四五六七八九十' }));
    expect(byRole(pieces, 'lower').chars).toHaveLength(9);
    expect(byRole(pieces, 'upper').h).toBe(byRole(pieces, 'lower').h);
    expect(byRole(pieces, 'upper').h).toBeCloseTo(9 + END_PAD * 2);
  });

  it('keeps one character for a doufang and carries the flip', () => {
    const [piece] = buildPieces(settings({ format: 'doufang', char: '福春', flip: true }));
    expect(piece).toMatchObject({ role: 'doufang', shape: 'square', chars: ['福'], w: SQUARE, h: SQUARE, flip: true });
  });

  it('uses vertical punctuation in vertical pieces only', () => {
    expect(buildPieces(settings({ format: 'strip', strip: '春，福' }))[0].chars).toEqual(['春', '︐', '福']);
    expect(buildPieces(settings({ format: 'banner', banner: '春，福', reading: 'ltr' }))[0].chars).toEqual(['春', '，', '福']);
  });

  it('still returns blank paper for empty text', () => {
    const [strip] = buildPieces(settings({ format: 'strip', strip: '' }));
    expect(strip.chars).toEqual([]);
    expect(strip.h).toBeCloseTo(LIMITS.strip[0] + END_PAD * 2);
    expect(buildPieces(settings({ format: 'doufang', char: '' }))[0].chars).toEqual([]);
  });

  it('lists each character once for font loading', () => {
    expect(piecesText(buildPieces(settings({ upper: '年年年年好', lower: '步步步步高', top: '', signature: '年' }))).sort()).toEqual(
      ['好', '年', '步', '高'].sort(),
    );
  });
});

describe('layoutScene', () => {
  it('hangs the first line on the right in the traditional reading', () => {
    const scene = layoutScene(buildPieces(settings()), 'rtl');
    const x = (role: Piece['role']) => scene.items.find((item) => item.piece.role === role)!.cx;
    expect(upperSide('rtl')).toBe('right');
    expect(x('upper')).toBeGreaterThan(x('lower'));
    expect(x('banner')).toBeCloseTo(scene.width / 2);
    expect(scene.door).toBeDefined();
  });

  it('moves the first line to the left when the banner reads left to right', () => {
    const scene = layoutScene(buildPieces(settings({ reading: 'ltr' })), 'ltr');
    const x = (role: Piece['role']) => scene.items.find((item) => item.piece.role === role)!.cx;
    expect(upperSide('ltr')).toBe('left');
    expect(x('upper')).toBeLessThan(x('lower'));
  });

  it('keeps every piece inside the scene', () => {
    const cases: Partial<Settings>[] = [
      {},
      { top: '' },
      { upper: '一二三四五六七八九', lower: '一二三四五六七八九', top: '一二三四五六' },
      { format: 'doufang' },
      { format: 'banner', banner: '一二三四五六' },
      { format: 'strip', strip: '一二三四五六七八' },
    ];
    for (const patch of cases) {
      const s = settings(patch);
      const scene = layoutScene(buildPieces(s), s.reading);
      for (const item of scene.items) {
        const half = item.rotate === 45 ? (item.piece.w * Math.SQRT2) / 2 : item.piece.w / 2;
        const halfH = item.rotate === 45 ? half : item.piece.h / 2;
        expect(item.cx - half).toBeGreaterThan(0);
        expect(item.cx + half).toBeLessThan(scene.width);
        expect(item.cy - halfH).toBeGreaterThan(0);
        expect(item.cy + halfH).toBeLessThan(scene.height);
      }
    }
  });

  it('turns the doufang into a diamond', () => {
    const scene = layoutScene(buildPieces(settings({ format: 'doufang' })), 'rtl');
    expect(scene.items[0].rotate).toBe(45);
    expect(scene.width).toBe(scene.height);
  });

  it('limits the canvas to a size phones can handle', () => {
    const s = settings({ upper: '一二三四五六七八九', lower: '一二三四五六七八九', top: '一二三四五六' });
    const scene = layoutScene(buildPieces(s), 'rtl');
    const cell = sceneCell(scene);
    expect(Math.max(scene.width, scene.height) * cell).toBeLessThanOrEqual(2000);
    expect(sceneCell(layoutScene(buildPieces(settings({ format: 'doufang' })), 'rtl'))).toBeLessThanOrEqual(520);
  });
});

describe('layoutSheet', () => {
  const inside = (s: Settings) => {
    const sheet = layoutSheet(buildPieces(s), s.reading);
    for (const item of sheet.items) {
      const w = (item.rotate === 90 ? item.piece.h : item.piece.w) * sheet.cell;
      const h = (item.rotate === 90 ? item.piece.w : item.piece.h) * sheet.cell;
      expect(item.cx - w / 2).toBeGreaterThanOrEqual(SHEET.margin - 0.5);
      expect(item.cx + w / 2).toBeLessThanOrEqual(SHEET.width - SHEET.margin + 0.5);
      expect(item.cy - h / 2).toBeGreaterThanOrEqual(SHEET.margin - 0.5);
      expect(item.cy + h / 2).toBeLessThanOrEqual(SHEET.height - SHEET.margin - SHEET.labelBand + 0.5);
    }
    return sheet;
  };

  it('is A4 at 300 dpi', () => {
    const sheet = layoutSheet(buildPieces(settings()), 'rtl');
    expect([sheet.width, sheet.height]).toEqual([2480, 3508]);
    expect((sheet.width / SHEET.dpi) * 25.4).toBeCloseTo(210, 0);
    expect((sheet.height / SHEET.dpi) * 25.4).toBeCloseTo(297, 0);
  });

  it('puts the pieces in the order they hang, banner in the middle and turned', () => {
    const rtl = inside(settings());
    expect(rtl.items.map((item) => item.piece.role)).toEqual(['lower', 'banner', 'upper']);
    expect(rtl.items.map((item) => item.rotate)).toEqual([0, 90, 0]);
    expect(rtl.items.map((item) => item.label)).toEqual(['下聯．面對門貼左邊', '橫批．由右往左讀', '上聯．面對門貼右邊']);

    const ltr = inside(settings({ reading: 'ltr' }));
    expect(ltr.items.map((item) => item.piece.role)).toEqual(['upper', 'banner', 'lower']);
    expect(ltr.items.map((item) => item.label)).toEqual(['上聯．面對門貼左邊', '橫批．由左往右讀', '下聯．面對門貼右邊']);
  });

  it('does not let pieces overlap', () => {
    const sheet = inside(settings({ upper: '歲歲平安日', lower: '年年如意春', top: '一二三四五六' }));
    const spans = sheet.items.map((item) => {
      const w = (item.rotate === 90 ? item.piece.h : item.piece.w) * sheet.cell;
      return [item.cx - w / 2, item.cx + w / 2];
    });
    for (let i = 1; i < spans.length; i++) expect(spans[i][0]).toBeGreaterThan(spans[i - 1][1]);
  });

  it('fits every format on the page', () => {
    inside(settings({ top: '' }));
    inside(settings({ upper: '一二三四五六七八九', lower: '一二三四五六七八九', top: '一二三四五六' }));
    inside(settings({ format: 'doufang' }));
    inside(settings({ format: 'banner', banner: '一二' }));
    inside(settings({ format: 'banner', banner: '一二三四五六' }));
    inside(settings({ format: 'strip', strip: '一二' }));
    inside(settings({ format: 'strip', strip: '一二三四五六七八' }));
  });

  it('prints a seven-character couplet and a doufang at the sizes the page copy states', () => {
    const door = inside(settings());
    const cell = cellMillimetres(door);
    expect(cell * (7 + END_PAD * 2)).toBeGreaterThan(270);
    expect(cell * (7 + END_PAD * 2)).toBeLessThan(285);
    expect(cell * CROSS).toBeGreaterThan(48);
    expect(cell * CROSS).toBeLessThan(56);

    const doufang = inside(settings({ format: 'doufang' }));
    expect(cellMillimetres(doufang) * SQUARE).toBeGreaterThan(195);
    expect(cellMillimetres(doufang) * SQUARE).toBeLessThanOrEqual(200.5);
    expect(doufang.items[0].rotate).toBe(0);
  });
});

describe('goldFlecks', () => {
  it('gives the same flecks for the same piece and keeps them on the paper', () => {
    const [piece] = buildPieces(settings({ format: 'strip' }));
    const flecks = goldFlecks(piece);
    expect(flecks).toEqual(goldFlecks(piece));
    expect(flecks.length).toBeGreaterThan(20);
    for (const f of flecks) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(piece.w);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(piece.h);
      expect(f.alpha).toBeLessThanOrEqual(1);
    }
  });

  it('differs between the two lines of a couplet', () => {
    const pieces = buildPieces(settings());
    expect(goldFlecks(byRole(pieces, 'upper'))[0]).not.toEqual(goldFlecks(byRole(pieces, 'lower'))[0]);
  });

  it('seededRandom stays in [0, 1)', () => {
    const random = seededRandom(42);
    for (let i = 0; i < 200; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('fileName', () => {
  it('names the share image and the print file', () => {
    expect(fileName('door', 'image')).toBe('spring-couplet-door.png');
    expect(fileName('doufang', 'a4')).toBe('spring-couplet-doufang-a4.png');
  });
});

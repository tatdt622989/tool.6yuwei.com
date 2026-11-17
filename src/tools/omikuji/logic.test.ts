import { describe, expect, it } from 'vitest';
import {
  addCount,
  buildFortune,
  CATEGORIES,
  COLORS,
  createShakeDetector,
  DIRECTIONS,
  drawFortune,
  emptyCounts,
  fortuneText,
  kanjiNumber,
  levelById,
  levelPercent,
  LEVELS,
  LINES,
  normalizeCounts,
  OVERALL,
  pick,
  pickIndex,
  pickWeighted,
  STICK_COUNT,
  stickLabel,
  TOTAL_WEIGHT,
  totalCount,
  type Rng,
  type Tone,
} from './logic';

/** RNG that replays the given values, then keeps returning the last one. */
function seq(...values: number[]): Rng {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

/** Small deterministic PRNG (mulberry32) for distribution checks. */
function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('levels', () => {
  it('lists the six levels from 大吉 to 凶', () => {
    expect(LEVELS.map((l) => l.label)).toEqual(['大吉', '中吉', '小吉', '吉', '末吉', '凶']);
  });

  it('has positive weights that add up to 100', () => {
    expect(LEVELS.every((l) => l.weight > 0)).toBe(true);
    expect(TOTAL_WEIGHT).toBe(100);
    expect(levelPercent(levelById('daikichi'))).toBe(16);
    expect(levelPercent(levelById('kyo'))).toBe(8);
  });

  it('keeps 凶 the rarest level', () => {
    const kyo = levelById('kyo');
    expect(LEVELS.every((l) => l.id === 'kyo' || l.weight > kyo.weight)).toBe(true);
  });
});

describe('pickIndex / pick', () => {
  it('maps [0, 1) evenly onto the indexes', () => {
    expect(pickIndex(4, () => 0)).toBe(0);
    expect(pickIndex(4, () => 0.25)).toBe(1);
    expect(pickIndex(4, () => 0.74)).toBe(2);
    expect(pickIndex(4, () => 0.999999)).toBe(3);
  });

  it('clamps RNG values outside [0, 1)', () => {
    expect(pickIndex(4, () => 1)).toBe(3);
    expect(pickIndex(4, () => -0.5)).toBe(0);
    expect(pickIndex(4, () => Number.NaN)).toBe(0);
  });

  it('throws on an empty list', () => {
    expect(() => pick([], () => 0)).toThrow();
  });
});

describe('pickWeighted', () => {
  it('walks the cumulative weights', () => {
    // 大吉 0–16, 中吉 16–36, 小吉 36–56, 吉 56–78, 末吉 78–92, 凶 92–100
    expect(pickWeighted(LEVELS, () => 0).id).toBe('daikichi');
    expect(pickWeighted(LEVELS, () => 0.159).id).toBe('daikichi');
    expect(pickWeighted(LEVELS, () => 0.16).id).toBe('chukichi');
    expect(pickWeighted(LEVELS, () => 0.36).id).toBe('shokichi');
    expect(pickWeighted(LEVELS, () => 0.56).id).toBe('kichi');
    expect(pickWeighted(LEVELS, () => 0.78).id).toBe('suekichi');
    expect(pickWeighted(LEVELS, () => 0.92).id).toBe('kyo');
    expect(pickWeighted(LEVELS, () => 0.999999).id).toBe('kyo');
  });

  it('never returns an entry with weight 0 and survives an RNG that returns 1', () => {
    const entries = [
      { name: 'a', weight: 0 },
      { name: 'b', weight: 3 },
      { name: 'c', weight: 0 },
    ];
    expect(pickWeighted(entries, () => 0).name).toBe('b');
    expect(pickWeighted(entries, () => 1).name).toBe('b');
    expect(() => pickWeighted([{ weight: 0 }], () => 0)).toThrow();
  });

  it('matches the weights over many draws', () => {
    const rng = seeded(2027);
    const n = 40000;
    const seen = new Map<string, number>();
    for (let i = 0; i < n; i++) {
      const id = pickWeighted(LEVELS, rng).id;
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    for (const level of LEVELS) {
      expect(Math.abs(((seen.get(level.id) ?? 0) / n) * 100 - level.weight)).toBeLessThan(1);
    }
  });
});

describe('texts', () => {
  const tones: Tone[] = ['high', 'mid', 'low'];

  it('has several overall messages for every level, without duplicates', () => {
    const all = LEVELS.flatMap((l) => OVERALL[l.id]);
    for (const level of LEVELS) expect(OVERALL[level.id].length).toBeGreaterThanOrEqual(4);
    expect(new Set(all).size).toBe(all.length);
    expect(all.every((text) => text.trim() === text && text.endsWith('。'))).toBe(true);
  });

  it('has several lines for every category and tone, without duplicates', () => {
    const all = CATEGORIES.flatMap((c) => tones.flatMap((tone) => LINES[c.id][tone]));
    for (const c of CATEGORIES) for (const tone of tones) expect(LINES[c.id][tone].length).toBeGreaterThanOrEqual(4);
    expect(new Set(all).size).toBe(all.length);
    expect(all.every((text) => text.length > 0 && text.length <= 30 && !text.endsWith('。'))).toBe(true);
  });

  it('gives every level a tone that has lines', () => {
    for (const level of LEVELS) expect(tones).toContain(level.tone);
  });
});

describe('buildFortune / drawFortune', () => {
  it('assembles a slip from the level texts in category order', () => {
    const level = levelById('kyo');
    const fortune = buildFortune(level, 7, () => 0);
    expect(fortune.level).toBe(level);
    expect(fortune.number).toBe(7);
    expect(fortune.overall).toBe(OVERALL.kyo[0]);
    expect(fortune.items.map((i) => i.label)).toEqual(CATEGORIES.map((c) => c.label));
    expect(fortune.items.map((i) => i.text)).toEqual(CATEGORIES.map((c) => LINES[c.id].low[0]));
    expect(fortune.direction).toBe(DIRECTIONS[0]);
    expect(fortune.color).toBe(COLORS[0]);
  });

  it('reads the RNG in a fixed order: level, number, overall, lines, direction, color', () => {
    // 0.5 → 小吉 (36–56); 0.98 → stick 50; 0.26 → second overall; then 0.99 → last entry everywhere.
    const fortune = drawFortune(seq(0.5, 0.98, 0.26, 0.99));
    expect(fortune.level.id).toBe('shokichi');
    expect(fortune.number).toBe(STICK_COUNT);
    expect(fortune.overall).toBe(OVERALL.shokichi[1]);
    expect(fortune.items[0].text).toBe(LINES.negai.mid.at(-1));
    expect(fortune.direction).toBe(DIRECTIONS.at(-1));
    expect(fortune.color).toBe(COLORS.at(-1));
  });

  it('is repeatable with the same seed and varies between draws', () => {
    expect(drawFortune(seeded(1))).toEqual(drawFortune(seeded(1)));
    const rng = seeded(9);
    const texts = new Set(Array.from({ length: 30 }, () => fortuneText(drawFortune(rng))));
    expect(texts.size).toBeGreaterThan(25);
  });

  it('always draws a valid slip', () => {
    const rng = seeded(42);
    for (let i = 0; i < 2000; i++) {
      const f = drawFortune(rng);
      expect(f.number).toBeGreaterThanOrEqual(1);
      expect(f.number).toBeLessThanOrEqual(STICK_COUNT);
      expect(OVERALL[f.level.id]).toContain(f.overall);
      expect(f.items).toHaveLength(CATEGORIES.length);
      for (const item of f.items) expect(LINES[item.id][f.level.tone]).toContain(item.text);
    }
  });
});

describe('kanjiNumber / stickLabel', () => {
  it('writes 1 to 99 in kanji', () => {
    expect(kanjiNumber(1)).toBe('一');
    expect(kanjiNumber(9)).toBe('九');
    expect(kanjiNumber(10)).toBe('十');
    expect(kanjiNumber(12)).toBe('十二');
    expect(kanjiNumber(20)).toBe('二十');
    expect(kanjiNumber(47)).toBe('四十七');
    expect(kanjiNumber(99)).toBe('九十九');
  });

  it('rejects numbers it cannot write', () => {
    for (const n of [0, 100, 1.5, -3, Number.NaN]) expect(() => kanjiNumber(n)).toThrow();
  });

  it('labels a stick', () => {
    expect(stickLabel(12)).toBe('第十二番');
    expect(stickLabel(STICK_COUNT)).toBe('第五十番');
  });
});

describe('fortuneText', () => {
  it('lists the level, the message and every category', () => {
    const text = fortuneText(buildFortune(levelById('daikichi'), 12, () => 0));
    const lines = text.split('\n');
    expect(lines[0]).toBe('【おみくじ 2027】第十二番 大吉');
    expect(lines[1]).toBe(OVERALL.daikichi[0]);
    expect(lines).toContain(`願望：${LINES.negai.high[0]}`);
    expect(lines).toContain(`金運：${LINES.kinun.high[0]}`);
    expect(lines.at(-1)).toBe('吉方：東　幸運の色：白');
    expect(lines.filter((l) => l.includes('：')).length).toBe(CATEGORIES.length + 1);
  });
});

describe('counts', () => {
  it('starts at zero and adds without mutating', () => {
    const zero = emptyCounts();
    const one = addCount(zero, 'kichi');
    expect(totalCount(zero)).toBe(0);
    expect(one.kichi).toBe(1);
    expect(totalCount(addCount(one, 'kyo'))).toBe(2);
    expect(zero.kichi).toBe(0);
  });

  it('cleans up whatever was stored', () => {
    expect(normalizeCounts(null)).toEqual(emptyCounts());
    expect(normalizeCounts('x')).toEqual(emptyCounts());
    expect(normalizeCounts({ daikichi: 3, kyo: -1, kichi: 1.5, chukichi: '2', other: 9 })).toEqual({
      ...emptyCounts(),
      daikichi: 3,
    });
  });
});

describe('createShakeDetector', () => {
  it('fires after three separate jolts inside the window', () => {
    const shake = createShakeDetector();
    expect(shake(20, 0)).toBe(false);
    expect(shake(20, 200)).toBe(false);
    expect(shake(20, 400)).toBe(true);
  });

  it('ignores weak movement and samples from the same jolt', () => {
    const shake = createShakeDetector();
    expect(shake(5, 0)).toBe(false);
    expect(shake(20, 100)).toBe(false);
    expect(shake(20, 120)).toBe(false);
    expect(shake(20, 140)).toBe(false);
    expect(shake(Number.NaN, 300)).toBe(false);
    expect(shake(20, 320)).toBe(false);
    expect(shake(20, 520)).toBe(true);
  });

  it('forgets jolts that are too far apart and starts over after firing', () => {
    const shake = createShakeDetector({ windowMs: 500 });
    expect(shake(20, 0)).toBe(false);
    expect(shake(20, 300)).toBe(false);
    expect(shake(20, 900)).toBe(false);
    expect(shake(20, 1100)).toBe(false);
    expect(shake(20, 1300)).toBe(true);
    expect(shake(20, 1500)).toBe(false);
  });
});

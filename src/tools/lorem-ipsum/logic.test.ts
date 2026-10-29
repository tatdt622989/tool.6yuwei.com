import { describe, expect, it } from 'vitest';
import { JA_SENTENCES, LATIN_WORDS, ZH_SENTENCES } from './corpus';
import { clampCount, generateLorem, visibleLength, type LoremOptions } from './logic';

const base: LoremOptions = { lang: 'zh', unit: 'paragraphs', count: 3, classicStart: true, html: false };

/** Small deterministic PRNG so tests are repeatable. */
function seeded(seed = 1) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

describe('corpus', () => {
  it('follows the rules the generator relies on', () => {
    expect(ZH_SENTENCES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(ZH_SENTENCES).size).toBe(ZH_SENTENCES.length);
    for (const s of ZH_SENTENCES) {
      expect(s).toMatch(/[。？！]$/);
      expect(s).not.toMatch(/[A-Za-z0-9「」“”]/);
      expect(s).not.toMatch(/[\p{P}]{2}/u);
      expect(s).toMatch(/^\p{Script=Han}/u);
    }
    expect(new Set(LATIN_WORDS).size).toBe(LATIN_WORDS.length);
  });
});

describe('Chinese', () => {
  it('generates the requested number of paragraphs', () => {
    const text = generateLorem({ ...base, count: 4 }, seeded());
    expect(text.split('\n\n')).toHaveLength(4);
  });

  it('generates the requested number of sentences', () => {
    const text = generateLorem({ ...base, unit: 'sentences', count: 7 }, seeded());
    expect(text.match(/[。？！]/g)).toHaveLength(7);
  });

  it('does not repeat a sentence before the corpus is exhausted', () => {
    const text = generateLorem({ ...base, unit: 'sentences', count: ZH_SENTENCES.length }, seeded(3));
    const sentences = text.match(/[^。？！]+[。？！]/g)!;
    expect(new Set(sentences).size).toBe(ZH_SENTENCES.length);
  });

  it('produces exactly N characters ending with a full stop', () => {
    for (const count of [1, 2, 3, 10, 57, 100, 333, 1000]) {
      for (let seed = 1; seed < 6; seed++) {
        const text = generateLorem({ ...base, unit: 'chars', count }, seeded(seed));
        expect(Array.from(text)).toHaveLength(count);
        if (count > 1) {
          expect(text.endsWith('。')).toBe(true);
          expect(text).not.toMatch(/\p{P}。$/u);
        }
      }
    }
  });

  it('ignores the words unit', () => {
    const text = generateLorem({ ...base, unit: 'words', count: 2 }, seeded());
    expect(text.split('\n\n')).toHaveLength(2);
  });
});

describe('Japanese', () => {
  const ja: LoremOptions = { ...base, lang: 'ja' };

  it('has a corpus that follows the same rules', () => {
    expect(JA_SENTENCES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(JA_SENTENCES).size).toBe(JA_SENTENCES.length);
    for (const s of JA_SENTENCES) {
      expect(s).toMatch(/[。？！]$/);
      expect(s).not.toMatch(/[A-Za-z0-9「」“”]/);
      expect(s).not.toMatch(/[\p{P}]{2}/u);
      expect(s).toMatch(/[\p{Script=Hiragana}]/u);
    }
  });

  it('generates Japanese paragraphs and sentences, not Chinese ones', () => {
    const paragraphs = generateLorem({ ...ja, count: 3 }, seeded());
    expect(paragraphs.split('\n\n')).toHaveLength(3);
    expect(paragraphs).toMatch(/\p{Script=Hiragana}/u);
    const text = generateLorem({ ...ja, unit: 'sentences', count: 5 }, seeded(2));
    const sentences = text.match(/[^。？！]+[。？！]/g)!;
    expect(sentences).toHaveLength(5);
    for (const sentence of sentences) expect(JA_SENTENCES).toContain(sentence);
  });

  it('produces exactly N characters ending with 。', () => {
    for (const count of [1, 2, 40, 200, 400, 1000]) {
      const text = generateLorem({ ...ja, unit: 'chars', count }, seeded(count));
      expect(Array.from(text)).toHaveLength(count);
      if (count > 1) expect(text).toMatch(/[^\p{P}]。$/u);
    }
  });

  it('ignores the words unit', () => {
    expect(generateLorem({ ...ja, unit: 'words', count: 2 }, seeded()).split('\n\n')).toHaveLength(2);
  });
});

describe('Latin', () => {
  const la: LoremOptions = { ...base, lang: 'la' };

  it('starts with the classic opening when asked', () => {
    expect(generateLorem({ ...la, count: 1 }, seeded())).toMatch(/^Lorem ipsum dolor sit amet, consectetur adipiscing elit\./);
    expect(generateLorem({ ...la, count: 1, classicStart: false }, seeded())).not.toMatch(/^Lorem ipsum dolor sit amet,/);
  });

  it('generates paragraphs and sentences', () => {
    expect(generateLorem({ ...la, count: 5 }, seeded()).split('\n\n')).toHaveLength(5);
    const text = generateLorem({ ...la, unit: 'sentences', count: 6 }, seeded());
    expect(text.match(/\./g)).toHaveLength(6);
    expect(text).toMatch(/^[A-Z]/);
  });

  it('generates an exact number of words', () => {
    const text = generateLorem({ ...la, unit: 'words', count: 25 }, seeded());
    expect(text.split(' ')).toHaveLength(25);
    expect(text).toMatch(/^Lorem ipsum dolor sit amet consectetur/);
    expect(text.endsWith('.')).toBe(true);
    expect(generateLorem({ ...la, unit: 'words', count: 3 }, seeded())).toBe('Lorem ipsum dolor.');
  });

  it('keeps character output within the limit and on word boundaries', () => {
    for (const count of [1, 5, 20, 100, 500]) {
      const text = generateLorem({ ...la, unit: 'chars', count }, seeded());
      expect(text.length).toBeLessThanOrEqual(Math.max(count, 2));
      expect(text.endsWith('.')).toBe(true);
    }
  });
});

describe('options', () => {
  it('wraps paragraphs in <p> tags', () => {
    const text = generateLorem({ ...base, count: 2, html: true }, seeded());
    expect(text.split('\n')).toHaveLength(2);
    expect(text).toMatch(/^<p>.+<\/p>\n<p>.+<\/p>$/);
  });

  it('clamps counts', () => {
    expect(clampCount('paragraphs', 0)).toBe(1);
    expect(clampCount('paragraphs', 999)).toBe(50);
    expect(clampCount('chars', Number.NaN)).toBe(1);
    expect(clampCount('sentences', 2.7)).toBe(2);
  });

  it('counts visible characters', () => {
    expect(visibleLength('一二\n\n三')).toBe(3);
  });
});

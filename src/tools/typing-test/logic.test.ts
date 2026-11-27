import { describe, expect, it } from 'vitest';
import {
  bestKey,
  buildPassage,
  compareTyped,
  EN_SENTENCES,
  formatClock,
  JA_SENTENCES,
  mergeBest,
  RANK_THRESHOLDS,
  romajiGuide,
  RomajiMatcher,
  romajiOptions,
  RomajiSession,
  sentenceFeed,
  splitKana,
  toHiragana,
  rankOf,
  sameChar,
  scoreOf,
  targetLength,
  TypingSession,
  ZH_SENTENCES,
  type RandomSource,
} from './logic';

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

describe('corpus', () => {
  it('has enough distinct sentences in both languages', () => {
    expect(new Set(ZH_SENTENCES).size).toBe(ZH_SENTENCES.length);
    expect(new Set(EN_SENTENCES).size).toBe(EN_SENTENCES.length);
    expect(ZH_SENTENCES.length).toBeGreaterThanOrEqual(30);
    expect(EN_SENTENCES.length).toBeGreaterThanOrEqual(30);
  });

  it('uses only typeable characters', () => {
    for (const s of ZH_SENTENCES) {
      expect(s).not.toMatch(/[A-Za-z0-9\s]/);
      expect(s.endsWith('。')).toBe(true);
    }
    for (const s of EN_SENTENCES) {
      expect(s).toMatch(/^[\x20-\x7e]+$/); // plain ASCII, no smart quotes
      expect(s).not.toMatch(/\s{2}|^\s|\s$/);
    }
  });
});

describe('buildPassage', () => {
  it('reaches the requested length and joins English with single spaces', () => {
    const p = buildPassage({ lang: 'en', punctuation: true }, 1500, seeded(1));
    expect(p.length).toBeGreaterThanOrEqual(1500);
    expect(p).not.toMatch(/\s{2}/);
    expect(p.startsWith(' ')).toBe(false);
  });

  it('prefixes a space when continuing an English passage', () => {
    expect(buildPassage({ lang: 'en', punctuation: true }, 10, seeded(2), 'previous.').startsWith(' ')).toBe(true);
    expect(buildPassage({ lang: 'zh', punctuation: true }, 10, seeded(2), '之前。').startsWith(' ')).toBe(false);
  });

  it('strips Chinese punctuation when asked', () => {
    const p = buildPassage({ lang: 'zh', punctuation: false }, 300, seeded(3));
    expect(p.length).toBeGreaterThanOrEqual(300);
    expect(p).not.toMatch(/[，。、；：！？]/);
  });

  it('does not repeat a sentence before the corpus is used up', () => {
    const p = buildPassage({ lang: 'zh', punctuation: true }, 200, seeded(4));
    const sentences = p.split('。').filter(Boolean);
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it('sizes passages generously', () => {
    expect(targetLength('zh', 60)).toBe(180);
    expect(targetLength('en', 30)).toBe(420);
  });
});

describe('sameChar / compareTyped', () => {
  it('accepts half-width punctuation for Chinese', () => {
    expect(sameChar(',', '，', 'zh')).toBe(true);
    expect(sameChar('.', '。', 'zh')).toBe(true);
    expect(sameChar('，', '。', 'zh')).toBe(false);
    expect(sameChar(',', '，', 'en')).toBe(false);
  });

  it('accepts smart quotes for English and stays case-sensitive', () => {
    expect(sameChar('’', "'", 'en')).toBe(true);
    expect(sameChar('a', 'A', 'en')).toBe(false);
  });

  it('marks each passage character', () => {
    expect(compareTyped('Thx', 'The cat', 'en')).toEqual([
      'correct',
      'correct',
      'wrong',
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
    expect(compareTyped('天氣很好啊多打的', '天氣', 'zh')).toEqual(['correct', 'correct']);
  });
});

describe('TypingSession', () => {
  it('starts on the first commit and counts new entries only', () => {
    const s = new TypingSession('今天天氣很好。', 'zh', 60_000);
    expect(s.phase).toBe('idle');
    expect(s.commit('今天', 1000)).toEqual({ added: 2, addedErrors: 0 });
    expect(s.phase).toBe('running');
    expect(s.startedAt).toBe(1000);
    // A wrong homophone is committed, then corrected with backspace.
    expect(s.commit('今天田', 2000)).toEqual({ added: 1, addedErrors: 1 });
    expect(s.commit('今天', 2500)).toEqual({ added: 0, addedErrors: 0 });
    expect(s.commit('今天天氣', 3000)).toEqual({ added: 2, addedErrors: 0 });
    expect(s.entries).toBe(5);
    expect(s.errors).toBe(1);
    const r = s.finish(31_000);
    expect(r.correctChars).toBe(4);
    expect(r.uncorrected).toBe(0);
    expect(r.elapsedMs).toBe(30_000);
    expect(r.speed).toBeCloseTo(8); // 4 字 in half a minute
    expect(r.accuracy).toBeCloseTo(80);
  });

  it('can start before the first commit (IME composition begins)', () => {
    const s = new TypingSession('天氣', 'zh', 30_000);
    s.start(500); // compositionstart
    s.commit('天', 1500);
    expect(s.startedAt).toBe(500);
  });

  it('clamps input to the passage and ignores commits after finishing', () => {
    const s = new TypingSession('abc', 'en', 10_000);
    s.commit('abcdef', 0);
    expect(s.committed).toBe('abc');
    s.finish(20_000);
    expect(s.commit('abx', 21_000)).toEqual({ added: 0, addedErrors: 0 });
    expect(s.result(99_999).elapsedMs).toBe(10_000);
  });

  it('reports the end of time and remaining time', () => {
    const s = new TypingSession('hello world', 'en', 30_000);
    expect(s.remaining(0)).toBe(30_000);
    s.start(1000);
    expect(s.remaining(11_000)).toBe(20_000);
    expect(s.isOver(30_999)).toBe(false);
    expect(s.isOver(31_000)).toBe(true);
    expect(s.remaining(99_000)).toBe(0);
  });

  it('can be extended while running', () => {
    const s = new TypingSession('ab', 'en', 30_000);
    s.extend(' cd');
    s.commit('ab cd', 0);
    expect(s.committed).toBe('ab cd');
  });
});

describe('scoring', () => {
  it('computes WPM the standard way (5 characters per word)', () => {
    const r = scoreOf({ lang: 'en', correctChars: 250, typedChars: 260, entries: 270, errors: 20, elapsedMs: 60_000 });
    expect(r.speed).toBe(50);
    expect(r.rawWpm).toBe(52);
    expect(r.cpm).toBe(250);
    expect(r.uncorrected).toBe(10);
    expect(r.accuracy).toBeCloseTo((250 / 270) * 100);
  });

  it('computes 字/分 for Chinese', () => {
    const r = scoreOf({ lang: 'zh', correctChars: 90, typedChars: 92, entries: 95, errors: 5, elapsedMs: 120_000 });
    expect(r.speed).toBe(45);
    expect(r.rawWpm).toBe(0);
  });

  it('handles empty and very short attempts', () => {
    const r = scoreOf({ lang: 'en', correctChars: 0, typedChars: 0, entries: 0, errors: 0, elapsedMs: 0 });
    expect(r.speed).toBe(0);
    expect(r.accuracy).toBe(100);
    expect(scoreOf({ lang: 'zh', correctChars: 2, typedChars: 2, entries: 2, errors: 0, elapsedMs: 10 }).speed).toBe(120);
  });

  it('ranks speeds', () => {
    expect(rankOf('en', 0).label).toBe('起步練習中');
    expect(rankOf('en', 40).label).toBe('熟練');
    expect(rankOf('en', 130).label).toBe('神速');
    expect(rankOf('zh', 29.9).label).toBe('入門');
    expect(rankOf('zh', 50).label).toBe('快手');
  });

  it('keeps the best score per language and duration', () => {
    const key = bestKey('zh', 60);
    expect(key).toBe('zh-60');
    const first = mergeBest({}, key, { speed: 40.4, accuracy: 96.6 }, '2026-10-29');
    expect(first.isNew).toBe(true);
    expect(first.best[key]).toEqual({ speed: 40, accuracy: 97, date: '2026-10-29' });
    expect(mergeBest(first.best, key, { speed: 39, accuracy: 100 }, 'x').isNew).toBe(false);
    expect(mergeBest(first.best, key, { speed: 40.2, accuracy: 100 }, 'x').isNew).toBe(false);
    expect(mergeBest(first.best, key, { speed: 41, accuracy: 90 }, 'x').best[key].speed).toBe(41);
    expect(mergeBest({}, key, { speed: 0, accuracy: 0 }, 'x').isNew).toBe(false);
  });

  it('formats the countdown', () => {
    expect(formatClock(120_000)).toBe('2:00');
    expect(formatClock(59_001)).toBe('1:00');
    expect(formatClock(4_200)).toBe('0:05');
    expect(formatClock(-5)).toBe('0:00');
  });
});

// ---------- Japanese romaji input ----------

/** Types a whole string; returns the results of each key. */
function typeAll(m: RomajiMatcher, keys: string) {
  return [...keys].map((k) => m.input(k));
}

function accepts(kana: string, romaji: string): boolean {
  const m = new RomajiMatcher(kana);
  const results = typeAll(m, romaji);
  return !results.includes('miss') && m.done;
}

describe('splitKana / toHiragana', () => {
  it('groups contracted sounds and keeps other kana single', () => {
    expect(splitKana('しゃしん')).toEqual(['しゃ', 'し', 'ん']);
    expect(splitKana('きょうは')).toEqual(['きょ', 'う', 'は']);
    expect(splitKana('ふぁみれす')).toEqual(['ふぁ', 'み', 'れ', 'す']);
    expect(splitKana('いっしょ')).toEqual(['い', 'っ', 'しょ']);
  });

  it('converts katakana to hiragana and keeps the long-vowel mark', () => {
    expect(toHiragana('コーヒー')).toBe('こーひー');
    expect(splitKana('キーボード')).toEqual(['き', 'ー', 'ぼ', 'ー', 'ど']);
  });
});

describe('RomajiMatcher: accepted spellings', () => {
  it.each([
    ['し', ['shi', 'si', 'ci']],
    ['ち', ['chi', 'ti']],
    ['つ', ['tsu', 'tu']],
    ['ふ', ['fu', 'hu']],
    ['じ', ['ji', 'zi']],
    ['か', ['ka', 'ca']],
    ['しゃ', ['sha', 'sya', 'shixya', 'silya']],
    ['ちゃ', ['cha', 'tya', 'cya', 'chixya']],
    ['じょ', ['jo', 'jyo', 'zyo', 'jixyo']],
    ['きゃ', ['kya', 'kixya']],
    ['ふぁ', ['fa', 'fuxa', 'hula']],
    ['てぃ', ['thi', 'texi']],
    ['を', ['wo']],
    ['こーひー', ['ko-hi-']],
  ])('%s', (kana, spellings) => {
    for (const r of spellings) expect(accepts(kana, r), r).toBe(true);
  });

  it('accepts a single n before consonants but requires nn before vowels, n and y', () => {
    expect(accepts('かんたん', 'kantann')).toBe(true);
    expect(accepts('かんたん', 'kanntann')).toBe(true);
    expect(accepts('きんようび', 'kinnyoubi')).toBe(true);
    expect(accepts('きんようび', 'kinyoubi')).toBe(false); // would read as きにょうび
    expect(accepts('かんい', 'kanni')).toBe(true);
    expect(accepts('かんい', 'kani')).toBe(false);
    expect(accepts('こんにちは', 'konnnichiha')).toBe(true);
    expect(accepts('こんにちは', 'konnichiha')).toBe(false);
    expect(accepts('でんわ', 'denwa')).toBe(true);
    expect(accepts('ほん', 'honn')).toBe(true);
    expect(accepts('ほん', 'hoxn')).toBe(true);
  });

  it('requires nn for ん at the end of a sentence', () => {
    const m = new RomajiMatcher('ほん');
    typeAll(m, 'hon');
    expect(m.done).toBe(false);
    expect(m.input('n')).toBe('done');
  });

  it('accepts っ as a doubled consonant or xtu / ltu / xtsu', () => {
    for (const r of ['itte', 'ixtute', 'iltute', 'ixtsute', 'iltsute']) expect(accepts('いって', r), r).toBe(true);
    for (const r of ['matchi', 'macchi', 'matti']) expect(accepts('まっち', r), r).toBe(true);
    expect(accepts('いっしょ', 'issho')).toBe(true);
    expect(accepts('いっしょ', 'issyo')).toBe(true);
    expect(accepts('いっしょ', 'ixtusho')).toBe(true);
    expect(accepts('しっかり', 'shikkari')).toBe(true);
  });

  it('does not double vowels or n for っ', () => {
    expect(romajiOptions(splitKana('っあ'), 0).map((o) => o.romaji)).toEqual(['xtu', 'ltu', 'xtsu', 'ltsu']);
  });

  it('counts wrong keys as misses without advancing', () => {
    const m = new RomajiMatcher('すし');
    expect(m.input('s')).toBe('ok');
    expect(m.input('a')).toBe('miss');
    expect(m.typed).toBe('s');
    expect(m.input('u')).toBe('ok');
    expect(m.kanaDone).toBe(1);
    expect(typeAll(m, 'shi')).toEqual(['ok', 'ok', 'done']);
  });

  it('is case-insensitive', () => {
    expect(accepts('すし', 'SuShI')).toBe(true);
  });

  it('shows the preferred spelling and follows the one already started', () => {
    expect(romajiGuide('しんかんせん')).toBe('shinkansenn');
    expect(romajiGuide('きんようび')).toBe('kinnyoubi');
    expect(romajiGuide('いっしょにちゃーはん')).toBe('isshonicha-hann');
    const m = new RomajiMatcher('しんかんせん');
    typeAll(m, 'si');
    expect(m.typed).toBe('si');
    expect(m.rest()).toBe('nkansenn');
    const t = new RomajiMatcher('ちゃ');
    t.input('t');
    expect(t.rest()).toBe('ya');
  });
});

describe('JA_SENTENCES', () => {
  it('has enough sentences, each fully typable with its guide and only known kana', () => {
    expect(JA_SENTENCES.length).toBeGreaterThanOrEqual(30);
    for (const s of JA_SENTENCES) {
      expect(s.kana, s.text).toMatch(/^[ぁ-んー]+$/);
      const m = new RomajiMatcher(s.kana);
      const guide = m.rest();
      expect(guide, s.kana).toMatch(/^[a-z-]+$/);
      expect(typeAll(m, guide).includes('miss'), s.kana).toBe(false);
      expect(m.done, s.kana).toBe(true);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(JA_SENTENCES.map((s) => s.kana)).size).toBe(JA_SENTENCES.length);
  });
});

describe('RomajiSession', () => {
  const fixed = (...kana: string[]) => {
    let i = 0;
    return () => ({ text: kana[i % kana.length], kana: kana[i++ % kana.length] });
  };

  it('starts on the first key and loads the next sentence when one is finished', () => {
    const s = new RomajiSession(fixed('すし', 'ねこ'), 60_000);
    expect(s.phase).toBe('idle');
    expect(s.key('s', 1000)).toBe('ok');
    expect(s.phase).toBe('running');
    expect(s.startedAt).toBe(1000);
    for (const k of 'ushi') s.key(k, 2000);
    expect(s.completed).toBe(1);
    expect(s.sentence.kana).toBe('ねこ');
    expect(s.keys).toBe(5);
  });

  it('scores keystrokes per minute and accuracy from misses', () => {
    const s = new RomajiSession(fixed('あいうえお'), 60_000);
    s.key('a', 0);
    s.key('x', 0); // miss
    for (const k of 'iueo') s.key(k, 0);
    const r = s.finish(30_000);
    expect(r.lang).toBe('ja');
    expect(r.correctChars).toBe(5);
    expect(r.errors).toBe(1);
    expect(r.speed).toBeCloseTo(10); // 5 keys in 0.5 min
    expect(r.accuracy).toBeCloseTo((5 / 6) * 100);
  });

  it('stops at the time limit and ignores keys afterwards', () => {
    const s = new RomajiSession(fixed('あいうえお'), 30_000);
    s.key('a', 0);
    expect(s.isOver(30_000)).toBe(true);
    s.finish(45_000);
    expect(s.elapsed(99_000)).toBe(30_000);
    expect(s.key('i', 46_000)).toBe('ignored');
    expect(s.keys).toBe(1);
  });

  it('reports 100% accuracy before any key', () => {
    expect(new RomajiSession(fixed('あ'), 30_000).result(0).accuracy).toBe(100);
  });
});

describe('sentenceFeed', () => {
  it('cycles through every item before repeating', () => {
    const next = sentenceFeed([1, 2, 3, 4], seeded(7));
    const first = [next(), next(), next(), next()];
    expect([...first].sort()).toEqual([1, 2, 3, 4]);
    const fifth = next();
    expect(fifth).not.toBe(first[3]);
  });
});

describe('ja ranks', () => {
  it('uses keystrokes per minute thresholds', () => {
    expect(RANK_THRESHOLDS.ja.length).toBe(RANK_THRESHOLDS.zh.length);
    expect(rankOf('ja', 0).level).toBe(0);
    expect(rankOf('ja', 150).level).toBe(2);
    expect(rankOf('ja', 400).level).toBe(5);
  });
});

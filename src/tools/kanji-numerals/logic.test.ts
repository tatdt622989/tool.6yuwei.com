import { describe, expect, it } from 'vitest';
import {
  MAX_VALUE,
  parseArabic,
  parseJapaneseNumber,
  toAmount,
  toDaiji,
  toKanji,
  toMixed,
  toPositional,
} from './logic';

const ok = (s: string) => {
  const r = parseJapaneseNumber(s);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe('toKanji', () => {
  it('writes small numbers without 一 before 十・百', () => {
    expect(toKanji(0n)).toBe('〇');
    expect(toKanji(7n)).toBe('七');
    expect(toKanji(10n)).toBe('十');
    expect(toKanji(11n)).toBe('十一');
    expect(toKanji(20n)).toBe('二十');
    expect(toKanji(105n)).toBe('百五');
    expect(toKanji(110n)).toBe('百十');
  });

  it('handles 千 with and without 一', () => {
    expect(toKanji(1000n)).toBe('千');
    expect(toKanji(1000n, { ichiBeforeSen: true })).toBe('一千');
    expect(toKanji(1100n)).toBe('千百');
    expect(toKanji(10_000_000n)).toBe('千万');
    expect(toKanji(10_000_000n, { ichiBeforeSen: true })).toBe('一千万');
  });

  it('always writes 一 before 万・億・兆・京', () => {
    expect(toKanji(10_000n)).toBe('一万');
    expect(toKanji(100_000_000n)).toBe('一億');
    expect(toKanji(10n ** 12n)).toBe('一兆');
    expect(toKanji(10n ** 16n)).toBe('一京');
  });

  it('skips empty groups', () => {
    expect(toKanji(12_345n)).toBe('一万二千三百四十五');
    expect(toKanji(100_000_001n)).toBe('一億一');
    expect(toKanji(2_026n)).toBe('二千二十六');
    expect(toKanji(123_456_789n)).toBe('一億二千三百四十五万六千七百八十九');
  });

  it('rejects out-of-range numbers', () => {
    expect(() => toKanji(-1n)).toThrow();
    expect(() => toKanji(MAX_VALUE + 1n)).toThrow();
    expect(toKanji(MAX_VALUE)).toBe('九千九百九十九京九千九百九十九兆九千九百九十九億九千九百九十九万九千九百九十九');
  });
});

describe('toDaiji (大字)', () => {
  it('uses 壱 弐 参 拾 and 萬, always with 壱 before units', () => {
    expect(toDaiji(10_000n)).toBe('壱萬');
    expect(toDaiji(30_000n)).toBe('参萬');
    expect(toDaiji(50_000n)).toBe('伍萬');
    expect(toDaiji(100_000n)).toBe('壱拾萬');
    expect(toDaiji(12_345n)).toBe('壱萬弐千参百四拾伍');
    expect(toDaiji(10n)).toBe('壱拾');
  });

  it('full set uses old forms for every digit and unit', () => {
    expect(toDaiji(12_345n, 'full')).toBe('壱萬弐阡参佰肆拾伍');
    expect(toDaiji(6_789n, 'full')).toBe('陸阡漆佰捌拾玖');
    expect(toDaiji(0n, 'full')).toBe('零');
  });

  it('keeps 億・兆 as is', () => {
    expect(toDaiji(100_000_000n)).toBe('壱億');
    expect(toDaiji(123_450_000n)).toBe('壱億弐千参百四拾伍萬');
  });
});

describe('toAmount (祝儀袋・領収書)', () => {
  it('formats envelope and receipt amounts', () => {
    expect(toAmount(30_000n)).toBe('金参萬円');
    expect(toAmount(10_000n, 'common', { nari: true })).toBe('金壱萬円也');
    expect(toAmount(50_000n, 'common', { yen: '圓' })).toBe('金伍萬圓');
    expect(toAmount(1_234_000n, 'common', { nari: true })).toBe('金壱百弐拾参萬四千円也');
  });
});

describe('toPositional / toMixed', () => {
  it('writes digit by digit for vertical text', () => {
    expect(toPositional(2026n)).toBe('二〇二六');
    expect(toPositional(105n)).toBe('一〇五');
  });

  it('uses 万・億 units with arabic digits', () => {
    expect(toMixed(123_456_789n)).toBe('1億2345万6789');
    expect(toMixed(30_000n)).toBe('3万');
    expect(toMixed(100_000_001n)).toBe('1億1');
    expect(toMixed(0n)).toBe('0');
  });
});

describe('parseJapaneseNumber', () => {
  it('parses positional kanji numerals', () => {
    expect(ok('一万二千三百四十五')).toBe(12_345n);
    expect(ok('千二十')).toBe(1_020n);
    expect(ok('一千万')).toBe(10_000_000n);
    expect(ok('十二万')).toBe(120_000n);
    expect(ok('一億一')).toBe(100_000_001n);
  });

  it('parses daiji and old forms', () => {
    expect(ok('壱萬弐阡参佰肆拾伍')).toBe(12_345n);
    expect(ok('金壱萬円也')).toBe(10_000n);
    expect(ok('金参萬圓')).toBe(30_000n);
    expect(ok('貳萬')).toBe(20_000n);
    expect(ok('壱拾萬')).toBe(100_000n);
  });

  it('parses digit-by-digit numerals and arabic digits', () => {
    expect(ok('二〇二六')).toBe(2_026n);
    expect(ok('２０２６')).toBe(2_026n);
    expect(ok('12,345')).toBe(12_345n);
  });

  it('parses mixed arabic and kanji', () => {
    expect(ok('3万5千')).toBe(35_000n);
    expect(ok('1億2345万6789')).toBe(123_456_789n);
    expect(ok('５万円')).toBe(50_000n);
  });

  it('round-trips every style', () => {
    for (const n of [1n, 10n, 1_000n, 10_101n, 20_260_429n, 9_007_199_254_740_993n, MAX_VALUE]) {
      expect(ok(toKanji(n))).toBe(n);
      expect(ok(toKanji(n, { ichiBeforeSen: true }))).toBe(n);
      expect(ok(toDaiji(n))).toBe(n);
      expect(ok(toDaiji(n, 'full'))).toBe(n);
      expect(ok(toMixed(n))).toBe(n);
      expect(ok(toPositional(n))).toBe(n);
    }
  });

  it('reports errors', () => {
    expect(parseJapaneseNumber('').ok).toBe(false);
    expect(parseJapaneseNumber('abc').ok).toBe(false);
    expect(parseJapaneseNumber('万').ok).toBe(false);
    expect(parseJapaneseNumber('一万一億').ok).toBe(false);
    expect(parseJapaneseNumber('十百').ok).toBe(false);
    expect(parseJapaneseNumber('12345万').ok).toBe(false);
  });
});

describe('parseArabic', () => {
  it('accepts commas and full-width digits only', () => {
    expect(parseArabic('1,234')).toBe(1234n);
    expect(parseArabic('１２３')).toBe(123n);
    expect(parseArabic('一二三')).toBeNull();
    expect(parseArabic('')).toBeNull();
  });
});

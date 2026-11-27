import { Converter } from 'opencc-js/t2cn';
import { pinyin } from 'pinyin-pro';
import { describe, expect, it } from 'vitest';
import {
  MAX_PASSPORT_LETTERS,
  SYLLABLES,
  bopomofo,
  contextReadings,
  formatPassportName,
  isKnownSyllable,
  normalizePinyin,
  orderReadings,
  passportLength,
  romanizeSyllable,
  segmentName,
  simplifiedForLookup,
  spellings,
  type NameSyllable,
  type PinyinFn,
  type Simplify,
  type System,
} from './logic';

const syl = (...keys: string[]): NameSyllable[] => keys.map((key) => ({ key }));
const name = (surname: string[], given: string[], system: System, hyphen = true) =>
  formatPassportName(syl(...surname), syl(...given), system, { hyphen });

describe('official 領事事務局 syllable table', () => {
  it('contains all 409 rows with a 注音 and three spellings each', () => {
    expect(Object.keys(SYLLABLES)).toHaveLength(409);
    for (const [key, row] of Object.entries(SYLLABLES)) {
      expect(key).toMatch(/^[a-z]+$/);
      expect(row[0]).toMatch(/^[ㄅ-ㄩ]+$/);
      for (const cell of row.slice(1)) expect(cell).toMatch(/^[A-Z]+(\/[A-Z]+)?$/);
    }
  });

  it('matches well-known Taiwan passport spellings in Wade-Giles', () => {
    const wg = (k: string) => romanizeSyllable({ key: k }, 'wg');
    expect(wg('zhang')).toBe('CHANG');
    expect(wg('xu')).toBe('HSU');
    expect(wg('cai')).toBe('TSAI');
    expect(wg('xie')).toBe('HSIEH');
    expect(wg('guo')).toBe('KUO');
    expect(wg('zeng')).toBe('TSENG');
    expect(wg('zhou')).toBe('CHOU');
    expect(wg('zhi')).toBe('CHIH');
    expect(wg('qiu')).toBe('CHIU'); // 邱: apostrophe of Ch'iu is dropped
    expect(wg('lv')).toBe('LU'); // 呂: umlaut dropped
    expect(wg('ri')).toBe('JIH');
    expect(wg('si')).toBe('SSU');
    expect(wg('er')).toBe('ERH');
  });

  it('lists WG alternatives (HE or HO, YI or I)', () => {
    expect(spellings('he', 'wg')).toEqual(['HE', 'HO']);
    expect(spellings('yi', 'wg')).toEqual(['YI', 'I']);
    expect(romanizeSyllable({ key: 'he', wgVariant: 1 }, 'wg')).toBe('HO');
    expect(romanizeSyllable({ key: 'he', wgVariant: 1 }, 'hanyu')).toBe('HE');
  });

  it('handles ü syllables per system', () => {
    expect(spellings('lv', 'hanyu')).toEqual(['LU']);
    expect(spellings('lv', 'tongyong')).toEqual(['LYU']);
    expect(spellings('lv', 'mps2')).toEqual(['LIU']);
    expect(spellings('nv', 'tongyong')).toEqual(['NYU']);
    expect(spellings('xu', 'tongyong')).toEqual(['SYU']);
    expect(spellings('ju', 'mps2')).toEqual(['JIU']);
  });

  it('falls back to upper-case pinyin for syllables outside the table', () => {
    expect(isKnownSyllable('hng')).toBe(false);
    expect(spellings('hng', 'wg')).toEqual(['HNG']);
    expect(bopomofo('xuan')).toBe('ㄒㄩㄢ');
    expect(bopomofo('hng')).toBe('');
  });
});

describe('formatPassportName', () => {
  it('陳怡萱 in all four systems', () => {
    expect(name(['chen'], ['yi', 'xuan'], 'hanyu')).toBe('CHEN, YI-XUAN');
    expect(name(['chen'], ['yi', 'xuan'], 'wg')).toBe('CHEN, YI-HSUAN');
    expect(name(['chen'], ['yi', 'xuan'], 'tongyong')).toBe('CHEN, YI-SYUAN');
    expect(name(['chen'], ['yi', 'xuan'], 'mps2')).toBe('CHEN, YI-SHIUAN');
  });

  it('張志明', () => {
    expect(name(['zhang'], ['zhi', 'ming'], 'wg')).toBe('CHANG, CHIH-MING');
    expect(name(['zhang'], ['zhi', 'ming'], 'hanyu')).toBe('ZHANG, ZHI-MING');
    expect(name(['zhang'], ['zhi', 'ming'], 'tongyong')).toBe('JHANG, JHIH-MING');
    expect(name(['zhang'], ['zhi', 'ming'], 'mps2')).toBe('JANG, JR-MING');
  });

  it('writes compound surnames together and can omit the hyphen', () => {
    expect(name(['ou', 'yang'], ['xiu'], 'wg')).toBe('OUYANG, HSIU');
    expect(name(['lin'], ['jia', 'hui'], 'hanyu', false)).toBe('LIN, JIAHUI');
  });

  it('handles a missing part and literal Latin text', () => {
    expect(name(['lin'], [], 'hanyu')).toBe('LIN');
    expect(name([], ['ming'], 'hanyu')).toBe('MING');
    const n = formatPassportName(syl('wang'), [{ key: 'Amy', literal: true }], 'wg', { hyphen: true });
    expect(n).toBe('WANG, AMY');
  });

  it('counts letters toward the 39-letter limit', () => {
    expect(passportLength('CHEN, YI-HSUAN')).toBe(14);
    expect(MAX_PASSPORT_LETTERS).toBe(39);
  });
});

describe('input helpers', () => {
  it('normalizes pinyin spellings', () => {
    expect(normalizePinyin('lǚ')).toBe('lv');
    expect(normalizePinyin('lü')).toBe('lv');
    expect(normalizePinyin('nu:3')).toBe('nv');
    expect(normalizePinyin('Xuān')).toBe('xuan');
    expect(normalizePinyin('zhang1')).toBe('zhang');
  });

  it('segments Chinese characters and Latin runs', () => {
    expect(segmentName('陳 怡萱')).toEqual([
      { kind: 'han', char: '陳' },
      { kind: 'han', char: '怡' },
      { kind: 'han', char: '萱' },
    ]);
    expect(segmentName('王Amy')).toEqual([
      { kind: 'han', char: '王' },
      { kind: 'latin', text: 'Amy' },
    ]);
    expect(segmentName('、。')).toEqual([]);
  });

  it('orders heteronym readings with the preferred one first', () => {
    expect(orderReadings('shan', ['dan', 'shan', 'chan'])).toEqual(['shan', 'dan', 'chan']);
    expect(orderReadings(undefined, ['lǚ'])).toEqual(['lv']);
    expect(orderReadings('hng', ['hng'])).toEqual(['hng']);
    expect(orderReadings('n', ['n', 'en'])).toEqual(['en']);
  });
});

describe('context readings via Traditional → Simplified conversion', () => {
  const opts = { toneType: 'none', type: 'array', v: true } as const;
  const pinyinFn: PinyinFn = (t, surname) => (surname ? pinyin(t, { ...opts, mode: 'surname' }) : pinyin(t, opts));
  const simplify = Converter({ from: 'tw', to: 'cn' }) as Simplify;

  it('fixes heteronyms that pinyin-pro only knows in Simplified words', () => {
    // Without conversion pinyin-pro misses the word entries and falls back to the common reading.
    expect(contextReadings('重陽', false, pinyinFn)).toEqual(['zhong', 'yang']);
    expect(contextReadings('重陽', false, pinyinFn, simplify)).toEqual(['chong', 'yang']);
    expect(contextReadings('重慶', false, pinyinFn, simplify)).toEqual(['chong', 'qing']);
    expect(contextReadings('音樂', false, pinyinFn, simplify)).toEqual(['yin', 'yue']);
    expect(contextReadings('銀行', false, pinyinFn, simplify)).toEqual(['yin', 'hang']);
  });

  it('王重陽 romanizes with the corrected reading', () => {
    const given = contextReadings('重陽', false, pinyinFn, simplify).map((key) => ({ key }));
    const surname = contextReadings('王', true, pinyinFn, simplify).map((key) => ({ key }));
    expect(formatPassportName(surname, given, 'hanyu', { hyphen: true })).toBe('WANG, CHONG-YANG');
    expect(formatPassportName(surname, given, 'wg', { hyphen: true })).toBe('WANG, CHUNG-YANG');
  });

  it('keeps surname mode on the converted text', () => {
    expect(contextReadings('曾', true, pinyinFn, simplify)).toEqual(['zeng']);
    expect(contextReadings('陳怡萱', false, pinyinFn, simplify)).toEqual(['chen', 'yi', 'xuan']);
  });

  it('falls back to the original text when conversion changes the length or fails', () => {
    expect(simplifiedForLookup('重陽', simplify)).toBe('重阳');
    expect(simplifiedForLookup('重陽', () => '重阳阳')).toBe('重陽');
    expect(
      simplifiedForLookup('重陽', () => {
        throw new Error('boom');
      }),
    ).toBe('重陽');
    expect(simplifiedForLookup('', simplify)).toBe('');
    expect(contextReadings('重陽', false, pinyinFn, () => 'x')).toEqual(['zhong', 'yang']);
    expect(contextReadings('', false, pinyinFn, simplify)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { EXCEPTIONS, STYLES, convertAll, hasUnconvertible } from './logic';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const style = (id: string) => STYLES.find((s) => s.id === id)!;

describe('Mathematical Alphanumeric styles', () => {
  const mathStyles = [
    'bold',
    'italic',
    'bold-italic',
    'script',
    'bold-script',
    'fraktur',
    'bold-fraktur',
    'double-struck',
    'sans',
    'sans-bold',
    'sans-italic',
    'sans-bold-italic',
    'monospace',
  ];

  it.each(mathStyles)('%s maps every letter to an assigned, distinct letter', (id) => {
    const out = Array.from(style(id).convert(LETTERS));
    expect(out).toHaveLength(52);
    for (const ch of out) {
      // Reserved (unassigned) code points in the math block would fail \p{L}.
      expect(ch).toMatch(/^\p{L}$/u);
      expect(LETTERS.includes(ch)).toBe(false);
    }
    expect(new Set(out).size).toBe(52);
  });

  it('known reference characters', () => {
    expect(style('bold').convert('Ab1')).toBe('𝐀𝐛𝟏');
    expect(style('italic').convert('h')).toBe('ℎ');
    expect(style('script').convert('BEFHILMR')).toBe('ℬℰℱℋℐℒℳℛ');
    expect(style('script').convert('ego')).toBe('ℯℊℴ');
    expect(style('script').convert('A')).toBe('𝒜');
    expect(style('fraktur').convert('CHIRZ')).toBe('ℭℌℑℜℨ');
    expect(style('double-struck').convert('CHNPQRZ')).toBe('ℂℍℕℙℚℝℤ');
    expect(style('double-struck').convert('A1')).toBe('𝔸𝟙');
    expect(style('monospace').convert('code 42')).toBe('𝚌𝚘𝚍𝚎 𝟺𝟸');
    expect(style('sans-bold').convert('IG')).toBe('𝗜𝗚');
  });

  it('every exception points into Letterlike Symbols', () => {
    for (const table of Object.values(EXCEPTIONS)) {
      for (const cp of Object.values(table)) {
        expect(cp).toBeGreaterThanOrEqual(0x2100);
        expect(cp).toBeLessThanOrEqual(0x214f);
      }
    }
  });

  it('digits use the mathematical digit block where it exists', () => {
    for (const id of ['bold', 'double-struck', 'sans', 'sans-bold', 'monospace']) {
      for (const ch of Array.from(style(id).convert(DIGITS))) expect(ch).toMatch(/^\p{Nd}$/u);
    }
    // No italic digits exist in Unicode: they stay plain.
    expect(style('italic').convert('2026')).toBe('2026');
  });
});

describe('other styles', () => {
  it('circled, negative circled, squared and parenthesized', () => {
    expect(style('circled').convert('Ab0 9')).toBe('Ⓐⓑ⓪ ⑨');
    expect(style('negative-circled').convert('ab1')).toBe('🅐🅑❶');
    expect(style('squared').convert('Ok')).toBe('🄾🄺');
    expect(style('parenthesized').convert('ab1')).toBe('⒜⒝⑴');
  });

  it('small caps, superscript and fullwidth', () => {
    expect(style('small-caps').convert('Hello')).toBe('ʜᴇʟʟᴏ');
    expect(style('superscript').convert('x2+1')).toBe('ˣ²⁺¹');
    expect(style('fullwidth').convert('IG 2026!')).toBe('ＩＧ　２０２６！');
  });

  it('combining strike-through and underline', () => {
    expect(style('strike').convert('ab')).toBe('a̶b̶');
    expect(style('underline').convert('a\nb')).toBe('a̲\nb̲');
  });

  it('upside down reverses the order', () => {
    expect(style('upside-down').convert('Hello!')).toBe('¡ollǝH');
    expect(style('upside-down').convert('69')).toBe('69');
  });

  it('leaves Chinese untouched and reports it', () => {
    expect(style('bold').convert('早安 IG')).toBe('早安 𝐈𝐆');
    expect(hasUnconvertible('早安 IG')).toBe(true);
    expect(hasUnconvertible('Hello 2026')).toBe(false);
  });

  it('convertAll returns one output per style and no emoji presentation characters', () => {
    const all = convertAll(LETTERS + DIGITS);
    expect(all).toHaveLength(STYLES.length);
    for (const { output } of all) expect(output).not.toMatch(/\p{Emoji_Presentation}/u);
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(STYLES.length);
  });
});

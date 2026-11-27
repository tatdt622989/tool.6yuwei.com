import { describe, expect, it } from 'vitest';
import {
  applyConversion,
  convertText,
  isZhMode,
  loadConverter,
  localesFor,
  swapMode,
  toCornerQuotes,
  toCurlyQuotes,
  type ZhOptions,
} from './logic';
import { toCommonGlyphs } from './logic';

const opts = (mode: ZhOptions['mode'], phrases = true, quotes = false): ZhOptions => ({ mode, phrases, quotes });

describe('localesFor', () => {
  it('maps directions to opencc locales', () => {
    expect(localesFor('s2t', true)).toEqual({ from: 'cn', to: 'twp' });
    expect(localesFor('s2t', false)).toEqual({ from: 'cn', to: 'tw' });
    expect(localesFor('t2s', true)).toEqual({ from: 'twp', to: 'cn' });
    expect(localesFor('t2s', false)).toEqual({ from: 'tw', to: 'cn' });
  });
});

describe('convertText', () => {
  it('converts simplified to Taiwan traditional with vocabulary', async () => {
    expect(await convertText('这个软件的网络连接有问题', opts('s2t'))).toBe('這個軟體的網路連線有問題');
    expect(await convertText('鼠标和自行车', opts('s2t'))).toBe('滑鼠和腳踏車');
  });

  it('keeps vocabulary when phrase conversion is off', async () => {
    expect(await convertText('这个软件的网络', opts('s2t', false))).toBe('這個軟件的網絡');
  });

  it('converts traditional to simplified', async () => {
    expect(await convertText('這個軟體的網路連線', opts('t2s'))).toBe('这个软件的网络连接');
    expect(await convertText('這個軟體的網路', opts('t2s', false))).toBe('这个软体的网路');
  });

  it('normalizes Hong Kong variants and mainland vocabulary to Taiwan forms', async () => {
    expect(await convertText('裏面的綫，衞生，爲什麼', opts('normalize'))).toBe('裡面的線，衛生，為什麼');
    expect(await convertText('打印機的信息', opts('normalize'))).toBe('印表機的資訊');
    expect(await convertText('打印機的信息', opts('normalize', false))).toBe('打印機的信息');
  });

  it('leaves non-Chinese text untouched', async () => {
    expect(await convertText('Hello 123, world!', opts('s2t'))).toBe('Hello 123, world!');
    expect(await convertText('', opts('t2s'))).toBe('');
  });

  it('converts quotes with the matching direction', async () => {
    expect(await convertText('他说：“你好”', opts('s2t', true, true))).toBe('他說：「你好」');
    expect(await convertText('他說：「你好」', opts('t2s', true, true))).toBe('他说：“你好”');
  });

  it('caches converters per direction', () => {
    expect(loadConverter('t2s', true)).toBe(loadConverter('t2s', true));
    expect(loadConverter('t2s', true)).not.toBe(loadConverter('t2s', false));
  });
});

describe('quotes', () => {
  it('converts only matched pairs', () => {
    expect(toCornerQuotes('“外”‘內’')).toBe('「外」『內』');
    expect(toCornerQuotes('don’t')).toBe('don’t');
    expect(toCurlyQuotes('「外『內』」')).toBe('“外‘內’”');
  });

  it('applyConversion runs the converter first', () => {
    const upper = (s: string) => s.toUpperCase();
    expect(applyConversion('“a”', upper, opts('s2t', true, true))).toBe('「A」');
    expect(applyConversion('“a”', upper, opts('s2t', true, false))).toBe('“A”');
  });
});

describe('modes', () => {
  it('swaps direction', () => {
    expect(swapMode('s2t')).toBe('t2s');
    expect(swapMode('t2s')).toBe('s2t');
    expect(swapMode('normalize')).toBe('t2s');
  });

  it('validates stored values', () => {
    expect(isZhMode('s2t')).toBe(true);
    expect(isZhMode('x')).toBe(false);
    expect(isZhMode(null)).toBe(false);
  });
});

describe('toCommonGlyphs', () => {
  it('maps MOE standard forms to everyday Taiwan forms', () => {
    expect(toCommonGlyphs('臺灣臺北溼度很高，這是祕密')).toBe('台灣台北濕度很高，這是秘密');
  });
});

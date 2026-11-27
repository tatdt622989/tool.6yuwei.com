import { describe, expect, it } from 'vitest';
import { breakChunks, nameHtml } from './wrap';

describe('breakChunks', () => {
  it('splits Japanese names before common trailing words', () => {
    expect(breakChunks('パスワード生成ツール', 'ja')).toEqual(['パスワード', '生成', 'ツール']);
    expect(breakChunks('スクラッチカードメーカー', 'ja')).toEqual(['スクラッチカード', 'メーカー']);
  });
  it('does not split at the start, around spaces or right after an opening bracket', () => {
    expect(breakChunks('計算ツール', 'ja')).toEqual(['計算', 'ツール']);
    expect(breakChunks('BMI 計算ツール', 'ja')).toEqual(['BMI 計算', 'ツール']);
    expect(breakChunks('単価計算（どっちがお得）', 'ja')).toEqual(['単価', '計算（どっちがお得）']);
  });
  it('finds Japanese phrase boundaries without a dictionary', () => {
    expect(breakChunks('オンラインろうそく吹き消し', 'ja')).toEqual(['オンライン', 'ろうそく', '吹き消し']);
    expect(breakChunks('画像をアスキーアートに変換', 'ja')).toEqual(['画像を', 'アスキーアートに', '変換']);
    expect(breakChunks('ハッシュ値計算ツール', 'ja')).toEqual(['ハッシュ値', '計算', 'ツール']);
    expect(breakChunks('単価計算（どっちがお得）', 'ja')).toEqual(['単価', '計算（どっちがお得）']);
  });
  it('splits Chinese names and leaves English alone', () => {
    expect(breakChunks('拼豆圖紙產生器', 'zh-TW')).toEqual(['拼豆圖紙', '產生器']);
    expect(breakChunks('Password Generator', 'en')).toEqual(['Password Generator']);
  });
});

describe('nameHtml', () => {
  it('joins chunks with <wbr> and escapes HTML', () => {
    expect(nameHtml('Q&A <b> 計算ツール', 'ja')).toBe('Q&amp;A &lt;b&gt; 計算<wbr>ツール');
  });
});

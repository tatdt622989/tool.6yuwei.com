export interface TextStats {
  /** All characters (user-perceived graphemes), including spaces and line breaks. */
  characters: number;
  /** Characters excluding whitespace. */
  charactersNoSpaces: number;
  /** Han characters (Chinese / Japanese kanji). */
  cjk: number;
  /** Latin-script words (runs of letters/digits). */
  words: number;
  /** 字數 as commonly counted for Chinese writing: Han characters + Latin words. */
  mixedCount: number;
  /** Punctuation marks (full-width and half-width). */
  punctuation: number;
  lines: number;
  paragraphs: number;
  /** Estimated reading time in minutes (300 Han chars or 200 words per minute). */
  readingMinutes: number;
}

const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('zh-TW', { granularity: 'grapheme' }) : null;

function countGraphemes(text: string): number {
  if (!segmenter) return Array.from(text).length;
  let n = 0;
  for (const _ of segmenter.segment(text)) n++;
  return n;
}

export function analyzeText(text: string): TextStats {
  const characters = countGraphemes(text);
  const charactersNoSpaces = countGraphemes(text.replace(/\s+/g, ''));
  const cjk = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.match(/[\p{Script=Latin}\p{Nd}]+(?:['’.-][\p{Script=Latin}\p{Nd}]+)*/gu)?.length ?? 0;
  const punctuation = text.match(/\p{P}/gu)?.length ?? 0;
  const trimmed = text.trim();
  const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs = trimmed === '' ? 0 : trimmed.split(/(?:\r?\n\s*){2,}/).length;
  const readingMinutes = cjk / 300 + words / 200;

  return {
    characters,
    charactersNoSpaces,
    cjk,
    words,
    mixedCount: cjk + words,
    punctuation,
    lines,
    paragraphs,
    readingMinutes,
  };
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 0) return '0 分鐘';
  if (minutes < 1) return '不到 1 分鐘';
  return `約 ${Math.round(minutes)} 分鐘`;
}

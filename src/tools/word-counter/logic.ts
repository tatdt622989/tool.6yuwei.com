import type { Locale } from '../../i18n/locales';

export interface TextStats {
  /** All characters (user-perceived graphemes), including spaces and line breaks. */
  characters: number;
  /** Characters excluding whitespace. */
  charactersNoSpaces: number;
  /** Han characters (Chinese / Japanese kanji). */
  cjk: number;
  /** Latin-script words (runs of letters/digits). */
  words: number;
  /** Hiragana characters (Japanese). */
  hiragana: number;
  /** Katakana characters incl. the long-vowel mark ー (Japanese). */
  katakana: number;
  /** Sentences: runs of text ending in . ! ? 。 ！ ？ (or the end of the text). */
  sentences: number;
  /** 字數 as commonly counted for Chinese writing: Han characters + Latin words. */
  mixedCount: number;
  /** Punctuation marks (full-width and half-width). */
  punctuation: number;
  lines: number;
  paragraphs: number;
  /** Estimated reading time in minutes (300 Han chars or 200 words per minute). */
  readingMinutes: number;
}

/** 原稿用紙 (Japanese manuscript paper) layout: 20 columns × 20 rows per 400-character sheet. */
export const GENKO_COLUMNS = 20;
export const GENKO_ROWS = 20;

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
  const hiragana = text.match(/\p{Script=Hiragana}/gu)?.length ?? 0;
  const katakana = text.match(/[\p{Script=Katakana}ー]/gu)?.length ?? 0;
  const punctuation = text.match(/\p{P}/gu)?.length ?? 0;
  const trimmed = text.trim();
  const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs = trimmed === '' ? 0 : trimmed.split(/(?:\r?\n\s*){2,}/).length;
  const readingMinutes = cjk / 300 + words / 200;
  const sentences = countSentences(trimmed);

  return {
    characters,
    charactersNoSpaces,
    cjk,
    words,
    hiragana,
    katakana,
    sentences,
    mixedCount: cjk + words,
    punctuation,
    lines,
    paragraphs,
    readingMinutes,
  };
}

function countSentences(trimmed: string): number {
  if (trimmed === '') return 0;
  // A sentence ends at terminal punctuation (possibly repeated, possibly followed by closing quotes/brackets).
  // ASCII . ! ? only count when followed by whitespace or the end, so 3.14 and example.com stay one sentence.
  const parts = trimmed.split(/[.!?]+[)"'”’]*(?=\s|$)|[。！？]+[」』）"”]*/u);
  return parts.filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

/**
 * Reading time in minutes for a locale's typical reading speed:
 *  - zh-TW: 300 Han characters + 200 English words per minute (conservative)
 *  - en:    238 words per minute (Brysbaert 2019 average for non-fiction), Han characters at 300/min
 *  - ja:    500 Japanese characters (kanji + kana) per minute, English words at 200/min
 */
export function readingMinutesFor(stats: TextStats, locale: Locale): number {
  if (locale === 'en') return stats.words / 238 + stats.cjk / 300;
  if (locale === 'ja') return (stats.cjk + stats.hiragana + stats.katakana) / 500 + stats.words / 200;
  return stats.readingMinutes;
}

/**
 * Rows and sheets on 400-character 原稿用紙 (20×20). Each line of the text starts a new row and
 * occupies ceil(length / 20) rows (an empty line still takes one row). Simplified: ignores
 * kinsoku rules (punctuation hanging at the end of a row) and the indent at paragraph starts,
 * so school/contest counts may differ by a row or two.
 */
export function genkoLayout(text: string): { rows: number; sheets: number } {
  if (text.trim() === '') return { rows: 0, sheets: 0 };
  const lines = text.replace(/\s+$/u, '').split(/\r\n|\r|\n/);
  const rows = lines.reduce((sum, line) => {
    const length = countGraphemes(line.replace(/\s+$/u, ''));
    return sum + Math.max(1, Math.ceil(length / GENKO_COLUMNS));
  }, 0);
  return { rows, sheets: Math.ceil(rows / GENKO_ROWS) };
}

export interface ReadingTimeLabels {
  zero: string;
  underOne: string;
  /** {n} = rounded minutes. */
  about: string;
}

const ZH_READING: ReadingTimeLabels = { zero: '0 分鐘', underOne: '不到 1 分鐘', about: '約 {n} 分鐘' };

/** Human reading time. Defaults to zh-TW labels; localized tools pass their own from i18n.ts. */
export function formatReadingTime(minutes: number, labels: ReadingTimeLabels = ZH_READING): string {
  if (minutes === 0) return labels.zero;
  if (minutes < 1) return labels.underOne;
  return labels.about.replace('{n}', String(Math.round(minutes)));
}

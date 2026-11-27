import { JA_SENTENCES, LATIN_OPENING, LATIN_WORDS, ZH_SENTENCES } from './corpus';

/** zh: Traditional Chinese, ja: Japanese (ダミーテキスト), la: classic Lorem ipsum. */
export type LoremLang = 'zh' | 'ja' | 'la';
export type LoremUnit = 'paragraphs' | 'sentences' | 'chars' | 'words';

export interface LoremOptions {
  lang: LoremLang;
  unit: LoremUnit;
  count: number;
  /** Latin only: begin with the classic "Lorem ipsum dolor sit amet…". */
  classicStart: boolean;
  /** Wrap paragraphs in <p> tags. */
  html: boolean;
}

/** Returns a number in [0, 1). Injected for testability. */
export type RandomFn = () => number;

export const LIMITS: Record<LoremUnit, number> = {
  paragraphs: 50,
  sentences: 300,
  chars: 20000,
  words: 5000,
};

/** Units offered per language: words make no sense for Chinese or Japanese. */
export const UNITS: Record<LoremLang, readonly LoremUnit[]> = {
  zh: ['paragraphs', 'sentences', 'chars'],
  ja: ['paragraphs', 'sentences', 'chars'],
  la: ['paragraphs', 'sentences', 'words', 'chars'],
};

export function clampCount(unit: LoremUnit, count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.min(LIMITS[unit], Math.max(1, Math.floor(count)));
}

const randInt = (random: RandomFn, min: number, max: number) => min + Math.floor(random() * (max - min + 1));

// ---------- Chinese / Japanese ----------

/** Draws sentences without repeating any until the whole corpus has been used. */
function sentenceBag(random: RandomFn, corpus: readonly string[] = ZH_SENTENCES): () => string {
  let bag: string[] = [];
  let last = '';
  return () => {
    if (bag.length === 0) {
      bag = [...corpus];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Avoid the same sentence twice in a row across refills.
      if (bag[bag.length - 1] === last && bag.length > 1) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    last = bag.pop()!;
    return last;
  };
}

const ZH_PUNCT = /[\p{P}\s]/u;

function zhParagraph(next: () => string, random: RandomFn): string {
  return Array.from({ length: randInt(random, 3, 6) }, next).join('');
}

/**
 * Exactly `count` characters (punctuation included), ending with「。」.
 * Relies on the corpus never containing two punctuation marks in a row.
 */
function zhChars(count: number, next: () => string): string {
  let stream: string[] = [];
  while (stream.length < count + 2) stream = stream.concat(Array.from(next()));
  if (count === 1) return stream.find((ch) => !ZH_PUNCT.test(ch))!;
  const out = stream.slice(0, count - 1);
  if (ZH_PUNCT.test(out[out.length - 1])) out[out.length - 1] = stream[count - 1];
  return `${out.join('')}。`;
}

// ---------- Latin ----------

function latinSentence(random: RandomFn): string {
  const length = randInt(random, 6, 14);
  const words = Array.from({ length }, () => LATIN_WORDS[Math.floor(random() * LATIN_WORDS.length)]);
  if (length > 8) words[randInt(random, 2, length - 4)] += ',';
  const text = words.join(' ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function latinSentences(count: number, classicStart: boolean, random: RandomFn): string[] {
  const out = Array.from({ length: count }, () => latinSentence(random));
  if (classicStart && out.length) out[0] = `${LATIN_OPENING}.`;
  return out;
}

function latinWords(count: number, classicStart: boolean, random: RandomFn): string[] {
  const words = classicStart ? LATIN_OPENING.replace(',', '').toLowerCase().split(' ').slice(0, count) : [];
  while (words.length < count) words.push(LATIN_WORDS[Math.floor(random() * LATIN_WORDS.length)]);
  return words;
}

/** Whole words only, at most `count` characters including the final period. */
function latinChars(count: number, classicStart: boolean, random: RandomFn): string {
  const words = latinWords(Math.ceil(count / 2) + 1, classicStart, random);
  let text = '';
  for (const word of words) {
    const candidate = text ? `${text} ${word}` : word;
    if (candidate.length + 1 > count) break;
    text = candidate;
  }
  if (!text) text = words[0].slice(0, Math.max(1, count - 1));
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

// ---------- Public API ----------

function wrap(paragraphs: string[], html: boolean): string {
  return html ? paragraphs.map((p) => `<p>${p}</p>`).join('\n') : paragraphs.join('\n\n');
}

export function generateLorem(options: LoremOptions, random: RandomFn = Math.random): string {
  const unit = UNITS[options.lang].includes(options.unit) ? options.unit : 'paragraphs';
  const count = clampCount(unit, options.count);

  if (options.lang === 'zh' || options.lang === 'ja') {
    const next = sentenceBag(random, options.lang === 'ja' ? JA_SENTENCES : ZH_SENTENCES);
    if (unit === 'paragraphs') return wrap(Array.from({ length: count }, () => zhParagraph(next, random)), options.html);
    if (unit === 'sentences') return wrap([Array.from({ length: count }, next).join('')], options.html);
    return wrap([zhChars(count, next)], options.html);
  }

  if (unit === 'paragraphs') {
    const paragraphs = Array.from({ length: count }, (_, i) =>
      latinSentences(randInt(random, 4, 7), options.classicStart && i === 0, random).join(' '),
    );
    return wrap(paragraphs, options.html);
  }
  if (unit === 'sentences') return wrap([latinSentences(count, options.classicStart, random).join(' ')], options.html);
  if (unit === 'words') {
    const text = latinWords(count, options.classicStart, random).join(' ');
    return wrap([`${text.charAt(0).toUpperCase()}${text.slice(1)}.`], options.html);
  }
  return wrap([latinChars(count, options.classicStart, random)], options.html);
}

/** Character count as a person would see it (code points, line breaks excluded). */
export function visibleLength(text: string): number {
  return Array.from(text.replace(/\n/g, '')).length;
}

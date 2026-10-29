export type CaseStyle =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'toggle';

export const CASE_STYLES: readonly CaseStyle[] = [
  'upper',
  'lower',
  'title',
  'sentence',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'toggle',
];

export function isCaseStyle(value: unknown): value is CaseStyle {
  return typeof value === 'string' && (CASE_STYLES as readonly string[]).includes(value);
}

/** Short English words kept lowercase in Title Case unless first or last (AP / Chicago style). */
const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'as', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'vs',
]);

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu;

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** True unless the text is written mostly in capitals (then acronyms cannot be told apart). */
function isMostlyLower(text: string): boolean {
  const lower = text.match(/\p{Ll}/gu)?.length ?? 0;
  const upper = text.match(/\p{Lu}/gu)?.length ?? 0;
  return lower > 0 && lower >= upper;
}

/**
 * Words whose casing is deliberate and should survive Title / Sentence case: acronyms (NASA, HTML)
 * unless the whole text is in capitals, and inner capitals (iPhone, JavaScript, McDonald).
 */
function keepsCasing(word: string, textHasLower: boolean): boolean {
  const hasLower = /\p{Ll}/u.test(word);
  if (!hasLower) return textHasLower && word.length > 1 && /\p{Lu}/u.test(word);
  return /.\p{Lu}/u.test(word);
}

export function toTitleCase(text: string): string {
  const hasLower = isMostlyLower(text);
  return text
    .split(/(\r?\n)/)
    .map((line) => {
      const matches = [...line.matchAll(WORD)];
      let out = '';
      let last = 0;
      matches.forEach((m, i) => {
        const word = m[0];
        const start = m.index ?? 0;
        out += line.slice(last, start);
        last = start + word.length;
        if (keepsCasing(word, hasLower)) {
          out += word;
          return;
        }
        const lower = word.toLowerCase();
        // A word right after a colon or a spaced dash starts a subtitle and is capitalized too.
        const afterBreak = /(?::|\s[—–-])\s*$/.test(line.slice(0, start));
        const minor = MINOR_WORDS.has(lower) && i !== 0 && i !== matches.length - 1 && !afterBreak;
        out += minor ? lower : capitalize(lower);
      });
      return out + line.slice(last);
    })
    .join('');
}

/** Abbreviations whose period does not end a sentence. */
const ABBREVIATION_END = /(?:^|[^\p{L}])(?:e\.g|i\.e|vs|mr|mrs|ms|dr|prof|no|fig)\.$/iu;

/** Lowercases everything, then capitalizes the first letter of each sentence and the pronoun "I". */
export function toSentenceCase(text: string): string {
  const hasLower = isMostlyLower(text);
  const lowered = text.replace(WORD, (word) => (keepsCasing(word, hasLower) ? word : word.toLowerCase()));
  return lowered
    .replace(/(^\s*|[.!?]\s+|[。！？]\s*|\n\s*)(\p{Ll})/gu, (match, lead: string, ch: string, offset: number) =>
      ABBREVIATION_END.test(lowered.slice(0, offset + 1)) ? match : lead + ch.toUpperCase(),
    )
    .replace(/\bi\b(?=$|[\s'’,!?;:]|\.(?!\p{L}))/gu, 'I');
}

export function toggleCase(text: string): string {
  let out = '';
  for (const ch of text) {
    const upper = ch.toUpperCase();
    out += ch === upper ? ch.toLowerCase() : upper;
  }
  return out;
}

/**
 * Splits an identifier or phrase into words: separators (space, _, -, ., /), camelCase humps
 * and acronym boundaries (XMLHttpRequest → XML, Http, Request).
 */
export function splitWords(text: string): string[] {
  return text
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function joinWords(line: string, style: 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant'): string {
  const words = splitWords(line).map((w) => w.toLowerCase());
  switch (style) {
    case 'camel':
      return words.map((w, i) => (i === 0 ? w : capitalize(w))).join('');
    case 'pascal':
      return words.map(capitalize).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    case 'constant':
      return words.join('_').toUpperCase();
  }
}

/** Converts text to the given style. Identifier styles are applied line by line. */
export function convertCase(text: string, style: CaseStyle): string {
  switch (style) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return toTitleCase(text);
    case 'sentence':
      return toSentenceCase(text);
    case 'toggle':
      return toggleCase(text);
    default:
      return text
        .split(/(\r?\n)/)
        .map((part) => (/^\r?\n$/.test(part) ? part : joinWords(part, style)))
        .join('');
  }
}

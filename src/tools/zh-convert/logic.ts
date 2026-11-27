// Chinese script conversion built on opencc-js. Dictionaries are loaded lazily and
// only for the direction in use: simplified → traditional needs the large phrase
// table (~1 MB), the other two directions need well under 150 KB.

export type ZhMode = 's2t' | 't2s' | 'normalize';

export interface ZhOptions {
  mode: ZhMode;
  /** Also convert regional vocabulary (软件 ↔ 軟體, 信息 ↔ 資訊). */
  phrases: boolean;
  /** Convert quotation marks between “” ‘’ and 「」 『』. */
  quotes: boolean;
  /** Prefer everyday Taiwan glyphs (台, 濕) over OpenCC's MOE standard forms (臺, 溼). */
  commonGlyphs?: boolean;
}

export type TextConverter = (text: string) => string;

export const MODES: readonly ZhMode[] = ['s2t', 't2s', 'normalize'];

export const MODE_LABELS: Record<ZhMode, { from: string; to: string }> = {
  s2t: { from: '簡體中文', to: '繁體中文（台灣）' },
  t2s: { from: '繁體中文', to: '簡體中文' },
  normalize: { from: '繁體中文（香港或混用字形）', to: '台灣正體' },
};

export function isZhMode(value: unknown): value is ZhMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/** opencc-js locale pair for the bundled converters. */
export function localesFor(mode: Exclude<ZhMode, 'normalize'>, phrases: boolean): { from: string; to: string } {
  const tw = phrases ? 'twp' : 'tw';
  return mode === 's2t' ? { from: 'cn', to: tw } : { from: tw, to: 'cn' };
}

async function buildConverter(mode: ZhMode, phrases: boolean): Promise<TextConverter> {
  if (mode === 's2t') {
    const { Converter } = await import('opencc-js/cn2t');
    return Converter(localesFor(mode, phrases));
  }
  if (mode === 't2s') {
    const { Converter } = await import('opencc-js/t2cn');
    return Converter(localesFor(mode, phrases));
  }
  // Hong Kong / OpenCC-standard variants → standard forms → Taiwan forms (and vocabulary).
  const [{ ConverterFactory }, fromHk, toTw] = await Promise.all([
    import('opencc-js/core'),
    import('opencc-js/from/hk'),
    phrases ? import('opencc-js/to/twp') : import('opencc-js/to/tw'),
  ]);
  return ConverterFactory(fromHk.default, toTw.default);
}

const cache = new Map<string, Promise<TextConverter>>();

/** Loads (once) and returns the converter for a direction. */
export function loadConverter(mode: ZhMode, phrases: boolean): Promise<TextConverter> {
  const key = `${mode}:${phrases}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = buildConverter(mode, phrases);
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}

/** “” ‘’ → 「」 『』 (only matched pairs, so English apostrophes are left alone). */
export function toCornerQuotes(text: string): string {
  return text.replace(/“([^“”]*)”/g, '「$1」').replace(/‘([^‘’]*)’/g, '『$1』');
}

/** 「」 『』 → “” ‘’ */
export function toCurlyQuotes(text: string): string {
  return text.replace(/「/g, '“').replace(/」/g, '”').replace(/『/g, '‘').replace(/』/g, '’');
}

// OpenCC follows Ministry of Education standard forms; everyday Taiwan writing mostly uses the right-hand forms.
const COMMON_GLYPHS: Record<string, string> = { 臺: '台', 溼: '濕', 祕: '秘' };

/** 臺灣 → 台灣, 溼度 → 濕度, 祕密 → 秘密. */
export function toCommonGlyphs(text: string): string {
  return text.replace(/[臺溼祕]/g, (ch) => COMMON_GLYPHS[ch]);
}

/** Applies a loaded converter plus the optional quote conversion for the mode. */
export function applyConversion(text: string, convert: TextConverter, options: ZhOptions): string {
  let out = convert(text);
  if (options.commonGlyphs && options.mode !== 't2s') out = toCommonGlyphs(out);
  if (options.quotes) out = options.mode === 't2s' ? toCurlyQuotes(out) : toCornerQuotes(out);
  return out;
}

export async function convertText(text: string, options: ZhOptions): Promise<string> {
  if (text === '') return '';
  return applyConversion(text, await loadConverter(options.mode, options.phrases), options);
}

/** Direction after pressing「交換方向」: the output (traditional for s2t / normalize) becomes the input. */
export function swapMode(mode: ZhMode): ZhMode {
  return mode === 't2s' ? 's2t' : 't2s';
}


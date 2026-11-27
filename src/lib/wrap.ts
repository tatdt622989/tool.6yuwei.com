// Line-break hints for short labels (tool names, category names).
//
// Chinese and Japanese have no spaces, so a browser may break a name anywhere: 「パスワード生成ツー／ル」,
// 「スクラッチカードメ／ーカー」. Pages render names with `.name-wrap` (word-break: keep-all), which only breaks at
// spaces, punctuation and <wbr>; this adds a <wbr> before common trailing words so the break lands between them.
import type { Locale } from '../i18n/locales';

const SUFFIXES: Partial<Record<Locale, string[]>> = {
  ja: [
    'ジェネレーター',
    'シミュレーター',
    'コンバーター',
    'カウンター',
    'チェッカー',
    'カレンダー',
    'デコーダー',
    'プレビュー',
    'ルーレット',
    'メーカー',
    'マシーン',
    'メーター',
    'タイマー',
    'チェック',
    'ツール',
    'テスト',
    'くじ引き',
    '早見表',
    '計算',
    '変換',
    '換算',
    '生成',
    '作成',
    '測定',
    '抽選',
  ],
  'zh-TW': ['產生器', '計算機', '模擬器', '計數器', '換算', '轉換', '試算', '計算', '測試', '查詢', '抽籤', '抽獎'],
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const HIRAGANA = /[\u3041-\u309f]/;
const KANJI = /[\u4e00-\u9fff]/;

/**
 * Japanese phrase boundaries a browser cannot see: after the particle 「を」 (画像を｜変換), after the prefix 「オンライン」,
 * and where a run of 3+ hiragana meets a kanji (ろうそく｜吹き消し). Shorter runs are usually okurigana (吹き｜消し would
 * be wrong), katakana before a kanji is usually one compound (ハッシュ値, ローマ字), and お/ご prefix the kanji (お得).
 */
function jaBoundary(text: string, i: number): boolean {
  if (text[i - 1] === 'を') return true;
  if (text.slice(0, i).endsWith('オンライン')) return true;
  if (!KANJI.test(text[i])) return false;
  if ('おご'.includes(text[i - 1])) return false;
  let run = 0;
  for (let j = i - 1; j >= 0 && HIRAGANA.test(text[j]); j--) run++;
  return run >= 3;
}

/** Text split into chunks at the suggested break points (exported for tests). */
export function breakChunks(text: string, locale: Locale): string[] {
  const suffixes = SUFFIXES[locale];
  if (!suffixes) return [text];
  const chunks: string[] = [];
  let start = 0;
  for (let i = 1; i < text.length; i++) {
    const prev = text[i - 1];
    if (/[\s（(「・]/.test(prev) || /\s/.test(text[i])) continue;
    if (suffixes.some((s) => text.startsWith(s, i)) || (locale === 'ja' && jaBoundary(text, i))) {
      chunks.push(text.slice(start, i));
      start = i;
    }
  }
  chunks.push(text.slice(start));
  return chunks.filter(Boolean);
}

/** HTML for a name with <wbr> hints. Use with set:html on an element that has class="name-wrap". */
export function nameHtml(text: string, locale: Locale): string {
  return breakChunks(text, locale).map(escapeHtml).join('<wbr>');
}

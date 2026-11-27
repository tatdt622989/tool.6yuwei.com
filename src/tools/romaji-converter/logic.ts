/**
 * ひらがな・カタカナ → ローマ字（パスポート式／令和7年内閣告示／訓令式／ローマ字入力）。純関数。
 *
 * 出典（2026-10-29 確認）：
 * - パスポートのヘボン式：外務省の方針に基づく各都道府県旅券窓口の案内。
 *   神奈川県「ヘボン式ローマ字表記について」https://www.pref.kanagawa.jp/docs/h6d/passport/hepburn.html
 *   福岡県「ヘボン式ローマ字表記」https://www.pref.fukuoka.lg.jp/contents/hebonhyouki.html
 *   ・撥音「ん」は N、ただし B・M・P の前は M（NAMBA, HOMMA, SAMPEI）
 *   ・促音は子音を重ねる（HATTORI）。CHI/CHA/CHU/CHO の前は T（HOTCHI, HATCHO, ETCHU）
 *   ・長音の O・U・H は書かない（ONO, YOKO, TORU, YUKI, SATO）。
 *     ただし語末が「オオ」のときは OO（YOKOO, SENOO, MISONOO, TAKATOO）
 *   ・ヂ=JI、ヅ=ZU、ヲ=O、ヴ=BU、ヴァ=BUA、外国式の小書き母音は母音を別に書く（シェ=SHIE, ティ=TEI）
 *   ・例外（辞書なしでは判定できない語の切れ目）：松浦 MATSUURA、小団扇 KOUCHIWA など
 * - 令和7年内閣告示第4号「ローマ字のつづり方」（令和7年12月22日告示）と文化庁国語課「同 Q&A」（令和8年2月）
 *   https://www.bunka.go.jp/seisaku/kokugo_nihongo/kokugo_shisaku/pdf/94340701_01.pdf
 *   ・本表はヘボン式に準ずる（shi, chi, tsu, fu, ji）。ヂ=ji、ヅ=zu、ヲ=o
 *   ・撥音は例外なく n（m は使わない）。n の後に母音字や y が続くときは「'」で切り離せる（tan'i）
 *   ・促音は子音字を重ねる。ch の前も c を重ねる（matcha ではなく maccha）
 *   ・長音は母音字に符号「¯」（必要なら「^」）を付けるほか、現代仮名遣いどおり母音字を並べてもよい
 *     （Tōhoku / Touhoku、Ōno / Oono）。イ列長音とエ列＋「い」は母音字を並べるのが一般的（Niigata, Heisei）
 *   ・固有名詞は語頭を大文字で書く
 * - 訓令式：昭和29年内閣告示第1号 第1表（令和7年に廃止、対照表に参考として掲載）。si, ti, tu, hu, zi, sya, tya, zya。
 *   長音は「^」（Tôkyô）。
 * - ローマ字入力：同 Q&A 問46・問52（ぢ=di、づ=du、を=wo と入力する。入力方法は告示の対象外）。
 */
import { halfToFullKana, katakanaToHiragana } from '../kana-converter/logic';

export type RomajiStyle = 'passport' | 'macron' | 'doubled' | 'kunrei' | 'input';

export const ROMAJI_STYLES: { id: RomajiStyle; label: string; note: string }[] = [
  { id: 'passport', label: 'パスポート（外務省ヘボン式）', note: '長音は書かない・B/M/P の前の「ん」は M・大文字' },
  { id: 'macron', label: '令和7年告示（長音記号）', note: '撥音は n・長音は ā ī ū ē ō' },
  { id: 'doubled', label: '令和7年告示（母音を並べる）', note: '長音は仮名どおり ou・oo・uu' },
  { id: 'kunrei', label: '訓令式', note: 'si・ti・tu・hu・zi、長音は ^' },
  { id: 'input', label: 'ローマ字入力（キーボード）', note: 'ん=nn、を=wo、ぢ=di、ー=-' },
];

/** [ヘボン式（パスポート・告示共通）, 訓令式, ローマ字入力] */
type Spell = readonly [string, string, string];

const S = (hep: string, kun = hep, inp = hep): Spell => [hep, kun, inp];

const SINGLE: Record<string, Spell> = {
  あ: S('a'), い: S('i'), う: S('u'), え: S('e'), お: S('o'),
  か: S('ka'), き: S('ki'), く: S('ku'), け: S('ke'), こ: S('ko'),
  さ: S('sa'), し: S('shi', 'si'), す: S('su'), せ: S('se'), そ: S('so'),
  た: S('ta'), ち: S('chi', 'ti'), つ: S('tsu', 'tu'), て: S('te'), と: S('to'),
  な: S('na'), に: S('ni'), ぬ: S('nu'), ね: S('ne'), の: S('no'),
  は: S('ha'), ひ: S('hi'), ふ: S('fu', 'hu'), へ: S('he'), ほ: S('ho'),
  ま: S('ma'), み: S('mi'), む: S('mu'), め: S('me'), も: S('mo'),
  や: S('ya'), ゆ: S('yu'), よ: S('yo'),
  ら: S('ra'), り: S('ri'), る: S('ru'), れ: S('re'), ろ: S('ro'),
  わ: S('wa'), ゐ: S('i', 'i', 'wyi'), ゑ: S('e', 'e', 'wye'), を: S('o', 'o', 'wo'),
  が: S('ga'), ぎ: S('gi'), ぐ: S('gu'), げ: S('ge'), ご: S('go'),
  ざ: S('za'), じ: S('ji', 'zi'), ず: S('zu'), ぜ: S('ze'), ぞ: S('zo'),
  だ: S('da'), ぢ: S('ji', 'zi', 'di'), づ: S('zu', 'zu', 'du'), で: S('de'), ど: S('do'),
  ば: S('ba'), び: S('bi'), ぶ: S('bu'), べ: S('be'), ぼ: S('bo'),
  ぱ: S('pa'), ぴ: S('pi'), ぷ: S('pu'), ぺ: S('pe'), ぽ: S('po'),
  ゔ: S('vu'),
  // 単独で現れた小書き文字
  ぁ: S('a', 'a', 'xa'), ぃ: S('i', 'i', 'xi'), ぅ: S('u', 'u', 'xu'), ぇ: S('e', 'e', 'xe'), ぉ: S('o', 'o', 'xo'),
  ゃ: S('ya', 'ya', 'xya'), ゅ: S('yu', 'yu', 'xyu'), ょ: S('yo', 'yo', 'xyo'), ゎ: S('wa', 'wa', 'xwa'),
  ゕ: S('ka', 'ka', 'xka'), ゖ: S('ke', 'ke', 'xke'),
};

/** イ段 + ゃゅょ の拗音：[ヘボン式の子音, 訓令式の子音, 入力の子音] */
const YOON_BASE: Record<string, Spell> = {
  き: S('ky'), し: S('sh', 'sy'), ち: S('ch', 'ty'), に: S('ny'), ひ: S('hy'), み: S('my'), り: S('ry'),
  ぎ: S('gy'), じ: S('j', 'zy'), ぢ: S('j', 'zy', 'dy'), び: S('by'), ぴ: S('py'),
};
const YOON_VOWEL: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' };

/** 外来語などの小書き母音を含む音（告示の対象外。パスポート式では使わず 1 字ずつ書く）。 */
const EXTENDED: Record<string, Spell> = {
  しぇ: S('she', 'sye', 'she'), ちぇ: S('che', 'tye', 'che'), じぇ: S('je', 'zye', 'je'),
  てぃ: S('ti', 'ti', 'thi'), でぃ: S('di', 'di', 'dhi'), とぅ: S('tu', 'tu', 'twu'), どぅ: S('du', 'du', 'dwu'),
  てゅ: S('tyu', 'tyu', 'thu'), でゅ: S('dyu', 'dyu', 'dhu'),
  ふぁ: S('fa'), ふぃ: S('fi'), ふぇ: S('fe'), ふぉ: S('fo'), ふゅ: S('fyu'),
  うぃ: S('wi'), うぇ: S('we'), うぉ: S('wo', 'wo', 'who'), いぇ: S('ye'),
  ゔぁ: S('va'), ゔぃ: S('vi'), ゔぇ: S('ve'), ゔぉ: S('vo'), ゔゅ: S('vyu'),
  つぁ: S('tsa'), つぃ: S('tsi'), つぇ: S('tse'), つぉ: S('tso'),
  くぁ: S('kwa'), ぐぁ: S('gwa'),
};

type Token =
  | { type: 'syl'; kana: string; spell: Spell; passport: string; vowel: string; pureVowel: boolean }
  | { type: 'sokuon' }
  | { type: 'n' }
  | { type: 'long' }
  | { type: 'sep'; text: string };

const PURE_VOWELS = new Set(['あ', 'い', 'う', 'え', 'お']);
const SMALL_VOWELS: Record<string, string> = { ぁ: 'あ', ぃ: 'い', ぅ: 'う', ぇ: 'え', ぉ: 'お' };

const lastVowel = (s: string) => {
  const m = /[aiueo](?!.*[aiueo])/.exec(s);
  return m ? m[0] : '';
};

function syl(kana: string, spell: Spell, passport: string): Token {
  return { type: 'syl', kana, spell, passport, vowel: lastVowel(spell[0]), pureVowel: PURE_VOWELS.has(kana) };
}

/** 入力をひらがなにそろえ、音節の列に分ける。 */
export function tokenize(text: string): Token[] {
  const chars = Array.from(katakanaToHiragana(halfToFullKana(text.normalize('NFC'))));
  const tokens: Token[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (ch === 'っ') {
      tokens.push({ type: 'sokuon' });
      continue;
    }
    if (ch === 'ん') {
      tokens.push({ type: 'n' });
      continue;
    }
    if (ch === 'ー') {
      tokens.push({ type: 'long' });
      continue;
    }
    if (next && YOON_BASE[ch] && YOON_VOWEL[next]) {
      const [h, k, n] = YOON_BASE[ch];
      const v = YOON_VOWEL[next];
      const spell: Spell = [h + v, k + v, n + v];
      tokens.push(syl(ch + next, spell, spell[0]));
      i++;
      continue;
    }
    if (next && EXTENDED[ch + next]) {
      // パスポートでは 1 字ずつ：シェ = SHI + E、ヴァ = BU + A
      const first = ch === 'ゔ' ? 'bu' : SINGLE[ch]?.[0] ?? '';
      const second = SMALL_VOWELS[next] ? SINGLE[SMALL_VOWELS[next]][0] : SINGLE[next]?.[0] ?? '';
      tokens.push(syl(ch + next, EXTENDED[ch + next], first + second));
      i++;
      continue;
    }
    const single = SINGLE[ch];
    if (single) {
      tokens.push(syl(ch, single, ch === 'ゔ' ? 'bu' : single[0]));
      continue;
    }
    tokens.push({ type: 'sep', text: ch });
  }
  return tokens;
}

const MACRON: Record<string, string> = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };
const CIRCUMFLEX: Record<string, string> = { a: 'â', i: 'î', u: 'û', e: 'ê', o: 'ô' };

function spellOf(t: Extract<Token, { type: 'syl' }>, style: RomajiStyle): string {
  if (style === 'passport') return t.passport;
  if (style === 'kunrei') return t.spell[1];
  if (style === 'input') return t.spell[2];
  return t.spell[0];
}

export interface RomajiOptions {
  /** 語頭を大文字にする（パスポート式は常に全部大文字）。既定 true。 */
  capitalize?: boolean;
}

/** 1 語（区切り文字を含まない音節の列）をローマ字にする。 */
function renderWord(tokens: Token[], style: RomajiStyle): string {
  const parts: string[] = [];
  /** 長音の吸収先にできる直前の音節（parts の添字と母音）。 */
  let prev: { index: number; vowel: string } | null = null;
  const markLong = (marks: Record<string, string>) => {
    if (!prev) return false;
    const s = parts[prev.index];
    const v = s[s.length - 1];
    if (!marks[v]) return false;
    parts[prev.index] = s.slice(0, -1) + marks[v];
    prev = null;
    return true;
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const nextSyl = (() => {
      const n = tokens[i + 1];
      return n && n.type === 'syl' ? spellOf(n, style) : '';
    })();

    if (t.type === 'sokuon') {
      prev = null;
      if (!nextSyl || /^[aiueo]/.test(nextSyl)) {
        if (style === 'input') parts.push('xtu');
        continue;
      }
      if (style === 'passport' && nextSyl.startsWith('ch')) parts.push('t');
      else parts.push(nextSyl[0]);
      continue;
    }

    if (t.type === 'n') {
      prev = null;
      if (style === 'input') parts.push('nn');
      else if (style === 'passport') parts.push(/^[bmp]/.test(nextSyl) ? 'm' : 'n');
      else parts.push(/^[aiueoy]/.test(nextSyl) ? "n'" : 'n');
      continue;
    }

    if (t.type === 'long') {
      if (style === 'passport') continue;
      if (style === 'input') {
        parts.push('-');
        prev = null;
        continue;
      }
      if (style === 'macron') {
        markLong(MACRON);
        continue;
      }
      if (style === 'kunrei') {
        markLong(CIRCUMFLEX);
        continue;
      }
      // doubled：直前の母音を重ねる（ビール → biiru）
      if (prev) {
        parts.push(prev.vowel);
        prev = null;
      }
      continue;
    }

    if (t.type !== 'syl') continue;

    // 長音の判定（あいうえお が直前の音節の母音を伸ばすとき）
    if (t.pureVowel && prev && style !== 'input' && style !== 'doubled') {
      const pv = prev.vowel;
      const k = t.kana;
      const isLong = (k === 'う' && (pv === 'o' || pv === 'u')) || (k === 'お' && pv === 'o') ||
        (k === 'あ' && pv === 'a') || (k === 'え' && pv === 'e');
      if (style === 'passport') {
        const ouLong = (k === 'う' && (pv === 'o' || pv === 'u')) || (k === 'お' && pv === 'o');
        // 語末の「オオ」は OO と書く（YOKOO, SENOO）
        const wordFinal = !tokens.slice(i + 1).some((x) => x.type === 'syl' || x.type === 'n');
        if (ouLong && !(k === 'お' && wordFinal)) {
          prev = null;
          continue;
        }
      } else if (isLong && markLong(style === 'kunrei' ? CIRCUMFLEX : MACRON)) {
        continue;
      }
    }

    const s = spellOf(t, style);
    parts.push(s);
    prev = { index: parts.length - 1, vowel: lastVowel(s) };
  }
  return parts.join('');
}

const capitalizeWord = (w: string) => (w ? w[0].toUpperCase() + w.slice(1) : w);

/** かな文字列を指定の方式でローマ字にする。漢字などかな以外の文字はそのまま残す。 */
export function toRomaji(text: string, style: RomajiStyle, options: RomajiOptions = {}): string {
  const { capitalize = true } = options;
  const tokens = tokenize(text);
  let out = '';
  let word: Token[] = [];
  const flush = () => {
    if (!word.length) return;
    let w = renderWord(word, style);
    if (style === 'passport') w = w.toUpperCase();
    else if (capitalize && style !== 'input') w = capitalizeWord(w);
    out += w;
    word = [];
  };
  for (const t of tokens) {
    if (t.type === 'sep') {
      flush();
      out += t.text === '　' ? ' ' : t.text;
    } else word.push(t);
  }
  flush();
  return out;
}

export function toAllStyles(text: string, options: RomajiOptions = {}): Record<RomajiStyle, string> {
  return {
    passport: toRomaji(text, 'passport', options),
    macron: toRomaji(text, 'macron', options),
    doubled: toRomaji(text, 'doubled', options),
    kunrei: toRomaji(text, 'kunrei', options),
    input: toRomaji(text, 'input', options),
  };
}

/** 入力に漢字が含まれるか（読みが分からないので変換できない）。 */
export function hasKanji(text: string): boolean {
  return /\p{Script=Han}/u.test(text);
}

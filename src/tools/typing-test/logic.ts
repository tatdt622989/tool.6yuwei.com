// Typing speed test (打字速度測試). Pure, DOM-free logic: corpus, passage building, character
// comparison, a session state machine driven by an injected clock, scoring and personal bests.

/** Fills the array with uniformly random 32-bit integers. Injected for testability. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

/** Test language: Chinese (IME), English, or Japanese (romaji input, ja locale only). */
export type Lang = 'zh' | 'en' | 'ja';
export const DURATIONS = [30, 60, 120] as const;
export type Duration = (typeof DURATIONS)[number];

// ---------- Corpus: original, neutral sentences written for this tool ----------

export const ZH_SENTENCES: readonly string[] = [
  '清晨的公園裡，有人慢跑，有人打太極，空氣中飄著淡淡的青草香。',
  '下雨天走在騎樓下，聽著雨滴打在遮雨棚上的聲音，心情也跟著安靜下來。',
  '學習一項新技能最重要的是持續練習，每天進步一點點，累積起來就很可觀。',
  '週末的傳統市場總是特別熱鬧，攤販的叫賣聲此起彼落，充滿生活的味道。',
  '搭乘捷運時請禮讓座位給有需要的乘客，並記得在月臺上排隊候車。',
  '圖書館的窗邊有一排舒適的座位，午後的陽光灑在書頁上，讓人捨不得離開。',
  '煮一碗熱騰騰的湯麵並不困難，只要準備好高湯、青菜和喜歡的配料就可以。',
  '出門旅行前先查好天氣與交通資訊，行李盡量精簡，旅途會輕鬆許多。',
  '夜市裡的小吃種類繁多，從鹹酥雞到豆花，每一攤都有自己的老顧客。',
  '定期整理房間可以讓生活更有條理，也能更快找到需要的東西。',
  '山上的步道兩旁長滿蕨類植物，偶爾還能聽見遠處傳來的鳥叫聲。',
  '打字時保持正確的坐姿，手腕放鬆，眼睛看著螢幕，速度自然會慢慢提升。',
  '海邊的夕陽把天空染成橘紅色，浪花一陣一陣地拍打著沙灘。',
  '每天喝足夠的水、規律運動和充足睡眠，是維持健康最簡單的方法。',
  '小朋友在操場上追逐嬉戲，笑聲傳遍整個校園，讓人想起自己的童年。',
  '寫信給遠方的朋友時，可以分享最近發生的趣事，也問候對方的近況。',
  '一杯溫熱的茶配上一本好書，就是許多人心目中最理想的假日午後。',
  '騎腳踏車沿著河濱自行車道前進，微風吹來，沿途的風景十分宜人。',
  '做菜時先把食材洗好切好，再依照順序下鍋，就不會手忙腳亂。',
  '冬天的早晨有些寒冷，出門前記得多加一件外套，並圍上溫暖的圍巾。',
  '整理照片時常會發現許多美好的回憶，讓人忍不住嘴角上揚。',
  '種植盆栽需要耐心，適量澆水並放在通風明亮的地方，植物就會長得很好。',
  '會議開始前先準備好資料與議程，討論起來會更有效率。',
  '夏天的午後常有雷陣雨，來得快去得也快，雨後的空氣格外清新。',
  '博物館裡展示著各個時代的文物，每一件都訴說著不同的故事。',
  '學會傾聽別人說話，是建立良好人際關係的第一步。',
  '早餐店的老闆動作俐落，蛋餅、蘿蔔糕和奶茶很快就送到客人面前。',
  '晚上抬頭看看星空，會發現城市的燈光之外，還有一片寧靜的天地。',
  '搬家時把物品分類裝箱並寫上標籤，到了新家整理起來會方便許多。',
  '練習鍵盤指法時，先熟悉基準鍵的位置，再慢慢擴展到其他按鍵。',
  '秋天的稻田一片金黃，農夫們忙著收割，臉上帶著豐收的喜悅。',
  '和家人一起準備晚餐，邊做邊聊天，是一天當中最溫馨的時光。',
  '公車即將進站，請站在候車線後方，等車輛停妥後再依序上車。',
  '長時間使用手機之後，記得讓眼睛休息，看看遠方的綠色植物。',
  '老街上保留了許多古樸的建築，紅磚牆面在陽光下顯得格外溫暖。',
  '遇到困難時不要急著放棄，換個角度思考，也許就能找到解決的方法。',
];

export const EN_SENTENCES: readonly string[] = [
  'The morning bus was quiet, and most riders watched the rain slide down the windows.',
  'A good habit is easier to keep when you start small and repeat it every day.',
  'She packed a light bag, a warm jacket, and a map of the mountain trails.',
  'Fresh bread from the corner bakery smells best just before the sun comes up.',
  'Typing well depends more on a steady rhythm than on raw speed.',
  'The library added new desks by the window, and they fill up quickly after lunch.',
  'Please keep your ticket until you reach the exit gate at the end of the platform.',
  'He planted tomatoes in small pots and watered them every evening after work.',
  'A short walk after dinner can help you relax and sleep a little better.',
  'The night market was crowded, but the line for hot soup moved surprisingly fast.',
  'Our team meets on Monday to review the plan and set goals for the week.',
  'Clouds gathered over the hills, and a cool wind carried the scent of rain.',
  'Learning a new language takes patience, practice, and a sense of humor.',
  'The old bridge across the river was repaired last spring and painted bright red.',
  'Remember to save your work often, especially before you close the laptop.',
  'Children laughed as they chased each other across the school playground.',
  'A cup of tea and a quiet corner are all some people need on a lazy afternoon.',
  'The train left on time, and the countryside rolled past in shades of green.',
  'Before cooking, wash the vegetables, slice the onions, and heat the pan.',
  'Every map tells a story about the people who drew it and the places they knew.',
  'The museum opens at nine, so we planned to arrive a few minutes early.',
  'Keep your wrists relaxed and let your fingers rest lightly on the home row.',
  'The cat slept in a patch of sunlight that slowly moved across the floor.',
  "Small acts of kindness, like holding a door, can brighten a stranger's day.",
  'The weather report promised clear skies, so we packed a picnic for the beach.',
  'Writing a short list each morning makes it easier to focus on what matters.',
  'The bicycle path follows the river for miles and is perfect for a slow ride.',
  'Our neighbor grows herbs on her balcony and shares basil with everyone nearby.',
  'Waves rolled onto the sand as the sky turned orange and then deep purple.',
  'A clear desk and a comfortable chair can make long study sessions feel shorter.',
  'The store will close early today, so please finish your shopping by six.',
  'Stars are easier to see far from the city, where the nights are truly dark.',
  'He fixed the squeaky door with a few drops of oil and a small screwdriver.',
  'Practice for ten minutes a day, and you will notice real progress within a month.',
  'The festival filled the streets with music, lanterns, and the smell of grilled corn.',
  'Honest feedback, shared with care, helps everyone on the team improve.',
];

/** Chinese punctuation that the 「不含標點」 option strips from passages. */
const ZH_PUNCT = /[，。、；：！？「」『』（）—…]/g;

/** Unbiased integer in [0, max) using rejection sampling. */
function randomIndex(max: number, random: RandomSource): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    value = random(buf)[0];
  } while (value >= limit);
  return value % max;
}

function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface PassageOptions {
  lang: Lang;
  /** Keep Chinese punctuation (ignored for English). */
  punctuation: boolean;
}

/** Characters a fast typist could reach in the given time, used to size the first passage. */
export function targetLength(lang: Lang, seconds: number): number {
  return Math.ceil(seconds * (lang === 'zh' ? 3 : 14));
}

function prepare(sentence: string, opts: PassageOptions): string {
  return opts.lang === 'zh' && !opts.punctuation ? sentence.replace(ZH_PUNCT, '') : sentence;
}

/**
 * Random passage of at least `minLength` characters. Sentences are shuffled and not repeated
 * until the whole corpus has been used. `after` is the text the passage continues (for joins).
 */
export function buildPassage(
  opts: PassageOptions,
  minLength: number,
  random: RandomSource = defaultRandom,
  after = '',
): string {
  const corpus = opts.lang === 'zh' ? ZH_SENTENCES : EN_SENTENCES;
  const sep = opts.lang === 'en' ? ' ' : '';
  let out = '';
  let pool: string[] = [];
  let last = '';
  while (out.length < minLength) {
    if (pool.length === 0) {
      pool = shuffled(corpus, random);
      // Avoid the same sentence twice in a row across a reshuffle.
      if (pool[0] === last && pool.length > 1) [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    const next = prepare(pool.shift()!, opts);
    last = next;
    out += (out || after ? sep : '') + next;
  }
  return out;
}

// ---------- Character comparison ----------

const HALF_TO_FULL: Record<string, string> = {
  ',': '，',
  '.': '。',
  '?': '？',
  '!': '！',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
};

const SMART_QUOTES: Record<string, string> = { '‘': "'", '’': "'", '“': '"', '”': '"' };

/** Whether a typed character matches the expected one. Tolerates half/full-width punctuation in Chinese and smart quotes. */
export function sameChar(typed: string, expected: string, lang: Lang): boolean {
  if (typed === expected) return true;
  if (lang === 'zh') return (HALF_TO_FULL[typed] ?? typed) === (HALF_TO_FULL[expected] ?? expected);
  return (SMART_QUOTES[typed] ?? typed) === (SMART_QUOTES[expected] ?? expected);
}

export type CharState = 'pending' | 'correct' | 'wrong';

/** Per-character state of the passage given the typed text. */
export function compareTyped(typed: string, passage: string, lang: Lang): CharState[] {
  const states: CharState[] = new Array(passage.length).fill('pending');
  const n = Math.min(typed.length, passage.length);
  for (let i = 0; i < n; i++) states[i] = sameChar(typed[i], passage[i], lang) ? 'correct' : 'wrong';
  return states;
}

export function countCorrect(typed: string, passage: string, lang: Lang): number {
  let correct = 0;
  const n = Math.min(typed.length, passage.length);
  for (let i = 0; i < n; i++) if (sameChar(typed[i], passage[i], lang)) correct++;
  return correct;
}

// ---------- Session ----------

export type Phase = 'idle' | 'running' | 'finished';

export interface TypingResult {
  lang: Lang;
  /** Headline speed: 字/分 for Chinese, net WPM for English. */
  speed: number;
  /** Correct characters per minute. */
  cpm: number;
  /** English only: all typed characters / 5 per minute. */
  rawWpm: number;
  /** 0–100, based on every character entered (corrected mistakes still count against it). */
  accuracy: number;
  correctChars: number;
  /** Characters currently wrong in the final text. */
  uncorrected: number;
  /** Every wrong character ever entered, including ones later fixed. */
  errors: number;
  typedChars: number;
  elapsedMs: number;
}

/**
 * One timed attempt. Only committed text is fed in; IME composition (注音 / 倉頡 / 拼音 candidates)
 * never reaches `commit`, so it is neither counted nor treated as an error.
 */
export class TypingSession {
  phase: Phase = 'idle';
  startedAt = 0;
  endedAt = 0;
  committed = '';
  entries = 0;
  errors = 0;

  constructor(
    public passage: string,
    public readonly lang: Lang,
    public readonly durationMs: number,
  ) {}

  start(now: number): void {
    if (this.phase !== 'idle') return;
    this.phase = 'running';
    this.startedAt = now;
  }

  /** Appends more passage text (the UI extends the passage as the typist nears its end). */
  extend(text: string): void {
    this.passage += text;
  }

  /**
   * Feeds the committed input value. Characters after the longest common prefix with the
   * previous value are new entries and are checked against the passage.
   */
  commit(value: string, now: number): { added: number; addedErrors: number } {
    if (this.phase === 'finished') return { added: 0, addedErrors: 0 };
    if (this.phase === 'idle') this.start(now);
    const next = value.slice(0, this.passage.length);
    const prev = this.committed;
    let p = 0;
    while (p < prev.length && p < next.length && prev[p] === next[p]) p++;
    let addedErrors = 0;
    for (let i = p; i < next.length; i++) if (!sameChar(next[i], this.passage[i], this.lang)) addedErrors++;
    const added = next.length - p;
    this.entries += added;
    this.errors += addedErrors;
    this.committed = next;
    return { added, addedErrors };
  }

  elapsed(now: number): number {
    if (this.phase === 'idle') return 0;
    if (this.phase === 'finished') return this.endedAt - this.startedAt;
    return Math.min(this.durationMs, Math.max(0, now - this.startedAt));
  }

  remaining(now: number): number {
    return this.durationMs - this.elapsed(now);
  }

  isOver(now: number): boolean {
    return this.phase === 'running' && now - this.startedAt >= this.durationMs;
  }

  finish(now: number): TypingResult {
    if (this.phase === 'running') {
      this.endedAt = Math.min(now, this.startedAt + this.durationMs);
      this.phase = 'finished';
    }
    return this.result(now);
  }

  result(now: number): TypingResult {
    const correctChars = countCorrect(this.committed, this.passage, this.lang);
    return scoreOf({
      lang: this.lang,
      correctChars,
      typedChars: this.committed.length,
      entries: this.entries,
      errors: this.errors,
      elapsedMs: this.elapsed(now),
    });
  }
}

export function scoreOf(input: {
  lang: Lang;
  correctChars: number;
  typedChars: number;
  entries: number;
  errors: number;
  elapsedMs: number;
}): TypingResult {
  const { lang, correctChars, typedChars, entries, errors, elapsedMs } = input;
  // Below one second the rate is meaningless and explodes; treat it as one second.
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  const cpm = correctChars / minutes;
  const rawWpm = lang === 'en' ? typedChars / 5 / minutes : 0;
  return {
    lang,
    speed: lang === 'zh' ? cpm : correctChars / 5 / minutes,
    cpm,
    rawWpm,
    accuracy: entries > 0 ? (Math.max(0, entries - errors) / entries) * 100 : 100,
    correctChars,
    uncorrected: typedChars - correctChars,
    errors,
    typedChars,
    elapsedMs,
  };
}

// ---------- Ranks & bests ----------

const RANKS: readonly { min: number; label: string }[] = [
  { min: 0, label: '起步練習中' },
  { min: 1, label: '入門' },
  { min: 2, label: '熟練' },
  { min: 3, label: '快手' },
  { min: 4, label: '高手' },
  { min: 5, label: '神速' },
];

/** Speed thresholds per level: 字/分 for Chinese, WPM for English, keystrokes/min (打鍵/分) for Japanese. */
export const RANK_THRESHOLDS: Record<Lang, readonly number[]> = {
  zh: [0, 15, 30, 50, 80, 120],
  en: [0, 20, 40, 60, 80, 100],
  ja: [0, 90, 150, 210, 280, 360],
};

export function rankOf(lang: Lang, speed: number): { level: number; label: string } {
  const t = RANK_THRESHOLDS[lang];
  let level = 0;
  for (let i = 0; i < t.length; i++) if (speed >= t[i]) level = i;
  return { level, label: RANKS[level].label };
}

export interface BestScore {
  speed: number;
  accuracy: number;
  date: string;
}
export type BestMap = Record<string, BestScore>;

export const bestKey = (lang: Lang, seconds: number) => `${lang}-${seconds}`;

/** Merges a finished result into the stored bests; returns the new map and whether it set a record. */
export function mergeBest(
  best: BestMap,
  key: string,
  result: Pick<TypingResult, 'speed' | 'accuracy'>,
  date: string,
): { best: BestMap; isNew: boolean } {
  const prev = best[key];
  const speed = Math.round(result.speed);
  if (speed <= 0 || (prev && prev.speed >= speed)) return { best, isNew: false };
  return { best: { ...best, [key]: { speed, accuracy: Math.round(result.accuracy), date } }, isNew: true };
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---------- Japanese romaji typing (ja locale) ----------
//
// Japanese typing tests (e-typing, 寿司打 style) show a sentence in kanji and kana and the typist enters
// romaji with the IME off. Every common spelling is accepted: し = shi / si / ci, ん = nn (or a single n
// when the next kana can't be misread), っ = doubled consonant or xtu / ltu, しゃ = sha / sya / sixya…
// Wrong keys are counted as misses and do not advance, so the score is keystrokes per minute (打鍵/分).

export interface JaSentence {
  /** What is shown: kanji and kana. */
  text: string;
  /** Reading in hiragana (ー for long vowels), no punctuation. This is what gets typed. */
  kana: string;
}

export const JA_SENTENCES: readonly JaSentence[] = [
  { text: '朝の電車は思ったより空いていました', kana: 'あさのでんしゃはおもったよりすいていました' },
  { text: '駅前の新しいパン屋さんに行ってみた', kana: 'えきまえのあたらしいぱんやさんにいってみた' },
  { text: '週末は家でゆっくり映画を観る予定です', kana: 'しゅうまつはいえでゆっくりえいがをみるよていです' },
  { text: '雨の日は図書館で本を読むのが好きです', kana: 'あめのひはとしょかんでほんをよむのがすきです' },
  { text: '冷たい麦茶を飲むと夏が来たと感じる', kana: 'つめたいむぎちゃをのむとなつがきたとかんじる' },
  { text: '毎日少しずつ練習すれば必ず上達します', kana: 'まいにちすこしずつれんしゅうすればかならずじょうたつします' },
  { text: '公園の桜が満開で写真を撮る人が多かった', kana: 'こうえんのさくらがまんかいでしゃしんをとるひとがおおかった' },
  { text: 'コンビニでおにぎりとお茶を買いました', kana: 'こんびにでおにぎりとおちゃをかいました' },
  { text: '新幹線の窓から富士山がきれいに見えた', kana: 'しんかんせんのまどからふじさんがきれいにみえた' },
  { text: 'キーボードを見ないで打てるようになりたい', kana: 'きーぼーどをみないでうてるようになりたい' },
  { text: '夕飯はカレーにしようと思っています', kana: 'ゆうはんはかれーにしようとおもっています' },
  { text: '天気がいいので洗濯物がよく乾きそうです', kana: 'てんきがいいのでせんたくものがよくかわきそうです' },
  { text: '近所の商店街で夏祭りが開かれます', kana: 'きんじょのしょうてんがいでなつまつりがひらかれます' },
  { text: '寝る前にスマホを見る時間を減らしたい', kana: 'ねるまえにすまほをみるじかんをへらしたい' },
  { text: '温かいお風呂に入ると疲れが取れます', kana: 'あたたかいおふろにはいるとつかれがとれます' },
  { text: '来月の旅行に向けて荷物を準備している', kana: 'らいげつのりょこうにむけてにもつをじゅんびしている' },
  { text: '会議の資料は前日までに共有してください', kana: 'かいぎのしりょうはぜんじつまでにきょうゆうしてください' },
  { text: '落ち葉を踏む音が秋の訪れを知らせる', kana: 'おちばをふむおとがあきのおとずれをしらせる' },
  { text: '冬の朝は布団から出るのに勇気がいる', kana: 'ふゆのあさはふとんからでるのにゆうきがいる' },
  { text: '猫が日なたで気持ちよさそうに眠っている', kana: 'ねこがひなたできもちよさそうにねむっている' },
  { text: '美術館でゆっくり絵を眺める時間が好きだ', kana: 'びじゅつかんでゆっくりえをながめるじかんがすきだ' },
  { text: '自転車で川沿いの道を走るのは気持ちいい', kana: 'じてんしゃでかわぞいのみちをはしるのはきもちいい' },
  { text: '新しいことを始めるのに遅すぎることはない', kana: 'あたらしいことをはじめるのにおそすぎることはない' },
  { text: '窓を開けると心地よい風が入ってきた', kana: 'まどをあけるとここちよいかぜがはいってきた' },
  { text: 'お弁当には卵焼きとからあげを入れた', kana: 'おべんとうにはたまごやきとからあげをいれた' },
  { text: '駅のホームで次の電車を待っています', kana: 'えきのほーむでつぎのでんしゃをまっています' },
  { text: '友達と久しぶりに電話で話しました', kana: 'ともだちとひさしぶりにでんわではなしました' },
  { text: '正しい姿勢で座ると肩がこりにくくなる', kana: 'ただしいしせいですわるとかたがこりにくくなる' },
  { text: '山の上から見る星空は本当にきれいだった', kana: 'やまのうえからみるほしぞらはほんとうにきれいだった' },
  { text: '朝ごはんをしっかり食べると一日元気に過ごせる', kana: 'あさごはんをしっかりたべるといちにちげんきにすごせる' },
  { text: '借りた本の返却日は来週の金曜日です', kana: 'かりたほんのへんきゃくびはらいしゅうのきんようびです' },
  { text: 'ゆっくり深呼吸をすると気持ちが落ち着きます', kana: 'ゆっくりしんこきゅうをするときもちがおちつきます' },
  { text: 'ファミレスでドリンクバーを頼んだ', kana: 'ふぁみれすでどりんくばーをたのんだ' },
  { text: '週に三回ジムに通うことにした', kana: 'しゅうにさんかいじむにかようことにした' },
];

/** Romaji spellings for single kana. The first entry is the one shown in the guide. */
const KANA_ROMAJI: Record<string, readonly string[]> = {
  あ: ['a'], い: ['i'], う: ['u', 'wu'], え: ['e'], お: ['o'],
  か: ['ka', 'ca'], き: ['ki'], く: ['ku', 'cu', 'qu'], け: ['ke'], こ: ['ko', 'co'],
  さ: ['sa'], し: ['shi', 'si', 'ci'], す: ['su'], せ: ['se', 'ce'], そ: ['so'],
  た: ['ta'], ち: ['chi', 'ti'], つ: ['tsu', 'tu'], て: ['te'], と: ['to'],
  な: ['na'], に: ['ni'], ぬ: ['nu'], ね: ['ne'], の: ['no'],
  は: ['ha'], ひ: ['hi'], ふ: ['fu', 'hu'], へ: ['he'], ほ: ['ho'],
  ま: ['ma'], み: ['mi'], む: ['mu'], め: ['me'], も: ['mo'],
  や: ['ya'], ゆ: ['yu'], よ: ['yo'],
  ら: ['ra'], り: ['ri'], る: ['ru'], れ: ['re'], ろ: ['ro'],
  わ: ['wa'], ゐ: ['wyi'], ゑ: ['wye'], を: ['wo'],
  が: ['ga'], ぎ: ['gi'], ぐ: ['gu'], げ: ['ge'], ご: ['go'],
  ざ: ['za'], じ: ['ji', 'zi'], ず: ['zu'], ぜ: ['ze'], ぞ: ['zo'],
  だ: ['da'], ぢ: ['di'], づ: ['du'], で: ['de'], ど: ['do'],
  ば: ['ba'], び: ['bi'], ぶ: ['bu'], べ: ['be'], ぼ: ['bo'],
  ぱ: ['pa'], ぴ: ['pi'], ぷ: ['pu'], ぺ: ['pe'], ぽ: ['po'],
  ゔ: ['vu'],
  ぁ: ['xa', 'la'], ぃ: ['xi', 'li'], ぅ: ['xu', 'lu'], ぇ: ['xe', 'le'], ぉ: ['xo', 'lo'],
  っ: ['xtu', 'ltu', 'xtsu', 'ltsu'],
  ゃ: ['xya', 'lya'], ゅ: ['xyu', 'lyu'], ょ: ['xyo', 'lyo'], ゎ: ['xwa', 'lwa'],
  ー: ['-'], '、': [','], '。': ['.'], '！': ['!'], '？': ['?'], '　': [' '],
};

/** Contracted sounds (拗音 and loanword combinations) typed as one unit. */
const COMBO_ROMAJI: Record<string, readonly string[]> = (() => {
  const out: Record<string, string[]> = {};
  const small = { ゃ: 'a', ゅ: 'u', ょ: 'o' } as const;
  // Regular rows: き → ky-, ぎ → gy-…
  const rows: Record<string, string> = { き: 'k', ぎ: 'g', に: 'n', ひ: 'h', び: 'b', ぴ: 'p', み: 'm', り: 'r' };
  for (const [kana, c] of Object.entries(rows)) {
    for (const [s, v] of Object.entries(small)) out[kana + s] = [`${c}y${v}`];
    out[kana + 'ぇ'] = [`${c}ye`];
    out[kana + 'ぃ'] = [`${c}yi`];
  }
  const add = (kana: string, ...romaji: string[]) => (out[kana] = romaji);
  add('しゃ', 'sha', 'sya'); add('しゅ', 'shu', 'syu'); add('しょ', 'sho', 'syo'); add('しぇ', 'she', 'sye');
  add('じゃ', 'ja', 'jya', 'zya'); add('じゅ', 'ju', 'jyu', 'zyu'); add('じょ', 'jo', 'jyo', 'zyo'); add('じぇ', 'je', 'jye', 'zye');
  add('ちゃ', 'cha', 'tya', 'cya'); add('ちゅ', 'chu', 'tyu', 'cyu'); add('ちょ', 'cho', 'tyo', 'cyo'); add('ちぇ', 'che', 'tye', 'cye');
  add('ぢゃ', 'dya'); add('ぢゅ', 'dyu'); add('ぢょ', 'dyo');
  add('てぃ', 'thi'); add('てゅ', 'thu'); add('でぃ', 'dhi'); add('でゅ', 'dhu');
  add('とぅ', 'twu'); add('どぅ', 'dwu');
  add('ふぁ', 'fa', 'fwa'); add('ふぃ', 'fi', 'fyi'); add('ふぇ', 'fe', 'fye'); add('ふぉ', 'fo', 'fwo'); add('ふゅ', 'fyu');
  add('うぃ', 'wi', 'whi'); add('うぇ', 'we', 'whe'); add('うぉ', 'who');
  add('ゔぁ', 'va'); add('ゔぃ', 'vi'); add('ゔぇ', 've'); add('ゔぉ', 'vo');
  add('つぁ', 'tsa'); add('つぃ', 'tsi'); add('つぇ', 'tse'); add('つぉ', 'tso');
  add('くぁ', 'kwa', 'qa');
  return out;
})();

const SMALL_KANA = new Set('ぁぃぅぇぉゃゅょゎ');

/** Katakana → hiragana (ー and other symbols are kept). */
export function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** Splits a reading into typing units: single kana, or a kana plus a small kana (しゃ, ふぁ…). */
export function splitKana(kana: string): string[] {
  const chars = [...toHiragana(kana)];
  const units: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const pair = chars[i] + (chars[i + 1] ?? '');
    if (chars[i + 1] && SMALL_KANA.has(chars[i + 1]) && COMBO_ROMAJI[pair]) {
      units.push(pair);
      i++;
    } else {
      units.push(chars[i]);
    }
  }
  return units;
}

/** One way to type the units starting at a position: `romaji` covers `span` units. */
export interface RomajiOption {
  romaji: string;
  span: number;
}

/** Spellings of one unit on its own (no look-ahead for ん / っ). */
function unitSpellings(unit: string): string[] {
  if (COMBO_ROMAJI[unit]) {
    // Also accept typing the two kana separately: しゃ = shi + xya.
    const [a, b] = [...unit];
    const split = (KANA_ROMAJI[a] ?? [a]).flatMap((x) => (KANA_ROMAJI[b] ?? [b]).map((y) => x + y));
    return [...COMBO_ROMAJI[unit], ...split];
  }
  if (unit === 'ん') return ['nn', 'xn'];
  return [...(KANA_ROMAJI[unit] ?? [unit.toLowerCase()])];
}

const VOWEL_N_Y = /^[aiueony]/;

/**
 * Every accepted spelling for the units starting at `i`, preferred first.
 * ん may be a single n when the next unit doesn't start with a vowel, n or y (kantan, but kinnyoubi);
 * っ may be written by doubling the next consonant (itte, matchi / macchi).
 */
export function romajiOptions(units: readonly string[], i: number): RomajiOption[] {
  const unit = units[i];
  if (unit === undefined) return [];
  const out: RomajiOption[] = [];
  const push = (romaji: string, span: number) => {
    if (!out.some((o) => o.romaji === romaji)) out.push({ romaji, span });
  };
  if (unit === 'ん') {
    const next = romajiOptions(units, i + 1);
    if (next.length && next.every((o) => !VOWEL_N_Y.test(o.romaji))) {
      for (const o of next) push('n' + o.romaji, 1 + o.span);
    }
    for (const r of unitSpellings(unit)) push(r, 1);
    return out;
  }
  if (unit === 'っ') {
    for (const o of romajiOptions(units, i + 1)) {
      const c = o.romaji[0];
      if (/[a-z]/.test(c) && !/[aiueon]/.test(c)) push(c + o.romaji, 1 + o.span);
      if (o.romaji.startsWith('ch')) push('t' + o.romaji, 1 + o.span); // Hepburn: matchi
    }
    for (const r of unitSpellings(unit)) push(r, 1);
    return out;
  }
  for (const r of unitSpellings(unit)) push(r, 1);
  return out;
}

export type KeyResult = 'ok' | 'miss' | 'done';

/** Matches romaji keystrokes against one kana reading. */
export class RomajiMatcher {
  readonly units: string[];
  /** Index of the first unit not yet completed. */
  pos = 0;
  /** Keys typed for the unit(s) in progress. */
  buffer = '';
  /** Every accepted key so far, in order. */
  typed = '';

  constructor(kana: string) {
    this.units = splitKana(kana);
  }

  get done(): boolean {
    return this.pos >= this.units.length;
  }

  /** Feeds one key (case-insensitive). Wrong keys return 'miss' and change nothing. */
  input(key: string): KeyResult {
    if (this.done) return 'done';
    const k = key.toLowerCase();
    const next = this.buffer + k;
    const options = romajiOptions(this.units, this.pos).filter((o) => o.romaji.startsWith(next));
    if (options.length === 0) return 'miss';
    this.buffer = next;
    this.typed += k;
    const exact = options.find((o) => o.romaji === next);
    if (exact) {
      this.pos += exact.span;
      this.buffer = '';
    }
    return this.done ? 'done' : 'ok';
  }

  /** Kana characters fully typed so far (for highlighting the reading). */
  get kanaDone(): number {
    return this.units.slice(0, this.pos).join('').length;
  }

  /** The rest of the romaji to type, following the spelling already started and preferred ones after it. */
  rest(): string {
    let out = '';
    let i = this.pos;
    if (this.buffer) {
      const o = romajiOptions(this.units, i).find((x) => x.romaji.startsWith(this.buffer))!;
      out += o.romaji.slice(this.buffer.length);
      i += o.span;
    }
    while (i < this.units.length) {
      const o = romajiOptions(this.units, i)[0];
      out += o.romaji;
      i += o.span;
    }
    return out;
  }
}

/** Preferred romaji for a whole reading: romajiGuide('しんかんせん') → 'shinkansenn'. */
export function romajiGuide(kana: string): string {
  return new RomajiMatcher(kana).rest();
}

/**
 * One timed Japanese attempt. Sentences come from `nextSentence` (shuffled corpus in the UI, fixed in
 * tests). Speed is correct keystrokes per minute; accuracy is correct keys / all keys.
 */
export class RomajiSession {
  phase: Phase = 'idle';
  startedAt = 0;
  endedAt = 0;
  keys = 0;
  misses = 0;
  completed = 0;
  sentence: JaSentence;
  matcher: RomajiMatcher;

  constructor(
    private readonly nextSentence: () => JaSentence,
    public readonly durationMs: number,
  ) {
    this.sentence = nextSentence();
    this.matcher = new RomajiMatcher(this.sentence.kana);
  }

  start(now: number): void {
    if (this.phase !== 'idle') return;
    this.phase = 'running';
    this.startedAt = now;
  }

  /** Feeds one key. 'done' means the sentence was finished and the next one is now loaded. */
  key(key: string, now: number): KeyResult | 'ignored' {
    if (this.phase === 'finished') return 'ignored';
    if (this.phase === 'idle') this.start(now);
    const r = this.matcher.input(key);
    if (r === 'miss') {
      this.misses++;
      return r;
    }
    this.keys++;
    if (r === 'done') {
      this.completed++;
      this.sentence = this.nextSentence();
      this.matcher = new RomajiMatcher(this.sentence.kana);
    }
    return r;
  }

  elapsed(now: number): number {
    if (this.phase === 'idle') return 0;
    if (this.phase === 'finished') return this.endedAt - this.startedAt;
    return Math.min(this.durationMs, Math.max(0, now - this.startedAt));
  }

  remaining(now: number): number {
    return this.durationMs - this.elapsed(now);
  }

  isOver(now: number): boolean {
    return this.phase === 'running' && now - this.startedAt >= this.durationMs;
  }

  finish(now: number): TypingResult {
    if (this.phase === 'running') {
      this.endedAt = Math.min(now, this.startedAt + this.durationMs);
      this.phase = 'finished';
    }
    return this.result(now);
  }

  result(now: number): TypingResult {
    const elapsedMs = this.elapsed(now);
    const minutes = Math.max(elapsedMs, 1000) / 60000;
    const total = this.keys + this.misses;
    return {
      lang: 'ja',
      speed: this.keys / minutes,
      cpm: this.keys / minutes,
      rawWpm: 0,
      accuracy: total > 0 ? (this.keys / total) * 100 : 100,
      correctChars: this.keys,
      uncorrected: 0,
      errors: this.misses,
      typedChars: total,
      elapsedMs,
    };
  }
}

/** Endless shuffled sentence supply without immediate repeats. */
export function sentenceFeed<T>(items: readonly T[], random: RandomSource = defaultRandom): () => T {
  let pool: T[] = [];
  let last: T | undefined;
  return () => {
    if (pool.length === 0) {
      pool = shuffled(items, random);
      if (pool[0] === last && pool.length > 1) [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    last = pool.shift()!;
    return last;
  };
}

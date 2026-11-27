// おみくじ: pure draw logic and the fortune texts. No DOM here.
// All texts are original writing for this tool; they are not taken from any shrine or temple.

export type Rng = () => number;

/** The year this おみくじ is written for. */
export const OMIKUJI_YEAR = 2027;
export const OMIKUJI_YEAR_LABEL = '2027年（令和9年）';

export type LevelId = 'daikichi' | 'chukichi' | 'shokichi' | 'kichi' | 'suekichi' | 'kyo';
/** Which set of category lines a level reads from. */
export type Tone = 'high' | 'mid' | 'low';

export interface Level {
  id: LevelId;
  label: string;
  reading: string;
  /** Relative chance of being drawn. The weights add up to 100, so each one is also a percentage. */
  weight: number;
  tone: Tone;
  /** One line shown in the list of levels. */
  meaning: string;
}

/**
 * Best to worst, in the order this tool uses. The weights are this tool's own choice:
 * shrines and temples each decide their own mix and most do not publish it.
 */
export const LEVELS: readonly Level[] = [
  { id: 'daikichi', label: '大吉', reading: 'だいきち', weight: 16, tone: 'high', meaning: 'いちばん良い運勢。勢いのあるときこそ、感謝と謙虚さを忘れずに。' },
  { id: 'chukichi', label: '中吉', reading: 'ちゅうきち', weight: 20, tone: 'high', meaning: '大吉に次ぐ良い運勢。着実に進めば、さらに伸びていきます。' },
  { id: 'shokichi', label: '小吉', reading: 'しょうきち', weight: 20, tone: 'mid', meaning: '小さな幸せに恵まれる運勢。日々の習慣を整えると育ちます。' },
  { id: 'kichi', label: '吉', reading: 'きち', weight: 22, tone: 'mid', meaning: '穏やかで安定した運勢。当たり前のことを続けるのが開運の近道。' },
  { id: 'suekichi', label: '末吉', reading: 'すえきち', weight: 14, tone: 'low', meaning: '後になるほど良くなる運勢。今は準備と積み重ねのとき。' },
  { id: 'kyo', label: '凶', reading: 'きょう', weight: 8, tone: 'low', meaning: '気を引き締める合図。慎重に過ごせば、ここから上向いていきます。' },
];

export const TOTAL_WEIGHT = LEVELS.reduce((sum, level) => sum + level.weight, 0);

export type CategoryId = 'negai' | 'machibito' | 'usemono' | 'ryoko' | 'akinai' | 'gakumon' | 'renai' | 'kenko' | 'kinun';

export const CATEGORIES: readonly { id: CategoryId; label: string }[] = [
  { id: 'negai', label: '願望' },
  { id: 'machibito', label: '待人' },
  { id: 'usemono', label: '失物' },
  { id: 'ryoko', label: '旅行' },
  { id: 'akinai', label: '商売' },
  { id: 'gakumon', label: '学問' },
  { id: 'renai', label: '恋愛' },
  { id: 'kenko', label: '健康' },
  { id: 'kinun', label: '金運' },
];

/** The sticks in the tube are numbered 1 to this. The number is drawn separately from the level. */
export const STICK_COUNT = 50;

export const OVERALL: Record<LevelId, readonly string[]> = {
  daikichi: [
    '雲ひとつない初日の出のような運気です。やりたいことには迷わず手を伸ばしてください。周りへの感謝を忘れなければ、良い流れは一年続きます。',
    '追い風が吹く一年です。長く温めてきた計画を動かすなら今。うまくいったときこそ、謙虚な気持ちを大切に。',
    '春を待たずに花が開くような、勢いのある運勢です。良い知らせは人と分け合うと、さらに大きくなって返ってきます。',
    '何を始めても形になりやすい年です。運に頼りきらず、日々の小さな積み重ねを続けることで、大吉は本物になります。',
  ],
  chukichi: [
    '穏やかな追い風の一年です。大きく跳ぶより、一歩ずつ着実に進むことで、気づけば遠くまで来ています。',
    '努力したぶんだけ、きちんと返ってくる運勢です。あと少しの丁寧さが、結果を一段引き上げます。',
    '満ちていく途中の月のような運気です。足りないものを数えるより、今あるものを育てましょう。',
    '良い流れの中にいます。人からの誘いや相談には、できるだけ応えてみてください。そこから次の縁がつながります。',
  ],
  shokichi: [
    '小さな幸せが、あちこちに隠れている一年です。足元をよく見て歩く人ほど、多く拾えます。',
    '派手さはなくても、穏やかで心地よい運勢です。毎日の習慣を整えると、運は少しずつ育っていきます。',
    '芽を出したばかりの若葉のような運気です。急いで引っぱらず、水をやるつもりでゆっくり育てましょう。',
    'ささやかな良いことが続く年です。うれしかったことを書き留めておくと、年の終わりには大きな束になります。',
  ],
  kichi: [
    '落ち着いた良い運勢です。当たり前のことを当たり前に続けることが、何よりの開運になります。',
    '波の少ない、安定した一年です。新しい挑戦は、しっかり準備をしてからなら吉と出ます。',
    '晴れのち晴れ、ときどき薄曇り。少しの曇りは気にせず、自分のペースで歩いていきましょう。',
    '良い運気が静かに流れています。人に親切にしたぶんだけ、巡り巡って自分に返ってくる年です。',
  ],
  suekichi: [
    '運が開けるのはこれからです。前半は力をためる時期と考えて、あせらず準備を進めましょう。後になるほど良くなります。',
    '遅咲きの花ほど、長く咲きます。今は結果を急がず、根を張ることに力を使いましょう。',
    '夜明け前のような運気です。まだ暗く見えても、空は少しずつ明るくなっています。続けていることを、やめないでください。',
    '今は控えめですが、伸びしろの大きい運勢です。小さな約束を守ることから、良い流れが始まります。',
  ],
  kyo: [
    '今がいちばん低いところで、ここから先は上がるだけです。無理をせず、早寝早起きと整理整頓から始めましょう。',
    '立ち止まって足元を見直す年です。慎重に進めば、大きな失敗は避けられます。用心深さが、いちばんのお守りになります。',
    '向かい風の日は、帆をたたんで力をためる日です。新しいことを急がず、今あるものを大切にすると、風向きは変わります。',
    '気を引き締めなさい、という知らせです。確認をひとつ増やし、約束には早めに動く。それだけで運は上向いていきます。',
  ],
};

export const LINES: Record<CategoryId, Record<Tone, readonly string[]>> = {
  negai: {
    high: [
      '思っていたより早く叶う。声に出して伝えると道がひらける',
      '叶う。支えてくれた人への感謝を忘れずに',
      '長く温めてきた願いほど、実を結ぶ年',
      '迷わず進めば叶う。最初の一歩は早めに',
    ],
    mid: [
      '時間はかかるが叶う。途中で投げ出さないこと',
      '願いをひとつに絞ると叶いやすい',
      '人の助けを借りて叶う。遠慮せず頼ってよい',
      '半分叶って、残りは来年の楽しみになる',
    ],
    low: [
      '今は準備のとき。足元を固めれば、やがて叶う',
      '願いの形を少し変えると、道が見えてくる',
      '欲ばらず、小さな目標から順に叶えていくとよい',
      'すぐには叶わないが、続けた分だけ近づく',
    ],
  },
  machibito: {
    high: [
      '来る。思いがけない良い知らせを連れてくる',
      '早く来る。こちらから連絡するとなおよい',
      '来る。懐かしい人との再会もある',
      '待たなくても、向こうからやって来る',
    ],
    mid: [
      '遅れるが来る。気長に待つとよい',
      '来る。約束の時間は念のため確かめておくこと',
      '便りが先に届く。返事は早めに',
      '忘れたころに来る。部屋を片づけて待つとよい',
    ],
    low: [
      'すぐには来ない。自分の用事を先に済ませておくとよい',
      '待つより、こちらから訪ねるほうが早い',
      '来るが長居はしない。伝えたいことは先にまとめておくこと',
      '行き違いに注意。連絡はこまめに',
    ],
  },
  usemono: {
    high: [
      '出る。いつも置く場所の近くをもう一度',
      'すぐ見つかる。かばんの底と上着のポケットを',
      '人が届けてくれる。お礼を忘れずに',
      '探している途中で、別の良いものも見つかる',
    ],
    mid: [
      '出るが時間がかかる。高いところより低いところを',
      '片づけの途中で出てくる',
      '家の中にある。あわてず順番に探すこと',
      '人に尋ねると手がかりが得られる',
    ],
    low: [
      '出にくい。置き場所を決めておくと、次から困らない',
      'あきらめかけたころに出る。大事なものには名前を',
      '見つかるまで日がかかる。早めに届け出ておくとよい',
      '探す前に、まず落ち着いて一日の動きを思い返すこと',
    ],
  },
  ryoko: {
    high: [
      'よい。行きたかった場所へ行くなら今年',
      '遠出も吉。旅先で良い縁に恵まれる',
      '大いによい。早めに計画すると、楽しみが長く続く',
      'どの方角も障りなし。思い出に残る旅になる',
    ],
    mid: [
      'よい。近場でも十分に楽しめる',
      '連れがいるとなおよい。予定は詰め込みすぎないこと',
      '行ってよい。忘れ物だけ気をつけて',
      '季節のよいころを選べば吉',
    ],
    low: [
      '急ぐ旅は控えめに。余裕のある日程なら差し支えない',
      '天気と時刻表をよく確かめてから出かけること',
      '遠くより近く。日帰りでゆっくり過ごすのがよい',
      '無理な計画は疲れのもと。休みを一日多めに取ること',
    ],
  },
  akinai: {
    high: [
      '利あり。新しいことを始めるのによい年',
      '繁盛する。評判が次の仕事を呼ぶ',
      '売り買いともによい。誠実さがいちばんの元手',
      '思いきった一手が実を結ぶ。準備は念入りに',
    ],
    mid: [
      '堅実に進めれば利あり。背伸びは禁物',
      '大きくは儲からないが損もない。信用を積むとき',
      '人の縁が仕事を運んでくる。挨拶を大切に',
      '後半に向けて上向く。前半は仕込みに使うとよい',
    ],
    low: [
      '広げるより守るとき。足元の数字を見直すこと',
      '急ぐと損をする。契約ごとはよく読んでから',
      '今は種まきの時期。目先の利を追わないこと',
      'うまい話には、一晩おいてから返事をすること',
    ],
  },
  gakumon: {
    high: [
      '努力がそのまま実る。自信を持って進め',
      'よく伸びる。苦手な科目に手をつける好機',
      '安心して励め。教えてくれた人への礼を忘れずに',
      '新しい分野に挑むとよい。覚えの早い年',
    ],
    mid: [
      '毎日少しずつが近道。一夜漬けは実らない',
      '基礎に戻ると伸びる。急がば回れ',
      '仲間と学ぶとはかどる。教え合うとよい',
      '結果は遅れて出る。焦らず続けること',
    ],
    low: [
      '気が散りやすい。机の上を片づけてから始めること',
      '欲ばらず、ひとつずつ確実に覚えること',
      '朝の時間を使うとよい。夜ふかしは控えめに',
      'わからないところを素直に尋ねれば、道がひらける',
    ],
  },
  renai: {
    high: [
      'よい縁あり。素直な言葉がいちばん届く',
      '思いは通じる。飾らない自分でいること',
      '出会いに恵まれる。誘いには出かけてみるとよい',
      '今の縁を大切にすれば、さらに深まる',
    ],
    mid: [
      'あせらず育てるとよい。相手の話をよく聞くこと',
      '身近なところに縁がある。見落とさないように',
      '言葉より行いで伝わる。小さな約束を守ること',
      'ゆっくり進む。人と比べず、自分たちの歩幅で',
    ],
    low: [
      '今は自分を磨くとき。良い縁は後からついてくる',
      '思い込みに注意。確かめてから動くこと',
      '追うより待つほうがよい。まずは毎日を機嫌よく過ごすこと',
      'すれ違いは、早めに言葉にして解くこと',
    ],
  },
  kenko: {
    high: [
      'すこやかに過ごせる。新しい運動を始めるのによい',
      '心身ともに充実。よく眠ればなおよい',
      '障りなし。旬のものを食べて力をつけること',
      '体がよく動く年。過信せず、健診は忘れずに',
    ],
    mid: [
      'おおむね良好。季節の変わり目だけ用心を',
      '歩くことを習慣にすると、調子が整う',
      '食べすぎ飲みすぎに気をつければ心配なし',
      '疲れをためないこと。休むのも務めのうち',
    ],
    low: [
      '無理は禁物。早寝を心がければ持ち直す',
      '小さな不調を放っておかないこと。早めの受診が吉',
      '冷えに注意。温かいものを選んで口にすること',
      'がんばりすぎの気配あり。予定をひとつ減らすとよい',
    ],
  },
  kinun: {
    high: [
      '入りが多い。人のために使うと、さらに巡る',
      '蓄えが増える。長く使うものを買うのによい',
      '思わぬ実入りあり。浮かれず半分は貯めておくこと',
      '努力に見合う報酬がある。学びへの出費は惜しまずに',
    ],
    mid: [
      '出入りは同じくらい。家計簿をつけると残る',
      'こつこつ貯めるのによい年。一獲千金は狙わないこと',
      '必要なものには使ってよい。衝動買いだけ用心',
      '小さな節約が、年の終わりに大きな差になる',
    ],
    low: [
      '出費がかさむ。財布のひもは固めに',
      '貸し借りは控えること。約束は書面に残すと安心',
      '買う前に三日考えること。本当に要るものだけが残る',
      '今は守りのとき。毎月決まって出ていくお金を見直すとよい',
    ],
  },
};

export const DIRECTIONS: readonly string[] = ['東', '西', '南', '北', '東南', '南西', '北東', '北西'];
export const COLORS: readonly string[] = ['白', '赤', '黄', '緑', '青', '紫', '金', '橙', '桃', '紺'];

export interface FortuneItem {
  id: CategoryId;
  label: string;
  text: string;
}

export interface Fortune {
  level: Level;
  /** Stick number, 1..STICK_COUNT. */
  number: number;
  overall: string;
  items: FortuneItem[];
  direction: string;
  color: string;
}

/** Index 0..length-1 from an RNG that returns [0, 1). Out-of-range RNG values are clamped. */
export function pickIndex(length: number, rng: Rng = Math.random): number {
  if (length <= 0) throw new Error('Cannot pick from an empty list');
  const r = rng();
  if (!(r >= 0)) return 0;
  return Math.min(length - 1, Math.floor(r * length));
}

export function pick<T>(list: readonly T[], rng: Rng = Math.random): T {
  return list[pickIndex(list.length, rng)];
}

/** Weighted pick: an entry's chance is its weight divided by the total. Entries with weight <= 0 never come up. */
export function pickWeighted<T extends { weight: number }>(entries: readonly T[], rng: Rng = Math.random): T {
  const usable = entries.filter((e) => e.weight > 0);
  if (usable.length === 0) throw new Error('No entry with a positive weight');
  const total = usable.reduce((sum, e) => sum + e.weight, 0);
  const r = rng();
  let point = (r >= 0 ? Math.min(r, 1 - Number.EPSILON) : 0) * total;
  for (const entry of usable) {
    if (point < entry.weight) return entry;
    point -= entry.weight;
  }
  return usable[usable.length - 1];
}

export function levelById(id: LevelId): Level {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}

/** Chance of a level in percent. */
export function levelPercent(level: Level): number {
  return (level.weight / TOTAL_WEIGHT) * 100;
}

/** Assemble the slip for a given level: one overall message, one line per category, a direction and a color. */
export function buildFortune(level: Level, number: number, rng: Rng = Math.random): Fortune {
  const overall = pick(OVERALL[level.id], rng);
  const items = CATEGORIES.map((c) => ({ id: c.id, label: c.label, text: pick(LINES[c.id][level.tone], rng) }));
  return { level, number, overall, items, direction: pick(DIRECTIONS, rng), color: pick(COLORS, rng) };
}

/** One full draw. The RNG is read in a fixed order: level, stick number, then the texts. */
export function drawFortune(rng: Rng = Math.random): Fortune {
  const level = pickWeighted(LEVELS, rng);
  const number = pickIndex(STICK_COUNT, rng) + 1;
  return buildFortune(level, number, rng);
}

const KANJI_DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 1..99 in kanji numerals: 7 → 七, 10 → 十, 12 → 十二, 40 → 四十. */
export function kanjiNumber(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new Error(`kanjiNumber supports 1 to 99: ${n}`);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (tens === 0 ? '' : tens === 1 ? '十' : `${KANJI_DIGITS[tens]}十`) + KANJI_DIGITS[ones];
}

/** 「第十二番」 */
export function stickLabel(n: number): string {
  return `第${kanjiNumber(n)}番`;
}

/** Plain text of a slip, for copying and sharing. */
export function fortuneText(fortune: Fortune): string {
  return [
    `【おみくじ ${OMIKUJI_YEAR}】${stickLabel(fortune.number)} ${fortune.level.label}`,
    fortune.overall,
    '',
    ...fortune.items.map((item) => `${item.label}：${item.text}`),
    '',
    `吉方：${fortune.direction}　幸運の色：${fortune.color}`,
  ].join('\n');
}

/* ---------- Draw counts (remembered in the browser) ---------- */

export type Counts = Record<LevelId, number>;

export function emptyCounts(): Counts {
  return { daikichi: 0, chukichi: 0, shokichi: 0, kichi: 0, suekichi: 0, kyo: 0 };
}

/** Whatever was stored → valid counts. Anything that is not a non-negative integer becomes 0. */
export function normalizeCounts(value: unknown): Counts {
  const counts = emptyCounts();
  if (typeof value !== 'object' || value === null) return counts;
  for (const level of LEVELS) {
    const n = (value as Record<string, unknown>)[level.id];
    if (typeof n === 'number' && Number.isInteger(n) && n > 0) counts[level.id] = n;
  }
  return counts;
}

export function addCount(counts: Counts, id: LevelId): Counts {
  return { ...counts, [id]: counts[id] + 1 };
}

export function totalCount(counts: Counts): number {
  return LEVELS.reduce((sum, level) => sum + counts[level.id], 0);
}

/* ---------- Shaking the phone ---------- */

export interface ShakeOptions {
  /** Acceleration without gravity, in m/s², that counts as one jolt. */
  threshold?: number;
  /** Jolts needed to call it a shake. */
  jolts?: number;
  /** The jolts must all fall inside this window. */
  windowMs?: number;
  /** Samples closer together than this belong to the same jolt. */
  gapMs?: number;
}

/**
 * Feed it the size of the acceleration (gravity removed) and a timestamp for every motion sample.
 * It returns true once when enough separate jolts arrive close together, then starts counting again.
 */
export function createShakeDetector(options: ShakeOptions = {}): (magnitude: number, timeMs: number) => boolean {
  const { threshold = 13, jolts = 3, windowMs = 1000, gapMs = 90 } = options;
  let hits: number[] = [];
  return (magnitude, timeMs) => {
    if (!(magnitude >= threshold)) return false;
    hits = hits.filter((t) => timeMs - t <= windowMs && timeMs >= t);
    const last = hits[hits.length - 1];
    if (last !== undefined && timeMs - last < gapMs) return false;
    hits.push(timeMs);
    if (hits.length < jolts) return false;
    hits = [];
    return true;
  };
}

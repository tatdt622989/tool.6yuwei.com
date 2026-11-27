import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export type RankId = 'sloth' | 'turtle' | 'rabbit' | 'cheetah' | 'falcon' | 'lightning' | 'supersonic' | 'machine';

export interface Strings {
  modeAria: string;
  reset: string;
  statTime: string;
  statClicks: string;
  statLive: string;
  padAria: string;
  resultLabel: string;
  ladderAria: string;
  chartLabel: string;
  bestsLabel: string;
  clear: string;
  thMode: string;
  thBest: string;
  thRank: string;
  hint: string;
  client: {
    /** Mode name: {n} seconds. */
    sec: string;
    /** {s} = mode name ({sec}). */
    bestLabel: string;
    idleMain: string;
    idleSub: string;
    runningSub: string;
    /** {rank} */
    doneSubWait: string;
    doneSubReady: string;
    /** {s} seconds (raw), {n} clicks (raw), {cps}, {clicks} (plural), {secs} (plural). */
    summary: string;
    clicks: PluralForms;
    secs: PluralForms;
    /** {s} {secs} */
    summaryNew: string;
    /** {s} {secs} {best} */
    summaryBest: string;
    /** {min} */
    ladderTitle: string;
    /** {i} {v} */
    barTitle: string;
    /** {fast} {slow} */
    barsAria: string;
    ranks: Record<RankId, { label: string; note: string }>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '測試時間',
    reset: '重新開始',
    statTime: '剩餘秒數',
    statClicks: '點擊次數',
    statLive: '即時 CPS',
    padAria: '點擊區，點擊或按空白鍵計分',
    resultLabel: '你的點擊速度',
    ladderAria: '等級',
    chartLabel: '每秒點擊次數',
    bestsLabel: '各模式最佳紀錄',
    clear: '清除紀錄',
    thMode: '測試時間',
    thBest: '最佳 CPS',
    thRank: '等級',
    hint: '紀錄只保存在這台裝置的瀏覽器中，不會上傳。',
    client: {
      sec: '{n} 秒',
      bestLabel: '{s}最佳紀錄',
      idleMain: '點這裡開始',
      idleSub: '第一下點擊就開始計時，也可以按空白鍵',
      runningSub: '繼續點，越快越好',
      doneSubWait: '{rank}｜稍等一下即可再測一次',
      doneSubReady: '{rank}｜點擊或按空白鍵再測一次',
      summary: '{s} 秒內點擊 {n} 下，平均每秒 {cps} 下。',
      clicks: { other: '{n} 下' },
      secs: { other: '{n} 秒' },
      summaryNew: '這是你目前的 {s} 秒最佳紀錄。',
      summaryBest: '你的 {s} 秒最佳紀錄是 {best} CPS。',
      ladderTitle: '{min} CPS 以上',
      barTitle: '第 {i} 秒：{v} 下',
      barsAria: '每秒點擊次數，最快的一秒 {fast} 下，最慢的一秒 {slow} 下',
      ranks: {
        sloth: { label: '樹懶', note: '慢慢來，先找到順手的點擊姿勢' },
        turtle: { label: '烏龜', note: '比一般人慢一些，多練幾次就會進步' },
        rabbit: { label: '兔子', note: '一般人的正常水準' },
        cheetah: { label: '獵豹', note: '比大多數人快，手指很靈活' },
        falcon: { label: '獵鷹', note: '遊戲玩家等級，可能已經會用 Jitter 點擊' },
        lightning: { label: '閃電', note: 'Jitter 高手的水準' },
        supersonic: { label: '超音速', note: '蝴蝶點擊或拖曳點擊才可能達到' },
        machine: { label: '連點器等級', note: '已接近或超過人類極限' },
      },
    },
  },
  en: {
    modeAria: 'Test length',
    reset: 'Restart',
    statTime: 'Seconds left',
    statClicks: 'Clicks',
    statLive: 'Live CPS',
    padAria: 'Click area. Click or press Space to score',
    resultLabel: 'Your click speed',
    ladderAria: 'Ranks',
    chartLabel: 'Clicks per second',
    bestsLabel: 'Your best scores',
    clear: 'Clear scores',
    thMode: 'Test length',
    thBest: 'Best CPS',
    thRank: 'Rank',
    hint: 'Scores are saved only in this browser on this device. Nothing is uploaded.',
    client: {
      sec: '{n} sec',
      bestLabel: 'Best ({s})',
      idleMain: 'Click here to start',
      idleSub: 'The timer starts on your first click. You can also press Space',
      runningSub: 'Keep clicking, as fast as you can',
      doneSubWait: '{rank} · Wait a moment to go again',
      doneSubReady: '{rank} · Click or press Space to go again',
      summary: '{clicks} in {secs}, an average of {cps} clicks per second.',
      clicks: { one: '{n} click', other: '{n} clicks' },
      secs: { one: '{n} second', other: '{n} seconds' },
      summaryNew: ' That’s a new personal best for {secs}.',
      summaryBest: ' Your best for {secs} is {best} CPS.',
      ladderTitle: '{min}+ CPS',
      barTitle: 'Second {i}: {v}',
      barsAria: 'Clicks per second. Fastest second: {fast}, slowest second: {slow}',
      ranks: {
        sloth: { label: 'Sloth', note: 'Take your time and find a comfortable grip first' },
        turtle: { label: 'Turtle', note: 'A little below average. A few more tries will help' },
        rabbit: { label: 'Rabbit', note: 'Right around the average for most people' },
        cheetah: { label: 'Cheetah', note: 'Faster than most people, with nimble fingers' },
        falcon: { label: 'Falcon', note: 'Gamer level. You may already be jitter clicking' },
        lightning: { label: 'Lightning', note: 'Skilled jitter clicker territory' },
        supersonic: { label: 'Supersonic', note: 'Usually only reachable with butterfly or drag clicking' },
        machine: { label: 'Autoclicker', note: 'At or beyond the limit of human clicking' },
      },
    },
  },
  ja: {
    modeAria: '測定時間',
    reset: 'やり直す',
    statTime: '残り秒数',
    statClicks: 'クリック数',
    statLive: '現在の CPS',
    padAria: 'クリックエリア。クリックまたはスペースキーでカウント',
    resultLabel: 'あなたのクリック速度',
    ladderAria: 'ランク',
    chartLabel: '1 秒ごとのクリック数',
    bestsLabel: 'モード別の自己ベスト',
    clear: '記録を消去',
    thMode: '測定時間',
    thBest: 'ベスト CPS',
    thRank: 'ランク',
    hint: '記録はこの端末のブラウザにだけ保存され、送信されることはありません。',
    client: {
      sec: '{n} 秒',
      bestLabel: '{s}の自己ベスト',
      idleMain: 'ここをクリックしてスタート',
      idleSub: '最初のクリックで計測開始。スペースキーでも測れます',
      runningSub: 'そのまま連打。できるだけ速く',
      doneSubWait: '{rank}｜少し待つともう一度測れます',
      doneSubReady: '{rank}｜クリックかスペースキーでもう一度',
      summary: '{s} 秒間に {n} 回クリック、1 秒あたり平均 {cps} 回です。',
      clicks: { other: '{n} 回' },
      secs: { other: '{n} 秒' },
      summaryNew: '{s} 秒モードの自己ベストを更新しました。',
      summaryBest: '{s} 秒モードの自己ベストは {best} CPS です。',
      ladderTitle: '{min} CPS 以上',
      barTitle: '{i} 秒目：{v} 回',
      barsAria: '1 秒ごとのクリック数。最も速い 1 秒は {fast} 回、最も遅い 1 秒は {slow} 回',
      ranks: {
        sloth: { label: 'ナマケモノ', note: 'まずは押しやすい持ち方を見つけましょう' },
        turtle: { label: 'カメ', note: '平均より少しゆっくり。何回か練習すると伸びます' },
        rabbit: { label: 'ウサギ', note: '一般的な人の平均レベル' },
        cheetah: { label: 'チーター', note: '多くの人より速く、指がよく動いています' },
        falcon: { label: 'ハヤブサ', note: 'ゲーマー級。すでに痙攣打ちができているかも' },
        lightning: { label: 'イナズマ', note: '痙攣打ち（ジッタークリック）の上級者レベル' },
        supersonic: { label: '超音速', note: 'バタフライクリックやドラッグクリックの領域' },
        machine: { label: '連打ツール級', note: '人間の限界に近い、またはそれ以上' },
      },
    },
  },
});

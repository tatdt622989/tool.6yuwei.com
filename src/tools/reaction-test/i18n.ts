import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export type RatingId = 'elite' | 'fast' | 'good' | 'average' | 'slow' | 'slower';

export interface Strings {
  /** Initial round line; {n} rounds. */
  roundTotal: string;
  roundsAria: string;
  statAvg: string;
  statBest: string;
  statEarly: string;
  statRecord: string;
  /** {n} rounds */
  resultLabel: string;
  unit: string;
  scaleBand: string;
  restart: string;
  clear: string;
  hint: string;
  client: {
    /** {i} */
    roundLabel: string;
    suspect: string;
    /** Short value with unit: {ms} */
    msShort: string;
    titleIdle: string;
    textIdle: string;
    titlePaused: string;
    /** {round} */
    textContinue: string;
    titleWaiting: string;
    textWaiting: string;
    titleGo: string;
    textGo: string;
    titleEarly: string;
    textEarly: string;
    /** {ms} */
    titleResult: string;
    /** {next} */
    textResult: string;
    /** {avg} */
    titleDone: string;
    /** {rating} */
    textDone: string;
    /** {n} */
    roundDone: string;
    /** {round} {n} */
    roundOf: string;
    /** {best} {worst} {median} */
    summary: string;
    summaryNew: string;
    /** {record} */
    summaryRecord: string;
    /** {times} */
    summaryEarly: string;
    times: PluralForms;
    announceWaiting: string;
    announceGo: string;
    announceEarly: string;
    /** {ms} */
    announceResult: string;
    /** {avg} */
    announceDone: string;
    ratings: Record<RatingId, { label: string; note: string }>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    roundTotal: '共 {n} 回合',
    roundsAria: '各回合成績',
    statAvg: '本次平均（毫秒）',
    statBest: '本次最快（毫秒）',
    statEarly: '太早點擊次數',
    statRecord: '最佳平均紀錄',
    resultLabel: '{n} 回合平均反應時間',
    unit: '毫秒',
    scaleBand: '一般成人常見範圍',
    restart: '重新開始',
    clear: '清除紀錄',
    hint: '計時使用瀏覽器的高精度時鐘（performance.now），成績只保存在你的瀏覽器中，不會上傳。',
    client: {
      roundLabel: '第 {i} 回',
      suspect: '低於 100 毫秒，可能是預判',
      msShort: '{ms} ms',
      titleIdle: '反應速度測試',
      textIdle: '畫面變成綠色時立刻點擊。點這裡或按空白鍵開始',
      titlePaused: '已暫停',
      textContinue: '點這裡或按空白鍵繼續第 {round} 回合',
      titleWaiting: '等待綠色',
      textWaiting: '畫面變成綠色時立刻點擊，現在先別點',
      titleGo: '點！',
      textGo: '現在點擊',
      titleEarly: '太早了',
      textEarly: '還沒變綠就點擊，這次不計分。點擊重試這一回合',
      titleResult: '{ms} 毫秒',
      textResult: '點擊或按空白鍵進行第 {next} 回合',
      titleDone: '平均 {avg} 毫秒',
      textDone: '{rating}｜點擊或按空白鍵再測一次',
      roundDone: '已完成 {n} 回合',
      roundOf: '第 {round} / {n} 回合',
      summary: '最快 {best} 毫秒、最慢 {worst} 毫秒、中位數 {median} 毫秒。',
      summaryNew: '這是你目前的最佳平均紀錄。',
      summaryRecord: '你的最佳平均紀錄是 {record} 毫秒。',
      summaryEarly: '過程中太早點擊 {times}。',
      times: { other: '{n} 次' },
      announceWaiting: '等待綠色',
      announceGo: '點！',
      announceEarly: '太早了，這次不計分',
      announceResult: '{ms} 毫秒',
      announceDone: '完成，平均 {avg} 毫秒',
      ratings: {
        elite: { label: '頂尖', note: '電競選手等級的反應速度' },
        fast: { label: '很快', note: '明顯快於一般人' },
        good: { label: '優於平均', note: '比多數人稍快' },
        average: { label: '一般', note: '落在一般成人的常見範圍' },
        slow: { label: '稍慢', note: '可能受裝置延遲或專注度影響' },
        slower: { label: '偏慢', note: '休息一下、換有線滑鼠再測試看看' },
      },
    },
  },
  en: {
    roundTotal: '{n} rounds',
    roundsAria: 'Round results',
    statAvg: 'Average (ms)',
    statBest: 'Fastest (ms)',
    statEarly: 'Too-early clicks',
    statRecord: 'Best average',
    resultLabel: 'Average reaction time over {n} rounds',
    unit: 'ms',
    scaleBand: 'Typical adult range',
    restart: 'Restart',
    clear: 'Clear records',
    hint: 'Timing uses your browser’s high-resolution clock (performance.now). Scores are saved only in your browser and never uploaded.',
    client: {
      roundLabel: 'Round {i}',
      suspect: 'Under 100 ms, probably an anticipated click',
      msShort: '{ms} ms',
      titleIdle: 'Reaction time test',
      textIdle: 'Click the moment the screen turns green. Click here or press Space to start',
      titlePaused: 'Paused',
      textContinue: 'Click here or press Space to continue with round {round}',
      titleWaiting: 'Wait for green',
      textWaiting: 'Click as soon as it turns green. Don’t click yet',
      titleGo: 'Click!',
      textGo: 'Click now',
      titleEarly: 'Too soon',
      textEarly: 'You clicked before green, so this one doesn’t count. Click to retry the round',
      titleResult: '{ms} ms',
      textResult: 'Click or press Space for round {next}',
      titleDone: 'Average {avg} ms',
      textDone: '{rating} · Click or press Space to try again',
      roundDone: 'All {n} rounds done',
      roundOf: 'Round {round} of {n}',
      summary: 'Fastest {best} ms, slowest {worst} ms, median {median} ms.',
      summaryNew: ' That’s your best average so far.',
      summaryRecord: ' Your best average is {record} ms.',
      summaryEarly: ' You clicked too early {times}.',
      times: { one: 'once', other: '{n} times' },
      announceWaiting: 'Wait for green',
      announceGo: 'Click!',
      announceEarly: 'Too soon, this one doesn’t count',
      announceResult: '{ms} milliseconds',
      announceDone: 'Done. Average {avg} milliseconds',
      ratings: {
        elite: { label: 'Elite', note: 'Pro gamer level reflexes' },
        fast: { label: 'Very fast', note: 'Clearly faster than most people' },
        good: { label: 'Above average', note: 'A bit quicker than most people' },
        average: { label: 'Average', note: 'Within the typical range for adults' },
        slow: { label: 'A bit slow', note: 'Device lag or focus may be holding you back' },
        slower: { label: 'Slow', note: 'Take a break, try a wired mouse and test again' },
      },
    },
  },
  ja: {
    roundTotal: '全 {n} 回',
    roundsAria: '各回の結果',
    statAvg: '今回の平均（ミリ秒）',
    statBest: '今回の最速（ミリ秒）',
    statEarly: 'フライング回数',
    statRecord: '平均の自己ベスト',
    resultLabel: '{n} 回の平均反応時間',
    unit: 'ミリ秒',
    scaleBand: '一般的な成人の範囲',
    restart: 'やり直す',
    clear: '記録を消去',
    hint: '計測にはブラウザの高精度タイマー（performance.now）を使っています。記録はお使いのブラウザにだけ保存され、送信されることはありません。',
    client: {
      roundLabel: '{i} 回目',
      suspect: '100 ミリ秒未満。予測で押した可能性があります',
      msShort: '{ms} ms',
      titleIdle: '反応速度テスト',
      textIdle: '画面が緑になった瞬間にクリック。ここをクリックするかスペースキーでスタート',
      titlePaused: '一時停止中',
      textContinue: 'ここをクリックするかスペースキーで {round} 回目を再開',
      titleWaiting: '緑になるまで待って',
      textWaiting: '緑になったらすぐクリック。まだ押さないで',
      titleGo: '今！',
      textGo: 'クリック',
      titleEarly: 'フライング',
      textEarly: '緑になる前にクリックしたため、今回はノーカウントです。クリックでこの回をやり直します',
      titleResult: '{ms} ミリ秒',
      textResult: 'クリックかスペースキーで {next} 回目へ',
      titleDone: '平均 {avg} ミリ秒',
      textDone: '{rating}｜クリックかスペースキーでもう一度',
      roundDone: '全 {n} 回終了',
      roundOf: '{round} / {n} 回目',
      summary: '最速 {best} ミリ秒、最遅 {worst} ミリ秒、中央値 {median} ミリ秒。',
      summaryNew: '平均の自己ベストを更新しました。',
      summaryRecord: '平均の自己ベストは {record} ミリ秒です。',
      summaryEarly: '途中でフライングが {times}ありました。',
      times: { other: '{n} 回' },
      announceWaiting: '緑になるまで待って',
      announceGo: '今！',
      announceEarly: 'フライング。今回はノーカウントです',
      announceResult: '{ms} ミリ秒',
      announceDone: '終了。平均 {avg} ミリ秒',
      ratings: {
        elite: { label: 'トップクラス', note: 'プロゲーマー並みの反応速度' },
        fast: { label: 'とても速い', note: '一般的な人よりはっきり速い' },
        good: { label: '平均より速い', note: '多くの人より少し速い' },
        average: { label: '平均的', note: '一般的な成人の範囲内' },
        slow: { label: 'やや遅め', note: '端末の遅延や集中力が影響しているかもしれません' },
        slower: { label: '遅め', note: '少し休んで、有線マウスでもう一度試してみましょう' },
      },
    },
  },
});

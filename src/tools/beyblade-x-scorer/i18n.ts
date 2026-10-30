import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { Finish } from './logic';

export interface Strings {
  targetAria: string;
  /** {n} points */
  targetOption: string;
  modeAria: string;
  mode1: string;
  mode3: string;
  nameAria: string;
  beyLabel: string;
  beyPlaceholder: string;
  deckLabel: string;
  /** {n} = slot number */
  deckPlaceholder: string;
  currentAria: string;
  fullscreen: string;
  exitFullscreen: string;
  draw: string;
  undo: string;
  reset: string;
  nextMatch: string;
  logTitle: string;
  statsTitle: string;
  statsHint: string;
  exportCsv: string;
  clearHistory: string;
  colBey: string;
  colBattles: string;
  colRecord: string;
  colWinRate: string;
  colInterval: string;
  colPoints: string;
  colFinishes: string;
  disclaimer: string;
  client: {
    defaultNames: [string, string];
    finish: Record<Finish, string>;
    /** {n} points */
    pointsShort: string;
    drawName: string;
    /** {n} points still needed */
    toWin: PluralForms;
    /** {name} {a} {b} */
    winner: string;
    /** {n} round, {name} player, {bey} Beyblade (may be empty), {finish}, {pts} */
    roundLine: string;
    /** {n} */
    drawLine: string;
    /** {name} {bey} */
    withBey: string;
    logEmpty: string;
    statsEmpty: string;
    statMatches: string;
    statBattles: string;
    statPerMatch: string;
    /** {name} finish share label */
    statShare: string;
    /** {w} wins {l} losses {d} draws */
    record: string;
    smallSample: string;
    /** {name} {n} */
    finishCount: string;
    listSeparator: string;
    confirmClear: string;
    csvHeaders: string[];
    csvFile: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    targetAria: '獲勝分數',
    targetOption: '{n} 分',
    modeAria: '賽制',
    mode1: '1on1',
    mode3: '3on3',
    nameAria: '玩家名稱',
    beyLabel: '陀螺組合（選填）',
    beyPlaceholder: '例：DranSword 3-60F',
    deckLabel: '3on3 陣容（點選目前出場的陀螺）',
    deckPlaceholder: '第 {n} 顆',
    currentAria: '目前出場',
    fullscreen: '全螢幕計分',
    exitFullscreen: '離開全螢幕',
    draw: '平手',
    undo: '復原上一回合',
    reset: '重新開始',
    nextMatch: '開始下一場',
    logTitle: '本場紀錄',
    statsTitle: '陀螺勝率統計',
    statsHint: '每打完一場會自動存到這台裝置的瀏覽器，只統計有填陀螺名稱的回合。',
    exportCsv: '匯出 CSV',
    clearHistory: '清除紀錄',
    colBey: '陀螺',
    colBattles: '回合',
    colRecord: '勝-負-平',
    colWinRate: '勝率',
    colInterval: '95% 可信區間',
    colPoints: '每回合得分',
    colFinishes: '勝法',
    disclaimer: '本工具為玩家自製的非官方工具，與 TAKARA TOMY 無關。計分依官方標準規則，實際賽制請以主辦單位公告為準。',
    client: {
      defaultNames: ['玩家 A', '玩家 B'],
      finish: { spin: '旋轉', over: '擊飛', burst: '爆裂', xtreme: '極限' },
      pointsShort: '+{n}',
      drawName: '平手',
      toWin: { other: '還差 {n} 分' },
      winner: '{name} 獲勝，{a} 比 {b}',
      roundLine: '第 {n} 回合：{name}{bey} {finish} +{pts}',
      drawLine: '第 {n} 回合：平手',
      withBey: '（{bey}）',
      logEmpty: '按下玩家下方的勝法按鈕開始記分。',
      statsEmpty: '還沒有完成的比賽。打完一場後，這裡會顯示每顆陀螺的勝率。',
      statMatches: '比賽場數',
      statBattles: '回合數',
      statPerMatch: '每場平均回合',
      statShare: '{name}占比',
      record: '{w}-{l}-{d}',
      smallSample: '樣本少',
      finishCount: '{name} {n}',
      listSeparator: '、',
      confirmClear: '再按一次確認清除',
      csvHeaders: ['場次', '日期', '回合', '玩家 1', '陀螺 1', '玩家 2', '陀螺 2', '勝方', '勝法', '得分'],
      csvFile: '戰鬥陀螺對戰紀錄.csv',
    },
  },
  en: {
    targetAria: 'Points to win',
    targetOption: '{n} pts',
    modeAria: 'Format',
    mode1: '1on1',
    mode3: '3on3',
    nameAria: 'Player name',
    beyLabel: 'Combo (optional)',
    beyPlaceholder: 'e.g. DranSword 3-60F',
    deckLabel: '3on3 deck (tap the Beyblade in play)',
    deckPlaceholder: 'Bey {n}',
    currentAria: 'In play',
    fullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    draw: 'Draw',
    undo: 'Undo last battle',
    reset: 'Reset',
    nextMatch: 'Next match',
    logTitle: 'This match',
    statsTitle: 'Win rate by Beyblade',
    statsHint: 'Each finished match is saved in this browser. Only battles with a Beyblade name count.',
    exportCsv: 'Export CSV',
    clearHistory: 'Clear history',
    colBey: 'Beyblade',
    colBattles: 'Battles',
    colRecord: 'W-L-D',
    colWinRate: 'Win rate',
    colInterval: '95% range',
    colPoints: 'Points per battle',
    colFinishes: 'Wins by finish',
    disclaimer: 'An unofficial fan-made tool, not affiliated with TAKARA TOMY or Hasbro. Scoring follows the standard official rules; always check the rules of your event.',
    client: {
      defaultNames: ['Player A', 'Player B'],
      finish: { spin: 'Spin', over: 'Over', burst: 'Burst', xtreme: 'Xtreme' },
      pointsShort: '+{n}',
      drawName: 'Draw',
      toWin: { one: '{n} point to win', other: '{n} points to win' },
      winner: '{name} wins {a}–{b}',
      roundLine: 'Battle {n}: {name}{bey} {finish} finish +{pts}',
      drawLine: 'Battle {n}: draw',
      withBey: ' ({bey})',
      logEmpty: 'Tap a finish under a player to start scoring.',
      statsEmpty: 'No finished matches yet. Win rates for each Beyblade appear here after your first match.',
      statMatches: 'Matches',
      statBattles: 'Battles',
      statPerMatch: 'Battles per match',
      statShare: '{name} finishes',
      record: '{w}-{l}-{d}',
      smallSample: 'small sample',
      finishCount: '{name} {n}',
      listSeparator: ', ',
      confirmClear: 'Tap again to clear',
      csvHeaders: ['Match', 'Date', 'Battle', 'Player 1', 'Beyblade 1', 'Player 2', 'Beyblade 2', 'Winner', 'Finish', 'Points'],
      csvFile: 'beyblade-x-battles.csv',
    },
  },
  ja: {
    targetAria: '勝利ポイント',
    targetOption: '{n}pt',
    modeAria: 'バトル形式',
    mode1: '1on1',
    mode3: '3on3',
    nameAria: 'プレイヤー名',
    beyLabel: 'ベイの組み合わせ（任意）',
    beyPlaceholder: '例：ドランソード 3-60F',
    deckLabel: '3on3 デッキ（出場中のベイをタップ）',
    deckPlaceholder: '{n} 機目',
    currentAria: '出場中',
    fullscreen: '全画面で記録',
    exitFullscreen: '全画面を終了',
    draw: '引き分け',
    undo: '1 つ戻す',
    reset: 'リセット',
    nextMatch: '次の試合へ',
    logTitle: 'この試合の記録',
    statsTitle: 'ベイ別の勝率',
    statsHint: '試合が終わるたびにこのブラウザに自動保存されます。ベイの名前を入力したバトルだけを集計します。',
    exportCsv: 'CSV で書き出す',
    clearHistory: '記録を消去',
    colBey: 'ベイ',
    colBattles: 'バトル数',
    colRecord: '勝-敗-分',
    colWinRate: '勝率',
    colInterval: '95% 信頼区間',
    colPoints: '1 バトルあたりの得点',
    colFinishes: '勝ち方',
    disclaimer: 'ファンが作った非公式ツールで、タカラトミーとは関係ありません。得点は公式の標準ルールに沿っていますが、大会ごとのルールを必ず確認してください。',
    client: {
      defaultNames: ['プレイヤー A', 'プレイヤー B'],
      finish: { spin: 'スピン', over: 'オーバー', burst: 'バースト', xtreme: 'エクストリーム' },
      pointsShort: '+{n}',
      drawName: '引き分け',
      toWin: { other: 'あと {n}pt' },
      winner: '{name} の勝ち（{a}–{b}）',
      roundLine: '第 {n} バトル：{name}{bey} {finish}フィニッシュ +{pts}',
      drawLine: '第 {n} バトル：引き分け',
      withBey: '（{bey}）',
      logEmpty: 'プレイヤーの下にあるフィニッシュのボタンを押すと記録が始まります。',
      statsEmpty: 'まだ終わった試合がありません。1 試合終えると、ベイごとの勝率がここに表示されます。',
      statMatches: '試合数',
      statBattles: 'バトル数',
      statPerMatch: '1 試合あたりのバトル数',
      statShare: '{name}の割合',
      record: '{w}-{l}-{d}',
      smallSample: 'データ少',
      finishCount: '{name} {n}',
      listSeparator: '、',
      confirmClear: 'もう一度押すと消去',
      csvHeaders: ['試合', '日付', 'バトル', 'プレイヤー 1', 'ベイ 1', 'プレイヤー 2', 'ベイ 2', '勝者', 'フィニッシュ', '得点'],
      csvFile: 'beyblade-x-battles.csv',
    },
  },
});

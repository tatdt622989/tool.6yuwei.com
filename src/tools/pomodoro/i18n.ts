import { defineToolI18n } from '../../i18n/tool';
import type { MinuteUnits, Phase, PomodoroStatus } from './logic';

export interface Strings {
  phaseAria: string;
  displayAria: string;
  reset: string;
  skip: string;
  todayLabel: string;
  cycleLabel: string;
  focusTimeLabel: string;
  settings: string;
  focusMin: string;
  shortMin: string;
  longMin: string;
  longEvery: string;
  autoStart: string;
  sound: string;
  defaults: string;
  settingsHint: string;
  client: {
    phases: Record<Phase, string>;
    /** Label under the clock, {phase} = phase name. */
    status: Record<PomodoroStatus, string>;
    start: string;
    pause: string;
    resume: string;
    /** Tab title while running, {clock} {phase}. */
    title: string;
    /** After a focus session, {next} = the break that follows. */
    focusDone: string;
    /** After a break, {phase} = the break that ended. */
    breakDone: string;
    minutes: MinuteUnits;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    phaseAria: '階段',
    displayAria: '剩餘時間',
    reset: '重設',
    skip: '跳過',
    todayLabel: '今日完成番茄',
    cycleLabel: '本輪進度',
    focusTimeLabel: '今日專注時間',
    settings: '設定',
    focusMin: '專注（分鐘）',
    shortMin: '短休息（分鐘）',
    longMin: '長休息（分鐘）',
    longEvery: '幾輪後長休息',
    autoStart: '自動開始下一階段',
    sound: '提示音',
    defaults: '恢復預設值',
    settingsHint: '變更會自動保存在這個瀏覽器；計時中的階段會在下一階段套用新時間。',
    client: {
      phases: { focus: '專注', short: '短休息', long: '長休息' },
      status: { running: '{phase}中', paused: '{phase}・已暫停', idle: '{phase}・準備開始' },
      start: '開始',
      pause: '暫停',
      resume: '繼續',
      title: '{clock} {phase}中',
      focusDone: '專注結束，接著{next}',
      breakDone: '{phase}結束，準備下一個番茄',
      minutes: { min: '{m} 分鐘', hm: '{h} 小時 {m} 分', h: '{h} 小時' },
    },
  },
  en: {
    phaseAria: 'Phase',
    displayAria: 'Time remaining',
    reset: 'Reset',
    skip: 'Skip',
    todayLabel: 'Pomodoros today',
    cycleLabel: 'Current set',
    focusTimeLabel: 'Focus time today',
    settings: 'Settings',
    focusMin: 'Focus (minutes)',
    shortMin: 'Short break (minutes)',
    longMin: 'Long break (minutes)',
    longEvery: 'Pomodoros before a long break',
    autoStart: 'Start the next phase automatically',
    sound: 'Sound',
    defaults: 'Restore defaults',
    settingsHint:
      'Changes are saved in this browser automatically. If a phase is already running, new lengths apply from the next phase.',
    client: {
      phases: { focus: 'Focus', short: 'Short break', long: 'Long break' },
      status: { running: '{phase} · running', paused: '{phase} · paused', idle: '{phase} · ready' },
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      title: '{clock} · {phase}',
      focusDone: 'Focus session complete. Next up: {next}.',
      breakDone: '{phase} is over. Time for the next pomodoro.',
      minutes: { min: '{m} min', hm: '{h} hr {m} min', h: '{h} hr' },
    },
  },
  ja: {
    phaseAria: 'フェーズ',
    displayAria: '残り時間',
    reset: 'リセット',
    skip: 'スキップ',
    todayLabel: '今日のポモドーロ',
    cycleLabel: '現在のセット',
    focusTimeLabel: '今日の集中時間',
    settings: '設定',
    focusMin: '集中（分）',
    shortMin: '短い休憩（分）',
    longMin: '長い休憩（分）',
    longEvery: '長い休憩までの回数',
    autoStart: '次のフェーズを自動で開始',
    sound: 'アラーム音',
    defaults: '初期設定に戻す',
    settingsHint: '変更はこのブラウザに自動で保存されます。計測中のフェーズには、次のフェーズから新しい時間が適用されます。',
    client: {
      phases: { focus: '集中', short: '短い休憩', long: '長い休憩' },
      status: { running: '{phase}・計測中', paused: '{phase}・一時停止中', idle: '{phase}・スタート前' },
      start: 'スタート',
      pause: '一時停止',
      resume: '再開',
      title: '{clock} {phase}',
      focusDone: '集中タイムが終わりました。次は{next}です',
      breakDone: '{phase}が終わりました。次のポモドーロを始めましょう',
      minutes: { min: '{m}分', hm: '{h}時間{m}分', h: '{h}時間' },
    },
  },
});

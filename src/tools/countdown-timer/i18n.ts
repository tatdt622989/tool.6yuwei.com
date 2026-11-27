import { defineToolI18n } from '../../i18n/tool';
import type { CountdownStatus, DurationUnits } from './logic';

export interface Strings {
  displayAria: string;
  reset: string;
  hours: string;
  minutes: string;
  seconds: string;
  presetsLabel: string;
  /** Preset button text, {n} = minutes. */
  preset: string;
  sound: string;
  notify: string;
  client: {
    /** Toggle button label per state. */
    toggle: Record<CountdownStatus, string>;
    /** {d} = describeDuration() */
    statusRunning: string;
    statusPaused: string;
    timeUp: string;
    needTime: string;
    /** Tab title while running, {t} = remaining time. */
    titleRunning: string;
    /** Notification body, {d} = describeDuration() */
    notifyBody: string;
    errorNoTime: string;
    notifyUnsupported: string;
    notifyOn: string;
    notifyDenied: string;
    fullscreen: string;
    exitFullscreen: string;
    fullscreenError: string;
    units: DurationUnits;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    displayAria: '剩餘時間',
    reset: '重設',
    hours: '時',
    minutes: '分',
    seconds: '秒',
    presetsLabel: '快速設定（點選後立即開始）',
    preset: '{n} 分鐘',
    sound: '提示音',
    notify: '桌面通知',
    client: {
      toggle: { idle: '開始', running: '暫停', paused: '繼續', done: '再倒數一次' },
      statusRunning: '倒數 {d}',
      statusPaused: '已暫停',
      timeUp: '時間到！',
      needTime: '請先設定時間',
      titleRunning: '{t} 倒數中',
      notifyBody: '{d}的倒數已結束',
      errorNoTime: '請先輸入倒數時間。',
      notifyUnsupported: '這個瀏覽器不支援桌面通知。',
      notifyOn: '已開啟桌面通知，時間到時會跳出提醒。',
      notifyDenied: '通知權限未開啟。可在網址列左側的網站設定中允許通知後再勾選。',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      fullscreenError: '無法進入全螢幕模式。',
      units: { h: '{n} 小時', m: '{n} 分', s: '{n} 秒', sep: ' ' },
    },
  },
  en: {
    displayAria: 'Time remaining',
    reset: 'Reset',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    presetsLabel: 'Quick timers (start right away)',
    preset: '{n} min',
    sound: 'Alarm sound',
    notify: 'Desktop notification',
    client: {
      toggle: { idle: 'Start', running: 'Pause', paused: 'Resume', done: 'Restart' },
      statusRunning: '{d} timer',
      statusPaused: 'Paused',
      timeUp: 'Time’s up!',
      needTime: 'Set a time first',
      titleRunning: '{t} left',
      notifyBody: 'Your {d} timer has finished.',
      errorNoTime: 'Enter a time to count down from.',
      notifyUnsupported: 'This browser doesn’t support desktop notifications.',
      notifyOn: 'Desktop notifications are on. You’ll get an alert when time is up.',
      notifyDenied:
        'Notifications are blocked. Allow them in the site settings (the icon to the left of the address bar), then check the box again.',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      fullscreenError: 'Couldn’t switch to full screen.',
      units: { h: '{n} hr', m: '{n} min', s: '{n} sec', sep: ' ' },
    },
  },
  ja: {
    displayAria: '残り時間',
    reset: 'リセット',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    presetsLabel: 'クイック設定（押すとすぐにスタート）',
    preset: '{n}分',
    sound: 'アラーム音',
    notify: 'デスクトップ通知',
    client: {
      toggle: { idle: 'スタート', running: '一時停止', paused: '再開', done: 'もう一度' },
      statusRunning: '{d}のタイマー',
      statusPaused: '一時停止中',
      timeUp: '時間になりました',
      needTime: '時間を設定してください',
      titleRunning: '残り {t}',
      notifyBody: '{d}のタイマーが終了しました。',
      errorNoTime: 'カウントダウンする時間を入力してください。',
      notifyUnsupported: 'このブラウザはデスクトップ通知に対応していません。',
      notifyOn: 'デスクトップ通知をオンにしました。時間になると通知が表示されます。',
      notifyDenied:
        '通知が許可されていません。アドレスバー左側のサイト設定で通知を許可してから、もう一度チェックを入れてください。',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      fullscreenError: '全画面表示に切り替えられませんでした。',
      units: { h: '{n}時間', m: '{n}分', s: '{n}秒', sep: '' },
    },
  },
});

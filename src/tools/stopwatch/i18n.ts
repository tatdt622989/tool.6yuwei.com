import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  displayAria: string;
  lap: string;
  reset: string;
  /** Shortcut hint (zh uses plain spaces: the original markup's full-width spaces were collapsed by compressHTML): `${keysLabel}<kbd>${spaceKey}</kbd>${keyToggle}<kbd>L</kbd>${keyLap}<kbd>R</kbd>${keyReset}` */
  keysLabel: string;
  spaceKey: string;
  keyToggle: string;
  keyLap: string;
  keyReset: string;
  lapsLabel: string;
  copy: string;
  client: {
    start: string;
    pause: string;
    resume: string;
    /** Current lap line, {n} = lap number, {t} = lap time. */
    current: string;
    /** Tab title while running, {t} = elapsed time. */
    title: string;
    fastest: string;
    slowest: string;
    /** Lap table columns; also the header row of the copied text. */
    columns: [string, string, string];
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    displayAria: '經過時間',
    lap: '分圈',
    reset: '重設',
    keysLabel: '快捷鍵：',
    spaceKey: '空白鍵',
    keyToggle: ' 開始／暫停 ',
    keyLap: ' 分圈 ',
    keyReset: ' 重設',
    lapsLabel: '分圈紀錄',
    copy: '複製紀錄',
    client: {
      start: '開始',
      pause: '暫停',
      resume: '繼續',
      current: '第 {n} 圈　{t}',
      title: '{t} 碼錶計時中',
      fastest: '最快',
      slowest: '最慢',
      columns: ['圈數', '單圈時間', '累計時間'],
    },
  },
  en: {
    displayAria: 'Elapsed time',
    lap: 'Lap',
    reset: 'Reset',
    keysLabel: 'Shortcuts: ',
    spaceKey: 'Space',
    keyToggle: ' start/stop, ',
    keyLap: ' lap, ',
    keyReset: ' reset',
    lapsLabel: 'Laps',
    copy: 'Copy laps',
    client: {
      start: 'Start',
      pause: 'Stop',
      resume: 'Resume',
      current: 'Lap {n} · {t}',
      title: '{t} Stopwatch',
      fastest: 'Fastest',
      slowest: 'Slowest',
      columns: ['Lap', 'Lap time', 'Total time'],
    },
  },
  ja: {
    displayAria: '経過時間',
    lap: 'ラップ',
    reset: 'リセット',
    keysLabel: 'ショートカット：',
    spaceKey: 'スペース',
    keyToggle: ' スタート／ストップ　',
    keyLap: ' ラップ　',
    keyReset: ' リセット',
    lapsLabel: 'ラップ記録',
    copy: '記録をコピー',
    client: {
      start: 'スタート',
      pause: 'ストップ',
      resume: '再開',
      current: 'ラップ {n}　{t}',
      title: '{t} 計測中',
      fastest: '最速',
      slowest: '最遅',
      columns: ['ラップ', 'ラップタイム', 'スプリット'],
    },
  },
});

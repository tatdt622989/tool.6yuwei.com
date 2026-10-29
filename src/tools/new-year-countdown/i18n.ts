// UI strings for the New Year countdown. Each locale also picks whose midnight it counts to (`clock`)
// and what the two cards under the countdown show (`cards`):
//   zh-TW  Taiwan time; 除夕 + 春節 with the official 春節連假
//   en     the viewer's own time zone; New Year's Eve + Lunar New Year
//   ja     Japan time (JST); 大晦日 + 元日・三が日
import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export type ClockKind = 'taipei' | 'tokyo' | 'local';
export type CardsKind = 'lunar-tw' | 'eve-lunar' | 'eve-shogatsu';

export interface Strings {
  clock: ClockKind;
  cards: CardsKind;
  timerAria: string;
  /** 天 時 分 秒 */
  units: [string, string, string, string];
  happy: string;
  fullscreen: string;
  sound: string;
  syncing: string;
  card1Title: string;
  card2Title: string;
  client: {
    /** {year} */
    eyebrow: string;
    /** {year} */
    celebrateEyebrow: string;
    /** {n} days, {year} next year */
    celebrateTarget: PluralForms;
    /** {year}, plus {date} (localized date of 1 January) and {zone} (" (Eastern Standard Time)", or empty) where needed */
    target: string;
    /** {n} */
    days: PluralForms;
    /** {left} {year} */
    title: string;
    /** {n} {year} */
    finalTitle: string;
    /** {year} */
    celebrateTitle: string;
    /** {year} {p} */
    progress: string;
    fullscreen: string;
    exitFullscreen: string;
    past: string;
    /** {n} */
    daysLeft: PluralForms;
    /** {hms} */
    hmsLeft: string;
    /** zh-TW 除夕／春節 cards. */
    lunarTw?: {
      chuxiToday: string;
      chunjieToday: string;
      /** {ganzhi} {animal} */
      chunjieTitle: string;
      /** {year} {start} {end} {days} */
      holiday: string;
    };
    /** Dec 31 card (en, ja). */
    eve?: {
      today: string;
    };
    /** Lunar New Year card (en). */
    lunar?: {
      animals: Record<string, string>;
      /** {animal} */
      title: string;
      today: string;
    };
    /** 元日・三が日 card (ja). */
    shogatsu?: {
      /** {ganzhi} {year} */
      title: string;
      /** Index 0–2 = 1月1日–3日 */
      today: [string, string, string];
    };
    /** Localized sync durations; zh-TW uses the taiwan-time helpers. {n} {d} {h} {m} {s} */
    durations?: { ms: string; sec: string; minSec: string; hourMin: string; dayHour: string };
    /** {acc} */
    syncOk: string;
    /** {acc} {amount} */
    syncSlow: string;
    /** {acc} {amount} */
    syncFast: string;
    syncFail: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    clock: 'taipei',
    cards: 'lunar-tw',
    timerAria: '跨年倒數',
    units: ['天', '時', '分', '秒'],
    happy: '新年快樂',
    fullscreen: '全螢幕',
    sound: '最後 10 秒提示音',
    syncing: '正在與標準時間校時…',
    card1Title: '除夕',
    card2Title: '春節（大年初一）',
    client: {
      eyebrow: '距離 {year} 年還有',
      celebrateEyebrow: '{year} 年到了',
      celebrateTarget: { other: '距離 {year} 年還有 {n} 天' },
      target: '{year} 年 1 月 1 日 00:00（台灣時間）',
      days: { other: '{n} 天' },
      title: '{left} 跨年倒數',
      finalTitle: '{n} 秒 跨年倒數',
      celebrateTitle: '新年快樂 {year}',
      progress: '{year} 年已經過了 {p}%',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      past: '已經過了',
      daysLeft: { other: '還有 {n} 天' },
      hmsLeft: '還有 {hms}',
      lunarTw: {
        chuxiToday: '今天就是除夕',
        chunjieToday: '今天是大年初一',
        chunjieTitle: '春節（大年初一，{ganzhi}{animal}年）',
        holiday: '{year} 春節連假：{start} 至 {end}，共 {days} 天（依行政院人事行政總處公布的辦公日曆表）。',
      },
      syncOk: '已與標準時間校時（精度 ±{acc}），你的裝置時間很準。',
      syncSlow: '已與標準時間校時（精度 ±{acc}），你的裝置時間慢 {amount}，倒數已自動修正。',
      syncFast: '已與標準時間校時（精度 ±{acc}），你的裝置時間快 {amount}，倒數已自動修正。',
      syncFail: '無法連線校時，目前依你裝置的時鐘倒數（已換算成台灣時間）。',
    },
  },
  en: {
    clock: 'local',
    cards: 'eve-lunar',
    timerAria: 'New Year countdown',
    units: ['Days', 'Hours', 'Minutes', 'Seconds'],
    happy: 'Happy New Year',
    fullscreen: 'Full screen',
    sound: 'Beep for the last 10 seconds',
    syncing: 'Checking your clock against an accurate time server…',
    card1Title: 'New Year’s Eve',
    card2Title: 'Lunar New Year',
    client: {
      eyebrow: 'Countdown to {year}',
      celebrateEyebrow: 'Welcome to {year}',
      celebrateTarget: { one: '{n} day until {year}', other: '{n} days until {year}' },
      target: 'Midnight on {date}, your local time{zone}',
      days: { one: '{n} day', other: '{n} days' },
      title: '{left} until {year}',
      finalTitle: '{n} sec until {year}',
      celebrateTitle: 'Happy New Year {year}',
      progress: '{p}% of {year} is behind us',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      past: 'Already passed',
      daysLeft: { one: 'In {n} day', other: 'In {n} days' },
      hmsLeft: 'In {hms}',
      eve: { today: 'Today is New Year’s Eve' },
      lunar: {
        animals: {
          鼠: 'Rat',
          牛: 'Ox',
          虎: 'Tiger',
          兔: 'Rabbit',
          龍: 'Dragon',
          蛇: 'Snake',
          馬: 'Horse',
          羊: 'Goat',
          猴: 'Monkey',
          雞: 'Rooster',
          狗: 'Dog',
          豬: 'Pig',
        },
        title: 'Lunar New Year: Year of the {animal}',
        today: 'Today is Lunar New Year',
      },
      durations: {
        ms: '{n} ms',
        sec: '{n} s',
        minSec: '{m} min {s} s',
        hourMin: '{h} hr {m} min',
        dayHour: '{d} d {h} hr',
      },
      syncOk: 'Synced with server time (±{acc}). Your device clock is accurate.',
      syncSlow: 'Synced with server time (±{acc}). Your device clock is {amount} slow, so the countdown has been corrected.',
      syncFast: 'Synced with server time (±{acc}). Your device clock is {amount} fast, so the countdown has been corrected.',
      syncFail: 'Couldn’t reach the time server, so the countdown is using your device clock.',
    },
  },
  ja: {
    clock: 'tokyo',
    cards: 'eve-shogatsu',
    timerAria: '年越しカウントダウン',
    units: ['日', '時間', '分', '秒'],
    happy: 'あけましておめでとう',
    fullscreen: '全画面',
    sound: '最後の 10 秒に音を鳴らす',
    syncing: '標準時刻と時刻合わせをしています…',
    card1Title: '大晦日',
    card2Title: '元日・三が日',
    client: {
      eyebrow: '{year}年まであと',
      celebrateEyebrow: '{year}年になりました',
      celebrateTarget: { other: '{year}年まであと {n} 日' },
      target: '{date} 0:00（日本時間）',
      days: { other: '{n}日' },
      title: 'あと {left}｜{year}年 カウントダウン',
      finalTitle: 'あと {n} 秒｜{year}年 カウントダウン',
      celebrateTitle: 'あけましておめでとう {year}',
      progress: '{year}年は {p}% が過ぎました',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      past: '終了しました',
      daysLeft: { other: 'あと {n} 日' },
      hmsLeft: 'あと {hms}',
      eve: { today: '今日は大晦日です' },
      shogatsu: {
        title: '元日・三が日（{year}年 {ganzhi}）',
        today: ['今日は元日です', '今日は 1 月 2 日（三が日）', '今日は 1 月 3 日（三が日）'],
      },
      durations: {
        ms: '{n} ミリ秒',
        sec: '{n} 秒',
        minSec: '{m} 分 {s} 秒',
        hourMin: '{h} 時間 {m} 分',
        dayHour: '{d} 日 {h} 時間',
      },
      syncOk: '標準時刻と時刻合わせをしました（誤差 ±{acc}）。お使いの端末の時計は正確です。',
      syncSlow: '標準時刻と時刻合わせをしました（誤差 ±{acc}）。端末の時計が {amount} 遅れていたため、補正してカウントダウンしています。',
      syncFast: '標準時刻と時刻合わせをしました（誤差 ±{acc}）。端末の時計が {amount} 進んでいたため、補正してカウントダウンしています。',
      syncFail: '時刻合わせができなかったため、端末の時計（日本時間に換算）でカウントダウンしています。',
    },
  },
});

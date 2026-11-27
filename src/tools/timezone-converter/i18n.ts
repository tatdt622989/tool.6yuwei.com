// UI strings for the time zone converter. Each locale also sets its starting zone list, where the
// viewer's own zone goes, and the city names (in the order they appear under "common cities").
import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export interface Strings {
  sourceLabel: string;
  whenLabel: string;
  now: string;
  listAria: string;
  addLabel: string;
  add: string;
  reset: string;
  hint: string;
  client: {
    /**
     * Locale presets. zh-TW omits them and keeps the original Taipei defaults and ZONE_LABELS from logic.ts.
     * source 'user' = the viewer's own zone.
     */
    preset?: {
      zones: string[];
      userZone: 'first' | 'last';
      source: string;
      labels: Record<string, string>;
    };
    commonGroup: string;
    allGroup: string;
    /** {label} {zone} */
    commonOption: string;
    dst: string;
    /** Short weekday names Sun…Sat for the '{m}/{d}（{w}）' date; locales without it use Intl. */
    weekdays?: string[];
    /** {m} {d} {w} */
    dateTpl?: string;
    /** Show card clocks in 12-hour format (en-US habit). */
    hour12?: boolean;
    prevDay: string;
    nextDay: string;
    night: string;
    sourceTag: string;
    same: string;
    ahead: PluralForms;
    behind: PluralForms;
    useAsSource: string;
    remove: string;
    /** {label} */
    removeAria: string;
    pickDate: string;
    /** {label} {offset} {utc} */
    utcLine: string;
    /** {time} */
    gap: string;
    ambiguous: string;
    empty: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    sourceLabel: '來源時區',
    whenLabel: '來源時區的日期與時間',
    now: '現在',
    listAria: '各時區時間',
    addLabel: '加入其他時區',
    add: '加入',
    reset: '恢復預設',
    hint: '時區清單會記在這個瀏覽器，下次開啟時自動帶入。',
    client: {
      commonGroup: '常用城市',
      allGroup: '所有時區',
      commonOption: '{label}（{zone}）',
      dst: '夏令時間',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      dateTpl: '{m}/{d}（{w}）',
      prevDay: '前一天',
      nextDay: '隔天',
      night: '夜間',
      sourceTag: '來源',
      same: '與來源同時間',
      ahead: { other: '快 {n} 小時' },
      behind: { other: '慢 {n} 小時' },
      useAsSource: '設為來源',
      remove: '移除',
      removeAria: '移除{label}',
      pickDate: '請選擇日期與時間',
      utcLine: '{label} {offset}，對應 UTC 時間 {utc}',
      gap: '這個時間因夏令時間開始而不存在，已順延為 {time}。',
      ambiguous: '這個時間因夏令時間結束會出現兩次，以下以第一次（夏令時間）計算。',
      empty: '目前沒有要比較的時區，請從下方加入。',
    },
  },
  en: {
    sourceLabel: 'Convert from',
    whenLabel: 'Date and time there',
    now: 'Now',
    listAria: 'Time in each zone',
    addLabel: 'Add a city or time zone',
    add: 'Add',
    reset: 'Reset list',
    hint: 'Your list of zones is saved in this browser and comes back next time.',
    client: {
      preset: {
        zones: ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
        userZone: 'first',
        source: 'user',
        labels: {
          'America/New_York': 'New York (Eastern)',
          'America/Chicago': 'Chicago (Central)',
          'America/Denver': 'Denver (Mountain)',
          'America/Phoenix': 'Phoenix (Arizona)',
          'America/Los_Angeles': 'Los Angeles (Pacific)',
          'America/Anchorage': 'Anchorage (Alaska)',
          'Pacific/Honolulu': 'Honolulu (Hawaii)',
          'America/Toronto': 'Toronto',
          'America/Vancouver': 'Vancouver',
          'America/Mexico_City': 'Mexico City',
          'America/Sao_Paulo': 'São Paulo',
          'America/St_Johns': "St. John's (Newfoundland)",
          UTC: 'UTC',
          'Europe/London': 'London',
          'Europe/Dublin': 'Dublin',
          'Europe/Paris': 'Paris',
          'Europe/Berlin': 'Berlin',
          'Europe/Amsterdam': 'Amsterdam',
          'Europe/Madrid': 'Madrid',
          'Europe/Rome': 'Rome',
          'Europe/Zurich': 'Zurich',
          'Europe/Kyiv': 'Kyiv',
          'Europe/Istanbul': 'Istanbul',
          'Europe/Moscow': 'Moscow',
          'Africa/Cairo': 'Cairo',
          'Africa/Johannesburg': 'Johannesburg',
          'Asia/Jerusalem': 'Jerusalem',
          'Asia/Dubai': 'Dubai',
          'Asia/Kolkata': 'India (New Delhi)',
          'Asia/Calcutta': 'India (New Delhi)',
          'Asia/Kathmandu': 'Kathmandu',
          'Asia/Bangkok': 'Bangkok',
          'Asia/Ho_Chi_Minh': 'Ho Chi Minh City',
          'Asia/Saigon': 'Ho Chi Minh City',
          'Asia/Jakarta': 'Jakarta',
          'Asia/Singapore': 'Singapore',
          'Asia/Kuala_Lumpur': 'Kuala Lumpur',
          'Asia/Manila': 'Manila',
          'Asia/Hong_Kong': 'Hong Kong',
          'Asia/Shanghai': 'Beijing / Shanghai',
          'Asia/Taipei': 'Taipei',
          'Asia/Seoul': 'Seoul',
          'Asia/Tokyo': 'Tokyo',
          'Australia/Perth': 'Perth',
          'Australia/Brisbane': 'Brisbane',
          'Australia/Sydney': 'Sydney',
          'Australia/Melbourne': 'Melbourne',
          'Pacific/Auckland': 'Auckland',
        },
      },
      commonGroup: 'Common cities',
      allGroup: 'All time zones',
      commonOption: '{label} ({zone})',
      dst: 'Daylight saving time',
      hour12: true,
      prevDay: 'Previous day',
      nextDay: 'Next day',
      night: 'Night',
      sourceTag: 'Source',
      same: 'Same time',
      ahead: { one: '{n} hour ahead', other: '{n} hours ahead' },
      behind: { one: '{n} hour behind', other: '{n} hours behind' },
      useAsSource: 'Convert from here',
      remove: 'Remove',
      removeAria: 'Remove {label}',
      pickDate: 'Pick a date and time.',
      utcLine: '{label} is on {offset}. In UTC that is {utc}.',
      gap: 'This time doesn’t exist because clocks spring forward for daylight saving time, so it has been moved to {time}.',
      ambiguous: 'This time happens twice because clocks fall back. The results below use the first one (still on daylight saving time).',
      empty: 'No zones to compare. Add one below.',
    },
  },
  ja: {
    sourceLabel: '基準のタイムゾーン',
    whenLabel: '基準の日付と時刻',
    now: '現在',
    listAria: '各都市の時刻',
    addLabel: '都市・タイムゾーンを追加',
    add: '追加',
    reset: '初期設定に戻す',
    hint: '追加した都市はこのブラウザに保存され、次回も表示されます。',
    client: {
      preset: {
        zones: [
          'Asia/Tokyo',
          'Asia/Seoul',
          'Asia/Shanghai',
          'Asia/Singapore',
          'Europe/London',
          'Europe/Paris',
          'America/New_York',
          'America/Los_Angeles',
          'Pacific/Honolulu',
        ],
        userZone: 'last',
        source: 'Asia/Tokyo',
        labels: {
          'Asia/Tokyo': '東京',
          'Asia/Seoul': 'ソウル',
          'Asia/Shanghai': '北京・上海',
          'Asia/Taipei': '台北',
          'Asia/Hong_Kong': '香港',
          'Asia/Manila': 'マニラ',
          'Asia/Singapore': 'シンガポール',
          'Asia/Kuala_Lumpur': 'クアラルンプール',
          'Asia/Bangkok': 'バンコク',
          'Asia/Ho_Chi_Minh': 'ホーチミン',
          'Asia/Saigon': 'ホーチミン',
          'Asia/Jakarta': 'ジャカルタ',
          'Asia/Kolkata': 'インド（ニューデリー）',
          'Asia/Calcutta': 'インド（ニューデリー）',
          'Asia/Dubai': 'ドバイ',
          'Europe/London': 'ロンドン',
          'Europe/Paris': 'パリ',
          'Europe/Berlin': 'ベルリン',
          'Europe/Amsterdam': 'アムステルダム',
          'Europe/Madrid': 'マドリード',
          'Europe/Rome': 'ローマ',
          'Europe/Zurich': 'チューリッヒ',
          'Europe/Istanbul': 'イスタンブール',
          'Europe/Moscow': 'モスクワ',
          'America/New_York': 'ニューヨーク',
          'America/Chicago': 'シカゴ',
          'America/Denver': 'デンバー',
          'America/Los_Angeles': 'ロサンゼルス',
          'America/Vancouver': 'バンクーバー',
          'America/Toronto': 'トロント',
          'America/Mexico_City': 'メキシコシティ',
          'America/Sao_Paulo': 'サンパウロ',
          'Pacific/Honolulu': 'ホノルル（ハワイ）',
          'Pacific/Guam': 'グアム',
          'Australia/Sydney': 'シドニー',
          'Australia/Melbourne': 'メルボルン',
          'Australia/Brisbane': 'ブリスベン',
          'Australia/Perth': 'パース',
          'Pacific/Auckland': 'オークランド',
          'Africa/Cairo': 'カイロ',
          UTC: '協定世界時（UTC）',
        },
      },
      commonGroup: '主要都市',
      allGroup: 'すべてのタイムゾーン',
      commonOption: '{label}（{zone}）',
      dst: 'サマータイム',
      weekdays: ['日', '月', '火', '水', '木', '金', '土'],
      dateTpl: '{m}/{d}（{w}）',
      prevDay: '前日',
      nextDay: '翌日',
      night: '夜間',
      sourceTag: '基準',
      same: '基準と同じ時刻',
      ahead: { other: '{n} 時間進んでいる' },
      behind: { other: '{n} 時間遅れている' },
      useAsSource: '基準にする',
      remove: '削除',
      removeAria: '{label}を削除',
      pickDate: '日付と時刻を選んでください。',
      utcLine: '{label}（{offset}）、協定世界時（UTC）では {utc}',
      gap: 'この時刻はサマータイム開始で存在しないため、{time} に繰り下げて計算しています。',
      ambiguous: 'この時刻はサマータイム終了で 2 回あるため、1 回目（サマータイム中）で計算しています。',
      empty: '比較する都市がありません。下から追加してください。',
    },
  },
});

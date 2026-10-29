import { defineToolI18n } from '../../i18n/tool';
import type { TimestampMessages, Unit } from './logic';

/** Rows of the "timestamp → date" panel. Each locale picks its own set and order. */
export type DateRowKey = 'local' | 'utc' | 'iso' | 'isolocal' | 'weekday' | 'long' | 'wareki' | 'relative' | 'unit';

export interface Strings {
  toDateRows: [DateRowKey, string][];
  toTsRows: [string, string][];
  nowTitle: string;
  msBefore: string;
  copySeconds: string;
  copyMs: string;
  toDateTitle: string;
  tsLabel: string;
  tsPlaceholder: string;
  now: string;
  unitAria: string;
  unitAuto: string;
  unitS: string;
  unitMs: string;
  copy: string;
  toTsTitle: string;
  dateLabel: string;
  zoneAria: string;
  localTime: string;
  client: {
    messages: TimestampMessages;
    unitLabels: Record<Unit, string>;
    /** {zone} {offset} */
    yourZone: string;
    /** {zone} */
    localZoneLabel: string;
    /** Appended to the local time row: {offset} */
    offsetSuffix: string;
    pause: string;
    resume: string;
    dateError: string;
    /** Shown in the 和暦 row for dates before 1873. */
    noWareki?: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    toDateRows: [
      ['local', '本地時間'],
      ['utc', 'UTC 時間'],
      ['iso', 'ISO 8601（UTC）'],
      ['isolocal', 'ISO 8601（本地）'],
      ['weekday', '星期'],
      ['relative', '相對時間'],
      ['unit', '判斷單位'],
    ],
    toTsRows: [
      ['s', 'Unix 時間戳（秒）'],
      ['ms', 'Unix 時間戳（毫秒）'],
      ['iso', 'ISO 8601（UTC）'],
    ],
    nowTitle: '目前 Unix 時間戳',
    msBefore: '毫秒：',
    copySeconds: '複製秒',
    copyMs: '複製毫秒',
    toDateTitle: '時間戳轉日期',
    tsLabel: 'Unix 時間戳',
    tsPlaceholder: '例如 1761717600',
    now: '現在',
    unitAria: '時間戳單位',
    unitAuto: '自動判斷',
    unitS: '秒',
    unitMs: '毫秒',
    copy: '複製',
    toTsTitle: '日期轉時間戳',
    dateLabel: '日期與時間',
    zoneAria: '輸入的時間屬於哪個時區',
    localTime: '本地時間',
    client: {
      messages: {
        empty: '請輸入時間戳',
        notNumber: '時間戳只能包含數字，可帶負號或小數點。',
        outOfRange: '超出可表示的日期範圍（約西元前 271821 年到西元 275760 年）。',
      },
      unitLabels: {
        s: '秒（10 位數）',
        ms: '毫秒（13 位數）',
        us: '微秒（16 位數）',
        ns: '奈秒（19 位數）',
      },
      yourZone: '你的時區：{zone}（UTC{offset}）',
      localZoneLabel: '本地時間（{zone}）',
      offsetSuffix: '（UTC{offset}）',
      pause: '暫停',
      resume: '繼續',
      dateError: '日期格式不正確，請使用 YYYY-MM-DD HH:mm:ss。',
    },
  },
  en: {
    toDateRows: [
      ['long', 'Local date'],
      ['local', 'Local time'],
      ['utc', 'UTC / GMT'],
      ['iso', 'ISO 8601 (UTC)'],
      ['isolocal', 'ISO 8601 (local)'],
      ['relative', 'Relative'],
      ['unit', 'Detected unit'],
    ],
    toTsRows: [
      ['s', 'Unix timestamp (seconds)'],
      ['ms', 'Unix timestamp (milliseconds)'],
      ['iso', 'ISO 8601 (UTC)'],
    ],
    nowTitle: 'Current Unix timestamp',
    msBefore: 'Milliseconds: ',
    copySeconds: 'Copy seconds',
    copyMs: 'Copy milliseconds',
    toDateTitle: 'Timestamp to date',
    tsLabel: 'Unix timestamp',
    tsPlaceholder: 'e.g. 1761717600',
    now: 'Now',
    unitAria: 'Timestamp unit',
    unitAuto: 'Auto-detect',
    unitS: 'Seconds',
    unitMs: 'Milliseconds',
    copy: 'Copy',
    toTsTitle: 'Date to timestamp',
    dateLabel: 'Date and time',
    zoneAria: 'Time zone of the date you entered',
    localTime: 'Local time',
    client: {
      messages: {
        empty: 'Enter a timestamp',
        notNumber: 'A timestamp can only contain digits, with an optional minus sign or decimal point.',
        outOfRange: 'Out of the supported date range (about 271,821 BC to AD 275,760).',
      },
      unitLabels: {
        s: 'Seconds (10 digits)',
        ms: 'Milliseconds (13 digits)',
        us: 'Microseconds (16 digits)',
        ns: 'Nanoseconds (19 digits)',
      },
      yourZone: 'Your time zone: {zone} (UTC{offset})',
      localZoneLabel: 'Local time ({zone})',
      offsetSuffix: ' (UTC{offset})',
      pause: 'Pause',
      resume: 'Resume',
      dateError: 'Invalid date. Use the format YYYY-MM-DD HH:mm:ss.',
    },
  },
  ja: {
    toDateRows: [
      ['long', '日付と曜日'],
      ['wareki', '和暦'],
      ['local', 'ローカル時刻'],
      ['utc', 'UTC（協定世界時）'],
      ['iso', 'ISO 8601（UTC）'],
      ['isolocal', 'ISO 8601（ローカル）'],
      ['relative', '現在との差'],
      ['unit', '判定した単位'],
    ],
    toTsRows: [
      ['s', 'UNIX 時間（秒）'],
      ['ms', 'UNIX 時間（ミリ秒）'],
      ['iso', 'ISO 8601（UTC）'],
    ],
    nowTitle: '現在の UNIX 時間',
    msBefore: 'ミリ秒：',
    copySeconds: '秒をコピー',
    copyMs: 'ミリ秒をコピー',
    toDateTitle: 'UNIX 時間 → 日時',
    tsLabel: 'UNIX 時間（タイムスタンプ）',
    tsPlaceholder: '例：1761717600',
    now: '現在',
    unitAria: 'タイムスタンプの単位',
    unitAuto: '自動判定',
    unitS: '秒',
    unitMs: 'ミリ秒',
    copy: 'コピー',
    toTsTitle: '日時 → UNIX 時間',
    dateLabel: '日付と時刻',
    zoneAria: '入力した日時のタイムゾーン',
    localTime: 'ローカル時刻',
    client: {
      messages: {
        empty: 'タイムスタンプを入力してください',
        notNumber: 'タイムスタンプには数字（マイナス記号と小数点を含む）だけを入力してください。',
        outOfRange: '扱える日付の範囲（紀元前 271821 年〜西暦 275760 年ごろ）を超えています。',
      },
      unitLabels: {
        s: '秒（10 桁）',
        ms: 'ミリ秒（13 桁）',
        us: 'マイクロ秒（16 桁）',
        ns: 'ナノ秒（19 桁）',
      },
      yourZone: 'お使いのタイムゾーン：{zone}（UTC{offset}）',
      localZoneLabel: 'ローカル時刻（{zone}）',
      offsetSuffix: '（UTC{offset}）',
      pause: '一時停止',
      resume: '再開',
      dateError: '日時の形式が正しくありません。YYYY-MM-DD HH:mm:ss の形式で入力してください。',
      noWareki: '—（1872 年以前は和暦に換算しません）',
    },
  },
});

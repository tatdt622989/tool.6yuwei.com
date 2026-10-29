import { defineToolI18n } from '../../i18n/tool';
import type { UuidVariant } from './logic';

export interface Strings {
  versionAria: string;
  v4: string;
  v7: string;
  count: string;
  uppercase: string;
  noHyphens: string;
  outputLabel: string;
  generate: string;
  copyAll: string;
  download: string;
  parseLabel: string;
  parsePlaceholder: string;
  versionStat: string;
  variantStat: string;
  timeStat: string;
  client: {
    invalid: string;
    nil: string;
    max: string;
    /** Keyed by version number '1'…'8'. */
    versions: Record<string, string>;
    /** {v} */
    unknownVersion: string;
    variants: Record<UuidVariant, string>;
    /**
     * Full Intl options for the embedded timestamp, for locales where appending “.mmm” to the
     * medium date/time style reads badly (en: “1:24:11 AM.758”). Omitted → medium style + “.mmm”.
     */
    timeOptions?: Intl.DateTimeFormatOptions;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    versionAria: 'UUID 版本',
    v4: 'v4 隨機',
    v7: 'v7 時間排序',
    count: '數量',
    uppercase: '大寫',
    noHyphens: '移除連字號',
    outputLabel: '產生結果',
    generate: '重新產生',
    copyAll: '複製全部',
    download: '下載 .txt',
    parseLabel: '解析 UUID',
    parsePlaceholder: '貼上一個 UUID 查看版本與時間',
    versionStat: '版本',
    variantStat: '變體（Variant）',
    timeStat: '內含的建立時間（本地時間）',
    client: {
      invalid: '格式不正確：UUID 應為 32 個十六進位字元，通常寫成 8-4-4-4-12 的形式。',
      nil: 'Nil UUID（全部為 0）',
      max: 'Max UUID（全部為 F）',
      versions: {
        '1': '版本 1（時間＋節點）',
        '2': '版本 2（DCE 安全性）',
        '3': '版本 3（名稱，MD5）',
        '4': '版本 4（隨機）',
        '5': '版本 5（名稱，SHA-1）',
        '6': '版本 6（重新排序的時間）',
        '7': '版本 7（Unix 時間排序）',
        '8': '版本 8（自訂）',
      },
      unknownVersion: '未定義的版本 {v}',
      variants: {
        ncs: 'NCS 保留（舊格式）',
        rfc: 'RFC 9562（標準）',
        microsoft: 'Microsoft 保留（GUID 舊格式）',
        future: '未來保留',
        none: '—',
      },
    },
  },
  en: {
    versionAria: 'UUID version',
    v4: 'v4 random',
    v7: 'v7 time-ordered',
    count: 'How many',
    uppercase: 'Uppercase',
    noHyphens: 'No hyphens',
    outputLabel: 'Generated UUIDs',
    generate: 'Generate new',
    copyAll: 'Copy all',
    download: 'Download .txt',
    parseLabel: 'Decode a UUID',
    parsePlaceholder: 'Paste a UUID to see its version and timestamp',
    versionStat: 'Version',
    variantStat: 'Variant',
    timeStat: 'Embedded timestamp (your local time)',
    client: {
      invalid: 'Invalid format: a UUID has 32 hex digits, usually written as 8-4-4-4-12.',
      nil: 'Nil UUID (all zeros)',
      max: 'Max UUID (all F)',
      versions: {
        '1': 'Version 1 (time + node)',
        '2': 'Version 2 (DCE security)',
        '3': 'Version 3 (name-based, MD5)',
        '4': 'Version 4 (random)',
        '5': 'Version 5 (name-based, SHA-1)',
        '6': 'Version 6 (reordered time)',
        '7': 'Version 7 (Unix time-ordered)',
        '8': 'Version 8 (custom)',
      },
      unknownVersion: 'Undefined version {v}',
      variants: {
        ncs: 'NCS reserved (legacy)',
        rfc: 'RFC 9562 (standard)',
        microsoft: 'Microsoft reserved (legacy GUID)',
        future: 'Reserved for future use',
        none: '—',
      },
      timeOptions: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      },
    },
  },
  ja: {
    versionAria: 'UUID のバージョン',
    v4: 'v4 ランダム',
    v7: 'v7 時系列',
    count: '個数',
    uppercase: '大文字',
    noHyphens: 'ハイフンなし',
    outputLabel: '生成結果',
    generate: '再生成',
    copyAll: 'すべてコピー',
    download: '.txt をダウンロード',
    parseLabel: 'UUID を解析',
    parsePlaceholder: 'UUID を貼り付けるとバージョンと時刻を表示',
    versionStat: 'バージョン',
    variantStat: 'バリアント',
    timeStat: '埋め込まれた生成時刻（端末の時刻）',
    client: {
      invalid: '形式が正しくありません。UUID は 16 進数 32 桁で、通常は 8-4-4-4-12 の形で書きます。',
      nil: 'Nil UUID（すべて 0）',
      max: 'Max UUID（すべて F）',
      versions: {
        '1': 'バージョン 1（時刻＋ノード）',
        '2': 'バージョン 2（DCE セキュリティ）',
        '3': 'バージョン 3（名前ベース、MD5）',
        '4': 'バージョン 4（ランダム）',
        '5': 'バージョン 5（名前ベース、SHA-1）',
        '6': 'バージョン 6（並べ替えた時刻）',
        '7': 'バージョン 7（Unix 時刻順）',
        '8': 'バージョン 8（カスタム）',
      },
      unknownVersion: '未定義のバージョン {v}',
      variants: {
        ncs: 'NCS 予約（旧形式）',
        rfc: 'RFC 9562（標準）',
        microsoft: 'Microsoft 予約（旧 GUID）',
        future: '将来のために予約',
        none: '—',
      },
    },
  },
});

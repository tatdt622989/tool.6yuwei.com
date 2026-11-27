import { defineToolI18n } from '../../i18n/tool';
import type { EncodeMode, TextErrorCode } from './logic';

export interface Strings {
  modeAria: string;
  encode: string;
  decode: string;
  scopeAria: string;
  plus: string;
  outputLabel: string;
  copy: string;
  swap: string;
  clear: string;
  parserTitle: string;
  urlLabel: string;
  urlPlaceholder: string;
  paramName: string;
  paramValue: string;
  client: {
    scopeHint: Record<EncodeMode, string>;
    decodeHint: string;
    inputEncode: string;
    inputDecode: string;
    placeholderEncode: string;
    placeholderDecode: string;
    /** 'bad-percent' takes {position} and {snippet}. */
    errors: Record<TextErrorCode, string>;
    urlErrors: { empty: string; invalid: string };
    assumedScheme: string;
    parts: {
      protocol: string;
      username: string;
      password: string;
      host: string;
      port: string;
      /** {port} */
      defaultPort: string;
      path: string;
      decodedPath: string;
      query: string;
      hash: string;
      origin: string;
    };
    /** Initial text of the params label (rendered in markup too). */
    paramsLabel: string;
    /** {n} */
    paramsCount: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '轉換方向',
    encode: '編碼',
    decode: '解碼',
    scopeAria: '編碼範圍',
    plus: '空白使用 +',
    outputLabel: '結果',
    copy: '複製結果',
    swap: '用結果反向轉換',
    clear: '清除',
    parserTitle: '網址解析',
    urlLabel: '貼上完整網址',
    urlPlaceholder: 'https://example.com/搜尋?q=咖啡&page=2#list',
    paramName: '參數名稱',
    paramValue: '值（已解碼）',
    client: {
      scopeHint: {
        component: '用於單一參數值或路徑片段，會編碼 : / ? # & = 等保留字元。',
        uri: '用於整個網址，保留 : / ? # & = 等結構字元，只編碼中文、空白等字元。',
      },
      decodeHint: '解碼時會把 %XX 序列還原為 UTF-8 文字；勾選「空白使用 +」會把 + 視為空白。',
      inputEncode: '要編碼的文字',
      inputDecode: '要解碼的網址或字串',
      placeholderEncode: '例如：台北 咖啡店',
      placeholderDecode: '例如：%E5%8F%B0%E5%8C%97',
      errors: {
        'lone-surrogate': '文字中含有不成對的 UTF-16 代理字元，無法編碼。',
        'bad-percent': '第 {position} 個字元「{snippet}」不是有效的百分比編碼，% 後面必須接兩位十六進位數字。',
        'bad-utf8': '百分比編碼的位元組不是有效的 UTF-8 序列，可能被截斷或原本使用 Big5 等其他編碼。',
      },
      urlErrors: {
        empty: '請輸入網址',
        invalid: '無法解析這個網址，請確認格式，例如 https://example.com/path?q=1',
      },
      assumedScheme: '網址沒有協定，已假設為 https://',
      parts: {
        protocol: '協定',
        username: '使用者名稱',
        password: '密碼',
        host: '主機',
        port: '連接埠',
        defaultPort: '{port}（預設）',
        path: '路徑',
        decodedPath: '路徑（解碼）',
        query: '查詢字串',
        hash: '錨點',
        origin: '來源（origin）',
      },
      paramsLabel: '查詢參數',
      paramsCount: '查詢參數（{n} 個）',
    },
  },
  en: {
    modeAria: 'Direction',
    encode: 'Encode',
    decode: 'Decode',
    scopeAria: 'Encoding scope',
    plus: 'Space as +',
    outputLabel: 'Result',
    copy: 'Copy result',
    swap: 'Reverse with result',
    clear: 'Clear',
    parserTitle: 'URL parser',
    urlLabel: 'Paste a full URL',
    urlPlaceholder: 'https://example.com/search?q=coffee shops&page=2#list',
    paramName: 'Name',
    paramValue: 'Value (decoded)',
    client: {
      scopeHint: {
        component:
          'For a single query value or path segment. Reserved characters such as : / ? # & = are encoded too.',
        uri: 'For a whole URL. Structural characters such as : / ? # & = are kept; only spaces, non-ASCII and unsafe characters are encoded.',
      },
      decodeHint: 'Turns %XX sequences back into UTF-8 text. Tick “Space as +” to treat + as a space (form data).',
      inputEncode: 'Text to encode',
      inputDecode: 'URL or string to decode',
      placeholderEncode: 'e.g. coffee & tea / café',
      placeholderDecode: 'e.g. caf%C3%A9%20%26%20tea',
      errors: {
        'lone-surrogate': 'The text contains an unpaired UTF-16 surrogate and cannot be encoded.',
        'bad-percent':
          'Character {position} (“{snippet}”) is not a valid percent-encoding. A % must be followed by two hex digits.',
        'bad-utf8':
          'The percent-encoded bytes are not valid UTF-8. The string may be truncated or use a legacy encoding such as Windows-1252.',
      },
      urlErrors: {
        empty: 'Enter a URL',
        invalid: 'Can’t parse this URL. Check the format, e.g. https://example.com/path?q=1',
      },
      assumedScheme: 'No scheme given, so https:// was assumed.',
      parts: {
        protocol: 'Scheme',
        username: 'Username',
        password: 'Password',
        host: 'Host',
        port: 'Port',
        defaultPort: '{port} (default)',
        path: 'Path',
        decodedPath: 'Path (decoded)',
        query: 'Query string',
        hash: 'Fragment',
        origin: 'Origin',
      },
      paramsLabel: 'Query parameters',
      paramsCount: 'Query parameters ({n})',
    },
  },
  ja: {
    modeAria: '変換の方向',
    encode: 'エンコード',
    decode: 'デコード',
    scopeAria: 'エンコードの範囲',
    plus: '空白を + にする',
    outputLabel: '結果',
    copy: '結果をコピー',
    swap: '結果を逆変換',
    clear: 'クリア',
    parserTitle: 'URL の分解',
    urlLabel: 'URL を貼り付け',
    urlPlaceholder: 'https://example.com/検索?q=カフェ&page=2#list',
    paramName: 'パラメータ名',
    paramValue: '値（デコード済み）',
    client: {
      scopeHint: {
        component: 'クエリの値やパスの一部に使います。: / ? # & = などの予約文字もエンコードします。',
        uri: 'URL 全体に使います。: / ? # & = などの区切り文字は残し、日本語や空白などだけをエンコードします。',
      },
      decodeHint: '%XX の並びを UTF-8 の文字に戻します。「空白を + にする」をオンにすると + を空白として扱います。',
      inputEncode: 'エンコードする文字列',
      inputDecode: 'デコードする URL・文字列',
      placeholderEncode: '例：東京 カフェ',
      placeholderDecode: '例：%E6%9D%B1%E4%BA%AC',
      errors: {
        'lone-surrogate': 'ペアになっていない UTF-16 サロゲート文字が含まれているため、エンコードできません。',
        'bad-percent': '{position} 文字目の「{snippet}」は正しいパーセントエンコードではありません。% の後には 16 進数 2 桁が必要です。',
        'bad-utf8':
          'パーセントエンコードされたバイト列が UTF-8 として正しくありません。途中で切れているか、Shift_JIS や EUC-JP など別の文字コードでエンコードされている可能性があります。',
      },
      urlErrors: {
        empty: 'URL を入力してください',
        invalid: 'この URL は解析できません。https://example.com/path?q=1 のような形式か確認してください',
      },
      assumedScheme: 'スキームがないため、https:// として解析しました',
      parts: {
        protocol: 'スキーム',
        username: 'ユーザー名',
        password: 'パスワード',
        host: 'ホスト',
        port: 'ポート',
        defaultPort: '{port}（既定）',
        path: 'パス',
        decodedPath: 'パス（デコード）',
        query: 'クエリ文字列',
        hash: 'フラグメント',
        origin: 'オリジン',
      },
      paramsLabel: 'クエリパラメータ',
      paramsCount: 'クエリパラメータ（{n} 個）',
    },
  },
});

import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import { ZH_ERROR_MESSAGES, type JsonErrorMessages, type JsonKind } from './logic';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  modeAria: string;
  format: string;
  minify: string;
  indentAria: string;
  spaces2: string;
  spaces4: string;
  tab: string;
  sortKeys: string;
  outputLabel: string;
  copy: string;
  download: string;
  sample: string;
  clear: string;
  client: {
    idle: string;
    /** {line} {column} {message} */
    errorAt: string;
    errors: JsonErrorMessages;
    kinds: Record<JsonKind, string>;
    members: PluralForms;
    /** {type} {members} {depth} */
    shapeNested: string;
    /** {shape} {sizes} */
    valid: string;
    sample: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '輸入 JSON',
    placeholder: '貼上 JSON，例如 {"name": "王小明", "tags": ["a", "b"]}',
    modeAria: '輸出模式',
    format: '格式化',
    minify: '壓縮',
    indentAria: '縮排',
    spaces2: '2 空格',
    spaces4: '4 空格',
    tab: 'Tab',
    sortKeys: '依鍵名排序',
    outputLabel: '結果',
    copy: '複製結果',
    download: '下載 .json',
    sample: '載入範例',
    clear: '清除',
    client: {
      idle: '貼上 JSON 後會即時驗證並輸出結果。',
      errorAt: '第 {line} 行第 {column} 欄：{message}',
      errors: ZH_ERROR_MESSAGES,
      kinds: { object: '物件', array: '陣列', string: '字串', number: '數字', boolean: '布林值', null: 'null' },
      members: { other: '{n} 個成員' },
      shapeNested: '{type}，{members}，深度 {depth}',
      valid: '有效的 JSON：{shape}。大小 {sizes}',
      sample:
        '{"name":"王小明","age":30,"email":"ming@example.com","active":true,"tags":["admin","editor"],"address":{"city":"台北市","zip":"100"},"lastLogin":null}',
    },
  },
  en: {
    inputLabel: 'JSON input',
    placeholder: 'Paste JSON, e.g. {"name": "Jane Doe", "tags": ["a", "b"]}',
    modeAria: 'Output mode',
    format: 'Beautify',
    minify: 'Minify',
    indentAria: 'Indentation',
    spaces2: '2 spaces',
    spaces4: '4 spaces',
    tab: 'Tab',
    sortKeys: 'Sort keys',
    outputLabel: 'Output',
    copy: 'Copy output',
    download: 'Download .json',
    sample: 'Load sample',
    clear: 'Clear',
    client: {
      idle: 'Paste JSON to validate and format it instantly.',
      errorAt: 'Line {line}, column {column}: {message}',
      errors: {
        codes: {
          empty: 'Enter some JSON',
          eof: 'Unexpected end of input. Expected {expected}',
          comment: 'JSON does not allow comments',
          'single-quote': 'JSON strings must use double quotes ", not single quotes',
          unexpected: 'Expected {expected} but found “{found}”',
          'bad-escape': 'Invalid escape. A backslash can only be followed by " \\ / b f n r t or uXXXX',
          'control-char': 'Strings cannot contain raw line breaks or control characters. Use an escape such as \\n',
          'unterminated-string': 'String is missing its closing double quote',
          'bad-number': 'Invalid number',
          'number-format': 'Invalid number (no leading zeros, extra decimal points or hex)',
          'trailing-comma-object': 'Trailing comma after the last property of an object',
          'trailing-comma-array': 'Trailing comma after the last element of an array',
          extra: 'Unexpected content after the end of the JSON',
        },
        expected: {
          value: 'a value (object, array, string, number, true, false or null)',
          key: 'a property name in double quotes',
          colon: 'a colon :',
          'comma-or-brace': 'a comma , or a closing }',
          'comma-or-bracket': 'a comma , or a closing ]',
        },
      },
      kinds: { object: 'Object', array: 'Array', string: 'String', number: 'Number', boolean: 'Boolean', null: 'null' },
      members: { one: '{n} member', other: '{n} members' },
      shapeNested: '{type} with {members}, depth {depth}',
      valid: 'Valid JSON: {shape}. Size {sizes}',
      sample:
        '{"name":"Jane Doe","age":30,"email":"jane@example.com","active":true,"tags":["admin","editor"],"address":{"street":"500 Congress Ave","city":"Austin","state":"TX","zip":"78701"},"lastLogin":null}',
    },
  },
  ja: {
    inputLabel: 'JSON を入力',
    placeholder: 'JSON を貼り付け（例：{"name": "山田太郎", "tags": ["a", "b"]}）',
    modeAria: '出力モード',
    format: '整形',
    minify: '圧縮',
    indentAria: 'インデント',
    spaces2: 'スペース 2',
    spaces4: 'スペース 4',
    tab: 'タブ',
    sortKeys: 'キー名で並べ替え',
    outputLabel: '結果',
    copy: '結果をコピー',
    download: '.json をダウンロード',
    sample: 'サンプルを読み込む',
    clear: 'クリア',
    client: {
      idle: 'JSON を貼り付けると、すぐに構文チェックして整形します。',
      errorAt: '{line} 行目 {column} 文字目：{message}',
      errors: {
        codes: {
          empty: 'JSON を入力してください',
          eof: 'データが途中で終わっています。{expected}が必要です',
          comment: 'JSON ではコメントは使えません',
          'single-quote': 'JSON の文字列はダブルクォート " で囲む必要があります（シングルクォートは不可）',
          unexpected: '{expected}が必要ですが、「{found}」があります',
          'bad-escape': '不正なエスケープです。バックスラッシュの後に続けられるのは " \\ / b f n r t または uXXXX だけです',
          'control-char': '文字列の中で直接改行したり制御文字を入れたりはできません。\\n などのエスケープを使ってください',
          'unterminated-string': '文字列の終わりのダブルクォートがありません',
          'bad-number': '数値の形式が正しくありません',
          'number-format': '数値の形式が正しくありません（先頭の 0、複数の小数点、16 進数は不可）',
          'trailing-comma-object': 'オブジェクトの最後のメンバーの後にカンマは付けられません',
          'trailing-comma-array': '配列の最後の要素の後にカンマは付けられません',
          extra: 'JSON の終わりの後に余分な内容があります',
        },
        expected: {
          value: '値（オブジェクト、配列、文字列、数値、true、false、null のいずれか）',
          key: 'ダブルクォートで囲んだキー名',
          colon: 'コロン「:」',
          'comma-or-brace': 'カンマ「,」または閉じかっこ「}」',
          'comma-or-bracket': 'カンマ「,」または閉じかっこ「]」',
        },
      },
      kinds: { object: 'オブジェクト', array: '配列', string: '文字列', number: '数値', boolean: '真偽値', null: 'null' },
      members: { other: '{n} 個のメンバー' },
      shapeNested: '{type}、{members}、階層の深さ {depth}',
      valid: '正しい JSON です：{shape}。サイズ {sizes}',
      sample:
        '{"name":"山田太郎","age":30,"email":"taro@example.jp","active":true,"tags":["admin","editor"],"address":{"zip":"100-0001","prefecture":"東京都","city":"千代田区"},"lastLogin":null}',
    },
  },
});

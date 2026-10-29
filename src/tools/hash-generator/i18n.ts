import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  sourceAria: string;
  text: string;
  file: string;
  uppercase: string;
  textLabel: string;
  textPlaceholder: string;
  dropTitle: string;
  dropHint: string;
  copy: string;
  compareLabel: string;
  comparePlaceholder: string;
  client: {
    /** {alg} */
    match: string;
    noMatch: string;
    /** {name} {size} */
    fileInfo: string;
    working: string;
    readError: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    sourceAria: '輸入來源',
    text: '文字',
    file: '檔案',
    uppercase: '大寫輸出',
    textLabel: '輸入文字（以 UTF-8 計算）',
    textPlaceholder: '輸入或貼上要計算雜湊的文字',
    dropTitle: '選擇檔案或拖曳到這裡',
    dropHint: '檔案只會在你的裝置上讀取與計算，不會上傳',
    copy: '複製',
    compareLabel: '比對雜湊值（選填）',
    comparePlaceholder: '貼上官方提供的檢查碼，例如 SHA-256 值',
    client: {
      match: '相符：與 {alg} 雜湊值完全一致',
      noMatch: '不相符：沒有任何演算法的結果與此值相同',
      fileInfo: '{name}（{size}）',
      working: '計算中…',
      readError: '無法讀取這個檔案，可能是檔案太大超出瀏覽器記憶體，或檔案已被移動。',
    },
  },
  en: {
    sourceAria: 'Input source',
    text: 'Text',
    file: 'File',
    uppercase: 'Uppercase output',
    textLabel: 'Text input (hashed as UTF-8)',
    textPlaceholder: 'Type or paste the text to hash',
    dropTitle: 'Choose a file or drop it here',
    dropHint: 'The file is read and hashed on your device and never uploaded',
    copy: 'Copy',
    compareLabel: 'Compare with a checksum (optional)',
    comparePlaceholder: 'Paste the published checksum, e.g. a SHA-256 value',
    client: {
      match: 'Match: identical to the {alg} hash',
      noMatch: 'No match: none of the algorithms produced this value',
      fileInfo: '{name} ({size})',
      working: 'Hashing…',
      readError: 'Couldn’t read this file. It may be too large for the browser’s memory, or it was moved.',
    },
  },
  ja: {
    sourceAria: '入力の種類',
    text: 'テキスト',
    file: 'ファイル',
    uppercase: '大文字で表示',
    textLabel: 'テキストを入力（UTF-8 で計算）',
    textPlaceholder: 'ハッシュ値を求めたいテキストを入力または貼り付け',
    dropTitle: 'ファイルを選択、またはここにドロップ',
    dropHint: 'ファイルは端末内で読み込んで計算し、アップロードされません',
    copy: 'コピー',
    compareLabel: 'ハッシュ値を照合（任意）',
    comparePlaceholder: '配布元が公開しているチェックサム（SHA-256 など）を貼り付け',
    client: {
      match: '一致：{alg} のハッシュ値と完全に一致しました',
      noMatch: '不一致：どのアルゴリズムの結果とも一致しません',
      fileInfo: '{name}（{size}）',
      working: '計算中…',
      readError: 'ファイルを読み込めませんでした。ブラウザのメモリに対して大きすぎるか、ファイルが移動された可能性があります。',
    },
  },
});

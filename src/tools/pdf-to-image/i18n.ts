import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { RangeMessages } from '../pdf-split/logic';
import type { PaperId } from './logic';

export interface Strings {
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  tryHint: string;
  sample: string;
  replace: string;
  formatLabel: string;
  dpiLabel: string;
  dpiAria: string;
  /** Text before the quality <output>. */
  qualityBefore: string;
  rangeLabel: string;
  rangePlaceholder: string;
  rangeHint: string;
  statCount: string;
  statDone: string;
  statBytes: string;
  zip: string;
  each: string;
  client: {
    hintJpeg: string;
    hintPng: string;
    /** Paper used in the DPI hint (A4 in zh/ja, Letter in en). */
    paper: PaperId;
    /** {w} {h} {use} */
    dpiHint: string;
    usePrint: string;
    useScreen: string;
    usePreview: string;
    waiting: string;
    converting: string;
    /** {p} */
    page: string;
    /** {size} = pixel size, {bytes} */
    cardMeta: string;
    download: string;
    zip: string;
    /** {n} {total} */
    zipProgress: string;
    pageFailed: string;
    limited: string;
    openEncrypted: string;
    openInvalid: string;
    /** {n} */
    pageCount: PluralForms;
    /** {pages} (from pageCount) {size} */
    fileInfo: string;
    notPdf: string;
    range: RangeMessages;
    errorSep: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '檔案不會上傳。',
    privacyText: 'PDF 轉圖片全程在你的瀏覽器中完成，檔案不會傳到任何伺服器，機密文件也能安心轉換。',
    dropTitle: '點擊選擇 PDF，或拖曳到這裡',
    dropHint: '每一頁會轉成一張 JPG 或 PNG 圖片',
    tryHint: '手邊沒有 PDF？',
    sample: '用 3 頁範例檔試試',
    replace: '換一個檔案',
    formatLabel: '圖片格式',
    dpiLabel: '解析度（DPI）',
    dpiAria: '解析度',
    qualityBefore: 'JPG 品質：',
    rangeLabel: '頁面範圍',
    rangePlaceholder: '留空＝全部頁面，例如 1-3,5',
    rangeHint: '可輸入 1-3,5,8-10 這類範圍。',
    statCount: '要轉換的頁數',
    statDone: '已完成',
    statBytes: '圖片總大小',
    zip: '全部下載（ZIP）',
    each: '逐張下載',
    client: {
      hintJpeg: 'JPG 檔案小，適合照片、掃描檔與傳 LINE。',
      hintPng: 'PNG 無損，文字與線條最銳利，但檔案較大。',
      paper: 'a4',
      dpiHint: 'A4 頁面約 {w} × {h} 像素。{use}',
      usePrint: '適合列印。',
      useScreen: '適合螢幕閱讀與分享。',
      usePreview: '檔案最小，適合預覽。',
      waiting: '等待中…',
      converting: '轉換中…',
      page: '第 {p} 頁',
      cardMeta: '{size}・{bytes}',
      download: '下載',
      zip: '全部下載（ZIP）',
      zipProgress: '轉換中…（{n}/{total}）',
      pageFailed: '這一頁無法轉換',
      limited: '部分頁面尺寸很大，已自動降低解析度以免超過瀏覽器的畫布上限。',
      openEncrypted: '這份 PDF 需要密碼才能開啟。請先用原本的軟體輸入密碼並另存一份沒有密碼的 PDF，再重新選擇。',
      openInvalid: '無法讀取這個檔案，可能不是 PDF 或檔案已損毀。',
      pageCount: { other: '{n} 頁' },
      fileInfo: '共 {pages}・{size}',
      notPdf: '請選擇 PDF 檔案。',
      range: { unreadable: '看不懂「{token}」', outOfRange: '「{token}」超出範圍（共 {count} 頁）' },
      errorSep: '；',
    },
  },
  en: {
    privacyStrong: 'Your file never leaves your device. ',
    privacyText: 'Pages are converted to images right in your browser and nothing is uploaded, so confidential documents stay private.',
    dropTitle: 'Click to choose a PDF, or drop it here',
    dropHint: 'Every page becomes its own JPG or PNG image',
    tryHint: 'No PDF at hand?',
    sample: 'Try a 3-page sample',
    replace: 'Choose another file',
    formatLabel: 'Image format',
    dpiLabel: 'Resolution (DPI)',
    dpiAria: 'Resolution',
    qualityBefore: 'JPG quality: ',
    rangeLabel: 'Pages',
    rangePlaceholder: 'Leave empty for all pages, e.g. 1-3, 5',
    rangeHint: 'Type ranges such as 1-3, 5, 8-10.',
    statCount: 'Pages to convert',
    statDone: 'Done',
    statBytes: 'Total image size',
    zip: 'Download all (ZIP)',
    each: 'Download one by one',
    client: {
      hintJpeg: 'JPG files are small: best for photos, scans and sharing by email or chat.',
      hintPng: 'PNG is lossless, with the sharpest text and lines, but the files are larger.',
      paper: 'letter',
      dpiHint: 'A Letter-size page is about {w} × {h} pixels. {use}',
      usePrint: 'Good for printing.',
      useScreen: 'Good for reading on screen and sharing.',
      usePreview: 'Smallest files, good for previews.',
      waiting: 'Waiting…',
      converting: 'Converting…',
      page: 'Page {p}',
      cardMeta: '{size} · {bytes}',
      download: 'Download',
      zip: 'Download all (ZIP)',
      zipProgress: 'Converting… ({n}/{total})',
      pageFailed: 'This page couldn’t be converted',
      limited: 'Some pages are very large, so their resolution was lowered to stay within the browser’s canvas limit.',
      openEncrypted:
        'This PDF needs a password to open. Open it in your PDF reader with the password, save an unprotected copy, then choose that copy.',
      openInvalid: 'This file can’t be read. It may not be a PDF, or it may be damaged.',
      pageCount: { one: '{n} page', other: '{n} pages' },
      fileInfo: '{pages} · {size}',
      notPdf: 'Please choose a PDF file.',
      range: { unreadable: 'Can’t read “{token}”', outOfRange: '“{token}” is out of range (the PDF has {count} pages)' },
      errorSep: '; ',
    },
  },
  ja: {
    privacyStrong: 'ファイルはアップロードされません。',
    privacyText: 'PDF から画像への変換はすべてブラウザ内で行われ、サーバーには送信されません。社外秘の書類も安心して変換できます。',
    dropTitle: 'クリックして PDF を選択、またはここにドロップ',
    dropHint: '1 ページごとに JPG または PNG の画像に変換します',
    tryHint: '手元に PDF がない場合は',
    sample: '3 ページのサンプルで試す',
    replace: '別のファイルを選ぶ',
    formatLabel: '画像形式',
    dpiLabel: '解像度（dpi）',
    dpiAria: '解像度',
    qualityBefore: 'JPG 画質：',
    rangeLabel: 'ページ範囲',
    rangePlaceholder: '空欄＝全ページ（例：1-3,5）',
    rangeHint: '1-3,5,8-10 のように範囲を指定できます。',
    statCount: '変換するページ数',
    statDone: '完了',
    statBytes: '画像の合計サイズ',
    zip: 'まとめてダウンロード（ZIP）',
    each: '1 枚ずつダウンロード',
    client: {
      hintJpeg: 'JPG はファイルが小さく、写真やスキャン画像、LINE やメールでの共有に向いています。',
      hintPng: 'PNG は劣化がなく文字や線が最もくっきりしますが、ファイルは大きくなります。',
      paper: 'a4',
      dpiHint: 'A4 の 1 ページは約 {w} × {h} ピクセルです。{use}',
      usePrint: '印刷に向いています。',
      useScreen: '画面での閲覧や共有に向いています。',
      usePreview: 'ファイルが最も小さく、プレビュー向きです。',
      waiting: '待機中…',
      converting: '変換中…',
      page: '{p} ページ目',
      cardMeta: '{size}・{bytes}',
      download: 'ダウンロード',
      zip: 'まとめてダウンロード（ZIP）',
      zipProgress: '変換中…（{n}/{total}）',
      pageFailed: 'このページは変換できませんでした',
      limited: 'サイズが非常に大きいページがあったため、ブラウザの上限を超えないよう解像度を自動的に下げました。',
      openEncrypted:
        'この PDF は開くのにパスワードが必要です。元のアプリでパスワードを入力して開き、パスワードなしのコピーを保存してから選び直してください。',
      openInvalid: 'このファイルを読み込めません。PDF ではないか、ファイルが破損している可能性があります。',
      pageCount: { other: '{n} ページ' },
      fileInfo: '全 {pages}・{size}',
      notPdf: 'PDF ファイルを選んでください。',
      range: { unreadable: '「{token}」を読み取れません', outOfRange: '「{token}」は範囲外です（全 {count} ページ）' },
      errorSep: '／',
    },
  },
});

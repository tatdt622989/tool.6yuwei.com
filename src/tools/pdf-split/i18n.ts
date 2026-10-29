import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { PdfErrorCode } from '../pdf-merge/pdf-ops';
import type { RangeMessages } from './logic';

export interface Strings {
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  tryHint: string;
  sample: string;
  replace: string;
  modeLabel: string;
  modeExtract: string;
  modeDelete: string;
  modeEach: string;
  modeEvery: string;
  rangeLabel: string;
  rangePlaceholder: string;
  rangeHint: string;
  selAll: string;
  selOdd: string;
  selEven: string;
  selInvert: string;
  selNone: string;
  everyLabel: string;
  rotateHint: string;
  rotateAll: string;
  gridAria: string;
  run: string;
  zip: string;
  client: {
    /** {size} */
    reading: string;
    /** {n} → "3 頁" / "3 pages" */
    pageCount: PluralForms;
    /** {pages} (from pageCount) {size} */
    fileInfo: string;
    /** {p} */
    pageAria: string;
    rotateAria: string;
    rotateTitle: string;
    /** {n} = output file number */
    part: string;
    /** {n} pages, {ranges} */
    planExtract: PluralForms;
    noSelectionExtract: string;
    noSelectionDelete: string;
    /** {n} removed pages, {kept} (from pageCount) */
    planDelete: PluralForms;
    deleteAll: string;
    /** {n} files */
    planSplitOne: string;
    planSplitMany: string;
    runExtract: string;
    runDelete: string;
    runSplit: string;
    runSplitZip: string;
    processing: string;
    /** {n} {total} */
    processingProgress: string;
    openEncrypted: string;
    openInvalid: string;
    /** {pages} (from pageCount) {size} */
    outMeta: string;
    download: string;
    /** {n} */
    resultsTitle: PluralForms;
    /** {error} */
    failed: string;
    notPdf: string;
    multiple: string;
    errors: Record<PdfErrorCode, string>;
    range: RangeMessages;
    /** Joins several range problems. */
    errorSep: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '檔案不會上傳。',
    privacyText: 'PDF 分割與擷取全程在你的瀏覽器中完成，檔案不會傳到任何伺服器，機密文件也能安心處理。',
    dropTitle: '點擊選擇 PDF，或拖曳到這裡',
    dropHint: '選好後會顯示每一頁的縮圖，點選要擷取或刪除的頁面',
    tryHint: '手邊沒有 PDF？',
    sample: '用 8 頁範例檔試試',
    replace: '換一個檔案',
    modeLabel: '分割方式',
    modeExtract: '擷取選取頁面',
    modeDelete: '刪除選取頁面',
    modeEach: '每頁存成一個檔',
    modeEvery: '每 N 頁分割',
    rangeLabel: '頁面範圍',
    rangePlaceholder: '例如 1-3,5,8-10',
    rangeHint: '輸入頁碼與範圍，或直接點選下方縮圖；按住 Shift 點選可一次選取連續頁面。',
    selAll: '全選',
    selOdd: '奇數頁',
    selEven: '偶數頁',
    selInvert: '反向選取',
    selNone: '清除選取',
    everyLabel: '每幾頁分成一個檔案',
    rotateHint: '點縮圖右下角的箭頭可旋轉該頁，輸出時套用。',
    rotateAll: '全部向右轉 90°',
    gridAria: '頁面縮圖',
    run: '擷取並下載',
    zip: '全部下載（ZIP）',
    client: {
      reading: '{size}・讀取中…',
      pageCount: { other: '{n} 頁' },
      fileInfo: '共 {pages}・{size}',
      pageAria: '第 {p} 頁',
      rotateAria: '第 {p} 頁向右旋轉 90 度',
      rotateTitle: '向右旋轉 90°',
      part: '第 {n} 份',
      planExtract: { other: '將輸出 1 個 PDF，包含第 {ranges} 頁，共 {n} 頁。' },
      noSelectionExtract: '尚未選取頁面：點選縮圖或在上方輸入頁碼。',
      noSelectionDelete: '尚未選取要刪除的頁面：點選縮圖或在上方輸入頁碼。',
      planDelete: { other: '將刪除 {n} 頁，輸出剩下的 {kept}。' },
      deleteAll: '不能刪除全部頁面，請至少保留一頁。',
      planSplitOne: '將輸出 {n} 個 PDF。',
      planSplitMany: '將輸出 {n} 個 PDF，打包成一個 ZIP 下載。',
      runExtract: '擷取並下載',
      runDelete: '刪除頁面並下載',
      runSplit: '分割並下載',
      runSplitZip: '分割並下載 ZIP',
      processing: '處理中…',
      processingProgress: '處理中…（{n}/{total}）',
      openEncrypted:
        '這份 PDF 需要密碼才能開啟，無法在瀏覽器中分割。請先用原本的軟體輸入密碼並另存一份沒有密碼的 PDF，再重新選擇。',
      openInvalid: '無法讀取這個檔案，可能不是 PDF 或檔案已損毀。',
      outMeta: '{pages}・{size}',
      download: '下載',
      resultsTitle: { other: '已產生 {n} 個 PDF' },
      failed: '處理失敗：{error}',
      notPdf: '請選擇 PDF 檔案。若要把圖片轉成 PDF，請使用「圖片轉 PDF」工具。',
      multiple: '一次只能分割一個 PDF，已開啟第一個檔案。要把多個 PDF 合成一份，請使用「PDF 合併」。',
      errors: {
        encrypted:
          '這份 PDF 有密碼保護或加密，無法在瀏覽器中編輯。請先用原本的軟體解除保護（例如開啟後「列印」另存成 PDF），再重新加入。',
        invalid: '無法讀取這個檔案，可能不是 PDF 或檔案已損毀。',
        empty: '這份 PDF 沒有任何頁面。',
      },
      range: { unreadable: '看不懂「{token}」', outOfRange: '「{token}」超出範圍（共 {count} 頁）' },
      errorSep: '；',
    },
  },
  en: {
    privacyStrong: 'Your file never leaves your device. ',
    privacyText: 'Pages are split and extracted right in your browser and nothing is uploaded, so confidential documents stay private.',
    dropTitle: 'Click to choose a PDF, or drop it here',
    dropHint: 'You’ll see a thumbnail of every page; click the pages to extract or delete',
    tryHint: 'No PDF at hand?',
    sample: 'Try an 8-page sample',
    replace: 'Choose another file',
    modeLabel: 'How to split',
    modeExtract: 'Extract selected pages',
    modeDelete: 'Delete selected pages',
    modeEach: 'Every page as a file',
    modeEvery: 'Split every N pages',
    rangeLabel: 'Pages',
    rangePlaceholder: 'e.g. 1-3, 5, 8-10',
    rangeHint: 'Type page numbers and ranges, or click the thumbnails below. Shift-click to select a run of pages.',
    selAll: 'All',
    selOdd: 'Odd pages',
    selEven: 'Even pages',
    selInvert: 'Invert',
    selNone: 'Clear',
    everyLabel: 'Pages per file',
    rotateHint: 'Click the arrow at the bottom right of a thumbnail to rotate that page in the output.',
    rotateAll: 'Rotate all 90° right',
    gridAria: 'Page thumbnails',
    run: 'Extract and download',
    zip: 'Download all (ZIP)',
    client: {
      reading: '{size} · reading…',
      pageCount: { one: '{n} page', other: '{n} pages' },
      fileInfo: '{pages} · {size}',
      pageAria: 'Page {p}',
      rotateAria: 'Rotate page {p} 90 degrees clockwise',
      rotateTitle: 'Rotate 90° right',
      part: 'File {n}',
      planExtract: {
        one: 'Will create 1 PDF with page {ranges}.',
        other: 'Will create 1 PDF with pages {ranges} ({n} pages).',
      },
      noSelectionExtract: 'No pages selected yet. Click the thumbnails or type page numbers above.',
      noSelectionDelete: 'No pages selected for deletion yet. Click the thumbnails or type page numbers above.',
      planDelete: {
        one: 'Will delete {n} page and keep the remaining {kept}.',
        other: 'Will delete {n} pages and keep the remaining {kept}.',
      },
      deleteAll: 'You can’t delete every page. Keep at least one.',
      planSplitOne: 'Will create {n} PDF.',
      planSplitMany: 'Will create {n} PDFs, downloaded together as one ZIP file.',
      runExtract: 'Extract and download',
      runDelete: 'Delete pages and download',
      runSplit: 'Split and download',
      runSplitZip: 'Split and download ZIP',
      processing: 'Working…',
      processingProgress: 'Working… ({n}/{total})',
      openEncrypted:
        'This PDF needs a password to open, so it can’t be split in the browser. Open it in your PDF reader with the password, save an unprotected copy, then choose that copy.',
      openInvalid: 'This file can’t be read. It may not be a PDF, or it may be damaged.',
      outMeta: '{pages} · {size}',
      download: 'Download',
      resultsTitle: { one: 'Created {n} PDF', other: 'Created {n} PDFs' },
      failed: 'Something went wrong: {error}',
      notPdf: 'Please choose a PDF file. To turn images into a PDF, use the JPG to PDF tool.',
      multiple: 'Only one PDF can be split at a time, so the first file was opened. To combine several PDFs, use Merge PDF.',
      errors: {
        encrypted:
          'This PDF is password-protected or encrypted, so it can’t be edited in the browser. Open it in your PDF reader, use Print and choose “Save as PDF” to make an unlocked copy, then use that copy.',
        invalid: 'This file can’t be read. It may not be a PDF, or it may be damaged.',
        empty: 'This PDF has no pages.',
      },
      range: { unreadable: 'Can’t read “{token}”', outOfRange: '“{token}” is out of range (the PDF has {count} pages)' },
      errorSep: '; ',
    },
  },
  ja: {
    privacyStrong: 'ファイルはアップロードされません。',
    privacyText: 'PDF の分割・ページ抽出はすべてブラウザ内で行われ、サーバーには送信されません。社外秘の書類も安心して扱えます。',
    dropTitle: 'クリックして PDF を選択、またはここにドロップ',
    dropHint: '選ぶと全ページのサムネイルが表示されます。抜き出す・削除するページをクリックしてください',
    tryHint: '手元に PDF がない場合は',
    sample: '8 ページのサンプルで試す',
    replace: '別のファイルを選ぶ',
    modeLabel: '分割の方法',
    modeExtract: '選んだページを抽出',
    modeDelete: '選んだページを削除',
    modeEach: '1 ページずつ分割',
    modeEvery: 'N ページごとに分割',
    rangeLabel: 'ページ範囲',
    rangePlaceholder: '例：1-3,5,8-10',
    rangeHint: 'ページ番号や範囲を入力するか、下のサムネイルをクリックします。Shift キーを押しながらクリックすると連続したページをまとめて選べます。',
    selAll: 'すべて選択',
    selOdd: '奇数ページ',
    selEven: '偶数ページ',
    selInvert: '選択を反転',
    selNone: '選択を解除',
    everyLabel: '何ページごとに分けるか',
    rotateHint: 'サムネイル右下の矢印でそのページを回転できます。出力時に反映されます。',
    rotateAll: 'すべて右に 90° 回転',
    gridAria: 'ページのサムネイル',
    run: '抽出してダウンロード',
    zip: 'まとめてダウンロード（ZIP）',
    client: {
      reading: '{size}・読み込み中…',
      pageCount: { other: '{n} ページ' },
      fileInfo: '全 {pages}・{size}',
      pageAria: '{p} ページ目',
      rotateAria: '{p} ページ目を右に 90 度回転',
      rotateTitle: '右に 90° 回転',
      part: 'ファイル {n}',
      planExtract: { other: '{ranges} ページ（計 {n} ページ）を 1 つの PDF として出力します。' },
      noSelectionExtract: 'ページが選ばれていません。サムネイルをクリックするか、上の欄にページ番号を入力してください。',
      noSelectionDelete: '削除するページが選ばれていません。サムネイルをクリックするか、上の欄にページ番号を入力してください。',
      planDelete: { other: '{n} ページを削除し、残りの {kept}を出力します。' },
      deleteAll: 'すべてのページは削除できません。1 ページ以上残してください。',
      planSplitOne: '{n} 個の PDF を出力します。',
      planSplitMany: '{n} 個の PDF を出力し、1 つの ZIP にまとめてダウンロードします。',
      runExtract: '抽出してダウンロード',
      runDelete: 'ページを削除してダウンロード',
      runSplit: '分割してダウンロード',
      runSplitZip: '分割して ZIP でダウンロード',
      processing: '処理中…',
      processingProgress: '処理中…（{n}/{total}）',
      openEncrypted:
        'この PDF は開くのにパスワードが必要なため、ブラウザでは分割できません。元のアプリでパスワードを入力して開き、パスワードなしのコピーを保存してから選び直してください。',
      openInvalid: 'このファイルを読み込めません。PDF ではないか、ファイルが破損している可能性があります。',
      outMeta: '{pages}・{size}',
      download: 'ダウンロード',
      resultsTitle: { other: '{n} 個の PDF を作成しました' },
      failed: '処理に失敗しました：{error}',
      notPdf: 'PDF ファイルを選んでください。画像を PDF にするには「画像 PDF 変換」をお使いください。',
      multiple: '一度に分割できる PDF は 1 つです。最初のファイルを開きました。複数の PDF を 1 つにするには「PDF 結合」をお使いください。',
      errors: {
        encrypted:
          'この PDF はパスワードで保護または暗号化されているため、ブラウザでは編集できません。元のアプリで開き、「印刷」から「PDF として保存」で保護のないコピーを作ってからお使いください。',
        invalid: 'このファイルを読み込めません。PDF ではないか、ファイルが破損している可能性があります。',
        empty: 'この PDF にはページがありません。',
      },
      range: { unreadable: '「{token}」を読み取れません', outOfRange: '「{token}」は範囲外です（全 {count} ページ）' },
      errorSep: '／',
    },
  },
});

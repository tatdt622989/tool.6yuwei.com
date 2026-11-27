import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { PdfErrorCode } from './pdf-ops';

export interface Strings {
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  tryHint: string;
  sample: string;
  listAria: string;
  orderHint: string;
  statFiles: string;
  statPages: string;
  statBytes: string;
  nameLabel: string;
  /** Default output file name (without .pdf). */
  nameDefault: string;
  merge: string;
  clear: string;
  client: {
    grip: string;
    /** {size} */
    reading: string;
    /** {n} = page count */
    pageCount: PluralForms;
    /** {pages} {size} */
    meta: string;
    /** {name} */
    moveUp: string;
    moveDown: string;
    remove: string;
    needMore: string;
    merge: string;
    merging: string;
    /** {n} {total} */
    mergingProgress: string;
    /** {n} skipped files */
    skipped: PluralForms;
    /** {files} {pages} {size} {name} */
    done: string;
    /** {error} */
    failed: string;
    errors: Record<PdfErrorCode, string>;
    nameFallback: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '檔案不會上傳。',
    privacyText: 'PDF 合併全程在你的瀏覽器中完成，檔案不會傳到任何伺服器，合約、報稅資料、身分證影本等機密文件也能安心處理。',
    dropTitle: '點擊選擇 PDF，或拖曳到這裡',
    dropHint: '可一次選多個檔案，之後也能繼續加入',
    tryHint: '手邊沒有 PDF？',
    sample: '用兩份範例檔試試',
    listAria: '要合併的 PDF，由上到下依序合併',
    orderHint: '按住左側把手拖曳即可調整順序（手機也可以），或使用上下箭頭按鈕。合併時依列表由上到下排列。',
    statFiles: '檔案數',
    statPages: '合併後總頁數',
    statBytes: '原始總大小',
    nameLabel: '輸出檔名',
    nameDefault: 'merged',
    merge: '合併並下載',
    clear: '清除全部',
    client: {
      grip: '拖曳調整順序',
      reading: '{size}・讀取中…',
      pageCount: { other: '{n} 頁' },
      meta: '{pages}・{size}',
      moveUp: '將「{name}」上移',
      moveDown: '將「{name}」下移',
      remove: '移除「{name}」',
      needMore: '請再加入至少一個 PDF',
      merge: '合併並下載',
      merging: '合併中…',
      mergingProgress: '合併中…（{n}/{total}）',
      skipped: { other: '已略過 {n} 個不是 PDF 的檔案。若要把圖片轉成 PDF，請使用「圖片轉 PDF」工具。' },
      done: '已合併 {files} 個檔案，共 {pages} 頁（{size}），檔案「{name}」已開始下載。',
      failed: '合併失敗：{error}',
      errors: {
        encrypted:
          '這份 PDF 有密碼保護或加密，無法在瀏覽器中編輯。請先用原本的軟體解除保護（例如開啟後「列印」另存成 PDF），再重新加入。',
        invalid: '無法讀取這個檔案，可能不是 PDF 或檔案已損毀。',
        empty: '這份 PDF 沒有任何頁面。',
      },
      nameFallback: 'merged',
    },
  },
  en: {
    privacyStrong: 'Your files never leave your device. ',
    privacyText:
      'The PDFs are merged right in your browser and are not uploaded to any server, so contracts, tax forms and ID scans stay private.',
    dropTitle: 'Click to choose PDFs, or drop them here',
    dropHint: 'Select several files at once; you can add more later',
    tryHint: 'No PDF at hand?',
    sample: 'Try two sample files',
    listAria: 'PDFs to merge, combined from top to bottom',
    orderHint:
      'Drag the handle on the left to reorder (works on phones too), or use the up and down arrows. Files are combined from top to bottom.',
    statFiles: 'Files',
    statPages: 'Total pages',
    statBytes: 'Total size',
    nameLabel: 'File name',
    nameDefault: 'merged',
    merge: 'Merge and download',
    clear: 'Clear all',
    client: {
      grip: 'Drag to reorder',
      reading: '{size} · reading…',
      pageCount: { one: '{n} page', other: '{n} pages' },
      meta: '{pages} · {size}',
      moveUp: 'Move “{name}” up',
      moveDown: 'Move “{name}” down',
      remove: 'Remove “{name}”',
      needMore: 'Add at least one more PDF',
      merge: 'Merge and download',
      merging: 'Merging…',
      mergingProgress: 'Merging… ({n}/{total})',
      skipped: {
        one: 'Skipped {n} file that is not a PDF. To turn images into a PDF, use the JPG to PDF tool.',
        other: 'Skipped {n} files that are not PDFs. To turn images into a PDF, use the JPG to PDF tool.',
      },
      done: 'Merged {files} files into one PDF with {pages} pages ({size}). “{name}” is downloading.',
      failed: 'Merge failed: {error}',
      errors: {
        encrypted:
          'This PDF is password-protected or encrypted, so it can’t be edited in the browser. Open it in your PDF reader, use Print and choose “Save as PDF” to make an unlocked copy, then add that copy.',
        invalid: 'This file can’t be read. It may not be a PDF, or it may be damaged.',
        empty: 'This PDF has no pages.',
      },
      nameFallback: 'merged',
    },
  },
  ja: {
    privacyStrong: 'ファイルはアップロードされません。',
    privacyText:
      'PDF の結合はすべてブラウザ内で行われ、サーバーには送信されません。契約書や確定申告の書類、本人確認書類のコピーなども安心して扱えます。',
    dropTitle: 'クリックして PDF を選択、またはここにドロップ',
    dropHint: '複数のファイルをまとめて選べます。あとから追加することもできます',
    tryHint: '手元に PDF がない場合は',
    sample: 'サンプル 2 件で試す',
    listAria: '結合する PDF（上から順に結合）',
    orderHint:
      '左のつまみをドラッグして順番を入れ替えられます（スマホでも可）。上下の矢印ボタンも使えます。リストの上から順に結合されます。',
    statFiles: 'ファイル数',
    statPages: '結合後のページ数',
    statBytes: '元の合計サイズ',
    nameLabel: '保存するファイル名',
    nameDefault: 'merged',
    merge: '結合してダウンロード',
    clear: 'すべてクリア',
    client: {
      grip: 'ドラッグして並べ替え',
      reading: '{size}・読み込み中…',
      pageCount: { other: '{n} ページ' },
      meta: '{pages}・{size}',
      moveUp: '「{name}」を上へ移動',
      moveDown: '「{name}」を下へ移動',
      remove: '「{name}」を削除',
      needMore: 'PDF をもう 1 つ以上追加してください',
      merge: '結合してダウンロード',
      merging: '結合中…',
      mergingProgress: '結合中…（{n}/{total}）',
      skipped: { other: 'PDF ではないファイル {n} 件をスキップしました。画像を PDF にするには「画像 PDF 変換」をお使いください。' },
      done: '{files} 個のファイルを結合しました（全 {pages} ページ、{size}）。「{name}」のダウンロードを開始しました。',
      failed: '結合に失敗しました：{error}',
      errors: {
        encrypted:
          'この PDF はパスワードで保護または暗号化されているため、ブラウザでは編集できません。元のアプリで開き、「印刷」から「PDF として保存」で保護のないコピーを作ってから追加してください。',
        invalid: 'このファイルを読み込めません。PDF ではないか、ファイルが破損している可能性があります。',
        empty: 'この PDF にはページがありません。',
      },
      nameFallback: 'merged',
    },
  },
});

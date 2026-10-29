import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { PageSizeId } from './logic';

type PaperId = Exclude<PageSizeId, 'fit'>;

export interface Strings {
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  sizeLabel: string;
  sizeFit: string;
  orientLabel: string;
  orientAria: string;
  orientAuto: string;
  orientPortrait: string;
  orientLandscape: string;
  marginLabel: string;
  marginNone: string;
  marginSmall: string;
  marginLarge: string;
  listAria: string;
  orderHint: string;
  statCount: string;
  statBytes: string;
  nameLabel: string;
  nameDefault: string;
  make: string;
  clear: string;
  client: {
    /** Paper selected on first visit: A4 for zh-TW / ja, Letter for en. */
    defaultSize: PaperId;
    grip: string;
    /** {size} */
    reading: string;
    /** {dims} {size} */
    meta: string;
    /** {name} */
    moveUp: string;
    moveDown: string;
    remove: string;
    layoutFit: string;
    /** {paper} {auto} */
    layoutPaper: string;
    paperA4: string;
    paperLetter: string;
    autoNote: string;
    unreadable: string;
    /** {n} */
    skippedHeic: PluralForms;
    skippedOther: PluralForms;
    making: string;
    /** {n} {total} */
    makingProgress: string;
    /** {n} pages, {size} {name} */
    done: PluralForms;
    failed: string;
    make: string;
    nameFallback: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '圖片不會上傳。',
    privacyText: 'JPG 轉 PDF 全程在你的瀏覽器中完成，證件、收據、作業掃描檔都不會傳到任何伺服器。',
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP 等，可一次選多張，也可以按 Ctrl/Cmd + V 貼上截圖',
    sizeLabel: '紙張大小',
    sizeFit: '符合圖片',
    orientLabel: '方向',
    orientAria: '頁面方向',
    orientAuto: '自動',
    orientPortrait: '直向',
    orientLandscape: '橫向',
    marginLabel: '邊界',
    marginNone: '無',
    marginSmall: '窄 10 mm',
    marginLarge: '寬 20 mm',
    listAria: '圖片，由上到下依序成為 PDF 的每一頁',
    orderHint: '按住左側把手拖曳即可調整頁面順序（手機也可以），或使用上下箭頭按鈕。縮圖顯示圖片在頁面上的實際位置。',
    statCount: '頁數（一張圖一頁）',
    statBytes: '圖片總大小',
    nameLabel: '輸出檔名',
    nameDefault: 'images',
    make: '轉成 PDF 並下載',
    clear: '清除全部',
    client: {
      defaultSize: 'a4',
      grip: '拖曳調整順序',
      reading: '{size}・讀取中…',
      meta: '{dims}・{size}',
      moveUp: '將「{name}」上移',
      moveDown: '將「{name}」下移',
      remove: '移除「{name}」',
      layoutFit: '每一頁的大小會跟圖片一樣（以 96 DPI 換算），不會留白，適合截圖與長圖。',
      layoutPaper: '每張圖片會等比例縮放、置中放在 {paper}頁面上，不會被裁切或變形。{auto}',
      paperA4: 'A4（210 × 297 mm）',
      paperLetter: 'Letter（8.5 × 11 吋）',
      autoNote: '橫的圖片會自動使用橫向頁面。',
      unreadable: '無法讀取這張圖片，可能是瀏覽器不支援此格式（例如 HEIC）或檔案已損毀。',
      skippedHeic: { other: '已略過 {n} 個檔案。iPhone 的 HEIC 照片請先用「HEIC 轉 JPG」工具轉檔，再加入這裡。' },
      skippedOther: { other: '已略過 {n} 個不是圖片的檔案。要合併 PDF 請使用「PDF 合併」。' },
      making: '產生中…',
      makingProgress: '產生中…（{n}/{total}）',
      done: { other: '已產生 {n} 頁的 PDF（{size}），檔案「{name}」已開始下載。' },
      failed: '產生 PDF 時發生錯誤，可能有圖片損毀或尺寸過大。可移除有問題的圖片後再試一次。',
      make: '轉成 PDF 並下載',
      nameFallback: 'images',
    },
  },
  en: {
    privacyStrong: 'Your images never leave your device. ',
    privacyText: 'The PDF is built right in your browser, so IDs, receipts and scanned homework are never uploaded to a server.',
    dropTitle: 'Click to choose images, or drop them here',
    dropHint: 'JPG, PNG, WebP and more. Select several at once, or paste a screenshot with Ctrl/Cmd + V',
    sizeLabel: 'Page size',
    sizeFit: 'Fit image',
    orientLabel: 'Orientation',
    orientAria: 'Page orientation',
    orientAuto: 'Auto',
    orientPortrait: 'Portrait',
    orientLandscape: 'Landscape',
    marginLabel: 'Margin',
    marginNone: 'None',
    marginSmall: 'Narrow 0.4 in',
    marginLarge: 'Wide 0.8 in',
    listAria: 'Images, each one becomes a PDF page from top to bottom',
    orderHint:
      'Drag the handle on the left to reorder pages (works on phones too), or use the up and down arrows. Each thumbnail shows where the image sits on the page.',
    statCount: 'Pages (one image per page)',
    statBytes: 'Total image size',
    nameLabel: 'File name',
    nameDefault: 'images',
    make: 'Convert to PDF and download',
    clear: 'Clear all',
    client: {
      defaultSize: 'letter',
      grip: 'Drag to reorder',
      reading: '{size} · reading…',
      meta: '{dims} · {size}',
      moveUp: 'Move “{name}” up',
      moveDown: 'Move “{name}” down',
      remove: 'Remove “{name}”',
      layoutFit: 'Each page is exactly the size of its image (at 96 DPI) with no white border. Best for screenshots and long images.',
      layoutPaper: 'Each image is scaled to fit and centered on a {paper} page, never cropped or stretched. {auto}',
      paperA4: 'A4 (210 × 297 mm)',
      paperLetter: 'US Letter (8.5 × 11 in)',
      autoNote: 'Landscape images get a landscape page automatically.',
      unreadable: 'This image can’t be read. Your browser may not support the format (HEIC, for example), or the file is damaged.',
      skippedHeic: {
        one: 'Skipped {n} file. Convert iPhone HEIC photos with the HEIC to JPG tool first, then add them here.',
        other: 'Skipped {n} files. Convert iPhone HEIC photos with the HEIC to JPG tool first, then add them here.',
      },
      skippedOther: {
        one: 'Skipped {n} file that isn’t an image. To combine PDFs, use Merge PDF.',
        other: 'Skipped {n} files that aren’t images. To combine PDFs, use Merge PDF.',
      },
      making: 'Creating PDF…',
      makingProgress: 'Creating PDF… ({n}/{total})',
      done: { other: 'Created a {n}-page PDF ({size}). “{name}” is downloading.' },
      failed: 'Couldn’t create the PDF. An image may be damaged or too large. Remove it and try again.',
      make: 'Convert to PDF and download',
      nameFallback: 'images',
    },
  },
  ja: {
    privacyStrong: '画像はアップロードされません。',
    privacyText: 'JPG から PDF への変換はすべてブラウザ内で行われます。本人確認書類や領収書、提出物のスキャン画像もサーバーには送信されません。',
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP などに対応。複数をまとめて選べ、Ctrl/Cmd + V でスクリーンショットの貼り付けもできます',
    sizeLabel: '用紙サイズ',
    sizeFit: '画像に合わせる',
    orientLabel: '向き',
    orientAria: 'ページの向き',
    orientAuto: '自動',
    orientPortrait: '縦',
    orientLandscape: '横',
    marginLabel: '余白',
    marginNone: 'なし',
    marginSmall: '狭い 10 mm',
    marginLarge: '広い 20 mm',
    listAria: '画像（上から順に PDF の各ページになります）',
    orderHint:
      '左のつまみをドラッグしてページの順番を入れ替えられます（スマホでも可）。上下の矢印ボタンも使えます。サムネイルはページ上での実際の配置を表しています。',
    statCount: 'ページ数（1 枚 1 ページ）',
    statBytes: '画像の合計サイズ',
    nameLabel: '保存するファイル名',
    nameDefault: 'images',
    make: 'PDF に変換してダウンロード',
    clear: 'すべてクリア',
    client: {
      defaultSize: 'a4',
      grip: 'ドラッグして並べ替え',
      reading: '{size}・読み込み中…',
      meta: '{dims}・{size}',
      moveUp: '「{name}」を上へ移動',
      moveDown: '「{name}」を下へ移動',
      remove: '「{name}」を削除',
      layoutFit: '各ページを画像と同じ大きさ（96 dpi 換算）にし、余白を付けません。スクリーンショットや縦長の画像に向いています。',
      layoutPaper: '各画像は縦横比を保ったまま縮小し、{paper}の用紙の中央に配置します。切れたり変形したりはしません。{auto}',
      paperA4: 'A4（210 × 297 mm）',
      paperLetter: 'レター（8.5 × 11 インチ）',
      autoNote: '横長の画像は自動的に横向きのページになります。',
      unreadable: 'この画像を読み込めません。ブラウザが対応していない形式（HEIC など）か、ファイルが破損している可能性があります。',
      skippedHeic: { other: '{n} 件のファイルをスキップしました。iPhone の HEIC 写真は「HEIC JPG 変換」で JPG にしてから追加してください。' },
      skippedOther: { other: '画像ではないファイル {n} 件をスキップしました。PDF 同士をまとめるには「PDF 結合」をお使いください。' },
      making: '作成中…',
      makingProgress: '作成中…（{n}/{total}）',
      done: { other: '{n} ページの PDF（{size}）を作成しました。「{name}」のダウンロードを開始しました。' },
      failed: 'PDF の作成中にエラーが発生しました。破損した画像やサイズが大きすぎる画像が含まれている可能性があります。問題の画像を外してもう一度お試しください。',
      make: 'PDF に変換してダウンロード',
      nameFallback: 'images',
    },
  },
});

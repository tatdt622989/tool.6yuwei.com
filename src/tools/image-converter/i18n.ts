import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  dropTitle: string;
  dropHint: string;
  formatLabel: string;
  formatAria: string;
  /** Text around the quality number: `${qualityBefore}<output>90</output>` */
  qualityBefore: string;
  bgLabel: string;
  bgHint: string;
  downloadAll: string;
  clear: string;
  privacy: string;
  client: {
    lossless: string;
    qualityHint: string;
    qualityHintPng: string;
    unknown: string;
    /** {from} {size} */
    converting: string;
    /** {from} {to} {before} {after} {change} {width} {height} */
    done: string;
    flattened: string;
    download: string;
    readError: string;
    /** {n} */
    skipped: string;
    /** English needs a singular form. */
    skippedOne?: string;
    noWebp: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP、GIF、BMP、SVG 等，可一次選多張，也可以按 Ctrl/Cmd + V 貼上',
    formatLabel: '轉換為',
    formatAria: '輸出格式',
    qualityBefore: '品質：',
    bgLabel: '透明區域背景色',
    bgHint: 'JPG 不支援透明，透明處會填上此顏色',
    downloadAll: '全部下載',
    clear: '清除',
    privacy: '圖片只在你的瀏覽器中轉換，不會上傳到任何伺服器。',
    client: {
      lossless: '無損',
      qualityHint: '數字越大畫質越好、檔案越大',
      qualityHintPng: 'PNG 為無損格式，不需要設定品質',
      unknown: '未知',
      converting: '{from}・{size}，轉換中…',
      done: '{from} → {to}・{before} → {after}（{change}%）・{width} × {height}',
      flattened: '原圖含透明區域，已填上背景色。',
      download: '下載',
      readError: '無法讀取這張圖片，可能是瀏覽器不支援此格式（例如 HEIC 在非 Safari 瀏覽器）或檔案已損毀。',
      skipped: '已略過 {n} 個非圖片檔案。',
      noWebp: '你的瀏覽器不支援輸出 WebP，已停用此選項。',
    },
  },
  en: {
    dropTitle: 'Click to choose images, or drop them here',
    dropHint: 'JPG, PNG, WebP, GIF, BMP, SVG and more. Select several at once, or paste with Ctrl/Cmd + V',
    formatLabel: 'Convert to',
    formatAria: 'Output format',
    qualityBefore: 'Quality: ',
    bgLabel: 'Background for transparent areas',
    bgHint: 'JPG has no transparency, so transparent pixels are filled with this color',
    downloadAll: 'Download all',
    clear: 'Clear',
    privacy: 'Images are converted in your browser and never uploaded to a server.',
    client: {
      lossless: 'Lossless',
      qualityHint: 'Higher means better quality and a larger file',
      qualityHintPng: 'PNG is lossless, so there is no quality setting',
      unknown: 'Unknown',
      converting: '{from} · {size} · converting…',
      done: '{from} → {to} · {before} → {after} ({change}%) · {width} × {height}',
      flattened: 'The original has transparent areas; they were filled with the background color.',
      download: 'Download',
      readError: 'Couldn’t read this image. Your browser may not support the format (HEIC outside Safari, for example) or the file is damaged.',
      skipped: 'Skipped {n} files that aren’t images.',
      skippedOne: 'Skipped 1 file that isn’t an image.',
      noWebp: 'Your browser can’t save WebP, so that option is turned off.',
    },
  },
  ja: {
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP・GIF・BMP・SVG などに対応。複数枚まとめて選べ、Ctrl/Cmd + V で貼り付けもできます',
    formatLabel: '変換後の形式',
    formatAria: '出力形式',
    qualityBefore: '画質：',
    bgLabel: '透明部分の背景色',
    bgHint: 'JPG は透過に対応していないため、透明な部分はこの色で塗りつぶされます',
    downloadAll: 'すべてダウンロード',
    clear: 'クリア',
    privacy: '画像はブラウザ内で変換され、サーバーにアップロードされることはありません。',
    client: {
      lossless: '可逆',
      qualityHint: '数値が大きいほど高画質で、ファイルサイズも大きくなります',
      qualityHintPng: 'PNG は可逆圧縮のため、画質の設定はありません',
      unknown: '不明',
      converting: '{from}・{size}・変換中…',
      done: '{from} → {to}・{before} → {after}（{change}%）・{width} × {height}',
      flattened: '元の画像に透明部分があったため、背景色で塗りつぶしました。',
      download: 'ダウンロード',
      readError: 'この画像を読み込めませんでした。ブラウザが対応していない形式（Safari 以外での HEIC など）か、ファイルが破損している可能性があります。',
      skipped: '画像ではないファイルを {n} 件スキップしました。',
      noWebp: 'お使いのブラウザは WebP の書き出しに対応していないため、この項目は使えません。',
    },
  },
});

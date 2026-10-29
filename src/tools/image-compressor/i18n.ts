import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  dropTitle: string;
  dropHint: string;
  /** Text before the quality number: `${qualityBefore}<output>80</output>` */
  qualityBefore: string;
  qualityHint: string;
  formatLabel: string;
  keep: string;
  maxWidthLabel: string;
  maxWidthPlaceholder: string;
  statCount: string;
  statBefore: string;
  statAfter: string;
  statSaved: string;
  downloadAll: string;
  clear: string;
  privacy: string;
  client: {
    noWebp: string;
    pngNote: string;
    /** {size} */
    processing: string;
    /** {before} {after} {width} {height} */
    done: string;
    kept: string;
    keptHint: string;
    download: string;
    error: string;
    /** {n} */
    skipped: string;
    skippedOne?: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP，可一次選多張，也可以按 Ctrl/Cmd + V 貼上',
    qualityBefore: '品質：',
    qualityHint: '建議 70–85，數字越小檔案越小',
    formatLabel: '輸出格式',
    keep: '維持原格式',
    maxWidthLabel: '最大寬度（px）',
    maxWidthPlaceholder: '留空＝不縮小尺寸',
    statCount: '圖片數',
    statBefore: '原始大小',
    statAfter: '壓縮後',
    statSaved: '節省',
    downloadAll: '全部下載',
    clear: '清除',
    privacy: '圖片只在你的瀏覽器中處理，不會上傳到任何伺服器。',
    client: {
      noWebp: '你的瀏覽器不支援輸出 WebP，已停用此選項。',
      pngNote: 'PNG 是無損格式，品質設定對它無效。照片類 PNG 改輸出 JPG 或 WebP 通常能小很多。',
      processing: '{size}，處理中…',
      done: '{before} → {after}・{width} × {height}',
      kept: '已保留原檔',
      keptHint: '壓縮後沒有變小，所以保留原始檔案。',
      download: '下載',
      error: '無法處理這張圖片，可能檔案損毀或尺寸超過瀏覽器上限，可試著填入最大寬度。',
      skipped: '已略過 {n} 個不支援的檔案，僅支援 JPG、PNG、WebP。',
    },
  },
  en: {
    dropTitle: 'Click to choose images, or drop them here',
    dropHint: 'JPG, PNG and WebP. Select several at once, or paste with Ctrl/Cmd + V',
    qualityBefore: 'Quality: ',
    qualityHint: '70–85 is a good range. Lower means a smaller file',
    formatLabel: 'Output format',
    keep: 'Same as original',
    maxWidthLabel: 'Max width (px)',
    maxWidthPlaceholder: 'Leave blank to keep the size',
    statCount: 'Images',
    statBefore: 'Original',
    statAfter: 'Compressed',
    statSaved: 'Saved',
    downloadAll: 'Download all',
    clear: 'Clear',
    privacy: 'Images are processed in your browser and never uploaded to a server.',
    client: {
      noWebp: 'Your browser can’t save WebP, so that option is turned off.',
      pngNote: 'PNG is lossless, so the quality slider has no effect on it. Saving photo-like PNGs as JPG or WebP usually makes them much smaller.',
      processing: '{size} · compressing…',
      done: '{before} → {after} · {width} × {height}',
      kept: 'Original kept',
      keptHint: 'Compressing didn’t make this file smaller, so the original is kept.',
      download: 'Download',
      error: 'Couldn’t process this image. The file may be damaged or too large for your browser; try setting a max width.',
      skipped: 'Skipped {n} unsupported files. Only JPG, PNG and WebP are supported.',
      skippedOne: 'Skipped 1 unsupported file. Only JPG, PNG and WebP are supported.',
    },
  },
  ja: {
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP に対応。複数枚まとめて選べ、Ctrl/Cmd + V で貼り付けもできます',
    qualityBefore: '画質：',
    qualityHint: '目安は 70〜85。数値が小さいほどファイルが軽くなります',
    formatLabel: '出力形式',
    keep: '元の形式のまま',
    maxWidthLabel: '最大幅（px）',
    maxWidthPlaceholder: '空欄ならサイズはそのまま',
    statCount: '画像の数',
    statBefore: '元のサイズ',
    statAfter: '圧縮後',
    statSaved: '削減率',
    downloadAll: 'すべてダウンロード',
    clear: 'クリア',
    privacy: '画像はブラウザ内で処理され、サーバーにアップロードされることはありません。',
    client: {
      noWebp: 'お使いのブラウザは WebP の書き出しに対応していないため、この項目は使えません。',
      pngNote: 'PNG は可逆圧縮のため、画質の設定は効きません。写真のような PNG は JPG か WebP で書き出すと大幅に軽くなります。',
      processing: '{size}・圧縮中…',
      done: '{before} → {after}・{width} × {height}',
      kept: '元のファイルのまま',
      keptHint: '圧縮しても小さくならなかったため、元のファイルをそのまま使います。',
      download: 'ダウンロード',
      error: 'この画像を処理できませんでした。ファイルの破損か、ブラウザの上限を超えるサイズの可能性があります。最大幅を指定してお試しください。',
      skipped: '対応していないファイルを {n} 件スキップしました。対応形式は JPG・PNG・WebP です。',
    },
  },
});

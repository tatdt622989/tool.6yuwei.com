import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  /** `<strong>{privacyStrong}</strong>{privacyText}` */
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  formatLabel: string;
  /** Text before the quality number: `${qualityBefore}<output>90</output>` */
  qualityBefore: string;
  qualityHint: string;
  statCount: string;
  statDone: string;
  statBefore: string;
  statAfter: string;
  zip: string;
  all: string;
  clear: string;
  client: {
    loadingDecoder: string;
    waiting: string;
    converting: string;
    /** {size} {status} */
    pending: string;
    /** {before} {after} */
    done: string;
    /** {width} {height}, appended to `done` when known */
    dims: string;
    download: string;
    error: string;
    offline: string;
    /** {n} */
    skipped: string;
    skippedOne?: string;
    zipping: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '照片不會上傳',
    privacyText: '：HEIC 轉 JPG 完全在你的瀏覽器中進行，照片不會離開你的裝置，離線也能使用。',
    dropTitle: '點擊選擇 HEIC 照片，或拖曳到這裡',
    dropHint: '支援 iPhone 拍攝的 .heic、.heif 照片，可一次選多張',
    formatLabel: '輸出格式',
    qualityBefore: '品質：',
    qualityHint: '建議 85–92，數字越高畫質越好、檔案越大',
    statCount: '照片數',
    statDone: '已轉換',
    statBefore: 'HEIC 大小',
    statAfter: '轉換後',
    zip: '全部下載（ZIP）',
    all: '逐張下載',
    clear: '清除',
    client: {
      loadingDecoder: '載入 HEIC 解碼器並轉換中，每張約需數秒…',
      waiting: '等待轉換…',
      converting: '轉換中…',
      pending: '{size}，{status}',
      done: '{before} → {after}',
      dims: '・{width} × {height}',
      download: '下載',
      error: '無法轉換這張照片，可能不是 HEIC 格式、檔案已損毀，或解析度超過瀏覽器上限。',
      offline: '目前離線，無法載入 HEIC 解碼器。請連上網路重新整理一次，之後即可離線使用。',
      skipped: '已略過 {n} 個非 HEIC 檔案。JPG、PNG 等其他格式請改用「圖片格式轉換」工具。',
      zipping: '打包中…',
    },
  },
  en: {
    privacyStrong: 'Your photos are not uploaded.',
    privacyText: ' HEIC to JPG conversion runs entirely in your browser, so your pictures never leave your device.',
    dropTitle: 'Click to choose HEIC photos, or drop them here',
    dropHint: '.heic and .heif photos from iPhone and iPad. Select as many as you like',
    formatLabel: 'Output format',
    qualityBefore: 'Quality: ',
    qualityHint: '85–92 is a good range. Higher means better quality and a larger file',
    statCount: 'Photos',
    statDone: 'Converted',
    statBefore: 'HEIC size',
    statAfter: 'Output size',
    zip: 'Download all (ZIP)',
    all: 'Download one by one',
    clear: 'Clear',
    client: {
      loadingDecoder: 'Loading the HEIC decoder and converting; this takes a few seconds per photo…',
      waiting: 'waiting…',
      converting: 'converting…',
      pending: '{size} · {status}',
      done: '{before} → {after}',
      dims: ' · {width} × {height}',
      download: 'Download',
      error: 'Couldn’t convert this photo. It may not be a HEIC file, it may be damaged, or its resolution is beyond your browser’s limit.',
      offline: 'You’re offline, so the HEIC decoder can’t load. Connect to the internet and try again.',
      skipped: 'Skipped {n} files that aren’t HEIC. For JPG, PNG and other formats, use the Image Converter instead.',
      skippedOne: 'Skipped 1 file that isn’t HEIC. For JPG, PNG and other formats, use the Image Converter instead.',
      zipping: 'Zipping…',
    },
  },
  ja: {
    privacyStrong: '写真はアップロードされません',
    privacyText: '：HEIC から JPG への変換はすべてブラウザ内で行われ、写真が端末の外に出ることはありません。',
    dropTitle: 'クリックして HEIC 写真を選択、またはここにドロップ',
    dropHint: 'iPhone・iPad で撮影した .heic、.heif の写真に対応。複数枚まとめて選べます',
    formatLabel: '出力形式',
    qualityBefore: '画質：',
    qualityHint: '目安は 85〜92。数値が大きいほど高画質で、ファイルも大きくなります',
    statCount: '写真の数',
    statDone: '変換済み',
    statBefore: 'HEIC のサイズ',
    statAfter: '変換後',
    zip: 'すべてダウンロード（ZIP）',
    all: '1 枚ずつダウンロード',
    clear: 'クリア',
    client: {
      loadingDecoder: 'HEIC デコーダーを読み込んで変換しています。1 枚あたり数秒かかります…',
      waiting: '変換待ち…',
      converting: '変換中…',
      pending: '{size}・{status}',
      done: '{before} → {after}',
      dims: '・{width} × {height}',
      download: 'ダウンロード',
      error: 'この写真を変換できませんでした。HEIC 形式ではない、ファイルが破損している、または解像度がブラウザの上限を超えている可能性があります。',
      offline: 'オフラインのため HEIC デコーダーを読み込めません。インターネットに接続してからもう一度お試しください。',
      skipped: 'HEIC ではないファイルを {n} 件スキップしました。JPG や PNG など他の形式は「画像形式変換」をご利用ください。',
      zipping: 'ZIP を作成中…',
    },
  },
});

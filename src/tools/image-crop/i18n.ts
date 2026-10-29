// image-crop UI strings. Each locale also picks which aspect-ratio presets to offer.
import { defineToolI18n } from '../../i18n/tool';
import type { AspectId } from './logic';

export interface Strings {
  /** `<strong>{privacyStrong}</strong>{privacyText}` */
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  aspectLabel: string;
  aspects: { value: AspectId; label: string }[];
  boxAria: string;
  rotateLeft: string;
  rotateRight: string;
  flipH: string;
  flipV: string;
  reset: string;
  statSize: string;
  statRatio: string;
  statOrig: string;
  formatLabel: string;
  keep: string;
  /** Text before the quality number: `${qualityBefore}<output>92</output>` */
  qualityBefore: string;
  download: string;
  client: {
    notImage: string;
    readError: string;
    exportError: string;
    sampleText: string;
    sampleFont: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '圖片不會上傳',
    privacyText: '：裁切完全在你的瀏覽器中進行，圖片不會離開你的裝置。',
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP 等格式，也可以按 Ctrl/Cmd + V 貼上截圖。下方先以範例圖片示範。',
    aspectLabel: '裁切比例',
    aspects: [
      { value: 'free', label: '自由' },
      { value: '1:1', label: '1:1' },
      { value: '4:3', label: '4:3' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '4:5', label: '4:5 IG' },
    ],
    boxAria: '裁切範圍：拖曳移動，拖曳邊角調整大小，或用方向鍵移動',
    rotateLeft: '向左轉 90°',
    rotateRight: '向右轉 90°',
    flipH: '水平翻轉',
    flipV: '垂直翻轉',
    reset: '重設',
    statSize: '裁切後尺寸（px）',
    statRatio: '比例',
    statOrig: '原圖尺寸（px）',
    formatLabel: '輸出格式',
    keep: '原格式',
    qualityBefore: '品質：',
    download: '裁切並下載',
    client: {
      notImage: '這不是圖片檔，請選擇 JPG、PNG 或 WebP 等格式的圖片。',
      readError: '無法讀取這張圖片，可能是瀏覽器不支援此格式（例如 HEIC 請先用「HEIC 轉 JPG」轉檔）或檔案已損毀。',
      exportError: '無法輸出圖片，裁切範圍可能超過瀏覽器的畫布上限（手機約 1600 萬像素），請縮小裁切範圍後再試。',
      sampleText: '範例圖片 1200 × 800',
      sampleFont: '600 32px -apple-system, "PingFang TC", "Noto Sans TC", sans-serif',
    },
  },
  en: {
    privacyStrong: 'Your image is not uploaded.',
    privacyText: ' Cropping happens entirely in your browser, so the picture never leaves your device.',
    dropTitle: 'Click to choose an image, or drop it here',
    dropHint: 'JPG, PNG, WebP and more. You can also paste a screenshot with Ctrl/Cmd + V. A sample image is loaded below to try it out.',
    aspectLabel: 'Aspect ratio',
    aspects: [
      { value: 'free', label: 'Free' },
      { value: '1:1', label: '1:1' },
      { value: '4:3', label: '4:3' },
      { value: '3:2', label: '3:2' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '4:5', label: '4:5 Instagram' },
    ],
    boxAria: 'Crop area: drag to move, drag the corners to resize, or use the arrow keys to move',
    rotateLeft: 'Rotate left 90°',
    rotateRight: 'Rotate right 90°',
    flipH: 'Flip horizontal',
    flipV: 'Flip vertical',
    reset: 'Reset',
    statSize: 'Cropped size (px)',
    statRatio: 'Ratio',
    statOrig: 'Original size (px)',
    formatLabel: 'Output format',
    keep: 'Original',
    qualityBefore: 'Quality: ',
    download: 'Crop and download',
    client: {
      notImage: 'That file isn’t an image. Choose a JPG, PNG or WebP image.',
      readError: 'Couldn’t read this image. Your browser may not support the format (convert HEIC with the HEIC to JPG tool first) or the file is damaged.',
      exportError: 'Couldn’t export the image. The crop may exceed your browser’s canvas limit (about 16 megapixels on phones); try a smaller area.',
      sampleText: 'Sample image 1200 × 800',
      sampleFont: '600 32px -apple-system, "Segoe UI", Roboto, sans-serif',
    },
  },
  ja: {
    privacyStrong: '画像はアップロードされません',
    privacyText: '：トリミングはすべてブラウザ内で行われ、画像が端末の外に出ることはありません。',
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP などに対応。Ctrl/Cmd + V でスクリーンショットを貼り付けることもできます。下ではサンプル画像で試せます。',
    aspectLabel: '縦横比',
    aspects: [
      { value: 'free', label: '自由' },
      { value: '1:1', label: '1:1' },
      { value: '4:3', label: '4:3' },
      { value: '3:4', label: '3:4 履歴書' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '4:5', label: '4:5 インスタ' },
    ],
    boxAria: 'トリミング範囲：ドラッグで移動、角をドラッグでサイズ変更、矢印キーでも移動できます',
    rotateLeft: '左に 90° 回転',
    rotateRight: '右に 90° 回転',
    flipH: '左右反転',
    flipV: '上下反転',
    reset: 'リセット',
    statSize: 'トリミング後（px）',
    statRatio: '比率',
    statOrig: '元のサイズ（px）',
    formatLabel: '出力形式',
    keep: '元の形式',
    qualityBefore: '画質：',
    download: 'トリミングしてダウンロード',
    client: {
      notImage: '画像ファイルではありません。JPG・PNG・WebP などの画像を選んでください。',
      readError: 'この画像を読み込めませんでした。ブラウザが対応していない形式（HEIC は先に「HEIC JPG 変換」で変換してください）か、ファイルが破損している可能性があります。',
      exportError: '画像を書き出せませんでした。トリミング範囲がブラウザの上限（スマートフォンでは約 1600 万画素）を超えている可能性があります。範囲を小さくしてお試しください。',
      sampleText: 'サンプル画像 1200 × 800',
      sampleFont: '600 32px -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif',
    },
  },
});

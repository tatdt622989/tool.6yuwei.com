// image-resizer UI strings. Each locale also chooses its own size presets (zh keeps PRESETS from logic.ts).
import { defineToolI18n } from '../../i18n/tool';
import { PRESETS, ZH_SPEC_LABELS, type Preset, type SpecLabels } from './logic';

export interface Strings {
  dropTitle: string;
  dropHint: string;
  modeLabel: string;
  modeSize: string;
  modePercent: string;
  widthLabel: string;
  heightLabel: string;
  lock: string;
  presetsLabel: string;
  presets: Preset[];
  fitLabel: string;
  fitAria: string;
  fitCover: string;
  fitContain: string;
  fitStretch: string;
  padColor: string;
  padClear: string;
  percentLabel: string;
  formatLabel: string;
  keep: string;
  /** Text before the quality number: `${qualityBefore}<output>90</output>` */
  qualityBefore: string;
  qualityHint: string;
  downloadAll: string;
  clear: string;
  privacy: string;
  client: {
    spec: SpecLabels;
    auto: string;
    /** {n} */
    autoValue: string;
    /** {src} */
    waiting: string;
    /** {size} */
    processing: string;
    /** {src} {width} {height} {before} {after} */
    done: string;
    download: string;
    tooLarge: string;
    error: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP 等，可一次選多張，也可以按 Ctrl/Cmd + V 貼上',
    modeLabel: '調整方式',
    modeSize: '指定尺寸',
    modePercent: '百分比',
    widthLabel: '寬度（px）',
    heightLabel: '高度（px）',
    lock: '鎖定長寬比',
    presetsLabel: '常用尺寸',
    presets: PRESETS,
    fitLabel: '比例不同時',
    fitAria: '填滿方式',
    fitCover: '填滿裁切',
    fitContain: '完整放入',
    fitStretch: '拉伸',
    padColor: '留白顏色',
    padClear: '透明（PNG／WebP）',
    percentLabel: '縮放比例（%）',
    formatLabel: '輸出格式',
    keep: '維持原格式',
    qualityBefore: '品質：',
    qualityHint: '僅對 JPG、WebP 有效',
    downloadAll: '全部下載',
    clear: '清除',
    privacy: '圖片只在你的瀏覽器中處理，不會上傳到任何伺服器。',
    client: {
      spec: ZH_SPEC_LABELS,
      auto: '自動',
      autoValue: '自動（{n}）',
      waiting: '{src}・請先設定尺寸',
      processing: '{size}，處理中…',
      done: '{src} → {width} × {height}・{before} → {after}',
      download: '下載',
      tooLarge: '輸出尺寸過大，超過瀏覽器可處理的範圍，請調小尺寸。',
      error: '無法處理這張圖片，可能是格式不支援或檔案已損毀。',
    },
  },
  en: {
    dropTitle: 'Click to choose images, or drop them here',
    dropHint: 'JPG, PNG, WebP and more. Select several at once, or paste with Ctrl/Cmd + V',
    modeLabel: 'Resize by',
    modeSize: 'Pixels',
    modePercent: 'Percentage',
    widthLabel: 'Width (px)',
    heightLabel: 'Height (px)',
    lock: 'Lock aspect ratio',
    presetsLabel: 'Popular sizes',
    presets: [
      { label: 'Instagram square', width: 1080, height: 1080 },
      { label: 'Instagram portrait', width: 1080, height: 1350 },
      { label: 'Story / Reel', width: 1080, height: 1920 },
      { label: 'Facebook / link preview', width: 1200, height: 630 },
      { label: 'X post', width: 1600, height: 900 },
      { label: 'YouTube thumbnail', width: 1280, height: 720 },
      { label: 'US passport photo', width: 600, height: 600 },
      { label: 'Full HD', width: 1920, height: 1080 },
    ],
    fitLabel: 'If the aspect ratio differs',
    fitAria: 'Fit mode',
    fitCover: 'Fill and crop',
    fitContain: 'Fit inside',
    fitStretch: 'Stretch',
    padColor: 'Padding color',
    padClear: 'Transparent (PNG/WebP)',
    percentLabel: 'Scale (%)',
    formatLabel: 'Output format',
    keep: 'Same as original',
    qualityBefore: 'Quality: ',
    qualityHint: 'Applies to JPG and WebP only',
    downloadAll: 'Download all',
    clear: 'Clear',
    privacy: 'Images are processed in your browser and never uploaded to a server.',
    client: {
      spec: {
        percent: 'Width and height are scaled to {p}% of the original',
        percentEmpty: 'Enter a percentage',
        empty: 'Enter a width or a height',
        widthOnly: 'Width set to {w} px; height is calculated to keep the proportions',
        heightOnly: 'Height set to {h} px; width is calculated to keep the proportions',
        fitInside: 'Scaled proportionally to fit within {w} × {h}, with no cropping or padding',
        contain: 'Output {w} × {h}: the whole image is kept, with padding where it doesn’t fill',
        cover: 'Output {w} × {h}: the frame is filled and the excess is cropped from the center',
        stretch: 'Output {w} × {h}: stretched to fit, so the image is distorted if proportions differ',
      },
      auto: 'Auto',
      autoValue: 'Auto ({n})',
      waiting: '{src} · set a size first',
      processing: '{size} · resizing…',
      done: '{src} → {width} × {height} · {before} → {after}',
      download: 'Download',
      tooLarge: 'The output is larger than your browser can handle. Choose a smaller size.',
      error: 'Couldn’t process this image. The format may be unsupported or the file damaged.',
    },
  },
  ja: {
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP などに対応。複数枚まとめて選べ、Ctrl/Cmd + V で貼り付けもできます',
    modeLabel: '変更方法',
    modeSize: 'ピクセル指定',
    modePercent: 'パーセント',
    widthLabel: '幅（px）',
    heightLabel: '高さ（px）',
    lock: '縦横比を固定',
    presetsLabel: 'よく使うサイズ',
    presets: [
      { label: 'Instagram 正方形', width: 1080, height: 1080 },
      { label: 'Instagram 縦長', width: 1080, height: 1350 },
      { label: 'ストーリーズ／リール', width: 1080, height: 1920 },
      { label: 'X 投稿', width: 1600, height: 900 },
      { label: 'OGP 画像', width: 1200, height: 630 },
      { label: 'YouTube サムネイル', width: 1280, height: 720 },
      { label: '履歴書写真', width: 354, height: 472 },
      { label: 'フル HD', width: 1920, height: 1080 },
    ],
    fitLabel: '縦横比が違うとき',
    fitAria: '収め方',
    fitCover: '切り抜いて埋める',
    fitContain: '全体を収める',
    fitStretch: '引き伸ばす',
    padColor: '余白の色',
    padClear: '透明（PNG／WebP）',
    percentLabel: '拡大・縮小率（%）',
    formatLabel: '出力形式',
    keep: '元の形式のまま',
    qualityBefore: '画質：',
    qualityHint: 'JPG・WebP のみ有効',
    downloadAll: 'すべてダウンロード',
    clear: 'クリア',
    privacy: '画像はブラウザ内で処理され、サーバーにアップロードされることはありません。',
    client: {
      spec: {
        percent: '幅と高さを元の {p}% に変更します',
        percentEmpty: 'パーセントを入力してください',
        empty: '幅か高さを入力してください',
        widthOnly: '幅を {w} px にし、高さは縦横比に合わせて自動で計算します',
        heightOnly: '高さを {h} px にし、幅は縦横比に合わせて自動で計算します',
        fitInside: '{w} × {h} に収まるよう縦横比を保って縮小します（切り抜き・余白なし）',
        contain: '{w} × {h} で出力し、画像全体を収めて足りない部分は余白にします',
        cover: '{w} × {h} で出力し、枠いっぱいに広げてはみ出した部分を中央基準で切り抜きます',
        stretch: '{w} × {h} で出力し、縦横比が違う場合は画像が引き伸ばされます',
      },
      auto: '自動',
      autoValue: '自動（{n}）',
      waiting: '{src}・先にサイズを指定してください',
      processing: '{size}・処理中…',
      done: '{src} → {width} × {height}・{before} → {after}',
      download: 'ダウンロード',
      tooLarge: '出力サイズが大きすぎて、ブラウザで処理できません。サイズを小さくしてください。',
      error: 'この画像を処理できませんでした。対応していない形式か、ファイルが破損している可能性があります。',
    },
  },
});

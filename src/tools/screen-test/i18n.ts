// UI strings for the screen / dead pixel test. Pattern colors live in logic.ts; their names and tips
// are per locale here (zh-TW reuses the names in logic.ts so the zh page is unchanged).
import { defineToolI18n } from '../../i18n/tool';
import { PATTERNS, SET_NAMES, type PatternSet } from './logic';

export interface PatternText {
  name: string;
  tip: string;
}

export interface Strings {
  statRes: string;
  statPhys: string;
  statDpr: string;
  statDepth: string;
  setNames: Record<PatternSet, string>;
  setDesc: Record<PatternSet, string>;
  /** Swatch aria-label; {name}. */
  swatchAria: string;
  start: string;
  tipsToggle: string;
  controls: string;
  footnote: string;
  stageAria: string;
  prev: string;
  next: string;
  exit: string;
  client: {
    /** Keyed by pattern id. */
    patterns: Record<string, PatternText>;
    noFullscreen: string;
  };
}

const zhPatterns = Object.fromEntries(
  Object.values(PATTERNS)
    .flat()
    .map((p) => [p.id, { name: p.name, tip: p.tip }]),
);

export default defineToolI18n<Strings>({
  'zh-TW': {
    statRes: '螢幕解析度（CSS 像素）',
    statPhys: '實際像素（估算）',
    statDpr: '縮放比 devicePixelRatio',
    statDepth: '色彩深度',
    setNames: SET_NAMES,
    setDesc: {
      pixels: '黑、白、紅、綠、藍、灰六種純色，找出亮點與暗點。',
      gradient: '灰階與 RGB 漸層，檢查色彩斷層與暗部細節。',
      uniformity: '全黑與多階灰，在暗室檢查漏光、雲紋與亮度不均。',
    },
    swatchAria: '從「{name}」開始全螢幕測試',
    start: '全螢幕開始',
    tipsToggle: '切換畫面時短暫顯示說明',
    controls: '操作：點擊或按 → 下一個，← 上一個，Esc 離開',
    footnote: '測試前請先擦乾淨螢幕，灰塵很容易被誤認為壞點。所有畫面都在你的瀏覽器中產生，不會上傳任何資料。',
    stageAria: '全螢幕螢幕測試',
    prev: '上一個',
    next: '下一個',
    exit: '離開全螢幕測試',
    client: {
      patterns: zhPatterns,
      noFullscreen:
        '這個瀏覽器不支援網頁全螢幕，已改用覆蓋整個視窗的模式。iPhone 可先把網頁「加入主畫面」再開啟，或橫放手機以減少瀏覽器工具列。',
    },
  },
  en: {
    statRes: 'Screen resolution (CSS pixels)',
    statPhys: 'Physical pixels (estimated)',
    statDpr: 'Scale (devicePixelRatio)',
    statDepth: 'Color depth',
    setNames: { pixels: 'Dead pixel test', gradient: 'Gradient test', uniformity: 'Uniformity and backlight bleed' },
    setDesc: {
      pixels: 'Six solid colors (black, white, red, green, blue and gray) to spot stuck and dead pixels.',
      gradient: 'Gray and RGB gradients to check for banding and shadow detail.',
      uniformity: 'Black and several gray levels to check backlight bleed, clouding and uneven brightness in a dark room.',
    },
    swatchAria: 'Start the full-screen test from “{name}”',
    start: 'Start full screen',
    tipsToggle: 'Briefly show tips when the color changes',
    controls: 'Controls: click or → for next, ← for previous, Esc to exit',
    footnote:
      'Wipe your screen before testing: dust is easy to mistake for a dead pixel. Every pattern is drawn in your browser and nothing is uploaded.',
    stageAria: 'Full-screen display test',
    prev: 'Previous',
    next: 'Next',
    exit: 'Exit full-screen test',
    client: {
      patterns: {
        black: { name: 'Black', tip: 'Look for dots that stay lit: stuck or hot pixels' },
        white: { name: 'White', tip: 'Look for dark dots that never light up (dead pixels) and dust' },
        red: { name: 'Red', tip: 'A failed red subpixel shows as a black or off-color dot' },
        green: { name: 'Green', tip: 'A failed green subpixel shows as a black or off-color dot' },
        blue: { name: 'Blue', tip: 'A failed blue subpixel shows as a black or off-color dot' },
        gray: { name: 'Gray', tip: 'Mid gray reveals bright dots, dark dots and color tint at once' },
        'gray-smooth': { name: 'Gray gradient', tip: 'Should look smooth; visible bands mean color banding' },
        'gray-steps': {
          name: '32-step grayscale',
          tip: 'Every step should be distinct; merged dark or light steps mean crushed shadows or clipped highlights',
        },
        'red-smooth': { name: 'Red gradient', tip: 'Watch for banding or a color cast' },
        'green-smooth': { name: 'Green gradient', tip: 'Watch for banding or a color cast' },
        'blue-smooth': { name: 'Blue gradient', tip: 'Watch for banding or a color cast' },
        'u-black': { name: 'Black (bleed)', tip: 'Turn off the lights, raise brightness and check corners and edges for glow' },
        'u-10': { name: '10% gray', tip: 'Dark gray shows clouding (mura) and corner bleed most clearly' },
        'u-25': { name: '25% gray', tip: 'Brightness should be even; look for darker patches' },
        'u-50': { name: '50% gray', tip: 'Look for tint and left-right brightness differences' },
        'u-75': { name: '75% gray', tip: 'Look for dirty screen effect and blotches' },
        'u-white': { name: 'White', tip: 'Compare brightness and color temperature in the center and corners' },
      },
      noFullscreen:
        'This browser doesn’t support web full screen, so the test fills the window instead. On iPhone, add the page to your Home Screen and open it from there, or turn the phone sideways to shrink the toolbars.',
    },
  },
  ja: {
    statRes: '画面解像度（CSS ピクセル）',
    statPhys: '物理ピクセル（推定）',
    statDpr: '拡大率 devicePixelRatio',
    statDepth: '色深度',
    setNames: { pixels: 'ドット抜けチェック', gradient: 'グラデーション', uniformity: '輝度ムラ・光漏れ' },
    setDesc: {
      pixels: '黒・白・赤・緑・青・グレーの 6 色で、常時点灯と常時滅灯のドットを探します。',
      gradient: 'グレーと RGB のグラデーションで、階調の段差と暗部の再現性を確認します。',
      uniformity: '黒と数段階のグレーで、暗い部屋での光漏れ・ムラ・明るさの不均一を確認します。',
    },
    swatchAria: '「{name}」から全画面テストを開始',
    start: '全画面で開始',
    tipsToggle: '色の切り替え時に説明を少し表示する',
    controls: '操作：クリックまたは → で次へ、← で前へ、Esc で終了',
    footnote:
      'テストの前に画面を拭いておきましょう。ほこりはドット抜けと見間違えやすいです。テスト画面はすべてブラウザ内で表示し、データは送信しません。',
    stageAria: '全画面ディスプレイテスト',
    prev: '前へ',
    next: '次へ',
    exit: '全画面テストを終了',
    client: {
      patterns: {
        black: { name: '黒', tip: '光り続ける点（輝点・常時点灯）を探します' },
        white: { name: '白', tip: '光らない黒い点（黒点・常時滅灯）とほこりを探します' },
        red: { name: '赤', tip: '赤のサブピクセルが故障していると黒や別の色の点が見えます' },
        green: { name: '緑', tip: '緑のサブピクセルが故障していると黒や別の色の点が見えます' },
        blue: { name: '青', tip: '青のサブピクセルが故障していると黒や別の色の点が見えます' },
        gray: { name: 'グレー', tip: '中間グレーでは輝点・黒点・色かぶりをまとめて確認できます' },
        'gray-smooth': { name: 'グレーのグラデーション', tip: 'なめらかに変化するのが理想です。帯状の段差が見えたら階調飛びです' },
        'gray-steps': {
          name: 'グレー 32 段階',
          tip: 'すべての段が見分けられるのが理想です。暗い側や明るい側の段がつながって見える場合は黒つぶれ・白飛びしています',
        },
        'red-smooth': { name: '赤のグラデーション', tip: '段差や色かぶりがないか確認します' },
        'green-smooth': { name: '緑のグラデーション', tip: '段差や色かぶりがないか確認します' },
        'blue-smooth': { name: '青のグラデーション', tip: '段差や色かぶりがないか確認します' },
        'u-black': { name: '黒（光漏れ）', tip: '部屋を暗くして明るさを上げ、四隅や縁から光が漏れていないか確認します' },
        'u-10': { name: '10% グレー', tip: '暗いグレーはムラ（mura）や四隅の光漏れが最もわかりやすい色です' },
        'u-25': { name: '25% グレー', tip: '画面全体が同じ明るさか、部分的に暗い所がないか確認します' },
        'u-50': { name: '50% グレー', tip: '色かぶりや左右の明るさの差を確認します' },
        'u-75': { name: '75% グレー', tip: '汚れのようなムラ（ダーティスクリーン）や色の斑点を確認します' },
        'u-white': { name: '白', tip: '中央と四隅の明るさや色温度が揃っているか比べます' },
      },
      noFullscreen:
        'このブラウザはページの全画面表示に対応していないため、ウィンドウ全体に表示しています。iPhone ではページを「ホーム画面に追加」してから開くか、横向きにするとツールバーが小さくなります。',
    },
  },
});

// Screen / dead-pixel test patterns and navigation. DOM-free.

export type PatternSet = 'pixels' | 'gradient' | 'uniformity';

export interface Pattern {
  id: string;
  name: string;
  /** What to look for while this pattern is shown. */
  tip: string;
  /** CSS `background` value. Exact pure colors on purpose. */
  background: string;
}

/** Hard-stop gradient with `steps` flat bands from `from` to `to` (each [r,g,b] 0–255). */
export function steppedGradient(steps: number, from: [number, number, number], to: [number, number, number]): string {
  const n = Math.max(2, Math.floor(steps));
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const c = from.map((f, k) => Math.round(f + (to[k] - f) * t));
    const color = `rgb(${c[0]} ${c[1]} ${c[2]})`;
    const a = ((i / n) * 100).toFixed(4).replace(/\.?0+$/, '');
    const b = (((i + 1) / n) * 100).toFixed(4).replace(/\.?0+$/, '');
    stops.push(`${color} ${a}%`, `${color} ${b}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];

export const PATTERNS: Record<PatternSet, Pattern[]> = {
  pixels: [
    { id: 'black', name: '黑色', tip: '找出持續發亮的亮點（常亮點、熱像素）', background: '#000000' },
    { id: 'white', name: '白色', tip: '找出不會發光的暗點（死點）與灰塵', background: '#ffffff' },
    { id: 'red', name: '紅色', tip: '紅色子像素失效時會出現黑點或異色點', background: '#ff0000' },
    { id: 'green', name: '綠色', tip: '綠色子像素失效時會出現黑點或異色點', background: '#00ff00' },
    { id: 'blue', name: '藍色', tip: '藍色子像素失效時會出現黑點或異色點', background: '#0000ff' },
    { id: 'gray', name: '灰色', tip: '中間灰可同時看出亮點、暗點與色偏', background: '#808080' },
  ],
  gradient: [
    { id: 'gray-smooth', name: '灰階漸層', tip: '理想上應平滑過渡，看得到明顯分段代表色彩斷層', background: 'linear-gradient(to right, #000000, #ffffff)' },
    { id: 'gray-steps', name: '灰階 32 階', tip: '每一階都應能分辨；最暗或最亮幾階糊在一起表示暗部或亮部細節不足', background: steppedGradient(32, BLACK, WHITE) },
    { id: 'red-smooth', name: '紅色漸層', tip: '觀察是否有分段或色偏', background: 'linear-gradient(to right, #000000, #ff0000)' },
    { id: 'green-smooth', name: '綠色漸層', tip: '觀察是否有分段或色偏', background: 'linear-gradient(to right, #000000, #00ff00)' },
    { id: 'blue-smooth', name: '藍色漸層', tip: '觀察是否有分段或色偏', background: 'linear-gradient(to right, #000000, #0000ff)' },
  ],
  uniformity: [
    { id: 'u-black', name: '全黑（漏光）', tip: '關燈調高亮度，觀察四角與邊緣是否透出光暈', background: '#000000' },
    { id: 'u-10', name: '10% 灰', tip: '暗灰最容易看出雲紋（mura）與邊角漏光', background: '#1a1a1a' },
    { id: 'u-25', name: '25% 灰', tip: '整個畫面亮度應一致，留意局部偏暗的區塊', background: '#404040' },
    { id: 'u-50', name: '50% 灰', tip: '留意色偏與左右亮度不均', background: '#808080' },
    { id: 'u-75', name: '75% 灰', tip: '留意髒污感（dirty screen effect）與色塊', background: '#bfbfbf' },
    { id: 'u-white', name: '全白', tip: '比較中心與四角亮度、色溫是否一致', background: '#ffffff' },
  ],
};

export const SET_NAMES: Record<PatternSet, string> = {
  pixels: '壞點測試',
  gradient: '漸層測試',
  uniformity: '均勻度／漏光測試',
};

export function isPatternSet(value: unknown): value is PatternSet {
  return value === 'pixels' || value === 'gradient' || value === 'uniformity';
}

export function nextIndex(i: number, length: number): number {
  if (length <= 0) return 0;
  return (((i + 1) % length) + length) % length;
}

export function prevIndex(i: number, length: number): number {
  if (length <= 0) return 0;
  return (((i - 1) % length) + length) % length;
}

export type Action = 'next' | 'prev' | 'exit' | null;

/** Keyboard mapping while the fullscreen test is shown. */
export function keyAction(key: string): Action {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case ' ':
    case 'Enter':
    case 'PageDown':
      return 'next';
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'Backspace':
    case 'PageUp':
      return 'prev';
    case 'Escape':
    case 'q':
    case 'Q':
      return 'exit';
    default:
      return null;
  }
}

/** Tap/click: the left quarter of the screen goes back, anywhere else goes forward. */
export function tapAction(x: number, width: number): Exclude<Action, 'exit' | null> {
  return width > 0 && x < width * 0.25 ? 'prev' : 'next';
}

export interface ScreenInfo {
  cssWidth: number;
  cssHeight: number;
  dpr: number;
}

/** Physical pixel resolution reported by the browser (CSS px × devicePixelRatio). */
export function physicalResolution(info: ScreenInfo): { width: number; height: number } {
  const dpr = info.dpr > 0 ? info.dpr : 1;
  return { width: Math.round(info.cssWidth * dpr), height: Math.round(info.cssHeight * dpr) };
}

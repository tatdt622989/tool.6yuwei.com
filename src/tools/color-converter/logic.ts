/** sRGB channels 0–255 (may be fractional) and alpha 0–1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
  /** Set by parseColor when an oklch() input was outside sRGB and had to be clipped. */
  clipped?: boolean;
}

/** Hue in degrees, saturation and lightness 0–100. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** OKLCH: lightness 0–1, chroma ≥ 0 (about 0–0.4 for displayable colors), hue in degrees. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Rounds to `digits` decimals and drops trailing zeros. */
export function trim(value: number, digits = 1): string {
  const r = Number(value.toFixed(digits));
  return String(Object.is(r, -0) ? 0 : r);
}

// ---------- Parsing ----------

function parseHex(hex: string): Rgba | null {
  if (!/^[0-9a-f]+$/i.test(hex) || ![3, 4, 6, 8].includes(hex.length)) return null;
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
}

/** "50%" → ratio of `percentBase`; plain numbers pass through. */
function num(token: string, percentBase: number): number {
  if (token.endsWith('%')) return (parseFloat(token) / 100) * percentBase;
  return parseFloat(token);
}

function parseAlpha(token: string | undefined): number {
  if (token === undefined) return 1;
  return clamp(num(token, 1), 0, 1);
}

function parseHue(token: string): number {
  const v = parseFloat(token);
  if (token.endsWith('turn')) return v * 360;
  if (token.endsWith('rad')) return (v * 180) / Math.PI;
  if (token.endsWith('grad')) return v * 0.9;
  return v;
}

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?(%|deg|turn|rad|grad)?$/i;

/**
 * Accepts #rgb, #rgba, #rrggbb, #rrggbbaa (with or without #), rgb()/rgba(), hsl()/hsla()
 * and oklch() in both comma and space syntax, or a bare "r, g, b" triple.
 */
export function parseColor(input: string): Rgba | null {
  const text = input.trim().toLowerCase();
  if (text === '') return null;
  if (/^#?[0-9a-f]+$/.test(text)) return parseHex(text.replace('#', ''));

  const fn = /^(rgba?|hsla?|oklch)?\(?\s*([^)]*?)\s*\)?$/.exec(text);
  if (!fn) return null;
  const name = fn[1] ?? 'rgb';
  if (!fn[1] && /[()]/.test(text)) return null;
  const tokens = fn[2].split(/\s*[,/]\s*|\s+/).filter(Boolean);
  if (tokens.length < 3 || tokens.length > 4 || !tokens.every((t) => NUMBER.test(t))) return null;
  const [t1, t2, t3, t4] = tokens;
  const a = parseAlpha(t4);

  if (name.startsWith('rgb')) {
    return { r: clamp(num(t1, 255), 0, 255), g: clamp(num(t2, 255), 0, 255), b: clamp(num(t3, 255), 0, 255), a };
  }
  if (name.startsWith('hsl')) {
    const rgb = hslToRgb({ h: parseHue(t1), s: clamp(num(t2, 100), 0, 100), l: clamp(num(t3, 100), 0, 100) });
    return { ...rgb, a };
  }
  const l = t1.endsWith('%') ? parseFloat(t1) / 100 : parseFloat(t1);
  const c = num(t2, 0.4);
  const { rgb, inGamut } = oklchToRgb({ l: clamp(l, 0, 1), c: Math.max(0, c), h: parseHue(t3) });
  return inGamut ? { ...rgb, a } : { ...rgb, a, clipped: true };
}

// ---------- HSL ----------

export function rgbToHsl({ r, g, b }: Omit<Rgba, 'a'>): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Omit<Rgba, 'a'> {
  const sn = s / 100;
  const ln = l / 100;
  const hue = ((h % 360) + 360) % 360;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => (ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))) * 255;
  return { r: f(0), g: f(8), b: f(4) };
}

// ---------- OKLCH (Björn Ottosson's OKLab) ----------

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function rgbToOklch({ r, g, b }: Omit<Rgba, 'a'>): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  let h = c < 1e-4 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: c < 1e-4 ? 0 : c, h };
}

/** Converts to sRGB; out-of-gamut colors are clipped and reported. */
export function oklchToRgb({ l, c, h }: Oklch): { rgb: Omit<Rgba, 'a'>; inGamut: boolean } {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  // In gamut when every channel still rounds to a valid 8-bit value (tolerates rounded CSS input).
  const inGamut = lin.every((v) => {
    const encoded = Math.sign(v) * fromLinear(Math.abs(v));
    return encoded >= -0.5 && encoded < 255.5;
  });
  const [r, g, b] = lin.map((v) => clamp(fromLinear(clamp(v, 0, 1)), 0, 255));
  return { rgb: { r, g, b }, inGamut };
}

// ---------- Formatting ----------

const byte = (v: number) => Math.round(clamp(v, 0, 255));
const hex2 = (v: number) => byte(v).toString(16).padStart(2, '0');

export function toHex(c: Rgba): string {
  const alpha = c.a < 1 ? hex2(c.a * 255) : '';
  return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${alpha}`;
}

export function toRgbString(c: Rgba): string {
  const rgb = `${byte(c.r)}, ${byte(c.g)}, ${byte(c.b)}`;
  return c.a < 1 ? `rgba(${rgb}, ${trim(c.a, 2)})` : `rgb(${rgb})`;
}

export function toHslString(c: Rgba): string {
  const { h, s, l } = rgbToHsl({ r: byte(c.r), g: byte(c.g), b: byte(c.b) });
  const body = `${trim(h)}, ${trim(s)}%, ${trim(l)}%`;
  return c.a < 1 ? `hsla(${body}, ${trim(c.a, 2)})` : `hsl(${body})`;
}

export function toOklchString(c: Rgba): string {
  const { l, c: chroma, h } = rgbToOklch({ r: byte(c.r), g: byte(c.g), b: byte(c.b) });
  const alpha = c.a < 1 ? ` / ${trim(c.a, 2)}` : '';
  return `oklch(${trim(l * 100, 1)}% ${trim(chroma, 3)} ${trim(h, 1)}${alpha})`;
}

// ---------- WCAG contrast ----------

export const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
export const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

/** Blends a translucent color over an opaque background. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/** WCAG 2.x relative luminance of an opaque sRGB color (8-bit channels). */
export function relativeLuminance(c: Rgba): number {
  const lin = (v: number) => toLinear(byte(v));
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface WcagResult {
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

/** WCAG 2.x thresholds: AA 4.5:1 (large text 3:1), AAA 7:1 (large text 4.5:1). */
export function wcag(ratio: number): WcagResult {
  return { aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5 };
}

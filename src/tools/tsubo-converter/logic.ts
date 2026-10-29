/**
 * 坪・畳（帖）・平米（㎡）の換算と、坪単価 ⇄ ㎡単価。純関数。
 *
 * 根拠（2026-10-29 確認）：
 * - 1 坪 = 1 歩 = 6 尺 × 6 尺。1 尺 = 10/33 m（明治24年 度量衡法）なので
 *   1 坪 = (60/33 m)² = 3600/1089 ㎡ = 400/121 ㎡ ≒ 3.305785 ㎡。
 *   逆に 1 ㎡ = 121/400 坪 = 0.3025 坪。㎡単価 = 坪単価 × 0.3025。
 * - 不動産の表示に関する公正競争規約施行規則（不動産公正取引協議会連合会）：
 *   居室等の広さを畳数で表示する場合、畳 1 枚当たりの広さは 1.62 ㎡（各室の壁心面積を畳数で除した数値）以上。
 *   https://www.rftc.jp/koseikyosokiyaku/ （規約・施行規則全文 PDF）
 * - 畳の寸法（一般的な呼び名と大きさ。地域・建物で異なる）：
 *   京間（本間）191 × 95.5 cm、中京間（三六間）182 × 91 cm、江戸間（五八間）176 × 88 cm、団地間（五六間）170 × 85 cm。
 */

export const TSUBO_M2 = 400 / 121;

export type TatamiType = 'kyoma' | 'chukyoma' | 'edoma' | 'danchima' | 'koukoku';

export const TATAMI: { id: TatamiType; label: string; size: string; m2: number }[] = [
  { id: 'koukoku', label: '不動産広告（1.62㎡）', size: '1畳 = 1.62 ㎡ 以上', m2: 1.62 },
  { id: 'kyoma', label: '京間（本間）', size: '191 × 95.5 cm', m2: 1.91 * 0.955 },
  { id: 'chukyoma', label: '中京間（三六間）', size: '182 × 91 cm', m2: 1.82 * 0.91 },
  { id: 'edoma', label: '江戸間（五八間）', size: '176 × 88 cm', m2: 1.76 * 0.88 },
  { id: 'danchima', label: '団地間（五六間）', size: '170 × 85 cm', m2: 1.7 * 0.85 },
];

export type AreaUnit = 'm2' | 'tsubo' | 'tatami' | 'a' | 'ha';

export function tatamiM2(type: TatamiType): number {
  return TATAMI.find((t) => t.id === type)!.m2;
}

/** 任意の単位 → ㎡。畳は畳の種類で大きさが変わる。 */
export function toSquareMeters(value: number, unit: AreaUnit, tatami: TatamiType = 'koukoku'): number {
  switch (unit) {
    case 'm2':
      return value;
    case 'tsubo':
      return (value * 400) / 121;
    case 'tatami':
      return value * tatamiM2(tatami);
    case 'a':
      return value * 100;
    case 'ha':
      return value * 10_000;
  }
}

export function fromSquareMeters(m2: number, unit: AreaUnit, tatami: TatamiType = 'koukoku'): number {
  switch (unit) {
    case 'm2':
      return m2;
    case 'tsubo':
      return (m2 * 121) / 400;
    case 'tatami':
      return m2 / tatamiM2(tatami);
    case 'a':
      return m2 / 100;
    case 'ha':
      return m2 / 10_000;
  }
}

export function convertArea(value: number, from: AreaUnit, to: AreaUnit, tatami: TatamiType = 'koukoku'): number {
  return fromSquareMeters(toSquareMeters(value, from, tatami), to, tatami);
}

/**
 * 不動産広告で表示できる畳数の上限：壁心面積 ÷ 1.62 を小数第 1 位未満で切り捨て。
 * （1 畳当たり 1.62 ㎡ 以上という基準を満たす最大の 0.1 畳刻みの値）
 */
export function maxAdvertisedTatami(m2: number): number {
  if (!(m2 > 0)) return 0;
  // 浮動小数点の誤差で 9.72/1.62 = 5.999… とならないよう、0.01 ㎡ 単位の整数で計算する
  const hundredths = Math.round(m2 * 100);
  return Math.floor((hundredths * 10) / 162) / 10;
}

/** 坪単価 → ㎡単価（円）。 */
export function perTsuboToPerM2(pricePerTsubo: number): number {
  return (pricePerTsubo * 121) / 400;
}

/** ㎡単価 → 坪単価（円）。 */
export function perM2ToPerTsubo(pricePerM2: number): number {
  return (pricePerM2 * 400) / 121;
}

/** 総額と面積から坪単価・㎡単価を求める。 */
export function unitPrices(total: number, m2: number): { perM2: number; perTsubo: number } | null {
  if (!(total > 0) || !(m2 > 0)) return null;
  return { perM2: total / m2, perTsubo: total / ((m2 * 121) / 400) };
}

/** 早見表用：よく使う坪数。 */
export const QUICK_TSUBO = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 80, 100];
/** 早見表用：よく使う畳数。 */
export const QUICK_TATAMI = [3, 4.5, 6, 8, 10, 12, 14, 16, 18, 20];

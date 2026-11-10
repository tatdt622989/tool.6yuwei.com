// 湊單計算: which items reach a spending threshold with the least money over it.
// Pure functions. Every amount is an integer in the currency's minor unit (元 / 円 as is, USD in cents).
import { applyThreshold } from '../discount-calculator/logic';

export interface CartItem {
  /** May be empty; the UI shows a numbered fallback. */
  name: string;
  /** Price of one, in minor units (positive integer). */
  price: number;
  /** How many of it could go in the cart (1–MAX_QTY). Must-haves always take all of them. */
  qty: number;
  /** true = 一定要買 (always in the cart), false = 可以湊 (optional candidate). */
  must: boolean;
}

export interface ParsedItem extends CartItem {
  /** 0-based line index in the source text. */
  line: number;
}

export interface ParsedList {
  items: ParsedItem[];
  /** 1-based numbers of non-blank lines that have no readable price. */
  invalid: number[];
  /** true when there were more than MAX_LINES item lines; the rest were ignored. */
  truncated: boolean;
}

export const MAX_LINES = 200;
export const MAX_QTY = 99;
/** Largest price or target accepted, in minor units. */
export const MAX_AMOUNT = 100_000_000;
/** Limits of one exact search: candidate pieces, table width (after dividing by the common factor) and table cells. */
export const MAX_UNITS = 400;
export const MAX_WIDTH = 4_000_000;
export const MAX_CELLS = 150_000_000;
/** Work allowed for the extra 2× / 3× searches of a repeating discount, on top of the main search. */
export const MAX_TIER_CELLS = 60_000_000;

/** Full-width ASCII (０-９ ＊ ！ ， ． ｘ ＄ …) and the ideographic space → half-width. */
function toHalfWidth(text: string): string {
  return text
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ')
    .replace(/￥/g, '¥');
}

const MUST_MARK = /^\s*[*!＊！]\s*/;
const BULLET = /^[-•・]\s+/;
/** 「x2」「×2」「*2」 after the price. The x must not be the end of a word (「Box 12」 is a name and a price). */
const QTY_SUFFIX = /([^a-z\s]|^)\s*[x×✕*]\s*(\d{1,4})\s*(?:個|件|点|包|入|pcs?)?$/i;
const PRICE_TAIL = /^(.*?)([$¥] ?)?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*(?:元|円|圓|塊)?$/;
const NAME_TRIM = /^[\s:：,、|=\-–—]+|[\s:：,、|=\-–—]+$/g;
const MAX_LINE_LENGTH = 200;

function parsePriced(text: string, scale: number): { name: string; price: number } | null {
  const m = PRICE_TAIL.exec(text);
  if (!m) return null;
  let name = m[1];
  if (m[2]) name = name.replace(/(^|[^a-z])(?:nt|us)$/i, '$1');
  // 「洗髮精 500ml」「A4」 have no price: a number glued to a Latin letter or digit belongs to the name.
  else if (/[a-z0-9.]$/i.test(name)) return null;
  const price = Math.round(Number(m[3].replace(/,/g, '')) * scale);
  if (!Number.isSafeInteger(price) || price <= 0 || price > MAX_AMOUNT) return null;
  return { name: name.replace(NAME_TRIM, ''), price };
}

/**
 * One line of the list: 「名稱 價格」, name optional, price last.
 *  - a leading `*` or `!` marks a must-have
 *  - a trailing `x2` / `×2` means up to 2 of it
 *  - full-width digits and symbols, thousands separators and a currency sign or unit are accepted
 * `scale` is minor units per major unit (1 for 元 / 円, 100 for dollars). Returns null when there is no price.
 */
export function parseLine(raw: string, scale = 1): CartItem | null {
  let text = toHalfWidth(raw).trim().slice(0, MAX_LINE_LENGTH);
  if (!text) return null;
  const must = MUST_MARK.test(text);
  if (must) text = text.replace(MUST_MARK, '');
  text = text.replace(BULLET, '');

  const qtyMatch = QTY_SUFFIX.exec(text);
  if (qtyMatch) {
    const priced = parsePriced(text.slice(0, qtyMatch.index + qtyMatch[1].length), scale);
    const qty = Number(qtyMatch[2]);
    if (priced && qty >= 1) return { ...priced, qty: Math.min(qty, MAX_QTY), must };
  }
  // No quantity, or what looked like one was really the price (「iPhone X 2」).
  const priced = parsePriced(text, scale);
  return priced ? { ...priced, qty: 1, must } : null;
}

export function parseItems(text: string, scale = 1): ParsedList {
  const items: ParsedItem[] = [];
  const invalid: number[] = [];
  let truncated = false;
  text.split(/\r\n|\r|\n/).forEach((raw, line) => {
    if (!raw.trim()) return;
    const item = parseLine(raw, scale);
    if (!item) invalid.push(line + 1);
    else if (items.length >= MAX_LINES) truncated = true;
    else items.push({ ...item, line });
  });
  return { items, invalid, truncated };
}

/** Adds or removes the leading must-have mark of one line (0-based) and returns the new text. */
export function setLineMust(text: string, line: number, must: boolean): string {
  const lines = text.split('\n');
  if (line < 0 || line >= lines.length) return text;
  const bare = lines[line].replace(MUST_MARK, '');
  lines[line] = must ? `*${bare.trimStart()}` : bare;
  return lines.join('\n');
}

/** Amount typed by the user → minor units, NaN when empty or invalid. */
export function parseAmount(input: string, scale = 1): number {
  const text = toHalfWidth(input).replace(/nt\$|us\$|[$¥元円\s,]/gi, '');
  if (!/^\d+(\.\d+)?$/.test(text)) return Number.NaN;
  const value = Math.round(Number(text) * scale);
  return Number.isSafeInteger(value) ? value : Number.NaN;
}

// ---- Search ----

export interface Pick {
  /** Index into the items array passed to solveCart. */
  item: number;
  qty: number;
}

export interface Combo {
  /** List-price total of everything in the cart, must-haves included. */
  total: number;
  /** Must-haves (full quantity) and chosen candidates, in list order. */
  picks: Pick[];
  /** Number of optional pieces added, and what they cost. */
  added: number;
  addedTotal: number;
}

/**
 * ok        `best` reaches the target with the smallest possible total
 * short     even everything on the list stays below the target; `best` is everything, `short` the gap
 * empty     no usable items
 * too-large beyond the exact search limits; nothing was computed
 */
export type CartStatus = 'ok' | 'short' | 'empty' | 'too-large';

export interface CartResult {
  status: CartStatus;
  target: number;
  mustTotal: number;
  best: Combo | null;
  /** best.total − target when ok, else 0. */
  over: number;
  /** target − best.total when short, else 0. */
  short: number;
  /** Next-smallest totals that also reach the target (ok only), each with the fewest items for that total. */
  alternatives: Combo[];
  /** Table cells the search filled; callers use it to budget further searches. */
  cells: number;
}

export interface SolveOptions {
  /** How many next-best totals to return (default 3). */
  alternatives?: number;
  maxCells?: number;
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

function usable(item: CartItem): boolean {
  return Number.isSafeInteger(item.price) && item.price > 0 && Number.isSafeInteger(item.qty) && item.qty >= 1;
}

const INF = 0xffff;

/**
 * Exact search for the cheapest cart that reaches `target`.
 *
 * Must-haves are always in. Among the optional items (each up to its quantity) it finds the subset whose
 * sum covers the rest with the smallest total; ties go to the fewest pieces. `alternatives` are the next
 * distinct totals, counting only carts where every added piece is needed (dropping any one falls below the
 * target), again with the fewest pieces.
 *
 * Method: sort the pieces by price, highest first, and run a 0/1 subset-sum table over sums below the
 * remaining amount W, keeping the fewest pieces per sum. A cart in which every piece is needed is exactly
 * "its cheapest piece i + earlier pieces summing to s < W with s + price(i) ≥ W", so scanning the table
 * just before each piece is added lists every such total. One bit per (piece, sum) records the decisions
 * and gives the items back. Cost is O(pieces × W) simple steps, independent of how many subsets exist.
 */
export function solveCart(items: readonly CartItem[], target: number, options: SolveOptions = {}): CartResult {
  const wanted = 1 + Math.max(0, Math.floor(options.alternatives ?? 3));
  const maxCells = options.maxCells ?? MAX_CELLS;
  const goal = Number.isFinite(target) && target > 0 ? Math.ceil(target) : 0;

  const mustPicks: Pick[] = [];
  const optional: number[] = [];
  let mustTotal = 0;
  let optionalTotal = 0;
  items.forEach((item, index) => {
    if (!usable(item)) return;
    if (item.must) {
      mustPicks.push({ item: index, qty: item.qty });
      mustTotal += item.price * item.qty;
    } else {
      optional.push(index);
      optionalTotal += item.price * item.qty;
    }
  });

  const base = { target: goal, mustTotal, over: 0, short: 0, alternatives: [] as Combo[], cells: 0 };
  const combo = (extra: Pick[], addedTotal: number): Combo => ({
    total: mustTotal + addedTotal,
    picks: [...mustPicks, ...extra].sort((a, b) => a.item - b.item),
    added: extra.reduce((n, p) => n + p.qty, 0),
    addedTotal,
  });

  if (mustPicks.length === 0 && optional.length === 0) return { ...base, status: 'empty', best: null };
  if (goal > MAX_AMOUNT) return { ...base, status: 'too-large', best: null };

  const need = goal - mustTotal;
  if (need <= 0) return { ...base, status: 'ok', best: combo([], 0), over: mustTotal - goal };
  if (optionalTotal < need) {
    const all = optional.map((item) => ({ item, qty: items[item].qty }));
    return { ...base, status: 'short', best: combo(all, optionalTotal), short: need - optionalTotal };
  }

  // Sums of multiples of g are multiples of g, so the table can work in units of g.
  const g = optional.reduce((acc, i) => gcd(acc, items[i].price), 0);
  const width = Math.ceil(need / g);

  // One entry per piece; more than ⌈W / price⌉ of an item can never all be needed.
  const unitItem: number[] = [];
  const unitPrice: number[] = [];
  for (const i of optional) {
    const p = items[i].price / g;
    const copies = Math.min(items[i].qty, Math.ceil(width / p));
    for (let k = 0; k < copies; k++) {
      unitItem.push(i);
      unitPrice.push(p);
    }
  }
  const order = unitItem.map((_, u) => u).sort((a, b) => unitPrice[b] - unitPrice[a] || a - b);
  const n = order.length;
  const small = order.reduce((count, u) => count + (unitPrice[u] < width ? 1 : 0), 0);
  const cells = small * width;
  if (n > MAX_UNITS || width > MAX_WIDTH || cells > maxCells) return { ...base, status: 'too-large', best: null };

  const count = new Uint16Array(width).fill(INF);
  count[0] = 0;
  const rows: (Uint8Array | null)[] = new Array(n).fill(null);
  let reach = 0; // largest sum below W reached so far
  // total (in units of g) → fewest pieces and where to rebuild it from
  const found = new Map<number, { pieces: number; at: number; sum: number }>();

  for (let k = 0; k < n; k++) {
    const p = unitPrice[order[k]];

    // Carts whose cheapest piece is this one.
    let seen = 0;
    for (let s = Math.max(0, width - p); s <= reach && seen < wanted; s++) {
      const c = count[s];
      if (c === INF) continue;
      seen++;
      const prev = found.get(s + p);
      if (!prev || c + 1 < prev.pieces) found.set(s + p, { pieces: c + 1, at: k, sum: s });
    }

    if (p >= width) continue;
    const hi = Math.min(width - 1, reach + p);
    const row = new Uint8Array((hi >> 3) + 1);
    for (let s = hi; s >= p; s--) {
      const c = count[s - p] + 1;
      if (c < count[s]) {
        count[s] = c;
        row[s >> 3] |= 1 << (s & 7);
      }
    }
    rows[k] = row;
    reach = hi;
  }

  const rebuild = (totalUnits: number): Combo => {
    const { at, sum } = found.get(totalUnits)!;
    const qty = new Map<number, number>();
    const take = (k: number) => qty.set(unitItem[order[k]], (qty.get(unitItem[order[k]]) ?? 0) + 1);
    take(at);
    let s = sum;
    for (let k = at - 1; k >= 0 && s > 0; k--) {
      const row = rows[k];
      if (!row || s >> 3 >= row.length || !(row[s >> 3] & (1 << (s & 7)))) continue;
      take(k);
      s -= unitPrice[order[k]];
    }
    return combo(
      [...qty].map(([item, q]) => ({ item, qty: q })),
      totalUnits * g,
    );
  };

  const totals = [...found.keys()].sort((a, b) => a - b).slice(0, wanted);
  const [best, ...alternatives] = totals.map(rebuild);
  return { ...base, status: 'ok', best, over: best.total - goal, alternatives, cells };
}

// ---- Threshold discount (滿 X 折 Y) ----

export interface Offer {
  /** List-price total. */
  total: number;
  /** Amount taken off, and what is actually paid. */
  discount: number;
  paid: number;
  /** How many times the threshold discount applied. */
  times: number;
  /** paid ÷ total; NaN for an empty cart. */
  ratio: number;
}

/** What a cart of `total` costs under 滿 threshold 折 off (每滿 when `repeat`). Invalid rules mean no discount. */
export function priceOffer(total: number, threshold: number, off: number, repeat: boolean): Offer {
  const r = threshold > 0 && off > 0 ? applyThreshold(total, threshold, off, repeat) : null;
  const paid = r && Number.isFinite(r.final) ? r.final : total;
  const times = r && Number.isFinite(r.times) ? r.times : 0;
  return { total, discount: total - paid, paid, times, ratio: total > 0 ? paid / total : Number.NaN };
}

export interface Tier extends Offer {
  /** Which multiple of the threshold this cart was built to reach. */
  multiple: number;
  combo: Combo;
}

export interface TierResult {
  /** One entry per multiple that can be reached, without repeats of the same cart. */
  tiers: Tier[];
  /** Index of the tier with the lowest paid ÷ total (the smaller cart wins ties); −1 when there are none. */
  best: number;
  /** true when a multiple was left out because the search would be too large. */
  skipped: boolean;
}

/**
 * For a repeating discount (每滿 threshold 折 off): the cheapest cart at the multiple the must-haves already
 * reach (at least 1×) and at the next two, and which of them pays the smallest share of its list price.
 * Pass the 1× result as `first` to avoid computing it twice.
 */
export function solveTiers(
  items: readonly CartItem[],
  threshold: number,
  off: number,
  options: { first?: CartResult; multiples?: number; maxCells?: number } = {},
): TierResult {
  const tiers: Tier[] = [];
  let skipped = false;
  let budget = options.maxCells ?? MAX_TIER_CELLS;
  if (!(threshold > 0) || !(off > 0)) return { tiers, best: -1, skipped };

  const mustTotal = items.reduce((sum, item) => sum + (item.must && usable(item) ? item.price * item.qty : 0), 0);
  const start = Math.max(1, Math.floor(mustTotal / threshold));
  for (let multiple = start; multiple < start + (options.multiples ?? 3); multiple++) {
    const reuse = multiple === 1 && options.first?.target === threshold ? options.first : undefined;
    const r = reuse ?? solveCart(items, threshold * multiple, { alternatives: 0, maxCells: budget });
    if (r.status === 'too-large') {
      skipped = true;
      break;
    }
    if (r.status !== 'ok' || !r.best) break;
    if (!reuse) budget -= r.cells;
    if (tiers.some((t) => t.total === r.best!.total)) continue; // one coarse cart can cover two multiples
    tiers.push({ ...priceOffer(r.best.total, threshold, off, true), multiple, combo: r.best });
  }

  let best = -1;
  tiers.forEach((tier, i) => {
    if (best < 0 || tier.ratio < tiers[best].ratio - 1e-12) best = i;
  });
  return { tiers, best, skipped };
}

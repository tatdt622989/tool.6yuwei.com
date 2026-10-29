// Safe expression evaluator for the calculator. No eval / Function: a hand-written
// tokenizer + recursive-descent parser builds a small AST that is then evaluated.
//
// Grammar (lowest to highest precedence):
//   expr     := term (('+' | '-') term)*            a ± b%  means a ± a×b/100
//   term     := unary (('*' | '/') unary | implicit)*  implicit multiplication: 2π, 3(4), 2sin(30)
//   unary    := ('-' | '+') unary | power
//   power    := postfix ('^' unary)?                right-associative, -2^2 = -4, 2^-1 = 0.5
//   postfix  := primary ('!' | '%' | '²' | '³')*
//   primary  := number | constant | 'Ans' | '(' expr ')' | func operand | '√' operand | '∛' operand
//   operand  := '(' expr ')' | unary                 sin30 = sin(30), √9 = 3

export type AngleMode = 'deg' | 'rad';

export interface EvalOptions {
  angle: AngleMode;
  /** Value of the previous answer, used by the token "Ans". */
  ans?: number;
}

export type EvalResult = { ok: true; value: number } | { ok: false; error: string };

export class CalcError extends Error {}

type FuncName = 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'ln' | 'log' | 'sqrt' | 'cbrt' | 'abs';

type Token =
  | { t: 'num'; v: number }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'post'; v: '!' | '%' | '²' | '³' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'const'; v: 'pi' | 'e' | 'ans' }
  | { t: 'func'; v: FuncName };

type Node =
  | { k: 'num'; v: number }
  | { k: 'const'; v: 'pi' | 'e' | 'ans' }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'post'; op: '!' | '%' | '²' | '³'; a: Node }
  | { k: 'func'; f: FuncName; a: Node };

const FUNC_ALIASES: Record<string, FuncName> = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  asin: 'asin',
  acos: 'acos',
  atan: 'atan',
  arcsin: 'asin',
  arccos: 'acos',
  arctan: 'atan',
  'sin⁻¹': 'asin',
  'cos⁻¹': 'acos',
  'tan⁻¹': 'atan',
  ln: 'ln',
  log: 'log',
  sqrt: 'sqrt',
  cbrt: 'cbrt',
  abs: 'abs',
};

// Longest names first so "asin" wins over "sin" and "sin⁻¹" over "sin".
const NAMES = [...Object.keys(FUNC_ALIASES), 'pi', 'ans', 'e'].sort((a, b) => b.length - a.length);

/** Maps the display symbols and full-width characters people paste to ASCII operators. */
export function normalizeExpression(input: string): string {
  return input
    .replace(/[０-９．（）＋－＊／＾％！]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    // x / X between two operands (3x4, 2 x (5)) is multiplication.
    .replace(/(?<=[\d.)])\s*[xX]\s*(?=[\d.(])/g, '*')
    .replace(/[×✕·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/[,，\s]/g, '')
    .replace(/π/g, 'pi');
}

export function tokenize(raw: string): Token[] {
  const s = normalizeExpression(raw);
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[\d.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(s.slice(i));
      if (!m) throw new CalcError('數字格式不正確');
      if (/^\d*\.\d*\./.test(s.slice(i))) throw new CalcError('數字有多個小數點');
      tokens.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      tokens.push({ t: 'op', v: ch as '+' | '-' | '*' | '/' | '^' });
      i++;
      continue;
    }
    if ('!%²³'.includes(ch)) {
      tokens.push({ t: 'post', v: ch as '!' | '%' | '²' | '³' });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ t: 'lp' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ t: 'rp' });
      i++;
      continue;
    }
    if (ch === '√' || ch === '∛') {
      tokens.push({ t: 'func', v: ch === '√' ? 'sqrt' : 'cbrt' });
      i++;
      continue;
    }
    if (ch === '⁻' && s[i + 1] === '¹') {
      // x⁻¹ = x^(-1)
      tokens.push({ t: 'op', v: '^' }, { t: 'lp' }, { t: 'op', v: '-' }, { t: 'num', v: 1 }, { t: 'rp' });
      i += 2;
      continue;
    }
    const rest = s.slice(i).toLowerCase();
    const name = NAMES.find((n) => rest.startsWith(n));
    if (name) {
      // "e" is Euler's number; an uppercase "E" between digits is scientific notation (handled above).
      if (name === 'pi' || name === 'e' || name === 'ans') tokens.push({ t: 'const', v: name });
      else tokens.push({ t: 'func', v: FUNC_ALIASES[name] });
      i += name.length;
      continue;
    }
    throw new CalcError(`無法辨識的字元「${ch}」`);
  }
  return tokens;
}

class Parser {
  private i = 0;
  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    if (this.tokens.length === 0) throw new CalcError('請輸入算式');
    const node = this.expr();
    if (this.i < this.tokens.length) {
      const tok = this.tokens[this.i];
      throw new CalcError(tok.t === 'rp' ? '右括號多了，括號不對稱' : '算式格式不正確');
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.i];
  }

  private expr(): Node {
    let node = this.term();
    for (let tok = this.peek(); tok?.t === 'op' && (tok.v === '+' || tok.v === '-'); tok = this.peek()) {
      this.i++;
      node = { k: 'bin', op: tok.v, a: node, b: this.term() };
    }
    return node;
  }

  private startsOperand(tok: Token | undefined): boolean {
    return !!tok && (tok.t === 'num' || tok.t === 'const' || tok.t === 'lp' || tok.t === 'func');
  }

  private term(): Node {
    let node = this.unary();
    for (;;) {
      const tok = this.peek();
      if (tok?.t === 'op' && (tok.v === '*' || tok.v === '/')) {
        this.i++;
        node = { k: 'bin', op: tok.v, a: node, b: this.unary() };
      } else if (this.startsOperand(tok)) {
        node = { k: 'bin', op: '*', a: node, b: this.power() };
      } else {
        return node;
      }
    }
  }

  private unary(): Node {
    const tok = this.peek();
    if (tok?.t === 'op' && (tok.v === '-' || tok.v === '+')) {
      this.i++;
      const a = this.unary();
      return tok.v === '-' ? { k: 'neg', a } : a;
    }
    return this.power();
  }

  private power(): Node {
    const base = this.postfix();
    const tok = this.peek();
    if (tok?.t === 'op' && tok.v === '^') {
      this.i++;
      return { k: 'bin', op: '^', a: base, b: this.unary() };
    }
    return base;
  }

  private postfix(): Node {
    let node = this.primary();
    for (let tok = this.peek(); tok?.t === 'post'; tok = this.peek()) {
      this.i++;
      node = { k: 'post', op: tok.v, a: node };
    }
    return node;
  }

  private primary(): Node {
    const tok = this.peek();
    if (!tok) throw new CalcError('算式不完整');
    this.i++;
    switch (tok.t) {
      case 'num':
        return { k: 'num', v: tok.v };
      case 'const':
        return { k: 'const', v: tok.v };
      case 'lp': {
        if (this.peek()?.t === 'rp') throw new CalcError('括號內沒有內容');
        const inner = this.expr();
        if (this.peek()?.t !== 'rp') throw new CalcError('缺少右括號');
        this.i++;
        return inner;
      }
      case 'func': {
        const next = this.peek();
        if (!next) throw new CalcError('函數後面缺少數值');
        // sin(30)² applies the square to the result; sin 30² takes the square first.
        const a = next.t === 'lp' ? this.primary() : this.unary();
        return { k: 'func', f: tok.v, a };
      }
      case 'rp':
        throw new CalcError('括號不對稱');
      default:
        throw new CalcError(tok.t === 'post' ? '運算符號前缺少數值' : '算式不完整');
    }
  }
}

const DEG = Math.PI / 180;
/** Trig outputs closer than this to 0 are treated as exactly 0 (sin π, cos 90°). */
const TRIG_EPS = 1e-12;

function snap(v: number): number {
  return Math.abs(v) < TRIG_EPS ? 0 : v;
}

function trig(f: 'sin' | 'cos' | 'tan', x: number, angle: AngleMode): number {
  if (angle === 'deg') {
    // Exact results at multiples of 90° so sin(180) = 0 and tan(45) = 1.
    const d = ((x % 360) + 360) % 360;
    if (Number.isInteger(d) && d % 90 === 0) {
      const sin = [0, 1, 0, -1][d / 90];
      const cos = [1, 0, -1, 0][d / 90];
      if (f === 'sin') return sin;
      if (f === 'cos') return cos;
      if (cos === 0) throw new CalcError('tan 在 90° 的奇數倍沒有定義');
      return sin / cos;
    }
    if (f === 'tan' && Number.isInteger(d) && d % 45 === 0) return d === 45 || d === 225 ? 1 : -1;
  }
  const r = angle === 'deg' ? x * DEG : x;
  if (f === 'sin') return snap(Math.sin(r));
  if (f === 'cos') return snap(Math.cos(r));
  const cos = snap(Math.cos(r));
  if (cos === 0) throw new CalcError('tan 在此角度沒有定義');
  return snap(Math.sin(r)) / cos;
}

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('階乘只適用於 0 以上的整數');
  if (n > 170) throw new CalcError('數值太大，超出可計算範圍');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evalNode(node: Node, opts: EvalOptions): number {
  switch (node.k) {
    case 'num':
      return node.v;
    case 'const':
      if (node.v === 'pi') return Math.PI;
      if (node.v === 'e') return Math.E;
      return opts.ans ?? 0;
    case 'neg':
      return -evalNode(node.a, opts);
    case 'post': {
      const a = evalNode(node.a, opts);
      if (node.op === '!') return factorial(a);
      if (node.op === '%') return a / 100;
      return node.op === '²' ? a * a : a * a * a;
    }
    case 'func': {
      const a = evalNode(node.a, opts);
      switch (node.f) {
        case 'sin':
        case 'cos':
        case 'tan':
          return trig(node.f, a, opts.angle);
        case 'asin':
        case 'acos': {
          if (a < -1 || a > 1) throw new CalcError(`${node.f === 'asin' ? 'sin⁻¹' : 'cos⁻¹'} 的輸入必須介於 -1 到 1`);
          const r = node.f === 'asin' ? Math.asin(a) : Math.acos(a);
          return opts.angle === 'deg' ? r / DEG : r;
        }
        case 'atan':
          return opts.angle === 'deg' ? Math.atan(a) / DEG : Math.atan(a);
        case 'ln':
        case 'log':
          if (a <= 0) throw new CalcError('對數的真數必須大於 0');
          return node.f === 'ln' ? Math.log(a) : Math.log10(a);
        case 'sqrt':
          if (a < 0) throw new CalcError('負數不能開平方根');
          return Math.sqrt(a);
        case 'cbrt':
          return Math.cbrt(a);
        case 'abs':
          return Math.abs(a);
      }
      break;
    }
    case 'bin': {
      // a ± b% → a ± a × b / 100 (the way phone and desk calculators handle 「加成」 and 「打折」).
      if ((node.op === '+' || node.op === '-') && node.b.k === 'post' && node.b.op === '%') {
        const a = evalNode(node.a, opts);
        const pct = evalNode(node.b.a, opts) / 100;
        return node.op === '+' ? a + a * pct : a - a * pct;
      }
      const a = evalNode(node.a, opts);
      const b = evalNode(node.b, opts);
      switch (node.op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          if (b === 0) throw new CalcError('不能除以 0');
          return a / b;
        case '^': {
          if (a < 0 && !Number.isInteger(b)) {
            // Allow odd roots of negatives, e.g. (-8)^(1/3) = -2.
            const inv = 1 / b;
            const n = Math.round(inv);
            if (Math.abs(inv - n) < 1e-9 && n % 2 !== 0) return -Math.pow(-a, b);
            throw new CalcError('負數的非整數次方沒有實數解');
          }
          if (a === 0 && b < 0) throw new CalcError('不能除以 0');
          return Math.pow(a, b);
        }
      }
    }
  }
  throw new CalcError('算式格式不正確');
}

/** Closes any parentheses the user left open, like most scientific calculators do. */
export function autoClose(tokens: Token[]): Token[] {
  let depth = 0;
  for (const t of tokens) {
    if (t.t === 'lp') depth++;
    else if (t.t === 'rp') depth--;
    if (depth < 0) throw new CalcError('右括號多了，括號不對稱');
  }
  return depth > 0 ? [...tokens, ...Array.from({ length: depth }, () => ({ t: 'rp' }) as Token)] : tokens;
}

export function evaluate(expression: string, opts: EvalOptions = { angle: 'deg' }): EvalResult {
  try {
    const tokens = autoClose(tokenize(expression));
    const value = evalNode(new Parser(tokens).parse(), opts);
    if (Number.isNaN(value)) return { ok: false, error: '無法計算' };
    if (!Number.isFinite(value)) return { ok: false, error: '數值太大，超出可計算範圍' };
    return { ok: true, value: roundSignificant(value) };
  } catch (err) {
    if (err instanceof CalcError) return { ok: false, error: err.message };
    throw err;
  }
}

/** Rounds to 12 significant digits, hiding binary floating point noise (0.1 + 0.2 → 0.3). */
export function roundSignificant(value: number, digits = 12): number {
  if (value === 0) return 0; // also turns -0 into 0
  if (!Number.isFinite(value)) return value;
  return Number(value.toPrecision(digits));
}

/**
 * Formats a result for the display. Very large or very small numbers use E notation
 * (1.5E+20), which the tokenizer reads back, so a result can be reused in a new expression.
 */
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return '錯誤';
  const v = roundSignificant(value);
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e15 || abs < 1e-6) {
    const [mant, exp] = v.toExponential(11).split('e');
    const m = mant.includes('.') ? mant.replace(/\.?0+$/, '') : mant;
    return `${m}E${exp.startsWith('-') ? exp : `+${exp.replace('+', '')}`}`;
  }
  // Between 1e-6 and 1e15 String() never uses exponent notation.
  return String(v);
}

/** Adds thousands separators to the integer part, for the read-only result line. */
export function groupDigits(text: string): string {
  if (text.includes('E')) return text;
  const [int, frac] = text.split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const digits = sign ? int.slice(1) : int;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + grouped + (frac !== undefined ? `.${frac}` : '');
}

export interface HistoryEntry {
  expr: string;
  result: string;
}

export const HISTORY_LIMIT = 30;

export function pushHistory(list: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const without = list[0]?.expr === entry.expr && list[0]?.result === entry.result ? list.slice(1) : list;
  return [entry, ...without].slice(0, HISTORY_LIMIT);
}

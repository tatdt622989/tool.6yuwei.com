import { defineToolI18n } from '../../i18n/tool';
import type { CalcErrorCode } from './logic';

/** Keys whose accessible name differs from their visible label. */
export type KeyAriaId =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'ln'
  | 'log'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'exp'
  | 'pow10'
  | 'square'
  | 'power'
  | 'sqrt'
  | 'cbrt'
  | 'factorial'
  | 'pi'
  | 'e'
  | 'recip'
  | 'abs'
  | 'ans'
  | 'clear'
  | 'divide'
  | 'multiply'
  | 'minus'
  | 'plus'
  | 'percent'
  | 'dot'
  | 'equals';

export interface Strings {
  modeAria: string;
  modeBasic: string;
  modeSci: string;
  angleAria: string;
  angleDeg: string;
  angleRad: string;
  exprAria: string;
  delAria: string;
  sciAria: string;
  keyAria: Partial<Record<KeyAriaId, string>>;
  copy: string;
  keyboardHint: string;
  historyLabel: string;
  clearHistory: string;
  historyEmpty: string;
  client: {
    /** Localized evaluator errors; zh-TW omits it and shows logic.ts messages as-is. */
    errors?: Record<CalcErrorCode, string>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '計算機模式',
    modeBasic: '標準',
    modeSci: '工程（科學）',
    angleAria: '角度單位',
    angleDeg: 'DEG 度',
    angleRad: 'RAD 弳',
    exprAria: '算式（可直接用鍵盤輸入）',
    delAria: '刪除一個字元（Backspace）',
    sciAria: '科學函數',
    keyAria: {
      asin: '反正弦',
      acos: '反餘弦',
      atan: '反正切',
      exp: 'e 的 x 次方',
      pow10: '10 的 x 次方',
      square: '平方',
      power: '次方',
      sqrt: '平方根',
      cbrt: '立方根',
      factorial: '階乘',
      pi: '圓周率',
      e: '自然常數 e',
      recip: '倒數',
      abs: '絕對值',
      ans: '上一個答案',
      clear: '全部清除',
      divide: '除',
      multiply: '乘',
      minus: '減',
      plus: '加',
      percent: '百分比',
      dot: '小數點',
      equals: '等於',
    },
    copy: '複製結果',
    keyboardHint: '鍵盤：數字與 + − * / ^ ( ) % !，Enter 計算、Backspace 刪除、Esc 清除',
    historyLabel: '計算紀錄（點一下帶回算式）',
    clearHistory: '清除紀錄',
    historyEmpty: '按「=」後，算式與結果會記在這裡，只存在你的瀏覽器。',
    client: {},
  },
  en: {
    modeAria: 'Calculator mode',
    modeBasic: 'Basic',
    modeSci: 'Scientific',
    angleAria: 'Angle unit',
    angleDeg: 'DEG',
    angleRad: 'RAD',
    exprAria: 'Expression (you can type with your keyboard)',
    delAria: 'Delete one character (Backspace)',
    sciAria: 'Scientific functions',
    keyAria: {
      sin: 'Sine',
      cos: 'Cosine',
      tan: 'Tangent',
      ln: 'Natural logarithm',
      log: 'Common logarithm (base 10)',
      asin: 'Inverse sine',
      acos: 'Inverse cosine',
      atan: 'Inverse tangent',
      exp: 'e to the power of x',
      pow10: '10 to the power of x',
      square: 'Square',
      power: 'Power',
      sqrt: 'Square root',
      cbrt: 'Cube root',
      factorial: 'Factorial',
      pi: 'Pi',
      e: 'Euler’s number e',
      recip: 'Reciprocal',
      abs: 'Absolute value',
      ans: 'Previous answer',
      clear: 'All clear',
      divide: 'Divide',
      multiply: 'Multiply',
      minus: 'Subtract',
      plus: 'Add',
      percent: 'Percent',
      dot: 'Decimal point',
      equals: 'Equals',
    },
    copy: 'Copy result',
    keyboardHint: 'Keyboard: digits and + − * / ^ ( ) % !, Enter to calculate, Backspace to delete, Esc to clear',
    historyLabel: 'History (tap an entry to reuse it)',
    clearHistory: 'Clear history',
    historyEmpty: 'Press “=” and your calculations appear here. They are stored only in your browser.',
    client: {
      errors: {
        badNumber: 'Invalid number',
        multipleDots: 'A number has more than one decimal point',
        unknownChar: 'Unrecognized character “{ch}”',
        empty: 'Enter an expression',
        extraRightParen: 'Too many closing parentheses',
        badSyntax: 'Syntax error',
        incomplete: 'Incomplete expression',
        emptyParens: 'Empty parentheses',
        missingRightParen: 'Missing closing parenthesis',
        missingOperand: 'A function needs a value after it',
        unbalanced: 'Unbalanced parentheses',
        missingValueBeforeOperator: 'Missing a value before the operator',
        tanUndefined90: 'tan is undefined at odd multiples of 90°',
        tanUndefined: 'tan is undefined at this angle',
        factorialDomain: 'Factorial only works for whole numbers 0 or greater',
        tooLarge: 'Number too large to calculate',
        inverseTrigDomain: '{fn} needs an input between -1 and 1',
        logDomain: 'Logarithm needs a value greater than 0',
        sqrtNegative: 'Can’t take the square root of a negative number',
        divideByZero: 'Can’t divide by 0',
        negativeFractionalPower: 'A negative number to a fractional power has no real result',
        notANumber: 'Can’t calculate this',
      },
    },
  },
  ja: {
    modeAria: '電卓のモード',
    modeBasic: '標準',
    modeSci: '関数電卓',
    angleAria: '角度の単位',
    angleDeg: 'DEG 度',
    angleRad: 'RAD ラジアン',
    exprAria: '計算式（キーボードでも入力できます）',
    delAria: '1 文字削除（Backspace）',
    sciAria: '関数キー',
    keyAria: {
      sin: 'サイン',
      cos: 'コサイン',
      tan: 'タンジェント',
      ln: '自然対数',
      log: '常用対数',
      asin: 'アークサイン',
      acos: 'アークコサイン',
      atan: 'アークタンジェント',
      exp: 'e の x 乗',
      pow10: '10 の x 乗',
      square: '2 乗',
      power: 'べき乗',
      sqrt: '平方根',
      cbrt: '立方根',
      factorial: '階乗',
      pi: '円周率',
      e: 'ネイピア数 e',
      recip: '逆数',
      abs: '絶対値',
      ans: '直前の答え',
      clear: 'オールクリア',
      divide: '割る',
      multiply: '掛ける',
      minus: '引く',
      plus: '足す',
      percent: 'パーセント',
      dot: '小数点',
      equals: 'イコール',
    },
    copy: '結果をコピー',
    keyboardHint: 'キーボード：数字と + − * / ^ ( ) % !、Enter で計算、Backspace で削除、Esc でクリア',
    historyLabel: '計算履歴（タップで式を呼び出し）',
    clearHistory: '履歴を消去',
    historyEmpty: '「=」を押すと、式と答えがここに記録されます。データはお使いのブラウザにだけ保存されます。',
    client: {
      errors: {
        badNumber: '数値の形式が正しくありません',
        multipleDots: '小数点が 2 つ以上あります',
        unknownChar: '使えない文字「{ch}」があります',
        empty: '計算式を入力してください',
        extraRightParen: '閉じかっこが多すぎます',
        badSyntax: '計算式の形式が正しくありません',
        incomplete: '計算式が途中で終わっています',
        emptyParens: 'かっこの中が空です',
        missingRightParen: '閉じかっこがありません',
        missingOperand: '関数のあとに数値がありません',
        unbalanced: 'かっこの数が合っていません',
        missingValueBeforeOperator: '演算子の前に数値がありません',
        tanUndefined90: 'tan は 90° の奇数倍では定義されません',
        tanUndefined: 'tan はこの角度では定義されません',
        factorialDomain: '階乗は 0 以上の整数でのみ計算できます',
        tooLarge: '数値が大きすぎて計算できません',
        inverseTrigDomain: '{fn} には -1 から 1 までの値を入力してください',
        logDomain: '対数の真数は 0 より大きい値にしてください',
        sqrtNegative: '負の数の平方根は計算できません',
        divideByZero: '0 で割ることはできません',
        negativeFractionalPower: '負の数の小数乗は実数になりません',
        notANumber: '計算できません',
      },
    },
  },
});

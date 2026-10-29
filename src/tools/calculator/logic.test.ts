import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES, evaluate, factorial, formatResult, groupDigits, normalizeExpression, pushHistory, roundSignificant, type EvalOptions } from './logic';

const deg: EvalOptions = { angle: 'deg' };
const rad: EvalOptions = { angle: 'rad' };

function value(expr: string, opts: EvalOptions = deg): number {
  const r = evaluate(expr, opts);
  if (!r.ok) throw new Error(`${expr}: ${r.error}`);
  return r.value;
}

function error(expr: string, opts: EvalOptions = deg): string {
  const r = evaluate(expr, opts);
  if (r.ok) throw new Error(`${expr} unexpectedly = ${r.value}`);
  return r.error;
}

describe('basic arithmetic and precedence', () => {
  it.each([
    ['1+2', 3],
    ['2+3×4', 14],
    ['(2+3)×4', 20],
    ['10-4-3', 3],
    ['100÷10÷5', 2],
    ['8/4*2', 4],
    ['2*3+4*5', 26],
    ['7−2', 5],
    ['1,000+1', 1001],
    ['１２＋３', 15],
    ['3x4', 12],
    ['3 X (2)', 6],
  ])('%s = %d', (expr, expected) => {
    expect(value(expr)).toBe(expected);
  });

  it('hides binary floating point noise', () => {
    expect(value('0.1+0.2')).toBe(0.3);
    expect(value('1.1*3')).toBe(3.3);
    expect(value('0.3-0.1')).toBe(0.2);
    expect(formatResult(value('0.1+0.2'))).toBe('0.3');
  });

  it('accepts leading and trailing decimal points', () => {
    expect(value('.5+5.')).toBe(5.5);
  });
});

describe('unary minus and powers', () => {
  it.each([
    ['-3+5', 2],
    ['2*-3', -6],
    ['--4', 4],
    ['-(2+3)', -5],
    ['+7', 7],
    ['-2^2', -4],
    ['(-2)^2', 4],
    ['2^-1', 0.5],
    ['2^3^2', 512],
    ['2^10', 1024],
    ['3²', 9],
    ['2³', 8],
    ['-3²', -9],
    ['(-8)^(1/3)', -2],
    ['4^0.5', 2],
    ['2⁻¹', 0.5],
  ])('%s = %d', (expr, expected) => {
    expect(value(expr)).toBe(expected);
  });

  it('rejects even roots of negatives', () => {
    expect(error('(-4)^0.5')).toContain('負數');
  });
});

describe('implicit multiplication', () => {
  it.each([
    ['2(3+4)', 14],
    ['(1+1)(2+2)', 8],
    ['2π', roundSignificant(2 * Math.PI)],
    ['3e', roundSignificant(3 * Math.E)],
    ['2√9', 6],
    ['2sin(30)', 1],
    ['4!2', 48],
  ])('%s = %d', (expr, expected) => {
    expect(value(expr)).toBe(expected);
  });
});

describe('percent', () => {
  it('turns x% into x/100', () => {
    expect(value('50%')).toBe(0.5);
    expect(value('200×15%')).toBe(30);
    expect(value('80÷40%')).toBe(200);
  });

  it('adds or subtracts a percentage of the left side', () => {
    expect(value('100+10%')).toBe(110);
    expect(value('1200-25%')).toBe(900);
    expect(value('50+50+10%')).toBe(110);
  });
});

describe('factorial', () => {
  it('computes n!', () => {
    expect(value('5!')).toBe(120);
    expect(value('0!')).toBe(1);
    expect(value('3!!')).toBe(720);
    expect(factorial(170)).toBeGreaterThan(1e306);
  });

  it('rejects non-integers, negatives and overflow', () => {
    expect(error('2.5!')).toContain('整數');
    expect(error('(-1)!')).toContain('整數');
    expect(error('171!')).toContain('太大');
  });
});

describe('scientific functions', () => {
  it('uses degrees in DEG mode with exact special angles', () => {
    expect(value('sin(30)')).toBe(0.5);
    expect(value('sin30')).toBe(0.5);
    expect(value('cos(60)')).toBe(0.5);
    expect(value('sin(180)')).toBe(0);
    expect(value('cos(90)')).toBe(0);
    expect(value('cos(-180)')).toBe(-1);
    expect(value('tan(45)')).toBe(1);
    expect(value('tan(135)')).toBe(-1);
    expect(value('sin(30)^2+cos(30)^2')).toBe(1);
  });

  it('reports tan(90°) as undefined', () => {
    expect(error('tan(90)')).toContain('沒有定義');
    expect(error('tan(270)')).toContain('沒有定義');
  });

  it('uses radians in RAD mode', () => {
    expect(value('sin(π/2)', rad)).toBe(1);
    expect(value('sin(π)', rad)).toBe(0);
    expect(value('cos(π)', rad)).toBe(-1);
    expect(value('sin(1)', rad)).toBe(roundSignificant(Math.sin(1)));
    expect(error('tan(π/2)', rad)).toContain('沒有定義');
  });

  it('inverse trig returns degrees or radians', () => {
    expect(value('asin(0.5)')).toBe(30);
    expect(value('sin⁻¹(1)')).toBe(90);
    expect(value('acos(0)')).toBe(90);
    expect(value('atan(1)')).toBe(45);
    expect(value('atan(1)', rad)).toBe(roundSignificant(Math.PI / 4));
    expect(error('asin(2)')).toContain('-1 到 1');
  });

  it('logs and roots', () => {
    expect(value('log(1000)')).toBe(3);
    expect(value('ln(e)')).toBe(1);
    expect(value('ln(e^2)')).toBe(2);
    expect(value('√16')).toBe(4);
    expect(value('√(9+16)')).toBe(5);
    expect(value('sqrt(2)')).toBe(1.41421356237);
    expect(value('∛27')).toBe(3);
    expect(value('∛(-8)')).toBe(-2);
    expect(value('abs(-3)')).toBe(3);
    expect(error('log(0)')).toContain('大於 0');
    expect(error('ln(-1)')).toContain('大於 0');
    expect(error('√(-4)')).toContain('負數');
  });

  it('constants and Ans', () => {
    expect(value('π')).toBe(3.14159265359);
    expect(value('pi')).toBe(3.14159265359);
    expect(value('e')).toBe(2.71828182846);
    expect(value('Ans*2', { angle: 'deg', ans: 21 })).toBe(42);
    expect(value('ans+1')).toBe(1);
  });
});

describe('scientific notation', () => {
  it('reads uppercase E as an exponent and lowercase e as Euler’s number', () => {
    expect(value('1.5E3')).toBe(1500);
    expect(value('2E-3')).toBe(0.002);
    expect(value('2e')).toBe(roundSignificant(2 * Math.E));
  });

  it('round-trips formatted results', () => {
    const big = value('2^60');
    expect(formatResult(big)).toBe('1.15292150461E+18');
    expect(value(formatResult(big))).toBe(big);
    expect(formatResult(value('1/3'))).toBe('0.333333333333');
    expect(formatResult(1e-7)).toBe('1E-7');
    expect(formatResult(-0.000000123)).toBe('-1.23E-7');
    expect(formatResult(123456789012)).toBe('123456789012');
  });
});

describe('errors', () => {
  it.each([
    ['', '請輸入'],
    ['1/0', '除以 0'],
    ['1+', '不完整'],
    ['*2', '不完整'],
    ['(1+2))', '括號'],
    ['()', '沒有內容'],
    ['2$3', '無法辨識'],
    ['1.2.3', '小數點'],
    ['%', '缺少數值'],
    ['10^400', '超出'],
    ['0^-1', '除以 0'],
  ])('%s → %s', (expr, msg) => {
    expect(error(expr)).toContain(msg);
  });

  it('auto-closes missing right parentheses', () => {
    expect(value('(1+2')).toBe(3);
    expect(value('sin(30')).toBe(0.5);
    expect(value('2×(3+(4')).toBe(14);
  });

  it('never executes code', () => {
    expect(error('alert(1)')).toContain('無法辨識');
    expect(error('constructor')).toContain('無法辨識');
  });
});

describe('error codes (for localized messages)', () => {
  function code(expr: string, opts: EvalOptions = deg) {
    const r = evaluate(expr, opts);
    if (r.ok) throw new Error(`${expr} unexpectedly = ${r.value}`);
    return r;
  }

  it.each([
    ['', 'empty'],
    ['1/0', 'divideByZero'],
    ['1+', 'incomplete'],
    ['(1+2))', 'extraRightParen'],
    ['()', 'emptyParens'],
    ['1.2.3', 'multipleDots'],
    ['%', 'missingValueBeforeOperator'],
    ['10^400', 'tooLarge'],
    ['tan(90)', 'tanUndefined90'],
    ['2.5!', 'factorialDomain'],
    ['log(0)', 'logDomain'],
    ['√(-4)', 'sqrtNegative'],
    ['(-4)^0.5', 'negativeFractionalPower'],
  ] as const)('%s → %s', (expr, c) => {
    expect(code(expr).code).toBe(c);
  });

  it('carries template variables and keeps the zh-TW message', () => {
    const unknown = code('2$3');
    expect(unknown.code).toBe('unknownChar');
    expect(unknown.vars).toEqual({ ch: '$' });
    expect(unknown.error).toBe('無法辨識的字元「$」');
    const asin = code('asin(2)');
    expect(asin.code).toBe('inverseTrigDomain');
    expect(asin.vars).toEqual({ fn: 'sin⁻¹' });
    expect(asin.error).toBe('sin⁻¹ 的輸入必須介於 -1 到 1');
    expect(code('1/0').error).toBe(ERROR_MESSAGES.divideByZero);
  });
});

describe('formatting helpers', () => {
  it('normalizes display symbols', () => {
    expect(normalizeExpression('3 × 4 ÷ 2 − 1')).toBe('3*4/2-1');
    expect(normalizeExpression('2π')).toBe('2pi');
  });

  it('groups digits for display', () => {
    expect(groupDigits('1234567.891')).toBe('1,234,567.891');
    expect(groupDigits('-1000')).toBe('-1,000');
    expect(groupDigits('999')).toBe('999');
    expect(groupDigits('1.5E+20')).toBe('1.5E+20');
  });

  it('keeps a bounded, de-duplicated history', () => {
    let list = pushHistory([], { expr: '1+1', result: '2' });
    list = pushHistory(list, { expr: '1+1', result: '2' });
    expect(list).toHaveLength(1);
    for (let i = 0; i < 40; i++) list = pushHistory(list, { expr: `${i}`, result: `${i}` });
    expect(list).toHaveLength(30);
    expect(list[0].expr).toBe('39');
  });
});

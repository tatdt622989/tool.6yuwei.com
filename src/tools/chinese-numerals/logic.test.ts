import { describe, expect, it } from 'vitest';
import { amountToChinese, chineseToNumber, integerToChinese, numberToChinese, parseAmount } from './logic';

const upper = (s: string) => amountToChinese(s, { style: 'upper', prefix: false });

describe('integerToChinese (大寫)', () => {
  it.each([
    ['0', '零'],
    ['7', '柒'],
    ['10', '壹拾'],
    ['15', '壹拾伍'],
    ['100', '壹佰'],
    ['101', '壹佰零壹'],
    ['110', '壹佰壹拾'],
    ['1005', '壹仟零伍'],
    ['1050', '壹仟零伍拾'],
    ['10000', '壹萬'],
    ['10050', '壹萬零伍拾'],
    ['10500', '壹萬零伍佰'],
    ['100000', '壹拾萬'],
    ['105000', '壹拾萬伍仟'],
    ['1000005', '壹佰萬零伍'],
    ['12345678', '壹仟貳佰參拾肆萬伍仟陸佰柒拾捌'],
    ['100000001', '壹億零壹'],
    ['100010000', '壹億零壹萬'],
    ['230000000', '貳億參仟萬'],
    ['1000000000000', '壹兆'],
  ])('%s → %s', (n, s) => {
    expect(integerToChinese(n, 'upper')).toBe(s);
  });
});

describe('integerToChinese (小寫)', () => {
  it('uses 十 at the start and lowercase digits', () => {
    expect(integerToChinese('15', 'lower')).toBe('十五');
    expect(integerToChinese('100000', 'lower')).toBe('十萬');
    expect(integerToChinese('110', 'lower')).toBe('一百一十');
    expect(integerToChinese('2023', 'lower')).toBe('二千零二十三');
  });
});

describe('amountToChinese', () => {
  it('adds 元整 for whole amounts', () => {
    expect(upper('1,005')).toBe('壹仟零伍元整');
    expect(upper('100000')).toBe('壹拾萬元整');
    expect(upper('0')).toBe('零元整');
    expect(amountToChinese('36000', { style: 'upper', prefix: true })).toBe('新臺幣參萬陸仟元整');
  });
  it('handles 角 and 分', () => {
    expect(upper('12.5')).toBe('壹拾貳元伍角整');
    expect(upper('12.56')).toBe('壹拾貳元伍角陸分');
    expect(upper('12.06')).toBe('壹拾貳元零陸分');
    expect(upper('0.56')).toBe('伍角陸分');
    expect(upper('0.06')).toBe('陸分');
    expect(upper('12.00')).toBe('壹拾貳元整');
  });
  it('rounds to 分 and carries', () => {
    expect(upper('9.995')).toBe('壹拾元整');
    expect(upper('1.234')).toBe('壹元貳角參分');
  });
  it('accepts NT$, commas and full-width digits', () => {
    expect(upper('NT$１，２００')).toBe('壹仟貳佰元整');
  });
  it('rejects invalid input', () => {
    expect(upper('abc')).toBeNull();
    expect(upper('')).toBeNull();
    expect(upper('-5')).toBeNull();
    expect(upper('1'.repeat(17))).toBeNull();
  });
});

describe('numberToChinese', () => {
  it('reads decimals with 點', () => {
    expect(numberToChinese('3.14', 'lower')).toBe('三點一四');
    expect(numberToChinese('2026', 'upper')).toBe('貳仟零貳拾陸');
  });
});

describe('parseAmount', () => {
  it('strips leading zeros', () => {
    expect(parseAmount('007.5')).toEqual({ integer: '7', fraction: '5' });
    expect(parseAmount('.5')).toEqual({ integer: '0', fraction: '5' });
  });
});

describe('chineseToNumber', () => {
  it.each([
    ['壹仟零伍元整', '1005'],
    ['新臺幣壹拾萬元整', '100000'],
    ['十萬', '100000'],
    ['十五', '15'],
    ['一百一十', '110'],
    ['壹億零壹萬', '100010000'],
    ['貳億參仟萬', '230000000'],
    ['壹拾貳元伍角陸分', '12.56'],
    ['壹拾貳元零陸分', '12.06'],
    ['壹拾貳元伍角', '12.5'],
    ['伍角陸分', '0.56'],
    ['三點一四', '3.14'],
    ['兩千', '2000'],
    ['零', '0'],
  ])('%s → %s', (s, n) => {
    expect(chineseToNumber(s)).toBe(n);
  });
  it('round-trips random amounts', () => {
    for (const n of ['1', '10', '1001', '1010', '20304', '500600', '7000800', '99999999', '123456789012']) {
      expect(chineseToNumber(upper(n)!)).toBe(n);
      expect(chineseToNumber(integerToChinese(n, 'lower'))).toBe(n);
    }
  });
  it('rejects garbage', () => {
    expect(chineseToNumber('abc')).toBeNull();
    expect(chineseToNumber('')).toBeNull();
  });
});

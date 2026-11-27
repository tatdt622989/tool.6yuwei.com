import { describe, expect, it } from 'vitest';
import { calcInvoice, grossToNet, netToGross, RATE_SPLIT, roundDiv, taxFromGross, taxFromNet, type Line } from './logic';

describe('roundDiv', () => {
  it('rounds exactly without floating error', () => {
    expect(roundDiv(9800, 100, 'floor')).toBe(98);
    expect(roundDiv(9850, 100, 'round')).toBe(99); // .5 rounds up
    expect(roundDiv(9849, 100, 'round')).toBe(98);
    expect(roundDiv(9801, 100, 'ceil')).toBe(99);
    expect(roundDiv(9800, 100, 'ceil')).toBe(98);
  });
  it('keeps the sign and rounds the magnitude (refunds)', () => {
    expect(roundDiv(-9850, 100, 'floor')).toBe(-98);
    expect(roundDiv(-9850, 100, 'round')).toBe(-99);
    expect(roundDiv(-9801, 100, 'ceil')).toBe(-99);
    expect(Object.is(roundDiv(-1, 100, 'floor'), 0)).toBe(true);
  });
  it('rejects non-integers', () => {
    expect(roundDiv(1.5, 100, 'floor')).toBeNaN();
    expect(roundDiv(1, 0, 'floor')).toBeNaN();
  });
});

describe('rates', () => {
  it('splits into national and local tax', () => {
    expect(RATE_SPLIT[10].national + RATE_SPLIT[10].local).toBeCloseTo(10);
    expect(RATE_SPLIT[8].national + RATE_SPLIT[8].local).toBeCloseTo(8);
  });
});

describe('税抜 → 税込', () => {
  it('1,000円 → 1,100円 (10%) / 1,080円 (8%)', () => {
    expect(netToGross(1000, 10, 'floor')).toEqual({ net: 1000, tax: 100, gross: 1100 });
    expect(netToGross(1000, 8, 'floor')).toEqual({ net: 1000, tax: 80, gross: 1080 });
  });
  it('98円 (10%): tax 9.8 → 9 / 10 / 10', () => {
    expect(netToGross(98, 10, 'floor').gross).toBe(107);
    expect(netToGross(98, 10, 'round').gross).toBe(108);
    expect(netToGross(98, 10, 'ceil').gross).toBe(108);
  });
  it('198円 (8%): tax 15.84', () => {
    expect(taxFromNet(198, 8, 'floor')).toBe(15);
    expect(taxFromNet(198, 8, 'round')).toBe(16);
  });
});

describe('税込 → 税抜', () => {
  it('1,100円 (10%) → 1,000円 + 100円', () => {
    expect(grossToNet(1100, 10, 'floor')).toEqual({ net: 1000, tax: 100, gross: 1100 });
  });
  it('1,080円 (8%) → 1,000円 + 80円', () => {
    expect(grossToNet(1080, 8, 'floor')).toEqual({ net: 1000, tax: 80, gross: 1080 });
  });
  it('1,000円 (10%): tax = 1,000 × 10/110 = 90.90…', () => {
    expect(grossToNet(1000, 10, 'floor')).toEqual({ net: 910, tax: 90, gross: 1000 });
    expect(grossToNet(1000, 10, 'round')).toEqual({ net: 909, tax: 91, gross: 1000 });
  });
  it('1,000円 (8%): tax = 1,000 × 8/108 = 74.07…', () => {
    expect(taxFromGross(1000, 8, 'floor')).toBe(74);
    expect(taxFromGross(1000, 8, 'ceil')).toBe(75);
  });
  it('round trip of an exact price', () => {
    for (const net of [1, 9, 10, 99, 100, 1234, 98_765]) {
      for (const rate of [10, 8] as const) {
        const g = netToGross(net, rate, 'floor').gross;
        // Reversing is not always exact because of rounding, but stays within 1 yen.
        expect(Math.abs(grossToNet(g, rate, 'floor').net - net)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('インボイス (one rounding per rate per invoice)', () => {
  const lines: Line[] = [
    { name: '牛肉', price: 1280, qty: 1, rate: 8 },
    { name: '食パン', price: 198, qty: 3, rate: 8 },
    { name: 'ビール', price: 218, qty: 6, rate: 10 },
    { name: '洗剤', price: 398, qty: 1, rate: 10 },
  ];

  it('外税 (tax-exclusive prices), 切り捨て', () => {
    const r = calcInvoice(lines, 'exclusive', 'floor');
    // 10%: 1,308 + 398 = 1,706 → 170.6 → 170; 8%: 1,280 + 594 = 1,874 → 149.92 → 149
    expect(r.byRate).toEqual([
      { rate: 10, lines: 2, net: 1706, tax: 170, gross: 1876 },
      { rate: 8, lines: 2, net: 1874, tax: 149, gross: 2023 },
    ]);
    expect([r.net, r.tax, r.gross]).toEqual([3580, 319, 3899]);
    // Per-line rounding would give 130 + 39 + 102 + 47 = 318: one yen less.
    expect(r.perLineTax).toBe(318);
  });

  it('外税, 四捨五入', () => {
    const r = calcInvoice(lines, 'exclusive', 'round');
    expect(r.byRate.map((x) => x.tax)).toEqual([171, 150]);
    expect(r.gross).toBe(3901);
  });

  it('内税 (tax-inclusive prices), 切り捨て', () => {
    const r = calcInvoice(
      [
        { price: 540, qty: 2, rate: 8 }, // 1,080
        { price: 330, qty: 1, rate: 10 },
        { price: 1100, qty: 1, rate: 10 },
      ],
      'inclusive',
      'floor',
    );
    // 10%: 1,430 × 10/110 = 130; 8%: 1,080 × 8/108 = 80
    expect(r.byRate).toEqual([
      { rate: 10, lines: 2, net: 1300, tax: 130, gross: 1430 },
      { rate: 8, lines: 1, net: 1000, tax: 80, gross: 1080 },
    ]);
    expect(r.gross).toBe(2510);
  });

  it('handles a discount line and skips invalid lines', () => {
    const r = calcInvoice(
      [
        { price: 1000, qty: 1, rate: 10 },
        { price: -100, qty: 1, rate: 10 },
        { price: 1.5, qty: 1, rate: 10 },
        { price: 100, qty: -1, rate: 8 },
      ],
      'exclusive',
      'floor',
    );
    expect(r.byRate).toEqual([{ rate: 10, lines: 2, net: 900, tax: 90, gross: 990 }]);
  });

  it('is empty without lines', () => {
    expect(calcInvoice([], 'exclusive', 'floor')).toEqual({ byRate: [], net: 0, tax: 0, gross: 0, perLineTax: 0 });
  });
});

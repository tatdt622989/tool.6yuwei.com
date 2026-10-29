import { describe, expect, it } from 'vitest';
import {
  brokerFee,
  breakEvenPrice,
  calculateTrade,
  ceilToTick,
  netAt,
  nextTick,
  parseDiscount,
  taxRate,
  tickLadder,
  tickSize,
  ticksBetween,
  transactionTax,
  validateTrade,
  type TradeInput,
} from './logic';

const base: TradeInput = {
  buyPrice: 100,
  sellPrice: 110,
  shares: 1000,
  type: 'stock',
  dayTrade: false,
  discount: 1,
  minFee: 20,
};

describe('parseDiscount', () => {
  it('reads 折數 the way Taiwanese brokers write it', () => {
    expect(parseDiscount(2.8)).toBeCloseTo(0.28, 10);
    expect(parseDiscount(6)).toBeCloseTo(0.6, 10);
    expect(parseDiscount(6.5)).toBeCloseTo(0.65, 10);
    expect(parseDiscount(10)).toBe(1);
  });
  it('accepts ratios and two-digit discounts', () => {
    expect(parseDiscount(0.28)).toBe(0.28);
    expect(parseDiscount(28)).toBeCloseTo(0.28, 10);
    expect(parseDiscount(65)).toBeCloseTo(0.65, 10);
  });
  it('falls back to no discount for junk', () => {
    expect(parseDiscount(Number.NaN)).toBe(1);
    expect(parseDiscount(0)).toBe(1);
    expect(parseDiscount(-3)).toBe(1);
    expect(parseDiscount(150)).toBe(1);
  });
});

describe('brokerFee', () => {
  it('floors to integer: 1 張 102 元 → 145.35 → 145', () => {
    expect(brokerFee(102_000)).toBe(145);
  });
  it('applies the discount before flooring (玉山例：5 萬 × 0.1425% × 0.38 = 27.075 → 27)', () => {
    expect(brokerFee(50_000, 0.38)).toBe(27);
  });
  it('is immune to float error on exact values', () => {
    expect(brokerFee(200_000)).toBe(285);
    expect(brokerFee(1_000_000)).toBe(1425);
    expect(brokerFee(2_000_000, 0.6)).toBe(1710);
  });
  it('charges the minimum fee', () => {
    expect(brokerFee(9_000)).toBe(20); // 12.825 < 20
    expect(brokerFee(100, 1, 1)).toBe(1); // 零股 1 元低消
    expect(brokerFee(30_000, 1, 1)).toBe(42); // 42.75 → 42
  });
  it('charges nothing on a zero amount', () => {
    expect(brokerFee(0)).toBe(0);
  });
  it('treats a negative minimum as zero', () => {
    expect(brokerFee(100, 1, -5)).toBe(0);
  });
});

describe('taxRate / transactionTax', () => {
  it('uses the statutory rates', () => {
    expect(taxRate('stock', false)).toBe(0.003);
    expect(taxRate('stock', true)).toBe(0.0015);
    expect(taxRate('etf', false)).toBe(0.001);
    expect(taxRate('etf', true)).toBe(0.001); // ETF 當沖不再減半
    expect(taxRate('bond-etf', false)).toBe(0);
  });
  it('floors the tax to integer', () => {
    expect(transactionTax(102_000, 0.003)).toBe(306);
    expect(transactionTax(100_500, 0.003)).toBe(301); // 301.5
    expect(transactionTax(1_005_000, 0.0015)).toBe(1507); // 1507.5
    expect(transactionTax(100_000, 0)).toBe(0);
    expect(transactionTax(0, 0.003)).toBe(0);
  });
});

describe('tick sizes', () => {
  it('follows the TWSE stock table at each boundary', () => {
    expect(tickSize(9.99, 'stock')).toBe(0.01);
    expect(tickSize(10, 'stock')).toBe(0.05);
    expect(tickSize(49.95, 'stock')).toBe(0.05);
    expect(tickSize(50, 'stock')).toBe(0.1);
    expect(tickSize(100, 'stock')).toBe(0.5);
    expect(tickSize(500, 'stock')).toBe(1);
    expect(tickSize(1000, 'stock')).toBe(5);
  });
  it('uses the two-band ETF table', () => {
    expect(tickSize(49.99, 'etf')).toBe(0.01);
    expect(tickSize(50, 'etf')).toBe(0.05);
    expect(tickSize(150, 'bond-etf')).toBe(0.05);
  });
  it('rounds prices up onto the grid and crosses bands', () => {
    expect(ceilToTick(100.2, 'stock')).toBe(100.5);
    expect(ceilToTick(100.5, 'stock')).toBe(100.5);
    expect(ceilToTick(10.01, 'stock')).toBe(10.05);
    expect(nextTick(49.95, 'stock')).toBe(50);
    expect(nextTick(995, 'stock')).toBe(996);
    expect(nextTick(999, 'stock')).toBe(1000);
    expect(nextTick(1000, 'stock')).toBe(1005);
  });
  it('counts ticks across bands', () => {
    expect(ticksBetween(99.9, 100.5, 'stock')).toBe(2); // 99.9 → 100 → 100.5
    expect(ticksBetween(100, 100, 'stock')).toBe(0);
  });
});

describe('calculateTrade', () => {
  it('worked example: 1 張 100 買、110 賣、6 折', () => {
    const r = calculateTrade({ ...base, discount: 0.6 });
    expect(r.buyAmount).toBe(100_000);
    expect(r.buyFee).toBe(85); // 85.5
    expect(r.sellFee).toBe(94); // 94.05
    expect(r.tax).toBe(330);
    expect(r.totalCost).toBe(509);
    expect(r.buyPayable).toBe(100_085);
    expect(r.sellReceivable).toBe(109_576);
    expect(r.netProfit).toBe(9_491);
    expect(r.returnPct).toBeCloseTo((9_491 / 100_085) * 100, 10);
  });

  it('break-even at full fee: 100 元買進要賣到 101 元才不賠', () => {
    const r = calculateTrade(base);
    expect(r.breakEvenPrice).toBe(101);
    expect(r.breakEvenTicks).toBe(2);
    expect(netAt(base, 100.5)).toBe(-86);
    expect(netAt(base, 101)).toBe(412);
  });

  it('day trade 1 張 1,000 元：漲 1 檔 (5 元) 就回本', () => {
    const input: TradeInput = { ...base, buyPrice: 1000, sellPrice: 1005, dayTrade: true };
    const r = calculateTrade(input);
    expect(r.buyFee).toBe(1425);
    expect(r.sellFee).toBe(1432);
    expect(r.tax).toBe(1507);
    expect(r.netProfit).toBe(636);
    expect(r.breakEvenPrice).toBe(1005);
    expect(r.breakEvenTicks).toBe(1);
  });

  it('same trade without day-trade discount costs more tax', () => {
    const dt = calculateTrade({ ...base, dayTrade: true });
    const normal = calculateTrade(base);
    expect(normal.tax - dt.tax).toBe(165);
  });

  it('ETF: 0.1% tax, break-even on the 0.05 grid', () => {
    const input: TradeInput = { ...base, type: 'etf', buyPrice: 50, sellPrice: 50, shares: 1000 };
    const r = calculateTrade(input);
    expect(r.tax).toBe(50);
    expect(r.buyFee).toBe(71); // 71.25
    expect(r.netProfit).toBe(-192);
    // est = 50 × 1.001425 ÷ 0.997575 ≈ 50.193 → 50.2
    expect(r.breakEvenPrice).toBe(50.2);
    expect(netAt(input, 50.15)).toBeLessThan(0);
    expect(netAt(input, 50.2)).toBeGreaterThanOrEqual(0);
  });

  it('bond ETF pays no securities transaction tax', () => {
    const r = calculateTrade({ ...base, type: 'bond-etf', buyPrice: 30, sellPrice: 31 });
    expect(r.tax).toBe(0);
    expect(r.taxRate).toBe(0);
  });

  it('odd lot with 1 元 minimum: 10 股 × 10 元', () => {
    const r = calculateTrade({ ...base, buyPrice: 10, sellPrice: 10, shares: 10, minFee: 1 });
    expect(r.buyFee).toBe(1);
    expect(r.sellFee).toBe(1);
    expect(r.tax).toBe(0); // 0.3 → 0
    expect(r.netProfit).toBe(-2);
  });

  it('odd lot with a 20 元 minimum needs a big move to break even', () => {
    const input: TradeInput = { ...base, buyPrice: 10, sellPrice: 10, shares: 10, minFee: 20 };
    const be = breakEvenPrice(input);
    // 需賺回 40 元手續費 → 每股約多 4 元（價金 139.5 四捨五入為 140）
    expect(be).toBe(13.95);
    expect(netAt(input, be)).toBeGreaterThanOrEqual(0);
    expect(netAt(input, Math.round((be - tickSize(be - 1e-9, 'stock')) * 100) / 100)).toBeLessThan(0);
  });

  it('break-even is the lowest price that does not lose money across many inputs', () => {
    const prices = [8.5, 9.99, 23.45, 49.95, 66.6, 99.9, 350, 588, 999, 1085];
    for (const buyPrice of prices) {
      for (const discount of [1, 0.6, 0.28]) {
        for (const dayTrade of [false, true]) {
          const input: TradeInput = { ...base, buyPrice, discount, dayTrade };
          const be = breakEvenPrice(input);
          expect(netAt(input, be)).toBeGreaterThanOrEqual(0);
          const below = Math.round((be - tickSize(be - 1e-9, 'stock')) * 100) / 100;
          if (below >= buyPrice) expect(netAt(input, below)).toBeLessThan(0);
        }
      }
    }
  });

  it('a loss produces a negative return', () => {
    const r = calculateTrade({ ...base, sellPrice: 90 });
    expect(r.netProfit).toBeLessThan(0);
    expect(r.returnPct).toBeLessThan(-10);
  });

  it('selling at zero still computes (fees only on the buy side)', () => {
    const r = calculateTrade({ ...base, sellPrice: 0 });
    expect(r.sellFee).toBe(0);
    expect(r.tax).toBe(0);
    expect(r.netProfit).toBe(-r.buyPayable);
  });
});

describe('tickLadder', () => {
  it('starts at the buy price and climbs one tick per row', () => {
    const rows = tickLadder(base, 4);
    expect(rows.map((r) => r.price)).toEqual([100, 100.5, 101, 101.5, 102]);
    expect(rows[0].net).toBeLessThan(0);
    expect(rows[2].net).toBe(412);
  });
});

describe('validateTrade', () => {
  it('accepts a normal trade', () => {
    expect(validateTrade(base)).toBeNull();
  });
  it('rejects bad input', () => {
    expect(validateTrade({ ...base, buyPrice: 0 })).toMatch(/買進/);
    expect(validateTrade({ ...base, sellPrice: Number.NaN })).toMatch(/賣出/);
    expect(validateTrade({ ...base, shares: 0 })).toMatch(/股數/);
    expect(validateTrade({ ...base, shares: 1.5 })).toMatch(/整數/);
    expect(validateTrade({ ...base, minFee: -1 })).toMatch(/最低/);
    expect(validateTrade({ ...base, buyPrice: 1e10 })).toMatch(/過大/);
  });
});

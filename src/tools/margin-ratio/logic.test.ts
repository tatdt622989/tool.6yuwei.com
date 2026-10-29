import { describe, expect, it } from 'vitest';
import {
  MARGIN_RULES,
  accountMaintenance,
  calculateMargin,
  calculateShort,
  loanAmount,
  marginLadder,
  shortDeposit,
  shortLadder,
  validateMargin,
  validateShort,
  type MarginInput,
  type ShortInput,
} from './logic';

const margin: MarginInput = {
  buyPrice: 100,
  shares: 1000,
  loanRatioPct: 60,
  currentPrice: 100,
  interestRatePct: 6.45,
  days: 30,
  discount: 0.6,
  minFee: 20,
};

const short: ShortInput = {
  sellPrice: 100,
  shares: 1000,
  marginPct: 90,
  currentPrice: 100,
  borrowFeePct: 0.08,
  discount: 0.6,
  minFee: 20,
};

describe('rules', () => {
  it('uses the current FSC ratios', () => {
    expect(MARGIN_RULES.defaultLoanRatioPct).toBe(60);
    expect(MARGIN_RULES.defaultShortMarginPct).toBe(90);
    expect(MARGIN_RULES.callLinePct).toBe(130);
    expect(MARGIN_RULES.clearRecordPct).toBe(166);
  });
});

describe('loanAmount (未滿千元不予計算)', () => {
  it('drops the part under 1,000', () => {
    expect(loanAmount(100_000, 60)).toBe(60_000);
    expect(loanAmount(123_500, 60)).toBe(74_000); // 74,100
    expect(loanAmount(1_999, 60)).toBe(1_000); // 1,199.4
    expect(loanAmount(1_500, 60)).toBe(0); // 900
  });
  it('is immune to float error', () => {
    expect(loanAmount(55_000, 60)).toBe(33_000);
    expect(loanAmount(115_000, 60)).toBe(69_000);
  });
});

describe('shortDeposit (未滿百元以百元計)', () => {
  it('rounds up to the next 100', () => {
    expect(shortDeposit(100_000, 90)).toBe(90_000);
    expect(shortDeposit(123_450, 90)).toBe(111_200); // 111,105
    expect(shortDeposit(100_001, 90)).toBe(90_100);
  });
  it('supports a raised margin ratio', () => {
    expect(shortDeposit(100_000, 130)).toBe(130_000);
  });
});

describe('calculateMargin', () => {
  it('worked example: 1 張 100 元、融資 6 成', () => {
    const r = calculateMargin(margin);
    expect(r.amount).toBe(100_000);
    expect(r.loan).toBe(60_000);
    expect(r.buyFee).toBe(85);
    expect(r.ownFunds).toBe(40_085);
    expect(r.maintenancePct).toBeCloseTo(166.667, 3);
    expect(r.callPrice).toBeCloseTo(78, 10);
    expect(r.clearPrice).toBeCloseTo(99.6, 10);
    expect(r.dropToCallPct).toBeCloseTo(-22, 10);
    expect(r.interest).toBe(318); // 60,000 × 6.45% × 30 ÷ 365 = 318.08
    expect(r.status).toBe('safe');
  });

  it('net profit at the buy price is the round-trip cost plus interest', () => {
    const r = calculateMargin(margin);
    // 賣出手續費 85、證交稅 300、利息 318、買進手續費 85
    expect(r.equityAfterSale).toBe(100_000 - 85 - 300 - 60_000 - 318);
    expect(r.netProfit).toBe(-(85 + 85 + 300 + 318));
  });

  it('leverage: a 10% rise is about a 25% return on own funds', () => {
    const r = calculateMargin({ ...margin, currentPrice: 110, days: 0 });
    expect(r.netProfit).toBe(110_000 - 94 - 330 - 60_000 - 40_085);
    expect(r.returnOnOwnPct).toBeGreaterThan(23);
    expect(r.returnOnOwnPct).toBeLessThan(25);
  });

  it('flags warning between 130% and 166%, and call below 130%', () => {
    expect(calculateMargin({ ...margin, currentPrice: 90 }).status).toBe('warning'); // 150%
    expect(calculateMargin({ ...margin, currentPrice: 78 }).status).toBe('warning'); // exactly 130%
    const r = calculateMargin({ ...margin, currentPrice: 75 });
    expect(r.maintenancePct).toBeCloseTo(125, 10);
    expect(r.status).toBe('call');
    expect(r.dropToCallPct).toBeGreaterThan(0);
  });

  it('call price does not depend on current price', () => {
    expect(calculateMargin({ ...margin, currentPrice: 50 }).callPrice).toBeCloseTo(78, 10);
  });

  it('上櫃 also 60%: same numbers; a cut ratio (處置股 5 成) raises the cushion', () => {
    const cut = calculateMargin({ ...margin, loanRatioPct: 50 });
    expect(cut.loan).toBe(50_000);
    expect(cut.maintenancePct).toBeCloseTo(200, 10);
    expect(cut.callPrice).toBeCloseTo(65, 10);
  });
});

describe('marginLadder', () => {
  it('maps maintenance levels to prices', () => {
    const rows = marginLadder(60_000, 1000, 100);
    const at = (lvl: number) => rows.find((r) => r.levelPct === lvl)!;
    expect(at(200).price).toBeCloseTo(120, 10);
    expect(at(166).price).toBeCloseTo(99.6, 10);
    expect(at(130).price).toBeCloseTo(78, 10);
    expect(at(100).price).toBeCloseTo(60, 10);
    expect(at(130).changePct).toBeCloseTo(-22, 10);
    expect(rows).toHaveLength(MARGIN_RULES.ladderLevels.length);
  });
});

describe('calculateShort', () => {
  it('worked example: 融券 1 張 100 元、保證金 9 成', () => {
    const r = calculateShort(short);
    expect(r.amount).toBe(100_000);
    expect(r.deposit).toBe(90_000);
    expect(r.sellFee).toBe(85);
    expect(r.tax).toBe(300);
    expect(r.borrowFee).toBe(80);
    expect(r.collateral).toBe(99_535);
    expect(r.maintenancePct).toBeCloseTo(189.535, 3);
    expect(r.callPrice).toBeCloseTo(189_535 / 1.3 / 1000, 10);
    expect(r.status).toBe('safe');
  });

  it('a price rise erodes the ratio and triggers a call', () => {
    const r = calculateShort({ ...short, currentPrice: 150 });
    expect(r.maintenancePct).toBeLessThan(130);
    expect(r.status).toBe('call');
    expect(r.netProfit).toBeLessThan(-50_000);
  });

  it('profit when the price falls', () => {
    const r = calculateShort({ ...short, currentPrice: 90 });
    // 100,000 − 90,000 − 85 − 300 − 80 − 回補手續費 76（76.95）
    expect(r.netProfit).toBe(10_000 - 85 - 300 - 80 - 76);
    expect(r.returnOnDepositPct).toBeCloseTo((r.netProfit / 90_000) * 100, 10);
  });
});

describe('shortLadder', () => {
  it('higher price means lower ratio', () => {
    const rows = shortLadder(189_535, 1000, 100);
    const at = (lvl: number) => rows.find((r) => r.levelPct === lvl)!;
    expect(at(130).price).toBeCloseTo(145.796, 3);
    expect(at(200).price).toBeLessThan(at(130).price);
  });
});

describe('accountMaintenance', () => {
  it('combines margin and short positions per 操作辦法第 53 條', () => {
    const m = calculateMargin(margin);
    const s = calculateShort(short);
    expect(accountMaintenance(m, s)).toBeCloseTo(((100_000 + 189_535) / 160_000) * 100, 10);
  });
  it('falls back to a single side', () => {
    const m = calculateMargin(margin);
    expect(accountMaintenance(m, null)).toBeCloseTo(m.maintenancePct, 10);
    expect(Number.isNaN(accountMaintenance(null, null))).toBe(true);
  });
});

describe('validation', () => {
  it('accepts defaults', () => {
    expect(validateMargin(margin)).toBeNull();
    expect(validateShort(short)).toBeNull();
  });
  it('rejects bad margin input', () => {
    expect(validateMargin({ ...margin, buyPrice: 0 })).toMatch(/買進價/);
    expect(validateMargin({ ...margin, shares: 1.5 })).toMatch(/整數/);
    expect(validateMargin({ ...margin, loanRatioPct: 0 })).toMatch(/成數/);
    expect(validateMargin({ ...margin, loanRatioPct: 120 })).toMatch(/成數/);
    expect(validateMargin({ ...margin, currentPrice: -1 })).toMatch(/目前股價/);
    expect(validateMargin({ ...margin, interestRatePct: -1 })).toMatch(/利率/);
    expect(validateMargin({ ...margin, days: -1 })).toMatch(/天數/);
    expect(validateMargin({ ...margin, shares: 10, buyPrice: 100 })).toMatch(/千元/);
    expect(validateMargin({ ...margin, discount: 0 })).toMatch(/折數/);
    expect(validateMargin({ ...margin, minFee: -1 })).toMatch(/最低/);
  });
  it('rejects bad short input', () => {
    expect(validateShort({ ...short, sellPrice: 0 })).toMatch(/賣出價/);
    expect(validateShort({ ...short, shares: 0 })).toMatch(/股數/);
    expect(validateShort({ ...short, shares: 2.5 })).toMatch(/整數/);
    expect(validateShort({ ...short, marginPct: 0 })).toMatch(/保證金/);
    expect(validateShort({ ...short, currentPrice: 0 })).toMatch(/目前股價/);
    expect(validateShort({ ...short, borrowFeePct: -0.1 })).toMatch(/手續費/);
  });
});

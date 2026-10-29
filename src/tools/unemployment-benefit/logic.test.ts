import { describe, expect, it } from 'vitest';
import {
  adjustForWorkIncome,
  availableMonths,
  averageInsured,
  benefitRatePct,
  calculateUnemployment,
  earlyEmploymentAllowance,
  entitlementMonths,
  missingEligibility,
  UNEMPLOYMENT_RULES,
  validateUnemployment,
  type UnemploymentInput,
} from './logic';

const base: UnemploymentInput = {
  insuredSalaries: [45_800],
  age: 35,
  disability: false,
  dependents: 0,
  history: 'first',
  usedMonths: 0,
};

describe('benefitRatePct', () => {
  it('60% + 每位眷屬 10%，最多 20%', () => {
    expect(benefitRatePct(0)).toBe(60);
    expect(benefitRatePct(1)).toBe(70);
    expect(benefitRatePct(2)).toBe(80);
    expect(benefitRatePct(5)).toBe(80);
  });
});

describe('entitlementMonths', () => {
  it('未滿 45 歲 6 個月；45 歲以上或身障 9 個月', () => {
    expect(entitlementMonths(44, false)).toBe(6);
    expect(entitlementMonths(45, false)).toBe(9);
    expect(entitlementMonths(30, true)).toBe(9);
  });
});

describe('availableMonths', () => {
  it('首次請領領完整期間', () => {
    expect(availableMonths(6, 'first')).toBe(6);
  });
  it('上次未領滿：合併計算，以給付期間為限', () => {
    expect(availableMonths(6, 'partial', 2)).toBe(4);
    expect(availableMonths(9, 'partial', 2)).toBe(7);
    expect(availableMonths(6, 'partial', 8)).toBe(0);
  });
  it('領滿後 2 年內再請領：原期間 1/2', () => {
    expect(availableMonths(6, 'reapply')).toBe(3);
    expect(availableMonths(9, 'reapply')).toBe(4.5);
  });
});

describe('averageInsured', () => {
  it('6 個月平均，超過上限 45,800 先截斷', () => {
    expect(UNEMPLOYMENT_RULES.maxInsuredSalary).toBe(45_800);
    expect(averageInsured([60_000, 60_000, 60_000, 60_000, 60_000, 60_000])).toEqual({ average: 45_800, capped: true });
    expect(averageInsured([45_800, 45_800, 45_800, 43_900, 43_900, 43_900])).toEqual({ average: 44_850, capped: false });
  });
});

describe('calculateUnemployment', () => {
  it('勞保局 FAQ 例：平均 38,000 元、2 名眷屬 → 每月 30,400 元', () => {
    const r = calculateUnemployment({ ...base, insuredSalaries: [38_000], dependents: 2 })!;
    expect(r.ratePct).toBe(80);
    expect(r.monthly).toBe(30_400);
  });
  it('最高級 45,800 元、無眷屬、35 歲：每月 27,480 元 × 6 = 164,880 元', () => {
    const r = calculateUnemployment(base)!;
    expect(r.monthly).toBe(27_480);
    expect(r.availableMonths).toBe(6);
    expect(r.total).toBe(164_880);
    expect(r.maxMonthly).toBe(27_480);
  });
  it('45 歲以上 9 個月 = 247,320 元', () => {
    expect(calculateUnemployment({ ...base, age: 45 })!.total).toBe(247_320);
  });
  it('最高可領：45,800 × 80% × 9 = 329,760 元', () => {
    const r = calculateUnemployment({ ...base, age: 50, dependents: 2 })!;
    expect(r.monthly).toBe(36_640);
    expect(r.total).toBe(329_760);
  });
  it('6 個月不同投保薪資', () => {
    const r = calculateUnemployment({ ...base, insuredSalaries: [45_800, 45_800, 45_800, 43_900, 43_900, 43_900] })!;
    expect(r.averageInsured).toBe(44_850);
    expect(r.monthly).toBe(26_910);
  });
  it('平均有小數時，月領四捨五入：177,800 × 70% ÷ 6 = 20,743.33', () => {
    const r = calculateUnemployment({
      ...base,
      insuredSalaries: [29_500, 29_500, 29_500, 29_500, 29_500, 30_300],
      dependents: 1,
    })!;
    expect(r.averageInsured).toBeCloseTo(29_633.333, 2);
    expect(r.monthly).toBe(20_743);
  });
  it('月薪高於上限時以 45,800 計', () => {
    const r = calculateUnemployment({ ...base, insuredSalaries: [60_000, 60_000, 60_000, 60_000, 60_000, 60_000] })!;
    expect(r.cappedSalaries).toBe(true);
    expect(r.monthly).toBe(27_480);
  });
  it('領滿 9 個月後 2 年內再請領：4.5 個月', () => {
    const r = calculateUnemployment({ ...base, age: 50, history: 'reapply' })!;
    expect(r.availableMonths).toBe(4.5);
    expect(r.total).toBe(123_660);
  });
  it('上次已領 2 個月：剩 4 個月', () => {
    const r = calculateUnemployment({ ...base, history: 'partial', usedMonths: 2 })!;
    expect(r.availableMonths).toBe(4);
    expect(r.total).toBe(109_920);
  });
});

describe('earlyEmploymentAllowance', () => {
  it('領 2 個月後再就業：剩餘 4 個月 × 50%', () => {
    expect(earlyEmploymentAllowance(27_480, 6, 2)).toEqual({ remainingMonths: 4, allowance: 54_960 });
  });
  it('還沒開始領就找到工作：全部 6 個月的一半', () => {
    expect(earlyEmploymentAllowance(20_000, 6, 0).allowance).toBe(60_000);
  });
  it('已領滿則為 0', () => {
    expect(earlyEmploymentAllowance(20_000, 6, 6)).toEqual({ remainingMonths: 0, allowance: 0 });
    expect(earlyEmploymentAllowance(20_000, 6, 7).allowance).toBe(0);
  });
  it('再請領 4.5 個月、已領 2 個月：2.5 個月', () => {
    expect(earlyEmploymentAllowance(20_000, 4.5, 2).allowance).toBe(25_000);
  });
});

describe('adjustForWorkIncome（就業保險法第 17 條）', () => {
  // 平均月投保薪資 30,000，失業給付 18,000，80% = 24,000
  it('工作收入加給付低於最低工資，不扣', () => {
    const r = adjustForWorkIncome(18_000, 30_000, 10_000);
    expect(r.deduction).toBe(0);
    expect(r.benefit).toBe(18_000);
    expect(r.cap).toBe(24_000);
  });
  it('超過平均月投保薪資 80% 的部分扣除', () => {
    const r = adjustForWorkIncome(18_000, 30_000, 20_000);
    expect(r.deduction).toBe(14_000);
    expect(r.benefit).toBe(4_000);
  });
  it('收入超過最低工資（2026 年 29,500），當月不得請領', () => {
    const r = adjustForWorkIncome(18_000, 30_000, 29_501);
    expect(r.disqualified).toBe(true);
    expect(r.benefit).toBe(0);
  });
  it('收入剛好等於最低工資仍可請領，但扣到 0', () => {
    const r = adjustForWorkIncome(18_000, 30_000, 29_500);
    expect(r.disqualified).toBe(false);
    expect(r.benefit).toBe(0);
  });
  it('2027 年最低工資 30,900', () => {
    const r = adjustForWorkIncome(18_000, 30_000, 30_000, 2027);
    expect(r.disqualified).toBe(false);
    expect(r.minWage).toBe(30_900);
    expect(adjustForWorkIncome(18_000, 30_000, 30_000, 2026).disqualified).toBe(true);
  });
  it('沒有工作收入不影響', () => {
    expect(adjustForWorkIncome(27_480, 45_800, 0).benefit).toBe(27_480);
  });
});

describe('missingEligibility', () => {
  it('列出未符合的條件', () => {
    expect(
      missingEligibility({ involuntary: true, insuredOneYear: true, registered: true, noOldAgeBenefit: true }),
    ).toEqual([]);
    expect(
      missingEligibility({ involuntary: false, insuredOneYear: true, registered: false, noOldAgeBenefit: true }),
    ).toEqual(['involuntary', 'registered']);
  });
});

describe('validateUnemployment', () => {
  it('rejects bad input', () => {
    expect(validateUnemployment({ ...base, insuredSalaries: [] })).not.toBeNull();
    expect(validateUnemployment({ ...base, insuredSalaries: [1, 2, 3] })).not.toBeNull();
    expect(validateUnemployment({ ...base, insuredSalaries: [0] })).not.toBeNull();
    expect(validateUnemployment({ ...base, insuredSalaries: [Number.NaN] })).not.toBeNull();
    expect(validateUnemployment({ ...base, insuredSalaries: [-1, 1, 1, 1, 1, 1] })).not.toBeNull();
    expect(validateUnemployment({ ...base, age: 14 })).not.toBeNull();
    expect(validateUnemployment({ ...base, age: 30.5 })).not.toBeNull();
    expect(validateUnemployment({ ...base, dependents: -1 })).not.toBeNull();
    expect(validateUnemployment({ ...base, history: 'partial', usedMonths: 10 })).not.toBeNull();
  });
  it('accepts normal input', () => {
    expect(validateUnemployment(base)).toBeNull();
    expect(calculateUnemployment({ ...base, age: 10 })).toBeNull();
  });
});

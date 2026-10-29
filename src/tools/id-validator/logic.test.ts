import { describe, expect, it } from 'vitest';
import { LETTER_CODES, LETTER_REGIONS, detectType, normalizeId, validateBatch, validateNationalId, validateUbn } from './logic';

describe('validateNationalId — 國民身分證', () => {
  it('accepts the textbook example A123456789', () => {
    const r = validateNationalId('A123456789');
    expect(r.valid).toBe(true);
    expect(r.kind).toBe('national');
    expect(r.gender).toBe('男');
    expect(r.region).toBe('臺北市');
    expect(r.sum).toBe(130);
    expect(r.steps.map((s) => s.weight)).toEqual([1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]);
  });

  it('normalizes case, full-width characters and spaces', () => {
    expect(normalizeId(' ａ１２３ 456-789 ')).toBe('A123456789');
    expect(validateNationalId('a123456789').valid).toBe(true);
  });

  it('reports the expected check digit when the last digit is wrong', () => {
    const r = validateNationalId('A123456788');
    expect(r.valid).toBe(false);
    expect(r.expectedCheckDigit).toBe(9);
    const failed = r.checks.find((c) => !c.ok)!;
    expect(failed.label).toContain('檢查碼');
    expect(failed.detail).toContain('應為 9');
  });

  it('detects female and the special letter codes (I=34, O=35, W=32, X=30, Y=31, Z=33)', () => {
    // Expected check digits worked out by hand from the weights.
    const female = validateNationalId('B200000000');
    expect(female.gender).toBe('女');
    expect(LETTER_CODES.I).toBe(34);
    expect(LETTER_CODES.O).toBe(35);
    const r = validateNationalId('I100000000');
    // I → 3×1 + 4×9 = 39, second digit 1×8 = 8 → partial 47, check digit 3.
    expect(r.expectedCheckDigit).toBe(3);
    expect(validateNationalId('I100000003').valid).toBe(true);
    expect(Object.keys(LETTER_REGIONS)).toHaveLength(26);
  });

  it('rejects malformed input with a specific reason', () => {
    expect(validateNationalId('A12345678').checks[0].detail).toContain('目前輸入 9 碼');
    expect(validateNationalId('1234567890').checks[0].detail).toContain('英文字母');
    expect(validateNationalId('A1234X6789').checks[0].detail).toContain('數字');
    const r = validateNationalId('A323456789');
    expect(r.valid).toBe(false);
    expect(r.checks.at(-1)!.label).toContain('第 2 碼');
  });
});

describe('validateNationalId — 居留證（統一證號）', () => {
  it('accepts new-format numbers with 8 or 9 as the second digit', () => {
    const probe = validateNationalId('A800000000');
    const id = `A80000000${probe.expectedCheckDigit}`;
    const r = validateNationalId(id);
    expect(r.valid).toBe(true);
    expect(r.kind).toBe('arc-new');
    expect(r.gender).toBe('男');
    // A → 1×1 + 0×9, 8×8 = 64 → partial 65 → check 5
    expect(id).toBe('A800000005');
    const f = validateNationalId('F900000000');
    expect(f.kind).toBe('arc-new');
    expect(f.gender).toBe('女');
  });

  it('handles old-format numbers whose second character is a letter A–D', () => {
    // A → 1, 0×9; C → 12 → units digit 2 × 8 = 16; digits 0… → partial 17 → check 3
    const r = validateNationalId('AC00000003');
    expect(r.valid).toBe(true);
    expect(r.kind).toBe('arc-old');
    expect(r.gender).toBe('男');
    expect(validateNationalId('AB00000000').gender).toBe('女');
    expect(validateNationalId('AE00000000').valid).toBe(false);
  });
});

describe('validateUbn — 統一編號', () => {
  // Examples from the 財政部財政資訊中心 notice on the check logic change.
  it('04595257: valid under both the old and new rule (sum 40)', () => {
    const r = validateUbn('04595257');
    expect(r.totals).toEqual([40]);
    expect(r.validNew).toBe(true);
    expect(r.validOld).toBe(true);
  });

  it('04595252: valid only under the new divisible-by-5 rule (sum 35)', () => {
    const r = validateUbn('04595252');
    expect(r.totals).toEqual([35]);
    expect(r.validNew).toBe(true);
    expect(r.validOld).toBe(false);
    expect(r.checks[2].detail).toContain('新號段');
  });

  it('7th digit 7: that position counts as 1 or 0', () => {
    const a = validateUbn('10458575');
    expect(a.seventhIsSeven).toBe(true);
    expect(a.totals).toEqual([21, 20]);
    expect(a.validOld).toBe(true);
    expect(a.validNew).toBe(true);

    const b = validateUbn('10458574');
    expect(b.totals).toEqual([20, 19]);
    expect(b.validOld).toBe(true);

    const c = validateUbn('10458570');
    expect(c.totals).toEqual([16, 15]);
    expect(c.validOld).toBe(false);
    expect(c.validNew).toBe(true);
  });

  it('computes product digit sums', () => {
    const r = validateUbn('04595257');
    expect(r.steps.map((s) => s.product)).toEqual([0, 8, 5, 18, 5, 4, 20, 7]);
    expect(r.steps.map((s) => s.digitSum)).toEqual([0, 8, 5, 9, 5, 4, 2, 7]);
  });

  it('rejects invalid numbers and formats', () => {
    expect(validateUbn('04595253').validNew).toBe(false);
    expect(validateUbn('1234567').checks[0].ok).toBe(false);
    expect(validateUbn('1234567A').checks[0].detail).toContain('數字');
  });
});

describe('batch validation', () => {
  it('detects the type of each line', () => {
    expect(detectType('04595257')).toBe('ubn');
    expect(detectType('A123456789')).toBe('id');
    expect(detectType('123')).toBe('ubn');
    const rows = validateBatch('A123456789\n\n04595252\nA123456788\n');
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.valid)).toEqual([true, true, false]);
    expect(rows[1].note).toContain('新制');
    expect(rows[2].note).toContain('檢查碼');
  });
});

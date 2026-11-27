// Checksum validation for Taiwan ID numbers. Validation only: nothing here generates numbers.
//
// 國民身分證統一編號／新式統一證號（居留證）：1 letter + 9 digits. The letter maps to a two-digit
// code; weights 1,9,8,7,6,5,4,3,2,1,1; the weighted sum must be divisible by 10.
//   Second digit: 1 male, 2 female (citizens); 8 male, 9 female (新式統一證號, issued from 2021-01-02,
//   內政部移民署 https://www.immigration.gov.tw/5382/5385/7244/7250/20406/180195/248661/cp_news).
//   舊式統一證號 (issued until 2021-01-01) used a second letter A–D, counted by the last digit of its code.
//
// 營利事業統一編號：8 digits, weights 1,2,1,2,1,2,4,1; add the digits of each product, then sum.
//   財政部財政資訊中心「營利事業統一編號檢查碼邏輯修正說明」
//   (https://www.fia.gov.tw/singlehtml/3?cntId=c4d9cff38c8642ef8872774ee9987283, 2021-12-22):
//   the sum must now be divisible by 5 (previously 10); systems had to switch by 2023-03-31 and new
//   numbers are issued from April 2023. If the 7th digit is 7 (7×4 = 28 → 2+8 = 10), that position
//   may count as 1 or 0, so the number is valid when either total passes.

export interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

/** Normalizes user input: full-width to half-width, drop spaces and dashes, uppercase. */
export function normalizeId(input: string): string {
  return input
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\s　\-–—_]/g, '')
    .toUpperCase();
}

/** Letter codes defined by 內政部 (note I, O, W, X, Y, Z are out of alphabetical order). */
export const LETTER_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18, K: 19, L: 20, M: 21,
  N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

/** 初次登記（領證）縣市. Letters marked 停發 are no longer assigned after the 2010 county mergers. */
export const LETTER_REGIONS: Record<string, string> = {
  A: '臺北市', B: '臺中市', C: '基隆市', D: '臺南市', E: '高雄市', F: '新北市（原臺北縣）',
  G: '宜蘭縣', H: '桃園市', I: '嘉義市', J: '新竹縣', K: '苗栗縣', L: '原臺中縣（已停發）',
  M: '南投縣', N: '彰化縣', O: '新竹市', P: '雲林縣', Q: '嘉義縣', R: '原臺南縣（已停發）',
  S: '原高雄縣（已停發）', T: '屏東縣', U: '花蓮縣', V: '臺東縣', W: '金門縣', X: '澎湖縣',
  Y: '原陽明山管理局（已停發）', Z: '連江縣',
};

export const ID_WEIGHTS = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1] as const;

export type IdKind = 'national' | 'arc-new' | 'arc-old';

export const ID_KIND_LABEL: Record<IdKind, string> = {
  national: '國民身分證統一編號',
  'arc-new': '新式統一證號（居留證）',
  'arc-old': '舊式統一證號（居留證）',
};

export interface IdStep {
  /** Source character(s) and the number that enters the sum. */
  source: string;
  digit: number;
  weight: number;
  product: number;
}

export interface IdResult {
  input: string;
  valid: boolean;
  kind: IdKind | null;
  gender: '男' | '女' | null;
  region: string | null;
  checks: Check[];
  steps: IdStep[];
  sum: number | null;
  /** Check digit that would make the first nine characters valid. */
  expectedCheckDigit: number | null;
}

function secondCharInfo(ch: string): { kind: IdKind; gender: '男' | '女'; value: number } | null {
  switch (ch) {
    case '1':
      return { kind: 'national', gender: '男', value: 1 };
    case '2':
      return { kind: 'national', gender: '女', value: 2 };
    case '8':
      return { kind: 'arc-new', gender: '男', value: 8 };
    case '9':
      return { kind: 'arc-new', gender: '女', value: 9 };
    case 'A':
    case 'C':
      return { kind: 'arc-old', gender: '男', value: LETTER_CODES[ch] % 10 };
    case 'B':
    case 'D':
      return { kind: 'arc-old', gender: '女', value: LETTER_CODES[ch] % 10 };
    default:
      return null;
  }
}

export function validateNationalId(raw: string): IdResult {
  const id = normalizeId(raw);
  const result: IdResult = {
    input: id,
    valid: false,
    kind: null,
    gender: null,
    region: null,
    checks: [],
    steps: [],
    sum: null,
    expectedCheckDigit: null,
  };
  const checks = result.checks;

  const formatOk = /^[A-Z][A-Z0-9]\d{8}$/.test(id);
  checks.push({
    label: '長度與格式',
    ok: formatOk,
    detail: formatOk
      ? '共 10 碼：第 1 碼英文字母，第 3 到 10 碼為數字。'
      : id.length !== 10
        ? `應為 10 碼，目前輸入 ${id.length} 碼。`
        : !/^[A-Z]/.test(id)
          ? '第 1 碼必須是英文字母 A–Z。'
          : '第 3 到 10 碼必須全部是數字。',
  });
  if (!formatOk) return result;

  const letter = id[0];
  result.region = LETTER_REGIONS[letter];
  checks.push({
    label: '第 1 碼（初次登記地）',
    ok: true,
    detail: `${letter} 代表 ${result.region}，換算數值為 ${LETTER_CODES[letter]}。`,
  });

  const second = secondCharInfo(id[1]);
  checks.push({
    label: '第 2 碼（性別與證件類別）',
    ok: second !== null,
    detail: second
      ? `${id[1]}：${second.gender}性，${ID_KIND_LABEL[second.kind]}。`
      : `「${id[1]}」不是有效值。身分證為 1（男）或 2（女），新式居留證為 8（男）或 9（女），舊式居留證為 A–D。`,
  });
  if (!second) return result;
  result.kind = second.kind;
  result.gender = second.gender;

  const code = LETTER_CODES[letter];
  const digits = [Math.floor(code / 10), code % 10, second.value, ...id.slice(2).split('').map(Number)];
  const sources = [`${letter}→${code} 的十位`, `${letter}→${code} 的個位`, second.kind === 'arc-old' ? `${id[1]}→${LETTER_CODES[id[1]]} 的個位` : id[1], ...id.slice(2).split('')];
  result.steps = digits.map((digit, i) => ({ source: sources[i], digit, weight: ID_WEIGHTS[i], product: digit * ID_WEIGHTS[i] }));
  const sum = result.steps.reduce((s, x) => s + x.product, 0);
  const partial = sum - digits[10];
  result.sum = sum;
  result.expectedCheckDigit = (10 - (partial % 10)) % 10;
  const ok = sum % 10 === 0;
  checks.push({
    label: '檢查碼（第 10 碼）',
    ok,
    detail: ok
      ? `加權總和 ${sum} 可被 10 整除，檢查碼 ${id[9]} 正確。`
      : `加權總和 ${sum} 不能被 10 整除；依前 9 碼計算，第 10 碼應為 ${result.expectedCheckDigit}，輸入的是 ${id[9]}。`,
  });
  result.valid = ok;
  return result;
}

export const UBN_WEIGHTS = [1, 2, 1, 2, 1, 2, 4, 1] as const;

export interface UbnStep {
  digit: number;
  weight: number;
  product: number;
  /** Tens digit + units digit of the product. */
  digitSum: number;
}

export interface UbnResult {
  input: string;
  validNew: boolean;
  validOld: boolean;
  checks: Check[];
  steps: UbnStep[];
  /** Totals to test; two when the 7th digit is 7 (that position counts as 1 or 0). */
  totals: number[];
  seventhIsSeven: boolean;
}

export function validateUbn(raw: string): UbnResult {
  const id = normalizeId(raw);
  const result: UbnResult = { input: id, validNew: false, validOld: false, checks: [], steps: [], totals: [], seventhIsSeven: false };
  const formatOk = /^\d{8}$/.test(id);
  result.checks.push({
    label: '長度與格式',
    ok: formatOk,
    detail: formatOk ? '共 8 碼數字。' : /\D/.test(id) ? '統一編號只能包含數字 0–9。' : `應為 8 碼，目前輸入 ${id.length} 碼。`,
  });
  if (!formatOk) return result;

  result.steps = id.split('').map((ch, i) => {
    const digit = Number(ch);
    const product = digit * UBN_WEIGHTS[i];
    return { digit, weight: UBN_WEIGHTS[i], product, digitSum: Math.floor(product / 10) + (product % 10) };
  });
  const total = result.steps.reduce((s, x) => s + x.digitSum, 0);
  result.seventhIsSeven = id[6] === '7';
  // 7×4 = 28 → 2+8 = 10: the 財政部 rule lets that position count as 1 (1+0) or 0.
  result.totals = result.seventhIsSeven ? [total - 9, total - 10] : [total];
  result.validNew = result.totals.some((t) => t % 5 === 0);
  result.validOld = result.totals.some((t) => t % 10 === 0);

  const totalsText = result.seventhIsSeven ? `${result.totals[0]} 或 ${result.totals[1]}` : String(total);
  result.checks.push({
    label: '新制：總和可被 5 整除（2023 年 4 月起）',
    ok: result.validNew,
    detail: result.validNew
      ? `總和 ${totalsText}${result.seventhIsSeven ? '，其中一個' : ''}可被 5 整除，符合現行檢查邏輯。`
      : `總和 ${totalsText} 不能被 5 整除，不是有效的統一編號。`,
  });
  result.checks.push({
    label: '舊制：總和可被 10 整除',
    ok: result.validOld,
    detail: result.validOld
      ? '同時符合舊制，2023 年以前配發的統一編號都屬於這一類。'
      : result.validNew
        ? '不符合舊制但符合新制，屬於 2023 年 4 月起陸續配發的新號段；舊版檢核程式會誤判為錯誤。'
        : `總和 ${totalsText} 也不能被 10 整除。`,
  });
  return result;
}

export type DetectedType = 'ubn' | 'id' | 'unknown';

/** Guesses which validator a pasted line is meant for (8 digits → 統一編號). */
export function detectType(raw: string): DetectedType {
  const id = normalizeId(raw);
  if (/^\d{8}$/.test(id)) return 'ubn';
  if (/^[A-Z]/.test(id)) return 'id';
  return id === '' ? 'unknown' : /^\d+$/.test(id) ? 'ubn' : 'id';
}

export interface BatchRow {
  input: string;
  type: DetectedType;
  valid: boolean;
  note: string;
}

export function validateBatch(text: string): BatchRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const type = detectType(line);
      if (type === 'ubn') {
        const r = validateUbn(line);
        const failed = r.checks.find((c) => !c.ok && c.label !== '舊制：總和可被 10 整除');
        return {
          input: r.input,
          type,
          valid: r.validNew,
          note: failed ? failed.detail : r.validOld ? '統一編號有效' : '統一編號有效（新制號段）',
        };
      }
      const r = validateNationalId(line);
      const failed = r.checks.find((c) => !c.ok);
      return {
        input: r.input,
        type,
        valid: r.valid,
        note: failed ? `${failed.label}：${failed.detail}` : `${ID_KIND_LABEL[r.kind!]}有效，${r.gender}性`,
      };
    });
}

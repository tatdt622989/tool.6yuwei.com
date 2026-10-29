import { defineToolI18n } from '../../i18n/tool';
import type { Strength } from './logic';

export interface Strings {
  outputAria: string;
  copy: string;
  regenerate: string;
  /** Text around the length number: `${lengthBefore}<output>16</output>${lengthAfter}`. */
  lengthBefore: string;
  lengthAfter: string;
  setsLegend: string;
  upper: string;
  lower: string;
  digits: string;
  symbols: string;
  excludeAmbiguous: string;
  batchLabel: string;
  batch: string;
  copyAll: string;
  client: {
    strengthLabels: Record<Strength, string>;
    /** {label} {bits} */
    strength: string;
    noSets: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    outputAria: '產生的密碼',
    copy: '複製',
    regenerate: '重新產生',
    lengthBefore: '長度：',
    lengthAfter: ' 個字元',
    setsLegend: '字元類型',
    upper: '大寫字母 A–Z',
    lower: '小寫字母 a–z',
    digits: '數字 0–9',
    symbols: '符號 !@#$%',
    excludeAmbiguous: '排除易混淆字元（0 O l 1 I）',
    batchLabel: '一次產生多組',
    batch: '產生 10 組',
    copyAll: '複製全部',
    client: {
      strengthLabels: { weak: '弱', fair: '普通', strong: '強', 'very-strong': '非常強' },
      strength: '強度：{label}（約 {bits} 位元熵）',
      noSets: '請至少勾選一種字元類型',
    },
  },
  en: {
    outputAria: 'Generated password',
    copy: 'Copy',
    regenerate: 'Regenerate',
    lengthBefore: 'Length: ',
    lengthAfter: ' characters',
    setsLegend: 'Character types',
    upper: 'Uppercase A–Z',
    lower: 'Lowercase a–z',
    digits: 'Numbers 0–9',
    symbols: 'Symbols !@#$%',
    excludeAmbiguous: 'Exclude look-alikes (0 O l 1 I)',
    batchLabel: 'Generate several at once',
    batch: 'Generate 10',
    copyAll: 'Copy all',
    client: {
      strengthLabels: { weak: 'Weak', fair: 'Fair', strong: 'Strong', 'very-strong': 'Very strong' },
      strength: 'Strength: {label} (~{bits} bits of entropy)',
      noSets: 'Select at least one character type',
    },
  },
  ja: {
    outputAria: '生成されたパスワード',
    copy: 'コピー',
    regenerate: '再生成',
    lengthBefore: '長さ：',
    lengthAfter: ' 文字',
    setsLegend: '使用する文字',
    upper: '英大文字 A–Z',
    lower: '英小文字 a–z',
    digits: '数字 0–9',
    symbols: '記号 !@#$%',
    excludeAmbiguous: '紛らわしい文字を除外（0 O l 1 I）',
    batchLabel: 'まとめて生成',
    batch: '10 個生成',
    copyAll: 'すべてコピー',
    client: {
      strengthLabels: { weak: '弱い', fair: '普通', strong: '強い', 'very-strong': 'とても強い' },
      strength: '強度：{label}（約 {bits} ビット）',
      noSets: '使用する文字の種類を 1 つ以上選んでください',
    },
  },
});

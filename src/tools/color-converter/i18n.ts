import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  /** [key, label] for the white / black text preview cards. */
  cards: [string, string][];
  pickerAria: string;
  inputLabel: string;
  placeholder: string;
  parseError: string;
  copy: string;
  contrastTitle: string;
  sampleBody: string;
  contrastLabel: string;
  contrastNote: string;
  client: {
    largeSuffix: string;
    pass: string;
    fail: string;
    gamut: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    cards: [
      ['white', '白色文字'],
      ['black', '黑色文字'],
    ],
    pickerAria: '用調色盤選擇顏色',
    inputLabel: '輸入任意色碼',
    placeholder: '#2456e3、rgb(36, 86, 227)、hsl(224, 77%, 52%)',
    parseError: '無法辨識這個色碼。支援 HEX、rgb()、hsl() 與 oklch() 格式。',
    copy: '複製',
    contrastTitle: '對比度檢查（WCAG 2）',
    sampleBody: '一般大小的內文範例',
    contrastLabel: '對比度',
    contrastNote:
      '一般文字需達 AA 4.5:1、AAA 7:1；大字（18pt 以上，或 14pt 以上粗體）需達 AA 3:1、AAA 4.5:1。半透明色會以疊在白色背景上的結果計算。',
    client: {
      largeSuffix: ' 大字',
      pass: '通過',
      fail: '未通過',
      gamut: '這個 OKLCH 顏色超出 sRGB 色域，已裁切為可顯示的顏色，轉換結果會略有差異。',
    },
  },
  en: {
    cards: [
      ['white', 'White text'],
      ['black', 'Black text'],
    ],
    pickerAria: 'Pick a color',
    inputLabel: 'Enter any color code',
    placeholder: '#2456e3, rgb(36, 86, 227), hsl(224, 77%, 52%)',
    parseError: 'Couldn’t read that color. Use HEX, rgb(), hsl() or oklch().',
    copy: 'Copy',
    contrastTitle: 'Contrast checker (WCAG 2)',
    sampleBody: 'Sample body text at normal size',
    contrastLabel: 'contrast ratio',
    contrastNote:
      'Normal text needs 4.5:1 for AA and 7:1 for AAA. Large text (18pt and up, or 14pt bold) needs 3:1 for AA and 4.5:1 for AAA. Semi-transparent colors are measured as laid over a white background.',
    client: {
      largeSuffix: ' large',
      pass: 'pass',
      fail: 'fail',
      gamut: 'This OKLCH color is outside the sRGB gamut, so it was clipped to the nearest displayable color. Conversions are approximate.',
    },
  },
  ja: {
    cards: [
      ['white', '白い文字'],
      ['black', '黒い文字'],
    ],
    pickerAria: 'カラーピッカーで色を選ぶ',
    inputLabel: 'カラーコードを入力',
    placeholder: '#2456e3、rgb(36, 86, 227)、hsl(224, 77%, 52%)',
    parseError: 'カラーコードを読み取れません。HEX、rgb()、hsl()、oklch() の形式に対応しています。',
    copy: 'コピー',
    contrastTitle: 'コントラスト比チェック（WCAG 2）',
    sampleBody: '本文サイズのテキスト見本',
    contrastLabel: 'コントラスト比',
    contrastNote:
      '通常の文字は AA で 4.5:1、AAA で 7:1 以上、大きな文字（18pt 以上、または 14pt 以上の太字）は AA で 3:1、AAA で 4.5:1 以上が必要です。半透明の色は白い背景に重ねた状態で計算します。',
    client: {
      largeSuffix: ' 大きな文字',
      pass: '適合',
      fail: '不適合',
      gamut: 'この OKLCH の色は sRGB の色域外のため、表示できる最も近い色に補正しました。変換結果は近似値です。',
    },
  },
});

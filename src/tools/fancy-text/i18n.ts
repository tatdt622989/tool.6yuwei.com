import { defineToolI18n } from '../../i18n/tool';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  note: string;
  copy: string;
  /** Display name per style id (see STYLES in logic.ts). */
  names: Record<string, string>;
  client: {
    /** Convert full-width letters and digits (typed with a Japanese IME) to ASCII before styling. */
    halfwidthInput?: boolean;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '輸入英文或數字',
    placeholder: '例如：your name、IG 帳號、Threads 簽名',
    note: '特殊字體只支援英文字母 A–Z、a–z 與數字，中文、日文與表情符號會保持原樣。',
    copy: '複製',
    names: {
      bold: '粗體',
      italic: '斜體',
      'bold-italic': '粗斜體',
      script: '草寫體（花體）',
      'bold-script': '粗草寫體',
      fraktur: '哥德體（Fraktur）',
      'bold-fraktur': '粗哥德體',
      'double-struck': '空心體（雙線體）',
      sans: '無襯線體',
      'sans-bold': '無襯線粗體',
      'sans-italic': '無襯線斜體',
      'sans-bold-italic': '無襯線粗斜體',
      monospace: '等寬體（打字機）',
      circled: '圓圈字',
      'negative-circled': '實心圓圈字',
      squared: '方框字',
      parenthesized: '括號字',
      'small-caps': '小型大寫',
      superscript: '上標小字',
      fullwidth: '全形寬字',
      strike: '刪除線',
      underline: '底線',
      'double-underline': '雙底線',
      slash: '斜線劃掉',
      'upside-down': '上下顛倒',
    },
    client: {},
  },
  en: {
    inputLabel: 'Type your text',
    placeholder: 'Your name, bio line or Discord nickname',
    note: 'Fancy fonts only exist for the letters A–Z, a–z and the digits 0–9. Emoji, accented letters and other scripts stay as they are.',
    copy: 'Copy',
    names: {
      bold: 'Bold',
      italic: 'Italic',
      'bold-italic': 'Bold italic',
      script: 'Cursive script',
      'bold-script': 'Bold cursive',
      fraktur: 'Gothic (Fraktur)',
      'bold-fraktur': 'Bold Gothic',
      'double-struck': 'Double-struck',
      sans: 'Sans-serif',
      'sans-bold': 'Sans-serif bold',
      'sans-italic': 'Sans-serif italic',
      'sans-bold-italic': 'Sans bold italic',
      monospace: 'Monospace',
      circled: 'Bubble',
      'negative-circled': 'Black bubble',
      squared: 'Squares',
      parenthesized: 'Parenthesized',
      'small-caps': 'Small caps',
      superscript: 'Tiny text',
      fullwidth: 'Wide (vaporwave)',
      strike: 'Strikethrough',
      underline: 'Underline',
      'double-underline': 'Double underline',
      slash: 'Slashed',
      'upside-down': 'Upside down',
    },
    client: {},
  },
  ja: {
    inputLabel: '英字・数字を入力',
    placeholder: '例：名前、インスタのプロフィール、X の名前',
    note: '変換できるのは英字（A–Z、a–z）と数字だけです。全角英数字は半角にしてから変換し、ひらがな・カタカナ・漢字や絵文字はそのまま表示されます。',
    copy: 'コピー',
    names: {
      bold: '太字',
      italic: '斜体（イタリック）',
      'bold-italic': '太字斜体',
      script: '筆記体',
      'bold-script': '太字筆記体',
      fraktur: 'ドイツ文字（フラクトゥール）',
      'bold-fraktur': '太字ドイツ文字',
      'double-struck': '袋文字（黒板太字）',
      sans: 'サンセリフ',
      'sans-bold': 'サンセリフ太字',
      'sans-italic': 'サンセリフ斜体',
      'sans-bold-italic': 'サンセリフ太字斜体',
      monospace: '等幅（タイプライター）',
      circled: '丸囲み文字',
      'negative-circled': '黒丸囲み文字',
      squared: '四角囲み文字',
      parenthesized: '括弧付き文字',
      'small-caps': 'スモールキャピタル',
      superscript: '上付き小文字',
      fullwidth: '全角',
      strike: '取り消し線',
      underline: '下線',
      'double-underline': '二重下線',
      slash: '斜線',
      'upside-down': '上下反転',
    },
    client: { halfwidthInput: true },
  },
});

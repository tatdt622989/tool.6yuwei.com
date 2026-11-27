// UI strings for the typing test. Each locale also picks which test languages it offers (`client.langs`,
// first = default): zh-TW offers Chinese + English, en offers English only, ja offers Japanese romaji
// typing + English.
import { defineToolI18n } from '../../i18n/tool';
import type { Lang } from './logic';

/** Per test-language strings, in the page's locale. */
export interface LangStrings {
  /** Label on the language switch. */
  option: string;
  /** Name used inside sentences (results, bests table). */
  name: string;
  /** `lang` attribute for the passage and input. */
  tag: string;
  /** Speed unit: 字/分, WPM, 打鍵/分. */
  unit: string;
  inputLabel: string;
  placeholder: string;
  hint: string;
  /** Result cell label for correct characters / keystrokes. */
  correctLabel: string;
  /** Result cell label for the last stat: {cpm} (en: raw WPM, zh: uncorrected, ja: sentences done). */
  extraLabel: string;
}

export type DurationKey = '30' | '60' | '120';

export interface Strings {
  langAria: string;
  durAria: string;
  /** Duration switch and bests table headers. */
  durLabels: Record<DurationKey, string>;
  punct: string;
  clockLabel: string;
  accLabel: string;
  errLabel: string;
  passageAria: string;
  restart: string;
  newText: string;
  resultTitle: string;
  record: string;
  errorsLabel: string;
  again: string;
  copyResult: string;
  bestsLabel: string;
  thMode: string;
  /** Japanese mode only (ja locale). */
  ja?: {
    boxAria: string;
  };
  client: {
    /** Test languages this locale offers; the first is the default. */
    langs: Lang[];
    lang: Partial<Record<Lang, LangStrings>>;
    /** Duration as used in sentences. */
    durPhrase: Record<DurationKey, string>;
    /** {lang} {s} {dur} */
    resultTitle: string;
    /** {lang} {s} {dur} {speed} {unit} {acc} {date} */
    best: string;
    /** {lang} {s} {dur} {speed} {unit} {acc} */
    summary: string;
    /** {lang} {unit} */
    bestRow: string;
    /** {acc} {date} */
    bestTitle: string;
    /** Six rank labels, slowest first. */
    ranks: string[];
    /** Japanese mode: shown when kana arrive instead of romaji (IME is on). */
    imeWarning?: string;
  };
}

const zhLang: Record<'zh' | 'en', LangStrings> = {
  zh: {
    option: '中文',
    name: '中文',
    tag: 'zh-Hant',
    unit: '字/分',
    inputLabel: '在這裡輸入（打下第一個字就開始計時）',
    placeholder: '照著上方文章輸入，可使用注音、倉頡、拼音或嘸蝦米輸入法',
    hint: '選字中的注音或字根不會被計算，送出（選定）的字才算數；按 Esc 可重新開始。',
    correctLabel: '正確字數',
    extraLabel: '未修正錯字',
  },
  en: {
    option: 'English',
    name: '英文',
    tag: 'en',
    unit: 'WPM',
    inputLabel: '在這裡輸入（打下第一個字就開始計時）',
    placeholder: 'Type the text above. Timer starts on your first key.',
    hint: '大小寫與標點都要正確；按 Esc 可重新開始。',
    correctLabel: '正確字元',
    extraLabel: '原始速度 WPM（CPM {cpm}）',
  },
};

export default defineToolI18n<Strings>({
  'zh-TW': {
    langAria: '測驗語言',
    durAria: '測驗時間',
    durLabels: { '30': '30 秒', '60': '60 秒', '120': '120 秒' },
    punct: '含標點符號',
    clockLabel: '剩餘時間',
    accLabel: '正確率',
    errLabel: '錯誤',
    passageAria: '測驗文章，請照著輸入',
    restart: '重新開始',
    newText: '換一篇文章',
    resultTitle: '測驗結果',
    record: '新紀錄',
    errorsLabel: '錯誤次數（含已修正）',
    again: '再測一次',
    copyResult: '複製成績',
    bestsLabel: '你的最佳紀錄（只存在這台裝置）',
    thMode: '模式',
    client: {
      langs: ['zh', 'en'],
      lang: zhLang,
      durPhrase: { '30': '30 秒', '60': '60 秒', '120': '120 秒' },
      resultTitle: '{lang} {s} 秒測驗結果',
      best: '{lang} {s} 秒最佳紀錄：{speed} {unit}，正確率 {acc}%（{date}）',
      summary: '我的{lang}打字速度：{speed} {unit}，正確率 {acc}%（{s} 秒測驗）',
      bestRow: '{lang}（{unit}）',
      bestTitle: '正確率 {acc}%，{date}',
      ranks: ['起步練習中', '入門', '熟練', '快手', '高手', '神速'],
    },
  },
  en: {
    langAria: 'Test language',
    durAria: 'Test length',
    durLabels: { '30': '30 sec', '60': '1 min', '120': '2 min' },
    punct: 'Include punctuation',
    clockLabel: 'Time left',
    accLabel: 'Accuracy',
    errLabel: 'Errors',
    passageAria: 'Test text. Type it below',
    restart: 'Restart',
    newText: 'New text',
    resultTitle: 'Your result',
    record: 'New best',
    errorsLabel: 'Errors (incl. corrected)',
    again: 'Try again',
    copyResult: 'Copy result',
    bestsLabel: 'Your best scores (saved on this device only)',
    thMode: 'Test',
    client: {
      langs: ['en'],
      lang: {
        en: {
          option: 'English',
          name: 'English',
          tag: 'en',
          unit: 'WPM',
          inputLabel: 'Type here (the timer starts on your first key)',
          placeholder: 'Type the text above, exactly as shown',
          hint: 'Capitals and punctuation count. Backspace to fix mistakes. Press Esc to restart.',
          correctLabel: 'Correct characters',
          extraLabel: 'Raw WPM (CPM {cpm})',
        },
      },
      durPhrase: { '30': '30-second', '60': '1-minute', '120': '2-minute' },
      resultTitle: '{dur} test result',
      best: 'Your {dur} best: {speed} {unit} at {acc}% accuracy ({date})',
      summary: 'I type {speed} {unit} with {acc}% accuracy ({dur} typing test)',
      bestRow: '{lang} ({unit})',
      bestTitle: '{acc}% accuracy, {date}',
      ranks: ['Getting started', 'Beginner', 'Average', 'Fast', 'Very fast', 'Lightning'],
    },
  },
  ja: {
    langAria: 'テストの言語',
    durAria: '制限時間',
    durLabels: { '30': '30 秒', '60': '1 分', '120': '2 分' },
    punct: '句読点を含める',
    clockLabel: '残り時間',
    accLabel: '正確率',
    errLabel: 'ミス',
    passageAria: '課題文。下の入力欄に入力してください',
    restart: 'やり直す',
    newText: '別の文章にする',
    resultTitle: 'テスト結果',
    record: '自己ベスト',
    errorsLabel: 'ミス（修正分を含む）',
    again: 'もう一度',
    copyResult: '結果をコピー',
    bestsLabel: '自己ベスト（この端末にだけ保存）',
    thMode: 'モード',
    ja: {
      boxAria: '課題文と読み、ローマ字の入力ガイド',
    },
    client: {
      langs: ['ja', 'en'],
      lang: {
        ja: {
          option: '日本語（ローマ字）',
          name: '日本語',
          tag: 'ja',
          unit: '打鍵/分',
          inputLabel: 'ここにローマ字で入力（最初のキーで計測開始）',
          placeholder: '日本語入力をオフ（半角英数）にして、ローマ字で入力',
          hint: 'し＝shi／si、ん＝nn、っ＝子音を重ねる（tte）など、一般的なローマ字の打ち方はどれでも正解です。Esc でやり直し。',
          correctLabel: '正しい打鍵数',
          extraLabel: '入力し終えた文',
        },
        en: {
          option: '英語',
          name: '英文',
          tag: 'en',
          unit: 'WPM',
          inputLabel: 'ここに入力（最初のキーで計測開始）',
          placeholder: '上の英文をそのとおりに入力',
          hint: '大文字・小文字や記号も正確に。Backspace で修正できます。Esc でやり直し。',
          correctLabel: '正しい文字数',
          extraLabel: '修正前の速度 WPM（CPM {cpm}）',
        },
      },
      durPhrase: { '30': '30 秒', '60': '1 分', '120': '2 分' },
      resultTitle: '{lang} {dur}テストの結果',
      best: '{lang} {dur}の自己ベスト：{speed} {unit}、正確率 {acc}%（{date}）',
      summary: '{lang}タイピング {dur}：{speed} {unit}、正確率 {acc}%',
      bestRow: '{lang}（{unit}）',
      bestTitle: '正確率 {acc}%、{date}',
      ranks: ['これから', '初級', '中級', '上級', '達人', '神速'],
      imeWarning: 'かなが入力されました。日本語入力をオフ（半角英数）にして、ローマ字で入力してください。',
    },
  },
});

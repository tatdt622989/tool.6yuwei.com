import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { LoremLang, LoremUnit } from './logic';

export interface Strings {
  langLabel: string;
  /** Text languages offered on this page; the first is the default. A single entry hides the picker. */
  langs: { value: LoremLang; label: string }[];
  unitLabel: string;
  units: Record<LoremUnit, string>;
  classicStart: string;
  htmlTags: string;
  outputLabel: string;
  copy: string;
  regenerate: string;
  client: {
    /** Label of the number field per unit. */
    countLabels: Record<LoremUnit, string>;
    /** Number field label for Lorem ipsum by characters (a maximum: output stops at a word boundary). */
    latinChars: string;
    /** Info line: character count, then (Lorem ipsum only) word count appended. */
    chars: PluralForms;
    words: PluralForms;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    langLabel: '語言',
    langs: [
      { value: 'zh', label: '中文假文' },
      { value: 'la', label: 'Lorem ipsum' },
    ],
    unitLabel: '產生方式',
    units: { paragraphs: '段落', sentences: '句子', words: '單字', chars: '字數' },
    classicStart: '以 Lorem ipsum dolor sit amet 開頭',
    htmlTags: '加上 <p> 標籤',
    outputLabel: '產生結果',
    copy: '複製文字',
    regenerate: '重新產生',
    client: {
      countLabels: { paragraphs: '段落數', sentences: '句數', words: '單字數', chars: '字數（含標點）' },
      latinChars: '字元數上限',
      chars: { other: '共 {n} 個字元' },
      words: { other: '、{n} 個單字' },
    },
  },
  en: {
    langLabel: 'Text',
    langs: [{ value: 'la', label: 'Lorem ipsum' }],
    unitLabel: 'Generate',
    units: { paragraphs: 'Paragraphs', sentences: 'Sentences', words: 'Words', chars: 'Characters' },
    classicStart: 'Start with “Lorem ipsum dolor sit amet”',
    htmlTags: 'Wrap in <p> tags',
    outputLabel: 'Placeholder text',
    copy: 'Copy text',
    regenerate: 'Regenerate',
    client: {
      countLabels: { paragraphs: 'Paragraphs', sentences: 'Sentences', words: 'Words', chars: 'Characters' },
      latinChars: 'Max characters',
      chars: { one: '{n} character', other: '{n} characters' },
      words: { one: ', {n} word', other: ', {n} words' },
    },
  },
  ja: {
    langLabel: '言語',
    langs: [
      { value: 'ja', label: '日本語' },
      { value: 'la', label: 'Lorem ipsum' },
    ],
    unitLabel: '生成単位',
    units: { paragraphs: '段落', sentences: '文', words: '単語', chars: '文字数' },
    classicStart: '「Lorem ipsum dolor sit amet」で始める',
    htmlTags: '<p> タグを付ける',
    outputLabel: '生成されたダミーテキスト',
    copy: 'コピー',
    regenerate: '再生成',
    client: {
      countLabels: { paragraphs: '段落数', sentences: '文の数', words: '単語数', chars: '文字数（句読点を含む）' },
      latinChars: '最大文字数',
      chars: { other: '{n} 文字' },
      words: { other: '・{n} 単語' },
    },
  },
});

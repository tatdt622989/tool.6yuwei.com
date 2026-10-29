// UI strings for the zodiac finder. The tool has a different focus per market, chosen by `mode`:
//   tw      星座 + 生肖 (zh-TW, the original page)
//   chinese Chinese zodiac by date of birth, switching at Lunar New Year (en)
//   eto     干支 (十干十二支) by birth year, switching on 1 January as in Japan (ja)
import { defineToolI18n } from '../../i18n/tool';

export type ZodiacMode = 'tw' | 'chinese' | 'eto';

export interface Strings {
  mode: ZodiacMode;
  /** zh-TW: 星座 + 生肖 page. */
  tw?: {
    dateLabel: string;
    statSign: string;
    statElement: string;
    statRuler: string;
    statAnimal: string;
    statNewYear: string;
    signTableTitle: string;
    signHeads: string[];
    /** Appended to the element name: 火 → 火象 */
    elementSuffix: string;
    animalTableTitle: string;
    animalHeads: string[];
    /** {m} {d} */
    yearNewYear: string;
    hint: string;
  };
  /** en: Chinese zodiac. */
  chinese?: {
    dateLabel: string;
    statAnimal: string;
    statElement: string;
    statGanzhi: string;
    tableTitle: string;
    tableHeads: string[];
    hint: string;
  };
  /** ja: 干支. */
  eto?: {
    yearLabel: string;
    statBranch: string;
    statStem: string;
    statToshi: string;
    statKanreki: string;
    tableTitle: string;
    tableHeads: string[];
    hint: string;
  };
  client: {
    /** Results that are empty before a valid input. */
    errorEmpty: string;
    tw?: {
      /** {sign} {animal} */
      main: string;
      /** {y} {m} {d} {w} */
      born: string;
      /** {ganzhi} {month} {day} */
      lunar: string;
      /** {start} {end} {english} */
      signLabel: string;
      /** {element} {modality} */
      element: string;
      /** {animal} {ganzhi} */
      animal: string;
      /** {year} {element} */
      animalLabel: string;
      animalOutOfRange: string;
      /** {y} */
      newYearLabel: string;
      /** {y} {m} {d} {animal} {naive} */
      beforeNewYear: string;
      /** {y} {sign} {term} */
      termSign: string;
      nearCusp: string;
    };
    chinese?: {
      animals: string[];
      /** 木火土金水 → names */
      elements: Record<string, string>;
      yang: string;
      yin: string;
      stemPinyin: string[];
      branchPinyin: string[];
      /** {animal} */
      main: string;
      /** {date} {element} {animal} */
      sub: string;
      /** {element} {yinyang} */
      element: string;
      /** {ganzhi} {pinyin} */
      ganzhi: string;
      /** {year} */
      newYearLabel: string;
      outOfRange: string;
      /** {year} {date} {animal} {naive} */
      beforeNewYear: string;
      /** {date} */
      onNewYear: string;
    };
    eto?: {
      stemKana: string[];
      branchKana: string[];
      animals: string[];
      /** {ganzhi} {kana} */
      main: string;
      /** {year} {wareki} {branch} {branchKana} */
      sub: string;
      /** {branch} {kana} */
      branch: string;
      /** {animal} */
      branchLabel: string;
      /** {stem} {kana} */
      stem: string;
      /** {element} {yinyang} */
      stemLabel: string;
      yang: string;
      yin: string;
      /** {year} */
      toshi: string;
      /** {age} */
      toshiLabel: string;
      /** {age} */
      toshiThisYear: string;
      /** {year} */
      kanreki: string;
      kanrekiLabel: string;
      /** {year} {wareki} */
      option: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    mode: 'tw',
    tw: {
      dateLabel: '出生日期（國曆／西元）',
      statSign: '星座',
      statElement: '元素・性質',
      statRuler: '守護星',
      statAnimal: '生肖',
      statNewYear: '當年春節',
      signTableTitle: '十二星座日期表',
      signHeads: ['星座', '日期', '元素', '性質', '守護星', '起始節氣'],
      elementSuffix: '象',
      animalTableTitle: '十二生肖年份對照表（括號內為該年春節日期）',
      animalHeads: ['生肖', '年份（農曆年，自春節起算）'],
      yearNewYear: '（{m}/{d}）',
      hint: '上升星座需要出生時間與出生地點才能計算，不在本工具範圍內；這裡查的是一般所說的太陽星座。',
    },
    client: {
      errorEmpty: '請選擇出生日期。',
      tw: {
        main: '{sign}・屬{animal}',
        born: '{y} 年 {m} 月 {d} 日（{w}）出生',
        lunar: '，農曆{ganzhi}年{month}{day}',
        signLabel: '星座（{start}–{end}，{english}）',
        element: '{element}象・{modality}',
        animal: '{animal}（{ganzhi}）',
        animalLabel: '生肖（農曆 {year} 年，五行屬{element}）',
        animalOutOfRange: '生肖（支援 1900/1/31 到 2100 年）',
        newYearLabel: '{y} 年春節（正月初一）',
        beforeNewYear:
          '你在 {y} 年春節（{m}/{d}）之前出生，農曆仍是前一年，所以生肖屬{animal}，不是依西元 {y} 年算的{naive}。',
        termSign:
          '依 {y} 年實際節氣，太陽在這天已進入{sign}（{term}當天）。生日在星座交界日，確切星座要看出生時間，建議兩個都參考。',
        nearCusp: '這天接近星座交界（前後一天就換星座），若出生時間接近午夜，星座可能不同。',
      },
    },
  },
  en: {
    mode: 'chinese',
    chinese: {
      dateLabel: 'Date of birth',
      statAnimal: 'Animal sign',
      statElement: 'Element',
      statGanzhi: 'Heavenly stem and earthly branch',
      tableTitle: 'Chinese zodiac years (Lunar New Year date in parentheses)',
      tableHeads: ['Animal', 'Years (each starts on Lunar New Year)'],
      hint: 'Lunar New Year dates follow China Standard Time (UTC+8). If you were born on the day before Lunar New Year in the Americas or Europe, it may already have been New Year’s Day in China; most people still go by their local birth date.',
    },
    client: {
      errorEmpty: 'Choose your date of birth.',
      chinese: {
        animals: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
        elements: { 木: 'Wood', 火: 'Fire', 土: 'Earth', 金: 'Metal', 水: 'Water' },
        yang: 'yang',
        yin: 'yin',
        stemPinyin: ['jiǎ', 'yǐ', 'bǐng', 'dīng', 'wù', 'jǐ', 'gēng', 'xīn', 'rén', 'guǐ'],
        branchPinyin: ['zǐ', 'chǒu', 'yín', 'mǎo', 'chén', 'sì', 'wǔ', 'wèi', 'shēn', 'yǒu', 'xū', 'hài'],
        main: 'Year of the {animal}',
        sub: 'Born {date}: you are a {element} {animal}.',
        element: '{element} ({yinyang})',
        ganzhi: '{ganzhi} ({pinyin})',
        newYearLabel: 'Lunar New Year {year}',
        outOfRange: 'Dates from January 31, 1900 to December 31, 2100 are supported.',
        beforeNewYear:
          'You were born before Lunar New Year on {date}, so you belong to the previous lunar year: your sign is the {animal}, not the {naive} that {year} is usually listed as.',
        onNewYear: 'You were born on Lunar New Year’s Day ({date}), the first day of your animal’s year.',
      },
    },
  },
  ja: {
    mode: 'eto',
    eto: {
      yearLabel: '生まれ年',
      statBranch: '十二支',
      statStem: '十干',
      statToshi: '年女・年男',
      statKanreki: '還暦',
      tableTitle: '干支早見表（十二支と生まれ年）',
      tableHeads: ['十二支', '生まれ年と干支'],
      hint: '日本では 1 月 1 日に干支が切り替わるため、1 月・2 月生まれの方もその年の干支になります。四柱推命や九星気学のように立春（2 月 4 日ごろ）で年を区切る占いでは、立春前の生まれは前年の干支として扱います。',
    },
    client: {
      errorEmpty: '生まれ年を選んでください。',
      eto: {
        stemKana: ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'],
        branchKana: ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'],
        animals: ['ネズミ', 'ウシ', 'トラ', 'ウサギ', 'リュウ（タツ）', 'ヘビ', 'ウマ', 'ヒツジ', 'サル', 'ニワトリ', 'イヌ', 'イノシシ'],
        main: '{ganzhi}（{kana}）',
        sub: '{year}年（{wareki}）生まれ・{branch}年（{branchKana}どし）',
        branch: '{branch}（{kana}）',
        branchLabel: '十二支（動物：{animal}）',
        stem: '{stem}（{kana}）',
        stemLabel: '十干（五行：{element}・{yinyang}）',
        yang: '陽',
        yin: '陰',
        toshi: '{year}年',
        toshiLabel: '次の年女・年男（満 {age} 歳）',
        toshiThisYear: '今年が年女・年男（満 {age} 歳）',
        kanreki: '{year}年',
        kanrekiLabel: '還暦（満 60 歳・生まれ年と同じ干支）',
        option: '{year}年（{wareki}）',
      },
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { RoundMode } from './logic';

export interface Strings {
  modeAria: string;
  modeEqual: string;
  modeItems: string;
  totalLabel: string;
  peopleLabel: string;
  itemsLabel: string;
  addPerson: string;
  sharedLabel: string;
  /** zh: 服務費; en: sales tax; ja: サービス料. Applied as a % of the subtotal. */
  serviceLabel: string;
  serviceHint: string;
  /** Tip field; omitted where tipping isn't customary (ja). */
  tip?: {
    label: string;
    hint: string;
    /** One-tap tip percentages (en). */
    presets?: number[];
    presetsAria?: string;
  };
  roundLabel: string;
  /** Rounding steps in minor units (see logic.ts `roundTo`), first one = exact. */
  roundOptions: { value: number; label: string }[];
  /** 端数の扱い (ja): round up and the organizer keeps the rest, or round down and the organizer pays. */
  roundMode?: { label: string; up: string; down: string };
  statSubtotal: string;
  statService: string;
  statTip?: string;
  statGrand: string;
  tableHead: [string, string, string, string, string];
  copyResult: string;
  client: {
    prefKey: string;
    /** Money template, e.g. '{n} 元', '${n}', '{n} 円'. */
    money: string;
    /** Minor-unit digits: 0 for TWD / JPY, 2 for USD. */
    digits: 0 | 2;
    /** Digits for plain-number cells (zh stats and table). */
    numDigits: number;
    /** Show stats as money (en / ja) or as plain numbers (zh). */
    statMoney: boolean;
    exactDigits: number;
    defaults: {
      mode: 'equal' | 'items';
      total: string;
      people: string;
      service: string;
      tip: string;
      roundTo: string;
      roundMode?: RoundMode;
      shared: string;
      persons: { name: string; amount: string }[];
    };
    nthPerson: string;
    amountPlaceholder: string;
    nameAria: string;
    amountAria: string;
    remove: string;
    errorEqual: string;
    errorItems: string;
    mainLabel: string;
    /** {unit} */
    labelRounded: string;
    labelRoundedDown?: string;
    /** {exact} */
    labelExact: string;
    /** {low} {high} */
    mainRange: string;
    /** {per} {n} {collected} {surplus} */
    noteSurplus: string;
    /** {per} {n} {collected} {shortfall} */
    noteShortfall?: string;
    /** {per} */
    noteRoundedExact: string;
    /** {total} {n} {extra} {rest} {high} {low} */
    noteUneven: string;
    /** {total} {n} {per} */
    noteEven: string;
    itemsMainLabel: PluralForms;
    itemsNote: string;
    /** {main} {label} {note} */
    summaryEqual: string;
    /** {total} */
    summaryTotal: string;
    /** {name} {pay} */
    summaryLine: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '分帳方式',
    modeEqual: '平均分攤',
    modeItems: '各付各的',
    totalLabel: '消費金額（元）',
    peopleLabel: '人數',
    itemsLabel: '每個人自己點的金額（元）',
    addPerson: '新增一人',
    sharedLabel: '共同分攤金額（合菜、飲料等，平均分給所有人）',
    serviceLabel: '服務費（%）',
    serviceHint: '台灣餐廳常見 10%，沒有收就填 0。',
    tip: { label: '小費（%，選填）', hint: '以消費金額計算，出國用餐時常用。' },
    roundLabel: '進位方式',
    roundOptions: [
      { value: 1, label: '精確到 1 元' },
      { value: 10, label: '每人進位到 10 元' },
    ],
    statSubtotal: '消費小計',
    statService: '服務費',
    statTip: '小費',
    statGrand: '應付總額（四捨五入）',
    tableHead: ['姓名', '個人', '共同分攤', '服務費＋小費', '應付'],
    copyResult: '複製分帳結果',
    client: {
      prefKey: 'split-bill',
      money: '{n} 元',
      digits: 0,
      numDigits: 2,
      statMoney: false,
      exactDigits: 2,
      defaults: {
        mode: 'equal',
        total: '3280',
        people: '4',
        service: '10',
        tip: '0',
        roundTo: '1',
        shared: '600',
        persons: [
          { name: '小明', amount: '320' },
          { name: '小華', amount: '450' },
          { name: '小美', amount: '280' },
        ],
      },
      nthPerson: '第 {n} 位',
      amountPlaceholder: '金額',
      nameAria: '姓名',
      amountAria: '個人消費金額',
      remove: '移除',
      errorEqual: '請輸入大於 0 的消費金額、至少 1 人（整數），服務費與小費不可為負數。',
      errorItems: '請確認每個金額都是不為負的數字，且總消費大於 0。',
      mainLabel: '每人應付',
      labelRounded: '每人應付（進位到 {unit}）',
      labelExact: '每人應付（精確值 {exact} 元）',
      mainRange: '{low}–{high} 元',
      noteSurplus: '每人付 {per}，{n} 人共收 {collected}，比應付總額多 {surplus}，可留給結帳的人找零或當作公基金。',
      noteRoundedExact: '每人付 {per}，剛好等於應付總額。',
      noteUneven: '總額 {total} 無法被 {n} 人整除：{extra} 人付 {high}，{rest} 人付 {low}，合計剛好 {total}。',
      noteEven: '總額 {total} 由 {n} 人平分，每人 {per}，剛好整除。',
      itemsMainLabel: { other: '應付總額（{n} 人）' },
      itemsNote: '服務費與小費依每個人的消費比例分攤；四捨五入後的零頭已分配好，所有人加總剛好等於應付總額。',
      summaryEqual: '{main}（{label}）\n{note}',
      summaryTotal: '應付總額 {total}',
      summaryLine: '{name}：{pay}',
    },
  },
  en: {
    modeAria: 'How to split',
    modeEqual: 'Split evenly',
    modeItems: 'Itemized',
    totalLabel: 'Bill subtotal ($)',
    peopleLabel: 'Number of people',
    itemsLabel: 'What each person ordered ($)',
    addPerson: 'Add person',
    sharedLabel: 'Shared items split evenly, like appetizers or a pitcher ($)',
    serviceLabel: 'Sales tax (%)',
    serviceHint: 'Use your local rate, or 0 if the amount above already includes tax.',
    tip: {
      label: 'Tip (%)',
      hint: 'Figured on the pre-tax subtotal. 18–20% is typical for table service in the US.',
      presets: [15, 18, 20, 22],
      presetsAria: 'Tip presets',
    },
    roundLabel: 'Rounding',
    roundOptions: [
      { value: 1, label: 'Exact to the cent' },
      { value: 100, label: 'Round up to $1' },
      { value: 500, label: 'Round up to $5' },
    ],
    statSubtotal: 'Subtotal',
    statService: 'Tax',
    statTip: 'Tip',
    statGrand: 'Total with tax and tip',
    tableHead: ['Name', 'Items', 'Shared', 'Tax + tip', 'Pays'],
    copyResult: 'Copy the split',
    client: {
      prefKey: 'split-bill:en',
      money: '${n}',
      digits: 2,
      numDigits: 2,
      statMoney: true,
      exactDigits: 4,
      defaults: {
        mode: 'equal',
        total: '120',
        people: '4',
        service: '8',
        tip: '20',
        roundTo: '1',
        shared: '24',
        persons: [
          { name: 'Alex', amount: '32' },
          { name: 'Sam', amount: '28.50' },
          { name: 'Jordan', amount: '41' },
        ],
      },
      nthPerson: 'Person {n}',
      amountPlaceholder: 'Amount',
      nameAria: 'Name',
      amountAria: 'Amount this person ordered',
      remove: 'Remove',
      errorEqual: 'Enter a bill amount above 0 and a whole number of people (at least 1). Tax and tip can’t be negative.',
      errorItems: 'Check that every amount is a number of 0 or more and that the bill adds up to more than 0.',
      mainLabel: 'Each person pays',
      labelRounded: 'Each person pays (rounded up to {unit})',
      labelExact: 'Each person pays (exact share ${exact})',
      mainRange: '${low}–${high}',
      noteSurplus:
        'Everyone pays {per}. {n} people put in {collected}, which is {surplus} more than the bill. Leave the extra as additional tip or give it to whoever pays the check.',
      noteRoundedExact: 'Everyone pays {per}, which covers the bill exactly.',
      noteUneven: '{total} doesn’t divide evenly by {n}. Have {extra} pay {high} and {rest} pay {low}; together that is exactly {total}.',
      noteEven: '{total} split {n} ways is {per} each, with nothing left over.',
      itemsMainLabel: { one: 'Total ({n} person)', other: 'Total ({n} people)' },
      itemsNote:
        'Tax and tip are shared in proportion to what each person ordered. Leftover cents from rounding are already assigned, so the amounts add up exactly to the total.',
      summaryEqual: '{label}: {main}\n{note}',
      summaryTotal: 'Total {total}',
      summaryLine: '{name}: {pay}',
    },
  },
  ja: {
    modeAria: '割り勘の方法',
    modeEqual: '均等に割り勘',
    modeItems: '注文ごとに精算',
    totalLabel: '支払金額（円）',
    peopleLabel: '人数',
    itemsLabel: '各自が注文した金額（円）',
    addPerson: '1 人追加',
    sharedLabel: '全員で割る金額（コース料理・大皿・飲み放題など）',
    serviceLabel: 'サービス料（%）',
    serviceHint: 'ホテルや一部のレストランで 10% などがかかる場合に入力します。なければ 0 のままで構いません。',
    roundLabel: '1 人あたりの金額',
    roundOptions: [
      { value: 1, label: '1 円単位' },
      { value: 10, label: '10 円単位' },
      { value: 100, label: '100 円単位' },
      { value: 1000, label: '1,000 円単位' },
    ],
    roundMode: { label: '端数の扱い', up: '多めに集める（切り上げ）', down: '幹事が負担（切り捨て）' },
    statSubtotal: '飲食代',
    statService: 'サービス料',
    statGrand: '支払総額',
    tableHead: ['名前', '個人分', '共通分', 'サービス料', '支払額'],
    copyResult: '割り勘結果をコピー',
    client: {
      prefKey: 'split-bill:ja',
      money: '{n} 円',
      digits: 0,
      numDigits: 0,
      statMoney: true,
      exactDigits: 2,
      defaults: {
        mode: 'equal',
        total: '24800',
        people: '6',
        service: '0',
        tip: '0',
        roundTo: '100',
        roundMode: 'up',
        shared: '12000',
        persons: [
          { name: '佐藤', amount: '3500' },
          { name: '鈴木', amount: '2800' },
          { name: '高橋', amount: '4200' },
        ],
      },
      nthPerson: '{n} 人目',
      amountPlaceholder: '金額',
      nameAria: '名前',
      amountAria: '個人の注文金額',
      remove: '削除',
      errorEqual: '支払金額は 0 より大きい数字を、人数は 1 以上の整数を入力してください。サービス料はマイナスにできません。',
      errorItems: '金額はすべて 0 以上の数字で入力し、合計が 0 より大きくなるようにしてください。',
      mainLabel: '1 人あたり',
      labelRounded: '1 人あたり（{unit}単位で切り上げ）',
      labelRoundedDown: '1 人あたり（{unit}単位で切り捨て）',
      labelExact: '1 人あたり（割り算の結果は {exact} 円）',
      mainRange: '{low}–{high} 円',
      noteSurplus: '1 人 {per}ずつ、{n} 人で {collected}集めると支払総額より {surplus}多くなります。余った分は幹事が預かるか、二次会の費用に回しましょう。',
      noteShortfall: '1 人 {per}ずつ、{n} 人で {collected}です。支払総額に {shortfall}足りない分は幹事が負担します。',
      noteRoundedExact: '1 人 {per}ずつで、支払総額とぴったり一致します。',
      noteUneven: '支払総額 {total}は {n} 人で割り切れません。{extra} 人が {high}、{rest} 人が {low}を払うと、合計がちょうど {total}になります。',
      noteEven: '支払総額 {total}を {n} 人で割ると 1 人 {per}で、ぴったり割り切れます。',
      itemsMainLabel: { other: '支払総額（{n} 人）' },
      itemsNote: 'サービス料は各自の注文額に応じて按分しています。1 円未満の端数も割り振り済みなので、全員の支払額を足すと支払総額にぴったり一致します。',
      summaryEqual: '{label}：{main}\n{note}',
      summaryTotal: '支払総額 {total}',
      summaryLine: '{name}：{pay}',
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { MoneyRounding } from './logic';

/** zhe (台灣「打 8 折」) is zh-TW only; wari (「3 割引」) is ja only. */
export type Mode = 'zhe' | 'off' | 'wari' | 'threshold' | 'bundle' | 'second';

interface Field {
  label: string;
  hint?: string;
  placeholder?: string;
}

export interface Strings {
  modeAria: string;
  /** Modes offered in this locale, in display order. The first is the default. */
  modes: { value: Mode; label: string }[];
  /** Input default values keyed by data-k. */
  defaults: Record<string, string>;
  /** Whether 滿額折 / spend-and-save repeats by default (「每滿」 in Taiwan, usually once elsewhere). */
  repeatDefault: boolean;
  zhe?: { price: Field; zhe: Field; zhe2: Field };
  off: { price: Field; off: Field; extra?: Field };
  wari?: { price: Field; wari: Field };
  threshold: { total: Field; limit: Field; off: Field; repeat: string };
  bundle: { price: Field; buy: Field; free: Field };
  /** zh-TW enters the second item as 折數 (6 = pay 60%); en / ja as percent off (50 = half price). */
  second: { price: Field; discount: Field; unit: 'zhe' | 'percent' };
  /** Optional tax step: a free rate input (US sales tax) or fixed choices (消費税 10% / 8%). */
  tax?: { label: string; hint?: string } & (
    | { kind: 'input'; placeholder: string }
    | { kind: 'select'; options: { value: string; label: string }[] }
  );
  mainLabel: string;
  savedLabel: string;
  /** Middle stat: 等同折數 (zh-TW) or total percent off (en / ja). */
  equivLabel: string;
  extraLabel: string;
  client: {
    /** How the middle stat is expressed. */
    equiv: 'zhe' | 'percent';
    money: string;
    moneyFormat: 'max2' | 'fixed2' | 'integer';
    rounding: MoneyRounding;
    percentOff: string;
    labelFinal: string;
    labelPaid: string;
    /** {n} items received. */
    labelBundle: string;
    labelTwo: string;
    extraEquiv: string;
    extraTimes: string;
    /** {n} */
    times: string;
    extraPerItem: string;
    /** {a} {b} {total} {sum}: shown when a second discount is stacked. */
    noteStack: string;
    /** {amount} {off} */
    noteNext: string;
    noteNextAgain: string;
    noteSecond: string;
    invalid: string;
    /** {rate} */
    taxStat?: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '折扣類型',
    modes: [
      { value: 'zhe', label: '打折' },
      { value: 'off', label: '% off' },
      { value: 'threshold', label: '滿額折' },
      { value: 'bundle', label: '買 N 送 M' },
      { value: 'second', label: '第二件折扣' },
    ],
    defaults: {
      zhePrice: '1280',
      zhe: '8',
      offPrice: '1280',
      off: '20',
      thTotal: '2350',
      thLimit: '1000',
      thOff: '100',
      bdPrice: '90',
      bdBuy: '2',
      bdFree: '1',
      scPrice: '500',
      scZhe: '6',
    },
    repeatDefault: true,
    zhe: {
      price: { label: '原價（元）' },
      zhe: { label: '折數', hint: '8 折填 8，85 折填 85' },
      zhe2: { label: '再打折（選填）', placeholder: '例如 9', hint: '折上折，例如會員再 9 折' },
    },
    off: { price: { label: '原價（元）' }, off: { label: '折扣（% off）', hint: '20% off 等於打 8 折' } },
    threshold: {
      total: { label: '消費金額（元）' },
      limit: { label: '每滿（元）' },
      off: { label: '折抵（元）' },
      repeat: '可累計（每滿一次折一次）',
    },
    bundle: { price: { label: '單價（元）' }, buy: { label: '買幾件' }, free: { label: '送幾件' } },
    second: { price: { label: '單價（元）' }, discount: { label: '第二件折數', hint: '第二件半價填 5' }, unit: 'zhe' },
    mainLabel: '折後價',
    savedLabel: '省下金額',
    equivLabel: '等同折數',
    extraLabel: '相當於',
    client: {
      equiv: 'zhe',
      money: '{n} 元',
      moneyFormat: 'max2',
      rounding: 'none',
      percentOff: '{n}% off',
      labelFinal: '折後價',
      labelPaid: '實付金額',
      labelBundle: '拿到 {n} 件共付',
      labelTwo: '兩件共付',
      extraEquiv: '相當於',
      extraTimes: '折抵次數',
      times: '{n} 次',
      extraPerItem: '平均每件',
      noteStack: '折上折是相乘，不是相加：8 折再 9 折＝0.8 × 0.9＝72 折。',
      noteNext: '再消費 {amount} 可折抵 {off}。',
      noteNextAgain: '再消費 {amount} 可再折抵 {off}。',
      noteSecond: '只買一件時沒有折扣，要買兩件才划算。',
      invalid: '請輸入有效的數字。折數請填 1 到 99 之間，例如 8 或 85。',
    },
  },
  en: {
    modeAria: 'Discount type',
    modes: [
      { value: 'off', label: '% off' },
      { value: 'second', label: 'BOGO % off' },
      { value: 'bundle', label: 'Buy X, get Y free' },
      { value: 'threshold', label: 'Spend & save' },
    ],
    defaults: {
      offPrice: '79.99',
      off: '30',
      thTotal: '135',
      thLimit: '100',
      thOff: '20',
      bdPrice: '12.99',
      bdBuy: '2',
      bdFree: '1',
      scPrice: '40',
      scOff: '50',
    },
    repeatDefault: false,
    off: {
      price: { label: 'Original price ($)' },
      off: { label: 'Discount (% off)', hint: 'For 30% off, enter 30' },
      extra: { label: 'Extra % off (optional)', placeholder: 'e.g. 20', hint: 'Coupon or “take an extra 20% off” deal' },
    },
    threshold: {
      total: { label: 'Order total ($)' },
      limit: { label: 'When you spend ($)' },
      off: { label: 'You get off ($)' },
      repeat: 'Applies again for every multiple (spend $200, get $40 off)',
    },
    bundle: {
      price: { label: 'Price per item ($)' },
      buy: { label: 'Buy (items)' },
      free: { label: 'Get free (items)' },
    },
    second: {
      price: { label: 'Price per item ($)' },
      discount: { label: 'Second item (% off)', hint: 'BOGO half off: 50. BOGO free: 100' },
      unit: 'percent',
    },
    tax: {
      kind: 'input',
      label: 'Sales tax (%, optional)',
      placeholder: 'e.g. 8.25',
      hint: 'Sales tax is added at checkout on the discounted price',
    },
    mainLabel: 'Sale price',
    savedLabel: 'You save',
    equivLabel: 'Total discount',
    extraLabel: 'Price per item',
    client: {
      equiv: 'percent',
      money: '${n}',
      moneyFormat: 'fixed2',
      rounding: 'cent',
      percentOff: '{n}% off',
      labelFinal: 'Sale price',
      labelPaid: 'You pay',
      labelBundle: 'You pay for {n} items',
      labelTwo: 'You pay for 2 items',
      extraEquiv: 'Equivalent to',
      extraTimes: 'Times applied',
      times: '{n}×',
      extraPerItem: 'Price per item',
      noteStack: 'Stacked discounts multiply: {a}% off plus an extra {b}% off is {total}% off in total, not {sum}%.',
      noteNext: 'Spend {amount} more to get {off} off.',
      noteNextAgain: 'Spend {amount} more to get another {off} off.',
      noteSecond: 'The deal only applies when you buy two. A single item is full price.',
      invalid: 'Enter valid numbers. Percent off must be between 0 and 100.',
      taxStat: 'With {rate}% sales tax',
    },
  },
  ja: {
    modeAria: '割引の種類',
    modes: [
      { value: 'off', label: '%オフ' },
      { value: 'wari', label: '○割引' },
      { value: 'second', label: '2 点目割引' },
      { value: 'threshold', label: '○円以上で値引き' },
      { value: 'bundle', label: 'まとめ買い' },
    ],
    defaults: {
      offPrice: '3980',
      off: '20',
      wariPrice: '3980',
      wari: '3',
      thTotal: '5500',
      thLimit: '5000',
      thOff: '500',
      bdPrice: '298',
      bdBuy: '2',
      bdFree: '1',
      scPrice: '1980',
      scOff: '50',
    },
    repeatDefault: false,
    off: {
      price: { label: '定価（円）' },
      off: { label: '割引率（%オフ）', hint: '20%オフなら 20' },
      extra: { label: 'さらに割引（任意・%）', placeholder: '例：10', hint: 'クーポンやレジでさらに○%オフ' },
    },
    wari: { price: { label: '定価（円）' }, wari: { label: '割引（割）', hint: '3 割引なら 3、半額なら 5' } },
    threshold: {
      total: { label: 'お買い上げ金額（円）' },
      limit: { label: '○円以上で（円）' },
      off: { label: '値引き額（円）' },
      repeat: '金額ごとに繰り返し値引き（10,000 円なら 2 回分）',
    },
    bundle: {
      price: { label: '1 個の価格（円）' },
      buy: { label: '買う数' },
      free: { label: '無料でもらえる数' },
    },
    second: {
      price: { label: '1 点の価格（円）' },
      discount: { label: '2 点目の割引率（%）', hint: '2 点目半額なら 50、無料なら 100' },
      unit: 'percent',
    },
    tax: {
      kind: 'select',
      label: '消費税',
      options: [
        { value: '0', label: '入力は税込価格（加算しない）' },
        { value: '10', label: '税抜価格に 10% を加える' },
        { value: '8', label: '税抜価格に 8% を加える（軽減税率）' },
      ],
      hint: '税抜表示の商品は、割引後の価格に消費税を加えて税込価格を表示します（1 円未満切り捨て）',
    },
    mainLabel: '割引後の価格',
    savedLabel: '割引額',
    equivLabel: '割引率',
    extraLabel: '1 個あたり',
    client: {
      equiv: 'percent',
      money: '{n}円',
      moneyFormat: 'integer',
      rounding: 'floor',
      percentOff: '{n}%オフ',
      labelFinal: '割引後の価格',
      labelPaid: 'お支払い金額',
      labelBundle: '{n} 個で支払う金額',
      labelTwo: '2 点で支払う金額',
      extraEquiv: '相当',
      extraTimes: '値引き回数',
      times: '{n} 回',
      extraPerItem: '1 個あたり',
      noteStack: '割引の重ねがけは掛け算です。{a}%オフからさらに {b}%オフは合計 {total}%オフで、{sum}%オフではありません。',
      noteNext: 'あと {amount} で {off} 引きになります。',
      noteNextAgain: 'あと {amount} でさらに {off} 引きになります。',
      noteSecond: '1 点だけでは割引されません。2 点まとめて買うときにお得になります。',
      invalid: '有効な数値を入力してください。割引率は 0〜100%、割引は 0〜10 割の範囲です。',
      taxStat: '税込価格（{rate}%）',
    },
  },
});

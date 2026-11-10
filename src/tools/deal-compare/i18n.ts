import { defineToolI18n } from '../../i18n/tool';
import type { DiscountUnit, OfferFields, Rounding } from './logic';

interface Pair {
  title: string;
  first: string;
  second: string;
}

export interface Strings {
  lead: string;
  sample: string;
  clear: string;
  add: string;
  remove: string;
  offersAria: string;
  nameAria: string;
  price: string;
  /** Step 1. `unitAria` labels the unit select, shown when the locale offers more than one unit. */
  percent: { title: string; value: string; unitAria: string };
  /** Units for the percentage discount; the first is the default (must match client.defaultUnit). */
  units: { value: DiscountUnit; label: string }[];
  /** Steps 2–5: a title and the labels of the two inputs. */
  threshold: Pair & { repeat: string };
  coupon: Pair;
  shipping: Pair;
  cashback: Pair;
  compareTitle: string;
  ruleTitle: string;
  /** One line per step, in ORDER_OF_OPERATIONS order. */
  rule: string[];
  ruleNote: string;
  copy: string;
  client: {
    prefKey: string;
    /** {n} */
    money: string;
    moneyFormat: 'max2' | 'fixed2';
    rounding: Rounding;
    /** How the effective discount is expressed: 折數 plus % off (zh-TW) or % off only. */
    equiv: 'zhe' | 'percent';
    defaultUnit: DiscountUnit;
    /** Hint under the discount field, per unit. */
    unitHints: Partial<Record<DiscountUnit, string>>;
    /** {letter} */
    offerName: string;
    sample: Partial<OfferFields>[];
    empty: string;
    invalid: string;
    /** {zhe} {pct} */
    discount: string;
    noDiscount: string;
    /** Shown when nothing is left to pay. */
    fullDiscount: string;
    /** {pct}: effective cost above the list price (shipping with no discount). */
    overList: string;
    labels: { paid: string; cashback: string; effective: string; discount: string };
    lines: {
      list: string;
      /** {n}: the discount as entered, per unit. */
      percent: Partial<Record<DiscountUnit, string>>;
      /** {spend} {off} */
      threshold: string;
      /** {spend} {off} {n} */
      thresholdTimes: string;
      thresholdUnmet: string;
      coupon: string;
      couponUnmet: string;
      shipping: string;
      shippingFree: string;
      /** {rate} */
      cashback: string;
      /** {rate} {cap} */
      cashbackCapped: string;
    };
    hints: {
      /** {add} {off} */
      threshold: string;
      thresholdAgain: string;
      coupon: string;
      /** {add} {fee} */
      shipping: string;
      /** {cap} {lost} */
      cap: string;
    };
    badges: { best: string; tie: string; paid: string; effective: string };
    verdict: {
      best: string;
      tie: string;
      paid: string;
      effective: string;
      /** {paid} {cashback} {effective} */
      detail: string;
      /** {paid} */
      detailPlain: string;
      /** {d}: appended to a detail line when a discount rate exists. */
      discountWrap: string;
      /** {name} {diff} */
      savePaid: string;
      saveEffective: string;
      /** {name} */
      samePaid: string;
      sameEffective: string;
    };
    summary: {
      title: string;
      /** {label} {names} {amount} */
      winner: string;
      /** {amount}: what the winner line quotes for each kind of winner. */
      paidAmount: string;
      effectiveAmount: string;
      /** {name} {detail} */
      offer: string;
      footer: string;
    };
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    lead: '每個方案先填訂單金額，再填它有的優惠；沒有的留空就好。',
    sample: '填入範例',
    clear: '全部清除',
    add: '新增方案',
    remove: '移除',
    offersAria: '要比較的方案',
    nameAria: '方案名稱',
    price: '訂單金額（元）',
    percent: { title: '打折', value: '折扣', unitAria: '單位' },
    units: [
      { value: 'zhe', label: '折' },
      { value: 'percent', label: '% off' },
    ],
    threshold: { title: '滿額折', first: '滿（元）', second: '折（元）', repeat: '每滿就折一次（可累計）' },
    coupon: { title: '折價券', first: '折抵（元）', second: '低消（元）' },
    shipping: { title: '運費', first: '運費（元）', second: '免運門檻（元）' },
    cashback: { title: '回饋', first: '回饋（%）', second: '回饋上限（元）' },
    compareTitle: '方案比較',
    ruleTitle: '計算順序',
    rule: [
      '打折：訂單金額先乘上折數。',
      '滿額折：用打折後的金額判斷有沒有滿額。',
      '折價券：用前兩步之後的金額判斷低消，最多折到 0 元。',
      '運費：用折扣後的商品金額判斷有沒有達到免運門檻。',
      '回饋：以商品實付金額（不含運費）計算，超過上限以上限計。回饋是事後才拿到，所以不算在「現在付」裡。',
    ],
    ruleNote: '金額四捨五入到元。各平台的折抵順序、回饋計算基準與進位方式不一定相同，結果僅供試算，請以各平台實際規則為準。',
    copy: '複製結果',
    client: {
      prefKey: 'deal-compare',
      money: '{n} 元',
      moneyFormat: 'max2',
      rounding: 'unit',
      equiv: 'zhe',
      defaultUnit: 'zhe',
      unitHints: { zhe: '85 折填 85，8 折填 8', percent: '20% off 填 20' },
      offerName: '方案 {letter}',
      sample: [
        { name: 'A 商城', price: '3980', discount: '88', unit: 'zhe', coupon: '200', couponMinSpend: '3000', cashbackRate: '1' },
        {
          name: 'B 購物',
          price: '3980',
          thresholdSpend: '1000',
          thresholdOff: '100',
          thresholdRepeat: true,
          coupon: '150',
          cashbackRate: '10',
          cashbackCap: '300',
        },
        {
          name: 'C 官網',
          price: '3980',
          discount: '9',
          unit: 'zhe',
          shipping: '80',
          freeShippingFrom: '3600',
          cashbackRate: '3',
        },
      ],
      empty: '填入訂單金額就會開始計算，也可以先按「填入範例」看看怎麼比。',
      invalid: '請確認數字：金額不能是負數，折數填 1 到 99（例如 85），% off 與回饋填 0 到 100。',
      discount: '約 {zhe}（{pct}% off）',
      noDiscount: '沒有折扣',
      fullDiscount: '100% off',
      overList: '比訂單金額多 {pct}%',
      labels: { paid: '現在付', cashback: '回饋', effective: '實際成本', discount: '等同折數' },
      lines: {
        list: '訂單金額',
        percent: { zhe: '打 {n} 折', percent: '{n}% off' },
        threshold: '滿 {spend}折 {off}',
        thresholdTimes: '滿 {spend}折 {off} × {n}',
        thresholdUnmet: '未達門檻',
        coupon: '折價券',
        couponUnmet: '未達低消',
        shipping: '運費',
        shippingFree: '免運',
        cashback: '回饋 {rate}%',
        cashbackCapped: '回饋 {rate}%（上限 {cap}）',
      },
      hints: {
        threshold: '再買 {add}就能折 {off}。',
        thresholdAgain: '再買 {add}可以多折 {off}。',
        coupon: '折價券還沒用到：再買 {add}才達低消，可以折 {off}。',
        shipping: '再買 {add}就免運，省下運費 {fee}。',
        cap: '回饋已達上限 {cap}：超過的 {lost}沒有回饋。',
      },
      badges: { best: '最便宜', tie: '一樣便宜', paid: '現在付最少', effective: '算上回饋最划算' },
      verdict: {
        best: '最便宜',
        tie: '一樣便宜',
        paid: '現在付最少',
        effective: '算上回饋最划算',
        detail: '現在付 {paid}，回饋 {cashback}，實際成本 {effective}',
        detailPlain: '現在付 {paid}',
        discountWrap: '，{d}',
        savePaid: '比「{name}」少付 {diff}',
        saveEffective: '實際成本比「{name}」少 {diff}',
        samePaid: '和「{name}」付的一樣多',
        sameEffective: '實際成本和「{name}」一樣',
      },
      summary: {
        title: '優惠比較結果',
        winner: '{label}：{names}（{amount}）',
        paidAmount: '{amount}',
        effectiveAmount: '實際成本 {amount}',
        offer: '{name}：{detail}',
        footer: '計算順序：打折 → 滿額折 → 折價券 → 運費 → 回饋（事後拿到）。試算結果，以各平台實際規則為準。',
      },
    },
  },
  en: {
    lead: 'Enter the order total for each offer, then fill in only the deals it has. Leave the rest blank.',
    sample: 'Try an example',
    clear: 'Clear all',
    add: 'Add offer',
    remove: 'Remove',
    offersAria: 'Offers to compare',
    nameAria: 'Offer name',
    price: 'Order total ($)',
    percent: { title: 'Percent off', value: 'Percent off (%)', unitAria: 'Unit' },
    units: [{ value: 'percent', label: '% off' }],
    threshold: { title: 'Spend & save', first: 'Spend ($)', second: 'Get off ($)', repeat: 'Applies again for every multiple' },
    coupon: { title: 'Coupon', first: 'Amount off ($)', second: 'Minimum spend ($)' },
    shipping: { title: 'Shipping', first: 'Shipping fee ($)', second: 'Free over ($)' },
    cashback: { title: 'Cash back', first: 'Cash back (%)', second: 'Cap ($)' },
    compareTitle: 'Side by side',
    ruleTitle: 'Order of calculation',
    rule: [
      'Percent off: taken off the order total first.',
      'Spend & save: checked against the amount after the percent discount.',
      'Coupon: its minimum spend is checked against the amount after steps 1 and 2, and the total never drops below $0.',
      'Shipping: the free-shipping threshold is checked against the merchandise total after discounts.',
      'Cash back: earned on what you pay for merchandise (not shipping), up to the cap. It arrives later, so it is not part of “Pay now”.',
    ],
    ruleNote:
      'Amounts are rounded to the cent and sales tax is not included. Stores and card issuers stack discounts in different orders and may exclude some items, so treat the result as an estimate and check each offer’s terms.',
    copy: 'Copy result',
    client: {
      prefKey: 'deal-compare:en',
      money: '${n}',
      moneyFormat: 'fixed2',
      rounding: 'cent',
      equiv: 'percent',
      defaultUnit: 'percent',
      unitHints: { percent: 'For 20% off, enter 20' },
      offerName: 'Offer {letter}',
      sample: [
        { name: 'Store A', price: '240', discount: '30', shipping: '8.95', freeShippingFrom: '175' },
        { name: 'Store B', price: '240', discount: '20', coupon: '20', couponMinSpend: '150' },
        { name: 'Store C + card', price: '240', discount: '15', cashbackRate: '20', cashbackCap: '40' },
      ],
      empty: 'Enter an order total to start, or tap “Try an example” to see a comparison.',
      invalid: 'Check the numbers: amounts can’t be negative, and percent off and cash back must be between 0 and 100.',
      discount: '{pct}% off',
      noDiscount: 'No discount',
      fullDiscount: '100% off',
      overList: '{pct}% over the order total',
      labels: { paid: 'Pay now', cashback: 'Cash back', effective: 'Effective cost', discount: 'Effective discount' },
      lines: {
        list: 'Order total',
        percent: { percent: '{n}% off' },
        threshold: 'Spend {spend}, get {off} off',
        thresholdTimes: 'Spend {spend}, get {off} off × {n}',
        thresholdUnmet: 'Not reached',
        coupon: 'Coupon',
        couponUnmet: 'Minimum not met',
        shipping: 'Shipping',
        shippingFree: 'Free',
        cashback: '{rate}% cash back',
        cashbackCapped: '{rate}% cash back (cap {cap})',
      },
      hints: {
        threshold: 'Add {add} to the order to get {off} off.',
        thresholdAgain: 'Add {add} to the order to get another {off} off.',
        coupon: 'Coupon not applied: add {add} to reach its minimum and take {off} off.',
        shipping: 'Add {add} to the order for free shipping and save the {fee} fee.',
        cap: 'Cash back is capped at {cap}: the extra {lost} is not paid out.',
      },
      badges: { best: 'Cheapest', tie: 'Same cost', paid: 'Lowest price now', effective: 'Best after cash back' },
      verdict: {
        best: 'Cheapest',
        tie: 'Same cost',
        paid: 'Lowest price now',
        effective: 'Best after cash back',
        detail: 'Pay {paid} now, get {cashback} back, effective cost {effective}',
        detailPlain: 'Pay {paid}',
        discountWrap: ' ({d})',
        savePaid: '{diff} less to pay than {name}',
        saveEffective: '{diff} less than {name} after cash back',
        samePaid: 'Same price as {name}',
        sameEffective: 'Same effective cost as {name}',
      },
      summary: {
        title: 'Deal comparison',
        winner: '{label}: {names} ({amount})',
        paidAmount: '{amount}',
        effectiveAmount: 'effective cost {amount}',
        offer: '{name}: {detail}',
        footer:
          'Order of calculation: percent off → spend & save → coupon → shipping → cash back (received later). An estimate; check each offer’s terms.',
      },
    },
  },
  ja: {
    lead: '買い方ごとに注文金額を入力し、使える割引だけ入力してください。ないものは空欄のままで大丈夫です。',
    sample: '入力例を入れる',
    clear: 'すべてクリア',
    add: '比較先を追加',
    remove: '削除',
    offersAria: '比較する買い方',
    nameAria: '買い方の名前',
    price: '注文金額（円）',
    percent: { title: '割引率', value: '割引', unitAria: '単位' },
    units: [
      { value: 'percent', label: '%オフ' },
      { value: 'wari', label: '割引' },
    ],
    threshold: { title: '○円以上で値引き', first: '条件（円以上）', second: '値引き（円）', repeat: '金額ごとに繰り返し適用' },
    coupon: { title: 'クーポン', first: '値引き（円）', second: '利用条件（円以上）' },
    shipping: { title: '送料', first: '送料（円）', second: '送料無料ライン（円）' },
    cashback: { title: 'ポイント還元', first: '還元率（%）', second: '還元の上限（円）' },
    compareTitle: '並べて比較',
    ruleTitle: '計算の順番',
    rule: [
      '割引率：注文金額に最初に適用します。',
      '○円以上で値引き：割引率を適用したあとの金額で条件を判定します。',
      'クーポン：1 と 2 のあとの金額で利用条件を判定します。0 円より下にはなりません。',
      '送料：割引後の商品代金で送料無料ラインを判定します。',
      'ポイント還元：送料を除いた商品代金の支払額に対して計算し、上限を超えた分は付きません。あとから戻ってくる分なので「支払額」には含めません。',
    ],
    ruleNote:
      '1 円未満は切り捨てています。ショップやキャンペーンによって、割引の順番、ポイントの対象金額、端数処理は異なります。結果は目安とし、実際の条件は各サービスの案内でご確認ください。',
    copy: '結果をコピー',
    client: {
      prefKey: 'deal-compare:ja',
      money: '{n}円',
      moneyFormat: 'max2',
      rounding: 'floor',
      equiv: 'percent',
      defaultUnit: 'percent',
      unitHints: { percent: '20%オフなら 20', wari: '3 割引なら 3' },
      offerName: 'パターン {letter}',
      sample: [
        { name: 'ショップ A', price: '12800', discount: '10', unit: 'percent', coupon: '500', couponMinSpend: '5000', cashbackRate: '1' },
        { name: 'ショップ B', price: '12800', coupon: '1000', couponMinSpend: '10000', cashbackRate: '15', cashbackCap: '1500' },
        {
          name: 'ショップ C',
          price: '12800',
          discount: '8',
          unit: 'percent',
          shipping: '550',
          freeShippingFrom: '12000',
          cashbackRate: '3',
        },
      ],
      empty: '注文金額を入力すると計算が始まります。「入力例を入れる」で試すこともできます。',
      invalid: '数値を確認してください。金額は 0 以上、割引率と還元率は 0〜100%、割引は 0〜10 割の範囲です。',
      discount: '{pct}%オフ',
      noDiscount: '割引なし',
      fullDiscount: '100%オフ',
      overList: '注文金額より {pct}% 高い',
      labels: { paid: '支払額', cashback: 'ポイント還元', effective: '実質価格', discount: '実質割引率' },
      lines: {
        list: '注文金額',
        percent: { percent: '{n}%オフ', wari: '{n} 割引' },
        threshold: '{spend}以上で {off}引き',
        thresholdTimes: '{spend}以上で {off}引き × {n}',
        thresholdUnmet: '条件未達',
        coupon: 'クーポン',
        couponUnmet: '条件未達',
        shipping: '送料',
        shippingFree: '無料',
        cashback: 'ポイント還元 {rate}%',
        cashbackCapped: 'ポイント還元 {rate}%（上限 {cap}）',
      },
      hints: {
        threshold: 'あと {add} 買うと {off} 引きになります。',
        thresholdAgain: 'あと {add} 買うとさらに {off} 引きになります。',
        coupon: 'クーポンはまだ使えません。あと {add} で利用条件に届き、{off} 引きになります。',
        shipping: 'あと {add} で送料無料になり、送料 {fee} がかかりません。',
        cap: 'ポイント還元は上限の {cap} に達しています。超えた {lost} 分は付きません。',
      },
      badges: { best: '最安', tie: '同額', paid: '支払額が最安', effective: '実質最安' },
      verdict: {
        best: 'いちばん安い',
        tie: '同額',
        paid: '支払額がいちばん安い',
        effective: 'ポイント込みでいちばんお得',
        detail: '支払額 {paid}、ポイント還元 {cashback}、実質 {effective}',
        detailPlain: '支払額 {paid}',
        discountWrap: '（{d}）',
        savePaid: '{name}より支払額が {diff} 安い',
        saveEffective: '{name}より実質 {diff} 安い',
        samePaid: '{name}と支払額は同じ',
        sameEffective: '{name}と実質価格は同じ',
      },
      summary: {
        title: '実質価格の比較結果',
        winner: '{label}：{names}（{amount}）',
        paidAmount: '{amount}',
        effectiveAmount: '実質 {amount}',
        offer: '{name}：{detail}',
        footer: '計算の順番：割引率 → ○円以上で値引き → クーポン → 送料 → ポイント還元（あとから付与）。目安の金額です。実際の条件は各サービスでご確認ください。',
      },
    },
  },
});

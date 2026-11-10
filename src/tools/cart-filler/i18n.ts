import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export interface Strings {
  targetLabel: string;
  targetHint: string;
  targetPlaceholder: string;
  offLabel: string;
  offHint: string;
  offPlaceholder: string;
  repeat: string;
  itemsLabel: string;
  itemsPlaceholder: string;
  itemsHint: string;
  sample: string;
  clear: string;
  previewLabel: string;
  previewHint: string;
  altLabel: string;
  tiersLabel: string;
  copyResult: string;
  /** Keyboard for the amount fields: whole 元 / 円, or dollars with cents. */
  inputMode: 'numeric' | 'decimal';
  client: {
    /** Minor units per major unit: 1 for 元 / 円, 100 for dollars and cents. */
    scale: 1 | 100;
    /** {n} = formatted amount */
    money: string;
    prefKey: string;
    sample: { target: string; off: string; repeat: boolean; items: string[] };
    /** {n} items read from the list */
    count: PluralForms;
    /** Appended to the count when some are must-haves: {n} */
    countMust: PluralForms;
    /** {lines} = line numbers */
    skipped: string;
    /** {max} */
    truncated: string;
    /** {n} = position in the list, for a line that is only a price */
    unnamed: string;
    /** {n} */
    upTo: string;
    /** {name} {n} */
    times: string;
    idleTarget: string;
    targetInvalid: string;
    idleItems: string;
    offInvalid: string;
    tooLarge: string;
    /** {target} {over} */
    labelOver: string;
    labelExact: string;
    labelMustEnough: string;
    labelShort: string;
    statOver: string;
    statShort: string;
    /** {n} pieces added */
    statAdded: PluralForms;
    /** {off} */
    statPaid: string;
    tagMust: string;
    tagAdd: string;
    /** {total} {target} {short} */
    noteShort: string;
    /** {must} {added} {off} {paid} {diff} */
    noteLess: string;
    noteSame: string;
    noteMore: string;
    /** {added}: shown when there is no discount to weigh the extras against */
    noteNoDiscount: string;
    altOver: string;
    altExact: string;
    altPaid: string;
    addPrefix: string;
    nameSeparator: string;
    partSeparator: string;
    /** {discount} {total} {paid} */
    tierHead: string;
    /** {pct} */
    tierRate: string;
    tierBest: string;
    tiersNote: string;
    tiersSkipped: string;
    summaryTitle: string;
    summaryOver: string;
    summaryExact: string;
    summaryShort: string;
    summaryPaid: string;
    /** {name} {price} */
    summaryLine: string;
    summaryMust: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    targetLabel: '目標金額（元）',
    targetHint: '免運門檻、滿額折的門檻，或優惠券的最低消費',
    targetPlaceholder: '例如 2000',
    offLabel: '滿額折抵（元，選填）',
    offHint: '滿 2,000 折 200 就填 200；只是湊免運可以留空',
    offPlaceholder: '例如 200',
    repeat: '可累計（每滿一次折一次）',
    itemsLabel: '商品清單（每行一個：名稱 價格）',
    itemsPlaceholder: '*保溫杯 590\n洗髮精 259\n牙膏 89 x2',
    itemsHint: '行首加 * 代表一定要買；價格後面加 x2 代表最多可以買 2 件（必買商品則是 2 件都買）。',
    sample: '填入範例',
    clear: '清除',
    previewLabel: '讀到的商品',
    previewHint: '打勾＝一定要買，沒打勾＝可以拿來湊',
    altLabel: '其他湊法（總額次低）',
    tiersLabel: '累計折抵：再往上湊一級、兩級',
    copyResult: '複製結果',
    inputMode: 'numeric',
    client: {
      scale: 1,
      money: '{n} 元',
      prefKey: 'cart-filler',
      sample: {
        target: '2000',
        off: '200',
        repeat: false,
        items: [
          '*保溫杯 590',
          '*濾掛咖啡 365 x2',
          '*洗衣精補充包 329',
          '*抽取式衛生紙 189',
          '洗髮精 259',
          '沐浴乳 199',
          '牙膏 89 x2',
          '洗碗精 79 x2',
          '濕紙巾 59 x3',
          '護手霜 149',
        ],
      },
      count: { other: '共 {n} 項商品' },
      countMust: { other: '，其中 {n} 項必買' },
      skipped: '第 {lines} 行讀不到價格，已略過。',
      truncated: '清單最多讀取 {max} 行，後面的已略過。',
      unnamed: '商品 {n}',
      upTo: '最多 {n} 件',
      times: '{name} ×{n}',
      idleTarget: '先輸入目標金額，例如免運門檻或優惠券的最低消費。',
      targetInvalid: '目標金額請輸入大於 0 的數字。',
      idleItems: '在商品清單輸入至少一項商品和價格，每行一個，例如「洗髮精 259」。',
      offInvalid: '折抵金額請填比目標金額小的數字，這次先不計算折抵。',
      tooLarge: '商品太多或金額太大，沒辦法即時算出精確答案。請刪掉不太可能買的品項、減少可買件數，或把目標金額調小。',
      labelOver: '最省的湊法，商品總額只比門檻多 {over}',
      labelExact: '剛好湊滿 {target}，沒有多花',
      labelMustEnough: '必買商品已經達到門檻，不用再湊',
      labelShort: '清單全部買下的總額，還沒到 {target}',
      statOver: '超過門檻',
      statShort: '還差',
      statAdded: { other: '湊單商品（{n} 件）' },
      statPaid: '實付（已折 {off}）',
      tagMust: '必買',
      tagAdd: '湊單',
      noteShort: '清單上的商品全部買下也只有 {total}，離門檻還差 {short}。再加一項至少 {short} 的商品才湊得到。',
      noteLess: '只買必買商品要付 {must}。湊單商品多放 {added}，折抵 {off}，實付 {paid}，反而少付 {diff}。',
      noteSame: '只買必買商品要付 {must}。湊單商品多放 {added}，折抵 {off}，實付一樣是 {paid}，等於湊單商品不用加錢。',
      noteMore: '只買必買商品要付 {must}。湊滿後折抵 {off}，實付 {paid}，比原本多付 {diff}，多拿到的湊單商品定價共 {added}。這些東西用得到才算省。',
      noteNoDiscount: '為了達到門檻，多放的商品共 {added}。如果是湊免運，運費比這個金額低、東西又用不到的話，直接付運費比較省。',
      altOver: '超過 {over}',
      altExact: '剛好湊滿',
      altPaid: '實付 {paid}',
      addPrefix: '湊單：',
      nameSeparator: '、',
      partSeparator: '・',
      tierHead: '折 {discount}：商品總額 {total}，實付 {paid}',
      tierRate: '等於省 {pct}%',
      tierBest: '折扣比例最高',
      tiersNote: '折扣比例高不代表花得少：多湊一輪要多買不少東西，本來就要買才划算。',
      tiersSkipped: '金額範圍太大，沒有試算更高的累計門檻。',
      summaryTitle: '湊單結果（目標 {target}）',
      summaryOver: '商品總額 {total}，超過 {over}',
      summaryExact: '商品總額 {total}，剛好湊滿',
      summaryShort: '全部買下共 {total}，還差 {short}',
      summaryPaid: '折抵 {off}，實付 {paid}',
      summaryLine: '・{name} {price}',
      summaryMust: '（必買）',
    },
  },
  en: {
    targetLabel: 'Amount to reach ($)',
    targetHint: 'Free shipping minimum, coupon minimum or spend-and-save threshold',
    targetPlaceholder: 'e.g. 50',
    offLabel: 'Discount at that amount ($, optional)',
    offHint: 'For “$10 off $50”, enter 10. Leave blank for free shipping.',
    offPlaceholder: 'e.g. 10',
    repeat: 'Discount repeats for every multiple (spend $100, get $20 off)',
    itemsLabel: 'Items (one per line: name, then price)',
    itemsPlaceholder: '*Phone charger 18.50\nWater bottle 12.95\nLip balm 3.99 x3',
    itemsHint:
      'Start a line with * for things you are buying anyway. Add x2 after the price if you would take up to 2 (a must-have with x2 counts as 2).',
    sample: 'Load example',
    clear: 'Clear',
    previewLabel: 'Items found',
    previewHint: 'Checked = must-have, unchecked = optional filler',
    altLabel: 'Other ways to reach it (next lowest totals)',
    tiersLabel: 'Repeating discount: going for the next multiples',
    copyResult: 'Copy result',
    inputMode: 'decimal',
    client: {
      scale: 100,
      money: '${n}',
      prefKey: 'cart-filler:en',
      sample: {
        target: '50',
        off: '10',
        repeat: false,
        items: [
          '*Phone charger 18.50',
          '*Desk lamp 24.00',
          'Water bottle 12.95',
          'Notebook 6.49 x2',
          'Lip balm 3.99 x3',
          'Hand cream 8.75',
          'Tote bag 9.99',
          'USB cable 7.25',
          'Running socks 14.99',
        ],
      },
      count: { one: '{n} item', other: '{n} items' },
      countMust: { other: ', {n} must-have' },
      skipped: 'No price found on line {lines}; skipped.',
      truncated: 'Only the first {max} lines are read; the rest are skipped.',
      unnamed: 'Item {n}',
      upTo: 'up to {n}',
      times: '{name} ×{n}',
      idleTarget: 'Enter the amount to reach first, such as a free shipping minimum or a coupon minimum.',
      targetInvalid: 'Enter an amount greater than 0.',
      idleItems: 'Add at least one item with a price to the list, one per line, for example “Water bottle 12.95”.',
      offInvalid: 'Enter a discount smaller than the amount to reach. It was left out this time.',
      tooLarge:
        'There are too many items or the amount is too large to work out an exact answer on the spot. Remove items you are unlikely to buy, lower the quantities, or use a smaller amount.',
      labelOver: 'Cheapest cart that reaches {target}: only {over} over',
      labelExact: 'Lands exactly on {target}, nothing extra',
      labelMustEnough: 'Your must-haves already reach {target}. Nothing to add.',
      labelShort: 'Everything on the list together, still under {target}',
      statOver: 'Over the amount',
      statShort: 'Still short by',
      statAdded: { one: 'Added to reach it ({n} item)', other: 'Added to reach it ({n} items)' },
      statPaid: 'You pay after {off} off',
      tagMust: 'Must-have',
      tagAdd: 'Added',
      noteShort:
        'Even with everything on the list the cart is {total}, which is {short} short of {target}. Add another item of at least {short} to get there.',
      noteLess:
        'Your must-haves alone cost {must}. Adding {added} of extras and taking {off} off brings the bill to {paid}, which is {diff} less.',
      noteSame:
        'Your must-haves alone cost {must}. Adding {added} of extras and taking {off} off brings the bill to the same {paid}, so the extras cost you nothing.',
      noteMore:
        'Your must-haves alone cost {must}. Reaching the amount and taking {off} off costs {paid}: {diff} more, for {added} of extras. That only saves money if you wanted those items.',
      noteNoDiscount:
        'Reaching the amount adds {added} of extras. If this is for free shipping, paying the shipping fee is cheaper whenever the fee is lower than that and you would not use the extras.',
      altOver: '{over} over',
      altExact: 'exactly on it',
      altPaid: 'you pay {paid}',
      addPrefix: 'Add: ',
      nameSeparator: ', ',
      partSeparator: ' · ',
      tierHead: '{discount} off: {total} of items, you pay {paid}',
      tierRate: '{pct}% off overall',
      tierBest: 'Best rate',
      tiersNote:
        'A better rate is not a smaller bill: each extra round means buying a lot more, so it only pays if you wanted those items anyway.',
      tiersSkipped: 'The amounts are too large to also check higher multiples.',
      summaryTitle: 'Cart to reach {target}',
      summaryOver: 'Items total {total}, {over} over',
      summaryExact: 'Items total {total}, exactly on it',
      summaryShort: 'Everything together is {total}, {short} short',
      summaryPaid: 'After {off} off you pay {paid}',
      summaryLine: '- {name} {price}',
      summaryMust: ' (must-have)',
    },
  },
  ja: {
    targetLabel: '目標金額（円）',
    targetHint: '送料無料になる金額や、クーポンの最低利用金額',
    targetPlaceholder: '例：3980',
    offLabel: '値引き額（円・任意）',
    offHint: '「5,000 円以上で 500 円引き」なら 500。送料無料だけなら空欄のままで構いません。',
    offPlaceholder: '例：500',
    repeat: '金額ごとに繰り返し値引き（10,000 円なら 2 回分）',
    itemsLabel: '商品リスト（1 行に 1 つ：商品名 価格）',
    itemsPlaceholder: '*洗濯洗剤 548\nボディソープ 437\n歯みがき粉 298 x2',
    itemsHint: '必ず買うものは行頭に * を付けます。価格の後ろに x2 と書くと 2 個まで候補にします（必ず買うものは 2 個とも買う扱いです）。',
    sample: 'サンプルを入力',
    clear: 'クリア',
    previewLabel: '読み取った商品',
    previewHint: 'チェックあり＝必ず買う、チェックなし＝追加の候補',
    altLabel: 'ほかの組み合わせ（合計が次に小さい順）',
    tiersLabel: '繰り返し値引き：もう 1 段階・2 段階上まで買う場合',
    copyResult: '結果をコピー',
    inputMode: 'numeric',
    client: {
      scale: 1,
      money: '{n}円',
      prefKey: 'cart-filler:ja',
      sample: {
        target: '3980',
        off: '',
        repeat: false,
        items: [
          '*詰め替えシャンプー 798',
          '*洗濯洗剤 548',
          '*ドリップコーヒー 1,080',
          '*フェイスマスク 880',
          'ボディソープ 437',
          '歯みがき粉 298 x2',
          'ハンドクリーム 660',
          'ティッシュ 5 箱 382',
          '入浴剤 495',
          'マスク 30 枚 547',
        ],
      },
      count: { other: '商品 {n} 件' },
      countMust: { other: '（うち必ず買うもの {n} 件）' },
      skipped: '{lines} 行目は価格を読み取れなかったため、計算に含めていません。',
      truncated: '読み取るのは最初の {max} 行までです。それ以降は計算に含めていません。',
      unnamed: '商品 {n}',
      upTo: '{n} 個まで',
      times: '{name} ×{n}',
      idleTarget: 'まず目標金額を入力してください（送料無料になる金額、クーポンの最低利用金額など）。',
      targetInvalid: '目標金額には 0 より大きい数値を入力してください。',
      idleItems: '商品リストに、商品名と価格を 1 行に 1 つずつ入力してください（例：ボディソープ 437）。',
      offInvalid: '値引き額には目標金額より小さい数値を入力してください。今回は値引きなしで計算しています。',
      tooLarge:
        '商品数が多いか金額が大きいため、正確な組み合わせをすぐに計算できません。買う可能性の低い商品を消すか、個数や目標金額を減らしてください。',
      labelOver: '{target}に届くいちばん安い組み合わせ（超過は {over}）',
      labelExact: '{target}ちょうどになる組み合わせ',
      labelMustEnough: '必ず買う商品だけで {target}に届いています。追加は不要です。',
      labelShort: 'リストの商品をすべて買った合計（{target}に届きません）',
      statOver: '目標からの超過',
      statShort: '目標まであと',
      statAdded: { other: '追加する商品（{n} 点）' },
      statPaid: '{off}引き後の支払額',
      tagMust: '必須',
      tagAdd: '追加',
      noteShort:
        'リストの商品をすべて買っても {total}で、{target}まであと {short}足りません。{short}以上の商品をもう 1 つ加えると届きます。',
      noteLess: '必ず買う商品だけなら {must}です。{added}分を追加して {off}引きになると支払いは {paid}で、{diff}安くなります。',
      noteSame:
        '必ず買う商品だけなら {must}です。{added}分を追加して {off}引きになっても支払いは同じ {paid}なので、追加分は実質無料です。',
      noteMore:
        '必ず買う商品だけなら {must}です。目標に届かせて {off}引きにすると支払いは {paid}で、{diff}多くなります（追加する商品は {added}分）。使う予定のある商品なら得になります。',
      noteNoDiscount:
        '目標に届かせるために {added}分の商品を追加しています。送料無料が目的なら、送料のほうが安く、追加する商品を使う予定もない場合は、送料を払うほうが安く済みます。',
      altOver: '超過 {over}',
      altExact: 'ちょうど',
      altPaid: '支払い {paid}',
      addPrefix: '追加：',
      nameSeparator: '、',
      partSeparator: '・',
      tierHead: '{discount}引き：商品合計 {total}、支払い {paid}',
      tierRate: '全体で {pct}% 引き',
      tierBest: '割引率が最も高い',
      tiersNote: '割引率が高くても支払額は増えます。もともと買う予定の商品がある場合だけ、まとめ買いが得になります。',
      tiersSkipped: '金額が大きいため、さらに上の段階の計算は省略しました。',
      summaryTitle: '組み合わせの結果（目標 {target}）',
      summaryOver: '商品合計 {total}（超過 {over}）',
      summaryExact: '商品合計 {total}（ちょうど）',
      summaryShort: 'すべて買っても {total}（あと {short}）',
      summaryPaid: '{off}引き後の支払額 {paid}',
      summaryLine: '・{name} {price}',
      summaryMust: '（必ず買う）',
    },
  },
});

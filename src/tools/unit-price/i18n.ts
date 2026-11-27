import { defineToolI18n } from '../../i18n/tool';
import type { Dimension, DiscountKind, MoneyRounding, OptionField, UnitId } from './logic';

/** One entry of the unit menu. Count words (個, 片, sheets…) all map to the logic unit `count`. */
export interface UnitChoice {
  /** <option value>, also what is saved in the browser. Unique within a locale. */
  value: string;
  unit: UnitId;
  /** Text in the menu. */
  label: string;
  /** Name after "per" and after the number 1; `other` is used after any other number ("per sheet", "100 sheets"). */
  one: string;
  other: string;
}

interface UnitGroup {
  label: string;
  units: UnitChoice[];
}

interface Field {
  label: string;
  placeholder?: string;
  hint?: string;
}

/** One row of the sample list; `unit` is a UnitChoice value. */
export interface SampleRow {
  name: string;
  price: string;
  packs: string;
  amount: string;
  unit: string;
  shipping: string;
  discount: string;
}

export interface Strings {
  listAria: string;
  listHint: string;
  name: Field;
  price: Field;
  packs: Field;
  amount: Field;
  unitAria: string;
  /** Menu groups in display order (weight, volume, count). */
  unitGroups: UnitGroup[];
  moreSummary: string;
  shipping: Field;
  /** zh-TW enters a 折數 (85 = pay 85%); en / ja a percent off (20 = pay 80%). */
  discount: Field;
  remove: string;
  add: string;
  sample: string;
  clear: string;
  copy: string;
  resultsAria: string;
  client: {
    prefKey: string;
    units: UnitChoice[];
    /** UnitChoice value new rows start with. */
    defaultUnit: string;
    discountKind: DiscountKind;
    rounding: MoneyRounding;
    /** Count items cheaper than this per piece are quoted per 100 (see logic.ts BaseRule). */
    countPer100Below: number;
    /** {n} */
    money: string;
    moneyFormat: 'max2' | 'fixed2' | 'integer';
    /** Unit prices keep at least two decimals ($1.50, not $1.5). */
    unitPriceFixed: boolean;
    /** {n} */
    optionN: string;
    /** {unit} */
    perOne: string;
    /** {n} {unit} */
    perMany: string;
    /** Same two templates for g / kg / ml / L, where Japanese needs a space after the Latin symbol. Default: perOne / perMany. */
    perOneSymbol?: string;
    perManySymbol?: string;
    /** {base} {price} */
    unitLine: string;
    /** {n} {unit} */
    qty: string;
    /** {packs} {amount} {total} */
    qtyPacks: string;
    /** {money}: what is paid when a discount and / or shipping changed the listed price. */
    paidDiscount: string;
    paidShipping: string;
    paidBoth: string;
    bestTag: string;
    tieTag: string;
    allTied: string;
    /** {pct} {money} */
    more: string;
    emptyHint: string;
    singleHint: string;
    /** {list} */
    mixed: string;
    dimensions: Record<Dimension, string>;
    /** {list} */
    skipped: string;
    /** {list} */
    countWords: string;
    rowIncomplete: { price: string; amount: string };
    rowInvalid: Record<OptionField, string>;
    maxNote: string;
    /** {base} */
    summaryTitle: string;
    /** {rank} {name} {price} {note} */
    summaryLine: string;
    /** {name} {line} */
    summarySingle: string;
    sample: SampleRow[];
  };
}

const symbol = (value: string, unit: UnitId, label: string, name = label): UnitChoice => ({ value, unit, label, one: name, other: name });
const word = (value: string, one: string, other = one, label = other): UnitChoice => ({ value, unit: 'count', label, one, other });
const flat = (groups: UnitGroup[]) => groups.flatMap((g) => g.units);
const row = (name: string, price: string, packs: string, amount: string, unit: string, shipping = '', discount = ''): SampleRow => ({
  name,
  price,
  packs,
  amount,
  unit,
  shipping,
  discount,
});

const zhUnits: UnitGroup[] = [
  { label: '重量', units: [symbol('g', 'g', '公克 (g)', '公克'), symbol('kg', 'kg', '公斤 (kg)', '公斤')] },
  { label: '容量', units: [symbol('ml', 'ml', '毫升 (ml)', '毫升'), symbol('l', 'l', '公升 (L)', '公升')] },
  {
    label: '數量',
    units: [
      word('pc', '個'),
      word('sheet', '片'),
      word('pull', '抽'),
      word('leaf', '張'),
      word('pack', '包'),
      word('tablet', '顆'),
      word('roll', '捲'),
      word('bottle', '瓶'),
      word('can', '罐'),
      word('use', '次'),
    ],
  },
];

const enUnits: UnitGroup[] = [
  { label: 'Weight', units: [symbol('oz', 'oz', 'oz'), symbol('lb', 'lb', 'lb'), symbol('g', 'g', 'g'), symbol('kg', 'kg', 'kg')] },
  {
    label: 'Volume',
    units: [symbol('floz', 'floz', 'fl oz'), symbol('gal', 'gal', 'gal'), symbol('ml', 'ml', 'ml'), symbol('l', 'l', 'L')],
  },
  {
    label: 'Count',
    units: [
      word('pc', 'item', 'items'),
      word('sheet', 'sheet', 'sheets'),
      word('roll', 'roll', 'rolls'),
      word('tablet', 'tablet', 'tablets'),
      word('load', 'load', 'loads'),
      word('pack', 'pack', 'packs'),
    ],
  },
];

const jaUnits: UnitGroup[] = [
  { label: '重さ', units: [symbol('g', 'g', 'g'), symbol('kg', 'kg', 'kg')] },
  { label: '容量', units: [symbol('ml', 'ml', 'ml'), symbol('l', 'l', 'L')] },
  {
    label: '個数',
    units: [
      word('pc', '個'),
      word('sheet', '枚'),
      word('bottle', '本'),
      word('pack', '袋'),
      word('tablet', '錠'),
      word('roll', 'ロール'),
      word('pair', '組'),
      word('use', '回'),
    ],
  },
];

export default defineToolI18n<Strings>({
  'zh-TW': {
    listAria: '要比較的選項',
    listHint: '「包數」留空就當作 1 包；「每包內容量」填一包的重量、容量或數量。',
    name: { label: '名稱（選填）', placeholder: '名稱（選填）' },
    price: { label: '價格（元）', placeholder: '例如 199' },
    packs: { label: '包數', placeholder: '1' },
    amount: { label: '每包內容量', placeholder: '例如 100' },
    unitAria: '單位',
    unitGroups: zhUnits,
    moreSummary: '運費、折扣（選填）',
    shipping: { label: '運費（元）', placeholder: '0', hint: '會加進價格一起算單價' },
    discount: { label: '折數', placeholder: '例如 85', hint: '85 折填 85，8 折填 8；只折價格，不折運費' },
    remove: '移除',
    add: '新增選項',
    sample: '填入範例',
    clear: '清空',
    copy: '複製結果',
    resultsAria: '比較結果',
    client: {
      prefKey: 'unit-price',
      units: flat(zhUnits),
      defaultUnit: 'g',
      discountKind: 'zhe',
      rounding: 'none',
      countPer100Below: 1,
      money: '{n} 元',
      moneyFormat: 'max2',
      unitPriceFixed: false,
      optionN: '選項 {n}',
      perOne: '每{unit}',
      perMany: '每 {n} {unit}',
      unitLine: '{base} {price}',
      qty: '{n} {unit}',
      qtyPacks: '{packs} × {amount}＝{total}',
      paidDiscount: '折扣後 {money}',
      paidShipping: '含運費 {money}',
      paidBoth: '折扣後含運費 {money}',
      bestTag: '最划算',
      tieTag: '並列最划算',
      allTied: '單價都一樣',
      more: '貴 {pct}%，同樣份量多花 {money}',
      emptyHint: '填好至少兩個選項的價格與每包內容量，就會算出各自的單價並標出最划算的一個。也可以按「填入範例」先看看結果。',
      singleHint: '再填一個選項，就能比較哪個比較划算。',
      mixed: '這些選項的單位不是同一類（{list}）。重量、容量和數量之間無法互相換算，所以不排名；請把要比較的選項改成同一類單位。',
      dimensions: { count: '數量', weight: '重量', volume: '容量' },
      skipped: '沒有列入比較：{list}（還沒填完，或有欄位無法計算）。',
      countWords: '這些選項用了不同的計數單位（{list}），這裡把每個單位都當成「一個」來比，請確認它們數的是同一種東西。',
      rowIncomplete: { price: '填入價格後才會列入比較。', amount: '填入每包內容量後才會列入比較。' },
      rowInvalid: {
        price: '價格請填大於 0 的數字。',
        amount: '每包內容量請填大於 0 的數字。',
        packs: '包數請填大於 0 的數字，只有一包可以留空。',
        shipping: '運費請填 0 以上的數字。',
        discount: '折數請填 1 到 99 之間，例如 85 折填 85、8 折填 8。',
      },
      maxNote: '最多可以比較 6 個選項。',
      summaryTitle: '單價比較（{base}）',
      summaryLine: '{rank}. {name}：{price}（{note}）',
      summarySingle: '{name}：{line}',
      sample: [
        row('小包裝 12 包', '199', '12', '100', 'pull'),
        row('大包裝 24 包', '419', '24', '110', 'pull'),
        row('網購 36 包（9 折加運費）', '629', '36', '100', 'pull', '60', '9'),
      ],
    },
  },
  en: {
    listAria: 'Options to compare',
    listHint: 'Leave “Packs” blank for a single item. “Size per pack” is the weight, volume or count of one pack.',
    name: { label: 'Name (optional)', placeholder: 'Name (optional)' },
    price: { label: 'Price ($)', placeholder: 'e.g. 4.29' },
    packs: { label: 'Packs', placeholder: '1' },
    amount: { label: 'Size per pack', placeholder: 'e.g. 12' },
    unitAria: 'Unit',
    unitGroups: enUnits,
    moreSummary: 'Shipping and discount (optional)',
    shipping: { label: 'Shipping ($)', placeholder: '0.00', hint: 'Added to the price before dividing' },
    discount: { label: 'Discount (% off)', placeholder: 'e.g. 20', hint: 'For 20% off, enter 20. Applies to the price, not to shipping' },
    remove: 'Remove',
    add: 'Add option',
    sample: 'Fill in an example',
    clear: 'Clear',
    copy: 'Copy result',
    resultsAria: 'Comparison result',
    client: {
      prefKey: 'unit-price:en',
      units: flat(enUnits),
      defaultUnit: 'oz',
      discountKind: 'percent',
      rounding: 'cent',
      countPer100Below: 0.1,
      money: '${n}',
      moneyFormat: 'fixed2',
      unitPriceFixed: true,
      optionN: 'Option {n}',
      perOne: 'per {unit}',
      perMany: 'per {n} {unit}',
      unitLine: '{price} {base}',
      qty: '{n} {unit}',
      qtyPacks: '{packs} × {amount} = {total}',
      paidDiscount: '{money} after discount',
      paidShipping: '{money} with shipping',
      paidBoth: '{money} after discount, with shipping',
      bestTag: 'Best value',
      tieTag: 'Tied for best value',
      allTied: 'Same unit price',
      more: '{pct}% more, {money} extra for the same amount',
      emptyHint:
        'Enter a price and a size for at least two options to see each unit price and which one is the better deal. Or tap “Fill in an example” to see how it works.',
      singleHint: 'Add one more option to see which is the better deal.',
      mixed:
        'These options are measured in different ways ({list}). Weight, volume and count cannot be converted into each other, so they are not ranked. Use the same kind of unit for everything you want to compare.',
      dimensions: { count: 'count', weight: 'weight', volume: 'volume' },
      skipped: 'Not compared: {list}. Something is still blank or cannot be used.',
      countWords: 'These options use different count units ({list}). Each one is treated as a single item, so check that they count the same thing.',
      rowIncomplete: { price: 'Enter a price to include this option.', amount: 'Enter a size to include this option.' },
      rowInvalid: {
        price: 'Price must be a number above 0.',
        amount: 'Size must be a number above 0.',
        packs: 'Packs must be a number above 0. Leave it blank for a single pack.',
        shipping: 'Shipping must be 0 or more.',
        discount: 'Discount must be at least 0 and less than 100 (% off).',
      },
      maxNote: 'You can compare up to 6 options.',
      summaryTitle: 'Unit price comparison ({base})',
      summaryLine: '{rank}. {name}: {price} ({note})',
      summarySingle: '{name}: {line}',
      sample: [
        row('92 fl oz bottle', '12.97', '1', '92', 'floz'),
        row('154 fl oz jug', '19.94', '1', '154', 'floz'),
        row('Online 2-pack, 15% off', '27.98', '2', '100', 'floz', '5.99', '15'),
      ],
    },
  },
  ja: {
    listAria: '比べる商品',
    listHint: '「パック数」は空欄なら 1 として計算します。「1 パックの内容量」には 1 パック分の重さ・容量・個数を入力してください。',
    name: { label: '名前（任意）', placeholder: '名前（任意）' },
    price: { label: '価格（円）', placeholder: '例：398' },
    packs: { label: 'パック数', placeholder: '1' },
    amount: { label: '1 パックの内容量', placeholder: '例：500' },
    unitAria: '単位',
    unitGroups: jaUnits,
    moreSummary: '送料・割引（任意）',
    shipping: { label: '送料（円）', placeholder: '0', hint: '価格に足してから単価を計算します' },
    discount: { label: '割引（%オフ）', placeholder: '例：20', hint: '20%オフも 2 割引も 20 と入力。送料には適用しません' },
    remove: '削除',
    add: '商品を追加',
    sample: '例を入力',
    clear: 'クリア',
    copy: '結果をコピー',
    resultsAria: '比較結果',
    client: {
      prefKey: 'unit-price:ja',
      units: flat(jaUnits),
      defaultUnit: 'g',
      discountKind: 'percent',
      rounding: 'floor',
      countPer100Below: 1,
      money: '{n}円',
      moneyFormat: 'integer',
      unitPriceFixed: false,
      optionN: '商品 {n}',
      perOne: '1 {unit}あたり',
      perMany: '{n} {unit}あたり',
      perOneSymbol: '1 {unit} あたり',
      perManySymbol: '{n} {unit} あたり',
      unitLine: '{base} {price}',
      qty: '{n} {unit}',
      qtyPacks: '{packs} × {amount} = {total}',
      paidDiscount: '割引後 {money}',
      paidShipping: '送料込み {money}',
      paidBoth: '割引後・送料込み {money}',
      bestTag: 'いちばんお得',
      tieTag: '同じ単価でいちばんお得',
      allTied: '単価はどれも同じです',
      more: '{pct}% 割高、同じ量で約 {money}高い',
      emptyHint:
        '2 つ以上の商品の価格と内容量を入力すると、それぞれの単価を計算して、いちばんお得な商品を表示します。「例を入力」で試すこともできます。',
      singleHint: 'もう 1 つ入力すると、どちらがお得か比べられます。',
      mixed:
        '単位の種類がそろっていません（{list}）。重さ・容量・個数のあいだは換算できないため、順位は表示しません。比べたい商品は同じ種類の単位で入力してください。',
      dimensions: { count: '個数', weight: '重さ', volume: '容量' },
      skipped: '比較に含めていない商品：{list}（未入力の項目か、計算できない値があります）。',
      countWords: '個数の単位が商品によって違います（{list}）。どれも「1 つ」として比べているので、同じものを数えているか確認してください。',
      rowIncomplete: { price: '価格を入力すると比較に加わります。', amount: '内容量を入力すると比較に加わります。' },
      rowInvalid: {
        price: '価格は 0 より大きい数値で入力してください。',
        amount: '内容量は 0 より大きい数値で入力してください。',
        packs: 'パック数は 0 より大きい数値で入力してください。1 パックなら空欄でかまいません。',
        shipping: '送料は 0 以上の数値で入力してください。',
        discount: '割引は 0 以上 100 未満（%オフ）で入力してください。',
      },
      maxNote: '比べられるのは 6 つまでです。',
      summaryTitle: '単価の比較（{base}）',
      summaryLine: '{rank}. {name}：{price}（{note}）',
      summarySingle: '{name}：{line}',
      sample: [
        row('64 枚入り', '1580', '1', '64', 'sheet'),
        row('58 枚 × 3 パック', '4380', '3', '58', 'sheet'),
        row('通販 64 枚 × 4 パック（5%オフ）', '6280', '4', '64', 'sheet', '', '5'),
      ],
    },
  },
});

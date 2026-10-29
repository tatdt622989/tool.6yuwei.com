import type { CategoryKey } from '../tools/unit-converter/logic';

/**
 * Long-tail landing pages: one page per popular "A 轉 B" search, served at /convert/<slug>/.
 * Each pair needs a hand-written `note` so pages carry unique, useful content.
 */
export interface ConversionPair {
  slug: string;
  category: CategoryKey;
  from: string;
  to: string;
  /** Primary search phrase, used in H1 and title. */
  keyword: string;
  /** Other phrasings people search. */
  aliases: string[];
  /** Unique context: where this conversion comes up, gotchas. 80–200 chars. */
  note: string;
  /** Values (in `from` units) for the reference table. */
  values: number[];
  /** Render results as feet + inches (height). */
  display?: 'feet-inches';
}

const range = (start: number, end: number, step: number) =>
  Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) => +(start + i * step).toFixed(6));

export const pairs: ConversionPair[] = [
  // ---- length
  {
    slug: 'cm-to-inch',
    category: 'length',
    from: 'cm',
    to: 'in',
    keyword: '公分轉英吋',
    aliases: ['公分換英吋', 'cm 轉 inch', '公分等於幾吋', 'cm to inch'],
    note: '買褲子看腰圍、選螢幕與行李箱尺寸時最常需要公分轉英吋。英吋（inch，台灣也常簡稱「吋」）自 1959 年起被國際定義為精確的 2.54 公分，所以換算結果是固定的，不會因國家不同而改變。',
    values: [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100],
  },
  {
    slug: 'inch-to-cm',
    category: 'length',
    from: 'in',
    to: 'cm',
    keyword: '英吋轉公分',
    aliases: ['吋轉公分', '英吋換公分', '一吋幾公分', 'inch to cm'],
    note: '電視、手機、筆電螢幕的「吋」指的是螢幕對角線長度；褲子尺寸 W30 代表腰圍 30 吋。1 英吋＝2.54 公分，例如 55 吋電視的對角線約為 139.7 公分。',
    values: [1, 2, 5, 6, 10, 13, 14, 15, 24, 27, 28, 30, 32, 34, 43, 55, 65, 75],
  },
  {
    slug: 'cm-to-feet',
    category: 'length',
    from: 'cm',
    to: 'ft',
    keyword: '身高公分轉英呎',
    aliases: ['公分轉英尺', '身高換算英呎', 'cm 轉 ft', '170 公分幾呎'],
    note: '填寫國外表單、交友軟體或看美國球員資料時，身高常以「5 呎 7 吋」（5′7″）表示。1 英呎＝12 英吋＝30.48 公分，下表同時列出英呎小數與「呎＋吋」寫法。',
    values: range(150, 195, 5),
    display: 'feet-inches',
  },
  {
    slug: 'feet-to-cm',
    category: 'length',
    from: 'ft',
    to: 'cm',
    keyword: '英呎轉公分',
    aliases: ['英尺轉公分', '呎轉公分', '一呎幾公分', 'ft to cm'],
    note: '1 英呎（foot，複數 feet）＝30.48 公分。注意台灣傳統木工與裝潢用的「台尺」是另一種單位，1 台尺約 30.3 公分，與英呎相差不多但不相同，丈量時別混用。',
    values: [1, 2, 3, 4, 5, 5.5, 6, 6.5, 7, 8, 10, 20, 50, 100],
  },
  {
    slug: 'm-to-feet',
    category: 'length',
    from: 'm',
    to: 'ft',
    keyword: '公尺轉英呎',
    aliases: ['公尺換英尺', 'm 轉 ft', '米轉英尺', 'meter to feet'],
    note: '飛行高度、遊艇長度與美式建築圖面常用英呎。1 公尺約等於 3.2808 英呎，粗估時可用「公尺 × 3.3」心算，例如 100 公尺約 330 英呎。',
    values: [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 500, 1000, 3000, 10000],
  },
  {
    slug: 'km-to-mile',
    category: 'length',
    from: 'km',
    to: 'mi',
    keyword: '公里轉英里',
    aliases: ['公里換英哩', 'km 轉 mile', '公里等於幾英里', 'km to miles'],
    note: '跑步配速、美國公路速限與里程常以英里表示。1 英里＝1.609344 公里，所以 5K 約 3.11 英里、全程馬拉松 42.195 公里約 26.2 英里。',
    values: [1, 3, 5, 10, 21.0975, 42.195, 50, 100, 200, 500, 1000],
  },
  {
    slug: 'mile-to-km',
    category: 'length',
    from: 'mi',
    to: 'km',
    keyword: '英里轉公里',
    aliases: ['英哩轉公里', 'mile 轉 km', '一英里幾公里', 'miles to km'],
    note: '美國與英國的道路標誌使用英里。1 英里約 1.609 公里，心算時可用「英里 × 1.6」；例如速限 65 mph 約等於時速 105 公里。',
    values: [1, 2, 5, 10, 13.1, 26.2, 50, 65, 100, 500, 1000],
  },
  {
    slug: 'mm-to-inch',
    category: 'length',
    from: 'mm',
    to: 'in',
    keyword: '公釐轉英吋',
    aliases: ['mm 轉 inch', '毫米轉英吋', 'mm 換 吋'],
    note: '螺絲、水管、鏡頭與工具規格常同時標示公釐與英吋。1 英吋＝25.4 公釐，例如 1/4 吋螺絲約 6.35 mm，常見的相機腳架螺絲即是 1/4 吋。',
    values: [1, 3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 50, 100],
  },
  {
    slug: 'taichi-to-cm',
    category: 'length',
    from: 'taichi',
    to: 'cm',
    keyword: '台尺轉公分',
    aliases: ['台尺換公分', '一台尺幾公分', '台尺 公分'],
    note: '台尺源自日治時期的曲尺，1 台尺＝10/33 公尺，約 30.303 公分，1 台尺＝10 台寸。木作、系統櫃與傳統建材報價仍常以台尺計算。',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20],
  },
  // ---- weight
  {
    slug: 'kg-to-lb',
    category: 'weight',
    from: 'kg',
    to: 'lb',
    keyword: '公斤轉磅',
    aliases: ['公斤換磅', 'kg 轉 lb', '一公斤幾磅', 'kg to lbs'],
    note: '健身器材、航空行李限重與美國食譜常用磅（lb）。1 磅的國際定義為精確的 0.45359237 公斤，所以 1 公斤約 2.2046 磅；23 公斤的託運行李約 50.7 磅。',
    values: [1, 2, 5, 10, 20, 23, 30, 40, 50, 60, 70, 80, 90, 100],
  },
  {
    slug: 'lb-to-kg',
    category: 'weight',
    from: 'lb',
    to: 'kg',
    keyword: '磅轉公斤',
    aliases: ['磅換公斤', 'lb 轉 kg', '一磅幾公斤', 'lbs to kg'],
    note: '槓鈴片、啞鈴與國外體重數據常以磅標示。換算時可用「磅 × 0.4536」，心算可先除以 2 再減掉約 10%，例如 150 磅約 68 公斤。',
    values: [1, 5, 10, 20, 25, 45, 50, 100, 120, 150, 180, 200, 250],
  },
  {
    slug: 'jin-to-kg',
    category: 'weight',
    from: 'jin',
    to: 'kg',
    keyword: '台斤轉公斤',
    aliases: ['一台斤幾公斤', '台斤換公斤', '斤轉公斤', '台斤 公克'],
    note: '台灣傳統市場、水果攤與茶葉買賣仍以台斤計價。1 台斤＝600 公克＝16 兩，和中國大陸的「市斤」（500 公克）不同，看簡體網站食譜時要特別注意。',
    values: [0.5, 1, 1.5, 2, 3, 5, 10, 20, 50, 100],
  },
  {
    slug: 'kg-to-jin',
    category: 'weight',
    from: 'kg',
    to: 'jin',
    keyword: '公斤轉台斤',
    aliases: ['公斤換台斤', '一公斤幾台斤', 'kg 轉 台斤'],
    note: '1 公斤約等於 1.6667 台斤，也就是 5 公斤剛好是 8 台斤 5 兩多一點。體重若以台斤說，60 公斤就是 100 台斤，這也是長輩常說「一百斤」的來源。',
    values: [0.5, 1, 2, 3, 5, 10, 30, 50, 60, 70, 80, 100],
  },
  {
    slug: 'liang-to-g',
    category: 'weight',
    from: 'liang',
    to: 'g',
    keyword: '一兩幾克',
    aliases: ['兩轉公克', '台兩 公克', '一兩等於幾公克', '黃金一兩幾克'],
    note: '台灣 1 兩＝37.5 公克，1 兩＝10 錢，1 錢＝3.75 公克。買賣黃金、中藥與茶葉常以兩、錢計價；銀樓報價的「一錢金價」即是 3.75 公克的價格。',
    values: [0.1, 0.5, 1, 2, 3, 4, 5, 8, 10, 16],
  },
  {
    slug: 'oz-to-g',
    category: 'weight',
    from: 'oz',
    to: 'g',
    keyword: '盎司轉公克',
    aliases: ['oz 轉 g', '一盎司幾克', '盎司換公克', 'ounce to gram'],
    note: '牛排、咖啡豆與國外食譜常用常衡盎司（oz），1 盎司約 28.35 公克。注意貴金屬報價用的是「金衡盎司」（troy oz），約 31.1 公克，兩者不同。',
    values: [1, 2, 4, 6, 8, 10, 12, 16, 20, 32],
  },
  // ---- temperature
  {
    slug: 'celsius-to-fahrenheit',
    category: 'temperature',
    from: 'c',
    to: 'f',
    keyword: '攝氏轉華氏',
    aliases: ['攝氏換華氏', '°C 轉 °F', '攝氏華氏換算', 'celsius to fahrenheit'],
    note: '美國的天氣預報、烤箱與體溫計使用華氏。公式是 °F＝°C × 9/5 ＋ 32；水的冰點 0°C 是 32°F，沸點 100°C 是 212°F，正常體溫 37°C 約 98.6°F。',
    values: [-20, -10, 0, 10, 20, 25, 30, 35, 36.5, 37, 38, 40, 100, 180, 200, 220],
  },
  {
    slug: 'fahrenheit-to-celsius',
    category: 'temperature',
    from: 'f',
    to: 'c',
    keyword: '華氏轉攝氏',
    aliases: ['華氏換攝氏', '°F 轉 °C', '華氏幾度是攝氏', 'fahrenheit to celsius'],
    note: '公式是 °C＝(°F − 32) × 5/9。心算可以「減 30 再除以 2」粗估，例如 80°F 粗估約 25°C（精確值 26.7°C）；美國食譜常見的烤箱溫度 350°F 約 177°C。',
    values: [0, 32, 50, 60, 70, 80, 90, 98.6, 100, 212, 300, 350, 400, 450],
  },
  // ---- area
  {
    slug: 'sqft-to-ping',
    category: 'area',
    from: 'ft2',
    to: 'ping',
    keyword: '平方英尺轉坪',
    aliases: ['平方呎轉坪', '才 坪', 'sqft 轉 坪', '平方英呎換坪數'],
    note: '香港、美國房地產以平方英尺（sq ft，香港俗稱「呎」）計算面積。1 坪約 35.58 平方英尺，例如香港 500 呎的單位約 14 坪。',
    values: [100, 300, 500, 700, 1000, 1500, 2000, 3000],
  },
  {
    slug: 'hectare-to-ping',
    category: 'area',
    from: 'ha',
    to: 'ping',
    keyword: '公頃轉坪',
    aliases: ['一公頃幾坪', '公頃換坪', '公頃 坪 換算'],
    note: '農地、林地與土地開發面積常以公頃表示。1 公頃＝10,000 平方公尺，約 3,025 坪，約 1.03 甲；買賣農地時常需在公頃、甲、坪之間換算。',
    values: [0.1, 0.5, 1, 2, 5, 10, 50, 100],
  },
  // ---- volume
  {
    slug: 'ml-to-oz',
    category: 'volume',
    from: 'ml',
    to: 'floz',
    keyword: '毫升轉盎司',
    aliases: ['ml 轉 oz', 'cc 轉 盎司', '毫升換液量盎司', 'ml to oz'],
    note: '奶瓶、香水、保養品與飲料杯容量常同時標示 ml 與 fl oz。1 美制液量盎司約 29.57 毫升；1 cc 等於 1 ml。英制液量盎司約 28.41 毫升，與美制略有差異。',
    values: [10, 30, 50, 100, 120, 150, 180, 240, 350, 500, 700, 1000],
  },
  {
    slug: 'gallon-to-liter',
    category: 'volume',
    from: 'usgal',
    to: 'l',
    keyword: '加侖轉公升',
    aliases: ['一加侖幾公升', '加侖換公升', 'gallon to liter', 'gal 轉 L'],
    note: '美制 1 加侖＝3.785411784 公升，英制 1 加侖＝4.54609 公升。美國油價、牛奶與油漆桶用的是美制加侖；Costco 的一加侖牛奶約 3.79 公升。',
    values: [0.5, 1, 2, 3, 5, 10, 20, 50, 100],
  },
  {
    slug: 'cup-to-ml',
    category: 'volume',
    from: 'cup',
    to: 'ml',
    keyword: '一杯幾毫升',
    aliases: ['cup 轉 ml', '量杯 毫升', '一杯幾cc', '1 cup 幾 ml'],
    note: '美式烘焙食譜的 1 cup 約 236.6 毫升；台灣與日本量杯多為 200 ml 或 240 ml，照國外食譜做甜點前，先確認量杯規格。1 大匙＝15 ml、1 小匙＝5 ml。',
    values: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2, 3, 4],
  },
  // ---- speed
  {
    slug: 'kmh-to-mph',
    category: 'speed',
    from: 'kmh',
    to: 'mph',
    keyword: '公里時速轉英里',
    aliases: ['km/h 轉 mph', '時速公里換英里', 'kmh to mph'],
    note: '跑步機、汽車儀表與棒球球速常在 km/h 與 mph 之間切換。1 mph 約 1.609 km/h，例如球速 150 km/h 約 93 mph，台灣高速公路速限 110 km/h 約 68 mph。',
    values: [10, 30, 50, 60, 80, 100, 110, 120, 150, 200, 300],
  },
  {
    slug: 'mph-to-kmh',
    category: 'speed',
    from: 'mph',
    to: 'kmh',
    keyword: '英里時速轉公里',
    aliases: ['mph 轉 km/h', 'mph 換算時速', 'mph to kmh'],
    note: '美國職棒轉播的球速以 mph 表示，100 mph 的快速球約 161 km/h。換算公式為 km/h＝mph × 1.609344。',
    values: [5, 10, 25, 30, 55, 65, 70, 80, 90, 95, 100, 105],
  },
  {
    slug: 'knot-to-kmh',
    category: 'speed',
    from: 'kn',
    to: 'kmh',
    keyword: '節轉公里時速',
    aliases: ['一節幾公里', '節 km/h', 'knot 轉 km/h', '颱風風速 節'],
    note: '航海、航空與颱風風速常以「節」（knot）表示，1 節＝每小時 1 海里＝1.852 km/h。中央氣象署發布颱風資訊時也會同時列出公尺／秒與蒲福風級。',
    values: [1, 5, 10, 20, 30, 34, 50, 64, 100, 150],
  },
  // ---- data
  {
    slug: 'gb-to-mb',
    category: 'data',
    from: 'gb',
    to: 'mb',
    keyword: 'GB 轉 MB',
    aliases: ['1GB 幾 MB', 'GB 換 MB', 'GB MB 換算'],
    note: '電信業者與硬碟廠商使用十進位：1 GB＝1,000 MB；但 Windows 顯示容量時用的是二進位（1 GiB＝1,024 MiB）卻仍標示為 GB，這就是 1 TB 硬碟在電腦上只顯示約 931 GB 的原因。',
    values: [0.5, 1, 2, 5, 10, 16, 32, 64, 128, 256, 512],
  },
  {
    slug: 'tb-to-gb',
    category: 'data',
    from: 'tb',
    to: 'gb',
    keyword: 'TB 轉 GB',
    aliases: ['1TB 幾 GB', 'TB 換 GB', 'TB GB 換算'],
    note: '以十進位計算 1 TB＝1,000 GB，這是硬碟與雲端空間的標示方式。若想知道作業系統實際顯示的容量，可改用單位換算工具中的 GiB 計算。',
    values: [0.5, 1, 2, 4, 8, 10, 16, 20],
  },
];

export function getPair(slug: string): ConversionPair {
  const pair = pairs.find((p) => p.slug === slug);
  if (!pair) throw new Error(`Unknown conversion pair: ${slug}`);
  return pair;
}

export function convertPath(slug: string): string {
  return `/convert/${slug}/`;
}

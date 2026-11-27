import { defineToolI18n } from '../../i18n/tool';
import { CURRENCIES, type Currency } from './logic';

export interface Strings {
  /** Options in the currency pickers, in this market's order of interest. */
  currencies: Currency[];
  defaultFrom: string;
  defaultTo: string;
  amountLabel: string;
  fromLabel: string;
  toLabel: string;
  swapAria: string;
  loading: string;
  copyResult: string;
  quickTitle: string;
  commonTitle: string;
  commonHead: [string, string, string];
  /** Hint text around the required "Rates By Exchange Rate API" link. */
  hintBefore: string;
  hintAfter: string;
  client: {
    prefKey: string;
    /** Home currency: the comparison table lists 1 unit of each common currency in it. */
    home: string;
    common: string[];
    /** Currency names by code for result lines and tables. */
    names: Record<string, string>;
    /** IANA zone for the "updated" timestamp; omitted = the visitor's own zone. */
    timeZone?: string;
    /** Append the zone abbreviation (en, where the visitor's zone is used). */
    timeZoneName?: boolean;
    noRate: string;
    enterNumber: string;
    /** {a} {fromName} {value} {toName} {from} {to} {r1} {r2} */
    rateLine: string;
    /** {time} */
    updated: string;
    unknown: string;
    /** {time} */
    cached: string;
    offline: string;
    /** {name} {code} */
    quickHead: string;
    /** {name} {code} */
    commonCell: string;
  };
}

const names = (list: Currency[]) => Object.fromEntries(list.map((c) => [c.code, c.name]));

const EN: Currency[] = [
  { code: 'USD', name: 'US dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'MXN', name: 'Mexican peso' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'INR', name: 'Indian rupee' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'KRW', name: 'South Korean won' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'NZD', name: 'New Zealand dollar' },
  { code: 'BRL', name: 'Brazilian real' },
  { code: 'PHP', name: 'Philippine peso' },
  { code: 'THB', name: 'Thai baht' },
  { code: 'VND', name: 'Vietnamese dong' },
  { code: 'TWD', name: 'Taiwan dollar' },
  { code: 'SEK', name: 'Swedish krona' },
  { code: 'NOK', name: 'Norwegian krone' },
  { code: 'DKK', name: 'Danish krone' },
  { code: 'PLN', name: 'Polish zloty' },
  { code: 'ILS', name: 'Israeli shekel' },
  { code: 'AED', name: 'UAE dirham' },
  { code: 'TRY', name: 'Turkish lira' },
  { code: 'ZAR', name: 'South African rand' },
  { code: 'DOP', name: 'Dominican peso' },
];

const JA: Currency[] = [
  { code: 'JPY', name: '日本円' },
  { code: 'USD', name: '米ドル' },
  { code: 'EUR', name: 'ユーロ' },
  { code: 'GBP', name: '英ポンド' },
  { code: 'AUD', name: '豪ドル' },
  { code: 'CAD', name: 'カナダドル' },
  { code: 'NZD', name: 'NZ ドル' },
  { code: 'CHF', name: 'スイスフラン' },
  { code: 'CNY', name: '人民元' },
  { code: 'KRW', name: '韓国ウォン' },
  { code: 'TWD', name: '台湾ドル' },
  { code: 'HKD', name: '香港ドル' },
  { code: 'SGD', name: 'シンガポールドル' },
  { code: 'THB', name: 'タイバーツ' },
  { code: 'VND', name: 'ベトナムドン' },
  { code: 'PHP', name: 'フィリピンペソ' },
  { code: 'IDR', name: 'インドネシアルピア' },
  { code: 'MYR', name: 'マレーシアリンギット' },
  { code: 'INR', name: 'インドルピー' },
  { code: 'MXN', name: 'メキシコペソ' },
  { code: 'BRL', name: 'ブラジルレアル' },
  { code: 'TRY', name: 'トルコリラ' },
  { code: 'ZAR', name: '南アフリカランド' },
  { code: 'AED', name: 'UAE ディルハム' },
  { code: 'SEK', name: 'スウェーデンクローナ' },
];

export default defineToolI18n<Strings>({
  'zh-TW': {
    currencies: CURRENCIES,
    defaultFrom: 'USD',
    defaultTo: 'TWD',
    amountLabel: '金額',
    fromLabel: '從',
    toLabel: '換成',
    swapAria: '交換幣別',
    loading: '正在取得最新匯率…',
    copyResult: '複製結果',
    quickTitle: '快速對照',
    commonTitle: '常用貨幣兌新台幣（中價參考）',
    commonHead: ['幣別', '1 單位 = 新台幣', '1 新台幣 ='],
    hintBefore: '匯率為國際市場中價參考匯率，每日更新，資料來源：',
    hintAfter: '。銀行實際買賣的即期與現金匯率會加上價差，換匯前請以銀行牌告為準。輸入的金額只在你的瀏覽器內計算。',
    client: {
      prefKey: 'exchange-rate',
      home: 'TWD',
      common: ['USD', 'JPY', 'EUR', 'CNY', 'HKD', 'KRW', 'GBP', 'AUD', 'SGD', 'THB', 'VND', 'MYR', 'PHP', 'CAD'],
      names: names(CURRENCIES),
      timeZone: 'Asia/Taipei',
      noRate: '暫無此幣別的匯率資料。',
      enterNumber: '請輸入數字',
      rateLine: '{a} {fromName} ＝ {value} {toName}｜1 {from} = {r1} {to}，1 {to} = {r2} {from}',
      updated: '匯率更新時間：{time}（台灣時間）',
      unknown: '未知',
      cached: '目前無法連線取得最新匯率，以下使用 {time} 的快取資料。',
      offline: '目前無法取得匯率資料，可能是網路離線。請確認連線後重新整理頁面。',
      quickHead: '{name}（{code}）',
      commonCell: '{name} {code}',
    },
  },
  en: {
    currencies: EN,
    defaultFrom: 'USD',
    defaultTo: 'EUR',
    amountLabel: 'Amount',
    fromLabel: 'From',
    toLabel: 'To',
    swapAria: 'Swap currencies',
    loading: 'Getting the latest rates…',
    copyResult: 'Copy result',
    quickTitle: 'Quick conversion table',
    commonTitle: 'Major currencies vs. the US dollar (mid-market)',
    commonHead: ['Currency', '1 unit in USD', 'Per 1 USD'],
    hintBefore: 'Mid-market reference rates, updated once a day. Source: ',
    hintAfter:
      '. Banks, card networks and money transfer services add their own spread and fees, so the amount you actually receive will differ. Amounts you enter are converted in your browser and never sent anywhere.',
    client: {
      prefKey: 'exchange-rate:en',
      home: 'USD',
      common: ['EUR', 'GBP', 'CAD', 'MXN', 'JPY', 'CNY', 'INR', 'AUD', 'CHF', 'KRW', 'HKD', 'SGD', 'PHP', 'BRL'],
      names: names(EN),
      timeZoneName: true,
      noRate: 'No rate is available for this currency right now.',
      enterNumber: 'Enter a number',
      rateLine: '1 {from} = {r1} {to} · 1 {to} = {r2} {from}',
      updated: 'Rates updated {time}',
      unknown: 'unknown',
      cached: 'Can’t reach the rate service right now. Showing saved rates from {time}.',
      offline: 'Exchange rates couldn’t be loaded. You may be offline. Check your connection and reload the page.',
      quickHead: '{name} ({code})',
      commonCell: '{name} ({code})',
    },
  },
  ja: {
    currencies: JA,
    defaultFrom: 'USD',
    defaultTo: 'JPY',
    amountLabel: '金額',
    fromLabel: '換算元',
    toLabel: '換算先',
    swapAria: '通貨を入れ替える',
    loading: '最新の為替レートを取得しています…',
    copyResult: '結果をコピー',
    quickTitle: '早見表',
    commonTitle: '主要通貨の対円レート（仲値の参考）',
    commonHead: ['通貨', '1 通貨あたりの円', '1 円あたり'],
    hintBefore: '表示しているのは市場の中値（仲値）に近い参考レートで、1 日 1 回更新されます。出典：',
    hintAfter:
      '。銀行の外貨両替や外貨預金では TTS・TTB や手数料が加わるため、実際に受け取る金額とは異なります。入力した金額はブラウザ内だけで計算されます。',
    client: {
      prefKey: 'exchange-rate:ja',
      home: 'JPY',
      common: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW', 'TWD', 'HKD', 'SGD', 'THB', 'VND', 'PHP'],
      names: names(JA),
      timeZone: 'Asia/Tokyo',
      noRate: 'この通貨のレートは現在取得できません。',
      enterNumber: '数字を入力してください',
      rateLine: '{a} {fromName} ＝ {value} {toName}｜1 {from} = {r1} {to}、1 {to} = {r2} {from}',
      updated: 'レート更新日時：{time}（日本時間）',
      unknown: '不明',
      cached: '最新レートを取得できないため、{time} 時点の保存データで計算しています。',
      offline: '為替レートを取得できませんでした。オフラインの可能性があります。接続を確認してページを再読み込みしてください。',
      quickHead: '{name}（{code}）',
      commonCell: '{name} {code}',
    },
  },
});

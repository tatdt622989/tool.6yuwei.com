// UI strings for the keyboard tester. Each locale also picks the physical layout it draws:
// US ANSI for zh-TW and en, Japanese JIS (半角/全角, 無変換, 変換, かな, ¥, ろ) for ja.
import { defineToolI18n } from '../../i18n/tool';
import type { DisplayKeyLabels, LayoutId, RolloverTexts } from './logic';

export interface Strings {
  numpad: string;
  reset: string;
  areaAria: string;
  prompt: string;
  statDown: string;
  statMax: string;
  statTested: string;
  statPresses: string;
  location: string;
  heldLabel: string;
  extraLabel: string;
  footnote: string;
  client: {
    layout: LayoutId;
    none: string;
    locations: [string, string, string, string];
    keys: DisplayKeyLabels;
    rollover: RolloverTexts;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    numpad: '顯示數字鍵盤',
    reset: '重新測試',
    areaAria: '鍵盤測試區，聚焦後按下任意按鍵',
    prompt: '點一下這裡，然後開始按鍵盤',
    statDown: '目前按住',
    statMax: '最多同時按下',
    statTested: '已測試按鍵',
    statPresses: '按鍵次數',
    location: '位置 location',
    heldLabel: '目前按住的按鍵',
    extraLabel: '鍵盤圖以外的按鍵',
    footnote:
      '亮色框為目前按住的按鍵，綠色為已測試過的按鍵。Fn 鍵與部分多媒體鍵由鍵盤硬體或系統處理，瀏覽器收不到，無法顯示是正常現象。所有按鍵資料只在你的瀏覽器中處理。',
    client: {
      layout: 'ansi',
      none: '（無）',
      locations: ['標準', '左側', '右側', '數字鍵盤'],
      keys: { space: 'Space（空白）', empty: '（空）' },
      rollover: {
        none: '同時按住多個鍵（例如 A、S、D、F 加 J、K、L），即可測出鍵盤最多能同時辨識幾個按鍵。',
        low: '目前最多同時偵測到 {max} 個鍵。若你實際按下更多鍵卻沒有全部亮起，表示這組按鍵有衝突（鬼鍵限制），常見於文書鍵盤與筆電鍵盤。',
        six: '目前最多同時偵測到 {max} 個鍵。一般 USB 鍵盤至少支援 6 鍵無衝突（6KRO），多數遊戲情境已足夠。',
        nkro: '目前最多同時偵測到 {max} 個鍵，超過 6 鍵，代表這把鍵盤支援 N 鍵無衝突（NKRO，全鍵無衝）。',
      },
    },
  },
  en: {
    numpad: 'Show numpad',
    reset: 'Reset',
    areaAria: 'Keyboard test area. Focus it, then press any key',
    prompt: 'Click here, then start pressing keys',
    statDown: 'Held now',
    statMax: 'Max at once',
    statTested: 'Keys tested',
    statPresses: 'Key presses',
    location: 'location',
    heldLabel: 'Keys held down',
    extraLabel: 'Keys not on the diagram',
    footnote:
      'Orange keys are held down right now; green keys have been tested. The Fn key and many media keys are handled by the keyboard or the operating system and never reach the browser, so it is normal that they don’t light up. Key data is processed only in your browser.',
    client: {
      layout: 'ansi',
      none: '(none)',
      locations: ['Standard', 'Left', 'Right', 'Numpad'],
      keys: { space: 'Space', empty: '(empty)' },
      rollover: {
        none: 'Hold several keys at once (for example A, S, D, F plus J, K, L) to find out how many keys your keyboard can register at the same time.',
        low: 'Up to {max} keys detected at once so far. If you are holding more keys and some don’t light up, those keys are ghosting or blocking each other, which is common on office and laptop keyboards.',
        six: 'Up to {max} keys detected at once so far. Most USB keyboards support at least 6-key rollover (6KRO), which is enough for nearly every game.',
        nkro: 'Up to {max} keys detected at once, more than 6, so this keyboard supports n-key rollover (NKRO).',
      },
    },
  },
  ja: {
    numpad: 'テンキーを表示',
    reset: 'リセット',
    areaAria: 'キーボードテスト領域。フォーカスしてから任意のキーを押してください',
    prompt: 'ここをクリックしてキーを押してください',
    statDown: '押下中',
    statMax: '最大同時押し',
    statTested: 'テスト済みキー',
    statPresses: '打鍵数',
    location: '位置 location',
    heldLabel: '押しているキー',
    extraLabel: 'キーボード図にないキー',
    footnote:
      'オレンジ色は押しているキー、緑色はテスト済みのキーです。Fn キーや一部のメディアキーはキーボード本体や OS が処理するためブラウザには届かず、反応しなくても故障ではありません。日本語入力（IME）がオンだと event.key が「Process」になるため、オフにしてからテストしてください。キー入力はブラウザ内だけで処理されます。',
    client: {
      layout: 'jis',
      none: '（なし）',
      locations: ['標準', '左側', '右側', 'テンキー'],
      keys: { space: 'Space（スペース）', empty: '（空）' },
      rollover: {
        none: '複数のキーを同時に押し続けると（例：A・S・D・F と J・K・L）、キーボードが同時に認識できるキーの数を測れます。',
        low: '現在の最大同時認識数は {max} キーです。もっと多く押しているのに点灯しないキーがある場合、その組み合わせでゴースト・キーブロックが起きています。事務用やノートパソコンのキーボードによくある制限です。',
        six: '現在の最大同時認識数は {max} キーです。一般的な USB キーボードは 6 キーロールオーバー（6KRO）以上に対応しており、ほとんどのゲームで十分です。',
        nkro: '現在の最大同時認識数は {max} キーで、6 キーを超えています。このキーボードは N キーロールオーバー（NKRO、全キー同時押し）に対応しています。',
      },
    },
  },
});

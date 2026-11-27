import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';

export interface Strings {
  draw: string;
  undo: string;
  voice: string;
  recentLabel: string;
  boardLabel: string;
  rangeLabel: string;
  rangeCustom: string;
  rangeCustomLabel: string;
  copyHistory: string;
  cancel: string;
  cardsTitle: string;
  cardsLead: string;
  cardCount: string;
  cardSize: string;
  freeCenter: string;
  cardTitleLabel: string;
  cardTitlePlaceholder: string;
  perPage: string;
  generate: string;
  print: string;
  checkTitle: string;
  checkLead: string;
  checkLabel: string;
  checkButton: string;
  client: {
    /** BCP 47 tag for the spoken call. */
    voiceLang: string;
    soundOn: string;
    soundOff: string;
    fullscreen: string;
    exitFullscreen: string;
    /** {n} called, {max} in the game */
    progress: string;
    statusIdle: string;
    statusRolling: string;
    /** {call} = "B-12" or "12" */
    statusCalled: string;
    statusDone: string;
    rangeHint: string;
    rangeLocked: string;
    reset: string;
    resetConfirm: string;
    /** Text on the free square. */
    free: string;
    /** {n} = card number */
    cardNo: string;
    defaultCardTitle: string;
    /** {n} cards made */
    cardsReady: PluralForms;
    /** {n} cards made although more were asked for */
    cardsFewer: PluralForms;
    /** {max} {size} {need} */
    errorCardFit: string;
    previewLabel: string;
    checkEmpty: string;
    /** {n} = highest card number */
    checkMissing: string;
    /** {id} card number, {n} lines */
    checkLines: PluralForms;
    /** {id} card number */
    checkNoLine: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    draw: '抽下一個號碼',
    undo: '收回上一個',
    voice: '語音報號',
    recentLabel: '前幾個號碼',
    boardLabel: '已抽號碼表',
    rangeLabel: '號碼範圍',
    rangeCustom: '自訂',
    rangeCustomLabel: '最大號碼',
    copyHistory: '複製已抽號碼',
    cancel: '取消',
    cardsTitle: '產生並列印賓果卡',
    cardsLead: '依照上面的號碼範圍產生不重複的賓果卡，每張都有編號，可以直接列印或存成 PDF。',
    cardCount: '張數',
    cardSize: '格數',
    freeCenter: '中間放免費格',
    cardTitleLabel: '卡片標題（可不填）',
    cardTitlePlaceholder: '例如：2027 尾牙賓果',
    perPage: '每頁張數',
    generate: '產生賓果卡',
    print: '列印',
    checkTitle: '有人喊賓果？輸入卡片編號對獎',
    checkLead: '輸入賓果卡右上角的編號，畫面會標出已經抽出的號碼和連線數。只能查這台裝置最後一次產生的卡片。',
    checkLabel: '卡片編號',
    checkButton: '對獎',
    client: {
      voiceLang: 'zh-TW',
      soundOn: '開啟音效',
      soundOff: '關閉音效',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      progress: '已抽 {n} / {max}',
      statusIdle: '按「抽下一個號碼」開始',
      statusRolling: '抽號中…',
      statusCalled: '抽出 {call}',
      statusDone: '全部號碼都抽完了',
      rangeHint: '75 是最常見的賓果卡，號碼前面會加上 B、I、N、G、O。自己畫 5×5 格子的玩法選 25。',
      rangeLocked: '已經開始抽號。要改號碼範圍，請先按「重新開始」。',
      reset: '重新開始',
      resetConfirm: '確定清空？再按一次',
      free: 'FREE',
      cardNo: 'No. {n}',
      defaultCardTitle: 'BINGO',
      cardsReady: { other: '已產生 {n} 張，編號 1 到 {n}。按「列印」就能印出來或存成 PDF。' },
      cardsFewer: { other: '這個號碼範圍只排得出 {n} 張不重複的卡片，已全部產生。' },
      errorCardFit: '號碼範圍 1 到 {max} 填不滿 {size}×{size} 的卡片，請把最大號碼調到 {need} 以上，或改用較小的格數。',
      previewLabel: '預覽（前 2 張）',
      checkEmpty: '還沒有賓果卡。請先在「產生並列印賓果卡」產生卡片。',
      checkMissing: '找不到這張卡片，目前的編號是 1 到 {n}。',
      checkLines: { other: '{id} 號卡：{n} 條連線' },
      checkNoLine: '{id} 號卡：還沒有連線',
    },
  },
  en: {
    draw: 'Call next number',
    undo: 'Undo last call',
    voice: 'Read aloud',
    recentLabel: 'Previous numbers',
    boardLabel: 'Called numbers board',
    rangeLabel: 'Number range',
    rangeCustom: 'Custom',
    rangeCustomLabel: 'Highest number',
    copyHistory: 'Copy called numbers',
    cancel: 'Cancel',
    cardsTitle: 'Make and print bingo cards',
    cardsLead: 'Generate unique, numbered cards for the range above, then print them or save them as a PDF.',
    cardCount: 'Cards',
    cardSize: 'Grid',
    freeCenter: 'Free space in the middle',
    cardTitleLabel: 'Card title (optional)',
    cardTitlePlaceholder: 'e.g. Holiday party bingo',
    perPage: 'Cards per page',
    generate: 'Generate cards',
    print: 'Print',
    checkTitle: 'Someone shouted bingo? Check their card',
    checkLead: 'Enter the number in the corner of the card to see its called squares and completed lines. Only the cards last generated on this device can be checked.',
    checkLabel: 'Card number',
    checkButton: 'Check card',
    client: {
      voiceLang: 'en-US',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      progress: '{n} of {max} called',
      statusIdle: 'Press "Call next number" to start',
      statusRolling: 'Drawing…',
      statusCalled: 'Called {call}',
      statusDone: 'All numbers have been called',
      rangeHint: '75 is the standard US game, called with the letters B-I-N-G-O. 90 is the UK game.',
      rangeLocked: 'The game has started. To change the range, press "Start over" first.',
      reset: 'Start over',
      resetConfirm: 'Clear everything? Press again',
      free: 'FREE',
      cardNo: 'No. {n}',
      defaultCardTitle: 'BINGO',
      cardsReady: {
        one: '{n} card is ready. Press "Print" to print it or save it as a PDF.',
        other: '{n} cards are ready, numbered 1 to {n}. Press "Print" to print them or save them as a PDF.',
      },
      cardsFewer: {
        one: 'This range only allows {n} unique card, so that is all that was made.',
        other: 'This range only allows {n} unique cards, so that is all that were made.',
      },
      errorCardFit: 'Numbers 1 to {max} cannot fill a {size}×{size} card. Raise the highest number to {need} or more, or pick a smaller grid.',
      previewLabel: 'Preview (first 2 cards)',
      checkEmpty: 'No cards yet. Generate them under "Make and print bingo cards" first.',
      checkMissing: 'No such card. The current cards are numbered 1 to {n}.',
      checkLines: { one: 'Card {id}: {n} line', other: 'Card {id}: {n} lines' },
      checkNoLine: 'Card {id}: no line yet',
    },
  },
  ja: {
    draw: '次の番号を引く',
    undo: '1 つ戻す',
    voice: '番号を読み上げる',
    recentLabel: '直前の番号',
    boardLabel: '出た番号の一覧',
    rangeLabel: '番号の範囲',
    rangeCustom: 'カスタム',
    rangeCustomLabel: '最大の番号',
    copyHistory: '出た番号をコピー',
    cancel: 'キャンセル',
    cardsTitle: 'ビンゴカードを作成して印刷',
    cardsLead: '上の番号の範囲に合わせて、重複のない番号付きカードを作ります。そのまま印刷するか、PDF で保存できます。',
    cardCount: '枚数',
    cardSize: 'マス数',
    freeCenter: '真ん中をフリーにする',
    cardTitleLabel: 'カードのタイトル（任意）',
    cardTitlePlaceholder: '例：忘年会ビンゴ大会',
    perPage: '1 ページの枚数',
    generate: 'カードを作成',
    print: '印刷',
    checkTitle: 'ビンゴの声が上がったら、カード番号で確認',
    checkLead: 'カードの右上の番号を入力すると、出た番号とそろった列数を表示します。確認できるのは、この端末で最後に作成したカードだけです。',
    checkLabel: 'カード番号',
    checkButton: '確認する',
    client: {
      voiceLang: 'ja-JP',
      soundOn: '効果音をオンにする',
      soundOff: '効果音をオフにする',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      progress: '{n} / {max} 個',
      statusIdle: '「次の番号を引く」を押してスタート',
      statusRolling: '抽選中…',
      statusCalled: '{call} が出ました',
      statusDone: 'すべての番号が出ました',
      rangeHint: '市販のビンゴカードは 1〜75 です。B・I・N・G・O の文字も一緒に表示します。',
      rangeLocked: 'ゲームが始まっています。範囲を変えるには、先に「最初からやり直す」を押してください。',
      reset: '最初からやり直す',
      resetConfirm: '本当に消しますか？もう一度押す',
      free: 'FREE',
      cardNo: 'No. {n}',
      defaultCardTitle: 'BINGO',
      cardsReady: { other: '{n} 枚作成しました（番号 1〜{n}）。「印刷」を押すと、印刷または PDF 保存ができます。' },
      cardsFewer: { other: 'この範囲で作れる重複のないカードは {n} 枚までです。すべて作成しました。' },
      errorCardFit: '1〜{max} では {size}×{size} のカードを埋められません。最大の番号を {need} 以上にするか、マス数を減らしてください。',
      previewLabel: 'プレビュー（最初の 2 枚）',
      checkEmpty: 'カードがまだありません。先に「ビンゴカードを作成して印刷」でカードを作ってください。',
      checkMissing: 'その番号のカードはありません。今あるカードは 1〜{n} です。',
      checkLines: { other: 'カード {id}：{n} 列そろいました' },
      checkNoLine: 'カード {id}：まだそろっていません',
    },
  },
});

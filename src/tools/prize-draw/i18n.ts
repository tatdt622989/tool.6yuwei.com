import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { SplitMode } from '../random-picker/logic';
import type { SetupError } from './logic';

export interface Strings {
  peopleLabel: string;
  peoplePlaceholder: string;
  sample: string;
  dedupe: string;
  prizesLabel: string;
  prizesPlaceholder: string;
  prizesHint: string;
  noRepeat: string;
  start: string;
  privacyNote: string;
  pickerAria: string;
  batchAria: string;
  batchOne: string;
  batchAll: string;
  keyHint: string;
  allDone: string;
  boardHeading: string;
  copy: string;
  csv: string;
  bonusSummary: string;
  bonusHint: string;
  bonusNameLabel: string;
  bonusNamePlaceholder: string;
  bonusQuantityLabel: string;
  bonusAdd: string;
  bonusTag: string;
  client: {
    /** How the pasted participant list is split into entries. */
    split: SplitMode;
    samplePeople: string[];
    samplePrizes: string[];
    /** {n} people on the list. */
    peopleCount: PluralForms;
    dupesSkipped: PluralForms;
    dupesIncluded: PluralForms;
    /** {n} prizes. */
    prizeCount: PluralForms;
    /** {n} winners in total. */
    slotCount: PluralForms;
    countJoin: string;
    /** {people} on the list, {slots} winners wanted, {max} the most the tool accepts. */
    errors: Record<SetupError, string>;
    /** {done} {total} */
    progress: string;
    /** {total} {left} */
    prizeLeft: string;
    /** {n} winners, all drawn. */
    prizeDone: PluralForms;
    /** {n} winners about to be drawn. */
    ready: PluralForms;
    rolling: string;
    draw: string;
    /** {prize} */
    next: string;
    poolEmpty: string;
    redraw: string;
    redrawArm: string;
    /** {name} was absent. */
    redrawNote: string;
    redrawEmpty: string;
    /** {name} */
    absent: string;
    /** {n} winners still to draw. */
    pending: PluralForms;
    none: string;
    bonusErrorName: string;
    /** {left} people can still win, {count} winners asked for. */
    bonusErrorPool: string;
    restart: string;
    restartArm: string;
    fullscreen: string;
    exitFullscreen: string;
    soundOn: string;
    soundOff: string;
    /** Screen reader announcement: {prize} {names} */
    announce: string;
    resultsTitle: string;
    /** Copied line: {prize} {names} */
    resultLine: string;
    nameSeparator: string;
    csvHeader: [string, string, string, string];
    csvWon: string;
    csvAbsent: string;
    csvName: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    peopleLabel: '參加名單（每行一個）',
    peoplePlaceholder: '王小明\n李小華\n陳小美\n林志明\n張春嬌',
    sample: '填入範例',
    dedupe: '移除重複的名字',
    prizesLabel: '獎項（每行一個）',
    prizesPlaceholder: '頭獎 現金一萬 x1\n二獎 氣炸鍋 x2\n三獎 禮券 500 元 x5',
    prizesHint: '名額寫在每一行的最後面，例如「x3」；沒有寫就是 1 名。大獎寫在最上面，抽獎時會從最後一個獎項開始，由小獎抽到大獎。',
    noRepeat: '中獎的人不能再中獎',
    start: '開始抽獎',
    privacyNote: '名單和中獎紀錄只存在這台裝置的瀏覽器裡，不會上傳。',
    pickerAria: '選擇要抽的獎項',
    batchAria: '一次抽出幾位',
    batchOne: '一次抽一位',
    batchAll: '一次抽完',
    keyHint: '也可以按空白鍵或 Enter。',
    allDone: '所有獎項都抽完了',
    boardHeading: '中獎名單',
    copy: '複製結果',
    csv: '下載 CSV',
    bonusSummary: '加碼獎',
    bonusHint: '臨時加碼的獎項會排在最後面，加入後就可以直接抽。',
    bonusNameLabel: '獎項名稱',
    bonusNamePlaceholder: '總經理加碼 現金三千',
    bonusQuantityLabel: '名額',
    bonusAdd: '加入獎項',
    bonusTag: '加碼',
    client: {
      split: 'lines',
      samplePeople: [
        '王小明', '李小華', '陳小美', '林志明', '張春嬌', '黃建宏', '吳怡君', '劉家豪', '蔡雅婷', '鄭宇翔',
        '許淑芬', '謝承恩', '洪詩涵', '郭冠廷', '曾美玲', '邱柏翰', '廖佩珊', '賴俊傑', '周欣怡', '葉志偉',
      ],
      samplePrizes: ['頭獎 現金一萬 x1', '二獎 氣炸鍋 x2', '三獎 藍牙耳機 x3', '普獎 禮券 500 元 x5'],
      peopleCount: { other: '共 {n} 人' },
      dupesSkipped: { other: '（已略過 {n} 個重複）' },
      dupesIncluded: { other: '（含 {n} 個重複）' },
      prizeCount: { other: '{n} 個獎項' },
      slotCount: { other: '共 {n} 個名額' },
      countJoin: '，',
      errors: {
        noPeople: '請先輸入參加名單，每行一個名字。',
        noPrizes: '請先輸入獎項，每行一個。',
        tooManySlots: '所有獎項的名額加起來最多 {max} 個，目前是 {slots} 個。',
        tooFewPeople: '名單只有 {people} 人，但獎項共有 {slots} 個名額。請減少名額，或取消勾選「中獎的人不能再中獎」。',
      },
      progress: '已抽出 {done} / {total} 名',
      prizeLeft: '共 {total} 名，還剩 {left} 名',
      prizeDone: { other: '{n} 名全部抽出' },
      ready: { other: '準備抽出 {n} 位' },
      rolling: '抽獎中…',
      draw: '抽獎',
      next: '下一個獎項：{prize}',
      poolEmpty: '名單裡已經沒有可以抽的人了。',
      redraw: '重抽',
      redrawArm: '確定重抽？',
      redrawNote: '{name} 不在場，重新抽出',
      redrawEmpty: '已經沒有其他人可以重抽了。',
      absent: '{name}（不在場）',
      pending: { other: '還有 {n} 名未抽' },
      none: '尚未抽出',
      bonusErrorName: '請輸入獎項名稱。',
      bonusErrorPool: '還能中獎的只剩 {left} 人，不夠抽 {count} 個名額。',
      restart: '重新開始',
      restartArm: '再按一次，清除所有中獎紀錄',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      soundOn: '開啟音效',
      soundOff: '關閉音效',
      announce: '{prize}：{names}',
      resultsTitle: '抽獎結果',
      resultLine: '{prize}：{names}',
      nameSeparator: '、',
      csvHeader: ['獎項', '序號', '姓名', '狀態'],
      csvWon: '中獎',
      csvAbsent: '不在場（已重抽）',
      csvName: '抽獎結果.csv',
    },
  },
  en: {
    peopleLabel: 'Participants (one per line)',
    peoplePlaceholder: 'Alex Johnson\nJordan Lee\nTaylor Smith\nSam Rivera\nMorgan Clark',
    sample: 'Use sample lists',
    dedupe: 'Ignore duplicate names',
    prizesLabel: 'Prizes (one per line)',
    prizesPlaceholder: 'Grand prize: $500 gift card x1\nWireless earbuds x2\n$25 coffee gift card x5',
    prizesHint:
      'Put the number of winners at the end of the line, like “x3”. A line with no number has one winner. List the top prize first: the draw starts from the last prize on the list and works up to it.',
    noRepeat: 'Each person can win only once',
    start: 'Start the draw',
    privacyNote: 'Your lists and the winners stay in this browser. Nothing is uploaded.',
    pickerAria: 'Prize to draw',
    batchAria: 'Winners per draw',
    batchOne: 'One at a time',
    batchAll: 'All at once',
    keyHint: 'You can also press Space or Enter.',
    allDone: 'Every prize has been drawn',
    boardHeading: 'Winners',
    copy: 'Copy results',
    csv: 'Download CSV',
    bonusSummary: 'Add a bonus prize',
    bonusHint: 'A bonus prize goes to the end of the list and is ready to draw right away.',
    bonusNameLabel: 'Prize name',
    bonusNamePlaceholder: 'Bonus: extra day off',
    bonusQuantityLabel: 'Winners',
    bonusAdd: 'Add prize',
    bonusTag: 'Bonus',
    client: {
      split: 'lines',
      samplePeople: [
        'Alex Johnson', 'Jordan Lee', 'Taylor Smith', 'Sam Rivera', 'Morgan Clark', 'Casey Nguyen', 'Riley Brooks',
        'Jamie Patel', 'Avery Collins', 'Drew Martinez', 'Quinn Foster', 'Skyler Reed', 'Rowan Hughes', 'Emery Diaz',
        'Parker Kim', 'Hayden Ross', 'Reese Turner', 'Dakota Bell', 'Logan Price', 'Blake Morgan',
      ],
      samplePrizes: ['Grand prize: $500 gift card x1', 'Wireless earbuds x2', 'Insulated tumbler x3', '$25 coffee gift card x5'],
      peopleCount: { one: '{n} person', other: '{n} people' },
      dupesSkipped: { one: ' ({n} duplicate ignored)', other: ' ({n} duplicates ignored)' },
      dupesIncluded: { one: ' (includes {n} duplicate)', other: ' (includes {n} duplicates)' },
      prizeCount: { one: '{n} prize', other: '{n} prizes' },
      slotCount: { one: '{n} winner', other: '{n} winners' },
      countJoin: ', ',
      errors: {
        noPeople: 'Add the participants first, one name per line.',
        noPrizes: 'Add at least one prize, one per line.',
        tooManySlots: 'The prizes can have up to {max} winners in total, and the list asks for {slots}.',
        tooFewPeople:
          'There are {people} people on the list but {slots} winners to draw. Lower the numbers, or turn off “Each person can win only once”.',
      },
      progress: '{done} of {total} winners drawn',
      prizeLeft: '{left} of {total} still to draw',
      prizeDone: { one: 'Winner drawn', other: 'All {n} winners drawn' },
      ready: { one: 'Ready to draw {n} winner', other: 'Ready to draw {n} winners' },
      rolling: 'Drawing…',
      draw: 'Draw',
      next: 'Next prize: {prize}',
      poolEmpty: 'There is nobody left to draw from.',
      redraw: 'Redraw',
      redrawArm: 'Confirm redraw?',
      redrawNote: '{name} wasn’t here, so we drew again',
      redrawEmpty: 'There is nobody left to redraw from.',
      absent: '{name} (absent)',
      pending: { other: '{n} still to draw' },
      none: 'Not drawn yet',
      bonusErrorName: 'Enter a name for the prize.',
      bonusErrorPool: 'Only {left} more people can win, which isn’t enough for {count} winners.',
      restart: 'Start over',
      restartArm: 'Press again to clear all winners',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
      announce: '{prize}: {names}',
      resultsTitle: 'Prize draw results',
      resultLine: '{prize}: {names}',
      nameSeparator: ', ',
      csvHeader: ['Prize', 'No.', 'Name', 'Status'],
      csvWon: 'Winner',
      csvAbsent: 'Absent (redrawn)',
      csvName: 'prize-draw-results.csv',
    },
  },
  ja: {
    peopleLabel: '参加者リスト（1 行に 1 人、または「、」区切り）',
    peoplePlaceholder: '佐藤 健\n鈴木 美咲\n高橋 大輔\n田中 陽子\n伊藤 翔',
    sample: 'サンプルを入力',
    dedupe: '重複した名前を除く',
    prizesLabel: '景品リスト（1 行に 1 つ）',
    prizesPlaceholder: '1 等 旅行券 3 万円分 x1\n2 等 ワイヤレスイヤホン x2\n3 等 ギフトカード 1,000 円分 x5',
    prizesHint:
      '当選人数は行の最後に「x3」のように書きます。書かない行は 1 名です。1 等を先頭に書いてください。抽選はリストの最後の景品から始まり、1 等が最後になります。',
    noRepeat: '当選した人は次の抽選から外す',
    start: '抽選会を始める',
    privacyNote: 'リストと当選結果はこのブラウザの中だけに保存され、外部には送信されません。',
    pickerAria: '抽選する景品',
    batchAria: '1 回の抽選人数',
    batchOne: '1 人ずつ',
    batchAll: 'まとめて抽選',
    keyHint: 'スペースキーか Enter キーでも抽選できます。',
    allDone: 'すべての景品の抽選が終わりました',
    boardHeading: '当選者一覧',
    copy: '結果をコピー',
    csv: 'CSV をダウンロード',
    bonusSummary: '景品を追加する',
    bonusHint: '追加した景品はリストの最後に入り、すぐに抽選できます。',
    bonusNameLabel: '景品名',
    bonusNamePlaceholder: '社長賞 ギフトカード 5,000 円分',
    bonusQuantityLabel: '当選人数',
    bonusAdd: '景品を追加',
    bonusTag: '追加',
    client: {
      split: 'ja',
      samplePeople: [
        '佐藤 健', '鈴木 美咲', '高橋 大輔', '田中 陽子', '伊藤 翔', '渡辺 由美', '山本 拓也', '中村 さくら', '小林 誠', '加藤 愛',
        '吉田 健太', '山田 花子', '佐々木 亮', '山口 真由', '松本 直樹', '井上 彩', '木村 悠', '林 奈々', '斎藤 学', '清水 千尋',
      ],
      samplePrizes: ['1 等 旅行券 3 万円分 x1', '2 等 ワイヤレスイヤホン x2', '3 等 カタログギフト x3', '参加賞 ギフトカード 1,000 円分 x5'],
      peopleCount: { other: '全 {n} 人' },
      dupesSkipped: { other: '（重複 {n} 件を除外）' },
      dupesIncluded: { other: '（重複 {n} 件を含む）' },
      prizeCount: { other: '景品 {n} 種類' },
      slotCount: { other: '当選 {n} 名' },
      countJoin: '、',
      errors: {
        noPeople: '参加者の名前を 1 行に 1 人ずつ入力してください。',
        noPrizes: '景品を 1 行に 1 つずつ入力してください。',
        tooManySlots: '当選人数の合計は {max} 名までです。現在は {slots} 名です。',
        tooFewPeople:
          '参加者は {people} 人ですが、当選人数の合計が {slots} 名です。人数を減らすか、「当選した人は次の抽選から外す」のチェックを外してください。',
      },
      progress: '{total} 名中 {done} 名を抽選済み',
      prizeLeft: '全 {total} 名・残り {left} 名',
      prizeDone: { other: '{n} 名すべて抽選済み' },
      ready: { other: '{n} 名を抽選します' },
      rolling: '抽選中…',
      draw: '抽選する',
      next: '次の景品：{prize}',
      poolEmpty: '抽選できる人が残っていません。',
      redraw: '再抽選',
      redrawArm: '再抽選しますか？',
      redrawNote: '{name} さんが不在のため再抽選しました',
      redrawEmpty: '再抽選できる人が残っていません。',
      absent: '{name}（不在）',
      pending: { other: '残り {n} 名' },
      none: 'まだ抽選していません',
      bonusErrorName: '景品名を入力してください。',
      bonusErrorPool: '当選できる人は残り {left} 人のため、{count} 名分は追加できません。',
      restart: '最初からやり直す',
      restartArm: 'もう一度押すと当選結果をすべて消去します',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      soundOn: 'サウンドをオンにする',
      soundOff: 'サウンドをオフにする',
      announce: '{prize}：{names}',
      resultsTitle: '抽選結果',
      resultLine: '{prize}：{names}',
      nameSeparator: '、',
      csvHeader: ['景品', '番号', '名前', '状態'],
      csvWon: '当選',
      csvAbsent: '不在（再抽選）',
      csvName: '抽選結果.csv',
    },
  },
});

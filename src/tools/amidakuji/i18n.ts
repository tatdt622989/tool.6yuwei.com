import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { NamesError, OutcomeLabels, OutcomesError } from './logic';

export interface Strings {
  namesLabel: string;
  namesPlaceholder: string;
  sample: string;
  outcomesLabel: string;
  modeOne: string;
  modeSome: string;
  modeOrder: string;
  modeCustom: string;
  hitLabel: string;
  blankLabel: string;
  winnersLabel: string;
  customLabel: string;
  customPlaceholder: string;
  customHint: string;
  titleLabel: string;
  titlePlaceholder: string;
  start: string;
  privacyNote: string;
  coverTitle: string;
  coverHint: string;
  scrollHint: string;
  revealAll: string;
  resultsHeading: string;
  copy: string;
  shareHeading: string;
  shareHint: string;
  copyLink: string;
  share: string;
  guestNote: string;
  makeOwn: string;
  topsAria: string;
  bottomsAria: string;
  client: {
    sampleNames: string[];
    sampleTitle: string;
    sampleHit: string;
    sampleBlank: string;
    /** Defaults for the outcome presets. */
    labels: OutcomeLabels;
    /** {n} people on the list. */
    peopleCount: PluralForms;
    /** {n} people entered, {max} allowed. */
    nameErrors: Record<Exclude<NamesError, null>, string>;
    /** {outcomes} entered, {people} on the list. */
    outcomeErrors: Record<Exclude<OutcomesError, null>, string>;
    /** {n} outcomes, {list} what they are. */
    preview: string;
    /** {label} appears {n} times. */
    previewRepeat: string;
    previewJoin: string;
    /** {n} missing outcomes are filled with {blank}. */
    previewPadded: PluralForms;
    /** {n} people, nothing shown yet. */
    progressIdle: PluralForms;
    /** {done} of {total} paths shown. */
    progress: string;
    progressDone: string;
    /** Button label for screen readers: {name}. */
    traceAria: string;
    pending: string;
    /** Screen reader announcement and copied line: {name} {outcome}. */
    resultLine: string;
    resultsTitle: string;
    linkError: string;
    shareTitle: string;
    /** {title} may be empty. */
    shareText: string;
    shareTextTitled: string;
    redraw: string;
    redrawArm: string;
    edit: string;
    editArm: string;
    fullscreen: string;
    exitFullscreen: string;
    soundOn: string;
    soundOff: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    namesLabel: '參加的人（每行一個）',
    namesPlaceholder: '小明\n小美\n阿傑\n雅婷',
    sample: '填入範例',
    outcomesLabel: '要抽什麼',
    modeOne: '1 人中籤',
    modeSome: '多人中籤',
    modeOrder: '排順序',
    modeCustom: '自訂',
    hitLabel: '中籤的人拿到',
    blankLabel: '其他人拿到',
    winnersLabel: '中籤人數',
    customLabel: '自訂結果（每行一個）',
    customPlaceholder: '買飲料\n洗碗 x2\n沒事 x3',
    customHint: '同一個結果有好幾支時，在後面寫「x3」。結果比人數少的話，不夠的會自動補上。',
    titleLabel: '標題（選填）',
    titlePlaceholder: '誰去買飲料',
    start: '產生鬼腳圖',
    privacyNote: '名單只存在這台裝置的瀏覽器裡，不會上傳。',
    coverTitle: '橫線先蓋起來了',
    coverHint: '點上面的名字開始走，或按「全部揭曉」。',
    scrollHint: '左右滑動可以看到所有人。',
    revealAll: '全部揭曉',
    resultsHeading: '結果',
    copy: '複製結果',
    shareHeading: '把這張鬼腳圖傳給大家',
    shareHint: '連結裡帶著名單和這張圖，對方打開會看到同一張鬼腳圖，可以自己點名字走一次。',
    copyLink: '複製連結',
    share: '分享',
    guestNote: '這是別人分享給你的鬼腳圖。名單只顯示在這個畫面，不會存到這台裝置。',
    makeOwn: '做一張自己的',
    topsAria: '參加的人',
    bottomsAria: '結果',
    client: {
      sampleNames: ['小明', '小美', '阿傑', '雅婷', '志豪', '怡君'],
      sampleTitle: '誰去買飲料',
      sampleHit: '買飲料',
      sampleBlank: '沒事',
      labels: { hit: '中籤', blank: '沒中', order: '{n} 號' },
      peopleCount: { other: '{n} 人' },
      nameErrors: {
        few: '至少要有 2 個人才能畫鬼腳圖。',
        many: '最多 {max} 人，現在有 {n} 人，請刪掉幾個名字。',
      },
      outcomeErrors: {
        empty: '請在自訂結果裡至少輸入一個結果。',
        many: '結果有 {outcomes} 個，比 {people} 個人還多。請刪掉幾個結果，或再加幾個人。',
      },
      preview: '共 {n} 支籤：{list}',
      previewRepeat: '{label} ×{n}',
      previewJoin: '、',
      previewPadded: { other: '（不夠的 {n} 支補上「{blank}」）' },
      progressIdle: { other: '{n} 人，還沒開始' },
      progress: '已揭曉 {done} / {total}',
      progressDone: '全部揭曉了',
      traceAria: '{name}：看走到哪裡',
      pending: '還沒走',
      resultLine: '{name} → {outcome}',
      resultsTitle: '鬼腳圖結果',
      linkError: '這個連結不完整，沒辦法還原鬼腳圖。請對方再複製一次完整的連結。',
      shareTitle: '鬼腳圖',
      shareText: '鬼腳圖畫好了，點開看你走到哪裡。',
      shareTextTitled: '鬼腳圖「{title}」畫好了，點開看你走到哪裡。',
      redraw: '重畫一張',
      redrawArm: '確定重畫？',
      edit: '修改名單',
      editArm: '確定回去修改？',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      soundOn: '開啟音效',
      soundOff: '關閉音效',
    },
  },
  en: {
    namesLabel: 'Players (one per line)',
    namesPlaceholder: 'Alex\nSam\nJordan\nTaylor',
    sample: 'Fill in a sample',
    outcomesLabel: 'What you are drawing for',
    modeOne: 'One winner',
    modeSome: 'Several winners',
    modeOrder: 'Order',
    modeCustom: 'Custom',
    hitLabel: 'The winner gets',
    blankLabel: 'Everyone else gets',
    winnersLabel: 'Number of winners',
    customLabel: 'Custom outcomes (one per line)',
    customPlaceholder: 'Buys coffee\nWashes up x2\nOff the hook x3',
    customHint: 'End a line with "x3" to use the same outcome several times. If there are fewer outcomes than players, the rest are filled in for you.',
    titleLabel: 'Title (optional)',
    titlePlaceholder: 'Who buys the coffee?',
    start: 'Build the ladder',
    privacyNote: 'The names stay in this browser on this device. Nothing is uploaded.',
    coverTitle: 'The rungs are covered',
    coverHint: 'Tap a name above to start, or press "Reveal all".',
    scrollHint: 'Swipe sideways to see everyone.',
    revealAll: 'Reveal all',
    resultsHeading: 'Results',
    copy: 'Copy results',
    shareHeading: 'Send this ladder to the group',
    shareHint: 'The link carries the names and this exact ladder. Anyone who opens it sees the same ladder and can trace the paths themselves.',
    copyLink: 'Copy link',
    share: 'Share',
    guestNote: 'Someone shared this ladder with you. The names are only shown on this screen and are not saved to this device.',
    makeOwn: 'Make your own',
    topsAria: 'Players',
    bottomsAria: 'Outcomes',
    client: {
      sampleNames: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley'],
      sampleTitle: 'Who buys the coffee?',
      sampleHit: 'Buys coffee',
      sampleBlank: 'Free coffee',
      labels: { hit: 'Winner', blank: 'No prize', order: 'No. {n}' },
      peopleCount: { one: '{n} player', other: '{n} players' },
      nameErrors: {
        few: 'A ladder needs at least 2 players.',
        many: 'The limit is {max} players and the list has {n}. Remove a few names.',
      },
      outcomeErrors: {
        empty: 'Enter at least one custom outcome.',
        many: 'There are {outcomes} outcomes but only {people} players. Remove some outcomes or add players.',
      },
      preview: '{n} outcomes: {list}',
      previewRepeat: '{label} ×{n}',
      previewJoin: ', ',
      previewPadded: { one: ' ({n} missing outcome filled with "{blank}")', other: ' ({n} missing outcomes filled with "{blank}")' },
      progressIdle: { one: '{n} player, not started', other: '{n} players, not started' },
      progress: '{done} of {total} revealed',
      progressDone: 'All revealed',
      traceAria: '{name}: trace the path',
      pending: 'Not traced yet',
      resultLine: '{name} → {outcome}',
      resultsTitle: 'Ladder lottery results',
      linkError: 'This link is incomplete, so the ladder cannot be rebuilt. Ask the sender to copy the whole link again.',
      shareTitle: 'Amidakuji ladder lottery',
      shareText: 'The ladder is ready. Open the link and trace your path.',
      shareTextTitled: 'The ladder for "{title}" is ready. Open the link and trace your path.',
      redraw: 'New ladder',
      redrawArm: 'Draw a new one?',
      edit: 'Edit the lists',
      editArm: 'Go back and edit?',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
    },
  },
  ja: {
    namesLabel: '参加者（1 行に 1 人）',
    namesPlaceholder: '佐藤\n鈴木\n高橋\n田中',
    sample: 'サンプルを入力',
    outcomesLabel: 'くじの内容',
    modeOne: '当たり 1 本',
    modeSome: '当たり複数',
    modeOrder: '順番決め',
    modeCustom: '自由入力',
    hitLabel: '当たりの表示',
    blankLabel: 'それ以外の表示',
    winnersLabel: '当たりの本数',
    customLabel: 'くじの内容（1 行に 1 つ）',
    customPlaceholder: '買い出し\n皿洗い x2\nセーフ x3',
    customHint: '同じ内容を何本も入れるときは、行の最後に「x3」と書きます。参加者より少ない場合は、足りない分が自動で追加されます。',
    titleLabel: 'タイトル（任意）',
    titlePlaceholder: '二次会の幹事を決める',
    start: 'あみだくじを作る',
    privacyNote: '名前はこの端末のブラウザの中だけに保存され、送信されません。',
    coverTitle: '横線は隠してあります',
    coverHint: '上の名前を押すとスタートします。「すべて表示」でも開けます。',
    scrollHint: '横にスワイプすると全員を見られます。',
    revealAll: 'すべて表示',
    resultsHeading: '結果',
    copy: '結果をコピー',
    shareHeading: 'このあみだくじをみんなに送る',
    shareHint: 'リンクには名前とこのあみだくじが入っています。開いた人は同じあみだくじを見て、自分で名前を押してたどれます。',
    copyLink: 'リンクをコピー',
    share: '共有',
    guestNote: '共有されたあみだくじです。名前はこの画面に表示されるだけで、この端末には保存されません。',
    makeOwn: '自分でも作る',
    topsAria: '参加者',
    bottomsAria: '結果',
    client: {
      sampleNames: ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺'],
      sampleTitle: '二次会の幹事を決める',
      sampleHit: '幹事',
      sampleBlank: 'セーフ',
      labels: { hit: '当たり', blank: 'はずれ', order: '{n} 番' },
      peopleCount: { other: '{n} 人' },
      nameErrors: {
        few: 'あみだくじには 2 人以上の参加者が必要です。',
        many: '参加者は {max} 人までです（現在 {n} 人）。名前を減らしてください。',
      },
      outcomeErrors: {
        empty: 'くじの内容を 1 つ以上入力してください。',
        many: 'くじが {outcomes} 本あり、参加者の {people} 人より多くなっています。くじを減らすか、参加者を増やしてください。',
      },
      preview: '全 {n} 本：{list}',
      previewRepeat: '{label} ×{n}',
      previewJoin: '、',
      previewPadded: { other: '（足りない {n} 本は「{blank}」になります）' },
      progressIdle: { other: '{n} 人・まだ始まっていません' },
      progress: '{total} 人中 {done} 人を表示',
      progressDone: '全員の結果を表示しました',
      traceAria: '{name}：線をたどる',
      pending: 'まだです',
      resultLine: '{name} → {outcome}',
      resultsTitle: 'あみだくじの結果',
      linkError: 'リンクが途中で切れているため、あみだくじを再現できません。送った人にリンク全体をもう一度コピーしてもらってください。',
      shareTitle: 'あみだくじ',
      shareText: 'あみだくじができました。リンクを開いて、自分の線をたどってください。',
      shareTextTitled: 'あみだくじ「{title}」ができました。リンクを開いて、自分の線をたどってください。',
      redraw: '作り直す',
      redrawArm: '作り直しますか？',
      edit: '名前を変更',
      editArm: '入力に戻りますか？',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      soundOn: '効果音をオンにする',
      soundOff: '効果音をオフにする',
    },
  },
});

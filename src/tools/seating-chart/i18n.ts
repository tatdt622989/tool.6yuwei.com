import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { SplitMode } from '../random-picker/logic';
import type { Layout } from './logic';

export interface Strings {
  layoutAria: string;
  layoutTables: string;
  layoutGrid: string;
  namesLabel: string;
  placeholder: string;
  sample: string;
  clear: string;
  privacy: string;
  tablesLabel: string;
  seatsLabel: string;
  colsLabel: string;
  rowsLabel: string;
  viewAria: string;
  viewBack: string;
  viewFront: string;
  titleLabel: string;
  titlePlaceholder: string;
  frontSummary: string;
  frontLabel: string;
  frontPlaceholder: string;
  frontRowsLabel: string;
  /** Labels for "first row only", "first two rows", "first three rows". */
  frontRows: [string, string, string];
  pinLegend: string;
  pinPersonAria: string;
  pinPersonNone: string;
  pinTableAria: string;
  pinAdd: string;
  copy: string;
  print: string;
  tablesHelp: string;
  gridHelp: string;
  panelPinLabel: string;
  panelNone: string;
  panelClose: string;
  client: {
    /** Layout shown first and selected on a first visit. */
    defaultLayout: Layout;
    /** How pasted lists are split into names. */
    split: SplitMode;
    sample: string[];
    go: Record<Layout, string>;
    again: Record<Layout, string>;
    /** {n} people in the list, {seats} usable seats. */
    count: PluralForms;
    dupes: PluralForms;
    /** {n} seats; shown on a table nobody sits at yet. */
    emptyTable: PluralForms;
    stale: string;
    errorEmpty: string;
    /** {people} {seats} */
    errorTooMany: Record<Layout, string>;
    /** {table} {pinned} {seats} */
    errorTableFull: string;
    /** {needed} {seats} */
    errorFrontFull: string;
    /** {names} */
    frontUnknown: string;
    /** {n} = table number */
    tableName: string;
    tableNameAria: string;
    members: PluralForms;
    /** {name} */
    memberPin: string;
    memberUnpin: string;
    desk: string;
    seatEmpty: string;
    seatUnused: string;
    /** {row} counted from the front, {col} from the left when facing the front, {who} */
    seatAria: string;
    pinnedMark: string;
    /** {row} {col} */
    panelTitle: string;
    /** {name} */
    panelPinOccupant: string;
    panelBlock: string;
    panelUnblock: string;
    /** {table} {size} {names} */
    copyTableLine: string;
    nameSeparator: string;
    copyGridHeader: string;
    /** {n} = row number from the front, {names} */
    copyRowLine: string;
    copyEmpty: string;
    copyUnused: string;
    /** Printed heading when the title field is empty. */
    defaultTitle: Record<Layout, string>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    layoutAria: '座位排法',
    layoutTables: '圓桌分桌',
    layoutGrid: '教室座位',
    namesLabel: '名單（每行一個名字）',
    placeholder: '王小明\n李小華\n陳小美\n林志明\n張春嬌',
    sample: '填入範例',
    clear: '清除',
    privacy: '名單和座位表只存在這台裝置的瀏覽器，不會上傳。',
    tablesLabel: '桌數',
    seatsLabel: '每桌人數',
    colsLabel: '每排座位數（左右）',
    rowsLabel: '排數（前後）',
    viewAria: '觀看方向',
    viewBack: '學生視角（講台在上）',
    viewFront: '老師視角（講台在下）',
    titleLabel: '標題（選填，會印在座位表上）',
    titlePlaceholder: '例如：尾牙桌次表、三年二班座位表',
    frontSummary: '指定坐前排的人',
    frontLabel: '要坐前排的名字（每行一個）',
    frontPlaceholder: '王小明\n陳小美',
    frontRowsLabel: '前排的範圍',
    frontRows: ['只有第 1 排', '前 2 排', '前 3 排'],
    pinLegend: '固定桌次',
    pinPersonAria: '要固定的人',
    pinPersonNone: '選一個人',
    pinTableAria: '固定到哪一桌',
    pinAdd: '固定',
    copy: '複製文字',
    print: '列印',
    tablesHelp: '排好之後點一下名字，也能把他固定在那一桌，再點一次取消。固定的人重新分桌時不會動；桌名可以直接改。',
    gridHelp: '點一下座位，可以指定誰固定坐這裡，或把它設成不使用的座位（走道、空桌）。固定的人重新排時不會動。',
    panelPinLabel: '固定坐這個位子的人',
    panelNone: '不指定',
    panelClose: '關閉',
    client: {
      defaultLayout: 'tables',
      split: 'lines',
      sample: [
        '王小明',
        '李小華',
        '陳小美',
        '林志明',
        '張春嬌',
        '黃建宏',
        '吳怡君',
        '劉家豪',
        '蔡雅婷',
        '鄭宇翔',
        '謝佩珊',
        '楊承恩',
        '許淑芬',
        '郭俊傑',
        '洪詩涵',
        '邱柏翰',
        '曾雅筑',
        '廖冠宇',
        '賴欣怡',
        '徐子軒',
        '周品妤',
        '葉宗翰',
        '蘇郁婷',
        '莊志豪',
        '呂佳穎',
        '江承翰',
        '何宜蓁',
        '蕭博文',
        '羅思妤',
        '高育誠',
      ],
      go: { tables: '開始分桌', grid: '開始排座位' },
      again: { tables: '重新分桌', grid: '重新排一次' },
      count: { other: '共 {n} 人・{seats} 個座位' },
      dupes: { other: '（有 {n} 個重複的名字）' },
      emptyTable: { other: '{n} 個座位' },
      stale: '名單已經更動，下面是上一次的結果，請重新排一次。',
      errorEmpty: '請先輸入名單，每行一個名字。',
      errorTooMany: {
        tables: '名單有 {people} 人，但只有 {seats} 個座位。請增加桌數或每桌人數。',
        grid: '名單有 {people} 人，但能坐的座位只有 {seats} 個。請增加排數或每排座位數，或把不使用的座位改回來。',
      },
      errorTableFull: '「{table}」固定了 {pinned} 人，超過每桌 {seats} 人。請取消幾個固定，或增加每桌人數。',
      errorFrontFull: '要坐前排的有 {needed} 人，但前排能排的座位只有 {seats} 個。請把前排的範圍加大。',
      frontUnknown: '名單裡找不到：{names}',
      tableName: '第 {n} 桌',
      tableNameAria: '第 {n} 桌的名稱',
      members: { other: '{n} 人' },
      memberPin: '{name}：固定在這一桌',
      memberUnpin: '{name}：取消固定',
      desk: '講台',
      seatEmpty: '空位',
      seatUnused: '不使用',
      seatAria: '第 {row} 排，左邊數來第 {col} 個：{who}',
      pinnedMark: '（已固定）',
      panelTitle: '第 {row} 排，左邊數來第 {col} 個',
      panelPinOccupant: '把 {name} 固定在這裡',
      panelBlock: '不使用這個座位',
      panelUnblock: '恢復這個座位',
      copyTableLine: '{table}（{size} 人）：{names}',
      nameSeparator: '、',
      copyGridHeader: '（面向講台，由左到右）',
      copyRowLine: '第 {n} 排：{names}',
      copyEmpty: '（空位）',
      copyUnused: '－',
      defaultTitle: { tables: '桌次表', grid: '座位表' },
    },
  },
  ja: {
    layoutAria: '席の並べ方',
    layoutTables: 'テーブル席',
    layoutGrid: '教室の座席',
    namesLabel: '名簿（1 行に 1 人、または「、」区切り）',
    placeholder: '佐藤\n鈴木\n高橋\n田中\n伊藤',
    sample: 'サンプルを入力',
    clear: 'クリア',
    privacy: '名簿と座席表はこの端末のブラウザにだけ保存され、送信されません。',
    tablesLabel: 'テーブル数',
    seatsLabel: '1 テーブルの人数',
    colsLabel: '横の席数',
    rowsLabel: '縦の席数（前から後ろ）',
    viewAria: '図の向き',
    viewBack: '児童・生徒から見た図（教卓が上）',
    viewFront: '教卓から見た図（教卓が下）',
    titleLabel: 'タイトル（任意・印刷した座席表に入ります）',
    titlePlaceholder: '例：3 年 2 組 座席表（3 学期）',
    frontSummary: '前の席にしたい人を指定する',
    frontLabel: '前の席にしたい人（1 行に 1 人、または「、」区切り）',
    frontPlaceholder: '佐藤\n高橋',
    frontRowsLabel: '前の席の範囲',
    frontRows: ['最前列のみ', '前から 2 列目まで', '前から 3 列目まで'],
    pinLegend: 'テーブルを固定する',
    pinPersonAria: '固定する人',
    pinPersonNone: '人を選ぶ',
    pinTableAria: '固定するテーブル',
    pinAdd: '固定',
    copy: 'テキストをコピー',
    print: '印刷する',
    tablesHelp:
      '席が決まったあとに名前を押すと、その人をそのテーブルに固定できます（もう一度押すと解除）。固定した人は、やり直しても動きません。テーブル名はそのまま書き換えられます。',
    gridHelp:
      '席を押すと、その席に固定する人を選んだり、使わない席（通路や空き机）にしたりできます。固定した人は、もう一度席替えしても動きません。',
    panelPinLabel: 'この席に固定する人',
    panelNone: '固定しない',
    panelClose: '閉じる',
    client: {
      defaultLayout: 'grid',
      split: 'ja',
      sample: [
        '佐藤',
        '鈴木',
        '高橋',
        '田中',
        '伊藤',
        '渡辺',
        '山本',
        '中村',
        '小林',
        '加藤',
        '吉田',
        '山田',
        '佐々木',
        '山口',
        '松本',
        '井上',
        '木村',
        '林',
        '斎藤',
        '清水',
        '山崎',
        '森',
        '池田',
        '橋本',
        '阿部',
        '石川',
        '山下',
        '中島',
        '石井',
        '小川',
      ],
      go: { tables: 'テーブルを決める', grid: '席替えする' },
      again: { tables: 'もう一度決める', grid: 'もう一度席替えする' },
      count: { other: '全 {n} 人・席は {seats} 席' },
      dupes: { other: '（同じ名前が {n} 件あります）' },
      emptyTable: { other: '{n} 席' },
      stale: '名簿が変わりました。下は前回の結果です。もう一度席を決めてください。',
      errorEmpty: '名簿に名前を 1 行に 1 人ずつ入力してください。',
      errorTooMany: {
        tables: '名簿は {people} 人ですが、席は {seats} 席しかありません。テーブル数か 1 テーブルの人数を増やしてください。',
        grid: '名簿は {people} 人ですが、使える席は {seats} 席しかありません。横か縦の席数を増やすか、使わない席を元に戻してください。',
      },
      errorTableFull:
        '「{table}」に {pinned} 人を固定していますが、1 テーブルは {seats} 人までです。固定を減らすか、1 テーブルの人数を増やしてください。',
      errorFrontFull:
        '前の席にしたい人は {needed} 人ですが、前の席は {seats} 席しか空いていません。前の席の範囲を広げてください。',
      frontUnknown: '名簿に見つかりません：{names}',
      tableName: 'テーブル {n}',
      tableNameAria: 'テーブル {n} の名前',
      members: { other: '{n} 人' },
      memberPin: '{name}：このテーブルに固定する',
      memberUnpin: '{name}：固定を解除する',
      desk: '教卓',
      seatEmpty: '空席',
      seatUnused: '使わない席',
      seatAria: '前から {row} 列目、左から {col} 番目：{who}',
      pinnedMark: '（固定）',
      panelTitle: '前から {row} 列目、左から {col} 番目',
      panelPinOccupant: '{name} をこの席に固定する',
      panelBlock: 'この席を使わない',
      panelUnblock: 'この席を使う',
      copyTableLine: '{table}（{size} 人）：{names}',
      nameSeparator: '、',
      copyGridHeader: '（黒板に向かって左から）',
      copyRowLine: '前から {n} 列目：{names}',
      copyEmpty: '（空席）',
      copyUnused: '－',
      defaultTitle: { tables: '席次表', grid: '座席表' },
    },
  },
});

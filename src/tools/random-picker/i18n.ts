import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { SplitMode } from './logic';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  sample: string;
  clear: string;
  modeAria: string;
  modePick: string;
  modeGroup: string;
  modeOrder: string;
  pickCountLabel: string;
  removeAfter: string;
  groupByAria: string;
  groupByCount: string;
  groupBySize: string;
  dedupe: string;
  copyResult: string;
  client: {
    /** How pasted lists are split into entries. */
    split: SplitMode;
    sample: string[];
    go: { pick: string; group: string; order: string };
    groupCount: string;
    groupSize: string;
    /** {n} entries in the list. */
    count: PluralForms;
    dupesSkipped: PluralForms;
    dupesIncluded: PluralForms;
    rolling: string;
    errorEmpty: string;
    /** {total} {count} */
    errorPickTooMany: string;
    /** {total} {groups} */
    errorGroupTooMany: string;
    /** {n} drawn, {total} in the list */
    pickedTitle: PluralForms;
    /** {n} entries */
    orderTitle: PluralForms;
    groupsTitle: PluralForms;
    /** {n} = group number */
    groupName: string;
    members: PluralForms;
    /** Copied line: {n} group number, {size} members, {names} joined with nameSeparator */
    copyGroupLine: string;
    nameSeparator: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '名單（每行一個）',
    placeholder: '王小明\n李小華\n陳小美\n林志明\n張春嬌',
    sample: '填入範例',
    clear: '清除',
    modeAria: '模式',
    modePick: '抽籤',
    modeGroup: '分組',
    modeOrder: '排順序',
    pickCountLabel: '抽出人數',
    removeAfter: '抽中後從名單移除',
    groupByAria: '分組方式',
    groupByCount: '依組數',
    groupBySize: '依每組人數',
    dedupe: '移除重複的項目',
    copyResult: '複製結果',
    client: {
      split: 'lines',
      sample: ['王小明', '李小華', '陳小美', '林志明', '張春嬌', '黃建宏', '吳怡君', '劉家豪', '蔡雅婷', '鄭宇翔'],
      go: { pick: '開始抽籤', group: '開始分組', order: '打亂順序' },
      groupCount: '組數',
      groupSize: '每組人數',
      count: { other: '共 {n} 個項目' },
      dupesSkipped: { other: '（已略過 {n} 個重複）' },
      dupesIncluded: { other: '（含 {n} 個重複）' },
      rolling: '抽籤中…',
      errorEmpty: '請先輸入名單，每行一個項目。',
      errorPickTooMany: '名單只有 {total} 個項目，無法抽出 {count} 個。',
      errorGroupTooMany: '名單只有 {total} 個項目，無法分成 {groups} 組。',
      pickedTitle: { other: '抽出 {n} 個（共 {total} 個）' },
      orderTitle: { other: '新順序（共 {n} 個）' },
      groupsTitle: { other: '分成 {n} 組' },
      groupName: '第 {n} 組',
      members: { other: '{n} 人' },
      copyGroupLine: '第 {n} 組（{size} 人）：{names}',
      nameSeparator: '、',
    },
  },
  en: {
    inputLabel: 'Names or items (one per line)',
    placeholder: 'Alex\nJordan\nTaylor\nSam\nMorgan',
    sample: 'Use sample names',
    clear: 'Clear',
    modeAria: 'Mode',
    modePick: 'Pick winners',
    modeGroup: 'Make teams',
    modeOrder: 'Random order',
    pickCountLabel: 'How many to pick',
    removeAfter: 'Remove winners from the list',
    groupByAria: 'Split by',
    groupByCount: 'Number of teams',
    groupBySize: 'People per team',
    dedupe: 'Ignore duplicate entries',
    copyResult: 'Copy results',
    client: {
      split: 'lines',
      sample: ['Alex', 'Jordan', 'Taylor', 'Sam', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Drew'],
      go: { pick: 'Pick a winner', group: 'Make teams', order: 'Shuffle order' },
      groupCount: 'Number of teams',
      groupSize: 'People per team',
      count: { one: '{n} entry', other: '{n} entries' },
      dupesSkipped: { one: ' ({n} duplicate ignored)', other: ' ({n} duplicates ignored)' },
      dupesIncluded: { one: ' (includes {n} duplicate)', other: ' (includes {n} duplicates)' },
      rolling: 'Drawing…',
      errorEmpty: 'Add some names first, one per line.',
      errorPickTooMany: 'The list only has {total} entries, so you can’t pick {count}.',
      errorGroupTooMany: 'The list only has {total} entries, so it can’t be split into {groups} teams.',
      pickedTitle: { one: '{n} winner from {total} entries', other: '{n} winners from {total} entries' },
      orderTitle: { one: 'Random order ({n} entry)', other: 'Random order ({n} entries)' },
      groupsTitle: { one: '{n} team', other: '{n} teams' },
      groupName: 'Team {n}',
      members: { one: '{n} person', other: '{n} people' },
      copyGroupLine: 'Team {n} ({size}): {names}',
      nameSeparator: ', ',
    },
  },
  ja: {
    inputLabel: '名前リスト（1 行に 1 つ、または「、」区切り）',
    placeholder: '佐藤\n鈴木\n高橋\n田中\n伊藤',
    sample: 'サンプルを入力',
    clear: 'クリア',
    modeAria: 'モード',
    modePick: '抽選',
    modeGroup: 'グループ分け',
    modeOrder: '順番決め',
    pickCountLabel: '当選人数',
    removeAfter: '当選者をリストから外す',
    groupByAria: '分け方',
    groupByCount: 'グループ数で分ける',
    groupBySize: '1 グループの人数で分ける',
    dedupe: '重複した名前を除く',
    copyResult: '結果をコピー',
    client: {
      split: 'ja',
      sample: ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'],
      go: { pick: '抽選する', group: 'グループ分けする', order: '順番を決める' },
      groupCount: 'グループ数',
      groupSize: '1 グループの人数',
      count: { other: '全 {n} 件' },
      dupesSkipped: { other: '（重複 {n} 件を除外）' },
      dupesIncluded: { other: '（重複 {n} 件を含む）' },
      rolling: '抽選中…',
      errorEmpty: '名前を 1 行に 1 つずつ入力してください。',
      errorPickTooMany: 'リストは {total} 件しかないため、{count} 人は選べません。',
      errorGroupTooMany: 'リストは {total} 件しかないため、{groups} グループには分けられません。',
      pickedTitle: { other: '当選 {n} 人（全 {total} 件から）' },
      orderTitle: { other: '新しい順番（全 {n} 件）' },
      groupsTitle: { other: '{n} グループに分けました' },
      groupName: 'グループ {n}',
      members: { other: '{n} 人' },
      copyGroupLine: 'グループ {n}（{size} 人）：{names}',
      nameSeparator: '、',
    },
  },
});

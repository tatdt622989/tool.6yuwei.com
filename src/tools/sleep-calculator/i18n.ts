import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { SegmentKind, SettingsProblem, SleepTier } from './logic';

export type SleepMode = 'wake' | 'bed';

export interface Strings {
  modeAria: string;
  modes: Record<SleepMode, string>;
  wakeLabel: string;
  planLabel: string;
  bedLabel: string;
  now: string;
  resultAria: string;
  legend: Record<SegmentKind, string>;
  settings: string;
  latencyLabel: string;
  latencyHint: string;
  cycleLabel: string;
  cycleHint: string;
  disclaimer: string;
  client: {
    /** Show times on a 12-hour clock (11:15 PM) instead of 23:15. */
    clock12?: boolean;
    /** Heading above the options. {wake} / {bed} */
    lead: Record<SleepMode, string>;
    /** {n} cycles */
    cycles: PluralForms;
    /** Whole or half hours: {n} hours (7.5) */
    hours: PluralForms;
    /** Other durations: {h} and {m} */
    hoursMinutes: string;
    /** {n} minutes */
    minutes: PluralForms;
    tiers: Record<SleepTier, string>;
    /** Marker next to a time on another calendar day than the time typed in. */
    dayBefore: string;
    dayAfter: string;
    /** Caption under the timeline for an option: {bed} {asleep} {cycles} {sleep} {wake} */
    caption: string;
    /** Plan check (wake mode, optional bedtime). */
    check: {
      /** {bed} {wake} {cycles} {next} {m} (minutes, formatted with unit) */
      partial: string;
      /** {bed} {wake} {cycles} {sleep} */
      aligned: string;
      /** Two cycle-aligned alternatives, nearest first: {a} {aCycles} {b} {bCycles} */
      suggest: string;
      /** One alternative: {a} {aCycles} */
      suggestOne: string;
      /** The alarm comes before the person falls asleep. */
      tooShort: string;
    };
    /** Labels above the two ends of the timeline. */
    inBed: string;
    alarm: string;
    /** Summary next to the settings heading: {latency} {cycle} (minutes) */
    settingsSummary: string;
    problems: Record<SettingsProblem | 'time', string>;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: '計算方式',
    modes: { wake: '我要幾點起床', bed: '我幾點上床' },
    wakeLabel: '起床時間',
    planLabel: '打算幾點睡（選填）',
    bedLabel: '上床時間',
    now: '現在',
    resultAria: '建議時間',
    legend: { latency: '入睡', cycle: '完整睡眠週期', partial: '被鬧鐘打斷的週期' },
    settings: '進階設定',
    latencyLabel: '入睡需要幾分鐘',
    latencyHint: '躺下到睡著的時間，一般約 10–20 分鐘，可填 0–60。',
    cycleLabel: '一個睡眠週期（分鐘）',
    cycleHint: '平均約 90 分鐘，實際因人、因夜而異，大約 70–120 分鐘。',
    disclaimer:
      '結果是依平均值推算的參考時間，不是醫療建議。睡眠週期的長度因人而異，同一晚也會變化。長期失眠、白天嚴重嗜睡，或睡覺時打鼾、呼吸中止，請找醫師或睡眠專科評估。資料只在你的瀏覽器中計算，不會上傳。',
    client: {
      lead: { wake: '{wake} 起床，建議這些時間上床', bed: '{bed} 上床，可以設這些起床時間' },
      cycles: { other: '{n} 個週期' },
      hours: { other: '{n} 小時' },
      hoursMinutes: '{h} 小時 {m} 分',
      minutes: { other: '{n} 分鐘' },
      tiers: { recommended: '建議', short: '不得已才用', long: '睡比較久' },
      dayBefore: '前一天',
      dayAfter: '隔天',
      caption: '{bed} 上床，約 {asleep} 睡著，睡 {cycles}（{sleep}）後 {wake} 起床',
      check: {
        partial: '{bed} 上床、{wake} 起床：睡滿 {cycles}後，鬧鐘會在第 {next} 個週期開始約 {m}時響起。',
        aligned: '{bed} 上床、{wake} 起床：剛好睡滿 {cycles}（{sleep}），鬧鐘大約在週期結束時響起。',
        suggest: '想在週期結束時醒來，可以改成 {a} 上床（{aCycles}），或 {b} 上床（{bCycles}）。',
        suggestOne: '想在週期結束時醒來，可以改成 {a} 上床（{aCycles}）。',
        tooShort: '上床到起床的時間比入睡需要的時間還短，睡不到一個週期。',
      },
      inBed: '上床',
      alarm: '鬧鐘',
      settingsSummary: '入睡 {latency} 分鐘・每個週期 {cycle} 分鐘',
      problems: {
        time: '請輸入時間，例如 07:00。',
        latency: '入睡時間請輸入 0 到 60 分鐘。',
        cycle: '睡眠週期請輸入 70 到 120 分鐘。',
      },
    },
  },
  en: {
    modeAria: 'Calculate from',
    modes: { wake: 'I wake up at', bed: 'I go to bed at' },
    wakeLabel: 'Wake-up time',
    planLabel: 'Bedtime (optional)',
    bedLabel: 'Bedtime',
    now: 'Now',
    resultAria: 'Suggested times',
    legend: { latency: 'Falling asleep', cycle: 'Full sleep cycle', partial: 'Cycle cut short by the alarm' },
    settings: 'Settings',
    latencyLabel: 'Minutes to fall asleep',
    latencyHint: 'Time from lying down to falling asleep, usually 10 to 20 minutes. Enter 0 to 60.',
    cycleLabel: 'Sleep cycle length (minutes)',
    cycleHint: 'About 90 minutes on average, but it varies from person to person and night to night, roughly 70 to 120.',
    disclaimer:
      'These are estimates based on average cycle lengths, not medical advice. Real sleep cycles vary between people and through the night. If you have ongoing insomnia, severe daytime sleepiness, loud snoring or pauses in breathing during sleep, talk to a doctor or sleep specialist. Everything is calculated in your browser and nothing is uploaded.',
    client: {
      clock12: true,
      lead: { wake: 'To wake up at {wake}, try going to bed at', bed: 'Going to bed at {bed}? Set your alarm for' },
      cycles: { one: '{n} cycle', other: '{n} cycles' },
      hours: { one: '{n} hour', other: '{n} hours' },
      hoursMinutes: '{h} h {m} min',
      minutes: { one: '{n} minute', other: '{n} minutes' },
      tiers: { recommended: 'Recommended', short: 'Short night', long: 'Long night' },
      dayBefore: 'day before',
      dayAfter: 'next day',
      caption: 'In bed at {bed}, asleep around {asleep}, {cycles} ({sleep}), up at {wake}',
      check: {
        partial: 'Bed at {bed}, alarm at {wake}: after {cycles}, the alarm goes off about {m} into cycle {next}.',
        aligned: 'Bed at {bed}, alarm at {wake}: exactly {cycles} ({sleep}), so the alarm lands near the end of a cycle.',
        suggest: 'To wake at the end of a cycle, go to bed at {a} ({aCycles}) or {b} ({bCycles}) instead.',
        suggestOne: 'To wake at the end of a cycle, go to bed at {a} ({aCycles}) instead.',
        tooShort: 'There is less time between bed and the alarm than it takes to fall asleep.',
      },
      inBed: 'Bed',
      alarm: 'Alarm',
      settingsSummary: '{latency} min to fall asleep, {cycle}-min cycles',
      problems: {
        time: 'Enter a time, for example 7:00 AM.',
        latency: 'Enter 0 to 60 minutes to fall asleep.',
        cycle: 'Enter a cycle length from 70 to 120 minutes.',
      },
    },
  },
  ja: {
    modeAria: '計算のしかた',
    modes: { wake: '起きる時刻から', bed: '寝る時刻から' },
    wakeLabel: '起きる時刻',
    planLabel: '寝る予定（任意）',
    bedLabel: '布団に入る時刻',
    now: '今',
    resultAria: 'おすすめの時刻',
    legend: { latency: '寝つくまで', cycle: '睡眠サイクル', partial: 'アラームで途中になるサイクル' },
    settings: '詳細設定',
    latencyLabel: '寝つくまでの時間（分）',
    latencyHint: '布団に入ってから眠るまでの時間。ふつうは 10〜20 分ほどです（0〜60 分）。',
    cycleLabel: '睡眠サイクルの長さ（分）',
    cycleHint: '平均は約 90 分ですが、人や夜によって 70〜120 分ほどの幅があります。',
    disclaimer:
      '結果は平均的なサイクルの長さから計算した目安で、医学的な助言ではありません。睡眠サイクルの長さには個人差があり、同じ夜の中でも変わります。不眠が続く、日中の眠気が強い、いびきや睡眠中の呼吸の停止がある場合は、医師や睡眠外来に相談してください。計算はすべてブラウザ内で行い、データは送信されません。',
    client: {
      lead: { wake: '{wake} に起きるなら、この時刻に布団へ', bed: '{bed} に布団に入るなら、アラームはこの時刻に' },
      cycles: { other: '{n} サイクル' },
      hours: { other: '{n} 時間' },
      hoursMinutes: '{h} 時間 {m} 分',
      minutes: { other: '{n} 分' },
      tiers: { recommended: 'おすすめ', short: 'やむを得ないとき', long: '長め' },
      dayBefore: '前日',
      dayAfter: '翌日',
      caption: '{bed} に布団へ、{asleep} ごろ入眠、{cycles}（{sleep}）眠って {wake} に起床',
      check: {
        partial: '{bed} に寝て {wake} に起きると、{cycles}眠ったあと、{next} サイクル目に入って約 {m}でアラームが鳴ります。',
        aligned: '{bed} に寝て {wake} に起きると、ちょうど {cycles}（{sleep}）。サイクルの終わりごろにアラームが鳴ります。',
        suggest: 'サイクルの終わりに起きたいなら、{a}（{aCycles}）か {b}（{bCycles}）に布団に入りましょう。',
        suggestOne: 'サイクルの終わりに起きたいなら、{a}（{aCycles}）に布団に入りましょう。',
        tooShort: '布団に入ってから起きるまでが、寝つくまでの時間より短くなっています。',
      },
      inBed: '就寝',
      alarm: 'アラーム',
      settingsSummary: '寝つくまで {latency} 分・1 サイクル {cycle} 分',
      problems: {
        time: '時刻を入力してください（例：7:00）。',
        latency: '寝つくまでの時間は 0〜60 分で入力してください。',
        cycle: '睡眠サイクルは 70〜120 分で入力してください。',
      },
    },
  },
});

// UI strings for the microphone test. Media error / permission text comes from logic.ts (zh-TW)
// and media-text.ts (en / ja) so webcam-test can share it.
import { defineToolI18n } from '../../i18n/tool';
import { MEDIA_TEXT_ZH, VERDICT_TEXT, type MediaText, type VerdictText } from './logic';
import { MEDIA_TEXT_EN, MEDIA_TEXT_JA } from './media-text';

export interface Strings {
  start: string;
  stop: string;
  stateIdle: string;
  device: string;
  verdictTitle: string;
  verdictDetail: string;
  waveAria: string;
  statNow: string;
  statMax: string;
  statRate: string;
  statChannels: string;
  record: string;
  recordHint: string;
  download: string;
  raw: string;
  footnote: string;
  client: {
    verdicts: VerdictText;
    stoppedTitle: string;
    stoppedDetail: string;
    /** {s} seconds left, already formatted. */
    recording: string;
    stopped: string;
    restart: string;
    stereo: string;
    mono: string;
    live: string;
    recState: string;
    recUnsupported: string;
    recFailed: string;
    recEmpty: string;
    recDone: string;
    media: MediaText;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    start: '開始測試麥克風',
    stop: '停止',
    stateIdle: '未啟動',
    device: '輸入裝置',
    verdictTitle: '按「開始測試麥克風」並允許瀏覽器使用麥克風',
    verdictDetail: '開始後對著麥克風說話，下方的音量條與波形會即時跳動。',
    waveAria: '即時聲音波形',
    statNow: '目前音量（dBFS）',
    statMax: '本次最高峰值',
    statRate: '取樣率',
    statChannels: '聲道',
    record: '錄音 5 秒並回放',
    recordHint: '錄一段自己的聲音，聽聽看別人聽到的效果',
    download: '下載錄音',
    raw: '關閉降噪、回音消除與自動增益（聽原始收音）',
    footnote: '聲音只在你的瀏覽器中分析與錄製，不會上傳到任何伺服器；關閉或離開頁面時會自動停止麥克風。',
    client: {
      verdicts: VERDICT_TEXT,
      stoppedTitle: '麥克風已停止',
      stoppedDetail: '按「開始測試麥克風」可以再測一次。',
      recording: '錄音中，剩 {s} 秒',
      stopped: '已停止',
      restart: '重新開始測試',
      stereo: '立體聲',
      mono: '單聲道',
      live: '收音中',
      recState: '錄音中',
      recUnsupported: '這個瀏覽器不支援錄音功能，請改用最新版 Chrome、Edge、Safari 或 Firefox。',
      recFailed: '無法啟動錄音，請重新開始測試後再試一次。',
      recEmpty: '沒有錄到內容，請再試一次。',
      recDone: '錄好了，按播放鍵聽聽看',
      media: MEDIA_TEXT_ZH,
    },
  },
  en: {
    start: 'Test my microphone',
    stop: 'Stop',
    stateIdle: 'Off',
    device: 'Input device',
    verdictTitle: 'Press “Test my microphone” and allow microphone access',
    verdictDetail: 'Then speak into your mic: the level meter and waveform below react in real time.',
    waveAria: 'Live audio waveform',
    statNow: 'Level (dBFS)',
    statMax: 'Peak this session',
    statRate: 'Sample rate',
    statChannels: 'Channels',
    record: 'Record 5 seconds and play back',
    recordHint: 'Record yourself to hear what others hear on a call',
    download: 'Download recording',
    raw: 'Turn off noise suppression, echo cancellation and auto gain (hear the raw input)',
    footnote:
      'Audio is analyzed and recorded only in your browser and never uploaded. The microphone stops automatically when you close or leave the page.',
    client: {
      verdicts: {
        silent: { title: 'No sound detected', detail: 'Speak into the microphone. If nothing moves, choose another input device or check the mute switch.' },
        quiet: { title: 'Sound detected, but quiet', detail: 'Move closer to the mic, or raise the input volume in your system sound settings.' },
        good: { title: 'Your microphone is working', detail: 'The level is in a good range for calls and recordings.' },
        loud: { title: 'Too loud, may distort', detail: 'Move back from the mic or lower the input volume so your voice doesn’t clip.' },
      },
      stoppedTitle: 'Microphone stopped',
      stoppedDetail: 'Press “Test my microphone” to test again.',
      recording: 'Recording, {s} s left',
      stopped: 'Stopped',
      restart: 'Restart test',
      stereo: 'Stereo',
      mono: 'Mono',
      live: 'Listening',
      recState: 'Recording',
      recUnsupported: 'This browser can’t record audio. Use the latest Chrome, Edge, Safari or Firefox.',
      recFailed: 'Couldn’t start recording. Restart the test and try again.',
      recEmpty: 'Nothing was recorded. Please try again.',
      recDone: 'Done. Press play to listen',
      media: MEDIA_TEXT_EN,
    },
  },
  ja: {
    start: 'マイクをテスト',
    stop: '停止',
    stateIdle: '停止中',
    device: '入力デバイス',
    verdictTitle: '「マイクをテスト」を押して、ブラウザにマイクの使用を許可してください',
    verdictDetail: '開始したらマイクに向かって話してください。下の音量バーと波形がリアルタイムで動きます。',
    waveAria: 'リアルタイムの音声波形',
    statNow: '現在の音量（dBFS）',
    statMax: '最大ピーク',
    statRate: 'サンプリングレート',
    statChannels: 'チャンネル',
    record: '5 秒録音して再生',
    recordHint: '自分の声を録音して、相手にどう聞こえるか確認できます',
    download: '録音をダウンロード',
    raw: 'ノイズ抑制・エコーキャンセル・自動ゲインをオフにする（元の音を確認）',
    footnote:
      '音声はブラウザ内だけで解析・録音され、サーバーには送信されません。ページを閉じたり移動したりすると、マイクは自動で停止します。',
    client: {
      verdicts: {
        silent: { title: '音が検出されません', detail: 'マイクに向かって話してください。反応がない場合は、入力デバイスを切り替えるかミュートスイッチを確認してください。' },
        quiet: { title: '音は届いていますが小さめです', detail: 'マイクに近づくか、OS のサウンド設定で入力音量を上げてください。' },
        good: { title: 'マイクは正常です', detail: '通話や録音に適した音量で入力されています。' },
        loud: { title: '音量が大きすぎます（音割れの可能性）', detail: 'マイクから少し離れるか、入力音量を下げて音割れを防ぎましょう。' },
      },
      stoppedTitle: 'マイクを停止しました',
      stoppedDetail: '「マイクをテスト」を押すと、もう一度テストできます。',
      recording: '録音中（残り {s} 秒）',
      stopped: '停止',
      restart: 'もう一度テスト',
      stereo: 'ステレオ',
      mono: 'モノラル',
      live: '入力中',
      recState: '録音中',
      recUnsupported: 'このブラウザは録音に対応していません。最新版の Chrome、Edge、Safari、Firefox をお使いください。',
      recFailed: '録音を開始できませんでした。テストをやり直してから、もう一度お試しください。',
      recEmpty: '何も録音されませんでした。もう一度お試しください。',
      recDone: '録音しました。再生ボタンで聞いてみましょう',
      media: MEDIA_TEXT_JA,
    },
  },
});

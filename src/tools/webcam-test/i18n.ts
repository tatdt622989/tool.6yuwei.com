// UI strings for the webcam test. Media error / permission text is shared with mic-test.
import { defineToolI18n } from '../../i18n/tool';
import { MEDIA_TEXT_ZH, type MediaText } from '../mic-test/logic';
import { MEDIA_TEXT_EN, MEDIA_TEXT_JA } from '../mic-test/media-text';

export interface Strings {
  start: string;
  snap: string;
  fullscreen: string;
  stop: string;
  videoAria: string;
  placeholder: string;
  device: string;
  resolution: string;
  view: string;
  mirror: string;
  statRes: string;
  statGrade: string;
  statRatio: string;
  statFpsSet: string;
  statFps: string;
  statMax: string;
  shotAlt: string;
  shot: string;
  download: string;
  discard: string;
  footnote: string;
  client: {
    /** {ratio} {mp} */
    ratio: string;
    maxUnknown: string;
    stopped: string;
    start: string;
    opening: string;
    reopen: string;
    failed: string;
    mirroredSaved: string;
    snapped: string;
    hiddenStop: string;
    media: MediaText;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    start: '開啟鏡頭',
    snap: '拍照',
    fullscreen: '全螢幕',
    stop: '關閉鏡頭',
    videoAria: '鏡頭即時畫面',
    placeholder: '按「開啟鏡頭」並允許瀏覽器使用相機',
    device: '鏡頭',
    resolution: '要求解析度',
    view: '畫面',
    mirror: '鏡像顯示（像照鏡子）',
    statRes: '實際解析度',
    statGrade: '畫質等級',
    statRatio: '長寬比',
    statFpsSet: '設定幀率（fps）',
    statFps: '實測幀率（fps）',
    statMax: '鏡頭最高支援',
    shotAlt: '鏡頭快照',
    shot: '快照',
    download: '下載 PNG',
    discard: '刪除',
    footnote: '畫面只在你的瀏覽器中顯示與處理，不會錄影或上傳；按「關閉鏡頭」、切換分頁或離開頁面時，鏡頭會自動關閉。',
    client: {
      ratio: '{ratio}（{mp} MP）',
      maxUnknown: '瀏覽器未提供',
      stopped: '鏡頭已關閉，按「開啟鏡頭」可再次測試',
      start: '開啟鏡頭',
      opening: '正在開啟鏡頭…',
      reopen: '重新開啟',
      failed: '無法開啟鏡頭',
      mirroredSaved: '，已依鏡像方向儲存',
      snapped: '已拍照',
      hiddenStop: '切換分頁時已自動關閉鏡頭，按「開啟鏡頭」可再次測試。',
      media: MEDIA_TEXT_ZH,
    },
  },
  en: {
    start: 'Test my webcam',
    snap: 'Take photo',
    fullscreen: 'Full screen',
    stop: 'Turn off camera',
    videoAria: 'Live camera preview',
    placeholder: 'Press “Test my webcam” and allow camera access',
    device: 'Camera',
    resolution: 'Requested resolution',
    view: 'View',
    mirror: 'Mirror preview (like a mirror)',
    statRes: 'Actual resolution',
    statGrade: 'Quality',
    statRatio: 'Aspect ratio',
    statFpsSet: 'Set frame rate (fps)',
    statFps: 'Measured frame rate (fps)',
    statMax: 'Camera maximum',
    shotAlt: 'Webcam snapshot',
    shot: 'Snapshot',
    download: 'Download PNG',
    discard: 'Delete',
    footnote:
      'The video is shown and processed only in your browser; nothing is recorded or uploaded. The camera turns off when you press “Turn off camera”, switch tabs or leave the page.',
    client: {
      ratio: '{ratio} ({mp} MP)',
      maxUnknown: 'Not reported',
      stopped: 'Camera off. Press “Test my webcam” to test again',
      start: 'Test my webcam',
      opening: 'Opening camera…',
      reopen: 'Restart camera',
      failed: 'Couldn’t open the camera',
      mirroredSaved: ', saved mirrored',
      snapped: 'Photo taken',
      hiddenStop: 'The camera was turned off when you switched tabs. Press “Test my webcam” to test again.',
      media: MEDIA_TEXT_EN,
    },
  },
  ja: {
    start: 'カメラをテスト',
    snap: '撮影',
    fullscreen: '全画面',
    stop: 'カメラをオフ',
    videoAria: 'カメラのライブ映像',
    placeholder: '「カメラをテスト」を押して、ブラウザにカメラの使用を許可してください',
    device: 'カメラ',
    resolution: '要求する解像度',
    view: '表示',
    mirror: '左右反転して表示（鏡のように）',
    statRes: '実際の解像度',
    statGrade: '画質',
    statRatio: 'アスペクト比',
    statFpsSet: '設定フレームレート（fps）',
    statFps: '実測フレームレート（fps）',
    statMax: 'カメラの最大解像度',
    shotAlt: 'カメラのスナップショット',
    shot: 'スナップショット',
    download: 'PNG をダウンロード',
    discard: '削除',
    footnote:
      '映像はブラウザ内だけで表示・処理され、録画や送信はされません。「カメラをオフ」を押したとき、タブを切り替えたとき、ページを離れたときにカメラは自動でオフになります。',
    client: {
      ratio: '{ratio}（{mp} MP）',
      maxUnknown: '取得できません',
      stopped: 'カメラをオフにしました。「カメラをテスト」でもう一度テストできます',
      start: 'カメラをテスト',
      opening: 'カメラを起動しています…',
      reopen: 'カメラを再起動',
      failed: 'カメラを起動できません',
      mirroredSaved: '、左右反転して保存',
      snapped: '撮影しました',
      hiddenStop: 'タブを切り替えたためカメラをオフにしました。「カメラをテスト」でもう一度テストできます。',
      media: MEDIA_TEXT_JA,
    },
  },
});

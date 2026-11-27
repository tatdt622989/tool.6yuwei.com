import { defineToolI18n } from '../../i18n/tool';
import type { OutputKind, SizeLevel } from './logic';

export interface Strings {
  dropTitle: string;
  dropHint: string;
  previewAlt: string;
  statType: string;
  statDims: string;
  statSize: string;
  statLen: string;
  kindLabel: string;
  kinds: Record<OutputKind, string>;
  outLabel: string;
  outPlaceholder: string;
  copy: string;
  save: string;
  clear: string;
  privacy: string;
  client: {
    notImage: string;
    readError: string;
    /** {n} formatted character count */
    chars: string;
    sizeAdvice: Record<SizeLevel, string>;
    /** {advice} {size} */
    note: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 PNG、JPG、WebP、GIF、SVG、ICO 等，也可以按 Ctrl/Cmd + V 貼上',
    previewAlt: '預覽',
    statType: '格式',
    statDims: '尺寸（px）',
    statSize: '原始大小',
    statLen: 'Base64 大小',
    kindLabel: '輸出格式',
    kinds: { datauri: 'Data URI', base64: '純 Base64', css: 'CSS 背景', html: 'HTML img' },
    outLabel: '轉換結果',
    outPlaceholder: '選擇圖片後，Base64 編碼會顯示在這裡',
    copy: '複製結果',
    save: '下載為 .txt',
    clear: '清除',
    privacy: '圖片只在你的瀏覽器中轉換，不會上傳到任何伺服器。',
    client: {
      notImage: '這不是圖片檔，請選擇 PNG、JPG、WebP、GIF 或 SVG 等圖片。',
      readError: '讀取檔案失敗，請再試一次。',
      chars: '{n} 個字元',
      sizeAdvice: {
        small: '檔案很小，適合直接內嵌在 HTML 或 CSS 中。',
        medium: '超過 10 KB，內嵌後會讓 HTML／CSS 明顯變大，建議只用在少量關鍵圖片。',
        large: '超過 100 KB，不建議內嵌，改用一般圖片檔並交給瀏覽器快取會更快。',
        huge: '超過 2 MB，產生的文字非常長，貼到編輯器或網頁中可能造成卡頓。',
      },
      note: '{advice} 轉換後約 {size}，比原檔大約三分之一。',
    },
  },
  en: {
    dropTitle: 'Click to choose an image, or drop it here',
    dropHint: 'PNG, JPG, WebP, GIF, SVG, ICO and more. You can also paste with Ctrl/Cmd + V',
    previewAlt: 'Preview',
    statType: 'Format',
    statDims: 'Dimensions (px)',
    statSize: 'File size',
    statLen: 'Base64 size',
    kindLabel: 'Output format',
    kinds: { datauri: 'Data URI', base64: 'Base64 only', css: 'CSS background', html: 'HTML img' },
    outLabel: 'Result',
    outPlaceholder: 'Choose an image and its Base64 string appears here',
    copy: 'Copy result',
    save: 'Download .txt',
    clear: 'Clear',
    privacy: 'Images are encoded in your browser and never uploaded to a server.',
    client: {
      notImage: 'That file isn’t an image. Choose a PNG, JPG, WebP, GIF or SVG file.',
      readError: 'Couldn’t read the file. Please try again.',
      chars: '{n} characters',
      sizeAdvice: {
        small: 'Small file: a good fit for inlining in HTML or CSS.',
        medium: 'Over 10 KB: inlining will noticeably bloat your HTML or CSS, so keep it to a few critical images.',
        large: 'Over 100 KB: inlining isn’t recommended. A regular image file that the browser can cache will load faster.',
        huge: 'Over 2 MB: the output is extremely long and may freeze your editor or page.',
      },
      note: '{advice} The encoded string is about {size}, roughly a third larger than the file.',
    },
  },
  ja: {
    dropTitle: 'クリックして画像を選択、またはここにドロップ',
    dropHint: 'PNG・JPG・WebP・GIF・SVG・ICO などに対応。Ctrl/Cmd + V で貼り付けもできます',
    previewAlt: 'プレビュー',
    statType: '形式',
    statDims: 'サイズ（px）',
    statSize: '元のファイルサイズ',
    statLen: 'Base64 のサイズ',
    kindLabel: '出力形式',
    kinds: { datauri: 'Data URI', base64: 'Base64 のみ', css: 'CSS 背景', html: 'HTML img' },
    outLabel: '変換結果',
    outPlaceholder: '画像を選ぶと、ここに Base64 文字列が表示されます',
    copy: '結果をコピー',
    save: '.txt でダウンロード',
    clear: 'クリア',
    privacy: '画像はブラウザ内で変換され、サーバーにアップロードされることはありません。',
    client: {
      notImage: '画像ファイルではありません。PNG・JPG・WebP・GIF・SVG などの画像を選んでください。',
      readError: 'ファイルを読み込めませんでした。もう一度お試しください。',
      chars: '{n} 文字',
      sizeAdvice: {
        small: '小さなファイルなので、HTML や CSS に直接埋め込むのに向いています。',
        medium: '10 KB を超えています。埋め込むと HTML／CSS が大きくなるため、重要な画像だけにとどめましょう。',
        large: '100 KB を超えています。埋め込みはおすすめしません。通常の画像ファイルにしてブラウザにキャッシュさせるほうが速く表示できます。',
        huge: '2 MB を超えています。出力される文字列が非常に長く、エディタやページの動作が重くなるおそれがあります。',
      },
      note: '{advice}変換後は約 {size} で、元のファイルより 3 分の 1 ほど大きくなります。',
    },
  },
});

import { defineToolI18n } from '../../i18n/tool';
import type { EcLevel, QrMode } from './logic';

export interface Strings {
  modeAria: string;
  modes: Record<QrMode, string>;
  urlLabel: string;
  urlHint: string;
  textLabel: string;
  textPlaceholder: string;
  ssidLabel: string;
  ssidPlaceholder: string;
  securityLabel: string;
  noPassword: string;
  passwordLabel: string;
  hiddenNetwork: string;
  mailTo: string;
  mailSubject: string;
  mailBody: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHint: string;
  /** Order of the name fields in the contact card form. */
  nameOrder: 'family-first' | 'given-first';
  vcLast: string;
  vcFirst: string;
  vcOrg: string;
  vcTitle: string;
  vcPhone: string;
  vcEmail: string;
  vcUrl: string;
  vcAddress: string;
  vcNote: string;
  levelLabel: string;
  /** `${marginBefore}<output>4</output>${marginAfter}` */
  marginBefore: string;
  marginAfter: string;
  foreground: string;
  background: string;
  transparent: string;
  resetColors: string;
  pngSize: string;
  printSuffix: string;
  downloadPng: string;
  downloadSvg: string;
  payloadSummary: string;
  copyPayload: string;
  client: {
    previewEmpty: string;
    previewTooLong: string;
    previewFailed: string;
    /** {bytes} {level} {cap} */
    tooLong: string;
    /** {version} {n} {level} {recovery} */
    info: string;
    recovery: Record<EcLevel, string>;
    warnInverted: string;
    warnLowContrast: string;
    warnTransparent: string;
    failed: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    modeAria: 'QR Code 類型',
    modes: { url: '網址', text: '文字', wifi: 'Wi-Fi', email: 'Email', phone: '電話', vcard: '名片' },
    urlLabel: '網址',
    urlHint: '沒有輸入 https:// 時會自動補上。',
    textLabel: '文字內容',
    textPlaceholder: '輸入任何文字，掃描後會直接顯示',
    ssidLabel: '網路名稱（SSID）',
    ssidPlaceholder: '例如 MyHome-5G',
    securityLabel: '加密方式',
    noPassword: '無密碼',
    passwordLabel: '密碼',
    hiddenNetwork: '隱藏網路（不廣播 SSID）',
    mailTo: '收件者',
    mailSubject: '主旨',
    mailBody: '內文',
    phoneLabel: '電話號碼',
    phonePlaceholder: '例如 0912-345-678 或 +886 2 2345 6789',
    phoneHint: '掃描後會開啟撥號畫面，空白與連字號會自動移除。',
    nameOrder: 'family-first',
    vcLast: '姓',
    vcFirst: '名',
    vcOrg: '公司',
    vcTitle: '職稱',
    vcPhone: '手機',
    vcEmail: 'Email',
    vcUrl: '網站',
    vcAddress: '地址',
    vcNote: '備註',
    levelLabel: '容錯等級',
    marginBefore: '邊界：',
    marginAfter: ' 格',
    foreground: '前景色',
    background: '背景色',
    transparent: '透明背景',
    resetColors: '還原黑白',
    pngSize: 'PNG 尺寸',
    printSuffix: '（印刷）',
    downloadPng: '下載 PNG',
    downloadSvg: '下載 SVG',
    payloadSummary: '查看編碼內容',
    copyPayload: '複製編碼內容',
    client: {
      previewEmpty: '輸入內容後會在這裡顯示 QR Code',
      previewTooLong: '內容太長，無法產生',
      previewFailed: '無法產生 QR Code',
      tooLong: '內容有 {bytes} 位元組，超過容錯等級 {level} 的上限 {cap} 位元組。請縮短內容或改用較低的容錯等級。',
      info: '版本 {version}・{n} × {n} 模組・容錯 {level}（{recovery}）',
      recovery: { L: '約 7%', M: '約 15%', Q: '約 25%', H: '約 30%' },
      warnInverted: '前景色比背景色淺，許多掃描器無法辨識反白的 QR Code，建議使用深色前景。',
      warnLowContrast: '前景與背景的對比偏低，可能不易掃描，建議加深前景色。',
      warnTransparent: '透明背景請放在淺色底上使用，放在深色底上會無法掃描。',
      failed: '產生失敗，請縮短內容或改用較低的容錯等級。',
    },
  },
  en: {
    modeAria: 'QR code type',
    modes: { url: 'URL', text: 'Text', wifi: 'Wi-Fi', email: 'Email', phone: 'Phone', vcard: 'Contact' },
    urlLabel: 'Website URL',
    urlHint: 'https:// is added automatically if you leave it out.',
    textLabel: 'Text',
    textPlaceholder: 'Type any text. It appears on screen when the code is scanned.',
    ssidLabel: 'Network name (SSID)',
    ssidPlaceholder: 'e.g. MyHome-5G',
    securityLabel: 'Security',
    noPassword: 'None (open network)',
    passwordLabel: 'Password',
    hiddenNetwork: 'Hidden network (SSID not broadcast)',
    mailTo: 'To',
    mailSubject: 'Subject',
    mailBody: 'Message',
    phoneLabel: 'Phone number',
    phonePlaceholder: 'e.g. (555) 123-4567 or +1 555 123 4567',
    phoneHint: 'Scanning opens the dialer. Spaces, dashes and parentheses are removed.',
    nameOrder: 'given-first',
    vcLast: 'Last name',
    vcFirst: 'First name',
    vcOrg: 'Company',
    vcTitle: 'Job title',
    vcPhone: 'Mobile',
    vcEmail: 'Email',
    vcUrl: 'Website',
    vcAddress: 'Address',
    vcNote: 'Note',
    levelLabel: 'Error correction',
    marginBefore: 'Quiet zone: ',
    marginAfter: ' modules',
    foreground: 'Foreground',
    background: 'Background',
    transparent: 'Transparent background',
    resetColors: 'Reset to black and white',
    pngSize: 'PNG size',
    printSuffix: ' (print)',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    payloadSummary: 'Show encoded data',
    copyPayload: 'Copy encoded data',
    client: {
      previewEmpty: 'Your QR code will appear here',
      previewTooLong: 'Too much data for a QR code',
      previewFailed: 'Could not create the QR code',
      tooLong:
        'The content is {bytes} bytes, more than the {cap}-byte limit for error correction level {level}. Shorten it or choose a lower level.',
      info: 'Version {version} · {n} × {n} modules · level {level} ({recovery})',
      recovery: { L: 'about 7%', M: 'about 15%', Q: 'about 25%', H: 'about 30%' },
      warnInverted:
        'The foreground is lighter than the background. Many scanners can’t read inverted QR codes, so use a dark foreground.',
      warnLowContrast: 'Low contrast between foreground and background may make the code hard to scan. Try a darker foreground.',
      warnTransparent: 'Place a transparent QR code on a white or light background. It won’t scan on a dark one.',
      failed: 'Could not create the QR code. Shorten the content or choose a lower error correction level.',
    },
  },
  ja: {
    modeAria: 'QR コードの種類',
    modes: { url: 'URL', text: 'テキスト', wifi: 'Wi-Fi', email: 'メール', phone: '電話', vcard: '連絡先' },
    urlLabel: 'URL',
    urlHint: 'https:// を省略した場合は自動で補います。',
    textLabel: 'テキスト',
    textPlaceholder: '読み取ると画面に表示される文章を入力',
    ssidLabel: 'ネットワーク名（SSID）',
    ssidPlaceholder: '例：MyHome-5G',
    securityLabel: '暗号化方式',
    noPassword: 'なし（パスワードなし）',
    passwordLabel: 'パスワード',
    hiddenNetwork: 'ステルス SSID（ネットワーク名を非公開にしている）',
    mailTo: '宛先',
    mailSubject: '件名',
    mailBody: '本文',
    phoneLabel: '電話番号',
    phonePlaceholder: '例：090-1234-5678、03-1234-5678',
    phoneHint: '読み取ると電話アプリが開きます。スペースとハイフンは自動で取り除きます。',
    nameOrder: 'family-first',
    vcLast: '姓',
    vcFirst: '名',
    vcOrg: '会社名',
    vcTitle: '役職',
    vcPhone: '携帯電話',
    vcEmail: 'メール',
    vcUrl: 'Web サイト',
    vcAddress: '住所',
    vcNote: 'メモ',
    levelLabel: '誤り訂正レベル',
    marginBefore: '余白（クワイエットゾーン）：',
    marginAfter: ' セル',
    foreground: '前景色',
    background: '背景色',
    transparent: '背景を透明にする',
    resetColors: '白黒に戻す',
    pngSize: 'PNG のサイズ',
    printSuffix: '（印刷用）',
    downloadPng: 'PNG をダウンロード',
    downloadSvg: 'SVG をダウンロード',
    payloadSummary: 'エンコード内容を見る',
    copyPayload: 'エンコード内容をコピー',
    client: {
      previewEmpty: '入力すると、ここに QR コードが表示されます',
      previewTooLong: 'データが長すぎて作成できません',
      previewFailed: 'QR コードを作成できませんでした',
      tooLong:
        '内容が {bytes} バイトあり、誤り訂正レベル {level} の上限 {cap} バイトを超えています。内容を短くするか、低いレベルを選んでください。',
      info: 'バージョン {version}・{n} × {n} セル・誤り訂正 {level}（{recovery}）',
      recovery: { L: '約 7%', M: '約 15%', Q: '約 25%', H: '約 30%' },
      warnInverted: '前景色が背景色より明るくなっています。白黒反転した QR コードは読み取れないアプリが多いため、前景は濃い色にしてください。',
      warnLowContrast: '前景色と背景色のコントラストが低く、読み取りにくい可能性があります。前景色を濃くしてください。',
      warnTransparent: '透明背景の QR コードは白や淡い色の上に配置してください。濃い色の上では読み取れません。',
      failed: '作成できませんでした。内容を短くするか、低い誤り訂正レベルを選んでください。',
    },
  },
});

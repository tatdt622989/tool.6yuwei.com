// en / ja text for media errors and permission help, shared by mic-test and webcam-test.
// zh-TW is MEDIA_TEXT_ZH in logic.ts. Settings paths use the real menu labels of each OS / browser in that language.
import type { MediaText } from './logic';

export const MEDIA_TEXT_EN: MediaText = {
  kindName: { mic: 'microphone', camera: 'camera' },
  kindTitle: { mic: 'Microphone', camera: 'Camera' },
  apps: { mic: 'Zoom, Teams, Discord, Google Meet or a recording app', camera: 'Zoom, Teams, Google Meet, FaceTime or OBS' },
  help: {
    iosSafari: [
      'Safari: tap the page menu icon at the left of the address bar > Website Settings, set {Name} to Allow, then reload the page.',
      'If it still doesn’t work, open the Settings app > Apps > Safari > {Name} and choose Ask or Allow.',
    ],
    iosOther:
      'Open the iPhone Settings app > Apps, find the browser you are using, turn on {Name}, then come back and reload this page.',
    chrome: 'Chrome: click the “View site information” icon at the left of the address bar, turn {Name} on, then reload the page.',
    edge: 'Edge: click the lock icon at the left of the address bar > Permissions for this site, set {Name} to Allow, then reload the page.',
    firefox:
      'Firefox: click the crossed-out {name} icon in the address bar, click × next to “Blocked” to clear it, reload, then press Start again and choose Allow.',
    safari: 'Safari: in the menu bar choose Safari > Settings > Websites, select {Name} on the left, set this website to Allow, then reload the page.',
    samsung: 'Samsung Internet: menu > Settings > Sites and downloads > Site permissions > {Name}, then remove the block for this site.',
    other: 'Click the site information or lock icon next to the address bar, allow the {name} for this site, then reload the page.',
    android: 'Android: Settings > Apps > your browser > Permissions > {Name} > Allow.',
    mac: 'macOS: System Settings > Privacy & Security > {Name}, then turn on your browser (you may need to quit and reopen it).',
    windows:
      'Windows 11: Settings > Privacy & security > {Name}, then turn on “{Name} access” and “Let desktop apps access your {name}”.',
  },
  errors: {
    denied: {
      title: '{Name} access was blocked',
      detail: 'Your browser or operating system blocked this site from using the {name}. Allow it with the steps below, then press Start again.',
    },
    notFound: {
      title: 'No {name} found',
      detail: 'Your system doesn’t see any {name}. Check that it is plugged in or paired (USB or Bluetooth) and that any hardware switch or privacy shutter is off, then reload the page.',
    },
    notReadable: {
      title: 'The {name} couldn’t start',
      detail: 'Another app may be using the {name} (for example {apps}). Close it and try again. If that doesn’t help, unplug and reconnect the device, restart your computer and check the driver.',
    },
    overconstrained: {
      title: 'The selected {name} isn’t available',
      detail: 'The selected device is gone or doesn’t support the requested settings. Pick another device in the menu{extra} and try again.',
    },
    insecure: {
      title: 'A secure connection (HTTPS) is required',
      detail: 'Browsers only allow the {name} on HTTPS pages. Make sure the address starts with https://, or open the page in a regular browser (some in-app browsers don’t support it).',
    },
    unsupported: {
      title: 'This browser can’t test the {name}',
      detail: 'Use the latest Chrome, Edge, Safari or Firefox. In-app browsers in apps like Instagram, Facebook and TikTok often can’t use the {name}; open the menu and choose “Open in browser”.',
    },
    unknown: {
      title: 'The {name} failed to start',
      detail: 'An unexpected error occurred ({error}). Reload the page or try another browser.',
    },
  },
  cameraLowerRes: ' or choose a lower resolution',
  unknownError: 'unknown',
};

export const MEDIA_TEXT_JA: MediaText = {
  kindName: { mic: 'マイク', camera: 'カメラ' },
  kindTitle: { mic: 'マイク', camera: 'カメラ' },
  apps: { mic: 'Zoom、Teams、Discord、LINE、録音アプリなど', camera: 'Zoom、Teams、Google Meet、LINE、OBS など' },
  help: {
    iosSafari: [
      'Safari：アドレスバー左のページメニューのアイコン →「Web サイトの設定」→「{name}」を「許可」にして、ページを再読み込みします。',
      'それでも使えない場合は、iPhone の「設定」→「アプリ」→「Safari」→「{name}」を「確認」または「許可」にします。',
    ],
    iosOther: 'iPhone の「設定」→「アプリ」→ 使っているブラウザ →「{name}」をオンにしてから、このページを再読み込みします。',
    chrome: 'Chrome：アドレスバー左の「サイト情報を表示」アイコン →「{name}」をオンにして、ページを再読み込みします。',
    edge: 'Edge：アドレスバー左の鍵アイコン →「このサイトのアクセス許可」→「{name}」を「許可」にして、ページを再読み込みします。',
    firefox:
      'Firefox：アドレスバーにある斜線の入った{name}アイコン →「ブロック」の横の × を押して解除し、再読み込みしてからもう一度開始して「許可」を選びます。',
    safari: 'Safari：メニューバーの「Safari」→「設定」→「Web サイト」→ 左側で「{name}」を選び、このサイトを「許可」にして再読み込みします。',
    samsung: 'Samsung Internet：メニュー →「設定」→「サイトとダウンロード」→「サイトの権限」→「{name}」で、このサイトのブロックを解除します。',
    other: 'アドレスバー横のサイト情報または鍵アイコンから、このサイトの「{name}」を許可して、ページを再読み込みします。',
    android: 'Android：「設定」→「アプリ」→ 使っているブラウザ →「権限」→「{name}」を「許可」にします。',
    mac: 'macOS：「システム設定」→「プライバシーとセキュリティ」→「{name}」で、ブラウザをオンにします（変更後はブラウザの再起動が必要な場合があります）。',
    windows:
      'Windows 11：「設定」→「プライバシーとセキュリティ」→「{name}」で、「{name}へのアクセス」と「デスクトップ アプリが{name}にアクセスできるようにする」をオンにします。',
  },
  errors: {
    denied: {
      title: '{name}の使用がブロックされています',
      detail: 'ブラウザまたは OS が、このサイトでの{name}の使用をブロックしています。次の手順で許可してから、もう一度開始してください。',
    },
    notFound: {
      title: '{name}が見つかりません',
      detail: '{name}が検出されませんでした。USB の接続や Bluetooth のペアリング、本体のスイッチやプライバシーシャッターを確認し、接続してからページを再読み込みしてください。',
    },
    notReadable: {
      title: '{name}を起動できません',
      detail: '{name}を他のアプリ（{apps}）が使用中の可能性があります。それらを終了してから再度お試しください。改善しない場合は、デバイスの抜き差しやパソコンの再起動、ドライバーの確認をしてください。',
    },
    overconstrained: {
      title: '選択した{name}を使用できません',
      detail: '選択したデバイスが見つからないか、要求した設定に対応していません。メニューで別のデバイスを選んで{extra}、もう一度お試しください。',
    },
    insecure: {
      title: '安全な接続（HTTPS）が必要です',
      detail: 'ブラウザは HTTPS のページでしか{name}を使えません。アドレスが https:// で始まっているか確認するか、通常のブラウザで開いてください（一部のアプリ内ブラウザは非対応です）。',
    },
    unsupported: {
      title: 'このブラウザでは{name}をテストできません',
      detail: '最新版の Chrome、Edge、Safari、Firefox をお使いください。LINE や X などのアプリ内ブラウザでは{name}を使えないことが多いため、メニューから「ブラウザで開く」を選んでください。',
    },
    unknown: {
      title: '{name}の起動に失敗しました',
      detail: '予期しないエラーが発生しました（{error}）。ページを再読み込みするか、別のブラウザでお試しください。',
    },
  },
  cameraLowerRes: '（または解像度を下げて）',
  unknownError: '不明',
};

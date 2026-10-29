// Pure, DOM-free helpers for the microphone test.

/** Lowest level the meter shows; anything quieter reads as silence. */
export const FLOOR_DB = -60;

/** Root-mean-square of a block of samples in [-1, 1]. */
export function rmsOf(samples: ArrayLike<number>): number {
  const n = samples.length;
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / n);
}

/** Largest absolute sample value in a block. */
export function peakOf(samples: ArrayLike<number>): number {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > max) max = v;
  }
  return max;
}

/** Linear amplitude (0–1) to dBFS, clamped to [-100, 0]. */
export function toDbfs(amplitude: number): number {
  if (!(amplitude > 0)) return -100;
  return Math.max(-100, Math.min(0, 20 * Math.log10(amplitude)));
}

/** Maps dBFS onto a 0–100 meter position between `floor` and 0 dB. */
export function dbToPercent(db: number, floor = FLOOR_DB): number {
  if (!Number.isFinite(db) || db <= floor) return 0;
  if (db >= 0) return 100;
  return ((db - floor) / -floor) * 100;
}

/**
 * Peak-hold with linear decay: jumps up instantly, falls by `decayDbPerSec`.
 * Used for the meter's peak marker and to keep the verdict from flickering.
 */
export function peakHold(previous: number, current: number, elapsedMs: number, decayDbPerSec = 15): number {
  if (current >= previous) return current;
  return Math.max(current, previous - (decayDbPerSec * Math.max(0, elapsedMs)) / 1000);
}

export type LevelVerdict = 'silent' | 'quiet' | 'good' | 'loud';

/** Classifies a held RMS level (dBFS). Clipping overrides everything. */
export function levelVerdict(heldRmsDb: number, clipping = false): LevelVerdict {
  if (clipping || heldRmsDb > -6) return 'loud';
  if (heldRmsDb < -55) return 'silent';
  if (heldRmsDb < -38) return 'quiet';
  return 'good';
}

export type VerdictText = Record<LevelVerdict, { title: string; detail: string }>;

export const VERDICT_TEXT: VerdictText = {
  silent: { title: '沒有偵測到聲音', detail: '請對著麥克風說話。若一直沒有反應，換一個輸入裝置或檢查靜音開關。' },
  quiet: { title: '有收到聲音，但偏小', detail: '靠近麥克風一點，或到系統音效設定把輸入音量調高。' },
  good: { title: '收音正常', detail: '麥克風運作正常，音量落在適合通話與錄音的範圍。' },
  loud: { title: '音量過大，可能爆音', detail: '離麥克風遠一點，或把系統輸入音量調低，避免聲音破掉。' },
};

/** Treat a block as clipped when any sample reaches (nearly) full scale. */
export function isClipping(peakAmplitude: number): boolean {
  return peakAmplitude >= 0.99;
}

/** Recording formats in preference order; Safari only supports audio/mp4. */
export const RECORDER_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

/** First supported MediaRecorder MIME type, or '' to let the browser decide. */
export function pickRecorderType(isTypeSupported: (type: string) => boolean): string {
  for (const type of RECORDER_TYPES) {
    try {
      if (isTypeSupported(type)) return type;
    } catch {
      /* ignore */
    }
  }
  return '';
}

export function extensionForType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('mp4') || t.includes('aac')) return 'm4a';
  if (t.includes('ogg')) return 'ogg';
  if (t.includes('wav')) return 'wav';
  return 'webm';
}

export function recordingFilename(date: Date, type: string): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `mic-test-${stamp}.${extensionForType(type)}`;
}

// ---------- Errors & permission help ----------

export type MediaKind = 'mic' | 'camera';
export type Browser = 'chrome' | 'edge' | 'firefox' | 'safari' | 'samsung' | 'other';
export type Platform = 'ios' | 'android' | 'mac' | 'windows' | 'other';

export interface Env {
  browser: Browser;
  platform: Platform;
}

/** Detects browser and platform from a user agent; iPadOS reports as Mac but has touch points. */
export function detectEnv(userAgent: string, maxTouchPoints = 0): Env {
  const ua = userAgent;
  let platform: Platform = 'other';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) platform = 'ios';
  else if (/Android/.test(ua)) platform = 'android';
  else if (/Macintosh|Mac OS X/.test(ua)) platform = 'mac';
  else if (/Windows/.test(ua)) platform = 'windows';

  let browser: Browser = 'other';
  if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/Edg(e|A|iOS)?\//.test(ua)) browser = 'edge';
  else if (/Firefox\/|FxiOS\//.test(ua)) browser = 'firefox';
  else if (/Chrome\/|CriOS\//.test(ua)) browser = 'chrome';
  else if (/Safari\//.test(ua)) browser = 'safari';
  return { browser, platform };
}

/**
 * Localized text for media errors and permission help. Templates use {name} (device name in running
 * text), {Name} (sentence-start form), {apps}, {extra} and {error}. zh-TW (MEDIA_TEXT_ZH) is the default;
 * en / ja live in media-text.ts and travel to the browser through each tool's i18n.ts.
 */
export interface MediaText {
  kindName: Record<MediaKind, string>;
  /** Sentence-start form of kindName (same as kindName in zh / ja). */
  kindTitle: Record<MediaKind, string>;
  /** Apps that commonly hold the device. */
  apps: Record<MediaKind, string>;
  help: {
    iosSafari: string[];
    iosOther: string;
    chrome: string;
    edge: string;
    firefox: string;
    safari: string;
    samsung: string;
    other: string;
    android: string;
    mac: string;
    windows: string;
  };
  errors: Record<'denied' | 'notFound' | 'notReadable' | 'overconstrained' | 'insecure' | 'unsupported' | 'unknown', { title: string; detail: string }>;
  /** {extra} in errors.overconstrained.detail for the camera. */
  cameraLowerRes: string;
  /** {error} in errors.unknown.detail when the error has no name. */
  unknownError: string;
}

export const MEDIA_TEXT_ZH: MediaText = {
  kindName: { mic: '麥克風', camera: '相機' },
  kindTitle: { mic: '麥克風', camera: '相機' },
  apps: { mic: 'LINE、Discord、Teams、Zoom 或錄音程式', camera: 'LINE、Teams、Zoom、Google Meet 或 OBS' },
  help: {
    iosSafari: [
      'Safari：點網址列左側的「大小」圖示 →「網站設定」→ 將「{name}」改為「允許」，再重新整理頁面。',
      '仍無法使用時，到 iPhone「設定」→「App」→「Safari」→「{name}」，改成「詢問」或「允許」。',
    ],
    iosOther: '到 iPhone「設定」→「App」→ 找到你正在使用的瀏覽器 → 開啟「{name}」權限，再回到這頁重新整理。',
    chrome: 'Chrome：點網址列左側的「查看網站資訊」圖示 → 將「{name}」切換為允許，然後重新整理頁面。',
    edge: 'Edge：點網址列左側的鎖頭圖示 →「此網站的權限」→ 將「{name}」設為「允許」，然後重新整理頁面。',
    firefox: 'Firefox：點網址列左側被劃線的{name}圖示 → 按「×」清除「已封鎖」，重新整理後再按一次開始並選擇允許。',
    safari: 'Safari：選單列「Safari」→「設定」→「網站」→ 左側選「{name}」→ 把本網站改成「允許」，再重新整理頁面。',
    samsung: 'Samsung 網際網路：選單 →「設定」→「網站與下載」→「網站權限」→「{name}」，移除本網站的封鎖。',
    other: '點網址列旁的網站資訊或鎖頭圖示，將本網站的「{name}」權限改為允許，再重新整理頁面。',
    android: 'Android：到「設定」→「應用程式」→ 你的瀏覽器 →「權限」→ 允許「{name}」。',
    mac: 'macOS：「系統設定」→「隱私權與安全性」→「{name}」→ 開啟瀏覽器的權限（變更後可能需要重新開啟瀏覽器）。',
    windows: 'Windows：「設定」→「隱私權與安全性」→「{name}」→ 開啟「{name}存取權」與「讓桌面應用程式存取您的{name}」。',
  },
  errors: {
    denied: { title: '{Name}權限被拒絕', detail: '瀏覽器或作業系統封鎖了本網站使用{name}。依下列步驟改成允許後，再按一次開始。' },
    notFound: {
      title: '找不到{name}',
      detail: '系統沒有偵測到任何{name}。請確認裝置已接好（USB、藍牙耳機已配對）、硬體開關沒有關閉，接上後重新整理頁面。',
    },
    notReadable: {
      title: '{Name}無法啟動',
      detail: '{Name}可能正被其他程式占用（例如 {apps}），請先關閉它們；若仍失敗，拔插裝置或重新開機，並檢查驅動程式。',
    },
    overconstrained: {
      title: '所選的{name}無法使用',
      detail: '選定的裝置已不存在，或不支援要求的設定。請在選單改選其他裝置{extra}再試一次。',
    },
    insecure: {
      title: '需要安全連線（HTTPS）',
      detail: '瀏覽器只允許在 HTTPS 網頁使用{name}。請確認網址以 https:// 開頭，或改用一般瀏覽器開啟（部分 App 內建瀏覽器不支援）。',
    },
    unsupported: {
      title: '這個瀏覽器不支援{name}測試',
      detail: '請改用最新版的 Chrome、Edge、Safari 或 Firefox。LINE、Facebook 等 App 內建瀏覽器常無法存取{name}，請點右上角選單「以預設瀏覽器開啟」。',
    },
    unknown: { title: '{Name}啟動失敗', detail: '發生未預期的錯誤（{error}）。請重新整理頁面，或改用其他瀏覽器再試一次。' },
  },
  cameraLowerRes: '或改用較低解析度',
  unknownError: '未知',
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match));
}

/** Step-by-step instructions for re-allowing a blocked permission. */
export function permissionHelp(env: Env, kind: MediaKind, text: MediaText = MEDIA_TEXT_ZH): string[] {
  const vars = { name: text.kindName[kind], Name: text.kindTitle[kind] };
  const h = text.help;
  const steps: string[] = [];
  if (env.platform === 'ios') {
    if (env.browser === 'safari' || env.browser === 'other') {
      steps.push(...h.iosSafari.map((step) => fill(step, vars)));
    } else {
      steps.push(fill(h.iosOther, vars));
    }
    return steps;
  }
  steps.push(fill(h[env.browser], vars));
  if (env.platform === 'android') steps.push(fill(h.android, vars));
  else if (env.platform === 'mac') steps.push(fill(h.mac, vars));
  else if (env.platform === 'windows') steps.push(fill(h.windows, vars));
  return steps;
}

export interface MediaProblem {
  title: string;
  detail: string;
  /** Show the per-browser permission steps. */
  showPermissionHelp: boolean;
}

const ERROR_KEY: Record<string, keyof MediaText['errors']> = {
  NotAllowedError: 'denied',
  PermissionDeniedError: 'denied',
  SecurityError: 'denied',
  NotFoundError: 'notFound',
  DevicesNotFoundError: 'notFound',
  NotReadableError: 'notReadable',
  TrackStartError: 'notReadable',
  AbortError: 'notReadable',
  OverconstrainedError: 'overconstrained',
  ConstraintNotSatisfiedError: 'overconstrained',
  insecure: 'insecure',
  unsupported: 'unsupported',
};

/** Maps a getUserMedia error name (or 'insecure' / 'unsupported') to a user-facing explanation. */
export function describeMediaError(name: string, kind: MediaKind, text: MediaText = MEDIA_TEXT_ZH): MediaProblem {
  const key = Object.hasOwn(ERROR_KEY, name) ? ERROR_KEY[name] : 'unknown';
  const vars = {
    name: text.kindName[kind],
    Name: text.kindTitle[kind],
    apps: text.apps[kind],
    extra: kind === 'camera' ? text.cameraLowerRes : '',
    error: name || text.unknownError,
  };
  const { title, detail } = text.errors[key];
  return { title: fill(title, vars), detail: fill(detail, vars), showPermissionHelp: key === 'denied' };
}

/** Display label for an input device; labels are blank until permission is granted. */
export function deviceLabel(label: string, index: number, kind: MediaKind, text: MediaText = MEDIA_TEXT_ZH): string {
  const trimmed = label.trim();
  if (trimmed) return trimmed;
  return `${text.kindTitle[kind]} ${index + 1}`;
}

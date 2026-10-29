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

export const VERDICT_TEXT: Record<LevelVerdict, { title: string; detail: string }> = {
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

const KIND_NAME: Record<MediaKind, string> = { mic: '麥克風', camera: '相機' };

/** Step-by-step instructions for re-allowing a blocked permission. */
export function permissionHelp(env: Env, kind: MediaKind): string[] {
  const name = KIND_NAME[kind];
  const steps: string[] = [];
  if (env.platform === 'ios') {
    if (env.browser === 'safari' || env.browser === 'other') {
      steps.push(`Safari：點網址列左側的「大小」圖示 →「網站設定」→ 將「${name}」改為「允許」，再重新整理頁面。`);
      steps.push(`仍無法使用時，到 iPhone「設定」→「App」→「Safari」→「${name}」，改成「詢問」或「允許」。`);
    } else {
      steps.push(`到 iPhone「設定」→「App」→ 找到你正在使用的瀏覽器 → 開啟「${name}」權限，再回到這頁重新整理。`);
    }
    return steps;
  }
  switch (env.browser) {
    case 'chrome':
      steps.push(`Chrome：點網址列左側的「查看網站資訊」圖示 → 將「${name}」切換為允許，然後重新整理頁面。`);
      break;
    case 'edge':
      steps.push(`Edge：點網址列左側的鎖頭圖示 →「此網站的權限」→ 將「${name}」設為「允許」，然後重新整理頁面。`);
      break;
    case 'firefox':
      steps.push(`Firefox：點網址列左側被劃線的${name}圖示 → 按「×」清除「已封鎖」，重新整理後再按一次開始並選擇允許。`);
      break;
    case 'safari':
      steps.push(`Safari：選單列「Safari」→「設定」→「網站」→ 左側選「${name}」→ 把本網站改成「允許」，再重新整理頁面。`);
      break;
    case 'samsung':
      steps.push(`Samsung 網際網路：選單 →「設定」→「網站與下載」→「網站權限」→「${name}」，移除本網站的封鎖。`);
      break;
    default:
      steps.push(`點網址列旁的網站資訊或鎖頭圖示，將本網站的「${name}」權限改為允許，再重新整理頁面。`);
  }
  if (env.platform === 'android') {
    steps.push(`Android：到「設定」→「應用程式」→ 你的瀏覽器 →「權限」→ 允許「${name}」。`);
  } else if (env.platform === 'mac') {
    steps.push(`macOS：「系統設定」→「隱私權與安全性」→「${name}」→ 開啟瀏覽器的權限（變更後可能需要重新開啟瀏覽器）。`);
  } else if (env.platform === 'windows') {
    steps.push(`Windows：「設定」→「隱私權與安全性」→「${name}」→ 開啟「${name}存取權」與「讓桌面應用程式存取您的${name}」。`);
  }
  return steps;
}

export interface MediaProblem {
  title: string;
  detail: string;
  /** Show the per-browser permission steps. */
  showPermissionHelp: boolean;
}

/** Maps a getUserMedia error name (or 'insecure' / 'unsupported') to a user-facing explanation. */
export function describeMediaError(name: string, kind: MediaKind): MediaProblem {
  const n = KIND_NAME[kind];
  const apps = kind === 'mic' ? 'LINE、Discord、Teams、Zoom 或錄音程式' : 'LINE、Teams、Zoom、Google Meet 或 OBS';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return {
        title: `${n}權限被拒絕`,
        detail: `瀏覽器或作業系統封鎖了本網站使用${n}。依下列步驟改成允許後，再按一次開始。`,
        showPermissionHelp: true,
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        title: `找不到${n}`,
        detail: `系統沒有偵測到任何${n}。請確認裝置已接好（USB、藍牙耳機已配對）、硬體開關沒有關閉，接上後重新整理頁面。`,
        showPermissionHelp: false,
      };
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return {
        title: `${n}無法啟動`,
        detail: `${n}可能正被其他程式占用（例如 ${apps}），請先關閉它們；若仍失敗，拔插裝置或重新開機，並檢查驅動程式。`,
        showPermissionHelp: false,
      };
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        title: `所選的${n}無法使用`,
        detail: `選定的裝置已不存在，或不支援要求的設定。請在選單改選其他裝置${kind === 'camera' ? '或改用較低解析度' : ''}再試一次。`,
        showPermissionHelp: false,
      };
    case 'insecure':
      return {
        title: '需要安全連線（HTTPS）',
        detail: `瀏覽器只允許在 HTTPS 網頁使用${n}。請確認網址以 https:// 開頭，或改用一般瀏覽器開啟（部分 App 內建瀏覽器不支援）。`,
        showPermissionHelp: false,
      };
    case 'unsupported':
      return {
        title: `這個瀏覽器不支援${n}測試`,
        detail: `請改用最新版的 Chrome、Edge、Safari 或 Firefox。LINE、Facebook 等 App 內建瀏覽器常無法存取${n}，請點右上角選單「以預設瀏覽器開啟」。`,
        showPermissionHelp: false,
      };
    default:
      return {
        title: `${n}啟動失敗`,
        detail: `發生未預期的錯誤（${name || '未知'}）。請重新整理頁面，或改用其他瀏覽器再試一次。`,
        showPermissionHelp: false,
      };
  }
}

/** Display label for an input device; labels are blank until permission is granted. */
export function deviceLabel(label: string, index: number, kind: MediaKind): string {
  const trimmed = label.trim();
  if (trimmed) return trimmed;
  return `${KIND_NAME[kind]} ${index + 1}`;
}

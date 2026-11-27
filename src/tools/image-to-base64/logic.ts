export type OutputKind = 'datauri' | 'base64' | 'css' | 'html';

export const OUTPUT_LABEL: Record<OutputKind, string> = {
  datauri: 'Data URI',
  base64: '純 Base64',
  css: 'CSS 背景',
  html: 'HTML img',
};

export interface ParsedDataUri {
  mime: string;
  base64: string;
}

/** Splits `data:image/png;base64,AAAA` into its MIME type and payload. */
export function parseDataUri(uri: string): ParsedDataUri | null {
  const match = /^data:([^;,]*)(?:;[^;,]+)*;base64,(.*)$/s.exec(uri.trim());
  if (!match) return null;
  return { mime: match[1] || 'application/octet-stream', base64: match[2] };
}

export function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** "my photo.final.png" → "my photo.final" for use as alt text. */
export function altFromFilename(name: string): string {
  const dot = name.lastIndexOf('.');
  return (dot > 0 ? name.slice(0, dot) : name).trim();
}

export interface OutputOptions {
  alt?: string;
  width?: number;
  height?: number;
}

export function buildOutput(dataUri: string, kind: OutputKind, options: OutputOptions = {}): string {
  const parsed = parseDataUri(dataUri);
  if (!parsed) return '';
  switch (kind) {
    case 'base64':
      return parsed.base64;
    case 'css':
      return `background-image: url("${dataUri}");`;
    case 'html': {
      const size =
        options.width && options.height ? ` width="${Math.round(options.width)}" height="${Math.round(options.height)}"` : '';
      return `<img src="${dataUri}" alt="${escapeAttribute(options.alt ?? '')}"${size}>`;
    }
    default:
      return dataUri;
  }
}

/** Length of the Base64 text for a payload of `bytes` bytes (with padding). */
export function base64Length(bytes: number): number {
  return Math.ceil(bytes / 3) * 4;
}

export type SizeLevel = 'small' | 'medium' | 'large' | 'huge';

/**
 * Inlining is a good trade-off only for small images: Base64 adds about a third,
 * is not cached separately and blocks the HTML/CSS that contains it.
 */
export function sizeLevel(bytes: number): SizeLevel {
  if (bytes <= 10 * 1024) return 'small';
  if (bytes <= 100 * 1024) return 'medium';
  if (bytes <= 2 * 1024 * 1024) return 'large';
  return 'huge';
}

export const SIZE_ADVICE: Record<SizeLevel, string> = {
  small: '檔案很小，適合直接內嵌在 HTML 或 CSS 中。',
  medium: '超過 10 KB，內嵌後會讓 HTML／CSS 明顯變大，建議只用在少量關鍵圖片。',
  large: '超過 100 KB，不建議內嵌，改用一般圖片檔並交給瀏覽器快取會更快。',
  huge: '超過 2 MB，產生的文字非常長，貼到編輯器或網頁中可能造成卡頓。',
};

export const SAMPLE_MARKDOWN = `# Markdown 預覽範例

這是一段**粗體**、*斜體*與~~刪除線~~文字，也可以加入[連結](https://tool.6yuwei.com/)與行內程式碼 \`npm install\`。

## 清單

- 項目一
- 項目二
  - 巢狀項目
1. 第一步
2. 第二步

- [x] 已完成的工作
- [ ] 待辦事項

## 引用與程式碼

> 好的文件，是寫給三個月後的自己看的。

\`\`\`js
function greet(name) {
  return \`哈囉，\${name}！\`;
}
\`\`\`

## 表格

| 工具 | 用途 | 價格 |
| --- | --- | ---: |
| 字數統計 | 計算字數 | 免費 |
| JSON 格式化 | 排版與驗證 | 免費 |

---

在左側編輯，右側會即時更新。
`;

/** Text of the first level-1 heading (ATX or Setext), ignoring fenced code blocks. */
export function extractTitle(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const atx = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line);
    if (atx) return plain(atx[1]);
    if (line.trim() && /^\s{0,3}=+\s*$/.test(lines[i + 1] ?? '')) return plain(line.trim());
  }
  return '';
}

/** Strips common inline Markdown so a heading can be used as a title. */
function plain(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]+/g, '')
    .trim();
}

export function toFilename(title: string, extension: string): string {
  const base = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();
  return `${base || 'document'}.${extension}`;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

/** A standalone HTML file with readable default styles that follow the reader's light/dark setting. */
export function buildHtmlDocument(bodyHtml: string, title: string): string {
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title || 'Document')}</title>
<style>
:root { color-scheme: light dark; }
body { margin: 0 auto; max-width: 760px; padding: 32px 20px; background: Canvas; color: CanvasText;
  font: 16px/1.75 -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
h1, h2, h3 { line-height: 1.3; }
a { color: LinkText; }
pre, code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.92em; }
code { padding: 0.15em 0.35em; border-radius: 4px; background: color-mix(in srgb, CanvasText 8%, Canvas); }
pre { padding: 14px 16px; overflow-x: auto; border-radius: 8px; background: color-mix(in srgb, CanvasText 6%, Canvas); }
pre code { padding: 0; background: none; }
blockquote { margin: 0; padding: 0 16px; border-left: 4px solid color-mix(in srgb, CanvasText 20%, Canvas); opacity: 0.85; }
table { border-collapse: collapse; }
th, td { padding: 6px 12px; border: 1px solid color-mix(in srgb, CanvasText 20%, Canvas); }
img { max-width: 100%; }
hr { border: 0; border-top: 1px solid color-mix(in srgb, CanvasText 20%, Canvas); }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}

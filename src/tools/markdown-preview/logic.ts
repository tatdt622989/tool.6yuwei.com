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

export const SAMPLE_MARKDOWN_EN = `# Markdown preview example

This line has **bold**, *italic* and ~~strikethrough~~ text, a [link](https://tool.6yuwei.com/en/) and inline code like \`npm install\`.

## Lists

- First item
- Second item
  - Nested item
1. Step one
2. Step two

- [x] Write the README
- [ ] Publish the release

## Quotes and code

> Documentation is a love letter that you write to your future self.

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Tool | Use | Price |
| --- | --- | ---: |
| Word Counter | Count words | Free |
| JSON Formatter | Format and validate | Free |

---

Edit on the left and the preview updates instantly.
`;

export const SAMPLE_MARKDOWN_JA = `# Markdown プレビューのサンプル

**太字**、*斜体*、~~取り消し線~~のほか、[リンク](https://tool.6yuwei.com/ja/)やインラインコード \`npm install\` も書けます。

## リスト

- 項目 1
- 項目 2
  - 入れ子の項目
1. 手順 1
2. 手順 2

- [x] README を書く
- [ ] リリースを公開する

## 引用とコード

> 良いドキュメントは、3 か月後の自分への手紙です。

\`\`\`js
function greet(name) {
  return \`こんにちは、\${name}さん！\`;
}
\`\`\`

## 表

| ツール | 用途 | 料金 |
| --- | --- | ---: |
| 文字数カウント | 文字数を数える | 無料 |
| JSON 整形 | 整形と検証 | 無料 |

---

左側で編集すると、右側のプレビューがすぐに更新されます。
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

/** Document language and font stack of the exported HTML file. */
export interface DocumentLocale {
  lang: string;
  fonts: string;
}

export const ZH_DOCUMENT: DocumentLocale = {
  lang: 'zh-Hant-TW',
  fonts: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
};

/** A standalone HTML file with readable default styles that follow the reader's light/dark setting. */
export function buildHtmlDocument(bodyHtml: string, title: string, locale: DocumentLocale = ZH_DOCUMENT): string {
  return `<!doctype html>
<html lang="${escapeHtml(locale.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title || 'Document')}</title>
<style>
:root { color-scheme: light dark; }
body { margin: 0 auto; max-width: 760px; padding: 32px 20px; background: Canvas; color: CanvasText;
  font: 16px/1.75 ${locale.fonts}; }
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

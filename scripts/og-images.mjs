// Renders one 1200×630 share image per tool and locale into public/og/<locale>/<slug>.png,
// plus public/og/<locale>/default.png for pages without their own image.
//
// Usage: npm run build && npm run og
// Reads the built tools.json feeds, draws each card in a local Chrome page (no network access),
// so the text uses the same system fonts as the site. Commit the generated PNGs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { icons } from 'lucide';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);

const LOCALES = {
  'zh-TW': {
    feed: 'dist/tools.json',
    lang: 'zh-Hant-TW',
    font: "-apple-system, 'PingFang TC', 'Noto Sans TC', sans-serif",
    mark: '隨手',
    markDesc: '線上工具',
    perks: '免費 · 免安裝 · 免註冊',
    tagline: ['打開就能用的', '線上工具', '免安裝、免註冊'],
  },
  en: {
    feed: 'dist/en/tools.json',
    lang: 'en',
    font: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    mark: 'Suishou',
    markDesc: 'Tools',
    perks: 'Free · No sign-up · Runs in your browser',
    tagline: ['Free online tools ', 'that just work', 'No install, no sign-up'],
  },
  ja: {
    feed: 'dist/ja/tools.json',
    lang: 'ja',
    font: "-apple-system, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif",
    mark: '隨手',
    markDesc: 'ツール',
    perks: '無料 · 登録不要 · ブラウザで動く',
    tagline: ['インストール不要の', 'オンラインツール', '無料・登録不要'],
  },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function iconSvg(name) {
  const node = icons[name];
  if (!node) throw new Error(`Unknown Lucide icon "${name}"`);
  const inner = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const css = (font) => `
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #18191c; font-family: ${font}; }
  .card { position: relative; height: 630px; padding: 72px 96px 0; display: flex; flex-direction: column; }
  .card::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 14px; background: #f0522e; }
  .brand { display: flex; align-items: center; gap: 18px; height: 52px; }
  .mark { font-size: 42px; font-weight: 800; letter-spacing: 0.02em; }
  .mark i { display: inline-block; width: 12px; height: 12px; margin-left: 6px; border-radius: 50%; background: #f0522e; }
  .desc { padding-left: 18px; border-left: 2px solid #d4d6db; font-size: 24px; font-weight: 600; color: #80838c; letter-spacing: 0.08em; }
  .icon { position: absolute; top: 64px; right: 96px; width: 120px; height: 120px; padding: 24px; border-radius: 28px; background: #fff0ea; color: #f0522e; }
  .icon svg { width: 72px; height: 72px; display: block; }
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-right: 150px; }
  .cat { font-size: 26px; font-weight: 700; color: #f0522e; margin-bottom: 14px; }
  .title { font-weight: 800; line-height: 1.12; letter-spacing: -0.01em; word-break: keep-all; overflow-wrap: normal; }
  .intro { margin-top: 22px; font-size: 28px; line-height: 1.5; color: #4a4d55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .foot { display: flex; justify-content: space-between; align-items: center; height: 110px; padding-bottom: 14px; font-size: 26px; color: #4a4d55; }
  .tag { font-weight: 800; line-height: 1.2; font-size: 84px; }
  .tag em { font-style: normal; color: #f0522e; }
`;

function page(L, body) {
  return `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><style>${css(L.font)}</style></head><body>
  <div class="card">
    <div class="brand"><span class="mark">${esc(L.mark)}<i></i></span><span class="desc">${esc(L.markDesc)}</span></div>
    ${body}
    <div class="foot"><span>${esc(L.perks)}</span><span>tool.6yuwei.com</span></div>
  </div></body></html>`;
}

const toolHtml = (L, t) =>
  page(
    L,
    `<div class="icon">${iconSvg(t.icon)}</div>
    <div class="body">
      <div class="cat">${esc(t.category)}</div>
      <div class="title" id="title">${esc(t.name)}</div>
      <div class="intro">${esc(t.intro || t.description)}</div>
    </div>`,
  );

const defaultHtml = (L) =>
  page(L, `<div class="body"><div class="tag">${esc(L.tagline[0])}<em>${esc(L.tagline[1])}</em><br>${esc(L.tagline[2])}</div></div>`);

/** Largest title size (76 → 44px) that keeps the name within two lines without overflowing sideways. */
async function fitTitle(p) {
  await p.evaluate(() => {
    const el = document.getElementById('title');
    if (!el) return;
    for (let size = 76; size >= 44; size -= 2) {
      el.style.fontSize = `${size}px`;
      if (el.getBoundingClientRect().height <= size * 1.12 * 2 + 2 && el.scrollWidth <= el.clientWidth) break;
    }
  });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, offline: true });
const p = await ctx.newPage();
let count = 0;
for (const [locale, L] of Object.entries(LOCALES)) {
  const feed = join(root, L.feed);
  if (!existsSync(feed)) throw new Error(`Missing ${L.feed}; run npm run build first`);
  const { tools } = JSON.parse(readFileSync(feed, 'utf8'));
  const dir = join(root, 'public/og', locale);
  mkdirSync(dir, { recursive: true });
  const jobs = [{ slug: 'default', html: defaultHtml(L) }, ...tools.map((t) => ({ slug: t.slug, html: toolHtml(L, t) }))];
  for (const job of jobs) {
    if (only.length && !only.includes(job.slug)) continue;
    await p.setContent(job.html, { waitUntil: 'load' });
    await fitTitle(p);
    // Flat colors and text compress well into a palette PNG (about a third of the size).
    const shot = await p.screenshot({ type: 'png' });
    writeFileSync(join(dir, `${job.slug}.png`), await sharp(shot).png({ palette: true, quality: 90, effort: 10 }).toBuffer());
    count++;
  }
}
await browser.close();
console.log(`Rendered ${count} share images into public/og/`);

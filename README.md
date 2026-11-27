# 隨手 — tool.6yuwei.com

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

**English** · Free, privacy-first online tools at **https://tool.6yuwei.com** (中文), [/en/](https://tool.6yuwei.com/en/) and [/ja/](https://tool.6yuwei.com/ja/). Every tool runs entirely in your browser: no sign-up, no uploads, no backend. This repository is the complete source of the site, so you can verify that claim yourself. Built with Astro (static output), vanilla TypeScript and Vitest; served by nginx. Each tool lives in `src/tools/<slug>/` (`logic.ts` + tests, `Tool.astro`, localized `meta*.ts`). Issues and pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). Copyright (C) 2026 6yuwei, licensed under [AGPL-3.0-only](LICENSE) with [additional terms](ADDITIONAL-TERMS.md): any site or app built from this code must show a visible "Based on tool.6yuwei.com" link on every page. The 隨手 / Suishou Tools name and logo are not covered by the license (see [License and trademarks](#license-and-trademarks-english)).

**日本語** · ブラウザだけで動く無料オンラインツール集です。登録不要・データ送信なし。サイトのソースコードをすべて公開しているので、データが外部に送られていないことを誰でも確認できます。ライセンスは [AGPL-3.0](LICENSE) と[追加条項](ADDITIONAL-TERMS.md)です。

---

免費線上實用工具網站，品牌名「隨手」。設計為固定亮色（不跟系統深色模式）：白底、淺灰區塊、單一珊瑚橘強調色；每個工具在 `meta.ts` 的 `icon` 欄位指定一個 [Lucide](https://lucide.dev/icons) 線條圖示，建置時渲染成 SVG。色彩全部定義在 `src/styles/global.css` 的 CSS 變數。Astro 靜態輸出，每個工具一個預先渲染的 SEO 頁面，工具邏輯全部在瀏覽器執行（無後端、無資料上傳）。

## 開發

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # vitest：每個工具的 logic.test.ts
npm run check    # astro / TypeScript 型別檢查
npm run build    # 輸出 dist/
npm run preview
```

## 新增一個工具

在 `src/tools/<slug>/` 建立四個檔案即可，registry 會自動掃描，首頁、分類頁、sitemap、相關工具、`tools.json` 都會自動更新：

| 檔案 | 內容 |
| --- | --- |
| `meta.ts` | `defineTool({...})`：名稱、Lucide 圖示 `icon`、SEO 標題與描述、關鍵字、使用步驟、說明文章 `sections`、`faq`、`related` |
| `logic.ts` | 純函式，不碰 DOM |
| `logic.test.ts` | vitest 測試 |
| `Tool.astro` | 介面 + `<script>`，使用 `src/styles/global.css` 的共用元件樣式 |

參考實作：`src/tools/word-counter/`、`src/tools/bmi-calculator/`、`src/tools/password-generator/`。slug 不可與 `about`、`contact`、`privacy`、`terms`、`category`、`convert`、`app`、`en`、`ja` 等保留路徑重複（build 時會檢查）。

新增或改名工具後，執行 `npm run build && npm run og` 產生分享圖，並把 `public/og/` 一起 commit（漏了會讓 `og-images.test.ts` 失敗）。

## 多語系（zh-TW / en / ja）

- 繁體中文是預設語系，網址維持在根目錄（`/<slug>/`）；英文在 `/en/<slug>/`、日文在 `/ja/<slug>/`，slug 共用。
- 工具在某語系存在 ⇔ 資料夾裡有該語系的 meta：`meta.ts`（zh-TW）、`meta.en.ts`、`meta.ja.ts`。可以只有其中任意組合（台灣限定工具只有 `meta.ts`；英文或日文限定工具可以沒有 `meta.ts`）。
- 介面字串放在工具資料夾的 `i18n.ts`（`defineToolI18n`），`Tool.astro` 接收 `locale` prop，前端 script 用 `readI18n()` 讀取字串，同一份 script 服務所有語系。
- 網站外框字串在 `src/i18n/ui.ts`，品牌名稱在 `src/config/site.ts` 的 `brands`，分類文案在 `src/config/categories.ts`。
- 頁面由 `src/views/*View.astro` 依語系渲染，`src/pages/`、`src/pages/en/`、`src/pages/ja/` 只是薄薄的路由。
- SEO：每頁輸出 `hreflang`（含 `x-default` → 中文版）、各語系 canonical、JSON-LD `inLanguage`；sitemap 以 `xhtml:link` 標示對應語系。
- 每個語系有自己的 `/en/tools.json`、`/en/manifest.webmanifest`、`/en/404/`（nginx 依路徑回應對應語系 404）。`/convert/` 換算頁目前只有中文。
- 完整做法與檢查清單：[`docs/i18n.md`](docs/i18n.md)。

## SEO 設計

- 每個工具頁：獨立 `<title>` / description / canonical / OG / Twitter Card，JSON-LD 含 `WebApplication`、`BreadcrumbList`、`FAQPage`。
- 分享圖：每個工具、每種語系各一張 `public/og/<locale>/<slug>.png`（1200×630），其他頁面用該語系的 `default.png`。由 `scripts/og-images.mjs` 讀取 build 出的 `tools.json`，在本機 Chrome 用系統字型排版截圖；Docker 映像檔沒有中日文字型，所以圖片預先產生後進版控。
- 工具下方有使用步驟、說明文章與 FAQ。
- 內部連結：麵包屑、分類頁、側欄同類工具、「你可能也需要」相關工具。
- 首頁有 `WebSite` + `SearchAction`（`/?q=` 會直接篩選工具）與 `ItemList`。
- `@astrojs/sitemap` 產生 `/sitemap-index.xml`，`/robots.txt` 指向它。
- 純靜態 HTML、無框架 runtime、系統字型，Core Web Vitals 友善。

## 自架

附 `Dockerfile`（Node build → nginx 服務靜態檔）與 `compose.yaml`，`docker compose up -d --build` 即可，容器在 port 80 提供服務。所有變數都是選填，**在 build 時寫進靜態 HTML**（Compose 透過 `build.args` 傳入），修改後需要重新 build。Build 階段會先跑 `npm test`，測試失敗就不會產出映像檔。

| 變數 | 說明 |
| --- | --- |
| `PUBLIC_GA_ID` | GA4 評估 ID `G-XXXXXXX`，不設定就不載入 GA |
| `PUBLIC_GSC_VERIFICATION` | Google Search Console HTML 標記驗證碼 |
| `PUBLIC_CONTACT_EMAIL` | 顯示在 `/contact/` 的聯絡信箱 |

## 統一發票中獎號碼更新

號碼存在 `src/tools/invoice-lottery/data.json`（保留最近 12 期），由 `npm run update:invoice`（`scripts/update-invoice.mjs`）從財政部 `invoice.etax.nat.gov.tw` 抓取、驗證後寫入；解析失敗時不寫檔並回傳錯誤碼。GitHub Action `.github/workflows/update-invoice.yml` 在單數月 25–27 日台北時間 19:00 自動執行，有變動就 commit 回 `main`，也可手動觸發。

## 目錄

```
src/
  config/      site.ts（網站 / 品牌 brands / GA 設定，讀環境變數）、categories.ts（各語系分類文案）
  i18n/        locales.ts、ui.ts（外框字串）、format.ts、tool.ts / client.ts（工具字串）、alternates.ts（hreflang）
  tools/       registry.ts + registry-core.ts（自動註冊、語系判斷）、components.ts、types.ts、<slug>/
  lib/         client.ts（瀏覽器 helper）、format.ts、seo.ts（JSON-LD）、feeds.ts（tools.json / manifest）
  components/  ToolCard、SiteHeader（含語言切換）、SiteFooter、Breadcrumbs、SearchDialog
  layouts/     BaseLayout（head / SEO / hreflang）、ProseLayout
  views/       HomeView、ToolView、CategoryView、NotFoundView、AppView（依 locale 渲染）
  pages/       index、[slug]（工具頁）、category/[id]、about、privacy、terms、contact、app、convert/、
               robots.txt、tools.json、manifest.webmanifest；en/、ja/ 為各語系路由
docs/i18n.md   多語系做法與工具在地化檢查清單
```

## 開源與授權

Copyright (C) 2026 6yuwei. All rights reserved except as granted by the license below.

- 本專案以 [GNU AGPL-3.0-only](LICENSE) 授權開源：可以自由閱讀、修改、自架，但若把修改後的版本架成網站提供給他人使用，必須同樣以 AGPL-3.0 公開完整原始碼，並保留原作者的版權聲明。
- **署名連結（[附加條款](ADDITIONAL-TERMS.md)）**：依 AGPL 第 7 條，任何用本專案程式碼（全部或部分）架設的網站或 App，都必須在每一頁（例如頁尾）清楚顯示「Based on tool.6yuwei.com by 6yuwei」（可翻譯），且 tool.6yuwei.com 要連到 https://tool.6yuwei.com，不得隱藏或移除。
- 「隨手」、「Suishou Tools」、「隨手ツール」名稱、Logo、網域 tool.6yuwei.com 與 6yuwei 不在 AGPL 授權範圍內。自架衍生站請改用不同名稱與 Logo，也不要讓人誤以為是官方網站或由作者背書。
- 每個工具頁底部的「查看原始碼」連到 `src/tools/<slug>/`，頁尾也有 GitHub 連結。
- 貢獻程式碼前請先看 [CONTRIBUTING.md](CONTRIBUTING.md)。
- 回報安全性問題請見 [SECURITY.md](SECURITY.md)。

### License and trademarks (English)

- The source code is licensed under [AGPL-3.0-only](LICENSE). If you run a modified version as a public website, you must publish its complete source under the same license and keep the original copyright notices.
- **Attribution link ([additional terms](ADDITIONAL-TERMS.md))**: under Section 7 of the AGPL, any website or app built from this code, in whole or in part, must show "Based on tool.6yuwei.com by 6yuwei" (translation allowed) on every page, for example in the footer, with tool.6yuwei.com linking to https://tool.6yuwei.com. It must not be hidden or removed.
- The names "隨手", "Suishou Tools" and "隨手ツール", the logo, the domain tool.6yuwei.com and the name 6yuwei are not licensed under the AGPL. A fork must use a different name and logo, and must not suggest that it is the official site or endorsed by the author.

### ライセンスと商標（日本語）

- ソースコードは [AGPL-3.0-only](LICENSE) で公開しています。改変版を公開サイトとして運営する場合は、同じライセンスで全ソースコードを公開し、原著作者の著作権表示を残してください。
- **クレジットリンク（[追加条項](ADDITIONAL-TERMS.md)）**：AGPL 第 7 条に基づき、このコードを（一部でも）使ったサイトやアプリは、すべてのページ（フッターなど）に「Based on tool.6yuwei.com by 6yuwei」（翻訳可）を表示し、tool.6yuwei.com を https://tool.6yuwei.com へリンクしてください。非表示や削除は認められません。
- 「隨手」「Suishou Tools」「隨手ツール」の名称、ロゴ、ドメイン tool.6yuwei.com、6yuwei の名前は AGPL の対象外です。派生サイトは別の名称とロゴを使い、公式サイトや作者の公認と誤解される表示をしないでください。

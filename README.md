# 隨手 — tool.6yuwei.com

免費線上實用工具網站，品牌名「隨手」。設計為固定亮色（不跟系統深色模式）：白底、淺灰區塊、單一珊瑚橘強調色；每個工具在 `meta.ts` 的 `icon` 欄位指定一個 [Lucide](https://lucide.dev/icons) 線條圖示，建置時渲染成 SVG。色彩全部定義在 `src/styles/global.css` 的 CSS 變數。Astro 靜態輸出，每個工具一個預先渲染的 SEO 頁面，工具邏輯全部在瀏覽器執行（無後端、無資料上傳），以 Google AdSense 變現。

## 開發

```bash
npm install
npm run dev      # http://localhost:4321 ，開發模式會顯示廣告版位佔位框
npm test         # vitest：每個工具的 logic.test.ts
npm run check    # astro / TypeScript 型別檢查
npm run build    # 輸出 dist/
npm run preview
```

## 新增一個工具

在 `src/tools/<slug>/` 建立四個檔案即可，registry 會自動掃描，首頁、分類頁、sitemap、相關工具、`tools.json` 都會自動更新：

| 檔案 | 內容 |
| --- | --- |
| `meta.ts` | `defineTool({...})`：名稱、Lucide 圖示 `icon`、SEO 標題與描述、關鍵字、使用步驟、說明文章 `sections`、`faq`、`related`、`blogPosts` |
| `logic.ts` | 純函式，不碰 DOM |
| `logic.test.ts` | vitest 測試 |
| `Tool.astro` | 介面 + `<script>`，使用 `src/styles/global.css` 的共用元件樣式 |

參考實作：`src/tools/word-counter/`、`src/tools/bmi-calculator/`、`src/tools/password-generator/`。slug 不可與 `about`、`contact`、`privacy`、`terms`、`category`、`convert`、`app`、`en`、`ja` 等保留路徑重複（build 時會檢查）。

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
- 工具下方有使用步驟、說明文章與 FAQ，提供足量原創內容（同時是 AdSense 審核重點）。
- 內部連結：麵包屑、分類頁、側欄同類工具、「你可能也需要」相關工具。
- 首頁有 `WebSite` + `SearchAction`（`/?q=` 會直接篩選工具）與 `ItemList`。
- `@astrojs/sitemap` 產生 `/sitemap-index.xml`，`/robots.txt` 指向它。
- 純靜態 HTML、無框架 runtime、系統字型，Core Web Vitals 友善；廣告版位預留高度降低 CLS。

## PWA（可安裝，刻意不支援離線）

- 網站可以「加到主畫面／安裝」，但**不提供離線快取**：每次開啟都從網路載入，確保廣告曝光。
- `src/pages/manifest.webmanifest.ts`：名稱、icon（含 maskable）、主畫面捷徑。
- `src/lib/pwa.ts`：安裝提示；有 `data-install` 的按鈕只在瀏覽器支援安裝時出現。
- `src/pages/sw.js.ts`：自我移除用的 Service Worker（清除快取並註銷），不會被註冊；只用來清掉早期測試版留下的離線快取。
- `/app/`：各平台安裝教學頁，首頁與頁尾都有連結。

## 部落格導流（blog.6yuwei.com）

- 部落格文章直接連到工具頁，建議加 UTM：`https://tool.6yuwei.com/word-counter/?utm_source=blog&utm_medium=referral&utm_campaign=<文章 slug>`。
- 反向連結：在工具的 `meta.ts` 填 `blogPosts: [{ title, url }]`，工具頁會出現「延伸閱讀」。
- `https://tool.6yuwei.com/tools.json`（開放 CORS）列出所有工具的名稱、描述、網址，部落格可用它渲染「相關工具」卡片。英文與日文版分別在 `/en/tools.json`、`/ja/tools.json`（多一個 `locale` 欄位）。

## 廣告

| 版位 | 位置 | 環境變數 |
| --- | --- | --- |
| afterTool | 工具正下方 | `PUBLIC_ADSENSE_SLOT_AFTER_TOOL` |
| inArticle | 說明文章第一段後（In-article 格式） | `PUBLIC_ADSENSE_SLOT_IN_ARTICLE` |
| bottom | FAQ 之後、相關工具之前 | `PUBLIC_ADSENSE_SLOT_BOTTOM` |
| sidebar | 桌機右側欄，sticky | `PUBLIC_ADSENSE_SLOT_SIDEBAR` |
| home | 首頁分類之間、分類頁 | `PUBLIC_ADSENSE_SLOT_HOME` |

只設定 `PUBLIC_ADSENSE_CLIENT` 時會載入 AdSense 並啟用 Auto Ads（在 AdSense 後台開啟），同時自動產生 `/ads.txt`。設定各 slot ID 後才會渲染對應的手動版位；未設定的版位不輸出任何 HTML。

建議 AdSense 後台：開啟 Auto Ads 的錨定廣告（anchor）與穿插廣告（vignette），並啟用「隱私權與訊息」中的 GDPR 同意聲明（歐洲流量必需）。

## 部署（Coolify）

附 `Dockerfile`（Node build → nginx 服務靜態檔）與 `compose.yaml`。

1. Coolify 建立 Application，來源指向此目錄所在的 repo，Build Pack 選 Dockerfile（或 Docker Compose）。
2. Domain 設 `https://tool.6yuwei.com`，Port `80`。
3. 在 Environment Variables 填入下列變數。**所有變數都在 build 時寫進靜態 HTML**：Dockerfile 模式請勾選「Build Variable」；Compose 模式已透過 `build.args` 傳入。修改變數後需重新部署（rebuild）。

| 變數 | 必填 | 說明 |
| --- | --- | --- |
| `PUBLIC_ADSENSE_CLIENT` | 上線收益必填 | `ca-pub-xxxxxxxxxxxxxxxx` |
| `PUBLIC_ADSENSE_SLOT_*` | 選填 | 各手動廣告單元的 slot ID（見上表） |
| `PUBLIC_AD_PLACEHOLDERS` | 選填 | `true` 時在未設定 slot 的位置顯示佔位框 |
| `PUBLIC_GA_ID` | 選填 | GA4 評估 ID `G-XXXXXXX` |
| `PUBLIC_GSC_VERIFICATION` | 選填 | Google Search Console HTML 標記驗證碼（也可用 DNS 驗證） |
| `PUBLIC_CONTACT_EMAIL` | 建議 | 顯示在 `/contact/`，AdSense 審核會看聯絡方式 |

Build 階段會先跑 `npm test`，測試失敗不會部署。

### 統一發票中獎號碼自動更新

- 號碼存在 `src/tools/invoice-lottery/data.json`（保留最近 12 期），由 `npm run update:invoice`（`scripts/update-invoice.mjs`）從財政部 `invoice.etax.nat.gov.tw` 抓取、驗證後寫入；解析失敗時不寫檔並回傳錯誤碼。
- GitHub Action `.github/workflows/update-invoice.yml` 在單數月 25–27 日台北時間 19:00 自動執行，有變動就以 `github-actions[bot]` commit 並 push 到 `main`，也可手動執行（workflow_dispatch）。
- 需要 Coolify 開啟「推送自動部署」才會自動上線；若 GitHub 主機連不到財政部網站（Action 顯示失敗），在本機執行 `npm run update:invoice` 後 push 即可。

## 上線檢查清單

1. DNS：`tool.6yuwei.com` 指到 Coolify 主機。
2. Google Search Console 新增資源並提交 `https://tool.6yuwei.com/sitemap-index.xml`。
3. AdSense 新增網站 `tool.6yuwei.com`（若 `6yuwei.com` 已通過，子網域可直接在同帳號下新增），確認 `/ads.txt` 可存取。
4. 部落格相關文章加入工具連結。

## 目錄

```
src/
  config/      site.ts（網站 / 品牌 brands / 廣告 / GA 設定，讀環境變數）、categories.ts（各語系分類文案）
  i18n/        locales.ts、ui.ts（外框字串）、format.ts、tool.ts / client.ts（工具字串）、alternates.ts（hreflang）
  tools/       registry.ts + registry-core.ts（自動註冊、語系判斷）、components.ts、types.ts、<slug>/
  lib/         client.ts（瀏覽器 helper）、format.ts、seo.ts（JSON-LD）、feeds.ts（tools.json / manifest）
  components/  AdSlot、ToolCard、SiteHeader（含語言切換）、SiteFooter、Breadcrumbs、SearchDialog
  layouts/     BaseLayout（head / SEO / hreflang / 廣告 loader）、ProseLayout
  views/       HomeView、ToolView、CategoryView、NotFoundView、AppView（依 locale 渲染）
  pages/       index、[slug]（工具頁）、category/[id]、about、privacy、terms、contact、app、convert/、
               ads.txt、robots.txt、tools.json、manifest.webmanifest；en/、ja/ 為各語系路由
docs/i18n.md   多語系做法與工具在地化檢查清單
```

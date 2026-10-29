import { defineTool } from '../types';

export default defineTool({
  slug: 'image-to-base64',
  name: '圖片轉 Base64',
  seoTitle: '圖片轉 Base64：線上產生 Data URI 與 img 標籤',
  description:
    '免費線上圖片轉 Base64 工具，選擇或貼上圖片即可產生 Data URI、純 Base64、CSS background-image 與 HTML img 標籤，附預覽與檔案大小提醒。圖片在瀏覽器內轉換，不會上傳。',
  category: 'image',
  icon: 'FileCode',
  keywords: ['圖片轉 Base64', 'image to base64', 'Base64 圖片', 'Data URI', '圖片編碼', 'base64 encode image', 'PNG 轉 Base64'],
  intro: '把圖片轉成 Base64 文字，直接內嵌到 HTML、CSS、JSON 或 Email 範本中。轉換在你的瀏覽器內完成，圖片不會上傳。',
  howTo: [
    '點擊上方虛線區塊選擇圖片，或把圖片拖曳進來，也可以按 Ctrl/Cmd + V 貼上截圖。',
    '確認預覽與下方的大小提醒；建議只內嵌 10 KB 以下的小圖示。',
    '在「輸出格式」選擇 Data URI、純 Base64、CSS 背景或 HTML img。',
    '按「複製結果」貼到程式碼中，或按「下載為 .txt」存成文字檔。',
  ],
  sections: [
    {
      heading: '什麼是 Base64 與 Data URI？',
      body: [
        'Base64 是把二進位資料轉成文字的編碼方式，只使用 A–Z、a–z、0–9、+、/ 共 64 個字元，再以 = 補齊長度。每 3 個位元組會變成 4 個字元，所以編碼後的文字大約比原檔大三分之一。它不是加密，任何人都能還原回原本的圖片。',
        'Data URI 則是在 Base64 前面加上「data:圖片類型;base64,」的前綴，例如 data:image/png;base64,iVBOR…，瀏覽器看到它就會直接當成圖片顯示，不需要另外發出網路請求。這段文字可以放在 img 的 src、CSS 的 url() 或任何需要圖片網址的地方。',
      ],
    },
    {
      heading: '什麼時候適合把圖片轉成 Base64？',
      body: [
        '適合的情境包括：網頁中少量的小圖示或 Loading 動畫、單一 HTML 檔案需要自帶圖片（例如離線報表或簡易原型）、在 JSON 或 API 請求中傳送圖片，以及某些不方便放附件的程式或設定檔。一般建議只內嵌 10 KB 以下的小檔案。',
        '不適合的情境是大型照片與重複出現的圖片。Base64 會讓 HTML 或 CSS 檔案變大、拖慢第一次載入，而且圖片無法被瀏覽器獨立快取；每次 CSS 或 HTML 更新，圖片也要一起重新下載。這類圖片放成一般檔案，搭配壓縮與快取通常更快。',
      ],
    },
    {
      heading: '四種輸出格式怎麼用？',
      body: [
        '「Data URI」是最常用的完整格式，可直接貼到 img 的 src 或瀏覽器網址列。「純 Base64」只有編碼內容、不含前綴，適合 API 欄位或資料庫已經另外記錄圖片類型的情況。「CSS 背景」會產生 background-image 宣告，可直接貼進樣式表。「HTML img」會產生完整的 img 標籤，並自動帶入檔名作為 alt 文字與圖片寬高，減少圖片載入時的版面跳動。產生的內容都可以一鍵複製，或下載成文字檔保存。',
      ],
    },
  ],
  faq: [
    {
      q: '轉成 Base64 後檔案為什麼變大？',
      a: 'Base64 用 4 個字元表示 3 個位元組，編碼後大約增加 33%。若網頁伺服器有開啟 gzip 或 Brotli 壓縮，傳輸時的差距會小一些，但仍比原檔大。',
    },
    {
      q: 'Email 範本可以用 Base64 圖片嗎？',
      a: '部分郵件軟體（例如 Gmail 網頁版與某些 Outlook 版本）會封鎖或不顯示 Data URI 圖片，正式寄送的電子報建議使用圖片網址或附件內嵌（CID）方式。',
    },
    {
      q: 'SVG 也可以轉成 Base64 嗎？',
      a: '可以，輸出會是 data:image/svg+xml;base64,…。不過 SVG 本身就是文字，直接以 URL 編碼內嵌通常會比 Base64 更短。',
    },
    {
      q: '圖片會上傳到伺服器嗎？',
      a: '不會。編碼使用瀏覽器內建的 FileReader 在你的裝置上完成，圖片與產生的文字都不會傳送到網路上。',
    },
  ],
  related: ['base64', 'image-compressor', 'image-converter', 'url-encoder', 'html-entities'],
  priority: 55,
  updated: '2026-10-29',
});

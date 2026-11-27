import { defineTool } from '../types';

export default defineTool({
  slug: 'markdown-preview',
  name: 'Markdown 預覽',
  seoTitle: 'Markdown 預覽：線上編輯器與 HTML 即時轉換',
  description:
    '免費線上 Markdown 編輯器，左側輸入、右側即時預覽，支援 GFM 表格、待辦清單與程式碼區塊，可複製轉換後的 HTML，或下載 .md 與 .html 檔案。內容只存在你的瀏覽器。',
  category: 'dev',
  icon: 'FileText',
  keywords: ['Markdown 預覽', 'Markdown 編輯器', 'Markdown 轉 HTML', 'markdown editor', 'markdown preview', 'MD 編輯器', 'Markdown 語法'],
  intro: '邊寫 Markdown 邊看排版結果，完成後可以複製 HTML，或下載成 .md 與 .html 檔案。',
  howTo: [
    '在「Markdown」編輯區輸入內容，或按「載入範例」看看常用語法；手機上可用上方的「編輯」與「預覽」切換。',
    '預覽會即時更新。若希望單一換行就換行（類似聊天軟體），勾選「單一換行也換行」。',
    '按「複製 HTML」取得轉換後的 HTML 原始碼，貼到部落格或 CMS 的 HTML 模式中。',
    '按「下載 .md」保存原稿，或按「下載 .html」得到一個可直接用瀏覽器開啟的網頁檔。',
  ],
  sections: [
    {
      heading: 'Markdown 常用語法',
      body: [
        '標題在行首加 # 到 ######，# 是最大的一級標題；**文字** 是粗體，*文字* 是斜體，`程式碼` 是行內程式碼。以 - 或 * 開頭的行是無序清單，1. 開頭則是有序清單，縮排兩到四個空格可建立巢狀清單。連結寫成 [文字](網址)，圖片則是 ![說明](圖片網址)。以 > 開頭是引用，三個反引號 ``` 包住的區塊是程式碼，可以在開頭的反引號後註明語言。單獨一行 --- 會產生分隔線。',
      ],
    },
    {
      heading: 'GitHub 風格 Markdown（GFM）',
      body: [
        '本工具採用 GitHub Flavored Markdown，除了基本語法外，還支援表格、刪除線 ~~文字~~、待辦清單 - [ ] 與 - [x]，以及自動連結網址。表格以 | 分隔欄位，第二行的 --- 分隔標題列，在 --- 左右加上冒號可以設定靠左、置中或靠右對齊。',
        '在標準 Markdown 中，段落內的單一換行會被視為空格，要真正換行需要空一行開新段落，或在行尾加兩個空格。若你習慣直接按 Enter 換行，可以勾選「單一換行也換行」，效果與 GitHub 的留言框相同。這個選項只影響預覽與匯出的 HTML，不會修改你的 Markdown 原稿。',
      ],
    },
    {
      heading: '安全與隱私',
      body: [
        'Markdown 允許夾帶 HTML，若直接顯示他人提供的內容，可能被插入惡意腳本。本工具以 marked 轉換後，再經過 DOMPurify 過濾，移除 script、事件屬性等危險內容後才顯示，「複製 HTML」與下載的檔案也是過濾後的結果。你的文字只會儲存在這台裝置的瀏覽器中，下次開啟時會自動帶回上次的草稿，不會上傳到任何伺服器。若在公用電腦上使用，離開前請按「清除」。',
      ],
    },
  ],
  faq: [
    {
      q: '我寫的內容會保存嗎？',
      a: '會自動保存在你目前使用的瀏覽器中（localStorage），重新整理或下次開啟都會保留。換一台裝置或清除瀏覽器資料後就不會存在，重要內容請按「下載 .md」備份。',
    },
    {
      q: '為什麼我按 Enter 換行，預覽卻沒有換行？',
      a: '這是 Markdown 的標準規則：單一換行會合併成同一段。請空一行來分段、在行尾加兩個空格，或勾選「單一換行也換行」。',
    },
    {
      q: '可以轉成 Word 或 PDF 嗎？',
      a: '可以先下載 .html，用瀏覽器開啟後選擇「列印」並另存為 PDF；或把 HTML 檔用 Word 開啟後另存為 .docx。',
    },
    {
      q: '支援數學公式或流程圖嗎？',
      a: '目前不支援 LaTeX 數學公式與 Mermaid 圖表，這些語法會以原始文字顯示。',
    },
  ],
  related: ['html-entities', 'word-counter', 'json-formatter', 'text-diff'],
  priority: 45,
  updated: '2026-10-29',
});

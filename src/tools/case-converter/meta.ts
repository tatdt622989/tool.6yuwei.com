import { defineTool } from '../types';

export default defineTool({
  slug: 'case-converter',
  name: '大小寫轉換',
  seoTitle: '英文大小寫轉換：一鍵轉大寫、小寫、駝峰與底線命名',
  description:
    '免費線上英文大小寫轉換器，可一鍵轉成全部大寫、全部小寫、標題大寫、句首大寫，以及 camelCase、PascalCase、snake_case、kebab-case 等程式命名格式，即時轉換並可直接複製。',
  category: 'text',
  icon: 'CaseSensitive',
  keywords: ['大小寫轉換', '英文大小寫轉換', '英文轉大寫', '大寫轉小寫', 'case converter', 'camelCase 轉換', 'snake_case', '駝峰命名'],
  intro: '貼上英文或變數名稱，選一種格式就能立即轉換：全部大寫、標題大寫、句首大寫，或是寫程式常用的駝峰、底線與連字號命名。',
  howTo: [
    '把英文句子、標題或變數名稱貼到「輸入文字」。',
    '在「轉換格式」點選想要的樣式，例如 Title Case 或 snake_case。',
    '「轉換結果」會即時更新，按「複製結果」即可貼到其他地方。',
    '想接著轉成另一種格式，可按「以結果取代輸入」再選新的樣式。',
  ],
  sections: [
    {
      heading: '常見英文大小寫格式',
      body: [
        '全部大寫（UPPER CASE）常用於縮寫、警告標語與表單欄位；全部小寫（lower case）適合統一電子郵件地址或網址。句首大寫（Sentence case）只把每句的第一個字母大寫，常用於一般內文與按鈕文字，Google 開發者文件風格指南也建議標題採用這種寫法。',
        '標題大寫（Title Case）把主要單字的字首大寫，冠詞、連接詞與短介系詞（a、an、the、and、of、in、on、to 等）則維持小寫，但放在標題開頭或結尾時仍會大寫。這接近 AP 與 Chicago 等英文寫作手冊的規則，各手冊對介系詞長度的規定略有不同，正式出版前可再依所用規範確認。',
      ],
    },
    {
      heading: '程式命名慣例：camelCase、snake_case 與 kebab-case',
      body: [
        'camelCase（小駝峰）第一個字小寫、後續單字字首大寫，是 JavaScript、Java 變數與函式的常見寫法；PascalCase（大駝峰）每個單字字首都大寫，多用於類別與 React 元件名稱。snake_case 以底線連接全小寫單字，是 Python 與資料庫欄位的慣例；CONSTANT_CASE 則用在常數與環境變數。',
        'kebab-case 以連字號連接，常見於網址路徑、CSS class 與檔案名稱。本工具會自動辨識原本的格式，例如 XMLHttpRequest 會拆成 XML、Http、Request，再組成 xml_http_request；多行輸入會逐行轉換，方便一次處理整份欄位清單。',
      ],
    },
    {
      heading: '轉換時的小細節',
      body: [
        '標題大寫與句首大寫會保留刻意的大小寫，例如 HTML、NASA 等縮寫，以及 iPhone、JavaScript 這種中間有大寫的字；若整段文字都是大寫，則會先全部轉小寫再處理。句首大寫也會把單獨的代名詞 i 改成 I，並略過 e.g.、i.e. 等縮寫後面的字。中文、數字與標點不受大小寫影響，會原樣保留。所有轉換都在瀏覽器中執行，貼上的內容不會被上傳。',
      ],
    },
  ],
  faq: [
    {
      q: '如何把英文全部轉成大寫？',
      a: '把文字貼到輸入框，轉換格式選「UPPER CASE」，結果會立即顯示，按「複製結果」即可。',
    },
    {
      q: 'Title Case 和 Sentence case 差在哪？',
      a: 'Title Case 把標題中每個主要單字的字首大寫，例如 The Lord of the Rings；Sentence case 只有句子第一個字母大寫，例如 The lord of the rings。',
    },
    {
      q: 'camelCase 和 PascalCase 有什麼不同？',
      a: '差別只在第一個字母：camelCase 開頭小寫（userName），PascalCase 開頭大寫（UserName）。前者常用於變數與函式，後者常用於類別名稱。',
    },
    {
      q: '可以一次轉換很多個變數名稱嗎？',
      a: '可以。每行放一個名稱，選擇 snake_case、camelCase 等格式後會逐行轉換，換行會保留。',
    },
    {
      q: '有中文字會怎樣？',
      a: '中文沒有大小寫，會保留原樣。在程式命名格式中，中文會被當成一個單字，以底線或連字號和其他單字相連。',
    },
  ],
  related: ['word-counter', 'line-tools', 'fullwidth-halfwidth', 'regex-tester', 'json-formatter'],
  priority: 55,
  updated: '2026-10-29',
});

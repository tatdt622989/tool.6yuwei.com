export interface Category {
  id: string;
  name: string;
  /** Short line used on cards and nav. */
  blurb: string;
  /** Longer SEO copy rendered on the category page. */
  description: string;
  /** Lucide icon name (PascalCase). */
  icon: string;
}

export const categories = [
  {
    id: 'finance',
    name: '薪資與理財',
    blurb: '實領薪水、年終、發票對獎、股票手續費',
    description:
      '上班族與家庭理財最常查的試算工具：實領薪水與勞健保扣款、年終獎金扣稅、綜合所得稅、加班費、特休、資遣費、失業給付、勞退月退休金、統一發票對獎、股票手續費、股息殖利率、融資維持率、貸款、定存與即時匯率。依台灣現行法規與費率設計，並附計算公式說明。',
    icon: 'Coins',
  },
  {
    id: 'calc',
    name: '計算機',
    blurb: 'BMI、房貸、電費、坪數換算',
    description:
      '生活與理財常用的計算機：BMI、百分比、折扣、房貸月付、複利、電費、分帳、坪數與單位換算。輸入數字即時算出結果，並附上公式說明，方便你理解每個數字怎麼來。',
    icon: 'Calculator',
  },
  {
    id: 'time',
    name: '時間與日期',
    blurb: '台灣時間、跨年倒數、行事曆、計時器',
    description:
      '和時間有關的工具：台灣標準時間校時、跨年與春節倒數、九合一投票指南、日期相差幾天、實歲與虛歲、世界時區換算，以及碼錶、倒數計時器與番茄鐘。適合搶票、安排行程與專注工作。',
    icon: 'Clock',
  },
  {
    id: 'text',
    name: '文字處理',
    blurb: '字數統計、繁簡轉換、文字比對',
    description:
      '寫報告、整理文案、處理資料時最常用的文字工具：字數統計、繁體簡體互轉、大小寫與全形半形轉換、逐行排序去重、兩段文字差異比對等，全部在瀏覽器內完成，內容不會上傳到任何伺服器。',
    icon: 'Type',
  },
  {
    id: 'pdf',
    name: 'PDF 工具',
    blurb: '合併、分割、圖片轉 PDF',
    description:
      '免上傳的 PDF 工具：合併多個 PDF、分割與擷取頁面、JPG 與 PNG 圖片轉 PDF、PDF 轉圖片。檔案只在你的瀏覽器中處理，處理合約、成績單等私密文件也安心。',
    icon: 'FileText',
  },
  {
    id: 'image',
    name: '圖片工具',
    blurb: '壓縮、轉檔、調整尺寸',
    description:
      '免上傳的圖片工具：壓縮 JPG / PNG / WebP、格式互轉、批次調整尺寸、圖片轉 Base64。圖片只在你的瀏覽器裡處理，隱私有保障，速度也更快。',
    icon: 'Image',
  },
  {
    id: 'health',
    name: '健康計算',
    blurb: 'TDEE、體脂、預產期、排卵期',
    description:
      '和身體與生活有關的計算工具：每日熱量消耗 TDEE 與基礎代謝 BMR、體脂率、每日喝水量、預產期與懷孕週數、排卵期與安全期推算。結果僅供參考，身體狀況請以醫師建議為準。',
    icon: 'HeartPulse',
  },
  {
    id: 'test',
    name: '線上測試',
    blurb: '打字速度、CPS、鍵盤、螢幕測試',
    description:
      '測試你自己和你的裝置：中英文打字速度測試、CPS 點擊速度、反應速度測試，以及鍵盤按鍵、螢幕壞點、麥克風與視訊鏡頭檢測。打開網頁就能測，不需要安裝任何軟體。',
    icon: 'Gauge',
  },
  {
    id: 'generator',
    name: '產生器',
    blurb: '密碼、QR Code、抽籤、亂數',
    description:
      '需要隨機或自動產生內容時使用：高強度密碼產生器、QR Code 產生器、抽籤與隨機分組、亂數產生器。採用瀏覽器內建的加密等級亂數來源，結果公平可信。',
    icon: 'Sparkles',
  },
  {
    id: 'dev',
    name: '開發者工具',
    blurb: 'JSON、Base64、雜湊、正規表達式',
    description:
      '給工程師的日常小工具：JSON 格式化與驗證、Base64 與 URL 編碼、UUID 產生、SHA 雜湊、JWT 解碼、正規表達式測試、時間戳轉換與色碼轉換。無需安裝套件，打開網頁就能用。',
    icon: 'Code',
  },
] as const satisfies readonly Category[];

export type CategoryId = (typeof categories)[number]['id'];

export function getCategory(id: string): Category {
  const found = categories.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

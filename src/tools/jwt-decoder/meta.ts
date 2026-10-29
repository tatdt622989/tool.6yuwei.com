import { defineTool } from '../types';

export default defineTool({
  slug: 'jwt-decoder',
  name: 'JWT 解碼',
  seoTitle: 'JWT 解碼：線上解析 JWT Token 內容與到期時間',
  description:
    '免費線上 JWT 解碼工具，貼上 Token 即可看到 Header 與 Payload 的 JSON 內容，並把 exp、iat、nbf 轉成本地時間、顯示是否過期。只在瀏覽器解碼，Token 不會上傳。',
  category: 'dev',
  icon: 'ShieldCheck',
  keywords: ['JWT 解碼', 'JWT decoder', 'JWT 解析', 'JSON Web Token', 'jwt decode', 'Token 解碼', 'JWT 過期時間'],
  intro: '貼上 JWT，立即看到標頭與酬載的內容、簽發與到期時間，以及這個 Token 現在是否已經過期。',
  howTo: [
    '把 JWT 貼到「貼上 JWT」框中，可以包含開頭的「Bearer 」，也可以按「載入範例」試用。',
    '下方會分別列出標頭（Header）與酬載（Payload）的 JSON，按「複製」可帶走排版後的內容。',
    '狀態列會顯示 Token 是否過期或尚未生效，「標準欄位」表格會把 exp、iat、nbf 換算成本地時間。',
    '簽章區顯示原始簽章與演算法；簽章是否有效需由後端以金鑰驗證。',
  ],
  sections: [
    {
      heading: 'JWT 的結構',
      body: [
        'JWT（JSON Web Token，RFC 7519）由三段以「.」分隔的字串組成：標頭（Header）、酬載（Payload）與簽章（Signature）。前兩段都是把 JSON 以 Base64URL 編碼，所以任何人都能直接解碼閱讀；第三段則是用金鑰對前兩段計算出的簽章，用來確認內容沒有被竄改。',
        '標頭通常包含 alg（簽章演算法，例如 HS256、RS256、ES256）與 typ。酬載則放「聲明」（Claims），例如使用者 ID、角色與時間資訊。由於酬載只是編碼而非加密，請不要在 JWT 裡放密碼、身分證字號等機密資料。標頭中若有 kid，則是用來指出簽章使用的是哪一把金鑰。',
      ],
    },
    {
      heading: '常見的標準欄位',
      body: [
        'RFC 7519 定義了幾個註冊聲明：iss 是簽發者、sub 是主體（通常是使用者 ID）、aud 是預期的接收者、jti 是這個 Token 的唯一 ID。時間相關的有 exp（到期時間）、nbf（在此之前無效）與 iat（簽發時間）。',
        '這三個時間欄位都是 NumericDate，也就是自 1970-01-01 UTC 起算的「秒數」，不是毫秒。若你在程式中直接拿 exp 和 JavaScript 的 Date.now() 比較，記得先把秒乘以 1000，這是很常見的錯誤。',
      ],
    },
    {
      heading: '解碼不等於驗證',
      body: [
        '本工具只負責把內容解出來，不會也無法確認簽章是否正確。驗證必須在伺服器端進行：以 HS256 簽署的 Token 需要相同的共用密鑰，RS256 或 ES256 則使用簽發者公開的公鑰。後端也應明確指定可接受的演算法，拒絕 alg 為 none 的 Token，並檢查 exp、nbf、iss 與 aud。',
        '因為 Token 內容不會傳送到任何伺服器，你可以放心貼上正式環境的 Token 來除錯；不過有效的 Token 本身就等同登入憑證，仍應避免貼到聊天室或公開的問題回報中；若不慎外流，應立即讓它失效或更換簽章金鑰。除錯完成後，也建議清除輸入框。',
      ],
    },
  ],
  faq: [
    {
      q: '為什麼別人也能解碼我的 JWT？',
      a: 'JWT 的標頭與酬載只是 Base64URL 編碼，設計上本來就可公開閱讀。它的安全性來自簽章：沒有金鑰的人無法修改內容而不被發現。需要隱藏內容時應改用加密的 JWE。',
    },
    {
      q: 'exp 時間看起來是 1970 年或很遙遠的未來？',
      a: 'exp 應該以秒為單位。如果簽發端誤用毫秒，數字會多出三位，換算出來就是很遙遠的年份；反之若數字太小，則可能是設定錯誤。',
    },
    {
      q: '顯示「已過期」但伺服器還接受，為什麼？',
      a: '許多伺服器會容許幾十秒到幾分鐘的時鐘誤差（leeway），另外你電腦的時間也可能與伺服器不同。本工具是以你裝置目前的時間判斷。',
    },
    {
      q: '可以用這個工具驗證簽章嗎？',
      a: '不行。本工具刻意只做解碼，不要求你輸入密鑰，以免機密外流。驗證簽章請在後端使用可信任的 JWT 函式庫進行。',
    },
  ],
  related: ['base64', 'json-formatter', 'timestamp-converter', 'hash-generator'],
  priority: 50,
  updated: '2026-10-29',
});

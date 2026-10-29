import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { DecodeErrorCode, DurationUnit } from './logic';

export interface Strings {
  inputLabel: string;
  placeholder: string;
  sample: string;
  clear: string;
  /** Note around the bold part: `${noteBefore}<strong>${noteStrong}</strong>${noteAfter}`. */
  noteBefore: string;
  noteStrong: string;
  noteAfter: string;
  header: string;
  payload: string;
  copy: string;
  claimsLabel: string;
  claimCol: string;
  meaningCol: string;
  valueCol: string;
  signature: string;
  client: {
    /** 'segments' takes {n}. */
    errors: Record<DecodeErrorCode, string>;
    /** Templates take {d} (duration) and {time}. */
    valid: string;
    expired: string;
    notYetValid: string;
    noExpiry: string;
    units: Record<DurationUnit, PluralForms>;
    /** Keyed by registered claim name (iss, sub, aud, exp, nbf, iat, jti). */
    claims: Record<string, string>;
    /** {s} raw seconds, {date} */
    timeValue: string;
    emptySignature: string;
    algNone: string;
    /** {alg} */
    alg: string;
    noAlg: string;
    sampleName: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    inputLabel: '貼上 JWT',
    placeholder: 'eyJhbGciOiJIUzI1NiIs…（可含 Bearer 前綴）',
    sample: '載入範例',
    clear: '清除',
    noteBefore: '本工具只解碼內容，',
    noteStrong: '不驗證簽章',
    noteAfter: '。任何人都能解碼 JWT，請勿在其中放入密碼等機密資料；簽章是否有效必須由持有金鑰的伺服器驗證。',
    header: '標頭（Header）',
    payload: '酬載（Payload）',
    copy: '複製',
    claimsLabel: '標準欄位',
    claimCol: '欄位',
    meaningCol: '說明',
    valueCol: '值',
    signature: '簽章（Signature）',
    client: {
      errors: {
        empty: '請貼上 JWT',
        jwe: '這是 5 段式的加密 JWT（JWE），內容已加密，需要金鑰才能解開。',
        segments: 'JWT 應由三段以「.」分隔的字串組成，目前有 {n} 段。',
        header: '第一段標頭（Header）不是有效的 Base64URL 編碼 JSON 物件。',
        payload: '第二段酬載（Payload）不是有效的 Base64URL 編碼。',
      },
      valid: '尚未過期：將在 {d}後到期（{time}）',
      expired: '已過期：在 {d}前到期（{time}）',
      notYetValid: '尚未生效：{d}後才開始生效（{time}）',
      noExpiry: '這個 JWT 沒有設定 exp 到期時間。',
      units: {
        day: { other: '{n} 天' },
        hour: { other: '{n} 小時' },
        minute: { other: '{n} 分' },
        second: { other: '{n} 秒' },
      },
      claims: {
        iss: '簽發者（Issuer）',
        sub: '主體（Subject）',
        aud: '受眾（Audience）',
        exp: '到期時間（Expiration）',
        nbf: '生效時間（Not Before）',
        iat: '簽發時間（Issued At）',
        jti: '權杖 ID（JWT ID）',
      },
      timeValue: '{s}（{date}）',
      emptySignature: '（空白，未簽章）',
      algNone: '演算法為 none：這個 JWT 沒有簽章，伺服器不應接受。',
      alg: '演算法：{alg}。簽章以 Base64URL 表示，需要對應的金鑰才能驗證。',
      noAlg: '標頭沒有 alg 欄位。',
      sampleName: '王小明',
    },
  },
  en: {
    inputLabel: 'Paste a JWT',
    placeholder: 'eyJhbGciOiJIUzI1NiIs… (a Bearer prefix is fine)',
    sample: 'Load sample',
    clear: 'Clear',
    noteBefore: 'This tool decodes the token only and ',
    noteStrong: 'does not verify the signature',
    noteAfter:
      '. Anyone can decode a JWT, so never put passwords or other secrets in one. Whether the signature is valid can only be checked by a server that holds the key.',
    header: 'Header',
    payload: 'Payload',
    copy: 'Copy',
    claimsLabel: 'Registered claims',
    claimCol: 'Claim',
    meaningCol: 'Meaning',
    valueCol: 'Value',
    signature: 'Signature',
    client: {
      errors: {
        empty: 'Paste a JWT',
        jwe: 'This is a five-part encrypted JWT (JWE). Its contents are encrypted and need the key to read.',
        segments: 'A JWT has three parts separated by “.”, but this one has {n}.',
        header: 'The first part (header) is not a valid Base64URL-encoded JSON object.',
        payload: 'The second part (payload) is not valid Base64URL.',
      },
      valid: 'Not expired: expires in {d} ({time})',
      expired: 'Expired {d} ago ({time})',
      notYetValid: 'Not valid yet: becomes valid in {d} ({time})',
      noExpiry: 'This JWT has no exp (expiration) claim.',
      units: {
        day: { one: '{n} day', other: '{n} days' },
        hour: { one: '{n} hour', other: '{n} hours' },
        minute: { one: '{n} minute', other: '{n} minutes' },
        second: { one: '{n} second', other: '{n} seconds' },
      },
      claims: {
        iss: 'Issuer',
        sub: 'Subject',
        aud: 'Audience',
        exp: 'Expiration time',
        nbf: 'Not before',
        iat: 'Issued at',
        jti: 'JWT ID',
      },
      timeValue: '{s} ({date})',
      emptySignature: '(empty, unsigned)',
      algNone: 'Algorithm is none: this JWT is unsigned and a server should reject it.',
      alg: 'Algorithm: {alg}. The signature is Base64URL-encoded and can only be verified with the matching key.',
      noAlg: 'The header has no alg field.',
      sampleName: 'Jane Doe',
    },
  },
  ja: {
    inputLabel: 'JWT を貼り付け',
    placeholder: 'eyJhbGciOiJIUzI1NiIs…（Bearer 付きでも可）',
    sample: 'サンプルを読み込む',
    clear: 'クリア',
    noteBefore: 'このツールは中身をデコードするだけで、',
    noteStrong: '署名の検証は行いません',
    noteAfter:
      '。JWT は誰でもデコードできるため、パスワードなどの機密情報を入れないでください。署名が正しいかどうかは、鍵を持つサーバー側で検証する必要があります。',
    header: 'ヘッダー（Header）',
    payload: 'ペイロード（Payload）',
    copy: 'コピー',
    claimsLabel: '登録済みクレーム',
    claimCol: 'クレーム',
    meaningCol: '意味',
    valueCol: '値',
    signature: '署名（Signature）',
    client: {
      errors: {
        empty: 'JWT を貼り付けてください',
        jwe: '5 つの部分からなる暗号化された JWT（JWE）です。中身は暗号化されており、鍵がないと読めません。',
        segments: 'JWT は「.」で区切られた 3 つの部分からなりますが、この文字列は {n} つに分かれています。',
        header: '1 つ目のヘッダー（Header）が、Base64URL でエンコードされた JSON オブジェクトになっていません。',
        payload: '2 つ目のペイロード（Payload）が、正しい Base64URL ではありません。',
      },
      valid: '有効期限内：あと {d}で期限切れ（{time}）',
      expired: '期限切れ：{d}前に失効（{time}）',
      notYetValid: 'まだ有効ではありません：{d}後に有効になります（{time}）',
      noExpiry: 'この JWT には有効期限（exp）が設定されていません。',
      units: {
        day: { other: '{n} 日' },
        hour: { other: '{n} 時間' },
        minute: { other: '{n} 分' },
        second: { other: '{n} 秒' },
      },
      claims: {
        iss: '発行者（Issuer）',
        sub: '主体（Subject）',
        aud: '対象者（Audience）',
        exp: '有効期限（Expiration）',
        nbf: '有効開始日時（Not Before）',
        iat: '発行日時（Issued At）',
        jti: 'JWT ID',
      },
      timeValue: '{s}（{date}）',
      emptySignature: '（空、署名なし）',
      algNone: 'アルゴリズムが none です。署名のない JWT なので、サーバーは受け付けるべきではありません。',
      alg: 'アルゴリズム：{alg}。署名は Base64URL で表されており、対応する鍵がないと検証できません。',
      noAlg: 'ヘッダーに alg がありません。',
      sampleName: '山田太郎',
    },
  },
});

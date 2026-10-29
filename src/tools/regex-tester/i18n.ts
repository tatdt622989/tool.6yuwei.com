import { defineToolI18n } from '../../i18n/tool';
import type { RegexMessages } from './logic';

export interface Strings {
  flags: { flag: string; label: string; title: string }[];
  /** [syntax, meaning, example] */
  cheatsheet: [string, string, string][];
  /** [syntax, meaning] */
  replacements: [string, string][];
  patternLabel: string;
  patternPlaceholder: string;
  flagsLegend: string;
  textLabel: string;
  textPlaceholder: string;
  listLabel: string;
  colPosition: string;
  colMatch: string;
  colGroups: string;
  replaceLabel: string;
  replacePlaceholder: string;
  replacedLabel: string;
  copy: string;
  sample: string;
  clear: string;
  cheatSummary: string;
  colSyntax: string;
  colMeaning: string;
  colExample: string;
  colReplaceSyntax: string;
  colReplaceMeaning: string;
  client: {
    messages: RegexMessages;
    sampleText: string;
    sampleReplacement: string;
    resultLabel: string;
    noMatch: string;
    /** {n} {truncated} */
    matches: string;
    truncated: string;
    emptyHint: string;
    emptyString: string;
    /** {max} {rows} */
    noteTruncated: string;
    /** {rows} */
    noteRows: string;
    noteIndex: string;
    /** {s} */
    timeout: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    flags: [
      { flag: 'g', label: '全域', title: '找出所有符合，而不只第一個' },
      { flag: 'i', label: '忽略大小寫', title: '不區分大小寫' },
      { flag: 'm', label: '多行', title: '^ 與 $ 比對每一行的開頭與結尾' },
      { flag: 's', label: 'dotAll', title: '讓 . 也能比對換行' },
      { flag: 'u', label: 'Unicode', title: '以 Unicode 碼位處理，可用 \\p{…}' },
      { flag: 'y', label: '黏著', title: '只從 lastIndex 位置開始比對' },
    ],
    cheatsheet: [
      ['.', '任意一個字元（不含換行，加 s 旗標才包含）', 'a.c 符合 abc、a1c'],
      ['\\d　\\D', '數字 0–9／非數字', '\\d{3} 符合 123'],
      ['\\w　\\W', '英數字與底線／其他字元', '\\w+ 符合 user_01'],
      ['\\s　\\S', '空白字元（空格、Tab、換行）／非空白', 'a\\sb 符合 a b'],
      ['\\b', '單字邊界（只對英數字有效）', '\\bcat\\b 不符合 category'],
      ['^　$', '開頭／結尾（加 m 旗標時為每一行）', '^\\d+$ 整行都是數字'],
      ['[abc]　[^abc]', '其中一個字元／以外的字元', '[aeiou] 母音'],
      ['[a-z0-9]', '字元範圍', '[A-F0-9] 十六進位'],
      ['*　+　?', '0 次以上／1 次以上／0 或 1 次', 'colou?r 符合 color、colour'],
      ['{n}　{n,}　{n,m}', '剛好 n 次／至少 n 次／n 到 m 次', '\\d{2,4}'],
      ['*?　+?', '非貪婪：盡可能少比對', '<.+?> 只比對一個標籤'],
      ['(abc)', '擷取群組，可用 $1 參照', '(\\d+)-(\\d+)'],
      ['(?:abc)', '只分組不擷取', '(?:ab)+'],
      ['(?<name>abc)', '具名群組，可用 $<name> 參照', '(?<year>\\d{4})'],
      ['a|b', '或', 'cat|dog'],
      ['(?=abc)　(?!abc)', '正向／負向先行斷言', '\\d+(?=元) 只取金額數字'],
      ['(?<=abc)　(?<!abc)', '正向／負向後行斷言', '(?<=\\$)\\d+'],
      ['\\1', '反向參照第 1 個群組', '(\\w)\\1 符合 aa、ll'],
      ['\\p{Script=Han}', '中文字（需要 u 旗標）', '\\p{Script=Han}+'],
      ['\\u4e00　\\x41', 'Unicode／十六進位字元', '[\\u4e00-\\u9fff]'],
    ],
    replacements: [
      ['$1、$2…', '第 n 個擷取群組'],
      ['$<name>', '具名群組'],
      ['$&', '整個符合的文字'],
      ['$`　$\'', '符合位置之前／之後的文字'],
      ['$$', '一個 $ 符號'],
    ],
    patternLabel: '正規表達式',
    patternPlaceholder: '例如 \\d{4}-\\d{2}-\\d{2}',
    flagsLegend: '旗標',
    textLabel: '測試文字',
    textPlaceholder: '貼上要比對的文字',
    listLabel: '符合清單',
    colPosition: '位置',
    colMatch: '符合內容',
    colGroups: '群組',
    replaceLabel: '取代為（選填）',
    replacePlaceholder: '例如 $3/$2/$1 或 $<year>',
    replacedLabel: '取代結果預覽',
    copy: '複製',
    sample: '載入範例',
    clear: '清除',
    cheatSummary: '常用語法速查',
    colSyntax: '語法',
    colMeaning: '意義',
    colExample: '範例',
    colReplaceSyntax: '取代語法',
    colReplaceMeaning: '代表',
    client: {
      messages: {
        badFlag: '不支援的旗標「{flag}」，可用的旗標為 g i m s u y。',
        syntax: '語法錯誤：{message}',
        failed: '執行失敗：{message}',
        unset: '（未參與）',
      },
      sampleText: '訂單 A102 於 2026-10-29 成立，預計 2026-11-03 出貨。\n客服信箱：service@example.com，電話 02-2345-6789。',
      sampleReplacement: '$<day>/$<month>/$<year>',
      resultLabel: '比對結果',
      noMatch: '比對結果：沒有符合',
      matches: '比對結果：{n} 個符合{truncated}',
      truncated: '（已達上限）',
      emptyHint: '輸入測試文字後會在這裡標示符合的部分',
      emptyString: '（空字串）',
      noteTruncated: '為避免瀏覽器當機，最多找出 {max} 個符合，表格列出前 {rows} 個。',
      noteRows: '表格只列出前 {rows} 個符合。',
      noteIndex: '位置以 UTF-16 字元索引表示，從 0 開始。',
      timeout: '運算超過 {s} 秒已中止。這個樣式可能造成「災難性回溯」，例如 (a+)+$ 這類巢狀重複，請改寫樣式後再試。',
    },
  },
  en: {
    flags: [
      { flag: 'g', label: 'global', title: 'Find all matches, not just the first' },
      { flag: 'i', label: 'ignore case', title: 'Case-insensitive matching' },
      { flag: 'm', label: 'multiline', title: '^ and $ match at the start and end of each line' },
      { flag: 's', label: 'dotAll', title: 'Let . match line breaks too' },
      { flag: 'u', label: 'Unicode', title: 'Work in Unicode code points; enables \\p{…}' },
      { flag: 'y', label: 'sticky', title: 'Match only from lastIndex' },
    ],
    cheatsheet: [
      ['.', 'Any character except a line break (add the s flag to include it)', 'a.c matches abc, a1c'],
      ['\\d  \\D', 'Digit 0–9 / not a digit', '\\d{3} matches 123'],
      ['\\w  \\W', 'Letter, digit or underscore / anything else', '\\w+ matches user_01'],
      ['\\s  \\S', 'Whitespace (space, tab, newline) / non-whitespace', 'a\\sb matches a b'],
      ['\\b', 'Word boundary', '\\bcat\\b does not match category'],
      ['^  $', 'Start / end of input (of each line with m)', '^\\d+$ whole line is digits'],
      ['[abc]  [^abc]', 'One of these characters / none of them', '[aeiou] a vowel'],
      ['[a-z0-9]', 'Character range', '[A-F0-9] a hex digit'],
      ['*  +  ?', '0 or more / 1 or more / 0 or 1', 'colou?r matches color, colour'],
      ['{n}  {n,}  {n,m}', 'Exactly n / at least n / n to m times', '\\d{2,4}'],
      ['*?  +?', 'Lazy: match as little as possible', '<.+?> matches one tag'],
      ['(abc)', 'Capture group, referenced as $1', '(\\d+)-(\\d+)'],
      ['(?:abc)', 'Group without capturing', '(?:ab)+'],
      ['(?<name>abc)', 'Named group, referenced as $<name>', '(?<year>\\d{4})'],
      ['a|b', 'Either a or b', 'cat|dog'],
      ['(?=abc)  (?!abc)', 'Positive / negative lookahead', '\\d+(?= USD) the amount only'],
      ['(?<=abc)  (?<!abc)', 'Positive / negative lookbehind', '(?<=\\$)\\d+'],
      ['\\1', 'Backreference to group 1', '(\\w)\\1 matches ll in hello'],
      ['\\p{L}', 'Any letter in any language (needs u)', '\\p{Lu} uppercase letters'],
      ['\\u00e9  \\x41', 'Unicode / hex character escape', 'caf\\u00e9'],
    ],
    replacements: [
      ['$1, $2…', 'The nth capture group'],
      ['$<name>', 'A named group'],
      ['$&', 'The whole match'],
      ['$`  $\'', 'Text before / after the match'],
      ['$$', 'A literal $ sign'],
    ],
    patternLabel: 'Regular expression',
    patternPlaceholder: 'e.g. \\d{4}-\\d{2}-\\d{2}',
    flagsLegend: 'Flags',
    textLabel: 'Test string',
    textPlaceholder: 'Paste the text to match against',
    listLabel: 'Match list',
    colPosition: 'Index',
    colMatch: 'Match',
    colGroups: 'Groups',
    replaceLabel: 'Replace with (optional)',
    replacePlaceholder: 'e.g. $2/$3/$1 or $<year>',
    replacedLabel: 'Replacement preview',
    copy: 'Copy',
    sample: 'Load example',
    clear: 'Clear',
    cheatSummary: 'Regex cheat sheet',
    colSyntax: 'Syntax',
    colMeaning: 'Meaning',
    colExample: 'Example',
    colReplaceSyntax: 'Replacement',
    colReplaceMeaning: 'Inserts',
    client: {
      messages: {
        badFlag: 'Unsupported flag "{flag}". Available flags are g i m s u y.',
        syntax: 'Syntax error: {message}',
        failed: 'Matching failed: {message}',
        unset: '(did not participate)',
      },
      sampleText:
        'Order #A102 was placed on 2026-10-29 and ships on 2026-11-03.\nQuestions? Email support@example.com or call (555) 010-4477.',
      sampleReplacement: '$<month>/$<day>/$<year>',
      resultLabel: 'Matches',
      noMatch: 'Matches: none',
      matches: 'Matches: {n}{truncated}',
      truncated: ' (limit reached)',
      emptyHint: 'Enter a test string and matches will be highlighted here',
      emptyString: '(empty string)',
      noteTruncated: 'To keep your browser responsive, matching stops at {max} matches; the table lists the first {rows}.',
      noteRows: 'The table lists only the first {rows} matches.',
      noteIndex: 'Indexes are zero-based UTF-16 positions, as in JavaScript.',
      timeout:
        'Stopped after {s} seconds. This pattern probably causes catastrophic backtracking (nested repetition such as (a+)+$). Rewrite it and try again.',
    },
  },
  ja: {
    flags: [
      { flag: 'g', label: 'グローバル', title: '最初の 1 件だけでなく、すべてのマッチを探す' },
      { flag: 'i', label: '大文字小文字を無視', title: '大文字と小文字を区別しない' },
      { flag: 'm', label: '複数行', title: '^ と $ が各行の先頭と末尾にマッチする' },
      { flag: 's', label: 'dotAll', title: '. が改行にもマッチする' },
      { flag: 'u', label: 'Unicode', title: 'Unicode のコードポイント単位で処理し、\\p{…} を使えるようにする' },
      { flag: 'y', label: 'sticky', title: 'lastIndex の位置からだけマッチさせる' },
    ],
    cheatsheet: [
      ['.', '任意の 1 文字（改行を除く。s フラグで改行も含む）', 'a.c は abc、a1c にマッチ'],
      ['\\d　\\D', '半角数字 0–9／数字以外', '\\d{3} は 123 にマッチ'],
      ['\\w　\\W', '半角英数字とアンダースコア／それ以外', '\\w+ は user_01 にマッチ'],
      ['\\s　\\S', '空白文字（スペース、タブ、改行）／空白以外', 'a\\sb は a b にマッチ'],
      ['\\b', '単語の境界（半角英数字のみ有効）', '\\bcat\\b は category にマッチしない'],
      ['^　$', '先頭／末尾（m フラグでは各行）', '^\\d+$ 行全体が数字'],
      ['[abc]　[^abc]', 'いずれか 1 文字／それ以外の 1 文字', '[aeiou] 母音'],
      ['[a-z0-9]', '文字の範囲', '[A-F0-9] 16 進数'],
      ['*　+　?', '0 回以上／1 回以上／0 回か 1 回', 'colou?r は color、colour にマッチ'],
      ['{n}　{n,}　{n,m}', 'ちょうど n 回／n 回以上／n〜m 回', '\\d{2,4}'],
      ['*?　+?', '最短一致（非貪欲）', '<.+?> はタグ 1 つだけにマッチ'],
      ['(abc)', 'キャプチャグループ。$1 で参照', '(\\d+)-(\\d+)'],
      ['(?:abc)', 'キャプチャしないグループ', '(?:ab)+'],
      ['(?<name>abc)', '名前付きグループ。$<name> で参照', '(?<year>\\d{4})'],
      ['a|b', 'または', 'cat|dog'],
      ['(?=abc)　(?!abc)', '肯定／否定先読み', '\\d+(?=円) 金額の数字だけ'],
      ['(?<=abc)　(?<!abc)', '肯定／否定後読み', '(?<=￥)\\d+'],
      ['\\1', '1 番目のグループの後方参照', '(\\w)\\1 は aa、ll にマッチ'],
      ['\\p{Script=Hiragana}', 'ひらがな（u フラグが必要）', '\\p{Script=Katakana}+ カタカナ'],
      ['\\p{Script=Han}', '漢字（u フラグが必要）', '[\\p{Script=Han}\\p{Script=Hiragana}]+'],
      ['\\u3042　\\x41', 'Unicode／16 進数による文字指定', '[\\u3041-\\u3096] ひらがな'],
    ],
    replacements: [
      ['$1、$2…', 'n 番目のキャプチャグループ'],
      ['$<name>', '名前付きグループ'],
      ['$&', 'マッチした文字列全体'],
      ['$`　$\'', 'マッチより前／後の文字列'],
      ['$$', '$ 記号そのもの'],
    ],
    patternLabel: '正規表現',
    patternPlaceholder: '例：\\d{4}-\\d{2}-\\d{2}',
    flagsLegend: 'フラグ',
    textLabel: 'テスト文字列',
    textPlaceholder: 'マッチさせたい文字列を貼り付け',
    listLabel: 'マッチ一覧',
    colPosition: '位置',
    colMatch: 'マッチした文字列',
    colGroups: 'グループ',
    replaceLabel: '置換文字列（任意）',
    replacePlaceholder: '例：$1年$2月$3日 や $<year>',
    replacedLabel: '置換結果のプレビュー',
    copy: 'コピー',
    sample: 'サンプルを読み込む',
    clear: 'クリア',
    cheatSummary: '正規表現チートシート',
    colSyntax: '構文',
    colMeaning: '意味',
    colExample: '例',
    colReplaceSyntax: '置換の構文',
    colReplaceMeaning: '挿入される内容',
    client: {
      messages: {
        badFlag: '「{flag}」は対応していないフラグです。使えるフラグは g i m s u y です。',
        syntax: '構文エラー：{message}',
        failed: '実行に失敗しました：{message}',
        unset: '（不参加）',
      },
      sampleText:
        '注文番号 A102 は 2026-10-29 に受付、2026-11-03 に発送予定です。\nお問い合わせ：support@example.com／電話 03-1234-5678',
      sampleReplacement: '$<year>年$<month>月$<day>日',
      resultLabel: 'マッチ結果',
      noMatch: 'マッチ結果：なし',
      matches: 'マッチ結果：{n} 件{truncated}',
      truncated: '（上限に達しました）',
      emptyHint: 'テスト文字列を入力すると、マッチした部分がここに表示されます',
      emptyString: '（空文字列）',
      noteTruncated: 'ブラウザが固まらないよう、マッチは最大 {max} 件まで検索し、表には最初の {rows} 件を表示します。',
      noteRows: '表には最初の {rows} 件だけを表示しています。',
      noteIndex: '位置は 0 から始まる UTF-16 の文字インデックスです。',
      timeout:
        '{s} 秒を超えたため中止しました。(a+)+$ のような入れ子の繰り返しによる「破滅的バックトラック」が起きている可能性があります。パターンを書き直してお試しください。',
    },
  },
});

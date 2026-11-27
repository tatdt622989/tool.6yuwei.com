import { defineTool } from '../types';

export default defineTool({
  slug: 'image-to-base64',
  name: '画像 Base64 変換',
  seoTitle: '画像 Base64 変換：Data URI・CSS・img タグをオンラインで生成',
  description:
    '画像を Base64 に変換する無料ツールです。PNG・JPG・SVG・WebP から Data URI、CSS の background-image、HTML の img タグを生成できます。変換はブラウザ内で行われます。',
  category: 'image',
  icon: 'FileCode',
  keywords: [
    '画像 Base64 変換',
    '画像 base64',
    'base64 画像 変換',
    '画像 base64 エンコード',
    'png base64 変換',
    'jpg base64 変換',
    'svg base64',
    'data uri 変換',
    'data uri scheme 画像',
    'image to base64',
    'css 背景画像 base64',
    'img タグ base64',
  ],
  intro: '画像を Base64 の文字列に変換し、HTML・CSS・JSON・メールテンプレートに直接埋め込めるようにします。変換はブラウザ内で完結し、画像はアップロードされません。',
  howTo: [
    '点線の枠をクリックして画像を選ぶか、ファイルをドロップします。Ctrl/Cmd + V でスクリーンショットを貼り付けることもできます。',
    'プレビューと、その下に表示されるファイルサイズの注意を確認します。埋め込みは 10 KB 以下の小さなアイコンに向いています。',
    '「出力形式」で Data URI、Base64 のみ、CSS 背景、HTML img のいずれかを選びます。',
    '「結果をコピー」でコードに貼り付けるか、「.txt でダウンロード」でテキストファイルとして保存します。',
  ],
  sections: [
    {
      heading: 'Base64 と Data URI スキームとは',
      body: [
        'Base64 は、画像などのバイナリデータを A–Z、a–z、0–9、+、/ の 64 種類の文字だけで表すエンコード方式です。3 バイトが 4 文字に置き換わるため、変換後の文字列は元のファイルより約 33% 大きくなります。暗号化ではないので、誰でも元の画像に戻せます。',
        'Data URI スキームは、Base64 の前に「data:image/png;base64,」のような見出しを付けた形式です。ブラウザはこれをそのまま画像として扱うため、追加の通信なしで表示できます。img の src、CSS の url()、ファビコンの link など、画像の URL を書ける場所ならどこでも使えます。',
      ],
    },
    {
      heading: 'Base64 で埋め込むべき画像、避けるべき画像',
      body: [
        '向いているのは、ページ内の小さなアイコンやローディングアニメーション、1 つの HTML ファイルで完結させたい資料やモックアップ、JSON で画像を送る API リクエスト、添付ファイルを置きにくい設定ファイルやテストデータなどです。目安は 10 KB 以下です。',
        '写真や大きなメインビジュアル、複数ページで使い回す画像には向きません。HTML や CSS が重くなって初回表示が遅れるうえ、画像を単独でキャッシュできなくなります。HTTP/2 以降はリクエスト数の負担が小さいので、圧縮した通常の画像ファイルを長めにキャッシュさせるほうが速いことがほとんどです。',
      ],
    },
    {
      heading: '4 つの出力形式の使い分け',
      body: [
        '「Data URI」はもっともよく使う完全な形式で、img の src やブラウザのアドレスバーにそのまま貼り付けられます。「Base64 のみ」は data: の見出しを除いた文字列で、画像の種類を別の項目で送る API やデータベースに向いています。「CSS 背景」は background-image の宣言をそのまま出力します。「HTML img」はファイル名を alt に、実際の幅と高さを width・height に入れた img タグを作るので、読み込み中のレイアウトのずれ（CLS）を防げます。',
      ],
    },
    {
      heading: 'メールで Base64 画像を使うときの注意',
      body: [
        'Gmail や一部の Outlook など、Data URI の画像を表示しないメールソフトが少なくありません。メールマガジンには、配信サービスの画像ホスティングを使うか、画像を添付して Content-ID（cid:）で参照する方法が確実です。',
      ],
    },
  ],
  faq: [
    {
      q: 'Base64 にするとファイルサイズが大きくなるのはなぜですか？',
      a: 'Base64 は 3 バイトを 4 文字で表すため、約 33% 大きくなります。サーバー側で gzip や Brotli 圧縮をかけると転送量の差は縮まりますが、元の画像より大きいことに変わりはありません。',
    },
    {
      q: 'HTML で Base64 画像を表示するには？',
      a: 'img タグの src に Data URI をそのまま入れます（<img src="data:image/png;base64,…" alt="…">）。出力形式で「HTML img」を選ぶと、width と height 付きのタグをまとめて生成できます。',
    },
    {
      q: 'SVG も Base64 に変換できますか？',
      a: 'できます。出力は data:image/svg+xml;base64, で始まります。SVG はもともとテキストなので、Base64 ではなく URL エンコードで埋め込むほうが短くなることもありますが、互換性は Base64 のほうが高いです。',
    },
    {
      q: '「Data URI」と「Base64 のみ」の違いは何ですか？',
      a: 'Data URI はブラウザが画像として認識するための data:image/…;base64, を含む完全な形式です。「Base64 のみ」はその見出しを除いた文字列で、ファイル形式を別に指定する API などで使います。',
    },
    {
      q: '変換できるファイルサイズに上限はありますか？',
      a: '上限はありませんが、数 MB を超える画像は数百万文字になり、エディタやページの動作が重くなります。大きな画像は先に圧縮やリサイズをしておくのがおすすめです。',
    },
    {
      q: '画像はサーバーに送信されますか？',
      a: 'いいえ。ブラウザの FileReader を使って端末内でエンコードするため、画像も生成した文字列もネットワークには送信されません。',
    },
  ],
  related: ['base64', 'image-compressor', 'image-converter', 'image-resizer', 'url-encoder', 'html-entities'],
  priority: 55,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'html-entities',
  name: 'HTML Entity Encoder / Decoder',
  seoTitle: 'HTML Entity Encoder and Decoder: Escape and Unescape HTML Online',
  description:
    'Free HTML entity encoder and decoder. Escape < > & and quotes so text is safe in HTML, or decode &amp;, &nbsp;, &copy; and numeric codes back to plain text.',
  category: 'dev',
  icon: 'CodeXml',
  keywords: [
    'html entity encoder',
    'html entity decoder',
    'html escape',
    'html unescape',
    'html entities',
    'html encode online',
    'html decode online',
    'escape html characters',
    'html special characters',
    'html character codes',
    'nbsp',
    'html entities list',
    'unicode to html entity',
  ],
  intro:
    'Escape text so it displays safely inside HTML, or turn entities like &lt; &amp; &copy; back into normal characters. Includes a cheat sheet of the most common HTML entities.',
  howTo: [
    'Choose “Encode (escape)” or “Decode (unescape)” at the top.',
    'When encoding, pick which characters to convert (“Special characters only” or “Also all non-ASCII”) and the entity style: named, decimal or hex.',
    'Paste your text. The result appears instantly; click “Copy result”, or use “Convert result back” to check the round trip.',
  ],
  sections: [
    {
      heading: 'Which characters must be escaped in HTML?',
      body: [
        'Five characters have special meaning in HTML: & starts an entity, < and > delimit tags, and " and \' close attribute values. To show them as literal text, write &amp; &lt; &gt; &quot; and &#39;. For example, to display the code <b>AT&T</b> on a page, write &lt;b&gt;AT&amp;T&lt;/b&gt;.',
        'With UTF-8, which nearly every site uses today, you don’t need to escape other characters such as é, €, © or emoji. Choose “Also all non-ASCII” only when the output must be pure ASCII, for example in some email templates, legacy systems or source files with an unknown encoding.',
      ],
    },
    {
      heading: 'Named, decimal and hex character references',
      body: [
        'The same character can be written three ways: named (&copy;), decimal (&#169;) and hexadecimal (&#xA9;). Named entities are easiest to read, but only about 2,000 characters have names. Numeric references work for every Unicode code point; the hex form matches the U+00A9 notation used in Unicode charts.',
        '&apos; is defined in HTML5 and XML but not in HTML 4, so this tool writes a single quote as &#39; for maximum compatibility. When decoding, every HTML5 named entity your browser knows is supported, not just the ones in the table.',
      ],
    },
    {
      heading: 'Escaping and XSS',
      body: [
        'Inserting user input into a page without escaping it is the root cause of cross-site scripting (XSS): if someone enters <script>…</script> and it is written straight into the HTML, the browser runs it. Escaping turns it into plain, harmless text.',
        'HTML escaping only protects HTML content and quoted attributes. JavaScript strings, URLs and CSS each need their own escaping (for example, encodeURIComponent for URL parameters). In real projects, rely on your template engine or framework’s automatic escaping, such as React’s JSX or Jinja’s autoescape, and use this tool for one-off conversions and debugging.',
      ],
    },
    {
      heading: 'Non-breaking spaces and other invisible characters',
      body: [
        '&nbsp; is a space that never breaks across lines. It is useful between a number and its unit (10&nbsp;kg) or in names like “Mr.&nbsp;Smith”. Avoid using rows of &nbsp; for layout; use CSS margins and padding instead.',
        '&shy; marks a place where a long word may be hyphenated if needed, and &thinsp; is a narrow space often used in typography, for example around an em dash or between digit groups. They are invisible, so the table labels them “(space)”.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between &nbsp; and a normal space?',
      a: 'A normal space can be a line break point and several in a row collapse into one. &nbsp; (non-breaking space, U+00A0) keeps the words on either side on the same line, and consecutive &nbsp; characters are not collapsed.',
    },
    {
      q: 'Do I need to escape quotes in HTML text?',
      a: 'Not in normal text content. Quotes only need escaping inside attribute values that use the same quote character, for example title="She said &quot;hi&quot;". Escaping them everywhere is harmless, which is why this tool does it.',
    },
    {
      q: 'Why does decoding leave some entities unchanged?',
      a: 'Unknown names such as &foo; and entities missing their final semicolon are left as they are, because guessing could corrupt your text. Check the spelling: entity names are case-sensitive, so &Omega; and &omega; are different characters.',
    },
    {
      q: 'Should I write © or &copy;?',
      a: 'If your page is UTF-8, which it almost certainly is, you can type © directly. Use &copy; when you want the source to stay ASCII-only or when you can’t easily type the character.',
    },
    {
      q: 'How do I show HTML code on a web page?',
      a: 'Escape it first: paste the code here in “Encode” mode and put the result inside <pre><code>…</code></pre>. Without escaping, the browser would treat the tags as real markup instead of showing them.',
    },
    {
      q: 'Is my text sent to a server?',
      a: 'No. Encoding and decoding happen entirely in your browser. Only your option choices are remembered on this device.',
    },
  ],
  related: ['url-encoder', 'markdown-preview', 'base64', 'regex-tester'],
  priority: 35,
  updated: '2026-10-29',
});

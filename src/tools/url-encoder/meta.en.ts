import { defineTool } from '../types';

export default defineTool({
  slug: 'url-encoder',
  name: 'URL Encode and Decode',
  seoTitle: 'URL Encode and Decode: Percent-Encoding Tool with URL Parser',
  description:
    'Free URL encoder and decoder. Percent-encode text with encodeURIComponent or encodeURI, decode %20 and + back to text, and split a URL into its parameters.',
  category: 'dev',
  icon: 'Link',
  keywords: [
    'url encode',
    'url decode',
    'url encoder',
    'url decoder',
    'percent encoding',
    'url encode online',
    'urlencode',
    'urldecode',
    'encodeuricomponent',
    'decode url parameters',
    'url parser',
    'query string parser',
    '%20 decode',
  ],
  intro:
    'Percent-encode text for use in a URL, or decode %XX sequences back into readable text. Paste a full link below to break it into its scheme, host, path and decoded query parameters.',
  howTo: [
    'Choose “Encode” or “Decode”.',
    'When encoding, pick encodeURIComponent for a single query value or path segment, or encodeURI for a whole URL.',
    'Tick “Space as +” if you are working with HTML form data (application/x-www-form-urlencoded).',
    'To inspect a link, paste it into “Paste a full URL”. Each part and every query parameter is listed with its decoded value.',
  ],
  sections: [
    {
      heading: 'What is URL encoding?',
      body: [
        'URLs may only contain a limited set of ASCII characters (RFC 3986). Everything else, including spaces, accented letters, emoji and characters that have a structural meaning such as & and ?, is written as one or more %XX bytes, where XX is the hexadecimal value of each UTF-8 byte. This is called percent-encoding or URL encoding.',
        'For example, a space becomes %20, & becomes %26, and “café” becomes caf%C3%A9 because é is two bytes in UTF-8 (C3 A9). Decoding reverses the process.',
      ],
    },
    {
      heading: 'encodeURIComponent vs encodeURI',
      body: [
        'encodeURIComponent encodes everything except letters, digits and - _ . ! ~ * \' ( ). Use it for a single piece of a URL, such as a search term or a redirect URL passed as a parameter. Encoding “a&b=c” gives a%26b%3Dc, so the value cannot break the query string.',
        'encodeURI leaves the characters that give a URL its structure (: / ? # & = and so on) untouched and only encodes spaces and characters that are not allowed at all. Use it when you already have a complete URL that just contains spaces or non-ASCII text. Using encodeURI on a query value is a common bug: an & inside the value would split it into two parameters.',
      ],
    },
    {
      heading: '%20 or +? Spaces in URLs',
      body: [
        'In the path of a URL, a space is always %20. In a query string sent by an HTML form, browsers encode spaces as + instead (the application/x-www-form-urlencoded format), and server frameworks such as PHP’s urldecode, Python’s urllib.parse.parse_qs and Java’s URLDecoder turn + back into a space. JavaScript’s decodeURIComponent does not, which is why “Space as +” exists: tick it when decoding form data or analytics query strings.',
      ],
    },
    {
      heading: 'Reading UTM links and tracking parameters',
      body: [
        'Marketing links often carry several layers of parameters, such as utm_source, utm_medium and utm_campaign, plus click IDs like gclid or fbclid. Paste the full link into the URL parser to see each parameter on its own row with its decoded value. It is a quick way to check a campaign link before you publish it, or to find the real destination hidden inside a redirect URL.',
      ],
    },
  ],
  faq: [
    {
      q: 'What does %20 mean in a URL?',
      a: 'It is an encoded space. %20 is the hexadecimal value of the space character (32). Other common ones are %2F for /, %3F for ?, %26 for & and %3D for =.',
    },
    {
      q: 'Why does decoding fail with “not a valid percent-encoding”?',
      a: 'A % sign must be followed by exactly two hex digits. A literal % in the text, such as “50% off”, has to be written as %25. The error points to the character position that is wrong.',
    },
    {
      q: 'Why do I see strange characters after decoding?',
      a: 'The bytes were probably encoded with a legacy character set such as Windows-1252 or ISO-8859-1 rather than UTF-8, or the string was cut off in the middle of a multi-byte character.',
    },
    {
      q: 'Should I encode the whole URL or just the parameters?',
      a: 'Encode each parameter value with encodeURIComponent and then join them with & and =. Encoding the finished URL with encodeURIComponent would also encode the :// and / and break the link.',
    },
    {
      q: 'Is it the same as URLEncoder in Java or urlencode in PHP?',
      a: 'Almost. Java’s URLEncoder and PHP’s urlencode follow the form format and turn spaces into +. To match them here, encode with encodeURIComponent and tick “Space as +”. PHP’s rawurlencode matches encodeURIComponent with spaces as %20.',
    },
    {
      q: 'Is my data sent anywhere?',
      a: 'No. Encoding, decoding and URL parsing all happen in your browser.',
    },
  ],
  related: ['base64', 'html-entities', 'json-formatter', 'qr-code-generator'],
  priority: 60,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'base64',
  name: 'Base64 Encode and Decode',
  seoTitle: 'Base64 Decode and Encode Online: UTF-8 and URL-Safe Converter',
  description:
    'Free Base64 decoder and encoder with full UTF-8 support for accents and emoji. Handles URL-safe Base64 (base64url) and missing padding. Runs in your browser.',
  category: 'dev',
  icon: 'Code',
  keywords: [
    'base64 decode',
    'base64 encode',
    'base64 decoder',
    'base64 encoder',
    'base64 decode online',
    'base64 to text',
    'text to base64',
    'base64 converter',
    'base64url decode',
    'url safe base64',
    'base64 utf-8',
    'decode base64 string',
  ],
  intro:
    'Turn text into Base64 or decode a Base64 string back to readable text. Everything is handled as UTF-8, so accented letters, emoji and non-Latin scripts come back exactly as they went in.',
  howTo: [
    'Choose “Encode” or “Decode” at the top.',
    'Type text or paste a Base64 string into the input box. The result updates as you type.',
    'When encoding, tick “URL-safe (- _)” and “Strip trailing =” to get the base64url form used in URLs and JWTs.',
    'Click “Copy result” to take it with you, or “Reverse with result” to convert it back and double-check.',
  ],
  sections: [
    {
      heading: 'What is Base64?',
      body: [
        'Base64, defined in RFC 4648, represents any binary data using 64 printable characters: A–Z, a–z, 0–9, + and /. Every 3 bytes become 4 characters, and = is used as padding when the input length is not a multiple of 3. It shows up in email attachments (MIME), data: URIs, HTTP Basic authentication headers, Kubernetes secrets and countless JSON APIs that need to carry binary data as text.',
        'Base64 is an encoding, not encryption. Anyone can decode it instantly, so it must never be used to hide passwords or personal data. The output is about 4/3 the size of the input, roughly 33% larger.',
      ],
    },
    {
      heading: 'Why btoa() fails on emoji and accented text',
      body: [
        'The browser’s built-in btoa() only accepts characters with code points from 0 to 255. Feed it “café ☕” or any emoji and it throws “The string to be encoded contains characters outside of the Latin1 range”. Old workarounds such as btoa(unescape(encodeURIComponent(str))) happen to work but rely on deprecated functions.',
        'The correct approach is to convert the text to UTF-8 bytes first and then Base64-encode the bytes, which is exactly what this tool does. “café” encodes to Y2Fmw6k=, the same result you get from Python’s base64.b64encode("café".encode()), Node’s Buffer.from("café").toString("base64") or the base64 command on macOS and Linux.',
      ],
    },
    {
      heading: 'Standard Base64 vs URL-safe Base64 (base64url)',
      body: [
        'In standard Base64 the + and / characters have special meaning in URLs, and = is often read as a query-string separator. RFC 4648 section 5 therefore defines base64url, which uses - instead of + and _ instead of /, and usually drops the trailing =. JWTs, OAuth PKCE code challenges, WebAuthn and many cloud tokens use it.',
        'When decoding, this tool accepts both alphabets automatically, with or without padding, and ignores spaces and line breaks such as the 76-character lines in MIME email. Just paste the string as you found it.',
      ],
    },
    {
      heading: 'Command-line equivalents',
      body: [
        'On macOS and Linux, echo -n "hello" | base64 prints aGVsbG8=, and echo aGVsbG8= | base64 --decode (or -D on older macOS) reverses it. In PowerShell, use [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("hello")). Remember -n with echo: without it, a trailing newline is encoded too and you get aGVsbG8K instead.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is Base64 encryption?',
      a: 'No. Base64 only changes how data is written; anyone can reverse it in a second. Use real encryption to protect data, and a password hashing algorithm such as bcrypt or Argon2 to store passwords.',
    },
    {
      q: 'Why do I get garbled text when decoding?',
      a: 'Usually the original data was not UTF-8 text. It may be a binary file such as an image or PDF, or text in an older encoding like Windows-1252 or Shift_JIS. A truncated or partly copied string also fails to decode.',
    },
    {
      q: 'What does “not UTF-8 text” mean?',
      a: 'The Base64 decoded into bytes that are not valid text, typically an image, PDF or ZIP. The tool shows the first 64 bytes in hex so you can identify the file: ff d8 ff is a JPEG, 89 50 4e 47 is a PNG and 25 50 44 46 is a PDF.',
    },
    {
      q: 'Why does my Base64 end with = or ==?',
      a: 'That is padding. Base64 works in blocks of 3 bytes; if the last block has only 1 or 2 bytes, one or two = signs are added so the length is a multiple of 4. Many decoders, including this one, accept the string without them.',
    },
    {
      q: 'How do I convert an image to Base64?',
      a: 'Use the Image to Base64 tool on this site. It gives you a data: URI and the raw Base64 string, ready to paste into HTML or CSS.',
    },
    {
      q: 'Is my data uploaded?',
      a: 'No. Encoding and decoding run entirely in your browser, and nothing you type is sent to a server.',
    },
  ],
  related: ['image-to-base64', 'url-encoder', 'jwt-decoder', 'hash-generator', 'json-formatter'],
  priority: 65,
  updated: '2026-10-29',
});

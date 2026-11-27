import { defineTool } from '../types';

export default defineTool({
  slug: 'image-to-base64',
  name: 'Image to Base64 Converter',
  seoTitle: 'Image to Base64 Converter: Get a Data URI, CSS or HTML img Tag',
  description:
    'Convert PNG, JPG, SVG, WebP or GIF images to Base64 online. Get a data URI, raw Base64, a CSS background-image rule or an HTML img tag. Runs in your browser.',
  category: 'image',
  icon: 'FileCode',
  keywords: [
    'image to base64',
    'image to base64 converter',
    'convert image to base64',
    'png to base64',
    'jpg to base64',
    'svg to base64',
    'base64 image encoder',
    'image to data uri',
    'data uri generator',
    'base64 encode image online',
    'css background image base64',
    'img src base64',
  ],
  intro:
    'Turn an image into a Base64 string you can paste straight into HTML, CSS, JSON or an email template. Encoding happens in your browser, so the image is never uploaded.',
  howTo: [
    'Click the dashed box to choose an image, drop a file onto it, or press Ctrl/Cmd + V to paste a screenshot.',
    'Check the preview and the size note below it. Inlining works best for small icons under 10 KB.',
    'Under “Output format”, pick Data URI, Base64 only, CSS background or HTML img.',
    'Click “Copy result” and paste it into your code, or “Download .txt” to save it as a text file.',
  ],
  sections: [
    {
      heading: 'What are Base64 and data URIs?',
      body: [
        'Base64 is a way to write binary data as plain text using only 64 characters: A–Z, a–z, 0–9, + and /, with = as padding. Every 3 bytes become 4 characters, so the encoded text is about 33% larger than the original file. It is an encoding, not encryption: anyone can turn it back into the image.',
        'A data URI (RFC 2397) puts a short header in front of the Base64 text, such as data:image/png;base64,iVBOR…. Browsers treat it as a complete image, with no extra HTTP request, so you can use it anywhere an image URL is accepted: an img src, a CSS url(), an SVG href or a favicon link.',
      ],
    },
    {
      heading: 'When to inline images as Base64, and when not to',
      body: [
        'Good fits: a few tiny icons or a loading spinner in critical CSS, a single self-contained HTML file (an offline report, a prototype, a Jupyter or Markdown export), sending an image inside a JSON API request, and config files or test fixtures where attachments are awkward. As a rule of thumb, inline only files under about 10 KB.',
        'Poor fits: photos, hero images and anything reused across pages. Base64 makes your HTML or CSS heavier, delays first render because the browser must download the whole stylesheet first, and prevents the image from being cached on its own. Since HTTP/2 made extra requests cheap, a normal compressed image file with a long cache lifetime is usually faster.',
      ],
    },
    {
      heading: 'Which output format should you use?',
      body: [
        '“Data URI” is the complete string and the one most people need: paste it into an img src or a browser address bar. “Base64 only” drops the data: header, which is what most APIs expect (for example a JSON field named image or file) when the MIME type is sent separately. “CSS background” writes a ready-to-paste background-image declaration. “HTML img” builds a full tag with the file name as alt text and the real width and height, which prevents layout shift while the page loads.',
      ],
    },
    {
      heading: 'Base64 images in email',
      body: [
        'Many email clients, including Gmail and several versions of Outlook, strip or refuse to display data URI images, so they are a poor choice for newsletters. Email platforms such as Mailchimp host images for you; if you send mail from code, attach the image and reference it with a Content-ID (cid:) instead.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why is the Base64 output bigger than my image?',
      a: 'Base64 uses 4 characters to store every 3 bytes, so the text is about 33% larger. Gzip or Brotli compression on your server narrows the gap in transfer, but the inlined version is still bigger than the original file.',
    },
    {
      q: 'How do I use a Base64 image in HTML?',
      a: 'Put the full data URI in the src attribute: <img src="data:image/png;base64,…" alt="…">. Choose “HTML img” and the tool writes the whole tag for you, including width and height.',
    },
    {
      q: 'Can I convert SVG to Base64?',
      a: 'Yes. The output starts with data:image/svg+xml;base64,. Because SVG is already text, a URL-encoded (not Base64) SVG data URI is often shorter, but Base64 is the most compatible option.',
    },
    {
      q: 'What is the difference between “Data URI” and “Base64 only”?',
      a: 'The data URI includes the data:image/…;base64, prefix that browsers need. “Base64 only” is the bare encoded string, which APIs and databases usually want when the file type is stored in a separate field.',
    },
    {
      q: 'Is there a file size limit?',
      a: 'There is no hard limit, but files over a few megabytes produce millions of characters and can make text editors and web pages sluggish. Compress or resize the image first if it is large.',
    },
    {
      q: 'Are my images uploaded?',
      a: 'No. The browser’s built-in FileReader encodes the file on your device. Neither the image nor the Base64 text is sent over the network.',
    },
  ],
  related: ['base64', 'image-compressor', 'image-converter', 'image-resizer', 'url-encoder', 'html-entities'],
  priority: 55,
  updated: '2026-10-29',
});

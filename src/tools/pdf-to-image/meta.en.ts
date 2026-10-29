import { defineTool } from '../types';

export default defineTool({
  slug: 'pdf-to-image',
  name: 'PDF to JPG',
  seoTitle: 'PDF to JPG: Convert PDF Pages to JPG or PNG Images, Free',
  description:
    'Convert PDF to JPG or PNG online for free. Turn every page into an image at 72 to 300 DPI and download them one by one or as a ZIP. Nothing is uploaded.',
  category: 'pdf',
  icon: 'Images',
  keywords: [
    'pdf to jpg',
    'pdf to png',
    'pdf to image',
    'convert pdf to jpg',
    'pdf to jpg converter',
    'pdf to jpeg',
    'pdf to jpg free',
    'pdf to jpg high quality',
    'pdf to jpg 300 dpi',
    'save pdf as jpg',
    'pdf page to image',
    'pdf to picture',
    'pdf to jpg on iphone',
    'pdf to jpg without uploading',
  ],
  intro:
    'Turn every page of a PDF into a JPG or PNG image, ready to post, paste into slides or attach where PDFs aren’t accepted. Conversion happens on your device.',
  howTo: [
    'Click the dashed box to choose a PDF, or drag it in. Conversion starts right away.',
    'Pick JPG or PNG and a resolution. 150 DPI suits screens, 300 DPI suits printing. For JPG you can also set the quality.',
    'To convert only some pages, type a range such as 1-3, 5 in “Pages”; leave it empty for all pages.',
    'Click “Download all (ZIP)” for every image in one file, or download single pages from their cards.',
  ],
  sections: [
    {
      heading: 'JPG or PNG?',
      body: [
        'JPG produces much smaller files and is the right choice for scanned documents, photos and pages you’ll share by email, text or social media. A quality of 85 to 90 looks identical to most people at a fraction of the size.',
        'PNG is lossless, so text, lines and charts stay perfectly crisp, with no blurry edges around letters. Use it for slides, diagrams and screenshots you’ll edit further, and expect files several times larger than JPG.',
      ],
    },
    {
      heading: 'Which DPI should I use?',
      body: [
        'DPI (dots per inch) decides how many pixels each inch of the page becomes. A US Letter page (8.5 × 11 in) comes out at 612 × 792 pixels at 72 DPI, 1275 × 1650 at 150 DPI, 1700 × 2200 at 200 DPI and 2550 × 3300 at 300 DPI. An A4 page at 300 DPI is 2480 × 3507 pixels.',
        '150 DPI is plenty for reading on a phone or laptop and for most uploads. Choose 200 DPI when small print must stay readable after zooming, and 300 DPI for printing or OCR. Very large pages such as posters are scaled down automatically so they stay within the browser’s canvas limit.',
      ],
    },
    {
      heading: 'When converting PDF to images helps',
      body: [
        'Many forms, job sites and social networks accept only images. Converting a PDF lets you post a flyer on Instagram, drop a page into a Google Slides or PowerPoint deck, or send one page of a document in a chat without the other person needing a PDF viewer.',
        'It also works in reverse as a way to shrink a bloated scan: convert to JPG at 150 DPI, then turn the images back into a PDF with JPG to PDF. Text in the result is no longer selectable, so keep the original if you need to search or copy it.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is my PDF uploaded to a server?',
      a: 'No. Pages are rendered by PDF.js inside your browser and the images are created on your device. Nothing is sent anywhere.',
    },
    {
      q: 'How do I convert just one page of a PDF to JPG?',
      a: 'Type that page number in “Pages”, for example 4, and only that page is converted. You can also convert all pages and download just the card you need.',
    },
    {
      q: 'What DPI gives the best quality?',
      a: '300 DPI gives print quality. For screens and uploads, 150 DPI keeps files much smaller and still looks sharp.',
    },
    {
      q: 'Can I convert PDF to JPG on an iPhone?',
      a: 'Yes. Open this page in Safari, choose the PDF from Files and download the images. On iPhone, a single image can be saved to Photos by pressing and holding it.',
    },
    {
      q: 'Why does a password-protected PDF fail?',
      a: 'A PDF that needs a password to open can’t be rendered without it. Open it in your PDF reader, save an unprotected copy, then convert that copy.',
    },
    {
      q: 'Is the text in the images searchable?',
      a: 'No. Images are pictures of the page, so text can’t be selected or searched. Keep the original PDF for that, or run the images through OCR.',
    },
  ],
  related: ['image-to-pdf', 'pdf-split', 'pdf-merge', 'image-compressor', 'image-converter'],
  priority: 88,
  updated: '2026-10-29',
});

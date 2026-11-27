import { defineTool } from '../types';

export default defineTool({
  slug: 'pdf-split',
  name: 'Split PDF',
  seoTitle: 'Split PDF: Extract, Delete or Separate PDF Pages Online for Free',
  description:
    'Split a PDF online for free: extract pages, delete pages, save every page as a file or split every N pages. Thumbnails and page rotation included. No uploads.',
  category: 'pdf',
  icon: 'Scissors',
  keywords: [
    'split pdf',
    'pdf splitter',
    'extract pages from pdf',
    'delete pages from pdf',
    'remove pages from pdf',
    'separate pdf pages',
    'split pdf into separate files',
    'split pdf free',
    'split pdf online',
    'save one page of a pdf',
    'split pdf every page',
    'cut pdf pages',
    'rotate pdf page',
    'split pdf without uploading',
  ],
  intro:
    'Pull out the pages you need, drop the ones you don’t, or break a PDF into several files. Every page is shown as a thumbnail and nothing is uploaded.',
  howTo: [
    'Click the dashed box to choose a PDF, or drag it in. A thumbnail of every page appears.',
    'Pick a split method: “Extract selected pages”, “Delete selected pages”, “Every page as a file” or “Split every N pages”.',
    'For extract and delete, click thumbnails or type ranges such as 1-3, 5, 8-10 in “Pages”. Use the arrow on a thumbnail to rotate a page.',
    'Click the download button. A single result downloads as a PDF; several results come as one ZIP.',
  ],
  sections: [
    {
      heading: 'Four ways to split a PDF',
      body: [
        'Extract selected pages makes a new PDF with just the pages you pick, for example pages 3 to 5 of a lease or the signature page of a contract. Delete selected pages does the opposite and keeps everything except the pages you mark, which is handy for removing blank scanned pages or an ad insert.',
        'Every page as a file creates one PDF per page, named like report-p01.pdf, report-p02.pdf. Split every N pages cuts the document into equal chunks: set N to 2 for a stack of two-sided forms, or 10 to send a long manual in parts. Multiple files are packed into a single ZIP download.',
      ],
    },
    {
      heading: 'How to type page ranges',
      body: [
        'Separate pages with commas and use a hyphen for a range: “1-3, 5, 8-10” selects pages 1, 2, 3, 5, 8, 9 and 10. An open range like “8-” runs to the last page, and “-3” starts at page 1. Pages you type and pages you click stay in sync, and Shift-click selects a run of pages.',
        'The All, Odd pages, Even pages and Invert buttons help with scans from a single-sided scanner: if the fronts and backs ended up in one file, select the odd pages to get the fronts and the even pages to get the backs.',
      ],
    },
    {
      heading: 'Private by design',
      body: [
        'The PDF is opened with PDF.js (the viewer built into Firefox) to draw thumbnails, and new files are written with pdf-lib, both running inside your browser. Your file is never uploaded, so it is fine for tax documents, medical records or anything under an NDA.',
        'Pages are copied, not re-rendered, so text stays sharp and searchable and file sizes stay small. Links and form fields on the copied pages are kept where possible, but bookmarks are not, and digital signatures will no longer validate in the new file.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I save just one page of a PDF?',
      a: 'Choose “Extract selected pages”, click the page’s thumbnail (or type its number) and click “Extract and download”. You get a one-page PDF.',
    },
    {
      q: 'How do I delete pages from a PDF for free?',
      a: 'Choose “Delete selected pages”, select the pages you want to remove and download. The new file has every other page in its original order.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. All splitting happens in your browser and the file never leaves your device.',
    },
    {
      q: 'Can I split a password-protected PDF?',
      a: 'Not directly. If it needs a password to open, open it in your PDF reader with the password and save an unprotected copy, or print it to “Save as PDF”, then split that copy.',
    },
    {
      q: 'Does splitting reduce quality?',
      a: 'No. Pages are copied as they are, without recompressing images, so the output looks exactly like the original.',
    },
    {
      q: 'Can I rotate pages while splitting?',
      a: 'Yes. Click the arrow at the bottom right of any thumbnail to turn that page 90° clockwise, or use “Rotate all 90° right”. Rotation is applied to the files you download.',
    },
  ],
  related: ['pdf-merge', 'pdf-to-image', 'image-to-pdf', 'image-compressor'],
  priority: 86,
  updated: '2026-10-29',
});

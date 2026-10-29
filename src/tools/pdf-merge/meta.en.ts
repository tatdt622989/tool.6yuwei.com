import { defineTool } from '../types';

export default defineTool({
  slug: 'pdf-merge',
  name: 'Merge PDF',
  seoTitle: 'Merge PDF: Combine PDF Files Into One, Free and Without Uploading',
  description:
    'Merge PDF files online for free. Combine several PDFs into one and drag to set the order. Runs in your browser, so files are never uploaded. No sign-up.',
  category: 'pdf',
  icon: 'Merge',
  keywords: [
    'merge pdf',
    'combine pdf',
    'merge pdf files',
    'combine pdf files into one',
    'pdf merger',
    'merge pdf free',
    'merge pdf online',
    'join pdf files',
    'combine pdfs',
    'merge pdf without uploading',
    'merge pdf on iphone',
    'merge pdf no watermark',
    'how to combine pdf files',
  ],
  intro:
    'Combine several PDFs into a single file in the order you choose. Everything runs on your device, so your documents are never uploaded to a server.',
  howTo: [
    'Click the dashed box to choose your PDFs, or drag them in. You can pick several at once and add more later.',
    'The list shows each file’s page count and size. Drag the handle on the left or use the up and down arrows to set the order; files are combined from top to bottom.',
    'Change the file name if you like, then click “Merge and download”.',
    'Password-protected PDFs are flagged and skipped, and the rest are merged as usual.',
  ],
  sections: [
    {
      heading: 'Merge PDFs without uploading them',
      body: [
        'Most online PDF tools upload your files to their servers, process them there and send the result back. Many also cap the number of files, add a daily limit or ask you to create an account. For leases, tax returns, pay stubs or a scan of your driver’s license, it is hard to know how long a copy stays on someone else’s server.',
        'This tool uses the open-source pdf-lib library to read and reassemble the pages inside your browser. The files never leave your computer or phone, and once the page has loaded it keeps working even if you go offline. Because nothing is transferred, merging large files is usually faster than uploading and downloading them.',
      ],
    },
    {
      heading: 'What the merged PDF keeps',
      body: [
        'Pages are copied as they are: text stays selectable and searchable, and images are not recompressed, so quality does not drop and the output is roughly the sum of the input sizes. Pages of different sizes can be mixed, for example Letter documents and landscape slides, and each keeps its own size and orientation.',
        'Bookmarks (the outline) from the original files are not carried over. Fillable form fields still show but may no longer be editable, and digital signatures become invalid because the file content has changed. If a signature has to stay valid, send the original signed file separately.',
      ],
    },
    {
      heading: 'Common uses',
      body: [
        'Job portals, college and scholarship applications, insurance claims and many government websites accept only one PDF per upload. Save your résumé, cover letter, transcripts and certificates as PDFs, then merge them in the required order. For expense reports, combining all receipts into a single file makes it easy for finance to check nothing is missing.',
        'If the merged file is over an upload limit, it usually contains high-resolution scans. Convert those pages with PDF to JPG at a lower resolution and rebuild them with JPG to PDF, or use Split PDF to remove pages you don’t need. Photos taken with your phone can be turned into a PDF with JPG to PDF first and then merged.',
      ],
    },
    {
      heading: 'Why some PDFs can’t be merged',
      body: [
        'A PDF can have two kinds of password: an open password (you can’t view it without one) and a permissions password (you can view it, but printing, copying or editing is restricted). Either way the file is encrypted, and the pages have to be decrypted before they can be recombined. This tool never asks for or handles your password, so it flags the file and skips it.',
        'To fix it, open the file in your usual reader (entering the password if needed), choose Print and select “Save as PDF” on a Mac or “Microsoft Print to PDF” on Windows. Add the new, unencrypted copy instead. If a file shows “can’t be read”, the download may be incomplete or the file may not really be a PDF despite its .pdf extension.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are my PDFs uploaded anywhere?',
      a: 'No. Merging happens entirely in your browser and the files are never sent to a server, so it is safe for contracts, medical records and ID scans.',
    },
    {
      q: 'How many PDFs can I merge at once?',
      a: 'There is no limit on the number of files or merges, and no sign-up. The practical limit is your device’s memory: a typical computer handles hundreds of pages easily. On a phone, merge in batches if the files add up to several hundred MB.',
    },
    {
      q: 'Can I merge PDFs on an iPhone or Android phone?',
      a: 'Yes. Open this page in Safari or Chrome, tap the box and choose PDFs from Files or your downloads. Press and drag the handle to reorder, or use the arrow buttons.',
    },
    {
      q: 'Does merging reduce quality or add a watermark?',
      a: 'No. Pages are copied directly without recompressing images, and no watermark is added.',
    },
    {
      q: 'Can I merge only certain pages?',
      a: 'Yes, in two steps: use Split PDF to extract the pages you need from each file, then merge the extracted files here.',
    },
    {
      q: 'How do I merge PDFs on a Mac without software?',
      a: 'Preview can do it by dragging thumbnails between documents, but it is fiddly with many files. This page works the same on Mac, Windows, Chromebook and phones, and the files still stay on your device.',
    },
  ],
  related: ['pdf-split', 'image-to-pdf', 'pdf-to-image', 'image-compressor'],
  priority: 92,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'markdown-preview',
  name: 'Markdown Preview',
  seoTitle: 'Markdown Preview: Online Markdown Editor with Live HTML Output',
  description:
    'Free online Markdown editor with live preview. Supports GitHub Flavored Markdown tables, task lists and code blocks. Copy the HTML or download .md or .html.',
  category: 'dev',
  icon: 'FileText',
  keywords: [
    'markdown preview',
    'markdown editor',
    'online markdown editor',
    'markdown viewer',
    'markdown to html',
    'markdown live preview',
    'github markdown preview',
    'readme preview',
    'markdown table',
    'gfm preview',
    'convert markdown to html',
    'md file viewer',
  ],
  intro:
    'Write Markdown on the left and see it rendered on the right as you type. Supports GitHub Flavored Markdown, and lets you copy the HTML or download the result as a file.',
  howTo: [
    'Type or paste Markdown into the editor. On a phone, switch between “Edit” and “Preview” with the toggle at the top.',
    'Tick “Treat single line breaks as <br>” if you want every new line to break, as in GitHub comments.',
    'Use “Copy HTML” to paste the rendered HTML into a CMS or email, or “Download .md” / “Download .html” to save a file.',
    'Your draft is saved in this browser automatically. “Load example” shows a sample of every common element.',
  ],
  sections: [
    {
      heading: 'Markdown syntax cheat sheet',
      body: [
        'Headings start with # (one per level, up to ######). Wrap text in **double asterisks** for bold, *single asterisks* for italic and ~~tildes~~ for strikethrough. Links are [text](https://example.com) and images are ![alt text](image.png).',
        'Start a line with - or * for a bullet list and 1. for a numbered list; indent by two spaces to nest. Use > for a blockquote, single backticks for `inline code` and three backticks on their own lines for a code block. Add a language name after the opening backticks, such as ```js, to label the code.',
      ],
    },
    {
      heading: 'GitHub Flavored Markdown (GFM)',
      body: [
        'This editor uses GitHub Flavored Markdown, the dialect used on GitHub, GitLab and in many documentation tools. On top of standard Markdown, it adds tables, task lists (- [ ] and - [x]), strikethrough and automatic links for bare URLs.',
        'A table is a header row, a separator row of dashes and then data rows, with cells divided by |. Put a colon in the separator to align a column: :--- for left, :---: for center and ---: for right, which is handy for prices and numbers.',
      ],
    },
    {
      heading: 'Line breaks: the most common surprise',
      body: [
        'In standard Markdown, a single line break inside a paragraph is treated as a space, so lines you wrote separately run together in the preview. To start a new paragraph, leave a blank line. To force a line break without a new paragraph, end the line with two spaces or a backslash.',
        'GitHub issues and comments, Slack and many chat apps break on every new line instead. Tick “Treat single line breaks as <br>” to preview that behavior. README files on GitHub follow the standard rule, so leave it off when writing a README.',
      ],
    },
    {
      heading: 'Is the HTML output safe?',
      body: [
        'Markdown allows raw HTML, which could include scripts. Before showing the preview, this tool runs the output through DOMPurify, which strips scripts, event handlers and other dangerous markup. The HTML you copy or download is the same sanitized version.',
        'Everything runs in your browser: your text is never uploaded. The downloaded .html file is a complete page with simple styles that adapt to light and dark mode, ready to open, print or attach to an email.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why do my lines run together in the preview?',
      a: 'Markdown joins lines in the same paragraph. Leave a blank line between paragraphs, end a line with two spaces to force a break, or tick “Treat single line breaks as <br>”.',
    },
    {
      q: 'Can I preview a GitHub README here?',
      a: 'Yes. Paste the contents of README.md. Tables, task lists, code blocks and other GitHub Flavored Markdown features render as on GitHub, although GitHub-specific extras such as Mermaid diagrams, alerts and emoji shortcodes are not supported.',
    },
    {
      q: 'How do I make a table in Markdown?',
      a: 'Write a header row like | Name | Price |, then a separator row | --- | ---: |, then one row per line. The colon on the right side of ---: right-aligns that column. Click “Load example” to see a working table.',
    },
    {
      q: 'Does my draft get saved?',
      a: 'Yes, in this browser only. The editor saves your text locally as you type and restores it next time you open the page. Clearing your browser data, or clicking “Clear”, removes it.',
    },
    {
      q: 'How do I convert Markdown to HTML?',
      a: 'Paste your Markdown and click “Copy HTML” to copy the rendered markup, or “Download .html” to get a complete web page you can open in any browser.',
    },
    {
      q: 'Is my text uploaded?',
      a: 'No. Rendering happens entirely in your browser, and nothing you type is sent to a server.',
    },
  ],
  related: ['html-entities', 'word-counter', 'json-formatter', 'text-diff'],
  priority: 45,
  updated: '2026-10-29',
});

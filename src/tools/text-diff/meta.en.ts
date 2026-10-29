import { defineTool } from '../types';

export default defineTool({
  slug: 'text-diff',
  name: 'Diff Checker',
  seoTitle: 'Diff Checker: Compare Two Texts and Highlight Differences Online',
  description:
    'Free online diff checker. Paste two versions of a text to compare them line by line with changed words highlighted. Side-by-side or unified view, fully private.',
  category: 'text',
  icon: 'Diff',
  keywords: [
    'diff checker',
    'text compare',
    'compare text',
    'compare two texts',
    'text diff',
    'online diff tool',
    'find differences between two texts',
    'compare documents online',
    'diff tool side by side',
    'compare two lists',
    'compare code online',
    'text comparison tool',
    'what changed between two versions',
    'word diff',
  ],
  intro:
    'Paste the original and the edited text to see exactly which lines were added, removed or changed, with the changed words highlighted inside each line.',
  howTo: [
    'Paste the old version into “Original text” and the new version into “Changed text”.',
    'Differences appear below automatically: red for removed, green for added, and a darker highlight for the exact words that changed.',
    'Tick “Ignore whitespace” or “Ignore case” if needed, and choose “Word” or “Character” under “Highlight changes by”.',
    'Switch between “Side by side” and “Unified” under “View”. For long texts keep “Hide unchanged lines” on to see only the edited parts.',
  ],
  sections: [
    {
      heading: 'How the comparison works',
      body: [
        'The checker uses the Myers diff algorithm, published by Eugene Myers in 1986 and used by Git by default. It finds the smallest set of added and removed lines that turns the original into the new version, so inserting one line near the top doesn’t make everything below it look different.',
        'An edited line counts as one removed line plus one added line, just like in git diff. To make edits easy to read, the old and new lines are paired in the same row and compared a second time, so only the words or characters that actually changed are highlighted.',
      ],
    },
    {
      heading: 'Word or character highlighting?',
      body: [
        'Word mode compares whole words and is the most readable choice for essays, contracts, press releases and legal redlines. Character mode compares letter by letter and catches a single changed character, such as color vs. colour, a mistyped URL, a serial number or an API key.',
        'When a line has been completely rewritten, inline highlights become noisy. Set the highlighting to Off and rely on the red and green line colors instead. Hide unchanged lines keeps three lines of context around each change and folds the rest, which makes long documents much easier to scan.',
      ],
    },
    {
      heading: 'When to ignore whitespace and case',
      body: [
        'Text copied from Word, Google Docs, PDFs or web pages often picks up extra spaces, tabs and trailing whitespace. Ignore whitespace trims each line and treats runs of spaces as one, so only real content changes are shown.',
        'Ignore case is useful for URLs, email addresses, host names and SQL keywords. Leave both options off when comparing code: indentation matters in Python and YAML, and most languages treat userId and userID as different names.',
      ],
    },
    {
      heading: 'Private by design',
      body: [
        'Contracts, quotes, reports and source code often contain confidential details that shouldn’t be pasted into a site that uploads them. This diff checker runs entirely in your browser: nothing you paste is sent to a server or stored, and closing the tab clears it. Comparing a few thousand lines usually takes well under a second.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I compare two documents for differences?',
      a: 'Copy the text of each document and paste them into “Original text” and “Changed text”. The tool compares them line by line, marking removed lines in red, added lines in green and the exact changed words inside each line.',
    },
    {
      q: 'Can I compare Word or PDF files directly?',
      a: 'Not as files. Copy the text out and paste it in. Text copied from PDFs often has extra line breaks and spaces, so tick “Ignore whitespace” to reduce noise.',
    },
    {
      q: 'Why does changing one word count as one line added and one removed?',
      a: 'A line-based diff treats an edited line as the old line removed and the new line added, the same way Git counts changes. The words that actually changed are highlighted within the line.',
    },
    {
      q: 'Can I compare two lists to find missing items?',
      a: 'Yes. Paste one list on each side. Lines only in the original show as removed and lines only in the new list show as added. Sort both lists first with the Sort Lines tool if their order differs.',
    },
    {
      q: 'Is my text uploaded anywhere?',
      a: 'No. The comparison runs in your browser and your text never leaves your device, so it’s safe for contracts, client data and source code.',
    },
    {
      q: 'Does it work on a phone?',
      a: 'Yes. On small screens it defaults to the unified view, with removed lines above added ones. You can switch to side by side and scroll horizontally.',
    },
  ],
  related: ['word-counter', 'line-tools', 'case-converter', 'json-formatter', 'regex-tester', 'markdown-preview'],
  priority: 60,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'line-tools',
  name: 'Sort Lines & Remove Duplicates',
  seoTitle: 'Sort Lines & Remove Duplicate Lines Online: Free List Cleaner',
  description:
    'Sort lines alphabetically or naturally, remove duplicate and empty lines, trim spaces, and add prefixes, suffixes or line numbers. Free and runs in your browser.',
  category: 'text',
  icon: 'ListOrdered',
  keywords: [
    'sort lines',
    'sort lines alphabetically',
    'remove duplicate lines',
    'delete duplicate lines',
    'remove empty lines',
    'remove blank lines',
    'alphabetize list',
    'alphabetical order tool',
    'dedupe list online',
    'natural sort',
    'shuffle lines',
    'reverse lines',
    'add prefix to each line',
    'add line numbers',
    'list cleaner',
  ],
  intro:
    'Paste any one-item-per-line list to alphabetize it, remove duplicates and blank lines, or add quotes, bullets and numbers to every line. Every step can be undone.',
  howTo: [
    'Paste your list, keywords or emails into “Your list (one item per line)”.',
    'Click an action under “Sort” or “Clean up”, such as “A → Z” or “Remove duplicates”. The result replaces the text in place.',
    'To wrap every line, fill in “Add prefix / suffix” and click “Add”. To number lines, pick a format under “Number lines” and click “Add numbers”.',
    'The message shows the line count before and after. Click “Undo” if needed, then “Copy result”.',
  ],
  sections: [
    {
      heading: 'Alphabetical vs. natural sort',
      body: [
        'A plain alphabetical sort compares text character by character, so “Chapter 10” lands before “Chapter 2” and img10.jpg before img2.jpg. Natural sort reads runs of digits as numbers and gives the order a person expects: 1, 2, 10. Use it for file names, chapter lists, version numbers and anything with numbering.',
        'Sorting ignores case by default and follows English dictionary rules, so “apple”, “Banana” and “cherry” sort together and accented letters such as é sit next to e. Tick “Case sensitive” to put capitals first among otherwise identical words. “By length” orders lines from shortest to longest, which helps you spot titles or meta descriptions that are too long.',
      ],
    },
    {
      heading: 'How duplicates are removed',
      body: [
        'Remove duplicates keeps the first occurrence of each line and deletes later copies, so your original order stays intact. Leading and trailing spaces are ignored when comparing, and “Apple” and “apple” count as the same line unless “Case sensitive” is ticked. The Duplicates counter updates as you type, so you can see at a glance whether a list is clean.',
        'A reliable cleanup sequence for messy exports from Excel, Google Sheets or a CRM is: Trim spaces, Remove empty lines, Remove duplicates, then sort. It is a quick way to dedupe an email list or merge keyword lists from several sources.',
      ],
    },
    {
      heading: 'Prefixes, suffixes and numbering',
      body: [
        'A prefix of " and a suffix of ", turns a column of names into a list you can paste into JSON, JavaScript or a SQL IN (…) clause. A prefix of “- ” makes a Markdown bullet list, and “#” followed by a space makes hashtags. Empty lines are left untouched, and numbering skips them, so the numbers stay continuous.',
        'Numbering supports 1., 1) and tab-separated formats, any starting number and optional leading zeros (01, 02 … 12), which keeps numbered file names and spreadsheet IDs sorting correctly.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I remove duplicate lines from a list?',
      a: 'Paste the list and click “Remove duplicates”. Each line is kept once, at its first position, and the message shows how many lines you had before and after.',
    },
    {
      q: 'How do I put a list in alphabetical order?',
      a: 'Paste it and click “A → Z”, or “Z → A” for reverse order. If the lines contain numbers, use “Natural (1, 2, 10)” so 10 comes after 9.',
    },
    {
      q: 'Why does 10 come before 2 when I sort?',
      a: 'A standard alphabetical sort compares the character “1” with “2”, so 10 comes first. Natural sort compares the whole number instead.',
    },
    {
      q: 'Can I undo a change?',
      a: 'Yes. The tool saves the text before every action, and “Undo” steps back through up to 50 changes.',
    },
    {
      q: 'Is there a limit on the number of lines?',
      a: 'There is no fixed limit. Lists of tens of thousands of lines are processed instantly on a typical computer, and nothing is uploaded.',
    },
    {
      q: 'Can I randomize the order of a list?',
      a: 'Yes. “Shuffle” uses a Fisher–Yates shuffle so every order is equally likely, which is handy for drawing names or randomizing quiz questions.',
    },
  ],
  related: ['text-diff', 'word-counter', 'case-converter', 'random-picker', 'json-formatter', 'regex-tester'],
  priority: 45,
  updated: '2026-10-29',
});

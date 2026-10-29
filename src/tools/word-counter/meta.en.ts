import { defineTool } from '../types';

export default defineTool({
  slug: 'word-counter',
  name: 'Word Counter',
  seoTitle: 'Word Counter: Count Words, Characters & Reading Time Online',
  description:
    'Free online word counter. Paste your text to instantly count words, characters with and without spaces, sentences, paragraphs, and reading and speaking time.',
  category: 'text',
  icon: 'Type',
  keywords: [
    'word counter',
    'word count',
    'character counter',
    'character count',
    'count words online',
    'essay word counter',
    'words to minutes',
    'reading time calculator',
  ],
  intro:
    'Paste or type your text to see the word count, character count, sentences and paragraphs update as you write, plus how long it takes to read or say out loud.',
  howTo: [
    'Paste your text into the box above, or start typing.',
    'The word count appears at the top; characters, sentences, paragraphs and lines are listed below.',
    'Check the reading and speaking time if you are preparing a blog post, speech or presentation.',
    'Use “Copy text” to take your text with you, or “Clear” to start over.',
  ],
  sections: [
    {
      heading: 'How words and characters are counted',
      body: [
        'A word is any run of letters or digits separated by spaces or punctuation. Hyphenated words such as “well-known” and contractions such as “don’t” count as one word, and so do numbers like 2026 or 3.14. Dashes, slashes and emoji on their own are not counted as words.',
        'The character count includes everything you can see plus spaces and line breaks, which is the figure most character limits refer to. “Characters (no spaces)” leaves out spaces, tabs and line breaks. Emoji made of several Unicode code points, such as a thumbs-up with a skin tone, still count as a single character.',
      ],
    },
    {
      heading: 'Common word and character limits',
      body: [
        'The Common App personal statement allows up to 650 words, and many scholarship and college supplement essays ask for 250 to 500. A typical high school essay runs 300 to 1,000 words, while a college term paper is often 2,000 to 5,000.',
        'Online, a post on X (formerly Twitter) is limited to 280 characters for standard accounts, an Instagram caption to 2,200 characters, and a LinkedIn post to 3,000. Search engines usually show around 150 to 160 characters of a meta description, so checking the character count before you publish avoids text being cut off.',
      ],
    },
    {
      heading: 'Reading time and speaking time',
      body: [
        'Reading time is based on 238 words per minute, the average silent reading speed for adults reading non-fiction found in a 2019 review of 190 studies. Many blogs show this figure as “X min read”.',
        'Speaking time assumes 130 words per minute, a comfortable pace for presentations and speeches. That means a 5-minute talk is roughly 650 words and a 10-minute speech about 1,300. If you speak quickly or slowly, adjust from there.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is my text saved or uploaded anywhere?',
      a: 'No. The counting happens entirely in your browser. Your text is never sent to a server, so it is safe to paste drafts, essays or confidential documents.',
    },
    {
      q: 'Why is my count different from Microsoft Word or Google Docs?',
      a: 'Editors treat a few edge cases differently, such as words joined by an em dash, URLs, and standalone symbols. Differences are usually just a word or two in a long document.',
    },
    {
      q: 'How many pages is 1,000 words?',
      a: 'About 2 pages single-spaced or 4 pages double-spaced, using a 12-point font such as Times New Roman with 1-inch margins.',
    },
    {
      q: 'Are numbers counted as words?',
      a: 'Yes. Numbers such as 42, 2026 or 3.5 each count as one word, which matches how most word processors and school word limits count them.',
    },
    {
      q: 'Does it work with other languages?',
      a: 'Yes. Words in any language that uses spaces are counted normally. For Chinese and Japanese, which do not separate words with spaces, the character count is the more useful number.',
    },
  ],
  related: ['password-generator', 'case-converter', 'text-diff', 'line-tools'],
  priority: 100,
  updated: '2026-10-29',
});

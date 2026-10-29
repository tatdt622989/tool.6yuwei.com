import { defineTool } from '../types';

export default defineTool({
  slug: 'regex-tester',
  name: 'Regex Tester',
  seoTitle: 'Regex Tester: Test JavaScript Regular Expressions Online',
  description:
    'Free online regex tester. Highlight matches as you type, inspect capture and named groups, preview replacements, and look up syntax in the built-in cheat sheet.',
  category: 'dev',
  icon: 'Regex',
  keywords: [
    'regex tester',
    'regex test',
    'online regex tester',
    'javascript regex tester',
    'regular expression tester',
    'regex checker',
    'regex match',
    'regex replace',
    'regex cheat sheet',
    'test regex online',
    'regex named groups',
    'regex lookahead',
    'regexp tester',
  ],
  intro:
    'Type a pattern and some text to see every match highlighted, what each capture group grabbed, and what a replacement would produce. Runs on the JavaScript regex engine in your browser.',
  howTo: [
    'Enter a pattern in “Regular expression” without the surrounding slashes, for example \\d{4}-\\d{2}-\\d{2}.',
    'Tick the flags you need: g global, i ignore case, m multiline, s dotAll, u Unicode, y sticky.',
    'Paste your text into “Test string”. Matches are highlighted under “Matches”, and the “Match list” shows each index and its groups.',
    'To try a substitution, type $1, $<name> and so on into “Replace with” and check the replacement preview.',
  ],
  sections: [
    {
      heading: 'What each flag does',
      body: [
        'g (global) finds every match instead of stopping at the first. i makes matching case-insensitive. m (multiline) makes ^ and $ match at the start and end of every line, not just the whole input. s (dotAll) lets the dot match line breaks.',
        'u (unicode) treats the text as Unicode code points, so an emoji counts as one character and property escapes such as \\p{L} or \\p{Script=Greek} become available. y (sticky) only matches at the current lastIndex position, which is handy when writing a tokenizer.',
      ],
    },
    {
      heading: 'Patterns for everyday formats',
      body: [
        'US ZIP codes: ^\\d{5}(-\\d{4})?$ accepts 90210 and 90210-1234. US phone numbers in common formats: ^\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}$ accepts (555) 010-4477, 555.010.4477 and 5550104477. ISO dates: ^\\d{4}-\\d{2}-\\d{2}$, which checks the shape but not whether month 13 exists.',
        'Email addresses are notoriously hard to validate with a regex. A practical check is ^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$, followed by a confirmation email. For prices, (?<=\\$)\\d+(\\.\\d{2})? captures the amount after a dollar sign using a lookbehind.',
      ],
    },
    {
      heading: 'JavaScript regex vs Python, PCRE and others',
      body: [
        'This tester uses the ECMAScript engine built into your browser, the same one Node.js, Deno and TypeScript code run on. Most everyday syntax is shared with Python’s re module, PHP’s PCRE, Java and .NET, but there are differences: Python writes named groups as (?P<name>…), JavaScript as (?<name>…); PCRE supports possessive quantifiers, atomic groups and recursion, which JavaScript does not.',
        'In code, remember that backslashes inside a string literal need escaping: new RegExp("\\\\d+") equals /\\d+/. When you type into this page, write a single backslash.',
      ],
    },
    {
      heading: 'Catastrophic backtracking and ReDoS',
      body: [
        'Nested repetition such as (a+)+$ or (\\w+\\s?)*$ can make the engine try an exponential number of paths when the input almost matches but fails at the end. That can freeze a page for minutes and is the basis of regular expression denial-of-service (ReDoS) attacks.',
        'Here, matching runs in a background worker and is stopped after 1.5 seconds, and at most 1,000 matches are collected. To fix a slow pattern, remove nested quantifiers, make adjacent parts unable to match the same characters, and be specific: [^"]* instead of .* inside quotes.',
      ],
    },
  ],
  faq: [
    {
      q: 'Which regex flavor does this tester use?',
      a: 'JavaScript (ECMAScript), as implemented by your browser. Patterns that work here will work the same way in JavaScript, TypeScript and Node.js. Python, PHP and Java share most of the syntax but differ in details like named group syntax and possessive quantifiers.',
    },
    {
      q: 'Do I need to type the slashes around the pattern?',
      a: 'No. Type only the pattern itself and choose flags with the checkboxes. The slashes and flags are shown beside the input so you can copy the literal form /pattern/flags.',
    },
    {
      q: 'What is the difference between greedy and lazy matching?',
      a: 'Quantifiers are greedy by default and match as much as possible. Add ? to make them lazy so they match as little as possible. On the text <a><b>, the pattern <.+> matches the whole string, while <.+?> matches <a> and <b> separately.',
    },
    {
      q: 'Why doesn’t \\w match letters like é or ñ?',
      a: 'In JavaScript, \\w only covers A–Z, a–z, 0–9 and the underscore. To match letters from any language, turn on the u flag and use \\p{L}, or \\p{L}+ for whole words.',
    },
    {
      q: 'How do I reference a capture group in the replacement?',
      a: 'Use $1, $2 and so on for numbered groups, $<name> for named groups, and $& for the whole match. To insert a literal dollar sign, write $$.',
    },
    {
      q: 'Is my text uploaded anywhere?',
      a: 'No. Matching happens entirely in your browser. The last pattern and text are remembered on this device so you can pick up where you left off; click “Clear” to remove them.',
    },
  ],
  related: ['text-diff', 'json-formatter', 'html-entities', 'url-encoder'],
  priority: 55,
  updated: '2026-10-29',
});

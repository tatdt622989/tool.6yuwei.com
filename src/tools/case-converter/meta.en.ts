import { defineTool } from '../types';

export default defineTool({
  slug: 'case-converter',
  name: 'Case Converter',
  seoTitle: 'Case Converter: Title Case, Sentence Case, UPPER & lower Case',
  description:
    'Free online case converter. Change text to Title Case (AP style), Sentence case, UPPERCASE or lowercase, or to camelCase and snake_case as you type.',
  category: 'text',
  icon: 'CaseSensitive',
  keywords: [
    'case converter',
    'title case converter',
    'sentence case converter',
    'convert to title case',
    'uppercase to lowercase',
    'lowercase to uppercase',
    'capitalize words',
    'capitalize first letter',
    'all caps converter',
    'ap title case',
    'headline capitalization',
    'camelcase converter',
    'snake case converter',
    'kebab case converter',
    'toggle case',
  ],
  intro:
    'Paste any text and switch it to Title Case, Sentence case, ALL CAPS or lowercase in one click, or turn phrases into camelCase, snake_case and other programming names.',
  howTo: [
    'Type or paste your text into “Your text”.',
    'Under “Convert to”, pick a style such as Title Case or Sentence case.',
    'The “Result” box updates instantly. Click “Copy result” to paste it anywhere.',
    'To chain conversions, click “Use result as input” and pick another style.',
  ],
  sections: [
    {
      heading: 'How title case works here',
      body: [
        'Title Case follows the AP Stylebook rule for headlines: capitalize every word of four letters or more, and keep articles (a, an, the), coordinating conjunctions (and, but, or, nor, for, so, yet) and short prepositions (at, by, in, of, on, to, up, via) lowercase. The first and last words are always capitalized, and so is the first word after a colon, so “how to use an iPhone with NASA data: a beginner’s guide” becomes “How to Use an iPhone With NASA Data: A Beginner’s Guide”.',
        'The Chicago Manual of Style differs mainly on longer prepositions: Chicago lowercases every preposition regardless of length, so it writes “Gone with the Wind” where AP writes “Gone With the Wind”. If your publication follows Chicago or APA, lowercase words like with, from, into and over by hand after converting.',
      ],
    },
    {
      heading: 'Title case vs. sentence case',
      body: [
        'Sentence case capitalizes only the first word of each sentence, proper nouns you already typed and the pronoun I. It is the default for headings in the Google and Microsoft style guides, for UI buttons and for most body text, because it reads faster and avoids debates over which small words to capitalize.',
        'Use Title Case for book, film and song titles, newspaper headlines and formal presentations. Use Sentence case for blog headings, email subject lines, product interfaces and anywhere you want a friendlier, less formal tone.',
      ],
    },
    {
      heading: 'Fixing text typed with Caps Lock on',
      body: [
        'Pasted something IN ALL CAPS? Choose Sentence case or Title Case and the converter lowercases everything first, then capitalizes the right letters. When the text is mostly lowercase, deliberate capitals are kept: acronyms such as NASA, HTML or FBI and brand names with inner capitals like iPhone, JavaScript or McDonald stay as they are. tOGGLE cASE flips every letter, which undoes text typed with Caps Lock accidentally on.',
      ],
    },
    {
      heading: 'camelCase, snake_case and other naming conventions',
      body: [
        'Developers can convert labels and column names into identifiers. camelCase (userName) is standard for JavaScript and Java variables, PascalCase (UserName) for classes and React components, snake_case (user_name) for Python and SQL columns, kebab-case (user-name) for URLs, CSS classes and file names, and CONSTANT_CASE (USER_NAME) for constants and environment variables.',
        'The converter detects existing boundaries, so XMLHttpRequest splits into XML, Http and Request before becoming xml_http_request. Multi-line input is converted line by line, which is handy for a whole list of field names. Everything runs in your browser and nothing you paste is uploaded.',
      ],
    },
  ],
  faq: [
    {
      q: 'Which words are not capitalized in title case?',
      a: 'In AP style: articles (a, an, the), coordinating conjunctions (and, but, or, nor, for, so, yet) and prepositions of three letters or fewer (at, by, in, of, on, to, up). They are still capitalized when they are the first or last word, or follow a colon.',
    },
    {
      q: 'Is this AP or Chicago title case?',
      a: 'It follows AP, which capitalizes prepositions of four or more letters (With, From, Into). Chicago and APA lowercase all prepositions, so adjust those words by hand if your style guide requires it.',
    },
    {
      q: 'How do I change all caps to normal text?',
      a: 'Paste the text and choose Sentence case. Everything is lowercased and only the first letter of each sentence, plus the word I, is capitalized. Acronyms in mostly lowercase text are kept.',
    },
    {
      q: 'Can I capitalize the first letter of every word?',
      a: 'Title Case does that for all words except short articles, conjunctions and prepositions. If you need every single word capitalized, convert to Title Case and then fix the few small words, or use UPPER CASE for headings that should be fully capitalized.',
    },
    {
      q: 'Does it work with accented letters and other languages?',
      a: 'Yes. Upper and lower case use Unicode rules, so letters like é, ñ and ü convert correctly. Scripts without case, such as Chinese or Japanese, are left unchanged.',
    },
    {
      q: 'Is my text stored or sent anywhere?',
      a: 'No. The conversion happens in your browser. Only the style you last picked is remembered on your device.',
    },
  ],
  related: ['word-counter', 'line-tools', 'text-diff', 'fancy-text', 'regex-tester', 'json-formatter'],
  priority: 55,
  updated: '2026-10-29',
});

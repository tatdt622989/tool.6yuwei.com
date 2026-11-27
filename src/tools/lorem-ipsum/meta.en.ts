import { defineTool } from '../types';

export default defineTool({
  slug: 'lorem-ipsum',
  name: 'Lorem Ipsum Generator',
  seoTitle: 'Lorem Ipsum Generator: Placeholder Text by Paragraph or Word',
  description:
    'Free Lorem Ipsum generator. Create placeholder text by paragraphs, sentences, words or characters, optionally starting with “Lorem ipsum dolor sit amet”.',
  category: 'text',
  icon: 'Pilcrow',
  keywords: [
    'lorem ipsum generator',
    'lorem ipsum',
    'placeholder text',
    'dummy text generator',
    'filler text',
    'lorem ipsum dolor sit amet',
    'lorem ipsum paragraphs',
    'lorem ipsum 100 words',
    'random text generator',
    'placeholder text generator',
    'lorem ipsum html',
    'sample text for design',
    'blind text',
  ],
  intro:
    'Generate classic Lorem Ipsum placeholder text for mockups, wireframes and templates. Choose paragraphs, sentences, words or an exact character limit and copy it with one click.',
  howTo: [
    'Under “Generate”, choose Paragraphs, Sentences, Words or Characters.',
    'Enter how many you need in the number box. The text updates as you type.',
    'Untick “Start with “Lorem ipsum dolor sit amet”” for a random opening, or tick “Wrap in <p> tags” to paste straight into HTML.',
    'Click “Copy text”, or “Regenerate” for a fresh variation.',
  ],
  sections: [
    {
      heading: 'What is Lorem Ipsum?',
      body: [
        'Lorem Ipsum is scrambled Latin used as placeholder text in design and publishing. It comes from sections 1.10.32 and 1.10.33 of Cicero’s “De finibus bonorum et malorum” (On the Ends of Good and Evil), written in 45 BC. Typesetters have used versions of it since at least the 1500s, and it spread to desktop publishing in the 1980s.',
        'The words look like real language, with a natural mix of short and long words, but carry no meaning. That lets reviewers focus on typography, spacing and layout instead of reading the copy, which is why it remains the default filler text in Figma plugins, WordPress themes and HTML templates.',
      ],
    },
    {
      heading: 'How much placeholder text do you need?',
      body: [
        'Match the filler to the real content you expect. A blog post excerpt is usually 1 paragraph or about 50 words, a product card description 20 to 30 words, a meta description about 155 characters and a tweet-sized snippet 280 characters or less. Use the Characters option to test text that must fit a fixed limit: output stops at the last whole word that fits.',
        'For long-form layouts, 3 to 5 paragraphs show how headings, line length and vertical rhythm work together. A comfortable measure for body text is about 50 to 75 characters per line.',
      ],
    },
    {
      heading: 'When not to use Lorem Ipsum',
      body: [
        'Placeholder text is great for early wireframes, but test with real or realistic copy before launch. Real headlines run longer than expected, names and translations can be twice as long as the English original, and Lorem Ipsum can hide problems with content hierarchy and readability. Also remember to remove it before going live: search your pages for “lorem” so no filler text ends up indexed by search engines.',
      ],
    },
  ],
  faq: [
    {
      q: 'What does Lorem Ipsum mean?',
      a: 'Nothing, by design. It is a scrambled passage from Cicero’s “De finibus bonorum et malorum”. The original phrase “dolorem ipsum” means “pain itself”, but the cut-up words no longer form meaningful sentences.',
    },
    {
      q: 'How do I generate 100 words of Lorem Ipsum?',
      a: 'Choose Words and enter 100. The output contains exactly 100 words, starting with “Lorem ipsum dolor sit amet” if that option is ticked.',
    },
    {
      q: 'Can I get Lorem Ipsum with HTML tags?',
      a: 'Yes. Tick “Wrap in <p> tags” and each paragraph is wrapped in <p>…</p>, ready to paste into HTML, a CMS or a code editor.',
    },
    {
      q: 'Is it OK to use Lorem Ipsum on a live website?',
      a: 'Only temporarily. Search engines treat it as low-quality content, and visitors may think the site is broken. Replace it with real copy before publishing.',
    },
    {
      q: 'Can I use the generated text commercially?',
      a: 'Yes. Lorem Ipsum is derived from a public-domain classical text, and the generated output is free to use in any project.',
    },
  ],
  related: ['word-counter', 'case-converter', 'markdown-preview', 'random-number', 'password-generator', 'image-resizer'],
  priority: 30,
  updated: '2026-10-29',
});

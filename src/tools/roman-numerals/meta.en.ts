import { defineTool } from '../types';

export default defineTool({
  slug: 'roman-numerals',
  name: 'Roman Numeral Converter',
  seoTitle: 'Roman Numeral Converter – Numbers, Years and Dates',
  description:
    'Convert numbers to Roman numerals and back, from 1 to 3,999 or up to 3,999,999 with the bar. Also converts years and dates and checks if a numeral is valid.',
  category: 'dev',
  icon: 'Landmark',
  keywords: [
    'roman numeral converter',
    'roman numerals',
    'roman numerals converter',
    'number to roman numerals',
    'roman numerals to numbers',
    'roman numeral translator',
    'roman numerals chart',
    'roman numeral date converter',
    'year in roman numerals',
    '2026 in roman numerals',
    'roman numerals 1 to 100',
    'roman numeral for 4',
    'roman numeral tattoo date',
    'roman numerals with bar',
    'how to write roman numerals',
    'is iiii a roman numeral',
  ],
  intro:
    'Type a number to get its Roman numeral, or type a Roman numeral to get the number. Each result is broken into parts, so you can see how it is built.',
  howTo: [
    'Type a number in Number or a numeral in Roman numeral. The other box and the result update as you type.',
    'Tick Allow numbers up to 3,999,999 to convert larger numbers with the bar (vinculum) notation.',
    'If a numeral isn’t written the standard way, such as IIII or IC, the error message shows the correct form.',
    'Use Date to Roman numerals for birthdays, anniversaries and tattoo dates, choosing the order and separator.',
  ],
  sections: [
    {
      heading: 'How Roman numerals work',
      body: [
        'Roman numerals use seven letters: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1,000. You write a number from the largest value to the smallest and add them up: MDCLXVI = 1,000 + 500 + 100 + 50 + 10 + 5 + 1 = 1,666.',
        'To avoid four of the same letter in a row, a smaller numeral placed before a larger one is subtracted. Only six pairs are used: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400 and CM = 900. So 1994 is M + CM + XC + IV = MCMXCIV, and 2026 is MM + XX + VI = MMXXVI.',
        'The easy way to convert a number is to go place by place. 3,888 is 3,000 (MMM) + 800 (DCCC) + 80 (LXXX) + 8 (VIII) = MMMDCCCLXXXVIII, the longest numeral below 4,000.',
      ],
    },
    {
      heading: 'Rules for valid Roman numerals',
      body: [
        'I, X, C and M can repeat up to three times in a row; V, L and D never repeat. Only I, X and C are used to subtract, and only from the next two larger letters: I from V and X, X from L and C, C from D and M. That is why 99 is XCIX, not IC, and 49 is XLIX, not IL.',
        'The converter checks these rules. Type IIII and it tells you the standard form is IV; type VV and it suggests X. Clock faces often show IIII for four, and older inscriptions break the rules too, but the subtractive form is the standard used in books, film credits and legal documents today.',
        'There is no Roman numeral for zero, negative numbers or fractions in this system. Medieval writers used the word nulla, or N, for zero.',
      ],
    },
    {
      heading: 'Large numbers: the bar (vinculum)',
      body: [
        'Standard Roman numerals stop at 3,999 (MMMCMXCIX) because 4,000 would need four M’s. For bigger numbers the Romans drew a bar, called a vinculum, over a numeral to multiply it by 1,000: V̅ = 5,000, X̅ = 10,000, C̅ = 100,000 and M̅ = 1,000,000.',
        'This converter uses the bar from 4,000 up: 4,000 is I̅V̅, 25,000 is X̅X̅V̅ and 3,999,999 is M̅M̅M̅C̅M̅X̅C̅I̅X̅CMXCIX. The bar is a combining overline character, so it copies into most apps, but some fonts draw it slightly off center.',
      ],
    },
    {
      heading: 'Years, dates and common uses',
      body: [
        'Roman numerals still show up on clock faces, building cornerstones, book chapters, monarchs and popes (Charles III, Leo XIV), movie copyright years and the Super Bowl, which became Super Bowl LX in 2026. The current year, 2026, is MMXXVI; 2000 is MM, 1999 is MCMXCIX and 1776 is MDCCLXXVI.',
        'For a date, convert the month, day and year separately. In the US order, July 4, 1776 is VII.IV.MDCCLXXVI, and October 29, 2026 is X.XXIX.MMXXVI. Check the order before you engrave or tattoo a date: most of the world writes the day first (XXIX.X.MMXXVI).',
      ],
    },
  ],
  faq: [
    {
      q: 'What is 2026 in Roman numerals?',
      a: '2026 is MMXXVI: MM (2,000) + XX (20) + VI (6).',
    },
    {
      q: 'How do you write 4 in Roman numerals: IV or IIII?',
      a: 'The standard form is IV (5 − 1). IIII appears on many clock faces for visual balance, but it isn’t used in standard writing.',
    },
    {
      q: 'What is the largest Roman numeral?',
      a: 'Without special notation it is 3,999, written MMMCMXCIX. With a bar over a numeral meaning × 1,000, this converter goes up to 3,999,999.',
    },
    {
      q: 'Is there a Roman numeral for zero?',
      a: 'No. The Roman system has no zero. Medieval scholars wrote nulla, sometimes abbreviated N, when they needed one.',
    },
    {
      q: 'How do I convert a date to Roman numerals?',
      a: 'Convert the month, day and year separately and join them with dots or dashes. For example, 12/25/2026 becomes XII.XXV.MMXXVI. The date converter on this page does it for you in US or day-first order.',
    },
    {
      q: 'What do the letters in Roman numerals stand for?',
      a: 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1,000. Every Roman numeral is built from these seven letters.',
    },
    {
      q: 'Why is 99 written XCIX and not IC?',
      a: 'Subtraction only works between neighboring powers of ten: I can come before V or X, X before L or C, and C before D or M. So 99 is 90 (XC) + 9 (IX).',
    },
  ],
  related: ['fraction-calculator', 'gpa-calculator', 'password-generator', 'word-counter', 'exact-time'],
  priority: 60,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'fraction-calculator',
  name: 'Fraction Calculator',
  seoTitle: 'Fraction Calculator – Add, Subtract, Multiply, Divide with Steps',
  description:
    'Free fraction calculator with steps. Add, subtract, multiply and divide fractions and mixed numbers, simplify the answer, and convert decimals to fractions.',
  category: 'calc',
  icon: 'Divide',
  keywords: [
    'fraction calculator',
    'fraction calculator with steps',
    'mixed number calculator',
    'mixed fraction calculator',
    'adding fractions calculator',
    'subtracting fractions calculator',
    'multiplying fractions calculator',
    'dividing fractions calculator',
    'simplify fractions calculator',
    'decimal to fraction',
    'fraction to decimal',
    'improper fraction to mixed number',
    'repeating decimal to fraction',
    'how to add fractions with different denominators',
    'fraction simplifier',
  ],
  intro:
    'Type two fractions, mixed numbers or decimals and pick an operation. You get the answer in lowest terms, as a mixed number and as a decimal, with every step written out.',
  howTo: [
    'Enter the first number as a fraction (3/4), a mixed number with a space (1 1/2), a whole number or a decimal.',
    'Pick +, −, × or ÷ and enter the second number.',
    'Read the simplified fraction, mixed number and decimal, and follow the steps under Step by step.',
    'Use Decimal to fraction and fraction to decimal at the bottom to convert a single number, including repeating decimals such as 0.(3).',
  ],
  sections: [
    {
      heading: 'How to add and subtract fractions',
      body: [
        'Fractions can only be added or subtracted when they have the same denominator. Find the least common denominator (the smallest number both denominators divide into), rewrite each fraction over it, then add or subtract the numerators and keep the denominator.',
        'Example: 1/2 + 1/3. The least common denominator of 2 and 3 is 6, so 1/2 = 3/6 and 1/3 = 2/6. Then 3/6 + 2/6 = 5/6.',
        'With mixed numbers, convert to improper fractions first: 3 1/4 − 1 5/8 = 13/4 − 13/8 = 26/8 − 13/8 = 13/8, which is 1 5/8 as a mixed number. To turn a mixed number into an improper fraction, multiply the whole number by the denominator and add the numerator: 3 1/4 = (3 × 4 + 1)/4 = 13/4.',
      ],
    },
    {
      heading: 'How to multiply and divide fractions',
      body: [
        'To multiply, multiply the numerators together and the denominators together, then simplify: 2/3 × 9/10 = 18/30 = 3/5. You don’t need a common denominator.',
        'To divide, flip the second fraction (take its reciprocal) and multiply. “Keep, change, flip”: 2 1/2 ÷ 1/4 = 5/2 × 4/1 = 20/2 = 10. That answer makes sense, because there are ten quarters in two and a half.',
        'Dividing by zero is undefined, so the calculator stops and tells you if the second number is 0.',
      ],
    },
    {
      heading: 'Simplifying fractions and mixed numbers',
      body: [
        'A fraction is in lowest terms when the numerator and denominator share no common factor other than 1. To simplify, divide both by their greatest common factor (GCF): for 18/30 the GCF is 6, so 18/30 = 3/5.',
        'An improper fraction has a numerator larger than its denominator. To write it as a mixed number, divide: 13/8 is 1 with 5 left over, so 13/8 = 1 5/8. The calculator always shows the simplified improper fraction, the mixed number and the decimal side by side.',
      ],
    },
    {
      heading: 'Converting decimals and fractions',
      body: [
        'To turn a decimal into a fraction, write the digits over a power of ten and simplify: 0.375 = 375/1000 = 3/8, and 2.75 = 275/100 = 11/4 = 2 3/4. To go the other way, divide the numerator by the denominator: 5/8 = 5 ÷ 8 = 0.625.',
        'Repeating decimals turn into fractions with a little algebra. For x = 0.1666…, 100x = 16.666… and 10x = 1.666…, so 90x = 15 and x = 15/90 = 1/6. Type a repeating decimal with the repeating part in parentheses, 0.1(6), or with three dots, 0.1666….',
        'Common equivalents worth remembering, especially for inches and recipes: 1/8 = 0.125, 1/4 = 0.25, 3/8 = 0.375, 1/2 = 0.5, 5/8 = 0.625, 3/4 = 0.75, 7/8 = 0.875, 1/3 ≈ 0.333 and 2/3 ≈ 0.667.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I enter a mixed number?',
      a: 'Type the whole number, a space and the fraction: 2 3/4. For a negative mixed number, put the minus sign in front: -2 3/4.',
    },
    {
      q: 'How do you add fractions with different denominators?',
      a: 'Rewrite both fractions over their least common denominator, add the numerators, and simplify. For 1/4 + 1/6, the LCD is 12, so 3/12 + 2/12 = 5/12.',
    },
    {
      q: 'How do you divide fractions?',
      a: 'Multiply the first fraction by the reciprocal of the second: 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 1 1/2.',
    },
    {
      q: 'How do I simplify a fraction?',
      a: 'Divide the numerator and denominator by their greatest common factor. 24/36 has a GCF of 12, so it simplifies to 2/3.',
    },
    {
      q: 'What is 0.333… as a fraction?',
      a: 'It is exactly 1/3. Any single digit repeating forever is that digit over 9: 0.777… = 7/9. Enter 0.(3) or 0.333... in the decimal converter to see the steps.',
    },
    {
      q: 'Can I use decimals in the fraction calculator?',
      a: 'Yes. Decimals are converted to exact fractions first, so 0.5 + 1/3 gives 5/6 exactly, with no rounding error.',
    },
  ],
  related: ['tip-calculator', 'sales-tax-calculator', 'gpa-calculator', 'roman-numerals', 'bmi-calculator'],
  priority: 70,
  updated: '2026-10-29',
});

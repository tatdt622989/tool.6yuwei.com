import { defineTool } from '../types';

export default defineTool({
  slug: 'calculator',
  name: 'Online Calculator',
  seoTitle: 'Online Calculator: Free Basic and Scientific Calculator',
  description:
    'Free online calculator with a basic mode for daily math and a scientific mode for sin, cos, tan, log, roots, powers and factorials. Keyboard input and history.',
  category: 'calc',
  icon: 'Calculator',
  keywords: [
    'calculator',
    'online calculator',
    'free calculator',
    'scientific calculator',
    'free online scientific calculator',
    'calculator online',
    'basic calculator',
    'simple calculator',
    'desktop calculator',
    'percent calculator',
    'trig calculator',
    'square root calculator',
    'exponent calculator',
    'factorial calculator',
    'log calculator',
    'calculator with history',
  ],
  intro:
    'A full-size calculator that works on any device: switch between basic and scientific modes, type with your keyboard, and reuse earlier answers from the history list.',
  howTo: [
    'Pick Basic for everyday arithmetic or Scientific for trig, logarithms, roots and powers.',
    'Tap the keys or type on your keyboard. The answer previews below the expression as you type.',
    'Press = or Enter to finish. The calculation is saved to the history, where you can tap it to edit it again.',
    'Use Copy result to paste the answer into a spreadsheet, email or chat.',
  ],
  sections: [
    {
      heading: 'Order of operations',
      body: [
        'The calculator follows the standard order of operations taught in US schools as PEMDAS: parentheses, exponents, multiplication and division from left to right, then addition and subtraction from left to right. So 12 × (3 + 4) ÷ 2 is 42, and 2 + 3 × 4 is 14, not 20.',
        'A leading minus sign applies after the exponent, the way math textbooks write it: −3² is −9, while (−3)² is 9. Implied multiplication is supported too, so 2π and 3(4 + 1) work without a × sign. When an expression looks ambiguous, such as the viral 6 ÷ 2(1 + 2), add parentheses to say exactly what you mean.',
      ],
    },
    {
      heading: 'How the percent key works',
      body: [
        'The % key behaves like a desk or phone calculator. On its own, 50% is 0.5. After a multiplication it takes a share: 80 × 15% gives 12. After a plus or minus it adds or removes a percentage of the first number, which is handy for tax, tips and markdowns: 200 + 15% gives 230, and 100 − 20% gives 80.',
        'For example, to add a 20% tip to a $45.50 restaurant bill, enter 45.50 + 20% and get 54.6, or $54.60. For more percentage problems, such as percent change between two numbers, use the percentage calculator.',
      ],
    },
    {
      heading: 'Scientific mode: trig, logs, roots and powers',
      body: [
        'Scientific mode adds sin, cos and tan with their inverses, log (base 10), ln (natural log), square and cube roots, xʸ, eˣ, 10ˣ, factorial, absolute value, π, e and Ans for the previous answer. Choose DEG for degrees or RAD for radians before using trig keys: sin(30) is 0.5 in degrees.',
        'Powers make quick work of growth problems. $1,000 growing 5% a year for three years is 1000 × 1.05^3 = 1,157.63. Results are rounded to 12 significant digits to hide floating-point noise, and very large or very small numbers switch to E notation (1.5E+20), which you can keep calculating with.',
      ],
    },
    {
      heading: 'Keyboard shortcuts',
      body: [
        'On a computer you can use the calculator without the mouse: type digits and + − * / ^ ( ) % !, press Enter or = to calculate, Backspace to delete one character, and Esc to clear everything. Clicking a key does not move focus away from the expression, so you can mix clicks and typing.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this calculator free?',
      a: 'Yes. It is free to use with no sign-up and works in any modern browser on phones, tablets and computers.',
    },
    {
      q: 'How do I calculate a percentage of a number?',
      a: 'Multiply by the percentage and press the % key: 80 × 15% = 12. To add a percentage, as with sales tax or a tip, use plus: 200 + 15% = 230.',
    },
    {
      q: 'Why does sin(30) not give 0.5?',
      a: 'The calculator is set to radians. Switch the angle unit to DEG and sin(30) returns 0.5. In RAD mode, sin(π/6) gives the same result.',
    },
    {
      q: 'Does it follow PEMDAS?',
      a: 'Yes. Parentheses come first, then exponents, then multiplication and division from left to right, then addition and subtraction from left to right.',
    },
    {
      q: 'Can I see my previous calculations?',
      a: 'Every time you press =, the expression and result are added to the history below the keypad. Tap an entry to bring it back. The history is stored only in your browser, and you can clear it at any time.',
    },
    {
      q: 'Can I type instead of tapping the buttons?',
      a: 'Yes. Type digits and operators on your keyboard, press Enter to calculate, Backspace to delete and Esc to clear. Use * for multiply and / for divide.',
    },
  ],
  related: ['percentage-calculator', 'discount-calculator', 'unit-converter', 'compound-interest', 'bmi-calculator'],
  priority: 95,
  updated: '2026-10-29',
});

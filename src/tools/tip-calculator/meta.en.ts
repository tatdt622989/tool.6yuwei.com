import { defineTool } from '../types';

export default defineTool({
  slug: 'tip-calculator',
  name: 'Tip Calculator',
  seoTitle: 'Tip Calculator – Split the Bill and Tip per Person',
  description:
    'Free tip calculator: pick 15%, 18%, 20% or a custom tip, split the bill between friends, round up per person and choose to tip on the pre-tax amount.',
  category: 'calc',
  icon: 'HandCoins',
  keywords: [
    'tip calculator',
    'tip calculator split bill',
    'gratuity calculator',
    'how much to tip',
    'calculate tip',
    '20 percent tip calculator',
    '18 percent tip',
    '15 percent tip',
    'tip per person',
    'split the check calculator',
    'restaurant tip calculator',
    'tip on pre tax or post tax',
    'bill splitter',
    'tip calculator round up',
    'how to calculate a tip',
  ],
  intro:
    'Enter the bill, choose a tip percentage and how many people are paying. You get the tip, the total and exactly what each person owes, with optional rounding to whole dollars.',
  howTo: [
    'Type the bill amount as printed on the check.',
    'Pick 15%, 18%, 20%, 22% or 25%, or choose Custom and type your own percentage.',
    'Set Split between to the number of people paying. The big number becomes the amount each person pays.',
    'Under Round up to whole dollars, choose Each person or Total if you want even dollar amounts. The actual tip rate shows how much the rounding added.',
    'Tick Tip on the pre-tax amount and enter the sales tax from the receipt if you prefer to tip on the food and drinks only.',
  ],
  sections: [
    {
      heading: 'How to calculate a tip',
      body: [
        'A tip is the bill multiplied by the tip percentage. For a 20% tip on a $64.50 check, multiply 64.50 × 0.20 = $12.90, so the total is $77.40. For 18% it is 64.50 × 0.18 = $11.61, and for 15% it is $9.68 (9.675 rounded to the nearest cent).',
        'To do it in your head, start with 10%: move the decimal point one place to the left, so 10% of $64.50 is $6.45. Double it for 20% ($12.90). For 15%, add half of the 10% figure: $6.45 + $3.23 = $9.68. For 25%, take a quarter of the bill: $64.50 ÷ 4 = $16.13.',
        'When you split, add the tip first and then divide. A $120 dinner for four with a 20% tip is $144 in total, or $36 per person, of which $6 is each person’s share of the tip.',
      ],
    },
    {
      heading: 'Should you tip on the pre-tax or after-tax amount?',
      body: [
        'Etiquette guides such as the Emily Post Institute say the tip is based on the pre-tax amount, because sales tax goes to the government rather than the restaurant. Card terminals and some printed tip suggestions, though, often calculate the percentage on the total including tax.',
        'The difference is small but real. On $100 of food with 8.25% sales tax, the check reads $108.25. A 20% tip on the pre-tax $100 is $20.00, while 20% of $108.25 is $21.65. Tick Tip on the pre-tax amount, enter the tax line from the receipt, and the calculator applies your percentage to the subtotal while still adding the tip to the full bill.',
        'Either choice is fine. Tipping on the total is simply the more generous option, and many people do it because it is quicker.',
      ],
    },
    {
      heading: 'Rounding up and splitting fairly',
      body: [
        'Exact splits often end in odd cents. Rounding up each person makes every share a whole dollar: a $87.40 check with a 20% tip is $104.88, or $34.96 each for three people. Rounding up gives $35.00 each, $105.00 in total, and the extra 12 cents goes to the server as tip.',
        'Rounding up the total does the same for the whole check, which is handy when one person pays. If a total still doesn’t divide evenly, the calculator tells you how many people pay one cent more so that the shares add up exactly to the bill.',
        'The comparison table below the result lists 15%, 18%, 20%, 22% and 25% side by side for the same bill, so you can see what a few extra percent means in dollars before you decide.',
      ],
    },
    {
      heading: 'How much to tip in the US',
      body: [
        'Typical guidance for sit-down restaurants is 15% to 20% of the pre-tax bill, with 20% now the most common choice for good service and 22% to 25% for excellent service or a special occasion. Many restaurants add an automatic gratuity, often 18% to 20%, for large parties. Check the receipt so you don’t tip twice.',
        'Common amounts elsewhere: bartenders $1 to $2 per drink or 15% to 20% of the tab; food delivery 15% to 20% with a few dollars minimum; hair stylists and barbers 15% to 20%; taxi and rideshare drivers 15% to 20%. Tipping at a takeout counter is optional. These are customs, not rules, and local norms vary.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is a good tip percentage?',
      a: 'For table service in the US, 15% to 20% is standard and 20% is the most common choice today. Tip 22% to 25% for outstanding service, and less only when service was genuinely poor.',
    },
    {
      q: 'How do I calculate 20% of a bill quickly?',
      a: 'Move the decimal point one place to the left to get 10%, then double it. For a $47.50 bill, 10% is $4.75 and 20% is $9.50, so the total is $57.00.',
    },
    {
      q: 'Do you tip on tax?',
      a: 'Etiquette guides say to tip on the amount before tax, but tipping on the total is common and a little more generous. Use the pre-tax option in this calculator to see both amounts.',
    },
    {
      q: 'How do I split a bill with a tip between several people?',
      a: 'Add the tip to the bill, then divide by the number of people. Set Split between to the head count and the calculator shows each person’s share, the tip per person and how to handle leftover cents.',
    },
    {
      q: 'Should I tip if a service charge or gratuity is already included?',
      a: 'An automatic gratuity already is the tip, so you don’t need to add another unless you want to. A generic service charge may not go to the staff; ask if you’re unsure.',
    },
    {
      q: 'What does rounding up each person do?',
      a: 'It raises each person’s share to the next whole dollar and treats the extra as tip. The actual tip rate is shown so you know how much the rounding added.',
    },
    {
      q: 'Is anything I type saved or sent anywhere?',
      a: 'No. The math runs in your browser. Your last settings are remembered only on your own device so they are there next time.',
    },
  ],
  related: ['sales-tax-calculator', 'fraction-calculator', 'gpa-calculator', 'time-card-calculator', 'bmi-calculator'],
  priority: 85,
  updated: '2026-10-29',
});

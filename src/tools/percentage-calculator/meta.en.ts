import { defineTool } from '../types';

export default defineTool({
  slug: 'percentage-calculator',
  name: 'Percentage Calculator',
  seoTitle: 'Percentage Calculator: Percent of a Number and Percent Change',
  description:
    'Free percentage calculator for four common questions: P% of X, X as a percent of Y, percent change from X to Y, and a number increased or decreased by P%.',
  category: 'calc',
  icon: 'Percent',
  keywords: [
    'percentage calculator',
    'percent calculator',
    'percentage of a number',
    'what is x percent of y',
    'x is what percent of y',
    'percent change calculator',
    'percentage increase calculator',
    'percentage decrease calculator',
    'percent difference',
    'how to calculate percentage',
    'percent off calculator',
    'increase by percentage',
    'percentage formula',
    'grade percentage calculator',
  ],
  intro:
    'Four common percentage problems on one page, each with the formula written out: a percent of a number, what share one number is of another, percent change, and adding or removing a percentage.',
  howTo: [
    'Find the card that matches your question, for example “Percent change from X to Y” for a price or salary change.',
    'Type your numbers into the boxes. The answer updates as you type in the gray box below.',
    'In “Increase or decrease X by P%”, switch between Increase and Decrease for markups, raises or markdowns.',
    'Each result shows the full calculation, so you can check it or copy it into a report or spreadsheet.',
  ],
  sections: [
    {
      heading: 'The four percentage formulas',
      body: [
        'Percent of a number: X × P ÷ 100. For example, 15% of 80 is 80 × 15 ÷ 100 = 12. What percent one number is of another: part ÷ whole × 100. A test score of 42 out of 48 is 42 ÷ 48 × 100 = 87.5%.',
        'Percent change: (new − old) ÷ old × 100. A salary that goes from $62,000 to $65,100 rose (65,100 − 62,000) ÷ 62,000 × 100 = 5%. Increase or decrease by a percent: X × (1 + P%) or X × (1 − P%). A $250 item marked up 20% costs $300; marked down 20% it costs $200.',
      ],
    },
    {
      heading: 'Everyday examples: sales tax, tips and discounts',
      body: [
        'Sales tax is added to the shelf price in the US, so use “Increase X by P%”. A $59.99 purchase with 8.25% sales tax comes to 59.99 × 1.0825 ≈ $64.94, of which about $4.95 is tax. A tip works the same way: an 18% tip on a $64.50 check is 64.50 × 0.18 ≈ $11.61.',
        'To work backwards from a sale price, divide instead of multiply. If a jacket costs $48 after 20% off, the original price was 48 ÷ (1 − 0.20) = $60. Subtracting 20% from $48 would give the wrong answer, because the discount was taken from the original price, not the sale price.',
      ],
    },
    {
      heading: 'Percent vs. percentage points',
      body: [
        'When a rate moves from 6% to 7%, it went up one percentage point, but it rose (7 − 6) ÷ 6 ≈ 16.7% in relative terms. News reports about interest rates, unemployment and polls usually mean percentage points. Mixing up the two can make a change look six times bigger or smaller than it is.',
      ],
    },
    {
      heading: 'Why up 25% then down 20% gets you back to the start',
      body: [
        'Successive percentage changes multiply rather than add, because each change uses a new base. A $100 stock that gains 25% is worth $125; a 20% drop from $125 takes it back to $100, since 1.25 × 0.8 = 1. In the other direction, a 50% loss needs a 100% gain to break even. When you combine several changes, multiply the factors (1 + change) together instead of adding the percentages.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate a percentage of a number?',
      a: 'Multiply the number by the percentage and divide by 100. 20% of 150 is 150 × 20 ÷ 100 = 30. You can also convert the percent to a decimal first: 150 × 0.20 = 30.',
    },
    {
      q: 'How do I calculate percent increase?',
      a: 'Subtract the old value from the new one, divide by the old value and multiply by 100. Going from 50 to 65 is (65 − 50) ÷ 50 × 100 = 30%. A negative result means a decrease.',
    },
    {
      q: 'How do I find what percent one number is of another?',
      a: 'Divide the part by the whole and multiply by 100. 45 out of 60 is 45 ÷ 60 × 100 = 75%.',
    },
    {
      q: 'Can a percentage be more than 100%?',
      a: 'Yes. If revenue grows from $100,000 to $250,000, that is a 150% increase, and 150 is 150% of 100. A decrease, however, can’t be more than 100% for a quantity that can’t go below zero.',
    },
    {
      q: 'Why can’t I calculate percent change from 0?',
      a: 'Percent change divides by the starting value, and dividing by zero is undefined. Describe a change from 0 in absolute terms instead, for example “up 25 units”.',
    },
    {
      q: 'What is the difference between percent change and percent difference?',
      a: 'Percent change compares a new value with an original one. Percent difference compares two values with no clear starting point and divides by their average: for 40 and 60 it is 20 ÷ 50 × 100 = 40%.',
    },
  ],
  related: ['discount-calculator', 'calculator', 'compound-interest', 'split-bill', 'loan-calculator'],
  priority: 65,
  updated: '2026-10-29',
});

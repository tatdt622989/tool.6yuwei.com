import { defineTool } from '../types';

export default defineTool({
  slug: 'discount-calculator',
  name: 'Discount Calculator',
  seoTitle: 'Discount Calculator: Sale Price, Percent Off and Stacked Coupons',
  description:
    'Free discount calculator: get the sale price and your savings from any percent off. Handles extra % off coupons, BOGO and spend-and-save deals, and sales tax.',
  category: 'calc',
  icon: 'Tag',
  keywords: [
    'discount calculator',
    'percent off calculator',
    'sale price calculator',
    'sale calculator',
    'how much is 30 off',
    'what is 20 percent off',
    'price after discount',
    'extra 20 off calculator',
    'stacked discount calculator',
    'double discount calculator',
    'bogo calculator',
    'buy one get one 50 off',
    'discount calculator with tax',
    'savings calculator shopping',
    'percentage off price',
  ],
  intro:
    'Find the sale price and your savings in seconds. Stack an extra coupon, compare BOGO and spend-and-save deals as a single percent off, and add sales tax to see what you will pay at the register.',
  howTo: [
    'Choose a deal type: % off, BOGO % off, Buy X, get Y free, or Spend & save.',
    'For % off, enter the original price and the discount. Add an Extra % off if you have a coupon on top of the sale.',
    'Read the sale price, how much you save and the total discount as a single percent off.',
    'Optionally enter your sales tax rate to see the total with tax.',
  ],
  sections: [
    {
      heading: 'How to calculate a percent-off price',
      body: [
        'Sale price = original price × (1 − discount ÷ 100). For 30% off a $79.99 pair of shoes, that is 79.99 × 0.70 = $55.99, so you save $24.00. A quick mental shortcut for 10% steps: move the decimal one place for 10% ($8.00), multiply by three for 30% ($24.00) and subtract.',
        'To go backwards from a sale price to the original, divide: a $48 jacket that is 20% off was 48 ÷ 0.80 = $60 before the sale. Taking 20% off $48 instead would understate the original price.',
      ],
    },
    {
      heading: 'Stacked coupons: why 30% + 20% is not 50% off',
      body: [
        'When a store says “take an extra 20% off sale prices,” the second discount applies to the already reduced price. 30% off and then an extra 20% off is 0.70 × 0.80 = 0.56 of the original price, a total of 44% off, not 50%. On $79.99 that is $44.79 instead of $40.00.',
        'The order of two percentage discounts does not change the result, but the order of a percent-off and a dollar-off coupon does. $10 off then 20% off a $50 item costs $32, while 20% off then $10 off costs $30. Most retailers apply percent-off discounts first; check the fine print.',
      ],
    },
    {
      heading: 'BOGO, buy 2 get 1 free and spend-and-save deals',
      body: [
        'Converting a deal to a single percent off makes it easy to compare. Buy one, get one 50% off works out to 25% off both items: two $40 items cost $60, or $30 each. Buy one, get one free is 50% off, and buy 2, get 1 free is 33.3% off, so three $12.99 items cost $25.98, about $8.66 each.',
        'Spend-and-save offers such as “$20 off orders of $100 or more” are worth the most when you just clear the threshold. On a $135 order you pay $115, about 14.8% off. On a $100 order it is a full 20% off. Only count items you were going to buy anyway.',
      ],
    },
    {
      heading: 'Sales tax is added after the discount',
      body: [
        'Prices in US stores usually exclude sales tax, which is added at checkout on the discounted price. With 8.25% sales tax, the $55.99 sale price above comes to about $60.61. Rates vary by state and city, from 0% in states such as Oregon and Delaware to over 9% in parts of Louisiana, Tennessee and California, so enter your local combined rate.',
        'Manufacturer coupons can be taxed differently from store discounts in some states. The result here assumes tax is charged on the price you actually pay.',
      ],
    },
  ],
  faq: [
    {
      q: 'How much is 30% off $80?',
      a: '30% of $80 is $24, so the sale price is $56. You can also multiply by 0.70: 80 × 0.70 = 56.',
    },
    {
      q: 'Is 20% off and then an extra 10% off the same as 30% off?',
      a: 'No. The extra 10% applies to the reduced price, so you pay 0.80 × 0.90 = 72% of the original, a total of 28% off.',
    },
    {
      q: 'What percent off is buy one, get one 50% off?',
      a: 'It is 25% off when you buy two of the same price. You pay 1.5 items’ worth for 2 items.',
    },
    {
      q: 'Which is better, 40% off or $40 off?',
      a: 'It depends on the price. 40% off is worth more on items over $100, and $40 off is worth more on items under $100. At exactly $100 they are the same.',
    },
    {
      q: 'How do I find the original price from the sale price?',
      a: 'Divide the sale price by (1 − discount). If an item costs $63 after 30% off, the original price was 63 ÷ 0.70 = $90.',
    },
    {
      q: 'Does sales tax apply before or after a discount?',
      a: 'In most cases sales tax is charged on the discounted price, so a store discount also lowers the tax you pay.',
    },
  ],
  related: ['percentage-calculator', 'split-bill', 'calculator', 'unit-converter', 'exchange-rate'],
  priority: 55,
  updated: '2026-10-29',
});

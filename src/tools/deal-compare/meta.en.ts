import { defineTool } from '../types';

export default defineTool({
  slug: 'deal-compare',
  name: 'Stacked Discount Calculator',
  seoTitle: 'Stacked Discount Calculator: Compare Coupon and Cashback Deals',
  description:
    'Stack a percent-off sale, a spend-and-save offer, a coupon, shipping and cash back on one order, then compare up to four deals to see which is really cheapest.',
  category: 'calc',
  icon: 'BadgePercent',
  keywords: [
    'stacked discount calculator',
    'coupon and cashback calculator',
    'stacking discounts',
    'which deal is better',
    'compare deals calculator',
    'cash back vs discount',
    'coupon stacking calculator',
    'effective discount calculator',
  ],
  intro:
    'One store has 30% off, another adds a $20 coupon, a third gives 20% cash back. Whether it is Black Friday, a back-to-school sale or an ordinary coupon in your inbox, enter each offer once and see what you pay today, what comes back later and which deal costs the least.',
  howTo: [
    'Enter the “Order total” for each offer and rename it after the store or payment method. Tap “Try an example” to see a filled-in comparison.',
    'Fill in only the deals that offer has, in order: “Percent off”, “Spend & save”, “Coupon”, “Shipping” and “Cash back”. Check “Applies again for every multiple” if a spend-and-save deal repeats.',
    'Read each offer’s line-by-line breakdown with “Pay now”, “Effective cost” and “Effective discount”. Hints appear when you are short of a threshold, a coupon minimum or free shipping, or over a cash back cap.',
    'Use “Add offer” to compare up to four. The result marks the “Lowest price now” and the “Best after cash back”, and “Copy result” gives you a text summary to share.',
  ],
  sections: [
    {
      heading: 'Why stacked discounts multiply instead of adding up',
      body: [
        'Each discount applies to what is left after the one before it. Take a $240 order with 20% off and a $20 coupon: 240 × 0.80 = $192, and $20 off that is $172. That works out to 28.3% off the original price. Two percentages stack the same way: 30% off plus an extra 20% off is 0.70 × 0.80 = 0.56 of the price, so 44% off rather than 50%.',
        'Order matters as soon as a fixed amount or a threshold is involved. A $200 order at 20% off drops to $160, which no longer qualifies for “$25 off when you spend $200”. You would have to add $50 to the order to get back over the line. This calculator always works in the same order (percent off, spend and save, coupon, shipping, cash back) and lists every step so you can check it against the store’s cart.',
      ],
    },
    {
      heading: 'Why cash back is worth less than the same amount off',
      body: [
        'A coupon lowers what you pay at checkout. Cash back, points and store credit arrive after you have paid, sometimes weeks later, and often with strings attached: an expiration date, a minimum to redeem or use at one retailer only. That is why this calculator keeps “Pay now” and “Effective cost” as two separate numbers.',
        'The percentages are not equivalent either. 10% back in store credit is not 10% off: paying $100 to receive $10 of credit means $100 buys $110 of goods, which is about 9.1% off, and only if you actually spend the credit.',
      ],
    },
    {
      heading: 'Caps, minimum spends and free-shipping thresholds',
      body: [
        'High cash back rates usually come with a cap. With 20% back capped at $40, a $204 purchase earns $40 instead of $40.80, and nothing above $200 earns anything. On a $500 purchase the same offer is really 8% back.',
        'Coupon minimums and free-shipping thresholds are normally checked after discounts, so a sale can push you under the line. A $240 order at 30% off is $168; with $8.95 shipping and free shipping over $175 you pay $176.95. Add a $10 item and the order qualifies for free shipping, so the total actually falls to $175.00. The reverse also holds: when you are far from a threshold, buying extra just to reach it does not save money.',
      ],
    },
    {
      heading: 'A worked comparison: three offers on a $240 order',
      body: [
        'Store A: 30% off, $8.95 shipping (free over $175). Store B: 20% off plus a $20 coupon with a $150 minimum, free shipping. Store C: 15% off, paid with a card offer of 20% cash back capped at $40.',
        'Store A comes to $168.00 plus shipping, $176.95. Store B is $192.00 minus the coupon, $172.00. Store C charges $204.00 today and returns $40.00, for an effective cost of $164.00, or 31.7% off.',
        'Store B has the lowest price now: $4.95 less than Store A and $32.00 less than Store C. Once the cash back arrives, Store C is $8.00 cheaper than Store B. Which one suits you depends on how much money back later is worth to you compared with money saved today. Tap “Try an example” in the tool to load these numbers.',
      ],
    },
  ],
  faq: [
    {
      q: 'In what order does the calculator apply discounts?',
      a: 'Percent off first, then spend and save on the reduced amount, then the coupon (its minimum spend is checked at that point), then shipping, and finally cash back on what you paid for merchandise. Retailers do not all follow this order, so check the terms of each offer.',
    },
    {
      q: 'Is 20% cash back the same as 20% off?',
      a: 'No. With 20% off you pay less at checkout. With 20% cash back you pay the full discounted price now and get money or points back later, often up to a cap. The calculator shows both “Pay now” and “Effective cost” so you can weigh them yourself.',
    },
    {
      q: 'How is the effective discount calculated?',
      a: 'It is 1 − effective cost ÷ order total. If a $240 order ends up costing $164 after cash back, that is 164 ÷ 240 = 68.3% of the list price, or 31.7% off. Shipping counts as part of the cost.',
    },
    {
      q: 'What happens if a percent-off code and a dollar-off coupon are applied in the other order?',
      a: 'You pay a little more. 20% off and then $10 off a $50 item costs $30, while $10 off and then 20% off costs $32. This calculator takes the percent off first; the store decides the real order at checkout.',
    },
    {
      q: 'Can I use it for a single order?',
      a: 'Yes. Fill in one offer and leave the others blank or remove them. You get the amount to pay, the cash back and the effective discount for that order.',
    },
    {
      q: 'Does it include sales tax?',
      a: 'No. Sales tax varies by state and city, so it is left out. Enter pre-tax prices for every offer so the comparison stays like for like.',
    },
  ],
  related: ['discount-calculator', 'unit-price', 'cart-filler', 'percentage-calculator', 'split-bill', 'exchange-rate'],
  priority: 77,
  updated: '2026-11-10',
});

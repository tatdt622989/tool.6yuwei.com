import { defineTool } from '../types';

export default defineTool({
  slug: 'cart-filler',
  name: 'Free Shipping Threshold Calculator',
  seoTitle: 'Free Shipping Threshold Calculator: Find the Cheapest Items to Add',
  description:
    'Free cart filler calculator: enter a free shipping or coupon minimum and your item prices, and find the combination that reaches it with the least extra spend.',
  category: 'calc',
  icon: 'ShoppingCart',
  keywords: [
    'free shipping threshold calculator',
    'cart filler calculator',
    'reach minimum order',
    'how to hit coupon minimum',
    'free shipping filler item calculator',
    'minimum order calculator',
    'add on item calculator',
    'spend threshold calculator',
  ],
  intro:
    'List what you are buying and what you could add, set the amount you need to reach, and the calculator finds the combination that gets there with the smallest total. No more adding items one by one to see where the cart lands.',
  howTo: [
    'Enter the threshold under Amount to reach ($), such as 35 for a $35 free shipping minimum. For a coupon like $10 off $50, also fill in Discount at that amount ($, optional).',
    'Type or paste your items under Items (one per line: name, then price), for example “Water bottle 12.95”. Start a line with * for things you are buying anyway and add x2 after the price if you would take up to 2. Load example shows a filled-in cart.',
    'Check the list under Items found: checked items are must-haves, unchecked ones are optional filler.',
    'Read the cheapest cart, how far over the amount it lands and what you pay after the discount. Other ways to reach it (next lowest totals) lists the runners-up, and Copy result puts the cart on your clipboard.',
  ],
  sections: [
    {
      heading: 'How spending thresholds work',
      body: [
        'Free shipping minimums, coupon minimums and spend-and-save offers all follow the same rule: the perk applies once your cart reaches a set amount, and being a few cents short gets you nothing. Minimums of $35 and $50 are common for free shipping, and coupons are often written as $10 off $50 or $20 off $100. The real question is which items add up to just past the line, because everything above it is money you spent only to qualify.',
        'This calculator compares every combination of the items you list instead of adding the cheapest one until the total tips over. Say a phone charger ($18.50) and a desk lamp ($24.00) are in your cart for $42.50, and you have a $10 off $50 coupon. With lip balm at $3.99 (up to 3), hand cream at $8.75 and a tote bag at $9.99 as options, the cheapest way over the line is two lip balms for $7.98, a cart of $50.48 that lands $0.48 over. Hand cream is next at $51.25.',
        'Stores usually count the merchandise subtotal after other discounts and before tax and shipping, and some exclude gift cards, marketplace sellers or sale items. Check the offer terms or the checkout page, then enter the amount that actually has to be reached.',
      ],
    },
    {
      heading: 'When topping up pays off and when it does not',
      body: [
        'Compare what you add with what you get back. If the extras cost less than the discount, your bill goes down. In the example above the charger and lamp alone cost $42.50. Adding $7.98 of lip balm and taking $10 off brings the bill to $40.48, which is $2.02 less, so the coupon is worth using even if the lip balm ends up in a drawer.',
        'If the extras cost more than the discount, you only save money when you wanted them anyway. Spending an extra $30 to get $10 off means paying $20 more than you planned. The calculator spells out this comparison under the result whenever you have marked must-haves: what they cost alone, what you pay after reaching the amount, and the difference.',
      ],
    },
    {
      heading: 'Free shipping minimums vs. coupon minimums',
      body: [
        'For free shipping, the number to beat is the shipping fee. Take a phone case ($15.99) and a screen protector ($11.49), $27.48 in total, at a store with a $35 minimum. With cable clips at $4.29 (up to 3), a charging cable at $8.99, a stylus at $6.75 and a phone stand at $12.50 to choose from, the cheapest filler is two packs of cable clips for $8.58, a cart of $36.06. The charging cable is next at $36.47. If shipping is $5.99, the clips cost $2.59 more than simply paying for shipping, so add them only if you will use them. Leave the discount field blank for free shipping and compare the added amount with the fee yourself.',
        'A coupon minimum works like a spend-and-save offer: enter the discount and the calculator shows what you pay. Some coupons check the subtotal before other promotions and some after, which can move the line by several dollars.',
      ],
    },
    {
      heading: 'Offers that repeat for every multiple',
      body: [
        'For deals such as $20 off every $100, turn on Discount repeats for every multiple. The calculator then also finds the cheapest carts at the next two multiples (two and three times the amount if you start below the first), when your list can get there, and marks the one with the best overall rate. Take a $79.00 jacket as the must-have, with jeans ($49.50), T-shirts ($14.99, up to 3), a belt ($22.00), socks ($9.99, up to 2), a beanie ($16.50) and a scarf ($24.99) as options. Adding the belt makes $101.00 and you pay $81.00, about 19.8% off. Reaching $200.46 with the jeans, two T-shirts, the belt and two pairs of socks takes $40 off and costs $160.46, about 20% off.',
        'The rate is slightly better at the higher tier, but the bill nearly doubles. A better rate is only a saving if those items were already on your list.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is the suggested cart really the cheapest one?',
      a: 'Yes, for the items, prices and quantities you entered. The calculator checks every combination with dynamic programming and returns the smallest total that reaches the amount. When two carts tie, it picks the one with fewer items. It does not know about items you did not list, and it does not add tax or shipping.',
    },
    {
      q: 'What is the difference between a must-have and an optional item?',
      a: 'Must-haves (lines that start with *, or items you check in the list) are always in the cart. Optional items are only added when they are needed to reach the amount. If your must-haves already reach it, the calculator tells you there is nothing to add.',
    },
    {
      q: 'Can I add more than one of the same item?',
      a: 'Yes. Put x2 or x3 after the price to say you would take up to that many, and the calculator decides whether to use none, one or more. The limit is 99 per line.',
    },
    {
      q: 'What if my whole list is still under the minimum?',
      a: 'The result shows the total of everything on the list and how much you are still short. Add another item that costs at least that much and the calculator runs again.',
    },
    {
      q: 'Does it include sales tax?',
      a: 'No. Thresholds are normally checked against the pre-tax subtotal, so enter prices as listed. Tax is added at checkout on top of what the calculator shows.',
    },
    {
      q: 'Is my shopping list sent anywhere?',
      a: 'No. Everything is calculated in your browser. The list is saved only in this browser on your device, so it is still there next time, and it is never uploaded.',
    },
  ],
  related: ['discount-calculator', 'deal-compare', 'unit-price', 'split-bill', 'percentage-calculator', 'random-picker'],
  priority: 74,
  updated: '2026-11-10',
});

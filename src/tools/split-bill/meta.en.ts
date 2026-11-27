import { defineTool } from '../types';

export default defineTool({
  slug: 'split-bill',
  name: 'Split the Bill Calculator',
  seoTitle: 'Split the Bill Calculator with Tip and Tax: Who Owes What',
  description:
    'Free bill splitting calculator for restaurants and group trips. Add tax and a 15–22% tip, split evenly, by what each person ordered or by income, to the cent.',
  category: 'calc',
  icon: 'Users',
  keywords: [
    'split the bill calculator',
    'bill splitter',
    'split bill with tip',
    'tip calculator split',
    'tip and split calculator',
    'split check calculator',
    'restaurant bill splitter',
    'split bill with tax and tip',
    'how much does each person owe',
    'split the bill evenly',
    'itemized bill split',
    'group dinner bill calculator',
    'tip calculator for groups',
    'split a check by item',
    'split bill by income',
    'proportional split calculator',
    'split bills by income calculator',
    'split rent by income',
  ],
  intro:
    'Enter the bill, the tax rate and the tip, and see exactly what each person owes. Split evenly, by what everyone ordered, or in proportion to income or custom shares, with leftover cents handled for you.',
  howTo: [
    'Choose “Split evenly”, “Itemized” or “By share”.',
    'For an even split, enter the bill subtotal and the number of people. For an itemized split, enter what each person ordered and any shared items such as appetizers. For “By share”, enter the bill and give each person a share (×0.5, ×1, ×1.5, ×2 or “Pays $0”), or switch to “By income” and enter each person’s income.',
    'Enter your sales tax rate and pick a tip (15%, 18%, 20% or 22%) or type your own.',
    'Choose “Exact to the cent” or round each share up to $1 or $5, then tap “Copy the split” to paste it into your group chat.',
  ],
  sections: [
    {
      heading: 'How to split a bill with tax and tip',
      body: [
        'Start from the subtotal, the amount before tax. Add tax at your local rate, add the tip, then divide by the number of people. For a $120 dinner for four with 8% sales tax and a 20% tip, tax is $9.60, the tip is $24.00 and the total is $153.60, so each person pays $38.40.',
        'When the total doesn’t divide evenly, rounding everyone up means the group overpays. This calculator splits to the cent and tells you who covers the leftover pennies instead. A $100 check for three, for example, becomes one person paying $33.34 and two paying $33.33, which adds up to exactly $100.00.',
      ],
    },
    {
      heading: 'Should you tip on the pre-tax or post-tax amount?',
      body: [
        'Etiquette guides generally say to tip on the pre-tax subtotal, and that is how this calculator works. The difference is small but real: 20% of a $120 subtotal is $24.00, while 20% of the $129.60 after-tax total is $25.92.',
        'If your receipt only shows a total that already includes tax, enter that total as the subtotal and set the tax rate to 0. The tip will then be figured on the full amount, which slightly favors your server.',
      ],
    },
    {
      heading: 'How much to tip in the US',
      body: [
        'For table service at a sit-down restaurant, 15% is the minimum many people use, 18% to 20% is standard, and 22% or more is for excellent service or a long, complicated order. Bartenders usually get $1 to $2 per drink or 15% to 20% of the tab, and food delivery drivers typically get 15% to 20% with a few dollars minimum.',
        'Many restaurants add an automatic gratuity of 18% to 20% for parties of six or more. Check the receipt for a “gratuity” or “service charge” line before you tip. If it’s already there, include it in the bill amount and set the tip to 0 so you don’t tip twice.',
      ],
    },
    {
      heading: 'Itemized splits: when one person ordered the steak',
      body: [
        'An even split feels unfair when someone had a salad and water while someone else ordered a steak and two cocktails. Switch to “Itemized” and enter what each person ordered. Shared plates, like appetizers or a pitcher, go in the shared box and are divided equally.',
        'Tax and tip are then shared in proportion to each person’s food and drinks, so the person who ordered more also covers more of the tip. Every share is rounded to the cent and the shares always add up to the exact total, so the person who paid the check is never left short.',
      ],
    },
    {
      heading: 'Proportional splits: by income or by custom shares',
      body: [
        'An even split is not always the fair one. Couples and roommates often split rent and shared bills in proportion to income, and at a group dinner the person who skipped the wine may pay a smaller share while the birthday guest pays nothing. Choose “By share” and give each person a share: 1 is a regular portion, 2 pays double, 0.5 pays half and 0 pays nothing. Each person owes the total times their share, divided by the sum of all shares.',
        'To split by income, switch to “By income” and enter what each person earns. If one partner makes $60,000 and the other $40,000, the split is 60% and 40%, so a $2,400 rent comes to $1,440 and $960. Set tax and tip to 0 for bills like rent, utilities or groceries. Yearly or monthly, before or after tax: any income figure works as long as it is the same kind for everyone.',
        'Shares are rounded to the cent and leftover cents are assigned so the amounts add up to the exact total. If you round up to $1 or $5 instead, people with the same share pay the same amount and the calculator shows how much extra the group collected.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I split a bill evenly with tip?',
      a: 'Add the tip to the subtotal (for example 20% of $120 is $24), add tax, then divide the total by the number of people. Enter the subtotal, tax rate, tip and number of people above and the calculator does it in one step.',
    },
    {
      q: 'Is the tip calculated before or after tax?',
      a: 'Before tax. That is the common etiquette in the US and the way this tool works. If you prefer to tip on the total, enter the after-tax total as the bill and set the tax rate to 0.',
    },
    {
      q: 'What happens to leftover cents?',
      a: 'With “Exact to the cent”, a few people pay one cent more so the shares add up to the exact total. If you round up to $1 or $5 instead, everyone pays the same amount and the calculator shows how much extra the group collected.',
    },
    {
      q: 'How do I split a bill when people ordered different things?',
      a: 'Use “Itemized”. Enter what each person ordered and put shared dishes in the shared box. Tax and tip are spread in proportion to what each person ordered.',
    },
    {
      q: 'How do you split bills based on income?',
      a: 'Add up everyone’s income, then divide each person’s income by that total to get their percentage. With incomes of $60,000 and $40,000 the split is 60/40, so a $150 bill is $90 and $60. Choose “By share”, switch to “By income” and the calculator works out the percentages for you.',
    },
    {
      q: 'Can one person pay nothing, like the birthday guest?',
      a: 'Yes. In “By share”, tap “Pays $0” next to that person. Their share becomes 0 and the rest of the group covers the bill in proportion to their own shares. At least one person needs a share above 0.',
    },
    {
      q: 'What tip percentage is normal at a restaurant?',
      a: 'In the US, 18% to 20% is standard for table service, 15% is on the low end, and 22% or more is for great service. Check whether an automatic gratuity was already added for large groups.',
    },
    {
      q: 'Does this work for trips and shared expenses, not just restaurants?',
      a: 'Yes. Set tax and tip to 0 and use it for an Airbnb, a rental car or groceries. The itemized mode works for shared costs where people owe different amounts.',
    },
  ],
  related: ['percentage-calculator', 'discount-calculator', 'calculator', 'exchange-rate', 'unit-converter'],
  priority: 45,
  updated: '2026-11-25',
});

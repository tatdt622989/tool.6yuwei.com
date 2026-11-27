import { defineTool } from '../types';

export default defineTool({
  slug: 'sales-tax-calculator',
  name: 'Sales Tax Calculator',
  seoTitle: 'Sales Tax Calculator – Add or Remove Tax by State (2026 Rates)',
  description:
    'Free sales tax calculator with 2026 state rates. Add tax to a price, work backward from a total to the pre-tax price, or find the tax rate from a receipt.',
  category: 'calc',
  icon: 'BadgePercent',
  keywords: [
    'sales tax calculator',
    'reverse sales tax calculator',
    'sales tax by state',
    'how to calculate sales tax',
    'calculate tax on a price',
    'remove sales tax from total',
    'price before tax calculator',
    'sales tax rate 2026',
    'state sales tax rates',
    'california sales tax calculator',
    'texas sales tax calculator',
    'new york sales tax calculator',
    'florida sales tax calculator',
    'tax calculator for shopping',
    'how to find sales tax rate from receipt',
    'sales tax formula',
  ],
  intro:
    'Add sales tax to a price or take it out of a total. Pick a state for its 2026 statewide rate, or type the combined state and local rate from your receipt.',
  howTo: [
    'Choose Add tax to go from a price to a total, or Remove tax to work back from a total to the price before tax.',
    'Enter the amount in dollars.',
    'Pick your state to load its statewide rate, or keep Custom rate and type the combined rate for your city or county.',
    'Read the total, the tax and the formula. To check a receipt, use Find the tax rate from a receipt with the subtotal and the total paid.',
  ],
  sections: [
    {
      heading: 'How to calculate sales tax',
      body: [
        'Sales tax is the price multiplied by the tax rate. Convert the rate to a decimal by dividing by 100, multiply, then add the tax to the price: total = price × (1 + rate ÷ 100).',
        'For example, a $100.00 purchase at California’s 7.25% statewide rate carries $7.25 of tax, for a total of $107.25. In New York City, where the combined rate is 8.875%, a $19.99 item has $1.77 of tax (1.7741 rounded) and costs $21.76.',
        'Stores round the tax to the nearest cent, normally half up, and most compute it on the whole receipt rather than item by item. That is why adding up rounded taxes from separate items can be a cent or two off from the receipt.',
      ],
    },
    {
      heading: 'How to remove sales tax from a total (reverse sales tax)',
      body: [
        'To find the price before tax, divide the total by 1 plus the rate as a decimal: price = total ÷ (1 + rate ÷ 100). The tax is the total minus that price.',
        'Example: you paid $54.11 where the rate is 8.25%. $54.11 ÷ 1.0825 = $49.99, so the tax was $4.12. This is how you back out tax for an expense report or check what a tax-inclusive price really cost.',
        'Because tax is rounded to the cent, some totals cannot come from any whole-cent price. At 8.25%, a $49.87 item totals $53.98 and a $49.88 item totals $54.00, so a $53.99 total is impossible. The calculator tells you when that happens and shows the nearest price instead.',
      ],
    },
    {
      heading: 'State sales tax rates in 2026 and why your rate may be higher',
      body: [
        'The state presets use the statewide rate in effect in 2026 (Tax Foundation, July 2026). California has the highest statewide rate at 7.25%, followed by Indiana, Mississippi, Rhode Island and Tennessee at 7%. Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire and Oregon, although many Alaska cities and boroughs charge a local one.',
        'Most states also let counties, cities and special districts add their own tax, and that local part can be large. Louisiana’s state rate is 5% but its average combined rate is about 10.13%, the highest in the country; Tennessee averages about 9.61%, Washington 9.57%, Arkansas 9.48% and Alabama 9.46%. Chicago’s combined rate is 10.25%.',
        'For an exact answer, find the combined rate for the address where you buy or where an order is delivered (your state revenue department has a lookup tool), choose Custom rate, and type it in. The note under the inputs shows the average combined rate for the selected state as a guide.',
      ],
    },
    {
      heading: 'What is and isn’t taxed',
      body: [
        'Sales tax rules differ by item as well as by place. Most states exempt groceries or tax them at a reduced rate, and prescription drugs are exempt almost everywhere. A few states, such as Pennsylvania, New Jersey and Minnesota, generally exempt clothing. Prepared food, alcohol and digital products are often taxed at the full rate or more.',
        'Online orders are taxed too. Since the Supreme Court’s 2018 South Dakota v. Wayfair decision, states can require out-of-state sellers to collect sales tax, so most large retailers charge the rate for your delivery address. If a seller doesn’t collect it, your state may expect you to pay use tax at the same rate.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate sales tax on a price?',
      a: 'Multiply the price by the rate divided by 100. At 6.25%, the tax on $80 is 80 × 0.0625 = $5.00 and the total is $85.00.',
    },
    {
      q: 'How do I figure out the price before tax?',
      a: 'Divide the total by 1 plus the rate as a decimal. With an 8% rate, a $54.00 total means a $50.00 price and $4.00 of tax.',
    },
    {
      q: 'Which states have no sales tax?',
      a: 'Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax. Local governments in Alaska can still charge one, averaging about 1.8%.',
    },
    {
      q: 'Which state has the highest sales tax?',
      a: 'California has the highest statewide rate at 7.25%. Including local taxes, Louisiana has the highest average combined rate at about 10.13%, followed by Tennessee and Washington.',
    },
    {
      q: 'Why doesn’t the state preset match my receipt?',
      a: 'The preset is the statewide rate only. Counties, cities and special districts usually add their own tax. Type the combined rate from your receipt or your state’s rate lookup to get the exact amount.',
    },
    {
      q: 'How can I find the tax rate from a receipt?',
      a: 'Use Find the tax rate from a receipt: enter the subtotal before tax and the total paid. The rate is (total − subtotal) ÷ subtotal × 100. Small purchases give an approximate rate because the tax is rounded to the cent.',
    },
    {
      q: 'Is sales tax charged on shipping?',
      a: 'It depends on the state. Some tax shipping and handling when the item itself is taxable, others don’t tax it if it is listed separately. Check your state revenue department’s guidance.',
    },
  ],
  related: ['tip-calculator', 'fraction-calculator', 'time-card-calculator', 'gpa-calculator', 'word-counter'],
  priority: 75,
  updated: '2026-10-29',
});

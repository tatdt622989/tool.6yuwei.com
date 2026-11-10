import { defineTool } from '../types';

export default defineTool({
  slug: 'unit-price',
  name: 'Unit Price Calculator',
  seoTitle: 'Unit Price Calculator: Compare Price per Ounce, Pound or Item',
  description:
    'Free unit price calculator: enter the price and size of up to 6 options to compare the price per ounce, pound, fl oz or item and see which is the better deal.',
  category: 'calc',
  icon: 'Scale',
  keywords: [
    'unit price calculator',
    'price per ounce calculator',
    'price per unit calculator',
    'which is the better deal calculator',
    'cost per ounce calculator',
    'price per pound calculator',
    'unit price comparison',
    'cost per unit calculator',
  ],
  intro:
    'Bigger is not always cheaper. Enter the price and size of each option to put them on the same unit, see which is the better deal and how much more the others cost.',
  howTo: [
    'For each option, enter the “Price ($)”, the “Size per pack” and its unit, such as $12.97 for 92 fl oz. For a multipack, put the number of packs in “Packs”; leave it blank for a single item. Not sure where to start? Tap “Fill in an example”.',
    'Tap “Add option” to compare up to 6 options. Ounces and pounds, fluid ounces and gallons, and metric sizes are converted before they are compared.',
    'Ordering online or using a coupon? Open “Shipping and discount (optional)” and fill in “Shipping ($)” and “Discount (% off)”.',
    'Read which option is the “Best value”, the unit price of each one, and how much more the others cost in percent and in dollars for the same amount. “Copy result” gives you a short text summary to paste anywhere.',
  ],
  sections: [
    {
      heading: 'How to calculate unit price',
      body: [
        'Unit price is what you pay divided by how much you get. A 92 fl oz bottle of laundry detergent for $12.97 costs 12.97 ÷ 92 ≈ $0.141 per fl oz. A 154 fl oz jug for $19.94 costs about $0.129 per fl oz. The jug is the better deal: the bottle costs 8.9% more per fl oz, which is $1.06 extra over its 92 fl oz.',
        'The calculator picks a base that is easy to read. Weights are shown per oz, or per lb once every option holds at least a pound. Liquids are shown per fl oz, or per gallon once every option holds at least a gallon. If you enter only metric sizes you get a price per 100 g or 100 ml (per kg or liter for large sizes). Counted items are shown per item, or per 100 when a single one costs less than ten cents, such as paper towel sheets.',
        'Sizes in different units are converted exactly before comparing: 1 lb is 16 oz or 453.59237 g, and 1 US gallon is 128 US fl oz or 3,785.411784 ml. A 12 oz bag of coffee for $9.99 is about $0.83 per oz, while a 2 lb bag for $21.99 is 32 oz, or about $0.69 per oz. Weight, volume and count cannot be converted into each other, so if you mix them the calculator tells you instead of guessing.',
      ],
    },
    {
      heading: 'When the bigger pack is not the better deal',
      body: [
        'Family size, value pack and club pack are marketing names, not promises. Mid-size packages go on sale more often, multipacks can hold smaller units, and a refill pouch can cost more per ounce than the bottle it refills. Paper towels are a classic case: 6 rolls of 110 sheets for $9.98 is 660 sheets, or $1.51 per 100 sheets, while 8 rolls of 165 sheets for $17.48 is 1,320 sheets, or $1.32 per 100 sheets. Comparing by roll would hide that the rolls are different sizes.',
        'Shrinkflation is the same trap over time: the price stays put while the package gets smaller. A cereal box that drops from 18 oz to 16.8 oz at the same $5.99 goes from about $0.333 to $0.357 per oz, a 7.1% price increase that never shows on the price tag. Checking the unit price is the only reliable way to notice it, whether it is an ordinary week, a holiday sale or a coupon event.',
      ],
    },
    {
      heading: 'Unit price labels in stores and online',
      body: [
        'Many US grocery stores print a unit price on the shelf tag, but there is no federal law that requires it. The rules come from the states: some, many of them in the Northeast, require unit pricing in larger stores, and others leave it to retailers, who may follow voluntary guidelines published by NIST. That is why tags vary so much. Two similar products can be labeled per ounce and per pound, or per count and per 100 count, and a sale tag does not always show the unit price at the sale price.',
        'Online listings often show no unit price at all, or one based on the list price before coupons and shipping. Add those yourself. A 2-pack of 100 fl oz jugs listed at $27.98 with 15% off comes to $23.78, and $5.99 shipping makes it $29.77 for 200 fl oz: about $0.149 per fl oz, or 15% more than the $0.129 jug from the store. The calculator applies the discount to the price first and then adds shipping, so the shipping fee is never discounted.',
      ],
    },
    {
      heading: 'When the lowest unit price is not the best buy',
      body: [
        'Unit price only answers which option is cheapest for the same amount. A gallon of something you will use half of before it expires is not a bargain, and a bulk pack needs storage space and cash up front. For something new, the smaller size at a higher unit price is the cheaper way to find out whether you like it.',
        'Make sure you are comparing like with like. Concentrated detergents wash more loads per ounce, so compare them per load: enter the number of loads as the size and choose “loads” as the unit. Paper products differ in ply and sheet size, and store brands differ in quality. The calculator compares quantity and price only; the rest is your call.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do you calculate price per ounce?',
      a: 'Divide the price by the number of ounces. A 12 oz box for $4.29 costs 4.29 ÷ 12 ≈ $0.36 per oz. If the size is in pounds, multiply by 16 first: 1.7 lb is 27.2 oz.',
    },
    {
      q: 'Can I compare ounces with pounds, or ounces with grams?',
      a: 'Yes. Weights are converted before comparing, and so are volumes. For example, $8.49 for 1.7 lb is about $0.31 per oz, which beats $5.99 for 18 oz at about $0.33 per oz.',
    },
    {
      q: 'Is the bigger package always cheaper per unit?',
      a: 'No. Larger sizes are often cheaper per unit, but sales, coupons and multipacks with smaller units regularly make a smaller package the better deal. Check the unit price each time.',
    },
    {
      q: 'Can I compare ounces (weight) with fluid ounces?',
      a: 'No. An ounce measures weight and a fluid ounce measures volume, and converting between them depends on the product. If your options mix weight, volume and count, the calculator shows a message instead of a ranking.',
    },
    {
      q: 'Does the calculator include shipping, coupons and sales tax?',
      a: 'It can add a shipping fee and take a percent-off discount for each option. Sales tax is not included; when every option is taxed at the same rate, tax does not change which one is the better deal.',
    },
    {
      q: 'Is anything I type uploaded?',
      a: 'No. The math runs in your browser. Your list is saved only in this browser so it is still there next time, and “Clear” removes it.',
    },
  ],
  related: ['discount-calculator', 'deal-compare', 'cart-filler', 'percentage-calculator', 'split-bill', 'unit-converter'],
  priority: 76,
  updated: '2026-11-10',
});

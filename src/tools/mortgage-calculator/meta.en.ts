import { defineTool } from '../types';

export default defineTool({
  slug: 'mortgage-calculator',
  name: 'Mortgage Calculator',
  seoTitle: 'Mortgage Calculator: Monthly Payment with Taxes, Insurance and HOA',
  description:
    'Free mortgage calculator. Enter home price, down payment, rate and term to estimate your monthly payment with property tax, insurance and HOA, plus total interest.',
  category: 'calc',
  icon: 'House',
  keywords: [
    'mortgage calculator',
    'mortgage payment calculator',
    'home loan calculator',
    'house payment calculator',
    'monthly mortgage payment',
    'mortgage calculator with taxes and insurance',
    'piti calculator',
    'mortgage calculator with hoa',
    'mortgage amortization calculator',
    '30 year mortgage calculator',
    '15 year mortgage calculator',
    'mortgage interest calculator',
    'down payment calculator',
    'how much house can i afford',
  ],
  intro:
    'Estimate your monthly house payment, including principal, interest, property tax, homeowners insurance and HOA dues, and see how much interest you will pay over the life of the loan.',
  howTo: [
    'Enter the home price and your down payment as a percentage of the price, for example 20.',
    'Enter the interest rate and the loan term in years, usually 30 or 15.',
    'Optionally add yearly property tax, yearly homeowners insurance and monthly HOA dues. Set them to 0 to see principal and interest only.',
    'Read your estimated monthly payment and the breakdown below it, then tap a year in the amortization schedule to see each month.',
  ],
  sections: [
    {
      heading: 'How your mortgage payment is calculated',
      body: [
        'A fixed-rate mortgage is repaid in equal monthly payments. The principal and interest part is P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r the monthly rate (the annual rate ÷ 12) and n the number of payments (360 for a 30-year loan). Most lenders also collect property tax and homeowners insurance each month through an escrow account, so your real house payment is PITI: principal, interest, taxes and insurance, plus HOA dues if you have them.',
        'The default example is a $350,000 home with 20% down, so you borrow $280,000 at 6.5% for 30 years. Principal and interest come to $1,769.79 a month. Add $3,850 a year in property tax ($320.83 a month) and $1,800 a year in insurance ($150 a month) and the total is about $2,240.62 a month.',
        'Early payments are mostly interest. In the first month of that loan, $1,516.67 goes to interest and only $253.12 to principal, and it takes until payment 233, almost 20 years in, before more of each payment goes to principal than to interest. Over 30 years you would pay about $357,125 in interest, more than the amount you borrowed.',
      ],
    },
    {
      heading: '15-year vs 30-year mortgage',
      body: [
        'A 15-year loan has a much higher monthly payment but saves a large amount of interest. The same $280,000 at 6.5% costs $2,439.10 a month over 15 years with about $159,038 of interest, compared with $1,769.79 a month and $357,125 of interest over 30 years. Lenders also usually price 15-year loans lower; at 5.75% the 15-year payment would be $2,325.15 with about $138,527 of interest.',
        'A 30-year loan gives you a lower required payment and more flexibility. If you want the best of both, you can take a 30-year loan and make extra principal payments when you can afford them, as long as the loan has no prepayment penalty.',
      ],
    },
    {
      heading: 'Down payment and PMI',
      body: [
        'With a conventional loan and less than 20% down, lenders require private mortgage insurance (PMI), typically 0.3% to 1.5% of the loan amount a year. Under the Homeowners Protection Act you can ask to cancel PMI once your balance reaches 80% of the home’s original value, and it ends automatically at 78%. FHA loans allow 3.5% down but charge their own mortgage insurance premium, which often lasts for the life of the loan.',
        'Putting 10% down on the same $350,000 home means borrowing $315,000. At 6.5% for 30 years that is $1,991.01 a month in principal and interest before PMI, about $221 more than with 20% down.',
      ],
    },
    {
      heading: 'How much house can you afford?',
      body: [
        'A common guideline is the 28/36 rule: keep your total housing payment at or below 28% of your gross monthly income, and all debt payments, including car loans, student loans and credit cards, at or below 36%. The $2,240.62 payment above fits the 28% guideline with a gross income of about $8,000 a month, or roughly $96,000 a year.',
        'Rates matter as much as price. On a $280,000 loan, each half-point is worth about $90 a month: $1,678.74 at 6%, $1,769.79 at 6.5% and $1,862.85 at 7%. Over 30 years the difference between 6% and 7% is about $66,000 in interest, so it pays to compare offers from several lenders on the same day.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the monthly payment on a $300,000 mortgage?',
      a: 'At 6.5% for 30 years, principal and interest are about $1,896.20 a month. At 5.5% it is about $1,703.37, and at 7.5% about $2,097.64. Property tax, insurance and any HOA dues are added on top.',
    },
    {
      q: 'What does PITI mean?',
      a: 'Principal, interest, taxes and insurance, the four parts of a typical monthly mortgage payment. Enter your property tax and insurance in the optional fields to see your full PITI payment.',
    },
    {
      q: 'Does this mortgage calculator include PMI?',
      a: 'No. If your down payment is under 20%, the calculator reminds you that PMI usually applies. Ask your lender for the exact PMI rate and add it to the monthly total.',
    },
    {
      q: 'How much does a 1% higher rate cost?',
      a: 'On a $280,000, 30-year loan, going from 6% to 7% raises the payment from $1,678.74 to $1,862.85, about $184 a month, and adds roughly $66,000 of interest over the life of the loan.',
    },
    {
      q: 'Is this for fixed-rate or adjustable-rate mortgages?',
      a: 'It assumes a fixed rate for the whole term. For an adjustable-rate mortgage (ARM), you can use it to estimate the payment during the initial fixed period, then try a higher rate to see what could happen after the first adjustment.',
    },
    {
      q: 'Is my information saved?',
      a: 'Everything is calculated in your browser and nothing is sent to a server. Your last inputs are stored only on your own device.',
    },
  ],
  related: ['loan-calculator', 'compound-interest', 'percentage-calculator', 'unit-converter', 'calculator'],
  priority: 80,
  updated: '2026-10-29',
});

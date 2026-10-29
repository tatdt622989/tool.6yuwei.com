import { defineTool } from '../types';

export default defineTool({
  slug: 'compound-interest',
  name: 'Compound Interest Calculator',
  seoTitle: 'Compound Interest Calculator with Monthly Contributions',
  description:
    'Free compound interest calculator with monthly contributions. See your future balance, total interest earned, APY and a year-by-year growth table.',
  category: 'calc',
  icon: 'TrendingUp',
  keywords: [
    'compound interest calculator',
    'compound interest calculator with monthly contributions',
    'compound interest calculator monthly',
    'daily compound interest calculator',
    'compound interest formula',
    'savings calculator',
    'investment calculator',
    'savings growth calculator',
    'future value calculator',
    'apy calculator',
    'rule of 72',
    'how much will my savings grow',
    'retirement savings calculator',
    'interest on interest',
  ],
  intro:
    'See how a starting deposit and regular monthly savings grow when interest earns interest. Change the rate, years or compounding frequency and the year-by-year table updates instantly.',
  howTo: [
    'Enter your initial deposit. If you are only saving monthly, enter 0.',
    'Enter your monthly contribution. The calculator adds it at the end of each month.',
    'Fill in the annual interest rate or expected return, the years to grow, and pick a compound frequency (savings accounts usually compound daily or monthly).',
    'Read your future balance, total contributions, total interest and APY at the top, then check the year-by-year breakdown below.',
  ],
  sections: [
    {
      heading: 'The compound interest formula',
      body: [
        'For a single deposit the formula is A = P × (1 + r/n)^(n × t), where P is the starting amount, r the annual rate as a decimal, n the number of times interest compounds per year, and t the number of years. $10,000 at 5% compounded once a year grows to about $16,289 in 10 years. Compounded monthly it reaches about $16,470, and daily about $16,487.',
        'Regular contributions are handled month by month: the calculator converts the annual rate into an equivalent monthly rate for the compounding frequency you chose, grows the balance, then adds that month’s deposit. The result matches the textbook future value of an annuity formula, so you can use it for savings goals, brokerage accounts or a 401(k) estimate.',
      ],
    },
    {
      heading: 'Why starting early matters so much',
      body: [
        'Time does more of the work than the amount you save. Putting $300 a month into an account that earns 7% a year grows to about $787,000 after 40 years, even though you only contributed $144,000. Start 10 years later and save the same $300 a month for 30 years, and you end up with roughly $366,000, less than half as much, despite contributing only $36,000 less.',
        'The default example on this page, $10,000 plus $500 a month at 7% for 20 years, ends near $300,900. Only $130,000 of that is money you put in; the other $170,900 is interest. In the year-by-year table you can see the yearly interest eventually overtake your yearly contributions, which is the point where compounding starts to snowball.',
      ],
    },
    {
      heading: 'APR, APY and compounding frequency',
      body: [
        'Banks quote two numbers. The interest rate (or APR) is the nominal yearly rate. The APY, or annual percentage yield, is what you actually earn in a year once compounding is included. A 4.5% rate compounded daily is a 4.602% APY; 5% compounded monthly is a 5.116% APY. The “Effective annual rate (APY)” box shows this figure for the frequency you selected.',
        'When comparing high-yield savings accounts or CDs, compare APYs, since banks are required to disclose them under the Truth in Savings Act. For stocks and index funds there is no compounding schedule; returns vary every year, so enter a long-run average (many people use 5% to 7% after inflation) and treat the result as a rough projection.',
      ],
    },
    {
      heading: 'The rule of 72',
      body: [
        'To estimate how long money takes to double, divide 72 by the annual rate. At 6% it takes about 12 years, and at 8% about 9 years. The exact answers with annual compounding are 11.9 and 9.0 years, so the shortcut is very close for everyday rates.',
        'The rule works in reverse too. To double your money in 10 years you need roughly a 7.2% return. It also shows the cost of inflation: at 3% inflation, prices double in about 24 years, so the same dollar buys half as much.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do you calculate compound interest?',
      a: 'Multiply the starting amount by (1 + r/n) raised to the power n × t, where r is the annual rate, n the compounding periods per year and t the years. This calculator does that month by month and also adds your monthly contributions.',
    },
    {
      q: 'How much is $10,000 worth in 10 years with compound interest?',
      a: 'At 5% it grows to about $16,289 with annual compounding, $16,470 with monthly compounding, and $16,487 with daily compounding. At 7% compounded monthly it becomes about $20,097.',
    },
    {
      q: 'Is daily or monthly compounding better?',
      a: 'More frequent compounding pays slightly more at the same rate, but the difference is small: $10,000 at 5% for 10 years earns only about $17 more with daily compounding than with monthly. The rate itself matters far more.',
    },
    {
      q: 'Does this include taxes and inflation?',
      a: 'No. Interest in a regular savings or brokerage account is usually taxable, while 401(k)s and IRAs grow tax-deferred or tax-free. To see results in today’s dollars, subtract expected inflation from your rate, for example use 4% instead of 7%.',
    },
    {
      q: 'Can I use this for a 401(k) or index fund?',
      a: 'Yes, as an estimate. Enter your current balance, your monthly contribution (including any employer match) and an average annual return. Real market returns go up and down, so the result is a projection, not a guarantee.',
    },
    {
      q: 'Are my numbers saved anywhere?',
      a: 'Everything is calculated in your browser. Your last inputs are remembered only on your own device so they are there next time.',
    },
  ],
  related: ['deposit-interest', 'loan-calculator', 'mortgage-calculator', 'percentage-calculator', 'calculator'],
  priority: 55,
  updated: '2026-10-29',
});

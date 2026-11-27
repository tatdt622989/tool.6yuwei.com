import { defineTool } from '../types';

export default defineTool({
  slug: 'loan-calculator',
  name: 'Loan Calculator',
  seoTitle: 'Loan Calculator: Monthly Payment, APR with Fees and Amortization',
  description:
    'Free personal loan calculator. Enter the amount, rate, term and origination fee to see your monthly payment, total interest, true APR and amortization schedule.',
  category: 'finance',
  icon: 'HandCoins',
  keywords: [
    'loan calculator',
    'personal loan calculator',
    'loan payment calculator',
    'monthly loan payment calculator',
    'loan calculator with origination fee',
    'apr calculator',
    'personal loan apr calculator',
    'origination fee calculator',
    'loan amortization calculator',
    'amortization schedule',
    'how much will my loan payment be',
    'debt consolidation loan calculator',
    'auto loan calculator',
    'simple loan calculator',
  ],
  intro:
    'Work out the monthly payment on a personal loan, the total interest you will pay, and the real APR once the origination fee is counted, so you can compare loan offers side by side.',
  howTo: [
    'Enter the loan amount in dollars and the loan term in months, for example 60 for a five-year loan.',
    'Enter the interest rate the lender quoted.',
    'Enter any origination fee or other upfront fee. Enter 0 if the lender charges none.',
    'Read the monthly payment, APR including fees, total interest and total cost at the top, and scroll the amortization schedule for every payment.',
  ],
  sections: [
    {
      heading: 'How your loan payment is calculated',
      body: [
        'Personal loans, auto loans and most other installment loans are fully amortizing: you pay the same amount every month, and each payment covers that month’s interest first, with the rest going to principal. The formula is payment = P × r ÷ (1 − (1 + r)^−n), where P is the loan amount, r the monthly rate (the annual rate ÷ 12) and n the number of payments.',
        'For example, a $15,000 loan at 12% for 60 months costs $333.67 a month. Over five years you pay $20,020 in total, of which $5,020 is interest. In the schedule you can see that the first payment includes $150 of interest, while the last one includes only about $3.',
      ],
    },
    {
      heading: 'Interest rate vs APR: why the fee matters',
      body: [
        'Many online lenders charge an origination fee of 1% to 10% and subtract it from the money they send you. You still repay the full loan amount, so the fee raises your real cost. That is what APR (annual percentage rate) captures, and lenders must disclose it under the federal Truth in Lending Act.',
        'Take the default example: $15,000 at 12% for 60 months with a $450 (3%) origination fee. You receive $14,550 but make the same $333.67 payments, which works out to an APR of about 13.35% and a total cost of $5,470. When comparing offers, compare APRs, not the advertised rates.',
        'A fee hurts most on short loans. The same $450 fee on a 36-month loan pushes the APR from 12% to about 14.13%, because it is spread over fewer payments.',
      ],
    },
    {
      heading: 'Shorter term or lower payment?',
      body: [
        'A longer term lowers the monthly payment but raises the total interest. Borrowing $15,000 at 12% costs $498.21 a month over 36 months with $2,936 of interest, or $333.67 a month over 60 months with $5,020 of interest. Pick the shortest term whose payment fits comfortably in your budget.',
        'Your credit score has an even bigger effect. A $20,000, five-year loan at 8% costs $405.53 a month and $4,332 in interest; at 18% it costs $507.87 a month and $10,472 in interest. Checking your rate with several lenders through a soft credit pull can save thousands.',
      ],
    },
    {
      heading: 'Using a personal loan to pay off credit cards',
      body: [
        'Debt consolidation is the most common reason people take out a personal loan. If you pay off $5,000 of credit card debt at 24% over three years, you pay about $2,062 in interest. Move it to a 36-month personal loan at 11% and the interest drops to about $893, with a payment of $163.69 instead of $196.16.',
        'This only helps if the new APR, including any fee, is lower than your card rate and you stop adding new balances to the cards. Also check whether the loan has a prepayment penalty; most personal loans today do not.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the monthly payment on a $10,000 loan?',
      a: 'At 10% for 36 months the payment is about $322.67, and you pay about $1,616 in interest. Over 60 months the payment drops but the total interest rises. Enter your own rate and term above to see the exact figures.',
    },
    {
      q: 'What is the difference between interest rate and APR?',
      a: 'The interest rate is what the lender charges on the balance. APR adds upfront fees such as the origination fee and expresses the total cost as a yearly rate. With no fees the two are the same; with fees the APR is always higher.',
    },
    {
      q: 'How does an origination fee work?',
      a: 'Most lenders deduct it from the loan proceeds. On a $15,000 loan with a 3% fee you receive $14,550 but repay $15,000 plus interest. Enter the fee in dollars and the calculator includes it in the APR and total cost.',
    },
    {
      q: 'Can I use this as an auto loan calculator?',
      a: 'Yes. Enter the car price minus your down payment and trade-in as the loan amount, the dealer or bank rate, and a term such as 60 or 72 months. Add sales tax and dealer fees to the loan amount if you are financing them.',
    },
    {
      q: 'Does paying extra each month save interest?',
      a: 'Yes. Extra payments go straight to principal, which lowers the interest charged in every later month and shortens the loan. Ask your lender to apply extra money to principal and confirm there is no prepayment penalty.',
    },
    {
      q: 'Is my information stored or shared?',
      a: 'No. All calculations run in your browser, nothing is sent to a server, and no credit check is involved. Your last inputs are remembered only on your device.',
    },
  ],
  related: ['mortgage-calculator', 'compound-interest', 'deposit-interest', 'percentage-calculator', 'calculator'],
  priority: 80,
  updated: '2026-10-29',
});

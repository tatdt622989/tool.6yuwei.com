import { defineTool } from '../types';

export default defineTool({
  slug: 'deposit-interest',
  name: 'CD and Savings Interest Calculator',
  seoTitle: 'CD Calculator: Savings Interest with APY, APR and Deposits',
  description:
    'Free CD and savings interest calculator. Enter a deposit, APY or APR and term to see interest earned, your ending balance and a month-by-month schedule.',
  category: 'finance',
  icon: 'Landmark',
  keywords: [
    'cd calculator',
    'cd interest calculator',
    'savings interest calculator',
    'savings calculator',
    'high yield savings calculator',
    'interest calculator',
    'apy calculator',
    'apy vs apr',
    'certificate of deposit calculator',
    'how much interest will i earn',
    'cd rates calculator',
    'savings account interest calculator',
    'monthly deposit savings calculator',
    '12 month cd calculator',
  ],
  intro:
    'See how much interest a CD or savings account will earn. Enter the deposit, the APY or APR and the term, and get your interest, ending balance and a month-by-month schedule.',
  howTo: [
    'Choose “CD or one-time deposit” or “Savings with monthly deposits”.',
    'Enter the deposit amount (or your starting balance and monthly deposit), the rate and the term in months.',
    'Pick “APY” if you are entering the yield your bank advertises, or “Interest rate (APR)” and a compounding frequency if you know the nominal rate.',
    'Read your interest earned, ending balance and the equivalent rate, then scroll the month-by-month schedule.',
  ],
  sections: [
    {
      heading: 'How CD and savings interest is calculated',
      body: [
        'Banks in the US advertise APY, the annual percentage yield. APY already includes compounding, so it tells you exactly what a deposit earns in one year: $10,000 in a 12-month CD at 4.50% APY earns $450.00 and ends at $10,450.00, whether the bank compounds daily or monthly.',
        'For longer terms, interest compounds on interest. A 5-year CD of $10,000 at 4.00% APY grows to 10,000 × 1.04⁵ ≈ $12,166.53, or $2,166.53 of interest, compared with $2,000 if the interest were simple. For a savings account with monthly deposits, starting with $1,000 and adding $200 a month at 4.50% APY gives about $3,503.11 after a year, of which $103.11 is interest.',
      ],
    },
    {
      heading: 'APY vs. APR (interest rate)',
      body: [
        'The interest rate, sometimes called APR, is the nominal rate before compounding. APY is what that rate actually earns after compounding. At the same 4.50% interest rate, daily compounding gives an APY of about 4.60%, monthly compounding about 4.59%, and annual compounding exactly 4.50%.',
        'When you compare accounts, compare APY to APY. Federal rules under Truth in Savings require banks to disclose the APY on deposit accounts, so that is the number to type in here in most cases. Use the APR option only when you have a nominal rate and know how often it compounds.',
      ],
    },
    {
      heading: 'Taxes, FDIC insurance and early withdrawal',
      body: [
        'Interest on CDs and savings accounts is generally taxable as ordinary income in the year it is credited, even if you leave it in the account. Your bank sends Form 1099-INT when you earn $10 or more in a year. If you are in the 22% federal bracket, $450 of interest means roughly $99 of federal income tax, plus any state income tax.',
        'Deposits at FDIC-insured banks (and NCUA-insured credit unions) are protected up to $250,000 per depositor, per institution, per ownership category. CDs usually charge an early withdrawal penalty, often several months of interest, so only lock up money you won’t need before the term ends. Building a CD ladder, with CDs maturing at different times, keeps part of your savings available every few months.',
      ],
    },
  ],
  faq: [
    {
      q: 'How much interest will $10,000 earn in a 12-month CD?',
      a: 'At 4.50% APY it earns $450.00. At 4.00% APY it earns $400.00. Enter your own rate and term above to see the exact amount.',
    },
    {
      q: 'What is the difference between APY and interest rate?',
      a: 'The interest rate is the nominal yearly rate. APY includes the effect of compounding, so it is slightly higher when interest compounds more than once a year. APY is the better number for comparing accounts.',
    },
    {
      q: 'Does compounding daily vs. monthly matter?',
      a: 'Only a little. At a 4.50% interest rate, daily compounding gives a 4.60% APY and monthly compounding gives 4.59%. If the bank quotes APY, compounding is already included.',
    },
    {
      q: 'Do I have to pay taxes on CD interest?',
      a: 'Generally yes. CD and savings interest is taxed as ordinary income in the year it is credited, and banks report it on Form 1099-INT when it is $10 or more. Interest inside an IRA follows IRA rules instead.',
    },
    {
      q: 'What happens if I withdraw from a CD early?',
      a: 'Most banks charge an early withdrawal penalty, commonly a few months to a year of interest depending on the term. Some no-penalty CDs let you withdraw after the first week, usually at a lower rate.',
    },
    {
      q: 'Is my information saved?',
      a: 'Everything is calculated in your browser. The calculator only remembers your last entries on your own device.',
    },
  ],
  related: ['compound-interest', 'loan-calculator', 'mortgage-calculator', 'percentage-calculator', 'exchange-rate'],
  priority: 78,
  updated: '2026-10-29',
});

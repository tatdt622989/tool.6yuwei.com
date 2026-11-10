import { defineTool } from '../types';

export default defineTool({
  slug: 'work-hours-cost',
  name: 'Work Hours Calculator',
  seoTitle: 'Work Hours Calculator: How Long Do You Work to Afford It?',
  description:
    'Turn any price into work time. Enter your salary or hourly wage and a price to see how many hours and working days it costs you, for one-off buys and habits.',
  category: 'finance',
  icon: 'ShoppingBag',
  keywords: [
    'work hours calculator',
    'how many hours of work to afford',
    'time cost calculator',
    'price in work hours',
    'how long do i have to work to buy',
    'cost in hours worked',
    'salary to hourly rate',
    'latte factor calculator',
  ],
  intro:
    'Enter your pay and a price to see what it costs in your own working time: days, hours and the share of a month’s pay. Switch to a recurring cost to see what a daily coffee or a subscription adds up to over a year.',
  howTo: [
    'Under “Your pay and hours” (the “Use my pay” link in the result jumps there), choose Monthly, Yearly or Hourly and enter the amount. Check “Working days per month” and “Paid hours per day”; your hourly rate appears below them.',
    'At the top, choose “One-off purchase” and type the amount under “Price”, or tap one of the example prices below the result and edit it.',
    'The big number is how long you work to earn that amount. The line under it turns it into “start on Monday at 9:00 AM and you have earned it by…”, and the squares show how many working days it takes up.',
    'For a daily coffee or a monthly subscription, choose “Recurring cost”, then fill in “Cost each time” and “How often” to see the cost per year and the working time it takes.',
    'Press “Copy link to this result” to send the result to someone. The link includes the pay and price you entered.',
  ],
  sections: [
    {
      heading: 'How a price is converted into work time',
      body: [
        'First your pay becomes an hourly rate: monthly pay divided by working days per month times paid hours per day. An annual salary is divided by 12 first, and an hourly wage is used as it is. The price divided by that rate is the number of hours, which is then split into working days and hours using your paid hours per day.',
        'With the starting values, $60,000 a year is $5,000 a month. At 22 working days of 7.5 paid hours, that is 165 hours a month, or $30.30 an hour. A $1,000 phone then costs 33 hours of work: 4 working days and 3 hours, or 20% of a month’s pay. At $20 an hour and 8-hour days, the same phone is 50 hours, which is 6 working days and 2 hours.',
        'If you prefer the common 2,080-hour work year (40 hours a week for 52 weeks), set working days per month to 21.67 and paid hours per day to 8. For $60,000 a year that gives about $28.84 an hour.',
        'The “start on Monday” sentence assumes you work Monday to Friday and put in your paid hours in a row from 9:00 AM each day, with breaks left out. In the phone example you would be done by 12:00 PM on Friday. It is a way to picture the hours, not a real schedule.',
      ],
    },
    {
      heading: 'Gross pay, take-home pay and other limits',
      body: [
        'The calculator converts whatever pay you enter, and the fields are labeled as gross pay. Taxes, payroll deductions and benefits are not taken off, and neither are rent, food or other costs you cannot skip. So the result answers “how much of my paid time is this price worth?”, not “how long until I have saved this much?”. Saving up for something takes longer than the time shown.',
        'To see the figure against take-home pay, enter your net pay per month or per year instead of your gross pay. The hourly rate drops and every result grows accordingly.',
        'Bonuses, overtime pay and tips only count if you include them in the pay you enter. Commuting time and unpaid overtime are not counted. Adjust working days and paid hours to match your own schedule, including part-time work.',
      ],
    },
    {
      heading: 'Why a price in hours feels different',
      body: [
        'A price tag is the same for everyone, but the time it takes to earn it is not. $300 and $3,000 differ by one zero on the tag. At the rate above they are “a bit more than a day of work” and “more than two and a half weeks of work”, which is easier to tell apart. The conversion puts the price into a unit that is personal to you.',
        'Small, regular costs are the easiest to overlook, which is why they are sometimes called the latte factor. A few dollars at a time looks like nothing until it is multiplied by the number of times in a year. Seeing the total as working days shows the size of the cost. Whether it is worth it is your call; the tool does not judge that.',
      ],
    },
    {
      heading: 'Worked example: a coffee every workday',
      body: [
        'Take the same pay as above: $60,000 a year, 22 working days a month, 7.5 paid hours a day, so $30.30 an hour. A $5 coffee every workday is bought 22 × 12 = 264 times a year and costs $1,320. That is 43.56 hours of work, or 5 working days, 6 hours and 4 minutes: 2.2% of your working time for the year. One coffee is about 10 minutes of work.',
        'A $15 monthly subscription is $180 a year, which is just under 6 hours of work. A $60 dinner out every week is 52 dinners and $3,120 a year, or about 103 hours: 13.7 working days.',
        'The “How often” options count as follows: Workdays is your working days per month times 12, Daily is 365 times a year, Weekly is 52 and Monthly is 12. The example prices are round numbers to start from; replace them with what you actually pay.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many hours do I have to work to buy a $1,000 phone?',
      a: 'It depends on your hourly rate. At $30.30 an hour ($60,000 a year, 22 working days a month, 7.5 paid hours a day) it is 33 hours. At $20 an hour it is 50 hours, and at $100,000 a year on the same schedule it is just under 20 hours. Enter your own pay to get your number.',
    },
    {
      q: 'How do I turn an annual salary into an hourly rate?',
      a: 'Divide by 12, then by your paid hours in a month (working days times paid hours per day). The calculator shows this rate under your pay settings. For the common 2,080-hour year, set 21.67 working days and 8 paid hours.',
    },
    {
      q: 'Is the result based on gross or take-home pay?',
      a: 'It uses the pay you enter, and the fields are meant for gross pay, so taxes, deductions and living costs are not taken off. Enter your net pay instead if you want the result against take-home pay.',
    },
    {
      q: 'What is the difference between “Workdays” and “Daily”?',
      a: '“Workdays” counts only the days you work: working days per month times 12, so 264 times a year at 22 days. “Daily” counts all 365 days. “Weekly” is 52 times a year and “Monthly” is 12.',
    },
    {
      q: 'Can I use it with an hourly wage or a part-time job?',
      a: 'Yes. Choose Hourly and enter your wage; it is used directly as the rate. Working days per month and paid hours per day are then only used to split the hours into working days and to work out the share of a month’s pay.',
    },
    {
      q: 'What does the shared link contain, and is my pay uploaded?',
      a: 'The link holds the pay, hours and price you entered so that the same result opens for the other person; do not share it if your pay should stay private. Nothing is uploaded: the math runs in your browser, and only your pay settings are saved in this browser for next time.',
    },
  ],
  related: ['salary-per-second', 'meeting-cost', 'life-in-weeks', 'salary-calculator', 'take-home-pay', 'compound-interest'],
  priority: 78,
  updated: '2026-11-10',
});

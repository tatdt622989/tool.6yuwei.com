import { defineTool } from '../types';

export default defineTool({
  slug: 'ovulation-calculator',
  name: 'Ovulation Calculator',
  seoTitle: 'Ovulation Calculator: Fertile Window and Ovulation Calendar',
  description:
    'Free ovulation calculator. Enter your last period and cycle length to find your ovulation day, fertile window and next period on a calendar for up to 6 cycles.',
  category: 'health',
  icon: 'Flower2',
  keywords: [
    'ovulation calculator',
    'fertility calculator',
    'ovulation calendar',
    'fertile window calculator',
    'when do i ovulate',
    'ovulation tracker',
    'most fertile days',
    'ovulation date calculator',
    'ovulation calculator to get pregnant',
    'period calculator',
    'next period calculator',
    'fertile days calculator',
    'how many days after period do you ovulate',
    'ovulation predictor',
  ],
  intro:
    'Enter the first day of your last period and your usual cycle length to estimate your ovulation day, your fertile window and your next period, with a color-coded calendar for the next 3 or 6 cycles.',
  howTo: [
    'Pick the “First day of your last period”: the day bleeding started, not the day it ended.',
    'Enter your usual “Cycle length (days)” and “Period length (days)”. Cycle length runs from the first day of one period to the first day of the next.',
    'Under “Cycles to show”, choose 3 or 6 cycles. The top of the results shows your next ovulation day, fertile window, next period and where you are in your cycle today.',
    'Use the “Fertility calendar” to see predicted period days, fertile days and ovulation day at a glance, and “Dates by cycle” for the same dates as a list.',
  ],
  sections: [
    {
      heading: 'How ovulation day is calculated',
      body: [
        'After you ovulate, the second half of your cycle (the luteal phase) lasts about 14 days for most people, and it varies much less than the first half. So ovulation is estimated as 14 days before your next period, not day 14 of your cycle. With a 28-day cycle you ovulate around cycle day 15; with a 35-day cycle, about a week later, around day 22.',
        'For example, if your last period started on October 20, 2026, your cycle is 28 days and your period lasts 5 days, your period runs October 20 to 24, your fertile window is October 29 to November 4, your estimated ovulation day is November 3, and your next period is due November 17.',
      ],
    },
    {
      heading: 'Your fertile window',
      body: [
        'Sperm can survive in the reproductive tract for up to 5 days, and an egg can be fertilized for about 12 to 24 hours after it is released. That makes the fertile window roughly the 5 days before ovulation, ovulation day itself, and the day after. The calculator marks all of them in green.',
        'Your chances are highest in the 2 or 3 days leading up to ovulation and on ovulation day. If you are trying to conceive, having sex every day or every other day during the fertile window works as well as trying to time a single day exactly.',
      ],
    },
    {
      heading: 'Confirm ovulation with your body’s signs',
      body: [
        'A calendar estimate is only as good as your past cycles. Ovulation predictor kits detect the LH surge in urine, and ovulation usually follows within 24 to 36 hours of a positive test. Start testing a few days before the fertile window shown here.',
        'Basal body temperature (BBT) rises by about 0.5 to 1 °F (0.3 to 0.5 °C) after ovulation and stays up until your next period. Taking it with a BBT thermometer each morning before you get up confirms ovulation after the fact, which helps you see your pattern over a few months. Cervical mucus that turns clear, slippery and stretchy, like raw egg white, is another sign that ovulation is near.',
      ],
    },
    {
      heading: 'Not birth control, and when to see a doctor',
      body: [
        'The days outside the fertile window are less fertile, not safe. Ovulation can come early or late because of stress, illness, travel, weight change or breastfeeding, and sperm live for days. According to the CDC, fertility awareness methods have a typical-use failure rate of up to 23% a year. If you don’t want to get pregnant, use condoms, the pill, an IUD or another method you have discussed with your doctor.',
        'ACOG recommends a fertility evaluation if you have been trying for 12 months without success, or after 6 months if you are 35 or older. See a doctor sooner if your cycles are usually shorter than 21 days or longer than 35 days, or vary by more than 7 to 9 days, since conditions such as polycystic ovary syndrome (PCOS) can affect ovulation.',
      ],
    },
  ],
  faq: [
    {
      q: 'When do I ovulate?',
      a: 'About 14 days before your next period starts. Count back 14 days from the date your next period is due: with a 28-day cycle that is around cycle day 15, with a 30-day cycle around day 17, and with a 25-day cycle around day 12.',
    },
    {
      q: 'What are my most fertile days?',
      a: 'The 2 or 3 days before ovulation and ovulation day itself. The full fertile window is about 7 days, from 5 days before ovulation to the day after.',
    },
    {
      q: 'Can I get pregnant right after my period?',
      a: 'Yes, especially if you have a short cycle. Sperm can live up to 5 days, so sex shortly after your period can lead to pregnancy if you ovulate early.',
    },
    {
      q: 'Can I use this calculator to avoid pregnancy?',
      a: 'It isn’t a reliable form of birth control. Ovulation timing shifts from cycle to cycle, and with typical use up to about 1 in 4 people relying on fertility awareness get pregnant within a year. Use condoms or another effective method.',
    },
    {
      q: 'Does it work if my periods are irregular?',
      a: 'It gives a rough estimate. Enter your average cycle length from the last few months and confirm with ovulation tests or basal body temperature. If your cycles are often shorter than 21 or longer than 35 days, talk to your doctor.',
    },
    {
      q: 'How do I figure out my cycle length?',
      a: 'Count the days from the first day of one period to the day before the next one starts. If your period started on October 1 and the next one on October 29, your cycle is 28 days.',
    },
  ],
  related: ['due-date-calculator', 'date-diff', 'bmi-calculator', 'water-intake', 'tdee-calculator', 'countdown-timer'],
  priority: 65,
  updated: '2026-10-29',
});

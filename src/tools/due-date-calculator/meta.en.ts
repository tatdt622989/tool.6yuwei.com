import { defineTool } from '../types';

export default defineTool({
  slug: 'due-date-calculator',
  name: 'Due Date Calculator',
  seoTitle: 'Due Date Calculator: How Far Along Am I, Trimester and Key Dates',
  description:
    'Free due date calculator. Enter your last period, conception or IVF transfer date to see your due date, how many weeks pregnant you are and key prenatal dates.',
  category: 'health',
  icon: 'Baby',
  keywords: [
    'due date calculator',
    'pregnancy due date calculator',
    'pregnancy calculator',
    'how far along am i',
    'how many weeks pregnant am i',
    'pregnancy week calculator',
    'due date calculator by last period',
    'lmp due date calculator',
    'ivf due date calculator',
    'conception date to due date',
    'trimester calculator',
    'when is my baby due',
    'naegele’s rule',
    'pregnancy timeline week by week',
  ],
  intro:
    'Enter the first day of your last period, your conception date or your IVF transfer date to get your estimated due date, how far along you are today and the key prenatal dates ahead.',
  howTo: [
    'Under “Calculate from”, choose Last period, Conception date, or IVF transfer (day 3 or day 5).',
    'Pick the date. For Last period, also enter your “Average cycle length (days)” if it isn’t 28.',
    'Read your estimated due date, how far along you are today, your trimester, and the days left until your due date.',
    'Scroll through “Key prenatal dates” for the screening tests, vaccines and term milestones, with the ones happening now highlighted.',
  ],
  sections: [
    {
      heading: 'How your due date is calculated',
      body: [
        'Doctors and midwives start with Naegele’s rule: your due date is 280 days (40 weeks) after the first day of your last menstrual period (LMP). The old shortcut of “add one year, subtract three months, add seven days” gets you close, but it can be off by a few days because months have different lengths, so this calculator adds the 280 days directly. If your last period started on May 1, 2026, your due date is February 5, 2027; the shortcut would say February 8.',
        'The rule assumes a 28-day cycle with ovulation around day 14. If your cycle is longer or shorter, ovulation shifts by the difference, and so does your due date. With the same May 1 period and a 32-day cycle, the estimate moves to February 9, 2027; with a 25-day cycle, to February 2.',
        'If you know when you conceived, the due date is 266 days after conception. IVF dates are the most precise: add 263 days to a day-3 embryo transfer or 261 days to a day-5 blastocyst transfer. A day-5 transfer on May 20, 2026 also gives February 5, 2027.',
      ],
    },
    {
      heading: 'How far along am I? Weeks and trimesters',
      body: [
        'Pregnancy is counted from the first day of your last period, not from conception, so you are already about 2 weeks “pregnant” when you conceive and about 4 weeks along when you miss a period. The calculator shows completed weeks plus days, the way your chart does: 25 weeks, 6 days means you are in week 26.',
        'Trimesters follow the American College of Obstetricians and Gynecologists (ACOG): the first trimester runs through 13 weeks 6 days, the second from 14 weeks 0 days to 27 weeks 6 days, and the third from 28 weeks until birth.',
      ],
    },
    {
      heading: 'Key prenatal dates week by week',
      body: [
        'The first prenatal visit usually happens around 8 to 10 weeks. Cell-free DNA screening (NIPT) is available from 10 weeks, and the nuchal translucency ultrasound is done between 11 and 13 weeks 6 days. The anatomy scan, often called the 20-week ultrasound, is scheduled between 18 and 22 weeks.',
        'Glucose screening for gestational diabetes takes place between 24 and 28 weeks. The CDC recommends a Tdap vaccine during weeks 27 through 36 of every pregnancy, and an RSV vaccine at 32 through 36 weeks if those weeks fall between September and January. The group B strep (GBS) swab is done between 36 weeks 0 days and 37 weeks 6 days.',
        'Most people see their provider every 4 weeks until 28 weeks, every 2 weeks from 28 to 36 weeks, and weekly after that. Your OB-GYN or midwife may schedule things differently based on your history, so treat the table as a planning guide.',
      ],
    },
    {
      heading: 'How accurate is a due date?',
      body: [
        'Only about 4% of babies are born on their due date. ACOG defines early term as 37 weeks 0 days through 38 weeks 6 days, full term as 39 weeks 0 days through 40 weeks 6 days, late term as 41 weeks, and post-term as 42 weeks or later. A birth before 37 weeks is preterm.',
        'An early ultrasound measures the baby’s crown-rump length and is the most accurate way to date a pregnancy. If it differs from your period-based date by more than about 5 to 7 days in the first trimester, your provider will usually change your due date to match the scan. After that, the corrected date is used for every appointment.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate my due date?',
      a: 'Add 280 days (40 weeks) to the first day of your last period. If you know your conception date, add 266 days instead. For IVF, add 261 days to a day-5 blastocyst transfer or 263 days to a day-3 embryo transfer.',
    },
    {
      q: 'If my last period was May 1, when is my baby due?',
      a: 'With a 28-day cycle, your due date is February 5 of the following year. If your cycle is usually longer, for example 32 days, enter it above and the date moves later, to February 9.',
    },
    {
      q: 'How many weeks pregnant am I?',
      a: 'Count the days since the first day of your last period and divide by 7. Enter that date above and the calculator shows it as weeks plus days, such as 12 weeks, 3 days.',
    },
    {
      q: 'Why is pregnancy 40 weeks and not 9 months?',
      a: 'The 40 weeks are counted from your last period, about two weeks before conception. Forty weeks is a little over nine calendar months, so “nine months” is only a rough figure.',
    },
    {
      q: 'Can my due date change?',
      a: 'Yes. If your first-trimester ultrasound measurements don’t match the date from your last period, your provider may move your due date. Once it is set from an early scan, it usually isn’t changed again.',
    },
    {
      q: 'Is my information stored anywhere?',
      a: 'No. Everything is calculated in your browser and nothing is uploaded. The page only remembers your last entry on your own device.',
    },
  ],
  related: ['ovulation-calculator', 'date-diff', 'bmi-calculator', 'tdee-calculator', 'water-intake', 'countdown-timer'],
  priority: 70,
  updated: '2026-10-29',
});

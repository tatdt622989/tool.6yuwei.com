import { defineTool } from '../types';

export default defineTool({
  slug: 'gpa-calculator',
  name: 'GPA Calculator',
  seoTitle: 'GPA Calculator – Weighted, Unweighted and Cumulative GPA',
  description:
    'Free GPA calculator for high school and college. Enter letter grades and credits to get your weighted or unweighted GPA, cumulative GPA and the GPA you need.',
  category: 'calc',
  icon: 'GraduationCap',
  keywords: [
    'gpa calculator',
    'weighted gpa calculator',
    'unweighted gpa calculator',
    'cumulative gpa calculator',
    'college gpa calculator',
    'high school gpa calculator',
    'how to calculate gpa',
    'gpa scale',
    '4.0 gpa scale',
    'letter grade to gpa',
    'what gpa do i need',
    'raise my gpa calculator',
    'semester gpa calculator',
    'ap honors weighted gpa',
    'grade point average calculator',
  ],
  intro:
    'Add your classes with a letter grade and credits to see your GPA on the 4.0 scale, weighted for Honors and AP, your new cumulative GPA, and what you need to hit a target.',
  howTo: [
    'For each course, choose a letter grade and enter the credits (use 1 for a full-year high school class or the credit hours on a college schedule). The course name is optional.',
    'Pick Unweighted (4.0) or Weighted (5.0). In weighted mode, set Type to Honors (+0.5) or AP / IB (+1.0).',
    'Enter your current cumulative GPA and credits completed to see your new overall GPA.',
    'Use What GPA do I need? with a target GPA and your remaining credits to see the average you need.',
  ],
  sections: [
    {
      heading: 'How to calculate your GPA',
      body: [
        'Your grade point average is a credit-weighted average. Convert each letter grade to grade points, multiply by the course credits to get quality points, add them up, and divide by the total credits.',
        'Example: an A in a 3-credit class (4.0 × 3 = 12), a B+ in a 4-credit class (3.3 × 4 = 13.2), an A− in a 3-credit class (3.7 × 3 = 11.1) and a C in a 2-credit class (2.0 × 2 = 4). That is 40.3 quality points over 12 credits, a GPA of 40.3 ÷ 12 = 3.36.',
        'Credits matter: a grade in a 4-credit lab science moves your GPA twice as much as the same grade in a 2-credit elective. Pass/fail classes, withdrawals and audits usually don’t count toward GPA, so leave them out.',
      ],
    },
    {
      heading: 'Letter grades on the 4.0 scale',
      body: [
        'Most US high schools and colleges use this plus/minus scale: A or A+ = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, C− = 1.7, D+ = 1.3, D = 1.0, D− = 0.7 and F = 0. A typical percentage mapping is 93–96 for an A, 90–92 for an A−, 87–89 for a B+ and so on, with 60 the lowest passing score.',
        'Schools do differ. Some give an A+ 4.3 (tick Count A+ as 4.3), some have no plus or minus grades at all, and some use different percentage cutoffs. Your transcript or student handbook has the official scale, and that is what colleges see.',
      ],
    },
    {
      heading: 'Weighted vs. unweighted GPA',
      body: [
        'An unweighted GPA treats every class the same on a 0–4.0 scale. A weighted GPA adds a bonus for harder classes, most often 0.5 for Honors and 1.0 for AP, IB or dual-enrollment courses, so an A in AP Biology counts as 5.0 and a B in Honors English as 3.5. Failing grades get no bonus.',
        'With the example classes above, making the B+ class Honors and the A− class AP raises the GPA from 3.36 unweighted to 3.78 weighted.',
        'Colleges see both kinds, and many recalculate your GPA with their own rules, often using only core academic classes. Report the GPA your school prints on your transcript when an application asks for it.',
      ],
    },
    {
      heading: 'Cumulative GPA and what GPA you need',
      body: [
        'Your cumulative GPA combines every term. Multiply your current GPA by the credits you have completed, add this term’s quality points, and divide by the new credit total. With a 3.2 GPA over 45 credits and a 3.8 term of 15 credits, the new cumulative GPA is (3.2 × 45 + 3.8 × 15) ÷ 60 = 3.35.',
        'To hit a target, work the same formula backward: required GPA = (target × total credits − current GPA × completed credits) ÷ remaining credits. A student with a 2.8 after 60 credits who wants a 3.0 after 30 more needs (3.0 × 90 − 2.8 × 60) ÷ 30 = 3.4 in those 30 credits.',
        'The more credits you already have, the harder your GPA is to move. If the calculator says a target is out of reach, it also shows the highest cumulative GPA you could get with straight A’s, which is a realistic goal to aim for instead.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is a 3.5 GPA good?',
      a: 'Yes. A 3.5 unweighted GPA means mostly A’s and B’s, about an A−/B+ average, and is above average at most high schools and colleges. Highly selective colleges often expect higher, especially with weighted grades.',
    },
    {
      q: 'What is the difference between weighted and unweighted GPA?',
      a: 'Unweighted GPA uses the 0–4.0 scale for every class. Weighted GPA adds extra points for Honors (usually +0.5) and AP or IB classes (usually +1.0), so it can go above 4.0, typically up to 5.0.',
    },
    {
      q: 'How many credits is a high school class?',
      a: 'It depends on the school. Many count a full-year class as 1 credit and a semester class as 0.5. If every class has the same credit value, you can enter 1 for all of them and the GPA comes out the same.',
    },
    {
      q: 'How do I calculate my cumulative GPA?',
      a: 'Multiply each term’s GPA by its credits, add the results, and divide by the total credits. Enter your current GPA and credits completed in the Cumulative GPA box and this calculator does it with this term’s classes.',
    },
    {
      q: 'Can I raise my GPA from 2.5 to 3.0 in one semester?',
      a: 'Only if you have few credits so far. With 15 credits at 2.5, a 3.5 over the next 15 credits gets you to 3.0. With 60 credits at 2.5, even a 4.0 over 15 more only reaches 2.8. Use What GPA do I need? with your own numbers.',
    },
    {
      q: 'Does an A+ count as more than 4.0?',
      a: 'At most schools an A+ is 4.0, the same as an A. Some colleges and high schools give it 4.3. Tick Count A+ as 4.3 if your school does.',
    },
    {
      q: 'Do failed or retaken classes count?',
      a: 'An F counts as 0 points with full credits, which pulls your GPA down. Many colleges replace or average a retaken grade, depending on their repeat policy. Check your registrar’s rules and enter the grade that counts.',
    },
  ],
  related: ['fraction-calculator', 'tip-calculator', 'sales-tax-calculator', 'time-card-calculator', 'word-counter'],
  priority: 78,
  updated: '2026-10-29',
});

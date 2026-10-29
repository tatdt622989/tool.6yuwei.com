import { defineTool } from '../types';

export default defineTool({
  slug: 'body-fat-calculator',
  name: 'Body Fat Calculator',
  seoTitle: 'Body Fat Calculator: US Navy Method With a Tape Measure (in or cm)',
  description:
    'Free body fat calculator using the US Navy tape method. Enter neck, waist and hips in inches or cm to get body fat percentage, fat mass, lean mass and ACE category.',
  category: 'health',
  icon: 'Activity',
  keywords: [
    'body fat calculator',
    'body fat percentage calculator',
    'navy body fat calculator',
    'us navy body fat calculator',
    'body fat calculator inches',
    'body fat calculator tape measure',
    'how to calculate body fat percentage',
    'body fat percentage chart',
    'body fat calculator for women',
    'body fat calculator for men',
    'lean body mass calculator',
    'healthy body fat percentage',
    'navy tape test calculator',
  ],
  intro:
    'Measure your neck and waist (plus hips for women) with a soft tape, and this calculator estimates your body fat percentage with the US Navy formula, along with your fat mass, lean mass and where you land on the ACE chart.',
  howTo: [
    'Pick your sex and choose US units (inches, pounds) or metric units (centimeters, kilograms).',
    'Enter your age, height and weight, then your neck and waist measurements. Women also enter hips.',
    'Read your body fat percentage and category at the top. Below it you will see a BMI-based estimate, your fat mass, lean body mass and BMI.',
    'Use the table to compare your result with the American Council on Exercise ranges for your sex.',
  ],
  sections: [
    {
      heading: 'How the US Navy body fat formula works',
      body: [
        'The circumference method was developed by Hodgdon and Beckett at the Naval Health Research Center in 1984 so recruiters could estimate body fat with nothing more than a tape measure. It is still the basis of the military tape test. With measurements in inches, the formula for men is 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76. For women it is 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387. This calculator uses the published metric form of the same equations and converts inches to centimeters first, so results can differ from the inch version by a tenth or two.',
        'Example: a 30-year-old man who is 5 ft 9 in, weighs 160 lb and measures 15 in at the neck and 34 in at the waist comes out at about 17.9% body fat. That is roughly 28.6 lb of fat and 131.4 lb of lean mass, in the Fitness range. A 35-year-old woman who is 5 ft 4 in and 140 lb, with a 13 in neck, 29 in waist and 38 in hips, comes out at about 27.7%, which is in the Average range.',
        'For comparison, the calculator also shows the Deurenberg estimate, which uses only BMI, age and sex. It can’t see muscle, so it tends to overestimate body fat in people who lift or play sports.',
      ],
    },
    {
      heading: 'How to measure for an accurate result',
      body: [
        'Use a flexible, non-stretch tape and keep it level all the way around. Measure on bare skin, snug but not pressing in, after a normal exhale. Take each measurement two or three times and use the average; being off by half an inch at the waist can move the result by about one percentage point.',
        'Neck: just below the larynx (Adam’s apple), with the tape angled slightly down toward the front. Waist: men measure horizontally at the navel; women measure at the narrowest point of the natural waist. Hips (women only): around the widest part of the buttocks, with feet together. Measure at the same time of day, ideally in the morning before eating, when you track changes over time.',
      ],
    },
    {
      heading: 'Body fat percentage chart for men and women',
      body: [
        'The American Council on Exercise (ACE) ranges are the most widely quoted. Men: essential fat 2–5%, athletes 6–13%, fitness 14–17%, average 18–24%, and obese 25% or more. Women: essential fat 10–13%, athletes 14–20%, fitness 21–24%, average 25–31%, and obese 32% or more.',
        'Women carry more essential fat for hormonal and reproductive health, so the same number means something different for each sex. Very low body fat is not a goal in itself. Women who stay below the essential range for long periods can lose their period and bone density. A visible six-pack for most men shows up somewhere around 10 to 12%.',
      ],
    },
    {
      heading: 'Tape method vs. smart scales, DEXA and calipers',
      body: [
        'Bathroom smart scales use bioelectrical impedance (BIA), which swings with hydration: the same person can read 3 to 5 points different before and after a workout or a big glass of water. Skinfold calipers depend heavily on the skill of the person pinching. Studies comparing the Navy formula with DEXA, the clinical reference, typically find an average error of about 3 to 4 percentage points, which is similar to consumer scales.',
        'The most useful approach is to pick one method and track the trend. If your waist is shrinking while your weight holds steady, you are most likely losing fat and keeping or gaining muscle. For a precise number, a DEXA scan at a clinic or university lab is the gold standard most people can access.',
      ],
    },
  ],
  faq: [
    {
      q: 'How accurate is the Navy body fat calculator?',
      a: 'Compared with DEXA scans, the US Navy formula is usually within about 3 to 4 percentage points, which is on par with smart scales. Accuracy depends mostly on careful, consistent measuring. It is less reliable for very muscular people and people with a lot of abdominal fat.',
    },
    {
      q: 'What is a healthy body fat percentage?',
      a: 'Using the ACE chart, 14–24% is a healthy range for most adult men and 21–31% for most adult women. Obesity starts at 25% for men and 32% for women.',
    },
    {
      q: 'Where do I measure my waist for body fat?',
      a: 'Men measure around the navel. Women measure at the narrowest part of the waist, usually a little above the navel. Keep the tape level and don’t suck in.',
    },
    {
      q: 'Why do women need a hip measurement?',
      a: 'Women store more fat around the hips and thighs, so the Navy equation for women adds hip circumference to the waist to capture it. The men’s equation uses only neck and waist.',
    },
    {
      q: 'Is this the same as the military tape test?',
      a: 'It uses the same Hodgdon and Beckett circumference equations the Navy has used for decades. Individual services round measurements and set their own body fat limits by age and sex, so check your branch’s current standards before a weigh-in.',
    },
    {
      q: 'Do you store my measurements?',
      a: 'No. Everything is calculated in your browser. The tool only remembers your last entries on your own device so they are there next time.',
    },
  ],
  related: ['bmi-calculator', 'tdee-calculator', 'water-intake'],
  priority: 60,
  updated: '2026-10-29',
});

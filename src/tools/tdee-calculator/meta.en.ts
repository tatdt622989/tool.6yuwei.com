import { defineTool } from '../types';

export default defineTool({
  slug: 'tdee-calculator',
  name: 'TDEE Calculator',
  seoTitle: 'TDEE Calculator: Daily Calories to Lose, Maintain or Gain Weight',
  description:
    'Free TDEE calculator using Mifflin-St Jeor. Enter height in ft/in, weight in lb and activity level to get your BMR, maintenance calories and macros to cut or bulk.',
  category: 'health',
  icon: 'Flame',
  keywords: [
    'tdee calculator',
    'total daily energy expenditure calculator',
    'maintenance calories calculator',
    'calorie calculator',
    'how many calories should i eat',
    'calories to lose weight',
    'bmr calculator',
    'basal metabolic rate calculator',
    'mifflin st jeor calculator',
    'macro calculator',
    'calorie deficit calculator',
    'calories to build muscle',
    'tdee calculator lbs',
    'protein intake calculator',
  ],
  intro:
    'Find out how many Calories you burn in a day and how much to eat to lose fat, maintain or build muscle. Enter your stats in pounds and feet or in metric units; results include protein, fat and carb targets.',
  howTo: [
    'Pick your sex and choose US units (ft, in, lb) or metric units (cm, kg).',
    'Enter your age, height and weight.',
    'Under Activity level, choose the option closest to a typical week. Most people with a desk job who work out three times a week are Lightly active or Moderately active.',
    'Read your TDEE at the top, then use the table for daily Calories and grams of protein, fat and carbs for each goal.',
  ],
  sections: [
    {
      heading: 'What TDEE and BMR mean',
      body: [
        'Your basal metabolic rate (BMR) is the energy your body uses at complete rest to breathe, circulate blood and keep warm. For most people it is 60 to 70% of what they burn in a day. Total daily energy expenditure (TDEE) adds everything else: walking around, exercise, and digesting food.',
        'TDEE is your maintenance calories. Eat about that much and your weight holds steady; eat less and you lose weight; eat more and you gain. That is why every diet plan, from a simple calorie deficit to a bodybuilding bulk, starts with an estimate of TDEE.',
      ],
    },
    {
      heading: 'The Mifflin-St Jeor equation and activity multipliers',
      body: [
        'This calculator uses the Mifflin-St Jeor equation, which the Academy of Nutrition and Dietetics found to be the most accurate predictive formula for healthy adults. In metric units, BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5 for men, or − 161 for women. Pounds and inches are converted to kilograms and centimeters first.',
        'BMR is then multiplied by an activity factor: 1.2 sedentary, 1.375 lightly active (exercise 1–3 days a week), 1.55 moderately active (3–5 days), 1.725 very active (6–7 days) and 1.9 extra active (hard daily training or a physical job).',
        'Example: a 30-year-old man who is 5 ft 10 in and 180 lb has a BMR of about 1,783 Calories. Moderately active, his TDEE is about 1,783 × 1.55 ≈ 2,763 Calories a day. The revised Harris-Benedict equation is shown alongside for comparison and usually comes out a little higher.',
      ],
    },
    {
      heading: 'How many Calories to lose fat or build muscle',
      body: [
        'A daily deficit of 500 Calories adds up to about 3,500 a week, which works out to roughly 1 lb (0.45 kg) of weight loss per week. That pace is sustainable for most people and helps preserve muscle. The calculator never sets your fat-loss target below your BMR or below 1,200 Calories for women and 1,500 for men; going lower generally calls for medical supervision.',
        'For the man above, that means about 2,263 Calories a day to lose fat, 2,763 to maintain and 3,063 to build muscle with a modest 300-Calorie surplus. A 35-year-old woman who is 5 ft 4 in, 150 lb and lightly active has a TDEE of about 1,871 Calories and a fat-loss target of about 1,371.',
        'Protein is set per body weight: about 0.9 g per lb (2.0 g/kg) while cutting, 0.7 g per lb (1.6 g/kg) to maintain and 0.8 g per lb (1.8 g/kg) while bulking. Fat is about 25% of Calories and carbs fill the rest. Protein and carbs have 4 Calories per gram, fat has 9.',
      ],
    },
    {
      heading: 'Why your real number may differ',
      body: [
        'The most common error is overestimating activity. A desk job plus three gym sessions a week is usually lightly active, not very active. Fitness trackers also tend to overcount the Calories burned during workouts.',
        'Treat the result as a starting point. Eat at your target for two to three weeks while weighing yourself several times a week, then adjust by 100 to 200 Calories if the trend doesn’t match your goal. Formulas are less accurate for very muscular athletes, people with obesity and adults over 65. Pregnancy, breastfeeding, thyroid conditions and some medications change your needs, so talk to a doctor or registered dietitian in those cases.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between TDEE and BMR?',
      a: 'BMR is the energy you burn at complete rest. TDEE is BMR plus everything you do during the day, including exercise. Plan your eating around TDEE, not BMR.',
    },
    {
      q: 'How many Calories should I eat to lose weight?',
      a: 'A common starting point is TDEE minus 500 Calories a day, which leads to about 1 lb of weight loss per week. Most women should not go below 1,200 Calories and most men below 1,500 without medical supervision.',
    },
    {
      q: 'Which activity level should I pick?',
      a: 'Choose based on a typical week, not your best one. Sedentary means a desk job with little exercise. If you train 3–5 days a week, pick moderately active. Only choose very active or extra active if you train almost every day or have a physical job.',
    },
    {
      q: 'Is Mifflin-St Jeor more accurate than Harris-Benedict?',
      a: 'For most healthy adults, yes. Studies found Mifflin-St Jeor predicts measured BMR within 10% for more people than Harris-Benedict, which tends to run a little high. Both are shown so you can compare.',
    },
    {
      q: 'How much protein do I need?',
      a: 'The RDA is 0.8 g per kg (about 0.36 g per lb) for adults, but people who lift weights or are dieting usually do better at 1.6 to 2.2 g per kg (about 0.7 to 1 g per lb). For a 180 lb person that is roughly 130 to 180 g a day.',
    },
    {
      q: 'Is my data saved?',
      a: 'No. Everything is calculated in your browser and nothing is sent to a server. The tool only remembers your last entries on your own device.',
    },
  ],
  related: ['bmi-calculator', 'body-fat-calculator', 'water-intake'],
  priority: 75,
  updated: '2026-10-29',
});

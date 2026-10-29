import { defineTool } from '../types';

export default defineTool({
  slug: 'bmi-calculator',
  name: 'BMI Calculator',
  seoTitle: 'BMI Calculator: Check Your Body Mass Index in lb/ft or kg/cm',
  description:
    'Free BMI calculator for adults. Enter height and weight in feet, inches and pounds or in metric units to get your BMI, WHO category and healthy weight range.',
  category: 'calc',
  icon: 'Scale',
  keywords: [
    'bmi calculator',
    'body mass index calculator',
    'calculate bmi',
    'bmi calculator for adults',
    'bmi calculator lbs and feet',
    'what is my bmi',
    'healthy weight calculator',
    'bmi chart',
  ],
  intro:
    'Enter your height and weight to see your body mass index, where it falls on the WHO scale, and the healthy weight range for your height.',
  howTo: [
    'Choose US units (feet, inches, pounds) or metric units (centimeters, kilograms).',
    'Enter your height and weight. Your BMI updates as you type.',
    'Check your category next to the result and your position on the color scale.',
    'See the healthy weight range for your height and, if you are outside it, roughly how much to gain or lose to reach it.',
  ],
  sections: [
    {
      heading: 'How BMI is calculated',
      body: [
        'Body mass index is your weight divided by the square of your height. In metric units the formula is weight (kg) ÷ height (m)². With pounds and inches it is 703 × weight (lb) ÷ height (in)², where 703 converts between the two systems.',
        'For example, someone who is 5 ft 9 in (69 inches) and weighs 160 lb has a BMI of 703 × 160 ÷ 69² ≈ 23.6, which is in the healthy range. Working backwards, a healthy weight for that height (BMI 18.5 to 24.9) is roughly 125 to 169 lb.',
      ],
    },
    {
      heading: 'BMI categories for adults',
      body: [
        'This calculator uses the World Health Organization categories, which are also used by the CDC and the NHS: below 18.5 is underweight, 18.5 to 24.9 is a healthy weight, 25 to 29.9 is overweight, and 30 or more is obesity. Obesity is further split into class I (30 to 34.9), class II (35 to 39.9) and class III (40 or more).',
        'The same cutoffs apply to adult men and women. Some health bodies recommend lower thresholds for people of South Asian, Chinese, Japanese or other Asian descent, who tend to face a higher risk of type 2 diabetes at a lower BMI. For them, a BMI of 23 or more may already be a reason to take action.',
      ],
    },
    {
      heading: 'What BMI can and can’t tell you',
      body: [
        'BMI is a quick screening number, not a diagnosis. It can’t tell muscle from fat, so athletes and people who lift weights may score as overweight while having little body fat, and older adults who have lost muscle may score in the healthy range while carrying more fat than it suggests.',
        'Waist size adds useful context. A waist over 40 inches (102 cm) for men or 35 inches (88 cm) for women is linked to higher health risk even when BMI is normal. For children and teens, use a BMI-for-age percentile chart instead of the adult categories, and talk to a doctor if your result worries you.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is a healthy BMI?',
      a: 'For adults, a BMI from 18.5 to 24.9 is considered a healthy weight. Below 18.5 is underweight, 25 to 29.9 is overweight, and 30 or above is obesity.',
    },
    {
      q: 'Is BMI different for men and women?',
      a: 'No. Adults use the same categories regardless of sex. Women tend to have more body fat than men at the same BMI, which is one reason BMI is best used together with other measures such as waist size.',
    },
    {
      q: 'Can I use this BMI calculator for children?',
      a: 'It will calculate the number, but children and teens are assessed with BMI-for-age percentiles that depend on age and sex, not the adult categories shown here.',
    },
    {
      q: 'Why is my BMI high when I’m muscular?',
      a: 'BMI only looks at height and weight, and muscle is denser than fat. If you train regularly, body fat percentage and waist measurement give a better picture than BMI alone.',
    },
    {
      q: 'Is my data stored?',
      a: 'No. Your height and weight never leave your browser. The calculator only remembers your last entries on your own device so they are there next time.',
    },
  ],
  related: ['word-counter', 'password-generator', 'tdee-calculator', 'body-fat-calculator'],
  priority: 80,
  updated: '2026-10-29',
});

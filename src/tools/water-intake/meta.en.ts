import { defineTool } from '../types';

export default defineTool({
  slug: 'water-intake',
  name: 'Water Intake Calculator',
  seoTitle: 'Water Intake Calculator: How Much Water Should I Drink a Day?',
  description:
    'Free water intake calculator. Enter your weight in pounds or kg, activity and exercise to see how many ounces of water to drink a day and how many glasses that is.',
  category: 'health',
  icon: 'GlassWater',
  keywords: [
    'water intake calculator',
    'how much water should i drink a day',
    'daily water intake calculator',
    'water calculator',
    'how many ounces of water should i drink a day',
    'hydration calculator',
    'water intake calculator by weight',
    'how much water should i drink calculator',
    'how many glasses of water a day',
    'half your body weight in ounces',
    'water intake for exercise',
    'how much water to drink in hot weather',
  ],
  intro:
    'See roughly how much water to drink each day based on your weight, activity, exercise and the weather, in fluid ounces or milliliters, plus how many glasses that is and when to drink them.',
  howTo: [
    'Choose US units (fl oz, lb) or metric units (ml, kg), then enter your weight and sex.',
    'Pick your daily activity and enter how many minutes you exercise on a typical day.',
    'Enter the size of the glass or bottle you usually drink from, for example 8 fl oz for a glass or 16.9 fl oz for a standard water bottle. Check the box if it is hot or you sweat a lot.',
    'Read your daily total and number of glasses, then use the schedule to spread them from morning to evening.',
  ],
  sections: [
    {
      heading: 'How this water intake calculator works',
      body: [
        'Your baseline is your body weight times 30 to 40 ml per kilogram, a range commonly used by dietitians: 30 if you mostly sit, 35 if you are moderately active and 40 if you are very active. In US units that is about 0.46 to 0.61 fl oz per pound, which is why the popular rule of thumb of drinking half your body weight in ounces lands in the same place.',
        'Exercise adds about 17 fl oz (500 ml) per hour, in line with sports medicine advice to replace 13 to 27 fl oz per hour depending on how much you sweat. Hot weather or heavy sweating adds another 17 fl oz. For example, a 150 lb person who mostly sits needs about 69 fl oz a day, or nine 8-ounce glasses. If they are moderately active it is about 80 fl oz, and a 30-minute workout adds roughly 8 fl oz more.',
      ],
    },
    {
      heading: 'What official guidelines say',
      body: [
        'The National Academies of Sciences, Engineering, and Medicine set an adequate intake of total water of about 3.7 liters (125 fl oz) a day for men and 2.7 liters (91 fl oz) for women. That includes water from food, which usually covers about 20% of the total. From beverages, including plain water, that works out to about 13 cups (3.0 L) for men and 9 cups (2.2 L) for women, which is the guideline shown next to your result.',
        'These are averages for healthy adults in a temperate climate, not hard targets. Coffee, tea, milk and other drinks count toward your fluid intake, and moderate caffeine does not cause net dehydration. Water is still the best everyday choice because it has no sugar or Calories.',
      ],
    },
    {
      heading: 'The 8x8 rule and other myths',
      body: [
        'The familiar advice to drink eight 8-ounce glasses a day (64 fl oz, about 1.9 L) is easy to remember but isn’t based on any specific study. For many adults it is a reasonable floor rather than a target; larger and more active people usually need more, and smaller, less active people may need less.',
        'A practical check is the color of your urine: pale yellow generally means you are well hydrated, while dark yellow means you should drink more. Thirst is a reliable signal for most healthy adults, but it gets weaker with age, so older adults may need to drink on a schedule.',
      ],
    },
    {
      heading: 'Exercise, heat and drinking too much',
      body: [
        'Drink before you get thirsty on hot days and during long workouts. For sessions longer than about an hour or in serious heat, a sports drink or electrolyte tablet helps replace the sodium you lose in sweat. Weighing yourself before and after exercise shows how much you lost: each pound of weight lost is about 16 to 24 fl oz to replace.',
        'More is not always better. Drinking very large amounts in a short time, such as several liters within a few hours, can dilute blood sodium (hyponatremia). People with kidney disease, heart failure or other conditions that require fluid limits should follow their doctor’s guidance instead of this calculator.',
      ],
    },
  ],
  faq: [
    {
      q: 'How much water should I drink a day?',
      a: 'A common estimate is 30 to 40 ml per kilogram of body weight, or about half an ounce per pound. For a 150 lb adult that is roughly 69 to 92 fl oz (2 to 2.7 liters) a day, more if you exercise or it is hot.',
    },
    {
      q: 'Is the half-your-body-weight-in-ounces rule accurate?',
      a: 'It is a reasonable starting point. It equals about 33 ml per kg, which falls inside the 30 to 40 ml/kg range dietitians use. Adjust it up for exercise, heat and heavy sweating.',
    },
    {
      q: 'How many glasses of water is that?',
      a: 'Divide your total by your glass size. With 8 fl oz glasses, 64 fl oz is 8 glasses and 80 fl oz is 10. Enter your own glass or bottle size and the calculator does it for you.',
    },
    {
      q: 'Do coffee and tea count toward water intake?',
      a: 'Yes. Coffee, tea, milk and other drinks all count toward total fluids, and moderate caffeine does not dehydrate you overall. Sugary drinks and alcohol are better kept to a minimum.',
    },
    {
      q: 'How much more water do I need when I exercise?',
      a: 'Plan on about 13 to 27 fl oz (400 to 800 ml) per hour of exercise depending on how much you sweat. This calculator adds about 17 fl oz per hour, and another 17 fl oz for hot weather.',
    },
    {
      q: 'Can you drink too much water?',
      a: 'Yes, though it is rare in healthy people. Drinking several liters in a few hours can lower blood sodium to dangerous levels. Spread your water through the day and follow medical advice if you have a fluid restriction.',
    },
  ],
  related: ['tdee-calculator', 'bmi-calculator', 'body-fat-calculator', 'pomodoro'],
  priority: 55,
  updated: '2026-10-29',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'sleep-calculator',
  name: 'Sleep Calculator',
  seoTitle: 'Sleep Calculator: What Time Should I Go to Bed? (Sleep Cycles)',
  description:
    'Free sleep cycle calculator. Enter your wake-up time to see when to go to bed for full 90-minute sleep cycles, or enter a bedtime to see when to set your alarm.',
  category: 'health',
  icon: 'BedDouble',
  keywords: [
    'sleep calculator',
    'sleep cycle calculator',
    'bedtime calculator',
    'what time should i go to bed',
    'when should i go to bed',
    'wake up time calculator',
    'what time should i wake up',
    'if i go to bed now when should i wake up',
    '90 minute sleep cycle',
    'how many sleep cycles do i need',
    'how much sleep do i need',
    'what time should i go to bed if i wake up at 7',
  ],
  intro:
    'Enter the time you need to get up and see when to go to bed so your alarm lands near the end of a sleep cycle, or start from your bedtime to see when to set the alarm.',
  howTo: [
    'Choose “I wake up at” and enter your wake-up time (7:00 AM to start).',
    'Read the bedtimes for 6, 5, 4 and 3 sleep cycles and how long each one lets you sleep. Five or six cycles (7.5 to 9 hours) are marked Recommended. Tap any time to see it laid out on the timeline.',
    'Already have a bedtime in mind? Enter it under “Bedtime (optional)” to see how many full cycles fit, whether the alarm goes off mid-cycle, and the nearest bedtimes that line up with a cycle.',
    'Heading to bed right now? Switch to “I go to bed at”, tap Now, and pick a wake-up time for your alarm.',
    'If you fall asleep faster or slower than 15 minutes, or your cycles feel shorter or longer than 90 minutes, change both under Settings.',
  ],
  sections: [
    {
      heading: 'What is a sleep cycle?',
      body: [
        'Sleep moves through stages in a repeating loop: light sleep as you drift off (N1), the deeper light sleep that takes up most of the night (N2), slow-wave or deep sleep (N3), and REM sleep, when the eyes move quickly and most vivid dreams happen. One pass from light sleep to REM is a sleep cycle. In adults it lasts about 90 minutes on average, and most people go through four to six cycles a night.',
        'The cycles are not all alike. Early in the night they contain more deep sleep; toward morning deep sleep fades and REM periods get longer. Cycle length is not a fixed 90 minutes either. It typically ranges from about 70 to 120 minutes and varies from person to person, with age, and even within the same night. Treat the times here as estimates and a starting point, then adjust to how you actually feel.',
      ],
    },
    {
      heading: 'Why waking at the end of a cycle can feel easier',
      body: [
        'The groggy, slow feeling right after you wake up is called sleep inertia, and it usually wears off within about 15 to 30 minutes. Research shows it tends to be stronger when you are woken from deep (N3) sleep, so waking from light sleep or near the end of a cycle often feels easier.',
        'Planning sleep in multiples of 90 minutes is a rule of thumb built on that idea: choose a bedtime so the alarm falls close to a cycle boundary. It is not a precise formula, since real cycles drift and the alarm may still catch you in deeper sleep. Getting enough sleep and keeping a regular bedtime and wake-up time matter more than hitting an exact number of cycles.',
        'For example, with 15 minutes to fall asleep and 90-minute cycles, going to bed at 11:00 PM for a 7:00 AM alarm means falling asleep around 11:15, finishing five cycles at 6:45, and waking 15 minutes into the sixth. Going to bed at 11:15 instead puts the alarm right at the end of the fifth cycle. Whether those 15 minutes make a difference varies, so try it for a few days and compare.',
      ],
    },
    {
      heading: 'How much sleep do you need?',
      body: [
        'The American Academy of Sleep Medicine (AASM) and the CDC recommend at least 7 hours a night for adults 18 to 60. The National Sleep Foundation suggests 7 to 9 hours for adults and 7 to 8 hours for people 65 and older. Teens 13 to 18 need 8 to 10 hours, and children 6 to 12 need 9 to 12 hours.',
        'With 90-minute cycles, five cycles is 7.5 hours and six is 9 hours, both inside the adult range, so the calculator marks them Recommended. Four cycles (6 hours) and three (4.5 hours) are under 7 hours: fine for setting an alarm on an occasional short night, but not something to do every night. Regularly sleeping too little is linked to problems with attention, mood, metabolism and heart health.',
        'If you still feel very sleepy during the day after 7 to 9 hours, snore loudly, have been told you stop breathing in your sleep, or often lie awake or wake up during the night, it may be more than a scheduling issue. Talk to a doctor or a sleep specialist about insomnia or sleep apnea.',
      ],
    },
  ],
  faq: [
    {
      q: 'What time should I go to bed if I wake up at 7 AM?',
      a: 'With 15 minutes to fall asleep and 90-minute cycles, go to bed at 9:45 PM for six cycles (9 hours) or 11:15 PM for five cycles (7.5 hours). 12:45 AM (four cycles, 6 hours) and 2:15 AM (three cycles, 4.5 hours) also line up with a cycle but are too short for most adults.',
    },
    {
      q: 'I go to bed at 11 PM and wake up at 7 AM. How many cycles is that?',
      a: 'If it takes you about 15 minutes to fall asleep, that is 7 hours 45 minutes of sleep: five full 90-minute cycles plus 15 minutes, so the alarm goes off early in the sixth cycle. Going to bed at 11:15 PM (five cycles) or 9:45 PM (six cycles) lines the alarm up with the end of a cycle.',
    },
    {
      q: 'Is a sleep cycle always 90 minutes?',
      a: 'No. Ninety minutes is an adult average; real cycles run roughly 70 to 120 minutes and differ between people and across the night. If 90-minute timing still leaves you groggy, try 80 or 100 minutes in Settings, or focus on getting enough total sleep.',
    },
    {
      q: 'How long does it take to fall asleep?',
      a: 'For most people it is about 10 to 20 minutes, so the calculator uses 15 by default. Enter your own number in Settings. If it regularly takes you more than 30 minutes, it is worth mentioning to a doctor.',
    },
    {
      q: 'If I wake up at the end of a cycle, is 6 hours of sleep enough?',
      a: 'No. Waking at the end of a cycle may help you feel less groggy, but it does not replace sleep. Four cycles (6 hours) is still less than the 7 hours most adults need.',
    },
    {
      q: 'How long should a nap be?',
      a: 'A nap of 10 to 20 minutes usually keeps you in light sleep, so you wake up feeling alert. Naps of 30 minutes or more can reach deep sleep and leave you groggy. Napping before about 3 PM makes it less likely to affect your sleep at night.',
    },
  ],
  related: ['water-intake', 'pomodoro', 'tdee-calculator', 'bmi-calculator'],
  priority: 56,
  updated: '2026-11-27',
});

import { defineTool } from '../types';

export default defineTool({
  slug: 'timezone-converter',
  name: 'Time Zone Converter',
  seoTitle: 'Time Zone Converter: EST, PST, GMT and World Time With DST',
  description:
    'Free time zone converter. Pick a date and time in any city and see it in New York, Los Angeles, London, Tokyo and more, with daylight saving time handled for you.',
  category: 'time',
  icon: 'Globe',
  keywords: [
    'time zone converter',
    'timezone converter',
    'time converter',
    'world clock',
    'world time zones',
    'est to pst',
    'pst to est',
    'est to gmt',
    'gmt to est',
    'utc to est',
    'est to ist',
    'time difference calculator',
    'meeting planner time zones',
    'what time is it in tokyo',
    'daylight saving time 2026',
  ],
  intro:
    'Enter a date and time in one zone and see the matching local time in every city on your list. Your own time zone is added automatically, and daylight saving time is handled for each date.',
  howTo: [
    'Under “Convert from”, pick the zone you want to enter a time in. It starts as your own time zone.',
    'Set “Date and time there”, or press “Now” to use the current time.',
    'Each card shows the local time, date, UTC offset and how many hours that city is ahead or behind. “Previous day” or “Next day” marks a date change.',
    'Use “Add a city or time zone” and “Add” to build your list, “Remove” to drop a city, and “Convert from here” to enter times in that city instead.',
  ],
  sections: [
    {
      heading: 'US time zones at a glance',
      body: [
        'The mainland US has four main zones: Eastern (EST, UTC−5), Central (CST, UTC−6), Mountain (MST, UTC−7) and Pacific (PST, UTC−8). During daylight saving time each moves one hour ahead and becomes EDT, CDT, MDT and PDT. Alaska is UTC−9 (UTC−8 in summer) and Hawaii stays on UTC−10 all year.',
        'Most of Arizona does not observe daylight saving time, so Phoenix matches Denver in winter and Los Angeles in summer. The Navajo Nation in northeastern Arizona does switch, which is why the converter lists Phoenix separately from Denver.',
        'A quick rule for the coasts: Eastern time is always three hours ahead of Pacific time, so 9:00 a.m. in Los Angeles is noon in New York all year round.',
      ],
    },
    {
      heading: 'Why the gap to Europe changes for a few weeks',
      body: [
        'The US switches to daylight saving time on the second Sunday in March and back on the first Sunday in November. The UK and the EU switch on the last Sunday in March and the last Sunday in October. In 2026 that means March 8 to November 1 in the US and March 29 to October 25 in Europe.',
        'Between those dates the clocks are out of step. New York is normally five hours behind London, but from March 8 to March 28 and from October 25 to October 31, 2026 the difference is only four hours. Recurring calls set by a calendar in one country can land an hour early or late for the other side during those weeks, so check the converter before you send the invite.',
        'Japan, China, India and most of Southeast Asia do not use daylight saving time at all, while Sydney and Auckland do in the southern summer, roughly October to April.',
      ],
    },
    {
      heading: 'Picking a meeting time across time zones',
      body: [
        'Set the source to the zone of the person who is most constrained, enter a candidate time and scan the cards. Cities shown in a lighter clock with a “Night” tag are between 10 p.m. and 7 a.m. local time.',
        'For the US and Europe, late morning on the East Coast works best: 11:00 a.m. in New York is 4:00 p.m. in London and 5:00 p.m. in Paris for most of the year. For the US and Japan there is almost no overlap in office hours. A common compromise is 5:00 p.m. Pacific, which is 9:00 or 10:00 a.m. the next morning in Tokyo depending on the season.',
        'When you write the time in an email, add the zone abbreviation or the UTC time, for example “3:00 p.m. ET (19:00 UTC)”, so nobody has to guess.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the time difference between EST and PST?',
      a: 'Eastern time is three hours ahead of Pacific time, both in winter (EST and PST) and in summer (EDT and PDT), because both zones change on the same dates.',
    },
    {
      q: 'Is GMT the same as UTC?',
      a: 'For everyday scheduling, yes. UTC is the atomic-clock standard and GMT is the time zone the UK uses in winter. In summer the UK switches to British Summer Time (BST, UTC+1), so London is no longer on GMT.',
    },
    {
      q: 'How many hours ahead is Tokyo?',
      a: 'Tokyo is on UTC+9 all year. It is 14 hours ahead of New York in winter and 13 hours ahead during US daylight saving time, and 17 or 16 hours ahead of Los Angeles.',
    },
    {
      q: 'When does daylight saving time end in 2026?',
      a: 'In the US it ends on Sunday, November 1, 2026 at 2:00 a.m. local time. In the UK and the EU it ended on Sunday, October 25, 2026.',
    },
    {
      q: 'What happens if I enter a time that is skipped or repeated by a clock change?',
      a: 'A time skipped when clocks spring forward is moved ahead by the jump, and the page tells you. A time that happens twice when clocks fall back is calculated using the first occurrence, which is still on daylight saving time.',
    },
    {
      q: 'Where do the time zone rules come from?',
      a: 'From the IANA time zone database built into your browser and operating system. If a country has just changed its rules, update your browser to get the latest data.',
    },
  ],
  related: ['countdown-timer', 'stopwatch', 'new-year-countdown', 'pomodoro'],
  priority: 55,
  updated: '2026-10-29',
});

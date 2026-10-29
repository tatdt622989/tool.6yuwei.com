import { defineTool } from '../types';

export default defineTool({
  slug: 'exact-time',
  name: 'Exact Time',
  seoTitle: 'Exact Time Now – What Time Is It? Clock Synced to the Second',
  description:
    'What time is it exactly? See the exact time synced to a time server, how fast or slow your device clock is, UTC and US time zones, plus a countdown.',
  category: 'time',
  icon: 'Clock',
  keywords: [
    'exact time',
    'what time is it',
    'exact time now',
    'current time',
    'atomic clock',
    'atomic clock time',
    'time now with seconds',
    'clock with seconds',
    'what time is it right now',
    'official time',
    'utc time now',
    'is my clock accurate',
    'time zones usa',
    'eastern time now',
    'pacific time now',
    'online clock milliseconds',
    'countdown to time',
  ],
  intro:
    'The exact time for your time zone, corrected for any error in your device clock, with UTC and major world clocks and a countdown accurate to a tenth of a second.',
  howTo: [
    'Open the page and wait a moment while it compares your device clock with the server. The status line says how far off your clock is.',
    'Read the corrected time in the large clock. Tick Milliseconds or 24-hour to change the display, or use Full screen.',
    'Check Time around the world for UTC and other cities, with whether it is today, yesterday or tomorrow there.',
    'To count down to a moment, such as a ticket sale or New Year, pick the date and time in Countdown to a time and press Start countdown.',
  ],
  sections: [
    {
      heading: 'How this clock gets the exact time',
      body: [
        'Your phone or computer shows the time from its own clock, which can be off. This page asks our web server for the time several times in a row. Server clocks are kept in step with atomic time using the Network Time Protocol (NTP).',
        'Each answer is only stamped to the whole second, so a single request can’t tell the time to better than a second. The page times its later requests to land exactly when the server’s second ticks over and narrows the result from each one. After a few rounds the error is usually within a few tens of milliseconds, about the same as half the network round trip.',
        'The status line shows how far your device clock is ahead or behind, and the large clock already includes that correction. If the server can’t be reached, the page falls back to your device clock and says so.',
      ],
    },
    {
      heading: 'Why device clocks drift',
      body: [
        'Computers and phones keep time with a quartz crystal. A typical crystal is accurate to about 20 parts per million, which works out to as much as 1.7 seconds a day, or roughly a minute a month if nothing corrects it.',
        'Most devices fix that by syncing with an internet time server every so often, so a phone is usually right to within a fraction of a second. Computers that rarely go online, devices with automatic time turned off, and some smart TVs and older laptops can drift by seconds or minutes. If this page shows a large error, turn on Set time automatically in your system settings.',
      ],
    },
    {
      heading: 'US time zones and daylight saving time',
      body: [
        'The United States uses six time zones across the 50 states: Eastern (UTC−5, or UTC−4 in summer), Central (UTC−6/−5), Mountain (UTC−7/−6), Pacific (UTC−8/−7), Alaska (UTC−9/−8) and Hawaii-Aleutian (UTC−10; Hawaii itself never changes). When it is noon in New York in winter, it is 11 AM in Chicago, 10 AM in Denver, 9 AM in Los Angeles, 8 AM in Anchorage and 7 AM in Honolulu.',
        'Daylight saving time in 2026 began on Sunday, March 8 and ends on Sunday, November 1 at 2:00 AM local time, when clocks fall back one hour. In 2027 it runs from March 14 to November 7. Hawaii and most of Arizona do not change their clocks, so Phoenix matches Denver in winter and Los Angeles in summer.',
      ],
    },
    {
      heading: 'UTC, GMT and atomic time',
      body: [
        'Coordinated Universal Time (UTC) is the world’s reference time, computed from hundreds of atomic clocks. In the US, the National Institute of Standards and Technology (NIST) and the US Naval Observatory keep the official time, which you can also see at time.gov. Time zones are written as offsets from UTC, such as UTC−5 for US Eastern Standard Time.',
        'GMT is the time zone of the UK in winter and has the same clock reading as UTC, which is why the two names are often used interchangeably. Leap seconds have occasionally been added to UTC to stay in step with the Earth’s rotation; international timekeepers agreed in 2022 to stop adding them by 2035.',
        'Unix time, shown in the stats above, counts the seconds since January 1, 1970 00:00 UTC. Programmers use it because it is the same everywhere, regardless of time zone.',
      ],
    },
  ],
  faq: [
    {
      q: 'What time is it right now exactly?',
      a: 'The large clock at the top of this page shows the exact time in your time zone, corrected for your device’s clock error. The status line tells you how far off your device was and how precise the sync is.',
    },
    {
      q: 'Is my computer or phone clock accurate?',
      a: 'Usually within a second if automatic time is on. This page measures the difference and shows it as Device clock error, for example 0.32 s fast. A difference of more than a second or two means your device isn’t syncing.',
    },
    {
      q: 'Is this the atomic clock time?',
      a: 'It is synced to a server whose clock follows atomic time through NTP, and the measured accuracy is shown on the page, typically a few hundredths of a second. For legal or scientific time, the official US source is NIST at time.gov.',
    },
    {
      q: 'When does daylight saving time end in 2026?',
      a: 'On Sunday, November 1, 2026 at 2:00 AM local time, clocks go back one hour to 1:00 AM. Daylight saving time starts again on Sunday, March 14, 2027.',
    },
    {
      q: 'What is the difference between UTC and GMT?',
      a: 'UTC is the atomic-clock time standard; GMT is a time zone used by the UK and some other countries in winter. They show the same time, but UTC is the scientific reference and never changes for daylight saving.',
    },
    {
      q: 'How do I count down to a specific time?',
      a: 'In Countdown to a time, choose the date and time in your time zone and press Start countdown, or use Next hour, Midnight or New Year. The countdown runs on the corrected clock and can beep for the last five seconds.',
    },
  ],
  related: ['time-card-calculator', 'roman-numerals', 'tip-calculator', 'word-counter'],
  priority: 65,
  updated: '2026-10-29',
});

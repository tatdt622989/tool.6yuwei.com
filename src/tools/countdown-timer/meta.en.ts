import { defineTool } from '../types';

export default defineTool({
  slug: 'countdown-timer',
  name: 'Countdown Timer',
  seoTitle: 'Countdown Timer: Free Online Timer with Alarm and Full Screen',
  description:
    'Free online countdown timer. Set hours, minutes and seconds or tap a 1, 3, 5, 10, 15 or 30 minute timer. Alarm sound, desktop alerts and full screen.',
  category: 'time',
  icon: 'Hourglass',
  keywords: [
    'countdown timer',
    'online timer',
    'timer',
    'set a timer',
    'timer with alarm',
    '1 minute timer',
    '3 minute timer',
    '5 minute timer',
    '10 minute timer',
    '15 minute timer',
    '30 minute timer',
    '1 hour timer',
    'classroom timer',
    'full screen timer',
    'countdown clock',
  ],
  intro:
    'Set a time, press Start, and an alarm sounds when the countdown reaches zero. Switch to full screen to show a big, readable timer in a classroom, meeting room or kitchen.',
  howTo: [
    'Enter the time in the Hours, Minutes and Seconds boxes, or tap one of the quick timers (1, 3, 5, 10, 15 or 30 min), which start right away.',
    'Press Start to begin. Use Pause and Resume as needed, and Reset to go back to the time you set.',
    'Keep Alarm sound checked to hear three beeps at zero. Check Desktop notification and allow it when your browser asks, so you get an alert even while you work in another window.',
    'Press Full screen to show only the clock in large digits for a room to see. Press Esc to leave full screen.',
  ],
  sections: [
    {
      heading: 'Ways to use an online countdown timer',
      body: [
        'Teachers use a visible timer to keep group work, quizzes and transitions on schedule, and it is easy to project one on the board in full screen. Meeting hosts give each agenda item a time box, speakers rehearse a 5 minute pitch or a 20 minute talk, and students practice timed essays and SAT or ACT sections against the clock.',
        'At home a timer covers everything from a 3 minute cup of tea to 10 to 12 minutes for hard-boiled eggs, a 15 minute face mask or a 30 minute screen-time limit for kids. Seeing the time count down usually works better than repeated verbal reminders.',
        'For workouts, set short timers for planks, rest between sets or a 1 minute stretch. For Tabata-style intervals (20 seconds on, 10 seconds off), a dedicated interval timer is easier, but a quick timer here works well for single rounds.',
      ],
    },
    {
      heading: 'Does the timer stay accurate in a background tab?',
      body: [
        'Yes. When you press Start, the timer records the exact moment it should end and always shows the end time minus the current time. Browsers slow down timers in background tabs to save battery, but that only delays screen updates; the remaining time is still correct when you come back, and the tab title keeps showing the countdown.',
        'If your phone locks or your computer goes to sleep, the browser itself may be paused, and the alarm will play when the device wakes. For anything critical, such as medication or leaving for the airport, also set an alarm on your phone. Closing the tab or the browser stops the timer.',
      ],
    },
    {
      heading: 'How the alarm and notifications work',
      body: [
        'Browsers only allow a page to play sound after you interact with it, so the alarm is enabled when you press Start. At zero the browser generates three short beeps on the spot; there is no audio file to load. The volume follows your device volume, so make sure it is not muted. Uncheck Alarm sound for a silent timer in an exam room or library.',
        'Desktop notifications need your permission, and the timer only asks when you check the box. If you blocked notifications earlier, open the site settings from the icon to the left of the address bar and set notifications to Allow. Everything runs on your device and nothing is sent to a server.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why didn’t the timer make a sound?',
      a: 'Check that Alarm sound is on and your device is not muted. On an iPhone, the silent switch can block sound from web pages. The timer also has to be started by your own tap or click, because browsers block audio that starts on its own.',
    },
    {
      q: 'Can I set a timer for longer than an hour?',
      a: 'Yes. Type the number of hours in the Hours box. The longest timer is 99 hours, 59 minutes and 59 seconds.',
    },
    {
      q: 'Will the timer still go off if I switch tabs?',
      a: 'Yes. Switching tabs or minimizing the window does not affect it, and the alarm still sounds at zero. Closing the tab or the browser stops the timer.',
    },
    {
      q: 'Why is there no full screen button on my iPhone?',
      a: 'Safari on iPhone does not let web pages show a single element in full screen, so the button is hidden there. Turn the phone sideways for larger digits, or use a computer, iPad or Android phone.',
    },
    {
      q: 'Can I use this as a classroom timer?',
      a: 'Yes. Set the time, press Full screen and project it. The large digits and the progress bar are easy to read from the back of the room, and you can turn the sound off for silent work time.',
    },
    {
      q: 'What is the difference between a countdown timer and a Pomodoro timer?',
      a: 'A countdown timer runs once for any length you choose. A Pomodoro timer cycles automatically between 25 minute focus sessions and 5 minute breaks and keeps count of the sessions you finish.',
    },
  ],
  related: ['stopwatch', 'pomodoro', 'new-year-countdown', 'timezone-converter'],
  priority: 60,
  updated: '2026-10-29',
});

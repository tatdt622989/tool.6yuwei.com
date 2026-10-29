import { defineTool } from '../types';

export default defineTool({
  slug: 'typing-test',
  name: 'Typing Speed Test',
  seoTitle: 'Typing Speed Test: Check Your WPM and Accuracy in 1 Minute',
  description:
    'Free typing speed test. Type a short passage for 30 seconds, 1 minute or 2 minutes and get your WPM, accuracy and errors, with mistakes highlighted as you go.',
  category: 'test',
  icon: 'Keyboard',
  keywords: [
    'typing test',
    'typing speed test',
    'wpm test',
    'words per minute test',
    '1 minute typing test',
    'typing speed',
    'how fast do i type',
    'typing test wpm',
    'free typing test',
    'keyboard typing test',
    'typing accuracy test',
    'average typing speed',
    'net wpm',
    'touch typing test',
    'typing test for jobs',
  ],
  intro:
    'Find out how many words per minute you type. Type the passage below; correct letters turn dark, mistakes turn red, and you get your WPM and accuracy the moment time runs out.',
  howTo: [
    'Pick a test length: 30 sec, 1 min or 2 min. The 1-minute test is the usual benchmark.',
    'Click the box under “Type here” and start typing the passage exactly as shown. The timer starts on your first key.',
    'Capital letters and punctuation count. Use Backspace to fix mistakes; the passage keeps going as long as you type, so you won’t run out of text.',
    'When time is up you’ll see your WPM, accuracy, raw WPM and error count. Press “Try again” for a new passage, or Esc to restart at any time.',
  ],
  sections: [
    {
      heading: 'How WPM is calculated',
      body: [
        'Typing tests count a “word” as five characters, including spaces and punctuation, so that long and short words even out. Your speed is the number of characters you typed correctly, divided by five, divided by the minutes elapsed. Typing 300 correct characters in 1 minute is 300 ÷ 5 = 60 WPM.',
        'Raw WPM uses every character you typed, right or wrong, so it shows how fast your fingers move. Net WPM, the headline number here, only counts what ended up correct. Accuracy is based on every keystroke you made, so a mistake you later fixed still lowers it. That’s why a careful 55 WPM at 98% accuracy is more useful at work than a sloppy 70 WPM.',
      ],
    },
    {
      heading: 'What is a good typing speed?',
      body: [
        'The average adult types about 40 WPM. Students and office workers who type every day often reach 50 to 60 WPM, professional typists and transcriptionists usually work at 70 to 90 WPM, and competitive typists can exceed 120 WPM on short tests.',
        'This test rates your net WPM: under 20 is Getting started, 20 to 39 Beginner, 40 to 59 Average, 60 to 79 Fast, 80 to 99 Very fast and 100 or more Lightning. Many job listings for administrative assistants, data entry and customer support ask for 40 to 60 WPM with high accuracy, and a 1-minute or 5-minute test is a common part of the hiring process.',
      ],
    },
    {
      heading: 'How to type faster',
      body: [
        'Learn touch typing: rest your fingers on the home row (A S D F and J K L ;), use the bumps on F and J to find it without looking, and let each finger handle its own columns. It feels slower at first, but most people overtake their old hunt-and-peck speed within a few weeks.',
        'Focus on accuracy before speed, since fixing errors costs more time than typing steadily. Keep a relaxed, even rhythm instead of bursts, look at the text rather than the keys, and practice for 10 to 15 minutes a day. Sit with your wrists level and your screen at eye height to avoid strain.',
      ],
    },
    {
      heading: 'About this test',
      body: [
        'The passages are short, everyday sentences written for this site, shuffled each time so you can’t memorize them. The live panel shows time left, current WPM (after the first two seconds), accuracy and errors. Your best score for each test length is saved in this browser only; nothing you type is sent anywhere.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the average typing speed?',
      a: 'About 40 words per minute for adults. 60 WPM or more is considered fast, and professional typists often work at 70 to 90 WPM.',
    },
    {
      q: 'Is 60 WPM good?',
      a: 'Yes. 60 WPM is well above average and meets the requirement for most office and data entry jobs, especially with accuracy of 95% or higher.',
    },
    {
      q: 'What is the difference between raw WPM and net WPM?',
      a: 'Raw WPM counts every character you typed. Net WPM only counts the characters that are correct at the end, so it drops when you leave mistakes in. Employers usually look at net WPM and accuracy.',
    },
    {
      q: 'Does a word mean an actual word?',
      a: 'No. Standard typing tests treat every five characters, including spaces and punctuation, as one word, so scores are comparable across different texts.',
    },
    {
      q: 'Should I fix my mistakes during the test?',
      a: 'Fixing them raises your net WPM because the corrected characters count again, but it takes time and the original mistake still lowers your accuracy. The best scores come from typing steadily enough that you rarely need Backspace.',
    },
    {
      q: 'Can I take the typing test on a phone?',
      a: 'Yes, though phone keyboards and autocorrect make scores lower and less comparable. For a meaningful WPM, use a physical keyboard.',
    },
  ],
  related: ['keyboard-tester', 'word-counter', 'cps-test', 'reaction-test'],
  priority: 80,
  updated: '2026-10-29',
});
